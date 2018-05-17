#!/bin/bash

if [ ! -z $TRAVIS ]; then echo "Executing run_all_tests.sh from $(pwd)"; fi

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
  echo "ERROR: Cannot determine BLOCKLY_ROOT" 1>&2;
  exit 1
fi
pushd $BLOCKLY_ROOT
echo "pwd: $(pwd)"

RETURN_CODE=0

run_test_command () {
  local test_id=$1  # The id to use for folds and similar. No spaces.
  local command=$2  # The command to run.

  travis_fold start $test_id
  $command
  local test_result=$?
  travis_fold end $test_id
  if [ $test_result -eq 0 ]; then
    echo "SUCCESS: Test $test_id"
  else
    echo "FALIED: Test $test_id"
    RETURN_CODE=1
  fi
}

# Lint the codebase.
run_test_command "eslint" "eslint ."

# Run JSUnit tests inside a browser.
run_test_command "jsunit" "node tests/jsunit/run_jsunit_tests_in_browser.js"

# Attempt advanced compilation of a Blockly app.
run_test_command "compile" "tests/compile/compile.sh"


# End of tests.
# Reset current working directory.
popd
exit $RETURN_CODE
