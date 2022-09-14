/**
 * @license
 * Copyright 2012 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Blocks for the Leaphy Original robot.
 */
 'use strict';

 goog.module('Blockly.libraryBlocks.leaphyOriginal');
 
 /* eslint-disable-next-line no-unused-vars */
 const {BlockDefinition} = goog.requireType('Blockly.blocks');
 const {createBlockDefinitionsFromJsonArray, defineBlocks} = goog.require('Blockly.common');

 /**
  * A dictionary of the block definitions provided by this module.
  * @type {!Object<string, !BlockDefinition>}
  */
 const blocks = createBlockDefinitionsFromJsonArray([
    {
        "type": "leaphy_original_get_distance",
        "message0": "%%{BKY_LEAPHY_GET_DISTANCE}",
        "style": "leaphy_blocks",
        "output": "Number",
        "tooltip": "",
        "helpUrl": ""
      }
  ]);
 exports.blocks = blocks;
 
 // Register provided blocks.
 defineBlocks(blocks);
 