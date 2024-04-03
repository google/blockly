/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

// Former goog.module ID: Blockly.IDeletable

/**
 * The interface for an object that can be deleted.
 */
export interface IDeletable {
  /**
   * Get whether this object is deletable or not.
   *
   * @returns True if deletable.
   */
  isDeletable(): boolean;
}
