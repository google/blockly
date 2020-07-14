/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Blockly module for the browser. This includes Blockly core
 * and built in blocks, the JavaScript code generator and the English block
 * localization files.
 */

/* eslint-disable */
'use strict';

// Include the EN Locale by default.
Blockly.setLocale(En);

Blockly.Blocks = Blockly.Blocks || {};
Object.keys(BlocklyBlocks).forEach(function (k) {
  Blockly.Blocks[k] = BlocklyBlocks[k];
});

Blockly.JavaScript = BlocklyJS;