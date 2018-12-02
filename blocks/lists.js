/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2012 Google Inc.
 * https://developers.google.com/blockly/
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview List blocks for Blockly.
 *
 * This file is scraped to extract a .json file of block definitions. The array
 * passed to defineBlocksWithJsonArray(..) must be strict JSON: double quotes
 * only, no outside references, no functions, no trailing commas, etc. The one
 * exception is end-of-line comments, which the scraper will remove.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Blockly.Blocks.lists');  // Deprecated
goog.provide('Blockly.Constants.Lists');  // deprecated, 2018 April 5

goog.require('Blockly.Blocks');
goog.require('Blockly');

/**
 * Unused constant for the common HSV hue for all blocks in this category.
 * @deprecated Use Blockly.Msg['LISTS_HUE']. (2018 April 5)
 */
Blockly.Constants.Lists.HUE = 260;

Blockly.defineBlocksWithJsonArray([  // BEGIN JSON EXTRACT

  // Block for checking if a list is empty
  {
    "type": "lists_isEmpty",
    "message0": "%{BKY_LISTS_ISEMPTY_TITLE}",
    "args0": [
      {
        "type": "input_value",
        "name": "VALUE",
        "check": ["String", "Array"]
      }
    ],
    "output": "Boolean",
    "colour": "%{BKY_LISTS_HUE}",
    "tooltip": "%{BKY_LISTS_ISEMPTY_TOOLTIP}",
    "helpUrl": "%{BKY_LISTS_ISEMPTY_HELPURL}"
  },
  // Block for getting the list length
  {
    "type": "lists_length",
    "message0": "%{BKY_LISTS_LENGTH_TITLE}",
    "args0": [
      {
        "type": "input_value",
        "name": "VALUE",
        "check": ["String", "Array"]
      }
    ],
    "output": "Number",
    "colour": "%{BKY_LISTS_HUE}",
    "tooltip": "%{BKY_LISTS_LENGTH_TOOLTIP}",
    "helpUrl": "%{BKY_LISTS_LENGTH_HELPURL}"
  }
]);  // END JSON EXTRACT (Do not delete this comment.)

Blockly.Blocks['lists_split'] = {
    /**
     * Block for splitting text into a list, or joining a list into text.
     * @this Blockly.Block
     */
    init: function() {
        // Assign 'this' to a variable for use in the closures below.
        var thisBlock = this;
        var dropdown = new Blockly.FieldDropdown(
            [
                [Blockly.Msg['LISTS_SPLIT_LIST_FROM_TEXT'], 'SPLIT'],
                [Blockly.Msg['LISTS_SPLIT_TEXT_FROM_LIST'], 'JOIN']
            ],
            function(newMode) {
                thisBlock.updateType_(newMode);
            });
        this.setHelpUrl(Blockly.Msg['LISTS_SPLIT_HELPURL']);
        this.setColour(Blockly.Msg['LISTS_HUE']);
        this.appendValueInput('INPUT')
            .setCheck('String')
            .appendField(dropdown, 'MODE');
        this.appendValueInput('DELIM')
            .setCheck('String')
            .appendField(Blockly.Msg['LISTS_SPLIT_WITH_DELIMITER']);
        this.setInputsInline(true);
        this.setOutput(true, 'Array');
        this.setTooltip(function() {
            var mode = thisBlock.getFieldValue('MODE');
            if (mode == 'SPLIT') {
                return Blockly.Msg['LISTS_SPLIT_TOOLTIP_SPLIT'];
            } else if (mode == 'JOIN') {
                return Blockly.Msg['LISTS_SPLIT_TOOLTIP_JOIN'];
            }
            throw Error('Unknown mode: ' + mode);
        });
    },
    /**
     * TODO MODIFY TYPE RETURN
     * Modify this block to have the correct input and output types.
     * @param {string} newMode Either 'SPLIT' or 'JOIN'.
     * @private
     * @this Blockly.Block
     */
    updateType_: function(newMode) {
        if (newMode == 'SPLIT') {
            this.outputConnection.setCheck('Array');
            this.getInput('INPUT').setCheck('String');
        } else {
            this.outputConnection.setCheck('String');
            this.getInput('INPUT').setCheck('Array');
        }
    },
    /**
     * Create XML to represent the input and output types.
     * @return {!Element} XML storage element.
     * @this Blockly.Block
     */
    mutationToDom: function() {
        var container = document.createElement('mutation');
        container.setAttribute('mode', this.getFieldValue('MODE'));
        return container;
    },
    /**
     * Parse XML to restore the input and output types.
     * @param {!Element} xmlElement XML storage element.
     * @this Blockly.Block
     */
    domToMutation: function(xmlElement) {
        this.updateType_(xmlElement.getAttribute('mode'));
    }
};




