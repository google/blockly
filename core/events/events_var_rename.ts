/**
 * @license
 * Copyright 2018 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Class for a variable rename event.
 */
'use strict';

/**
 * Class for a variable rename event.
 * @class
 */
goog.module('Blockly.Events.VarRename');

const eventUtils = goog.require('Blockly.Events.utils');
const registry = goog.require('Blockly.registry');
const {VarBase} = goog.require('Blockly.Events.VarBase');
/* eslint-disable-next-line no-unused-vars */
const {VariableModel} = goog.requireType('Blockly.VariableModel');


/**
 * Class for a variable rename event.
 * @extends {VarBase}
 * @alias Blockly.Events.VarRename
 */
class VarRename extends VarBase {
  /**
   * @param {!VariableModel=} opt_variable The renamed variable. Undefined
   *     for a blank event.
   * @param {string=} newName The new name the variable will be changed to.
   */
  constructor(opt_variable, newName) {
    super(opt_variable);

    /**
     * Type of this event.
     * @type {string}
     */
    this.type = eventUtils.VAR_RENAME;

    if (!opt_variable) {
      return;  // Blank event to be populated by fromJson.
    }

    this.oldName = opt_variable.name;
    this.newName = typeof newName === 'undefined' ? '' : newName;
  }

  /**
   * Encode the event as JSON.
   * @return {!Object} JSON representation.
   */
  toJson() {
    const json = super.toJson();
    json['oldName'] = this.oldName;
    json['newName'] = this.newName;
    return json;
  }

  /**
   * Decode the JSON event.
   * @param {!Object} json JSON representation.
   */
  fromJson(json) {
    super.fromJson(json);
    this.oldName = json['oldName'];
    this.newName = json['newName'];
  }

  /**
   * Run a variable rename event.
   * @param {boolean} forward True if run forward, false if run backward (undo).
   */
  run(forward) {
    const workspace = this.getEventWorkspace_();
    if (forward) {
      workspace.renameVariableById(this.varId, this.newName);
    } else {
      workspace.renameVariableById(this.varId, this.oldName);
    }
  }
}

registry.register(registry.Type.EVENT, eventUtils.VAR_RENAME, VarRename);

exports.VarRename = VarRename;
