#!/usr/bin/env python3
"""Expand per-segment script lines into word-level timing, evenly spaced
within each segment's [start,end] window (proportional to word length).
NOTE: this is used for an AUTHORED placeholder script, not a real
transcription -- swap the real transcript's words/timings in for final use."""
import json
import re
import sys

lines_path, segments_path, out_path = sys.argv[1], sys.argv[2], sys.argv[3]
lines = json.load(open(lines_path))
segments = json.load(open(segments_path))

words_out = []
for line in lines:
    seg = segments[line["seg"]]
    s, e = seg["start"], seg["end"]
    dur = e - s
    tokens = re.findall(r"[A-Za-z']+", line["text"])
    highlight_set = {h.lower() for h in line.get("highlight", [])}
    weights = [len(t) + 1 for t in tokens]
    total_w = sum(weights)
    cursor = s
    for tok, w in zip(tokens, weights):
        wdur = dur * (w / total_w)
        words_out.append({
            "word": tok,
            "start": round(cursor, 3),
            "end": round(cursor + wdur, 3),
            "highlight": tok.lower() in highlight_set,
        })
        cursor += wdur

json.dump(words_out, open(out_path, "w"), indent=2)
print(f"wrote {len(words_out)} words to {out_path}")
