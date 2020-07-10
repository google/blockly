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

/**
 * Unused constant for the common HSV hue for all blocks in this category.
 * @deprecated Use Blockly.Msg['COLOUR_HUE']. (2018 April 5)
 */
Blockly.Constants.Colour.HUE = 20;

Blockly.Blocks['leaphy_start'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.LEAPHY_START)
            .setAlign(Blockly.ALIGN_CENTRE);
        this.setStyle('leaphy_blocks');
        this.appendStatementInput('STACK')
        this.setDeletable(false);
    }
};

//Blockly.defineBlocksWithJsonArray([  // BEGIN JSON EXTRACT

//]);  // END JSON EXTRACT (Do not delete this comment.)
