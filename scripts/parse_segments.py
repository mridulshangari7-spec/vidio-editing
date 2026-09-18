#!/usr/bin/env python3
"""Parse ffmpeg silencedetect log into speech segments."""
import re
import json
import sys

def parse(log_path, total_duration, pad=0.06):
    """Return CONTIGUOUS segments spanning [0, total_duration] with no gaps.
    Cut points are placed at the midpoint of each detected silence, so every
    segment boundary lands during a natural pause (safe place to cut/punch)
    while the full timeline (speech + pauses) stays covered for A/V sync."""
    text = open(log_path).read()
    starts = [float(x) for x in re.findall(r"silence_start:\s*([\d.]+)", text)]
    ends = [float(x) for x in re.findall(r"silence_end:\s*([\d.]+)", text)]
    silences = list(zip(starts, ends))

    cut_points = [0.0]
    for s, e in silences:
        mid = (s + e) / 2.0
        if mid - cut_points[-1] > 0.5:
            cut_points.append(mid)
    cut_points.append(total_duration)

    segs = []
    for i in range(len(cut_points) - 1):
        s, e = cut_points[i], cut_points[i + 1]
        if e - s > 0.05:
            segs.append((s, e))
    return segs

if __name__ == "__main__":
    log_path, total_duration, out_path = sys.argv[1], float(sys.argv[2]), sys.argv[3]
    segs = parse(log_path, total_duration)
    out = [{"start": round(s, 3), "end": round(e, 3), "dur": round(e - s, 3)} for s, e in segs]
    json.dump(out, open(out_path, "w"), indent=2)
    print(f"{len(out)} speech segments written to {out_path}")
    for i, seg in enumerate(out):
        print(i, seg)
