/**
 * @license
 * Copyright 2018 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Abstract class for a variable event.
 */
'use strict';

/**
 * Abstract class for a variable event.
 * @class
 */
goog.module('Blockly.Events.VarBase');

const Abstract = goog.require('Blockly.Events.Abstract');
const object = goog.require('Blockly.utils.object');
/* eslint-disable-next-line no-unused-vars */
const {VariableModel} = goog.requireType('Blockly.VariableModel');


/**
 * Abstract class for a variable event.
 * @param {!VariableModel=} opt_variable The variable this event
 *     corresponds to.  Undefined for a blank event.
 * @extends {Abstract}
 * @constructor
 * @alias Blockly.Events.VarBase
 */
const VarBase = function(opt_variable) {
  VarBase.superClass_.constructor.call(this);
  this.isBlank = typeof opt_variable === 'undefined';

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
object.inherits(VarBase, Abstract);

/**
 * Encode the event as JSON.
 * @return {!Object} JSON representation.
 */
VarBase.prototype.toJson = function() {
  const json = VarBase.superClass_.toJson.call(this);
  json['varId'] = this.varId;
  return json;
};

/**
 * Decode the JSON event.
 * @param {!Object} json JSON representation.
 */
VarBase.prototype.fromJson = function(json) {
  VarBase.superClass_.toJson.call(this);
  this.varId = json['varId'];
};

exports.VarBase = VarBase;
