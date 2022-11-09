/**
 * @license
 * Copyright 2022 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {genUid} from '../utils/idgenerator.js';
import type {IParameterModel} from '../interfaces/i_parameter_model.js';
import {triggerProceduresUpdate} from './update_procedures.js';
import type {VariableModel} from '../variable_model.js';
import type {Workspace} from '../workspace.js';


export class ObservableParameterModel implements IParameterModel {
  private id: string;
  private variable: VariableModel;

  constructor(
      private readonly workspace: Workspace, name: string, id?: string) {
    this.id = id ?? genUid();
    this.variable =
        this.workspace.getVariable(name) ?? workspace.createVariable(name);
  }

  /**
   * Sets the name of this parameter to the given name.
   */
  setName(name: string): this {
    // TODO(#6516): Fire events.
    if (name == this.variable.name) return this;
    this.variable =
        this.workspace.getVariable(name) ?? this.workspace.createVariable(name);
    triggerProceduresUpdate(this.workspace);
    return this;
  }

  /**
   * Unimplemented. The built-in ParameterModel does not support typing.
   * If you want your procedure blocks to have typed parameters, you need to
   * implement your own ParameterModel.
   *
   * @throws Throws for the ObservableParameterModel specifically because this
   *     method is unimplemented.
   */
  setTypes(_types: string[]): this {
    throw new Error(
        'The built-in ParameterModel does not support typing. You need to ' +
        'implement your own custom ParameterModel.');
  }

  /**
   * Returns the name of this parameter.
   */
  getName(): string {
    return this.variable.name;
  }

  /**
   * Returns the types of this parameter.
   */
  getTypes(): string[] {
    return [];
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
