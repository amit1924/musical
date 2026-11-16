# KK Infinite

A private, offline tribute player for KK's songs — 99 tracks, real album artwork, and a
studio-grade equalizer that never clips.

![Now playing](KKK.jpg)

## What's inside

- **Light + dark themes** (dark by default), a vinyl "hardware" deck with an LCD, rotary
  volume knob and a live spectrum strip.
- **Real metadata** — titles, films, years and durations are read from the files themselves
  with `ffprobe`; covers are pulled from each MP3's embedded artwork.
- **Studio EQ** — 5 bands (60 Hz → 12 kHz), six presets, room reverb, bypass and a limiter.
- **Everything persists** — volume, EQ, likes, theme, shuffle/repeat and the last track
  position are saved in `localStorage`.
- **Keyboard controls** — `Space` play/pause, `←/→` seek, `↑/↓` volume, `F` like, `S` shuffle,
  `R` repeat, `/` search, `Esc` close.
- **Lock-screen controls** via the Media Session API.

## Running

Open `index.html` directly, or serve the folder:

```bash
python3 -m http.server 8000
```

## Rebuilding the library

If you add or remove MP3s in `KK/`:

```bash
python3 build-library.py
```

This re-extracts cover art into `art/`, normalises titles/albums, skips empty files and
regenerates `library.js`.

## Audio engine

The graph is built once and never re-wired:

```
source → preamp → 5 biquads →┬→ dry ─────────────────┐
                             └→ send → convolver → wet ┴→ master → limiter → analyser → out
```

Presets reserve headroom (negative preamp) whenever a band is boosted, reverb runs as a
parallel send so the dry signal stays intact, and a hard-knee limiter catches peaks.
`tests/engine-check.html` renders a deliberately hot signal through the real graph offline
and verifies that every preset stays below 0 dBFS, that repeated preset changes do not build
up level, and that the reverb tail decays to silence.
