/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview An enum for the possible types of inputs.
 */

'use strict';

/**
 * An enum for the possible types of inputs.
 * @namespace Blockly.inputTypes
 */
goog.module('Blockly.inputTypes');

const {ConnectionType} = goog.require('Blockly.ConnectionType');


/**
 * Enum for the type of a connection or input.
 * @enum {number}
 * @alias Blockly.inputTypes
 */
const inputTypes = {
  // A right-facing value input.  E.g. 'set item to' or 'return'.
  VALUE: ConnectionType.INPUT_VALUE,
  // A down-facing block stack.  E.g. 'if-do' or 'else'.
  STATEMENT: ConnectionType.NEXT_STATEMENT,
  // A dummy input.  Used to add field(s) with no input.
  DUMMY: 5,
};

exports.inputTypes = inputTypes;
