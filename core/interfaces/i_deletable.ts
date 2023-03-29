/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import * as goog from '../../closure/goog/goog.js';
goog.declareModuleId('Blockly.IDeletable');


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
