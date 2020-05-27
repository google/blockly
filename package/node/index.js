/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Blockly module for Node. It includes Blockly core,
 *               built-in blocks, all the generators and the English locale.
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

Blockly.Python = BlocklyPython;

Blockly.Lua = BlocklyLua;

Blockly.PHP = BlocklyPHP;

Blockly.Dart = BlocklyDart;