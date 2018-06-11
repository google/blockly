/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2018 Google Inc.
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
 * @fileoverview Classes for all types of variable events.
 * @author fenichel@google.com (Rachel Fenichel)
 */
'use strict';

goog.provide('Blockly.Events.VarBase');
goog.provide('Blockly.Events.VarCreate');
goog.provide('Blockly.Events.VarDelete');
goog.provide('Blockly.Events.VarRename');

goog.require('Blockly.Events');
goog.require('Blockly.Events.Abstract');


/**
 * Abstract class for a variable event.
 * @param {Blockly.VariableModel} variable The variable this event corresponds
 *     to.
 * @extends {Blockly.Events.Abstract}
 * @constructor
 */
Blockly.Events.VarBase = function(variable) {
  Blockly.Events.VarBase.superClass_.constructor.call(this);

  /**
   * The variable id for the variable this event pertains to.
   * @type {string}
   */
  this.varId = variable.getId();
  this.workspaceId = variable.workspace.id;
};
goog.inherits(Blockly.Events.VarBase, Blockly.Events.Abstract);

/**
 * Encode the event as JSON.
 * @return {!Object} JSON representation.
 */
Blockly.Events.VarBase.prototype.toJson = function() {
  var json = Blockly.Events.VarBase.superClass_.toJson.call(this);
  json['varId'] = this.varId;
  return json;
};

/**
 * Decode the JSON event.
 * @param {!Object} json JSON representation.
 */
Blockly.Events.VarBase.prototype.fromJson = function(json) {
  Blockly.Events.VarBase.superClass_.toJson.call(this);
  this.varId = json['varId'];
};

/**
 * Class for a variable creation event.
 * @param {Blockly.VariableModel} variable The created variable.
 *     Null for a blank event.
 * @extends {Blockly.Events.VarBase}
 * @constructor
 */
Blockly.Events.VarCreate = function(variable) {
  if (!variable) {
    return;  // Blank event to be populated by fromJson.
  }
  Blockly.Events.VarCreate.superClass_.constructor.call(this, variable);
  this.varType = variable.type;
  this.varName = variable.name;
};
goog.inherits(Blockly.Events.VarCreate, Blockly.Events.VarBase);

/**
 * Type of this event.
 * @type {string}
 */
Blockly.Events.VarCreate.prototype.type = Blockly.Events.VAR_CREATE;

/**
 * Encode the event as JSON.
 * @return {!Object} JSON representation.
 */
Blockly.Events.VarCreate.prototype.toJson = function() {
  var json = Blockly.Events.VarCreate.superClass_.toJson.call(this);
  json['varType'] = this.varType;
  json['varName'] = this.varName;
  return json;
};

/**
 * Decode the JSON event.
 * @param {!Object} json JSON representation.
 */
Blockly.Events.VarCreate.prototype.fromJson = function(json) {
  Blockly.Events.VarCreate.superClass_.fromJson.call(this, json);
  this.varType = json['varType'];
  this.varName = json['varName'];
};

/**
 * Run a variable creation event.
 * @param {boolean} forward True if run forward, false if run backward (undo).
 */
Blockly.Events.VarCreate.prototype.run = function(forward) {
  var workspace = this.getEventWorkspace_();
  if (forward) {
    workspace.createVariable(this.varName, this.varType, this.varId);
  } else {
    workspace.deleteVariableById(this.varId);
  }
};

/**
 * Class for a variable deletion event.
 * @param {Blockly.VariableModel} variable The deleted variable.
 *     Null for a blank event.
 * @extends {Blockly.Events.VarBase}
 * @constructor
 */
Blockly.Events.VarDelete = function(variable) {
  if (!variable) {
    return;  // Blank event to be populated by fromJson.
  }
  Blockly.Events.VarDelete.superClass_.constructor.call(this, variable);
  this.varType = variable.type;
  this.varName = variable.name;
};
goog.inherits(Blockly.Events.VarDelete, Blockly.Events.VarBase);

/**
 * Type of this event.
 * @type {string}
 */
Blockly.Events.VarDelete.prototype.type = Blockly.Events.VAR_DELETE;

/**
 * Encode the event as JSON.
 * @return {!Object} JSON representation.
 */
Blockly.Events.VarDelete.prototype.toJson = function() {
  var json = Blockly.Events.VarDelete.superClass_.toJson.call(this);
  json['varType'] = this.varType;
  json['varName'] = this.varName;
  return json;
};

/**
 * Decode the JSON event.
 * @param {!Object} json JSON representation.
 */
Blockly.Events.VarDelete.prototype.fromJson = function(json) {
  Blockly.Events.VarDelete.superClass_.fromJson.call(this, json);
  this.varType = json['varType'];
  this.varName = json['varName'];
};

/**
 * Run a variable deletion event.
 * @param {boolean} forward True if run forward, false if run backward (undo).
 */
Blockly.Events.VarDelete.prototype.run = function(forward) {
  var workspace = this.getEventWorkspace_();
  if (forward) {
    workspace.deleteVariableById(this.varId);
  } else {
    workspace.createVariable(this.varName, this.varType, this.varId);
  }
};

/**
 * Class for a variable rename event.
 * @param {Blockly.VariableModel} variable The renamed variable.
 *     Null for a blank event.
 * @param {string} newName The new name the variable will be changed to.
 * @extends {Blockly.Events.VarBase}
 * @constructor
 */
Blockly.Events.VarRename = function(variable, newName) {
  if (!variable) {
    return;  // Blank event to be populated by fromJson.
  }
  Blockly.Events.VarRename.superClass_.constructor.call(this, variable);
  this.oldName = variable.name;
  this.newName = newName;
};
goog.inherits(Blockly.Events.VarRename, Blockly.Events.VarBase);

/**
 * Type of this event.
 * @type {string}
 */
Blockly.Events.VarRename.prototype.type = Blockly.Events.VAR_RENAME;

/**
 * Encode the event as JSON.
 * @return {!Object} JSON representation.
 */
Blockly.Events.VarRename.prototype.toJson = function() {
  var json = Blockly.Events.VarRename.superClass_.toJson.call(this);
  json['oldName'] = this.oldName;
  json['newName'] = this.newName;
  return json;
};

/**
 * Decode the JSON event.
 * @param {!Object} json JSON representation.
 */
Blockly.Events.VarRename.prototype.fromJson = function(json) {
  Blockly.Events.VarRename.superClass_.fromJson.call(this, json);
  this.oldName = json['oldName'];
  this.newName = json['newName'];
};

/**
 * Run a variable rename event.
 * @param {boolean} forward True if run forward, false if run backward (undo).
 */
Blockly.Events.VarRename.prototype.run = function(forward) {
  var workspace = this.getEventWorkspace_();
  if (forward) {
    workspace.renameVariableById(this.varId, this.newName);
  } else {
    workspace.renameVariableById(this.varId, this.oldName);
  }
};
