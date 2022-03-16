/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Methods for dragging a block visually.
 */
'use strict';

/**
 * Methods for dragging a block visually.
 * @class
 */
goog.module('Blockly.BlockDragger');

const blockAnimation = goog.require('Blockly.blockAnimations');
const bumpObjects = goog.require('Blockly.bumpObjects');
const common = goog.require('Blockly.common');
const dom = goog.require('Blockly.utils.dom');
const eventUtils = goog.require('Blockly.Events.utils');
const registry = goog.require('Blockly.registry');
/* eslint-disable-next-line no-unused-vars */
const {BlockMove} = goog.requireType('Blockly.Events.BlockMove');
/* eslint-disable-next-line no-unused-vars */
const {BlockSvg} = goog.requireType('Blockly.BlockSvg');
const {Coordinate} = goog.require('Blockly.utils.Coordinate');
/* eslint-disable-next-line no-unused-vars */
const {IBlockDragger} = goog.require('Blockly.IBlockDragger');
/* eslint-disable-next-line no-unused-vars */
const {IDragTarget} = goog.requireType('Blockly.IDragTarget');
const {InsertionMarkerManager} = goog.require('Blockly.InsertionMarkerManager');
/* eslint-disable-next-line no-unused-vars */
const {WorkspaceSvg} = goog.requireType('Blockly.WorkspaceSvg');
/** @suppress {extraRequire} */
goog.require('Blockly.Events.BlockDrag');
/** @suppress {extraRequire} */
goog.require('Blockly.Events.BlockMove');


/**
 * Class for a block dragger.  It moves blocks around the workspace when they
 * are being dragged by a mouse or touch.
 * @implements {IBlockDragger}
 * @alias Blockly.BlockDragger
 */
const BlockDragger = class {
  /**
   * @param {!BlockSvg} block The block to drag.
   * @param {!WorkspaceSvg} workspace The workspace to drag on.
   */
  constructor(block, workspace) {
    /**
     * The top block in the stack that is being dragged.
     * @type {!BlockSvg}
     * @protected
     */
    this.draggingBlock_ = block;

    /**
     * The workspace on which the block is being dragged.
     * @type {!WorkspaceSvg}
     * @protected
     */
    this.workspace_ = workspace;

    /**
     * Object that keeps track of connections on dragged blocks.
     * @type {!InsertionMarkerManager}
     * @protected
     */
    this.draggedConnectionManager_ =
        new InsertionMarkerManager(this.draggingBlock_);

    /**
     * Which drag area the mouse pointer is over, if any.
     * @type {?IDragTarget}
     * @private
     */
    this.dragTarget_ = null;

    /**
     * Whether the block would be deleted if dropped immediately.
     * @type {boolean}
     * @protected
     */
    this.wouldDeleteBlock_ = false;

    /**
     * The location of the top left corner of the dragging block at the
     * beginning of the drag in workspace coordinates.
     * @type {!Coordinate}
     * @protected
     */
    this.startXY_ = this.draggingBlock_.getRelativeToSurfaceXY();

    /**
     * A list of all of the icons (comment, warning, and mutator) that are
     * on this block and its descendants.  Moving an icon moves the bubble that
     * extends from it if that bubble is open.
     * @type {Array<!Object>}
     * @protected
     */
    this.dragIconData_ = initIconData(block);
  }

  /**
   * Sever all links from this object.
   * @package
   */
  dispose() {
    this.dragIconData_.length = 0;

    if (this.draggedConnectionManager_) {
      this.draggedConnectionManager_.dispose();
    }
  }

  /**
   * Start dragging a block.  This includes moving it to the drag surface.
   * @param {!Coordinate} currentDragDeltaXY How far the pointer has
   *     moved from the position at mouse down, in pixel units.
   * @param {boolean} healStack Whether or not to heal the stack after
   *     disconnecting.
   * @public
   */
  startDrag(currentDragDeltaXY, healStack) {
    if (!eventUtils.getGroup()) {
      eventUtils.setGroup(true);
    }
    this.fireDragStartEvent_();

    // Mutators don't have the same type of z-ordering as the normal workspace
    // during a drag.  They have to rely on the order of the blocks in the SVG.
    // For performance reasons that usually happens at the end of a drag,
    // but do it at the beginning for mutators.
    if (this.workspace_.isMutator) {
      this.draggingBlock_.bringToFront();
    }

    // During a drag there may be a lot of rerenders, but not field changes.
    // Turn the cache on so we don't do spurious remeasures during the drag.
    dom.startTextWidthCache();
    this.workspace_.setResizesEnabled(false);
    blockAnimation.disconnectUiStop();

    if (this.shouldDisconnect_(healStack)) {
      this.disconnectBlock_(healStack, currentDragDeltaXY);
    }
    this.draggingBlock_.setDragging(true);
    // For future consideration: we may be able to put moveToDragSurface inside
    // the block dragger, which would also let the block not track the block
    // drag surface.
    this.draggingBlock_.moveToDragSurface();
  }

  /**
   * Whether or not we should disconnect the block when a drag is started.
   * @param {boolean} healStack Whether or not to heal the stack after
   *     disconnecting.
   * @return {boolean} True to disconnect the block, false otherwise.
   * @protected
   */
  shouldDisconnect_(healStack) {
    return !!(
        this.draggingBlock_.getParent() ||
        (healStack && this.draggingBlock_.nextConnection &&
         this.draggingBlock_.nextConnection.targetBlock()));
  }

  /**
   * Disconnects the block and moves it to a new location.
   * @param {boolean} healStack Whether or not to heal the stack after
   *     disconnecting.
   * @param {!Coordinate} currentDragDeltaXY How far the pointer has
   *     moved from the position at mouse down, in pixel units.
   * @protected
   */
  disconnectBlock_(healStack, currentDragDeltaXY) {
    this.draggingBlock_.unplug(healStack);
    const delta = this.pixelsToWorkspaceUnits_(currentDragDeltaXY);
    const newLoc = Coordinate.sum(this.startXY_, delta);

    this.draggingBlock_.translate(newLoc.x, newLoc.y);
    blockAnimation.disconnectUiEffect(this.draggingBlock_);
    this.draggedConnectionManager_.updateAvailableConnections();
  }

  /**
   * Fire a UI event at the start of a block drag.
   * @protected
   */
  fireDragStartEvent_() {
    const event = new (eventUtils.get(eventUtils.BLOCK_DRAG))(
        this.draggingBlock_, true, this.draggingBlock_.getDescendants(false));
    eventUtils.fire(event);
  }

  /**
   * Execute a step of block dragging, based on the given event.  Update the
   * display accordingly.
   * @param {!Event} e The most recent move event.
   * @param {!Coordinate} currentDragDeltaXY How far the pointer has
   *     moved from the position at the start of the drag, in pixel units.
   * @public
   */
  drag(e, currentDragDeltaXY) {
    const delta = this.pixelsToWorkspaceUnits_(currentDragDeltaXY);
    const newLoc = Coordinate.sum(this.startXY_, delta);
    this.draggingBlock_.moveDuringDrag(newLoc);
    this.dragIcons_(delta);

    const oldDragTarget = this.dragTarget_;
    this.dragTarget_ = this.workspace_.getDragTarget(e);

    this.draggedConnectionManager_.update(delta, this.dragTarget_);
    const oldWouldDeleteBlock = this.wouldDeleteBlock_;
    this.wouldDeleteBlock_ = this.draggedConnectionManager_.wouldDeleteBlock();
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
   * @param {!Event} e The mouseup/touchend event.
   * @param {!Coordinate} currentDragDeltaXY How far the pointer has
   *     moved from the position at the start of the drag, in pixel units.
   * @public
   */
  endDrag(e, currentDragDeltaXY) {
    // Make sure internal state is fresh.
    this.drag(e, currentDragDeltaXY);
    this.dragIconData_ = [];
    this.fireDragEndEvent_();

    dom.stopTextWidthCache();

    blockAnimation.disconnectUiStop();

    const preventMove = !!this.dragTarget_ &&
        this.dragTarget_.shouldPreventMove(this.draggingBlock_);
    /** @type {Coordinate} */
    let newLoc;
    /** @type {Coordinate} */
    let delta;
    if (preventMove) {
      newLoc = this.startXY_;
    } else {
      const newValues = this.getNewLocationAfterDrag_(currentDragDeltaXY);
      delta = newValues.delta;
      newLoc = newValues.newLocation;
    }
    this.draggingBlock_.moveOffDragSurface(newLoc);

    if (this.dragTarget_) {
      this.dragTarget_.onDrop(this.draggingBlock_);
    }

    const deleted = this.maybeDeleteBlock_();
    if (!deleted) {
      // These are expensive and don't need to be done if we're deleting.
      this.draggingBlock_.setDragging(false);
      if (delta) {  // !preventMove
        this.updateBlockAfterMove_(delta);
      } else {
        // Blocks dragged directly from a flyout may need to be bumped into
        // bounds.
        bumpObjects.bumpIntoBounds(
            this.draggingBlock_.workspace,
            this.workspace_.getMetricsManager().getScrollMetrics(true),
            this.draggingBlock_);
      }
    }
    this.workspace_.setResizesEnabled(true);

    eventUtils.setGroup(false);
  }

  /**
   * Calculates the drag delta and new location values after a block is dragged.
   * @param {!Coordinate} currentDragDeltaXY How far the pointer has
   *     moved from the start of the drag, in pixel units.
   * @return {{delta: !Coordinate, newLocation:
   *     !Coordinate}} New location after drag. delta is in
   *     workspace units. newLocation is the new coordinate where the block
   * should end up.
   * @protected
   */
  getNewLocationAfterDrag_(currentDragDeltaXY) {
    const newValues = {};
    newValues.delta = this.pixelsToWorkspaceUnits_(currentDragDeltaXY);
    newValues.newLocation = Coordinate.sum(this.startXY_, newValues.delta);
    return newValues;
  }

  /**
   * May delete the dragging block, if allowed. If `this.wouldDeleteBlock_` is
   * not true, the block will not be deleted. This should be called at the end
   * of a block drag.
   * @return {boolean} True if the block was deleted.
   * @protected
   */
  maybeDeleteBlock_() {
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
   * @param {!Coordinate} delta The change in location from where
   *     the block started the drag to where it ended the drag.
   * @protected
   */
  updateBlockAfterMove_(delta) {
    this.draggingBlock_.moveConnections(delta.x, delta.y);
    this.fireMoveEvent_();
    if (this.draggedConnectionManager_.wouldConnectBlock()) {
      // Applying connections also rerenders the relevant blocks.
      this.draggedConnectionManager_.applyConnections();
    } else {
      this.draggingBlock_.render();
    }
    this.draggingBlock_.scheduleSnapAndBump();
  }

  /**
   * Fire a UI event at the end of a block drag.
   * @protected
   */
  fireDragEndEvent_() {
    const event = new (eventUtils.get(eventUtils.BLOCK_DRAG))(
        this.draggingBlock_, false, this.draggingBlock_.getDescendants(false));
    eventUtils.fire(event);
  }

  /**
   * Adds or removes the style of the cursor for the toolbox.
   * This is what changes the cursor to display an x when a deletable block is
   * held over the toolbox.
   * @param {boolean} isEnd True if we are at the end of a drag, false
   *     otherwise.
   * @protected
   */
  updateToolboxStyle_(isEnd) {
    const toolbox = this.workspace_.getToolbox();

    if (toolbox) {
      const style = this.draggingBlock_.isDeletable() ? 'blocklyToolboxDelete' :
                                                        'blocklyToolboxGrab';

      if (isEnd && typeof toolbox.removeStyle === 'function') {
        toolbox.removeStyle(style);
      } else if (!isEnd && typeof toolbox.addStyle === 'function') {
        toolbox.addStyle(style);
      }
    }
  }

  /**
   * Fire a move event at the end of a block drag.
   * @protected
   */
  fireMoveEvent_() {
    const event = /** @type {!BlockMove} */
        (new (eventUtils.get(eventUtils.BLOCK_MOVE))(this.draggingBlock_));
    event.oldCoordinate = this.startXY_;
    event.recordNew();
    eventUtils.fire(event);
  }

  /**
   * Update the cursor (and possibly the trash can lid) to reflect whether the
   * dragging block would be deleted if released immediately.
   * @protected
   */
  updateCursorDuringBlockDrag_() {
    this.draggingBlock_.setDeleteStyle(this.wouldDeleteBlock_);
  }

  /**
   * Convert a coordinate object from pixels to workspace units, including a
   * correction for mutator workspaces.
   * This function does not consider differing origins.  It simply scales the
   * input's x and y values.
   * @param {!Coordinate} pixelCoord A coordinate with x and y
   *     values in CSS pixel units.
   * @return {!Coordinate} The input coordinate divided by the
   *     workspace scale.
   * @protected
   */
  pixelsToWorkspaceUnits_(pixelCoord) {
    const result = new Coordinate(
        pixelCoord.x / this.workspace_.scale,
        pixelCoord.y / this.workspace_.scale);
    if (this.workspace_.isMutator) {
      // If we're in a mutator, its scale is always 1, purely because of some
      // oddities in our rendering optimizations.  The actual scale is the same
      // as the scale on the parent workspace. Fix that for dragging.
      const mainScale = this.workspace_.options.parentWorkspace.scale;
      result.scale(1 / mainScale);
    }
    return result;
  }

  /**
   * Move all of the icons connected to this drag.
   * @param {!Coordinate} dxy How far to move the icons from their
   *     original positions, in workspace units.
   * @protected
   */
  dragIcons_(dxy) {
    // Moving icons moves their associated bubbles.
    for (let i = 0; i < this.dragIconData_.length; i++) {
      const data = this.dragIconData_[i];
      data.icon.setIconLocation(Coordinate.sum(data.location, dxy));
    }
  }

  /**
   * Get a list of the insertion markers that currently exist.  Drags have 0, 1,
   * or 2 insertion markers.
   * @return {!Array<!BlockSvg>} A possibly empty list of insertion
   *     marker blocks.
   * @public
   */
  getInsertionMarkers() {
    // No insertion markers with the old style of dragged connection managers.
    if (this.draggedConnectionManager_ &&
        this.draggedConnectionManager_.getInsertionMarkers) {
      return this.draggedConnectionManager_.getInsertionMarkers();
    }
    return [];
  }
};

/**
 * Make a list of all of the icons (comment, warning, and mutator) that are
 * on this block and its descendants.  Moving an icon moves the bubble that
 * extends from it if that bubble is open.
 * @param {!BlockSvg} block The root block that is being dragged.
 * @return {!Array<!Object>} The list of all icons and their locations.
 */
const initIconData = function(block) {
  // Build a list of icons that need to be moved and where they started.
  const dragIconData = [];
  const descendants =
      /** @type {!Array<!BlockSvg>} */ (block.getDescendants(false));

  for (let i = 0, descendant; (descendant = descendants[i]); i++) {
    const icons = descendant.getIcons();
    for (let j = 0; j < icons.length; j++) {
      const data = {
        // Coordinate with x and y properties (workspace
        // coordinates).
        location: icons[j].getIconLocation(),
        // Blockly.Icon
        icon: icons[j],
      };
      dragIconData.push(data);
    }
  }
  return dragIconData;
};

registry.register(registry.Type.BLOCK_DRAGGER, registry.DEFAULT, BlockDragger);

exports.BlockDragger = BlockDragger;
