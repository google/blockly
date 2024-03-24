/**
 * @license
 * Copyright 2024 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import * as eventUtils from '../events/utils.js';
import type {Coordinate} from '../utils/coordinate.js';
import type {IDragTarget} from '../interfaces/i_drag_target.js';
import type {IDraggable} from '../interfaces/i_draggable.js';
import type {IDragStrategy} from '../interfaces/i_draggable.js';
import type {WorkspaceSvg} from '../workspace_svg.js';

export abstract class DragStrategy<T extends IDraggable>
  implements IDragStrategy
{
  /**
   * The location of the origin of the draggabele (e.g. top left
   * corner of the block being dragged) at the beginning of the drag
   * in workspace coordinates.
   */
  private startLoc: Coordinate | null = null;

  /** Which drag area the mouse pointer has is over, if any. */
  private dragTarget: IDragTarget | null = null;

  constructor(
    /** The item being dragged. */
    protected draggable: T,
    /** The workspace on which it is being dragged. */
    protected workspace: WorkspaceSvg,
  ) {}

  /**
   * Handles any drag startup (e.g moving elements to the front of the
   * workspace).
   *
   * Does only generic work that should apply to most
   * IDraggables; consider overriding dragStartInner instead of this
   * method to do work needed for particular types of draggable.
   *
   * @param e PointerEvent that started the drag; could be used to
   *     check modifier keys, etc.  May be missing when dragging is
   *     triggered programatically rather than by user.
   */
  startDrag(e?: PointerEvent): void {
    this.startLoc = this.draggable.getLocation();
    if (!eventUtils.getGroup()) eventUtils.setGroup(true);
    this.fireDragStartEvent();
    this.startDragInner(e);
    this.workspace.getLayerManager()?.moveToDragLayer(this.draggable);
  }

  /**
   * Handles moving elements to the new location, and updating any
   * visuals based on that (e.g connection previews for blocks).
   *
   * Does only generic work that should apply to most IDraggables;
   * consider overriding dragInner instead of this method to do
   * work needed for particular types of draggable.
   *
   * @param newLoc Workspace coordinate to which the draggable has
   *     been dragged.
   * @param eOrTarget PointerEvent that continued the drag (could be
   *     used to look up any IDragTarget the pointer is over, check
   *     modifier keys, etc.)  or the drag target the pointer is over,
   *     if any.
   */
  drag(newLoc: Coordinate, eOrTarget?: PointerEvent | IDragTarget): void {
    const _target = this.getDragTarget(eOrTarget);
  }

  /**
   * Handles any drag cleanup, including e.g. connecting or deleting
   * blocks.
   *
   * @param newLoc Workspace coordinate at which the drag finished.
   *     been dragged.
   * @param e PointerEvent that finished the drag; could be used to
   *     look up any IDragTarget the pointer is over, check modifier
   *     keys, etc.
   * @param target The drag target the pointer is over, if any.  Could
   *     be supplied as an alternative to providing a PointerEvent for
   *     programatic drags.
   */
  endDrag(newLoc: Coordinate, eOrTarget?: PointerEvent | IDragTarget): void {
    const _target = this.getDragTarget(eOrTarget);
  }

  /**
   * Does any type-specific drag startup (e.g. disconnecting
   * blocks).
   *
   * @param e PointerEvent that started the drag; could be used to
   *     check modifier keys, etc.  May be missing when dragging is
   *     triggered programatically rather than by user.
   */
  protected startDragInner(_e?: PointerEvent): void {}

  /** Fire a UI event at the start of a block drag. */
  protected fireDragStartEvent(): void {}

  /**
   * Find drag target or use provided one.
   * blocks.
   *
   * @param eOrTarget An IDragTarget, or a PointerEvent to use to look for one
   *     on the workspace.
   * @returns The drag target or null if there is none.
   */
  protected getDragTarget(
    eOrTarget?: PointerEvent | IDragTarget,
  ): IDragTarget | null {
    if (eOrTarget instanceof PointerEvent) {
      return this.workspace.getDragTarget(eOrTarget);
    } else if (eOrTarget) {
      return eOrTarget;
    } else {
      return null;
    }
  }
}
