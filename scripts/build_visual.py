#!/usr/bin/env python3
"""Assemble punch-in zoom cuts + circular cutaway compositing (no captions yet).
Renders each timeline block as its own small ffmpeg process (low memory,
resumable), concatenates them via the concat demuxer, then muxes the
original audio back in. Outputs build/visual_demo.mp4."""
import os
import subprocess

W, H = 576, 1024
CIRCLE_CX, CIRCLE_CY, CIRCLE_R = int(0.72 * W), int(0.47 * H), int(0.205 * W)
FACE_CROP = "crop=480:480:120:220"
SRC = "source/raw_source.mov"
BLOCK_DIR = "build/blocks"

BLOCKS = [
    ("normal", 0.0, 2.849, 1.0),
    ("normal", 2.849, 7.436, 1.08),
    ("normal", 7.436, 11.745, 1.15),
    ("normal", 11.745, 16.071, 1.08),
    ("normal", 16.071, 20.373, 1.0),
    ("cutaway", 20.373, 28.421, "build/bg1.mp4"),
    ("normal", 28.421, 36.364, 1.08),
    ("normal", 36.364, 38.889, 1.15),
    ("normal", 38.889, 40.901, 1.08),
    ("cutaway", 40.901, 48.265, "build/bg2.mp4"),
    ("normal", 48.265, 50.893, 1.0),
    ("normal", 50.893, 54.222, 1.08),
    ("normal", 54.222, 58.287, 1.15),
    ("normal", 58.287, 60.174, 1.08),
]

BLUR_FLASH = 0.12


def run(cmd):
    subprocess.run(cmd, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.PIPE)


def build_normal(idx, s, e, zoom, out_path, punch):
    dur = e - s
    if abs(zoom - 1.0) < 1e-6:
        vf = f"scale={W}:{H}"
    else:
        zw, zh = int(round(W * zoom)), int(round(H * zoom))
        vf = f"scale={zw}:{zh},crop={W}:{H}:({zw}-{W})/2:({zh}-{H})/2"

    if punch:
        filt = (
            f"[0:v]{vf}[z];"
            f"[z]split=2[za][zb];"
            f"[za]trim=0:{BLUR_FLASH},setpts=PTS-STARTPTS,boxblur=5:1[blur];"
            f"[zb]trim=start={BLUR_FLASH},setpts=PTS-STARTPTS[sharp];"
            f"[blur][sharp]concat=n=2:v=1:a=0[vout]"
        )
    else:
        filt = f"[0:v]{vf}[vout]"

    cmd = [
        "ffmpeg", "-y", "-ss", f"{s}", "-t", f"{dur}", "-i", SRC,
        "-filter_complex", filt, "-map", "[vout]",
        "-c:v", "libx264", "-preset", "veryfast", "-crf", "18",
        "-pix_fmt", "yuv420p", "-r", "30", "-an", out_path,
    ]
    run(cmd)


def build_cutaway(idx, s, e, bg_path, out_path):
    dur = e - s
    mask_diam = 2 * CIRCLE_R
    filt = (
        f"[0:v]{FACE_CROP},scale={mask_diam}:{mask_diam}[face];"
        f"[2:v]format=gray[maskg];"
        f"[face][maskg]alphamerge,format=yuva420p[facea];"
        f"[1:v]trim=0:{dur},setpts=PTS-STARTPTS[bgv];"
        f"[bgv][facea]overlay=x={CIRCLE_CX-CIRCLE_R}:y={CIRCLE_CY-CIRCLE_R}[vout]"
    )
    cmd = [
        "ffmpeg", "-y",
        "-ss", f"{s}", "-t", f"{dur}", "-i", SRC,
        "-i", bg_path,
        "-loop", "1", "-i", "build/circle_mask.png",
        "-filter_complex", filt, "-map", "[vout]",
        "-c:v", "libx264", "-preset", "veryfast", "-crf", "18",
        "-pix_fmt", "yuv420p", "-r", "30", "-an", out_path,
    ]
    run(cmd)


def main():
    os.makedirs(BLOCK_DIR, exist_ok=True)
    list_path = os.path.join(BLOCK_DIR, "list.txt")
    entries = []

    for idx, block in enumerate(BLOCKS):
        out_path = os.path.join(BLOCK_DIR, f"block_{idx:02d}.mp4")
        kind = block[0]
        print(f"[{idx+1}/{len(BLOCKS)}] {block}")
        if kind == "normal":
            _, s, e, zoom = block
            build_normal(idx, s, e, zoom, out_path, punch=(idx != 0))
        else:
            _, s, e, bg_path = block
            build_cutaway(idx, s, e, bg_path, out_path)
        entries.append(out_path)

    with open(list_path, "w") as f:
        for p in entries:
            f.write(f"file '{os.path.abspath(p)}'\n")

    print("Concatenating blocks...")
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
