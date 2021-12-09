/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Workspace metrics definitions.
 */
'use strict';

/**
 * Workspace metrics definitions.
 * @namespace Blockly.utils.Metrics
 */
goog.module('Blockly.utils.Metrics');


/**
 * @record
 * @alias Blockly.utils.Metrics
 */
const Metrics = function() {};

/**
 * Height of the visible portion of the workspace.
 * @type {number}
 */
Metrics.prototype.viewHeight;

/**
 * Width of the visible portion of the workspace.
 * @type {number}
 */
Metrics.prototype.viewWidth;

/**
 * Height of the content.
 * @type {number}
 */
Metrics.prototype.contentHeight;

/**
 * Width of the content.
 * @type {number}
 */
Metrics.prototype.contentWidth;

/**
 * Height of the scroll area.
 * @type {number}
 */
Metrics.prototype.scrollHeight;

/**
 * Width of the scroll area.
 * @type {number}
 */
Metrics.prototype.scrollWidth;

/**
 * Top-edge of the visible portion of the workspace, relative to the workspace
 * origin.
 * @type {number}
 */
Metrics.prototype.viewTop;

/**
 * Left-edge of the visible portion of the workspace, relative to the workspace
 * origin.
 * @type {number}
 */
Metrics.prototype.viewLeft;

/**
 * Top-edge of the content, relative to the workspace origin.
 * @type {number}
 */
Metrics.prototype.contentTop;

/**
 * Left-edge of the content relative to the workspace origin.
 * @type {number}
 */
Metrics.prototype.contentLeft;

/**
 * Top-edge of the scroll area, relative to the workspace origin.
 * @type {number}
 */
Metrics.prototype.scrollTop;

/**
 * Left-edge of the scroll area relative to the workspace origin.
 * @type {number}
 */
Metrics.prototype.scrollLeft;

/**
 * Top-edge of the visible portion of the workspace, relative to the blocklyDiv.
 * @type {number}
 */
Metrics.prototype.absoluteTop;

/**
 * Left-edge of the visible portion of the workspace, relative to the
 * blocklyDiv.
 * @type {number}
 */
Metrics.prototype.absoluteLeft;

/**
 * Height of the Blockly div (the view + the toolbox, simple of otherwise).
 * @type {number}
 */
Metrics.prototype.svgHeight;

/**
 * Width of the Blockly div (the view + the toolbox, simple or otherwise).
 * @type {number}
 */
Metrics.prototype.svgWidth;

/**
 * Width of the toolbox, if it exists.  Otherwise zero.
 * @type {number}
 */
Metrics.prototype.toolboxWidth;

/**
 * Height of the toolbox, if it exists.  Otherwise zero.
 * @type {number}
 */
Metrics.prototype.toolboxHeight;

/**
 * Top, bottom, left or right. Use TOOLBOX_AT constants to compare.
 * @type {number}
 */
Metrics.prototype.toolboxPosition;

/**
 * Width of the flyout if it is always open.  Otherwise zero.
 * @type {number}
 */
Metrics.prototype.flyoutWidth;

/**
 * Height of the flyout if it is always open.  Otherwise zero.
 * @type {number}
 */
Metrics.prototype.flyoutHeight;

exports.Metrics = Metrics;
