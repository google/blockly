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
 * @fileoverview Methods for dragging a workspace visually.
 * @author fenichel@google.com (Rachel Fenichel)
 */
'use strict';

goog.provide('Blockly.FlyoutDragger');

goog.require('Blockly.WorkspaceDragger');

goog.require('goog.math.Coordinate');
goog.require('goog.asserts');


/**
 * Class for a flyout dragger.  It moves a flyout workspace around when it is
 * being dragged by a mouse or touch.
 * Note that the workspace itself manages whether or not it has a drag surface
 * and how to do translations based on that.  This simply passes the right
 * commands based on events.
 * @param {!Blockly.Flyout} flyout The flyout to drag.
 * @constructor
 */
Blockly.FlyoutDragger = function(flyout) {
  Blockly.FlyoutDragger.superClass_.constructor.call(this,
      flyout.getWorkspace());

  /**
   * The scrollbar to update to move the flyout.
   * Unlike the main workspace, the flyout has only one scrollbar, in either the
   * horizontal or the vertical direction.
   * @type {!Blockly.Scrollbar}
   * @private
   */
  this.scrollbar_ = flyout.scrollbar_;

  /**
   * Whether the flyout scrolls horizontally.  If false, the flyout scrolls
   * vertically.
   * @type {boolean}
   * @private
   */
  this.horizontalLayout_ = flyout.horizontalLayout_;
};
goog.inherits(Blockly.FlyoutDragger, Blockly.WorkspaceDragger);

/**
 * Move the flyout based on the most recent mouse movements.
 * @param {!goog.math.Coordinate} currentDragDeltaXY How far the pointer has
 *     moved from the position at the start of the drag, in pixel coordinates.
 */
Blockly.FlyoutDragger.prototype.drag = function(currentDragDeltaXY) {
  var metrics = this.startDragMetrics_;
  var newXY = goog.math.Coordinate.sum(this.startScrollXY_, currentDragDeltaXY);

  // Bound the new XY based on workspace bounds.
  var x = Math.min(newXY.x, -metrics.contentLeft);
  var y = Math.min(newXY.y, -metrics.contentTop);
  x = Math.max(x, metrics.viewWidth - metrics.contentLeft -
               metrics.contentWidth);
  y = Math.max(y, metrics.viewHeight - metrics.contentTop -
               metrics.contentHeight);

  // TODO: Understand why the output is the negative of the value for a main
  // workspace.  This means that the flyout's metrics are bad.
  // The same math should work for both.
  x *= -1;
  y *= -1;

  // Move the scrollbar and the flyout will scroll automatically.
  if (this.horizontalLayout_) {
    this.scrollbar_.set(-x);
  } else {
    this.scrollbar_.set(-y);
  }
};
