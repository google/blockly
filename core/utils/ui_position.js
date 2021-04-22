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

goog.provide('Blockly.utils.uiPosition');

goog.require('Blockly.Scrollbar');
goog.require('Blockly.utils.Rect');
goog.require('Blockly.utils.toolbox');

goog.requireType('Blockly.MetricsManager');
goog.requireType('Blockly.WorkspaceSvg');


/**
 * Enum for vertical positioning.
 * @enum {number}
 */
Blockly.utils.uiPosition.verticalPosition = {
  TOP: 0,
  CENTER: 1,
  BOTTOM: 2
};

/**
 * Enum for horizontal positioning.
 * @enum {number}
 */
Blockly.utils.uiPosition.horizontalPosition = {
  LEFT: 0,
  CENTER: 1,
  RIGHT: 2
};

/**
 * An object defining a horizontal and vertical positioning.
 * @typedef {{
 *            horizontal: !Blockly.utils.uiPosition.horizontalPosition,
 *            vertical: !Blockly.utils.uiPosition.verticalPosition
 *          }}
 */
Blockly.utils.uiPosition.Position;

/**
 * Enum for bump rules to use for dealing with collisions.
 * @enum {number}
 */
Blockly.utils.uiPosition.bumpDirection = {
  UP: 0,
  DOWN: 1,
  LEFT: 2,
  RIGHT: 3
};

/**
 * Returns a rectangle representing reasonable position for where to place a ui
 * element of the specified size given the restraints and locations of the
 * scrollbars. This method does not take into account any already placed ui
 * elements.
 * @param {!Blockly.utils.uiPosition.Position} position The starting
 *    horizontal and vertical position.
 * @param {!Blockly.utils.Size} size the size of the ui element so get a start
 *    position for.
 * @param {number} horizontalPadding The horizontal padding to use. This value
 *    is ignored for center horizontal positioning.
 * @param {number} verticalPadding The vertical padding to use. This value
 *    is ignored for center vertical positioning.
 * @param {!Blockly.MetricsManager.UiMetrics} metrics The workspace ui metrics.
 * @param {!Blockly.WorkspaceSvg} workspace The workspace.
 * @return {!Blockly.utils.Rect} The suggested start position.
 */
Blockly.utils.uiPosition.getStartPositionRect = function(
    position, size, horizontalPadding,
    verticalPadding, metrics, workspace) {
  // Horizontal positioning.
  var left = 0;
  var hasVerticalScrollbar =
      workspace.scrollbar && workspace.scrollbar.canScrollVertically();
  if (position.horizontal ===
      Blockly.utils.uiPosition.horizontalPosition.LEFT) {
    left = metrics.absoluteMetrics.left + horizontalPadding;
    if (hasVerticalScrollbar && workspace.RTL) {
      left += Blockly.Scrollbar.scrollbarThickness;
    }
  } else if (position.horizontal ===
      Blockly.utils.uiPosition.horizontalPosition.CENTER) {
    left = metrics.absoluteMetrics.left + metrics.viewMetrics.width / 2 -
        size.width / 2;
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
      Blockly.utils.uiPosition.verticalPosition.TOP) {
    top = metrics.absoluteMetrics.top + verticalPadding;
  } else if (position.vertical ===
      Blockly.utils.uiPosition.verticalPosition.CENTER) {
    top = metrics.absoluteMetrics.top + metrics.viewMetrics.height / 2 -
        size.height / 2;
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
 * @return {!Blockly.utils.uiPosition.Position} The suggested corner position.
 */
Blockly.utils.uiPosition.getCornerOppositeToolbox = function(workspace, metrics) {
  var leftCorner =
      metrics.toolboxMetrics.position !== Blockly.utils.toolbox.Position.LEFT &&
      (!workspace.horizontalLayout || workspace.RTL);
  var topCorner =
      metrics.toolboxMetrics.position === Blockly.utils.toolbox.Position.BOTTOM;
  var horizontalPosition = leftCorner ?
      Blockly.utils.uiPosition.horizontalPosition.LEFT :
      Blockly.utils.uiPosition.horizontalPosition.RIGHT;
  var verticalPosition = topCorner ?
      Blockly.utils.uiPosition.verticalPosition.TOP :
      Blockly.utils.uiPosition.verticalPosition.BOTTOM;
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
 * @param {!Blockly.utils.uiPosition.bumpDirection} bumpDirection The direction
 *    to bump if there is a collision with an existing ui element.
 * @param {!Array<!Blockly.utils.Rect>} savedPositions List of rectangles that
 *    represent the positions of ui elements already placed.
 * @return {!Blockly.utils.Rect} The suggested position rectangle.
 */
Blockly.utils.uiPosition.bumpPositionRect = function(
    startRect, margin, bumpDirection, savedPositions) {
  var top = startRect.top;
  var left = startRect.left;
  var width = startRect.right - startRect.left;
  var height = startRect.bottom - startRect.top;

  // Check for collision and bump if needed.
  var boundingRect = startRect;
  for (var i = 0, otherEl; (otherEl = savedPositions[i]); i++) {
    if (boundingRect.intersects(otherEl)) {
      switch (bumpDirection) {
        case Blockly.utils.uiPosition.bumpDirection.UP:
          top = otherEl.top - height - margin;
          break;
        case Blockly.utils.uiPosition.bumpDirection.DOWN:
          top = otherEl.bottom + margin;
          break;
        case Blockly.utils.uiPosition.bumpDirection.LEFT:
          left = otherEl.left - width - margin;
          break;
        case Blockly.utils.uiPosition.bumpDirection.RIGHT:
          left = otherEl.right + margin;
          break;
      }
      // Recheck other savedPositions
      boundingRect = new Blockly.utils.Rect(
          top, top + height, left, left + width);
      i = -1;
    }
  }
  return boundingRect;
};
