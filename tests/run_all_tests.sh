#!/bin/bash

if [ ! -z $CI ]; then echo "Executing run_all_tests.sh from $(pwd)"; fi

# ANSI colors
BOLD_GREEN='\033[1;32m'
BOLD_RED='\033[1;31m'
ANSI_RESET='\033[0m'

gh_actions_fold () {
  local startOrEnd=$1 # Either "start" or "end"

  if [ ! -z $CI ]; then
    echo "::$startOrEnd::"
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
  gh_actions_fold group
  $command
  local test_result=$?
  gh_actions_fold endgroup
  if [ $test_result -eq 0 ]; then
    echo -e "${BOLD_GREEN}SUCCESS:${ANSI_RESET} ${test_id}"
  else
    echo -e "${BOLD_RED}FAILED:${ANSI_RESET} ${test_id}"
    FAILURE_COUNT=$((FAILURE_COUNT+1))
  fi
}

# Lint the codebase.
# Skip for CI environments, because linting is run separately.
if [ -z $CI ]; then
  run_test_command "eslint" "eslint ."
fi

# Run the full usual build process, checking to ensure there are no
# closure compiler warnings / errors.
run_test_command "build-debug" "npm run build-debug"

# Generate TypeScript typings and ensure there are no errors.
# TODO(5621): Re-enable this test once typings generation is fixed.
# run_test_command "typings" "npm run typings"

# Run renaming validation test.
run_test_command "renamings" "tests/migration/validate-renamings.js"

# Check the sizes of built files for unexpected growth.
run_test_command "metadata" "tests/scripts/check_metadata.sh"

# Run Mocha tests inside a browser.
run_test_command "mocha" "node tests/mocha/run_mocha_tests_in_browser.js"

# Run generator tests inside a browser and check the results.
run_test_command "generators" "tests/scripts/run_generators.sh"

# Run the package build process, as Node tests depend on it.
run_test_command "package" "npm run package"

# Run Node tests.
run_test_command "node" "./node_modules/.bin/mocha tests/node --config tests/node/.mocharc.js"

# Attempt advanced compilation of a Blockly app.
run_test_command "advanced_compile" "npm run test:compile:advanced"

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
