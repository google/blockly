/**
 * @license
 * Copyright 2012 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Common blocks for the Leaphy robots.
 */
 'use strict';

 goog.module('Blockly.libraryBlocks.leaphyCommon');
 
 /* eslint-disable-next-line no-unused-vars */
 const {BlockDefinition} = goog.requireType('Blockly.blocks');
 const {createBlockDefinitionsFromJsonArray, defineBlocks} = goog.require('Blockly.common');

 /**
  * A dictionary of the block definitions provided by this module.
  * @type {!Object<string, !BlockDefinition>}
  */
 const blocks = createBlockDefinitionsFromJsonArray([
    {
      "type": "leaphy_start",
      "lastDummyAlign0": "CENTRE",
      "message0": "%%{BKY_LEAPHY_START}",
      "style": "leaphy_blocks",
      //"extensions": ["setDeletableFalse"],
      "appendStatementInput": "STACK",
      "isDeletable": false,
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
  ]);
 exports.blocks = blocks;
 
 // Register provided blocks.
 defineBlocks(blocks);
 