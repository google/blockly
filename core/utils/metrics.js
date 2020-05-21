/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Workspace metrics definitions.
 * @author samelh@google.com (Sam El-Husseini)
 */
'use strict';

goog.provide('Blockly.utils.Metrics');


/**
 * @record
 */
Blockly.utils.Metrics = function() {};

/**
 * Height of the visible portion of the workspace.
 * @type {number}
 */
Blockly.utils.Metrics.prototype.viewHeight;

/**
 * Width of the visible portion of the workspace.
 * @type {number}
 */
Blockly.utils.Metrics.prototype.viewWidth;

/**
 * Height of the content.
 * @type {number}
 */
Blockly.utils.Metrics.prototype.contentHeight;

/**
 * Width of the content.
 * @type {number}
 */
Blockly.utils.Metrics.prototype.contentWidth;

/**
 * Top-edge of the visible portion of the workspace, relative to the workspace
 * origin.
 * @type {number}
 */
Blockly.utils.Metrics.prototype.viewTop;

/**
 * Left-edge of the visible portion of the workspace, relative to the workspace
 * origin.
 * @type {number}
 */
Blockly.utils.Metrics.prototype.viewLeft;

/**
 * Top-edge of the content, relative to the workspace origin.
 * @type {number}
 */
Blockly.utils.Metrics.prototype.contentTop;

/**
 * Left-edge of the content relative to the workspace origin.
 * @type {number}
 */
Blockly.utils.Metrics.prototype.contentLeft;

/**
 * Top-edge of the visible portion of the workspace, relative to the blocklyDiv.
 * @type {number}
 */
Blockly.utils.Metrics.prototype.absoluteTop;

/**
 * Left-edge of the visible portion of the workspace, relative to the
 * blocklyDiv.
 * @type {number}
 */
Blockly.utils.Metrics.prototype.absoluteLeft;

/**
 * Height of the Blockly div (the view + the toolbox, simple of otherwise).
 * @type {number|undefined}
 */
Blockly.utils.Metrics.prototype.svgHeight;

/**
 * Width of the Blockly div (the view + the toolbox, simple or otherwise).
 * @type {number|undefined}
 */
Blockly.utils.Metrics.prototype.svgWidth;

/**
 * Width of the toolbox, if it exists.  Otherwise zero.
 * @type {number|undefined}
 */
Blockly.utils.Metrics.prototype.toolboxWidth;

/**
 * Height of the toolbox, if it exists.  Otherwise zero.
 * @type {number|undefined}
 */
Blockly.utils.Metrics.prototype.toolboxHeight;

/**
 * Top, bottom, left or right. Use TOOLBOX_AT constants to compare.
 * @type {number|undefined}
 */
Blockly.utils.Metrics.prototype.toolboxPosition;

/**
 * Width of the flyout if it is always open.  Otherwise zero.
 * @type {number|undefined}
 */
Blockly.utils.Metrics.prototype.flyoutWidth;

/**
 * Height of the flyout if it is always open.  Otherwise zero.
 * @type {number|undefined}
 */
Blockly.utils.Metrics.prototype.flyoutHeight;
