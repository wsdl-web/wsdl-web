#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

docker run --rm -p 8000:8000 -v "$PWD":/docs squidfunk/mkdocs-material:9 serve -a 0.0.0.0:8000
