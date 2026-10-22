#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../../.." && pwd)"
cd "$ROOT"

if [[ -z "${EVIDENCE_DIR:-}" ]]; then
  echo "Set EVIDENCE_DIR before doctor." >&2
  exit 1
fi

pid="$(cat "$EVIDENCE_DIR/server.pid")"
if ! kill -0 "$pid" 2>/dev/null; then
  echo "Recorded server pid $pid is not running." >&2
  exit 1
fi

node --input-type=module -e '
import fs from "node:fs";

const rootPid = Number(process.argv[1]);
const portHex = (3000).toString(16).toUpperCase().padStart(4, "0");

function listenInodes() {
  const inodes = new Set();
  for (const file of ["/proc/net/tcp", "/proc/net/tcp6"]) {
    if (!fs.existsSync(file)) continue;
    for (const line of fs.readFileSync(file, "utf8").trim().split("\n").slice(1)) {
      const parts = line.trim().split(/\s+/);
      const localPort = parts[1].split(":").pop().toUpperCase();
      const state = parts[3];
      if (state === "0A" && localPort === portHex) inodes.add(parts[9]);
    }
  }
  return inodes;
}

function ancestorPids(start) {
  const seen = [];
  let current = start;
  while (current > 1) {
    seen.push(current);
    const stat = fs.readFileSync(`/proc/${current}/stat`, "utf8");
    const fields = stat.slice(stat.lastIndexOf(")") + 2).split(" ");
    current = Number(fields[1]);
  }
  return seen;
}

const inodes = listenInodes();
if (inodes.size === 0) {
  console.error("Nothing is listening on TCP 3000.");
  process.exit(1);
}

const listeners = [];
for (const entry of fs.readdirSync("/proc")) {
  if (!/^\d+$/.test(entry)) continue;
  let fds;
  try {
    fds = fs.readdirSync(`/proc/${entry}/fd`);
  } catch {
    continue;
  }
  for (const fd of fds) {
    try {
      const target = fs.readlinkSync(`/proc/${entry}/fd/${fd}`);
      const match = /^socket:\[(\d+)\]$/.exec(target);
      if (match && inodes.has(match[1])) listeners.push(Number(entry));
    } catch {
      // fd may vanish while scanning
    }
  }
}

const owned = listeners.some((listener) => ancestorPids(listener).includes(rootPid));
if (!owned) {
  console.error(`Port 3000 listeners ${listeners.join(",") || "(unknown)"} are not children of ${rootPid}.`);
  process.exit(1);
}
console.log(`port 3000 owned by pid tree ${rootPid}; listeners ${[...new Set(listeners)].join(",")}`);
' "$pid"

status="$(curl -sS -o "$EVIDENCE_DIR/doctor.body" -w "%{http_code}" "http://127.0.0.1:3000/")"
if [[ "$status" != "200" ]]; then
  echo "Expected HTTP 200 from /, got $status." >&2
  exit 1
fi
if ! grep -q "<title>teachai</title>" "$EVIDENCE_DIR/doctor.body"; then
  echo "Response was not the TeachAI document." >&2
  exit 1
fi

# The home page renders a spinner until it mounts in the browser. Usable means
# the hydrated hero heading is visible, which the initial HTML does not contain.
if ! node --input-type=module -e '
import { chromium } from "@playwright/test";
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
try {
  const response = await page.goto("http://127.0.0.1:3000/", { waitUntil: "domcontentloaded", timeout: 15000 });
  if (response?.status() !== 200) {
    console.error(`status ${response?.status()}`);
    process.exit(1);
  }
  await page.getByRole("heading", { name: "Transform Your English Teaching with AI" }).waitFor({ timeout: 15000 });
  console.log("hydrated hero heading visible");
} catch (error) {
  console.error(error);
  process.exit(1);
} finally {
  await browser.close();
}
'; then
  echo "Hydrated landing page is not usable." >&2
  exit 1
fi

node --input-type=module -e '
import fs from "node:fs";
const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"));
const installed = JSON.parse(fs.readFileSync("node_modules/next/package.json", "utf8"));
if (pkg.dependencies.next !== installed.version) {
  console.error(`package.json next ${pkg.dependencies.next} != installed ${installed.version}`);
  process.exit(1);
}
console.log(`next ${installed.version} matches package.json`);
'

echo "doctor ok pid=$pid url=http://127.0.0.1:3000"
