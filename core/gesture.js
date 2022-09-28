/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview The class representing an in-progress gesture, usually a drag
 * or a tap.
 */
'use strict';

/**
 * The class representing an in-progress gesture, usually a drag
 * or a tap.
 * @class
 */
goog.module('Blockly.Gesture');

const Tooltip = goog.require('Blockly.Tooltip');
const Touch = goog.require('Blockly.Touch');
const blockAnimations = goog.require('Blockly.blockAnimations');
const browserEvents = goog.require('Blockly.browserEvents');
const common = goog.require('Blockly.common');
const eventUtils = goog.require('Blockly.Events.utils');
const internalConstants = goog.require('Blockly.internalConstants');
const registry = goog.require('Blockly.registry');
/* eslint-disable-next-line no-unused-vars */
const {BlockSvg} = goog.requireType('Blockly.BlockSvg');
const {BubbleDragger} = goog.require('Blockly.BubbleDragger');
const {config} = goog.require('Blockly.config');
const {Coordinate} = goog.require('Blockly.utils.Coordinate');
/* eslint-disable-next-line no-unused-vars */
const {Field} = goog.requireType('Blockly.Field');
/* eslint-disable-next-line no-unused-vars */
const {IBlockDragger} = goog.requireType('Blockly.IBlockDragger');
/* eslint-disable-next-line no-unused-vars */
const {IBubble} = goog.requireType('Blockly.IBubble');
/* eslint-disable-next-line no-unused-vars */
const {IFlyout} = goog.requireType('Blockly.IFlyout');
const {WorkspaceDragger} = goog.require('Blockly.WorkspaceDragger');
/* eslint-disable-next-line no-unused-vars */
const {WorkspaceSvg} = goog.requireType('Blockly.WorkspaceSvg');
const {Workspace} = goog.require('Blockly.Workspace');
/** @suppress {extraRequire} */
goog.require('Blockly.BlockDragger');
/** @suppress {extraRequire} */
goog.require('Blockly.Events.Click');


/**
 * Note: In this file "start" refers to touchstart, mousedown, and pointerstart
 * events.  "End" refers to touchend, mouseup, and pointerend events.
 */
// TODO: Consider touchcancel/pointercancel.

/**
 * Class for one gesture.
 * @alias Blockly.Gesture
 */
class Gesture {
  /**
   * @param {!Event} e The event that kicked off this gesture.
   * @param {!WorkspaceSvg} creatorWorkspace The workspace that created
   *     this gesture and has a reference to it.
   */
  constructor(e, creatorWorkspace) {
    /**
     * The position of the mouse when the gesture started.  Units are CSS
     * pixels, with (0, 0) at the top left of the browser window (mouseEvent
     * clientX/Y).
     * @type {Coordinate}
     * @private
     */
    this.mouseDownXY_ = null;

    /**
     * How far the mouse has moved during this drag, in pixel units.
     * (0, 0) is at this.mouseDownXY_.
     * @type {!Coordinate}
     * @private
     */
    this.currentDragDeltaXY_ = new Coordinate(0, 0);

    /**
     * The bubble that the gesture started on, or null if it did not start on a
     * bubble.
     * @type {IBubble}
     * @private
     */
    this.startBubble_ = null;

    /**
     * The field that the gesture started on, or null if it did not start on a
     * field.
     * @type {Field}
     * @private
     */
    this.startField_ = null;

    /**
     * The block that the gesture started on, or null if it did not start on a
     * block.
     * @type {BlockSvg}
     * @private
     */
    this.startBlock_ = null;

    /**
     * The block that this gesture targets.  If the gesture started on a
     * shadow block, this is the first non-shadow parent of the block.  If the
     * gesture started in the flyout, this is the root block of the block group
     * that was clicked or dragged.
     * @type {BlockSvg}
     * @private
     */
    this.targetBlock_ = null;

    /**
     * The workspace that the gesture started on.  There may be multiple
     * workspaces on a page; this is more accurate than using
     * Blockly.common.getMainWorkspace().
     * @type {WorkspaceSvg}
     * @protected
     */
    this.startWorkspace_ = null;

    /**
     * The workspace that created this gesture.  This workspace keeps a
     * reference to the gesture, which will need to be cleared at deletion. This
     * may be different from the start workspace.  For instance, a flyout is a
     * workspace, but its parent workspace manages gestures for it.
     * @type {!WorkspaceSvg}
     * @private
     */
    this.creatorWorkspace_ = creatorWorkspace;

    /**
     * Whether the pointer has at any point moved out of the drag radius.
     * A gesture that exceeds the drag radius is a drag even if it ends exactly
     * at its start point.
     * @type {boolean}
     * @private
     */
    this.hasExceededDragRadius_ = false;

    /**
     * Whether the workspace is currently being dragged.
     * @type {boolean}
     * @private
     */
    this.isDraggingWorkspace_ = false;

    /**
     * Whether the block is currently being dragged.
     * @type {boolean}
     * @private
     */
    this.isDraggingBlock_ = false;

    /**
     * Whether the bubble is currently being dragged.
     * @type {boolean}
     * @private
     */
    this.isDraggingBubble_ = false;

    /**
     * The event that most recently updated this gesture.
     * @type {!Event}
     * @private
     */
    this.mostRecentEvent_ = e;

    /**
     * A handle to use to unbind a mouse move listener at the end of a drag.
     * Opaque data returned from Blockly.bindEventWithChecks_.
     * @type {?browserEvents.Data}
     * @protected
     */
    this.onMoveWrapper_ = null;

    /**
     * A handle to use to unbind a mouse up listener at the end of a drag.
     * Opaque data returned from Blockly.bindEventWithChecks_.
     * @type {?browserEvents.Data}
     * @protected
     */
    this.onUpWrapper_ = null;

    /**
     * The object tracking a bubble drag, or null if none is in progress.
     * @type {BubbleDragger}
     * @private
     */
    this.bubbleDragger_ = null;

    /**
     * The object tracking a block drag, or null if none is in progress.
     * @type {?IBlockDragger}
     * @private
     */
    this.blockDragger_ = null;

    /**
     * The object tracking a workspace or flyout workspace drag, or null if none
     * is in progress.
     * @type {WorkspaceDragger}
     * @private
     */
    this.workspaceDragger_ = null;

    /**
     * The flyout a gesture started in, if any.
     * @type {IFlyout}
     * @private
     */
    this.flyout_ = null;

    /**
     * Boolean for sanity-checking that some code is only called once.
     * @type {boolean}
     * @private
     */
    this.calledUpdateIsDragging_ = false;

    /**
     * Boolean for sanity-checking that some code is only called once.
     * @type {boolean}
     * @private
     */
    this.hasStarted_ = false;

    /**
     * Boolean used internally to break a cycle in disposal.
     * @type {boolean}
     * @protected
     */
    this.isEnding_ = false;

    /**
     * Boolean used to indicate whether or not to heal the stack after
     * disconnecting a block.
     * @type {boolean}
     * @private
     */
    this.healStack_ = !internalConstants.DRAG_STACK;
  }

  /**
   * Sever all links from this object.
   * @package
   */
  dispose() {
    Touch.clearTouchIdentifier();
    Tooltip.unblock();
    // Clear the owner's reference to this gesture.
    this.creatorWorkspace_.clearGesture();

    if (this.onMoveWrapper_) {
      browserEvents.unbind(this.onMoveWrapper_);
    }
    if (this.onUpWrapper_) {
      browserEvents.unbind(this.onUpWrapper_);
    }

    if (this.blockDragger_) {
      this.blockDragger_.dispose();
    }
    if (this.workspaceDragger_) {
      this.workspaceDragger_.dispose();
    }
    if (this.bubbleDragger_) {
      this.bubbleDragger_.dispose();
    }
  }

  /**
   * Update internal state based on an event.
   * @param {!Event} e The most recent mouse or touch event.
   * @private
   */
  updateFromEvent_(e) {
    const currentXY = new Coordinate(e.clientX, e.clientY);
    const changed = this.updateDragDelta_(currentXY);
    // Exceeded the drag radius for the first time.
    if (changed) {
      this.updateIsDragging_();
      Touch.longStop();
    }
    this.mostRecentEvent_ = e;
  }

  /**
   * DO MATH to set currentDragDeltaXY_ based on the most recent mouse position.
   * @param {!Coordinate} currentXY The most recent mouse/pointer
   *     position, in pixel units, with (0, 0) at the window's top left corner.
   * @return {boolean} True if the drag just exceeded the drag radius for the
   *     first time.
   * @private
   */
  updateDragDelta_(currentXY) {
    this.currentDragDeltaXY_ = Coordinate.difference(
        currentXY,
        /** @type {!Coordinate} */ (this.mouseDownXY_));

    if (!this.hasExceededDragRadius_) {
      const currentDragDelta = Coordinate.magnitude(this.currentDragDeltaXY_);

      // The flyout has a different drag radius from the rest of Blockly.
      const limitRadius =
          this.flyout_ ? config.flyoutDragRadius : config.dragRadius;

      this.hasExceededDragRadius_ = currentDragDelta > limitRadius;
      return this.hasExceededDragRadius_;
    }
    return false;
  }

  /**
   * Update this gesture to record whether a block is being dragged from the
   * flyout.
   * This function should be called on a mouse/touch move event the first time
   * the drag radius is exceeded.  It should be called no more than once per
   * gesture. If a block should be dragged from the flyout this function creates
   * the new block on the main workspace and updates targetBlock_ and
   * startWorkspace_.
   * @return {boolean} True if a block is being dragged from the flyout.
   * @private
   */
  updateIsDraggingFromFlyout_() {
    if (!this.targetBlock_) {
      return false;
    }
    if (!this.flyout_.isBlockCreatable_(this.targetBlock_)) {
      return false;
    }
    if (!this.flyout_.isScrollable() ||
        this.flyout_.isDragTowardWorkspace(this.currentDragDeltaXY_)) {
      this.startWorkspace_ = this.flyout_.targetWorkspace;
      this.startWorkspace_.updateScreenCalculationsIfScrolled();
      // Start the event group now, so that the same event group is used for
      // block creation and block dragging.
      if (!eventUtils.getGroup()) {
        eventUtils.setGroup(true);
      }
      // The start block is no longer relevant, because this is a drag.
      this.startBlock_ = null;
      this.targetBlock_ = this.flyout_.createBlock(this.targetBlock_);
      this.targetBlock_.select();
      return true;
    }
    return false;
  }

  /**
   * Update this gesture to record whether a bubble is being dragged.
   * This function should be called on a mouse/touch move event the first time
   * the drag radius is exceeded.  It should be called no more than once per
   * gesture. If a bubble should be dragged this function creates the necessary
   * BubbleDragger and starts the drag.
   * @return {boolean} True if a bubble is being dragged.
   * @private
   */
  updateIsDraggingBubble_() {
    if (!this.startBubble_) {
      return false;
    }

    this.isDraggingBubble_ = true;
    this.startDraggingBubble_();
    return true;
  }

  /**
   * Update this gesture to record whether a block is being dragged.
   * This function should be called on a mouse/touch move event the first time
   * the drag radius is exceeded.  It should be called no more than once per
   * gesture. If a block should be dragged, either from the flyout or in the
   * workspace, this function creates the necessary BlockDragger and starts the
   * drag.
   * @return {boolean} True if a block is being dragged.
   * @private
   */
  updateIsDraggingBlock_() {
    if (!this.targetBlock_) {
      return false;
    }

    if (this.flyout_) {
      this.isDraggingBlock_ = this.updateIsDraggingFromFlyout_();
    } else if (this.targetBlock_.isMovable()) {
      this.isDraggingBlock_ = true;
    }

    if (this.isDraggingBlock_) {
      this.startDraggingBlock_();
      return true;
    }
    return false;
  }

  /**
   * Update this gesture to record whether a workspace is being dragged.
   * This function should be called on a mouse/touch move event the first time
   * the drag radius is exceeded.  It should be called no more than once per
   * gesture. If a workspace is being dragged this function creates the
   * necessary WorkspaceDragger and starts the drag.
   * @private
   */
  updateIsDraggingWorkspace_() {
    const wsMovable = this.flyout_ ?
        this.flyout_.isScrollable() :
        this.startWorkspace_ && this.startWorkspace_.isDraggable();

    if (!wsMovable) {
      return;
    }

    this.workspaceDragger_ = new WorkspaceDragger(
        /** @type {!WorkspaceSvg} */ (this.startWorkspace_));

    this.isDraggingWorkspace_ = true;
    this.workspaceDragger_.startDrag();
  }

  /**
   * Update this gesture to record whether anything is being dragged.
   * This function should be called on a mouse/touch move event the first time
   * the drag radius is exceeded.  It should be called no more than once per
   * gesture.
   * @private
   */
  updateIsDragging_() {
    // Sanity check.
    if (this.calledUpdateIsDragging_) {
      throw Error('updateIsDragging_ should only be called once per gesture.');
    }
    this.calledUpdateIsDragging_ = true;

    // First check if it was a bubble drag.  Bubbles always sit on top of
    // blocks.
    if (this.updateIsDraggingBubble_()) {
      return;
    }
    // Then check if it was a block drag.
    if (this.updateIsDraggingBlock_()) {
      return;
    }
    // Then check if it's a workspace drag.
    this.updateIsDraggingWorkspace_();
  }

  /**
   * Create a block dragger and start dragging the selected block.
   * @private
   */
  startDraggingBlock_() {
    const BlockDraggerClass = registry.getClassFromOptions(
        registry.Type.BLOCK_DRAGGER, this.creatorWorkspace_.options, true);

    this.blockDragger_ = new BlockDraggerClass(
        /** @type {!BlockSvg} */ (this.targetBlock_),
        /** @type {!WorkspaceSvg} */ (this.startWorkspace_));
    this.blockDragger_.startDrag(this.currentDragDeltaXY_, this.healStack_);
    this.blockDragger_.drag(this.mostRecentEvent_, this.currentDragDeltaXY_);
  }

  // TODO (fenichel): Possibly combine this and startDraggingBlock_.
  /**
   * Create a bubble dragger and start dragging the selected bubble.
   * @private
   */
  startDraggingBubble_() {
    this.bubbleDragger_ = new BubbleDragger(
        /** @type {!IBubble} */ (this.startBubble_),
        /** @type {!WorkspaceSvg} */ (this.startWorkspace_));
    this.bubbleDragger_.startBubbleDrag();
    this.bubbleDragger_.dragBubble(
        this.mostRecentEvent_, this.currentDragDeltaXY_);
  }

  /**
   * Start a gesture: update the workspace to indicate that a gesture is in
   * progress and bind mousemove and mouseup handlers.
   * @param {!Event} e A mouse down or touch start event.
   * @package
   */
  doStart(e) {
    if (browserEvents.isTargetInput(e)) {
      this.cancel();
      return;
    }
    this.hasStarted_ = true;

    blockAnimations.disconnectUiStop();
    this.startWorkspace_.updateScreenCalculationsIfScrolled();
    if (this.startWorkspace_.isMutator) {
      // Mutator's coordinate system could be out of date because the bubble was
      // dragged, the block was moved, the parent workspace zoomed, etc.
      this.startWorkspace_.resize();
    }

    // Hide chaff also hides the flyout, so don't do it if the click is in a
    // flyout.
    this.startWorkspace_.hideChaff(!!this.flyout_);

    this.startWorkspace_.markFocused();
    this.mostRecentEvent_ = e;

    Tooltip.block();

    if (this.targetBlock_) {
      this.targetBlock_.select();
    }

    if (browserEvents.isRightButton(e)) {
      this.handleRightClick(e);
      return;
    }

    if ((e.type.toLowerCase() === 'touchstart' ||
         e.type.toLowerCase() === 'pointerdown') &&
        e.pointerType !== 'mouse') {
      Touch.longStart(e, this);
    }

    this.mouseDownXY_ = new Coordinate(e.clientX, e.clientY);
    this.healStack_ = e.altKey || e.ctrlKey || e.metaKey;

    this.bindMouseEvents(e);
  }

  /**
   * Bind gesture events.
   * @param {!Event} e A mouse down or touch start event.
   * @package
   */
  bindMouseEvents(e) {
    this.onMoveWrapper_ = browserEvents.conditionalBind(
        document, 'mousemove', null, this.handleMove.bind(this));
    this.onUpWrapper_ = browserEvents.conditionalBind(
        document, 'mouseup', null, this.handleUp.bind(this));

    e.preventDefault();
    e.stopPropagation();
  }

  /**
   * Handle a mouse move or touch move event.
   * @param {!Event} e A mouse move or touch move event.
   * @package
   */
  handleMove(e) {
    this.updateFromEvent_(e);
    if (this.isDraggingWorkspace_) {
      this.workspaceDragger_.drag(this.currentDragDeltaXY_);
    } else if (this.isDraggingBlock_) {
      this.blockDragger_.drag(this.mostRecentEvent_, this.currentDragDeltaXY_);
    } else if (this.isDraggingBubble_) {
      this.bubbleDragger_.dragBubble(
          this.mostRecentEvent_, this.currentDragDeltaXY_);
    }
    e.preventDefault();
    e.stopPropagation();
  }

  /**
   * Handle a mouse up or touch end event.
   * @param {!Event} e A mouse up or touch end event.
   * @package
   */
  handleUp(e) {
    this.updateFromEvent_(e);
    Touch.longStop();

    if (this.isEnding_) {
      console.log('Trying to end a gesture recursively.');
      return;
    }
    this.isEnding_ = true;
    // The ordering of these checks is important: drags have higher priority
    // than clicks.  Fields have higher priority than blocks; blocks have higher
    // priority than workspaces.
    // The ordering within drags does not matter, because the three types of
    // dragging are exclusive.
    if (this.isDraggingBubble_) {
      this.bubbleDragger_.endBubbleDrag(e, this.currentDragDeltaXY_);
    } else if (this.isDraggingBlock_) {
      this.blockDragger_.endDrag(e, this.currentDragDeltaXY_);
    } else if (this.isDraggingWorkspace_) {
      this.workspaceDragger_.endDrag(this.currentDragDeltaXY_);
    } else if (this.isBubbleClick_()) {
      // Bubbles are in front of all fields and blocks.
      this.doBubbleClick_();
    } else if (this.isFieldClick_()) {
      this.doFieldClick_();
    } else if (this.isBlockClick_()) {
      this.doBlockClick_();
    } else if (this.isWorkspaceClick_()) {
      this.doWorkspaceClick_(e);
    }

    e.preventDefault();
    e.stopPropagation();

    this.dispose();
  }

  /**
   * Cancel an in-progress gesture.  If a workspace or block drag is in
   * progress, end the drag at the most recent location.
   * @package
   */
  cancel() {
    // Disposing of a block cancels in-progress drags, but dragging to a delete
    // area disposes of a block and leads to recursive disposal. Break that
    // cycle.
    if (this.isEnding_) {
      return;
    }
    Touch.longStop();
    if (this.isDraggingBubble_) {
      this.bubbleDragger_.endBubbleDrag(
          this.mostRecentEvent_, this.currentDragDeltaXY_);
    } else if (this.isDraggingBlock_) {
      this.blockDragger_.endDrag(
          this.mostRecentEvent_, this.currentDragDeltaXY_);
    } else if (this.isDraggingWorkspace_) {
      this.workspaceDragger_.endDrag(this.currentDragDeltaXY_);
    }
    this.dispose();
  }

  /**
   * Handle a real or faked right-click event by showing a context menu.
   * @param {!Event} e A mouse move or touch move event.
   * @package
   */
  handleRightClick(e) {
    if (this.targetBlock_) {
      this.bringBlockToFront_();
      this.targetBlock_.workspace.hideChaff(!!this.flyout_);
      this.targetBlock_.showContextMenu(e);
    } else if (this.startBubble_) {
      this.startBubble_.showContextMenu(e);
    } else if (this.startWorkspace_ && !this.flyout_) {
      this.startWorkspace_.hideChaff();
      this.startWorkspace_.showContextMenu(e);
    }

    // TODO: Handle right-click on a bubble.
    e.preventDefault();
    e.stopPropagation();

    this.dispose();
  }

  /**
   * Handle a mousedown/touchstart event on a workspace.
   * @param {!Event} e A mouse down or touch start event.
   * @param {!WorkspaceSvg} ws The workspace the event hit.
   * @package
   */
  handleWsStart(e, ws) {
    if (this.hasStarted_) {
      throw Error(
          'Tried to call gesture.handleWsStart, ' +
          'but the gesture had already been started.');
    }
    this.setStartWorkspace_(ws);
    this.mostRecentEvent_ = e;
    this.doStart(e);
  }

  /**
   * Fires a workspace click event.
   * @param {!WorkspaceSvg} ws The workspace that a user clicks on.
   * @private
   */
  fireWorkspaceClick_(ws) {
    eventUtils.fire(
        new (eventUtils.get(eventUtils.CLICK))(null, ws.id, 'workspace'));
  }

  /**
   * Handle a mousedown/touchstart event on a flyout.
   * @param {!Event} e A mouse down or touch start event.
   * @param {!IFlyout} flyout The flyout the event hit.
   * @package
   */
  handleFlyoutStart(e, flyout) {
    if (this.hasStarted_) {
      throw Error(
          'Tried to call gesture.handleFlyoutStart, ' +
          'but the gesture had already been started.');
    }
    this.setStartFlyout_(flyout);
    this.handleWsStart(e, flyout.getWorkspace());
  }

  /**
   * Handle a mousedown/touchstart event on a block.
   * @param {!Event} e A mouse down or touch start event.
   * @param {!BlockSvg} block The block the event hit.
   * @package
   */
  handleBlockStart(e, block) {
    if (this.hasStarted_) {
      throw Error(
          'Tried to call gesture.handleBlockStart, ' +
          'but the gesture had already been started.');
    }
    this.setStartBlock(block);
    this.mostRecentEvent_ = e;
  }

  /**
   * Handle a mousedown/touchstart event on a bubble.
   * @param {!Event} e A mouse down or touch start event.
   * @param {!IBubble} bubble The bubble the event hit.
   * @package
   */
  handleBubbleStart(e, bubble) {
    if (this.hasStarted_) {
      throw Error(
          'Tried to call gesture.handleBubbleStart, ' +
          'but the gesture had already been started.');
    }
    this.setStartBubble(bubble);
    this.mostRecentEvent_ = e;
  }

  /* Begin functions defining what actions to take to execute clicks on each
   * type of target.  Any developer wanting to add behaviour on clicks should
   * modify only this code. */

  /**
   * Execute a bubble click.
   * @private
   */
  doBubbleClick_() {
    // TODO (#1673): Consistent handling of single clicks.
    this.startBubble_.setFocus && this.startBubble_.setFocus();
    this.startBubble_.select && this.startBubble_.select();
  }

  /**
   * Execute a field click.
   * @private
   */
  doFieldClick_() {
    this.startField_.showEditor(this.mostRecentEvent_);
    this.bringBlockToFront_();
  }

  /**
   * Execute a block click.
   * @private
   */
  doBlockClick_() {
    // Block click in an autoclosing flyout.
    if (this.flyout_ && this.flyout_.autoClose) {
      if (this.targetBlock_.isEnabled()) {
        if (!eventUtils.getGroup()) {
          eventUtils.setGroup(true);
        }
        const newBlock = this.flyout_.createBlock(this.targetBlock_);
        newBlock.scheduleSnapAndBump();
      }
    } else {
      // Clicks events are on the start block, even if it was a shadow.
      const event = new (eventUtils.get(eventUtils.CLICK))(
          this.startBlock_, this.startWorkspace_.id, 'block');
      eventUtils.fire(event);
    }
    this.bringBlockToFront_();
    eventUtils.setGroup(false);
  }

  /**
   * Execute a workspace click. When in accessibility mode shift clicking will
   * move the cursor.
   * @param {!Event} _e A mouse up or touch end event.
   * @private
   */
  doWorkspaceClick_(_e) {
    const ws = this.creatorWorkspace_;
    if (common.getSelected()) {
      common.getSelected().unselect();
    }
    this.fireWorkspaceClick_(this.startWorkspace_ || ws);
  }

  /* End functions defining what actions to take to execute clicks on each type
   * of target. */

  // TODO (fenichel): Move bubbles to the front.

  /**
   * Move the dragged/clicked block to the front of the workspace so that it is
   * not occluded by other blocks.
   * @private
   */
  bringBlockToFront_() {
    // Blocks in the flyout don't overlap, so skip the work.
    if (this.targetBlock_ && !this.flyout_) {
      this.targetBlock_.bringToFront();
    }
  }

  /* Begin functions for populating a gesture at mouse down. */

  /**
   * Record the field that a gesture started on.
   * @param {Field} field The field the gesture started on.
   * @package
   */
  setStartField(field) {
    if (this.hasStarted_) {
      throw Error(
          'Tried to call gesture.setStartField, ' +
          'but the gesture had already been started.');
    }
    if (!this.startField_) {
      this.startField_ = field;
    }
  }

  /**
   * Record the bubble that a gesture started on
   * @param {IBubble} bubble The bubble the gesture started on.
   * @package
   */
  setStartBubble(bubble) {
    if (!this.startBubble_) {
      this.startBubble_ = bubble;
    }
  }

  /**
   * Record the block that a gesture started on, and set the target block
   * appropriately.
   * @param {BlockSvg} block The block the gesture started on.
   * @package
   */
  setStartBlock(block) {
    // If the gesture already went through a bubble, don't set the start block.
    if (!this.startBlock_ && !this.startBubble_) {
      this.startBlock_ = block;
      if (block.isInFlyout && block !== block.getRootBlock()) {
        this.setTargetBlock_(block.getRootBlock());
      } else {
        this.setTargetBlock_(block);
      }
    }
  }

  /**
   * Record the block that a gesture targets, meaning the block that will be
   * dragged if this turns into a drag.  If this block is a shadow, that will be
   * its first non-shadow parent.
   * @param {BlockSvg} block The block the gesture targets.
   * @private
   */
  setTargetBlock_(block) {
    if (block.isShadow()) {
      this.setTargetBlock_(block.getParent());
    } else {
      this.targetBlock_ = block;
    }
  }

  /**
   * Record the workspace that a gesture started on.
   * @param {WorkspaceSvg} ws The workspace the gesture started on.
   * @private
   */
  setStartWorkspace_(ws) {
    if (!this.startWorkspace_) {
      this.startWorkspace_ = ws;
    }
  }

  /**
   * Record the flyout that a gesture started on.
   * @param {IFlyout} flyout The flyout the gesture started on.
   * @private
   */
  setStartFlyout_(flyout) {
    if (!this.flyout_) {
      this.flyout_ = flyout;
    }
  }

  /* End functions for populating a gesture at mouse down. */

  /* Begin helper functions defining types of clicks.  Any developer wanting
   * to change the definition of a click should modify only this code. */

  /**
   * Whether this gesture is a click on a bubble.  This should only be called
   * when ending a gesture (mouse up, touch end).
   * @return {boolean} Whether this gesture was a click on a bubble.
   * @private
   */
  isBubbleClick_() {
    // A bubble click starts on a bubble and never escapes the drag radius.
    const hasStartBubble = !!this.startBubble_;
    return hasStartBubble && !this.hasExceededDragRadius_;
  }

  /**
   * Whether this gesture is a click on a block.  This should only be called
   * when ending a gesture (mouse up, touch end).
   * @return {boolean} Whether this gesture was a click on a block.
   * @private
   */
  isBlockClick_() {
    // A block click starts on a block, never escapes the drag radius, and is
    // not a field click.
    const hasStartBlock = !!this.startBlock_;
    return hasStartBlock && !this.hasExceededDragRadius_ &&
        !this.isFieldClick_();
  }

  /**
   * Whether this gesture is a click on a field.  This should only be called
   * when ending a gesture (mouse up, touch end).
   * @return {boolean} Whether this gesture was a click on a field.
   * @private
   */
  isFieldClick_() {
    const fieldClickable =
        this.startField_ ? this.startField_.isClickable() : false;
    return fieldClickable && !this.hasExceededDragRadius_ &&
        (!this.flyout_ || !this.flyout_.autoClose);
  }

  /**
   * Whether this gesture is a click on a workspace.  This should only be called
   * when ending a gesture (mouse up, touch end).
   * @return {boolean} Whether this gesture was a click on a workspace.
   * @private
   */
  isWorkspaceClick_() {
    const onlyTouchedWorkspace =
        !this.startBlock_ && !this.startBubble_ && !this.startField_;
    return onlyTouchedWorkspace && !this.hasExceededDragRadius_;
  }

  /* End helper functions defining types of clicks. */

  /**
   * Whether this gesture is a drag of either a workspace or block.
   * This function is called externally to block actions that cannot be taken
   * mid-drag (e.g. using the keyboard to delete the selected blocks).
   * @return {boolean} True if this gesture is a drag of a workspace or block.
   * @package
   */
  isDragging() {
    return this.isDraggingWorkspace_ || this.isDraggingBlock_ ||
        this.isDraggingBubble_;
  }

  /**
   * Whether this gesture has already been started.  In theory every mouse down
   * has a corresponding mouse up, but in reality it is possible to lose a
   * mouse up, leaving an in-process gesture hanging.
   * @return {boolean} Whether this gesture was a click on a workspace.
   * @package
   */
  hasStarted() {
    return this.hasStarted_;
  }

  /**
   * Get a list of the insertion markers that currently exist.  Block drags have
   * 0, 1, or 2 insertion markers.
   * @return {!Array<!BlockSvg>} A possibly empty list of insertion
   *     marker blocks.
   * @package
   */
  getInsertionMarkers() {
    if (this.blockDragger_) {
      return this.blockDragger_.getInsertionMarkers();
    }
    return [];
  }

  /**
   * Gets the current dragger if an item is being dragged. Null if nothing is
   * being dragged.
   * @return {!WorkspaceDragger|!BubbleDragger|!IBlockDragger|null}
   *    The dragger that is currently in use or null if no drag is in progress.
   */
  getCurrentDragger() {
    if (this.isDraggingBlock_) {
      return this.blockDragger_;
    } else if (this.isDraggingWorkspace_) {
      return this.workspaceDragger_;
    } else if (this.isDraggingBubble_) {
      return this.bubbleDragger_;
    }
    return null;
  }

  /**
   * Is a drag or other gesture currently in progress on any workspace?
   * @return {boolean} True if gesture is occurring.
   */
  static inProgress() {
    const workspaces = Workspace.getAll();
    for (let i = 0, workspace; (workspace = workspaces[i]); i++) {
      // Not actually necessarily a WorkspaceSvg, but it doesn't matter b/c
      // we're just checking if the property exists. Theoretically we would
      // want to use instanceof, but that causes a circular dependency.
      if (/** @type {!WorkspaceSvg} */ (workspace).currentGesture_) {
        return true;
      }
    }
    return false;
  }
}

exports.Gesture = Gesture;
