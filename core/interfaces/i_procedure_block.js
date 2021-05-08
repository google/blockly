/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview The interface for a procedure block.
 */

'use strict';

goog.provide('Blockly.IProcedureBlock');

/**
 * A procedure block interface.
 * @interface
 */
Blockly.IProcedureBlock = function() {};

/**
 * Returns the name of the procedure the procedure block calls.
 * @return {string}
 */
Blockly.IProcedureBlock.prototype.getProcedureCall;

/**
 * Renames the procedure from the old name to the new name. If the procedure
 * block receives this and the old name matches the block's current name, it
 * should update itself to have the new name instead.
 * @param {string} oldName The old name of the procedure.
 * @param {string} newName The new name of hte procedure.
 */
Blockly.IProcedureBlock.prototype.renameProcedure;

/**
 * Returns the signature of the procedure block's procedure definition.
 * @return {!Array} Tuple containing three elements:
 *     - {string} the name of the defined procedure
 *     - {!Array<string>} a list of all its arguments
 *     - {boolean} whether it has a return value or not
 */
Blockly.IProcedureBlock.prototype.getProcedureDef;
