/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Utility functions for positioning UI elements.
 * @author kozbial@google.com (Monica Kozbial)
 */
'use strict';

goog.provide('Blockly.uiPosition');

goog.require('Blockly.Scrollbar');
goog.require('Blockly.utils.Rect');
goog.require('Blockly.utils.toolbox');

goog.requireType('Blockly.MetricsManager');
goog.requireType('Blockly.WorkspaceSvg');


/**
 * Enum for vertical positioning.
 * @enum {number}
 * @package
 */
Blockly.uiPosition.verticalPosition = {
  TOP: 0,
  BOTTOM: 1
};

/**
 * Enum for horizontal positioning.
 * @enum {number}
 * @package
 */
Blockly.uiPosition.horizontalPosition = {
  LEFT: 0,
  RIGHT: 1
};

/**
 * An object defining a horizontal and vertical positioning.
 * @typedef {{
 *   horizontal: !Blockly.uiPosition.horizontalPosition,
 *   vertical: !Blockly.uiPosition.verticalPosition
 * }}
 * @package
 */
Blockly.uiPosition.Position;

/**
 * Enum for bump rules to use for dealing with collisions.
 * @enum {number}
 * @package
 */
Blockly.uiPosition.bumpDirection = {
  UP: 0,
  DOWN: 1
};

/**
 * Returns a rectangle representing reasonable position for where to place a UI
 * element of the specified size given the restraints and locations of the
 * scrollbars. This method does not take into account any already placed UI
 * elements.
 * @param {!Blockly.uiPosition.Position} position The starting
 *    horizontal and vertical position.
 * @param {!Blockly.utils.Size} size the size of the UI element to get a start
 *    position for.
 * @param {number} horizontalPadding The horizontal padding to use.
 * @param {number} verticalPadding The vertical padding to use.
 * @param {!Blockly.MetricsManager.UiMetrics} metrics The workspace UI metrics.
 * @param {!Blockly.WorkspaceSvg} workspace The workspace.
 * @return {!Blockly.utils.Rect} The suggested start position.
 * @package
 */
Blockly.uiPosition.getStartPositionRect = function(
    position, size, horizontalPadding,
    verticalPadding, metrics, workspace) {
  // Horizontal positioning.
  var left = 0;
  var hasVerticalScrollbar =
      workspace.scrollbar && workspace.scrollbar.canScrollVertically();
  if (position.horizontal ===
      Blockly.uiPosition.horizontalPosition.LEFT) {
    left = metrics.absoluteMetrics.left + horizontalPadding;
    if (hasVerticalScrollbar && workspace.RTL) {
      left += Blockly.Scrollbar.scrollbarThickness;
    }
  } else {  // position.horizontal == horizontalPosition.RIGHT
    left = metrics.absoluteMetrics.left + metrics.viewMetrics.width -
        size.width - horizontalPadding;
    if (hasVerticalScrollbar && !workspace.RTL) {
      left -= Blockly.Scrollbar.scrollbarThickness;
    }
  }
  // Vertical positioning.
  var top = 0;
  if (position.vertical ===
      Blockly.uiPosition.verticalPosition.TOP) {
    top = metrics.absoluteMetrics.top + verticalPadding;
  } else {  // position.vertical == verticalPosition.BOTTOM
    top = metrics.absoluteMetrics.top + metrics.viewMetrics.height -
        size.height - verticalPadding;
    if (workspace.scrollbar && workspace.scrollbar.canScrollHorizontally()) {
      // The scrollbars are always positioned on the bottom if they exist.
      top -= Blockly.Scrollbar.scrollbarThickness;
    }
  }
  return new Blockly.utils.Rect(
      top, top + size.height, left, left + size.width);
};

/**
 * Returns a corner position that is on the opposite side of the workspace from
 * the toolbox.
 * If in horizontal orientation, defaults to the bottom corner. If in vertical
 * orientation, defaults to the right corner.
 * @param {!Blockly.WorkspaceSvg} workspace The workspace.
 * @param {!Blockly.MetricsManager.UiMetrics} metrics The workspace metrics.
 * @return {!Blockly.uiPosition.Position} The suggested corner position.
 * @package
 */
Blockly.uiPosition.getCornerOppositeToolbox = function(workspace, metrics) {
  var leftCorner =
      metrics.toolboxMetrics.position !== Blockly.utils.toolbox.Position.LEFT &&
      (!workspace.horizontalLayout || workspace.RTL);
  var topCorner =
      metrics.toolboxMetrics.position === Blockly.utils.toolbox.Position.BOTTOM;
  var horizontalPosition = leftCorner ?
      Blockly.uiPosition.horizontalPosition.LEFT :
      Blockly.uiPosition.horizontalPosition.RIGHT;
  var verticalPosition = topCorner ?
      Blockly.uiPosition.verticalPosition.TOP :
      Blockly.uiPosition.verticalPosition.BOTTOM;
  return {
    horizontal: horizontalPosition,
    vertical: verticalPosition
  };
};

/**
 * Returns a position Rect based on a starting position that is bumped
 * so that it doesn't intersect with any of the provided savedPositions. This
 * method does not check that the bumped position is still within bounds.
 * @param {!Blockly.utils.Rect} startRect The starting position to use.
 * @param {number} margin The margin to use between elements when bumping.
 * @param {!Blockly.uiPosition.bumpDirection} bumpDirection The direction
 *    to bump if there is a collision with an existing UI element.
 * @param {!Array<!Blockly.utils.Rect>} savedPositions List of rectangles that
 *    represent the positions of UI elements already placed.
 * @return {!Blockly.utils.Rect} The suggested position rectangle.
 * @package
 */
Blockly.uiPosition.bumpPositionRect = function(
    startRect, margin, bumpDirection, savedPositions) {
  var top = startRect.top;
  var left = startRect.left;
  var width = startRect.right - startRect.left;
  var height = startRect.bottom - startRect.top;

  // Check for collision and bump if needed.
  var boundingRect = startRect;
  for (var i = 0, otherEl; (otherEl = savedPositions[i]); i++) {
    if (boundingRect.intersects(otherEl)) {
      if (bumpDirection === Blockly.uiPosition.bumpDirection.UP) {
        top = otherEl.top - height - margin;
      } else {  // bumpDirection == bumpDirection.DOWN
        top = otherEl.bottom + margin;
      }
      // Recheck other savedPositions
      boundingRect = new Blockly.utils.Rect(
          top, top + height, left, left + width);
      i = -1;
    }
  }
  return boundingRect;
};
