#!/usr/bin/env bash
set -euo pipefail

if [[ $# -ne 1 || -z "$1" ]]; then
  echo "Usage: deployment-smoke.sh <GitHub Pages base URL>" >&2
  exit 2
fi

base="${1%/}/"
tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT

fetch() {
  local path="$1"
  local output="${path//\//_}"
  if [[ -z "$output" ]]; then output="index.html"; fi
  curl --fail --silent --show-error --location \
    --retry 10 --retry-all-errors --retry-delay 5 \
    "${base}${path}" -o "$tmp/$output"
}

fetch ""
fetch "styles.css"
fetch "presentation.js"
fetch "app.js"
fetch "presentation/theme-profile.json"
fetch "examples/qc1-demo.json"
fetch "tests/browser-smoke.html"

grep -q 'href="styles.css"' "$tmp/index.html"
grep -q 'src="presentation.js"' "$tmp/"
grep -q 'src="app.js"' "$tmp/"
grep -q 'QC1 Connected Instrument Pilot' "$tmp/app.js"
grep -q 'pitch-source-of-truth.json' "$tmp/examples_qc1-demo.json"
grep -q 'Run smoke tests' "$tmp/tests_browser-smoke.html"

echo "GitHub Pages deployment smoke test passed: application shell, assets, QC1 example, and browser regression harness are reachable."
