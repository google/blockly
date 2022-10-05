/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * The class representing an in-progress gesture, usually a drag
 * or a tap.
 *
 * @class
 */
import * as goog from '../closure/goog/goog.js';
goog.declareModuleId('Blockly.Gesture');

// Unused import preserved for side-effects. Remove if unneeded.
import './events/events_click.js';

import * as blockAnimations from './block_animations.js';
import type {BlockSvg} from './block_svg.js';
import * as browserEvents from './browser_events.js';
import {BubbleDragger} from './bubble_dragger.js';
import * as common from './common.js';
import {config} from './config.js';
import * as eventUtils from './events/utils.js';
import type {Field} from './field.js';
import type {IBlockDragger} from './interfaces/i_block_dragger.js';
import type {IBubble} from './interfaces/i_bubble.js';
import type {IFlyout} from './interfaces/i_flyout.js';
import * as internalConstants from './internal_constants.js';
import * as registry from './registry.js';
import * as Tooltip from './tooltip.js';
import * as Touch from './touch.js';
import {Coordinate} from './utils/coordinate.js';
import {WorkspaceCommentSvg} from './workspace_comment_svg.js';
import {WorkspaceDragger} from './workspace_dragger.js';
import type {WorkspaceSvg} from './workspace_svg.js';


/**
 * Note: In this file "start" refers to touchstart, mousedown, and pointerstart
 * events.  "End" refers to touchend, mouseup, and pointerend events.
 */
// TODO: Consider touchcancel/pointercancel.
/**
 * Class for one gesture.
 *
 * @alias Blockly.Gesture
 */
export class Gesture {
  /**
   * The position of the mouse when the gesture started.  Units are CSS
   * pixels, with (0, 0) at the top left of the browser window (mouseEvent
   * clientX/Y).
   */
  private mouseDownXY_ = new Coordinate(0, 0);
  private currentDragDeltaXY_: Coordinate;

  /**
   * The bubble that the gesture started on, or null if it did not start on a
   * bubble.
   */
  private startBubble_: IBubble|null = null;

  /**
   * The field that the gesture started on, or null if it did not start on a
   * field.
   */
  private startField_: Field|null = null;

  /**
   * The block that the gesture started on, or null if it did not start on a
   * block.
   */
  private startBlock_: BlockSvg|null = null;

  /**
   * The block that this gesture targets.  If the gesture started on a
   * shadow block, this is the first non-shadow parent of the block.  If the
   * gesture started in the flyout, this is the root block of the block group
   * that was clicked or dragged.
   */
  private targetBlock_: BlockSvg|null = null;

  /**
   * The workspace that the gesture started on.  There may be multiple
   * workspaces on a page; this is more accurate than using
   * Blockly.common.getMainWorkspace().
   */
  protected startWorkspace_: WorkspaceSvg|null = null;

  /**
   * Whether the pointer has at any point moved out of the drag radius.
   * A gesture that exceeds the drag radius is a drag even if it ends exactly
   * at its start point.
   */
  private hasExceededDragRadius_ = false;

  /**
   * A handle to use to unbind a mouse move listener at the end of a drag.
   * Opaque data returned from Blockly.bindEventWithChecks_.
   */
  protected onMoveWrapper_: browserEvents.Data|null = null;

  /**
   * A handle to use to unbind a mouse up listener at the end of a drag.
   * Opaque data returned from Blockly.bindEventWithChecks_.
   */
  protected onUpWrapper_: browserEvents.Data|null = null;

  /** The object tracking a bubble drag, or null if none is in progress. */
  private bubbleDragger_: BubbleDragger|null = null;

  /** The object tracking a block drag, or null if none is in progress. */
  private blockDragger_: IBlockDragger|null = null;

  /**
   * The object tracking a workspace or flyout workspace drag, or null if none
   * is in progress.
   */
  private workspaceDragger_: WorkspaceDragger|null = null;

  /** The flyout a gesture started in, if any. */
  private flyout_: IFlyout|null = null;

  /** Boolean for sanity-checking that some code is only called once. */
  private calledUpdateIsDragging_ = false;

  /** Boolean for sanity-checking that some code is only called once. */
  private hasStarted_ = false;

  /** Boolean used internally to break a cycle in disposal. */
  protected isEnding_ = false;
  private healStack_: boolean;

  /** The event that most recently updated this gesture. */
  private mostRecentEvent_: Event;

  /**
   * @param e The event that kicked off this gesture.
   * @param creatorWorkspace The workspace that created this gesture and has a
   *     reference to it.
   */
  constructor(e: Event, private readonly creatorWorkspace: WorkspaceSvg) {
    this.mostRecentEvent_ = e;

    /**
     * How far the mouse has moved during this drag, in pixel units.
     * (0, 0) is at this.mouseDownXY_.
     */
    this.currentDragDeltaXY_ = new Coordinate(0, 0);

    /**
     * Boolean used to indicate whether or not to heal the stack after
     * disconnecting a block.
     */
    this.healStack_ = !internalConstants.DRAG_STACK;
  }

  /**
   * Sever all links from this object.
   *
   * @internal
   */
  dispose() {
    Touch.clearTouchIdentifier();
    Tooltip.unblock();
    // Clear the owner's reference to this gesture.
    this.creatorWorkspace.clearGesture();

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
  }

  /**
   * Update internal state based on an event.
   *
   * @param e The most recent mouse or touch event.
   */
  private updateFromEvent_(e: Event) {
    // AnyDuringMigration because:  Property 'clientY' does not exist on type
    // 'Event'. AnyDuringMigration because:  Property 'clientX' does not exist
    // on type 'Event'.
    const currentXY = new Coordinate(
        (e as AnyDuringMigration).clientX, (e as AnyDuringMigration).clientY);
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
   *
   * @param currentXY The most recent mouse/pointer position, in pixel units,
   *     with (0, 0) at the window's top left corner.
   * @returns True if the drag just exceeded the drag radius for the first time.
   */
  private updateDragDelta_(currentXY: Coordinate): boolean {
    this.currentDragDeltaXY_ =
        Coordinate.difference(currentXY, (this.mouseDownXY_));

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
   *
   * @returns True if a block is being dragged from the flyout.
   */
  private updateIsDraggingFromFlyout_(): boolean {
    if (!this.targetBlock_ ||
        !this.flyout_?.isBlockCreatable(this.targetBlock_)) {
      return false;
    }
    if (!this.flyout_.targetWorkspace) {
      throw new Error(`Cannot update dragging from the flyout because the ' +
          'flyout's target workspace is undefined`);
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
   *
   * @returns True if a bubble is being dragged.
   */
  private updateIsDraggingBubble_(): boolean {
    if (!this.startBubble_) {
      return false;
    }

    this.startDraggingBubble_();
    return true;
  }

  /**
   * Check whether to start a block drag. If a block should be dragged, either
   * from the flyout or in the workspace, create the necessary BlockDragger and
   * start the drag.
   *
   * This function should be called on a mouse/touch move event the first time
   * the drag radius is exceeded.  It should be called no more than once per
   * gesture. If a block should be dragged, either from the flyout or in the
   * workspace, this function creates the necessary BlockDragger and starts the
   * drag.
   *
   * @returns True if a block is being dragged.
   */
  private updateIsDraggingBlock_(): boolean {
    if (!this.targetBlock_) {
      return false;
    }
    if (this.flyout_) {
      if (this.updateIsDraggingFromFlyout_()) {
        this.startDraggingBlock_();
        return true;
      }
    } else if (this.targetBlock_.isMovable()) {
      this.startDraggingBlock_();
      return true;
    }
    return false;
  }

  /**
   * Check whether to start a workspace drag. If a workspace is being dragged,
   * create the necessary WorkspaceDragger and start the drag.
   *
   * This function should be called on a mouse/touch move event the first time
   * the drag radius is exceeded.  It should be called no more than once per
   * gesture. If a workspace is being dragged this function creates the
   * necessary WorkspaceDragger and starts the drag.
   */
  private updateIsDraggingWorkspace_() {
    if (!this.startWorkspace_) {
      throw new Error(
          'Cannot update dragging the workspace because the ' +
          'start workspace is undefined');
    }

    const wsMovable = this.flyout_ ?
        this.flyout_.isScrollable() :
        this.startWorkspace_ && this.startWorkspace_.isDraggable();
    if (!wsMovable) return;

    this.workspaceDragger_ = new WorkspaceDragger(this.startWorkspace_);

    this.workspaceDragger_.startDrag();
  }

  /**
   * Update this gesture to record whether anything is being dragged.
   * This function should be called on a mouse/touch move event the first time
   * the drag radius is exceeded.  It should be called no more than once per
   * gesture.
   */
  private updateIsDragging_() {
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

  /** Create a block dragger and start dragging the selected block. */
  private startDraggingBlock_() {
    const BlockDraggerClass = registry.getClassFromOptions(
        registry.Type.BLOCK_DRAGGER, this.creatorWorkspace.options, true);

    this.blockDragger_ =
        new BlockDraggerClass!((this.targetBlock_), (this.startWorkspace_));
    this.blockDragger_!.startDrag(this.currentDragDeltaXY_, this.healStack_);
    this.blockDragger_!.drag(this.mostRecentEvent_, this.currentDragDeltaXY_);
  }

  // TODO (fenichel): Possibly combine this and startDraggingBlock_.
  /** Create a bubble dragger and start dragging the selected bubble. */
  private startDraggingBubble_() {
    if (!this.startBubble_) {
      throw new Error(
          'Cannot update dragging the bubble because the start ' +
          'bubble is undefined');
    }
    if (!this.startWorkspace_) {
      throw new Error(
          'Cannot update dragging the bubble because the start ' +
          'workspace is undefined');
    }

    this.bubbleDragger_ =
        new BubbleDragger(this.startBubble_, this.startWorkspace_);
    this.bubbleDragger_.startBubbleDrag();
    this.bubbleDragger_.dragBubble(
        this.mostRecentEvent_, this.currentDragDeltaXY_);
  }

  /**
   * Start a gesture: update the workspace to indicate that a gesture is in
   * progress and bind mousemove and mouseup handlers.
   *
   * @param e A mouse down or touch start event.
   * @internal
   */
  doStart(e: MouseEvent) {
    if (browserEvents.isTargetInput(e)) {
      this.cancel();
      return;
    }

    if (!this.startWorkspace_) {
      throw new Error(
          'Cannot start the gesture because the start ' +
          'workspace is undefined');
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

    // TODO(#6097): Make types accurate, possibly by refactoring touch handling.
    const typelessEvent = e as AnyDuringMigration;
    if ((e.type.toLowerCase() === 'touchstart' ||
         e.type.toLowerCase() === 'pointerdown') &&
        typelessEvent.pointerType !== 'mouse') {
      Touch.longStart(typelessEvent, this);
    }

    // AnyDuringMigration because:  Property 'clientY' does not exist on type
    // 'Event'. AnyDuringMigration because:  Property 'clientX' does not exist
    // on type 'Event'.
    this.mouseDownXY_ = new Coordinate(
        (e as AnyDuringMigration).clientX, (e as AnyDuringMigration).clientY);
    // AnyDuringMigration because:  Property 'metaKey' does not exist on type
    // 'Event'. AnyDuringMigration because:  Property 'ctrlKey' does not exist
    // on type 'Event'. AnyDuringMigration because:  Property 'altKey' does not
    // exist on type 'Event'.
    this.healStack_ = (e as AnyDuringMigration).altKey ||
        (e as AnyDuringMigration).ctrlKey || (e as AnyDuringMigration).metaKey;

    this.bindMouseEvents(e);
  }

  /**
   * Bind gesture events.
   *
   * @param e A mouse down or touch start event.
   * @internal
   */
  bindMouseEvents(e: Event) {
    this.onMoveWrapper_ = browserEvents.conditionalBind(
        document, 'mousemove', null, this.handleMove.bind(this));
    this.onUpWrapper_ = browserEvents.conditionalBind(
        document, 'mouseup', null, this.handleUp.bind(this));

    e.preventDefault();
    e.stopPropagation();
  }

  /**
   * Handle a mouse move or touch move event.
   *
   * @param e A mouse move or touch move event.
   * @internal
   */
  handleMove(e: Event) {
    this.updateFromEvent_(e);
    if (this.workspaceDragger_) {
      this.workspaceDragger_.drag(this.currentDragDeltaXY_);
    } else if (this.blockDragger_) {
      this.blockDragger_.drag(this.mostRecentEvent_, this.currentDragDeltaXY_);
    } else if (this.bubbleDragger_) {
      this.bubbleDragger_.dragBubble(
          this.mostRecentEvent_, this.currentDragDeltaXY_);
    }
    e.preventDefault();
    e.stopPropagation();
  }

  /**
   * Handle a mouse up or touch end event.
   *
   * @param e A mouse up or touch end event.
   * @internal
   */
  handleUp(e: Event) {
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
    if (this.bubbleDragger_) {
      this.bubbleDragger_.endBubbleDrag(e, this.currentDragDeltaXY_);
    } else if (this.blockDragger_) {
      this.blockDragger_.endDrag(e, this.currentDragDeltaXY_);
    } else if (this.workspaceDragger_) {
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
   *
   * @internal
   */
  cancel() {
    // Disposing of a block cancels in-progress drags, but dragging to a delete
    // area disposes of a block and leads to recursive disposal. Break that
    // cycle.
    if (this.isEnding_) {
      return;
    }
    Touch.longStop();
    if (this.bubbleDragger_) {
      this.bubbleDragger_.endBubbleDrag(
          this.mostRecentEvent_, this.currentDragDeltaXY_);
    } else if (this.blockDragger_) {
      this.blockDragger_.endDrag(
          this.mostRecentEvent_, this.currentDragDeltaXY_);
    } else if (this.workspaceDragger_) {
      this.workspaceDragger_.endDrag(this.currentDragDeltaXY_);
    }
    this.dispose();
  }

  /**
   * Handle a real or faked right-click event by showing a context menu.
   *
   * @param e A mouse move or touch move event.
   * @internal
   */
  handleRightClick(e: Event) {
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
   *
   * @param e A mouse down or touch start event.
   * @param ws The workspace the event hit.
   * @internal
   */
  handleWsStart(e: MouseEvent, ws: WorkspaceSvg) {
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
   *
   * @param ws The workspace that a user clicks on.
   */
  private fireWorkspaceClick_(ws: WorkspaceSvg) {
    eventUtils.fire(
        new (eventUtils.get(eventUtils.CLICK))(null, ws.id, 'workspace'));
  }

  /**
   * Handle a mousedown/touchstart event on a flyout.
   *
   * @param e A mouse down or touch start event.
   * @param flyout The flyout the event hit.
   * @internal
   */
  handleFlyoutStart(e: MouseEvent, flyout: IFlyout) {
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
   *
   * @param e A mouse down or touch start event.
   * @param block The block the event hit.
   * @internal
   */
  handleBlockStart(e: Event, block: BlockSvg) {
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
   *
   * @param e A mouse down or touch start event.
   * @param bubble The bubble the event hit.
   * @internal
   */
  handleBubbleStart(e: Event, bubble: IBubble) {
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

  /** Execute a bubble click. */
  private doBubbleClick_() {
    // TODO (#1673): Consistent handling of single clicks.
    if (this.startBubble_ instanceof WorkspaceCommentSvg) {
      this.startBubble_.setFocus();
      this.startBubble_.select();
    }
  }

  /** Execute a field click. */
  private doFieldClick_() {
    if (!this.startField_) {
      throw new Error(
          'Cannot do a field click because the start field is ' +
          'undefined');
    }
    this.startField_.showEditor(this.mostRecentEvent_);
    this.bringBlockToFront_();
  }

  /** Execute a block click. */
  private doBlockClick_() {
    // Block click in an autoclosing flyout.
    if (this.flyout_ && this.flyout_.autoClose) {
      if (!this.targetBlock_) {
        throw new Error(
            'Cannot do a block click because the target block is ' +
            'undefined');
      }
      if (this.targetBlock_.isEnabled()) {
        if (!eventUtils.getGroup()) {
          eventUtils.setGroup(true);
        }
        const newBlock = this.flyout_.createBlock(this.targetBlock_);
        newBlock.scheduleSnapAndBump();
      }
    } else {
      if (!this.startWorkspace_) {
        throw new Error(
            'Cannot do a block click because the start workspace ' +
            'is undefined');
      }
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
   *
   * @param _e A mouse up or touch end event.
   */
  private doWorkspaceClick_(_e: Event) {
    const ws = this.creatorWorkspace;
    if (common.getSelected()) {
      common.getSelected()!.unselect();
    }
    this.fireWorkspaceClick_(this.startWorkspace_ || ws);
  }

  /* End functions defining what actions to take to execute clicks on each type
   * of target. */

  // TODO (fenichel): Move bubbles to the front.

  /**
   * Move the dragged/clicked block to the front of the workspace so that it is
   * not occluded by other blocks.
   */
  private bringBlockToFront_() {
    // Blocks in the flyout don't overlap, so skip the work.
    if (this.targetBlock_ && !this.flyout_) {
      this.targetBlock_.bringToFront();
    }
  }

  /* Begin functions for populating a gesture at mouse down. */

  /**
   * Record the field that a gesture started on.
   *
   * @param field The field the gesture started on.
   * @internal
   */
  setStartField(field: Field) {
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
   *
   * @param bubble The bubble the gesture started on.
   * @internal
   */
  setStartBubble(bubble: IBubble) {
    if (!this.startBubble_) {
      this.startBubble_ = bubble;
    }
  }

  /**
   * Record the block that a gesture started on, and set the target block
   * appropriately.
   *
   * @param block The block the gesture started on.
   * @internal
   */
  setStartBlock(block: BlockSvg) {
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
   *
   * @param block The block the gesture targets.
   */
  private setTargetBlock_(block: BlockSvg) {
    if (block.isShadow()) {
      // Non-null assertion is fine b/c it is an invariant that shadows always
      // have parents.
      this.setTargetBlock_(block.getParent()!);
    } else {
      this.targetBlock_ = block;
    }
  }

  /**
   * Record the workspace that a gesture started on.
   *
   * @param ws The workspace the gesture started on.
   */
  private setStartWorkspace_(ws: WorkspaceSvg) {
    if (!this.startWorkspace_) {
      this.startWorkspace_ = ws;
    }
  }

  /**
   * Record the flyout that a gesture started on.
   *
   * @param flyout The flyout the gesture started on.
   */
  private setStartFlyout_(flyout: IFlyout) {
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
   *
   * @returns Whether this gesture was a click on a bubble.
   */
  private isBubbleClick_(): boolean {
    // A bubble click starts on a bubble and never escapes the drag radius.
    const hasStartBubble = !!this.startBubble_;
    return hasStartBubble && !this.hasExceededDragRadius_;
  }

  /**
   * Whether this gesture is a click on a block.  This should only be called
   * when ending a gesture (mouse up, touch end).
   *
   * @returns Whether this gesture was a click on a block.
   */
  private isBlockClick_(): boolean {
    // A block click starts on a block, never escapes the drag radius, and is
    // not a field click.
    const hasStartBlock = !!this.startBlock_;
    return hasStartBlock && !this.hasExceededDragRadius_ &&
        !this.isFieldClick_();
  }

  /**
   * Whether this gesture is a click on a field.  This should only be called
   * when ending a gesture (mouse up, touch end).
   *
   * @returns Whether this gesture was a click on a field.
   */
  private isFieldClick_(): boolean {
    const fieldClickable =
        this.startField_ ? this.startField_.isClickable() : false;
    return fieldClickable && !this.hasExceededDragRadius_ &&
        (!this.flyout_ || !this.flyout_.autoClose);
  }

  /**
   * Whether this gesture is a click on a workspace.  This should only be called
   * when ending a gesture (mouse up, touch end).
   *
   * @returns Whether this gesture was a click on a workspace.
   */
  private isWorkspaceClick_(): boolean {
    const onlyTouchedWorkspace =
        !this.startBlock_ && !this.startBubble_ && !this.startField_;
    return onlyTouchedWorkspace && !this.hasExceededDragRadius_;
  }

  /* End helper functions defining types of clicks. */

  /**
   * Whether this gesture is a drag of either a workspace or block.
   * This function is called externally to block actions that cannot be taken
   * mid-drag (e.g. using the keyboard to delete the selected blocks).
   *
   * @returns True if this gesture is a drag of a workspace or block.
   * @internal
   */
  isDragging(): boolean {
    return !!this.workspaceDragger_ || !!this.blockDragger_ ||
        !!this.bubbleDragger_;
  }

  /**
   * Whether this gesture has already been started.  In theory every mouse down
   * has a corresponding mouse up, but in reality it is possible to lose a
   * mouse up, leaving an in-process gesture hanging.
   *
   * @returns Whether this gesture was a click on a workspace.
   * @internal
   */
  hasStarted(): boolean {
    return this.hasStarted_;
  }

  /**
   * Get a list of the insertion markers that currently exist.  Block drags have
   * 0, 1, or 2 insertion markers.
   *
   * @returns A possibly empty list of insertion marker blocks.
   * @internal
   */
  getInsertionMarkers(): BlockSvg[] {
    if (this.blockDragger_) {
      return this.blockDragger_.getInsertionMarkers();
    }
    return [];
  }

  /**
   * Gets the current dragger if an item is being dragged. Null if nothing is
   * being dragged.
   *
   * @returns The dragger that is currently in use or null if no drag is in
   *     progress.
   */
  getCurrentDragger(): WorkspaceDragger|BubbleDragger|IBlockDragger|null {
    return this.blockDragger_ ?? this.workspaceDragger_ ?? this.bubbleDragger_;
  }

  /**
   * Is a drag or other gesture currently in progress on any workspace?
   *
   * @returns True if gesture is occurring.
   */
  static inProgress(): boolean {
    const workspaces = common.getAllWorkspaces();
    for (let i = 0, workspace; workspace = workspaces[i]; i++) {
      // Not actually necessarily a WorkspaceSvg, but it doesn't matter b/c
      // we're just checking if the property exists. Theoretically we would
      // want to use instanceof, but that causes a circular dependency.
      if ((workspace as WorkspaceSvg).currentGesture_) {
        return true;
      }
    }
    return false;
  }
}
