/**
 * @license
 * Copyright 2011 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Library for creating scrollbars.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Blockly.Scrollbar');
goog.provide('Blockly.ScrollbarPair');

goog.require('Blockly.browserEvents');
goog.require('Blockly.Events');
goog.require('Blockly.Touch');
goog.require('Blockly.utils');
goog.require('Blockly.utils.Coordinate');
goog.require('Blockly.utils.dom');
goog.require('Blockly.utils.Metrics');
goog.require('Blockly.utils.Svg');

goog.requireType('Blockly.WorkspaceSvg');


/**
 * A note on units: most of the numbers that are in CSS pixels are scaled if the
 * scrollbar is in a mutator.
 */

/**
 * Class for a pair of scrollbars.  Horizontal and vertical.
 * @param {!Blockly.WorkspaceSvg} workspace Workspace to bind the scrollbars to.
 * @param {boolean=} addHorizontal Whether to add a horizontal scrollbar.
 *    Defaults to true.
 * @param {boolean=} addVertical Whether to add a vertical scrollbar. Defaults
 *    to true.
 * @param {string=} opt_class A class to be applied to these scrollbars.
 * @param {number=} opt_margin The margin to apply to these scrollbars.
 * @constructor
 */
Blockly.ScrollbarPair = function(
    workspace, addHorizontal, addVertical, opt_class, opt_margin) {
  /**
   * The workspace this scrollbar pair is bound to.
   * @type {!Blockly.WorkspaceSvg}
   * @private
   */
  this.workspace_ = workspace;

  addHorizontal = addHorizontal === undefined ? true : addHorizontal;
  addVertical = addVertical === undefined ? true : addVertical;
  var isPair = addHorizontal && addVertical;

  if (addHorizontal) {
    this.hScroll = new Blockly.Scrollbar(
        workspace, true, isPair, opt_class, opt_margin);
  }
  if (addVertical) {
    this.vScroll = new Blockly.Scrollbar(
        workspace, false, isPair, opt_class, opt_margin);
  }

  if (isPair) {
    this.corner_ = Blockly.utils.dom.createSvgElement(
        Blockly.utils.Svg.RECT,
        {
          'height': Blockly.Scrollbar.scrollbarThickness,
          'width': Blockly.Scrollbar.scrollbarThickness,
          'class': 'blocklyScrollbarBackground'
        },
        null);
    Blockly.utils.dom.insertAfter(this.corner_, workspace.getBubbleCanvas());
  }

  /**
   * Previously recorded metrics from the workspace.
   * @type {?Blockly.utils.Metrics}
   * @private
   */
  this.oldHostMetrics_ = null;
};

/**
 * Dispose of this pair of scrollbars.
 * Unlink from all DOM elements to prevent memory leaks.
 * @suppress {checkTypes}
 */
Blockly.ScrollbarPair.prototype.dispose = function() {
  Blockly.utils.dom.removeNode(this.corner_);
  this.corner_ = null;
  this.workspace_ = null;
  this.oldHostMetrics_ = null;
  if (this.hScroll) {
    this.hScroll.dispose();
    this.hScroll = null;
  }
  if (this.vScroll) {
    this.vScroll.dispose();
    this.vScroll = null;
  }
};

/**
 * Recalculate both of the scrollbars' locations and lengths.
 * Also reposition the corner rectangle.
 */
Blockly.ScrollbarPair.prototype.resize = function() {
  // Look up the host metrics once, and use for both scrollbars.
  var hostMetrics = this.workspace_.getMetrics();
  if (!hostMetrics) {
    // Host element is likely not visible.
    return;
  }

  // Only change the scrollbars if there has been a change in metrics.
  var resizeH = false;
  var resizeV = false;
  if (!this.oldHostMetrics_ ||
      this.oldHostMetrics_.viewWidth != hostMetrics.viewWidth ||
      this.oldHostMetrics_.viewHeight != hostMetrics.viewHeight ||
      this.oldHostMetrics_.absoluteTop != hostMetrics.absoluteTop ||
      this.oldHostMetrics_.absoluteLeft != hostMetrics.absoluteLeft) {
    // The window has been resized or repositioned.
    resizeH = true;
    resizeV = true;
  } else {
    // Has the content been resized or moved?
    if (!this.oldHostMetrics_ ||
        this.oldHostMetrics_.scrollWidth != hostMetrics.scrollWidth ||
        this.oldHostMetrics_.viewLeft != hostMetrics.viewLeft ||
        this.oldHostMetrics_.scrollLeft != hostMetrics.scrollLeft) {
      resizeH = true;
    }
    if (!this.oldHostMetrics_ ||
        this.oldHostMetrics_.scrollHeight != hostMetrics.scrollHeight ||
        this.oldHostMetrics_.viewTop != hostMetrics.viewTop ||
        this.oldHostMetrics_.scrollTop != hostMetrics.scrollTop) {
      resizeV = true;
    }
  }

  if (resizeH || resizeV) {
    try {
      Blockly.Events.disable();
      if (this.hScroll && resizeH) {
        this.hScroll.resize(hostMetrics);
      }
      if (this.vScroll && resizeV) {
        this.vScroll.resize(hostMetrics);
      }
    } finally {
      Blockly.Events.enable();
    }
    this.workspace_.maybeFireViewportChangeEvent();
  }

  if (this.hScroll && this.vScroll) {
    // Reposition the corner square.
    if (!this.oldHostMetrics_ ||
        this.oldHostMetrics_.viewWidth != hostMetrics.viewWidth ||
        this.oldHostMetrics_.absoluteLeft != hostMetrics.absoluteLeft) {
      this.corner_.setAttribute('x', this.vScroll.position.x);
    }
    if (!this.oldHostMetrics_ ||
        this.oldHostMetrics_.viewHeight != hostMetrics.viewHeight ||
        this.oldHostMetrics_.absoluteTop != hostMetrics.absoluteTop) {
      this.corner_.setAttribute('y', this.hScroll.position.y);
    }
  }

  // Cache the current metrics to potentially short-cut the next resize event.
  this.oldHostMetrics_ = hostMetrics;
};

/**
 * Returns whether scrolling horizontally is enabled.
 * @return {boolean} True if horizontal scroll is enabled.
 */
Blockly.ScrollbarPair.prototype.canScrollHorizontally = function() {
  return !!this.hScroll;
};

/**
 * Returns whether scrolling vertically is enabled.
 * @return {boolean} True if vertical scroll is enabled.
 */
Blockly.ScrollbarPair.prototype.canScrollVertically = function() {
  return !!this.vScroll;
};

/**
 * Record the origin of the workspace that the scrollbar is in, in pixels
 * relative to the injection div origin. This is for times when the scrollbar is
 * used in an object whose origin isn't the same as the main workspace
 * (e.g. in a flyout.)
 * @param {number} x The x coordinate of the scrollbar's origin, in CSS pixels.
 * @param {number} y The y coordinate of the scrollbar's origin, in CSS pixels.
 * @package
 */
Blockly.ScrollbarPair.prototype.setOrigin = function(x, y) {
  if (this.hScroll) {
    this.hScroll.setOrigin(x, y);
  }
  if (this.vScroll) {
    this.vScroll.setOrigin(x, y);
  }
};

/**
 * Set the handles of both scrollbars.
 * @param {number} x The horizontal content displacement, relative to the view
 *    in pixels.
 * @param {number} y The vertical content displacement, relative to the view in
 *    pixels.
 * @param {boolean} updateMetrics Whether to update metrics on this set call.
 *    Defaults to true.
 */
Blockly.ScrollbarPair.prototype.set = function(x, y, updateMetrics) {
  // This function is equivalent to:
  //   this.hScroll.set(x);
  //   this.vScroll.set(y);
  // However, that calls setMetrics twice which causes a chain of
  // getAttribute->setAttribute->getAttribute resulting in an extra layout pass.
  // Combining them speeds up rendering.
  if (this.hScroll) {
    this.hScroll.set(x, false);
  }
  if (this.vScroll) {
    this.vScroll.set(y, false);
  }

  if (updateMetrics || updateMetrics === undefined) {
    // Update metrics.
    var xyRatio = {};
    if (this.hScroll) {
      xyRatio.x = this.hScroll.getRatio_();
    }
    if (this.vScroll) {
      xyRatio.y = this.vScroll.getRatio_();
    }
    this.workspace_.setMetrics(xyRatio);
  }
};

/**
 * Set the handle of the horizontal scrollbar to be at a certain position in
 *    CSS pixels relative to its parents.
 * @param {number} x Horizontal scroll value.
 */
Blockly.ScrollbarPair.prototype.setX = function(x) {
  if (this.hScroll) {
    this.hScroll.set(x, true);
  }
};

/**
 * Set the handle of the vertical scrollbar to be at a certain position in
 *    CSS pixels relative to its parents.
 * @param {number} y Vertical scroll value.
 */
Blockly.ScrollbarPair.prototype.setY = function(y) {
  if (this.vScroll) {
    this.vScroll.set(y, true);
  }
};

/**
 * Set whether this scrollbar's container is visible.
 * @param {boolean} visible Whether the container is visible.
 */
Blockly.ScrollbarPair.prototype.setContainerVisible = function(visible) {
  if (this.hScroll) {
    this.hScroll.setContainerVisible(visible);
  }
  if (this.vScroll) {
    this.vScroll.setContainerVisible(visible);
  }
};

/**
 * If any of the scrollbars are visible. Non-paired scrollbars may disappear
 * when they aren't needed.
 * @return {boolean} True if visible.
 */
Blockly.ScrollbarPair.prototype.isVisible = function() {
  var isVisible = false;
  if (this.hScroll) {
    isVisible = this.hScroll.isVisible();
  }
  if (this.vScroll) {
    isVisible = isVisible || this.vScroll.isVisible();
  }
  return isVisible;
};

/**
 * Recalculates the scrollbars' locations within their path and length.
 * This should be called when the contents of the workspace have changed.
 * @param {!Blockly.utils.Metrics} hostMetrics A data structure describing all
 *     the required dimensions, possibly fetched from the host object.
 */
Blockly.ScrollbarPair.prototype.resizeContent = function(hostMetrics) {
  if (this.hScroll) {
    this.hScroll.resizeContentHorizontal(hostMetrics);
  }
  if (this.vScroll) {
    this.vScroll.resizeContentVertical(hostMetrics);
  }
};

/**
 * Recalculates the scrollbars' locations on the screen and path length.
 * This should be called when the layout or size of the window has changed.
 * @param {!Blockly.utils.Metrics} hostMetrics A data structure describing all
 *     the required dimensions, possibly fetched from the host object.
 */
Blockly.ScrollbarPair.prototype.resizeView = function(hostMetrics) {
  if (this.hScroll) {
    this.hScroll.resizeViewHorizontal(hostMetrics);
  }
  if (this.vScroll) {
    this.vScroll.resizeViewVertical(hostMetrics);
  }
};

// --------------------------------------------------------------------

/**
 * Class for a pure SVG scrollbar.
 * This technique offers a scrollbar that is guaranteed to work, but may not
 * look or behave like the system's scrollbars.
 * @param {!Blockly.WorkspaceSvg} workspace Workspace to bind the scrollbar to.
 * @param {boolean} horizontal True if horizontal, false if vertical.
 * @param {boolean=} opt_pair True if scrollbar is part of a horiz/vert pair.
 * @param {string=} opt_class A class to be applied to this scrollbar.
 * @param {number=} opt_margin The margin to apply to this scrollbar.
 * @constructor
 */
Blockly.Scrollbar = function(
    workspace, horizontal, opt_pair, opt_class, opt_margin) {
  /**
   * The workspace this scrollbar is bound to.
   * @type {!Blockly.WorkspaceSvg}
   * @private
   */
  this.workspace_ = workspace;
  /**
   * Whether this scrollbar is part of a pair.
   * @type {boolean}
   * @private
   */
  this.pair_ = opt_pair || false;
  /**
   * Whether this is a horizontal scrollbar.
   * @type {boolean}
   * @private
   */
  this.horizontal_ = horizontal;
  /**
   * Margin around the scrollbar (between the scrollbar and the edge of the
   * viewport in pixels).
   * @type {number}
   * @const
   * @private
   */
  this.margin_ = (opt_margin !== undefined) ?
      opt_margin : Blockly.Scrollbar.DEFAULT_SCROLLBAR_MARGIN;
  /**
   * Previously recorded metrics from the workspace.
   * @type {?Blockly.utils.Metrics}
   * @private
   */
  this.oldHostMetrics_ = null;
  /**
   * The ratio of handle position offset to workspace content displacement.
   * @type {?number}
   * @package
   */
  this.ratio = null;

  this.createDom_(opt_class);

  /**
   * The upper left corner of the scrollbar's SVG group in CSS pixels relative
   * to the scrollbar's origin.  This is usually relative to the injection div
   * origin.
   * @type {Blockly.utils.Coordinate}
   * @package
   */
  this.position = new Blockly.utils.Coordinate(0, 0);

  // Store the thickness in a temp variable for readability.
  var scrollbarThickness = Blockly.Scrollbar.scrollbarThickness;
  if (horizontal) {
    this.svgBackground_.setAttribute('height', scrollbarThickness);
    this.outerSvg_.setAttribute('height', scrollbarThickness);
    this.svgHandle_.setAttribute('height', scrollbarThickness - 5);
    this.svgHandle_.setAttribute('y', 2.5);

    this.lengthAttribute_ = 'width';
    this.positionAttribute_ = 'x';
  } else {
    this.svgBackground_.setAttribute('width', scrollbarThickness);
    this.outerSvg_.setAttribute('width', scrollbarThickness);
    this.svgHandle_.setAttribute('width', scrollbarThickness - 5);
    this.svgHandle_.setAttribute('x', 2.5);

    this.lengthAttribute_ = 'height';
    this.positionAttribute_ = 'y';
  }
  var scrollbar = this;
  this.onMouseDownBarWrapper_ = Blockly.browserEvents.conditionalBind(
      this.svgBackground_, 'mousedown', scrollbar, scrollbar.onMouseDownBar_);
  this.onMouseDownHandleWrapper_ = Blockly.browserEvents.conditionalBind(
      this.svgHandle_, 'mousedown', scrollbar, scrollbar.onMouseDownHandle_);
};

/**
 * The location of the origin of the workspace that the scrollbar is in,
 * measured in CSS pixels relative to the injection div origin.  This is usually
 * (0, 0).  When the scrollbar is in a flyout it may have a different origin.
 * @type {Blockly.utils.Coordinate}
 * @private
 */
Blockly.Scrollbar.prototype.origin_ = new Blockly.utils.Coordinate(0, 0);

/**
 * The position of the mouse along this scrollbar's major axis at the start of
 * the most recent drag.
 * Units are CSS pixels, with (0, 0) at the top left of the browser window.
 * For a horizontal scrollbar this is the x coordinate of the mouse down event;
 * for a vertical scrollbar it's the y coordinate of the mouse down event.
 * @type {number}
 * @private
 */
Blockly.Scrollbar.prototype.startDragMouse_ = 0;

/**
 * The length of the scrollbars (including the handle and the background), in
 * CSS pixels. This is equivalent to scrollbar background length and the area
 * within which the scrollbar handle can move.
 * @type {number}
 * @private
 */
Blockly.Scrollbar.prototype.scrollbarLength_ = 0;

/**
 * The length of the scrollbar handle in CSS pixels.
 * @type {number}
 * @private
 */
Blockly.Scrollbar.prototype.handleLength_ = 0;

/**
 * The offset of the start of the handle from the scrollbar position, in CSS
 * pixels.
 * @type {number}
 * @private
 */
Blockly.Scrollbar.prototype.handlePosition_ = 0;

/**
 * Whether the scrollbar handle is visible.
 * @type {boolean}
 * @private
 */
Blockly.Scrollbar.prototype.isVisible_ = true;

/**
 * Whether the workspace containing this scrollbar is visible.
 * @type {boolean}
 * @private
 */
Blockly.Scrollbar.prototype.containerVisible_ = true;

/**
 * Width of vertical scrollbar or height of horizontal scrollbar in CSS pixels.
 * Scrollbars should be larger on touch devices.
 */
Blockly.Scrollbar.scrollbarThickness = 15;
if (Blockly.Touch.TOUCH_ENABLED) {
  Blockly.Scrollbar.scrollbarThickness = 25;
}

/**
 * Default margin around the scrollbar (between the scrollbar and the edge of
 * the viewport in pixels).
 * @type {number}
 * @const
 * @package
 */
Blockly.Scrollbar.DEFAULT_SCROLLBAR_MARGIN = 0.5;


/**
 * @param {!Blockly.utils.Metrics} first An object containing computed
 *     measurements of a workspace.
 * @param {!Blockly.utils.Metrics} second Another object containing computed
 *     measurements of a workspace.
 * @return {boolean} Whether the two sets of metrics are equivalent.
 * @private
 */
Blockly.Scrollbar.metricsAreEquivalent_ = function(first, second) {
  return (first.viewWidth == second.viewWidth &&
      first.viewHeight == second.viewHeight &&
      first.viewLeft == second.viewLeft &&
      first.viewTop == second.viewTop &&
      first.absoluteTop == second.absoluteTop &&
      first.absoluteLeft == second.absoluteLeft &&
      first.scrollWidth == second.scrollWidth &&
      first.scrollHeight == second.scrollHeight &&
      first.scrollLeft == second.scrollLeft &&
      first.scrollTop == second.scrollTop);
};

/**
 * Dispose of this scrollbar.
 * Unlink from all DOM elements to prevent memory leaks.
 * @suppress {checkTypes}
 */
Blockly.Scrollbar.prototype.dispose = function() {
  this.cleanUp_();
  Blockly.browserEvents.unbind(this.onMouseDownBarWrapper_);
  this.onMouseDownBarWrapper_ = null;
  Blockly.browserEvents.unbind(this.onMouseDownHandleWrapper_);
  this.onMouseDownHandleWrapper_ = null;

  Blockly.utils.dom.removeNode(this.outerSvg_);
  this.outerSvg_ = null;
  this.svgGroup_ = null;
  this.svgBackground_ = null;
  if (this.svgHandle_) {
    this.workspace_.getThemeManager().unsubscribe(this.svgHandle_);
    this.svgHandle_ = null;
  }
  this.workspace_ = null;
};

/**
 * Constrain the handle's length within the minimum (0) and maximum
 * (scrollbar background) values allowed for the scrollbar.
 * @param {number} value Value that is potentially out of bounds, in CSS pixels.
 * @return {number} Constrained value, in CSS pixels.
 * @private
 */
Blockly.Scrollbar.prototype.constrainHandleLength_ = function(value) {
  if (value <= 0 || isNaN(value)) {
    value = 0;
  } else {
    value = Math.min(value, this.scrollbarLength_);
  }
  return value;
};

/**
 * Set the length of the scrollbar's handle and change the SVG attribute
 * accordingly.
 * @param {number} newLength The new scrollbar handle length in CSS pixels.
 * @private
 */
Blockly.Scrollbar.prototype.setHandleLength_ = function(newLength) {
  this.handleLength_ = newLength;
  this.svgHandle_.setAttribute(this.lengthAttribute_, this.handleLength_);
};

/**
 * Constrain the handle's position within the minimum (0) and maximum values
 * allowed for the scrollbar.
 * @param {number} value Value that is potentially out of bounds, in CSS pixels.
 * @return {number} Constrained value, in CSS pixels.
 * @private
 */
Blockly.Scrollbar.prototype.constrainHandlePosition_ = function(value) {
  if (value <= 0 || isNaN(value)) {
    value = 0;
  } else {
    // Handle length should never be greater than this.scrollbarLength_.
    // If the viewSize is greater than or equal to the scrollSize, the
    // handleLength will end up equal to this.scrollbarLength_.
    value = Math.min(value, this.scrollbarLength_ - this.handleLength_);
  }
  return value;
};

/**
 * Set the offset of the scrollbar's handle from the scrollbar's position, and
 * change the SVG attribute accordingly.
 * @param {number} newPosition The new scrollbar handle offset in CSS pixels.
 */
Blockly.Scrollbar.prototype.setHandlePosition = function(newPosition) {
  this.handlePosition_ = newPosition;
  this.svgHandle_.setAttribute(this.positionAttribute_, this.handlePosition_);
};

/**
 * Set the size of the scrollbar's background and change the SVG attribute
 * accordingly.
 * @param {number} newSize The new scrollbar background length in CSS pixels.
 * @private
 */
Blockly.Scrollbar.prototype.setScrollbarLength_ = function(newSize) {
  this.scrollbarLength_ = newSize;
  this.outerSvg_.setAttribute(this.lengthAttribute_, this.scrollbarLength_);
  this.svgBackground_.setAttribute(this.lengthAttribute_, this.scrollbarLength_);
};

/**
 * Set the position of the scrollbar's SVG group in CSS pixels relative to the
 * scrollbar's origin.  This sets the scrollbar's location within the workspace.
 * @param {number} x The new x coordinate.
 * @param {number} y The new y coordinate.
 * @package
 */
Blockly.Scrollbar.prototype.setPosition = function(x, y) {
  this.position.x = x;
  this.position.y = y;

  var tempX = this.position.x + this.origin_.x;
  var tempY = this.position.y + this.origin_.y;
  var transform = 'translate(' + tempX + 'px,' + tempY + 'px)';
  Blockly.utils.dom.setCssTransform(this.outerSvg_, transform);
};

/**
 * Recalculate the scrollbar's location and its length.
 * @param {Blockly.utils.Metrics=} opt_metrics A data structure of from the
 *     describing all the required dimensions.  If not provided, it will be
 *     fetched from the host object.
 */
Blockly.Scrollbar.prototype.resize = function(opt_metrics) {
  // Determine the location, height and width of the host element.
  var hostMetrics = opt_metrics;
  if (!hostMetrics) {
    hostMetrics = this.workspace_.getMetrics();
    if (!hostMetrics) {
      // Host element is likely not visible.
      return;
    }
  }

  if (this.oldHostMetrics_ && Blockly.Scrollbar.metricsAreEquivalent_(
      hostMetrics, this.oldHostMetrics_)) {
    return;
  }

  if (this.horizontal_) {
    this.resizeHorizontal_(hostMetrics);
  } else {
    this.resizeVertical_(hostMetrics);
  }

  this.oldHostMetrics_ = hostMetrics;

  // Resizing may have caused some scrolling.
  this.updateMetrics_();
};

/**
 * Returns whether the a resizeView is necessary by comparing the passed
 * hostMetrics with cached old host metrics.
 * @param {!Blockly.utils.Metrics} hostMetrics A data structure describing all
 *     the required dimensions, possibly fetched from the host object.
 * @return {boolean} Whether a resizeView is necessary.
 * @private
 */
Blockly.Scrollbar.prototype.requiresViewResize_ = function(hostMetrics) {
  if (!this.oldHostMetrics_) {
    return true;
  }
  return this.oldHostMetrics_.viewWidth !== hostMetrics.viewWidth ||
      this.oldHostMetrics_.viewHeight !== hostMetrics.viewHeight ||
      this.oldHostMetrics_.absoluteLeft !== hostMetrics.absoluteLeft ||
      this.oldHostMetrics_.absoluteTop !== hostMetrics.absoluteTop;
};

/**
 * Recalculate a horizontal scrollbar's location and length.
 * @param {!Blockly.utils.Metrics} hostMetrics A data structure describing all
 *     the required dimensions, possibly fetched from the host object.
 * @private
 */
Blockly.Scrollbar.prototype.resizeHorizontal_ = function(hostMetrics) {
  if (this.requiresViewResize_(hostMetrics)) {
    this.resizeViewHorizontal(hostMetrics);
  } else {
    this.resizeContentHorizontal(hostMetrics);
  }
};

/**
 * Recalculate a horizontal scrollbar's location on the screen and path length.
 * This should be called when the layout or size of the window has changed.
 * @param {!Blockly.utils.Metrics} hostMetrics A data structure describing all
 *     the required dimensions, possibly fetched from the host object.
 */
Blockly.Scrollbar.prototype.resizeViewHorizontal = function(hostMetrics) {
  var viewSize = hostMetrics.viewWidth - this.margin_ * 2;
  if (this.pair_) {
    // Shorten the scrollbar to make room for the corner square.
    viewSize -= Blockly.Scrollbar.scrollbarThickness;
  }
  this.setScrollbarLength_(Math.max(0, viewSize));

  var xCoordinate =
      hostMetrics.absoluteLeft + this.margin_;
  if (this.pair_ && this.workspace_.RTL) {
    xCoordinate += Blockly.Scrollbar.scrollbarThickness;
  }

  // Horizontal toolbar should always be just above the bottom of the workspace.
  var yCoordinate = hostMetrics.absoluteTop + hostMetrics.viewHeight -
      Blockly.Scrollbar.scrollbarThickness - this.margin_;
  this.setPosition(xCoordinate, yCoordinate);

  // If the view has been resized, a content resize will also be necessary.
  // The reverse is not true.
  this.resizeContentHorizontal(hostMetrics);
};

/**
 * Recalculate a horizontal scrollbar's location within its path and length.
 * This should be called when the contents of the workspace have changed.
 * @param {!Blockly.utils.Metrics} hostMetrics A data structure describing all
 *     the required dimensions, possibly fetched from the host object.
 */
Blockly.Scrollbar.prototype.resizeContentHorizontal = function(hostMetrics) {
  if (hostMetrics.viewWidth >= hostMetrics.scrollWidth) {
    // viewWidth is often greater than scrollWidth in flyouts and
    // non-scrollable workspaces.
    this.setHandleLength_(this.scrollbarLength_);
    this.setHandlePosition(0);
    if (!this.pair_) {
      // The scrollbar isn't needed.
      // This doesn't apply to scrollbar pairs because interactions with the
      // corner square aren't handled.
      this.setVisible(false);
    }
    return;
  } else if (!this.pair_) {
    // The scrollbar is needed. Only non-paired scrollbars are hidden/shown.
    this.setVisible(true);
  }

  // Resize the handle.
  var handleLength =
      this.scrollbarLength_ * hostMetrics.viewWidth / hostMetrics.scrollWidth;
  handleLength = this.constrainHandleLength_(handleLength);
  this.setHandleLength_(handleLength);

  // Compute the handle offset.
  // The position of the handle can be between:
  //     0 and this.scrollbarLength_ - handleLength
  // If viewLeft == scrollLeft
  //     then the offset should be 0
  // If viewRight == scrollRight
  //     then viewLeft = scrollLeft + scrollWidth - viewWidth
  //     then the offset should be max offset

  var maxScrollDistance = hostMetrics.scrollWidth - hostMetrics.viewWidth;
  var contentDisplacement = hostMetrics.viewLeft - hostMetrics.scrollLeft;
  // Percent of content to the left of our current position.
  var offsetRatio = contentDisplacement / maxScrollDistance;
  // Area available to scroll * percent to the left
  var maxHandleOffset = this.scrollbarLength_ - this.handleLength_;
  var handleOffset = maxHandleOffset * offsetRatio;
  handleOffset = this.constrainHandlePosition_(handleOffset);
  this.setHandlePosition(handleOffset);

  // Compute ratio (for use with set calls, which pass in content displacement).
  this.ratio = maxHandleOffset / maxScrollDistance;
};

/**
 * Recalculate a vertical scrollbar's location and length.
 * @param {!Blockly.utils.Metrics} hostMetrics A data structure describing all
 *     the required dimensions, possibly fetched from the host object.
 * @private
 */
Blockly.Scrollbar.prototype.resizeVertical_ = function(hostMetrics) {
  if (this.requiresViewResize_(hostMetrics)) {
    this.resizeViewVertical(hostMetrics);
  } else {
    this.resizeContentVertical(hostMetrics);
  }
};

/**
 * Recalculate a vertical scrollbar's location on the screen and path length.
 * This should be called when the layout or size of the window has changed.
 * @param {!Blockly.utils.Metrics} hostMetrics A data structure describing all
 *     the required dimensions, possibly fetched from the host object.
 */
Blockly.Scrollbar.prototype.resizeViewVertical = function(hostMetrics) {
  var viewSize = hostMetrics.viewHeight - this.margin_ * 2;
  if (this.pair_) {
    // Shorten the scrollbar to make room for the corner square.
    viewSize -= Blockly.Scrollbar.scrollbarThickness;
  }
  this.setScrollbarLength_(Math.max(0, viewSize));

  var xCoordinate = this.workspace_.RTL ?
      hostMetrics.absoluteLeft + this.margin_ :
      hostMetrics.absoluteLeft + hostMetrics.viewWidth -
      Blockly.Scrollbar.scrollbarThickness - this.margin_;

  var yCoordinate = hostMetrics.absoluteTop + this.margin_;
  this.setPosition(xCoordinate, yCoordinate);

  // If the view has been resized, a content resize will also be necessary.  The
  // reverse is not true.
  this.resizeContentVertical(hostMetrics);
};

/**
 * Recalculate a vertical scrollbar's location within its path and length.
 * This should be called when the contents of the workspace have changed.
 * @param {!Blockly.utils.Metrics} hostMetrics A data structure describing all
 *     the required dimensions, possibly fetched from the host object.
 */
Blockly.Scrollbar.prototype.resizeContentVertical = function(hostMetrics) {
  if (hostMetrics.viewHeight >= hostMetrics.scrollHeight) {
    // viewHeight is often greater than scrollHeight in flyouts and
    // non-scrollable workspaces.
    this.setHandleLength_(this.scrollbarLength_);
    this.setHandlePosition(0);
    if (!this.pair_) {
      // The scrollbar isn't needed.
      // This doesn't apply to scrollbar pairs because interactions with the
      // corner square aren't handled.
      this.setVisible(false);
    }
    return;
  } else if (!this.pair_) {
    // The scrollbar is needed. Only non-paired scrollbars are hidden/shown.
    this.setVisible(true);
  }

  // Resize the handle.
  var handleLength =
      this.scrollbarLength_ * hostMetrics.viewHeight / hostMetrics.scrollHeight;
  handleLength = this.constrainHandleLength_(handleLength);
  this.setHandleLength_(handleLength);

  // Compute the handle offset.
  // The position of the handle can be between:
  //     0 and this.scrollbarLength_ - handleLength
  // If viewTop == scrollTop
  //     then the offset should be 0
  // If viewBottom == scrollBottom
  //     then viewTop = scrollTop + scrollHeight - viewHeight
  //     then the offset should be max offset

  var maxScrollDistance = hostMetrics.scrollHeight - hostMetrics.viewHeight;
  var contentDisplacement = hostMetrics.viewTop - hostMetrics.scrollTop;
  // Percent of content to the left of our current position.
  var offsetRatio = contentDisplacement / maxScrollDistance;
  // Area available to scroll * percent to the left
  var maxHandleOffset = this.scrollbarLength_ - this.handleLength_;
  var handleOffset = maxHandleOffset * offsetRatio;
  handleOffset = this.constrainHandlePosition_(handleOffset);
  this.setHandlePosition(handleOffset);

  // Compute ratio (for use with set calls, which pass in content displacement).
  this.ratio = maxHandleOffset / maxScrollDistance;
};

/**
 * Create all the DOM elements required for a scrollbar.
 * The resulting widget is not sized.
 * @param {string=} opt_class A class to be applied to this scrollbar.
 * @private
 */
Blockly.Scrollbar.prototype.createDom_ = function(opt_class) {
  /* Create the following DOM:
  <svg class="blocklyScrollbarHorizontal  optionalClass">
    <g>
      <rect class="blocklyScrollbarBackground" />
      <rect class="blocklyScrollbarHandle" rx="8" ry="8" />
    </g>
  </svg>
  */
  var className = 'blocklyScrollbar' +
      (this.horizontal_ ? 'Horizontal' : 'Vertical');
  if (opt_class) {
    className += ' ' + opt_class;
  }
  this.outerSvg_ = Blockly.utils.dom.createSvgElement(
      Blockly.utils.Svg.SVG, {'class': className}, null);
  this.svgGroup_ = Blockly.utils.dom.createSvgElement(
      Blockly.utils.Svg.G, {}, this.outerSvg_);
  this.svgBackground_ = Blockly.utils.dom.createSvgElement(
      Blockly.utils.Svg.RECT, {
        'class': 'blocklyScrollbarBackground'
      }, this.svgGroup_);
  var radius = Math.floor((Blockly.Scrollbar.scrollbarThickness - 5) / 2);
  this.svgHandle_ = Blockly.utils.dom.createSvgElement(
      Blockly.utils.Svg.RECT,
      {
        'class': 'blocklyScrollbarHandle',
        'rx': radius,
        'ry': radius
      },
      this.svgGroup_);
  this.workspace_.getThemeManager().subscribe(
      this.svgHandle_, 'scrollbarColour', 'fill');
  this.workspace_.getThemeManager().subscribe(
      this.svgHandle_, 'scrollbarOpacity', 'fill-opacity');
  Blockly.utils.dom.insertAfter(this.outerSvg_,
      this.workspace_.getParentSvg());
};

/**
 * Is the scrollbar visible.  Non-paired scrollbars disappear when they aren't
 * needed.
 * @return {boolean} True if visible.
 */
Blockly.Scrollbar.prototype.isVisible = function() {
  return this.isVisible_;
};

/**
 * Set whether the scrollbar's container is visible and update
 * display accordingly if visibility has changed.
 * @param {boolean} visible Whether the container is visible
 */
Blockly.Scrollbar.prototype.setContainerVisible = function(visible) {
  var visibilityChanged = (visible != this.containerVisible_);

  this.containerVisible_ = visible;
  if (visibilityChanged) {
    this.updateDisplay_();
  }
};

/**
 * Set whether the scrollbar is visible.
 * Only applies to non-paired scrollbars.
 * @param {boolean} visible True if visible.
 */
Blockly.Scrollbar.prototype.setVisible = function(visible) {
  var visibilityChanged = (visible != this.isVisible());

  // Ideally this would also apply to scrollbar pairs, but that's a bigger
  // headache (due to interactions with the corner square).
  if (this.pair_) {
    throw Error('Unable to toggle visibility of paired scrollbars.');
  }
  this.isVisible_ = visible;
  if (visibilityChanged) {
    this.updateDisplay_();
  }
};

/**
 * Update visibility of scrollbar based on whether it thinks it should
 * be visible and whether its containing workspace is visible.
 * We cannot rely on the containing workspace being hidden to hide us
 * because it is not necessarily our parent in the DOM.
 */
Blockly.Scrollbar.prototype.updateDisplay_ = function() {
  var show = true;
  // Check whether our parent/container is visible.
  if (!this.containerVisible_) {
    show = false;
  } else {
    show = this.isVisible();
  }
  if (show) {
    this.outerSvg_.setAttribute('display', 'block');
  } else {
    this.outerSvg_.setAttribute('display', 'none');
  }
};

/**
 * Scroll by one pageful.
 * Called when scrollbar background is clicked.
 * @param {!Event} e Mouse down event.
 * @private
 */
Blockly.Scrollbar.prototype.onMouseDownBar_ = function(e) {
  this.workspace_.markFocused();
  Blockly.Touch.clearTouchIdentifier();  // This is really a click.
  this.cleanUp_();
  if (Blockly.utils.isRightButton(e)) {
    // Right-click.
    // Scrollbars have no context menu.
    e.stopPropagation();
    return;
  }
  var mouseXY = Blockly.utils.mouseToSvg(e,
      this.workspace_.getParentSvg(),
      this.workspace_.getInverseScreenCTM());
  var mouseLocation = this.horizontal_ ? mouseXY.x : mouseXY.y;

  var handleXY = Blockly.utils.getInjectionDivXY_(this.svgHandle_);
  var handleStart = this.horizontal_ ? handleXY.x : handleXY.y;
  var handlePosition = this.handlePosition_;

  var pageLength = this.handleLength_ * 0.95;
  if (mouseLocation <= handleStart) {
    // Decrease the scrollbar's value by a page.
    handlePosition -= pageLength;
  } else if (mouseLocation >= handleStart + this.handleLength_) {
    // Increase the scrollbar's value by a page.
    handlePosition += pageLength;
  }

  this.setHandlePosition(this.constrainHandlePosition_(handlePosition));

  this.updateMetrics_();
  e.stopPropagation();
  e.preventDefault();
};

/**
 * Start a dragging operation.
 * Called when scrollbar handle is clicked.
 * @param {!Event} e Mouse down event.
 * @private
 */
Blockly.Scrollbar.prototype.onMouseDownHandle_ = function(e) {
  this.workspace_.markFocused();
  this.cleanUp_();
  if (Blockly.utils.isRightButton(e)) {
    // Right-click.
    // Scrollbars have no context menu.
    e.stopPropagation();
    return;
  }
  // Look up the current translation and record it.
  this.startDragHandle = this.handlePosition_;

  // Tell the workspace to setup its drag surface since it is about to move.
  // onMouseMoveHandle will call onScroll which actually tells the workspace
  // to move.
  this.workspace_.setupDragSurface();

  // Record the current mouse position.
  this.startDragMouse_ = this.horizontal_ ? e.clientX : e.clientY;
  Blockly.Scrollbar.onMouseUpWrapper_ = Blockly.browserEvents.conditionalBind(
      document, 'mouseup', this, this.onMouseUpHandle_);
  Blockly.Scrollbar.onMouseMoveWrapper_ = Blockly.browserEvents.conditionalBind(
      document, 'mousemove', this, this.onMouseMoveHandle_);
  e.stopPropagation();
  e.preventDefault();
};

/**
 * Drag the scrollbar's handle.
 * @param {!Event} e Mouse up event.
 * @private
 */
Blockly.Scrollbar.prototype.onMouseMoveHandle_ = function(e) {
  var currentMouse = this.horizontal_ ? e.clientX : e.clientY;
  var mouseDelta = currentMouse - this.startDragMouse_;
  var handlePosition = this.startDragHandle + mouseDelta;
  // Position the bar.
  this.setHandlePosition(this.constrainHandlePosition_(handlePosition));
  this.updateMetrics_();
};

/**
 * Release the scrollbar handle and reset state accordingly.
 * @private
 */
Blockly.Scrollbar.prototype.onMouseUpHandle_ = function() {
  // Tell the workspace to clean up now that the workspace is done moving.
  this.workspace_.resetDragSurface();
  Blockly.Touch.clearTouchIdentifier();
  this.cleanUp_();
};

/**
 * Hide chaff and stop binding to mouseup and mousemove events.  Call this to
 * wrap up loose ends associated with the scrollbar.
 * @private
 */
Blockly.Scrollbar.prototype.cleanUp_ = function() {
  Blockly.hideChaff(true);
  if (Blockly.Scrollbar.onMouseUpWrapper_) {
    Blockly.browserEvents.unbind(Blockly.Scrollbar.onMouseUpWrapper_);
    Blockly.Scrollbar.onMouseUpWrapper_ = null;
  }
  if (Blockly.Scrollbar.onMouseMoveWrapper_) {
    Blockly.browserEvents.unbind(Blockly.Scrollbar.onMouseMoveWrapper_);
    Blockly.Scrollbar.onMouseMoveWrapper_ = null;
  }
};

/**
 * Helper to calculate the ratio of handle position to scrollbar view size.
 * @return {number} Ratio.
 * @protected
 */
Blockly.Scrollbar.prototype.getRatio_ = function() {
  var scrollHandleRange = this.scrollbarLength_ - this.handleLength_;
  var ratio = this.handlePosition_ / scrollHandleRange;
  if (isNaN(ratio)) {
    ratio = 0;
  }
  return ratio;
};

/**
 * Updates workspace metrics based on new scroll ratio. Called when scrollbar is
 * moved.
 * @private
 */
Blockly.Scrollbar.prototype.updateMetrics_ = function() {
  var ratio = this.getRatio_();
  var xyRatio = {};
  if (this.horizontal_) {
    xyRatio.x = ratio;
  } else {
    xyRatio.y = ratio;
  }
  this.workspace_.setMetrics(xyRatio);
};

/**
 * Set the scrollbar handle's position.
 * @param {number} value The content displacement, relative to the view in
 *    pixels.
 * @param {boolean=} updateMetrics Whether to update metrics on this set call.
 *    Defaults to true.
 */
Blockly.Scrollbar.prototype.set = function(value, updateMetrics) {
  this.setHandlePosition(this.constrainHandlePosition_(value * this.ratio));
  if (updateMetrics || updateMetrics === undefined) {
    this.updateMetrics_();
  }
};

/**
 * Record the origin of the workspace that the scrollbar is in, in pixels
 * relative to the injection div origin. This is for times when the scrollbar is
 * used in an object whose origin isn't the same as the main workspace
 * (e.g. in a flyout.)
 * @param {number} x The x coordinate of the scrollbar's origin, in CSS pixels.
 * @param {number} y The y coordinate of the scrollbar's origin, in CSS pixels.
 */
Blockly.Scrollbar.prototype.setOrigin = function(x, y) {
  this.origin_ = new Blockly.utils.Coordinate(x, y);
};
