/* ============================================================================
   KK Infinite — audio engine
   ----------------------------------------------------------------------------
   The previous player wired its filters so that every FX click re-connected the
   convolver to the analyser (connections sum in Web Audio, so the reverb got
   louder each time and never disconnected), and it pushed a +15 dB low shelf
   straight into the output, which clipped 128 kbps MP3s into audible noise.

   This engine fixes that with a fixed graph, built exactly once:

     source ─► preamp ─► [5 biquads] ─┬─► dry ──────────────┐
                                     └─► send ─► convolver ─► wet ─┐
                                                                  ├─► master
                                                                  │
                                          master ─► limiter ─► analyser ─► out

   • preamp reserves headroom whenever a preset boosts a band
   • the reverb is a parallel send (dry stays at unity), so it is never "all wet"
   • a hard-knee limiter catches peaks, so boosted bass cannot clip
   • every parameter moves with setTargetAtTime() — no zipper noise, no clicks
   • impulse is low-passed white noise, so the tail is a soft room, not hiss
   ========================================================================== */

(function (global) {
  "use strict";

  var BANDS = [
    { freq: 60, kind: "lowshelf", q: 0.7, label: "60", unit: "Hz" },
    { freq: 230, kind: "peaking", q: 1.0, label: "230", unit: "Hz" },
    { freq: 910, kind: "peaking", q: 1.1, label: "910", unit: "Hz" },
    { freq: 3600, kind: "peaking", q: 1.0, label: "3.6", unit: "kHz" },
    { freq: 12000, kind: "highshelf", q: 0.7, label: "12", unit: "kHz" },
  ];

  var PRESETS = {
    flat: { label: "Flat", gains: [0, 0, 0, 0, 0], preamp: 0, space: 0 },
    warm: { label: "Warm", gains: [3.5, 2, 0, -1, 0.5], preamp: -3, space: 0.06 },
    bass: { label: "Bass", gains: [7, 4, 1, -1.5, 0], preamp: -7, space: 0 },
    vocal: { label: "Vocal", gains: [-4, 1.5, 4, 3, 1], preamp: -4, space: 0.08 },
    rock: { label: "Rock", gains: [5, 2, -2.5, 3, 4], preamp: -6, space: 0.04 },
    cinema: { label: "Cinema", gains: [3, 1, 0, -1, 2], preamp: -4, space: 0.22 },
  };

  function dbToGain(db) {
    return Math.pow(10, db / 20);
  }

  function Engine(audio) {
    this.audio = audio;
    this.ctx = null;
    this.nodes = null;
    this.failed = false;
    this.value = 0.75;
    this.muted = false;
    this.bands = BANDS;
    this.presets = PRESETS;
    this.values = [0, 0, 0, 0, 0];
    this.preampDb = 0;
    this.space = 0;
    this.bypass = false;
    this.freq = new Uint8Array(1024);
    this.time = new Uint8Array(1024);
  }

  Engine.prototype.volumeCurve = function (v) {
    v = Math.max(0, Math.min(1, v));
    // perceptual taper; 0.9 ceiling keeps a little safety margin
    return Math.pow(v, 1.7) * 0.9;
  };

  Engine.prototype.ready = function () {
    return !!(this.ctx && this.nodes);
  };

  Engine.prototype.ensure = function () {
    if (this.ctx || this.failed) return this.ctx;

    var AC = global.AudioContext || global.webkitAudioContext;
    if (!AC) {
      this.failed = true;
      return null;
    }

    try {
      var ctx = new AC({ latencyHint: "interactive" });
      var source = ctx.createMediaElementSource(this.audio);
      this.buildGraph(ctx, source);
      this.audio.volume = 1;
      return ctx;
    } catch (err) {
      this.failed = true;
      console.warn("[KK] Web Audio unavailable — falling back to element volume.", err);
      return null;
    }
  };

  /**
   * Builds and wires the fixed DSP graph for any source node / AudioContext.
   * Kept separate from ensure() so the same graph can be rendered offline in
   * tests (see tests/engine-check.html).
   */
  Engine.prototype.buildGraph = function (ctx, source) {
    var pre = ctx.createGain();
    pre.gain.value = 1;

    var filters = BANDS.map(function (b) {
      var f = ctx.createBiquadFilter();
      f.type = b.kind;
      f.frequency.value = b.freq;
      f.Q.value = b.q;
      f.gain.value = 0;
      return f;
    });

    var dry = ctx.createGain();
    dry.gain.value = 1;

    var send = ctx.createGain();
    send.gain.value = 0;

    var reverb = ctx.createConvolver();
    reverb.buffer = this.makeImpulse(ctx);

    var wet = ctx.createGain();
    wet.gain.value = 0.9;

    var master = ctx.createGain();
    master.gain.value = this.volumeCurve(this.value);

    var limiter = ctx.createDynamicsCompressor();
    limiter.threshold.value = -2.5;
    limiter.knee.value = 0;
    limiter.ratio.value = 20;
    limiter.attack.value = 0.003;
    limiter.release.value = 0.24;

    var analyser = ctx.createAnalyser();
    analyser.fftSize = 2048;
    analyser.smoothingTimeConstant = 0.8;

    // ── wire once, never re-wire ──────────────────────────────────────────
    var tail = source;
    [pre].concat(filters).forEach(function (node) {
      tail.connect(node);
      tail = node;
    });
    tail.connect(dry);
    tail.connect(send);
    dry.connect(master);
    send.connect(reverb);
    reverb.connect(wet);
    wet.connect(master);
    master.connect(limiter);
    limiter.connect(analyser);
    analyser.connect(ctx.destination);

    this.ctx = ctx;
    this.nodes = {
      source: source,
      pre: pre,
      filters: filters,
      dry: dry,
      send: send,
      reverb: reverb,
      wet: wet,
      master: master,
      limiter: limiter,
      analyser: analyser,
    };

    this.freq = new Uint8Array(analyser.frequencyBinCount);
    this.time = new Uint8Array(analyser.frequencyBinCount);

    this.applyEQ(
      { gains: this.values, preampDb: this.preampDb, space: this.space, bypass: this.bypass },
      0
    );
    return this.nodes;
  };

  /* Soft, low-passed stereo room impulse (no hiss). */
  Engine.prototype.makeImpulse = function (ctx) {
    var seconds = 1.7;
    var len = Math.floor(ctx.sampleRate * seconds);
    var buffer = ctx.createBuffer(2, len, ctx.sampleRate);

    for (var ch = 0; ch < 2; ch++) {
      var data = buffer.getChannelData(ch);
      var lp = 0;
      var lp2 = 0;
      for (var i = 0; i < len; i++) {
        var t = i / len;
        var env = Math.pow(1 - t, 2.8);
        var white = Math.random() * 2 - 1;
        lp += 0.16 * (white - lp); // one-pole low pass
        lp2 += 0.55 * (lp - lp2); // second pole, smoother
        data[i] = lp2 * env * 0.85;
      }
      var fade = Math.min(400, len);
      for (var j = 0; j < fade; j++) data[j] *= j / fade;
    }
    return buffer;
  };

  Engine.prototype.resume = function () {
    if (!this.ctx) return;
    if (this.ctx.state === "suspended") this.ctx.resume().catch(function () {});
  };

  Engine.prototype.suspendIfIdle = function () {
    /* keep the context warm; Chrome handles this fine for local playback */
  };

  Engine.prototype.setVolume = function (value, immediate) {
    this.value = Math.max(0, Math.min(1, value));
    var target = this.muted ? 0 : this.volumeCurve(this.value);

    if (!this.ready()) {
      this.audio.volume = target;
      return;
    }
    this.resume();
    var g = this.nodes.master.gain;
    var now = this.ctx.currentTime;
    g.cancelScheduledValues(now);
    g.setTargetAtTime(target, now, immediate ? 0.001 : 0.02);
  };

  /* Fade helper used when starting / pausing a track. */
  Engine.prototype.fadeTo = function (value, seconds) {
    if (!this.ready()) {
      this.audio.volume = Math.max(0, Math.min(1, value));
      return;
    }
    var g = this.nodes.master.gain;
    var now = this.ctx.currentTime;
    var target = this.muted ? 0 : this.volumeCurve(value);
    g.cancelScheduledValues(now);
    g.setValueAtTime(Math.max(g.value, 0.0001), now);
    g.linearRampToValueAtTime(Math.max(target, 0.0001), now + Math.max(0.05, seconds));
  };

  Engine.prototype.setMuted = function (muted) {
    this.muted = !!muted;
    this.setVolume(this.value);
  };

  /**
   * @param {{gains:number[], preampDb:number, space:number, bypass:boolean}} settings
   * @param {number} glide seconds-constant; 0 = apply instantly
   */
  Engine.prototype.applyEQ = function (settings, glide) {
    var s = settings || {};
    var gains = (s.gains || [0, 0, 0, 0, 0]).slice(0, 5);
    var preDb = Number(s.preampDb) || 0;
    var space = Math.max(0, Math.min(1, Number(s.space) || 0));
    var bypass = !!s.bypass;

    this.values = gains;
    this.preampDb = preDb;
    this.space = space;
    this.bypass = bypass;

    if (!this.ready()) return;
    var ctx = this.ctx;
    var now = ctx.currentTime;
    var glideTime = typeof glide === "number" ? glide : 0.04;

    function move(param, target, immediate) {
      param.cancelScheduledValues(now);
      if (immediate || glideTime <= 0) {
        param.setValueAtTime(target, now);
      } else {
        param.setTargetAtTime(target, now, glideTime);
      }
    }

    var preGain = bypass ? 1 : dbToGain(preDb);
    move(this.nodes.pre.gain, preGain);

    this.nodes.filters.forEach(function (f, i) {
      var target = bypass ? 0 : Math.max(-18, Math.min(18, gains[i] || 0));
      move(f.gain, target);
    });

    move(this.nodes.send.gain, bypass ? 0 : space * 0.85);
    move(this.nodes.dry.gain, 1);
  };

  Engine.prototype.readSpectrum = function () {
    if (!this.ready()) return null;
    var a = this.nodes.analyser;
    if (this.freq.length !== a.frequencyBinCount) {
      this.freq = new Uint8Array(a.frequencyBinCount);
      this.time = new Uint8Array(a.frequencyBinCount);
    }
    a.getByteFrequencyData(this.freq);
    a.getByteTimeDomainData(this.time);
    return this.freq;
  };

  Engine.prototype.sampleRate = function () {
    return this.ctx ? this.ctx.sampleRate : 44100;
  };

  global.KKAudio = {
    Engine: Engine,
    BANDS: BANDS,
    PRESETS: PRESETS,
  };
})(window);
