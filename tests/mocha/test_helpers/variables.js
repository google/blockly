/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

goog.module('Blockly.test.helpers.variables');


/**
 * Check if a variable with the given values exists.
 * @param {Blockly.Workspace|Blockly.VariableMap} container The workspace  or
 *     variableMap the checked variable belongs to.
 * @param {!string} name The expected name of the variable.
 * @param {!string} type The expected type of the variable.
 * @param {!string} id The expected id of the variable.
 */
function assertVariableValues(container, name, type, id) {
  const variable = container.getVariableById(id);
  chai.assert.isDefined(variable);
  chai.assert.equal(variable.name, name);
  chai.assert.equal(variable.type, type);
  chai.assert.equal(variable.getId(), id);
}
exports.assertVariableValues = assertVariableValues;
