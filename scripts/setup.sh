#!/bin/sh
set -eu

ROOT=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)

if [ ! -f "$ROOT/components/co-reading-mcp/src/server.js" ] || [ ! -f "$ROOT/components/film-matinee/requirements.txt" ]; then
  echo "Missing components. Clone with: git clone --recurse-submodules https://github.com/idleprocesscc/shared-margin.git"
  exit 1
fi

python3 -m venv "$ROOT/.venv"
"$ROOT/.venv/bin/python3" -m pip install --upgrade pip
"$ROOT/.venv/bin/python3" -m pip install -r "$ROOT/components/film-matinee/requirements.txt"

echo "Shared Margin components are ready."
echo "Run 'npm run smoke' to verify the unified trail, then install the plugin in Codex."

