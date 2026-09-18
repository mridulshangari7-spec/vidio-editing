#!/usr/bin/env python3
"""Generate an ASS subtitle file for word-by-word animated captions with
keyword highlighting (gold/yellow) matching the reference style.

Input: JSON list of segments, each: {"start": s, "end": e, "words": [
    {"word": "NOT", "start": s0, "end": e0, "highlight": false}, ...
]}
Each word is shown alone (bold, centered lower-third) for its [start,end)
window; highlighted words render in gold, others in white.
"""
import json
import sys

W, H = 576, 1024
FONT = "DejaVu Sans"
GOLD = "&H005CAFD6"   # ASS BGR: gold/yellow (B=5C,G=AF,R=D6 -> D6AF5C-ish gold)
WHITE = "&H00FFFFFF"
OUTLINE = "&H00000000"

HEADER = f"""[Script Info]
ScriptType: v4.00+
PlayResX: {W}
PlayResY: {H}
WrapStyle: 2
ScaledBorderAndShadow: yes

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Word,{FONT},64,{WHITE},{WHITE},{OUTLINE},&H00000000,1,0,0,0,100,100,0,0,1,4,0,2,40,40,260,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
"""


def fmt_time(t):
    h = int(t // 3600)
    m = int((t % 3600) // 60)
    s = t % 60
    return f"{h:d}:{m:02d}:{s:05.2f}"


def build(words, out_path):
    lines = [HEADER]
    for w in words:
        color = GOLD if w.get("highlight") else WHITE
        text = w["word"].upper()
        styled = "{\\c%s}%s{\\c%s}" % (color, text, WHITE)
        lines.append(
            f"Dialogue: 0,{fmt_time(w['start'])},{fmt_time(w['end'])},Word,,0,0,0,,{styled}"
        )
    with open(out_path, "w") as f:
        f.write("\n".join(lines) + "\n")
    print(f"wrote {len(words)} caption cues to {out_path}")


if __name__ == "__main__":
    words_json, out_path = sys.argv[1], sys.argv[2]
    words = json.load(open(words_json))
    build(words, out_path)
