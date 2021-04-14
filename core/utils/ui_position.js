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
Blockly.utils.uiPosition.verticalPositionType = {
  TOP: 0,
  CENTER: 1,
  BOTTOM: 2
};

/**
 * Enum for horizontal positioning.
 * @enum {number}
 */
Blockly.utils.uiPosition.horizontalPositionType = {
  LEFT: 0,
  CENTER: 1,
  RIGHT: 2
};

/**
 * An object defining a horizontal and vertical positioning.
 * @typedef {{
 *            horizontal: !Blockly.utils.uiPosition.horizontalPositionType,
 *            vertical: !Blockly.utils.uiPosition.verticalPositionType
 *          }}
 */
Blockly.utils.uiPosition.PositionType;

/**
 * Enum for bump rules to use for dealing with collisions.
 * @enum {number}
 */
Blockly.utils.uiPosition.bumpRule = {
  BUMP_UP: 0,
  BUMP_DOWN: 1,
  BUMP_LEFT: 2,
  BUMP_RIGHT: 3
};

/**
 * Returns a start position rectangle without taking account any already placed
 * UI elements.
 * @param {!Blockly.utils.uiPosition.horizontalPositionType} horizontalPosType
 *     The start horizontal position type.
 * @param {!Blockly.utils.uiPosition.verticalPositionType} verticalPosType The
 *    start vertical position type.
 * @param {number} width The width of the ui element to suggest a position for.
 * @param {number} height The height of the ui element to suggest a position
 *    for.
 * @param {number} horizontalPadding The horizontal padding to use. This value
 *    is ignored for center horizontal positioning.
 * @param {number} verticalPadding The vertical padding to use. This value
 *    is ignored for center vertical positioning.
 * @param {!Blockly.MetricsManager.UiMetrics} metrics The workspace ui metrics.
 * @param {!Blockly.WorkspaceSvg} workspace The workspace.
 * @return {!Blockly.utils.Rect} The suggested start position.
 */
Blockly.utils.uiPosition.getStartPositionRect = function(
    horizontalPosType, verticalPosType, width, height, horizontalPadding,
    verticalPadding, metrics, workspace) {
  // Horizontal positioning.
  var left = 0;
  var hasVerticalScrollbar =
      workspace.scrollbar && workspace.scrollbar.canScrollVertically();
  if (horizontalPosType ===
      Blockly.utils.uiPosition.horizontalPositionType.LEFT) {
    left = metrics.absoluteMetrics.left + horizontalPadding;
    if (hasVerticalScrollbar && workspace.RTL) {
      left += Blockly.Scrollbar.scrollbarThickness;
    }
  } else if (horizontalPosType ===
      Blockly.utils.uiPosition.horizontalPositionType.CENTER) {
    left = metrics.absoluteMetrics.left + metrics.viewMetrics.width / 2 -
        width / 2;
  } else {  // horizontalPosType == horizontalPositionType.RIGHT
    left = metrics.absoluteMetrics.left + metrics.viewMetrics.width -
        width - horizontalPadding;
    if (hasVerticalScrollbar && !workspace.RTL) {
      left -= Blockly.Scrollbar.scrollbarThickness;
    }
  }
  // Vertical positioning.
  var top = 0;
  if (verticalPosType === Blockly.utils.uiPosition.verticalPositionType.TOP) {
    top = metrics.absoluteMetrics.top + verticalPadding;
  } else if (verticalPosType ===
      Blockly.utils.uiPosition.verticalPositionType.CENTER) {
    top = metrics.absoluteMetrics.top + metrics.viewMetrics.height / 2 -
        height / 2;
  } else {  // verticalPosType == verticalPositionType.BOTTOM
    top = metrics.absoluteMetrics.top + metrics.viewMetrics.height -
        height - verticalPadding;
    if (workspace.scrollbar && workspace.scrollbar.canScrollHorizontally()) {
      // The scrollbars are always positioned on the bottom if they exist.
      top -= Blockly.Scrollbar.scrollbarThickness;
    }
  }
  return new Blockly.utils.Rect(top, top + height, left, left + width);
};

// TODO give better name
/**
 * Suggests a corner position type based on the toolbox position.
 * @param {!Blockly.WorkspaceSvg} workspace The workspace.
 * @param {!Blockly.MetricsManager.UiMetrics} metrics The workspace metrics.
 * @return {!Blockly.utils.uiPosition.PositionType} The suggested corner
 *    position type.
 */
Blockly.utils.uiPosition.suggestCornerPosition = function(workspace, metrics) {
  var leftCorner =
      metrics.toolboxMetrics.position !== Blockly.utils.toolbox.Position.LEFT &&
      (!workspace.horizontalLayout || workspace.RTL);
  var topCorner =
      metrics.toolboxMetrics.position === Blockly.utils.toolbox.Position.BOTTOM;
  var horizontalPosType = leftCorner ?
      Blockly.utils.uiPosition.horizontalPositionType.LEFT :
      Blockly.utils.uiPosition.horizontalPositionType.RIGHT;
  var verticalPosType = topCorner ?
      Blockly.utils.uiPosition.verticalPositionType.TOP :
      Blockly.utils.uiPosition.verticalPositionType.BOTTOM;
  return {
    horizontal: horizontalPosType,
    vertical: verticalPosType
  };
};

/**
 * Returns a position Rect based on a starting position that is bumped
 * so that it doesn't intersect with any of the provided savedPositions. This
 * method does not check that the bumped position is still within bounds.
 * @param {!Blockly.utils.Rect} startRect The starting position to use.
 * @param {number} margin The marging to use between elements when bumping.
 * @param {Blockly.utils.uiPosition.bumpRule} bumpRule The rule to use when
 *    deciding which direction to bump if there is a collision with an existing
 *    ui element.
 * @param {!Array<!Blockly.utils.Rect>} savedPositions List of rectangles that
 *    represent the positions of ui elements already placed.
 * @return {!Blockly.utils.Rect} The suggested position rectangle.
 */
Blockly.utils.uiPosition.bumpPositionRect = function(
    startRect, margin, bumpRule, savedPositions) {
  var top = startRect.top;
  var left = startRect.left;
  var width = startRect.right - startRect.left;
  var height = startRect.bottom - startRect.top;

  // Check for collision and bump if needed.
  var boundingRect = startRect;
  for (var i = 0, otherEl; (otherEl = savedPositions[i]); i++) {
    if (boundingRect.intersects(otherEl)) {
      switch (bumpRule) {
        case Blockly.utils.uiPosition.bumpRule.BUMP_UP:
          top = otherEl.top - height - padding;
          break;
        case Blockly.utils.uiPosition.bumpRule.BUMP_DOWN:
          top = otherEl.bottom + padding;
          break;
        case Blockly.utils.uiPosition.bumpRule.BUMP_LEFT:
          left = otherEl.left - width - padding;
          break;
        case Blockly.utils.uiPosition.bumpRule.BUMP_RIGHT:
          left = otherEl.right + padding;
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
