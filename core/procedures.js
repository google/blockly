/**
 * @license
 * Copyright 2012 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Utility functions for handling procedures.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

/**
 * @name Blockly.Procedures
 * @namespace
 */
goog.module('Blockly.Procedures');
goog.module.declareLegacyNamespace();

goog.require('Blockly.Blocks');
goog.require('Blockly.Events');
/** @suppress {extraRequire} */
goog.require('Blockly.Events.BlockChange');
goog.require('Blockly.Field');
goog.require('Blockly.Msg');
goog.require('Blockly.Names');
goog.require('Blockly.utils.xml');
goog.require('Blockly.Workspace');
goog.require('Blockly.Xml');

goog.requireType('Blockly.Block');
goog.requireType('Blockly.Events.Abstract');
goog.requireType('Blockly.WorkspaceSvg');

/**
 * The default argument for a procedures_mutatorarg block.
 * @type {string}
 */
const DEFAULT_ARG = 'x';
exports.DEFAULT_ARG = DEFAULT_ARG;

/**
 * Procedure block type.
 * @typedef {{
 *    getProcedureCall: function():string,
 *    renameProcedure: function(string,string),
 *    getProcedureDef: function():!Array
 * }}
 */
let ProcedureBlock;
exports.ProcedureBlock = ProcedureBlock;

/**
 * Find all user-created procedure definitions in a workspace.
 * @param {!Blockly.Workspace} root Root workspace.
 * @return {!Array<!Array<!Array>>} Pair of arrays, the
 *     first contains procedures without return variables, the second with.
 *     Each procedure is defined by a three-element list of name, parameter
 *     list, and return value boolean.
 */
const allProcedures = function(root) {
  const proceduresNoReturn = root.getBlocksByType('procedures_defnoreturn', false)
      .map(function(block) {
        return /** @type {!ProcedureBlock} */ (block).getProcedureDef();
      });
  const proceduresReturn = root.getBlocksByType('procedures_defreturn', false).map(function(block) {
    return /** @type {!ProcedureBlock} */ (block).getProcedureDef();
  });
  proceduresNoReturn.sort(procTupleComparator);
  proceduresReturn.sort(procTupleComparator);
  return [proceduresNoReturn, proceduresReturn];
};
exports.allProcedures = allProcedures;

/**
 * Comparison function for case-insensitive sorting of the first element of
 * a tuple.
 * @param {!Array} ta First tuple.
 * @param {!Array} tb Second tuple.
 * @return {number} -1, 0, or 1 to signify greater than, equality, or less than.
 */
const procTupleComparator = function(ta, tb) {
  return ta[0].localeCompare(tb[0], undefined, {sensitivity: 'base'});
};

/**
 * Ensure two identically-named procedures don't exist.
 * Take the proposed procedure name, and return a legal name i.e. one that
 * is not empty and doesn't collide with other procedures.
 * @param {string} name Proposed procedure name.
 * @param {!Blockly.Block} block Block to disambiguate.
 * @return {string} Non-colliding name.
 */
const findLegalName = function(name, block) {
  if (block.isInFlyout) {
    // Flyouts can have multiple procedures called 'do something'.
    return name;
  }
  name = name || Blockly.Msg['UNNAMED_KEY'] || 'unnamed';
  while (!isLegalName(name, block.workspace, block)) {
    // Collision with another procedure.
    const r = name.match(/^(.*?)(\d+)$/);
    if (!r) {
      name += '2';
    } else {
      name = r[1] + (parseInt(r[2], 10) + 1);
    }
  }
  return name;
};
exports.findLegalName = findLegalName;

/**
 * Does this procedure have a legal name?  Illegal names include names of
 * procedures already defined.
 * @param {string} name The questionable name.
 * @param {!Blockly.Workspace} workspace The workspace to scan for collisions.
 * @param {Blockly.Block=} opt_exclude Optional block to exclude from
 *     comparisons (one doesn't want to collide with oneself).
 * @return {boolean} True if the name is legal.
 */
const isLegalName = function(name, workspace, opt_exclude) {
  return !isNameUsed(name, workspace, opt_exclude);
};

/**
 * Return if the given name is already a procedure name.
 * @param {string} name The questionable name.
 * @param {!Blockly.Workspace} workspace The workspace to scan for collisions.
 * @param {Blockly.Block=} opt_exclude Optional block to exclude from
 *     comparisons (one doesn't want to collide with oneself).
 * @return {boolean} True if the name is used, otherwise return false.
 */
const isNameUsed = function(name, workspace, opt_exclude) {
  const blocks = workspace.getAllBlocks(false);
  // Iterate through every block and check the name.
  for (let i = 0; i < blocks.length; i++) {
    if (blocks[i] == opt_exclude) {
      continue;
    }
    if (blocks[i].getProcedureDef) {
      const procedureBlock = /** @type {!ProcedureBlock} */ (
        blocks[i]);
      const procName = procedureBlock.getProcedureDef();
      if (Blockly.Names.equals(procName[0], name)) {
        return true;
      }
    }
  }
  return false;
};
exports.isNameUsed = isNameUsed;

/**
 * Rename a procedure.  Called by the editable field.
 * @param {string} name The proposed new name.
 * @return {string} The accepted name.
 * @this {Blockly.Field}
 */
const rename = function(name) {
  // Strip leading and trailing whitespace.  Beyond this, all names are legal.
  name = name.trim();

  const legalName = findLegalName(name,
      /** @type {!Blockly.Block} */ (this.getSourceBlock()));
  const oldName = this.getValue();
  if (oldName != name && oldName != legalName) {
    // Rename any callers.
    const blocks = this.getSourceBlock().workspace.getAllBlocks(false);
    for (let i = 0; i < blocks.length; i++) {
      if (blocks[i].renameProcedure) {
        const procedureBlock = /** @type {!ProcedureBlock} */ (
          blocks[i]);
        procedureBlock.renameProcedure(
            /** @type {string} */ (oldName), legalName);
      }
    }
  }
  return legalName;
};
exports.rename = rename;

/**
 * Construct the blocks required by the flyout for the procedure category.
 * @param {!Blockly.Workspace} workspace The workspace containing procedures.
 * @return {!Array<!Element>} Array of XML block elements.
 */
const flyoutCategory = function(workspace) {
  const xmlList = [];
  if (Blockly.Blocks['procedures_defnoreturn']) {
    // <block type="procedures_defnoreturn" gap="16">
    //     <field name="NAME">do something</field>
    // </block>
    const block = Blockly.utils.xml.createElement('block');
    block.setAttribute('type', 'procedures_defnoreturn');
    block.setAttribute('gap', 16);
    const nameField = Blockly.utils.xml.createElement('field');
    nameField.setAttribute('name', 'NAME');
    nameField.appendChild(Blockly.utils.xml.createTextNode(
        Blockly.Msg['PROCEDURES_DEFNORETURN_PROCEDURE']));
    block.appendChild(nameField);
    xmlList.push(block);
  }
  if (Blockly.Blocks['procedures_defreturn']) {
    // <block type="procedures_defreturn" gap="16">
    //     <field name="NAME">do something</field>
    // </block>
    const block = Blockly.utils.xml.createElement('block');
    block.setAttribute('type', 'procedures_defreturn');
    block.setAttribute('gap', 16);
    const nameField = Blockly.utils.xml.createElement('field');
    nameField.setAttribute('name', 'NAME');
    nameField.appendChild(Blockly.utils.xml.createTextNode(
        Blockly.Msg['PROCEDURES_DEFRETURN_PROCEDURE']));
    block.appendChild(nameField);
    xmlList.push(block);
  }
  if (Blockly.Blocks['procedures_ifreturn']) {
    // <block type="procedures_ifreturn" gap="16"></block>
    const block = Blockly.utils.xml.createElement('block');
    block.setAttribute('type', 'procedures_ifreturn');
    block.setAttribute('gap', 16);
    xmlList.push(block);
  }
  if (xmlList.length) {
    // Add slightly larger gap between system blocks and user calls.
    xmlList[xmlList.length - 1].setAttribute('gap', 24);
  }

  function populateProcedures(procedureList, templateName) {
    for (let i = 0; i < procedureList.length; i++) {
      const name = procedureList[i][0];
      const args = procedureList[i][1];
      // <block type="procedures_callnoreturn" gap="16">
      //   <mutation name="do something">
      //     <arg name="x"></arg>
      //   </mutation>
      // </block>
      const block = Blockly.utils.xml.createElement('block');
      block.setAttribute('type', templateName);
      block.setAttribute('gap', 16);
      const mutation = Blockly.utils.xml.createElement('mutation');
      mutation.setAttribute('name', name);
      block.appendChild(mutation);
      for (let j = 0; j < args.length; j++) {
        const arg = Blockly.utils.xml.createElement('arg');
        arg.setAttribute('name', args[j]);
        mutation.appendChild(arg);
      }
      xmlList.push(block);
    }
  }

  const tuple = allProcedures(workspace);
  populateProcedures(tuple[0], 'procedures_callnoreturn');
  populateProcedures(tuple[1], 'procedures_callreturn');
  return xmlList;
};
exports.flyoutCategory = flyoutCategory;

/**
 * Updates the procedure mutator's flyout so that the arg block is not a
 * duplicate of another arg.
 * @param {!Blockly.Workspace} workspace The procedure mutator's workspace. This
 *     workspace's flyout is what is being updated.
 */
const updateMutatorFlyout = function(workspace) {
  const usedNames = [];
  const blocks = workspace.getBlocksByType('procedures_mutatorarg', false);
  for (let i = 0, block; (block = blocks[i]); i++) {
    usedNames.push(block.getFieldValue('NAME'));
  }

  const xml = Blockly.utils.xml.createElement('xml');
  const argBlock = Blockly.utils.xml.createElement('block');
  argBlock.setAttribute('type', 'procedures_mutatorarg');
  const nameField = Blockly.utils.xml.createElement('field');
  nameField.setAttribute('name', 'NAME');
  const argValue = Blockly.Variables.generateUniqueNameFromOptions(
      DEFAULT_ARG, usedNames);
  const fieldContent = Blockly.utils.xml.createTextNode(argValue);

  nameField.appendChild(fieldContent);
  argBlock.appendChild(nameField);
  xml.appendChild(argBlock);

  workspace.updateToolbox(xml);
};

/**
 * Listens for when a procedure mutator is opened. Then it triggers a flyout
 * update and adds a mutator change listener to the mutator workspace.
 * @param {!Blockly.Events.Abstract} e The event that triggered this listener.
 */
const mutatorOpenListener = function(e) {
  if (!(e.type == Blockly.Events.BUBBLE_OPEN && e.bubbleType === 'mutator' &&
      e.isOpen)) {
    return;
  }
  const workspaceId = /** @type {string} */ (e.workspaceId);
  const block = Blockly.Workspace.getById(workspaceId)
      .getBlockById(e.blockId);
  const type = block.type;
  if (type != 'procedures_defnoreturn' && type != 'procedures_defreturn') {
    return;
  }
  const workspace = block.mutator.getWorkspace();
  updateMutatorFlyout(workspace);
  workspace.addChangeListener(mutatorChangeListener);
};
/** @package */
exports.mutatorOpenListener = mutatorOpenListener;

/**
 * Listens for changes in a procedure mutator and triggers flyout updates when
 * necessary.
 * @param {!Blockly.Events.Abstract} e The event that triggered this listener.
 */
const mutatorChangeListener = function(e) {
  if (e.type != Blockly.Events.BLOCK_CREATE &&
      e.type != Blockly.Events.BLOCK_DELETE &&
      e.type != Blockly.Events.BLOCK_CHANGE) {
    return;
  }
  const workspaceId = /** @type {string} */ (e.workspaceId);
  const workspace = /** @type {!Blockly.WorkspaceSvg} */
      (Blockly.Workspace.getById(workspaceId));
  updateMutatorFlyout(workspace);
};

/**
 * Find all the callers of a named procedure.
 * @param {string} name Name of procedure.
 * @param {!Blockly.Workspace} workspace The workspace to find callers in.
 * @return {!Array<!Blockly.Block>} Array of caller blocks.
 */
const getCallers = function(name, workspace) {
  const callers = [];
  const blocks = workspace.getAllBlocks(false);
  // Iterate through every block and check the name.
  for (let i = 0; i < blocks.length; i++) {
    if (blocks[i].getProcedureCall) {
      const procedureBlock = /** @type {!ProcedureBlock} */ (
        blocks[i]);
      const procName = procedureBlock.getProcedureCall();
      // Procedure name may be null if the block is only half-built.
      if (procName && Blockly.Names.equals(procName, name)) {
        callers.push(blocks[i]);
      }
    }
  }
  return callers;
};
exports.getCallers = getCallers;

/**
 * When a procedure definition changes its parameters, find and edit all its
 * callers.
 * @param {!Blockly.Block} defBlock Procedure definition block.
 */
const mutateCallers = function(defBlock) {
  const oldRecordUndo = Blockly.Events.recordUndo;
  const procedureBlock = /** @type {!ProcedureBlock} */ (
    defBlock);
  const name = procedureBlock.getProcedureDef()[0];
  const xmlElement = defBlock.mutationToDom(true);
  const callers = getCallers(name, defBlock.workspace);
  for (let i = 0, caller; (caller = callers[i]); i++) {
    const oldMutationDom = caller.mutationToDom();
    const oldMutation = oldMutationDom && Blockly.Xml.domToText(oldMutationDom);
    caller.domToMutation(xmlElement);
    const newMutationDom = caller.mutationToDom();
    const newMutation = newMutationDom && Blockly.Xml.domToText(newMutationDom);
    if (oldMutation != newMutation) {
      // Fire a mutation on every caller block.  But don't record this as an
      // undo action since it is deterministically tied to the procedure's
      // definition mutation.
      Blockly.Events.recordUndo = false;
      Blockly.Events.fire(new (Blockly.Events.get(Blockly.Events.BLOCK_CHANGE))(
          caller, 'mutation', null, oldMutation, newMutation));
      Blockly.Events.recordUndo = oldRecordUndo;
    }
  }
};
exports.mutateCallers = mutateCallers;

/**
 * Find the definition block for the named procedure.
 * @param {string} name Name of procedure.
 * @param {!Blockly.Workspace} workspace The workspace to search.
 * @return {?Blockly.Block} The procedure definition block, or null not found.
 */
const getDefinition = function(name, workspace) {
  // Do not assume procedure is a top block. Some languages allow nested
  // procedures. Also do not assume it is one of the built-in blocks. Only
  // rely on getProcedureDef.
  const blocks = workspace.getAllBlocks(false);
  for (let i = 0; i < blocks.length; i++) {
    if (blocks[i].getProcedureDef) {
      const procedureBlock = /** @type {!ProcedureBlock} */ (
        blocks[i]);
      const tuple = procedureBlock.getProcedureDef();
      if (tuple && Blockly.Names.equals(tuple[0], name)) {
        return blocks[i];  // Can't use procedureBlock var due to type check.
      }
    }
  }
  return null;
};
exports.getDefinition = getDefinition;
