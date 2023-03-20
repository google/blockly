/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import * as goog from '../../closure/goog/goog.js';
goog.declareModuleId('Blockly.IContextMenu');


export interface IContextMenu {
  /**
   * Show the context menu for this object.
   *
   * @param e Mouse event.
   */
  showContextMenu(e: Event): void;
}
