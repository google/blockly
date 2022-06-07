/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Components for the variable model.
 */
'use strict';

/**
 * Components for the variable model.
 * @class
 */
goog.module('Blockly.VariableModel');

const eventUtils = goog.require('Blockly.Events.utils');
const idGenerator = goog.require('Blockly.utils.idGenerator');
/* eslint-disable-next-line no-unused-vars */
const {Workspace} = goog.requireType('Blockly.Workspace');
/** @suppress {extraRequire} */
goog.require('Blockly.Events.VarCreate');


/**
 * Class for a variable model.
 * Holds information for the variable including name, ID, and type.
 * @see {Blockly.FieldVariable}
 * @alias Blockly.VariableModel
 */
class VariableModel {
  /**
   * @param {!Workspace} workspace The variable's workspace.
   * @param {string} name The name of the variable.  This is the user-visible
   *     name (e.g. 'my var' or '私の変数'), not the generated name.
   * @param {string=} opt_type The type of the variable like 'int' or 'string'.
   *     Does not need to be unique. Field_variable can filter variables based
   * on their type. This will default to '' which is a specific type.
   * @param {string=} opt_id The unique ID of the variable. This will default to
   *     a UUID.
   */
  constructor(workspace, name, opt_type, opt_id) {
    /**
     * The workspace the variable is in.
     * @type {!Workspace}
     */
    this.workspace = workspace;

    /**
     * The name of the variable, typically defined by the user.  It may be
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
     * A unique ID for the variable. This should be defined at creation and
     * not change, even if the name changes. In most cases this should be a
     * UUID.
     * @type {string}
     * @private
     */
    this.id_ = opt_id || idGenerator.genUid();

    eventUtils.fire(new (eventUtils.get(eventUtils.VAR_CREATE))(this));
  }
  /**
   * @return {string} The ID for the variable.
   */
  getId() {
    return this.id_;
  }
  /**
   * A custom compare function for the VariableModel objects.
   * @param {VariableModel} var1 First variable to compare.
   * @param {VariableModel} var2 Second variable to compare.
   * @return {number} -1 if name of var1 is less than name of var2, 0 if equal,
   *     and 1 if greater.
   * @package
   */
  static compareByName(var1, var2) {
    return var1.name.localeCompare(var2.name, undefined, {sensitivity: 'base'});
  }
}

exports.VariableModel = VariableModel;
