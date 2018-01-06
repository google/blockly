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
 * @fileoverview Variable blocks for Blockly.

 * This file is scraped to extract a .json file of block definitions. The array
 * passed to defineBlocksWithJsonArray(..) must be strict JSON: double quotes
 * only, no outside references, no functions, no trailing commas, etc. The one
 * exception is end-of-line comments, which the scraper will remove.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Blockly.Blocks.variables');  // Deprecated.
goog.provide('Blockly.Constants.Variables');

goog.require('Blockly.Blocks');
goog.require('Blockly');


/**
 * Common HSV hue for all blocks in this category.
 * Should be the same as Blockly.Msg.VARIABLES_HUE.
 * @readonly
 */
Blockly.Constants.Variables.HUE = 330;
/** @deprecated Use Blockly.Constants.Variables.HUE */
Blockly.Blocks.variables.HUE = Blockly.Constants.Variables.HUE;

Blockly.Blocks['variables_get'] = {
	/**
	 * Block for variable getter.
	 * @this Blockly.Block
	 */
	init: function() {
	  this.setHelpUrl(Blockly.Msg.VARIABLES_GET_HELPURL);
	  this.setColour(Blockly.Blocks.variables.HUE);
	  this.appendDummyInput()
		  .appendField(new Blockly.FieldVariable(
		  Blockly.Msg.VARIABLES_DEFAULT_NAME), 'VAR');
	  this.setOutput(true);
	  this.setTooltip(Blockly.Msg.VARIABLES_GET_TOOLTIP);
	  this.contextMenuMsg_ = Blockly.Msg.VARIABLES_GET_CREATE_SET;
	},
	contextMenuType_: 'variables_set',
	/**
	 * Add menu option to create getter/setter block for this setter/getter.
	 * @param {!Array} options List of menu options to add to.
	 * @this Blockly.Block
	 */
	customContextMenu: function(options) {
	  var option = {enabled: true};
	  var name = this.getFieldValue('VAR');
	  option.text = this.contextMenuMsg_.replace('%1', name);
	  var xmlField = goog.dom.createDom('field', null, name);
	  xmlField.setAttribute('name', 'VAR');
	  var xmlBlock = goog.dom.createDom('block', null, xmlField);
	  xmlBlock.setAttribute('type', this.contextMenuType_);
	  option.callback = Blockly.ContextMenu.callbackFactory(this, xmlBlock);
	  options.push(option);
	},
	/**
	 * @return {!string} Retrieves the type (stored in varType) of this block.
	 * @this Blockly.Block
	 */
	getBlockType: function() {
	  return [Blockly.Types.UNDEF, this.getFieldValue('VAR')];
	},
	/**
	 * Gets the stored type of the variable indicated in the argument. As only one
	 * variable is stored in this block, no need to check input
	 * @this Blockly.
	 * @param {!string} varName Name of this block variable to check type.
	 * @return {!string} String to indicate the type of this block.
	 */
	getVarType: function(varName) {
	  return [Blockly.Types.UNDEF, this.getFieldValue('VAR')];
	},
  };// END JSON EXTRACT (Do not delete this comment.)

Blockly.Blocks['variables_set'] = {
	/**
	 * Block for variable setter.
	 * @this Blockly.Block
	 */
	init: function() {
	  this.jsonInit({
		"message0": Blockly.Msg.VARIABLES_SET,
		"args0": [
		  {
			"type": "field_variable",
			"name": "VAR",
			"variable": Blockly.Msg.VARIABLES_DEFAULT_NAME
		  },
		  {
			"type": "input_value",
			"name": "VALUE"
		  }
		],
		"previousStatement": null,
		"nextStatement": null,
		"colour": Blockly.Blocks.variables.HUE,
		"tooltip": Blockly.Msg.VARIABLES_SET_TOOLTIP,
		"helpUrl": Blockly.Msg.VARIABLES_SET_HELPURL
	  });
	  this.contextMenuMsg_ = Blockly.Msg.VARIABLES_SET_CREATE_GET;
	},
	contextMenuType_: 'variables_get',
	customContextMenu: Blockly.Blocks['variables_get'].customContextMenu,
	/**
	 * Searches through the nested blocks to find a variable type.
	 * @this Blockly.Block
	 * @param {!string} varName Name of this block variable to check type.
	 * @return {string} String to indicate the type of this block.
	 */
	getVarType: function(varName) {
	  return Blockly.Types.getChildBlockType(this);
	}
  };

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
   * @this Blockly.Block
   */
  customContextMenu: function(options) {
    // Getter blocks have the option to create a setter block, and vice versa.
    if (this.type == 'variables_get') {
      var opposite_type = 'variables_set';
      var contextMenuMsg = Blockly.Msg.VARIABLES_GET_CREATE_SET;
    } else {
      var opposite_type = 'variables_get';
      var contextMenuMsg = Blockly.Msg.VARIABLES_SET_CREATE_GET;
    }

    var option = {enabled: this.workspace.remainingCapacity() > 0};
    var name = this.getFieldValue('VAR');
    option.text = contextMenuMsg.replace('%1', name);
    var xmlField = goog.dom.createDom('field', null, name);
    xmlField.setAttribute('name', 'VAR');
    var xmlBlock = goog.dom.createDom('block', null, xmlField);
    xmlBlock.setAttribute('type', opposite_type);
    option.callback = Blockly.ContextMenu.callbackFactory(this, xmlBlock);
    options.push(option);
  }
};

Blockly.Extensions.registerMixin('contextMenu_variableSetterGetter',
  Blockly.Constants.Variables.CUSTOM_CONTEXT_MENU_VARIABLE_GETTER_SETTER_MIXIN);
