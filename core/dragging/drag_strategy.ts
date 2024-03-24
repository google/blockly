/**
 * @license
 * Copyright 2024 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import * as eventUtils from '../events/utils.js';
import type {ComponentManager} from '../component_manager.js';
import type {Coordinate} from '../utils/coordinate.js';
import type {IDeleteArea} from '../interfaces/i_delete_area.js';
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
    const target = this.getDragTarget(eOrTarget);
    this.move(newLoc);
    this.updateDragTargets(target);
    const wouldBeDeleted = this.wouldBeDeletedBy(target, this.couldConnect());
    this.dragInner(newLoc, target, wouldBeDeleted);
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
  endDrag(_newLoc: Coordinate, eOrTarget?: PointerEvent | IDragTarget): void {
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

  /**
   * Actually move the draggable.
   *
   * @param newLoc Workspace coordinate to which the draggable has
   *     been dragged.
   */
  protected abstract move(_newLoc: Coordinate): void;

  /**
   * Call callbacks on previous and/or current drag target.
   *
   * @param target Drag target the pointer is over, if any.
   */
  protected updateDragTargets(target: IDragTarget | null) {
    if (this.dragTarget !== target) {
      this.dragTarget?.onDragExit(this.draggable);
      target?.onDragEnter(this.draggable);
    }
    target?.onDragOver(this.draggable);
    this.dragTarget = target;
  }

  /**
   * @param newLoc Workspace coordinate to which the draggable has
   *     been dragged.
   * @returns True iff the draggable could could connect (e.g. block
   *     to other block) if the drag finished at the current location.
   *     This is passed to IDeleteArea's .wouldDelete() method.
   */
  protected couldConnect(_newLoc: Coordinate): boolean {
    return false;
  }

  /**
   * Returns true iff target would delete draggable if the latter was
   * dropped at this time.
   *
   * @param target Drag target the pointer is over, if any.
   * @param couldConnect Set to true if the draggable could could
   *     connect.  This is passed to IDeleteArea's .wouldDelete()
   *     method if appropriate.
   * @returns True iff target would delete draggable.
   */
  private wouldBeDeletedBy(target: IDragTarget, couldConnect = false): boolean {
    if (!target) return false;

    const componentManager = this.workspace_.getComponentManager();
    const isDeleteArea = componentManager.hasCapability(
      target.id,
      ComponentManager.Capability.DELETE_AREA,
    );
    if (!isDeleteArea) return false;

    return (target as IDeleteArea).wouldDelete(this.draggable, couldConnect);
  }

  /**
   * Does any type-specific drag work (e.g. connection previews).
   *
   * @param newLoc Workspace coordinate to which the draggable has
   *     been dragged.
   * @param target Drag target the pointer is over, if any.
   * @param wouldBeDeleted Set to true to indicate that draggable
   *     would be deleted if droppeda at the current location.
   */
  protected dragInner(
    _newLoc: Coordinate,
    _target: IDragTarget | null,
    _wouldBeDeleted: boolean,
  ): void {}
}
