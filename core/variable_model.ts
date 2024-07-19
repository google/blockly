/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Components for the variable model.
 *
 * @class
 */
// Former goog.module ID: Blockly.VariableModel

// Unused import preserved for side-effects. Remove if unneeded.
import './events/events_var_create.js';

import * as idGenerator from './utils/idgenerator.js';
import * as registry from './registry.js';
import type {Workspace} from './workspace.js';
import {IVariableModel, IVariableState} from './interfaces/i_variable_model.js';

/**
 * Class for a variable model.
 * Holds information for the variable including name, ID, and type.
 *
 * @see {Blockly.FieldVariable}
 */
export class VariableModel implements IVariableModel<IVariableState> {
  private type: string;
  private readonly id_: string;

  /**
   * @param workspace The variable's workspace.
   * @param name The name of the variable.  This is the user-visible name (e.g.
   *     'my var' or '私の変数'), not the generated name.
   * @param opt_type The type of the variable like 'int' or 'string'.
   *     Does not need to be unique. Field_variable can filter variables based
   * on their type. This will default to '' which is a specific type.
   * @param opt_id The unique ID of the variable. This will default to a UUID.
   */
  constructor(
    private workspace: Workspace,
    private name: string,
    opt_type?: string,
    opt_id?: string,
  ) {
    /**
     * The type of the variable, such as 'int' or 'sound_effect'. This may be
     * used to build a list of variables of a specific type. By default this is
     * the empty string '', which is a specific type.
     *
     * @see {Blockly.FieldVariable}
     */
    this.type = opt_type || '';

    /**
     * A unique ID for the variable. This should be defined at creation and
     * not change, even if the name changes. In most cases this should be a
     * UUID.
     */
    this.id_ = opt_id || idGenerator.genUid();
  }

  /** @returns The ID for the variable. */
  getId(): string {
    return this.id_;
  }

  /** @returns The name of this variable. */
  getName(): string {
    return this.name;
  }

  /**
   * Updates the user-visible name of this variable.
   *
   * @returns The newly-updated variable.
   */
  setName(newName: string): this {
    this.name = newName;
    return this;
  }

  /** @returns The type of this variable. */
  getType(): string {
    return this.type;
  }

  /**
   * Updates the type of this variable.
   *
   * @returns The newly-updated variable.
   */
  setType(newType: string): this {
    this.type = newType;
    return this;
  }

  getWorkspace(): Workspace {
    return this.workspace;
  }

  save(): IVariableState {
    const state: IVariableState = {
      'name': this.getName(),
      'id': this.getId(),
    };
    const type = this.getType();
    if (type) {
      state['type'] = type;
    }

    return state;
  }

  static load(state: IVariableState, workspace: Workspace) {
    // TODO(adodson): Once VariableMap implements IVariableMap, directly
    // construct a variable, retrieve the variable map from the workspace,
    // add the variable to that variable map, and fire a VAR_CREATE event.
    workspace.createVariable(state['name'], state['type'], state['id']);
  }

  /**
   * A custom compare function for the VariableModel objects.
   *
   * @param var1 First variable to compare.
   * @param var2 Second variable to compare.
   * @returns -1 if name of var1 is less than name of var2, 0 if equal, and 1 if
   *     greater.
   * @internal
   */
  static compareByName(var1: VariableModel, var2: VariableModel): number {
    return var1
      .getName()
      .localeCompare(var2.getName(), undefined, {sensitivity: 'base'});
  }
}

registry.register(
  registry.Type.VARIABLE_MODEL,
  registry.DEFAULT,
  VariableModel,
);
