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
 * @fileoverview Methods for dragging a flyout visually.
 * @author fenichel@google.com (Rachel Fenichel)
 */
'use strict';

goog.provide('Blockly.FlyoutDragger');

goog.require('Blockly.WorkspaceDragger');


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
 * Move the appropriate scrollbar to drag the flyout.
 * Since flyouts only scroll in one direction at a time, this will discard one
 * of the calculated values.
 * x and y are in pixels.
 * @param {number} x The new x position to move the scrollbar to.
 * @param {number} y The new y position to move the scrollbar to.
 * @private
 */
Blockly.FlyoutDragger.prototype.updateScroll_ = function(x, y) {
  // Move the scrollbar and the flyout will scroll automatically.
  if (this.horizontalLayout_) {
    this.scrollbar_.set(x);
  } else {
    this.scrollbar_.set(y);
  }
};
