/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview The interface for an object that is movable.
 */


/**
 * The interface for an object that is movable.
 * @namespace Blockly.IMovable
 */


/**
 * The interface for an object that is movable.
 * @alias Blockly.IMovable
 */
export interface IMovable {
  /**
   * Get whether this is movable or not.
   * @return True if movable.
   */
  isMovable: AnyDuringMigration;
}
