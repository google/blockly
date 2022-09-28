#!/bin/bash

# Checks the size of generated files and verifies they aren't growing
# unreasonably.  Assumes the compressed files have already been built.

# The ..._EXPECTED values should be updated with each release.
# Run this script to get the new values.

# Location of the pre-built compressed files.
#
# (TODO(#5007): Should fetch this from scripts/gulpfiles/config.js
# instead of hardcoding it here.
readonly BUILD_DIR='build'

# These values should be updated with each release.  (Note that the
# historic values are tab-delimited.)

# Size of blockly_compressed.js
# Q2 2019	2.20190722.0	812688
# Q3 2019	3.20191014.0	538781
# Q4 2019	3.20200123.0	609855
# Q1 2020	3.20200402.0	619341
# Q2 2020	3.20200625.0	621811
# Q3 2020	3.20200924.0	641216
# Q4 2020	4.20201217.0	653624
# Q1 2021	5.20210325.0	653957
# Q2 2021	6.20210701.0	664497
# Q3 2021	6.20210701.0	731695 (mid-quarter goog.module conversion)
# Q3 2021	6.20210701.0	808807 (late-quarter goog.module conversion)
# Q4 2021	7.20211209.0-beta.0	920002
# Q4 2021	7.20211209.0	929665
readonly BLOCKLY_SIZE_EXPECTED=929665

# Size of blocks_compressed.js
# Q2 2019	2.20190722.0	75618
# Q3 2019	3.20191014.0	76455
# Q4 2019	3.20200123.0	75629
# Q1 2020	3.20200402.0	75805
# Q2 2020	3.20200625.0	76360
# Q3 2020	3.20200924.0	76429
# Q4 2020	4.20201217.0	76693
# Q1 2021	5.20210325.0	76693
# Q2 2021	6.20210701.0	76669
# Q3 2021	6.20210701.0	76669
# Q4 2021	7.20211209.0-beta.0	82054
# Q4 2021	7.20211209.0	86966
readonly BLOCKS_SIZE_EXPECTED=86966

# Size of blockly_compressed.js.gz
# Q2 2019	2.20190722.0	180925
# Q3 2019	3.20191014.0	119064
# Q4 2019	3.20200123.0	131897
# Q1 2020	3.20200402.0	134133
# Q2 2020	3.20200625.0	135181
# Q3 2020	3.20200924.0	138003
# Q4 2020	4.20201217.0	138115
# Q1 2021	5.20210325.0	136118
# Q2 2021	6.20210701.0	142112
# Q3 2021	6.20210701.0	147476 (mid-quarter goog.module conversion)
# Q3 2021	6.20210701.0	152025 (late-quarter goog.module conversion)
# Q4 2021	7.20211209.0-beta.0	169863
# Q4 2021	7.20211209.0	171759
readonly BLOCKLY_GZ_SIZE_EXPECTED=171759

# Size of blocks_compressed.js.gz
# Q2 2019	2.20190722.0	14552
# Q3 2019	3.20191014.0	15064
# Q4 2019	3.20200123.0	14897
# Q1 2020	3.20200402.0	14966
# Q2 2020	3.20200625.0	15195
# Q3 2020	3.20200924.0	15231
# Q4 2020	4.20201217.0	15224
# Q1 2021	5.20210325.0	15285
# Q2 2021	6.20210701.0	15275
# Q3 2021	6.20210701.0	15284
# Q4 2021	7.20211209.0-beta.0	16616
# Q4 2021	7.20211209.0	15760
readonly BLOCKS_GZ_SIZE_EXPECTED=15760

# ANSI colors
readonly BOLD_GREEN='\033[1;32m'
readonly BOLD_RED='\033[1;31m'
readonly ANSI_RESET='\033[0m'

# Terminate immediately with non-zero status if any command exits
# with non-zero status, printing a nice message.
set -e
function fail {
  echo -e "${BOLD_RED}Error while checking metadata.${ANSI_RESET}" >&2
}
trap fail ERR

# GZip them for additional size comparisons (keep originals, force
# overwite previously-gzipped copies).
echo "Zipping the compressed files"
gzip -kf "${BUILD_DIR}/blockly_compressed.js"
gzip -kf "${BUILD_DIR}/blocks_compressed.js"

# Check the sizes of the files

has_failed=0

compare_size() {
  local name="$1"
  local expected="$2"
  local compare=$(echo "${expected} * 1.1 / 1" | bc)

  local size=$(wc -c <"${name}")

  if (( $size > $compare))
  then
    echo -ne "${BOLD_RED}Failed: Size of ${name} has grown more than 10%. " >&2
    echo -e "${size} vs ${expected} ${ANSI_RESET}" >&2
    has_failed=1
  else
    echo -ne "${BOLD_GREEN}Size of ${name} at ${size} compared to previous " >&2
    echo -e "${expected}.${ANSI_RESET}"
  fi
}

compare_size "${BUILD_DIR}/blockly_compressed.js" $BLOCKLY_SIZE_EXPECTED
compare_size "${BUILD_DIR}/blocks_compressed.js" $BLOCKS_SIZE_EXPECTED
compare_size "${BUILD_DIR}/blockly_compressed.js.gz" $BLOCKLY_GZ_SIZE_EXPECTED
compare_size "${BUILD_DIR}/blocks_compressed.js.gz" $BLOCKS_GZ_SIZE_EXPECTED

exit $has_failed
