#!/bin/bash
TOKEN="${GITHUB_PAT}"
if [ -z "$TOKEN" ]; then
  echo "ERROR: GITHUB_PAT not set"
  exit 1
fi
REMOTE="https://rayanahmad96200-dot:${TOKEN}@github.com/rayanahmad96200-dot/desicart.git"
git -c user.email="rayanahmad96200@github.com" -c user.name="rayanahmad96200-dot" push "$REMOTE" main --force
echo "EXIT: $?"
