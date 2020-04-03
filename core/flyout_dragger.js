/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Methods for dragging a flyout visually.
 * @author fenichel@google.com (Rachel Fenichel)
 */
'use strict';

goog.provide('Blockly.FlyoutDragger');

goog.require('Blockly.utils.object');
goog.require('Blockly.WorkspaceDragger');


/**
 * Class for a flyout dragger.  It moves a flyout workspace around when it is
 * being dragged by a mouse or touch.
 * Note that the workspace itself manages whether or not it has a drag surface
 * and how to do translations based on that.  This simply passes the right
 * commands based on events.
 * @param {!Blockly.Flyout} flyout The flyout to drag.
 * @extends {Blockly.WorkspaceDragger}
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
Blockly.utils.object.inherits(Blockly.FlyoutDragger, Blockly.WorkspaceDragger);

/**
 * Move the flyout based on the most recent mouse movements.
 * @param {!Blockly.utils.Coordinate} currentDragDeltaXY How far the pointer has
 *     moved from the position at the start of the drag, in pixel coordinates.
 * @package
 */
Blockly.FlyoutDragger.prototype.drag = function(currentDragDeltaXY) {
  // startScrollXY_ is assigned by the superclass.
  var newXY = Blockly.utils.Coordinate.sum(this.startScrollXY_,
      currentDragDeltaXY);

  // We can't call workspace.scroll because the flyout's workspace doesn't own
  // it's own scrollbars. This is because (as of 2.20190722.1) the
  // workspace's scrollbar property must be a scrollbar pair, rather than a
  // single scrollbar.
  // Instead we'll just expect setting the scrollbar to update the scroll of
  // the workspace as well.
  if (this.horizontalLayout_) {
    this.scrollbar_.set(-newXY.x);
  } else {
    this.scrollbar_.set(-newXY.y);
  }
};
