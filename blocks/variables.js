/**
 * @license
 * Copyright 2012 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Variable blocks for Blockly.
 */
'use strict';

goog.provide('Blockly.blocks.variables');
goog.provide('Blockly.Constants.Variables');

goog.require('Blockly');
goog.require('Blockly.FieldLabel');
goog.require('Blockly.FieldVariable');


/**
 * Unused constant for the common HSV hue for all blocks in this category.
 * @deprecated Use Blockly.Msg['VARIABLES_HUE']. (2018 April 5)
 */
Blockly.Constants.Variables.HUE = 330;

Blockly.defineBlocksWithJsonArray([
  // Block for variable getter.
  {
    "type": "variables_get",
    "message0": "%1",
    "args0": [
      {
        "type": "field_variable",
        "name": "VAR",
        "variable": "%{BKY_VARIABLES_DEFAULT_NAME}",
      },
    ],
    "output": null,
    "style": "variable_blocks",
    "helpUrl": "%{BKY_VARIABLES_GET_HELPURL}",
    "tooltip": "%{BKY_VARIABLES_GET_TOOLTIP}",
    "extensions": ["contextMenu_variableSetterGetter"],
  },
  // Block for variable setter.
  {
    "type": "variables_set",
    "message0": "%{BKY_VARIABLES_SET}",
    "args0": [
      {
        "type": "field_variable",
        "name": "VAR",
        "variable": "%{BKY_VARIABLES_DEFAULT_NAME}",
      },
      {
        "type": "input_value",
        "name": "VALUE",
      },
    ],
    "previousStatement": null,
    "nextStatement": null,
    "style": "variable_blocks",
    "tooltip": "%{BKY_VARIABLES_SET_TOOLTIP}",
    "helpUrl": "%{BKY_VARIABLES_SET_HELPURL}",
    "extensions": ["contextMenu_variableSetterGetter"],
  },
]);

/**
 * Mixin to add context menu items to create getter/setter blocks for this
 * setter/getter.
 * Used by blocks 'variables_set' and 'variables_get'.
 * @mixin
 * @augments Blockly.Block
 * @package
 * @readonly
 */
Blockly.Constants.Variables.CUSTOM_CONTEXT_MENU_VARIABLE_GETTER_SETTER_MIXIN = {
  /**
   * Add menu option to create getter/setter block for this setter/getter.
   * @param {!Array} options List of menu options to add to.
   * @this {Blockly.Block}
   */
  customContextMenu: function(options) {
    if (!this.isInFlyout) {
      let oppositeType;
      let contextMenuMsg;
      // Getter blocks have the option to create a setter block, and vice versa.
      if (this.type === 'variables_get') {
        oppositeType = 'variables_set';
        contextMenuMsg = Blockly.Msg['VARIABLES_GET_CREATE_SET'];
      } else {
        oppositeType = 'variables_get';
        contextMenuMsg = Blockly.Msg['VARIABLES_SET_CREATE_GET'];
      }

      const option = {enabled: this.workspace.remainingCapacity() > 0};
      const name = this.getField('VAR').getText();
      option.text = contextMenuMsg.replace('%1', name);
      const xmlField = Blockly.utils.xml.createElement('field');
      xmlField.setAttribute('name', 'VAR');
      xmlField.appendChild(Blockly.utils.xml.createTextNode(name));
      const xmlBlock = Blockly.utils.xml.createElement('block');
      xmlBlock.setAttribute('type', oppositeType);
      xmlBlock.appendChild(xmlField);
      option.callback = Blockly.ContextMenu.callbackFactory(this, xmlBlock);
      options.push(option);
      // Getter blocks have the option to rename or delete that variable.
    } else {
      if (this.type === 'variables_get' || this.type === 'variables_get_reporter') {
        const renameOption = {
          text: Blockly.Msg.RENAME_VARIABLE,
          enabled: true,
          callback: Blockly.Constants.Variables.RENAME_OPTION_CALLBACK_FACTORY(this),
        };
        const name = this.getField('VAR').getText();
        const deleteOption = {
          text: Blockly.Msg.DELETE_VARIABLE.replace('%1', name),
          enabled: true,
          callback: Blockly.Constants.Variables.DELETE_OPTION_CALLBACK_FACTORY(this),
        };
        options.unshift(renameOption);
        options.unshift(deleteOption);
      }
    }
  },
};

/**
  * Callback for rename variable dropdown menu option associated with a
  * variable getter block.
  * @param {!Blockly.Block} block The block with the variable to rename.
  * @return {!function()} A function that renames the variable.
  */
Blockly.Constants.Variables.RENAME_OPTION_CALLBACK_FACTORY = function(block) {
  return function() {
    const workspace = block.workspace;
    const variable = block.getField('VAR').getVariable();
    Blockly.Variables.renameVariable(workspace, variable);
  };
};

/**
 * Callback for delete variable dropdown menu option associated with a
 * variable getter block.
 * @param {!Blockly.Block} block The block with the variable to delete.
 * @return {!function()} A function that deletes the variable.
 */
Blockly.Constants.Variables.DELETE_OPTION_CALLBACK_FACTORY = function(block) {
  return function() {
    const workspace = block.workspace;
    const variable = block.getField('VAR').getVariable();
    workspace.deleteVariableById(variable.getId());
    workspace.refreshToolboxSelection();
  };
};

Blockly.Extensions.registerMixin('contextMenu_variableSetterGetter',
    Blockly.Constants.Variables.CUSTOM_CONTEXT_MENU_VARIABLE_GETTER_SETTER_MIXIN);
