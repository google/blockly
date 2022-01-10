/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview The class extends Gesture to support pinch to zoom
 * for both pointer and touch events.
 */
'use strict';

/**
 * The class extends Gesture to support pinch to zoom
 * for both pointer and touch events.
 * @class
 */
goog.module('Blockly.TouchGesture');

const Touch = goog.require('Blockly.Touch');
const browserEvents = goog.require('Blockly.browserEvents');
const object = goog.require('Blockly.utils.object');
const {Coordinate} = goog.require('Blockly.utils.Coordinate');
const {Gesture} = goog.require('Blockly.Gesture');
/* eslint-disable-next-line no-unused-vars */
const {WorkspaceSvg} = goog.requireType('Blockly.WorkspaceSvg');


/*
 * Note: In this file "start" refers to touchstart, mousedown, and pointerstart
 * events.  "End" refers to touchend, mouseup, and pointerend events.
 */

/**
 * Class for one gesture.
 * @param {!Event} e The event that kicked off this gesture.
 * @param {!WorkspaceSvg} creatorWorkspace The workspace that created
 *     this gesture and has a reference to it.
 * @extends {Gesture}
 * @constructor
 * @alias Blockly.TouchGesture
 */
const TouchGesture = function(e, creatorWorkspace) {
  TouchGesture.superClass_.constructor.call(this, e, creatorWorkspace);

  /**
   * Boolean for whether or not this gesture is a multi-touch gesture.
   * @type {boolean}
   * @private
   */
  this.isMultiTouch_ = false;

  /**
   * A map of cached points used for tracking multi-touch gestures.
   * @type {!Object<number|string, Coordinate>}
   * @private
   */
  this.cachedPoints_ = Object.create(null);

  /**
   * This is the ratio between the starting distance between the touch points
   * and the most recent distance between the touch points.
   * Scales between 0 and 1 mean the most recent zoom was a zoom out.
   * Scales above 1.0 mean the most recent zoom was a zoom in.
   * @type {number}
   * @private
   */
  this.previousScale_ = 0;

  /**
   * The starting distance between two touch points.
   * @type {number}
   * @private
   */
  this.startDistance_ = 0;

  /**
   * A handle to use to unbind the second touch start or pointer down listener
   * at the end of a drag.
   * Opaque data returned from Blockly.bindEventWithChecks_.
   * @type {?browserEvents.Data}
   * @private
   */
  this.onStartWrapper_ = null;

  /**
   * Boolean for whether or not the workspace supports pinch-zoom.
   * @type {?boolean}
   * @private
   */
  this.isPinchZoomEnabled_ = null;
};
object.inherits(TouchGesture, Gesture);

/**
 * A multiplier used to convert the gesture scale to a zoom in delta.
 * @const
 */
TouchGesture.ZOOM_IN_MULTIPLIER = 5;

/**
 * A multiplier used to convert the gesture scale to a zoom out delta.
 * @const
 */
TouchGesture.ZOOM_OUT_MULTIPLIER = 6;

/**
 * Start a gesture: update the workspace to indicate that a gesture is in
 * progress and bind mousemove and mouseup handlers.
 * @param {!Event} e A mouse down, touch start or pointer down event.
 * @package
 */
TouchGesture.prototype.doStart = function(e) {
  this.isPinchZoomEnabled_ = this.startWorkspace_.options.zoomOptions &&
      this.startWorkspace_.options.zoomOptions.pinch;
  TouchGesture.superClass_.doStart.call(this, e);
  if (!this.isEnding_ && Touch.isTouchEvent(e)) {
    this.handleTouchStart(e);
  }
};

/**
 * Bind gesture events.
 * Overriding the gesture definition of this function, binding the same
 * functions for onMoveWrapper_ and onUpWrapper_ but passing
 * opt_noCaptureIdentifier.
 * In addition, binding a second mouse down event to detect multi-touch events.
 * @param {!Event} e A mouse down or touch start event.
 * @package
 */
TouchGesture.prototype.bindMouseEvents = function(e) {
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
};

/**
 * Handle a mouse down, touch start, or pointer down event.
 * @param {!Event} e A mouse down, touch start, or pointer down event.
 * @package
 */
TouchGesture.prototype.handleStart = function(e) {
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
};

/**
 * Handle a mouse move, touch move, or pointer move event.
 * @param {!Event} e A mouse move, touch move, or pointer move event.
 * @package
 */
TouchGesture.prototype.handleMove = function(e) {
  if (this.isDragging()) {
    // We are in the middle of a drag, only handle the relevant events
    if (Touch.shouldHandleEvent(e)) {
      TouchGesture.superClass_.handleMove.call(this, e);
    }
    return;
  }
  if (this.isMultiTouch()) {
    if (Touch.isTouchEvent(e)) {
      this.handleTouchMove(e);
    }
    Touch.longStop();
  } else {
    TouchGesture.superClass_.handleMove.call(this, e);
  }
};

/**
 * Handle a mouse up, touch end, or pointer up event.
 * @param {!Event} e A mouse up, touch end, or pointer up event.
 * @package
 */
TouchGesture.prototype.handleUp = function(e) {
  if (Touch.isTouchEvent(e) && !this.isDragging()) {
    this.handleTouchEnd(e);
  }
  if (!this.isMultiTouch() || this.isDragging()) {
    if (!Touch.shouldHandleEvent(e)) {
      return;
    }
    TouchGesture.superClass_.handleUp.call(this, e);
  } else {
    e.preventDefault();
    e.stopPropagation();

    this.dispose();
  }
};

/**
 * Whether this gesture is part of a multi-touch gesture.
 * @return {boolean} Whether this gesture is part of a multi-touch gesture.
 * @package
 */
TouchGesture.prototype.isMultiTouch = function() {
  return this.isMultiTouch_;
};

/**
 * Sever all links from this object.
 * @package
 */
TouchGesture.prototype.dispose = function() {
  TouchGesture.superClass_.dispose.call(this);

  if (this.onStartWrapper_) {
    browserEvents.unbind(this.onStartWrapper_);
  }
};

/**
 * Handle a touch start or pointer down event and keep track of current
 * pointers.
 * @param {!Event} e A touch start, or pointer down event.
 * @package
 */
TouchGesture.prototype.handleTouchStart = function(e) {
  const pointerId = Touch.getTouchIdentifierFromEvent(e);
  // store the pointerId in the current list of pointers
  this.cachedPoints_[pointerId] = this.getTouchPoint(e);
  const pointers = Object.keys(this.cachedPoints_);
  // If two pointers are down, store info
  if (pointers.length === 2) {
    const point0 = /** @type {!Coordinate} */ (this.cachedPoints_[pointers[0]]);
    const point1 = /** @type {!Coordinate} */ (this.cachedPoints_[pointers[1]]);
    this.startDistance_ = Coordinate.distance(point0, point1);
    this.isMultiTouch_ = true;
    e.preventDefault();
  }
};

/**
 * Handle a touch move or pointer move event and zoom in/out if two pointers
 * are on the screen.
 * @param {!Event} e A touch move, or pointer move event.
 * @package
 */
TouchGesture.prototype.handleTouchMove = function(e) {
  const pointerId = Touch.getTouchIdentifierFromEvent(e);
  // Update the cache
  this.cachedPoints_[pointerId] = this.getTouchPoint(e);

  const pointers = Object.keys(this.cachedPoints_);
  if (this.isPinchZoomEnabled_ && pointers.length === 2) {
    this.handlePinch_(e);
  } else {
    TouchGesture.superClass_.handleMove.call(this, e);
  }
};

/**
 * Handle pinch zoom gesture.
 * @param {!Event} e A touch move, or pointer move event.
 * @private
 */
TouchGesture.prototype.handlePinch_ = function(e) {
  const pointers = Object.keys(this.cachedPoints_);
  // Calculate the distance between the two pointers
  const point0 = /** @type {!Coordinate} */ (this.cachedPoints_[pointers[0]]);
  const point1 = /** @type {!Coordinate} */ (this.cachedPoints_[pointers[1]]);
  const moveDistance = Coordinate.distance(point0, point1);
  const scale = moveDistance / this.startDistance_;

  if (this.previousScale_ > 0 && this.previousScale_ < Infinity) {
    const gestureScale = scale - this.previousScale_;
    const delta = gestureScale > 0 ?
        gestureScale * TouchGesture.ZOOM_IN_MULTIPLIER :
        gestureScale * TouchGesture.ZOOM_OUT_MULTIPLIER;
    const workspace = this.startWorkspace_;
    const position = browserEvents.mouseToSvg(
        e, workspace.getParentSvg(), workspace.getInverseScreenCTM());
    workspace.zoom(position.x, position.y, delta);
  }
  this.previousScale_ = scale;
  e.preventDefault();
};


/**
 * Handle a touch end or pointer end event and end the gesture.
 * @param {!Event} e A touch end, or pointer end event.
 * @package
 */
TouchGesture.prototype.handleTouchEnd = function(e) {
  const pointerId = Touch.getTouchIdentifierFromEvent(e);
  if (this.cachedPoints_[pointerId]) {
    delete this.cachedPoints_[pointerId];
  }
  if (Object.keys(this.cachedPoints_).length < 2) {
    this.cachedPoints_ = Object.create(null);
    this.previousScale_ = 0;
  }
};

/**
 * Helper function returning the current touch point coordinate.
 * @param {!Event} e A touch or pointer event.
 * @return {?Coordinate} The current touch point coordinate
 * @package
 */
TouchGesture.prototype.getTouchPoint = function(e) {
  if (!this.startWorkspace_) {
    return null;
  }
  return new Coordinate(
      (e.changedTouches ? e.changedTouches[0].pageX : e.pageX),
      (e.changedTouches ? e.changedTouches[0].pageY : e.pageY));
};

exports.TouchGesture = TouchGesture;
