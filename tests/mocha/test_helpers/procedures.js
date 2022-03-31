/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
goog.module('Blockly.test.helpers.procedures');

const {ConnectionType} = goog.require('Blockly.ConnectionType');


/**
 * Asserts that the procedure definition or call block has the expected var
 * models.
 * @param {!Blockly.Block} block The procedure definition or call block to
 *    check.
 * @param {!Array<string>} varIds An array of variable ids.
 */
function assertBlockVarModels(block, varIds) {
  const expectedVarModels = [];
  for (let i = 0; i < varIds.length; i++) {
    expectedVarModels.push(block.workspace.getVariableById(varIds[i]));
  }
  chai.assert.sameDeepOrderedMembers(block.getVarModels(), expectedVarModels);
}

/**
 * Asserts that the procedure call block has the expected arguments.
 * @param {!Blockly.Block} callBlock The procedure definition block.
 * @param {Array<string>=} args An array of argument names.
 */
function assertCallBlockArgsStructure(callBlock, args) {
  // inputList also contains "TOPROW"
  chai.assert.equal(callBlock.inputList.length - 1, args.length,
      'call block has the expected number of args');

  for (let i = 0; i < args.length; i++) {
    const expectedName = args[i];
    const callInput = callBlock.inputList[i + 1];
    chai.assert.equal(callInput.type, ConnectionType.INPUT_VALUE);
    chai.assert.equal(callInput.name, 'ARG' + i);
    chai.assert.equal(callInput.fieldRow[0].getValue(), expectedName,
        'Call block consts did not match expected.');
  }
  chai.assert.sameOrderedMembers(callBlock.getVars(), args);
}

/**
 * Asserts that the procedure definition block has the expected inputs and
 *    fields.
 * @param {!Blockly.Block} defBlock The procedure definition block.
 * @param {boolean=} hasReturn If we expect the procedure def to have a return
 *     input or not.
 * @param {Array<string>=} args An array of argument names.
 * @param {Array<string>=} varIds An array of variable ids.
 * @param {boolean=} hasStatements If we expect the procedure def to have a
 *     statement input or not.
 */
function assertDefBlockStructure(defBlock, hasReturn = false,
    args = [], varIds = [], hasStatements = true) {
  if (hasStatements) {
    chai.assert.isNotNull(defBlock.getInput('STACK'),
        'Def block should have STACK input');
  } else {
    chai.assert.isNull(defBlock.getInput('STACK'),
        'Def block should not have STACK input');
  }
  if (hasReturn) {
    chai.assert.isNotNull(defBlock.getInput('RETURN'),
        'Def block should have RETURN input');
  } else {
    chai.assert.isNull(defBlock.getInput('RETURN'),
        'Def block should not have RETURN input');
  }
  if (args.length) {
    chai.assert.include(defBlock.toString(), 'with',
        'Def block string should include "with"');
  } else {
    chai.assert.notInclude(defBlock.toString(), 'with',
        'Def block string should not include "with"');
  }

  chai.assert.sameOrderedMembers(defBlock.getVars(), args);
  assertBlockVarModels(defBlock, varIds);
}
exports.assertDefBlockStructure = assertDefBlockStructure;

/**
 * Asserts that the procedure call block has the expected inputs and
 *    fields.
 * @param {!Blockly.Block} callBlock The procedure call block.
 * @param {Array<string>=} args An array of argument names.
 * @param {Array<string>=} varIds An array of variable ids.
 * @param {string=} name The name we expect the caller to have.
 */
function assertCallBlockStructure(
  callBlock, args = [], varIds = [], name = undefined) {
  if (args.length) {
    chai.assert.include(callBlock.toString(), 'with');
  } else {
    chai.assert.notInclude(callBlock.toString(), 'with');
  }

  assertCallBlockArgsStructure(callBlock, args);
  assertBlockVarModels(callBlock, varIds);
  if (name !== undefined) {
    chai.assert(callBlock.getFieldValue('NAME'), name);
  }
}
exports.assertCallBlockStructure = assertCallBlockStructure;

/**
 * Creates procedure definition block using domToBlock call.
 * @param {!Blockly.Workspace} workspace The Blockly workspace.
 * @param {boolean=} hasReturn Whether the procedure definition should have
 *    return.
 * @param {Array<string>=} args An array of argument names.
 * @return {Blockly.Block} The created block.
 */
function createProcDefBlock(
    workspace, hasReturn = false, args = []) {
  const type = hasReturn ?
      'procedures_defreturn' : 'procedures_defnoreturn';
  let xml = '<block type="' + type + '">';
  for (let i = 0; i < args.length; i ++) {
    xml +=
        '    <mutation><arg name="' + args[i] + '"></arg></mutation>\n';
  }
  xml +=
      '  <field name="NAME">proc name</field>' +
      '</block>';
  return Blockly.Xml.domToBlock(Blockly.Xml.textToDom(xml), workspace);
}
exports.createProcDefBlock = createProcDefBlock;

/**
 * Creates procedure call block using domToBlock call.
 * @param {!Blockly.Workspace} workspace The Blockly workspace.
 * @param {boolean=} hasReturn Whether the corresponding procedure definition
 *    has return.
 * @return {Blockly.Block} The created block.
 */
function createProcCallBlock(
    workspace, hasReturn = false) {
  const type = hasReturn ?
      'procedures_callreturn' : 'procedures_callnoreturn';
  return Blockly.Xml.domToBlock(Blockly.Xml.textToDom(
      '<block type="' + type + '">' +
      '  <mutation name="proc name"/>' +
      '</block>'
  ), workspace);
}
exports.createProcCallBlock = createProcCallBlock;
