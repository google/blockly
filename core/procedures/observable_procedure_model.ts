/**
 * @license
 * Copyright 2022 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */


import * as goog from '../../closure/goog/goog.js';
goog.declareModuleId('Blockly.procedures.ObservableProcedureModel');

import {IProcedureModel} from '../interfaces/i_procedure_model.js';
import {Workspace} from '../workspace.js';
import {genUid} from '../utils/idgenerator.js';
import {IParameterModel} from '../interfaces/i_parameter_model.js';


export class ObservableProcedureModel implements IProcedureModel {
  private id = '';
  private name = '';
  private parameters: IParameterModel[];

  constructor(private readonly workspace: Workspace, id?: string) {
    this.id = id ?? genUid();
  }

  /** Sets the human-readable name of the procedure. */
  setName(name: string): IProcedureModel {
    this.name = name;
    return this;
  }

  /**
   * Inserts a parameter into the list of parameters.
   *
   * To move a parameter, first delete it, and then re-insert.
   */
  insertParameter(parameterModel: IParameterModel): IParameterModel {
    this.parameters.
  }

  /** Removes the parameter at the given index from the parameter list. */
  deleteParameter(index: number): IProcedureModel;

  /**
   * Sets the return type(s) of the procedure.
   *
   * Pass null to represent a procedure that does not return.
   */
  setReturnType(types: string[]|null): IProcedureModel;

  /**
   * Sets whether this procedure is enabled/disabled. If a procedure is disabled
   * all procedure caller blocks should be disabled as well.
   */
  setEnabled(enabled: boolean): IProcedureModel;

  /** Returns the unique language-neutral ID for the procedure. */
  getId(): string;

  /** Returns the human-readable name of the procedure. */
  getName(): string;

  /** Returns the parameter at the given index in the parameter list. */
  getParameter(index: number): IParameterModel;

  /** Returns an array of all of the parameters in the parameter list. */
  getParameters(): IParameterModel[];

  /**
   * Returns the return type of the procedure.
   *
   * Null represents a procedure that does not return a value.
   */
  getReturnType(): string[]|null;

  /**
   * Returns whether the procedure is enabled/disabled. If a procedure is
   * disabled, all procedure caller blocks should be disabled as well.
   */
  getEnabled(): boolean;
}
