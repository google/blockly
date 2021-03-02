/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview The interface for a positionable ui element.
 * @author kozbial@google.com (Monica Kozbial)
 */

'use strict';

goog.provide('Blockly.IPositionable');


/**
 * Interface for a component that is positioned on top of the workspace.
 * @interface
 */
Blockly.IPositionable = function() {};

/**
 * Positions the element. Called when the window is resized.
 * @param {!Blockly.MetricsManager.ContainerRegion} viewMetrics The workspace
 *     viewMetrics.
 * @param {!Blockly.MetricsManager.AbsoluteMetrics} absoluteMetrics The absolute
 *     metrics for the workspace.
 * @param {!Blockly.MetricsManager.ToolboxMetrics} toolboxMetrics The toolbox
 *     metrics for the workspace.
 * @param {!Array<Blockly.utils.Rect>} savedPositions List of rectangles that
 *     are already on the workspace.
 */
Blockly.IPositionable.prototype.position;

/**
 * Returns the bounding rectangle of the UI element in pixel units relative to
 * the Blockly injection div.
 * @returns {!Blockly.utils.Rect} The plugin’s bounding box.
 */
Blockly.IPositionable.prototype.getBoundingRectangle;
