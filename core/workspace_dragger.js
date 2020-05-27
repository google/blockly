/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Methods for dragging a workspace visually.
 * @author fenichel@google.com (Rachel Fenichel)
 */
'use strict';

goog.provide('Blockly.WorkspaceDragger');

goog.require('Blockly.utils.Coordinate');


/**
 * Class for a workspace dragger.  It moves the workspace around when it is
 * being dragged by a mouse or touch.
 * Note that the workspace itself manages whether or not it has a drag surface
 * and how to do translations based on that.  This simply passes the right
 * commands based on events.
 * @param {!Blockly.WorkspaceSvg} workspace The workspace to drag.
 * @constructor
 */
Blockly.WorkspaceDragger = function(workspace) {
  /**
   * @type {!Blockly.WorkspaceSvg}
   * @private
   */
  this.workspace_ = workspace;

  /**
   * The scroll position of the workspace at the beginning of the drag.
   * Coordinate system: pixel coordinates.
   * @type {!Blockly.utils.Coordinate}
   * @protected
   */
  this.startScrollXY_ = new Blockly.utils.Coordinate(
      workspace.scrollX, workspace.scrollY);
};

/**
 * Sever all links from this object.
 * @package
 * @suppress {checkTypes}
 */
Blockly.WorkspaceDragger.prototype.dispose = function() {
  this.workspace_ = null;
};

/**
 * Start dragging the workspace.
 * @package
 */
Blockly.WorkspaceDragger.prototype.startDrag = function() {
  if (Blockly.selected) {
    Blockly.selected.unselect();
  }
  this.workspace_.setupDragSurface();
};

/**
 * Finish dragging the workspace and put everything back where it belongs.
 * @param {!Blockly.utils.Coordinate} currentDragDeltaXY How far the pointer has
 *     moved from the position at the start of the drag, in pixel coordinates.
 * @package
 */
Blockly.WorkspaceDragger.prototype.endDrag = function(currentDragDeltaXY) {
  // Make sure everything is up to date.
  this.drag(currentDragDeltaXY);
  this.workspace_.resetDragSurface();
};

/**
 * Move the workspace based on the most recent mouse movements.
 * @param {!Blockly.utils.Coordinate} currentDragDeltaXY How far the pointer has
 *     moved from the position at the start of the drag, in pixel coordinates.
 * @package
 */
Blockly.WorkspaceDragger.prototype.drag = function(currentDragDeltaXY) {
  var newXY = Blockly.utils.Coordinate.sum(this.startScrollXY_, currentDragDeltaXY);
  this.workspace_.scroll(newXY.x, newXY.y);
};
