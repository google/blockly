#!/bin/bash
#
# Script to run the Compiler's Linter on only the modified or added files in the
# current branch. Should be run from the base git directory with the PR branch
# checked out.

CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
CHANGED_FILES=$(git diff --name-only --diff-filter=AM master..$CURRENT_BRANCH |
    grep -E "\.js$" |
    grep -v -E "test\.js$" |
    grep -v -f scripts/ci/lint_ignore.txt)

if [[ -n "$CHANGED_FILES" ]]; then
  set -x
  java -jar ../closure-compiler/build/linter.jar $CHANGED_FILES
else
  echo "No .js files found to lint in this Pull Request."
fi
