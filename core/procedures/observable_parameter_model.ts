/**
 * @license
 * Copyright 2022 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import * as eventUtils from '../events/utils.js';
import {genUid} from '../utils/idgenerator.js';
import type {IParameterModel} from '../interfaces/i_parameter_model.js';
import type {IProcedureModel} from '../interfaces/i_procedure_model';
import {triggerProceduresUpdate} from './update_procedures.js';
import type {VariableModel} from '../variable_model.js';
import type {Workspace} from '../workspace.js';
import * as goog from '../../closure/goog/goog.js';
goog.declareModuleId('Blockly.procedures.ObservableParameterModel');


export class ObservableParameterModel implements IParameterModel {
  private id: string;
  private variable: VariableModel;
  private shouldFireEvents = false;
  private procedureModel: IProcedureModel|null = null;

  constructor(
      private readonly workspace: Workspace, name: string, id?: string,
      varId?: string) {
    this.id = id ?? genUid();
    this.variable = this.workspace.getVariable(name) ??
        workspace.createVariable(name, '', varId);
  }

  /**
   * Sets the name of this parameter to the given name.
   */
  setName(name: string): this {
    if (name === this.variable.name) return this;
    const oldName = this.variable.name;
    this.variable =
        this.workspace.getVariable(name) ?? this.workspace.createVariable(name);
    triggerProceduresUpdate(this.workspace);
    if (this.shouldFireEvents) {
      eventUtils.fire(
          new (eventUtils.get(eventUtils.PROCEDURE_PARAMETER_RENAME))(
              this.workspace, this.procedureModel, this, oldName));
    }
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

  /**
   * Tells the parameter model it should fire events.
   *
   * @internal
   */
  startPublishing() {
    this.shouldFireEvents = true;
  }

  /**
   * Tells the parameter model it should not fire events.
   *
   * @internal
   */
  stopPublishing() {
    this.shouldFireEvents = false;
  }

  /** Sets the procedure model this parameter is a part of. */
  setProcedureModel(model: IProcedureModel): this {
    // TODO: Not sure if we want to do this, or accept it via the constructor.
    //   That means it could be non-null, but it would also break the fluent
    //   API.
    this.procedureModel = model;
    return this;
  }
}
