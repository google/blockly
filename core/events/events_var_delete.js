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

goog.module('Blockly.Events.VarDelete');
goog.module.declareLegacyNamespace();

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
const VarDelete = function(opt_variable) {
  VarDelete.superClass_.constructor.call(this, opt_variable);
  if (!opt_variable) {
    return;  // Blank event to be populated by fromJson.
  }

  this.varType = opt_variable.type;
  this.varName = opt_variable.name;
};
Blockly.utils.object.inherits(VarDelete, Blockly.Events.VarBase);

/**
 * Type of this event.
 * @type {string}
 */
VarDelete.prototype.type = Blockly.Events.VAR_DELETE;

/**
 * Encode the event as JSON.
 * @return {!Object} JSON representation.
 */
VarDelete.prototype.toJson = function() {
  const json = VarDelete.superClass_.toJson.call(this);
  json['varType'] = this.varType;
  json['varName'] = this.varName;
  return json;
};

/**
 * Decode the JSON event.
 * @param {!Object} json JSON representation.
 */
VarDelete.prototype.fromJson = function(json) {
  VarDelete.superClass_.fromJson.call(this, json);
  this.varType = json['varType'];
  this.varName = json['varName'];
};

/**
 * Run a variable deletion event.
 * @param {boolean} forward True if run forward, false if run backward (undo).
 */
VarDelete.prototype.run = function(forward) {
  const workspace = this.getEventWorkspace_();
  if (forward) {
    workspace.deleteVariableById(this.varId);
  } else {
    workspace.createVariable(this.varName, this.varType, this.varId);
  }
};

Blockly.registry.register(Blockly.registry.Type.EVENT,
    Blockly.Events.VAR_DELETE, VarDelete);

exports = VarDelete;
