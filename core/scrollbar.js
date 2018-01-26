/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2011 Google Inc.
 * https://developers.google.com/blockly/
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview Library for creating scrollbars.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Blockly.Scrollbar');
goog.provide('Blockly.ScrollbarPair');

goog.require('goog.dom');
goog.require('goog.events');


/**
 * A note on units: most of the numbers that are in CSS pixels are scaled if the
 * scrollbar is in a mutator.
 */

/**
 * Class for a pair of scrollbars.  Horizontal and vertical.
 * @param {!Blockly.Workspace} workspace Workspace to bind the scrollbars to.
 * @constructor
 */
Blockly.ScrollbarPair = function(workspace) {
  this.workspace_ = workspace;
  this.hScroll = new Blockly.Scrollbar(
      workspace, true, true, 'blocklyMainWorkspaceScrollbar');
  this.vScroll = new Blockly.Scrollbar(
      workspace, false, true, 'blocklyMainWorkspaceScrollbar');
  this.corner_ = Blockly.utils.createSvgElement(
      'rect',
      {
        'height': Blockly.Scrollbar.scrollbarThickness,
        'width': Blockly.Scrollbar.scrollbarThickness,
        'class': 'blocklyScrollbarBackground'
      },
      null);
  Blockly.utils.insertAfter_(this.corner_, workspace.getBubbleCanvas());
};

/**
 * Previously recorded metrics from the workspace.
 * @type {Object}
 * @private
 */
Blockly.ScrollbarPair.prototype.oldHostMetrics_ = null;

/**
 * Dispose of this pair of scrollbars.
 * Unlink from all DOM elements to prevent memory leaks.
 */
Blockly.ScrollbarPair.prototype.dispose = function() {
  goog.dom.removeNode(this.corner_);
  this.corner_ = null;
  this.workspace_ = null;
  this.oldHostMetrics_ = null;
  this.hScroll.dispose();
  this.hScroll = null;
  this.vScroll.dispose();
  this.vScroll = null;
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
        this.oldHostMetrics_.contentWidth != hostMetrics.contentWidth ||
        this.oldHostMetrics_.viewLeft != hostMetrics.viewLeft ||
        this.oldHostMetrics_.contentLeft != hostMetrics.contentLeft) {
      resizeH = true;
    }
    if (!this.oldHostMetrics_ ||
        this.oldHostMetrics_.contentHeight != hostMetrics.contentHeight ||
        this.oldHostMetrics_.viewTop != hostMetrics.viewTop ||
        this.oldHostMetrics_.contentTop != hostMetrics.contentTop) {
      resizeV = true;
    }
  }
  if (resizeH) {
    this.hScroll.resize(hostMetrics);
  }
  if (resizeV) {
    this.vScroll.resize(hostMetrics);
  }

  // Reposition the corner square.
  if (!this.oldHostMetrics_ ||
      this.oldHostMetrics_.viewWidth != hostMetrics.viewWidth ||
      this.oldHostMetrics_.absoluteLeft != hostMetrics.absoluteLeft) {
    this.corner_.setAttribute('x', this.vScroll.position_.x);
  }
  if (!this.oldHostMetrics_ ||
      this.oldHostMetrics_.viewHeight != hostMetrics.viewHeight ||
      this.oldHostMetrics_.absoluteTop != hostMetrics.absoluteTop) {
    this.corner_.setAttribute('y', this.hScroll.position_.y);
  }

  // Cache the current metrics to potentially short-cut the next resize event.
  this.oldHostMetrics_ = hostMetrics;
};

/**
 * Set the handles of both scrollbars to be at a certain position in CSS pixels
 * relative to their parents.
 * @param {number} x Horizontal scroll value.
 * @param {number} y Vertical scroll value.
 */
Blockly.ScrollbarPair.prototype.set = function(x, y) {
  // This function is equivalent to:
  //   this.hScroll.set(x);
  //   this.vScroll.set(y);
  // However, that calls setMetrics twice which causes a chain of
  // getAttribute->setAttribute->getAttribute resulting in an extra layout pass.
  // Combining them speeds up rendering.
  var xyRatio = {};

  var hHandlePosition = x * this.hScroll.ratio_;
  var vHandlePosition = y * this.vScroll.ratio_;

  var hBarLength = this.hScroll.scrollViewSize_;
  var vBarLength = this.vScroll.scrollViewSize_;

  xyRatio.x = this.getRatio_(hHandlePosition, hBarLength);
  xyRatio.y = this.getRatio_(vHandlePosition, vBarLength);
  this.workspace_.setMetrics(xyRatio);

  this.hScroll.setHandlePosition(hHandlePosition);
  this.vScroll.setHandlePosition(vHandlePosition);
};

/**
 * Helper to calculate the ratio of handle position to scrollbar view size.
 * @param {number} handlePosition The value of the handle.
 * @param {number} viewSize The total size of the scrollbar's view.
 * @return {number} Ratio.
 * @private
 */
Blockly.ScrollbarPair.prototype.getRatio_ = function(handlePosition, viewSize) {
  var ratio = handlePosition / viewSize;
  if (isNaN(ratio)) {
    return 0;
  }
  return ratio;
};

// --------------------------------------------------------------------

/**
 * Class for a pure SVG scrollbar.
 * This technique offers a scrollbar that is guaranteed to work, but may not
 * look or behave like the system's scrollbars.
 * @param {!Blockly.Workspace} workspace Workspace to bind the scrollbar to.
 * @param {boolean} horizontal True if horizontal, false if vertical.
 * @param {boolean=} opt_pair True if scrollbar is part of a horiz/vert pair.
 * @param {string=} opt_class A class to be applied to this scrollbar.
 * @constructor
 */
Blockly.Scrollbar = function(workspace, horizontal, opt_pair, opt_class) {
  this.workspace_ = workspace;
  this.pair_ = opt_pair || false;
  this.horizontal_ = horizontal;
  this.oldHostMetrics_ = null;

  this.createDom_(opt_class);

  /**
   * The upper left corner of the scrollbar's SVG group in CSS pixels relative
   * to the scrollbar's origin.  This is usually relative to the injection div
   * origin.
   * @type {goog.math.Coordinate}
   * @private
   */
  this.position_ = new goog.math.Coordinate(0, 0);

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
  this.onMouseDownBarWrapper_ = Blockly.bindEventWithChecks_(
      this.svgBackground_, 'mousedown', scrollbar, scrollbar.onMouseDownBar_);
  this.onMouseDownHandleWrapper_ = Blockly.bindEventWithChecks_(this.svgHandle_,
      'mousedown', scrollbar, scrollbar.onMouseDownHandle_);
};

/**
 * The location of the origin of the workspace that the scrollbar is in,
 * measured in CSS pixels relative to the injection div origin.  This is usually
 * (0, 0).  When the scrollbar is in a flyout it may have a different origin.
 * @type {goog.math.Coordinate}
 * @private
 */
Blockly.Scrollbar.prototype.origin_ = new goog.math.Coordinate(0, 0);

/**
 * The position of the mouse along this scrollbar's major axis at the start of
 * the most recent drag.
 * Units are CSS pixels, with (0, 0) at the top left of the browser window.
 * For a horizontal scrollbar this is the x coordinate of the mouse down event;
 * for a vertical scrollbar it's the y coordinate of the mouse down event.
 * @type {goog.math.Coordinate}
 */
Blockly.Scrollbar.prototype.startDragMouse_ = 0;

/**
 * The size of the area within which the scrollbar handle can move, in CSS
 * pixels.
 * @type {number}
 * @private
 */
Blockly.Scrollbar.prototype.scrollViewSize_ = 0;

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
if (goog.events.BrowserFeature.TOUCH_ENABLED) {
  Blockly.Scrollbar.scrollbarThickness = 25;
}

/**
 * @param {!Object} first An object containing computed measurements of a
 *    workspace.
 * @param {!Object} second Another object containing computed measurements of a
 *    workspace.
 * @return {boolean} Whether the two sets of metrics are equivalent.
 * @private
 */
Blockly.Scrollbar.metricsAreEquivalent_ = function(first, second) {
  if (!(first && second)) {
    return false;
  }

  if (first.viewWidth != second.viewWidth ||
      first.viewHeight != second.viewHeight ||
      first.viewLeft != second.viewLeft ||
      first.viewTop != second.viewTop ||
      first.absoluteTop != second.absoluteTop ||
      first.absoluteLeft != second.absoluteLeft ||
      first.contentWidth != second.contentWidth ||
      first.contentHeight != second.contentHeight ||
      first.contentLeft != second.contentLeft ||
      first.contentTop != second.contentTop) {
    return false;
  }

  return true;
};

/**
 * Dispose of this scrollbar.
 * Unlink from all DOM elements to prevent memory leaks.
 */
Blockly.Scrollbar.prototype.dispose = function() {
  this.cleanUp_();
  Blockly.unbindEvent_(this.onMouseDownBarWrapper_);
  this.onMouseDownBarWrapper_ = null;
  Blockly.unbindEvent_(this.onMouseDownHandleWrapper_);
  this.onMouseDownHandleWrapper_ = null;

  goog.dom.removeNode(this.outerSvg_);
  this.outerSvg_ = null;
  this.svgGroup_ = null;
  this.svgBackground_ = null;
  this.svgHandle_ = null;
  this.workspace_ = null;
};

/**
 * Set the length of the scrollbar's handle and change the SVG attribute
 * accordingly.
 * @param {number} newLength The new scrollbar handle length in CSS pixels.
 */
Blockly.Scrollbar.prototype.setHandleLength_ = function(newLength) {
  this.handleLength_ = newLength;
  this.svgHandle_.setAttribute(this.lengthAttribute_, this.handleLength_);
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
Blockly.Scrollbar.prototype.setScrollViewSize_ = function(newSize) {
  this.scrollViewSize_ = newSize;
  this.outerSvg_.setAttribute(this.lengthAttribute_, this.scrollViewSize_);
  this.svgBackground_.setAttribute(this.lengthAttribute_, this.scrollViewSize_);
};

/**
 * Set whether this scrollbar's container is visible.
 * @param {boolean} visible Whether the container is visible.
 */
Blockly.ScrollbarPair.prototype.setContainerVisible = function(visible) {
  this.hScroll.setContainerVisible(visible);
  this.vScroll.setContainerVisible(visible);
};

/**
 * Set the position of the scrollbar's SVG group in CSS pixels relative to the
 * scrollbar's origin.  This sets the scrollbar's location within the workspace.
 * @param {number} x The new x coordinate.
 * @param {number} y The new y coordinate.
 * @private
 */
Blockly.Scrollbar.prototype.setPosition_ = function(x, y) {
  this.position_.x = x;
  this.position_.y = y;

  var tempX = this.position_.x + this.origin_.x;
  var tempY = this.position_.y + this.origin_.y;
  var transform = 'translate(' + tempX + 'px,' + tempY + 'px)';
  Blockly.utils.setCssTransform(this.outerSvg_, transform);
};

/**
 * Recalculate the scrollbar's location and its length.
 * @param {Object=} opt_metrics A data structure of from the describing all the
 * required dimensions.  If not provided, it will be fetched from the host
 * object.
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

  if (Blockly.Scrollbar.metricsAreEquivalent_(hostMetrics,
      this.oldHostMetrics_)) {
    return;
  }
  this.oldHostMetrics_ = hostMetrics;

  /* hostMetrics is an object with the following properties.
   * .viewHeight: Height of the visible rectangle,
   * .viewWidth: Width of the visible rectangle,
   * .contentHeight: Height of the contents,
   * .contentWidth: Width of the content,
   * .viewTop: Offset of top edge of visible rectangle from parent,
   * .viewLeft: Offset of left edge of visible rectangle from parent,
   * .contentTop: Offset of the top-most content from the y=0 coordinate,
   * .contentLeft: Offset of the left-most content from the x=0 coordinate,
   * .absoluteTop: Top-edge of view.
   * .absoluteLeft: Left-edge of view.
   */
  if (this.horizontal_) {
    this.resizeHorizontal_(hostMetrics);
  } else {
    this.resizeVertical_(hostMetrics);
  }
  // Resizing may have caused some scrolling.
  this.onScroll_();
};

/**
 * Recalculate a horizontal scrollbar's location and length.
 * @param {!Object} hostMetrics A data structure describing all the
 *     required dimensions, possibly fetched from the host object.
 * @private
 */
Blockly.Scrollbar.prototype.resizeHorizontal_ = function(hostMetrics) {
  // TODO: Inspect metrics to determine if we can get away with just a content
  // resize.
  this.resizeViewHorizontal(hostMetrics);
};

/**
 * Recalculate a horizontal scrollbar's location on the screen and path length.
 * This should be called when the layout or size of the window has changed.
 * @param {!Object} hostMetrics A data structure describing all the
 *     required dimensions, possibly fetched from the host object.
 */
Blockly.Scrollbar.prototype.resizeViewHorizontal = function(hostMetrics) {
  var viewSize = hostMetrics.viewWidth - 1;
  if (this.pair_) {
    // Shorten the scrollbar to make room for the corner square.
    viewSize -= Blockly.Scrollbar.scrollbarThickness;
  }
  this.setScrollViewSize_(Math.max(0, viewSize));

  var xCoordinate = hostMetrics.absoluteLeft + 0.5;
  if (this.pair_ && this.workspace_.RTL) {
    xCoordinate += Blockly.Scrollbar.scrollbarThickness;
  }

  // Horizontal toolbar should always be just above the bottom of the workspace.
  var yCoordinate = hostMetrics.absoluteTop + hostMetrics.viewHeight -
      Blockly.Scrollbar.scrollbarThickness - 0.5;
  this.setPosition_(xCoordinate, yCoordinate);

  // If the view has been resized, a content resize will also be necessary.  The
  // reverse is not true.
  this.resizeContentHorizontal(hostMetrics);
};

/**
 * Recalculate a horizontal scrollbar's location within its path and length.
 * This should be called when the contents of the workspace have changed.
 * @param {!Object} hostMetrics A data structure describing all the
 *     required dimensions, possibly fetched from the host object.
 */
Blockly.Scrollbar.prototype.resizeContentHorizontal = function(hostMetrics) {
  if (!this.pair_) {
    // Only show the scrollbar if needed.
    // Ideally this would also apply to scrollbar pairs, but that's a bigger
    // headache (due to interactions with the corner square).
    this.setVisible(this.scrollViewSize_ < hostMetrics.contentWidth);
  }

  this.ratio_ = this.scrollViewSize_ / hostMetrics.contentWidth;
  if (this.ratio_ == -Infinity || this.ratio_ == Infinity ||
      isNaN(this.ratio_)) {
    this.ratio_ = 0;
  }

  var handleLength = hostMetrics.viewWidth * this.ratio_;
  this.setHandleLength_(Math.max(0, handleLength));

  var handlePosition = (hostMetrics.viewLeft - hostMetrics.contentLeft) *
      this.ratio_;
  this.setHandlePosition(this.constrainHandle_(handlePosition));
};

/**
 * Recalculate a vertical scrollbar's location and length.
 * @param {!Object} hostMetrics A data structure describing all the
 *     required dimensions, possibly fetched from the host object.
 * @private
 */
Blockly.Scrollbar.prototype.resizeVertical_ = function(hostMetrics) {
  // TODO: Inspect metrics to determine if we can get away with just a content
  // resize.
  this.resizeViewVertical(hostMetrics);
};

/**
 * Recalculate a vertical scrollbar's location on the screen and path length.
 * This should be called when the layout or size of the window has changed.
 * @param {!Object} hostMetrics A data structure describing all the
 *     required dimensions, possibly fetched from the host object.
 */
Blockly.Scrollbar.prototype.resizeViewVertical = function(hostMetrics) {
  var viewSize = hostMetrics.viewHeight - 1;
  if (this.pair_) {
    // Shorten the scrollbar to make room for the corner square.
    viewSize -= Blockly.Scrollbar.scrollbarThickness;
  }
  this.setScrollViewSize_(Math.max(0, viewSize));

  var xCoordinate = hostMetrics.absoluteLeft + 0.5;
  if (!this.workspace_.RTL) {
    xCoordinate += hostMetrics.viewWidth -
        Blockly.Scrollbar.scrollbarThickness - 1;
  }
  var yCoordinate = hostMetrics.absoluteTop + 0.5;
  this.setPosition_(xCoordinate, yCoordinate);

  // If the view has been resized, a content resize will also be necessary.  The
  // reverse is not true.
  this.resizeContentVertical(hostMetrics);
};

/**
 * Recalculate a vertical scrollbar's location within its path and length.
 * This should be called when the contents of the workspace have changed.
 * @param {!Object} hostMetrics A data structure describing all the
 *     required dimensions, possibly fetched from the host object.
 */
Blockly.Scrollbar.prototype.resizeContentVertical = function(hostMetrics) {
  if (!this.pair_) {
    // Only show the scrollbar if needed.
    this.setVisible(this.scrollViewSize_ < hostMetrics.contentHeight);
  }

  this.ratio_ = this.scrollViewSize_ / hostMetrics.contentHeight;
  if (this.ratio_ == -Infinity || this.ratio_ == Infinity ||
      isNaN(this.ratio_)) {
    this.ratio_ = 0;
  }

  var handleLength = hostMetrics.viewHeight * this.ratio_;
  this.setHandleLength_(Math.max(0, handleLength));

  var handlePosition = (hostMetrics.viewTop - hostMetrics.contentTop) *
      this.ratio_;
  this.setHandlePosition(this.constrainHandle_(handlePosition));
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
  this.outerSvg_ = Blockly.utils.createSvgElement(
      'svg', {'class': className}, null);
  this.svgGroup_ = Blockly.utils.createSvgElement('g', {}, this.outerSvg_);
  this.svgBackground_ = Blockly.utils.createSvgElement(
      'rect', {'class': 'blocklyScrollbarBackground'}, this.svgGroup_);
  var radius = Math.floor((Blockly.Scrollbar.scrollbarThickness - 5) / 2);
  this.svgHandle_ = Blockly.utils.createSvgElement(
      'rect',
      {
        'class': 'blocklyScrollbarHandle',
        'rx': radius,
        'ry': radius
      },
      this.svgGroup_);
  Blockly.utils.insertAfter_(this.outerSvg_, this.workspace_.getParentSvg());
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
    throw 'Unable to toggle visibility of paired scrollbars.';
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
  var mouseXY = Blockly.utils.mouseToSvg(e, this.workspace_.getParentSvg(),
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

  this.setHandlePosition(this.constrainHandle_(handlePosition));

  this.onScroll_();
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
  Blockly.Scrollbar.onMouseUpWrapper_ = Blockly.bindEventWithChecks_(document,
      'mouseup', this, this.onMouseUpHandle_);
  Blockly.Scrollbar.onMouseMoveWrapper_ = Blockly.bindEventWithChecks_(document,
      'mousemove', this, this.onMouseMoveHandle_);
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
  this.setHandlePosition(this.constrainHandle_(handlePosition));
  this.onScroll_();
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
 * wrap up lose ends associated with the scrollbar.
 * @private
 */
Blockly.Scrollbar.prototype.cleanUp_ = function() {
  Blockly.hideChaff(true);
  if (Blockly.Scrollbar.onMouseUpWrapper_) {
    Blockly.unbindEvent_(Blockly.Scrollbar.onMouseUpWrapper_);
    Blockly.Scrollbar.onMouseUpWrapper_ = null;
  }
  if (Blockly.Scrollbar.onMouseMoveWrapper_) {
    Blockly.unbindEvent_(Blockly.Scrollbar.onMouseMoveWrapper_);
    Blockly.Scrollbar.onMouseMoveWrapper_ = null;
  }
};

/**
 * Constrain the handle's position within the minimum (0) and maximum
 * (length of scrollbar) values allowed for the scrollbar.
 * @param {number} value Value that is potentially out of bounds, in CSS pixels.
 * @return {number} Constrained value, in CSS pixels.
 * @private
 */
Blockly.Scrollbar.prototype.constrainHandle_ = function(value) {
  if (value <= 0 || isNaN(value) || this.scrollViewSize_ < this.handleLength_) {
    value = 0;
  } else {
    value = Math.min(value, this.scrollViewSize_ - this.handleLength_);
  }
  return value;
};

/**
 * Called when scrollbar is moved.
 * @private
 */
Blockly.Scrollbar.prototype.onScroll_ = function() {
  var ratio = this.handlePosition_ / this.scrollViewSize_;
  if (isNaN(ratio)) {
    ratio = 0;
  }
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
 * @param {number} value The distance from the top/left end of the bar, in CSS
 *     pixels.  It may be larger than the maximum allowable position of the
 *     scrollbar handle.
 */
Blockly.Scrollbar.prototype.set = function(value) {
  this.setHandlePosition(this.constrainHandle_(value * this.ratio_));
  this.onScroll_();
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
  this.origin_ = new goog.math.Coordinate(x, y);
};
