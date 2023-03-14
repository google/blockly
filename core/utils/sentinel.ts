/**
 * @license
 * Copyright 2022 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * A type used to create flag values.
 *
 * @class
 */
import * as goog from '../../closure/goog/goog.js';
goog.declareModuleId('Blockly.utils.Sentinel');


/**
 * A type used to create flag values.
 */
export class Sentinel {
  /**
   * Provide a unique key so that type guarding properly excludes values like
   * string.
   */
  UNIQUE_KEY?: never;
}
