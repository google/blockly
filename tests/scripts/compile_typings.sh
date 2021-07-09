#!/bin/bash

# Location that npm run typings will write .d.ts files to.
#
# (TODO(#5007): Should fetch this from scripts/gulpfiles/config.js
# instead of hardcoding it here.
readonly BUILD_DIR='build'

# ANSI colors
BOLD_GREEN='\033[1;32m'
BOLD_RED='\033[1;31m'
ANSI_RESET='\033[0m'

# Terminate immediately with non-zero status if any command exits
# with non-zero status, printing a nice message.
set -e
function fail {
  echo -e "${BOLD_RED}Failed to compile TypeScript typings.${ANSI_RESET}" >&2
}
trap fail ERR

# Generate Blockly typings.
echo "Generating Blockly typings"
npm run typings

# Use the TypeScript compiler to compile the generated typings.
echo "Compiling typings"

cd "${BUILD_DIR}"
../node_modules/.bin/tsc blockly.d.ts

echo -e "${BOLD_GREEN}TypeScript typings compiled successfully.${ANSI_RESET}"
