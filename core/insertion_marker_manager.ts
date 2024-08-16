/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Class that controls updates to connections during drags.
 *
 * @class
 */
// Former goog.module ID: Blockly.InsertionMarkerManager

import * as blockAnimations from './block_animations.js';
import type {BlockSvg} from './block_svg.js';
import * as common from './common.js';
import {ComponentManager} from './component_manager.js';
import {config} from './config.js';
import * as eventUtils from './events/utils.js';
import type {IDeleteArea} from './interfaces/i_delete_area.js';
import type {IDragTarget} from './interfaces/i_drag_target.js';
import * as renderManagement from './render_management.js';
import {finishQueuedRenders} from './render_management.js';
import type {RenderedConnection} from './rendered_connection.js';
import * as blocks from './serialization/blocks.js';
import type {Coordinate} from './utils/coordinate.js';
import type {WorkspaceSvg} from './workspace_svg.js';

/** Represents a nearby valid connection. */
interface CandidateConnection {
  /**
   * A nearby valid connection that is compatible with local.
   * This is not on any of the blocks that are being dragged.
   */
  closest: RenderedConnection;
  /**
   * A connection on the dragging stack that is compatible with closest. This is
   * on the top block that is being dragged or the last block in the dragging
   * stack.
   */
  local: RenderedConnection;
  radius: number;
}

/**
 * Class that controls updates to connections during drags.  It is primarily
 * responsible for finding the closest eligible connection and highlighting or
 * unhighlighting it as needed during a drag.
 *
 * @deprecated v10 - Use an IConnectionPreviewer instead.
 */
export class InsertionMarkerManager {
  /**
   * The top block in the stack being dragged.
   * Does not change during a drag.
   */
  private readonly topBlock: BlockSvg;

  /**
   * The workspace on which these connections are being dragged.
   * Does not change during a drag.
   */
  private readonly workspace: WorkspaceSvg;

  /**
   * The last connection on the stack, if it's not the last connection on the
   * first block.
   * Set in initAvailableConnections, if at all.
   */
  private lastOnStack: RenderedConnection | null = null;

  /**
   * The insertion marker corresponding to the last block in the stack, if
   * that's not the same as the first block in the stack.
   * Set in initAvailableConnections, if at all
   */
  private lastMarker: BlockSvg | null = null;

  /**
   * The insertion marker that shows up between blocks to show where a block
   * would go if dropped immediately.
   */
  private firstMarker: BlockSvg;

  /**
   * Information about the connection that would be made if the dragging block
   * were released immediately. Updated on every mouse move.
   */
  private activeCandidate: CandidateConnection | null = null;

  /**
   * Whether the block would be deleted if it were dropped immediately.
   * Updated on every mouse move.
   *
   * @internal
   */
  public wouldDeleteBlock = false;

  /**
   * Connection on the insertion marker block that corresponds to
   * the active candidate's local connection on the currently dragged block.
   */
  private markerConnection: RenderedConnection | null = null;

  /** The block that currently has an input being highlighted, or null. */
  private highlightedBlock: BlockSvg | null = null;

  /** The block being faded to indicate replacement, or null. */
  private fadedBlock: BlockSvg | null = null;

  /**
   * The connections on the dragging blocks that are available to connect to
   * other blocks.  This includes all open connections on the top block, as
   * well as the last connection on the block stack.
   */
  private availableConnections: RenderedConnection[];

  /** @param block The top block in the stack being dragged. */
  constructor(block: BlockSvg) {
    common.setSelected(block);
    this.topBlock = block;

    this.workspace = block.workspace;

    this.firstMarker = this.createMarkerBlock(this.topBlock);

    this.availableConnections = this.initAvailableConnections();

    if (this.lastOnStack) {
      this.lastMarker = this.createMarkerBlock(
        this.lastOnStack.getSourceBlock(),
      );
    }
  }

  /**
   * Sever all links from this object.
   *
   * @internal
   */
  dispose() {
    this.availableConnections.length = 0;
    this.disposeInsertionMarker(this.firstMarker);
    this.disposeInsertionMarker(this.lastMarker);
  }

  /**
   * Update the available connections for the top block. These connections can
   * change if a block is unplugged and the stack is healed.
   *
   * @internal
   */
  updateAvailableConnections() {
    this.availableConnections = this.initAvailableConnections();
  }

  /**
   * Return whether the block would be connected if dropped immediately, based
   * on information from the most recent move event.
   *
   * @returns True if the block would be connected if dropped immediately.
   * @internal
   */
  wouldConnectBlock(): boolean {
    return !!this.activeCandidate;
  }

  /**
   * Connect to the closest connection and render the results.
   * This should be called at the end of a drag.
   *
   * @internal
   */
  applyConnections() {
    if (!this.activeCandidate) return;
    eventUtils.disable();
    this.hidePreview();
    eventUtils.enable();
    const {local, closest} = this.activeCandidate;
    local.connect(closest);
    const inferiorConnection = local.isSuperior() ? closest : local;
    const rootBlock = this.topBlock.getRootBlock();

    finishQueuedRenders().then(() => {
      blockAnimations.connectionUiEffect(inferiorConnection.getSourceBlock());
      // bringToFront is incredibly expensive. Delay until the next frame.
      setTimeout(() => {
        rootBlock.bringToFront();
      }, 0);
    });
  }

  /**
   * Update connections based on the most recent move location.
   *
   * @param dxy Position relative to drag start, in workspace units.
   * @param dragTarget The drag target that the block is currently over.
   * @internal
   */
  update(dxy: Coordinate, dragTarget: IDragTarget | null) {
    const newCandidate = this.getCandidate(dxy);

    this.wouldDeleteBlock = this.shouldDelete(!!newCandidate, dragTarget);

    const shouldUpdate =
      this.wouldDeleteBlock || this.shouldUpdatePreviews(newCandidate, dxy);

    if (shouldUpdate) {
      // Don't fire events for insertion marker creation or movement.
      eventUtils.disable();
      this.maybeHidePreview(newCandidate);
      this.maybeShowPreview(newCandidate);
      eventUtils.enable();
    }
  }

  /**
   * Create an insertion marker that represents the given block.
   *
   * @param sourceBlock The block that the insertion marker will represent.
   * @returns The insertion marker that represents the given block.
   */
  private createMarkerBlock(sourceBlock: BlockSvg): BlockSvg {
    eventUtils.disable();
    let result: BlockSvg;
    try {
      const blockJson = blocks.save(sourceBlock, {
        addCoordinates: false,
        addInputBlocks: false,
        addNextBlocks: false,
        doFullSerialization: false,
      });

      if (!blockJson) {
        throw new Error(
          `Failed to serialize source block. ${sourceBlock.toDevString()}`,
        );
      }

      result = blocks.append(blockJson, this.workspace) as BlockSvg;

      // Turn shadow blocks that are created programmatically during
      // initalization to insertion markers too.
      for (const block of result.getDescendants(false)) {
        block.setInsertionMarker(true);
      }

      result.initSvg();
      result.getSvgRoot().setAttribute('visibility', 'hidden');
    } finally {
      eventUtils.enable();
    }

    return result;
  }

  /**
   * Populate the list of available connections on this block stack. If the
   * stack has more than one block, this function will also update lastOnStack.
   *
   * @returns A list of available connections.
   */
  private initAvailableConnections(): RenderedConnection[] {
    const available = this.topBlock.getConnections_(false);
    // Also check the last connection on this stack
    const lastOnStack = this.topBlock.lastConnectionInStack(true);
    if (lastOnStack && lastOnStack !== this.topBlock.nextConnection) {
      available.push(lastOnStack);
      this.lastOnStack = lastOnStack;
    }
    return available;
  }

  /**
   * Whether the previews (insertion marker and replacement marker) should be
   * updated based on the closest candidate and the current drag distance.
   *
   * @param newCandidate A new candidate connection that may replace the current
   *     best candidate.
   * @param dxy Position relative to drag start, in workspace units.
   * @returns Whether the preview should be updated.
   */
  private shouldUpdatePreviews(
    newCandidate: CandidateConnection | null,
    dxy: Coordinate,
  ): boolean {
    // Only need to update if we were showing a preview before.
    if (!newCandidate) return !!this.activeCandidate;

    // We weren't showing a preview before, but we should now.
    if (!this.activeCandidate) return true;

    // We're already showing an insertion marker.
    // Decide whether the new connection has higher priority.
    const {local: activeLocal, closest: activeClosest} = this.activeCandidate;
    if (
      activeClosest === newCandidate.closest &&
      activeLocal === newCandidate.local
    ) {
      // The connection was the same as the current connection.
      return false;
    }

    const xDiff = activeLocal.x + dxy.x - activeClosest.x;
    const yDiff = activeLocal.y + dxy.y - activeClosest.y;
    const curDistance = Math.sqrt(xDiff * xDiff + yDiff * yDiff);
    // Slightly prefer the existing preview over a new preview.
    return (
      newCandidate.radius < curDistance - config.currentConnectionPreference
    );
  }

  /**
   * Find the nearest valid connection, which may be the same as the current
   * closest connection.
   *
   * @param dxy Position relative to drag start, in workspace units.
   * @returns An object containing a local connection, a closest connection, and
   *     a radius.
   */
  private getCandidate(dxy: Coordinate): CandidateConnection | null {
    // It's possible that a block has added or removed connections during a
    // drag, (e.g. in a drag/move event handler), so let's update the available
    // connections. Note that this will be called on every move while dragging,
    // so it might cause slowness, especially if the block stack is large.  If
    // so, maybe it could be made more efficient. Also note that we won't update
    // the connections if we've already connected the insertion marker to a
    // block.
    if (!this.markerConnection || !this.markerConnection.isConnected()) {
      this.updateAvailableConnections();
    }

    let radius = this.getStartRadius();
    let candidate = null;
    for (let i = 0; i < this.availableConnections.length; i++) {
      const myConnection = this.availableConnections[i];
      const neighbour = myConnection.closest(radius, dxy);
      if (neighbour.connection) {
        candidate = {
          closest: neighbour.connection,
          local: myConnection,
          radius: neighbour.radius,
        };
        radius = neighbour.radius;
      }
    }
    return candidate;
  }

  /**
   * Decide the radius at which to start searching for the closest connection.
   *
   * @returns The radius at which to start the search for the closest
   *     connection.
   */
  private getStartRadius(): number {
    // If there is already a connection highlighted,
    // increase the radius we check for making new connections.
    // When a connection is highlighted, blocks move around when the
    // insertion marker is created, which could cause the connection became out
    // of range. By increasing radiusConnection when a connection already
    // exists, we never "lose" the connection from the offset.
    return this.activeCandidate
      ? config.connectingSnapRadius
      : config.snapRadius;
  }

  /**
   * Whether ending the drag would delete the block.
   *
   * @param newCandidate Whether there is a candidate connection that the
   *     block could connect to if the drag ended immediately.
   * @param dragTarget The drag target that the block is currently over.
   * @returns Whether dropping the block immediately would delete the block.
   */
  private shouldDelete(
    newCandidate: boolean,
    dragTarget: IDragTarget | null,
  ): boolean {
    if (dragTarget) {
      const componentManager = this.workspace.getComponentManager();
      const isDeleteArea = componentManager.hasCapability(
        dragTarget.id,
        ComponentManager.Capability.DELETE_AREA,
      );
      if (isDeleteArea) {
        return (dragTarget as IDeleteArea).wouldDelete(this.topBlock);
      }
    }
    return false;
  }

  /**
   * Show an insertion marker or replacement highlighting during a drag, if
   * needed.
   * At the beginning of this function, this.activeConnection should be null.
   *
   * @param newCandidate A new candidate connection that may replace the current
   *     best candidate.
   */
  private maybeShowPreview(newCandidate: CandidateConnection | null) {
    if (this.wouldDeleteBlock) return; // Nope, don't add a marker.
    if (!newCandidate) return; // Nothing to connect to.

    const closest = newCandidate.closest;

    // Something went wrong and we're trying to connect to an invalid
    // connection.
    if (
      closest === this.activeCandidate?.closest ||
      closest.getSourceBlock().isInsertionMarker()
    ) {
      console.log('Trying to connect to an insertion marker');
      return;
    }
    this.activeCandidate = newCandidate;
    // Add an insertion marker or replacement marker.
    this.showPreview(this.activeCandidate);
  }

  /**
   * A preview should be shown.  This function figures out if it should be a
   * block highlight or an insertion marker, and shows the appropriate one.
   *
   * @param activeCandidate The connection that will be made if the drag ends
   *     immediately.
   */
  private showPreview(activeCandidate: CandidateConnection) {
    const renderer = this.workspace.getRenderer();
    const method = renderer.getConnectionPreviewMethod(
      activeCandidate.closest,
      activeCandidate.local,
      this.topBlock,
    );

    switch (method) {
      case InsertionMarkerManager.PREVIEW_TYPE.INPUT_OUTLINE:
        this.showInsertionInputOutline(activeCandidate);
        break;
      case InsertionMarkerManager.PREVIEW_TYPE.INSERTION_MARKER:
        this.showInsertionMarker(activeCandidate);
        break;
      case InsertionMarkerManager.PREVIEW_TYPE.REPLACEMENT_FADE:
        this.showReplacementFade(activeCandidate);
        break;
    }

    // Optionally highlight the actual connection, as a nod to previous
    // behaviour.
    if (renderer.shouldHighlightConnection(activeCandidate.closest)) {
      activeCandidate.closest.highlight();
    }
  }

  /**
   * Hide an insertion marker or replacement highlighting during a drag, if
   * needed.
   * At the end of this function, this.activeCandidate will be null.
   *
   * @param newCandidate A new candidate connection that may replace the current
   *     best candidate.
   */
  private maybeHidePreview(newCandidate: CandidateConnection | null) {
    // If there's no new preview, remove the old one but don't bother deleting
    // it. We might need it later, and this saves disposing of it and recreating
    // it.
    if (!newCandidate) {
      this.hidePreview();
    } else {
      if (this.activeCandidate) {
        const closestChanged =
          this.activeCandidate.closest !== newCandidate.closest;
        const localChanged = this.activeCandidate.local !== newCandidate.local;

        // If there's a new preview and there was a preview before, and either
        // connection has changed, remove the old preview.
        // Also hide if we had a preview before but now we're going to delete
        // instead.
        if (closestChanged || localChanged || this.wouldDeleteBlock) {
          this.hidePreview();
        }
      }
    }

    // Either way, clear out old state.
    this.markerConnection = null;
    this.activeCandidate = null;
  }

  /**
   * A preview should be hidden. Loop through all possible preview modes
   * and hide everything.
   */
  private hidePreview() {
    const closest = this.activeCandidate?.closest;
    if (
      closest &&
      closest.targetBlock() &&
      this.workspace.getRenderer().shouldHighlightConnection(closest)
    ) {
      closest.unhighlight();
    }
    this.hideReplacementFade();
    this.hideInsertionInputOutline();
    this.hideInsertionMarker();
  }

  /**
   * Shows an insertion marker connected to the appropriate blocks (based on
   * manager state).
   *
   * @param activeCandidate The connection that will be made if the drag ends
   *     immediately.
   */
  private showInsertionMarker(activeCandidate: CandidateConnection) {
    const {local, closest} = activeCandidate;

    const isLastInStack = this.lastOnStack && local === this.lastOnStack;
    let insertionMarker = isLastInStack ? this.lastMarker : this.firstMarker;
    if (!insertionMarker) {
      throw new Error(
        'Cannot show the insertion marker because there is no insertion ' +
          'marker block',
      );
    }
    let imConn;
    try {
      imConn = insertionMarker.getMatchingConnection(
        local.getSourceBlock(),
        local,
      );
    } catch {
      // It's possible that the number of connections on the local block has
      // changed since the insertion marker was originally created.  Let's
      // recreate the insertion marker and try again. In theory we could
      // probably recreate the marker block (e.g. in getCandidate_), which is
      // called more often during the drag, but creating a block that often
      // might be too slow, so we only do it if necessary.
      if (isLastInStack && this.lastOnStack) {
        this.disposeInsertionMarker(this.lastMarker);
        this.lastMarker = this.createMarkerBlock(
          this.lastOnStack.getSourceBlock(),
        );
        insertionMarker = this.lastMarker;
      } else {
        this.disposeInsertionMarker(this.firstMarker);
        this.firstMarker = this.createMarkerBlock(this.topBlock);
        insertionMarker = this.firstMarker;
      }

      if (!insertionMarker) {
        throw new Error(
          'Cannot show the insertion marker because there is no insertion ' +
            'marker block',
        );
      }
      imConn = insertionMarker.getMatchingConnection(
        local.getSourceBlock(),
        local,
      );
    }

    if (!imConn) {
      throw new Error(
        'Cannot show the insertion marker because there is no ' +
          'associated connection',
      );
    }

    if (imConn === this.markerConnection) {
      throw new Error(
        "Made it to showInsertionMarker_ even though the marker isn't " +
          'changing',
      );
    }

    // Render disconnected from everything else so that we have a valid
    // connection location.
    insertionMarker.queueRender();
    renderManagement.triggerQueuedRenders();

    // Connect() also renders the insertion marker.
    imConn.connect(closest);

    const originalOffsetToTarget = {
      x: closest.x - imConn.x,
      y: closest.y - imConn.y,
    };
    const originalOffsetInBlock = imConn.getOffsetInBlock().clone();
    const imConnConst = imConn;
    renderManagement.finishQueuedRenders().then(() => {
      // Position so that the existing block doesn't move.
      insertionMarker?.positionNearConnection(
        imConnConst,
        originalOffsetToTarget,
        originalOffsetInBlock,
      );
      insertionMarker?.getSvgRoot().setAttribute('visibility', 'visible');
    });

    this.markerConnection = imConn;
  }

  /**
   * Disconnects and hides the current insertion marker. Should return the
   * blocks to their original state.
   */
  private hideInsertionMarker() {
    if (!this.markerConnection) return;

    const markerConn = this.markerConnection;
    const imBlock = markerConn.getSourceBlock();
    const markerPrev = imBlock.previousConnection;
    const markerOutput = imBlock.outputConnection;

    if (!markerPrev?.targetConnection && !markerOutput?.targetConnection) {
      // If we are the top block, unplugging doesn't do anything.
      // The marker connection may not have a target block if we are hiding
      // as part of applying connections.
      markerConn.targetBlock()?.unplug(false);
    } else {
      imBlock.unplug(true);
    }

    if (markerConn.targetConnection) {
      throw Error(
        'markerConnection still connected at the end of ' +
          'disconnectInsertionMarker',
      );
    }

    this.markerConnection = null;
    const svg = imBlock.getSvgRoot();
    if (svg) {
      svg.setAttribute('visibility', 'hidden');
    }
  }

  /**
   * Shows an outline around the input the closest connection belongs to.
   *
   * @param activeCandidate The connection that will be made if the drag ends
   *     immediately.
   */
  private showInsertionInputOutline(activeCandidate: CandidateConnection) {
    const closest = activeCandidate.closest;
    this.highlightedBlock = closest.getSourceBlock();
    this.highlightedBlock.highlightShapeForInput(closest, true);
  }

  /** Hides any visible input outlines. */
  private hideInsertionInputOutline() {
    if (!this.highlightedBlock) return;

    if (!this.activeCandidate) {
      throw new Error(
        'Cannot hide the insertion marker outline because ' +
          'there is no active candidate',
      );
    }
    this.highlightedBlock.highlightShapeForInput(
      this.activeCandidate.closest,
      false,
    );
    this.highlightedBlock = null;
  }

  /**
   * Shows a replacement fade affect on the closest connection's target block
   * (the block that is currently connected to it).
   *
   * @param activeCandidate The connection that will be made if the drag ends
   *     immediately.
   */
  private showReplacementFade(activeCandidate: CandidateConnection) {
    this.fadedBlock = activeCandidate.closest.targetBlock();
    if (!this.fadedBlock) {
      throw new Error(
        'Cannot show the replacement fade because the ' +
          'closest connection does not have a target block',
      );
    }
    this.fadedBlock.fadeForReplacement(true);
  }

  /**
   * Hides/Removes any visible fade affects.
   */
  private hideReplacementFade() {
    if (!this.fadedBlock) return;

    this.fadedBlock.fadeForReplacement(false);
    this.fadedBlock = null;
  }

  /**
   * Get a list of the insertion markers that currently exist.  Drags have 0, 1,
   * or 2 insertion markers.
   *
   * @returns A possibly empty list of insertion marker blocks.
   * @internal
   */
  getInsertionMarkers(): BlockSvg[] {
    const result = [];
    if (this.firstMarker) {
      result.push(this.firstMarker);
    }
    if (this.lastMarker) {
      result.push(this.lastMarker);
    }
    return result;
  }

  /**
   * Safely disposes of an insertion marker.
   */
  private disposeInsertionMarker(marker: BlockSvg | null) {
    if (marker) {
      eventUtils.disable();
      try {
        marker.dispose();
      } finally {
        eventUtils.enable();
      }
    }
  }
}

export namespace InsertionMarkerManager {
  /**
   * An enum describing different kinds of previews the InsertionMarkerManager
   * could display.
   */
  export enum PREVIEW_TYPE {
    INSERTION_MARKER = 0,
    INPUT_OUTLINE = 1,
    REPLACEMENT_FADE = 2,
  }
}

export type PreviewType = InsertionMarkerManager.PREVIEW_TYPE;
export const PreviewType = InsertionMarkerManager.PREVIEW_TYPE;
