/**
 * @license
 * Copyright 2012 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Leaphy Common Blocks for Blockly.
 *
 * This file is scraped to extract a .json file of block definitions. The array
 * passed to defineBlocksWithJsonArray(..) must be strict JSON: double quotes
 * only, no outside references, no functions, no trailing commas, etc. The one
 * exception is end-of-line comments, which the scraper will remove.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Blockly.Blocks.leaphyCommon');  // Deprecated
goog.provide('Blockly.Constants.LeaphyCommon');

goog.require('Blockly');
goog.require('Blockly.Blocks');
goog.require('Blockly.FieldDropdown');
goog.require('Blockly.FieldLabel');
goog.require('Blockly.Mutator');


Blockly.defineBlocksWithJsonArray([
  {
    "type": "leaphy_start",
    "lastDummyAlign0": "CENTRE",
    "message0": "%%{BKY_LEAPHY_START}",
    "style": "leaphy_blocks",
    "extensions": ["setDeletableFalse"],
    "tooltip": "",
    "helpUrl": ""
  },
  {
    "type": "leaphy_serial_print_line",
    "message0": "%%{BKY_LEAPHY_SERIAL_PRINT} %1 %2",
    "args0": [
      {
        "type": "input_dummy"
      },
      {
        "type": "input_value",
        "name": "VALUE"
      }
    ],
    "inputsInline": true,
    "previousStatement": null,
    "nextStatement": null,
    "style": "leaphy_blocks",
    "tooltip": "",
    "helpUrl": ""
  },
  {
    "type": "leaphy_serial_print_value",
    "message0": "%%{BKY_LEAPHY_SERIAL_PRINT} %1 %2 = %3 %4",
    "args0": [
      {
        "type": "input_dummy"
      },
      {
        "type": "input_value",
        "name": "NAME"
      },
      {
        "type": "input_dummy"
      },
      {
        "type": "input_value",
        "name": "VALUE"
      }
    ],
    "inputsInline": true,
    "previousStatement": null,
    "nextStatement": null,
    "style": "leaphy_blocks",
    "tooltip": "",
    "helpUrl": ""
  }
])  // END JSON EXTRACT (Do not delete this comment.)