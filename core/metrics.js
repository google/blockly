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

goog.provide('Blockly.Metrics');


Blockly.Metrics = function(workspace) {
  this.workspace_ = workspace;
};

/**
 * Get the content dimensions of the given workspace, taking into account
 * whether or not it is scrollable and what size the workspace div is on screen.
 * TODO: Redo comment.
 * @param {!Object} viewMetrics  An object containing height and width attributes in
 *     CSS pixels.  Together they specify the size of the visible workspace, not
 *     including areas covered up by the toolbox.
 * @return {!Object} The dimensions of the contents of the given workspace, as
 *     an object containing at least
 *     - height and width in pixels
 *     - left and top in pixels relative to the workspace origin.
 * @private
 */
Blockly.Metrics.prototype.getContentDimensions_ = function(viewMetrics) {
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
 * @private
 */
Blockly.Metrics.prototype.getDimensionsPx_ = function(elem) {
  var width = 0;
  var height = 0;
  if (elem) {
    width = elem.getWidth();
    height = elem.getHeight();
  }
  return new Blockly.utils.Size(width, height);
};

/**
 * Calculate the size of a scrollable workspace, which should include room for a
 * half screen border around the workspace contents.
 * @param {!Object} viewMetrics An object containing height and width attributes in
 *     CSS pixels.  Together they specify the size of the visible workspace, not
 *     including areas covered up by the toolbox.
 * @return {!Object} The dimensions of the contents of the given workspace, as
 *     an object containing
 *     - height and width in pixels
 *     - left and top in pixels relative to the workspace origin.
 * @private
 */
Blockly.Metrics.prototype.getContentDimensionsBounded_ = function(viewMetrics) {
  var content = this.getContentDimensionsExact_();

  // View height and width are both in pixels, and are the same as the SVG size.
  var viewWidth = viewMetrics.width;
  var viewHeight = viewMetrics.height;
  var halfWidth = viewWidth / 2;
  var halfHeight = viewHeight / 2;

  // Add a border around the content that is at least half a screen wide.
  // Ensure border is wide enough that blocks can scroll over entire screen.
  var left = Math.min(content.left - halfWidth, content.right - viewWidth);
  var right = Math.max(content.right + halfWidth, content.left + viewWidth);

  var top = Math.min(content.top - halfHeight, content.bottom - viewHeight);
  var bottom = Math.max(content.bottom + halfHeight, content.top + viewHeight);

  return {
    left: left,
    top: top,
    height: bottom - top,
    width: right - left
  };
};


/**
 * Get the bounding box for all workspace contents, in pixels.
 * @return {!Object} The dimensions of the contents of the given workspace, as
 *     an object containing
 *     - height and width in pixels
 *     - left, right, top and bottom in pixels relative to the workspace origin.
 * @private
 */
Blockly.Metrics.prototype.getContentDimensionsExact_ = function() {
  // Block bounding box is in workspace coordinates.
  var blockBox = this.workspace_.getBlocksBoundingBox();
  var scale = this.workspace_.scale;

  // Convert to pixels.
  var top = blockBox.top * scale;
  var bottom = blockBox.bottom * scale;
  var left = blockBox.left * scale;
  var right = blockBox.right * scale;

  return {
    top: top,
    bottom: bottom,
    left: left,
    right: right,
    width: right - left,
    height: bottom - top
  };
};

Blockly.Metrics.prototype.getFlyoutMetrics = function() {
  var flyoutDimensions =
    this.getDimensionsPx_(this.workspace_.flyout_);
  return {
    width: flyoutDimensions.width,
    height: flyoutDimensions.height
  };
};

Blockly.Metrics.prototype.getToolboxMetrics = function() {
  var toolboxDimensions =
      this.getDimensionsPx_(this.workspace_.toolbox_);

  return {
    width: toolboxDimensions.width,
    height: toolboxDimensions.height,
    position: this.workspace_.toolboxPosition
  };
};


Blockly.Metrics.prototype.getSVGMetrics = function() {
  var svgSize = Blockly.svgSize(this.workspace_.getParentSvg());
  return {
    height: svgSize.height,
    width: svgSize.width,
  };
};

Blockly.Metrics.prototype.getAbsoluteMetrics = function() {
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

Blockly.Metrics.prototype.getViewSize_ = function() {
  var svgSize = this.getSVGMetrics();
  return {height: svgSize.height, width: svgSize.width};
};

Blockly.Metrics.prototype.getViewMetrics = function(getWorkspaceCoordinates) {
  var scale = getWorkspaceCoordinates ? this.workspace_.scale : 1;
  var viewSize = this.getViewSize_();
  var toolboxMetrics = this.getToolboxMetrics();
  var flyoutMetrics = this.getFlyoutMetrics();
  var toolboxPosition = this.workspace_.toolboxPosition;

  if (this.workspace_.toolbox_) {
    if (toolboxPosition == Blockly.TOOLBOX_AT_TOP ||
        toolboxPosition == Blockly.TOOLBOX_AT_BOTTOM) {
      viewSize.height -= toolboxMetrics.height;
    } else if (toolboxPosition == Blockly.TOOLBOX_AT_LEFT ||
        toolboxPosition == Blockly.TOOLBOX_AT_RIGHT) {
      viewSize.width -= toolboxMetrics.width;
    }
  } else if (this.workspace_.flyout_) {
    if (toolboxPosition == Blockly.TOOLBOX_AT_TOP ||
      toolboxPosition == Blockly.TOOLBOX_AT_BOTTOM) {
      viewSize.height -= flyoutMetrics.height;
    } else if (toolboxPosition == Blockly.TOOLBOX_AT_LEFT ||
      toolboxPosition == Blockly.TOOLBOX_AT_RIGHT) {
      viewSize.width -= flyoutMetrics.width;
    }
  }
  return {
    height: viewSize.height / scale,
    width: viewSize.width / scale,
    top: -this.workspace_.scrollY / scale,
    left: -this.workspace_.scrollX / scale,
  };
};

Blockly.Metrics.prototype.getContentMetrics = function(getWorkspaceCoordinates) {
  var scale = getWorkspaceCoordinates ? this.workspace_.scale : 1;
  var viewSize = this.getViewMetrics();
  var contentDimensions =
    this.getContentDimensions_(viewSize);

  return {
    height: contentDimensions.height / scale,
    width: contentDimensions.width / scale,
    top: contentDimensions.top / scale,
    left: contentDimensions.left / scale,
  };
};

Blockly.Metrics.prototype.getMetrics = function() {
  var contentMetrics = this.getContentMetrics();
  var viewMetrics = this.getViewMetrics();
  var svgMetrics = this.getSVGMetrics();
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
