#!/usr/bin/env python3
"""
build-library.py — scan the KK/ folder, extract cover art, normalise tags and
emit library.js for the KK Infinite player.

Usage:  python3 build-library.py
Deps:   ffmpeg / ffprobe on PATH (no Python packages required).
"""
import hashlib
import json
import os
import re
import subprocess
from concurrent.futures import ThreadPoolExecutor

ROOT = os.path.dirname(os.path.abspath(__file__))
MUSIC_DIR = os.path.join(ROOT, "KK")
ART_DIR = os.path.join(ROOT, "art")
OUT = os.path.join(ROOT, "library.js")
FALLBACK_ART = "KKK.jpg"

DOMAINS = (
    "jiosongs|hotmentos|pagalsongs|pagalnew|pagalworld|sabtunes|mp3wale|"
    r"raag\.?fm|djmaza|jatt|wapking|bestofmusic|songs\.pk|mr-jatt|mymp3song"
)

SITE_WORD = r"(?:jio\s*songs|hot\s*mentos|pagla\w*|pagal\w*|sab\s*tunes|mp3\s*wale|raag\.?\s*fm|djmaza|mr-?jatt|wapking|mymp3song|bestofmusic)"
QUALITY = r"(?:128|192|320|256)\s*kbps|kbps|mp3"
JUNK_TOKEN = (
    r"(?:k\.?\s*k\.?|by\.{0,2}\s*k\.?k\.?|djmaza|" + SITE_WORD + r"|" + QUALITY +
    r"|128|192|256|320|(?:www\.)?[\w-]+\.(?:com|net|la|live|pk|in|org))"
)
PAREN_JUNK = re.compile(
    r"\s*[\(\[]\s*[^)\]]*(?:" + SITE_WORD + r"|[\w-]+\.(?:com|net|la|live|pk|in)|mp3)[^)\]]*[\)\]]",
    re.I,
)
URL_RE = re.compile(r"(?:https?://\S+|www\.[\w.\-/]+)", re.I)
TAIL_JUNK = re.compile(r"(?:[\s_\-–]+" + JUNK_TOKEN + r")+\s*$", re.I)
SEG_JUNK = re.compile(r"^" + JUNK_TOKEN + r"(?:[\s_\-–]+" + JUNK_TOKEN + r")*$", re.I)
DUP_RE = re.compile(r"\s*\(\s*\d+\s*\)\s*$")
YEAR_RE = re.compile(r"\(\s*((?:19|20)\d{2})\s*\)")
YEAR_TAIL_RE = re.compile(r"\b(19[5-9]\d|20[0-2]\d)\s*$")


def ffprobe(path):
    out = subprocess.run(
        [
            "ffprobe", "-v", "error", "-show_entries",
            "format=duration,bit_rate:format_tags=title,artist,album:stream=codec_type,codec_name",
            "-of", "json", path,
        ],
        capture_output=True, text=True, timeout=30,
    ).stdout
    try:
        return json.loads(out or "{}")
    except json.JSONDecodeError:
        return {}


def extract_art(path):
    """Extract embedded cover art as a compact 460px JPEG."""
    key = hashlib.md5(path.encode()).hexdigest()[:12]
    dest = os.path.join(ART_DIR, f"{key}.jpg")
    rel = os.path.relpath(dest, ROOT)
    if os.path.exists(dest) and os.path.getsize(dest) > 800:
        return rel

    scale = "scale=460:460:force_original_aspect_ratio=increase,crop=460:460"
    subprocess.run(
        ["ffmpeg", "-y", "-v", "error", "-i", path, "-map", "0:v:0", "-an",
         "-vf", scale, "-c:v", "mjpeg", "-q:v", "4", dest],
        capture_output=True,
    )
    if os.path.exists(dest) and os.path.getsize(dest) > 800:
        return rel

    # some rips declare "png" but store JPEG bytes in the attached-picture
    # stream, which only a raw copy can read — then re-encode to shrink it
    tmp = dest + ".raw"
    subprocess.run(
        ["ffmpeg", "-y", "-v", "error", "-i", path, "-map", "0:v:0", "-an", "-c:v", "copy", tmp],
        capture_output=True,
    )
    if os.path.exists(tmp) and os.path.getsize(tmp) > 800:
        subprocess.run(
            ["ffmpeg", "-y", "-v", "error", "-i", tmp, "-vf", scale,
             "-c:v", "mjpeg", "-q:v", "4", dest],
            capture_output=True,
        )
    if os.path.exists(tmp):
        os.remove(tmp)
    if os.path.exists(dest) and os.path.getsize(dest) > 800:
        return rel
    if os.path.exists(dest):
        os.remove(dest)
    return None


def strip_tail(s):
    s = PAREN_JUNK.sub("", s)
    s = URL_RE.sub("", s)
    # drop trailing " - <site/quality>" segments, repeatedly
    for _ in range(4):
        s = s.strip(" -–_")
        parts = re.split(r"\s+[-–]\s+", s)
        if len(parts) > 1 and (
            SEG_JUNK.match(parts[-1].strip())
            or re.search(r"[\s_\-](?:128|192|256|320|kbps|mp3)\s*$", parts[-1], re.I)
        ):
            s = " - ".join(parts[:-1])
        else:
            break
    s = TAIL_JUNK.sub("", s)
    s = re.sub(r"[\s(]+$", "", s)
    s = re.sub(r"\s*\(\s*\)", "", s)
    return DUP_RE.sub("", s).strip(" -–_.")


def clean_title(text):
    s = re.sub(r"\.(mp3|m4a|wav|aac|opus|flac)$", "", text or "", flags=re.I)
    s = s.replace("_", " ").replace("|", " ")
    s = re.sub(r"^\s*\d{1,2}\s*[-.)]\s*", "", s)                 # track numbers
    s = strip_tail(s)
    s = re.sub(r"\s*[-–]\s*k\.?\s*k\.?\s*(?:128|192|320)?\s*$", "", s, flags=re.I)
    s = re.sub(r"\s*[-–]\s*$", "", s)
    s = re.sub(r"\s{2,}", " ", s).strip(" -–.")
    parts = [p.strip() for p in re.split(r"\s+[-–]\s+", s) if p.strip()]
    if len(parts) >= 2 and parts[0].lower() == parts[-1].lower():
        s = parts[0]
    return s.strip()


def clean_album(text):
    a = (text or "").replace("_", " ").strip()
    a = re.sub(r"^\s*mp3\s*[-–]\s*", "", a, flags=re.I)
    a = strip_tail(a)
    a = re.sub(r"\s{2,}", " ", a).strip(" -–.")

    year = None
    m = YEAR_RE.search(a)
    if m:
        year = int(m.group(1))
        a = YEAR_RE.sub("", a).strip()
    else:
        m = YEAR_TAIL_RE.search(a)
        if m and not re.search(r"\d{3}", a[:-4]):
            year = int(m.group(1))
            a = a[: m.start()].strip(" -–.")

    low = a.lower()
    if "bollywood artist unplugged" in low:
        return "KK Unplugged", year
    junk = (
        not a
        or "best of" in low
        or "friendship day" in low
        or "unplugged - " in low
        or low.startswith("mp3")
        or low in {"kk hits", "unknown", "single", "singles", "songs"}
    )
    return ("KK Essentials" if junk else a), year


def prettify(t):
    t = re.sub(r"\s+([,.)])", r"\1", t)
    t = re.sub(r"\(\s+", "(", t)
    t = re.sub(r"\s+\)", ")", t)
    return t.strip()


def main():
    os.makedirs(ART_DIR, exist_ok=True)
    files = sorted(
        os.path.join(MUSIC_DIR, f) for f in os.listdir(MUSIC_DIR) if f.lower().endswith(".mp3")
    )
    empty = [f for f in files if os.path.getsize(f) < 1024]
    files = [f for f in files if os.path.getsize(f) >= 1024]

    def scan(path):
        rel = os.path.relpath(path, ROOT)
        meta = ffprobe(path)
        fmt = meta.get("format", {}) or {}
        tags = {k.lower(): v for k, v in (fmt.get("tags") or {}).items()}
        dur = float(fmt.get("duration") or 0)
        return {
            "rel": rel,
            "tag_title": tags.get("title", ""),
            "tag_album": tags.get("album", ""),
            "dur": round(dur) if dur > 1 else None,
            "br": int(fmt.get("bit_rate") or 0),
        }

    with ThreadPoolExecutor(8) as ex:
        rows = list(ex.map(scan, files))
    with ThreadPoolExecutor(8) as ex:
        arts = list(ex.map(lambda r: extract_art(os.path.join(ROOT, r["rel"])), rows))
    for r, art in zip(rows, arts):
        r["art"] = art

    tracks = []
    for r in rows:
        tag_title = prettify(clean_title(r["tag_title"]))
        file_title = prettify(clean_title(os.path.basename(r["rel"])))
        album, year = clean_album(r["tag_album"])
        tracks.append({
            "title": tag_title or file_title,
            "album": album,
            "year": year,
            "duration": r["dur"],
            "bitrate": round(r["br"] / 1000) if r["br"] else None,
            "path": r["rel"],
            "art": r["art"],
        })

    album_art = {}
    for t in tracks:
        if t["art"]:
            album_art.setdefault(t["album"], t["art"])
    for t in tracks:
        t["art"] = t["art"] or album_art.get(t["album"]) or FALLBACK_ART

    tracks.sort(key=lambda t: t["title"].lower())

    js = "/* Generated by build-library.py — do not edit by hand. */\n"
    js += "window.KK_LIBRARY = " + json.dumps(tracks, ensure_ascii=False, indent=2) + ";\n"
    with open(OUT, "w", encoding="utf-8") as fh:
        fh.write(js)

    # prune orphaned artwork
    used = {os.path.basename(t["art"]) for t in tracks}
    for f in os.listdir(ART_DIR):
        if f not in used:
            os.remove(os.path.join(ART_DIR, f))

    junk_re = re.compile(r"(" + DOMAINS + r"|kbps|mp3|www\.|\.com|by\.\.kk|\(\d\)$)", re.I)
    print(f"tracks        : {len(tracks)}   (skipped {len(empty)} empty file(s))")
    for e in empty:
        print("   skipped empty:", os.path.relpath(e, ROOT))
    print(f"cover art     : {sum(1 for t in tracks if t['art'] != FALLBACK_ART)}/{len(tracks)}")
    print(f"missing dur   : {[t['title'] for t in tracks if not t['duration']]}")
    suspects = [f"{t['title']}  ||  {t['album']}" for t in tracks if junk_re.search(t['title'])]
    print(f"junk songs    : {len(suspects)}")
    for s in suspects:
        print("   ", s)
    seen = {}
    for t in tracks:
        key = (re.sub(r"\W+", "", t["title"].lower()), re.sub(r"\W+", "", t["album"].lower()))
        seen.setdefault(key, []).append(t["path"])
    dupes = {k: v for k, v in seen.items() if len(v) > 1}
    print(f"duplicates    : {len(dupes)}")
    for k, v in dupes.items():
        print("   ", k[0], "<-", v)
    print(f"art files kept: {len(os.listdir(ART_DIR))}")


if __name__ == "__main__":
    main()
