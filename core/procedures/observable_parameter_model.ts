/**
 * @license
 * Copyright 2022 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */


import * as goog from '../../closure/goog/goog.js';
goog.declareModuleId('Blockly.procedures.ObservableParameterModel');

import type {IParameterModel} from '../interfaces/i_parameter_model.js';
import {genUid} from '../utils/idgenerator.js';
import type {VariableModel} from '../variable_model.js';
import type {Workspace} from '../workspace.js';


export class ObservableParameterModel implements IParameterModel {
  private id: string;

  constructor(
      private readonly workspace: Workspace, private variable: VariableModel,
      id?: string) {
    this.id = id ?? genUid();
  }

  /**
   * Sets the variable associated with the parameter model.
   *
   * Parameters have an identity (represented by the ID) which is separate from
   * both their position in the parameter list, and the variable model they are
   * associated with. The variable they are associated with can change over time
   * as the human-readable parameter name is renamed.
   */
  setVariable(variable: VariableModel): ObservableParameterModel {
    this.variable = variable;
    return this;
  }

  /**
   * Returns the unique language-neutral ID for the parameter.
   *
   * This represents the identify of the variable model which does not change
   * over time.
   */
  getId(): string {
    return this.id;
  }

  /** Returns the variable model associated with the parameter model. */
  getVariableModel(): VariableModel {
    return this.variable;
  }
}
