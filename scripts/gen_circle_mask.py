#!/usr/bin/env python3
import sys
from PIL import Image, ImageDraw

diam = int(sys.argv[1])
out = sys.argv[2]
img = Image.new("L", (diam, diam), 0)
d = ImageDraw.Draw(img)
d.ellipse([0, 0, diam - 1, diam - 1], fill=255)
img.save(out)
print("wrote", out, img.size)
