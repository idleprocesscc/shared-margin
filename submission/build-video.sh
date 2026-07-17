#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SUBMISSION="$ROOT/submission"
ASSETS="$SUBMISSION/assets"
OUTPUT="$SUBMISSION/output"

mkdir -p "$ASSETS" "$OUTPUT" "$OUTPUT/clips"
node "$SUBMISSION/render-slides.mjs"

for svg in "$ASSETS"/slide-*.svg; do
  sips -s format png "$svg" --out "${svg%.svg}.png" >/dev/null
done
sips -s format png "$ASSETS/thumbnail.svg" --out "$OUTPUT/shared-margin-thumbnail.png" >/dev/null

say -v Samantha -r 172 -f "$SUBMISSION/voiceover.txt" -o "$OUTPUT/voiceover.aiff"

AUDIO_DURATION="$(ffprobe -v error -show_entries format=duration -of default=nw=1:nk=1 "$OUTPUT/voiceover.aiff")"
VIDEO_DURATION="$(awk -v d="$AUDIO_DURATION" 'BEGIN { printf "%.3f", d + 0.8 }')"

inputs=(
  "$ASSETS/slide-01-cover.png"
  "$ASSETS/slide-02-problem.png"
  "$ASSETS/slide-03-foundations.png"
  "$ASSETS/slide-04-extension.png"
  "$ASSETS/viewer-top.png"
  "$ASSETS/viewer-cards.png"
  "$ASSETS/slide-05-tools.png"
  "$ASSETS/slide-06-signal.png"
  "$ASSETS/slide-07-close.png"
)
weights=(10 13 13 15 14 17 13 13 9)
weight_total=117

: > "$OUTPUT/concat.txt"
for index in "${!inputs[@]}"; do
  duration="$(awk -v d="$VIDEO_DURATION" -v w="${weights[$index]}" -v total="$weight_total" 'BEGIN { printf "%.3f", d * w / total }')"
  clip="$OUTPUT/clips/$(printf '%02d' "$index").mp4"
  if [[ "${inputs[$index]}" == *viewer-*.png ]]; then
    vf="crop=768:432:0:0,scale=1280:720:flags=lanczos,format=yuv420p"
  else
    vf="scale=1280:720:flags=lanczos,format=yuv420p"
  fi
  ffmpeg -hide_banner -loglevel error -y -loop 1 -framerate 30 -t "$duration" -i "${inputs[$index]}" \
    -vf "$vf" -an -c:v libx264 -preset medium -crf 18 -pix_fmt yuv420p "$clip"
  printf "file '%s'\n" "$clip" >> "$OUTPUT/concat.txt"
done

ffmpeg -hide_banner -loglevel error -y -f concat -safe 0 -i "$OUTPUT/concat.txt" \
  -i "$OUTPUT/voiceover.aiff" -c:v copy -c:a aac -b:a 192k -shortest -movflags +faststart \
  "$OUTPUT/shared-margin-build-week.mp4"

ffprobe -v error -show_entries format=duration,size -of default=nw=1 "$OUTPUT/shared-margin-build-week.mp4"
echo "Video: $OUTPUT/shared-margin-build-week.mp4"
echo "Thumbnail: $OUTPUT/shared-margin-thumbnail.png"
