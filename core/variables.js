/**
 * @license
 * Copyright 2012 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Utility functions for handling variables.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

/**
 * @name Blockly.Variables
 * @namespace
 */
goog.provide('Blockly.Variables');

goog.require('Blockly.Blocks');
goog.require('Blockly.internalConstants');
goog.require('Blockly.Msg');
goog.require('Blockly.utils');
goog.require('Blockly.utils.xml');
goog.require('Blockly.VariableModel');
goog.require('Blockly.Xml');

goog.requireType('Blockly.Workspace');


/**
 * Constant to separate variable names from procedures and generated functions
 * when running generators.
 * @deprecated Use Blockly.internalConstants.VARIABLE_CATEGORY_NAME
 */
Blockly.Variables.NAME_TYPE = Blockly.internalConstants.VARIABLE_CATEGORY_NAME;

/**
 * Find all user-created variables that are in use in the workspace.
 * For use by generators.
 * To get a list of all variables on a workspace, including unused variables,
 * call Workspace.getAllVariables.
 * @param {!Blockly.Workspace} ws The workspace to search for variables.
 * @return {!Array<!Blockly.VariableModel>} Array of variable models.
 */
Blockly.Variables.allUsedVarModels = function(ws) {
  const blocks = ws.getAllBlocks(false);
  const variableHash = Object.create(null);
  // Iterate through every block and add each variable to the hash.
  for (let i = 0; i < blocks.length; i++) {
    const blockVariables = blocks[i].getVarModels();
    if (blockVariables) {
      for (let j = 0; j < blockVariables.length; j++) {
        const variable = blockVariables[j];
        const id = variable.getId();
        if (id) {
          variableHash[id] = variable;
        }
      }
    }
  }
  // Flatten the hash into a list.
  const variableList = [];
  for (const id in variableHash) {
    variableList.push(variableHash[id]);
  }
  return variableList;
};

/**
 * @private
 * @type {Object<string,boolean>}
 */
Blockly.Variables.ALL_DEVELOPER_VARS_WARNINGS_BY_BLOCK_TYPE_ = {};

/**
 * Find all developer variables used by blocks in the workspace.
 * Developer variables are never shown to the user, but are declared as global
 * variables in the generated code.
 * To declare developer variables, define the getDeveloperVariables function on
 * your block and return a list of variable names.
 * For use by generators.
 * @param {!Blockly.Workspace} workspace The workspace to search.
 * @return {!Array<string>} A list of non-duplicated variable names.
 */
Blockly.Variables.allDeveloperVariables = function(workspace) {
  const blocks = workspace.getAllBlocks(false);
  const variableHash = Object.create(null);
  for (let i = 0, block; (block = blocks[i]); i++) {
    let getDeveloperVariables = block.getDeveloperVariables;
    if (!getDeveloperVariables && block.getDeveloperVars) {
      // August 2018: getDeveloperVars() was deprecated and renamed
      // getDeveloperVariables().
      getDeveloperVariables = block.getDeveloperVars;
      if (!Blockly.Variables.ALL_DEVELOPER_VARS_WARNINGS_BY_BLOCK_TYPE_[
          block.type]) {
        console.warn('Function getDeveloperVars() deprecated. Use ' +
            'getDeveloperVariables() (block type \'' + block.type + '\')');
        Blockly.Variables.ALL_DEVELOPER_VARS_WARNINGS_BY_BLOCK_TYPE_[
            block.type] = true;
      }
    }
    if (getDeveloperVariables) {
      const devVars = getDeveloperVariables();
      for (let j = 0; j < devVars.length; j++) {
        variableHash[devVars[j]] = true;
      }
    }
  }

  // Flatten the hash into a list.
  return Object.keys(variableHash);
};

/**
 * Construct the elements (blocks and button) required by the flyout for the
 * variable category.
 * @param {!Blockly.Workspace} workspace The workspace containing variables.
 * @return {!Array<!Element>} Array of XML elements.
 */
Blockly.Variables.flyoutCategory = function(workspace) {
  let xmlList = [];
  const button = document.createElement('button');
  button.setAttribute('text', '%{BKY_NEW_VARIABLE}');
  button.setAttribute('callbackKey', 'CREATE_VARIABLE');

  workspace.registerButtonCallback('CREATE_VARIABLE', function(button) {
    Blockly.Variables.createVariableButtonHandler(button.getTargetWorkspace());
  });

  xmlList.push(button);

  const blockList = Blockly.Variables.flyoutCategoryBlocks(workspace);
  xmlList = xmlList.concat(blockList);
  return xmlList;
};

/**
 * Construct the blocks required by the flyout for the variable category.
 * @param {!Blockly.Workspace} workspace The workspace containing variables.
 * @return {!Array<!Element>} Array of XML block elements.
 */
Blockly.Variables.flyoutCategoryBlocks = function(workspace) {
  const variableModelList = workspace.getVariablesOfType('');

  const xmlList = [];
  if (variableModelList.length > 0) {
    // New variables are added to the end of the variableModelList.
    const mostRecentVariable = variableModelList[variableModelList.length - 1];
    if (Blockly.Blocks['variables_set']) {
      const block = Blockly.utils.xml.createElement('block');
      block.setAttribute('type', 'variables_set');
      block.setAttribute('gap', Blockly.Blocks['math_change'] ? 8 : 24);
      block.appendChild(
          Blockly.Variables.generateVariableFieldDom(mostRecentVariable));
      xmlList.push(block);
    }
    if (Blockly.Blocks['math_change']) {
      const block = Blockly.utils.xml.createElement('block');
      block.setAttribute('type', 'math_change');
      block.setAttribute('gap', Blockly.Blocks['variables_get'] ? 20 : 8);
      block.appendChild(
          Blockly.Variables.generateVariableFieldDom(mostRecentVariable));
      const value = Blockly.Xml.textToDom(
          '<value name="DELTA">' +
          '<shadow type="math_number">' +
          '<field name="NUM">1</field>' +
          '</shadow>' +
          '</value>');
      block.appendChild(value);
      xmlList.push(block);
    }

    if (Blockly.Blocks['variables_get']) {
      variableModelList.sort(Blockly.VariableModel.compareByName);
      for (let i = 0, variable; (variable = variableModelList[i]); i++) {
        const block = Blockly.utils.xml.createElement('block');
        block.setAttribute('type', 'variables_get');
        block.setAttribute('gap', 8);
        block.appendChild(Blockly.Variables.generateVariableFieldDom(variable));
        xmlList.push(block);
      }
    }
  }
  return xmlList;
};

Blockly.Variables.VAR_LETTER_OPTIONS = 'ijkmnopqrstuvwxyzabcdefgh';  // No 'l'.

/**
 * Return a new variable name that is not yet being used. This will try to
 * generate single letter variable names in the range 'i' to 'z' to start with.
 * If no unique name is located it will try 'i' to 'z', 'a' to 'h',
 * then 'i2' to 'z2' etc.  Skip 'l'.
 * @param {!Blockly.Workspace} workspace The workspace to be unique in.
 * @return {string} New variable name.
 */
Blockly.Variables.generateUniqueName = function(workspace) {
  return Blockly.Variables.generateUniqueNameFromOptions(
      Blockly.Variables.VAR_LETTER_OPTIONS.charAt(0),
      workspace.getAllVariableNames()
  );
};

/**
 * Returns a unique name that is not present in the usedNames array. This
 * will try to generate single letter names in the range a -> z (skip l). It
 * will start with the character passed to startChar.
 * @param {string} startChar The character to start the search at.
 * @param {!Array<string>} usedNames A list of all of the used names.
 * @return {string} A unique name that is not present in the usedNames array.
 */
Blockly.Variables.generateUniqueNameFromOptions = function(startChar, usedNames) {
  if (!usedNames.length) {
    return startChar;
  }

  const letters = Blockly.Variables.VAR_LETTER_OPTIONS;
  let suffix = '';
  let letterIndex = letters.indexOf(startChar);
  let potName = startChar;

  // eslint-disable-next-line no-constant-condition
  while (true) {
    let inUse = false;
    for (let i = 0; i < usedNames.length; i++) {
      if (usedNames[i].toLowerCase() == potName) {
        inUse = true;
        break;
      }
    }
    if (!inUse) {
      return potName;
    }

    letterIndex++;
    if (letterIndex == letters.length) {
      // Reached the end of the character sequence so back to 'i'.
      letterIndex = 0;
      suffix = Number(suffix) + 1;
    }
    potName = letters.charAt(letterIndex) + suffix;
  }
};

/**
 * Handles "Create Variable" button in the default variables toolbox category.
 * It will prompt the user for a variable name, including re-prompts if a name
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
  const type = opt_type || '';
  // This function needs to be named so it can be called recursively.
  const promptAndCheckWithAlert = function(defaultName) {
    Blockly.Variables.promptName(Blockly.Msg['NEW_VARIABLE_TITLE'], defaultName,
        function(text) {
          if (text) {
            const existing =
                Blockly.Variables.nameUsedWithAnyType(text, workspace);
            if (existing) {
              let msg;
              if (existing.type == type) {
                msg = Blockly.Msg['VARIABLE_ALREADY_EXISTS'].replace(
                    '%1', existing.name);
              } else {
                msg =
                    Blockly.Msg['VARIABLE_ALREADY_EXISTS_FOR_ANOTHER_TYPE'];
                msg = msg.replace('%1', existing.name).replace('%2', existing.type);
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

/**
 * Opens a prompt that allows the user to enter a new name for a variable.
 * Triggers a rename if the new name is valid. Or re-prompts if there is a
 * collision.
 * @param {!Blockly.Workspace} workspace The workspace on which to rename the
 *     variable.
 * @param {!Blockly.VariableModel} variable Variable to rename.
 * @param {function(?string=)=} opt_callback A callback. It will
 *     be passed an acceptable new variable name, or null if change is to be
 *     aborted (cancel button), or undefined if an existing variable was chosen.
 */
Blockly.Variables.renameVariable = function(workspace, variable, opt_callback) {
  // This function needs to be named so it can be called recursively.
  const promptAndCheckWithAlert = function(defaultName) {
    const promptText =
        Blockly.Msg['RENAME_VARIABLE_TITLE'].replace('%1', variable.name);
    Blockly.Variables.promptName(promptText, defaultName,
        function(newName) {
          if (newName) {
            const existing = Blockly.Variables.nameUsedWithOtherType_(newName,
                variable.type, workspace);
            if (existing) {
              const msg = Blockly.Msg['VARIABLE_ALREADY_EXISTS_FOR_ANOTHER_TYPE']
                  .replace('%1', existing.name)
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
      newVar = newVar.replace(/[\s\xa0]+/g, ' ').trim();
      if (newVar == Blockly.Msg['RENAME_VARIABLE'] ||
          newVar == Blockly.Msg['NEW_VARIABLE']) {
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
  const allVariables = workspace.getVariableMap().getAllVariables();

  name = name.toLowerCase();
  for (let i = 0, variable; (variable = allVariables[i]); i++) {
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
 * @return {?Blockly.VariableModel} The variable with the given name,
 *     or null if none was found.
 */
Blockly.Variables.nameUsedWithAnyType = function(name, workspace) {
  const allVariables = workspace.getVariableMap().getAllVariables();

  name = name.toLowerCase();
  for (let i = 0, variable; (variable = allVariables[i]); i++) {
    if (variable.name.toLowerCase() == name) {
      return variable;
    }
  }
  return null;
};

/**
 * Generate DOM objects representing a variable field.
 * @param {!Blockly.VariableModel} variableModel The variable model to
 *     represent.
 * @return {?Element} The generated DOM.
 * @public
 */
Blockly.Variables.generateVariableFieldDom = function(variableModel) {
  /* Generates the following XML:
   * <field name="VAR" id="goKTKmYJ8DhVHpruv" variabletype="int">foo</field>
   */
  const field = Blockly.utils.xml.createElement('field');
  field.setAttribute('name', 'VAR');
  field.setAttribute('id', variableModel.getId());
  field.setAttribute('variabletype', variableModel.type);
  const name = Blockly.utils.xml.createTextNode(variableModel.name);
  field.appendChild(name);
  return field;
};

/**
 * Helper function to look up or create a variable on the given workspace.
 * If no variable exists, creates and returns it.
 * @param {!Blockly.Workspace} workspace The workspace to search for the
 *     variable.  It may be a flyout workspace or main workspace.
 * @param {?string} id The ID to use to look up or create the variable, or null.
 * @param {string=} opt_name The string to use to look up or create the
 *     variable.
 * @param {string=} opt_type The type to use to look up or create the variable.
 * @return {!Blockly.VariableModel} The variable corresponding to the given ID
 *     or name + type combination.
 */
Blockly.Variables.getOrCreateVariablePackage = function(workspace, id, opt_name,
    opt_type) {
  let variable = Blockly.Variables.getVariable(workspace, id, opt_name,
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
 * @param {?string} id The ID to use to look up the variable, or null.
 * @param {string=} opt_name The string to use to look up the variable.
 *     Only used if lookup by ID fails.
 * @param {string=} opt_type The type to use to look up the variable.
 *     Only used if lookup by ID fails.
 * @return {?Blockly.VariableModel} The variable corresponding to the given ID
 *     or name + type combination, or null if not found.
 * @public
 */
Blockly.Variables.getVariable = function(workspace, id, opt_name, opt_type) {
  const potentialVariableMap = workspace.getPotentialVariableMap();
  let variable = null;
  // Try to just get the variable, by ID if possible.
  if (id) {
    // Look in the real variable map before checking the potential variable map.
    variable = workspace.getVariableById(id);
    if (!variable && potentialVariableMap) {
      variable = potentialVariableMap.getVariableById(id);
    }
    if (variable) {
      return variable;
    }
  }
  // If there was no ID, or there was an ID but it didn't match any variables,
  // look up by name and type.
  if (opt_name) {
    if (opt_type == undefined) {
      throw Error('Tried to look up a variable by name without a type');
    }
    // Otherwise look up by name and type.
    variable = workspace.getVariable(opt_name, opt_type);
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
 * @param {?string} id The ID to use to create the variable, or null.
 * @param {string=} opt_name The string to use to create the variable.
 * @param {string=} opt_type The type to use to create the variable.
 * @return {!Blockly.VariableModel} The variable corresponding to the given ID
 *     or name + type combination.
 * @private
 */
Blockly.Variables.createVariable_ = function(workspace, id, opt_name,
    opt_type) {
  const potentialVariableMap = workspace.getPotentialVariableMap();
  // Variables without names get uniquely named for this workspace.
  if (!opt_name) {
    const ws = workspace.isFlyout ? workspace.targetWorkspace : workspace;
    opt_name = Blockly.Variables.generateUniqueName(ws);
  }

  // Create a potential variable if in the flyout.
  let variable = null;
  if (potentialVariableMap) {
    variable = potentialVariableMap.createVariable(opt_name, opt_type, id);
  } else {  // In the main workspace, create a real variable.
    variable = workspace.createVariable(opt_name, opt_type, id);
  }
  return variable;
};

/**
 * Helper function to get the list of variables that have been added to the
 * workspace after adding a new block, using the given list of variables that
 * were in the workspace before the new block was added.
 * @param {!Blockly.Workspace} workspace The workspace to inspect.
 * @param {!Array<!Blockly.VariableModel>} originalVariables The array of
 *     variables that existed in the workspace before adding the new block.
 * @return {!Array<!Blockly.VariableModel>} The new array of variables that
 *     were freshly added to the workspace after creating the new block,
 *     or [] if no new variables were added to the workspace.
 * @package
 */
Blockly.Variables.getAddedVariables = function(workspace, originalVariables) {
  const allCurrentVariables = workspace.getAllVariables();
  const addedVariables = [];
  if (originalVariables.length != allCurrentVariables.length) {
    for (let i = 0; i < allCurrentVariables.length; i++) {
      const variable = allCurrentVariables[i];
      // For any variable that is present in allCurrentVariables but not
      // present in originalVariables, add the variable to addedVariables.
      if (originalVariables.indexOf(variable) == -1) {
        addedVariables.push(variable);
      }
    }
  }
  return addedVariables;
};
