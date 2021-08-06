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

goog.provide('Blockly.Events.VarDelete');

goog.require('Blockly.Events');
goog.require('Blockly.Events.VarBase');
goog.require('Blockly.registry');
goog.require('Blockly.utils.object');

goog.requireType('Blockly.VariableModel');


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
  const json = Blockly.Events.VarDelete.superClass_.toJson.call(this);
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
  const workspace = this.getEventWorkspace_();
  if (forward) {
    workspace.deleteVariableById(this.varId);
  } else {
    workspace.createVariable(this.varName, this.varType, this.varId);
  }
};

Blockly.registry.register(Blockly.registry.Type.EVENT,
    Blockly.Events.VAR_DELETE, Blockly.Events.VarDelete);
