/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Object representing a map of variables and their types.
 *
 * @class
 */
// Former goog.module ID: Blockly.VariableMap

// Unused import preserved for side-effects. Remove if unneeded.
import './events/events_var_delete.js';
// Unused import preserved for side-effects. Remove if unneeded.
import './events/events_var_rename.js';

import type {Block} from './block.js';
import * as dialog from './dialog.js';
import {EventType} from './events/type.js';
import * as eventUtils from './events/utils.js';
import {Msg} from './msg.js';
import {Names} from './names.js';
import * as arrayUtils from './utils/array.js';
import * as idGenerator from './utils/idgenerator.js';
import {VariableModel} from './variable_model.js';
import type {Workspace} from './workspace.js';

/**
 * Class for a variable map.  This contains a dictionary data structure with
 * variable types as keys and lists of variables as values.  The list of
 * variables are the type indicated by the key.
 */
export class VariableMap {
  /**
   * A map from variable type to list of variable names.  The lists contain
   * all of the named variables in the workspace, including variables that are
   * not currently in use.
   */
  private variableMap = new Map<string, VariableModel[]>();

  /** @param workspace The workspace this map belongs to. */
  constructor(public workspace: Workspace) {}

  /** Clear the variable map.  Fires events for every deletion. */
  clear() {
    for (const variables of this.variableMap.values()) {
      while (variables.length > 0) {
        this.deleteVariable(variables[0]);
      }
    }
    if (this.variableMap.size !== 0) {
      throw Error('Non-empty variable map');
    }
  }

  /* Begin functions for renaming variables. */
  /**
   * Rename the given variable by updating its name in the variable map.
   *
   * @param variable Variable to rename.
   * @param newName New variable name.
   * @internal
   */
  renameVariable(variable: VariableModel, newName: string) {
    if (variable.name === newName) return;
    const type = variable.type;
    const conflictVar = this.getVariable(newName, type);
    const blocks = this.workspace.getAllBlocks(false);
    const existingGroup = eventUtils.getGroup();
    if (!existingGroup) {
      eventUtils.setGroup(true);
    }
    try {
      // The IDs may match if the rename is a simple case change (name1 ->
      // Name1).
      if (!conflictVar || conflictVar.getId() === variable.getId()) {
        this.renameVariableAndUses(variable, newName, blocks);
      } else {
        this.renameVariableWithConflict(variable, newName, conflictVar, blocks);
      }
    } finally {
      eventUtils.setGroup(existingGroup);
    }
  }

  /**
   * Rename a variable by updating its name in the variable map. Identify the
   * variable to rename with the given ID.
   *
   * @param id ID of the variable to rename.
   * @param newName New variable name.
   */
  renameVariableById(id: string, newName: string) {
    const variable = this.getVariableById(id);
    if (!variable) {
      throw Error("Tried to rename a variable that didn't exist. ID: " + id);
    }

    this.renameVariable(variable, newName);
  }

  /**
   * Update the name of the given variable and refresh all references to it.
   * The new name must not conflict with any existing variable names.
   *
   * @param variable Variable to rename.
   * @param newName New variable name.
   * @param blocks The list of all blocks in the workspace.
   */
  private renameVariableAndUses(
    variable: VariableModel,
    newName: string,
    blocks: Block[],
  ) {
    eventUtils.fire(
      new (eventUtils.get(EventType.VAR_RENAME))(variable, newName),
    );
    variable.name = newName;
    for (let i = 0; i < blocks.length; i++) {
      blocks[i].updateVarName(variable);
    }
  }

  /**
   * Update the name of the given variable to the same name as an existing
   * variable.  The two variables are coalesced into a single variable with the
   * ID of the existing variable that was already using newName. Refresh all
   * references to the variable.
   *
   * @param variable Variable to rename.
   * @param newName New variable name.
   * @param conflictVar The variable that was already using newName.
   * @param blocks The list of all blocks in the workspace.
   */
  private renameVariableWithConflict(
    variable: VariableModel,
    newName: string,
    conflictVar: VariableModel,
    blocks: Block[],
  ) {
    const type = variable.type;
    const oldCase = conflictVar.name;

    if (newName !== oldCase) {
      // Simple rename to change the case and update references.
      this.renameVariableAndUses(conflictVar, newName, blocks);
    }

    // These blocks now refer to a different variable.
    // These will fire change events.
    for (let i = 0; i < blocks.length; i++) {
      blocks[i].renameVarById(variable.getId(), conflictVar.getId());
    }
    // Finally delete the original variable, which is now unreferenced.
    eventUtils.fire(new (eventUtils.get(EventType.VAR_DELETE))(variable));
    // And remove it from the list.
    arrayUtils.removeElem(this.variableMap.get(type)!, variable);
  }

  /* End functions for renaming variables. */
  /**
   * Create a variable with a given name, optional type, and optional ID.
   *
   * @param name The name of the variable. This must be unique across variables
   *     and procedures.
   * @param opt_type The type of the variable like 'int' or 'string'.
   *     Does not need to be unique. Field_variable can filter variables based
   * on their type. This will default to '' which is a specific type.
   * @param opt_id The unique ID of the variable. This will default to a UUID.
   * @returns The newly created variable.
   */
  createVariable(
    name: string,
    opt_type?: string | null,
    opt_id?: string | null,
  ): VariableModel {
    let variable = this.getVariable(name, opt_type);
    if (variable) {
      if (opt_id && variable.getId() !== opt_id) {
        throw Error(
          'Variable "' +
            name +
            '" is already in use and its id is "' +
            variable.getId() +
            '" which conflicts with the passed in ' +
            'id, "' +
            opt_id +
            '".',
        );
      }
      // The variable already exists and has the same ID.
      return variable;
    }
    if (opt_id && this.getVariableById(opt_id)) {
      throw Error('Variable id, "' + opt_id + '", is already in use.');
    }
    const id = opt_id || idGenerator.genUid();
    const type = opt_type || '';
    variable = new VariableModel(this.workspace, name, type, id);

    const variables = this.variableMap.get(type) || [];
    variables.push(variable);
    // Delete the list of variables of this type, and re-add it so that
    // the most recent addition is at the end.
    // This is used so the toolbox's set block is set to the most recent
    // variable.
    this.variableMap.delete(type);
    this.variableMap.set(type, variables);

    eventUtils.fire(new (eventUtils.get(EventType.VAR_CREATE))(variable));

    return variable;
  }

  /* Begin functions for variable deletion. */
  /**
   * Delete a variable.
   *
   * @param variable Variable to delete.
   */
  deleteVariable(variable: VariableModel) {
    const variableId = variable.getId();
    const variableList = this.variableMap.get(variable.type);
    if (variableList) {
      for (let i = 0; i < variableList.length; i++) {
        const tempVar = variableList[i];
        if (tempVar.getId() === variableId) {
          variableList.splice(i, 1);
          eventUtils.fire(new (eventUtils.get(EventType.VAR_DELETE))(variable));
          if (variableList.length === 0) {
            this.variableMap.delete(variable.type);
          }
          return;
        }
      }
    }
  }

  /**
   * Delete a variables by the passed in ID and all of its uses from this
   * workspace. May prompt the user for confirmation.
   *
   * @param id ID of variable to delete.
   */
  deleteVariableById(id: string) {
    const variable = this.getVariableById(id);
    if (variable) {
      // Check whether this variable is a function parameter before deleting.
      const variableName = variable.name;
      const uses = this.getVariableUsesById(id);
      for (let i = 0, block; (block = uses[i]); i++) {
        if (
          block.type === 'procedures_defnoreturn' ||
          block.type === 'procedures_defreturn'
        ) {
          const procedureName = String(block.getFieldValue('NAME'));
          const deleteText = Msg['CANNOT_DELETE_VARIABLE_PROCEDURE']
            .replace('%1', variableName)
            .replace('%2', procedureName);
          dialog.alert(deleteText);
          return;
        }
      }

      if (uses.length > 1) {
        // Confirm before deleting multiple blocks.
        const confirmText = Msg['DELETE_VARIABLE_CONFIRMATION']
          .replace('%1', String(uses.length))
          .replace('%2', variableName);
        dialog.confirm(confirmText, (ok) => {
          if (ok && variable) {
            this.deleteVariableInternal(variable, uses);
          }
        });
      } else {
        // No confirmation necessary for a single block.
        this.deleteVariableInternal(variable, uses);
      }
    } else {
      console.warn("Can't delete non-existent variable: " + id);
    }
  }

  /**
   * Deletes a variable and all of its uses from this workspace without asking
   * the user for confirmation.
   *
   * @param variable Variable to delete.
   * @param uses An array of uses of the variable.
   * @internal
   */
  deleteVariableInternal(variable: VariableModel, uses: Block[]) {
    const existingGroup = eventUtils.getGroup();
    if (!existingGroup) {
      eventUtils.setGroup(true);
    }
    try {
      for (let i = 0; i < uses.length; i++) {
        uses[i].dispose(true);
      }
      this.deleteVariable(variable);
    } finally {
      eventUtils.setGroup(existingGroup);
    }
  }
  /* End functions for variable deletion. */
  /**
   * Find the variable by the given name and type and return it.  Return null if
   *     it is not found.
   *
   * @param name The name to check for.
   * @param opt_type The type of the variable.  If not provided it defaults to
   *     the empty string, which is a specific type.
   * @returns The variable with the given name, or null if it was not found.
   */
  getVariable(name: string, opt_type?: string | null): VariableModel | null {
    const type = opt_type || '';
    const list = this.variableMap.get(type);
    if (list) {
      for (let j = 0, variable; (variable = list[j]); j++) {
        if (Names.equals(variable.name, name)) {
          return variable;
        }
      }
    }
    return null;
  }

  /**
   * Find the variable by the given ID and return it.  Return null if not found.
   *
   * @param id The ID to check for.
   * @returns The variable with the given ID.
   */
  getVariableById(id: string): VariableModel | null {
    for (const variables of this.variableMap.values()) {
      for (const variable of variables) {
        if (variable.getId() === id) {
          return variable;
        }
      }
    }
    return null;
  }

  /**
   * Get a list containing all of the variables of a specified type. If type is
   *     null, return list of variables with empty string type.
   *
   * @param type Type of the variables to find.
   * @returns The sought after variables of the passed in type. An empty array
   *     if none are found.
   */
  getVariablesOfType(type: string | null): VariableModel[] {
    type = type || '';
    const variableList = this.variableMap.get(type);
    if (variableList) {
      return variableList.slice();
    }
    return [];
  }

  /**
   * Return all variable and potential variable types.  This list always
   * contains the empty string.
   *
   * @param ws The workspace used to look for potential variables. This can be
   *     different than the workspace stored on this object if the passed in ws
   *     is a flyout workspace.
   * @returns List of variable types.
   * @internal
   */
  getVariableTypes(ws: Workspace | null): string[] {
    const variableTypes = new Set<string>(this.variableMap.keys());
    if (ws && ws.getPotentialVariableMap()) {
      for (const key of ws.getPotentialVariableMap()!.variableMap.keys()) {
        variableTypes.add(key);
      }
    }
    if (!variableTypes.has('')) {
      variableTypes.add('');
    }
    return Array.from(variableTypes.values());
  }

  /**
   * Return all variables of all types.
   *
   * @returns List of variable models.
   */
  getAllVariables(): VariableModel[] {
    let allVariables: VariableModel[] = [];
    for (const variables of this.variableMap.values()) {
      allVariables = allVariables.concat(variables);
    }
    return allVariables;
  }

  /**
   * Returns all of the variable names of all types.
   *
   * @returns All of the variable names of all types.
   */
  getAllVariableNames(): string[] {
    return Array.from(this.variableMap.values())
      .flat()
      .map((variable) => variable.name);
  }

  /**
   * Find all the uses of a named variable.
   *
   * @param id ID of the variable to find.
   * @returns Array of block usages.
   */
  getVariableUsesById(id: string): Block[] {
    const uses = [];
    const blocks = this.workspace.getAllBlocks(false);
    // Iterate through every block and check the name.
    for (let i = 0; i < blocks.length; i++) {
      const blockVariables = blocks[i].getVarModels();
      if (blockVariables) {
        for (let j = 0; j < blockVariables.length; j++) {
          if (blockVariables[j].getId() === id) {
            uses.push(blocks[i]);
          }
        }
      }
    }
    return uses;
  }
}
