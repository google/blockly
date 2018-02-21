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
 * @fileoverview Utility functions for handling variables.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

/**
 * @name Blockly.Variables
 * @namespace
 **/
goog.provide('Blockly.Variables');

goog.require('Blockly.Blocks');
goog.require('Blockly.constants');
goog.require('Blockly.VariableModel');
goog.require('Blockly.Workspace');
goog.require('goog.string');


/**
 * Constant to separate variable names from procedures and generated functions
 * when running generators.
 * @deprecated Use Blockly.VARIABLE_CATEGORY_NAME
 */
Blockly.Variables.NAME_TYPE = Blockly.VARIABLE_CATEGORY_NAME;

/**
 * Find all user-created variables that are in use in the workspace.
 * For use by generators.
 * To get a list of all variables on a workspace, including unused variables,
 * call Workspace.getAllVariables.
 * @param {!Blockly.Workspace} ws The workspace to search for variables.
 * @return {!Array.<!Blockly.VariableModel>} Array of variable models.
 */
Blockly.Variables.allUsedVarModels = function(ws) {
  var blocks = ws.getAllBlocks();
  var variableHash = Object.create(null);
  // Iterate through every block and add each variable to the hash.
  for (var x = 0; x < blocks.length; x++) {
    var blockVariables = blocks[x].getVarModels();
    if (blockVariables) {
      for (var y = 0; y < blockVariables.length; y++) {
        var variable = blockVariables[y];
        if (variable.getId()) {
          variableHash[variable.getId()] = variable;
        }
      }
    }
  }
  // Flatten the hash into a list.
  var variableList = [];
  for (var id in variableHash) {
    variableList.push(variableHash[id]);
  }
  return variableList;
};

/**
 * Find all user-created variables that are in use in the workspace and return
 * only their names.
 * For use by generators.
 * To get a list of all variables on a workspace, including unused variables,
 * call Workspace.getAllVariables.
 * @deprecated January 2018
 */
Blockly.Variables.allUsedVariables = function() {
  console.warn('Deprecated call to Blockly.Variables.allUsedVariables. ' +
      'Use Blockly.Variables.allUsedVarModels instead.\nIf this is a major ' +
      'issue please file a bug on GitHub.');
};

/**
 * Find all developer variables used by blocks in the workspace.
 * Developer variables are never shown to the user, but are declared as global
 * variables in the generated code.
 * To declare developer variables, define the getDeveloperVariables function on
 * your block and return a list of variable names.
 * For use by generators.
 * @param {!Blockly.Workspace} workspace The workspace to search.
 * @return {!Array.<string>} A list of non-duplicated variable names.
 */
Blockly.Variables.allDeveloperVariables = function(workspace) {
  var blocks = workspace.getAllBlocks();
  var hash = {};
  for (var i = 0; i < blocks.length; i++) {
    var block = blocks[i];
    if (block.getDeveloperVars) {
      var devVars = block.getDeveloperVars();
      for (var j = 0; j < devVars.length; j++) {
        hash[devVars[j]] = devVars[j];
      }
    }
  }

  // Flatten the hash into a list.
  var list = [];
  for (var name in hash) {
    list.push(hash[name]);
  }
  return list;
};

/**
 * Construct the elements (blocks and button) required by the flyout for the
 * variable category.
 * @param {!Blockly.Workspace} workspace The workspace contianing variables.
 * @return {!Array.<!Element>} Array of XML elements.
 */
Blockly.Variables.flyoutCategory = function(workspace) {
  var xmlList = [];
  var button = goog.dom.createDom('button');
  button.setAttribute('text', Blockly.Msg.NEW_VARIABLE);
  button.setAttribute('callbackKey', 'CREATE_VARIABLE');

  workspace.registerButtonCallback('CREATE_VARIABLE', function(button) {
    Blockly.Variables.createVariableButtonHandler(button.getTargetWorkspace());
  });

  xmlList.push(button);

  var blockList = Blockly.Variables.flyoutCategoryBlocks(workspace);
  xmlList = xmlList.concat(blockList);
  return xmlList;
};

/**
 * Construct the blocks required by the flyout for the variable category.
 * @param {!Blockly.Workspace} workspace The workspace contianing variables.
 * @return {!Array.<!Element>} Array of XML block elements.
 */
Blockly.Variables.flyoutCategoryBlocks = function(workspace) {
  var variableModelList = workspace.getVariablesOfType('');
  variableModelList.sort(Blockly.VariableModel.compareByName);

  var xmlList = [];
  if (variableModelList.length > 0) {
    var firstVariable = variableModelList[0];
    if (Blockly.Blocks['variables_set']) {
      var gap = Blockly.Blocks['math_change'] ? 8 : 24;
      var blockText = '<xml>' +
            '<block type="variables_set" gap="' + gap + '">' +
            Blockly.Variables.generateVariableFieldXml_(firstVariable) +
            '</block>' +
            '</xml>';
      var block = Blockly.Xml.textToDom(blockText).firstChild;
      xmlList.push(block);
    }
    if (Blockly.Blocks['math_change']) {
      var gap = Blockly.Blocks['variables_get'] ? 20 : 8;
      var blockText = '<xml>' +
          '<block type="math_change" gap="' + gap + '">' +
          Blockly.Variables.generateVariableFieldXml_(firstVariable) +
          '<value name="DELTA">' +
          '<shadow type="math_number">' +
          '<field name="NUM">1</field>' +
          '</shadow>' +
          '</value>' +
          '</block>' +
          '</xml>';
      var block = Blockly.Xml.textToDom(blockText).firstChild;
      xmlList.push(block);
    }

    for (var i = 0, variable; variable = variableModelList[i]; i++) {
      if (Blockly.Blocks['variables_get']) {
        var blockText = '<xml>' +
            '<block type="variables_get" gap="8">' +
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

/**
 * Return a new variable name that is not yet being used. This will try to
 * generate single letter variable names in the range 'i' to 'z' to start with.
 * If no unique name is located it will try 'i' to 'z', 'a' to 'h',
 * then 'i2' to 'z2' etc.  Skip 'l'.
 * @param {!Blockly.Workspace} workspace The workspace to be unique in.
 * @return {string} New variable name.
 */
Blockly.Variables.generateUniqueName = function(workspace) {
  var variableList = workspace.getAllVariables();
  var newName = '';
  if (variableList.length) {
    var nameSuffix = 1;
    var letters = 'ijkmnopqrstuvwxyzabcdefgh';  // No 'l'.
    var letterIndex = 0;
    var potName = letters.charAt(letterIndex);
    while (!newName) {
      var inUse = false;
      for (var i = 0; i < variableList.length; i++) {
        if (variableList[i].name.toLowerCase() == potName) {
          // This potential name is already used.
          inUse = true;
          break;
        }
      }
      if (inUse) {
        // Try the next potential name.
        letterIndex++;
        if (letterIndex == letters.length) {
          // Reached the end of the character sequence so back to 'i'.
          // a new suffix.
          letterIndex = 0;
          nameSuffix++;
        }
        potName = letters.charAt(letterIndex);
        if (nameSuffix > 1) {
          potName += nameSuffix;
        }
      } else {
        // We can use the current potential name.
        newName = potName;
      }
    }
  } else {
    newName = 'i';
  }
  return newName;
};

/**
 * Handles "Create Variable" button in the default variables toolbox category.
 * It will prompt the user for a varibale name, including re-prompts if a name
 * is already in use among the workspace's variables.
 *
 * Custom button handlers can delegate to this function, allowing variables
 * types and after-creation processing. More complex customization (e.g.,
 * prompting for variable type) is beyond the scope of this function.
 *
 * @param {!Blockly.Workspace} workspace The workspace on which to create the
 *     variable.
 * @param {function(?string=)=} opt_callback A callback. It will be passed an
 *     acceptable new variable name, or null if change is to be aborted (cancel
 *     button), or undefined if an existing variable was chosen.
 * @param {string=} opt_type The type of the variable like 'int', 'string', or
 *     ''. This will default to '', which is a specific type.
 */
Blockly.Variables.createVariableButtonHandler = function(
    workspace, opt_callback, opt_type) {
  var type = opt_type || '';
  // This function needs to be named so it can be called recursively.
  var promptAndCheckWithAlert = function(defaultName) {
    Blockly.Variables.promptName(Blockly.Msg.NEW_VARIABLE_TITLE, defaultName,
        function(text) {
          if (text) {
            var existing =
                Blockly.Variables.nameUsedWithAnyType_(text, workspace);
            if (existing) {
              var lowerCase = text.toLowerCase();
              if (existing.type == type) {
                var msg = Blockly.Msg.VARIABLE_ALREADY_EXISTS.replace(
                    '%1', lowerCase);
              } else {
                var msg = Blockly.Msg.VARIABLE_ALREADY_EXISTS_FOR_ANOTHER_TYPE;
                msg = msg.replace('%1', lowerCase).replace('%2', existing.type);
              }
              Blockly.alert(msg,
                  function() {
                    promptAndCheckWithAlert(text);  // Recurse
                  });
            } else {
              // No conflict
              workspace.createVariable(text, type);
              if (opt_callback) {
                opt_callback(text);
              }
            }
          } else {
            // User canceled prompt.
            if (opt_callback) {
              opt_callback(null);
            }
          }
        });
  };
  promptAndCheckWithAlert('');
};
goog.exportSymbol('Blockly.Variables.createVariableButtonHandler',
    Blockly.Variables.createVariableButtonHandler);

/**
 * Original name of Blockly.Variables.createVariableButtonHandler(..).
 * @deprecated Use Blockly.Variables.createVariableButtonHandler(..).
 *
 * @param {!Blockly.Workspace} workspace The workspace on which to create the
 *     variable.
 * @param {function(?string=)=} opt_callback A callback. It will be passed an
 *     acceptable new variable name, or null if change is to be aborted (cancel
 *     button), or undefined if an existing variable was chosen.
 * @param {string=} opt_type The type of the variable like 'int', 'string', or
 *     ''. This will default to '', which is a specific type.
 */
Blockly.Variables.createVariable =
    Blockly.Variables.createVariableButtonHandler;
goog.exportSymbol('Blockly.Variables.createVariable',
    Blockly.Variables.createVariable);

/**
 * Rename a variable with the given workspace, variableType, and oldName.
 * @param {!Blockly.Workspace} workspace The workspace on which to rename the
 *     variable.
 * @param {Blockly.VariableModel} variable Variable to rename.
 * @param {function(?string=)=} opt_callback A callback. It will
 *     be passed an acceptable new variable name, or null if change is to be
 *     aborted (cancel button), or undefined if an existing variable was chosen.
 */
Blockly.Variables.renameVariable = function(workspace, variable,
    opt_callback) {
  // This function needs to be named so it can be called recursively.
  var promptAndCheckWithAlert = function(defaultName) {
    var promptText =
        Blockly.Msg.RENAME_VARIABLE_TITLE.replace('%1', variable.name);
    Blockly.Variables.promptName(promptText, defaultName,
        function(newName) {
          if (newName) {
            var existing = Blockly.Variables.nameUsedWithOtherType_(newName,
                variable.type, workspace);
            if (existing) {
              var msg = Blockly.Msg.VARIABLE_ALREADY_EXISTS_FOR_ANOTHER_TYPE
                  .replace('%1', newName.toLowerCase())
                  .replace('%2', existing.type);
              Blockly.alert(msg,
                  function() {
                    promptAndCheckWithAlert(newName);  // Recurse
                  });
            } else {
              workspace.renameVariableById(variable.getId(), newName);
              if (opt_callback) {
                opt_callback(newName);
              }
            }
          } else {
            // User canceled prompt.
            if (opt_callback) {
              opt_callback(null);
            }
          }
        });
  };
  promptAndCheckWithAlert('');
};

/**
 * Prompt the user for a new variable name.
 * @param {string} promptText The string of the prompt.
 * @param {string} defaultText The default value to show in the prompt's field.
 * @param {function(?string)} callback A callback. It will return the new
 *     variable name, or null if the user picked something illegal.
 */
Blockly.Variables.promptName = function(promptText, defaultText, callback) {
  Blockly.prompt(promptText, defaultText, function(newVar) {
    // Merge runs of whitespace.  Strip leading and trailing whitespace.
    // Beyond this, all names are legal.
    if (newVar) {
      newVar = newVar.replace(/[\s\xa0]+/g, ' ').replace(/^ | $/g, '');
      if (newVar == Blockly.Msg.RENAME_VARIABLE ||
          newVar == Blockly.Msg.NEW_VARIABLE) {
        // Ok, not ALL names are legal...
        newVar = null;
      }
    }
    callback(newVar);
  });
};

/**
 * Check whether there exists a variable with the given name but a different
 * type.
 * @param {string} name The name to search for.
 * @param {string} type The type to exclude from the search.
 * @param {!Blockly.Workspace} workspace The workspace to search for the
 *     variable.
 * @return {?Blockly.VariableModel} The variable with the given name and a
 *     different type, or null if none was found.
 * @private
 */
Blockly.Variables.nameUsedWithOtherType_ = function(name, type, workspace) {
  var allVariables = workspace.getVariableMap().getAllVariables();

  name = name.toLowerCase();
  for (var i = 0, variable; variable = allVariables[i]; i++) {
    if (variable.name.toLowerCase() == name && variable.type != type) {
      return variable;
    }
  }
  return null;
};

/**
 * Check whether there exists a variable with the given name of any type.
 * @param {string} name The name to search for.
 * @param {!Blockly.Workspace} workspace The workspace to search for the
 *     variable.
 * @return {?Blockly.VariableModel} The variable with the given name, or null if
 *    none was found.
 * @private
 */
Blockly.Variables.nameUsedWithAnyType_ = function(name, workspace) {
  var allVariables = workspace.getVariableMap().getAllVariables();

  name = name.toLowerCase();
  for (var i = 0, variable; variable = allVariables[i]; i++) {
    if (variable.name.toLowerCase() == name) {
      return variable;
    }
  }
  return null;
};

/**
 * Generate XML string for variable field.
 * @param {!Blockly.VariableModel} variableModel The variable model to generate
 *     an XML string from.
 * @return {string} The generated XML.
 * @private
 */
Blockly.Variables.generateVariableFieldXml_ = function(variableModel) {
  // The variable name may be user input, so it may contain characters that need
  // to be escaped to create valid XML.
  var typeString = variableModel.type;
  if (typeString == '') {
    typeString = '\'\'';
  }
  var text = '<field name="VAR" id="' + variableModel.getId() +
    '" variabletype="' + goog.string.htmlEscape(typeString) +
    '">' + goog.string.htmlEscape(variableModel.name) + '</field>';
  return text;
};

/**
 * Helper function to look up or create a variable on the given workspace.
 * If no variable exists, creates and returns it.
 * @param {!Blockly.Workspace} workspace The workspace to search for the
 *     variable.  It may be a flyout workspace or main workspace.
 * @param {string} id The ID to use to look up or create the variable, or null.
 * @param {string=} opt_name The string to use to look up or create the
 *     variable.
 * @param {string=} opt_type The type to use to look up or create the variable.
 * @return {!Blockly.VariableModel} The variable corresponding to the given ID
 *     or name + type combination.
 */
Blockly.Variables.getOrCreateVariablePackage = function(workspace, id, opt_name,
    opt_type) {
  var variable = Blockly.Variables.getVariable(workspace, id, opt_name,
      opt_type);
  if (!variable) {
    variable = Blockly.Variables.createVariable_(workspace, id, opt_name,
        opt_type);
  }
  return variable;
};

/**
 * Look up  a variable on the given workspace.
 * Always looks in the main workspace before looking in the flyout workspace.
 * Always prefers lookup by ID to lookup by name + type.
 * @param {!Blockly.Workspace} workspace The workspace to search for the
 *     variable.  It may be a flyout workspace or main workspace.
 * @param {string} id The ID to use to look up the variable, or null.
 * @param {string=} opt_name The string to use to look up the variable.  Only
 *     used if lookup by ID fails.
 * @param {string=} opt_type The type to use to look up the variable.  Only used
 *     if lookup by ID fails.
 * @return {?Blockly.VariableModel} The variable corresponding to the given ID
 *     or name + type combination, or null if not found.
 * @package
 */
Blockly.Variables.getVariable = function(workspace, id, opt_name, opt_type) {
  var potentialVariableMap = workspace.getPotentialVariableMap();
  // Try to just get the variable, by ID if possible.
  if (id) {
    // Look in the real variable map before checking the potential variable map.
    var variable = workspace.getVariableById(id);
    if (!variable && potentialVariableMap) {
      variable = potentialVariableMap.getVariableById(id);
    }
  } else if (opt_name) {
    if (opt_type == undefined) {
      throw new Error('Tried to look up a variable by name without a type');
    }
    // Otherwise look up by name and type.
    var variable = workspace.getVariable(opt_name, opt_type);
    if (!variable && potentialVariableMap) {
      variable = potentialVariableMap.getVariable(opt_name, opt_type);
    }
  }
  return variable;
};

/**
 * Helper function to create a variable on the given workspace.
 * @param {!Blockly.Workspace} workspace The workspace in which to create the
 * variable.  It may be a flyout workspace or main workspace.
 * @param {string} id The ID to use to create the variable, or null.
 * @param {string=} opt_name The string to use to create the variable.
 * @param {string=} opt_type The type to use to create the variable.
 * @return {!Blockly.VariableModel} The variable corresponding to the given ID
 *     or name + type combination.
 * @private
 */
Blockly.Variables.createVariable_ = function(workspace, id, opt_name,
    opt_type) {
  var potentialVariableMap = workspace.getPotentialVariableMap();
  // Variables without names get uniquely named for this workspace.
  if (!opt_name) {
    var ws = workspace.isFlyout ? workspace.targetWorkspace : workspace;
    opt_name = Blockly.Variables.generateUniqueName(ws);
  }

  // Create a potential variable if in the flyout.
  if (potentialVariableMap) {
    var variable = potentialVariableMap.createVariable(opt_name, opt_type, id);
  } else {  // In the main workspace, create a real variable.
    var variable = workspace.createVariable(opt_name, opt_type, id);
  }
  return variable;
};

/**
 * Helper function to get the list of variables that have been added to the
 * workspace after adding a new block, using the given list of variables that
 * were in the workspace before the new block was added.
 * @param {!Blockly.Workspace} workspace The workspace to inspect.
 * @param {!Array.<!Blockly.VariableModel>} originalVariables The array of
 *     variables that existed in the workspace before adding the new block.
 * @return {!Array.<!Blockly.VariableModel>} The new array of variables that were
 *     freshly added to the workspace after creating the new block, or [] if no
 *     new variables were added to the workspace.
 * @package
 */
Blockly.Variables.getAddedVariables = function(workspace, originalVariables) {
  var allCurrentVariables = workspace.getAllVariables();
  var addedVariables = [];
  if (originalVariables.length != allCurrentVariables.length) {
    for (var i = 0; i < allCurrentVariables.length; i++) {
      var variable = allCurrentVariables[i];
      // For any variable that is present in allCurrentVariables but not
      // present in originalVariables, add the variable to addedVariables.
      if (!originalVariables.includes(variable)) {
        addedVariables.push(variable);
      }
    }
  }
  return addedVariables;
};
