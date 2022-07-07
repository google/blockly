/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview The interface for a component that is automatically hidden
 * when WorkspaceSvg.hideChaff is called.
 */

/**
 * The interface for a component that is automatically hidden
 * when WorkspaceSvg.hideChaff is called.
 * @namespace Blockly.IAutoHideable
 */


/* eslint-disable-next-line no-unused-vars */
import {IComponent} from './i_component';


/**
 * Interface for a component that can be automatically hidden.
 * @alias Blockly.IAutoHideable
 */
export interface IAutoHideable extends IComponent {
  /**
   * Hides the component. Called in WorkspaceSvg.hideChaff.
   * @param onlyClosePopups Whether only popups should be closed.
   *   Flyouts should not be closed if this is true.
   */
  autoHide: AnyDuringMigration;
}
