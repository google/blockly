/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2012 Google Inc.
 * https://developers.google.com/blockly/
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview Utility functions for handling variables dynamic.
 *
 * @author duzc2dtw@gmail.com (Du Tian Wei)
 */
'use strict';

goog.provide('Blockly.VariablesDynamic');

goog.require('Blockly.Variables');
goog.require('Blockly.Blocks');
goog.require('Blockly.constants');
goog.require('Blockly.VariableModel');
goog.require('Blockly.Workspace');
goog.require('goog.string');


/**
 * Prompt the user for a new variable name.
 * @param {string} promptText The string of the prompt.
 * @param {string} defaultText The default value to show in the prompt's field.
 * @param {function(?string)} callback A callback. It will return the new
 *     variable name, or null if the user picked something illegal.
 */
Blockly.VariablesDynamic.promptType = function(promptText, defaultText, callback) {
    Blockly.prompt(promptText, defaultText, function(newVarType) {
        // Merge runs of whitespace.  Strip leading and trailing whitespace.
        // Beyond this, all types are legal.
        if (newVarType) {
            newVarType = newVarType.replace(/[\s\xa0]+/g, ' ').replace(/^ | $/g, '');
        }
        callback(newVarType);
    });
};
Blockly.VariablesDynamic.onCreateVariableButtonClick = function(button) {
    Blockly.VariablesDynamic.promptType(Blockly.Msg.NEW_VARIABLE_TYPE_TITLE, '', function(type) {
        if (type) {
            Blockly.Variables.createVariable(button.getTargetWorkspace(), null, type);
        }
    });
    // workspace.createVariable("abc", "string");
    // workspace.createVariable("123", "number");
    // workspace.createVariable("abcd", "string");
};
/**
 * Construct the elements (blocks and button) required by the flyout for the
 * variable category.
 * @param {!Blockly.Workspace} workspace The workspace contianing variables.
 * @return {!Array.<!Element>} Array of XML elements.
 */
Blockly.VariablesDynamic.flyoutCategory = function(workspace) {
    var xmlList = [];
    var button = goog.dom.createDom('button');
    button.setAttribute('text', Blockly.Msg.NEW_VARIABLE);
    button.setAttribute('callbackKey', 'CREATE_VARIABLE');

    workspace.registerButtonCallback('CREATE_VARIABLE', Blockly.VariablesDynamic.onCreateVariableButtonClick);

    xmlList.push(button);

    var blockList = Blockly.VariablesDynamic.flyoutCategoryBlocks(workspace);
    xmlList = xmlList.concat(blockList);
    return xmlList;
};

/**
 * Construct the blocks required by the flyout for the variable category.
 * @param {!Blockly.Workspace} workspace The workspace contianing variables.
 * @return {!Array.<!Element>} Array of XML block elements.
 */
Blockly.VariablesDynamic.flyoutCategoryBlocks = function(workspace) {
    var variableModelList = workspace.getAllVariables();
    variableModelList.sort(Blockly.VariableModel.compareByName);

    var xmlList = [];
    if (variableModelList.length > 0) {

        var varTypes = workspace.getVariableTypes();
        for (var i in varTypes) {
            var varType = varTypes[i];
            var variableModelListOfType = workspace.getVariablesOfType(varType);
            var firstVariable = variableModelListOfType[0];
            if (Blockly.Blocks['variables_set_dynamic']) {
                var gap = i == varTypes.length - 1 ? 24 : 8;
                var blockText = '<xml>' +
                    '<block type="variables_set_dynamic" gap="' + gap + '">' +
                    Blockly.Variables.generateVariableFieldXml_(firstVariable) +
                    '</block>' +
                    '</xml>';
                var block = Blockly.Xml.textToDom(blockText).firstChild;
                xmlList.push(block);
            }
        }
        for (var i = 0, variable; variable = variableModelList[i]; i++) {
            if (Blockly.Blocks['variables_get_dynamic']) {
                var blockText = '<xml>' +
                    '<block type="variables_get_dynamic" gap="8">' +
                    Blockly.Variables.generateVariableFieldXml_(variable) +
                    '</block>' +
                    '</xml>';
                var block = Blockly.Xml.textToDom(blockText).firstChild;
                xmlList.push(block);
            }
        }
    }
    return xmlList;
};