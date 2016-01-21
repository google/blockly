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
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Blockly.FieldVariable');

goog.require('Blockly.FieldDropdown');
goog.require('Blockly.Msg');
goog.require('Blockly.Variable');
goog.require('Blockly.Variables');
goog.require('goog.string');


/**
 * Class for a variable's dropdown field.
 * @param {?Blockly.Variable} varname The default name for the variable.  If null,
 *     a unique variable name will be generated.
 * @param {Function=} opt_validator A function that is executed when a new
 *     option is selected.  Its sole argument is the new option value.
 * @extends {Blockly.FieldDropdown}
 * @constructor
 */
Blockly.FieldVariable = function(variable, opt_validator) {
  Blockly.FieldVariable.superClass_.constructor.call(this,
      Blockly.FieldVariable.dropdownCreate, opt_validator);
  this.setValue(variable || { name: '' });
};
goog.inherits(Blockly.FieldVariable, Blockly.FieldDropdown);

/**
 * Sets a new change handler for angle field.
 * @param {Function} handler New change handler, or null.
 */
Blockly.FieldVariable.prototype.setValidator = function(handler) {
  var wrappedHandler;
  if (handler) {
    // Wrap the user's change handler together with the variable rename handler.
    wrappedHandler = function(value) {
      var v1 = handler.call(this, value);
      if (v1 === null) {
        var v2 = v1;
      } else {
        if (v1 === undefined) {
          v1 = value;
        }
        var v2 = Blockly.FieldVariable.dropdownChange.call(this, v1);
        if (v2 === undefined) {
          v2 = v1;
        }
      }
      return v2 === value ? undefined : v2;
    };
  } else {
    wrappedHandler = Blockly.FieldVariable.dropdownChange;
  }
  Blockly.FieldVariable.superClass_.setValidator.call(this, wrappedHandler);
};

/**
 * Install this dropdown on a block.
 * @param {!Blockly.Block} block The block containing this text.
 */
Blockly.FieldVariable.prototype.init = function(block) {
  if (this.sourceBlock_) {
    // Dropdown has already been initialized once.
    return;
  }
  Blockly.FieldVariable.superClass_.init.call(this, block);
  if (!this.getValue()) {
    // Variables without names get uniquely named for this workspace.
    var workspace =
        block.isInFlyout ? block.workspace.targetWorkspace : block.workspace;
    this.setValue({ name: Blockly.Variables.generateUniqueName(workspace) });
  }

  this.validator_(this.getValue());
};

/**
 * Get the variable (use a variableDB to convert into a real name).
 * Unlike a regular dropdown, variables have no neutral value.
 * @return {!Blockly.Variable} Current text.
 */
Blockly.FieldVariable.prototype.getValue = function () {
    return this.value_;
};

/**
 * Set the variable.
 * @param {!Blockly.Variable} variable New variable.
 */
Blockly.FieldVariable.prototype.setValue = function (variable) {
  if (this.sourceBlock_ && Blockly.Events.isEnabled()) {
    Blockly.Events.fire(new Blockly.Events.Change(
        this.sourceBlock_, 'field', this.name, this.value_, variable));
  }
  this.value_ = variable;
  if(variable && variable.name !== undefined)
    this.setText(variable.name);
};

/**
 * Method to convert field value to dom
 */
Blockly.FieldVariable.prototype.toDom = function() {
  var value = this.getValue();

  var name = value;
  if (typeof value === 'object') {
      name = value.name;
  }

  var container = goog.dom.createDom('field', null, name);
  return container;
};

/**
 * Method to convert dom to field value.
 * @param {!Element} xml The xml representing the fields value.
 * @param {!Blockly.Workspace} workspace Current Blockly workspace.
 */
Blockly.FieldVariable.prototype.fromDom = function(xml, workspace) {
    
    // default first
    var variables = Blockly.Variables.allVariables(workspace);
    var variable = null;

  var xmlChild = xml.firstChild;
    if (xmlChild) {
  var varname = xmlChild.textContent;
        variables = variables.filter(function(e) { return e.name == varname; });
        variable = variables.length > 0 ? variables[0] : null;
        // if we don't find a variable we create a default one with this name
  if (!variable)
      variable = { name: varname };
    }

  this.setValue(variable);
};

/**
 * Return a sorted list of variable names for variable dropdown menus.
 * Include a special option at the end for creating a new variable name.
 * @return {!Array.<string>} Array of variable names.
 * @this {!Blockly.FieldVariable}
 */
Blockly.FieldVariable.dropdownCreate = function() {
  if (this.sourceBlock_ && this.sourceBlock_.workspace) {
    var variableList =
        Blockly.Variables.allVariables(this.sourceBlock_.workspace);
  } else {
    var variableList = [];
  }
  // Ensure that the currently selected variable is an option.
  var variable = this.getValue();
  if (variable && goog.array.findIndex( variableList, function(e) { return e.name == variable.name; }) == -1) {
      variableList.push(variable);
  }
  variableList.sort(function(a, b) { return goog.string.caseInsensitiveCompare(a.name,b.name) });
  variableList.push(Blockly.Msg.RENAME_VARIABLE);
  variableList.push(Blockly.Msg.NEW_VARIABLE);
  // Variables are not language-specific, use the name as both the user-facing
  // text and the internal representation.
  var options = [];
  for (var x = 0; x < variableList.length; x++) {
      if(typeof variableList[x] === "string")
          options[x] = [variableList[x], variableList[x]];
      else
          options[x] = [variableList[x].name, variableList[x]];
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
 * @this {!Blockly.FieldVariable}
 */
Blockly.FieldVariable.dropdownChange = function(text) {
  function promptName(promptText, defaultText) {
    Blockly.hideChaff();
    var newVar = window.prompt(promptText, defaultText);
    // Merge runs of whitespace.  Strip leading and trailing whitespace.
    // Beyond this, all names are legal.
    if (newVar) {
      newVar = newVar.replace(/[\s\xa0]+/g, ' ').replace(/^ | $/g, '');
      if (newVar == Blockly.Msg.RENAME_VARIABLE ||
          newVar == Blockly.Msg.NEW_VARIABLE) {
        // Ok, not ALL names are legal...
        newVar = null;
      }
    }
    return newVar;
  }

    if (!this.sourceBlock_) return undefined;
  var workspace = this.sourceBlock_.workspace;
  if (text == Blockly.Msg.RENAME_VARIABLE) {
    var oldVar = this.getValue();
    text = promptName(Blockly.Msg.RENAME_VARIABLE_TITLE.replace('%1', oldVar.name),
                      oldVar.name);
    if (text) {
        Blockly.Variables.changeVariable(oldVar, {name: text, type: oldVar.type}, workspace);
    }
    return null;
  } else if (text == Blockly.Msg.NEW_VARIABLE) {
      text = promptName(Blockly.Msg.NEW_VARIABLE_TITLE, '');
      
    // Since variables are case-insensitive, ensure that if the new variable
    // matches with an existing variable, the new case prevails throughout.
      if (text) {
          var newVar = { name: text };
          Blockly.Variables.changeVariable(newVar, newVar, workspace);
        return newVar;
    }
    return null;
  }
  return undefined;
};
