#!/bin/bash -e
#
# Create symbolic links in this directory for the
# Blockly library files used by this demo's index.html.

if [[ ! -e ../../../dist/blockly_compressed.js ]]; then
    echo "ERROR: Could not locate blockly_compressed.js. Run from demos/mobile/html/" 1>&2
    exit 1 # terminate and indicate error
fi

if [ ! -L blockly_compressed.js ]; then
    ln -s ../../../dist/blockly_compressed.js blockly_compressed.js
fi
if [ ! -L blocks_compressed.js ]; then
    ln -s ../../../dist/blocks_compressed.js blocks_compressed.js
fi
if [ ! -L media ]; then
    ln -s ../../../media media
fi
if [ ! -L msg ]; then
    ln -s ../../../build/msg msg
fi
