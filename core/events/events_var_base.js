/**
 * @license
 * Copyright 2018 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Abstract class for a variable event.
 * @author fenichel@google.com (Rachel Fenichel)
 */
'use strict';

goog.provide('Blockly.Events.VarBase');

goog.require('Blockly.Events');
goog.require('Blockly.Events.Abstract');
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
  const json = Blockly.Events.VarBase.superClass_.toJson.call(this);
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
