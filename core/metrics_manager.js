/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Calculates and reports workspace metrics.
 * @author aschmiedt@google.com (Abby Schmiedt)
 */
'use strict';

goog.provide('Blockly.FlyoutMetricsManager');
goog.provide('Blockly.MetricsManager');

goog.require('Blockly.IMetricsManager');
goog.require('Blockly.registry');
goog.require('Blockly.utils.Size');
goog.require('Blockly.utils.toolbox');

goog.requireType('Blockly.IFlyout');
goog.requireType('Blockly.IToolbox');
goog.requireType('Blockly.utils.Metrics');
goog.requireType('Blockly.WorkspaceSvg');


/**
 * The manager for all workspace metrics calculations.
 * @param {!Blockly.WorkspaceSvg} workspace The workspace to calculate metrics
 *     for.
 * @implements {Blockly.IMetricsManager}
 * @constructor
 */
Blockly.MetricsManager = function(workspace) {
  /**
   * The workspace to calculate metrics for.
   * @type {!Blockly.WorkspaceSvg}
   * @protected
   */
  this.workspace_ = workspace;
};

/**
 * Describes the width, height and location of the toolbox on the main
 * workspace.
 * @typedef {{
 *            width: number,
 *            height: number,
 *            position: !Blockly.utils.toolbox.Position
 *          }}
 */
Blockly.MetricsManager.ToolboxMetrics;

/**
 * Describes where the viewport starts in relation to the workspace SVG.
 * @typedef {{
 *            left: number,
 *            top: number
 *          }}
 */
Blockly.MetricsManager.AbsoluteMetrics;


/**
 * All the measurements needed to describe the size and location of a container.
 * @typedef {{
 *            height: number,
 *            width: number,
 *            top: number,
 *            left: number
 *          }}
 */
Blockly.MetricsManager.ContainerRegion;

/**
 * Describes fixed edges of the workspace.
 * @typedef {{
 *            top: (number|undefined),
 *            bottom: (number|undefined),
 *            left: (number|undefined),
 *            right: (number|undefined)
 *          }}
 */
Blockly.MetricsManager.FixedEdges;

/**
 * Common metrics used for UI elements.
 * @typedef {{
 *            viewMetrics: !Blockly.MetricsManager.ContainerRegion,
 *            absoluteMetrics: !Blockly.MetricsManager.AbsoluteMetrics,
 *            toolboxMetrics: !Blockly.MetricsManager.ToolboxMetrics
 *          }}
 */
Blockly.MetricsManager.UiMetrics;

/**
 * Gets the dimensions of the given workspace component, in pixel coordinates.
 * @param {?Blockly.IToolbox|?Blockly.IFlyout} elem The element to get the
 *     dimensions of, or null.  It should be a toolbox or flyout, and should
 *     implement getWidth() and getHeight().
 * @return {!Blockly.utils.Size} An object containing width and height
 *     attributes, which will both be zero if elem did not exist.
 * @protected
 */
Blockly.MetricsManager.prototype.getDimensionsPx_ = function(elem) {
  var width = 0;
  var height = 0;
  if (elem) {
    width = elem.getWidth();
    height = elem.getHeight();
  }
  return new Blockly.utils.Size(width, height);
};

/**
 * Gets the width and the height of the flyout on the workspace in pixel
 * coordinates. Returns 0 for the width and height if the workspace has a
 * category toolbox instead of a simple toolbox.
 * @param {boolean=} opt_own Whether to only return the workspace's own flyout.
 * @return {!Blockly.MetricsManager.ToolboxMetrics} The width and height of the
 *     flyout.
 * @public
 */
Blockly.MetricsManager.prototype.getFlyoutMetrics = function(opt_own) {
  var flyoutDimensions =
      this.getDimensionsPx_(this.workspace_.getFlyout(opt_own));
  return {
    width: flyoutDimensions.width,
    height: flyoutDimensions.height,
    position: this.workspace_.toolboxPosition
  };
};

/**
 * Gets the width, height and position of the toolbox on the workspace in pixel
 * coordinates. Returns 0 for the width and height if the workspace has a simple
 * toolbox instead of a category toolbox. To get the width and height of a
 * simple toolbox @see {@link getFlyoutMetrics}.
 * @return {!Blockly.MetricsManager.ToolboxMetrics} The object with the width,
 *     height and position of the toolbox.
 * @public
 */
Blockly.MetricsManager.prototype.getToolboxMetrics = function() {
  var toolboxDimensions = this.getDimensionsPx_(this.workspace_.getToolbox());

  return {
    width: toolboxDimensions.width,
    height: toolboxDimensions.height,
    position: this.workspace_.toolboxPosition
  };
};

/**
 * Gets the width and height of the workspace's parent SVG element in pixel
 * coordinates. This area includes the toolbox and the visible workspace area.
 * @return {!Blockly.utils.Size} The width and height of the workspace's parent
 *     SVG element.
 * @public
 */
Blockly.MetricsManager.prototype.getSvgMetrics = function() {
  return this.workspace_.getCachedParentSvgSize();
};

/**
 * Gets the absolute left and absolute top in pixel coordinates.
 * This is where the visible workspace starts in relation to the SVG container.
 * @return {!Blockly.MetricsManager.AbsoluteMetrics} The absolute metrics for
 *     the workspace.
 * @public
 */
Blockly.MetricsManager.prototype.getAbsoluteMetrics = function() {
  var absoluteLeft = 0;
  var toolboxMetrics = this.getToolboxMetrics();
  var flyoutMetrics = this.getFlyoutMetrics(true);
  var doesToolboxExist = !!this.workspace_.getToolbox();
  var doesFlyoutExist = !!this.workspace_.getFlyout(true);
  var toolboxPosition =
      doesToolboxExist ? toolboxMetrics.position : flyoutMetrics.position;

  var atLeft = toolboxPosition == Blockly.utils.toolbox.Position.LEFT;
  var atTop = toolboxPosition == Blockly.utils.toolbox.Position.TOP;
  if (doesToolboxExist && atLeft) {
    absoluteLeft = toolboxMetrics.width;
  } else if (doesFlyoutExist && atLeft) {
    absoluteLeft = flyoutMetrics.width;
  }
  var absoluteTop = 0;
  if (doesToolboxExist && atTop) {
    absoluteTop = toolboxMetrics.height;
  } else if (doesFlyoutExist && atTop) {
    absoluteTop = flyoutMetrics.height;
  }

  return {
    top: absoluteTop,
    left: absoluteLeft,
  };
};

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
Blockly.MetricsManager.prototype.getViewMetrics = function(
    opt_getWorkspaceCoordinates) {
  var scale = opt_getWorkspaceCoordinates ? this.workspace_.scale : 1;
  var svgMetrics = this.getSvgMetrics();
  var toolboxMetrics = this.getToolboxMetrics();
  var flyoutMetrics = this.getFlyoutMetrics(true);
  var doesToolboxExist = !!this.workspace_.getToolbox();
  var toolboxPosition =
      doesToolboxExist ? toolboxMetrics.position : flyoutMetrics.position;

  if (this.workspace_.getToolbox()) {
    if (toolboxPosition == Blockly.utils.toolbox.Position.TOP ||
        toolboxPosition == Blockly.utils.toolbox.Position.BOTTOM) {
      svgMetrics.height -= toolboxMetrics.height;
    } else if (toolboxPosition == Blockly.utils.toolbox.Position.LEFT ||
        toolboxPosition == Blockly.utils.toolbox.Position.RIGHT) {
      svgMetrics.width -= toolboxMetrics.width;
    }
  } else if (this.workspace_.getFlyout(true)) {
    if (toolboxPosition == Blockly.utils.toolbox.Position.TOP ||
        toolboxPosition == Blockly.utils.toolbox.Position.BOTTOM) {
      svgMetrics.height -= flyoutMetrics.height;
    } else if (toolboxPosition == Blockly.utils.toolbox.Position.LEFT ||
        toolboxPosition == Blockly.utils.toolbox.Position.RIGHT) {
      svgMetrics.width -= flyoutMetrics.width;
    }
  }
  return {
    height: svgMetrics.height / scale,
    width: svgMetrics.width / scale,
    top: -this.workspace_.scrollY / scale,
    left: -this.workspace_.scrollX / scale,
  };
};

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
Blockly.MetricsManager.prototype.getContentMetrics = function(
    opt_getWorkspaceCoordinates) {
  var scale = opt_getWorkspaceCoordinates ? 1 : this.workspace_.scale;

  // Block bounding box is in workspace coordinates.
  var blockBox = this.workspace_.getBlocksBoundingBox();

  return {
    height: (blockBox.bottom - blockBox.top) * scale,
    width: (blockBox.right - blockBox.left) * scale,
    top: blockBox.top * scale,
    left: blockBox.left * scale,
  };
};

/**
 * Returns whether the scroll area has fixed edges.
 * @return {boolean} Whether the scroll area has fixed edges.
 * @package
 */
Blockly.MetricsManager.prototype.hasFixedEdges = function() {
  // This exists for optimization of bump logic.
  return !this.workspace_.isMovableHorizontally() ||
      !this.workspace_.isMovableVertically();
};

/**
 * Computes the fixed edges of the scroll area.
 * @param {!Blockly.MetricsManager.ContainerRegion=} opt_viewMetrics The view
 *     metrics if they have been previously computed. Passing in null may cause
 *     the view metrics to be computed again, if it is needed.
 * @return {!Blockly.MetricsManager.FixedEdges} The fixed edges of the scroll
 *     area.
 * @protected
 */
Blockly.MetricsManager.prototype.getComputedFixedEdges_ = function(
    opt_viewMetrics) {
  if (!this.hasFixedEdges()) {
    // Return early if there are no edges.
    return {};
  }

  var hScrollEnabled = this.workspace_.isMovableHorizontally();
  var vScrollEnabled = this.workspace_.isMovableVertically();

  var viewMetrics = opt_viewMetrics || this.getViewMetrics(false);

  var edges = {};
  if (!vScrollEnabled) {
    edges.top = viewMetrics.top;
    edges.bottom = viewMetrics.top + viewMetrics.height;
  }
  if (!hScrollEnabled) {
    edges.left = viewMetrics.left;
    edges.right = viewMetrics.left + viewMetrics.width;
  }
  return edges;
};

/**
 * Returns the content area with added padding.
 * @param {!Blockly.MetricsManager.ContainerRegion} viewMetrics The view
 *     metrics.
 * @param {!Blockly.MetricsManager.ContainerRegion} contentMetrics The content
 *     metrics.
 * @return {{top: number, bottom: number, left: number, right: number}} The
 *     padded content area.
 * @protected
 */
Blockly.MetricsManager.prototype.getPaddedContent_ = function(
    viewMetrics, contentMetrics) {
  var contentBottom = contentMetrics.top + contentMetrics.height;
  var contentRight = contentMetrics.left + contentMetrics.width;

  var viewWidth = viewMetrics.width;
  var viewHeight = viewMetrics.height;
  var halfWidth = viewWidth / 2;
  var halfHeight = viewHeight / 2;

  // Add a padding around the content that is at least half a screen wide.
  // Ensure padding is wide enough that blocks can scroll over entire screen.
  var top =
      Math.min(contentMetrics.top - halfHeight, contentBottom - viewHeight);
  var left =
      Math.min(contentMetrics.left - halfWidth, contentRight - viewWidth);
  var bottom =
      Math.max(contentBottom + halfHeight, contentMetrics.top + viewHeight);
  var right =
      Math.max(contentRight + halfWidth, contentMetrics.left + viewWidth);

  return {top: top, bottom: bottom, left: left, right: right};
};

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
 *    container.
 */
Blockly.MetricsManager.prototype.getScrollMetrics = function(
    opt_getWorkspaceCoordinates, opt_viewMetrics, opt_contentMetrics) {
  var scale = opt_getWorkspaceCoordinates ? this.workspace_.scale : 1;
  var viewMetrics = opt_viewMetrics || this.getViewMetrics(false);
  var contentMetrics = opt_contentMetrics || this.getContentMetrics();
  var fixedEdges = this.getComputedFixedEdges_(viewMetrics);

  // Add padding around content.
  var paddedContent = this.getPaddedContent_(viewMetrics, contentMetrics);

  // Use combination of fixed bounds and padded content to make scroll area.
  var top = fixedEdges.top !== undefined ?
      fixedEdges.top : paddedContent.top;
  var left = fixedEdges.left !== undefined ?
      fixedEdges.left : paddedContent.left;
  var bottom = fixedEdges.bottom !== undefined ?
      fixedEdges.bottom : paddedContent.bottom;
  var right = fixedEdges.right !== undefined ?
      fixedEdges.right : paddedContent.right;

  return {
    top: top / scale,
    left: left / scale,
    width: (right - left) / scale,
    height: (bottom - top) / scale,
  };
};

/**
 * Returns common metrics used by UI elements.
 * @return {!Blockly.MetricsManager.UiMetrics} The UI metrics.
 */
Blockly.MetricsManager.prototype.getUiMetrics = function() {
  return {
    viewMetrics: this.getViewMetrics(),
    absoluteMetrics: this.getAbsoluteMetrics(),
    toolboxMetrics: this.getToolboxMetrics()
  };
};

/**
 * Returns an object with all the metrics required to size scrollbars for a
 * top level workspace.  The following properties are computed:
 * Coordinate system: pixel coordinates, -left, -up, +right, +down
 * .viewHeight: Height of the visible portion of the workspace.
 * .viewWidth: Width of the visible portion of the workspace.
 * .contentHeight: Height of the content.
 * .contentWidth: Width of the content.
 * .scrollHeight: Height of the scroll area.
 * .scrollWidth: Width of the scroll area.
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
 * .scrollTop: Top-edge of the scroll area, relative to the workspace origin.
 * .scrollLeft: Left-edge of the scroll area relative to the workspace origin.
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
Blockly.MetricsManager.prototype.getMetrics = function() {
  var toolboxMetrics = this.getToolboxMetrics();
  var flyoutMetrics = this.getFlyoutMetrics(true);
  var svgMetrics = this.getSvgMetrics();
  var absoluteMetrics = this.getAbsoluteMetrics();
  var viewMetrics = this.getViewMetrics();
  var contentMetrics = this.getContentMetrics();
  var scrollMetrics = this.getScrollMetrics(false, viewMetrics, contentMetrics);

  return {
    contentHeight: contentMetrics.height,
    contentWidth: contentMetrics.width,
    contentTop: contentMetrics.top,
    contentLeft: contentMetrics.left,

    scrollHeight: scrollMetrics.height,
    scrollWidth: scrollMetrics.width,
    scrollTop: scrollMetrics.top,
    scrollLeft: scrollMetrics.left,

    viewHeight: viewMetrics.height,
    viewWidth: viewMetrics.width,
    viewTop: viewMetrics.top,
    viewLeft: viewMetrics.left,

    absoluteTop: absoluteMetrics.top,
    absoluteLeft: absoluteMetrics.left,

    svgHeight: svgMetrics.height,
    svgWidth: svgMetrics.width,

    toolboxWidth: toolboxMetrics.width,
    toolboxHeight: toolboxMetrics.height,
    toolboxPosition: toolboxMetrics.position,

    flyoutWidth: flyoutMetrics.width,
    flyoutHeight: flyoutMetrics.height
  };
};

Blockly.registry.register(
    Blockly.registry.Type.METRICS_MANAGER, Blockly.registry.DEFAULT,
    Blockly.MetricsManager);

/**
 * Calculates metrics for a flyout's workspace.
 * The metrics are mainly used to size scrollbars for the flyout.
 * @param {!Blockly.WorkspaceSvg} workspace The flyout's workspace.
 * @param {!Blockly.IFlyout} flyout The flyout.
 * @extends {Blockly.MetricsManager}
 * @constructor
 */
Blockly.FlyoutMetricsManager = function(workspace, flyout) {
  /**
   * The flyout that owns the workspace to calculate metrics for.
   * @type {!Blockly.IFlyout}
   * @protected
   */
  this.flyout_ = flyout;

  Blockly.FlyoutMetricsManager.superClass_.constructor.call(this, workspace);
};
Blockly.utils.object.inherits(
    Blockly.FlyoutMetricsManager, Blockly.MetricsManager);

/**
 * Gets the bounding box of the blocks on the flyout's workspace.
 * This is in workspace coordinates.
 * @return {!SVGRect|{height: number, y: number, width: number, x: number}} The
 *     bounding box of the blocks on the workspace.
 * @private
 */
Blockly.FlyoutMetricsManager.prototype.getBoundingBox_ = function() {
  try {
    var blockBoundingBox = this.workspace_.getCanvas().getBBox();
  } catch (e) {
    // Firefox has trouble with hidden elements (Bug 528969).
    // 2021 Update: It looks like this was fixed around Firefox 77 released in
    // 2020.
    var blockBoundingBox = {height: 0, y: 0, width: 0, x: 0};
  }
  return blockBoundingBox;
};

/**
 * @override
 */
Blockly.FlyoutMetricsManager.prototype.getContentMetrics = function(
    opt_getWorkspaceCoordinates) {
  // The bounding box is in workspace coordinates.
  var blockBoundingBox = this.getBoundingBox_();
  var scale = opt_getWorkspaceCoordinates ? 1 : this.workspace_.scale;

  return {
    height: blockBoundingBox.height * scale,
    width: blockBoundingBox.width * scale,
    top: blockBoundingBox.y * scale,
    left: blockBoundingBox.x * scale,
  };
};

/**
 * @override
 */
Blockly.FlyoutMetricsManager.prototype.getScrollMetrics = function(
    opt_getWorkspaceCoordinates, opt_viewMetrics, opt_contentMetrics) {
  var contentMetrics = opt_contentMetrics || this.getContentMetrics();
  var margin = this.flyout_.MARGIN * this.workspace_.scale;
  var scale = opt_getWorkspaceCoordinates ? this.workspace_.scale : 1;

  // The left padding isn't just the margin. Some blocks are also offset by
  // tabWidth so that value and statement blocks line up.
  // The contentMetrics.left value is equivalent to the variable left padding.
  var leftPadding = contentMetrics.left;

  return {
    height: (contentMetrics.height + 2 * margin) / scale,
    width: (contentMetrics.width + leftPadding + margin) / scale,
    top: 0,
    left: 0,
  };
};
