/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2017 Google Inc.
 * https://developers.google.com/blockly/
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview The class extends Blockly.Gesture to support pinch to zoom
 * for both pointer and touch events.
 * @author samelh@microsoft.com (Sam El-Husseini)
 */
'use strict';

goog.provide('Blockly.TouchGesture');

goog.require('Blockly.Gesture');

goog.require('goog.asserts');
goog.require('goog.math.Coordinate');


/*
 * Note: In this file "start" refers to touchstart, mousedown, and pointerstart
 * events.  "End" refers to touchend, mouseup, and pointerend events.
 */

/**
 * Class for one gesture.
 * @param {!Event} e The event that kicked off this gesture.
 * @param {!Blockly.WorkspaceSvg} creatorWorkspace The workspace that created
 *     this gesture and has a reference to it.
 * @extends {Blockly.Gesture}
 * @constructor
 */
Blockly.TouchGesture = function(e, creatorWorkspace) {
  Blockly.TouchGesture.superClass_.constructor.call(this, e, creatorWorkspace);

  /**
   * Boolean for whether or not this gesture is a multi-touch gesture.
   * @type {boolean}
   * @private
   */
  this.isMultiTouch_ = false;

  /**
   * A map of cached points used for tracking multi-touch gestures.
   * @type {Object<number|string, goog.math.Coordinate>}
   * @private
   */
  this.cachedPoints_ = {};

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
   * at the end of a drag. Opaque data returned from Blockly.bindEventWithChecks_.
   * @type {Array.<!Array>}
   * @private
   */
  this.onStartWrapper_ = null;
};
goog.inherits(Blockly.TouchGesture, Blockly.Gesture);

/**
 * A multiplier used to convert the gesture scale to a zoom in delta.
 * @const
 */
Blockly.TouchGesture.ZOOM_IN_MULTIPLIER = 5;

/**
 * A multiplier used to convert the gesture scale to a zoom out delta.
 * @const
 */
Blockly.TouchGesture.ZOOM_OUT_MULTIPLIER = 6;

/**
 * Start a gesture: update the workspace to indicate that a gesture is in
 * progress and bind mousemove and mouseup handlers.
 * @param {!Event} e A mouse down, touch start or pointer down event.
 * @package
 */
Blockly.TouchGesture.prototype.doStart = function(e) {
  Blockly.TouchGesture.superClass_.doStart.call(this, e);
  if (!this.isEnding_ && Blockly.Touch.isTouchEvent(e)) {
    this.handleTouchStart(e);
  }
};

/**
 * Bind gesture events.
 * Overriding the gesture definition of this function, binding the same
 * functions for onMoveWrapper_ and onUpWrapper_ but passing opt_noCaptureIdentifier.
 * In addition, binding a second mouse down event to detect multi-touch events.
 * @param {!Event} e A mouse down or touch start event.
 * @package
 */
Blockly.TouchGesture.prototype.bindMouseEvents = function(e) {
  this.onStartWrapper_ = Blockly.bindEventWithChecks_(
      document, 'mousedown', null, this.handleStart.bind(this),
      /*opt_noCaptureIdentifier*/ true);
  this.onMoveWrapper_ = Blockly.bindEventWithChecks_(
      document, 'mousemove', null, this.handleMove.bind(this),
      /*opt_noCaptureIdentifier*/ true);
  this.onUpWrapper_ = Blockly.bindEventWithChecks_(
      document, 'mouseup', null, this.handleUp.bind(this),
      /*opt_noCaptureIdentifier*/ true);

  e.preventDefault();
  e.stopPropagation();
};

/**
 * Handle a mouse down, touch start, or pointer down event.
 * @param {!Event} e A mouse down, touch start, or pointer down event.
 * @package
 */
Blockly.TouchGesture.prototype.handleStart = function(e) {
  if (this.isDragging()) {
    // A drag has already started, so this can no longer be a pinch-zoom.
    return;
  }
  if (Blockly.Touch.isTouchEvent(e)) {
    this.handleTouchStart(e);

    if (this.isMultiTouch()) {
      Blockly.longStop_();
    }
  }
};

/**
 * Handle a mouse move, touch move, or pointer move event.
 * @param {!Event} e A mouse move, touch move, or pointer move event.
 * @package
 */
Blockly.TouchGesture.prototype.handleMove = function(e) {
  if (this.isDragging()) {
    // We are in the middle of a drag, only handle the relevant events
    if (Blockly.Touch.shouldHandleEvent(e)) {
      Blockly.TouchGesture.superClass_.handleMove.call(this, e);
    }
    return;
  }
  if (this.isMultiTouch()) {
    if (Blockly.Touch.isTouchEvent(e)) {
      this.handleTouchMove(e);
    }
    Blockly.longStop_();
  } else {
    Blockly.TouchGesture.superClass_.handleMove.call(this, e);
  }
};

/**
 * Handle a mouse up, touch end, or pointer up event.
 * @param {!Event} e A mouse up, touch end, or pointer up event.
 * @package
 */
Blockly.TouchGesture.prototype.handleUp = function(e) {
  if (Blockly.Touch.isTouchEvent(e) && !this.isDragging()) {
    this.handleTouchEnd(e);
  }
  if (!this.isMultiTouch() || this.isDragging()) {
    if (!Blockly.Touch.shouldHandleEvent(e)) {
      return;
    }
    Blockly.TouchGesture.superClass_.handleUp.call(this, e);
  } else {
    e.preventDefault();
    e.stopPropagation();

    this.dispose();
  }
};

/**
 * Whether this gesture is part of a multi-touch gesture.
 * @return {boolean} whether this gesture is part of a multi-touch gesture.
 * @package
 */
Blockly.TouchGesture.prototype.isMultiTouch = function() {
  return this.isMultiTouch_;
};

/**
 * Sever all links from this object.
 * @package
 */
Blockly.TouchGesture.prototype.dispose = function() {
  Blockly.TouchGesture.superClass_.dispose.call(this);

  if (this.onStartWrapper_) {
    Blockly.unbindEvent_(this.onStartWrapper_);
  }
};

/**
 * Handle a touch start or pointer down event and keep track of current pointers.
 * @param {!Event} e A touch start, or pointer down event.
 * @package
 */
Blockly.TouchGesture.prototype.handleTouchStart = function(e) {
  var pointerId = Blockly.Touch.getTouchIdentifierFromEvent(e);
  // store the pointerId in the current list of pointers
  this.cachedPoints_[pointerId] = this.getTouchPoint(e);
  var pointers = Object.keys(this.cachedPoints_);
  // If two pointers are down, check for pinch gestures
  if (pointers.length == 2) {
    var point0 = this.cachedPoints_[pointers[0]];
    var point1 = this.cachedPoints_[pointers[1]];
    this.startDistance_ = goog.math.Coordinate.distance(point0, point1);
    this.isMultiTouch_ = true;
    e.preventDefault();
  }
};

/**
 * Handle a touch move or pointer move event and zoom in/out if two pointers are on the screen.
 * @param {!Event} e A touch move, or pointer move event.
 * @package
 */
Blockly.TouchGesture.prototype.handleTouchMove = function(e) {
  var pointerId = Blockly.Touch.getTouchIdentifierFromEvent(e);
  // Update the cache
  this.cachedPoints_[pointerId] = this.getTouchPoint(e);

  var pointers = Object.keys(this.cachedPoints_);
  // If two pointers are down, check for pinch gestures
  if (pointers.length == 2) {
    // Calculate the distance between the two pointers
    var point0 = this.cachedPoints_[pointers[0]];
    var point1 = this.cachedPoints_[pointers[1]];
    var moveDistance = goog.math.Coordinate.distance(point0, point1);
    var startDistance = this.startDistance_;
    var scale = this.touchScale_ = moveDistance / startDistance;

    if (this.previousScale_ > 0 && this.previousScale_ < Infinity) {
      var gestureScale = scale - this.previousScale_;
      var delta = gestureScale > 0 ?
        gestureScale * Blockly.TouchGesture.ZOOM_IN_MULTIPLIER :
        gestureScale * Blockly.TouchGesture.ZOOM_OUT_MULTIPLIER;
      var workspace = this.startWorkspace_;
      var position = Blockly.utils.mouseToSvg(
          e, workspace.getParentSvg(), workspace.getInverseScreenCTM());
      workspace.zoom(position.x, position.y, delta);
    }
    this.previousScale_ = scale;
    e.preventDefault();
  }
};

/**
 * Handle a touch end or pointer end event and end the gesture.
 * @param {!Event} e A touch end, or pointer end event.
 * @package
 */
Blockly.TouchGesture.prototype.handleTouchEnd = function(e) {
  var pointerId = Blockly.Touch.getTouchIdentifierFromEvent(e);
  if (this.cachedPoints_[pointerId]) {
    delete this.cachedPoints_[pointerId];
  }
  if (Object.keys(this.cachedPoints_).length < 2) {
    this.cachedPoints_ = {};
    this.previousScale_ = 0;
  }
};

/**
 * Helper function returning the current touch point coordinate.
 * @param {!Event} e A touch or pointer event.
 * @return {goog.math.Coordinate} the current touch point coordinate
 * @package
 */
Blockly.TouchGesture.prototype.getTouchPoint = function(e) {
  if (!this.startWorkspace_) {
    return null;
  }
  return new goog.math.Coordinate(
      (e.pageX ? e.pageX : e.changedTouches[0].pageX),
      (e.pageY ? e.pageY : e.changedTouches[0].pageY)
  );
};
