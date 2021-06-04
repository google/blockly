/**
 * @license
 * Copyright 2018 Google LLC
 * SPDX-License-Identifier: Apache-2.0
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
goog.require('Blockly.registry');
goog.require('Blockly.utils.object');

goog.requireType('Blockly.VariableModel');


/**
 * Abstract class for a variable event.
 * @param {!Blockly.VariableModel=} opt_variable The variable this event
 *     corresponds to.  Undefined for a blank event.
 * @extends {Blockly.Events.Abstract}
 * @constructor
 */
Blockly.Events.VarBase = function(opt_variable) {
  Blockly.Events.VarBase.superClass_.constructor.call(this);
  this.isBlank = typeof opt_variable == 'undefined';

  /**
   * The variable id for the variable this event pertains to.
   * @type {string}
   */
  this.varId = this.isBlank ? '' : opt_variable.getId();

  /**
   * The workspace identifier for this event.
   * @type {string}
   */
  this.workspaceId = this.isBlank ? '' : opt_variable.workspace.id;
};
Blockly.utils.object.inherits(Blockly.Events.VarBase, Blockly.Events.Abstract);

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
 * @param {!Blockly.VariableModel=} opt_variable The created variable. Undefined
 *     for a blank event.
 * @extends {Blockly.Events.VarBase}
 * @constructor
 */
Blockly.Events.VarCreate = function(opt_variable) {
  Blockly.Events.VarCreate.superClass_.constructor.call(this, opt_variable);
  if (!opt_variable) {
    return;  // Blank event to be populated by fromJson.
  }

  this.varType = opt_variable.type;
  this.varName = opt_variable.name;
};
Blockly.utils.object.inherits(Blockly.Events.VarCreate, Blockly.Events.VarBase);

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
 * @param {!Blockly.VariableModel=} opt_variable The deleted variable. Undefined
 *     for a blank event.
 * @extends {Blockly.Events.VarBase}
 * @constructor
 */
Blockly.Events.VarDelete = function(opt_variable) {
  Blockly.Events.VarDelete.superClass_.constructor.call(this, opt_variable);
  if (!opt_variable) {
    return;  // Blank event to be populated by fromJson.
  }

  this.varType = opt_variable.type;
  this.varName = opt_variable.name;
};
Blockly.utils.object.inherits(Blockly.Events.VarDelete, Blockly.Events.VarBase);

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
 * @param {!Blockly.VariableModel=} opt_variable The renamed variable. Undefined
 *     for a blank event.
 * @param {string=} newName The new name the variable will be changed to.
 * @extends {Blockly.Events.VarBase}
 * @constructor
 */
Blockly.Events.VarRename = function(opt_variable, newName) {
  Blockly.Events.VarRename.superClass_.constructor.call(this, opt_variable);
  if (!opt_variable) {
    return;  // Blank event to be populated by fromJson.
  }

  this.oldName = opt_variable.name;
  this.newName = typeof newName == 'undefined' ? '' : newName;
};
Blockly.utils.object.inherits(Blockly.Events.VarRename, Blockly.Events.VarBase);

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

Blockly.registry.register(Blockly.registry.Type.EVENT,
    Blockly.Events.VAR_CREATE, Blockly.Events.VarCreate);
Blockly.registry.register(Blockly.registry.Type.EVENT,
    Blockly.Events.VAR_DELETE, Blockly.Events.VarDelete);
Blockly.registry.register(Blockly.registry.Type.EVENT,
    Blockly.Events.VAR_RENAME, Blockly.Events.VarRename);
