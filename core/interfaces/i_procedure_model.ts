/**
 * @license
 * Copyright 2022 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * The interface for the data model of a procedure.
 *
 * @namespace Blockly.IProcedureModel
 */

import {IParameterModel} from './i_parameter_model.js';


/**
 * A data model for a procedure.
 */
export interface IProcedureModel {
  /** Sets the human-readable name of the procedure. */
  setName(name: string): IProcedureModel;

  /**
   * Inserts a parameter into the list of parameters.
   *
   * To move a parameter, first delete it, and then re-insert.
   */
  insertParameter(parameterModel: IParameterModel, index: number):
      IParameterModel;

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
