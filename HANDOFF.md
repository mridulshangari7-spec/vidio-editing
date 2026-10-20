# Infinity Technologies – project handoff

Everything built so far for Infinity Technologies (NFC cards, websites, automation) and its
client Elgin Hospitality. Read this first when continuing the work in a new session.

## Business details
- **Infinity Technologies**, 1313, B-Block, New Amritsar, GT Road, Amritsar, Punjab 143001
- GSTIN 03AXZPS4704K1ZV · phone/WhatsApp for renewals +91 98158 03736
- Website contact numbers: 79864 04564 (WhatsApp), 98771 68353, 98782 25225, 93243 87537
- Email searchinfinity@gmail.com
- Never put personal names on the website (no "Mridul", "Divyam").

## Repositories
| Repo | What it is |
|---|---|
| `mridulshangari7-spec/vidio-editing` (branch `claude/adoring-wozniak-lqktsj`) | Source of everything below |
| `growwithinfinity/growwithinfinity.github.io` (branch `main`) | The live site, https://growwithinfinity.github.io. Deploy = copy built files here and push. |

### Layout of `vidio-editing`
- `site/index.html` + `build.py` – NFC review card scroll page → `web/nfc-review-cards.html`
- `web/src/*.html` + `web/build_pages.py` – home + service pages (websites, automation, digital menu,
  social tags, UPI QR, AI receipts, NFC automation, all-in-one NFC) → `web/*.html`
- `web/assets/engine.js`, `site.css` – shared scroll-animation engine for service pages
- `web/r/index.html` – **NFC subscription redirect** (see below)
- `web/elgin/` – Elgin Instagram link page (live at /elgin/)
- `web/governor-house/` – Governor House walkthrough demo (live at /governor-house/)
- `nfc-cards/elgin/` – Elgin NFC card print PDF + source (`source/card.html`, `render.js`)
- `nfc-cards/Infinity-Cards-Template.csv` – sheet template
- `letterhead/` – Infinity Technologies letterhead (.docx/.pdf)

Deploy example: `cp -r web/elgin/* ../growwithinfinity.github.io/elgin/` then commit + push `main`.

## NFC subscription system (`web/r/index.html`)
- Every card/QR points to `https://growwithinfinity.github.io/r/?id=CODE`.
- The page reads the Google Sheet "Infinity NFC Cards"
  (ID `187FXpdjYSo07KQHyHzlV_dDx0vn3CSeSftE1duSZDQ0`, first tab, columns
  `id | client | link | paid_until | status | notes`).
- Opens `link` if status isn't STOP/PAUSED and today ≤ paid_until (empty = no expiry);
  otherwise a "card is paused" page with a WhatsApp renew button.
- `LOCAL` fallback in the file is used only when the sheet has no row or can't be reached.
  `ELGIN` is there → /elgin/. A sheet row always wins (add `ELGIN … STOP` to pause Elgin).
- Lock NFC tags after writing.

## Elgin (client: Elgin Hospitality, Amritsar)
- **Link page** `/elgin/`: Governor House look (dark wood, gold, Cinzel Decorative + DM Sans),
  background slideshow of 3 HD photos (`h1` bar, `h2` assembly hall, `h3` candles).
  Order: Elgin Hospitality website, The Governor House (@thegovernorhouse.elgin), Elgin Café
  (@elgin_cafe), Lord Elgin Bar (@lordelginbar), Grain by Elgin (@grainbyelgin), Grab and Go
  (@grabandgo_grain), Pappadh by Elgin Amritsar (@pappadhbyelgin), Elgin Hall (@elgin_hall),
  Grain & Pour Mohali (@grainandpour). Ludhiana Pappadh was removed on request.
- **NFC card** `nfc-cards/elgin/Elgin_NFC_Card_PRINT.pdf`: 3.5×2 in + 1/8 in bleed. Front = bar
  photo + ELGIN; back = QR (`/r/?id=ELGIN`) + venue list + Powered by Infinity. Rebuild with
  `node render.js` in `source/` (needs Playwright).

## Governor House demo website (current task)
Pitch demo for Elgin: an animated **walkthrough** – enter at the entrance, then the bar, the
rooms, each with its name/description over the scene; it should feel like real architecture.

Current state (`web/governor-house/index.html`): scroll-driven, WebGL with AI depth maps
(`img/*-d.webp`, MiDaS small) for parallax, arch-doorway transitions, room rail, Reserve end
screen, `noindex`, "Concept walkthrough by Infinity Technologies".
Rooms (from elginhospitality.com/governor-house.html): Drawing Room, Reading Room, Assembly Hall,
Council Chamber, Governors Parlour, Archive Room; plus the bar and candlelit events.
Facts: 1863 colonial circuit house, restored over two years (Renesa Architecture), Modern Indian,
4.5★ Google (215 reviews), ₹2,000+.

**Status (rebuilt from the original photos)**
- Originals (unchanged) are in `web/governor-house/originals/`. Note they are only 800x1100 (landscape 1220x900,
  candles 1200x1500), so they are small; any zoom will look soft. Ask for the photographer's full-size files for a
  crisper result and re-run the same pipeline.
- `img/*.webp` = originals upscaled 2x (Lanczos + light sharpen); `img/*-d.webp` = Depth Anything small depth maps.
  Portrait (`-p`) and landscape (`-l`) variants are picked by screen orientation. Pipeline: sharp + @huggingface/transformers
  (`Xenova/depth-anything-small-hf`) in node.
- Scene order: threshold (candle arch, title), Bar, Drawing Room (drawing.jpg), Reading Room, Assembly Hall,
  Council Chamber (council.jpg), Governors Parlour (parlour.jpg), Archive Room, private dining table + Reserve.
- Walking feel: depth-parallax dolly at steady speed, footstep bob/sway only while scrolling, radial motion blur and
  light dip through each arch doorway. No video exists; a steady phone walk-through video scrubbed by scroll would be
  the next upgrade.
- Tested at laptop (1024x640 emulation) and phone (375x812). Deployed to growwithinfinity.github.io/governor-house/
  (index.html + img/ only; originals/ stays in this repo).
## Pending / later
- Main website contact details may need updating to the Amritsar address / 98158 03736
  (owner said "later").
- Live test of the `/r/` redirect with the sheet (INF001 active, INF002 expired, INF003 STOP).
