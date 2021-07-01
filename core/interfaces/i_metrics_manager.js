/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview The interface for a metrics manager.
 * @author aschmiedt@google.com (Abby Schmiedt)
 */

'use strict';

goog.provide('Blockly.IMetricsManager');

goog.requireType('Blockly.MetricsManager');
goog.requireType('Blockly.utils.Metrics');
goog.requireType('Blockly.utils.Size');


/**
 * Interface for a metrics manager.
 * @interface
 */
Blockly.IMetricsManager = function() {};

/**
 * Returns whether the scroll area has fixed edges.
 * @return {boolean} Whether the scroll area has fixed edges.
 * @package
 */
Blockly.IMetricsManager.prototype.hasFixedEdges;

/**
 * Returns the metrics for the scroll area of the workspace.
 * @param {boolean=} opt_getWorkspaceCoordinates True to get the scroll metrics
 *     in workspace coordinates, false to get them in pixel coordinates.
 * @param {!Blockly.MetricsManager.ContainerRegion=} opt_viewMetrics The view
 *     metrics if they have been previously computed. Passing in null may cause
 *     the view metrics to be computed again, if it is needed.
 * @param {!Blockly.MetricsManager.ContainerRegion=} opt_contentMetrics The
 *     content metrics if they have been previously computed. Passing in null
 *     may cause the content metrics to be computed again, if it is needed.
 * @return {!Blockly.MetricsManager.ContainerRegion} The metrics for the scroll
 *    container
 */
Blockly.IMetricsManager.prototype.getScrollMetrics;

/**
 * Gets the width and the height of the flyout on the workspace in pixel
 * coordinates. Returns 0 for the width and height if the workspace has a
 * category toolbox instead of a simple toolbox.
 * @param {boolean=} opt_own Whether to only return the workspace's own flyout.
 * @return {!Blockly.MetricsManager.ToolboxMetrics} The width and height of the
 *     flyout.
 * @public
 */
Blockly.IMetricsManager.prototype.getFlyoutMetrics;

/**
 * Gets the width, height and position of the toolbox on the workspace in pixel
 * coordinates. Returns 0 for the width and height if the workspace has a simple
 * toolbox instead of a category toolbox. To get the width and height of a
 * simple toolbox @see {@link getFlyoutMetrics}.
 * @return {!Blockly.MetricsManager.ToolboxMetrics} The object with the width,
 *     height and position of the toolbox.
 * @public
 */
Blockly.IMetricsManager.prototype.getToolboxMetrics;

/**
 * Gets the width and height of the workspace's parent SVG element in pixel
 * coordinates. This area includes the toolbox and the visible workspace area.
 * @return {!Blockly.utils.Size} The width and height of the workspace's parent
 *     SVG element.
 * @public
 */
Blockly.IMetricsManager.prototype.getSvgMetrics;

/**
 * Gets the absolute left and absolute top in pixel coordinates.
 * This is where the visible workspace starts in relation to the SVG container.
 * @return {!Blockly.MetricsManager.AbsoluteMetrics} The absolute metrics for
 *     the workspace.
 * @public
 */
Blockly.IMetricsManager.prototype.getAbsoluteMetrics;

/**
 * Gets the metrics for the visible workspace in either pixel or workspace
 * coordinates. The visible workspace does not include the toolbox or flyout.
 * @param {boolean=} opt_getWorkspaceCoordinates True to get the view metrics in
 *     workspace coordinates, false to get them in pixel coordinates.
 * @return {!Blockly.MetricsManager.ContainerRegion} The width, height, top and
 *     left of the viewport in either workspace coordinates or pixel
 *     coordinates.
 * @public
 */
Blockly.IMetricsManager.prototype.getViewMetrics;

/**
 * Gets content metrics in either pixel or workspace coordinates.
 * The content area is a rectangle around all the top bounded elements on the
 * workspace (workspace comments and blocks).
 * @param {boolean=} opt_getWorkspaceCoordinates True to get the content metrics
 *     in workspace coordinates, false to get them in pixel coordinates.
 * @return {!Blockly.MetricsManager.ContainerRegion} The
 *     metrics for the content container.
 * @public
 */
Blockly.IMetricsManager.prototype.getContentMetrics;

/**
 * Returns an object with all the metrics required to size scrollbars for a
 * top level workspace.  The following properties are computed:
 * Coordinate system: pixel coordinates, -left, -up, +right, +down
 * .viewHeight: Height of the visible portion of the workspace.
 * .viewWidth: Width of the visible portion of the workspace.
 * .contentHeight: Height of the content.
 * .contentWidth: Width of the content.
 * .svgHeight: Height of the Blockly div (the view + the toolbox,
 *    simple or otherwise),
 * .svgWidth: Width of the Blockly div (the view + the toolbox,
 *    simple or otherwise),
 * .viewTop: Top-edge of the visible portion of the workspace, relative to
 *     the workspace origin.
 * .viewLeft: Left-edge of the visible portion of the workspace, relative to
 *     the workspace origin.
 * .contentTop: Top-edge of the content, relative to the workspace origin.
 * .contentLeft: Left-edge of the content relative to the workspace origin.
 * .absoluteTop: Top-edge of the visible portion of the workspace, relative
 *     to the blocklyDiv.
 * .absoluteLeft: Left-edge of the visible portion of the workspace, relative
 *     to the blocklyDiv.
 * .toolboxWidth: Width of the toolbox, if it exists.  Otherwise zero.
 * .toolboxHeight: Height of the toolbox, if it exists.  Otherwise zero.
 * .flyoutWidth: Width of the flyout if it is always open.  Otherwise zero.
 * .flyoutHeight: Height of the flyout if it is always open.  Otherwise zero.
 * .toolboxPosition: Top, bottom, left or right. Use TOOLBOX_AT constants to
 *     compare.
 * @return {!Blockly.utils.Metrics} Contains size and position metrics of a top
 *     level workspace.
 * @public
 */
Blockly.IMetricsManager.prototype.getMetrics;
