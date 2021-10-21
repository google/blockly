/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Utility functions for positioning UI elements.
 */
'use strict';

/**
 * Utility functions for positioning UI elements.
 * @namespace Blockly.uiPosition
 */
goog.module('Blockly.uiPosition');

const toolbox = goog.require('Blockly.utils.toolbox');
/* eslint-disable-next-line no-unused-vars */
const {MetricsManager} = goog.requireType('Blockly.MetricsManager');
const {Rect} = goog.require('Blockly.utils.Rect');
const {Scrollbar} = goog.require('Blockly.Scrollbar');
/* eslint-disable-next-line no-unused-vars */
const {Size} = goog.requireType('Blockly.utils.Size');
/* eslint-disable-next-line no-unused-vars */
const {WorkspaceSvg} = goog.requireType('Blockly.WorkspaceSvg');


/**
 * Enum for vertical positioning.
 * @enum {number}
 * @alias Blockly.uiPosition.verticalPosition
 * @package
 */
const verticalPosition = {
  TOP: 0,
  BOTTOM: 1,
};
exports.verticalPosition = verticalPosition;

/**
 * Enum for horizontal positioning.
 * @enum {number}
 * @alias Blockly.uiPosition.horizontalPosition
 * @package
 */
const horizontalPosition = {
  LEFT: 0,
  RIGHT: 1,
};
exports.horizontalPosition = horizontalPosition;

/**
 * An object defining a horizontal and vertical positioning.
 * @typedef {{
 *   horizontal: !horizontalPosition,
 *   vertical: !verticalPosition
 * }}
 * @alias Blockly.uiPosition.Position
 * @package
 */
let Position;
exports.Position = Position;

/**
 * Enum for bump rules to use for dealing with collisions.
 * @enum {number}
 * @alias Blockly.uiPosition.bumpDirection
 * @package
 */
const bumpDirection = {
  UP: 0,
  DOWN: 1,
};
exports.bumpDirection = bumpDirection;

/**
 * Returns a rectangle representing reasonable position for where to place a UI
 * element of the specified size given the restraints and locations of the
 * scrollbars. This method does not take into account any already placed UI
 * elements.
 * @param {!Position} position The starting
 *    horizontal and vertical position.
 * @param {!Size} size the size of the UI element to get a start
 *    position for.
 * @param {number} horizontalPadding The horizontal padding to use.
 * @param {number} verticalPadding The vertical padding to use.
 * @param {!MetricsManager.UiMetrics} metrics The workspace UI metrics.
 * @param {!WorkspaceSvg} workspace The workspace.
 * @return {!Rect} The suggested start position.
 * @alias Blockly.uiPosition.getStartPositionRect
 * @package
 */
const getStartPositionRect = function(
    position, size, horizontalPadding, verticalPadding, metrics, workspace) {
  // Horizontal positioning.
  let left = 0;
  const hasVerticalScrollbar =
      workspace.scrollbar && workspace.scrollbar.canScrollVertically();
  if (position.horizontal === horizontalPosition.LEFT) {
    left = metrics.absoluteMetrics.left + horizontalPadding;
    if (hasVerticalScrollbar && workspace.RTL) {
      left += Scrollbar.scrollbarThickness;
    }
  } else {  // position.horizontal === horizontalPosition.RIGHT
    left = metrics.absoluteMetrics.left + metrics.viewMetrics.width -
        size.width - horizontalPadding;
    if (hasVerticalScrollbar && !workspace.RTL) {
      left -= Scrollbar.scrollbarThickness;
    }
  }
  // Vertical positioning.
  let top = 0;
  if (position.vertical === verticalPosition.TOP) {
    top = metrics.absoluteMetrics.top + verticalPadding;
  } else {  // position.vertical === verticalPosition.BOTTOM
    top = metrics.absoluteMetrics.top + metrics.viewMetrics.height -
        size.height - verticalPadding;
    if (workspace.scrollbar && workspace.scrollbar.canScrollHorizontally()) {
      // The scrollbars are always positioned on the bottom if they exist.
      top -= Scrollbar.scrollbarThickness;
    }
  }
  return new Rect(top, top + size.height, left, left + size.width);
};
exports.getStartPositionRect = getStartPositionRect;

/**
 * Returns a corner position that is on the opposite side of the workspace from
 * the toolbox.
 * If in horizontal orientation, defaults to the bottom corner. If in vertical
 * orientation, defaults to the right corner.
 * @param {!WorkspaceSvg} workspace The workspace.
 * @param {!MetricsManager.UiMetrics} metrics The workspace metrics.
 * @return {!Position} The suggested corner position.
 * @alias Blockly.uiPosition.getCornerOppositeToolbox
 * @package
 */
const getCornerOppositeToolbox = function(workspace, metrics) {
  const leftCorner =
      metrics.toolboxMetrics.position !== toolbox.Position.LEFT &&
      (!workspace.horizontalLayout || workspace.RTL);
  const topCorner = metrics.toolboxMetrics.position === toolbox.Position.BOTTOM;
  const hPosition =
      leftCorner ? horizontalPosition.LEFT : horizontalPosition.RIGHT;
  const vPosition = topCorner ? verticalPosition.TOP : verticalPosition.BOTTOM;
  return {horizontal: hPosition, vertical: vPosition};
};
exports.getCornerOppositeToolbox = getCornerOppositeToolbox;

/**
 * Returns a position Rect based on a starting position that is bumped
 * so that it doesn't intersect with any of the provided savedPositions. This
 * method does not check that the bumped position is still within bounds.
 * @param {!Rect} startRect The starting position to use.
 * @param {number} margin The margin to use between elements when bumping.
 * @param {!bumpDirection} bumpDir The direction to bump if there is a collision
 *    with an existing UI element.
 * @param {!Array<!Rect>} savedPositions List of rectangles that
 *    represent the positions of UI elements already placed.
 * @return {!Rect} The suggested position rectangle.
 * @alias Blockly.uiPosition.bumpPositionRect
 * @package
 */
const bumpPositionRect = function(startRect, margin, bumpDir, savedPositions) {
  let top = startRect.top;
  const left = startRect.left;
  const width = startRect.right - startRect.left;
  const height = startRect.bottom - startRect.top;

  // Check for collision and bump if needed.
  let boundingRect = startRect;
  for (let i = 0; i < savedPositions.length; i++) {
    const otherEl = savedPositions[i];
    if (boundingRect.intersects(otherEl)) {
      if (bumpDir === bumpDirection.UP) {
        top = otherEl.top - height - margin;
      } else {  // bumpDir === bumpDirection.DOWN
        top = otherEl.bottom + margin;
      }
      // Recheck other savedPositions
      boundingRect = new Rect(top, top + height, left, left + width);
      i = -1;
    }
  }
  return boundingRect;
};
exports.bumpPositionRect = bumpPositionRect;
