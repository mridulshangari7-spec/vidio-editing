#!/usr/bin/env python3
"""Assemble a high-energy visual pass: continuous Ken-Burns zoom drift on
every shot (never static), frequent punch cuts (max ~3.5s hold) with a
white flash-cut, alternating framing/anchor per cut, and circular cutaway
compositing over the animated backgrounds. Renders each block as its own
small ffmpeg process (low memory, resumable), concatenates via the concat
demuxer, then muxes the original audio back in.
Outputs build/visual_demo.mp4."""
import json
import math
import os
import subprocess

W, H = 576, 1024
CIRCLE_CX, CIRCLE_CY, CIRCLE_R = int(0.72 * W), int(0.47 * H), int(0.205 * W)
FACE_CROP = "crop=480:480:120:220"
SRC = "source/raw_source.mov"
BLOCK_DIR = "build/blocks"
FPS = 30
MAX_HOLD = 3.5   # seconds -- no shot holds longer than this without a cut
FLASH_DUR = 0.08

# (index range in build/segments.json) -> which cutaway bg to use
CUTAWAY_RANGES = {
    (5, 6): "build/bg1.mp4",
    (10, 11): "build/bg2.mp4",
}

ZOOM_CYCLE = [
    (1.00, 1.04, 0),
    (1.05, 1.10, -25),
    (1.10, 1.16, 25),
    (1.04, 1.09, -15),
]


def run(cmd):
    subprocess.run(["timeout", "90"] + cmd, check=True,
                    stdout=subprocess.DEVNULL, stderr=subprocess.PIPE)


def split_span(s, e, max_hold):
    dur = e - s
    n = max(1, math.ceil(dur / max_hold))
    step = dur / n
    return [(round(s + i * step, 3), round(s + (i + 1) * step, 3)) for i in range(n)]


def build_blocks_plan(segments):
    covered = set()
    for lo, hi in CUTAWAY_RANGES:
        for i in range(lo, hi + 1):
            covered.add(i)

    plan = []
    i = 0
    cycle_i = 0
    first = True
    while i < len(segments):
        matched_range = None
        for (lo, hi), bg in CUTAWAY_RANGES.items():
            if i == lo:
                matched_range = (lo, hi, bg)
                break
        if matched_range:
            lo, hi, bg = matched_range
            s = segments[lo]["start"]
            e = segments[hi]["end"]
            plan.append({"kind": "cutaway", "start": s, "end": e, "bg": bg,
                         "flash": not first})
            first = False
            i = hi + 1
            continue

        seg = segments[i]
        for s, e in split_span(seg["start"], seg["end"], MAX_HOLD):
            z0, z1, bias_x = ZOOM_CYCLE[cycle_i % len(ZOOM_CYCLE)]
            cycle_i += 1
            plan.append({"kind": "normal", "start": s, "end": e,
                         "zoom0": z0, "zoom1": z1, "bias_x": bias_x,
                         "flash": not first})
            first = False
        i += 1
    return plan


def build_normal(block, out_path):
    s, e = block["start"], block["end"]
    dur = e - s
    n_frames = max(1, round(dur * FPS))
    z0, z1, bias_x = block["zoom0"], block["zoom1"], block["bias_x"]

    zoom_expr = f"{z0}+({z1}-{z0})*on/{max(1, n_frames - 1)}"
    x_expr = f"(iw-iw/zoom)/2+{bias_x}"
    y_expr = "(ih-ih/zoom)/2"

    vf_parts = [
        f"zoompan=z='{zoom_expr}':x='{x_expr}':y='{y_expr}':d=1:s={W}x{H}:fps={FPS}"
    ]
    if block["flash"]:
        vf_parts.append(f"fade=t=in:st=0:d={FLASH_DUR}:color=white")
    vf = ",".join(vf_parts)

    cmd = [
        "ffmpeg", "-y", "-ss", f"{s}", "-t", f"{dur}", "-i", SRC,
        "-vf", vf,
        "-c:v", "libx264", "-preset", "veryfast", "-crf", "18",
        "-pix_fmt", "yuv420p", "-r", f"{FPS}", "-an", "-t", f"{dur}", out_path,
    ]
    run(cmd)


def build_cutaway(block, out_path):
    s, e, bg_path = block["start"], block["end"], block["bg"]
    dur = e - s
    mask_diam = 2 * CIRCLE_R
    filt = (
        f"[0:v]{FACE_CROP},scale={mask_diam}:{mask_diam}[face];"
        f"[2:v]format=gray[maskg];"
        f"[face][maskg]alphamerge,format=yuva420p[facea];"
        f"[1:v]trim=0:{dur},setpts=PTS-STARTPTS[bgv];"
        f"[bgv][facea]overlay=x={CIRCLE_CX-CIRCLE_R}:y={CIRCLE_CY-CIRCLE_R}[comp]"
    )
    if block["flash"]:
        filt += f";[comp]fade=t=in:st=0:d={FLASH_DUR}:color=white[vout]"
    else:
        filt += ";[comp]copy[vout]"

    cmd = [
        "ffmpeg", "-y",
        "-ss", f"{s}", "-t", f"{dur}", "-i", SRC,
        "-i", bg_path,
        "-loop", "1", "-t", f"{dur}", "-i", "build/circle_mask.png",
        "-filter_complex", filt, "-map", "[vout]",
        "-c:v", "libx264", "-preset", "veryfast", "-crf", "18",
        "-pix_fmt", "yuv420p", "-r", f"{FPS}", "-an", "-t", f"{dur}", out_path,
    ]
    run(cmd)


def main():
    segments = json.load(open("build/segments.json"))
    plan = build_blocks_plan(segments)

    os.makedirs(BLOCK_DIR, exist_ok=True)
    list_path = os.path.join(BLOCK_DIR, "list.txt")
    entries = []

    for idx, block in enumerate(plan):
        out_path = os.path.join(BLOCK_DIR, f"block_{idx:02d}.mp4")
        if os.path.exists(out_path) and os.path.getsize(out_path) > 1000:
            print(f"[{idx+1}/{len(plan)}] {block['kind']} {block['start']}-{block['end']} -- skip")
            entries.append(out_path)
            continue
        print(f"[{idx+1}/{len(plan)}] {block}")
        if block["kind"] == "normal":
            build_normal(block, out_path)
        else:
            build_cutaway(block, out_path)
        entries.append(out_path)

    with open(list_path, "w") as f:
        for p in entries:
            f.write(f"file '{os.path.abspath(p)}'\n")

    print(f"Concatenating {len(entries)} blocks...")
    vconcat = "build/vconcat.mp4"
    run([
        "ffmpeg", "-y", "-f", "concat", "-safe", "0", "-i", list_path,
        "-c", "copy", vconcat,
    ])

    print("Muxing original audio...")
    run([
        "ffmpeg", "-y", "-i", vconcat, "-i", SRC,
        "-map", "0:v", "-map", "1:a",
        "-c:v", "copy", "-c:a", "aac", "-b:a", "192k",
        "-shortest", "build/visual_demo.mp4",
    ])
    print("Done: build/visual_demo.mp4")


if __name__ == "__main__":
    main()
