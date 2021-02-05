/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Manager for metrics.
 * @author aschmiedt@google.com (Abby Schmiedt)
 */
'use strict';

goog.provide('Blockly.MetricsManager');

goog.requireType('Blockly.utils.toolbox');

/**
 * The manager for all workspace metrics calculations.
 * @param {!Blockly.WorkspaceSvg} workspace The workspace to calculate metrics
 *     for.
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
 * TODO: REdo this comment.
 * The object returned returned that describes the toolbox metrics.
 * @typedef {{
 *            width:number,
 *            height:number,
 *            position:!Blockly.utils.toolbox.Position
 *          }}
 */
Blockly.MetricsManager.ToolboxMetrics;

/**
 * TODO: REdo this comment.
 * The object returned returned that describes the aboluste metrics.
 * @typedef {{
 *            left:number,
 *            top:number
 *          }}
 */
Blockly.MetricsManager.AbsoluteMetrics;


/**
 * TODO: REdo this comment.
 * The object returned returned that describes the aboluste metrics.
 * @typedef {{
 *            height:number,
 *            width:number,
 *            top:number,
 *            left:number
 *          }}
 */
Blockly.MetricsManager.ContainerSize;

/**
 * Gets the content dimensions of the given workspace, taking into account
 * whether or not it is scrollable and what size the workspace div is on screen.
 * TODO: Redo comment.
 * @param {!Blockly.MetricsManager.ContainerSize} viewMetrics  An object containing
 *     height and width attributes in CSS pixels.  Together they specify the
 *     size of the visible workspace, not including areas covered up by the
 *     toolbox.
 * @return {!Blockly.MetricsManager.ContainerSize} The dimensions of the contents of
 *     the given workspace, as an object containing at least
 *     - height and width in pixels
 *     - left and top in pixels relative to the workspace origin.
 * @protected
 */
Blockly.MetricsManager.prototype.getContentDimensions_ = function(viewMetrics) {
  if (this.workspace_.isContentBounded()) {
    return this.getContentDimensionsBounded_(viewMetrics);
  } else {
    return this.getContentDimensionsExact_();
  }
};

/**
 * Get the dimensions of the given workspace component, in pixels.
 * @param {Blockly.IToolbox|Blockly.IFlyout} elem The element to get the
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
 * Calculates the size of a scrollable workspace, which should include room for
 * a half screen border around the workspace contents.
 * @param {!Blockly.MetricsManager.ContainerSize} viewMetrics An object containing
 *     height and width attributes in CSS pixels.  Together they specify the
 *     size of the visible workspace, not including areas covered up by the
 *     toolbox.
 * @return {!Blockly.MetricsManager.ContainerSize} The dimensions of the contents of
 *     the given workspace, as an object containing
 *     - height and width in pixels
 *     - left and top in pixels relative to the workspace origin. (TODO: IS this
 * true?)
 * @protected
 */
Blockly.MetricsManager.prototype.getContentDimensionsBounded_ = function(viewMetrics) {
  var content = this.getContentDimensionsExact_();
  var contentRight = content.left + content.width;
  var contentBottom = content.top + content.height;

  // View height and width are both in pixels, and are the same as the SVG size.
  var viewWidth = viewMetrics.width;
  var viewHeight = viewMetrics.height;
  var halfWidth = viewWidth / 2;
  var halfHeight = viewHeight / 2;

  // Add a border around the content that is at least half a screen wide.
  // Ensure border is wide enough that blocks can scroll over entire screen.
  var left = Math.min(content.left - halfWidth, contentRight - viewWidth);
  var right = Math.max(contentRight + halfWidth, content.left + viewWidth);

  var top = Math.min(content.top - halfHeight, contentBottom - viewHeight);
  var bottom = Math.max(contentBottom + halfHeight, content.top + viewHeight);

  return {left: left, top: top, height: bottom - top, width: right - left};
};


/**
 * TODO: Fix comment
 * Gets the bounding box for all workspace contents, in pixels.
 * @return {!Blockly.MetricsManager.ContainerSize} The dimensions of the contents of
 *     the given workspace, as an object containing
 *     - height and width in pixels
 *     - left and top in pixels relative to the workspace origin.
 * @protected
 */
Blockly.MetricsManager.prototype.getContentDimensionsExact_ = function() {
  // Block bounding box is in workspace coordinates.
  var blockBox = this.workspace_.getBlocksBoundingBox();
  var scale = this.workspace_.scale;

  // Convert to pixels.
  var top = blockBox.top * scale;
  var bottom = blockBox.bottom * scale;
  var left = blockBox.left * scale;
  var right = blockBox.right * scale;

  return {top: top, left: left, width: right - left, height: bottom - top};
};

/**
 * Gets the width and the height of the flyout on the workspace. Returns 0
 * for the width and height if the workspace has a category toolbox instead of
 * a simple toolbox.
 * @return {!Blockly.utils.Size} The width and height of the flyout.
 * @public
 */
Blockly.MetricsManager.prototype.getFlyoutMetrics = function() {
  var flyoutDimensions = this.getDimensionsPx_(this.workspace_.flyout_);
  // TODO: Look at if this should be size or not?
  return new Blockly.utils.Size(
      flyoutDimensions.width, flyoutDimensions.height);
};

/**
 * Gets the width, height and position of the toolbox on the workspace. Returns
 * 0 for the width and height if the workspace has a simple toolbox instead of a
 * category toolbox. To get the width and height of a simple toolbox see
 * getFlyoutMetrics.
 * @return {!Blockly.MetricsManager.ToolboxMetrics} The object with the width, height
 *     and position of the toolbox.
 * @public
 */
Blockly.MetricsManager.prototype.getToolboxMetrics = function() {
  var toolboxDimensions = this.getDimensionsPx_(this.workspace_.toolbox_);

  return {
    width: toolboxDimensions.width,
    height: toolboxDimensions.height,
    position: this.workspace_.toolboxPosition
  };
};

/**
 * Gets the width and height of the workspace's parent svg element. This area
 * includes the toolbox and the visible workspace area.
 * @return {!Blockly.utils.Size} The width and height of the workspace's parent
 *     svg element.
 * @public
 */
Blockly.MetricsManager.prototype.getSvgMetrics = function() {
  var svgSize = Blockly.svgSize(this.workspace_.getParentSvg());
  return new Blockly.utils.Size(svgSize.width, svgSize.height);
};

/**
 * Gets the absolute left and absolute top.
 * This is where the visible workspace starts in relation to the svg container.
 * @return {!Blockly.MetricsManager.AbsoluteMetrics} The absolute metrics for the
 *     workspace.
 * @public
 */
Blockly.MetricsManager.prototype.getAbsoluteMetrics = function() {
  var absoluteLeft = 0;
  var toolboxMetrics = this.getToolboxMetrics();
  var flyoutMetrics = this.getFlyoutMetrics();
  var doesToolboxExist = !!this.workspace_.toolbox_;
  var toolboxPosition = this.workspace_.toolboxPosition;
  var doesFlyoutExist = !!this.workspace_.flyout_;

  if (doesToolboxExist && toolboxPosition == Blockly.TOOLBOX_AT_LEFT) {
    absoluteLeft = toolboxMetrics.width;
  } else if (doesFlyoutExist && toolboxPosition == Blockly.TOOLBOX_AT_LEFT) {
    absoluteLeft = flyoutMetrics.width;
  }
  var absoluteTop = 0;
  if (doesToolboxExist && toolboxPosition == Blockly.TOOLBOX_AT_TOP) {
    absoluteTop = toolboxMetrics.height;
  } else if (doesFlyoutExist && toolboxPosition == Blockly.TOOLBOX_AT_TOP) {
    absoluteTop = flyoutMetrics.height;
  }

  return {
    top: absoluteTop,
    left: absoluteLeft,
  };
};

// TODO: Update all types.
/**
 * Gets the metrics for the visible workspace. This does not include the
 * toolbox.
 * @param {boolean} getWorkspaceCoordinates True to get the view metrics in
 *     workspace coordinates, false to get them in pixel coordinates.
 * @return {!Blockly.MetricsManager.ContainerSize} The view metrics.
 * @public
 */
Blockly.MetricsManager.prototype.getViewMetrics = function(getWorkspaceCoordinates) {
  var scale = getWorkspaceCoordinates ? this.workspace_.scale : 1;
  var svgMetrics = this.getSvgMetrics();
  var toolboxMetrics = this.getToolboxMetrics();
  var flyoutMetrics = this.getFlyoutMetrics();
  var toolboxPosition = this.workspace_.toolboxPosition;

  if (this.workspace_.toolbox_) {
    if (toolboxPosition == Blockly.TOOLBOX_AT_TOP ||
        toolboxPosition == Blockly.TOOLBOX_AT_BOTTOM) {
      svgMetrics.height -= toolboxMetrics.height;
    } else if (
        toolboxPosition == Blockly.TOOLBOX_AT_LEFT ||
        toolboxPosition == Blockly.TOOLBOX_AT_RIGHT) {
      svgMetrics.width -= toolboxMetrics.width;
    }
  } else if (this.workspace_.flyout_) {
    if (toolboxPosition == Blockly.TOOLBOX_AT_TOP ||
        toolboxPosition == Blockly.TOOLBOX_AT_BOTTOM) {
      svgMetrics.height -= flyoutMetrics.height;
    } else if (
        toolboxPosition == Blockly.TOOLBOX_AT_LEFT ||
        toolboxPosition == Blockly.TOOLBOX_AT_RIGHT) {
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
 * Gets content metrics. This can mean two things:
 * If the workspace has a fixed width and height then the content area is
 * rectangle around all the top bounded elements on the workspace (workspace
 * comments and blocks).
 *
 * If the workspace does not have a fixed width and height then it is the
 * metrics of the area that content can be placed. This area is computed by
 * getting the rectangle around the top bounded elements and adding padding to
 * all sides.
 * @param {boolean} getWorkspaceCoordinates True to get the content metrics in
 *     workspace coordinates, false to get them in pixel coordinates.
 * @return {!Blockly.MetricsManager.ContainerSize} The
 *     metrics for the content container.
 * @public
 */
Blockly.MetricsManager.prototype.getContentMetrics = function(
    getWorkspaceCoordinates) {
  var scale = getWorkspaceCoordinates ? this.workspace_.scale : 1;
  var viewSize = this.getViewMetrics(false);
  var contentDimensions = this.getContentDimensions_(viewSize);

  return {
    height: contentDimensions.height / scale,
    width: contentDimensions.width / scale,
    top: contentDimensions.top / scale,
    left: contentDimensions.left / scale,
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
Blockly.MetricsManager.prototype.getMetrics = function() {
  var contentMetrics = this.getContentMetrics();
  var viewMetrics = this.getViewMetrics();
  var svgMetrics = this.getSvgMetrics();
  var absoluteMetrics = this.getAbsoluteMetrics();
  var toolboxMetrics = this.getToolboxMetrics();
  var flyoutMetrics = this.getFlyoutMetrics();
  return {
    contentHeight: contentMetrics.height,
    contentWidth: contentMetrics.width,
    contentTop: contentMetrics.top,
    contentLeft: contentMetrics.left,

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
