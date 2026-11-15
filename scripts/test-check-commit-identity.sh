#!/usr/bin/env bash
# Builds throwaway git repos and checks scripts/check-commit-identity.sh against them.
# Required cases: Cursor Agent author fails, a bot commit with a Co-authored-by
# trailer fails, a clean Factory Watchdog Bot commit passes, an email added via
# COMMIT_IDENTITY_EXTRA_ALLOWLIST passes, and an empty range exits 2.
set -u -o pipefail

here=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
check="$here/check-commit-identity.sh"
tmp=$(mktemp -d)
trap 'rm -rf "$tmp"' EXIT

# Isolate from any user or system git config (signing, hooks, templates).
export GIT_CONFIG_GLOBAL=/dev/null GIT_CONFIG_NOSYSTEM=1
unset COMMIT_IDENTITY_EXTRA_ALLOWLIST

BOT_NAME='Factory Watchdog Bot'
BOT_EMAIL='factory-watchdog@users.noreply.github.com'
DEPENDABOT_EMAIL='49699333+dependabot[bot]@users.noreply.github.com'
ACTIONS_EMAIL='41898282+github-actions[bot]@users.noreply.github.com'
WEBFLOW_EMAIL='noreply@github.com'
OTHER_NAME='Someone'
OTHER_EMAIL='someone@example.com'
CURSOR_NAME='Cursor Agent'
CURSOR_EMAIL='cursoragent@cursor.com'
EXTRA_EMAIL='extra@example.com'

pass=0
fail=0
n=0

new_repo() { # new_repo <name>: repo with one allowlisted base commit
  n=$((n + 1))
  repo="$tmp/$1"
  git init -q "$repo"
  commit "$repo" "$BOT_NAME" "$BOT_EMAIL" "$BOT_NAME" "$BOT_EMAIL" 'chore: base'
}

commit() { # commit <repo> <an> <ae> <cn> <ce> <message>
  (
    cd "$1" || exit 1
    echo "$n$RANDOM$RANDOM" >> file.txt
    git add file.txt
    GIT_AUTHOR_NAME=$2 GIT_AUTHOR_EMAIL=$3 GIT_COMMITTER_NAME=$4 GIT_COMMITTER_EMAIL=$5 \
      git commit -q --no-gpg-sign --no-verify -m "$6"
  )
}

# expect <label> <want-exit> <repo> [output-must-contain...]
expect() {
  local label=$1 want=$2 repo=$3 out got
  shift 3
  out=$(cd "$repo" && "$check" HEAD~1..HEAD 2>&1)
  got=$?
  local ok=1
  [ "$got" -eq "$want" ] || ok=0
  for needle in "$@"; do
    [[ $out == *"$needle"* ]] || ok=0
  done
  # Emails are never printed, allowlisted or not.
  [[ $out == *"@"* ]] && ok=0
  if [ "$ok" -eq 1 ]; then
    pass=$((pass + 1)); echo "ok   - $label (exit $got)"
  else
    fail=$((fail + 1)); echo "FAIL - $label (exit $got, want $want)"; printf '%s\n' "$out" | sed 's/^/       /'
  fi
}

new_repo cursor-agent
commit "$repo" "$CURSOR_NAME" "$CURSOR_EMAIL" "$CURSOR_NAME" "$CURSOR_EMAIL" 'feat: x'
expect 'Cursor Agent author fails' 1 "$repo" 'author not in allowlist' 'committer not in allowlist'

new_repo trailer
commit "$repo" "$BOT_NAME" "$BOT_EMAIL" "$BOT_NAME" "$BOT_EMAIL" 'feat: x

Co-authored-by: Some Person <p@example.org>'
expect 'Co-authored-by trailer fails' 1 "$repo" 'Co-authored-by trailer'

new_repo trailer-case
commit "$repo" "$BOT_NAME" "$BOT_EMAIL" "$BOT_NAME" "$BOT_EMAIL" 'feat: x

co-authored-BY: Some Person <p@example.org>'
expect 'lowercase co-authored-by trailer fails' 1 "$repo" 'Co-authored-by trailer'

new_repo trailer-indent
commit "$repo" "$BOT_NAME" "$BOT_EMAIL" "$BOT_NAME" "$BOT_EMAIL" 'feat: x

  Co-authored-by: Some Person <p@example.org>'
expect 'indented Co-authored-by trailer fails' 1 "$repo" 'Co-authored-by trailer'

new_repo prose
commit "$repo" "$BOT_NAME" "$BOT_EMAIL" "$BOT_NAME" "$BOT_EMAIL" 'docs: mention co-authored-by in prose'
expect 'prose mention of the trailer name passes' 0 "$repo" 'passed'

new_repo other-author
commit "$repo" "$OTHER_NAME" "$OTHER_EMAIL" "$BOT_NAME" "$BOT_EMAIL" 'feat: x'
expect 'non-allowlisted author fails' 1 "$repo" 'author not in allowlist'

new_repo other-committer
commit "$repo" "$BOT_NAME" "$BOT_EMAIL" "$OTHER_NAME" "$OTHER_EMAIL" 'feat: x'
expect 'non-allowlisted committer fails' 1 "$repo" 'committer not in allowlist'

new_repo clean
commit "$repo" "$BOT_NAME" "$BOT_EMAIL" "$BOT_NAME" "$BOT_EMAIL" 'feat: x'
expect 'clean Factory Watchdog Bot commit passes' 0 "$repo" 'passed'

new_repo dependabot
commit "$repo" 'dependabot[bot]' "$DEPENDABOT_EMAIL" 'dependabot[bot]' "$DEPENDABOT_EMAIL" 'chore(deps): bump x'
expect 'dependabot-authored commit passes' 0 "$repo" 'passed'

new_repo actions
commit "$repo" 'github-actions[bot]' "$ACTIONS_EMAIL" 'github-actions[bot]' "$ACTIONS_EMAIL" 'chore: regen'
expect 'github-actions-authored commit passes' 0 "$repo" 'passed'

new_repo webflow-committer
commit "$repo" "$BOT_NAME" "$BOT_EMAIL" 'GitHub' "$WEBFLOW_EMAIL" 'feat: x'
expect 'web-flow as committer passes' 0 "$repo" 'passed'

new_repo webflow-author
commit "$repo" 'GitHub' "$WEBFLOW_EMAIL" "$BOT_NAME" "$BOT_EMAIL" 'feat: x'
expect 'web-flow as author fails' 1 "$repo" 'author not in allowlist'

new_repo extra-absent
commit "$repo" 'Extra' "$EXTRA_EMAIL" 'Extra' "$EXTRA_EMAIL" 'feat: x'
expect 'email outside the built-in allowlist fails' 1 "$repo" 'author not in allowlist'

new_repo extra-comma
commit "$repo" 'Extra' "$EXTRA_EMAIL" 'Extra' "$EXTRA_EMAIL" 'feat: x'
out=$(cd "$repo" && COMMIT_IDENTITY_EXTRA_ALLOWLIST='other@example.com, Extra@Example.com' "$check" HEAD~1..HEAD 2>&1)
got=$?
if [ "$got" -eq 0 ] && [[ $out == *"passed"* ]] && [[ $out != *"@"* ]]; then
  pass=$((pass + 1)); echo "ok   - comma-separated extra allowlist passes (exit $got)"
else
  fail=$((fail + 1)); echo "FAIL - comma-separated extra allowlist passes (exit $got)"; printf '%s\n' "$out" | sed 's/^/       /'
fi

new_repo extra-newline
commit "$repo" 'Extra' "$EXTRA_EMAIL" "$BOT_NAME" "$BOT_EMAIL" 'feat: x'
out=$(cd "$repo" && COMMIT_IDENTITY_EXTRA_ALLOWLIST="$(printf '%s\n%s' 'first@example.com' "$EXTRA_EMAIL")" "$check" HEAD~1..HEAD 2>&1)
got=$?
if [ "$got" -eq 0 ] && [[ $out == *"passed"* ]] && [[ $out != *"@"* ]]; then
  pass=$((pass + 1)); echo "ok   - newline-separated extra allowlist passes (exit $got)"
else
  fail=$((fail + 1)); echo "FAIL - newline-separated extra allowlist passes (exit $got)"; printf '%s\n' "$out" | sed 's/^/       /'
fi

# Extra emails join the author allowlist, and the committer allowlist is that
# list plus web-flow. An extra address must be able to commit, not only author.
new_repo extra-committer
commit "$repo" "$BOT_NAME" "$BOT_EMAIL" 'Extra' "$EXTRA_EMAIL" 'feat: x'
out=$(cd "$repo" && COMMIT_IDENTITY_EXTRA_ALLOWLIST="  $EXTRA_EMAIL  " "$check" HEAD~1..HEAD 2>&1)
got=$?
if [ "$got" -eq 0 ] && [[ $out == *"passed"* ]] && [[ $out != *"@"* ]]; then
  pass=$((pass + 1)); echo "ok   - extra allowlist committer passes (exit $got)"
else
  fail=$((fail + 1)); echo "FAIL - extra allowlist committer passes (exit $got)"; printf '%s\n' "$out" | sed 's/^/       /'
fi

# A trailer at the top of a very large message must still be caught. With
# `git log | grep -q` under pipefail, grep exits early, git dies of SIGPIPE and
# the trailer slips through.
new_repo long-trailer-first
awk 'BEGIN {
  print "feat: x\n\nCo-authored-by: Some Person <p@example.org>\n"
  for (i = 0; i < 6000; i++) print "filler line padding padding padding padding padding"
}' > "$tmp/long-message.txt"
(
  cd "$repo" || exit 1
  echo long >> file.txt
  git add file.txt
  GIT_AUTHOR_NAME=$BOT_NAME GIT_AUTHOR_EMAIL=$BOT_EMAIL GIT_COMMITTER_NAME=$BOT_NAME GIT_COMMITTER_EMAIL=$BOT_EMAIL \
    git commit -q --no-gpg-sign --no-verify -F "$tmp/long-message.txt"
)
size=$(git -C "$repo" log -1 --format=%B | wc -c)
if [ "$size" -ge 300000 ]; then
  pass=$((pass + 1)); echo "ok   - long-message fixture is at least 300000 bytes ($size)"
else
  fail=$((fail + 1)); echo "FAIL - long-message fixture too small ($size bytes)"
fi
expect 'trailer-first message of 300 KB or more fails' 1 "$repo" 'Co-authored-by trailer'

# An empty range fails closed.
new_repo empty-range
out=$(cd "$repo" && "$check" HEAD..HEAD 2>&1); got=$?
if [ "$got" -eq 2 ] && [[ $out == *"no commits in range"* ]] && [[ $out != *"@"* ]]; then
  pass=$((pass + 1)); echo "ok   - empty range exits 2 (fails closed)"
else
  fail=$((fail + 1)); echo "FAIL - empty range exits 2 (exit $got)"; printf '%s\n' "$out" | sed 's/^/       /'
fi

# Only the offending commit in a multi-commit range is reported.
new_repo multi
commit "$repo" "$CURSOR_NAME" "$CURSOR_EMAIL" "$CURSOR_NAME" "$CURSOR_EMAIL" 'feat: bad'
bad=$(git -C "$repo" rev-parse --short=8 HEAD)
commit "$repo" "$BOT_NAME" "$BOT_EMAIL" "$BOT_NAME" "$BOT_EMAIL" 'feat: good'
out=$(cd "$repo" && "$check" HEAD~2..HEAD 2>&1); got=$?
if [ "$got" -eq 1 ] && [[ $out == *"FAIL $bad:"* ]] && [[ $out != *"@"* ]] && [ "$(grep -c '^FAIL ' <<<"$out")" -eq 1 ]; then
  pass=$((pass + 1)); echo "ok   - only the offending commit is reported (exit $got)"
else
  fail=$((fail + 1)); echo "FAIL - only the offending commit is reported (exit $got)"; printf '%s\n' "$out" | sed 's/^/       /'
fi

# BASE HEAD args and BASE_SHA/HEAD_SHA env forms agree with the range form.
base=$(git -C "$repo" rev-parse HEAD~2); head=$(git -C "$repo" rev-parse HEAD)
(cd "$repo" && "$check" "$base" "$head" >/dev/null 2>&1); a=$?
(cd "$repo" && BASE_SHA=$base HEAD_SHA=$head "$check" >/dev/null 2>&1); b=$?
if [ "$a" -eq 1 ] && [ "$b" -eq 1 ]; then
  pass=$((pass + 1)); echo "ok   - args and env input forms work"
else
  fail=$((fail + 1)); echo "FAIL - args and env input forms work ($a, $b)"
fi

# Usage and git errors exit 2.
(cd "$repo" && "$check" >/dev/null 2>&1); a=$?
(cd "$repo" && "$check" nope..HEAD >/dev/null 2>&1); b=$?
if [ "$a" -eq 2 ] && [ "$b" -eq 2 ]; then
  pass=$((pass + 1)); echo "ok   - missing range and unknown ref exit 2"
else
  fail=$((fail + 1)); echo "FAIL - missing range and unknown ref exit 2 ($a, $b)"
fi

echo "$pass passed, $fail failed"
[ "$fail" -eq 0 ]
