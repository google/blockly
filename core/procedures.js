/**
 * @license
 * Copyright 2012 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Utility functions for handling procedures.
 */
'use strict';

/**
 * Utility functions for handling procedures.
 * @namespace Blockly.Procedures
 */
goog.module('Blockly.Procedures');

const Variables = goog.require('Blockly.Variables');
const Xml = goog.require('Blockly.Xml');
const eventUtils = goog.require('Blockly.Events.utils');
const utilsXml = goog.require('Blockly.utils.xml');
/* eslint-disable-next-line no-unused-vars */
const {Abstract} = goog.requireType('Blockly.Events.Abstract');
const {Blocks} = goog.require('Blockly.blocks');
/* eslint-disable-next-line no-unused-vars */
const {Block} = goog.requireType('Blockly.Block');
/* eslint-disable-next-line no-unused-vars */
const {BubbleOpen} = goog.requireType('Blockly.Events.BubbleOpen');
/* eslint-disable-next-line no-unused-vars */
const {BlockSvg} = goog.requireType('Blockly.BlockSvg');
/* eslint-disable-next-line no-unused-vars */
const {Field} = goog.requireType('Blockly.Field');
const {Msg} = goog.require('Blockly.Msg');
const {Names} = goog.require('Blockly.Names');
/* eslint-disable-next-line no-unused-vars */
const {WorkspaceSvg} = goog.requireType('Blockly.WorkspaceSvg');
const {Workspace} = goog.require('Blockly.Workspace');
/** @suppress {extraRequire} */
goog.require('Blockly.Events.BlockChange');


/**
 * String for use in the "custom" attribute of a category in toolbox XML.
 * This string indicates that the category should be dynamically populated with
 * procedure blocks.
 * See also Blockly.Variables.CATEGORY_NAME and
 * Blockly.VariablesDynamic.CATEGORY_NAME.
 * @const {string}
 * @alias Blockly.Procedures.CATEGORY_NAME
 */
const CATEGORY_NAME = 'PROCEDURE';
exports.CATEGORY_NAME = CATEGORY_NAME;

/**
 * The default argument for a procedures_mutatorarg block.
 * @type {string}
 * @alias Blockly.Procedures.DEFAULT_ARG
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
 * @alias Blockly.Procedures.ProcedureBlock
 */
let ProcedureBlock;
exports.ProcedureBlock = ProcedureBlock;

/**
 * Find all user-created procedure definitions in a workspace.
 * @param {!Workspace} root Root workspace.
 * @return {!Array<!Array<!Array>>} Pair of arrays, the
 *     first contains procedures without return variables, the second with.
 *     Each procedure is defined by a three-element list of name, parameter
 *     list, and return value boolean.
 * @alias Blockly.Procedures.allProcedures
 */
const allProcedures = function(root) {
  const proceduresNoReturn =
      root.getBlocksByType('procedures_defnoreturn', false)
          .map(function(block) {
            return /** @type {!ProcedureBlock} */ (block).getProcedureDef();
          });
  const proceduresReturn =
      root.getBlocksByType('procedures_defreturn', false).map(function(block) {
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
 * @param {!Block} block Block to disambiguate.
 * @return {string} Non-colliding name.
 * @alias Blockly.Procedures.findLegalName
 */
const findLegalName = function(name, block) {
  if (block.isInFlyout) {
    // Flyouts can have multiple procedures called 'do something'.
    return name;
  }
  name = name || Msg['UNNAMED_KEY'] || 'unnamed';
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
 * @param {!Workspace} workspace The workspace to scan for collisions.
 * @param {Block=} opt_exclude Optional block to exclude from
 *     comparisons (one doesn't want to collide with oneself).
 * @return {boolean} True if the name is legal.
 */
const isLegalName = function(name, workspace, opt_exclude) {
  return !isNameUsed(name, workspace, opt_exclude);
};

/**
 * Return if the given name is already a procedure name.
 * @param {string} name The questionable name.
 * @param {!Workspace} workspace The workspace to scan for collisions.
 * @param {Block=} opt_exclude Optional block to exclude from
 *     comparisons (one doesn't want to collide with oneself).
 * @return {boolean} True if the name is used, otherwise return false.
 * @alias Blockly.Procedures.isNameUsed
 */
const isNameUsed = function(name, workspace, opt_exclude) {
  const blocks = workspace.getAllBlocks(false);
  // Iterate through every block and check the name.
  for (let i = 0; i < blocks.length; i++) {
    if (blocks[i] === opt_exclude) {
      continue;
    }
    // Assume it is a procedure block so we can check.
    const procedureBlock = /** @type {!ProcedureBlock} */ (blocks[i]);
    if (procedureBlock.getProcedureDef) {
      const procName = procedureBlock.getProcedureDef();
      if (Names.equals(procName[0], name)) {
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
 * @this {Field}
 * @alias Blockly.Procedures.rename
 */
const rename = function(name) {
  // Strip leading and trailing whitespace.  Beyond this, all names are legal.
  name = name.trim();

  const legalName = findLegalName(
      name,
      /** @type {!Block} */ (this.getSourceBlock()));
  const oldName = this.getValue();
  if (oldName !== name && oldName !== legalName) {
    // Rename any callers.
    const blocks = this.getSourceBlock().workspace.getAllBlocks(false);
    for (let i = 0; i < blocks.length; i++) {
      // Assume it is a procedure so we can check.
      const procedureBlock = /** @type {!ProcedureBlock} */ (blocks[i]);
      if (procedureBlock.renameProcedure) {
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
 * @param {!WorkspaceSvg} workspace The workspace containing procedures.
 * @return {!Array<!Element>} Array of XML block elements.
 * @alias Blockly.Procedures.flyoutCategory
 */
const flyoutCategory = function(workspace) {
  const xmlList = [];
  if (Blocks['procedures_defnoreturn']) {
    // <block type="procedures_defnoreturn" gap="16">
    //     <field name="NAME">do something</field>
    // </block>
    const block = utilsXml.createElement('block');
    block.setAttribute('type', 'procedures_defnoreturn');
    block.setAttribute('gap', 16);
    const nameField = utilsXml.createElement('field');
    nameField.setAttribute('name', 'NAME');
    nameField.appendChild(
        utilsXml.createTextNode(Msg['PROCEDURES_DEFNORETURN_PROCEDURE']));
    block.appendChild(nameField);
    xmlList.push(block);
  }
  if (Blocks['procedures_defreturn']) {
    // <block type="procedures_defreturn" gap="16">
    //     <field name="NAME">do something</field>
    // </block>
    const block = utilsXml.createElement('block');
    block.setAttribute('type', 'procedures_defreturn');
    block.setAttribute('gap', 16);
    const nameField = utilsXml.createElement('field');
    nameField.setAttribute('name', 'NAME');
    nameField.appendChild(
        utilsXml.createTextNode(Msg['PROCEDURES_DEFRETURN_PROCEDURE']));
    block.appendChild(nameField);
    xmlList.push(block);
  }
  if (Blocks['procedures_ifreturn']) {
    // <block type="procedures_ifreturn" gap="16"></block>
    const block = utilsXml.createElement('block');
    block.setAttribute('type', 'procedures_ifreturn');
    block.setAttribute('gap', 16);
    xmlList.push(block);
  }
  if (xmlList.length) {
    // Add slightly larger gap between system blocks and user calls.
    xmlList[xmlList.length - 1].setAttribute('gap', 24);
  }

  /**
   * Add items to xmlList for each listed procedure.
   * @param {!Array<!Array>} procedureList A list of procedures, each of which
   *     is defined by a three-element list of name, parameter list, and return
   *     value boolean.
   * @param {string} templateName The type of the block to generate.
   */
  function populateProcedures(procedureList, templateName) {
    for (let i = 0; i < procedureList.length; i++) {
      const name = procedureList[i][0];
      const args = procedureList[i][1];
      // <block type="procedures_callnoreturn" gap="16">
      //   <mutation name="do something">
      //     <arg name="x"></arg>
      //   </mutation>
      // </block>
      const block = utilsXml.createElement('block');
      block.setAttribute('type', templateName);
      block.setAttribute('gap', 16);
      const mutation = utilsXml.createElement('mutation');
      mutation.setAttribute('name', name);
      block.appendChild(mutation);
      for (let j = 0; j < args.length; j++) {
        const arg = utilsXml.createElement('arg');
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
 * @param {!WorkspaceSvg} workspace The procedure mutator's workspace. This
 *     workspace's flyout is what is being updated.
 */
const updateMutatorFlyout = function(workspace) {
  const usedNames = [];
  const blocks = workspace.getBlocksByType('procedures_mutatorarg', false);
  for (let i = 0, block; (block = blocks[i]); i++) {
    usedNames.push(block.getFieldValue('NAME'));
  }

  const xmlElement = utilsXml.createElement('xml');
  const argBlock = utilsXml.createElement('block');
  argBlock.setAttribute('type', 'procedures_mutatorarg');
  const nameField = utilsXml.createElement('field');
  nameField.setAttribute('name', 'NAME');
  const argValue =
      Variables.generateUniqueNameFromOptions(DEFAULT_ARG, usedNames);
  const fieldContent = utilsXml.createTextNode(argValue);

  nameField.appendChild(fieldContent);
  argBlock.appendChild(nameField);
  xmlElement.appendChild(argBlock);

  workspace.updateToolbox(xmlElement);
};

/**
 * Listens for when a procedure mutator is opened. Then it triggers a flyout
 * update and adds a mutator change listener to the mutator workspace.
 * @param {!Abstract} e The event that triggered this listener.
 * @alias Blockly.Procedures.mutatorOpenListener
 * @package
 */
const mutatorOpenListener = function(e) {
  if (e.type !== eventUtils.BUBBLE_OPEN) {
    return;
  }
  const bubbleEvent = /** @type {!BubbleOpen} */ (e);
  if (!(bubbleEvent.bubbleType === 'mutator' && bubbleEvent.isOpen)) {
    return;
  }
  const workspaceId = /** @type {string} */ (bubbleEvent.workspaceId);
  const block = /** @type {!BlockSvg} */
      (Workspace.getById(workspaceId).getBlockById(bubbleEvent.blockId));
  const type = block.type;
  if (type !== 'procedures_defnoreturn' && type !== 'procedures_defreturn') {
    return;
  }
  const workspace = /** @type {!WorkspaceSvg} */ (block.mutator.getWorkspace());
  updateMutatorFlyout(workspace);
  workspace.addChangeListener(mutatorChangeListener);
};
exports.mutatorOpenListener = mutatorOpenListener;

/**
 * Listens for changes in a procedure mutator and triggers flyout updates when
 * necessary.
 * @param {!Abstract} e The event that triggered this listener.
 */
const mutatorChangeListener = function(e) {
  if (e.type !== eventUtils.BLOCK_CREATE &&
      e.type !== eventUtils.BLOCK_DELETE &&
      e.type !== eventUtils.BLOCK_CHANGE) {
    return;
  }
  const workspaceId = /** @type {string} */ (e.workspaceId);
  const workspace = /** @type {!WorkspaceSvg} */
      (Workspace.getById(workspaceId));
  updateMutatorFlyout(workspace);
};

/**
 * Find all the callers of a named procedure.
 * @param {string} name Name of procedure.
 * @param {!Workspace} workspace The workspace to find callers in.
 * @return {!Array<!Block>} Array of caller blocks.
 * @alias Blockly.Procedures.getCallers
 */
const getCallers = function(name, workspace) {
  const callers = [];
  const blocks = workspace.getAllBlocks(false);
  // Iterate through every block and check the name.
  for (let i = 0; i < blocks.length; i++) {
    // Assume it is a procedure block so we can check.
    const procedureBlock = /** @type {!ProcedureBlock} */ (blocks[i]);
    if (procedureBlock.getProcedureCall) {
      const procName = procedureBlock.getProcedureCall();
      // Procedure name may be null if the block is only half-built.
      if (procName && Names.equals(procName, name)) {
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
 * @param {!Block} defBlock Procedure definition block.
 * @alias Blockly.Procedures.mutateCallers
 */
const mutateCallers = function(defBlock) {
  const oldRecordUndo = eventUtils.getRecordUndo();
  const procedureBlock = /** @type {!ProcedureBlock} */ (defBlock);
  const name = procedureBlock.getProcedureDef()[0];
  const xmlElement = defBlock.mutationToDom(true);
  const callers = getCallers(name, defBlock.workspace);
  for (let i = 0, caller; (caller = callers[i]); i++) {
    const oldMutationDom = caller.mutationToDom();
    const oldMutation = oldMutationDom && Xml.domToText(oldMutationDom);
    caller.domToMutation(xmlElement);
    const newMutationDom = caller.mutationToDom();
    const newMutation = newMutationDom && Xml.domToText(newMutationDom);
    if (oldMutation !== newMutation) {
      // Fire a mutation on every caller block.  But don't record this as an
      // undo action since it is deterministically tied to the procedure's
      // definition mutation.
      eventUtils.setRecordUndo(false);
      eventUtils.fire(new (eventUtils.get(eventUtils.BLOCK_CHANGE))(
          caller, 'mutation', null, oldMutation, newMutation));
      eventUtils.setRecordUndo(oldRecordUndo);
    }
  }
};
exports.mutateCallers = mutateCallers;

/**
 * Find the definition block for the named procedure.
 * @param {string} name Name of procedure.
 * @param {!Workspace} workspace The workspace to search.
 * @return {?Block} The procedure definition block, or null not found.
 * @alias Blockly.Procedures.getDefinition
 */
const getDefinition = function(name, workspace) {
  // Do not assume procedure is a top block. Some languages allow nested
  // procedures. Also do not assume it is one of the built-in blocks. Only
  // rely on getProcedureDef.
  const blocks = workspace.getAllBlocks(false);
  for (let i = 0; i < blocks.length; i++) {
    // Assume it is a procedure block so we can check.
    const procedureBlock = /** @type {!ProcedureBlock} */ (blocks[i]);
    if (procedureBlock.getProcedureDef) {
      const tuple = procedureBlock.getProcedureDef();
      if (tuple && Names.equals(tuple[0], name)) {
        return blocks[i];  // Can't use procedureBlock var due to type check.
      }
    }
  }
  return null;
};
exports.getDefinition = getDefinition;
