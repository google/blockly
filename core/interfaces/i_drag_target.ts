/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview The interface for a component that has a handler for when a
 * block is dropped on top of it.
 */

/**
 * The interface for a component that has a handler for when a
 * block is dropped on top of it.
 * @namespace Blockly.IDragTarget
 */


/* eslint-disable-next-line no-unused-vars */
/* eslint-disable-next-line no-unused-vars */
// Unused import preserved for side-effects. Remove if unneeded.
import './i_draggable';
/* eslint-disable-next-line no-unused-vars */
// Unused import preserved for side-effects. Remove if unneeded.
import '../utils/rect';

import {IComponent} from './i_component';


/**
 * Interface for a component with custom behaviour when a block or bubble is
 * dragged over or dropped on top of it.
 * @alias Blockly.IDragTarget
 */
export interface IDragTarget extends IComponent {
  /**
   * Returns the bounding rectangle of the drag target area in pixel units
   * relative to viewport.
   * @return The component's bounding box. Null if drag target area should be
   *     ignored.
   */
  getClientRect: AnyDuringMigration;

  /**
   * Handles when a cursor with a block or bubble enters this drag target.
   * @param dragElement The block or bubble currently being dragged.
   */
  onDragEnter: AnyDuringMigration;

  /**
   * Handles when a cursor with a block or bubble is dragged over this drag
   * target.
   * @param dragElement The block or bubble currently being dragged.
   */
  onDragOver: AnyDuringMigration;

  /**
   * Handles when a cursor with a block or bubble exits this drag target.
   * @param dragElement The block or bubble currently being dragged.
   */
  onDragExit: AnyDuringMigration;

  /**
   * Handles when a block or bubble is dropped on this component.
   * Should not handle delete here.
   * @param dragElement The block or bubble currently being dragged.
   */
  onDrop: AnyDuringMigration;

  /**
   * Returns whether the provided block or bubble should not be moved after
   * being dropped on this component. If true, the element will return to where
   * it was when the drag started.
   * @param dragElement The block or bubble currently being dragged.
   * @return Whether the block or bubble provided should be returned to drag
   *     start.
   */
  shouldPreventMove: AnyDuringMigration;
}
