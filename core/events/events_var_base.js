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

const {Abstract: AbstractEvent} = goog.require('Blockly.Events.Abstract');
/* eslint-disable-next-line no-unused-vars */
const {VariableModel} = goog.requireType('Blockly.VariableModel');


/**
 * Abstract class for a variable event.
 * @extends {AbstractEvent}
 * @alias Blockly.Events.VarBase
 */
class VarBase extends AbstractEvent {
  /**
   * @param {!VariableModel=} opt_variable The variable this event
   *     corresponds to.  Undefined for a blank event.
   */
  constructor(opt_variable) {
    super();
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
  }

  /**
   * Encode the event as JSON.
   * @return {!Object} JSON representation.
   */
  toJson() {
    const json = super.toJson();
    json['varId'] = this.varId;
    return json;
  }

  /**
   * Decode the JSON event.
   * @param {!Object} json JSON representation.
   */
  fromJson(json) {
    super.fromJson(json);
    this.varId = json['varId'];
  }
}

exports.VarBase = VarBase;
