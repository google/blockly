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

import {VariableModel} from '../variable_model.js';


/**
 * A data model for a procedure.
 */
export interface IParameterModel {
  /**
   * Sets the name of this parameter to the given name.
   */
  setName(name: string): IParameterModel;

  /**
   * Sets the type of this parameter to the given type.
   */
  setType(types: string): IParameterModel;

  /**
   * Returns the unique language-neutral ID for the parameter.
   *
   * This represents the identify of the variable model which does not change
   * over time.
   */
  getId(): string;
}
