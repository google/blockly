#!/bin/bash

# Determines the size of generated files and updates check_metadata.sh to
# reflect the new values.

gzip -k build/blockly_compressed.js
gzip -k build/blocks_compressed.js

blockly_size=$(wc -c < "build/blockly_compressed.js")
blocks_size=$(wc -c < "build/blocks_compressed.js")
blockly_gz_size=$(wc -c < "build/blockly_compressed.js.gz")
blocks_gz_size=$(wc -c < "build/blocks_compressed.js.gz")
quarters=(1 1 1 2 2 2 3 3 3 4 4 4)
month=$(date +%-m)
quarter=$(echo Q${quarters[$month - 1]} $(date +%Y))
version=$(npx -c 'echo "$npm_package_version"')

replacement="# ${quarter}\t${version}\t${blockly_size}\n"
replacement+="readonly BLOCKLY_SIZE_EXPECTED=${blockly_size}"
sed -ri.bak "s/readonly BLOCKLY_SIZE_EXPECTED=[0-9]+/${replacement}/g" \
  tests/scripts/check_metadata.sh

replacement="# ${quarter}\t${version}\t${blocks_size}\n"
replacement+="readonly BLOCKS_SIZE_EXPECTED=${blocks_size}"
sed -ri.bak "s/readonly BLOCKS_SIZE_EXPECTED=[0-9]+/${replacement}/g" \
  tests/scripts/check_metadata.sh

replacement="# ${quarter}\t${version}\t${blockly_gz_size}\n"
replacement+="readonly BLOCKLY_GZ_SIZE_EXPECTED=${blockly_gz_size}"
sed -ri.bak "s/readonly BLOCKLY_GZ_SIZE_EXPECTED=[0-9]+/${replacement}/g" \
  tests/scripts/check_metadata.sh

replacement="# ${quarter}\t${version}\t${blocks_gz_size}\n"
replacement+="readonly BLOCKS_GZ_SIZE_EXPECTED=${blocks_gz_size}"
sed -ri.bak "s/readonly BLOCKS_GZ_SIZE_EXPECTED=[0-9]+/${replacement}/g" \
  tests/scripts/check_metadata.sh

rm tests/scripts/check_metadata.sh.bak