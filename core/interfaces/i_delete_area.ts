/**
 * @fileoverview The interface for a component that can delete a block or bubble
 * that is dropped on top of it.
 */

/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */



/**
 * The interface for a component that can delete a block or bubble
 * that is dropped on top of it.
 * @namespace Blockly.IDeleteArea
 */

/* eslint-disable-next-line no-unused-vars */
/* eslint-disable-next-line no-unused-vars */
// Unused import preserved for side-effects. Remove if unneeded.
import './i_draggable';

import { IDragTarget } from './i_drag_target';


/**
 * Interface for a component that can delete a block or bubble that is dropped
 * on top of it.
 * @alias Blockly.IDeleteArea
 */
export interface IDeleteArea extends IDragTarget {
  /**
   * Returns whether the provided block or bubble would be deleted if dropped on
   * this area.
   * This method should check if the element is deletable and is always called
   * before onDragEnter/onDragOver/onDragExit.
   * @param element The block or bubble currently being dragged.
   * @param couldConnect Whether the element could could connect to another.
   * @return Whether the element provided would be deleted if dropped on this
   *     area.
   */
  wouldDelete: AnyDuringMigration;
}
