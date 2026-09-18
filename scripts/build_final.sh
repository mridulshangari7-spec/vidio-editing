#!/usr/bin/env bash
# Full pipeline: silence-based segmentation -> cutaway backgrounds ->
# punch-in/cutaway visual assembly -> caption burn-in.
# Requires build/words.json (real word-level transcript timing) to have
# been produced first -- see scripts/build_captions.py.
set -euo pipefail
cd "$(dirname "$0")/.."

ffmpeg -y -i source/raw_source.mov -vn -acodec pcm_s16le -ar 16000 -ac 1 build/audio.wav
ffmpeg -i source/raw_source.mov -af silencedetect=noise=-30dB:d=0.3 -f null - 2> build/silence_raw.log
python3 scripts/parse_segments.py build/silence_raw.log 60.173622 build/segments.json

rm -rf build/bg1 build/bg2
python3 scripts/gen_cutaway_bg.py 8.048 build/bg1 &
python3 scripts/gen_cutaway_bg.py 7.364 build/bg2 &
wait
ffmpeg -y -framerate 30 -i build/bg1/f_%05d.png -c:v libx264 -pix_fmt yuv420p -crf 18 build/bg1.mp4
ffmpeg -y -framerate 30 -i build/bg2/f_%05d.png -c:v libx264 -pix_fmt yuv420p -crf 18 build/bg2.mp4

python3 scripts/build_visual.py

WORDS_JSON="${1:-build/words.json}"
CAPTIONS_ASS="build/captions.ass"
python3 scripts/build_captions.py "$WORDS_JSON" "$CAPTIONS_ASS"

mkdir -p output
ffmpeg -y -i build/visual_demo.mp4 -vf "ass=$CAPTIONS_ASS" \
  -c:v libx264 -preset medium -crf 18 -c:a copy output/final.mp4

echo "Done: output/final.mp4"
