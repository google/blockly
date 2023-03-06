/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import type {VariableModel} from '../variable_model.js';


/** Interface for a data model that holds a variable model. */
export interface IVariableHolder {
  /** Returns the variable model held by this type. */
  getVariableModel(): VariableModel;
}

/**
 * Returns whether the given object is a variable holder or not.
 */
export function isVariableHolder(obj: Object): obj is IVariableHolder {
  return (obj as any).getVariableModel !== undefined;
}
