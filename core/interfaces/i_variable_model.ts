/**
 * @license
 * Copyright 2024 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/* Representation of a variable. */
export interface IVariableModel {
  /* Returns the unique ID of this variable. */
  getId(): string;

  /* Returns the user-visible name of this variable. */
  getName(): string;

  /**
   * Returns the type of the variable like 'int' or 'string'.  Does not need to be
   * unique. This will default to '' which is a specific type.
   */
  getType(): string;

  /* Sets the user-visible name of this variable. */
  setName(name: string): this;

  /* Sets the type of this variable. */
  setType(type: string): this;
}
