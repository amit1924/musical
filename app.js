/* ============================================================================
   KK Infinite — application logic
   ========================================================================== */
(function () {
  "use strict";

  var LIB = (window.KK_LIBRARY || []).slice();
  var STORE_KEY = "kk-infinite-v2";

  // ───────────────────────────── helpers ─────────────────────────────
  function $(sel, root) {
    return (root || document).querySelector(sel);
  }
  function $$(sel, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(sel));
  }
  function esc(str) {
    return String(str == null ? "" : str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }
  function clamp(v, lo, hi) {
    return v < lo ? lo : v > hi ? hi : v;
  }
  function fmtTime(sec) {
    if (!isFinite(sec) || sec <= 0) return "0:00";
    sec = Math.floor(sec);
    var m = Math.floor(sec / 60);
    var s = sec % 60;
    return m + ":" + (s < 10 ? "0" : "") + s;
  }
  function icon(name, cls) {
    return '<svg class="icon ' + (cls || "") + '"><use href="#i-' + name + '"/></svg>';
  }
  function byPath(path) {
    return LIB_INDEX.get(path);
  }
  function norm(str) {
    return String(str || "")
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "");
  }

  var LIB_INDEX = new Map();
  LIB.forEach(function (t) {
    LIB_INDEX.set(t.path, t);
  });

  // ───────────────────────────── persistence ─────────────────────────────
  var saved = {};
  try {
    saved = JSON.parse(localStorage.getItem(STORE_KEY) || "{}") || {};
  } catch (e) {
    saved = {};
  }

  var presetKeys = Object.keys(window.KKAudio.PRESETS);
  var initialPreset = presetKeys.indexOf(saved.preset) >= 0 ? saved.preset : "flat";

  var state = {
    view: "home",
    search: "",
    sort: saved.sort || "title",
    currentPath: null,
    playing: false,
    shuffle: !!saved.shuffle,
    repeat: saved.repeat === "all" || saved.repeat === "one" ? saved.repeat : "off",
    volume: typeof saved.volume === "number" ? clamp(saved.volume, 0, 1) : 0.75,
    muted: false,
    liked: new Set(Array.isArray(saved.liked) ? saved.liked : []),
    theme: saved.theme === "light" ? "light" : "dark",
    preset: initialPreset,
    gains: Array.isArray(saved.gains) && saved.gains.length === 5 ? saved.gains.slice() : [0, 0, 0, 0, 0],
    preampDb: typeof saved.preampDb === "number" ? saved.preampDb : 0,
    space: typeof saved.space === "number" ? saved.space : 0,
    bypass: !!saved.bypass,
    queue: [],
    queueLabel: "All songs",
    seeking: false,
  };

  if (saved.preset === "custom") {
    state.preset = "custom";
  }

  var saveTimer = null;
  function persist() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(function () {
      try {
        localStorage.setItem(
          STORE_KEY,
          JSON.stringify({
            volume: state.volume,
            liked: Array.from(state.liked),
            theme: state.theme,
            preset: state.preset,
            gains: state.gains,
            preampDb: state.preampDb,
            space: state.space,
            bypass: state.bypass,
            shuffle: state.shuffle,
            repeat: state.repeat,
            sort: state.sort,
            track: state.currentPath,
            position: audio.currentTime || 0,
          })
        );
      } catch (e) {
        /* storage may be full / blocked */
      }
    }, 250);
  }

  // ───────────────────────────── audio ─────────────────────────────
  var audio = new Audio();
  audio.preload = "auto";
  audio.volume = 1;
  var engine = new window.KKAudio.Engine(audio);
  var pauseToken = 0;
  var progressRaf = null;

  // ───────────────────────────── albums ─────────────────────────────
  var albumMap = new Map();
  LIB.forEach(function (t) {
    var a = albumMap.get(t.album);
    if (!a) {
      a = { name: t.album, art: t.art, year: t.year, tracks: [], duration: 0 };
      albumMap.set(t.album, a);
    }
    a.tracks.push(t);
    a.duration += t.duration || 0;
    if (!a.art && t.art) a.art = t.art;
    if (!a.year && t.year) a.year = t.year;
  });
  // Albums whose embedded art is a download-site banner rather than real artwork.
  var PROMO_ALBUMS = { Jashnn: true, "KK Essentials": true };

  var ALBUMS = Array.from(albumMap.values()).sort(function (a, b) {
    var pa = PROMO_ALBUMS[a.name] ? 1 : 0;
    var pb = PROMO_ALBUMS[b.name] ? 1 : 0;
    if (pa !== pb) return pa - pb;
    if (b.tracks.length !== a.tracks.length) return b.tracks.length - a.tracks.length;
    return a.name.localeCompare(b.name);
  });

  var ALBUM_PICKS = ALBUMS.filter(function (a) {
    return !PROMO_ALBUMS[a.name];
  });

  var FEATURED = ["Tum Mile", "Bas Ek Pal", "Showbiz", "Life In A Metro"];
  var FEATURED_ALBUMS = FEATURED.map(function (name) {
    return albumMap.get(name);
  }).filter(Boolean);
  ALBUMS.forEach(function (a) {
    if (FEATURED_ALBUMS.length < 4 && FEATURED_ALBUMS.indexOf(a) < 0 && a.name !== "KK Essentials") {
      FEATURED_ALBUMS.push(a);
    }
  });

  // ───────────────────────────── rendering ─────────────────────────────
  function albumMeta(a) {
    var mins = Math.round(a.duration / 60);
    return a.tracks.length + (a.tracks.length === 1 ? " track" : " tracks") + " · " + mins + " min";
  }

  function renderDiscs() {
    $("#discs").innerHTML = FEATURED_ALBUMS.map(function (a, i) {
      return (
        '<button class="disc" data-album="' + esc(a.name) + '" aria-label="Play ' + esc(a.name) + '">' +
        '<span class="disc-art">' +
        '<img src="' + esc(encodeURI(a.art)) + '" alt="' + esc(a.name) + ' cover" loading="lazy" />' +
        '<span class="disc-hole"></span>' +
        '<span class="disc-play">' + icon("play", "icon--fill") + "</span>" +
        "</span>" +
        '<span class="disc-meta"><span class="disc-name">' +
        esc(a.name) +
        '</span><span class="disc-sub">' +
        (a.year || a.tracks.length + " songs") +
        "</span></span></button>"
      );
    }).join("");
  }

  function renderAlbumRows(container, list, limit) {
    var rows = (limit ? list.slice(0, limit) : list)
      .map(function (a) {
        return (
          '<div class="album-row">' +
          '<img src="' + esc(encodeURI(a.art)) + '" alt="" loading="lazy" />' +
          '<div class="album-row-copy"><span class="album-row-name">' + esc(a.name) + "</span>" +
          '<span class="album-row-sub">' + esc(albumMeta(a)) + "</span></div>" +
          '<button class="album-play" data-album="' + esc(a.name) + '" aria-label="Play ' + esc(a.name) + '">' +
          icon("play", "icon--fill") +
          "</button></div>"
        );
      })
      .join("");
    container.innerHTML = rows;
  }

  function likeIcon(path, cls) {
    var liked = state.liked.has(path);
    return (
      '<button class="' + cls + (liked ? " is-liked" : "") + '" data-like="' + esc(path) + '" ' +
      'aria-label="' + (liked ? "Remove from" : "Add to") + ' liked songs" aria-pressed="' + liked + '">' +
      icon(liked ? "heart-fill" : "heart", liked ? "icon--fill" : "") +
      "</button>"
    );
  }

  function trackRow(t, number) {
    var liked = state.liked.has(t.path);
    var sub = esc(t.album) + (t.year ? " · " + t.year : "");
    return (
      '<div class="track" role="listitem" tabindex="0" data-path="' + esc(t.path) + '" ' +
      'aria-label="Play ' + esc(t.title) + '">' +
      '<span class="track-index"><span class="track-num">' + number + "</span>" +
      '<span class="bars"><i></i><i></i><i></i></span></span>' +
      '<span class="track-art"><img src="' + esc(encodeURI(t.art)) + '" alt="" loading="lazy" />' +
      '<span class="track-art-overlay">' + icon("play", "icon--fill") + "</span></span>" +
      '<span class="track-main"><span class="track-title">' + esc(t.title) + "</span>" +
      '<span class="track-sub">' + sub + "</span></span>" +
      '<span class="track-dur">' + (t.duration ? fmtTime(t.duration) : "–:–") + "</span>" +
      '<button class="track-like' + (liked ? " is-liked" : "") + '" data-like="' + esc(t.path) + '" ' +
      'aria-label="' + (liked ? "Remove from" : "Add to") + ' liked songs" aria-pressed="' + liked + '">' +
      icon(liked ? "heart-fill" : "heart", liked ? "icon--fill" : "") +
      "</button></div>"
    );
  }

  function displayedList() {
    var list = LIB.slice();
    if (state.view === "liked") {
      list = list.filter(function (t) {
        return state.liked.has(t.path);
      });
    }
    var q = norm(state.search).trim();
    if (q) {
      list = list.filter(function (t) {
        return norm(t.title).indexOf(q) >= 0 || norm(t.album).indexOf(q) >= 0;
      });
    }
    return sortList(list);
  }

  function sortList(list) {
    var s = state.sort;
    return list.sort(function (a, b) {
      if (s === "album") {
        var c = a.album.localeCompare(b.album);
        return c !== 0 ? c : a.title.localeCompare(b.title);
      }
      if (s === "duration") {
        return (a.duration || 0) - (b.duration || 0);
      }
      return a.title.localeCompare(b.title);
    });
  }

  function renderTracklist() {
    var list = displayedList();
    var container = $("#tracklist");
    container.innerHTML = list
      .map(function (t, i) {
        return trackRow(t, i + 1);
      })
      .join("");

    $("#listCount").textContent = list.length + (list.length === 1 ? " song" : " songs");
    var empty = $("#listEmpty");
    if (!list.length) {
      empty.hidden = false;
      $("#emptyTerm").textContent = state.search;
    } else {
      empty.hidden = true;
    }
    markPlayingRows();
  }

  function renderLikedView() {
    var liked = sortList(
      LIB.filter(function (t) {
        return state.liked.has(t.path);
      })
    );
    var container = $("#likedList");
    container.innerHTML = liked
      .map(function (t, i) {
        return trackRow(t, i + 1);
      })
      .join("");
    $("#likedStats").textContent =
      liked.length + (liked.length === 1 ? " song" : " songs") +
      (liked.length ? " · " + Math.round(liked.reduce(function (s, t) { return s + (t.duration || 0); }, 0) / 60) + " min" : "");
    $("#likedEmpty").hidden = liked.length > 0;
    $("#playLiked").style.display = liked.length ? "" : "none";
    markPlayingRows();
  }

  function renderLikedPreview() {
    var liked = sortList(
      LIB.filter(function (t) {
        return state.liked.has(t.path);
      })
    ).slice(0, 4);
    var el = $("#likedPreview");
    if (!liked.length) {
      el.innerHTML =
        '<div class="mini-empty mini-empty--cta">' +
        '<span class="mini-empty-icon">' + icon("heart") + "</span>" +
        "<p>Tap the heart beside any song and it lands here.</p>" +
        '<button class="btn btn--ghost btn--sm" data-view="home">Browse songs</button>' +
        "</div>";
      return;
    }
    el.innerHTML = liked
      .map(function (t) {
        return (
          '<div class="mini-row" data-play="' + esc(t.path) + '" role="button" tabindex="0">' +
          '<img src="' + esc(encodeURI(t.art)) + '" alt="" loading="lazy" />' +
          '<span class="mini-copy"><span class="mini-name">' + esc(t.title) + "</span>" +
          '<span class="mini-sub">' + esc(t.album) + "</span></span>" +
          '</div>'
        );
      })
      .join("");
  }

  function renderEssentials() {
    var picks = [
      "Zara Sa (Power Ballad)",
      "Dil Ibaadat",
      "Tum Ho Mera Pyar",
      "Alvida",
      "Tu Jo Mila",
    ];
    var tracks = picks
      .map(function (name) {
        return LIB.filter(function (t) {
          return t.title === name;
        })[0];
      })
      .filter(Boolean);

    LIB.forEach(function (t) {
      if (tracks.length < 5 && tracks.indexOf(t) < 0 && t.album !== "KK Essentials") tracks.push(t);
    });

    $("#essentialList").innerHTML = tracks
      .slice(0, 5)
      .map(function (t) {
        return (
          '<button class="mini-row" data-play="' + esc(t.path) + '">' +
          '<img src="' + esc(encodeURI(t.art)) + '" alt="" loading="lazy" />' +
          '<span class="mini-copy"><span class="mini-name">' + esc(t.title) + "</span>" +
          '<span class="mini-sub">' + esc(t.album) + "</span></span>" + icon("play", "icon--fill") +
          "</button>"
        );
      })
      .join("");
  }

  function renderCounts() {
    $("#albumCount").textContent = ALBUMS.length + " albums";
    $("#deckLikedCount").textContent = state.liked.size + (state.liked.size === 1 ? " song" : " songs");
    $("#likeCountLabel").textContent = String(state.liked.size);
    $("#railLikedDot").hidden = state.liked.size === 0;
  }

  function markPlayingRows() {
    $$(".track").forEach(function (row) {
      var isCurrent = row.dataset.path === state.currentPath;
      row.classList.toggle("is-playing", isCurrent);
      if (isCurrent) {
        row.classList.toggle("is-paused", !state.playing);
      } else {
        row.classList.remove("is-paused");
      }
    });
  }

  // ───────────────────────────── now playing UI ─────────────────────────────
  function currentTrack() {
    return state.currentPath ? byPath(state.currentPath) : null;
  }

  function updateNowPlayingUI() {
    var t = currentTrack();
    var title = t ? t.title : "Select a song";
    var album = t ? t.album : "KK · local library";
    var sub = t ? "KK · " + t.album + (t.year ? " · " + t.year : "") : "99 songs · Hindi";
    var art = t ? encodeURI(t.art) : "KKK.jpg";
    var dur = t ? t.duration : 0;

    $("#lcdTitle").textContent = title;
    $("#lcdAlbum").textContent = album;
    $("#lcdBitrate").textContent = (t && t.bitrate ? t.bitrate : 128) + " kbps";
    $("#lcdTotal").textContent = fmtTime(dur);

    var qi = state.queue.indexOf(state.currentPath);
    $("#lcdTrackNo").textContent = t ? "TRK " + String((qi >= 0 ? qi : 0) + 1).padStart(2, "0") : "TRK —";

    $("#miniTitle").textContent = title;
    $("#miniSub").textContent = sub;
    $("#miniArt").querySelector("img").src = art;

    $("#npTitle").textContent = title;
    $("#npSub").textContent = sub;
    $("#npAlbum").textContent = album;
    $("#npArt").src = art;
    $("#npDuration").textContent = fmtTime(dur);
    $("#nowPlaying").querySelector(".np-wash").style.backgroundImage = 'url("' + art + '")';

    var liked = t ? state.liked.has(t.path) : false;
    getLikeButtons().forEach(function (btn) {
      btn.classList.toggle("is-liked", liked);
      btn.setAttribute("aria-pressed", String(liked));
      btn.innerHTML = icon(liked ? "heart-fill" : "heart", liked ? "icon--fill" : "");
    });
    $("#deckLike").setAttribute("aria-pressed", String(liked));

    document.title = t ? t.title + " · KK Infinite" : "KK Infinite — Remembering KK";

    if ("mediaSession" in navigator && window.MediaMetadata) {
      try {
        navigator.mediaSession.metadata = new MediaMetadata({
          title: title,
          artist: "KK",
          album: album,
          artwork: [{ src: art, sizes: "460x460", type: "image/png" }],
        });
      } catch (e) {
        /* ignore */
      }
    }

    updateProgress();
    markPlayingRows();
    if ($("#queueSheet").classList.contains("is-open")) renderQueue();
  }

  function getLikeButtons() {
    // #deckLike is a hardware-style switch (LED + label) — only its pressed state changes.
    return [$("#npLike")].filter(Boolean);
  }

  function setPlayButtons(playing) {
    state.playing = playing;
    var name = playing ? "pause" : "play";
    ["#deckPlayIcon", "#miniPlayIcon", "#npPlayIcon"].forEach(function (sel) {
      var el = $(sel);
      if (el) el.innerHTML = '<use href="#i-' + name + '"/>';
    });
    ["#deckPlay", "#miniPlay", "#npPlay"].forEach(function (sel) {
      var el = $(sel);
      if (el) el.setAttribute("aria-label", playing ? "Pause" : "Play");
    });
    $("#lcdState").textContent = playing ? "PLAYING" : state.currentPath ? "PAUSED" : "READY";
    $("#npVinyl").classList.toggle("is-spinning", playing);
    var tl = $("#tracklist");
    tl.classList.toggle("is-paused", !playing);
    $("#likedList").classList.toggle("is-paused", !playing);
    markPlayingRows();
    if (playing) startProgress(); else stopProgress();
  }

  // ───────────────────────────── playback ─────────────────────────────
  function setQueue(list, label) {
    state.queue = list.map(function (t) {
      return t.path;
    });
    state.queueLabel = label || state.queueLabel;
    renderQueue();
  }

  function loadTrack(track, autoplay, startAt) {
    if (!track) return;
    state.currentPath = track.path;
    engine.ensure();

    audio.src = encodeURI(track.path);
    audio.load();

    if (startAt && startAt > 1) {
      var apply = function () {
        try {
          audio.currentTime = startAt;
        } catch (e) {
          /* ignore */
        }
        audio.removeEventListener("loadedmetadata", apply);
      };
      audio.addEventListener("loadedmetadata", apply);
    }

    updateNowPlayingUI();
    persist();

    if (autoplay) startPlayback();
    else setPlayButtons(false);
  }

  function startPlayback() {
    if (!state.currentPath) {
      var first = displayedList()[0];
      if (first) {
        setQueue(displayedList(), state.view === "liked" ? "Liked songs" : "All songs");
        loadTrack(first, true);
      }
      return;
    }
    pauseToken++;
    engine.ensure();
    engine.resume();

    var p = audio.play();
    if (p && p.then) {
      p.then(function () {
        engine.setVolume(0, true);
        engine.fadeTo(state.volume, 0.4);
        setPlayButtons(true);
      }).catch(function (err) {
        setPlayButtons(false);
        if (err && err.name === "NotAllowedError") return; // autoplay policy: wait for a real tap
        console.warn("[KK] playback failed", err);
        toast("Could not play this file — check the KK folder");
      });
    } else {
      setPlayButtons(true);
    }
  }

  function pausePlayback() {
    if (audio.paused) {
      setPlayButtons(false);
      return;
    }
    var token = ++pauseToken;
    engine.fadeTo(0, 0.12);
    setTimeout(function () {
      if (token !== pauseToken) return;
      audio.pause();
      engine.setVolume(state.volume, true);
      setPlayButtons(false);
      persist();
    }, 135);
  }

  function togglePlay() {
    engine.ensure();
    engine.resume();
    if (audio.paused) startPlayback();
    else pausePlayback();
  }

  function playFromList(list, path) {
    var idx = -1;
    list.forEach(function (t, i) {
      if (t.path === path) idx = i;
    });
    if (idx < 0) return;
    setQueue(list, labelForCurrentView());
    if (state.currentPath === path) {
      togglePlay();
      return;
    }
    loadTrack(list[idx], true);
  }

  function labelForCurrentView() {
    if (state.view === "liked") return "Liked songs";
    if (state.search) return 'Search: "' + state.search + '"';
    return "All songs";
  }

  function nextTrack(auto) {
    var q = state.queue.length ? state.queue : LIB.map(function (t) { return t.path; });
    if (!q.length) return;
    var i = q.indexOf(state.currentPath);
    var j;
    if (state.shuffle) {
      if (q.length === 1) return;
      do {
        j = Math.floor(Math.random() * q.length);
      } while (j === i);
    } else {
      j = i + 1;
      if (j >= q.length) {
        if (!auto || state.repeat === "all") j = 0;
        else {
          pausePlayback();
          return;
        }
      }
    }
    var t = byPath(q[j]);
    if (t) loadTrack(t, true);
  }

  function prevTrack() {
    var q = state.queue.length ? state.queue : LIB.map(function (t) { return t.path; });
    if (!q.length) return;
    if (audio.currentTime > 3) {
      audio.currentTime = 0;
      updateProgress();
      return;
    }
    var i = q.indexOf(state.currentPath);
    var j = (i - 1 + q.length) % q.length;
    var t = byPath(q[j]);
    if (t) loadTrack(t, true);
  }

  audio.addEventListener("ended", function () {
    if (state.repeat === "one") {
      audio.currentTime = 0;
      startPlayback();
      return;
    }
    nextTrack(true);
  });

  audio.addEventListener("play", function () {
    setPlayButtons(true);
  });
  audio.addEventListener("pause", function () {
    if (!audio.ended) setPlayButtons(false);
  });
  audio.addEventListener("error", function () {
    if (!state.currentPath) return;
    var t = currentTrack();
    toast("Couldn’t load " + (t ? t.title : "this song"));
    setPlayButtons(false);
  });
  audio.addEventListener("loadedmetadata", function () {
    if (isFinite(audio.duration) && audio.duration > 0) {
      $("#lcdTotal").textContent = fmtTime(audio.duration);
      $("#npDuration").textContent = fmtTime(audio.duration);
    }
  });

  // ───────────────────────────── progress / seek ─────────────────────────────
  function progressRatio() {
    var d = isFinite(audio.duration) && audio.duration > 0 ? audio.duration : (currentTrack() || {}).duration || 0;
    if (!d) return 0;
    return clamp(audio.currentTime / d, 0, 1);
  }

  function paintProgress(ratio) {
    var pct = (ratio * 100).toFixed(2) + "%";
    $("#lcdSeekFill").style.width = pct;
    $("#miniSeekFill").style.width = pct;
    $("#npSeekFill").style.width = pct;
    $("#npSeekThumb").style.left = pct;
    var cur = audio.currentTime || 0;
    $("#lcdElapsed").textContent = fmtTime(cur);
    $("#npElapsed").textContent = fmtTime(cur);
  }

  function updateProgress() {
    if (state.seeking) return;
    var ratio = progressRatio();
    paintProgress(ratio);
    if (isFinite(audio.duration) && audio.duration > 0) {
      $("#lcdTotal").textContent = fmtTime(audio.duration);
    }
  }

  function startProgress() {
    stopProgress();
    var loop = function () {
      updateProgress();
      progressRaf = requestAnimationFrame(loop);
    };
    progressRaf = requestAnimationFrame(loop);
  }

  function stopProgress() {
    if (progressRaf) cancelAnimationFrame(progressRaf);
    progressRaf = null;
    updateProgress();
  }

  function bindScrub(el, onChange) {
    if (!el) return;
    var dragging = false;

    function ratio(ev) {
      var r = el.getBoundingClientRect();
      return clamp((ev.clientX - r.left) / r.width, 0, 1);
    }

    function apply(ev) {
      var r = ratio(ev);
      paintProgress(r);
      onChange(r, false);
    }

    el.addEventListener("pointerdown", function (ev) {
      if (ev.button !== undefined && ev.button !== 0) return;
      dragging = true;
      state.seeking = true;
      el.setPointerCapture && el.setPointerCapture(ev.pointerId);
      el.classList.add("is-dragging");
      apply(ev);
      ev.preventDefault();
    });
    el.addEventListener("pointermove", function (ev) {
      if (!dragging) return;
      apply(ev);
    });
    function end(ev) {
      if (!dragging) return;
      dragging = false;
      el.classList.remove("is-dragging");
      var r = ratio(ev);
      state.seeking = false;
      onChange(r, true);
      updateProgress();
    }
    el.addEventListener("pointerup", end);
    el.addEventListener("pointercancel", function () {
      dragging = false;
      state.seeking = false;
      el.classList.remove("is-dragging");
      updateProgress();
    });
    el.addEventListener("click", function (ev) {
      if (ev.detail === 0) return; // keyboard-generated
    });
  }

  function seekTo(ratio) {
    var d = isFinite(audio.duration) && audio.duration > 0 ? audio.duration : (currentTrack() || {}).duration;
    if (!d) return;
    try {
      audio.currentTime = clamp(ratio, 0, 0.999) * d;
    } catch (e) {
      /* ignore */
    }
  }

  ["#lcdSeek", "#miniSeek", "#npSeek"].forEach(function (sel) {
    bindScrub($(sel), function (ratio, commit) {
      if (commit) seekTo(ratio);
      else paintProgress(ratio);
    });
  });

  // ───────────────────────────── volume ─────────────────────────────
  function volumeTarget() {
    return state.muted ? 0 : state.volume;
  }

  function syncVolumeUI() {
    var pct = Math.round(state.volume * 100);
    $("#knobRead").textContent = String(pct);
    $("#volumeKnob").style.setProperty("--p", String(pct));
    $("#volumeKnob").setAttribute("aria-valuenow", String(pct));
    ["#npVolume", "#eqVolume"].forEach(function (sel) {
      var el = $(sel);
      if (!el) return;
      setHSliderUI(el, pct);
      el.setAttribute("aria-valuenow", String(pct));
    });
    $("#eqVolumeRead").textContent = pct + "%";
    $("#npVolumeIcon").innerHTML =
      '<use href="#i-' + (state.muted || pct === 0 ? "volume-off" : "volume") + '"/>';
  }

  function setHSliderUI(el, pct) {
    var fill = el.querySelector(".hslider-fill");
    var thumb = el.querySelector(".hslider-thumb");
    if (fill) fill.style.width = pct + "%";
    if (thumb) thumb.style.left = pct + "%";
  }

  function setVolume(v, opts) {
    state.volume = clamp(v, 0, 1);
    if (state.volume > 0) state.muted = false;
    engine.setVolume(volumeTarget());
    syncVolumeUI();
    if (!opts || opts.persist !== false) persist();
  }

  function bindHSlider(el, onChange) {
    if (!el) return;
    var dragging = false;
    function pct(ev) {
      var r = el.getBoundingClientRect();
      return clamp(((ev.clientX - r.left) / r.width) * 100, 0, 100);
    }
    el.addEventListener("pointerdown", function (ev) {
      dragging = true;
      el.setPointerCapture && el.setPointerCapture(ev.pointerId);
      setHSliderUI(el, pct(ev));
      onChange(pct(ev) / 100);
    });
    el.addEventListener("pointermove", function (ev) {
      if (!dragging) return;
      setHSliderUI(el, pct(ev));
      onChange(pct(ev) / 100);
    });
    function end() {
      dragging = false;
    }
    el.addEventListener("pointerup", end);
    el.addEventListener("pointercancel", end);
    el.addEventListener("keydown", function (ev) {
      var step = 0;
      if (ev.key === "ArrowRight" || ev.key === "ArrowUp") step = 5;
      if (ev.key === "ArrowLeft" || ev.key === "ArrowDown") step = -5;
      if (ev.key === "Home") step = -100;
      if (ev.key === "End") step = 100;
      if (!step) return;
      ev.preventDefault();
      onChange(clamp((parseFloat(el.getAttribute("aria-valuenow")) + step) / 100, 0, 1));
    });
  }

  bindHSlider($("#npVolume"), function (v) {
    setVolume(v);
  });
  bindHSlider($("#eqVolume"), function (v) {
    setVolume(v);
  });

  // volume knob (vertical drag + wheel + keyboard)
  (function bindKnob() {
    var knob = $("#volumeKnob");
    var dragging = false;
    var startY = 0;
    var startVal = 0;

    knob.addEventListener("pointerdown", function (ev) {
      dragging = true;
      startY = ev.clientY;
      startVal = state.volume * 100;
      knob.setPointerCapture && knob.setPointerCapture(ev.pointerId);
      ev.preventDefault();
    });
    knob.addEventListener("pointermove", function (ev) {
      if (!dragging) return;
      setVolume(clamp(startVal + (startY - ev.clientY) * 0.55, 0, 100) / 100);
    });
    knob.addEventListener("pointerup", function () {
      dragging = false;
    });
    knob.addEventListener("pointercancel", function () {
      dragging = false;
    });
    knob.addEventListener(
      "wheel",
      function (ev) {
        ev.preventDefault();
        setVolume(clamp(state.volume - Math.sign(ev.deltaY) * 0.03, 0, 1));
      },
      { passive: false }
    );
    knob.addEventListener("keydown", function (ev) {
      var step = 0;
      if (ev.key === "ArrowRight" || ev.key === "ArrowUp") step = 0.04;
      if (ev.key === "ArrowLeft" || ev.key === "ArrowDown") step = -0.04;
      if (!step) return;
      ev.preventDefault();
      setVolume(state.volume + step);
    });
    knob.addEventListener("dblclick", function () {
      setVolume(0.75);
      toast("Volume reset to 75%");
    });
  })();

  // ───────────────────────────── equalizer ─────────────────────────────
  var BANDS = window.KKAudio.BANDS;

  function buildBands() {
    $("#bands").innerHTML = BANDS.map(function (b, i) {
      return (
        '<div class="band" data-band="' + i + '">' +
        '<span class="band-val">0</span>' +
        '<div class="band-track" role="slider" tabindex="0" data-band="' + i + '" ' +
        'aria-label="' + b.label + b.unit + '" aria-valuemin="-12" aria-valuemax="12" aria-valuenow="0">' +
        '<span class="band-fill"></span><span class="band-knob"></span></div>' +
        '<span class="band-freq">' + b.label + "</span></div>"
      );
    }).join("");
  }

  function paintBands() {
    $$(".band", $("#bands")).forEach(function (band, i) {
      var v = state.bypass ? 0 : state.gains[i] || 0;
      var p = (clamp(v, -12, 12) + 12) / 24;
      var pct = (1 - p) * 100;
      var fill = band.querySelector(".band-fill");
      var knob = band.querySelector(".band-knob");
      var track = band.querySelector(".band-track");
      fill.style.top = Math.min(pct, 50) + "%";
      fill.style.height = Math.abs(pct - 50) + "%";
      knob.style.top = pct + "%";
      knob.style.transform = "translateY(-50%)";
      band.querySelector(".band-val").textContent = (v > 0 ? "+" : "") + v.toFixed(1).replace(/\.0$/, "");
      track.setAttribute("aria-valuenow", String(v));
      band.classList.toggle("is-zero", Math.abs(v) < 0.25);
    });
  }

  function applyEQ(opts) {
    if (opts) {
      if (opts.gains) state.gains = opts.gains.slice();
      if (typeof opts.preampDb === "number") state.preampDb = opts.preampDb;
      if (typeof opts.space === "number") state.space = opts.space;
      if (typeof opts.bypass === "boolean") state.bypass = opts.bypass;
      if (opts.preset) state.preset = opts.preset;
    }
    engine.applyEQ(
      { gains: state.gains, preampDb: state.preampDb, space: state.space, bypass: state.bypass },
      0.035
    );
    paintBands();
    updateEqChrome();
    persist();
  }

  function updateEqChrome() {
    var preset = window.KKAudio.PRESETS[state.preset];
    var label = state.preset === "custom" ? "Custom" : preset ? preset.label : "Custom";
    if (state.bypass) label = "Off";

    $("#deckPresetName").textContent = label;
    $("#npPresetName").textContent = label;
    $("#eqModeLabel").textContent = label;
    $("#deckEq").setAttribute("aria-pressed", String(!state.bypass));
    $("#eqBypass").setAttribute("aria-checked", String(!state.bypass));
    $("#eqStatus").textContent = state.bypass ? "Bypassed" : "Active";
    $("#headroomRead").textContent = Math.abs(state.preampDb) + " dB";

    $$(".preset", $("#presets")).forEach(function (btn) {
      btn.classList.toggle("is-active", btn.dataset.preset === state.preset);
    });

    var spacePct = Math.round(state.space * 100);
    setHSliderUI($("#spaceSlider"), spacePct);
    $("#spaceSlider").setAttribute("aria-valuenow", String(spacePct));
  }

  function renderPresets() {
    $("#presets").innerHTML = Object.keys(window.KKAudio.PRESETS)
      .map(function (key) {
        return '<button class="preset" data-preset="' + key + '">' +
          window.KKAudio.PRESETS[key].label + "</button>";
      })
      .join("");
  }

  function setPreset(key) {
    var p = window.KKAudio.PRESETS[key];
    if (!p) return;
    applyEQ({
      preset: key,
      gains: p.gains.slice(),
      preampDb: p.preamp,
      space: p.space,
      bypass: false,
    });
    toast(p.label + " preset");
  }

  function bindBandSliders() {
    $$(".band-track").forEach(function (track) {
      var i = Number(track.dataset.band);
      var dragging = false;

      function valueFromY(clientY) {
        var r = track.getBoundingClientRect();
        var pad = 8;
        var p = 1 - (clientY - r.top - pad) / Math.max(1, r.height - pad * 2);
        return Math.round((clamp(p, 0, 1) * 24 - 12) * 2) / 2;
      }

      function setValue(v) {
        state.gains[i] = clamp(v, -12, 12);
        state.preset = "custom";
        state.bypass = false;
        applyEQ();
      }

      track.addEventListener("pointerdown", function (ev) {
        dragging = true;
        track.setPointerCapture && track.setPointerCapture(ev.pointerId);
        setValue(valueFromY(ev.clientY));
        ev.preventDefault();
      });
      track.addEventListener("pointermove", function (ev) {
        if (!dragging) return;
        setValue(valueFromY(ev.clientY));
      });
      function end() {
        dragging = false;
      }
      track.addEventListener("pointerup", end);
      track.addEventListener("pointercancel", end);

      track.addEventListener("keydown", function (ev) {
        var step = 0;
        if (ev.key === "ArrowUp" || ev.key === "ArrowRight") step = 1;
        if (ev.key === "ArrowDown" || ev.key === "ArrowLeft") step = -1;
        if (ev.key === "Home") step = -12;
        if (ev.key === "End") step = 12;
        if (!step) return;
        ev.preventDefault();
        setValue((state.gains[i] || 0) + step);
      });
    });
  }

  bindHSlider($("#spaceSlider"), function (v) {
    state.space = v;
    if (!state.bypass) {
      applyEQ({ space: v });
    } else {
      updateEqChrome();
    }
  });

  // ───────────────────────────── visualizer ─────────────────────────────
  var viz = {
    targets: [],
    raf: null,
    width: 0,
    height: 0,
  };

  function makeVizTarget(canvas, barWidth) {
    if (!canvas) return null;
    return {
      canvas: canvas,
      ctx: canvas.getContext("2d"),
      barWidth: barWidth || 9,
      bars: 48,
      smooth: new Array(96).fill(0),
      w: 0,
      h: 0,
    };
  }

  function initViz() {
    viz.targets = [makeVizTarget($("#viz"), 9), makeVizTarget($("#deckViz"), 7)].filter(Boolean);
    resizeViz();
    window.addEventListener("resize", resizeViz);
  }

  function resizeViz() {
    viz.targets.forEach(function (t) {
      var rect = t.canvas.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      t.w = rect.width;
      t.h = rect.height;
      t.canvas.width = Math.round(rect.width * dpr);
      t.canvas.height = Math.round(rect.height * dpr);
      t.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      t.bars = clamp(Math.floor(rect.width / t.barWidth), 18, 80);
    });
  }

  function paintVizTarget(t, time, data, sr) {
    if (!t.w || !t.h) return;
    var ctx = t.ctx;
    var W = t.w;
    var H = t.h;
    ctx.clearRect(0, 0, W, H);

    var n = t.bars;
    var gap = Math.max(1.5, Math.min(3, W / n * 0.32));
    var barW = Math.max(1.4, (W - gap * (n - 1)) / n);
    var bins = data ? data.length : 0;

    var grad = ctx.createLinearGradient(0, H, 0, 0);
    grad.addColorStop(0, "rgba(239, 90, 34, 0.32)");
    grad.addColorStop(0.55, "rgba(255, 139, 78, 0.95)");
    grad.addColorStop(1, "rgba(255, 208, 176, 0.98)");
    ctx.fillStyle = grad;

    var idle = !state.playing || !data;
    var fMin = 45;
    var fMax = 14000;

    for (var i = 0; i < n; i++) {
      var v;
      if (idle) {
        var wave = 0.5 + 0.5 * Math.sin(i * 0.42 + time / 1400);
        var swell = 0.55 + 0.45 * Math.sin(i * 0.15 - time / 2100);
        v = 0.045 + 0.2 * wave * swell;
      } else {
        var f0 = fMin * Math.pow(fMax / fMin, i / n);
        var f1 = fMin * Math.pow(fMax / fMin, (i + 1) / n);
        var b0 = Math.min(bins - 1, Math.max(0, Math.floor((f0 / (sr / 2)) * bins)));
        var b1 = Math.min(bins - 1, Math.max(b0 + 1, Math.ceil((f1 / (sr / 2)) * bins)));
        var peak = 0;
        for (var b = b0; b <= b1; b++) {
          if (data[b] > peak) peak = data[b];
        }
        v = Math.pow(peak / 255, 0.78);
      }

      var prev = t.smooth[i] || 0;
      t.smooth[i] = v > prev ? prev + (v - prev) * 0.55 : prev + (v - prev) * 0.11;

      var h = Math.max(2, t.smooth[i] * (H - 2));
      var x = i * (barW + gap);
      var y = H - h;
      var r = Math.min(barW / 2, 2.4);
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(x, y, barW, h, r);
      else ctx.rect(x, y, barW, h);
      ctx.fill();
    }
  }

  function drawViz(time) {
    var data = engine.readSpectrum();
    var sr = engine.sampleRate();
    viz.targets.forEach(function (t) {
      paintVizTarget(t, time, data, sr);
    });
    viz.raf = requestAnimationFrame(drawViz);
  }

  function startViz() {
    if (viz.raf) return;
    resizeViz();
    viz.raf = requestAnimationFrame(drawViz);
  }

  function stopViz() {
    if (viz.raf) cancelAnimationFrame(viz.raf);
    viz.raf = null;
  }

  // ───────────────────────────── overlays ─────────────────────────────
  function openNowPlaying() {
    var np = $("#nowPlaying");
    np.classList.add("is-open");
    np.setAttribute("aria-hidden", "false");
    np.querySelector(".np-inner").scrollTop = 0;
    document.body.style.overflow = "hidden";
    startViz();
    setTimeout(function () {
      $("#npClose").focus({ preventScroll: true });
    }, 60);
  }

  function closeNowPlaying() {
    var np = $("#nowPlaying");
    np.classList.remove("is-open");
    np.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  function openSheet(sheet, backdrop) {
    sheet.classList.add("is-open");
    sheet.setAttribute("aria-hidden", "false");
    backdrop.hidden = false;
    requestAnimationFrame(function () {
      backdrop.classList.add("is-open");
    });
    document.body.style.overflow = "hidden";
    if (sheet.id === "soundSheet") updateEqChrome();
  }

  function closeSheet(sheet, backdrop) {
    sheet.classList.remove("is-open");
    sheet.setAttribute("aria-hidden", "true");
    backdrop.classList.remove("is-open");
    setTimeout(function () {
      backdrop.hidden = true;
    }, 300);
    document.body.style.overflow = "";
  }

  function openSound() {
    openSheet($("#soundSheet"), $("#sheetBackdrop"));
  }
  function closeSound() {
    closeSheet($("#soundSheet"), $("#sheetBackdrop"));
  }
  function openQueue() {
    renderQueue();
    openSheet($("#queueSheet"), $("#queueBackdrop"));
  }
  function closeQueue() {
    closeSheet($("#queueSheet"), $("#queueBackdrop"));
  }

  function renderQueue() {
    var list = state.queue.length ? state.queue.map(byPath).filter(Boolean) : [];
    var el = $("#queueList");
    if (!list.length) {
      el.innerHTML = '<p class="mini-empty">Nothing queued yet — pick a song and it will appear here.</p>';
      return;
    }
    el.innerHTML = list
      .map(function (t, i) {
        return (
          '<button class="queue-item' + (t.path === state.currentPath ? " is-current" : "") +
          '" data-queue="' + esc(t.path) + '">' +
          '<img src="' + esc(encodeURI(t.art)) + '" alt="" loading="lazy" />' +
          '<span class="queue-copy"><span class="queue-name">' + esc(t.title) + "</span>" +
          '<span class="queue-sub">' + esc(t.album) + " · " + fmtTime(t.duration) + "</span></span>" +
          icon(t.path === state.currentPath && state.playing ? "pause" : "play", "icon--fill") +
          "</button>"
        );
      })
      .join("");
  }

  // ───────────────────────────── toast ─────────────────────────────
  var toastTimer = null;
  function toast(message) {
    var el = $("#toast");
    el.textContent = message;
    el.classList.add("is-on");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      el.classList.remove("is-on");
    }, 2100);
  }

  // ───────────────────────────── likes ─────────────────────────────
  function toggleLike(path) {
    var t = byPath(path);
    if (!t) return;
    if (state.liked.has(path)) {
      state.liked.delete(path);
      toast("Removed from Liked");
    } else {
      state.liked.add(path);
      toast("Added to Liked");
    }
    persist();
    syncLikeUI();
  }

  function syncLikeUI() {
    $$("[data-like]").forEach(function (btn) {
      var liked = state.liked.has(btn.dataset.like);
      btn.classList.toggle("is-liked", liked);
      btn.setAttribute("aria-pressed", String(liked));
      btn.innerHTML = icon(liked ? "heart-fill" : "heart", liked ? "icon--fill" : "");
    });
    var t = currentTrack();
    var likedCurrent = t ? state.liked.has(t.path) : false;
    getLikeButtons().forEach(function (btn) {
      btn.classList.toggle("is-liked", likedCurrent);
      btn.setAttribute("aria-pressed", String(likedCurrent));
      btn.innerHTML = icon(likedCurrent ? "heart-fill" : "heart", likedCurrent ? "icon--fill" : "");
    });
    $("#deckLike").setAttribute("aria-pressed", String(likedCurrent));
    renderLikedPreview();
    if (state.view === "liked") renderLikedView();
    renderCounts();
    if ($("#queueSheet").classList.contains("is-open")) renderQueue();
  }

  // ───────────────────────────── views ─────────────────────────────
  function setView(view) {
    if (["home", "liked", "about"].indexOf(view) < 0) return;
    state.view = view;
    $("#viewHome").hidden = view !== "home";
    $("#viewLiked").hidden = view !== "liked";
    $("#viewAbout").hidden = view !== "about";
    $$("[data-view]").forEach(function (el) {
      el.classList.toggle("is-active", el.dataset.view === view);
      if (el.classList.contains("rail-btn")) {
        if (view === el.dataset.view) el.setAttribute("aria-current", "page");
        else el.removeAttribute("aria-current");
      }
    });
    $("#scrollArea").scrollTo({ top: 0, behavior: "smooth" });
    if (view === "liked") renderLikedView();
    if (view === "home") renderTracklist();
  }

  function setTheme(theme) {
    state.theme = theme;
    document.documentElement.dataset.theme = theme;
    $("#themeIcon").innerHTML = '<use href="#i-' + (theme === "dark" ? "sun" : "moon") + '"/>';
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", theme === "dark" ? "#101114" : "#f2f1ee");
    persist();
  }

  function cycleRepeat() {
    state.repeat = state.repeat === "off" ? "all" : state.repeat === "all" ? "one" : "off";
    syncRepeat();
    persist();
    toast(
      state.repeat === "off" ? "Repeat off" : state.repeat === "all" ? "Repeat queue" : "Repeat one song"
    );
  }

  function syncRepeat() {
    var on = state.repeat !== "off";
    [["#deckRepeat"], ["#npRepeat"]].forEach(function (pair) {
      var el = $(pair[0]);
      if (!el) return;
      el.classList.toggle("is-on", on);
      el.setAttribute("aria-pressed", String(on));
      el.setAttribute(
        "aria-label",
        state.repeat === "one" ? "Repeat one song" : state.repeat === "all" ? "Repeat queue" : "Repeat off"
      );
      var use = el.querySelector("use");
      if (use) use.setAttribute("href", state.repeat === "one" ? "#i-repeat-one" : "#i-repeat");
    });
  }

  function toggleShuffle() {
    state.shuffle = !state.shuffle;
    syncShuffle();
    persist();
    toast(state.shuffle ? "Shuffle on" : "Shuffle off");
  }

  function syncShuffle() {
    ["#deckShuffle", "#npShuffle"].forEach(function (sel) {
      var el = $(sel);
      if (!el) return;
      el.classList.toggle("is-on", state.shuffle);
      el.setAttribute("aria-pressed", String(state.shuffle));
    });
  }

  // ───────────────────────────── events ─────────────────────────────
  function bindEvents() {
    // transport
    $("#deckPlay").addEventListener("click", togglePlay);
    $("#miniPlay").addEventListener("click", togglePlay);
    $("#npPlay").addEventListener("click", togglePlay);
    $("#deckNext").addEventListener("click", function () { nextTrack(false); });
    $("#npNext").addEventListener("click", function () { nextTrack(false); });
    $("#miniNext").addEventListener("click", function () { nextTrack(false); });
    $("#deckPrev").addEventListener("click", prevTrack);
    $("#npPrev").addEventListener("click", prevTrack);
    $("#miniPrev").addEventListener("click", prevTrack);

    $("#deckShuffle").addEventListener("click", toggleShuffle);
    $("#npShuffle").addEventListener("click", toggleShuffle);
    $("#deckRepeat").addEventListener("click", cycleRepeat);
    $("#npRepeat").addEventListener("click", cycleRepeat);

    // open / close
    $("#deckExpand").addEventListener("click", openNowPlaying);
    $("#lcd").addEventListener("click", openNowPlaying);
    $("#lcd").addEventListener("keydown", function (ev) {
      if (ev.key === "Enter" || ev.key === " ") {
        ev.preventDefault();
        openNowPlaying();
      }
    });
    $("#miniArt").addEventListener("click", openNowPlaying);
    $("#miniCopy").addEventListener("click", openNowPlaying);
    $("#miniCopy").addEventListener("keydown", function (ev) {
      if (ev.key === "Enter" || ev.key === " ") {
        ev.preventDefault();
        openNowPlaying();
      }
    });
    $("#npClose").addEventListener("click", closeNowPlaying);
    $("#nowPlaying").addEventListener("click", function (ev) {
      if (ev.target === $("#nowPlaying")) closeNowPlaying();
    });

    $("#railSound").addEventListener("click", openSound);
    $("#topSound").addEventListener("click", openSound);
    $("#deckSound").addEventListener("click", openSound);
    $("#deckEq").addEventListener("click", function () {
      applyEQ({ bypass: !state.bypass });
      toast(state.bypass ? "Equalizer bypassed" : "Equalizer active");
    });
    $("#deckLike").addEventListener("click", function () {
      if (state.currentPath) toggleLike(state.currentPath);
      else toast("Play a song first");
    });
    $("#deckLiked").addEventListener("click", function () {
      setView("liked");
    });
    $("#npSoundBtn").addEventListener("click", openSound);
    $("#npEq").addEventListener("click", openSound);
    $("#npLike").addEventListener("click", function () {
      if (state.currentPath) toggleLike(state.currentPath);
    });

    $("#sheetClose").addEventListener("click", closeSound);
    $("#sheetBackdrop").addEventListener("click", closeSound);

    $("#npQueueBtn").addEventListener("click", openQueue);
    $("#queueClose").addEventListener("click", closeQueue);
    $("#queueBackdrop").addEventListener("click", closeQueue);

    $("#npMute").addEventListener("click", function () {
      state.muted = !state.muted;
      engine.setMuted(state.muted);
      syncVolumeUI();
      persist();
      toast(state.muted ? "Muted" : "Unmuted");
    });

    // theme + nav
    $("#themeToggle").addEventListener("click", function () {
      setTheme(state.theme === "dark" ? "light" : "dark");
    });
    document.addEventListener("click", function (ev) {
      var viewBtn = ev.target.closest("[data-view]");
      if (viewBtn) {
        setView(viewBtn.dataset.view);
        return;
      }
    });
    $("#tabSound").addEventListener("click", openSound);

    // search
    var search = $("#searchInput");
    search.addEventListener("input", function () {
      state.search = search.value;
      if (state.view !== "home") setView("home");
      renderTracklist();
    });
    search.addEventListener("focus", function () {
      $("#searchKbd").style.opacity = "0";
    });
    search.addEventListener("blur", function () {
      $("#searchKbd").style.opacity = "";
    });
    $("#emptyClear").addEventListener("click", function () {
      search.value = "";
      state.search = "";
      renderTracklist();
      search.focus();
    });

    // sorting
    $("#sortSeg").addEventListener("click", function (ev) {
      var btn = ev.target.closest("[data-sort]");
      if (!btn) return;
      state.sort = btn.dataset.sort;
      $$("#sortSeg button").forEach(function (b) {
        b.classList.toggle("is-active", b === btn);
      });
      renderTracklist();
      persist();
    });

    // play all / shuffle
    $("#playAll").addEventListener("click", function () {
      var list = sortList(LIB.slice());
      state.shuffle = false;
      syncShuffle();
      setQueue(list, "All songs");
      loadTrack(list[0], true);
    });
    $("#shuffleAll").addEventListener("click", shuffleAll);
    $("#topShuffle").addEventListener("click", shuffleAll);
    $("#playLiked").addEventListener("click", function () {
      var liked = sortList(
        LIB.filter(function (t) {
          return state.liked.has(t.path);
        })
      );
      if (!liked.length) return;
      setQueue(liked, "Liked songs");
      loadTrack(liked[0], true);
    });

    function shuffleAll() {
      var list = sortList(LIB.slice());
      state.shuffle = true;
      syncShuffle();
      setQueue(list, "All songs · shuffled");
      var start = Math.floor(Math.random() * list.length);
      loadTrack(list[start], true);
      toast("Shuffling " + list.length + " songs");
    }

    // track rows (event delegation)
    function trackClick(ev) {
      var likeBtn = ev.target.closest("[data-like]");
      if (likeBtn) {
        ev.stopPropagation();
        toggleLike(likeBtn.dataset.like);
        return;
      }
      var row = ev.target.closest(".track");
      if (!row) return;
      var list = row.closest("#likedList") ? likedList() : displayedList();
      playFromList(list, row.dataset.path);
    }

    function likedList() {
      return sortList(
        LIB.filter(function (t) {
          return state.liked.has(t.path);
        })
      );
    }

    $("#tracklist").addEventListener("click", trackClick);
    $("#likedList").addEventListener("click", trackClick);
    $("#tracklist").addEventListener("keydown", function (ev) {
      if (ev.key !== "Enter" && ev.key !== " ") return;
      var row = ev.target.closest(".track");
      if (!row) return;
      ev.preventDefault();
      playFromList(displayedList(), row.dataset.path);
    });
    $("#likedList").addEventListener("keydown", function (ev) {
      if (ev.key !== "Enter" && ev.key !== " ") return;
      var row = ev.target.closest(".track");
      if (!row) return;
      ev.preventDefault();
      playFromList(likedList(), row.dataset.path);
    });

    // discs
    $("#discs").addEventListener("click", function (ev) {
      var disc = ev.target.closest("[data-album]");
      if (!disc) return;
      playAlbum(disc.dataset.album);
    });

    // album rows (home + about)
    [document.getElementById("albumList"), document.getElementById("albumListAbout")].forEach(function (el) {
      el.addEventListener("click", function (ev) {
        var btn = ev.target.closest("[data-album]");
        if (!btn) return;
        playAlbum(btn.dataset.album);
      });
    });

    // mini lists
    $("#likedPreview").addEventListener("click", function (ev) {
      var row = ev.target.closest("[data-play]");
      if (!row) return;
      playFromList(displayedList(), row.dataset.play);
    });
    $("#essentialList").addEventListener("click", function (ev) {
      var row = ev.target.closest("[data-play]");
      if (!row) return;
      playFromList(sortList(LIB.slice()), row.dataset.play);
    });

    // queue
    $("#queueList").addEventListener("click", function (ev) {
      var item = ev.target.closest("[data-queue]");
      if (!item) return;
      var path = item.dataset.queue;
      if (path === state.currentPath) togglePlay();
      else loadTrack(byPath(path), true);
      renderQueue();
    });

    // presets
    $("#presets").addEventListener("click", function (ev) {
      var btn = ev.target.closest("[data-preset]");
      if (btn) setPreset(btn.dataset.preset);
    });
    $("#eqBypass").addEventListener("click", function () {
      applyEQ({ bypass: !state.bypass });
      toast(state.bypass ? "Equalizer bypassed" : "Equalizer active");
    });
    $("#eqReset").addEventListener("click", function () {
      setPreset("flat");
      applyEQ({ space: 0, bypass: false, preset: "flat", gains: [0, 0, 0, 0, 0], preampDb: 0 });
      setVolume(0.75);
      toast("Sound reset");
    });

    // keyboard
    document.addEventListener("keydown", function (ev) {
      var tag = (ev.target.tagName || "").toLowerCase();
      var typing = tag === "input" || tag === "textarea" || ev.target.isContentEditable;

      if ((ev.key === "/" && !typing) || ((ev.metaKey || ev.ctrlKey) && ev.key.toLowerCase() === "k")) {
        ev.preventDefault();
        $("#searchInput").focus();
        $("#searchInput").select();
        return;
      }
      if (ev.key === "Escape") {
        if ($("#soundSheet").classList.contains("is-open")) return closeSound();
        if ($("#queueSheet").classList.contains("is-open")) return closeQueue();
        if ($("#nowPlaying").classList.contains("is-open")) return closeNowPlaying();
        if (typing) {
          $("#searchInput").value = "";
          state.search = "";
          renderTracklist();
          $("#searchInput").blur();
        }
        return;
      }
      if (typing) return;

      if (ev.code === "Space") {
        ev.preventDefault();
        togglePlay();
      } else if (ev.key === "ArrowRight") {
        if (audio.duration) audio.currentTime = clamp(audio.currentTime + (ev.shiftKey ? 30 : 5), 0, audio.duration - 0.2);
      } else if (ev.key === "ArrowLeft") {
        if (audio.duration) audio.currentTime = clamp(audio.currentTime - (ev.shiftKey ? 30 : 5), 0, audio.duration - 0.2);
      } else if (ev.key === "ArrowUp") {
        ev.preventDefault();
        setVolume(state.volume + 0.05);
      } else if (ev.key === "ArrowDown") {
        ev.preventDefault();
        setVolume(state.volume - 0.05);
      } else if (ev.key.toLowerCase() === "m") {
        $("#npMute").click();
      } else if (ev.key.toLowerCase() === "f" || ev.key.toLowerCase() === "l") {
        if (state.currentPath) toggleLike(state.currentPath);
      } else if (ev.key.toLowerCase() === "s") {
        toggleShuffle();
      } else if (ev.key.toLowerCase() === "r") {
        cycleRepeat();
      }
    });

    // on phones the deck is the hero: hide the mini bar while it is on screen
    if (window.matchMedia("(max-width: 900px)").matches && "IntersectionObserver" in window) {
      var mini = $("#miniplayer");
      var deckObserver = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            mini.classList.toggle("is-hidden", entry.intersectionRatio > 0.55);
          });
        },
        { threshold: [0, 0.55, 0.9] }
      );
      deckObserver.observe($(".deck"));
    }

    // keep last position
    window.addEventListener("beforeunload", persist);
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) persist();
    });
    setInterval(persist, 8000);

    // sticky topbar on mobile
    function stickyBar() {
      var top = Math.max(window.scrollY || 0, $("#scrollArea").scrollTop || 0);
      $(".topbar").classList.toggle("is-stuck", top > 10);
    }
    $("#scrollArea").addEventListener("scroll", stickyBar, { passive: true });
    window.addEventListener("scroll", stickyBar, { passive: true });
  }

  function playAlbum(name) {
    var a = albumMap.get(name);
    if (!a || !a.tracks.length) return;
    var list = sortList(a.tracks.slice());
    setQueue(list, name);
    loadTrack(list[0], true);
    toast("Playing " + name);
  }

  // ───────────────────────────── boot ─────────────────────────────
  function init() {
    document.documentElement.dataset.theme = state.theme;
    $("#themeIcon").innerHTML = '<use href="#i-' + (state.theme === "dark" ? "sun" : "moon") + '"/>';

    var totalMin = LIB.reduce(function (s, t) {
      return s + (t.duration || 0);
    }, 0) / 60;
    $("#introStats").textContent =
      LIB.length + " songs · " + Math.floor(totalMin / 60) + " hr " + Math.round(totalMin % 60) + " min · Hindi";

    renderDiscs();
    renderAlbumRows($("#albumList"), ALBUM_PICKS, 5);
    renderAlbumRows($("#albumListAbout"), ALBUM_PICKS, 5);
    renderEssentials();
    renderLikedPreview();
    renderPresets();
    buildBands();
    bindBandSliders();
    initViz();
    startViz();
    window.addEventListener("resize", function () {
      if (viz.raf) resizeViz();
    });

    $("#searchInput").value = state.search;
    $$("#sortSeg button").forEach(function (b) {
      b.classList.toggle("is-active", b.dataset.sort === state.sort);
    });

    // restore EQ
    if (state.preset !== "custom") {
      var p = window.KKAudio.PRESETS[state.preset] || window.KKAudio.PRESETS.flat;
      state.gains = p.gains.slice();
      state.preampDb = p.preamp;
      state.space = p.space;
    }
    engine.applyEQ(
      { gains: state.gains, preampDb: state.preampDb, space: state.space, bypass: state.bypass },
      0
    );
    paintBands();
    updateEqChrome();

    syncVolumeUI();
    engine.setVolume(volumeTarget(), true);

    // restore last track (paused, at its old position)
    var last = saved.track ? byPath(saved.track) : null;
    if (last) {
      state.currentPath = last.path;
      state.queue = sortList(LIB.slice()).map(function (t) { return t.path; });
      audio.src = encodeURI(last.path);
      var pos = typeof saved.position === "number" ? saved.position : 0;
      if (pos > 2) {
        audio.addEventListener("loadedmetadata", function once() {
          try {
            audio.currentTime = pos;
          } catch (e) {
            /* ignore */
          }
          updateProgress();
          audio.removeEventListener("loadedmetadata", once);
        });
      }
      updateNowPlayingUI();
    } else {
      updateNowPlayingUI();
    }

    setPlayButtons(false);
    renderTracklist();
    renderLikedView();
    renderCounts();
    renderQueue();
    syncShuffle();
    syncRepeat();
    bindEvents();
    setView("home");

    // small debug handle (handy from the console, harmless in a local app)
    window.__kk = {
      state: state,
      engine: engine,
      audio: audio,
      library: LIB,
      preset: setPreset,
      applyEQ: applyEQ,
      playAlbum: playAlbum,
    };

    if ("mediaSession" in navigator) {
      try {
        navigator.mediaSession.setActionHandler("play", togglePlay);
        navigator.mediaSession.setActionHandler("pause", pausePlayback);
        navigator.mediaSession.setActionHandler("nexttrack", function () { nextTrack(false); });
        navigator.mediaSession.setActionHandler("previoustrack", prevTrack);
        navigator.mediaSession.setActionHandler("seekto", function (d) {
          if (d && typeof d.seekTime === "number") {
            audio.currentTime = d.seekTime;
            updateProgress();
          }
        });
      } catch (e) {
        /* unsupported */
      }
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
