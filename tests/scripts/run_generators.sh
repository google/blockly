#!/bin/bash

# ANSI colors
BOLD_GREEN='\033[1;32m'
BOLD_RED='\033[1;31m'
ANSI_RESET='\033[0m'
SUCCESS_PREFIX="${BOLD_GREEN}SUCCESS:${ANSI_RESET}"
FAILURE_PREFIX="${BOLD_RED}FAILED:${ANSI_RESET}"

TMP_DIR="tests/generators/tmp/"
GOLDEN_DIR="tests/generators/golden/"

FAILURE_COUNT=0
check_result() {
  local suffix=$1 # One of: js, py, dart, lua, php
  local tmp_filename="${TMP_DIR}generated.$suffix"

  if [ -f $tmp_filename ]; then
    local golden_filename="${GOLDEN_DIR}generated.$suffix"
    if [ -f $golden_filename ]; then
      if cmp --silent $tmp_filename $golden_filename; then
        echo -e "$SUCCESS_PREFIX $suffix: $tmp_filename matches $golden_filename"
      else
        echo -e "$FAILURE_PREFIX $suffix: $tmp_filename does not match $golden_filename"
        FAILURE_COUNT=$((FAILURE_COUNT+1))
      fi
    else
      echo "File $golden_filename not found!"
      FAILURE_COUNT=$((FAILURE_COUNT+1))
    fi
  else
    echo "File $tmp_filename not found!"
    FAILURE_COUNT=$((FAILURE_COUNT+1))
  fi
}


mkdir $TMP_DIR

node tests/generators/run_generators_in_browser.js
generator_suffixes=( "js" "py" "dart" "lua" "php" )
for i in "${generator_suffixes[@]}"
do
   check_result "$i"
done


# Clean up.
rm -r $TMP_DIR

if [ "$FAILURE_COUNT" -eq "0" ]; then
  echo -e "${BOLD_GREEN}All generator tests passed.${ANSI_RESET}"
  exit 0
else
  echo -e "${BOLD_RED}Failures in ${FAILURE_COUNT} generator tests.${ANSI_RESET}"
  exit 1
fi
