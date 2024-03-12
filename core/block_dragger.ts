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
import type {IBlockDragger} from './interfaces/i_block_dragger.js';
import type {IDragTarget} from './interfaces/i_drag_target.js';
import * as registry from './registry.js';
import {Coordinate} from './utils/coordinate.js';
import * as dom from './utils/dom.js';
import type {WorkspaceSvg} from './workspace_svg.js';
import * as layers from './layers.js';
import {ConnectionType, IConnectionPreviewer} from './blockly.js';
import {RenderedConnection} from './rendered_connection.js';
import {config} from './config.js';
import {ComponentManager} from './component_manager.js';
import {IDeleteArea} from './interfaces/i_delete_area.js';
import {Connection} from './connection.js';
import {Block} from './block.js';
import {finishQueuedRenders} from './render_management.js';

/** Represents a nearby valid connection. */
interface ConnectionCandidate {
  /** A connection on the dragging stack that is compatible with neighbour. */
  local: RenderedConnection;

  /** A nearby connection that is compatible with local. */
  neighbour: RenderedConnection;

  /** The distance between the local connection and the neighbour connection. */
  distance: number;
}

/**
 * Class for a block dragger.  It moves blocks around the workspace when they
 * are being dragged by a mouse or touch.
 */
export class BlockDragger implements IBlockDragger {
  /** The top block in the stack that is being dragged. */
  protected draggingBlock_: BlockSvg;

  protected connectionPreviewer: IConnectionPreviewer;

  /** The workspace on which the block is being dragged. */
  protected workspace_: WorkspaceSvg;

  /** Which drag area the mouse pointer is over, if any. */
  private dragTarget_: IDragTarget | null = null;

  private connectionCandidate: ConnectionCandidate | null = null;

  /** Whether the block would be deleted if dropped immediately. */
  protected wouldDeleteBlock_ = false;

  protected startXY_: Coordinate;

  /** The parent block at the start of the drag. */
  private startParentConn: RenderedConnection | null = null;

  /**
   * The child block at the start of the drag. Only gets set if
   * `healStack` is true.
   */
  private startChildConn: RenderedConnection | null = null;

  /**
   * @param block The block to drag.
   * @param workspace The workspace to drag on.
   */
  constructor(block: BlockSvg, workspace: WorkspaceSvg) {
    this.draggingBlock_ = block;
    this.workspace_ = workspace;

    const previewerConstructor = registry.getClassFromOptions(
      registry.Type.CONNECTION_PREVIEWER,
      this.workspace_.options,
    );
    this.connectionPreviewer = new previewerConstructor!(block);

    /**
     * The location of the top left corner of the dragging block at the
     * beginning of the drag in workspace coordinates.
     */
    this.startXY_ = this.draggingBlock_.getRelativeToSurfaceXY();
  }

  /**
   * Sever all links from this object.
   *
   * @internal
   */
  dispose() {
    this.connectionPreviewer.dispose();
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
      this.startParentConn =
        this.draggingBlock_.outputConnection?.targetConnection ??
        this.draggingBlock_.previousConnection?.targetConnection;
      if (healStack) {
        this.startChildConn =
          this.draggingBlock_.nextConnection?.targetConnection;
      }
      this.disconnectBlock_(healStack, currentDragDeltaXY);
    }
    this.draggingBlock_.setDragging(true);
    this.workspace_.getLayerManager()?.moveToDragLayer(this.draggingBlock_);
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
   * @param delta How far the pointer has moved from the position
   *     at the start of the drag, in pixel units.
   */
  drag(e: PointerEvent, delta: Coordinate) {
    const block = this.draggingBlock_;
    this.moveBlock(block, delta);
    this.updateDragTargets(e, block);
    this.wouldDeleteBlock_ = this.wouldDeleteBlock(e, block, delta);
    this.updateCursorDuringBlockDrag_();
    this.updateConnectionPreview(block, delta);
  }

  /**
   * @param draggingBlock The block being dragged.
   * @param dragDelta How far the pointer has moved from the position
   *     at the start of the drag, in pixel units.
   */
  private moveBlock(draggingBlock: BlockSvg, dragDelta: Coordinate) {
    const delta = this.pixelsToWorkspaceUnits_(dragDelta);
    const newLoc = Coordinate.sum(this.startXY_, delta);
    draggingBlock.moveDuringDrag(newLoc);
  }

  private updateDragTargets(e: PointerEvent, draggingBlock: BlockSvg) {
    const newDragTarget = this.workspace_.getDragTarget(e);
    if (this.dragTarget_ !== newDragTarget) {
      this.dragTarget_?.onDragExit(draggingBlock);
      newDragTarget?.onDragEnter(draggingBlock);
    }
    newDragTarget?.onDragOver(draggingBlock);
    this.dragTarget_ = newDragTarget;
  }

  /**
   * Returns true if we would delete the block if it was dropped at this time,
   * false otherwise.
   *
   * @param e The most recent move event.
   * @param draggingBlock The block being dragged.
   * @param delta How far the pointer has moved from the position
   *     at the start of the drag, in pixel units.
   */
  private wouldDeleteBlock(
    e: PointerEvent,
    draggingBlock: BlockSvg,
    delta: Coordinate,
  ): boolean {
    const dragTarget = this.workspace_.getDragTarget(e);
    if (!dragTarget) return false;

    const componentManager = this.workspace_.getComponentManager();
    const isDeleteArea = componentManager.hasCapability(
      dragTarget.id,
      ComponentManager.Capability.DELETE_AREA,
    );
    if (!isDeleteArea) return false;

    return (dragTarget as IDeleteArea).wouldDelete(
      draggingBlock,
      !!this.getConnectionCandidate(draggingBlock, delta),
    );
  }

  /**
   * @param draggingBlock The block being dragged.
   * @param dragDelta How far the pointer has moved from the position
   *     at the start of the drag, in pixel units.
   */
  private updateConnectionPreview(
    draggingBlock: BlockSvg,
    dragDelta: Coordinate,
  ) {
    const delta = this.pixelsToWorkspaceUnits_(dragDelta);
    const currCandidate = this.connectionCandidate;
    const newCandidate = this.getConnectionCandidate(draggingBlock, delta);
    if (!newCandidate) {
      this.connectionPreviewer.hidePreview();
      this.connectionCandidate = null;
      return;
    }
    const candidate =
      currCandidate &&
      this.currCandidateIsBetter(currCandidate, delta, newCandidate)
        ? currCandidate
        : newCandidate;
    this.connectionCandidate = candidate;
    const {local, neighbour} = candidate;
    if (
      (local.type === ConnectionType.OUTPUT_VALUE ||
        local.type === ConnectionType.PREVIOUS_STATEMENT) &&
      neighbour.isConnected() &&
      !neighbour.targetBlock()!.isInsertionMarker() &&
      !this.orphanCanConnectAtEnd(
        draggingBlock,
        neighbour.targetBlock()!,
        local.type,
      )
    ) {
      this.connectionPreviewer.previewReplacement(
        local,
        neighbour,
        neighbour.targetBlock()!,
      );
      return;
    }
    this.connectionPreviewer.previewConnection(local, neighbour);
  }

  /**
   * Returns true if the given orphan block can connect at the end of the
   * top block's stack or row, false otherwise.
   */
  private orphanCanConnectAtEnd(
    topBlock: BlockSvg,
    orphanBlock: BlockSvg,
    localType: number,
  ): boolean {
    const orphanConnection =
      localType === ConnectionType.OUTPUT_VALUE
        ? orphanBlock.outputConnection
        : orphanBlock.previousConnection;
    return !!Connection.getConnectionForOrphanedConnection(
      topBlock as Block,
      orphanConnection as Connection,
    );
  }

  /**
   * Returns true if the current candidate is better than the new candidate.
   *
   * We slightly prefer the current candidate even if it is farther away.
   */
  private currCandidateIsBetter(
    currCandiate: ConnectionCandidate,
    delta: Coordinate,
    newCandidate: ConnectionCandidate,
  ): boolean {
    const {local: currLocal, neighbour: currNeighbour} = currCandiate;
    const localPos = new Coordinate(currLocal.x, currLocal.y);
    const neighbourPos = new Coordinate(currNeighbour.x, currNeighbour.y);
    const distance = Coordinate.distance(
      Coordinate.sum(localPos, delta),
      neighbourPos,
    );
    return (
      newCandidate.distance > distance - config.currentConnectionPreference
    );
  }

  /**
   * Returns the closest valid candidate connection, if one can be found.
   *
   * Valid neighbour connections are within the configured start radius, with a
   * compatible type (input, output, etc) and connection check.
   */
  private getConnectionCandidate(
    draggingBlock: BlockSvg,
    delta: Coordinate,
  ): ConnectionCandidate | null {
    const localConns = this.getLocalConnections(draggingBlock);
    let radius = this.connectionCandidate
      ? config.connectingSnapRadius
      : config.snapRadius;
    let candidate = null;

    for (const conn of localConns) {
      const {connection: neighbour, radius: rad} = conn.closest(radius, delta);
      if (neighbour) {
        candidate = {
          local: conn,
          neighbour: neighbour,
          distance: rad,
        };
        radius = rad;
      }
    }

    return candidate;
  }

  /**
   * Returns all of the connections we might connect to blocks on the workspace.
   *
   * Includes any connections on the dragging block, and any last next
   * connection on the stack (if one exists).
   */
  private getLocalConnections(draggingBlock: BlockSvg): RenderedConnection[] {
    const available = draggingBlock.getConnections_(false);
    const lastOnStack = draggingBlock.lastConnectionInStack(true);
    if (lastOnStack && lastOnStack !== draggingBlock.nextConnection) {
      available.push(lastOnStack);
    }
    return available;
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
    this.fireDragEndEvent_();

    dom.stopTextWidthCache();

    blockAnimation.disconnectUiStop();
    this.connectionPreviewer.hidePreview();

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
      this.workspace_
        .getLayerManager()
        ?.moveOffDragLayer(this.draggingBlock_, layers.BLOCK);
      this.draggingBlock_.setDragging(false);
      if (preventMove) {
        this.moveToOriginalPosition();
      } else if (delta) {
        this.updateBlockAfterMove_();
      }
    }
    // Must dispose after `updateBlockAfterMove_` is called to not break the
    // dynamic connections plugin.
    this.connectionPreviewer.dispose();
    this.workspace_.setResizesEnabled(true);

    eventUtils.setGroup(false);
  }

  /**
   * Moves the dragged block back to its original position before the start of
   * the drag. Reconnects any parent and child blocks.
   */
  private moveToOriginalPosition() {
    this.startChildConn?.connect(this.draggingBlock_.nextConnection);
    if (this.startParentConn) {
      switch (this.startParentConn.type) {
        case ConnectionType.INPUT_VALUE:
          this.startParentConn.connect(this.draggingBlock_.outputConnection);
          break;
        case ConnectionType.NEXT_STATEMENT:
          this.startParentConn.connect(this.draggingBlock_.previousConnection);
      }
    } else {
      this.draggingBlock_.moveTo(this.startXY_, ['drag']);
      // Blocks dragged directly from a flyout may need to be bumped into
      // bounds.
      bumpObjects.bumpIntoBounds(
        this.draggingBlock_.workspace,
        this.workspace_.getMetricsManager().getScrollMetrics(true),
        this.draggingBlock_,
      );
    }
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
    if (this.connectionCandidate) {
      // Applying connections also rerenders the relevant blocks.
      this.applyConnections(this.connectionCandidate);
    } else {
      this.draggingBlock_.queueRender();
    }
    this.draggingBlock_.snapToGrid();
  }

  private applyConnections(candidate: ConnectionCandidate) {
    const {local, neighbour} = candidate;
    local.connect(neighbour);
    // TODO: We can remove this `rendered` check when we reconcile with v11.
    if (this.draggingBlock_.rendered) {
      const inferiorConnection = local.isSuperior() ? neighbour : local;
      const rootBlock = this.draggingBlock_.getRootBlock();

      finishQueuedRenders().then(() => {
        blockAnimation.connectionUiEffect(inferiorConnection.getSourceBlock());
        // bringToFront is incredibly expensive. Delay until the next frame.
        setTimeout(() => {
          rootBlock.bringToFront();
        }, 0);
      });
    }
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
   * Get a list of the insertion markers that currently exist.  Drags have 0, 1,
   * or 2 insertion markers.
   *
   * @returns A possibly empty list of insertion marker blocks.
   */
  getInsertionMarkers(): BlockSvg[] {
    return this.workspace_
      .getAllBlocks()
      .filter((block) => block.isInsertionMarker());
  }
}

/** Data about the position of a given icon. */
export interface IconPositionData {
  location: Coordinate;
  icon: Icon;
}

registry.register(registry.Type.BLOCK_DRAGGER, registry.DEFAULT, BlockDragger);
