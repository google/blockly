#!/bin/bash

# Location that npm run typings will write .d.ts files to.
readonly BUILD_DIR='built'

# ANSI colors
BOLD_GREEN='\033[1;32m'
BOLD_RED='\033[1;31m'
ANSI_RESET='\033[0m'

# Generate Blockly typings.
echo "Generating Blockly typings"
npm run typings

# Use the TypeScript compiler to compile the generated typings.
echo "Compiling typings"

cd "${BUILD_DIR}"
../node_modules/.bin/tsc blockly.d.ts


if [ $? -eq 0 ]
then
  echo -e "${BOLD_GREEN}TypeScript typings compiled successfully.${ANSI_RESET}"
  exit 0
else
  echo -e "${BOLD_RED}Failed to compile TypeScript typings.${ANSI_RESET}" >&2
  exit 1
fi
