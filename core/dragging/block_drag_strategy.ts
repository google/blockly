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
import {DragStrategy} from './drag_strategy.js';
import type {IConnectionPreviewer} from '../interfaces/i_connection_previewer.js';
import type {RenderedConnection} from '../rendered_connection.js';
import type {WorkspaceSvg} from '../workspace_svg.js';

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
}
