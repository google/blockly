#!/bin/bash

# Checks the size of generated files and verifies they aren't growing
# unreasonably.

# These values should be updated with each release
# Size of blockly_compressed.js
blockly_size_expected=573000 # 813K in July 2019 release
# Size of blocks_compressed.js
blocks_size_expected=76500 # 75K in July 2019 release
# Size of blockly_compressed.js.gz
blockly_gz_size_expected=123000 # 180K in July 2019 release
# Size of blocks_compressed.js.gz
blocks_gz_size_expected=15200 # 14.5K in July 2019 release

# ANSI colors
BOLD_GREEN='\033[1;32m'
BOLD_RED='\033[1;31m'
ANSI_RESET='\033[0m'

# Build the compressed files for core and blocks
echo "Building files"
npm install
gulp build-core
gulp build-blocks

# GZip them for additional size comparisons
echo "Zipping the compressed files"
gzip -c blockly_compressed.js > blockly_compressed.js.gz
gzip -c blocks_compressed.js > blocks_compressed.js.gz

# Check the sizes of the files

has_failed=0

compare_size() {
	local name=$1
	local expected=$2
	local compare=$(echo "$expected * 1.1 / 1" | bc)

	local size=$(wc -c <"$name")

	if (( $size > $compare))
	then
		echo -e "${BOLD_RED}Failed: Size of $name has grown more than 10%. $size vs $expected ${ANSI_RESET}" >&2
  		has_failed=1
  	else
  		echo -e "${BOLD_GREEN}Size of $name at $size compared to previous $expected.${ANSI_RESET}"
  	fi
}

compare_size "blockly_compressed.js" $blockly_size_expected
compare_size "blocks_compressed.js" $blocks_size_expected
compare_size "blockly_compressed.js.gz" $blockly_gz_size_expected
compare_size "blocks_compressed.js.gz" $blocks_gz_size_expected

exit $has_failed
