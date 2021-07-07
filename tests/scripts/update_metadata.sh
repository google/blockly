#!/bin/bash

# Determines the size of generated files and updates check_metadata.sh to
# reflect the new values.
 
blockly_size=$(wc -c < "blockly_compressed.js")
blocks_size=$(wc -c < "blocks_compressed.js")
blockly_gz_size=$(wc -c < "blockly_compressed.js.gz")
blocks_gz_size=$(wc -c < "blocks_compressed.js.gz")
quarter=$(date "+Q%q %Y")
version=$(npx -c 'echo "$npm_package_version"')

replacement="# ${quarter}   ${version}    ${blockly_size}\nblockly_size_expected=${blockly_size}"
sed -ri "s/blockly_size_expected=[0-9]+/${replacement}/g" tests/scripts/check_metadata.sh
replacement="# ${quarter}   ${version}    ${blocks_size}\nblocks_size_expected=${blocks_size}"
sed -ri "s/blocks_size_expected=[0-9]+/${replacement}/g" tests/scripts/check_metadata.sh
replacement="# ${quarter}   ${version}    ${blockly_gz_size}\nblockly_gz_size_expected=${blockly_gz_size}"
sed -ri "s/blockly_gz_size_expected=[0-9]+/${replacement}/g" tests/scripts/check_metadata.sh
replacement="# ${quarter}   ${version}    ${blocks_gz_size}\nblocks_gz_size_expected=${blocks_gz_size}"
sed -ri "s/blocks_gz_size_expected=[0-9]+/${replacement}/g" tests/scripts/check_metadata.sh