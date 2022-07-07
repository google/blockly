/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview The interface for a block dragger.
 */

/**
 * The interface for a block dragger.
 * @namespace Blockly.IBlockDragger
 */


/* eslint-disable-next-line no-unused-vars */
// Unused import preserved for side-effects. Remove if unneeded.
import '../block_svg';
/* eslint-disable-next-line no-unused-vars */
// Unused import preserved for side-effects. Remove if unneeded.
import '../utils/coordinate';


/**
 * A block dragger interface.
 * @alias Blockly.IBlockDragger
 */
export interface IBlockDragger {
  /**
   * Start dragging a block.  This includes moving it to the drag surface.
   * @param currentDragDeltaXY How far the pointer has moved from the position
   *     at mouse down, in pixel units.
   * @param healStack Whether or not to heal the stack after disconnecting.
   */
  startDrag: AnyDuringMigration;

  /**
   * Execute a step of block dragging, based on the given event.  Update the
   * display accordingly.
   * @param e The most recent move event.
   * @param currentDragDeltaXY How far the pointer has moved from the position
   *     at the start of the drag, in pixel units.
   */
  drag: AnyDuringMigration;

  /**
   * Finish a block drag and put the block back on the workspace.
   * @param e The mouseup/touchend event.
   * @param currentDragDeltaXY How far the pointer has moved from the position
   *     at the start of the drag, in pixel units.
   */
  endDrag: AnyDuringMigration;

  /**
   * Get a list of the insertion markers that currently exist.  Drags have 0, 1,
   * or 2 insertion markers.
   * @return A possibly empty list of insertion marker blocks.
   */
  getInsertionMarkers: AnyDuringMigration;

  /** Sever all links from this object and do any necessary cleanup. */
  dispose: () => void;
}
