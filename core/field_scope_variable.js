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
 * @fileoverview Variable input field.
 * @author toebes@extremenetworks.com
 * based on field_variable.js by fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Blockly.FieldScopeVariable');

goog.require('Blockly.FieldDropdown');
goog.require('Blockly.Msg');
goog.require('Blockly.ScopeVariables');
goog.require('goog.string');


/**
 * Class for a variable's dropdown field.
 * @param {?string} varclass The default name for the variable.  If null,
 *     a unique variable name will be generated.
 * @param {Function} opt_changeHandler A function that is executed when a new
 *     option is selected.  Its sole argument is the new option value.  Its
 *     return value is ignored.
 * @extends {Blockly.FieldDropdown}
 * @constructor
 */
Blockly.FieldScopeVariable = function(varclass, opt_changeHandler) {
  this.msgRename_ = Blockly.Msg.RENAME_SCOPE_VARIABLE;
  this.msgRenameTitle_ = Blockly.Msg.RENAME_SCOPE_VARIABLE_TITLE;
  this.msgNew_ = Blockly.Msg.NEW_SCOPE_VARIABLE;
  this.msgNewTitle_ = Blockly.Msg.NEW_SCOPE_VARIABLE_TITLE;
  this.msgEmpty_ = null;

  this.setVarClass(varclass);
  this.setValue(this.getVarClass()[0]);

  Blockly.FieldScopeVariable.superClass_.constructor.call(this,
      Blockly.FieldScopeVariable.dropdownCreate, opt_changeHandler);

};
goog.inherits(Blockly.FieldScopeVariable, Blockly.FieldDropdown);

/**
 * Sets a new change handler for angle field.
 * @param {Function} handler New change handler, or null.
 */
Blockly.FieldScopeVariable.prototype.setChangeHandler = function(handler) {
  var wrappedHandler;
  if (handler) {
    // Wrap the user's change handler together with the variable rename handler.
    wrappedHandler = function(value) {
      var retVal = Blockly.FieldScopeVariable.dropdownChange.call(this, value);
      var newVal;
      if (retVal === undefined) {
        newVal = value;  // Existing variable selected.
      } else if (retVal === null) {
        newVal = this.getValue();  // Abort, no change.
      } else {
        newVal = retVal;  // Variable name entered.
      }
      handler.call(this, newVal);
      return retVal;
    };
  } else {
    wrappedHandler = Blockly.FieldScopeVariable.dropdownChange;
  }
  Blockly.FieldScopeVariable.superClass_.setChangeHandler.call(this,wrappedHandler);
};

/**
 * Install this dropdown on a block.
 * @param {!Blockly.Block} block The block containing this text.
 */
Blockly.FieldScopeVariable.prototype.init = function(block) {
  if (this.sourceBlock_) {
    // Dropdown has already been initialized once.
    return;
  }

  if (!this.getValue() && !this.msgEmpty_) {
    // Variables without names get uniquely named for this workspace.
    if (block.isInFlyout) {
      var workspace = block.workspace.targetWorkspace;
    } else {
      var workspace = block.workspace;
    }
    this.setValue(Blockly.ScopeVariables.generateUniqueName(workspace,
                                                            this.getVarClass()));
  }
  Blockly.FieldScopeVariable.superClass_.init.call(this, block);
};

/**
 * Get the variable's name (use a variableDB to convert into a real name).
 * Unline a regular dropdown, variables are literal and have no neutral value.
 * @return {string} Current text.
 */
Blockly.FieldScopeVariable.prototype.getValue = function() {
  var result = this.getText();
//  if (result === this.msgEmpty_) {
//    result = '';
//  }
  return result;
};

/**
 * Set the variable name.
 * @param {string} text New text.
 */
Blockly.FieldScopeVariable.prototype.setValue = function(text) {
  this.value_ = text;
  this.setText(text);
};

/**
 * Get the variable's name (use a variableDB to convert into a real name).
 * Unline a regular dropdown, variables are literal and have no neutral value.
 * @return {array} Array of classes
 */
Blockly.FieldScopeVariable.prototype.getVarClass = function() {
  return this.varClass_;
};

/**
 * Set the variable name.
 * @param {string} text New text.
 */
Blockly.FieldScopeVariable.prototype.setVarClass = function(varclass) {
  if (typeof varclass === "string") {
    this.varClass_ = [ varclass ];
  } else {
    this.varClass_ = varclass;
  }
};

/**
 * Set the variable prompt titles.
 * @param {string} text New text.
 */
Blockly.FieldScopeVariable.prototype.setMsgStrings = function(
          msgRename, msgRenameTitle, msgNew, msgNewTitle) {
  this.msgRename_ = msgRename;
  this.msgRenameTitle_ = msgRenameTitle;
  this.msgNew_ = msgNew;
  this.msgNewTitle_ = msgNewTitle;
};

Blockly.FieldScopeVariable.prototype.setMsgEmpty = function(
        msgEmpty) {
  this.msgEmpty_ = msgEmpty;
};

/**
 * Return a sorted list of variable names for variable dropdown menus.
 * Include a special option at the end for creating a new variable name.
 * @return {!Array.<string>} Array of variable names.
 * @this {!Blockly.FieldScopeVariable}
 */
Blockly.FieldScopeVariable.dropdownCreate = function() {
  // Figure out all the names for this type used in the code.
  if (this.sourceBlock_ && this.sourceBlock_.workspace) {
    var variableList =
        Blockly.ScopeVariables.allVariables(this.sourceBlock_.workspace,
                                            this.getVarClass());
  } else {
    var variableList = [];
  }
  // Get any standing fixed names.  Note that the list might actually be
  // a function to call to return the list
  var fixedList = Blockly.scopeVariableList[this.getVarClass()];
  if (typeof fixedList === 'function') {
    fixedList = fixedList();
  } else if (typeof fixedList === 'undefined') {
    fixedList = [];
  }

  // Ensure that the currently selected variable is an option.
  var name = this.getText();
  if (name && name !== '' && variableList.indexOf(name) == -1) {
    variableList.push(name);
  }
  variableList.sort(goog.string.caseInsensitiveCompare);

  // Now add in the fixed elements if they aren't in the original list
  for (var pos = 0; pos < fixedList.length; pos++) {
    if (!goog.array.contains(variableList, fixedList[pos])) {
      variableList.push(fixedList[pos]);
    }
  }
  // Let them rename it as long as it isn't one of the fixed names
  //
  if (name && this.msgRename_ && !goog.array.contains(fixedList,name)) {
    variableList.push(this.msgRename_);
  }
  // If they have a command to create a new one then add that in
  if (this.msgNew_) {
    variableList.push(this.msgNew_);
  }
  // Never leave an empty array.  The callers expect at least one item
  if (goog.array.isEmpty(variableList)) {
    variableList.push('');
  }

  // Variables are not language-specific, use the name as both the user-facing
  // text and the internal representation except for the empty string if any
  var options = [];
  if (this.msgEmpty_) {
    options.push([this.msgEmpty_, '']);
  }
  for (var x = 0; x < variableList.length; x++) {
    options.push([variableList[x], variableList[x]]);
  }
  return options;
};

/**
 * Event handler for a change in variable name.
 * Special case the 'New variable...' and 'Rename variable...' options.
 * In both of these special cases, prompt the user for a new name.
 * @param {string} text The selected dropdown menu option.
 * @return {null|undefined|string} An acceptable new variable name, or null if
 *     change is to be either aborted (cancel button) or has been already
 *     handled (rename), or undefined if an existing variable was chosen.
 * @this {!Blockly.FieldScopeVariable}
 */
Blockly.FieldScopeVariable.dropdownChange = function(text) {
  var me = this;
  function promptName(promptText, defaultText) {
    Blockly.hideChaff();
    var newVar = window.prompt(promptText, defaultText);
    // Merge runs of whitespace.  Strip leading and trailing whitespace.
    // Beyond this, all names are legal.
    if (newVar) {
      newVar = newVar.replace(/[\s\xa0]+/g, ' ').replace(/^ | $/g, '');
      if (newVar === me.msgRename_ ||
          newVar === me.msgNew_) {
        // Ok, not ALL names are legal...
        newVar = null;
      }
    }
    return newVar;
  }
  var workspace = this.sourceBlock_.workspace;
  if (text === this.msgRename_) {
    var oldVar = this.getText();
    text = promptName(this.msgRenameTitle_.replace('%1', oldVar), oldVar);
    if (text) {
      Blockly.ScopeVariables.renameVariable(oldVar, text, workspace,
                                            this.getVarClass());
    }
    return null;
  } else if (text === this.msgNew_) {
    text = promptName(this.msgNewTitle_, '');
    // Since variables are case-insensitive, ensure that if the new variable
    // matches with an existing variable, the new case prevails throughout.
    if (text) {
      Blockly.ScopeVariables.renameVariable(text, text, workspace,
                                            this.getVarClass());
      return text;
    }
    return null;
  }
  return undefined;
};
