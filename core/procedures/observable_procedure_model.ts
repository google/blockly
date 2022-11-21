/**
 * @license
 * Copyright 2022 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import * as eventUtils from '../events/utils.js';
import {genUid} from '../utils/idgenerator.js';
import type {IParameterModel} from '../interfaces/i_parameter_model.js';
import type {IProcedureModel} from '../interfaces/i_procedure_model.js';
import {isObservable} from '../interfaces/i_observable.js';
import {triggerProceduresUpdate} from './update_procedures.js';
import type {Workspace} from '../workspace.js';
import * as goog from '../../closure/goog/goog.js';
goog.declareModuleId('Blockly.procedures.ObservableProcedureModel');


export class ObservableProcedureModel implements IProcedureModel {
  private id: string;
  private name: string;
  private parameters: IParameterModel[] = [];
  private returnTypes: string[]|null = null;
  private enabled = true;
  private shouldFireEvents = false;

  constructor(
      private readonly workspace: Workspace, name: string, id?: string) {
    this.id = id ?? genUid();
    this.name = name;
  }

  /** Sets the human-readable name of the procedure. */
  setName(name: string): this {
    if (name === this.name) return this;
    const prevName = this.name;
    this.name = name;
    triggerProceduresUpdate(this.workspace);
    if (this.shouldFireEvents) {
      eventUtils.fire(new (eventUtils.get(eventUtils.PROCEDURE_RENAME))(
          this.workspace, this, prevName));
    }
    return this;
  }

  /**
   * Inserts a parameter into the list of parameters.
   *
   * To move a parameter, first delete it, and then re-insert.
   */
  insertParameter(parameterModel: IParameterModel, index: number): this {
    if (this.parameters[index] &&
        this.parameters[index].getId() === parameterModel.getId()) {
      return this;
    }

    this.parameters.splice(index, 0, parameterModel);
    parameterModel.setProcedureModel(this);
    if (isObservable(parameterModel)) {
      if (this.shouldFireEvents) {
        parameterModel.startPublishing();
      } else {
        parameterModel.stopPublishing();
      }
    }

    triggerProceduresUpdate(this.workspace);
    if (this.shouldFireEvents) {
      eventUtils.fire(
          new (eventUtils.get(eventUtils.PROCEDURE_PARAMETER_CREATE))(
              this.workspace, this, parameterModel, index));
    }
    return this;
  }

  /** Removes the parameter at the given index from the parameter list. */
  deleteParameter(index: number): this {
    if (!this.parameters[index]) return this;
    const oldParam = this.parameters[index];

    this.parameters.splice(index, 1);
    triggerProceduresUpdate(this.workspace);
    if (isObservable(oldParam)) {
      oldParam.stopPublishing();
    }

    if (this.shouldFireEvents) {
      eventUtils.fire(
          new (eventUtils.get(eventUtils.PROCEDURE_PARAMETER_DELETE))(
              this.workspace, this, oldParam, index));
    }
    return this;
  }

  /**
   * Sets whether the procedure has a return value (empty array) or no return
   * value (null).
   *
   * The built-in procedure model does not support procedures that have actual
   * return types (i.e. non-empty arrays, e.g. ['number']). If you want your
   * procedure block to have return types, you need to implement your own
   * procedure model.
   */
  setReturnTypes(types: string[]|null): this {
    if (types && types.length) {
      throw new Error(
          'The built-in ProcedureModel does not support typing. You need to ' +
          'implement your own custom ProcedureModel.');
    }
    // Either they're both an empty array, or both null. Noop either way.
    if (!!types === !!this.returnTypes) return this;
    const oldReturnTypes = this.returnTypes;
    this.returnTypes = types;
    triggerProceduresUpdate(this.workspace);
    if (this.shouldFireEvents) {
      eventUtils.fire(new (eventUtils.get(eventUtils.PROCEDURE_CHANGE_RETURN))(
          this.workspace, this, oldReturnTypes));
    }
    return this;
  }

  /**
   * Sets whether this procedure is enabled/disabled. If a procedure is disabled
   * all procedure caller blocks should be disabled as well.
   */
  setEnabled(enabled: boolean): this {
    if (enabled === this.enabled) return this;
    this.enabled = enabled;
    triggerProceduresUpdate(this.workspace);
    if (this.shouldFireEvents) {
      eventUtils.fire(new (eventUtils.get(eventUtils.PROCEDURE_ENABLE))(
          this.workspace, this));
    }
    return this;
  }

  /** Returns the unique language-neutral ID for the procedure. */
  getId(): string {
    return this.id;
  }

  /** Returns the human-readable name of the procedure. */
  getName(): string {
    return this.name;
  }

  /** Returns the parameter at the given index in the parameter list. */
  getParameter(index: number): IParameterModel {
    return this.parameters[index];
  }

  /** Returns an array of all of the parameters in the parameter list. */
  getParameters(): IParameterModel[] {
    return [...this.parameters];
  }

  /**
   * Returns the return type of the procedure.
   *
   * Null represents a procedure that does not return a value.
   */
  getReturnTypes(): string[]|null {
    return this.returnTypes;
  }

  /**
   * Returns whether the procedure is enabled/disabled. If a procedure is
   * disabled, all procedure caller blocks should be disabled as well.
   */
  getEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Tells the procedure model it should fire events.
   *
   * @internal
   */
  startPublishing() {
    this.shouldFireEvents = true;
    for (const param of this.parameters) {
      if (isObservable(param)) param.startPublishing();
    }
  }

  /**
   * Tells the procedure model it should not fire events.
   *
   * @internal
   */
  stopPublishing() {
    this.shouldFireEvents = false;
    for (const param of this.parameters) {
      if (isObservable(param)) param.stopPublishing();
    }
  }
}
