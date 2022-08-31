/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * The class extends Gesture to support pinch to zoom
 * for both pointer and touch events.
 *
 * @class
 */
import * as goog from '../closure/goog/goog.js';
goog.declareModuleId('Blockly.TouchGesture');

import * as browserEvents from './browser_events.js';
import {Gesture} from './gesture.js';
import * as Touch from './touch.js';
import {Coordinate} from './utils/coordinate.js';

/*
 * Note: In this file "start" refers to touchstart, mousedown, and pointerstart
 * events.  "End" refers to touchend, mouseup, and pointerend events.
 */

/** A multiplier used to convert the gesture scale to a zoom in delta. */
const ZOOM_IN_MULTIPLIER = 5;

/** A multiplier used to convert the gesture scale to a zoom out delta. */
const ZOOM_OUT_MULTIPLIER = 6;

/**
 * Class for one gesture.
 *
 * @alias Blockly.TouchGesture
 */
export class TouchGesture extends Gesture {
  /** Boolean for whether or not this gesture is a multi-touch gesture. */
  private isMultiTouch_ = false;

  /** A map of cached points used for tracking multi-touch gestures. */
  private cachedPoints = new Map<string, Coordinate|null>();

  /**
   * This is the ratio between the starting distance between the touch points
   * and the most recent distance between the touch points.
   * Scales between 0 and 1 mean the most recent zoom was a zoom out.
   * Scales above 1.0 mean the most recent zoom was a zoom in.
   */
  private previousScale_ = 0;

  /** The starting distance between two touch points. */
  private startDistance_ = 0;

  /**
   * A handle to use to unbind the second touch start or pointer down listener
   * at the end of a drag.
   * Opaque data returned from Blockly.bindEventWithChecks_.
   */
  private onStartWrapper_: browserEvents.Data|null = null;

  /** Boolean for whether or not the workspace supports pinch-zoom. */
  private isPinchZoomEnabled_: boolean|null = null;
  override onMoveWrapper_: browserEvents.Data|null = null;
  override onUpWrapper_: browserEvents.Data|null = null;

  /**
   * Start a gesture: update the workspace to indicate that a gesture is in
   * progress and bind mousemove and mouseup handlers.
   *
   * @param e A mouse down, touch start or pointer down event.
   * @internal
   */
  override doStart(e: MouseEvent) {
    if (!this.startWorkspace_) {
      throw new Error(
          'Cannot start the touch event becauase the start ' +
          'workspace is undefined');
    }
    this.isPinchZoomEnabled_ = this.startWorkspace_.options.zoomOptions &&
        this.startWorkspace_.options.zoomOptions.pinch;
    super.doStart(e);
    if (!this.isEnding_ && Touch.isTouchEvent(e)) {
      this.handleTouchStart(e);
    }
  }

  /**
   * Bind gesture events.
   * Overriding the gesture definition of this function, binding the same
   * functions for onMoveWrapper_ and onUpWrapper_ but passing
   * opt_noCaptureIdentifier.
   * In addition, binding a second mouse down event to detect multi-touch
   * events.
   *
   * @param e A mouse down or touch start event.
   * @internal
   */
  override bindMouseEvents(e: Event) {
    this.onStartWrapper_ = browserEvents.conditionalBind(
        document, 'mousedown', null, this.handleStart.bind(this),
        /* opt_noCaptureIdentifier */ true);
    this.onMoveWrapper_ = browserEvents.conditionalBind(
        document, 'mousemove', null, this.handleMove.bind(this),
        /* opt_noCaptureIdentifier */ true);
    this.onUpWrapper_ = browserEvents.conditionalBind(
        document, 'mouseup', null, this.handleUp.bind(this),
        /* opt_noCaptureIdentifier */ true);

    e.preventDefault();
    e.stopPropagation();
  }

  /**
   * Handle a mouse down, touch start, or pointer down event.
   *
   * @param e A mouse down, touch start, or pointer down event.
   * @internal
   */
  handleStart(e: Event) {
    if (this.isDragging()) {
      // A drag has already started, so this can no longer be a pinch-zoom.
      return;
    }
    if (Touch.isTouchEvent(e)) {
      this.handleTouchStart(e);

      if (this.isMultiTouch()) {
        Touch.longStop();
      }
    }
  }

  /**
   * Handle a mouse move, touch move, or pointer move event.
   *
   * @param e A mouse move, touch move, or pointer move event.
   * @internal
   */
  override handleMove(e: MouseEvent) {
    if (this.isDragging()) {
      // We are in the middle of a drag, only handle the relevant events
      if (Touch.shouldHandleEvent(e)) {
        super.handleMove(e);
      }
      return;
    }
    if (this.isMultiTouch()) {
      if (Touch.isTouchEvent(e)) {
        this.handleTouchMove(e);
      }
      Touch.longStop();
    } else {
      super.handleMove(e);
    }
  }

  /**
   * Handle a mouse up, touch end, or pointer up event.
   *
   * @param e A mouse up, touch end, or pointer up event.
   * @internal
   */
  override handleUp(e: Event) {
    if (Touch.isTouchEvent(e) && !this.isDragging()) {
      this.handleTouchEnd(e);
    }
    if (!this.isMultiTouch() || this.isDragging()) {
      if (!Touch.shouldHandleEvent(e)) {
        return;
      }
      super.handleUp(e);
    } else {
      e.preventDefault();
      e.stopPropagation();

      this.dispose();
    }
  }

  /**
   * Whether this gesture is part of a multi-touch gesture.
   *
   * @returns Whether this gesture is part of a multi-touch gesture.
   * @internal
   */
  isMultiTouch(): boolean {
    return this.isMultiTouch_;
  }

  /**
   * Sever all links from this object.
   *
   * @internal
   */
  override dispose() {
    super.dispose();

    if (this.onStartWrapper_) {
      browserEvents.unbind(this.onStartWrapper_);
    }
  }

  /**
   * Handle a touch start or pointer down event and keep track of current
   * pointers.
   *
   * @param e A touch start, or pointer down event.
   * @internal
   */
  handleTouchStart(e: Event) {
    const pointerId = Touch.getTouchIdentifierFromEvent(e);
    // store the pointerId in the current list of pointers
    this.cachedPoints.set(pointerId, this.getTouchPoint(e));
    const pointers = Array.from(this.cachedPoints.keys());
    // If two pointers are down, store info
    if (pointers.length === 2) {
      const point0 = (this.cachedPoints.get(pointers[0]))!;
      const point1 = (this.cachedPoints.get(pointers[1]))!;
      this.startDistance_ = Coordinate.distance(point0, point1);
      this.isMultiTouch_ = true;
      e.preventDefault();
    }
  }

  /**
   * Handle a touch move or pointer move event and zoom in/out if two pointers
   * are on the screen.
   *
   * @param e A touch move, or pointer move event.
   * @internal
   */
  handleTouchMove(e: MouseEvent) {
    const pointerId = Touch.getTouchIdentifierFromEvent(e);
    // Update the cache
    this.cachedPoints.set(pointerId, this.getTouchPoint(e));

    if (this.isPinchZoomEnabled_ && this.cachedPoints.size === 2) {
      this.handlePinch_(e);
    } else {
      super.handleMove(e);
    }
  }

  /**
   * Handle pinch zoom gesture.
   *
   * @param e A touch move, or pointer move event.
   */
  private handlePinch_(e: MouseEvent) {
    const pointers = Array.from(this.cachedPoints.keys());
    // Calculate the distance between the two pointers
    const point0 = (this.cachedPoints.get(pointers[0]))!;
    const point1 = (this.cachedPoints.get(pointers[1]))!;
    const moveDistance = Coordinate.distance(point0, point1);
    const scale = moveDistance / this.startDistance_;

    if (this.previousScale_ > 0 && this.previousScale_ < Infinity) {
      const gestureScale = scale - this.previousScale_;
      const delta = gestureScale > 0 ? gestureScale * ZOOM_IN_MULTIPLIER :
                                       gestureScale * ZOOM_OUT_MULTIPLIER;
      if (!this.startWorkspace_) {
        throw new Error(
            'Cannot handle a pinch because the start workspace ' +
            'is undefined');
      }
      const workspace = this.startWorkspace_;
      const position = browserEvents.mouseToSvg(
          e, workspace.getParentSvg(), workspace.getInverseScreenCTM());
      workspace.zoom(position.x, position.y, delta);
    }
    this.previousScale_ = scale;
    e.preventDefault();
  }

  /**
   * Handle a touch end or pointer end event and end the gesture.
   *
   * @param e A touch end, or pointer end event.
   * @internal
   */
  handleTouchEnd(e: Event) {
    const pointerId = Touch.getTouchIdentifierFromEvent(e);
    if (this.cachedPoints.has(pointerId)) {
      this.cachedPoints.delete(pointerId);
    }
    if (this.cachedPoints.size < 2) {
      this.cachedPoints.clear();
      this.previousScale_ = 0;
    }
  }

  /**
   * Helper function returning the current touch point coordinate.
   *
   * @param e A touch or pointer event.
   * @returns The current touch point coordinate
   * @internal
   */
  getTouchPoint(e: Event): Coordinate|null {
    if (!this.startWorkspace_) {
      return null;
    }
    // TODO(#6097): Make types accurate, possibly by refactoring touch handling.
    const typelessEvent = e as AnyDuringMigration;
    return new Coordinate(
        typelessEvent.changedTouches ? typelessEvent.changedTouches[0].pageX :
                                       typelessEvent.pageX,
        typelessEvent.changedTouches ? typelessEvent.changedTouches[0].pageY :
                                       typelessEvent.pageY);
  }
}
