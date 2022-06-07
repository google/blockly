/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Utility functions for handling typed variables.
 *
 */
'use strict';

/**
 * Utility functions for handling typed variables.
 *
 * @namespace Blockly.VariablesDynamic
 */
goog.module('Blockly.VariablesDynamic');

const Variables = goog.require('Blockly.Variables');
const xml = goog.require('Blockly.utils.xml');
const {Blocks} = goog.require('Blockly.blocks');
const {Msg} = goog.require('Blockly.Msg');
const {VariableModel} = goog.require('Blockly.VariableModel');
/* eslint-disable-next-line no-unused-vars */
const {Workspace} = goog.requireType('Blockly.Workspace');
/* eslint-disable-next-line no-unused-vars */
const {WorkspaceSvg} = goog.requireType('Blockly.WorkspaceSvg');


/**
 * String for use in the "custom" attribute of a category in toolbox XML.
 * This string indicates that the category should be dynamically populated with
 * variable blocks.
 * See also Blockly.Variables.CATEGORY_NAME and
 * Blockly.Procedures.CATEGORY_NAME.
 * @const {string}
 * @alias Blockly.VariablesDynamic.CATEGORY_NAME
 */
const CATEGORY_NAME = 'VARIABLE_DYNAMIC';
exports.CATEGORY_NAME = CATEGORY_NAME;

const stringButtonClickHandler = function(button) {
  Variables.createVariableButtonHandler(
      button.getTargetWorkspace(), undefined, 'String');
};
exports.onCreateVariableButtonClick_String = stringButtonClickHandler;

const numberButtonClickHandler = function(button) {
  Variables.createVariableButtonHandler(
      button.getTargetWorkspace(), undefined, 'Number');
};
exports.onCreateVariableButtonClick_Number = numberButtonClickHandler;

const colourButtonClickHandler = function(button) {
  Variables.createVariableButtonHandler(
      button.getTargetWorkspace(), undefined, 'Colour');
};
exports.onCreateVariableButtonClick_Colour = colourButtonClickHandler;

/**
 * Construct the elements (blocks and button) required by the flyout for the
 * variable category.
 * @param {!WorkspaceSvg} workspace The workspace containing variables.
 * @return {!Array<!Element>} Array of XML elements.
 * @alias Blockly.VariablesDynamic.flyoutCategory
 */
const flyoutCategory = function(workspace) {
  let xmlList = [];
  let button = document.createElement('button');
  button.setAttribute('text', Msg['NEW_STRING_VARIABLE']);
  button.setAttribute('callbackKey', 'CREATE_VARIABLE_STRING');
  xmlList.push(button);
  button = document.createElement('button');
  button.setAttribute('text', Msg['NEW_NUMBER_VARIABLE']);
  button.setAttribute('callbackKey', 'CREATE_VARIABLE_NUMBER');
  xmlList.push(button);
  button = document.createElement('button');
  button.setAttribute('text', Msg['NEW_COLOUR_VARIABLE']);
  button.setAttribute('callbackKey', 'CREATE_VARIABLE_COLOUR');
  xmlList.push(button);

  workspace.registerButtonCallback(
      'CREATE_VARIABLE_STRING', stringButtonClickHandler);
  workspace.registerButtonCallback(
      'CREATE_VARIABLE_NUMBER', numberButtonClickHandler);
  workspace.registerButtonCallback(
      'CREATE_VARIABLE_COLOUR', colourButtonClickHandler);


  const blockList = flyoutCategoryBlocks(workspace);
  xmlList = xmlList.concat(blockList);
  return xmlList;
};
exports.flyoutCategory = flyoutCategory;

/**
 * Construct the blocks required by the flyout for the variable category.
 * @param {!Workspace} workspace The workspace containing variables.
 * @return {!Array<!Element>} Array of XML block elements.
 * @alias Blockly.VariablesDynamic.flyoutCategoryBlocks
 */
const flyoutCategoryBlocks = function(workspace) {
  const variableModelList = workspace.getAllVariables();

  const xmlList = [];
  if (variableModelList.length > 0) {
    if (Blocks['variables_set_dynamic']) {
      const firstVariable = variableModelList[variableModelList.length - 1];
      const block = xml.createElement('block');
      block.setAttribute('type', 'variables_set_dynamic');
      block.setAttribute('gap', 24);
      block.appendChild(Variables.generateVariableFieldDom(firstVariable));
      xmlList.push(block);
    }
    if (Blocks['variables_get_dynamic']) {
      variableModelList.sort(VariableModel.compareByName);
      for (let i = 0, variable; (variable = variableModelList[i]); i++) {
        const block = xml.createElement('block');
        block.setAttribute('type', 'variables_get_dynamic');
        block.setAttribute('gap', 8);
        block.appendChild(Variables.generateVariableFieldDom(variable));
        xmlList.push(block);
      }
    }
  }
  return xmlList;
};
exports.flyoutCategoryBlocks = flyoutCategoryBlocks;
