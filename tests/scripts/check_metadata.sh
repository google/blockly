#!/bin/bash

# Checks the size of generated files and verifies they aren't growing
# unreasonably.

# These values should be updated with each release

# Size of blockly_compressed.js
# Q2 2019	2.20190722.0	812688
# Q3 2019	3.20191014.0	538781
# Q4 2019	3.20200123.0	609855
# Q1 2020	3.20200402.0	619341
# Q2 2020	3.20200625.0	621811
blockly_size_expected=621811

# Size of blocks_compressed.js
# Q2 2019	2.20190722.0	75618
# Q3 2019	3.20191014.0	76455
# Q4 2019	3.20200123.0	75629
# Q1 2020	3.20200402.0	75805
# Q2 2020	3.20200625.0	76360
blocks_size_expected=76360

# Size of blockly_compressed.js.gz
# Q2 2019	2.20190722.0	180925
# Q3 2019	3.20191014.0	119064
# Q4 2019	3.20200123.0	131897
# Q1 2020	3.20200402.0	134133
# Q2 2020	3.20200625.0	135181
blockly_gz_size_expected=135181

# Size of blocks_compressed.js.gz
# Q2 2019	2.20190722.0	14552
# Q3 2019	3.20191014.0	15064
# Q4 2019	3.20200123.0	14897
# Q1 2020	3.20200402.0	14966
# Q2 2020	3.20200625.0	15195
blocks_gz_size_expected=15195

# ANSI colors
BOLD_GREEN='\033[1;32m'
BOLD_RED='\033[1;31m'
ANSI_RESET='\033[0m'

# Build the compressed files for core and blocks
echo "Building files"
npm install
gulp buildCompressed
gulp buildBlocks

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
