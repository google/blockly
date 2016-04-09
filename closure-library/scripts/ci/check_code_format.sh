#!/bin/bash
#
# Script to determine if .js files in Pull Request are properly formatted.
# Exits with non 0 exit code if formatting is needed.

FILES_TO_CHECK=$(git diff --name-only HEAD^ | grep -E "\.js$")

if [ -z "${FILES_TO_CHECK}" ]; then
  echo "No .js files to check for formatting."
  exit 0
fi

FORMAT_DIFF=$(git diff -U0 HEAD^ -- ${FILES_TO_CHECK} |
              ../clang/share/clang/clang-format-diff.py -p1 -style=Google)

if [ -z "${FORMAT_DIFF}" ]; then
  # No formatting necessary.
  echo "All files in PR properly formatted."
  exit 0
else
  # Found diffs.
  echo "ERROR: Found formatting errors!"
  echo "${FORMAT_DIFF}"
  echo "See https://goo.gl/wUEkW9 for instructions to format your PR."
  exit 1
fi
