/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Methods for dragging a block visually.
 *
 * @class
 */
// Former goog.module ID: Blockly.BlockDragger

// Unused import preserved for side-effects. Remove if unneeded.
import './events/events_block_drag.js';

import * as blockAnimation from './block_animations.js';
import type {BlockSvg} from './block_svg.js';
import * as bumpObjects from './bump_objects.js';
import * as common from './common.js';
import type {BlockMove} from './events/events_block_move.js';
import * as eventUtils from './events/utils.js';
import type {Icon} from './icons/icon.js';
import {InsertionMarkerManager} from './insertion_marker_manager.js';
import type {IBlockDragger} from './interfaces/i_block_dragger.js';
import type {IDragTarget} from './interfaces/i_drag_target.js';
import * as registry from './registry.js';
import {Coordinate} from './utils/coordinate.js';
import * as dom from './utils/dom.js';
import type {WorkspaceSvg} from './workspace_svg.js';
import {hasBubble} from './interfaces/i_has_bubble.js';

/**
 * Class for a block dragger.  It moves blocks around the workspace when they
 * are being dragged by a mouse or touch.
 */
export class BlockDragger implements IBlockDragger {
  /** The top block in the stack that is being dragged. */
  protected draggingBlock_: BlockSvg;
  protected draggedConnectionManager_: InsertionMarkerManager;

  /** The workspace on which the block is being dragged. */
  protected workspace_: WorkspaceSvg;

  /** Which drag area the mouse pointer is over, if any. */
  private dragTarget_: IDragTarget | null = null;

  /** Whether the block would be deleted if dropped immediately. */
  protected wouldDeleteBlock_ = false;
  protected startXY_: Coordinate;
  protected dragIconData_: IconPositionData[];

  /**
   * @param block The block to drag.
   * @param workspace The workspace to drag on.
   */
  constructor(block: BlockSvg, workspace: WorkspaceSvg) {
    this.draggingBlock_ = block;

    /** Object that keeps track of connections on dragged blocks. */
    this.draggedConnectionManager_ = new InsertionMarkerManager(
      this.draggingBlock_,
    );

    this.workspace_ = workspace;

    /**
     * The location of the top left corner of the dragging block at the
     * beginning of the drag in workspace coordinates.
     */
    this.startXY_ = this.draggingBlock_.getRelativeToSurfaceXY();

    /**
     * A list of all of the icons (comment, warning, and mutator) that are
     * on this block and its descendants.  Moving an icon moves the bubble that
     * extends from it if that bubble is open.
     */
    this.dragIconData_ = initIconData(block, this.startXY_);
  }

  /**
   * Sever all links from this object.
   *
   * @internal
   */
  dispose() {
    this.dragIconData_.length = 0;

    if (this.draggedConnectionManager_) {
      this.draggedConnectionManager_.dispose();
    }
  }

  /**
   * Start dragging a block.
   *
   * @param currentDragDeltaXY How far the pointer has moved from the position
   *     at mouse down, in pixel units.
   * @param healStack Whether or not to heal the stack after disconnecting.
   */
  startDrag(currentDragDeltaXY: Coordinate, healStack: boolean) {
    if (!eventUtils.getGroup()) {
      eventUtils.setGroup(true);
    }
    this.fireDragStartEvent_();

    // The z-order of blocks depends on their order in the SVG, so move the
    // block being dragged to the front so that it will appear atop other blocks
    // in the workspace.
    this.draggingBlock_.bringToFront(true);

    // During a drag there may be a lot of rerenders, but not field changes.
    // Turn the cache on so we don't do spurious remeasures during the drag.
    dom.startTextWidthCache();
    this.workspace_.setResizesEnabled(false);
    blockAnimation.disconnectUiStop();

    if (this.shouldDisconnect_(healStack)) {
      this.disconnectBlock_(healStack, currentDragDeltaXY);
    }
    this.draggingBlock_.setDragging(true);
  }

  /**
   * Whether or not we should disconnect the block when a drag is started.
   *
   * @param healStack Whether or not to heal the stack after disconnecting.
   * @returns True to disconnect the block, false otherwise.
   */
  protected shouldDisconnect_(healStack: boolean): boolean {
    return !!(
      this.draggingBlock_.getParent() ||
      (healStack &&
        this.draggingBlock_.nextConnection &&
        this.draggingBlock_.nextConnection.targetBlock())
    );
  }

  /**
   * Disconnects the block and moves it to a new location.
   *
   * @param healStack Whether or not to heal the stack after disconnecting.
   * @param currentDragDeltaXY How far the pointer has moved from the position
   *     at mouse down, in pixel units.
   */
  protected disconnectBlock_(
    healStack: boolean,
    currentDragDeltaXY: Coordinate,
  ) {
    this.draggingBlock_.unplug(healStack);
    const delta = this.pixelsToWorkspaceUnits_(currentDragDeltaXY);
    const newLoc = Coordinate.sum(this.startXY_, delta);

    this.draggingBlock_.translate(newLoc.x, newLoc.y);
    blockAnimation.disconnectUiEffect(this.draggingBlock_);
    this.draggedConnectionManager_.updateAvailableConnections();
  }

  /** Fire a UI event at the start of a block drag. */
  protected fireDragStartEvent_() {
    const event = new (eventUtils.get(eventUtils.BLOCK_DRAG))(
      this.draggingBlock_,
      true,
      this.draggingBlock_.getDescendants(false),
    );
    eventUtils.fire(event);
  }

  /**
   * Execute a step of block dragging, based on the given event.  Update the
   * display accordingly.
   *
   * @param e The most recent move event.
   * @param currentDragDeltaXY How far the pointer has moved from the position
   *     at the start of the drag, in pixel units.
   */
  drag(e: PointerEvent, currentDragDeltaXY: Coordinate) {
    const delta = this.pixelsToWorkspaceUnits_(currentDragDeltaXY);
    const newLoc = Coordinate.sum(this.startXY_, delta);
    this.draggingBlock_.moveDuringDrag(newLoc);
    this.dragIcons_(delta);

    const oldDragTarget = this.dragTarget_;
    this.dragTarget_ = this.workspace_.getDragTarget(e);

    this.draggedConnectionManager_.update(delta, this.dragTarget_);
    const oldWouldDeleteBlock = this.wouldDeleteBlock_;
    this.wouldDeleteBlock_ = this.draggedConnectionManager_.wouldDeleteBlock;
    if (oldWouldDeleteBlock !== this.wouldDeleteBlock_) {
      // Prevent unnecessary add/remove class calls.
      this.updateCursorDuringBlockDrag_();
    }

    // Call drag enter/exit/over after wouldDeleteBlock is called in
    // InsertionMarkerManager.update.
    if (this.dragTarget_ !== oldDragTarget) {
      oldDragTarget && oldDragTarget.onDragExit(this.draggingBlock_);
      this.dragTarget_ && this.dragTarget_.onDragEnter(this.draggingBlock_);
    }
    this.dragTarget_ && this.dragTarget_.onDragOver(this.draggingBlock_);
  }

  /**
   * Finish a block drag and put the block back on the workspace.
   *
   * @param e The pointerup event.
   * @param currentDragDeltaXY How far the pointer has moved from the position
   *     at the start of the drag, in pixel units.
   */
  endDrag(e: PointerEvent, currentDragDeltaXY: Coordinate) {
    // Make sure internal state is fresh.
    this.drag(e, currentDragDeltaXY);
    this.dragIconData_ = [];
    this.fireDragEndEvent_();

    dom.stopTextWidthCache();

    blockAnimation.disconnectUiStop();

    const preventMove =
      !!this.dragTarget_ &&
      this.dragTarget_.shouldPreventMove(this.draggingBlock_);
    let delta: Coordinate | null = null;
    if (!preventMove) {
      const newValues = this.getNewLocationAfterDrag_(currentDragDeltaXY);
      delta = newValues.delta;
    }

    if (this.dragTarget_) {
      this.dragTarget_.onDrop(this.draggingBlock_);
    }

    const deleted = this.maybeDeleteBlock_();
    if (!deleted) {
      // These are expensive and don't need to be done if we're deleting.
      this.draggingBlock_.setDragging(false);
      if (delta) {
        // !preventMove
        this.updateBlockAfterMove_();
      } else {
        // Blocks dragged directly from a flyout may need to be bumped into
        // bounds.
        bumpObjects.bumpIntoBounds(
          this.draggingBlock_.workspace,
          this.workspace_.getMetricsManager().getScrollMetrics(true),
          this.draggingBlock_,
        );
      }
    }
    this.workspace_.setResizesEnabled(true);

    eventUtils.setGroup(false);
  }

  /**
   * Calculates the drag delta and new location values after a block is dragged.
   *
   * @param currentDragDeltaXY How far the pointer has moved from the start of
   *     the drag, in pixel units.
   * @returns New location after drag. delta is in workspace units. newLocation
   *     is the new coordinate where the block should end up.
   */
  protected getNewLocationAfterDrag_(currentDragDeltaXY: Coordinate): {
    delta: Coordinate;
    newLocation: Coordinate;
  } {
    const delta = this.pixelsToWorkspaceUnits_(currentDragDeltaXY);
    const newLocation = Coordinate.sum(this.startXY_, delta);
    return {
      delta,
      newLocation,
    };
  }

  /**
   * May delete the dragging block, if allowed. If `this.wouldDeleteBlock_` is
   * not true, the block will not be deleted. This should be called at the end
   * of a block drag.
   *
   * @returns True if the block was deleted.
   */
  protected maybeDeleteBlock_(): boolean {
    if (this.wouldDeleteBlock_) {
      // Fire a move event, so we know where to go back to for an undo.
      this.fireMoveEvent_();
      this.draggingBlock_.dispose(false, true);
      common.draggingConnections.length = 0;
      return true;
    }
    return false;
  }

  /**
   * Updates the necessary information to place a block at a certain location.
   */
  protected updateBlockAfterMove_() {
    this.fireMoveEvent_();
    if (this.draggedConnectionManager_.wouldConnectBlock()) {
      // Applying connections also rerenders the relevant blocks.
      this.draggedConnectionManager_.applyConnections();
    } else {
      this.draggingBlock_.queueRender();
    }
    this.draggingBlock_.scheduleSnapAndBump();
  }

  /** Fire a UI event at the end of a block drag. */
  protected fireDragEndEvent_() {
    const event = new (eventUtils.get(eventUtils.BLOCK_DRAG))(
      this.draggingBlock_,
      false,
      this.draggingBlock_.getDescendants(false),
    );
    eventUtils.fire(event);
  }

  /**
   * Adds or removes the style of the cursor for the toolbox.
   * This is what changes the cursor to display an x when a deletable block is
   * held over the toolbox.
   *
   * @param isEnd True if we are at the end of a drag, false otherwise.
   */
  protected updateToolboxStyle_(isEnd: boolean) {
    const toolbox = this.workspace_.getToolbox();

    if (toolbox) {
      const style = this.draggingBlock_.isDeletable()
        ? 'blocklyToolboxDelete'
        : 'blocklyToolboxGrab';

      // AnyDuringMigration because:  Property 'removeStyle' does not exist on
      // type 'IToolbox'.
      if (
        isEnd &&
        typeof (toolbox as AnyDuringMigration).removeStyle === 'function'
      ) {
        // AnyDuringMigration because:  Property 'removeStyle' does not exist on
        // type 'IToolbox'.
        (toolbox as AnyDuringMigration).removeStyle(style);
        // AnyDuringMigration because:  Property 'addStyle' does not exist on
        // type 'IToolbox'.
      } else if (
        !isEnd &&
        typeof (toolbox as AnyDuringMigration).addStyle === 'function'
      ) {
        // AnyDuringMigration because:  Property 'addStyle' does not exist on
        // type 'IToolbox'.
        (toolbox as AnyDuringMigration).addStyle(style);
      }
    }
  }

  /** Fire a move event at the end of a block drag. */
  protected fireMoveEvent_() {
    if (this.draggingBlock_.isDeadOrDying()) return;
    const event = new (eventUtils.get(eventUtils.BLOCK_MOVE))(
      this.draggingBlock_,
    ) as BlockMove;
    event.setReason(['drag']);
    event.oldCoordinate = this.startXY_;
    event.recordNew();
    eventUtils.fire(event);
  }

  /**
   * Update the cursor (and possibly the trash can lid) to reflect whether the
   * dragging block would be deleted if released immediately.
   */
  protected updateCursorDuringBlockDrag_() {
    this.draggingBlock_.setDeleteStyle(this.wouldDeleteBlock_);
  }

  /**
   * Convert a coordinate object from pixels to workspace units, including a
   * correction for mutator workspaces.
   * This function does not consider differing origins.  It simply scales the
   * input's x and y values.
   *
   * @param pixelCoord A coordinate with x and y values in CSS pixel units.
   * @returns The input coordinate divided by the workspace scale.
   */
  protected pixelsToWorkspaceUnits_(pixelCoord: Coordinate): Coordinate {
    const result = new Coordinate(
      pixelCoord.x / this.workspace_.scale,
      pixelCoord.y / this.workspace_.scale,
    );
    if (this.workspace_.isMutator) {
      // If we're in a mutator, its scale is always 1, purely because of some
      // oddities in our rendering optimizations.  The actual scale is the same
      // as the scale on the parent workspace. Fix that for dragging.
      const mainScale = this.workspace_.options.parentWorkspace!.scale;
      result.scale(1 / mainScale);
    }
    return result;
  }

  /**
   * Move all of the icons connected to this drag.
   *
   * @param dxy How far to move the icons from their original positions, in
   *     workspace units.
   */
  protected dragIcons_(dxy: Coordinate) {
    // Moving icons moves their associated bubbles.
    for (const data of this.dragIconData_) {
      data.icon.onLocationChange(Coordinate.sum(data.location, dxy));
    }
  }

  /**
   * Get a list of the insertion markers that currently exist.  Drags have 0, 1,
   * or 2 insertion markers.
   *
   * @returns A possibly empty list of insertion marker blocks.
   */
  getInsertionMarkers(): BlockSvg[] {
    // No insertion markers with the old style of dragged connection managers.
    if (
      this.draggedConnectionManager_ &&
      this.draggedConnectionManager_.getInsertionMarkers
    ) {
      return this.draggedConnectionManager_.getInsertionMarkers();
    }
    return [];
  }
}

/** Data about the position of a given icon. */
export interface IconPositionData {
  location: Coordinate;
  icon: Icon;
}

/**
 * Make a list of all of the icons (comment, warning, and mutator) that are
 * on this block and its descendants.  Moving an icon moves the bubble that
 * extends from it if that bubble is open.
 *
 * @param block The root block that is being dragged.
 * @param blockOrigin The top left of the given block in workspace coordinates.
 * @returns The list of all icons and their locations.
 */
function initIconData(
  block: BlockSvg,
  blockOrigin: Coordinate,
): IconPositionData[] {
  // Build a list of icons that need to be moved and where they started.
  const dragIconData = [];

  for (const icon of block.getIcons()) {
    // Only bother to track icons whose bubble is visible.
    if (hasBubble(icon) && !icon.bubbleIsVisible()) continue;

    dragIconData.push({location: blockOrigin, icon: icon});
    icon.onLocationChange(blockOrigin);
  }

  for (const child of block.getChildren(false)) {
    dragIconData.push(
      ...initIconData(child, Coordinate.sum(blockOrigin, child.relativeCoords)),
    );
  }
  // AnyDuringMigration because:  Type '{ location: Coordinate | null; icon:
  // Icon; }[]' is not assignable to type 'IconPositionData[]'.
  return dragIconData as AnyDuringMigration;
}

registry.register(registry.Type.BLOCK_DRAGGER, registry.DEFAULT, BlockDragger);
