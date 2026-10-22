#!/usr/bin/env bash
set -euo pipefail

if [[ -z "${EVIDENCE_DIR:-}" ]]; then
  echo "Set EVIDENCE_DIR before cleanup." >&2
  exit 1
fi

pid_file="$EVIDENCE_DIR/server.pid"
if [[ ! -f "$pid_file" ]]; then
  echo "No server.pid at $pid_file. Nothing from this run to stop." >&2
  exit 1
fi

pid="$(cat "$pid_file")"
if kill -0 "$pid" 2>/dev/null; then
  kill -TERM -"$pid" 2>/dev/null || kill -TERM "$pid" 2>/dev/null || true
  for _ in $(seq 1 15); do
    if ! kill -0 "$pid" 2>/dev/null; then
      break
    fi
    sleep 1
  done
  if kill -0 "$pid" 2>/dev/null; then
    kill -KILL -"$pid" 2>/dev/null || kill -KILL "$pid" 2>/dev/null || true
  fi
fi

if kill -0 "$pid" 2>/dev/null; then
  echo "Failed to stop pid $pid." >&2
  exit 1
fi

echo "Stopped pid $pid. Evidence kept at $EVIDENCE_DIR"
