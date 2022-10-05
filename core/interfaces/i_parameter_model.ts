/**
 * @license
 * Copyright 2022 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * The interface for the data model of a procedure parameter.
 *
 * @namespace Blockly.IParameterModel
 */
import * as goog from '../../closure/goog/goog.js';
goog.declareModuleId('Blockly.IParameterModel');

import {VariableModel} from '../variable_model.js';

/**
 * A data model for a procedure.
 */
export interface IParameterModel {
  /**
   * Sets the variable associated with the parameter model.
   *
   * Parameters have an identity (represented by the ID) which is separate from
   * both their position in the parameter list, and the variable model they are
   * associated with. The variable they are associated with can change over time
   * as the human-readable parameter name is renamed.
   */
  setVariable(variable: VariableModel): IParameterModel;

  /**
   * Returns the unique language-neutral ID for the parameter.
   *
   * This represents the identify of the variable model which does not change
   * over time.
   */
  getId(): string;

  /** Returns the variable model associated with the parameter model. */
  getVariableModel(): VariableModel
}
