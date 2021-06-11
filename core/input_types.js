/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview An enum for the possible types of inputs.
 * @author fenichel@google.com (Rachel Fenichel)
 */

'use strict';

goog.provide('Blockly.inputTypes');

goog.require('Blockly.connectionTypes');

/**
 * Enum for the type of a connection or input.
 * @enum {number}
 */
Blockly.inputTypes = {
  // A right-facing value input.  E.g. 'set item to' or 'return'.
  VALUE: Blockly.connectionTypes.INPUT_VALUE,
  // A down-facing block stack.  E.g. 'if-do' or 'else'.
  STATEMENT: Blockly.connectionTypes.NEXT_STATEMENT,
  // A dummy input.  Used to add field(s) with no input.
  DUMMY: 5
};
