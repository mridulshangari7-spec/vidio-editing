#!/usr/bin/env python3
"""Generate an animated glowing-blob background with orbiting icons and
dashed arrow paths converging on a circular webcam window, matching the
reference clip's cutaway style. Renders PNG frames to an output directory."""
import sys
import os
import math
import json
from PIL import Image, ImageDraw, ImageFilter, ImageFont

W, H = 576, 1024
FPS = 30
EMOJI_FONT = "/usr/share/fonts/truetype/noto/NotoColorEmoji.ttf"

CIRCLE_CX, CIRCLE_CY, CIRCLE_R = int(0.72 * W), int(0.47 * H), int(0.205 * W)

ICONS = [
    {"emoji": "✉️", "pos": (0.27, 0.15)},   # envelope
    {"emoji": "\U0001F4B0", "pos": (0.20, 0.42)},      # money bag
    {"emoji": "\U0001F4F1", "pos": (0.30, 0.66)},      # phone
]

def blob_layer(t, w, h):
    """Soft glowing purple->blue blob, animated wobble."""
    img = Image.new("RGB", (w, h), (6, 4, 18))
    draw = ImageDraw.Draw(img)
    blobs = [
        # (base_x, base_y, radius, color, phase)
        (0.30, 0.10, 0.55, (168, 96, 220), 0.0),
        (0.65, 0.28, 0.62, (86, 70, 220), 1.4),
        (0.55, 0.55, 0.60, (56, 60, 200), 2.6),
        (0.75, 0.55, 0.42, (40, 40, 170), 0.7),
    ]
    layer = Image.new("RGB", (w, h), (6, 4, 18))
    ld = ImageDraw.Draw(layer)
    for bx, by, br, color, phase in blobs:
        wob_x = 0.04 * math.sin(t * 0.6 + phase)
        wob_y = 0.03 * math.cos(t * 0.5 + phase * 1.3)
        cx = (bx + wob_x) * w
        cy = (by + wob_y) * h
        r = br * w
        ld.ellipse([cx - r, cy - r, cx + r, cy + r], fill=color)
    layer = layer.filter(ImageFilter.GaussianBlur(60))
    img = Image.blend(img, layer, 0.9)
    # vignette to black toward bottom for caption legibility
    grad = Image.new("L", (1, h), color=0)
    for y in range(h):
        f = y / h
        v = int(255 * max(0.0, 1.0 - max(0.0, (f - 0.55) / 0.45)))
        grad.putpixel((0, y), v)
    grad = grad.resize((w, h))
    black = Image.new("RGB", (w, h), (0, 0, 0))
    img = Image.composite(img, black, grad)
    return img

def draw_dashed_curve(draw, p0, p1, ctrl, progress, color, width=4, dash=10, gap=8):
    """Draw a dashed quadratic bezier from p0 to p1, revealing `progress` (0-1) of its length."""
    n = 60
    pts = []
    for i in range(n + 1):
        u = i / n
        x = (1 - u) ** 2 * p0[0] + 2 * (1 - u) * u * ctrl[0] + u ** 2 * p1[0]
        y = (1 - u) ** 2 * p0[1] + 2 * (1 - u) * u * ctrl[1] + u ** 2 * p1[1]
        pts.append((x, y))
    reveal_n = max(2, int(n * progress))
    pts = pts[:reveal_n + 1]
    dist = 0
    on = True
    last = pts[0]
    for pt in pts[1:]:
        seg_len = math.hypot(pt[0] - last[0], pt[1] - last[1])
        if on:
            draw.line([last, pt], fill=color, width=width)
        dist += seg_len
        if dist > (dash if on else gap):
            on = not on
            dist = 0
        last = pt
    if len(pts) >= 2 and progress > 0.05:
        ex, ey = pts[-1]
        pxp, pyp = pts[-2]
        ang = math.atan2(ey - pyp, ex - pxp)
        ah = 9
        left = (ex - ah * math.cos(ang - math.pi / 7), ey - ah * math.sin(ang - math.pi / 7))
        right = (ex - ah * math.cos(ang + math.pi / 7), ey - ah * math.sin(ang + math.pi / 7))
        draw.polygon([ (ex, ey), left, right ], fill=color)
    return pts[-1] if pts else p0

def render_frame(t, duration, caption_word=None, emoji_font_cache=None):
    img = blob_layer(t, W, H)
    draw = ImageDraw.Draw(img, "RGBA")

    reveal = min(1.0, t / 1.1)
    gold = (214, 175, 92, 255)

    for icon in ICONS:
        ix, iy = icon["pos"][0] * W, icon["pos"][1] * H
        edge_ang = math.atan2(iy - CIRCLE_CY, ix - CIRCLE_CX)
        p0 = (CIRCLE_CX + CIRCLE_R * math.cos(edge_ang), CIRCLE_CY + CIRCLE_R * math.sin(edge_ang))
        ctrl = ((p0[0] + ix) / 2 + 40 * math.sin(t * 0.4), (p0[1] + iy) / 2 - 30)
        draw_dashed_curve(draw, p0, (ix, iy), ctrl, reveal, gold, width=4, dash=12, gap=9)

    # icon badges (rounded squares) with emoji glyphs, gentle bob
    for i, icon in enumerate(ICONS):
        ix, iy = icon["pos"][0] * W, icon["pos"][1] * H
        bob = 6 * math.sin(t * 1.1 + i * 1.7)
        iy2 = iy + bob
        badge_r = 44
        badge = Image.new("RGBA", (badge_r * 2, badge_r * 2), (0, 0, 0, 0))
        bd = ImageDraw.Draw(badge)
        bd.rounded_rectangle([4, 4, badge_r * 2 - 4, badge_r * 2 - 4], radius=22,
                              fill=(245, 245, 248, 255))
        badge = badge.filter(ImageFilter.GaussianBlur(0))
        img.paste(badge, (int(ix - badge_r), int(iy2 - badge_r)), badge)
        if emoji_font_cache is not None:
            try:
                glyph = Image.new("RGBA", (136, 136), (0, 0, 0, 0))
                gd = ImageDraw.Draw(glyph)
                gd.text((68, 68), icon["emoji"], font=emoji_font_cache,
                        embedded_color=True, anchor="mm")
                glyph = glyph.resize((60, 60), Image.LANCZOS)
                img.paste(glyph, (int(ix - 30), int(iy2 - 30)), glyph)
            except Exception:
                pass

    # circular webcam window placeholder (solid fill; actual footage composited later)
    mask = Image.new("L", (CIRCLE_R * 2, CIRCLE_R * 2), 0)
    ImageDraw.Draw(mask).ellipse([0, 0, CIRCLE_R * 2 - 1, CIRCLE_R * 2 - 1], fill=255)
    ring = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    rd = ImageDraw.Draw(ring)
    rd.ellipse([CIRCLE_CX - CIRCLE_R - 4, CIRCLE_CY - CIRCLE_R - 4,
                CIRCLE_CX + CIRCLE_R + 4, CIRCLE_CY + CIRCLE_R + 4],
               outline=(214, 175, 92, 230), width=5)
    img = Image.alpha_composite(img.convert("RGBA"), ring)
    return img.convert("RGB")

def main():
    duration = float(sys.argv[1])
    out_dir = sys.argv[2]
    os.makedirs(out_dir, exist_ok=True)
    n_frames = int(round(duration * FPS))
    try:
        emoji_font = ImageFont.truetype(EMOJI_FONT, 109)
    except Exception as e:
        print("emoji font load failed:", e, file=sys.stderr)
        emoji_font = None
    for i in range(n_frames):
        t = i / FPS
        frame = render_frame(t, duration, emoji_font_cache=emoji_font)
        frame.save(os.path.join(out_dir, f"f_{i:05d}.png"))
    meta = {"circle_cx": CIRCLE_CX, "circle_cy": CIRCLE_CY, "circle_r": CIRCLE_R,
            "w": W, "h": H, "fps": FPS, "n_frames": n_frames}
    json.dump(meta, open(os.path.join(out_dir, "meta.json"), "w"), indent=2)
    print(f"rendered {n_frames} frames to {out_dir}")

if __name__ == "__main__":
    main()
