#!/bin/sh
set -e

DATA_DIR="${LANGFLOW_DATA_DIR:-/data}"
PORT="${PORT:-7860}"
DB_PATH="${DATA_DIR}/langflow.db"

mkdir -p "$DATA_DIR"

exec langflow run \
  --host 0.0.0.0 \
  --port "$PORT" \
  --database-url "sqlite:///${DB_PATH}"
