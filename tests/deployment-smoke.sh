#!/usr/bin/env bash
set -euo pipefail

if [[ $# -ne 1 || -z "$1" ]]; then
  echo "Usage: deployment-smoke.sh <GitHub Pages base URL | assembled site directory>" >&2
  exit 2
fi

site_dir=""
if [[ -d "$1" ]]; then
  site_dir="$(cd "$1" && pwd)"
  base=""
elif [[ "$1" == http://* || "$1" == https://* ]]; then
  base="${1%/}/"
else
  echo "Expected an HTTP(S) URL or an assembled site directory." >&2
  exit 2
fi

tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT

fetch() {
  local path="$1"
  local source_path="$path"
  local output="${path//\//_}"
  if [[ -z "$output" ]]; then
    output="index.html"
    source_path="index.html"
  fi
  if [[ -n "$site_dir" ]]; then
    if [[ ! -f "$site_dir/$source_path" ]]; then
      echo "Missing assembled site file: $source_path" >&2
      exit 1
    fi
    cp "$site_dir/$source_path" "$tmp/$output"
  else
    curl --fail --silent --show-error --location \
      --retry 10 --retry-all-errors --retry-delay 5 \
      "${base}${path}" -o "$tmp/$output"
  fi
}

fetch ""
fetch "styles.css"
fetch "presentation.js"
fetch "app.js"
fetch "presentation/theme-profile.json"
fetch "examples/qc1-demo.json"
fetch "tests/browser-smoke.html"

grep -q 'href="styles.css"' "$tmp/index.html"
grep -q 'src="presentation.js"' "$tmp/index.html"
grep -q 'src="app.js"' "$tmp/index.html"
grep -q 'QC1 Connected Instrument Pilot' "$tmp/app.js"
grep -q '"working_title": "QC1 Connected Instrument Pilot"' "$tmp/examples_qc1-demo.json"
grep -q 'Run smoke tests' "$tmp/tests_browser-smoke.html"

echo "Deployment smoke test passed: application shell, assets, QC1 example, and browser regression harness are present."
