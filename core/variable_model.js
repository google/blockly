/**
 * @license
 * Copyright 2017 Google LLC
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
 * @fileoverview Components for the variable model.
 * @author marisaleung@google.com (Marisa Leung)
 */
'use strict';

goog.provide('Blockly.VariableModel');

goog.require('Blockly.Events');
goog.require('Blockly.Events.VarCreate');
goog.require('Blockly.utils');


/**
 * Class for a variable model.
 * Holds information for the variable including name, ID, and type.
 * @param {!Blockly.Workspace} workspace The variable's workspace.
 * @param {string} name The name of the variable. This must be unique across
 *     variables and procedures.
 * @param {string=} opt_type The type of the variable like 'int' or 'string'.
 *     Does not need to be unique. Field_variable can filter variables based on
 *     their type. This will default to '' which is a specific type.
 * @param {string=} opt_id The unique ID of the variable. This will default to
 *     a UUID.
 * @see {Blockly.FieldVariable}
 * @constructor
 */
Blockly.VariableModel = function(workspace, name, opt_type, opt_id) {
  /**
   * The workspace the variable is in.
   * @type {!Blockly.Workspace}
   */
  this.workspace = workspace;

  /**
   * The name of the variable, typically defined by the user. It must be
   * unique across all names used for procedures and variables. It may be
   * changed by the user.
   * @type {string}
   */
  this.name = name;

  /**
   * The type of the variable, such as 'int' or 'sound_effect'. This may be
   * used to build a list of variables of a specific type. By default this is
   * the empty string '', which is a specific type.
   * @see {Blockly.FieldVariable}
   * @type {string}
   */
  this.type = opt_type || '';

  /**
   * A unique id for the variable. This should be defined at creation and
   * not change, even if the name changes. In most cases this should be a
   * UUID.
   * @type {string}
   * @private
   */
  this.id_ = opt_id || Blockly.utils.genUid();

  Blockly.Events.fire(new Blockly.Events.VarCreate(this));
};

/**
 * @return {string} The ID for the variable.
 */
Blockly.VariableModel.prototype.getId = function() {
  return this.id_;
};

/**
 * A custom compare function for the VariableModel objects.
 * @param {Blockly.VariableModel} var1 First variable to compare.
 * @param {Blockly.VariableModel} var2 Second variable to compare.
 * @return {number} -1 if name of var1 is less than name of var2, 0 if equal,
 *     and 1 if greater.
 * @package
 */
Blockly.VariableModel.compareByName = function(var1, var2) {
  var name1 = var1.name.toLowerCase();
  var name2 = var2.name.toLowerCase();
  if (name1 < name2) {
    return -1;
  } else if (name1 == name2) {
    return 0;
  } else {
    return 1;
  }
};
