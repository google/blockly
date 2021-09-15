/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Utilities for bumping objects back into worksapce bounds.
 * @author fenichel@google.com (Rachel Fenichel)
 */
'use strict';

goog.module('Blockly.bumpObjects');

/* eslint-disable-next-line no-unused-vars */
const BlockSvg = goog.requireType('Blockly.BlockSvg');
/* eslint-disable-next-line no-unused-vars */
const Events = goog.require('Blockly.Events');
/* eslint-disable-next-line no-unused-vars */
const IBoundedElement = goog.requireType('Blockly.IBoundedElement');
/* eslint-disable-next-line no-unused-vars */
const MetricsManager = goog.requireType('Blockly.MetricsManager');
/* eslint-disable-next-line no-unused-vars */
const WorkspaceCommentSvg = goog.requireType('Blockly.WorkspaceCommentSvg');
/* eslint-disable-next-line no-unused-vars */
const WorkspaceSvg = goog.requireType('Blockly.WorkspaceSvg');
const mathUtils = goog.require('Blockly.utils.math');


/**
 * Bumps the given object that has passed out of bounds.
 * @param {!WorkspaceSvg} workspace The workspace containing the object.
 * @param {!MetricsManager.ContainerRegion} scrollMetrics Scroll metrics
 *    in workspace coordinates.
 * @param {!IBoundedElement} object The object to bump.
 * @return {boolean} True if block was bumped.
 */
const bumpObjectIntoBounds = function(workspace, scrollMetrics, object) {
  // Compute new top/left position for object.
  const objectMetrics = object.getBoundingRectangle();
  const height = objectMetrics.bottom - objectMetrics.top;
  const width = objectMetrics.right - objectMetrics.left;

  const topClamp = scrollMetrics.top;
  const scrollMetricsBottom = scrollMetrics.top + scrollMetrics.height;
  const bottomClamp = scrollMetricsBottom - height;
  // If the object is taller than the workspace we want to
  // top-align the block
  const newYPosition =
      mathUtils.clamp(topClamp, objectMetrics.top, bottomClamp);
  const deltaY = newYPosition - objectMetrics.top;

  // Note: Even in RTL mode the "anchor" of the object is the
  // top-left corner of the object.
  let leftClamp = scrollMetrics.left;
  const scrollMetricsRight = scrollMetrics.left + scrollMetrics.width;
  let rightClamp = scrollMetricsRight - width;
  if (workspace.RTL) {
    // If the object is wider than the workspace and we're in RTL
    // mode we want to right-align the block, which means setting
    // the left clamp to match.
    leftClamp = Math.min(rightClamp, leftClamp);
  } else {
    // If the object is wider than the workspace and we're in LTR
    // mode we want to left-align the block, which means setting
    // the right clamp to match.
    rightClamp = Math.max(leftClamp, rightClamp);
  }
  const newXPosition =
      mathUtils.clamp(leftClamp, objectMetrics.left, rightClamp);
  const deltaX = newXPosition - objectMetrics.left;

  if (deltaX || deltaY) {
    object.moveBy(deltaX, deltaY);
    return true;
  }
  return false;
};
exports.bumpIntoBounds = bumpObjectIntoBounds;

/**
 * Creates a handler for bumping objects when they cross fixed bounds.
 * @param {!WorkspaceSvg} workspace The workspace to handle.
 * @return {function(Events.Abstract)} The event handler.
 */
const bumpIntoBoundsHandler = function(workspace) {
  return function(e) {
    const metricsManager = workspace.getMetricsManager();
    if (!metricsManager.hasFixedEdges() || workspace.isDragging()) {
      return;
    }

    if (Events.BUMP_EVENTS.indexOf(e.type) !== -1) {
      const scrollMetricsInWsCoords = metricsManager.getScrollMetrics(true);

      // Triggered by move/create event
      const object = extractObjectFromEvent(workspace, e);
      if (!object) {
        return;
      }
      // Handle undo.
      const oldGroup = Events.getGroup();
      Events.setGroup(e.group);

      const wasBumped = bumpObjectIntoBounds(
          workspace, scrollMetricsInWsCoords,
          /** @type {!IBoundedElement} */ (object));

      if (wasBumped && !e.group) {
        console.warn(
            'Moved object in bounds but there was no' +
            ' event group. This may break undo.');
      }
      if (oldGroup !== null) {
        Events.setGroup(oldGroup);
      }
    } else if (e.type === Events.VIEWPORT_CHANGE) {
      const viewportEvent = /** @type {!Events.ViewportChange} */ (e);
      if (viewportEvent.scale > viewportEvent.oldScale) {
        bumpTopObjectsIntoBounds(workspace);
      }
    }
  };
};
exports.bumpIntoBoundsHandler = bumpIntoBoundsHandler;

/**
 * Extracts the object from the given event.
 * @param {!WorkspaceSvg} workspace The workspace the event originated
 *    from.
 * @param {!Events.BumpEvent} e An event containing an object.
 * @return {?BlockSvg|?WorkspaceCommentSvg} The extracted
 *    object.
 */
const extractObjectFromEvent = function(workspace, e) {
  let object = null;
  switch (e.type) {
    case Events.BLOCK_CREATE:
    case Events.BLOCK_MOVE:
      object = workspace.getBlockById(e.blockId);
      if (object) {
        object = object.getRootBlock();
      }
      break;
    case Events.COMMENT_CREATE:
    case Events.COMMENT_MOVE:
      object = (
          /** @type {?WorkspaceCommentSvg} */
          (workspace.getCommentById(e.commentId)));
      break;
  }
  return object;
};

/**
 * Bumps the top objects in the given workspace into bounds.
 * @param {!WorkspaceSvg} workspace The workspace.
 */
const bumpTopObjectsIntoBounds = function(workspace) {
  const metricsManager = workspace.getMetricsManager();
  if (!metricsManager.hasFixedEdges() || workspace.isDragging()) {
    return;
  }

  const scrollMetricsInWsCoords = metricsManager.getScrollMetrics(true);
  const topBlocks = workspace.getTopBoundedElements();
  for (let i = 0, block; (block = topBlocks[i]); i++) {
    bumpObjectIntoBounds(workspace, scrollMetricsInWsCoords, block);
  }
};
exports.bumpTopObjectsIntoBounds = bumpTopObjectsIntoBounds;
