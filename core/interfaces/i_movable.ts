/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * The interface for an object that is movable.
 *
 * @namespace Blockly.IMovable
 */
import * as goog from '../../closure/goog/goog.js';
goog.declareModuleId('Blockly.IMovable');


/**
 * The interface for an object that is movable.
 */
export interface IMovable {
  /**
   * Get whether this is movable or not.
   *
   * @returns True if movable.
   */
  isMovable(): boolean;
}
