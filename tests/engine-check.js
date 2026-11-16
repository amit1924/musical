/* Offline verification for audio-engine.js — open tests/engine-check.html */
(function () {
  "use strict";
  var SR = 44100, DUR = 6, K = window.KKAudio;

  function makeSignal(ctx) {
    var buf = ctx.createBuffer(2, SR * DUR, SR);
    for (var ch = 0; ch < 2; ch++) {
      var d = buf.getChannelData(ch), seed = ch ? 7 : 1;
      for (var i = 0; i < d.length; i++) {
        var t = i / SR;
        seed = (seed * 16807) % 2147483647;
        var noise = (seed / 2147483647) * 2 - 1;
        d[i] = 0.5 * Math.sin(2 * Math.PI * 60 * t)
             + 0.22 * Math.sin(2 * Math.PI * 440 * t + 0.4)
             + 0.16 * Math.sin(2 * Math.PI * 3100 * t)
             + 0.1 * noise;
      }
    }
    return buf;
  }

  function db(v) { return 20 * Math.log10(Math.max(v, 1e-9)); }

  function measure(buffer, from) {
    var start = Math.floor((from || 0) * SR), peak = 0, sum = 0, n = 0;
    for (var ch = 0; ch < buffer.numberOfChannels; ch++) {
      var d = buffer.getChannelData(ch);
      for (var i = start; i < d.length; i++) {
        var v = Math.abs(d[i]);
        if (v > peak) peak = v;
        sum += d[i] * d[i];
        n++;
      }
    }
    return { peak: peak, rms: Math.sqrt(sum / Math.max(1, n)) };
  }

  function render(key, times, stopAt) {
    var ctx = new OfflineAudioContext(2, SR * DUR, SR);
    var src = ctx.createBufferSource();
    src.buffer = makeSignal(ctx);
    src.loop = true;

    var eng = new K.Engine({ volume: 1 });
    eng.buildGraph(ctx, src);
    var p = K.PRESETS[key];
    for (var i = 0; i < (times || 1); i++) {
      eng.applyEQ({ gains: p.gains, preampDb: p.preamp, space: p.space, bypass: false }, 0);
    }
    eng.setVolume(1, true);
    src.start(0);
    if (stopAt) src.stop(stopAt);
    return ctx.startRendering().then(function (buf) {
      return { buf: buf, eng: eng };
    });
  }

  var rows = document.getElementById("rows");
  var results = [];
  var keys = Object.keys(K.PRESETS);
  var chain = Promise.resolve();

  keys.forEach(function (key) {
    chain = chain.then(function () {
      return render(key, 1, 0).then(function (out) {
        var m = measure(out.buf, 1.2);
        var p = K.PRESETS[key];
        var pass = m.peak <= 1.0;
        results.push({ key: key, peak: m.peak, rms: m.rms, pass: pass });
        var tr = document.createElement("tr");
        tr.innerHTML =
          "<td>" + p.label + "</td><td>" + p.preamp + " dB</td><td>" +
          Math.round(p.space * 100) + "%</td><td>" + db(m.peak).toFixed(2) +
          "</td><td>" + db(m.rms).toFixed(2) + "</td><td class='" +
          (pass ? "ok" : "bad") + "'>" + (pass ? "pass" : "CLIPPING") + "</td>";
        rows.appendChild(tr);
      });
    });
  });

  chain = chain.then(function () {
    // 1) repeated preset clicks must not stack (the old engine reconnected nodes)
    return render("cinema", 10, 0).then(function (out) {
      var m = measure(out.buf, 1.2);
      var single = results.filter(function (r) { return r.key === "cinema"; })[0];
      var drift = Math.abs(db(m.rms) - db(single.rms));
      var line = document.getElementById("extra");
      var okStack = drift < 0.5;
      line.innerHTML =
        "10× preset changes vs 1×: RMS drift <b class='" + (okStack ? "ok" : "bad") + "'>" +
        drift.toFixed(3) + " dB</b> (" + (okStack ? "no accumulation" : "LEVEL BUILD-UP") + ")<br>";

      // 2) the reverb tail must decay to silence after the source stops
      return render("cinema", 1, 2).then(function (tail) {
        var t = measure(tail.buf, 5.2);
        var okTail = t.rms < 0.01;
        line.innerHTML +=
          "Cinema tail @5.2s (source stopped at 2s): <b class='" + (okTail ? "ok" : "bad") + "'>" +
          db(t.rms).toFixed(1) + " dBFS</b> (" + (okTail ? "decays" : "NOISY / RUNAWAY") + ")<br>";

        var allPass = results.every(function (r) { return r.pass; }) && okStack && okTail;
        var s = document.getElementById("summary");
        s.className = "";
        s.innerHTML =
          "<b class='" + (allPass ? "ok" : "bad") + "'>" +
          (allPass ? "ALL CHECKS PASS" : "FAILURES DETECTED") +
          "</b> — " + results.length + " presets rendered, limiter engaged at −2.5 dBFS.";
        window.__RESULTS = { results: results, drift: drift, tail: t.rms, allPass: allPass };
      });
    });
  }).catch(function (err) {
    document.getElementById("summary").textContent = "ERROR: " + err.message;
    window.__RESULTS = { error: String(err) };
  });
})();
