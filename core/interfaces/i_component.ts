/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import * as goog from '../../closure/goog/goog.js';
goog.declareModuleId('Blockly.IComponent');


/**
 * The interface for a workspace component that can be registered with the
 * ComponentManager.
 */
export interface IComponent {
  /**
   * The unique ID for this component that is used to register with the
   * ComponentManager.
   */
  id: string;
}
