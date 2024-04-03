/**
 * @license
 * Copyright 2012 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

// Former goog.module ID: Blockly.Variables

import {Blocks} from './blocks.js';
import * as dialog from './dialog.js';
import {isVariableBackedParameterModel} from './interfaces/i_variable_backed_parameter_model.js';
import {Msg} from './msg.js';
import {isLegacyProcedureDefBlock} from './interfaces/i_legacy_procedure_blocks.js';
import * as utilsXml from './utils/xml.js';
import {VariableModel} from './variable_model.js';
import type {Workspace} from './workspace.js';
import type {WorkspaceSvg} from './workspace_svg.js';

/**
 * String for use in the "custom" attribute of a category in toolbox XML.
 * This string indicates that the category should be dynamically populated with
 * variable blocks.
 * See also Blockly.Procedures.CATEGORY_NAME and
 * Blockly.VariablesDynamic.CATEGORY_NAME.
 */
export const CATEGORY_NAME = 'VARIABLE';

/**
 * Find all user-created variables that are in use in the workspace.
 * For use by generators.
 * To get a list of all variables on a workspace, including unused variables,
 * call Workspace.getAllVariables.
 *
 * @param ws The workspace to search for variables.
 * @returns Array of variable models.
 */
export function allUsedVarModels(ws: Workspace): VariableModel[] {
  const blocks = ws.getAllBlocks(false);
  const variables = new Set<VariableModel>();
  // Iterate through every block and add each variable to the set.
  for (let i = 0; i < blocks.length; i++) {
    const blockVariables = blocks[i].getVarModels();
    if (blockVariables) {
      for (let j = 0; j < blockVariables.length; j++) {
        const variable = blockVariables[j];
        const id = variable.getId();
        if (id) {
          variables.add(variable);
        }
      }
    }
  }
  // Convert the set into a list.
  return Array.from(variables.values());
}

/**
 * Find all developer variables used by blocks in the workspace.
 * Developer variables are never shown to the user, but are declared as global
 * variables in the generated code.
 * To declare developer variables, define the getDeveloperVariables function on
 * your block and return a list of variable names.
 * For use by generators.
 *
 * @param workspace The workspace to search.
 * @returns A list of non-duplicated variable names.
 */
export function allDeveloperVariables(workspace: Workspace): string[] {
  const blocks = workspace.getAllBlocks(false);
  const variables = new Set<string>();
  for (let i = 0, block; (block = blocks[i]); i++) {
    const getDeveloperVariables = block.getDeveloperVariables;
    if (getDeveloperVariables) {
      const devVars = getDeveloperVariables();
      for (let j = 0; j < devVars.length; j++) {
        variables.add(devVars[j]);
      }
    }
  }
  // Convert the set into a list.
  return Array.from(variables.values());
}

/**
 * Construct the elements (blocks and button) required by the flyout for the
 * variable category.
 *
 * @param workspace The workspace containing variables.
 * @returns Array of XML elements.
 */
export function flyoutCategory(workspace: WorkspaceSvg): Element[] {
  let xmlList = new Array<Element>();
  const button = document.createElement('button');
  button.setAttribute('text', '%{BKY_NEW_VARIABLE}');
  button.setAttribute('callbackKey', 'CREATE_VARIABLE');

  workspace.registerButtonCallback('CREATE_VARIABLE', function (button) {
    createVariableButtonHandler(button.getTargetWorkspace());
  });

  xmlList.push(button);

  const blockList = flyoutCategoryBlocks(workspace);
  xmlList = xmlList.concat(blockList);
  return xmlList;
}

/**
 * Construct the blocks required by the flyout for the variable category.
 *
 * @param workspace The workspace containing variables.
 * @returns Array of XML block elements.
 */
export function flyoutCategoryBlocks(workspace: Workspace): Element[] {
  const variableModelList = workspace.getVariablesOfType('');

  const xmlList = [];
  if (variableModelList.length > 0) {
    // New variables are added to the end of the variableModelList.
    const mostRecentVariable = variableModelList[variableModelList.length - 1];
    if (Blocks['variables_set']) {
      const block = utilsXml.createElement('block');
      block.setAttribute('type', 'variables_set');
      block.setAttribute('gap', Blocks['math_change'] ? '8' : '24');
      block.appendChild(generateVariableFieldDom(mostRecentVariable));
      xmlList.push(block);
    }
    if (Blocks['math_change']) {
      const block = utilsXml.createElement('block');
      block.setAttribute('type', 'math_change');
      block.setAttribute('gap', Blocks['variables_get'] ? '20' : '8');
      block.appendChild(generateVariableFieldDom(mostRecentVariable));
      const value = utilsXml.textToDom(
        '<value name="DELTA">' +
          '<shadow type="math_number">' +
          '<field name="NUM">1</field>' +
          '</shadow>' +
          '</value>',
      );
      block.appendChild(value);
      xmlList.push(block);
    }

    if (Blocks['variables_get']) {
      variableModelList.sort(VariableModel.compareByName);
      for (let i = 0, variable; (variable = variableModelList[i]); i++) {
        const block = utilsXml.createElement('block');
        block.setAttribute('type', 'variables_get');
        block.setAttribute('gap', '8');
        block.appendChild(generateVariableFieldDom(variable));
        xmlList.push(block);
      }
    }
  }
  return xmlList;
}

export const VAR_LETTER_OPTIONS = 'ijkmnopqrstuvwxyzabcdefgh';

/**
 * Return a new variable name that is not yet being used. This will try to
 * generate single letter variable names in the range 'i' to 'z' to start with.
 * If no unique name is located it will try 'i' to 'z', 'a' to 'h',
 * then 'i2' to 'z2' etc.  Skip 'l'.
 *
 * @param workspace The workspace to be unique in.
 * @returns New variable name.
 */
export function generateUniqueName(workspace: Workspace): string {
  return TEST_ONLY.generateUniqueNameInternal(workspace);
}

/**
 * Private version of generateUniqueName for stubbing in tests.
 */
function generateUniqueNameInternal(workspace: Workspace): string {
  return generateUniqueNameFromOptions(
    VAR_LETTER_OPTIONS.charAt(0),
    workspace.getAllVariableNames(),
  );
}

/**
 * Returns a unique name that is not present in the usedNames array. This
 * will try to generate single letter names in the range a - z (skip l). It
 * will start with the character passed to startChar.
 *
 * @param startChar The character to start the search at.
 * @param usedNames A list of all of the used names.
 * @returns A unique name that is not present in the usedNames array.
 */
export function generateUniqueNameFromOptions(
  startChar: string,
  usedNames: string[],
): string {
  if (!usedNames.length) {
    return startChar;
  }

  const letters = VAR_LETTER_OPTIONS;
  let suffix = '';
  let letterIndex = letters.indexOf(startChar);
  let potName = startChar;

  // eslint-disable-next-line no-constant-condition
  while (true) {
    let inUse = false;
    for (let i = 0; i < usedNames.length; i++) {
      if (usedNames[i].toLowerCase() === potName) {
        inUse = true;
        break;
      }
    }
    if (!inUse) {
      break;
    }

    letterIndex++;
    if (letterIndex === letters.length) {
      // Reached the end of the character sequence so back to 'i'.
      letterIndex = 0;
      suffix = `${Number(suffix) + 1}`;
    }
    potName = letters.charAt(letterIndex) + suffix;
  }
  return potName;
}

/**
 * Handles "Create Variable" button in the default variables toolbox category.
 * It will prompt the user for a variable name, including re-prompts if a name
 * is already in use among the workspace's variables.
 *
 * Custom button handlers can delegate to this function, allowing variables
 * types and after-creation processing. More complex customization (e.g.,
 * prompting for variable type) is beyond the scope of this function.
 *
 * @param workspace The workspace on which to create the variable.
 * @param opt_callback A callback. It will be passed an acceptable new variable
 *     name, or null if change is to be aborted (cancel button), or undefined if
 *     an existing variable was chosen.
 * @param opt_type The type of the variable like 'int', 'string', or ''. This
 *     will default to '', which is a specific type.
 */
export function createVariableButtonHandler(
  workspace: Workspace,
  opt_callback?: (p1?: string | null) => void,
  opt_type?: string,
) {
  const type = opt_type || '';
  // This function needs to be named so it can be called recursively.
  function promptAndCheckWithAlert(defaultName: string) {
    promptName(Msg['NEW_VARIABLE_TITLE'], defaultName, function (text) {
      if (!text) {
        // User canceled prompt.
        if (opt_callback) opt_callback(null);
        return;
      }

      const existing = nameUsedWithAnyType(text, workspace);
      if (!existing) {
        // No conflict
        workspace.createVariable(text, type);
        if (opt_callback) opt_callback(text);
        return;
      }

      let msg;
      if (existing.type === type) {
        msg = Msg['VARIABLE_ALREADY_EXISTS'].replace('%1', existing.name);
      } else {
        msg = Msg['VARIABLE_ALREADY_EXISTS_FOR_ANOTHER_TYPE'];
        msg = msg.replace('%1', existing.name).replace('%2', existing.type);
      }
      dialog.alert(msg, function () {
        promptAndCheckWithAlert(text);
      });
    });
  }
  promptAndCheckWithAlert('');
}

/**
 * Opens a prompt that allows the user to enter a new name for a variable.
 * Triggers a rename if the new name is valid. Or re-prompts if there is a
 * collision.
 *
 * @param workspace The workspace on which to rename the variable.
 * @param variable Variable to rename.
 * @param opt_callback A callback. It will be passed an acceptable new variable
 *     name, or null if change is to be aborted (cancel button), or undefined if
 *     an existing variable was chosen.
 */
export function renameVariable(
  workspace: Workspace,
  variable: VariableModel,
  opt_callback?: (p1?: string | null) => void,
) {
  // This function needs to be named so it can be called recursively.
  function promptAndCheckWithAlert(defaultName: string) {
    const promptText = Msg['RENAME_VARIABLE_TITLE'].replace(
      '%1',
      variable.name,
    );
    promptName(promptText, defaultName, function (newName) {
      if (!newName) {
        // User canceled prompt.
        if (opt_callback) opt_callback(null);
        return;
      }

      const existing = nameUsedWithOtherType(newName, variable.type, workspace);
      const procedure = nameUsedWithConflictingParam(
        variable.name,
        newName,
        workspace,
      );
      if (!existing && !procedure) {
        // No conflict.
        workspace.renameVariableById(variable.getId(), newName);
        if (opt_callback) opt_callback(newName);
        return;
      }

      let msg = '';
      if (existing) {
        msg = Msg['VARIABLE_ALREADY_EXISTS_FOR_ANOTHER_TYPE']
          .replace('%1', existing.name)
          .replace('%2', existing.type);
      } else if (procedure) {
        msg = Msg['VARIABLE_ALREADY_EXISTS_FOR_A_PARAMETER']
          .replace('%1', newName)
          .replace('%2', procedure);
      }
      dialog.alert(msg, function () {
        promptAndCheckWithAlert(newName);
      });
    });
  }
  promptAndCheckWithAlert('');
}

/**
 * Prompt the user for a new variable name.
 *
 * @param promptText The string of the prompt.
 * @param defaultText The default value to show in the prompt's field.
 * @param callback A callback. It will be passed the new variable name, or null
 *     if the user picked something illegal.
 */
export function promptName(
  promptText: string,
  defaultText: string,
  callback: (p1: string | null) => void,
) {
  dialog.prompt(promptText, defaultText, function (newVar) {
    // Merge runs of whitespace.  Strip leading and trailing whitespace.
    // Beyond this, all names are legal.
    if (newVar) {
      newVar = newVar.replace(/[\s\xa0]+/g, ' ').trim();
      if (newVar === Msg['RENAME_VARIABLE'] || newVar === Msg['NEW_VARIABLE']) {
        // Ok, not ALL names are legal...
        newVar = null;
      }
    }
    callback(newVar);
  });
}
/**
 * Check whether there exists a variable with the given name but a different
 * type.
 *
 * @param name The name to search for.
 * @param type The type to exclude from the search.
 * @param workspace The workspace to search for the variable.
 * @returns The variable with the given name and a different type, or null if
 *     none was found.
 */
function nameUsedWithOtherType(
  name: string,
  type: string,
  workspace: Workspace,
): VariableModel | null {
  const allVariables = workspace.getVariableMap().getAllVariables();

  name = name.toLowerCase();
  for (let i = 0, variable; (variable = allVariables[i]); i++) {
    if (variable.name.toLowerCase() === name && variable.type !== type) {
      return variable;
    }
  }
  return null;
}

/**
 * Check whether there exists a variable with the given name of any type.
 *
 * @param name The name to search for.
 * @param workspace The workspace to search for the variable.
 * @returns The variable with the given name, or null if none was found.
 */
export function nameUsedWithAnyType(
  name: string,
  workspace: Workspace,
): VariableModel | null {
  const allVariables = workspace.getVariableMap().getAllVariables();

  name = name.toLowerCase();
  for (let i = 0, variable; (variable = allVariables[i]); i++) {
    if (variable.name.toLowerCase() === name) {
      return variable;
    }
  }
  return null;
}

/**
 * Returns the name of the procedure with a conflicting parameter name, or null
 * if one does not exist.
 *
 * This checks the procedure map if it contains models, and the legacy procedure
 * blocks otherwise.
 *
 * @param oldName The old name of the variable.
 * @param newName The proposed name of the variable.
 * @param workspace The workspace to search for conflicting parameters.
 * @internal
 */
export function nameUsedWithConflictingParam(
  oldName: string,
  newName: string,
  workspace: Workspace,
): string | null {
  return workspace.getProcedureMap().getProcedures().length
    ? checkForConflictingParamWithProcedureModels(oldName, newName, workspace)
    : checkForConflictingParamWithLegacyProcedures(oldName, newName, workspace);
}

/**
 * Returns the name of the procedure model with a conflicting param name, or
 * null if one does not exist.
 */
function checkForConflictingParamWithProcedureModels(
  oldName: string,
  newName: string,
  workspace: Workspace,
): string | null {
  oldName = oldName.toLowerCase();
  newName = newName.toLowerCase();

  const procedures = workspace.getProcedureMap().getProcedures();
  for (const procedure of procedures) {
    const params = procedure
      .getParameters()
      .filter(isVariableBackedParameterModel)
      .map((param) => param.getVariableModel().name);
    if (!params) continue;
    const procHasOld = params.some((param) => param.toLowerCase() === oldName);
    const procHasNew = params.some((param) => param.toLowerCase() === newName);
    if (procHasOld && procHasNew) return procedure.getName();
  }
  return null;
}

/**
 * Returns the name of the procedure block with a conflicting param name, or
 * null if one does not exist.
 */
function checkForConflictingParamWithLegacyProcedures(
  oldName: string,
  newName: string,
  workspace: Workspace,
): string | null {
  oldName = oldName.toLowerCase();
  newName = newName.toLowerCase();

  const blocks = workspace.getAllBlocks(false);
  for (const block of blocks) {
    if (!isLegacyProcedureDefBlock(block)) continue;
    const def = block.getProcedureDef();
    const params = def[1];
    const blockHasOld = params.some((param) => param.toLowerCase() === oldName);
    const blockHasNew = params.some((param) => param.toLowerCase() === newName);
    if (blockHasOld && blockHasNew) return def[0];
  }
  return null;
}

/**
 * Generate DOM objects representing a variable field.
 *
 * @param variableModel The variable model to represent.
 * @returns The generated DOM.
 */
export function generateVariableFieldDom(
  variableModel: VariableModel,
): Element {
  /* Generates the following XML:
   * <field name="VAR" id="goKTKmYJ8DhVHpruv" variabletype="int">foo</field>
   */
  const field = utilsXml.createElement('field');
  field.setAttribute('name', 'VAR');
  field.setAttribute('id', variableModel.getId());
  field.setAttribute('variabletype', variableModel.type);
  const name = utilsXml.createTextNode(variableModel.name);
  field.appendChild(name);
  return field;
}

/**
 * Helper function to look up or create a variable on the given workspace.
 * If no variable exists, creates and returns it.
 *
 * @param workspace The workspace to search for the variable.  It may be a
 *     flyout workspace or main workspace.
 * @param id The ID to use to look up or create the variable, or null.
 * @param opt_name The string to use to look up or create the variable.
 * @param opt_type The type to use to look up or create the variable.
 * @returns The variable corresponding to the given ID or name + type
 *     combination.
 */
export function getOrCreateVariablePackage(
  workspace: Workspace,
  id: string | null,
  opt_name?: string,
  opt_type?: string,
): VariableModel {
  let variable = getVariable(workspace, id, opt_name, opt_type);
  if (!variable) {
    variable = createVariable(workspace, id, opt_name, opt_type);
  }
  return variable;
}

/**
 * Look up  a variable on the given workspace.
 * Always looks in the main workspace before looking in the flyout workspace.
 * Always prefers lookup by ID to lookup by name + type.
 *
 * @param workspace The workspace to search for the variable.  It may be a
 *     flyout workspace or main workspace.
 * @param id The ID to use to look up the variable, or null.
 * @param opt_name The string to use to look up the variable.
 *     Only used if lookup by ID fails.
 * @param opt_type The type to use to look up the variable.
 *     Only used if lookup by ID fails.
 * @returns The variable corresponding to the given ID or name + type
 *     combination, or null if not found.
 */
export function getVariable(
  workspace: Workspace,
  id: string | null,
  opt_name?: string,
  opt_type?: string,
): VariableModel | null {
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
    if (opt_type === undefined) {
      throw Error('Tried to look up a variable by name without a type');
    }
    // Otherwise look up by name and type.
    variable = workspace.getVariable(opt_name, opt_type);
    if (!variable && potentialVariableMap) {
      variable = potentialVariableMap.getVariable(opt_name, opt_type);
    }
  }
  return variable;
}

/**
 * Helper function to create a variable on the given workspace.
 *
 * @param workspace The workspace in which to create the variable.  It may be a
 *     flyout workspace or main workspace.
 * @param id The ID to use to create the variable, or null.
 * @param opt_name The string to use to create the variable.
 * @param opt_type The type to use to create the variable.
 * @returns The variable corresponding to the given ID or name + type
 *     combination.
 */
function createVariable(
  workspace: Workspace,
  id: string | null,
  opt_name?: string,
  opt_type?: string,
): VariableModel {
  const potentialVariableMap = workspace.getPotentialVariableMap();
  // Variables without names get uniquely named for this workspace.
  if (!opt_name) {
    const ws = workspace.isFlyout
      ? (workspace as WorkspaceSvg).targetWorkspace
      : workspace;
    opt_name = generateUniqueName(ws!);
  }

  // Create a potential variable if in the flyout.
  let variable = null;
  if (potentialVariableMap) {
    variable = potentialVariableMap.createVariable(opt_name, opt_type, id);
  } else {
    // In the main workspace, create a real variable.
    variable = workspace.createVariable(opt_name, opt_type, id);
  }
  return variable;
}

/**
 * Helper function to get the list of variables that have been added to the
 * workspace after adding a new block, using the given list of variables that
 * were in the workspace before the new block was added.
 *
 * @param workspace The workspace to inspect.
 * @param originalVariables The array of variables that existed in the workspace
 *     before adding the new block.
 * @returns The new array of variables that were freshly added to the workspace
 *     after creating the new block, or [] if no new variables were added to the
 *     workspace.
 * @internal
 */
export function getAddedVariables(
  workspace: Workspace,
  originalVariables: VariableModel[],
): VariableModel[] {
  const allCurrentVariables = workspace.getAllVariables();
  const addedVariables = [];
  if (originalVariables.length !== allCurrentVariables.length) {
    for (let i = 0; i < allCurrentVariables.length; i++) {
      const variable = allCurrentVariables[i];
      // For any variable that is present in allCurrentVariables but not
      // present in originalVariables, add the variable to addedVariables.
      if (originalVariables.indexOf(variable) === -1) {
        addedVariables.push(variable);
      }
    }
  }
  return addedVariables;
}

export const TEST_ONLY = {
  generateUniqueNameInternal,
};
