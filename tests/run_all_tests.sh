#!/bin/bash

if [ ! -z $TRAVIS ]; then echo "Executing run_all_tests.sh from $(pwd)"; fi

# ANSI colors
BOLD_GREEN='\033[1;32m'
BOLD_RED='\033[1;31m'
ANSI_RESET='\033[0m'

travis_fold () {
  local startOrEnd=$1 # Either "start" or "end"
  local id=$2         # The fold id. No spaces.

  if [ ! -z $TRAVIS ]; then
    echo "travis_fold:$startOrEnd:$id"
  fi
}

# Find the Blockly project root if pwd is the root
# or if pwd is the directory containing this script.
if [ -f ./run_all_tests.js ]; then
  BLOCKLY_ROOT=".."
elif [ -f tests/run_all_tests.sh ]; then
  BLOCKLY_ROOT="."
else
  echo -e "${BOLD_RED}ERROR: Cannot determine BLOCKLY_ROOT${ANSI_RESET}" 1>&2;
  exit 1
fi
pushd $BLOCKLY_ROOT
echo "pwd: $(pwd)"

FAILURE_COUNT=0

run_test_command () {
  local test_id=$1  # The id to use for folds and similar. No spaces.
  local command=$2  # The command to run.

  echo "======================================="
  echo "== $test_id"
  travis_fold start $test_id
  $command
  local test_result=$?
  travis_fold end $test_id
  if [ $test_result -eq 0 ]; then
    echo -e "${BOLD_GREEN}SUCCESS:${ANSI_RESET} ${test_id}"
  else
    echo -e "${BOLD_RED}FAILED:${ANSI_RESET} ${test_id}"
    FAILURE_COUNT=$((FAILURE_COUNT+1))
  fi
}

# Set up the environment (Chrome, Selenium, etc.)
run_test_command "test_setup" "tests/scripts/test_setup.sh"

# Lint the codebase.
run_test_command "eslint" "eslint ."

# Run JSUnit tests inside a browser.
run_test_command "jsunit" "node tests/jsunit/run_jsunit_tests_in_browser.js"
# TODO: Make sure jsunit output is captured.  Child process?

# Run generator tests inside a browser and check the results.
run_test_command "generators" "tests/scripts/run_generators.sh"

# # Attempt advanced compilation of a Blockly app.
# run_test_command "compile" "tests/compile/compile.sh"


# End of tests.
popd
echo "======================================="
if [ "$FAILURE_COUNT" -eq "0" ]; then
  echo -e "${BOLD_GREEN}All tests passed.${ANSI_RESET}"
  exit 0
else
  echo -e "${BOLD_RED}Failures in ${FAILURE_COUNT} test groups.${ANSI_RESET}"
  exit 1
fi
