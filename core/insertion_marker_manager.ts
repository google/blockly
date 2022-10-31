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
import * as goog from '../closure/goog/goog.js';
goog.declareModuleId('Blockly.InsertionMarkerManager');

import * as blockAnimations from './block_animations.js';
import type {BlockSvg} from './block_svg.js';
import * as common from './common.js';
import {ComponentManager} from './component_manager.js';
import {config} from './config.js';
import {ConnectionType} from './connection_type.js';
import * as constants from './constants.js';
import * as eventUtils from './events/utils.js';
import type {IDeleteArea} from './interfaces/i_delete_area.js';
import type {IDragTarget} from './interfaces/i_drag_target.js';
import type {RenderedConnection} from './rendered_connection.js';
import type {Coordinate} from './utils/coordinate.js';
import type {WorkspaceSvg} from './workspace_svg.js';


/** Represents a nearby valid connection. */
interface CandidateConnection {
  closest: RenderedConnection|null;
  local: RenderedConnection|null;
  radius: number;
}

/**
 * An error message to throw if the block created by createMarkerBlock_ is
 * missing any components.
 */
const DUPLICATE_BLOCK_ERROR = 'The insertion marker ' +
    'manager tried to create a marker but the result is missing %1. If ' +
    'you are using a mutator, make sure your domToMutation method is ' +
    'properly defined.';

/**
 * Class that controls updates to connections during drags.  It is primarily
 * responsible for finding the closest eligible connection and highlighting or
 * unhighlighting it as needed during a drag.
 *
 * @alias Blockly.InsertionMarkerManager
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
  private lastOnStack: RenderedConnection|null = null;

  /**
   * The insertion marker corresponding to the last block in the stack, if
   * that's not the same as the first block in the stack.
   * Set in initAvailableConnections, if at all
   */
  private lastMarker: BlockSvg|null = null;

  /**
   * The insertion marker that shows up between blocks to show where a block
   * would go if dropped immediately.
   */
  private firstMarker: BlockSvg;

  /**
   * The connection that this block would connect to if released immediately.
   * Updated on every mouse move.
   * This is not on any of the blocks that are being dragged.
   */
  private closestConnection: RenderedConnection|null = null;

  /**
   * The connection that would connect to this.closestConnection if this
   * block were released immediately. Updated on every mouse move. This is on
   * the top block that is being dragged or the last block in the dragging
   * stack.
   */
  private localConnection: RenderedConnection|null = null;

  /**
   * Whether the block would be deleted if it were dropped immediately.
   * Updated on every mouse move.
   */
  private wouldDeleteBlockInternal = false;

  /**
   * Connection on the insertion marker block that corresponds to
   * this.localConnection on the currently dragged block.
   */
  private markerConnection: RenderedConnection|null = null;

  /** The block that currently has an input being highlighted, or null. */
  private highlightedBlock: BlockSvg|null = null;

  /** The block being faded to indicate replacement, or null. */
  private fadedBlock: BlockSvg|null = null;

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
  }

  /**
   * Sever all links from this object.
   *
   * @internal
   */
  dispose() {
    this.availableConnections.length = 0;

    eventUtils.disable();
    try {
      if (this.firstMarker) {
        this.firstMarker.dispose();
      }
      if (this.lastMarker) {
        this.lastMarker.dispose();
      }
    } finally {
      eventUtils.enable();
    }
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
   * Return whether the block would be deleted if dropped immediately, based on
   * information from the most recent move event.
   *
   * @returns True if the block would be deleted if dropped immediately.
   * @internal
   */
  wouldDeleteBlock(): boolean {
    return this.wouldDeleteBlockInternal;
  }

  /**
   * Return whether the block would be connected if dropped immediately, based
   * on information from the most recent move event.
   *
   * @returns True if the block would be connected if dropped immediately.
   * @internal
   */
  wouldConnectBlock(): boolean {
    return !!this.closestConnection;
  }

  /**
   * Connect to the closest connection and render the results.
   * This should be called at the end of a drag.
   *
   * @internal
   */
  applyConnections() {
    if (!this.closestConnection) return;
    if (!this.localConnection) {
      throw new Error(
          'Cannot apply connections because there is no local connection');
    }
    // Don't fire events for insertion markers.
    eventUtils.disable();
    this.hidePreview();
    eventUtils.enable();
    // Connect two blocks together.
    this.localConnection.connect(this.closestConnection);
    if (this.topBlock.rendered) {
      // Trigger a connection animation.
      // Determine which connection is inferior (lower in the source stack).
      const inferiorConnection = this.localConnection.isSuperior() ?
          this.closestConnection :
          this.localConnection;
      blockAnimations.connectionUiEffect(inferiorConnection.getSourceBlock());
      // Bring the just-edited stack to the front.
      const rootBlock = this.topBlock.getRootBlock();
      rootBlock.bringToFront();
    }
  }

  /**
   * Update connections based on the most recent move location.
   *
   * @param dxy Position relative to drag start, in workspace units.
   * @param dragTarget The drag target that the block is currently over.
   * @internal
   */
  update(dxy: Coordinate, dragTarget: IDragTarget|null) {
    const candidate = this.getCandidate(dxy);

    this.wouldDeleteBlockInternal = this.shouldDelete(candidate, dragTarget);

    const shouldUpdate =
        this.wouldDeleteBlockInternal || this.shouldUpdatePreviews(candidate, dxy);

    if (shouldUpdate) {
      // Don't fire events for insertion marker creation or movement.
      eventUtils.disable();
      this.maybeHidePreview(candidate);
      this.maybeShowPreview(candidate);
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
    const imType = sourceBlock.type;

    eventUtils.disable();
    let result: BlockSvg;
    try {
      result = this.workspace.newBlock(imType);
      result.setInsertionMarker(true);
      if (sourceBlock.saveExtraState) {
        const state = sourceBlock.saveExtraState();
        if (state && result.loadExtraState) {
          result.loadExtraState(state);
        }
      } else if (sourceBlock.mutationToDom) {
        const oldMutationDom = sourceBlock.mutationToDom();
        if (oldMutationDom && result.domToMutation) {
          result.domToMutation(oldMutationDom);
        }
      }
      // Copy field values from the other block.  These values may impact the
      // rendered size of the insertion marker.  Note that we do not care about
      // child blocks here.
      for (let i = 0; i < sourceBlock.inputList.length; i++) {
        const sourceInput = sourceBlock.inputList[i];
        if (sourceInput.name === constants.COLLAPSED_INPUT_NAME) {
          continue;  // Ignore the collapsed input.
        }
        const resultInput = result.inputList[i];
        if (!resultInput) {
          throw new Error(DUPLICATE_BLOCK_ERROR.replace('%1', 'an input'));
        }
        for (let j = 0; j < sourceInput.fieldRow.length; j++) {
          const sourceField = sourceInput.fieldRow[j];
          const resultField = resultInput.fieldRow[j];
          if (!resultField) {
            throw new Error(DUPLICATE_BLOCK_ERROR.replace('%1', 'a field'));
          }
          resultField.setValue(sourceField.getValue());
        }
      }

      result.setCollapsed(sourceBlock.isCollapsed());
      result.setInputsInline(sourceBlock.getInputsInline());

      result.initSvg();
      result.getSvgRoot().setAttribute('visibility', 'hidden');
    } finally {
      eventUtils.enable();
    }

    return result;
  }

  /**
   * Populate the list of available connections on this block stack.  This
   * should only be called once, at the beginning of a drag. If the stack has
   * more than one block, this function will populate lastOnStack_ and create
   * the corresponding insertion marker.
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
      if (this.lastMarker) {
        eventUtils.disable();
        try {
          this.lastMarker.dispose();
        } finally {
          eventUtils.enable();
        }
      }
      this.lastMarker = this.createMarkerBlock(lastOnStack.getSourceBlock());
    }
    return available;
  }

  /**
   * Whether the previews (insertion marker and replacement marker) should be
   * updated based on the closest candidate and the current drag distance.
   *
   * @param candidate An object containing a local connection, a closest
   *     connection, and a radius.  Returned by getCandidate_.
   * @param dxy Position relative to drag start, in workspace units.
   * @returns Whether the preview should be updated.
   */
  private shouldUpdatePreviews(
      candidate: CandidateConnection, dxy: Coordinate): boolean {
    const candidateLocal = candidate.local;
    const candidateClosest = candidate.closest;
    const radius = candidate.radius;

    // Found a connection!
    if (candidateLocal && candidateClosest) {
      // We're already showing an insertion marker.
      // Decide whether the new connection has higher priority.
      if (this.localConnection && this.closestConnection) {
        // The connection was the same as the current connection.
        if (this.closestConnection === candidateClosest &&
            this.localConnection === candidateLocal) {
          return false;
        }
        const xDiff =
            this.localConnection.x + dxy.x - this.closestConnection.x;
        const yDiff =
            this.localConnection.y + dxy.y - this.closestConnection.y;
        const curDistance = Math.sqrt(xDiff * xDiff + yDiff * yDiff);
        // Slightly prefer the existing preview over a new preview.
        return !(
            candidateClosest &&
            radius > curDistance - config.currentConnectionPreference);
      } else if (!this.localConnection && !this.closestConnection) {
        // We weren't showing a preview before, but we should now.
        return true;
      } else {
        console.error(
            'Only one of localConnection_ and closestConnection_ was set.');
      }
    } else {  // No connection found.
      // Only need to update if we were showing a preview before.
      return !!(this.localConnection && this.closestConnection);
    }

    console.error(
        'Returning true from shouldUpdatePreviews, but it\'s not clear why.');
    return true;
  }

  /**
   * Find the nearest valid connection, which may be the same as the current
   * closest connection.
   *
   * @param dxy Position relative to drag start, in workspace units.
   * @returns An object containing a local connection, a closest connection, and
   *     a radius.
   */
  private getCandidate(dxy: Coordinate): CandidateConnection {
    let radius = this.getStartRadius();
    let candidateClosest = null;
    let candidateLocal = null;

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

    for (let i = 0; i < this.availableConnections.length; i++) {
      const myConnection = this.availableConnections[i];
      const neighbour = myConnection.closest(radius, dxy);
      if (neighbour.connection) {
        candidateClosest = neighbour.connection;
        candidateLocal = myConnection;
        radius = neighbour.radius;
      }
    }
    return {closest: candidateClosest, local: candidateLocal, radius};
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
    // Why? When a connection is highlighted, blocks move around when the
    // insertion marker is created, which could cause the connection became out
    // of range. By increasing radiusConnection when a connection already
    // exists, we never "lose" the connection from the offset.
    if (this.closestConnection && this.localConnection) {
      return config.connectingSnapRadius;
    }
    return config.snapRadius;
  }

  /**
   * Whether ending the drag would delete the block.
   *
   * @param candidate An object containing a local connection, a closest
   *     connection, and a radius.
   * @param dragTarget The drag target that the block is currently over.
   * @returns Whether dropping the block immediately would delete the block.
   */
  private shouldDelete(
      candidate: CandidateConnection, dragTarget: IDragTarget|null): boolean {
    if (dragTarget) {
      const componentManager = this.workspace.getComponentManager();
      const isDeleteArea = componentManager.hasCapability(
          dragTarget.id, ComponentManager.Capability.DELETE_AREA);
      if (isDeleteArea) {
        return (dragTarget as IDeleteArea)
            .wouldDelete(this.topBlock, candidate && !!candidate.closest);
      }
    }
    return false;
  }

  /**
   * Show an insertion marker or replacement highlighting during a drag, if
   * needed.
   * At the beginning of this function, this.localConnection and
   * this.closestConnection should both be null.
   *
   * @param candidate An object containing a local connection, a closest
   *     connection, and a radius.
   */
  private maybeShowPreview(candidate: CandidateConnection) {
    // Nope, don't add a marker.
    if (this.wouldDeleteBlockInternal) {
      return;
    }
    const closest = candidate.closest;
    const local = candidate.local;

    // Nothing to connect to.
    if (!closest) {
      return;
    }

    // Something went wrong and we're trying to connect to an invalid
    // connection.
    if (closest === this.closestConnection ||
        closest.getSourceBlock().isInsertionMarker()) {
      console.log('Trying to connect to an insertion marker');
      return;
    }
    // Add an insertion marker or replacement marker.
    this.closestConnection = closest;
    this.localConnection = local;
    this.showPreview();
  }

  /**
   * A preview should be shown.  This function figures out if it should be a
   * block highlight or an insertion marker, and shows the appropriate one.
   */
  private showPreview() {
    if (!this.closestConnection) {
      throw new Error(
          'Cannot show the preview because there is no closest connection');
    }
    if (!this.localConnection) {
      throw new Error(
          'Cannot show the preview because there is no local connection');
    }
    const closest = this.closestConnection;
    const renderer = this.workspace.getRenderer();
    const method = renderer.getConnectionPreviewMethod(
        closest, this.localConnection, this.topBlock);

    switch (method) {
      case InsertionMarkerManager.PREVIEW_TYPE.INPUT_OUTLINE:
        this.showInsertionInputOutline();
        break;
      case InsertionMarkerManager.PREVIEW_TYPE.INSERTION_MARKER:
        this.showInsertionMarker();
        break;
      case InsertionMarkerManager.PREVIEW_TYPE.REPLACEMENT_FADE:
        this.showReplacementFade();
        break;
    }

    // Optionally highlight the actual connection, as a nod to previous
    // behaviour.
    if (closest && renderer.shouldHighlightConnection(closest)) {
      closest.highlight();
    }
  }

  /**
   * Show an insertion marker or replacement highlighting during a drag, if
   * needed.
   * At the end of this function, this.localConnection_ and
   * this.closestConnection_ should both be null.
   *
   * @param candidate An object containing a local connection, a closest
   *     connection, and a radius.
   */
  private maybeHidePreview(candidate: CandidateConnection) {
    // If there's no new preview, remove the old one but don't bother deleting
    // it. We might need it later, and this saves disposing of it and recreating
    // it.
    if (!candidate.closest) {
      this.hidePreview();
    } else {
      // If there's a new preview and there was an preview before, and either
      // connection has changed, remove the old preview.
      const hadPreview = this.closestConnection && this.localConnection;
      const closestChanged = this.closestConnection !== candidate.closest;
      const localChanged = this.localConnection !== candidate.local;

      // Also hide if we had a preview before but now we're going to delete
      // instead.
      if (hadPreview &&
          (closestChanged || localChanged || this.wouldDeleteBlockInternal)) {
        this.hidePreview();
      }
    }

    // Either way, clear out old state.
    this.markerConnection = null;
    this.closestConnection = null;
    this.localConnection = null;
  }

  /**
   * A preview should be hidden.  This function figures out if it is a block
   *  highlight or an insertion marker, and hides the appropriate one.
   */
  private hidePreview() {
    if (this.closestConnection && this.closestConnection.targetBlock() &&
        this.workspace.getRenderer().shouldHighlightConnection(
            this.closestConnection)) {
      this.closestConnection.unhighlight();
    }
    if (this.fadedBlock) {
      this.hideReplacementFade();
    } else if (this.highlightedBlock) {
      this.hideInsertionInputOutline();
    } else if (this.markerConnection) {
      this.hideInsertionMarker();
    }
  }

  /**
   * Shows an insertion marker connected to the appropriate blocks (based on
   * manager state).
   */
  private showInsertionMarker() {
    if (!this.localConnection) {
      throw new Error(
          'Cannot show the insertion marker because there is no local ' +
          'connection');
    }
    if (!this.closestConnection) {
      throw new Error(
          'Cannot show the insertion marker because there is no closest ' +
          'connection');
    }
    const local = this.localConnection;
    const closest = this.closestConnection;

    const isLastInStack = this.lastOnStack && local === this.lastOnStack;
    let insertionMarker = isLastInStack ? this.lastMarker : this.firstMarker;
    if (!insertionMarker) {
      throw new Error(
          'Cannot show the insertion marker because there is no insertion ' +
          'marker block');
    }
    let imConn;
    try {
      imConn =
          insertionMarker.getMatchingConnection(local.getSourceBlock(), local);
    } catch (e) {
      // It's possible that the number of connections on the local block has
      // changed since the insertion marker was originally created.  Let's
      // recreate the insertion marker and try again. In theory we could
      // probably recreate the marker block (e.g. in getCandidate_), which is
      // called more often during the drag, but creating a block that often
      // might be too slow, so we only do it if necessary.
      this.firstMarker = this.createMarkerBlock(this.topBlock);
      insertionMarker = isLastInStack ? this.lastMarker : this.firstMarker;
      if (!insertionMarker) {
        throw new Error(
            'Cannot show the insertion marker because there is no insertion ' +
            'marker block');
      }
      imConn =
          insertionMarker.getMatchingConnection(local.getSourceBlock(), local);
    }

    if (!imConn) {
      throw new Error(
          'Cannot show the insertion marker because there is no ' +
          'associated connection');
    }

    if (imConn === this.markerConnection) {
      throw new Error(
          'Made it to showInsertionMarker_ even though the marker isn\'t ' +
          'changing');
    }

    // Render disconnected from everything else so that we have a valid
    // connection location.
    insertionMarker.render();
    insertionMarker.rendered = true;
    insertionMarker.getSvgRoot().setAttribute('visibility', 'visible');

    if (imConn && closest) {
      // Position so that the existing block doesn't move.
      insertionMarker.positionNearConnection(imConn, closest);
    }
    if (closest) {
      // Connect() also renders the insertion marker.
      imConn.connect(closest);
    }

    this.markerConnection = imConn;
  }

  /**
   * Disconnects and hides the current insertion marker. Should return the
   * blocks to their original state.
   */
  private hideInsertionMarker() {
    if (!this.markerConnection) {
      console.log('No insertion marker connection to disconnect');
      return;
    }

    const imConn = this.markerConnection;
    const imBlock = imConn.getSourceBlock();
    const markerNext = imBlock.nextConnection;
    const markerPrev = imBlock.previousConnection;
    const markerOutput = imBlock.outputConnection;

    const isFirstInStatementStack =
        imConn === markerNext && !(markerPrev && markerPrev.targetConnection);

    const isFirstInOutputStack = imConn.type === ConnectionType.INPUT_VALUE &&
        !(markerOutput && markerOutput.targetConnection);
    // The insertion marker is the first block in a stack.  Unplug won't do
    // anything in that case.  Instead, unplug the following block.
    if (isFirstInStatementStack || isFirstInOutputStack) {
      imConn.targetBlock()!.unplug(false);
    } else if (
        imConn.type === ConnectionType.NEXT_STATEMENT &&
        imConn !== markerNext) {
      // Inside of a C-block, first statement connection.
      const innerConnection = imConn.targetConnection;
      if (innerConnection) {
        innerConnection.getSourceBlock().unplug(false);
      }

      const previousBlockNextConnection =
          markerPrev ? markerPrev.targetConnection : null;

      imBlock.unplug(true);
      if (previousBlockNextConnection && innerConnection) {
        previousBlockNextConnection.connect(innerConnection);
      }
    } else {
      imBlock.unplug(/* healStack */
                     true);
    }

    if (imConn.targetConnection) {
      throw Error(
          'markerConnection_ still connected at the end of ' +
          'disconnectInsertionMarker');
    }

    this.markerConnection = null;
    const svg = imBlock.getSvgRoot();
    if (svg) {
      svg.setAttribute('visibility', 'hidden');
    }
  }

  /** Shows an outline around the input the closest connection belongs to. */
  private showInsertionInputOutline() {
    if (!this.closestConnection) {
      throw new Error(
          'Cannot show the insertion marker outline because ' +
          'there is no closest connection');
    }
    const closest = this.closestConnection;
    this.highlightedBlock = closest.getSourceBlock();
    this.highlightedBlock.highlightShapeForInput(closest, true);
  }

  /** Hides any visible input outlines. */
  private hideInsertionInputOutline() {
    if (!this.highlightedBlock) {
      throw new Error(
          'Cannot hide the insertion marker outline because ' +
          'there is no highlighted block');
    }
    if (!this.closestConnection) {
      throw new Error(
          'Cannot hide the insertion marker outline because ' +
          'there is no closest connection');
    }
    this.highlightedBlock.highlightShapeForInput(
        this.closestConnection, false);
    this.highlightedBlock = null;
  }

  /**
   * Shows a replacement fade affect on the closest connection's target block
   * (the block that is currently connected to it).
   */
  private showReplacementFade() {
    if (!this.closestConnection) {
      throw new Error(
          'Cannot show the replacement fade because there ' +
          'is no closest connection');
    }
    this.fadedBlock = this.closestConnection.targetBlock();
    if (!this.fadedBlock) {
      throw new Error(
          'Cannot show the replacement fade because the ' +
          'closest connection does not have a target block');
    }
    this.fadedBlock.fadeForReplacement(true);
  }

  /** Hides/Removes any visible fade affects. */
  private hideReplacementFade() {
    if (!this.fadedBlock) {
      throw new Error(
          'Cannot hide the replacement because there is no ' +
          'faded block');
    }
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
