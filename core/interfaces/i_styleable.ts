/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview The interface for an object that a style can be added to.
 */


/**
 * The interface for an object that a style can be added to.
 * @namespace Blockly.IStyleable
 */
import * as goog from '../../closure/goog/goog.js';
goog.declareModuleId('Blockly.IStyleable');


/**
 * Interface for an object that a style can be added to.
 * @alias Blockly.IStyleable
 */
export interface IStyleable {
  /**
   * Adds a style on the toolbox. Usually used to change the cursor.
   * @param style The name of the class to add.
   */
  addStyle: AnyDuringMigration;

  /**
   * Removes a style from the toolbox. Usually used to change the cursor.
   * @param style The name of the class to remove.
   */
  removeStyle: AnyDuringMigration;
}
