/**
 * @license
 * Copyright 2018 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Class for a variable rename event.
 * @author fenichel@google.com (Rachel Fenichel)
 */
'use strict';

goog.module('Blockly.Events.VarRename');
goog.module.declareLegacyNamespace();

goog.require('Blockly.Events');
goog.require('Blockly.Events.VarBase');
goog.require('Blockly.registry');
goog.require('Blockly.utils.object');

goog.requireType('Blockly.VariableModel');


/**
 * Class for a variable rename event.
 * @param {!Blockly.VariableModel=} opt_variable The renamed variable. Undefined
 *     for a blank event.
 * @param {string=} newName The new name the variable will be changed to.
 * @extends {Blockly.Events.VarBase}
 * @constructor
 */
const VarRename = function(opt_variable, newName) {
  VarRename.superClass_.constructor.call(this, opt_variable);
  if (!opt_variable) {
    return;  // Blank event to be populated by fromJson.
  }

  this.oldName = opt_variable.name;
  this.newName = typeof newName == 'undefined' ? '' : newName;
};
Blockly.utils.object.inherits(VarRename, Blockly.Events.VarBase);

/**
 * Type of this event.
 * @type {string}
 */
VarRename.prototype.type = Blockly.Events.VAR_RENAME;

/**
 * Encode the event as JSON.
 * @return {!Object} JSON representation.
 */
VarRename.prototype.toJson = function() {
  const json = VarRename.superClass_.toJson.call(this);
  json['oldName'] = this.oldName;
  json['newName'] = this.newName;
  return json;
};

/**
 * Decode the JSON event.
 * @param {!Object} json JSON representation.
 */
VarRename.prototype.fromJson = function(json) {
  VarRename.superClass_.fromJson.call(this, json);
  this.oldName = json['oldName'];
  this.newName = json['newName'];
};

/**
 * Run a variable rename event.
 * @param {boolean} forward True if run forward, false if run backward (undo).
 */
VarRename.prototype.run = function(forward) {
  const workspace = this.getEventWorkspace_();
  if (forward) {
    workspace.renameVariableById(this.varId, this.newName);
  } else {
    workspace.renameVariableById(this.varId, this.oldName);
  }
};

Blockly.registry.register(Blockly.registry.Type.EVENT,
    Blockly.Events.VAR_RENAME, VarRename);

exports = VarRename;
