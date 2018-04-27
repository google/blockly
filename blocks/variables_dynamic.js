/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2017 Google Inc.
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
 * @fileoverview Variable blocks for Blockly.

 * This file is scraped to extract a .json file of block definitions. The array
 * passed to defineBlocksWithJsonArray(..) must be strict JSON: double quotes
 * only, no outside references, no functions, no trailing commas, etc. The one
 * exception is end-of-line comments, which the scraper will remove.
 * @author duzc2dtw@gmail.com (Du Tian Wei)
 */
'use strict';

goog.provide('Blockly.Constants.VariablesDynamic');

goog.require('Blockly.Blocks');
goog.require('Blockly');


/**
 * Unused constant for the common HSV hue for all blocks in this category.
 * @deprecated Use Blockly.Msg['VARIABLES_DYNAMIC_HUE']. (2018 April 5)
 */
Blockly.Constants.VariablesDynamic.HUE = 310;

Blockly.defineBlocksWithJsonArray([ // BEGIN JSON EXTRACT
  // Block for variable getter.
  {
    "type": "variables_get_dynamic",
    "message0": "%1",
    "args0": [{
      "type": "field_variable",
      "name": "VAR",
      "variable": "%{BKY_VARIABLES_DEFAULT_NAME}"
    }],
    "output": null,
    "colour": "%{BKY_VARIABLES_DYNAMIC_HUE}",
    "helpUrl": "%{BKY_VARIABLES_GET_HELPURL}",
    "tooltip": "%{BKY_VARIABLES_GET_TOOLTIP}",
    "extensions": ["contextMenu_variableDynamicSetterGetter"]
  },
  // Block for variable setter.
  {
    "type": "variables_set_dynamic",
    "message0": "%{BKY_VARIABLES_SET}",
    "args0": [{
      "type": "field_variable",
      "name": "VAR",
      "variable": "%{BKY_VARIABLES_DEFAULT_NAME}"
    },
    {
      "type": "input_value",
      "name": "VALUE"
    }
    ],
    "previousStatement": null,
    "nextStatement": null,
    "colour": "%{BKY_VARIABLES_DYNAMIC_HUE}",
    "tooltip": "%{BKY_VARIABLES_SET_TOOLTIP}",
    "helpUrl": "%{BKY_VARIABLES_SET_HELPURL}",
    "extensions": ["contextMenu_variableDynamicSetterGetter"]
  }
]); // END JSON EXTRACT (Do not delete this comment.)

/**
 * Mixin to add context menu items to create getter/setter blocks for this
 * setter/getter.
 * Used by blocks 'variables_set_dynamic' and 'variables_get_dynamic'.
 * @mixin
 * @augments Blockly.Block
 * @package
 * @readonly
 */
Blockly.Constants.VariablesDynamic.CUSTOM_CONTEXT_MENU_VARIABLE_GETTER_SETTER_MIXIN = {
  /**
   * Add menu option to create getter/setter block for this setter/getter.
   * @param {!Array} options List of menu options to add to.
   * @this Blockly.Block
   */
  customContextMenu: function(options) {
    // Getter blocks have the option to create a setter block, and vice versa.
    if (this.isInFlyout) {
      return;
    }
    var opposite_type;
    var contextMenuMsg;
    if (this.type == 'variables_get_dynamic') {
      opposite_type = 'variables_set_dynamic';
      contextMenuMsg = Blockly.Msg['VARIABLES_GET_CREATE_SET'];
    } else {
      opposite_type = 'variables_get_dynamic';
      contextMenuMsg = Blockly.Msg['VARIABLES_SET_CREATE_GET'];
    }

    var option = {enabled: this.workspace.remainingCapacity() > 0};
    var name = this.getField('VAR').getText();
    option.text = contextMenuMsg.replace('%1', name);
    var xmlField = goog.dom.createDom('field', null, name);
    xmlField.setAttribute('name', 'VAR');
    var xmlBlock = goog.dom.createDom('block', null, xmlField);
    xmlBlock.setAttribute('type', opposite_type);
    option.callback = Blockly.ContextMenu.callbackFactory(this, xmlBlock);
    options.push(option);
  },
  onchange: function() {
    var id = this.getFieldValue('VAR');
    var variableModel = this.workspace.getVariableById(id);
    if (this.type == 'variables_get_dynamic') {
      this.outputConnection.setCheck(variableModel.type);
    } else {
      this.getInput('VALUE').connection.setCheck(variableModel.type);
    }
  }
};

Blockly.Extensions.registerMixin('contextMenu_variableDynamicSetterGetter',
    Blockly.Constants.VariablesDynamic.CUSTOM_CONTEXT_MENU_VARIABLE_GETTER_SETTER_MIXIN);
