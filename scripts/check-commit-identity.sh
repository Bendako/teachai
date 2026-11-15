#!/usr/bin/env bash
# Fail when a commit range contains a Co-authored-by trailer or a commit whose
# author or committer email is not on the allowlist.
#
# Data shape:
#   input   commit range BASE..HEAD (merge commits included)
#   read    author email, committer email, and the full message of each commit
#   output  one "FAIL <8-char sha>: <reasons>" line per bad commit
#   exit    0 pass, 1 at least one violation, 2 usage or git error or an empty
#           range (fails closed: a check that saw no commits proves nothing)
#
# Emails of non-allowlisted identities are never printed. File content is
# never inspected.
#
# Usage:
#   scripts/check-commit-identity.sh BASE..HEAD
#   scripts/check-commit-identity.sh BASE HEAD
#   BASE_SHA=<sha> HEAD_SHA=<sha> scripts/check-commit-identity.sh
#   COMMIT_RANGE=BASE..HEAD scripts/check-commit-identity.sh
#
# Rules, applied to every commit in the range:
#   trailer    the message has a Co-authored-by: line (case-insensitive,
#              leading whitespace allowed)
#   author     the author email is not in AUTHOR_ALLOWLIST
#   committer  the committer email is not in COMMITTER_ALLOWLIST
#
# AUTHOR_ALLOWLIST is the built-in bot addresses plus emails in the optional
# env var COMMIT_IDENTITY_EXTRA_ALLOWLIST (comma- or newline-separated,
# case-insensitive, surrounding whitespace ignored).
# COMMITTER_ALLOWLIST is AUTHOR_ALLOWLIST plus noreply@github.com (web-flow,
# which may commit but never author).
set -u -o pipefail

AUTHOR_ALLOWLIST='
factory-watchdog@users.noreply.github.com
49699333+dependabot[bot]@users.noreply.github.com
41898282+github-actions[bot]@users.noreply.github.com
'
if [ -n "${COMMIT_IDENTITY_EXTRA_ALLOWLIST:-}" ]; then
  extra=$(printf '%s' "$COMMIT_IDENTITY_EXTRA_ALLOWLIST" \
    | tr '[:upper:]' '[:lower:]' \
    | tr -d '\r' \
    | tr ',' '\n' \
    | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')
  AUTHOR_ALLOWLIST="$AUTHOR_ALLOWLIST
$extra
"
fi
# web-flow (GitHub web UI merges and edits) may commit, but never author.
COMMITTER_ALLOWLIST="$AUTHOR_ALLOWLIST
noreply@github.com
"

in_list() { # in_list <email> <newline-separated list>
  local needle line
  needle=$(printf '%s' "$1" | tr '[:upper:]' '[:lower:]')
  while IFS= read -r line; do
    [ -n "$line" ] && [ "$line" = "$needle" ] && return 0
  done <<<"$2"
  return 1
}

range=""
case $# in
  0) if [ -n "${COMMIT_RANGE:-}" ]; then range=$COMMIT_RANGE
     elif [ -n "${BASE_SHA:-}" ] && [ -n "${HEAD_SHA:-}" ]; then range="$BASE_SHA..$HEAD_SHA"
     fi ;;
  1) range=$1 ;;
  2) range="$1..$2" ;;
esac
case $range in
  *..*) ;;
  *) echo "usage: $0 BASE..HEAD | BASE HEAD | BASE_SHA/HEAD_SHA env | COMMIT_RANGE env" >&2; exit 2 ;;
esac

if ! shas=$(git rev-list --reverse "$range" --); then
  echo "error: cannot list commits for range '$range'" >&2
  exit 2
fi

if [ -z "$shas" ]; then
  echo "error: no commits in range '$range'; refusing to pass an empty check" >&2
  exit 2
fi

total=0
failed=0
for sha in $shas; do
  total=$((total + 1))
  short=$(git rev-parse --short=8 "$sha")
  author=$(git log -1 --format=%ae "$sha")
  committer=$(git log -1 --format=%ce "$sha")
  broken=""
  # Capture the message first: piping git into `grep -q` under pipefail lets
  # grep exit early, git get SIGPIPE, and a long message slip through.
  message=$(git log -1 --format=%B "$sha")
  # `grep -c` reads all input, so there is no early exit and no SIGPIPE.
  trailers=$(grep -ciE '^[[:space:]]*co-authored-by:' <<<"$message" || true)
  if [ "$trailers" -gt 0 ]; then
    broken="$broken  Co-authored-by trailer"
  fi
  in_list "$author" "$AUTHOR_ALLOWLIST" || broken="$broken  author not in allowlist"
  in_list "$committer" "$COMMITTER_ALLOWLIST" || broken="$broken  committer not in allowlist"
  if [ -n "$broken" ]; then
    failed=$((failed + 1))
    echo "FAIL $short:$broken"
  fi
done

if [ "$failed" -gt 0 ]; then
  echo "commit identity check failed: $failed of $total commit(s) in $range"
  exit 1
fi
echo "commit identity check passed: $total commit(s) in $range"
