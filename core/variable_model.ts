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
import type {Workspace} from './workspace.js';

/**
 * Class for a variable model.
 * Holds information for the variable including name, ID, and type.
 *
 * @see {Blockly.FieldVariable}
 */
export class VariableModel {
  type: string;
  private readonly id: string;

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
    public workspace: Workspace,
    public name: string,
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
    this.id = opt_id || idGenerator.genUid();
  }

  /** @returns The ID for the variable. */
  getId(): string {
    return this.id;
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
    return var1.name.localeCompare(var2.name, undefined, {sensitivity: 'base'});
  }
}
