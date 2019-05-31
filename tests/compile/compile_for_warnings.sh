#!/bin/bash
#
# Run the compile script and print the number of warnings.

# Figure out where we are.
if [ -f ./compile.sh ]; then
  echo "Running from tests/compile"
  PREFIX="."
elif [ -f tests/compile/compile.sh ]; then
  echo "Running from blockly root"
  PREFIX="./tests/compile"
else
  echo "ERROR: Cannot determine BLOCKLY_ROOT" 1>&2;
  exit 1
fi

OUTPUT_NAME="$PREFIX/output.txt"

$PREFIX/compile.sh 2&> $OUTPUT_NAME
tail -3 $OUTPUT_NAME
