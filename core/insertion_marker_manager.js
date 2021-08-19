/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Class that controls updates to connections during drags.
 * @author fenichel@google.com (Rachel Fenichel)
 */
'use strict';

goog.module('Blockly.InsertionMarkerManager');
goog.module.declareLegacyNamespace();

// TODO(#5073): Add Blockly require after fixing circular dependency.
// goog.require('Blockly');
/* eslint-disable-next-line no-unused-vars */
const BlockSvg = goog.requireType('Blockly.BlockSvg');
const ComponentManager = goog.require('Blockly.ComponentManager');
/* eslint-disable-next-line no-unused-vars */
const Coordinate = goog.requireType('Blockly.utils.Coordinate');
const Events = goog.require('Blockly.Events');
/* eslint-disable-next-line no-unused-vars */
const IDeleteArea = goog.requireType('Blockly.IDeleteArea');
/* eslint-disable-next-line no-unused-vars */
const IDragTarget = goog.requireType('Blockly.IDragTarget');
/* eslint-disable-next-line no-unused-vars */
const RenderedConnection = goog.requireType('Blockly.RenderedConnection');
/* eslint-disable-next-line no-unused-vars */
const WorkspaceSvg = goog.requireType('Blockly.WorkspaceSvg');
const blockAnimations = goog.require('Blockly.blockAnimations');
const common = goog.require('Blockly.common');
const connectionTypes = goog.require('Blockly.connectionTypes');
const constants = goog.require('Blockly.constants');
const internalConstants = goog.require('Blockly.internalConstants');


/**
 * Class that controls updates to connections during drags.  It is primarily
 * responsible for finding the closest eligible connection and highlighting or
 * unhiglighting it as needed during a drag.
 * @param {!BlockSvg} block The top block in the stack being dragged.
 * @constructor
 */
const InsertionMarkerManager = function(block) {
  common.setSelected(block);

  /**
   * The top block in the stack being dragged.
   * Does not change during a drag.
   * @type {!BlockSvg}
   * @private
   */
  this.topBlock_ = block;

  /**
   * The workspace on which these connections are being dragged.
   * Does not change during a drag.
   * @type {!WorkspaceSvg}
   * @private
   */
  this.workspace_ = block.workspace;

  /**
   * The last connection on the stack, if it's not the last connection on the
   * first block.
   * Set in initAvailableConnections, if at all.
   * @type {RenderedConnection}
   * @private
   */
  this.lastOnStack_ = null;

  /**
   * The insertion marker corresponding to the last block in the stack, if
   * that's not the same as the first block in the stack.
   * Set in initAvailableConnections, if at all
   * @type {BlockSvg}
   * @private
   */
  this.lastMarker_ = null;

  /**
   * The insertion marker that shows up between blocks to show where a block
   * would go if dropped immediately.
   * @type {BlockSvg}
   * @private
   */
  this.firstMarker_ = this.createMarkerBlock_(this.topBlock_);

  /**
   * The connection that this block would connect to if released immediately.
   * Updated on every mouse move.
   * This is not on any of the blocks that are being dragged.
   * @type {RenderedConnection}
   * @private
   */
  this.closestConnection_ = null;

  /**
   * The connection that would connect to this.closestConnection_ if this block
   * were released immediately.
   * Updated on every mouse move.
   * This is on the top block that is being dragged or the last block in the
   * dragging stack.
   * @type {RenderedConnection}
   * @private
   */
  this.localConnection_ = null;

  /**
   * Whether the block would be deleted if it were dropped immediately.
   * Updated on every mouse move.
   * @type {boolean}
   * @private
   */
  this.wouldDeleteBlock_ = false;

  /**
   * Connection on the insertion marker block that corresponds to
   * this.localConnection_ on the currently dragged block.
   * @type {RenderedConnection}
   * @private
   */
  this.markerConnection_ = null;

  /**
   * The block that currently has an input being highlighted, or null.
   * @type {BlockSvg}
   * @private
   */
  this.highlightedBlock_ = null;

  /**
   * The block being faded to indicate replacement, or null.
   * @type {BlockSvg}
   * @private
   */
  this.fadedBlock_ = null;

  /**
   * The connections on the dragging blocks that are available to connect to
   * other blocks.  This includes all open connections on the top block, as well
   * as the last connection on the block stack.
   * Does not change during a drag.
   * @type {!Array<!RenderedConnection>}
   * @private
   */
  this.availableConnections_ = this.initAvailableConnections_();
};

/**
 * An enum describing different kinds of previews the InsertionMarkerManager
 * could display.
 * @enum {number}
 */
InsertionMarkerManager.PREVIEW_TYPE = {
  INSERTION_MARKER: 0,
  INPUT_OUTLINE: 1,
  REPLACEMENT_FADE: 2,
};

/**
 * An error message to throw if the block created by createMarkerBlock_ is
 * missing any components.
 * @type {string}
 * @const
 */
InsertionMarkerManager.DUPLICATE_BLOCK_ERROR = 'The insertion marker ' +
    'manager tried to create a marker but the result is missing %1. If ' +
    'you are using a mutator, make sure your domToMutation method is ' +
    'properly defined.';

/**
 * Sever all links from this object.
 * @package
 */
InsertionMarkerManager.prototype.dispose = function() {
  this.availableConnections_.length = 0;

  Events.disable();
  try {
    if (this.firstMarker_) {
      this.firstMarker_.dispose();
    }
    if (this.lastMarker_) {
      this.lastMarker_.dispose();
    }
  } finally {
    Events.enable();
  }
};

/**
 * Update the available connections for the top block. These connections can
 * change if a block is unplugged and the stack is healed.
 * @package
 */
InsertionMarkerManager.prototype.updateAvailableConnections = function() {
  this.availableConnections_ = this.initAvailableConnections_();
};

/**
 * Return whether the block would be deleted if dropped immediately, based on
 * information from the most recent move event.
 * @return {boolean} True if the block would be deleted if dropped immediately.
 * @package
 */
InsertionMarkerManager.prototype.wouldDeleteBlock = function() {
  return this.wouldDeleteBlock_;
};

/**
 * Return whether the block would be connected if dropped immediately, based on
 * information from the most recent move event.
 * @return {boolean} True if the block would be connected if dropped
 *   immediately.
 * @package
 */
InsertionMarkerManager.prototype.wouldConnectBlock = function() {
  return !!this.closestConnection_;
};

/**
 * Connect to the closest connection and render the results.
 * This should be called at the end of a drag.
 * @package
 */
InsertionMarkerManager.prototype.applyConnections = function() {
  if (this.closestConnection_) {
    // Don't fire events for insertion markers.
    Events.disable();
    this.hidePreview_();
    Events.enable();
    // Connect two blocks together.
    this.localConnection_.connect(this.closestConnection_);
    if (this.topBlock_.rendered) {
      // Trigger a connection animation.
      // Determine which connection is inferior (lower in the source stack).
      const inferiorConnection = this.localConnection_.isSuperior() ?
          this.closestConnection_ :
          this.localConnection_;
      blockAnimations.connectionUiEffect(inferiorConnection.getSourceBlock());
      // Bring the just-edited stack to the front.
      const rootBlock = this.topBlock_.getRootBlock();
      rootBlock.bringToFront();
    }
  }
};

/**
 * Update connections based on the most recent move location.
 * @param {!Coordinate} dxy Position relative to drag start,
 *     in workspace units.
 * @param {?IDragTarget} dragTarget The drag target that the block is
 *     currently over.
 * @package
 */
InsertionMarkerManager.prototype.update = function(dxy, dragTarget) {
  const candidate = this.getCandidate_(dxy);

  this.wouldDeleteBlock_ = this.shouldDelete_(candidate, dragTarget);

  const shouldUpdate =
      this.wouldDeleteBlock_ || this.shouldUpdatePreviews_(candidate, dxy);

  if (shouldUpdate) {
    // Don't fire events for insertion marker creation or movement.
    Events.disable();
    this.maybeHidePreview_(candidate);
    this.maybeShowPreview_(candidate);
    Events.enable();
  }
};

/**
 * Create an insertion marker that represents the given block.
 * @param {!BlockSvg} sourceBlock The block that the insertion marker
 *     will represent.
 * @return {!BlockSvg} The insertion marker that represents the given
 *     block.
 * @private
 */
InsertionMarkerManager.prototype.createMarkerBlock_ = function(sourceBlock) {
  const imType = sourceBlock.type;

  Events.disable();
  let result;
  try {
    result = this.workspace_.newBlock(imType);
    result.setInsertionMarker(true);
    if (sourceBlock.saveExtraState) {
      const state = sourceBlock.saveExtraState();
      if (state) {
        result.loadExtraState(state);
      }
    } else if (sourceBlock.mutationToDom) {
      const oldMutationDom = sourceBlock.mutationToDom();
      if (oldMutationDom) {
        result.domToMutation(oldMutationDom);
      }
    }
    // Copy field values from the other block.  These values may impact the
    // rendered size of the insertion marker.  Note that we do not care about
    // child blocks here.
    for (let i = 0; i < sourceBlock.inputList.length; i++) {
      const sourceInput = sourceBlock.inputList[i];
      if (sourceInput.name == constants.COLLAPSED_INPUT_NAME) {
        continue;  // Ignore the collapsed input.
      }
      const resultInput = result.inputList[i];
      if (!resultInput) {
        throw new Error(InsertionMarkerManager.DUPLICATE_BLOCK_ERROR.replace(
            '%1', 'an input'));
      }
      for (let j = 0; j < sourceInput.fieldRow.length; j++) {
        const sourceField = sourceInput.fieldRow[j];
        const resultField = resultInput.fieldRow[j];
        if (!resultField) {
          throw new Error(InsertionMarkerManager.DUPLICATE_BLOCK_ERROR.replace(
              '%1', 'a field'));
        }
        resultField.setValue(sourceField.getValue());
      }
    }

    result.setCollapsed(sourceBlock.isCollapsed());
    result.setInputsInline(sourceBlock.getInputsInline());

    result.initSvg();
    result.getSvgRoot().setAttribute('visibility', 'hidden');
  } finally {
    Events.enable();
  }

  return result;
};

/**
 * Populate the list of available connections on this block stack.  This should
 * only be called once, at the beginning of a drag.
 * If the stack has more than one block, this function will populate
 * lastOnStack_ and create the corresponding insertion marker.
 * @return {!Array<!RenderedConnection>} A list of available
 *     connections.
 * @private
 */
InsertionMarkerManager.prototype.initAvailableConnections_ = function() {
  const available = this.topBlock_.getConnections_(false);
  // Also check the last connection on this stack
  const lastOnStack = this.topBlock_.lastConnectionInStack(true);
  if (lastOnStack && lastOnStack != this.topBlock_.nextConnection) {
    available.push(lastOnStack);
    this.lastOnStack_ = lastOnStack;
    if (this.lastMarker_) {
      Events.disable();
      try {
        this.lastMarker_.dispose();
      } finally {
        Events.enable();
      }
    }
    this.lastMarker_ = this.createMarkerBlock_(lastOnStack.getSourceBlock());
  }
  return available;
};

/**
 * Whether the previews (insertion marker and replacement marker) should be
 * updated based on the closest candidate and the current drag distance.
 * @param {!Object} candidate An object containing a local connection, a closest
 *     connection, and a radius.  Returned by getCandidate_.
 * @param {!Coordinate} dxy Position relative to drag start,
 *     in workspace units.
 * @return {boolean} Whether the preview should be updated.
 * @private
 */
InsertionMarkerManager.prototype.shouldUpdatePreviews_ = function(
    candidate, dxy) {
  const candidateLocal = candidate.local;
  const candidateClosest = candidate.closest;
  const radius = candidate.radius;

  // Found a connection!
  if (candidateLocal && candidateClosest) {
    // We're already showing an insertion marker.
    // Decide whether the new connection has higher priority.
    if (this.localConnection_ && this.closestConnection_) {
      // The connection was the same as the current connection.
      if (this.closestConnection_ == candidateClosest &&
          this.localConnection_ == candidateLocal) {
        return false;
      }
      const xDiff = this.localConnection_.x + dxy.x - this.closestConnection_.x;
      const yDiff = this.localConnection_.y + dxy.y - this.closestConnection_.y;
      const curDistance = Math.sqrt(xDiff * xDiff + yDiff * yDiff);
      // Slightly prefer the existing preview over a new preview.
      return !(
          candidateClosest &&
          radius >
              curDistance - internalConstants.CURRENT_CONNECTION_PREFERENCE);
    } else if (!this.localConnection_ && !this.closestConnection_) {
      // We weren't showing a preview before, but we should now.
      return true;
    } else {
      console.error(
          'Only one of localConnection_ and closestConnection_ was set.');
    }
  } else {  // No connection found.
    // Only need to update if we were showing a preview before.
    return !!(this.localConnection_ && this.closestConnection_);
  }

  console.error(
      'Returning true from shouldUpdatePreviews, but it\'s not clear why.');
  return true;
};

/**
 * Find the nearest valid connection, which may be the same as the current
 * closest connection.
 * @param {!Coordinate} dxy Position relative to drag start,
 *     in workspace units.
 * @return {!Object} An object containing a local connection, a closest
 *     connection, and a radius.
 * @private
 */
InsertionMarkerManager.prototype.getCandidate_ = function(dxy) {
  let radius = this.getStartRadius_();
  let candidateClosest = null;
  let candidateLocal = null;

  for (let i = 0; i < this.availableConnections_.length; i++) {
    const myConnection = this.availableConnections_[i];
    const neighbour = myConnection.closest(radius, dxy);
    if (neighbour.connection) {
      candidateClosest = neighbour.connection;
      candidateLocal = myConnection;
      radius = neighbour.radius;
    }
  }
  return {closest: candidateClosest, local: candidateLocal, radius: radius};
};

/**
 * Decide the radius at which to start searching for the closest connection.
 * @return {number} The radius at which to start the search for the closest
 *     connection.
 * @private
 */
InsertionMarkerManager.prototype.getStartRadius_ = function() {
  // If there is already a connection highlighted,
  // increase the radius we check for making new connections.
  // Why? When a connection is highlighted, blocks move around when the
  // insertion marker is created, which could cause the connection became out of
  // range. By increasing radiusConnection when a connection already exists, we
  // never "lose" the connection from the offset.
  if (this.closestConnection_ && this.localConnection_) {
    return internalConstants.CONNECTING_SNAP_RADIUS;
  }
  return internalConstants.SNAP_RADIUS;
};

/**
 * Whether ending the drag would delete the block.
 * @param {!Object} candidate An object containing a local connection, a closest
 *    connection, and a radius.
 * @param {?IDragTarget} dragTarget The drag target that the block is
 *     currently over.
 * @return {boolean} Whether dropping the block immediately would delete the
 *    block.
 * @private
 */
InsertionMarkerManager.prototype.shouldDelete_ = function(
    candidate, dragTarget) {
  if (dragTarget) {
    const componentManager = this.workspace_.getComponentManager();
    const isDeleteArea = componentManager.hasCapability(
        dragTarget.id, ComponentManager.Capability.DELETE_AREA);
    if (isDeleteArea) {
      return (
                 /** @type {!IDeleteArea} */ (dragTarget))
          .wouldDelete(this.topBlock_, candidate && !!candidate.closest);
    }
  }
  return false;
};

/**
 * Show an insertion marker or replacement highlighting during a drag, if
 * needed.
 * At the beginning of this function, this.localConnection_ and
 * this.closestConnection_ should both be null.
 * @param {!Object} candidate An object containing a local connection, a closest
 *     connection, and a radius.
 * @private
 */
InsertionMarkerManager.prototype.maybeShowPreview_ = function(candidate) {
  // Nope, don't add a marker.
  if (this.wouldDeleteBlock_) {
    return;
  }
  const closest = candidate.closest;
  const local = candidate.local;

  // Nothing to connect to.
  if (!closest) {
    return;
  }

  // Something went wrong and we're trying to connect to an invalid connection.
  if (closest == this.closestConnection_ ||
      closest.getSourceBlock().isInsertionMarker()) {
    console.log('Trying to connect to an insertion marker');
    return;
  }
  // Add an insertion marker or replacement marker.
  this.closestConnection_ = closest;
  this.localConnection_ = local;
  this.showPreview_();
};

/**
 * A preview should be shown.  This function figures out if it should be a block
 * highlight or an insertion marker, and shows the appropriate one.
 * @private
 */
InsertionMarkerManager.prototype.showPreview_ = function() {
  const closest = this.closestConnection_;
  const renderer = this.workspace_.getRenderer();
  const method = renderer.getConnectionPreviewMethod(
      /** @type {!RenderedConnection} */ (closest),
      /** @type {!RenderedConnection} */ (this.localConnection_),
      this.topBlock_);

  switch (method) {
    case InsertionMarkerManager.PREVIEW_TYPE.INPUT_OUTLINE:
      this.showInsertionInputOutline_();
      break;
    case InsertionMarkerManager.PREVIEW_TYPE.INSERTION_MARKER:
      this.showInsertionMarker_();
      break;
    case InsertionMarkerManager.PREVIEW_TYPE.REPLACEMENT_FADE:
      this.showReplacementFade_();
      break;
  }

  // Optionally highlight the actual connection, as a nod to previous behaviour.
  if (closest && renderer.shouldHighlightConnection(closest)) {
    closest.highlight();
  }
};

/**
 * Show an insertion marker or replacement highlighting during a drag, if
 * needed.
 * At the end of this function, this.localConnection_ and
 * this.closestConnection_ should both be null.
 * @param {!Object} candidate An object containing a local connection, a closest
 *     connection, and a radius.
 * @private
 */
InsertionMarkerManager.prototype.maybeHidePreview_ = function(candidate) {
  // If there's no new preview, remove the old one but don't bother deleting it.
  // We might need it later, and this saves disposing of it and recreating it.
  if (!candidate.closest) {
    this.hidePreview_();
  } else {
    // If there's a new preview and there was an preview before, and either
    // connection has changed, remove the old preview.
    const hadPreview = this.closestConnection_ && this.localConnection_;
    const closestChanged = this.closestConnection_ != candidate.closest;
    const localChanged = this.localConnection_ != candidate.local;

    // Also hide if we had a preview before but now we're going to delete
    // instead.
    if (hadPreview &&
        (closestChanged || localChanged || this.wouldDeleteBlock_)) {
      this.hidePreview_();
    }
  }

  // Either way, clear out old state.
  this.markerConnection_ = null;
  this.closestConnection_ = null;
  this.localConnection_ = null;
};

/**
 * A preview should be hidden.  This function figures out if it is a block
 *  highlight or an insertion marker, and hides the appropriate one.
 * @private
 */
InsertionMarkerManager.prototype.hidePreview_ = function() {
  if (this.closestConnection_ && this.closestConnection_.targetBlock() &&
      this.workspace_.getRenderer().shouldHighlightConnection(
          this.closestConnection_)) {
    this.closestConnection_.unhighlight();
  }
  if (this.fadedBlock_) {
    this.hideReplacementFade_();
  } else if (this.highlightedBlock_) {
    this.hideInsertionInputOutline_();
  } else if (this.markerConnection_) {
    this.hideInsertionMarker_();
  }
};

/**
 * Shows an insertion marker connected to the appropriate blocks (based on
 * manager state).
 * @private
 */
InsertionMarkerManager.prototype.showInsertionMarker_ = function() {
  const local = this.localConnection_;
  const closest = this.closestConnection_;

  const isLastInStack = this.lastOnStack_ && local == this.lastOnStack_;
  const imBlock = isLastInStack ? this.lastMarker_ : this.firstMarker_;
  const imConn = imBlock.getMatchingConnection(local.getSourceBlock(), local);

  if (imConn == this.markerConnection_) {
    throw Error(
        'Made it to showInsertionMarker_ even though the marker isn\'t ' +
        'changing');
  }

  // Render disconnected from everything else so that we have a valid
  // connection location.
  imBlock.render();
  imBlock.rendered = true;
  imBlock.getSvgRoot().setAttribute('visibility', 'visible');

  if (imConn && closest) {
    // Position so that the existing block doesn't move.
    imBlock.positionNearConnection(imConn, closest);
  }
  if (closest) {
    // Connect() also renders the insertion marker.
    imConn.connect(closest);
  }

  this.markerConnection_ = imConn;
};

/**
 * Disconnects and hides the current insertion marker. Should return the blocks
 * to their original state.
 * @private
 */
InsertionMarkerManager.prototype.hideInsertionMarker_ = function() {
  if (!this.markerConnection_) {
    console.log('No insertion marker connection to disconnect');
    return;
  }

  const imConn = this.markerConnection_;
  const imBlock = imConn.getSourceBlock();
  const markerNext = imBlock.nextConnection;
  const markerPrev = imBlock.previousConnection;
  const markerOutput = imBlock.outputConnection;

  const isFirstInStatementStack =
      (imConn == markerNext && !(markerPrev && markerPrev.targetConnection));

  const isFirstInOutputStack = imConn.type == connectionTypes.INPUT_VALUE &&
      !(markerOutput && markerOutput.targetConnection);
  // The insertion marker is the first block in a stack.  Unplug won't do
  // anything in that case.  Instead, unplug the following block.
  if (isFirstInStatementStack || isFirstInOutputStack) {
    imConn.targetBlock().unplug(false);
  }
  // Inside of a C-block, first statement connection.
  else if (
      imConn.type == connectionTypes.NEXT_STATEMENT && imConn != markerNext) {
    const innerConnection = imConn.targetConnection;
    innerConnection.getSourceBlock().unplug(false);

    const previousBlockNextConnection =
        markerPrev ? markerPrev.targetConnection : null;

    imBlock.unplug(true);
    if (previousBlockNextConnection) {
      previousBlockNextConnection.connect(innerConnection);
    }
  } else {
    imBlock.unplug(true /* healStack */);
  }

  if (imConn.targetConnection) {
    throw Error(
        'markerConnection_ still connected at the end of ' +
        'disconnectInsertionMarker');
  }

  this.markerConnection_ = null;
  const svg = imBlock.getSvgRoot();
  if (svg) {
    svg.setAttribute('visibility', 'hidden');
  }
};

/**
 * Shows an outline around the input the closest connection belongs to.
 * @private
 */
InsertionMarkerManager.prototype.showInsertionInputOutline_ = function() {
  const closest = this.closestConnection_;
  this.highlightedBlock_ = closest.getSourceBlock();
  this.highlightedBlock_.highlightShapeForInput(closest, true);
};

/**
 * Hides any visible input outlines.
 * @private
 */
InsertionMarkerManager.prototype.hideInsertionInputOutline_ = function() {
  this.highlightedBlock_.highlightShapeForInput(this.closestConnection_, false);
  this.highlightedBlock_ = null;
};

/**
 * Shows a replacement fade affect on the closest connection's target block
 * (the block that is currently connected to it).
 * @private
 */
InsertionMarkerManager.prototype.showReplacementFade_ = function() {
  this.fadedBlock_ = this.closestConnection_.targetBlock();
  this.fadedBlock_.fadeForReplacement(true);
};

/**
 * Hides/Removes any visible fade affects.
 * @private
 */
InsertionMarkerManager.prototype.hideReplacementFade_ = function() {
  this.fadedBlock_.fadeForReplacement(false);
  this.fadedBlock_ = null;
};

/**
 * Get a list of the insertion markers that currently exist.  Drags have 0, 1,
 * or 2 insertion markers.
 * @return {!Array<!BlockSvg>} A possibly empty list of insertion
 *     marker blocks.
 * @package
 */
InsertionMarkerManager.prototype.getInsertionMarkers = function() {
  const result = [];
  if (this.firstMarker_) {
    result.push(this.firstMarker_);
  }
  if (this.lastMarker_) {
    result.push(this.lastMarker_);
  }
  return result;
};

exports = InsertionMarkerManager;
