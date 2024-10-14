/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

// Former goog.module ID: Blockly.IAutoHideable

import type {IComponent} from './i_component.js';

/**
 * Interface for a component that can be automatically hidden.
 */
export interface IAutoHideable extends IComponent {
  /**
   * Hides the component. Called in WorkspaceSvg.hideChaff.
   *
   * @param onlyClosePopups Whether only popups should be closed.
   *   Flyouts should not be closed if this is true.
   */
  autoHide(onlyClosePopups: boolean): void;
}
