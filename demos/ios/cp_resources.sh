#!/bin/bash
set -eux

BLOCKLY_ROOT=../..
IOS_RESOURCES=Resources/Non-Localized/Blockly

FILES_TO_COPY=(
  "blockly_compressed.js"
  "blocks_compressed.js"
  "media"
  "msg/js"
  )

mkdir -p $IOS_RESOURCES/media
mkdir -p $IOS_RESOURCES/msg/js
for i in "${FILES_TO_COPY[@]}"; do   # The quotes are necessary here
    TARGET_DIR=$(dirname $IOS_RESOURCES/$i)
    rsync -rp $BLOCKLY_ROOT/$i $TARGET_DIR
done
