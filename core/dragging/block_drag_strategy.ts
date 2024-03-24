/**
 * @license
 * Copyright 2024 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import * as blockAnimation from '../block_animations.js';
import * as dom from '../utils/dom.js';
import * as registry from '../registry.js';
import * as eventUtils from '../events/utils.js';
import type {BlockSvg} from '../block_svg.js';
import type {Coordinate} from '../utils/coordinate.js';
import {DragStrategy} from './drag_strategy.js';
import type {IConnectionPreviewer} from '../interfaces/i_connection_previewer.js';
import type {IDragTarget} from '../interfaces/i_drag_target.js';
import type {RenderedConnection} from '../rendered_connection.js';
import type {WorkspaceSvg} from '../workspace_svg.js';
import {config} from './config.js';

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
 * Class for a block drag stragetgy.  It moves its block (and any
 * attached child blocks) around the workspaceg when they are being
 * dragged by a mouse or touch.
 */
export class BlockDragStrategy extends DragStrategy<BlockSvg> {
  private connectionPreviewer: IConnectionPreviewer;

  private connectionCandidate: ConnectionCandidate | null = null;
  private newConnectionCandidate: ConnectionCandidate | null = null;

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
    super(block, workspace);

    const previewerConstructor = registry.getClassFromOptions(
      registry.Type.CONNECTION_PREVIEWER,
      this.workspace.options,
    );
    this.connectionPreviewer = new previewerConstructor!(block);
  }

  startDragInner(e?: PointerEvent): void {
    const healStack = Boolean(e?.altKey || e?.ctrlKey || e?.metaKey);

    // The z-order of blocks depends on their order in the SVG, so move the
    // block being dragged to the front so that it will appear atop other blocks
    // in the workspace.
    this.draggable.bringToFront(true);

    // During a drag there may be a lot of rerenders, but not field changes.
    // Turn the cache on so we don't do spurious remeasures during the drag.
    dom.startTextWidthCache();
    this.workspace.setResizesEnabled(false);
    blockAnimation.disconnectUiStop();

    if (this.shouldDisconnect(healStack)) {
      // Save parent / child connections.
      this.startParentConn =
        this.draggable.outputConnection?.targetConnection ??
        this.draggable.previousConnection?.targetConnection;
      if (healStack) {
        this.startChildConn = this.draggable.nextConnection?.targetConnection;
      }
      this.disconnectBlock(healStack);
    }
    this.draggable.setDragging(true);
  }

  /**
   * Returns truee iff the block should be disconnected when the drag
   * is started.
   *
   * @param healStack Should stack be healed after disconnecting?
   * @returns True iff the block should be disconnected.
   */
  protected shouldDisconnect(healStack: boolean): boolean {
    return Boolean(
      this.draggable.getParent() ||
        (healStack &&
          this.draggable.nextConnection &&
          this.draggable.nextConnection.targetBlock()),
    );
  }

  /**
   * Disconnects the block.
   *
   * @param healStack Whether or not to heal the stack after disconnecting.
   */
  protected disconnectBlock(healStack: boolean) {
    this.draggable.unplug(healStack);
    // TODO(cpcallen): Will this animatino actually be seen if the
    // block is immediately moved via .drag()?  In the old
    // BlockDragger we did the initial disconnect translation before
    // firing the disconnectUieEffect.
    blockAnimation.disconnectUiEffect(this.draggable);
  }

  protected fireDragStartEvent() {
    const event = new (eventUtils.get(eventUtils.BLOCK_DRAG))(
      this.draggable,
      true,
      this.draggable.getDescendants(false),
    );
    eventUtils.fire(event);
  }

  protected move(newLoc: Coordinate) {
    this.draggable.moveDuringDrag(newLoc);
  }

  /**
   * Calls getConnectionCandidate, stores results in
   * this.newCandidateConnection for later use by
   * updateConnectionPreview, and returns true iff a candidate
   * connection was found.
   */
  protected couldConnect(_newLoc: Coordinate): boolean {
    // Not sure best way to compute delta.
    const delta = new Coordinate();
    this.newConnectionCandidate = getConnectionCandidate(delta);

    return Boolean(this.newConnectionCandidate);
  }

  /**
   * Returns the closest valid candidate connection, if one can be found.
   *
   * Valid neighbour connections are within the configured start radius, with a
   * compatible type (input, output, etc) and connection check.
   *
   * @param delta How far the pointer has moved from the position
   *     at the start of the drag, in pixel units.
   */
  private getConnectionCandidate(
    delta: Coordinate,
  ): ConnectionCandidate | null {
    const localConns = this.getLocalConnections();
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
   * Returns all of the connections we might connect to blocks on the
   * workspace. Includes any connections on the dragging block, and
   * any last next connection on the stack (if one exists).
   */
  private getLocalConnections(): RenderedConnection[] {
    const available = this.draggable.getConnections_(false);
    const lastOnStack = this.draggable.lastConnectionInStack(true);
    if (lastOnStack && lastOnStack !== this.draggable.nextConnection) {
      available.push(lastOnStack);
    }
    return available;
  }

  /**
   * Update the cursor (and possibly the trash can lid) to reflect
   * whether the dragging block would be deleted if released
   * immediately, then update the connection previewer.
   */
  protected dragInner(
    newLoc: Coordinate,
    target: IDragTarget | null,
    wouldBeDeleted: boolean,
  ): void {
    this.draggable.setDeleteStyle(wouldBeDeleted);
    // this.updateConnectionPreview(block, delta);
  }

  /**
   * @param dragDelta How far the pointer has moved from the position
   *     at the start of the drag, in pixel units.
   */
  private updateConnectionPreview() {
    const currCandidate = this.connectionCandidate;
    const newCandidate = this.newConnectionCandidate;
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
}
