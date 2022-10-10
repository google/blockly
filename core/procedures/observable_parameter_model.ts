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
  private variable: VariableModel;

  constructor(
      private readonly workspace: Workspace, name: string, id?: string) {
    this.id = id ?? genUid();
    this.variable = workspace.createVariable(name);
  }

  /**
   * Sets the name of this parameter to the given name.
   */
  setName(name: string): ObservableParameterModel {
    if (name == this.variable.name) return this;
    this.variable =
        this.workspace.getVariable(name) ?? this.workspace.createVariable(name);
    return this;
  }

  /**
   * Unimplemented. The built-in ParameterModel does not support typing.
   * If you want your procedure blocks to have typed parameters, you need to
   * implement your own ParameterModel.
   */
  setType(type: string): ObservableParameterModel {
    console.warn(
        'The built-in ParameterModel does not support typing. You need to ' +
        'implement your own custom ParameterModel.')
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
