#!/bin/bash
set -eux

BLOCKLY_ROOT=../../..
IOS_RESOURCES=Resources/Non-Localized/Blockly

MORE_FILES_TO_COPY=(
  "dist/blockly_compressed.js"
  "dist/blocks_compressed.js"
  "media"
  "build/msg"
  )

mkdir -p $IOS_RESOURCES/media
mkdir -p $IOS_RESOURCES/msg/js
rsync -rp ../html/index.html $IOS_RESOURCES/webview.html
rsync -rp ../html/toolbox_standard.js $IOS_RESOURCES/toolbox_standard.js
for i in "${MORE_FILES_TO_COPY[@]}"; do   # The quotes are necessary here
    TARGET_DIR=$(dirname $IOS_RESOURCES/$i)
    rsync -rp $BLOCKLY_ROOT/$i $TARGET_DIR
done
