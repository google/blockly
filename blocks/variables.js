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
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Blockly.Blocks.variables');

goog.require('Blockly.Blocks');


/**
 * Common HSV hue for all blocks in this category.
 */
Blockly.Blocks.variables.HUE = 330;

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
    this.procedurePrefix_ = '';
  },
  /**
   * Return all variables referenced by this block.
   * @return {!Array.<string>} List of variable names.
   * @this Blockly.Block
   */
  getVars: function() {
    return [this.getFieldValue('VAR')];
  },
  /**
   * Return all types of variables referenced by this block.
   * @return {!Array.<Object>} List of variable names with their types.
   * @this Blockly.Block
   */
  getVarsTypes: function() {
    var vartypes = {};
    // See what this block is connected to
    if (this.outputConnection &&
        this.outputConnection.targetConnection &&
        this.outputConnection.targetConnection.check_) {
      vartypes[this.procedurePrefix_+this.getFieldValue('VAR')] =
          this.outputConnection.targetConnection.check_;
    }
    return vartypes;
  },
  /**
   * Notification that a variable is renaming.
   * If the name matches one of this block's variables, rename it.
   * @param {string} oldName Previous name of variable.
   * @param {string} newName Renamed variable.
   * @this Blockly.Block
   */
  renameVar: function(oldName, newName) {
    if (Blockly.Names.equals(oldName, this.getFieldValue('VAR'))) {
      this.setFieldValue(newName, 'VAR');
    }
  },
  /**
   * Called whenever anything on the workspace changes.
   * Add warning if this flow block is not nested inside a loop.
   * @this Blockly.Block
   */
  onchange: function() {
    // Is this variable actually a local or a proceedure variable?
    var prefix = Blockly.Variables.getLocalContext(this,
        this.getFieldValue('VAR'));

    var colour = Blockly.Blocks.variables.HUE;
    this.procedurePrefix_ = '';
    if (prefix != null) {
      colour = Blockly.Blocks.procedures.HUE;
      this.procedurePrefix_ = prefix;
    }

    if (colour != this.getColour()) {
      this.setColour(colour);
    }
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
  typeblock: Blockly.getMsgString('variables_get_typeblock')
};

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
    this.procedurePrefix_ = '';
    this.contextMenuMsg_ = Blockly.Msg.VARIABLES_SET_CREATE_GET;
  },
  onchange: Blockly.Blocks['variables_get'].onchange,
  getVars: Blockly.Blocks['variables_get'].getVars,
  renameVar: Blockly.Blocks['variables_get'].renameVar,
  contextMenuType_: 'variables_get',
  customContextMenu: Blockly.Blocks['variables_get'].customContextMenu,
  /**
   * Return all types of variables referenced by this block.
   * @return {!Array.<Object>} List of variable names with their types.
   * @this Blockly.Block
   */
  getVarsTypes: function() {
    var vartypes = {};
    var valField = this.getInput('VALUE');
    if (valField &&
        valField.connection &&
        valField.connection.targetConnection &&
        valField.connection.targetConnection.check_) {
        vartypes[this.procedurePrefix_+this.getFieldValue('VAR')] =
                                  valField.connection.targetConnection.check_;
    }
    return vartypes;
  },
  typeblock: Blockly.getMsgString('variables_set_typeblock')
};

Blockly.Blocks['hash_variables_get'] = {
  /**
   * Block for variable getter.
   * @this Blockly.Block
   */
  init: function() {
    this.setColour(Blockly.getBlockHue('blockhue_variables'));
    this.appendDummyInput()
        .appendField(Blockly.Msg.VARIABLES_GET_TITLE)
        .appendField(new Blockly.FieldVariable(
                       Blockly.Msg.VARIABLES_GET_ITEM), 'VAR')
        .appendField('.')
        .appendField(new Blockly.FieldScopeVariable('HASHKEY'), 'HASHKEY')
        .appendField(Blockly.Msg.VARIABLES_GET_TAIL);
    this.setOutput(true);
    this.contextMenuMsg_ = Blockly.Msg.VARIABLES_GET_CREATE_SET;
    this.procedurePrefix_ = '';
    this.contextMenuType_ = 'hash_variables_set';
  },
  onchange: Blockly.Blocks['variables_get'].onchange,
  getVars: Blockly.Blocks['variables_get'].getVars,
  renameVar: Blockly.Blocks['variables_get'].renameVar,
  /**
   * Return all types of variables referenced by this block.
   * @return {!Array.<Object>} List of variable names with their types.
   * @this Blockly.Block
   */
  getVarsTypes: function() {
    var vartypes = {};
    vartypes[this.procedurePrefix_+this.getFieldValue('VAR')] = ['Map','Object'];
    return vartypes;
  },


  /**
   * Return all Scoped Variables referenced by this block.
   * @param {string} varclass class of variable to get.
   * @return {!Array.<string>} List of hashkey names.
   * @this Blockly.Block
   */
  getScopeVars: function(varclass) {
    var result = [];
    if (varclass === 'HASHKEY') {
      result.push(this.getFieldValue('HASHKEY'));
    }
    return result;
  },
  /**
   * Notification that a Scoped Variable is renaming.
   * If the name matches one of this block's Scoped Variables, rename it.
   * @param {string} oldName Previous name of Scoped Variable.
   * @param {string} newName Renamed Scoped Variable.
   * @param {string} varclass class of variable to rename
   * @this Blockly.Block
   */
  renameScopeVar: function(oldName, newName,varclass) {
    if (varclass === 'HASHKEY' &&
        Blockly.Names.equals(oldName, this.getFieldValue('HASHKEY'))) {
      this.setFieldValue(newName, 'HASHKEY');
    }
  },

  /**
   * Add menu option to create getter/setter block for this setter/getter.
   * @param {!Array} options List of menu options to add to.
   * @this Blockly.Block
   */
  customContextMenu: function(options) {
    var option = {enabled: true};
    var name = this.getFieldValue('VAR');
    var hashkey = this.getFieldValue('HASHKEY');
    option.text = this.contextMenuMsg_.replace('%1', name);
    var xmlField = goog.dom.createDom('field', null, name);
    xmlField.setAttribute('name', 'VAR');
    var xmlField = goog.dom.createDom('field', null, hashkey);
    xmlField.setAttribute('name', 'HASHKEY');
    var xmlBlock = goog.dom.createDom('block', null, xmlField);
    xmlBlock.setAttribute('type', this.contextMenuType_);
    option.callback = Blockly.ContextMenu.callbackFactory(this, xmlBlock);
    options.push(option);
  },
  helpUrl: Blockly.getUrlString('variables_hash_get_url'),
  tooltip: Blockly.getToolTipString('variables_hash_get_tooltip'),
  typeblock: Blockly.getMsgString('variables_hash_get_typeblock')
};

Blockly.Blocks['hash_parmvariables_get'] = {
  /**
   * Block for variable getter.
   * @this Blockly.Block
   */
  init: function() {
    this.setColour(Blockly.getBlockHue('blockhue_variables'));
    this.appendValueInput('VAR')
        .appendField(Blockly.Msg.VARIABLES_GET_TITLE);
    this.appendDummyInput()
        .appendField('.')
        .appendField(new Blockly.FieldScopeVariable('HASHKEY'), 'HASHKEY')
        .appendField(Blockly.Msg.VARIABLES_GET_TAIL);
    this.setOutput(true);
    this.setInputsInline(true);
    this.contextMenuMsg_ = Blockly.Msg.VARIABLES_GET_CREATE_SET;
    this.contextMenuType_ = 'hash_variables_set';
  },

  getScopeVars: Blockly.Blocks['hash_variables_get'].getScopeVars,
  renameScopeVar: Blockly.Blocks['hash_variables_get'].renameScopeVar,
//  customContextMenu: Blockly.Blocks['hash_variables_get'].customContextMenu
  helpUrl: Blockly.getUrlString('variables_hash_param_get_url'),
  tooltip: Blockly.getToolTipString('variables_hash_param_get_tooltip'),
  typeblock: Blockly.getMsgString('variables_hash_param_get_typeblock')
};

Blockly.Blocks['hash_variables_set'] = {
  /**
   * Block for variable setter.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": Blockly.Msg.SCOPE_VARIABLES_SET,
      "args0": [
        {
          "type": "field_variable",
          "name": "VAR",
          "variable": Blockly.Msg.VARIABLES_DEFAULT_NAME
        },
        {
          "type": "field_scopevariable",
          "name": "HASHKEY",
          "scope": "HASHKEY"
        },
        {
          "type": "input_value",
          "name": "VALUE"
        }
      ],
      "previousStatement": null,
      "nextStatement": null,
      "colour": Blockly.Blocks.variables.HUE,
      "tooltip": Blockly.getToolTipString('variables_hash_param_set_tooltip'), //Blockly.Msg.VARIABLES_SET_TOOLTIP,
      "helpUrl": Blockly.getUrlString('variables_hash_param_set_url') //Blockly.Msg.VARIABLES_SET_HELPURL,
    });
    this.procedurePrefix_ = '';
    this.contextMenuMsg_ = Blockly.Msg.VARIABLES_SET_CREATE_GET;
    this.contextMenuType_ = 'hash_variables_get';
  },

  onchange: Blockly.Blocks['hash_variables_get'].onchange,
  getVars: Blockly.Blocks['hash_variables_get'].getVars,
  renameVar: Blockly.Blocks['hash_variables_get'].renameVar,
  getScopeVars: Blockly.Blocks['hash_variables_get'].getScopeVars,
  getVarsTypes: Blockly.Blocks['hash_variables_get'].getVarsTypes,
  renameScopeVar: Blockly.Blocks['hash_variables_get'].renameScopeVar,
  customContextMenu: Blockly.Blocks['hash_variables_get'].customContextMenu,
  typeblock: Blockly.getMsgString('variables_hash_param_set_typeblock')
};

Blockly.Blocks['initialize_variable'] = {
  /**
   * Block for variable setter.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": Blockly.Msg.INITIALIZE_VARIABLE,
      "args0": [
        {
          "type": "field_variable",
          "name": "VAR",
          "variable": "Variable"
        },
        {
          "type": "field_scopevariable",
          "scope": 'Types',
          "name": "TYPE"
        },
        {
          "type": "input_value",
          "name": "VALUE",
          "align": "RIGHT"
        }
      ],
      "inputsInline": true,
      "previousStatement": null,
      "nextStatement": null,
      "colour": Blockly.Blocks.variables.HUE,
      "tooltip": "",
      "helpUrl": "http://www.example.com/"
    });
    this.procedurePrefix_ = '';
    var typeField = this.getField('TYPE');
    typeField.setChangeHandler(this.changeType);
    typeField.setMsgEmpty('Any');
    typeField.setValue('');
    this.contextMenuMsg_ = Blockly.Msg.VARIABLES_SET_CREATE_GET;
  },
  isTopLevel: true,
  onchange: function() {
    if (Blockly.dragMode_ != 0) {
      // Don't update blocks around while the user is moving them.
      return;
    }
    // Is the block nested in a procedure?
    var prefix = Blockly.Variables.getLocalContext(this, null);

    var title = Blockly.Msg.INITIALIZE_GLOBAL_VARIABLE;
    var colour = Blockly.Blocks.variables.HUE;
    this.procedurePrefix_ = '';
    // See if we are a local variable
    if (prefix != null) {
      this.procedurePrefix_ = prefix;
      colour = Blockly.Blocks.procedures.HUE;
      title = Blockly.Msg.INITIALIZE_LOCAL_VARIABLE;
    }

    // Update the block with the right color and text
    this.getInput('VALUE').fieldRow[0].setText(title);
    if (colour != this.getColour()) {
      this.setColour(colour);
    }
  },

  getVars: Blockly.Blocks['variables_get'].getVars,
  renameVar: Blockly.Blocks['variables_get'].renameVar,
  changeType: function(newType) {
    var block = this.sourceBlock_;
    block.getInput('VALUE').setCheck(newType);
  },
  /**
   * Return all Scoped Variables referenced by this block.
   * @param {string} varclass class of variable to get.
   * @return {!Array.<string>} List of hashkey names.
   * @this Blockly.Block
   */
  getScopeVars: function(varclass) {
    var result = [];
    if (varclass === 'Types') {
      result.push(this.getFieldValue('TYPE'));
    }
    return result;
  },
  /**
   * Return all types of variables referenced by this block.
   * @return {!Array.<Object>} List of variable names with their types.
   * @this Blockly.Block
   */
  getVarsTypes: function() {
    var vartypes = {};
    var type = this.getFieldValue('TYPE');
    if (type) {
      type = [type];
    } else {
      var item = this.getInputTargetBlock('VALUE');
      if (item) {
        type = item.getOutput();
      }
    }
    vartypes[this.procedurePrefix_+this.getFieldValue('VAR')] = type;
    return vartypes;
  },
  /**
   * Notification that a Scoped Variable is renaming.
   * If the name matches one of this block's Scoped Variables, rename it.
   * @param {string} oldName Previous name of Scoped Variable.
   * @param {string} newName Renamed Scoped Variable.
   * @param {string} varclass class of variable to rename
   * @this Blockly.Block
   */
  renameScopeVar: function(oldName, newName,varclass) {
    if (varclass === 'Types' &&
        Blockly.Names.equals(oldName, this.getFieldValue('TYPE'))) {
      this.setFieldValue(newName, 'TYPE');
    }
  },
  contextMenuType_: 'variables_get',
  customContextMenu: Blockly.Blocks['variables_get'].customContextMenu,
  typeblock: Blockly.getMsgString('variables_hash_param_set_typeblock')
};

