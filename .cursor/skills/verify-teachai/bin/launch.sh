#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../../.." && pwd)"
cd "$ROOT"

if [[ -z "${EVIDENCE_DIR:-}" || -z "${RUN_ID:-}" ]]; then
  echo "Set RUN_ID and EVIDENCE_DIR before launch." >&2
  exit 1
fi

mkdir -p "$EVIDENCE_DIR"

if node --input-type=module -e 'import net from "node:net"; const socket = net.connect(3000, "127.0.0.1", () => { socket.end(); process.exit(0); }); socket.on("error", () => process.exit(1));'; then
  echo "TCP 3000 is already open. Refusing to start another TeachAI server." >&2
  exit 1
fi

export NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
export CLERK_SECRET_KEY=
export NEXT_PUBLIC_CONVEX_URL=
export CONVEX_DEPLOYMENT=

echo "Building secret-free production bundle into $EVIDENCE_DIR/build.log"
npm run build >"$EVIDENCE_DIR/build.log" 2>&1

node --input-type=module -e '
import fs from "node:fs";
import { spawn } from "node:child_process";

const log = fs.openSync(`${process.env.EVIDENCE_DIR}/server.log`, "a");
const child = spawn(
  "npm",
  ["run", "start", "--", "--hostname", "127.0.0.1", "--port", "3000"],
  { detached: true, stdio: ["ignore", log, log], env: process.env },
);
child.unref();
fs.writeFileSync(`${process.env.EVIDENCE_DIR}/server.pid`, String(child.pid));
console.log(child.pid);
'

pid="$(cat "$EVIDENCE_DIR/server.pid")"
stop_server() {
  if [[ -n "${pid:-}" ]] && kill -0 "$pid" 2>/dev/null; then
    kill -TERM -"$pid" 2>/dev/null || kill -TERM "$pid" 2>/dev/null || true
  fi
}

for _ in $(seq 1 60); do
  if curl -fsS -o /dev/null "http://127.0.0.1:3000/" 2>/dev/null; then
    break
  fi
  if ! kill -0 "$pid" 2>/dev/null; then
    echo "Server exited before it accepted HTTP. See $EVIDENCE_DIR/server.log" >&2
    cat "$EVIDENCE_DIR/server.log" >&2
    exit 1
  fi
  sleep 0.5
done

if ! node --input-type=module -e '
import { chromium } from "@playwright/test";
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
try {
  const response = await page.goto("http://127.0.0.1:3000/", { waitUntil: "domcontentloaded", timeout: 15000 });
  if (response?.status() !== 200) process.exit(1);
  await page.getByRole("heading", { name: "Transform Your English Teaching with AI" }).waitFor({ timeout: 15000 });
} catch (error) {
  console.error(error);
  process.exit(1);
} finally {
  await browser.close();
}
'; then
  echo "Server answered HTTP but the hydrated hero heading never appeared. See $EVIDENCE_DIR/server.log" >&2
  stop_server
  exit 1
fi

echo "ready http://127.0.0.1:3000 pid=$pid run=$RUN_ID"
