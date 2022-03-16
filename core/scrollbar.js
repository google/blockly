/**
 * @license
 * Copyright 2011 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Object representing a scrollbar.
 */
'use strict';

/**
 * Object representing a scrollbar.
 * @class
 */
goog.module('Blockly.Scrollbar');

const Touch = goog.require('Blockly.Touch');
const browserEvents = goog.require('Blockly.browserEvents');
const dom = goog.require('Blockly.utils.dom');
const svgMath = goog.require('Blockly.utils.svgMath');
const {Coordinate} = goog.require('Blockly.utils.Coordinate');
/* eslint-disable-next-line no-unused-vars */
const {Metrics} = goog.requireType('Blockly.utils.Metrics');
const {Svg} = goog.require('Blockly.utils.Svg');
/* eslint-disable-next-line no-unused-vars */
const {WorkspaceSvg} = goog.requireType('Blockly.WorkspaceSvg');


/**
 * A note on units: most of the numbers that are in CSS pixels are scaled if the
 * scrollbar is in a mutator.
 */

/**
 * Class for a pure SVG scrollbar.
 * This technique offers a scrollbar that is guaranteed to work, but may not
 * look or behave like the system's scrollbars.
 * @alias Blockly.Scrollbar
 */
class Scrollbar {
  /**
   * @param {!WorkspaceSvg} workspace Workspace to bind the scrollbar to.
   * @param {boolean} horizontal True if horizontal, false if vertical.
   * @param {boolean=} opt_pair True if scrollbar is part of a horiz/vert pair.
   * @param {string=} opt_class A class to be applied to this scrollbar.
   * @param {number=} opt_margin The margin to apply to this scrollbar.
   */
  constructor(workspace, horizontal, opt_pair, opt_class, opt_margin) {
    /**
     * The workspace this scrollbar is bound to.
     * @type {!WorkspaceSvg}
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
        opt_margin :
        Scrollbar.DEFAULT_SCROLLBAR_MARGIN;
    /**
     * Previously recorded metrics from the workspace.
     * @type {?Metrics}
     * @private
     */
    this.oldHostMetrics_ = null;
    /**
     * The ratio of handle position offset to workspace content displacement.
     * @type {?number}
     * @package
     */
    this.ratio = null;

    /**
     * The location of the origin of the workspace that the scrollbar is in,
     * measured in CSS pixels relative to the injection div origin.  This is
     * usually (0, 0).  When the scrollbar is in a flyout it may have a
     * different origin.
     * @type {Coordinate}
     * @private
     */
    this.origin_ = new Coordinate(0, 0);

    /**
     * The position of the mouse along this scrollbar's major axis at the start
     * of the most recent drag. Units are CSS pixels, with (0, 0) at the top
     * left of the browser window. For a horizontal scrollbar this is the x
     * coordinate of the mouse down event; for a vertical scrollbar it's the y
     * coordinate of the mouse down event.
     * @type {number}
     * @private
     */
    this.startDragMouse_ = 0;

    /**
     * The length of the scrollbars (including the handle and the background),
     * in CSS pixels. This is equivalent to scrollbar background length and the
     * area within which the scrollbar handle can move.
     * @type {number}
     * @private
     */
    this.scrollbarLength_ = 0;

    /**
     * The length of the scrollbar handle in CSS pixels.
     * @type {number}
     * @private
     */
    this.handleLength_ = 0;

    /**
     * The offset of the start of the handle from the scrollbar position, in CSS
     * pixels.
     * @type {number}
     * @private
     */
    this.handlePosition_ = 0;

    /**
     * @type {number}
     * @private
     */
    this.startDragHandle = 0;

    /**
     * Whether the scrollbar handle is visible.
     * @type {boolean}
     * @private
     */
    this.isVisible_ = true;

    /**
     * Whether the workspace containing this scrollbar is visible.
     * @type {boolean}
     * @private
     */
    this.containerVisible_ = true;

    /**
     * @type {?SVGRectElement}
     * @private
     */
    this.svgBackground_ = null;

    /**
     * @type {?SVGRectElement}
     * @private
     */
    this.svgHandle_ = null;

    /**
     * @type {?SVGSVGElement}
     * @private
     */
    this.outerSvg_ = null;

    /**
     * @type {?SVGGElement}
     * @private
     */
    this.svgGroup_ = null;

    this.createDom_(opt_class);

    /**
     * The upper left corner of the scrollbar's SVG group in CSS pixels relative
     * to the scrollbar's origin.  This is usually relative to the injection div
     * origin.
     * @type {Coordinate}
     * @package
     */
    this.position = new Coordinate(0, 0);

    // Store the thickness in a temp variable for readability.
    const scrollbarThickness = Scrollbar.scrollbarThickness;
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
    const scrollbar = this;
    this.onMouseDownBarWrapper_ = browserEvents.conditionalBind(
        this.svgBackground_, 'mousedown', scrollbar, scrollbar.onMouseDownBar_);
    this.onMouseDownHandleWrapper_ = browserEvents.conditionalBind(
        this.svgHandle_, 'mousedown', scrollbar, scrollbar.onMouseDownHandle_);
  }

  /**
   * Dispose of this scrollbar.
   * Unlink from all DOM elements to prevent memory leaks.
   * @suppress {checkTypes}
   */
  dispose() {
    this.cleanUp_();
    browserEvents.unbind(this.onMouseDownBarWrapper_);
    this.onMouseDownBarWrapper_ = null;
    browserEvents.unbind(this.onMouseDownHandleWrapper_);
    this.onMouseDownHandleWrapper_ = null;

    dom.removeNode(this.outerSvg_);
    this.outerSvg_ = null;
    this.svgGroup_ = null;
    this.svgBackground_ = null;
    if (this.svgHandle_) {
      this.workspace_.getThemeManager().unsubscribe(this.svgHandle_);
      this.svgHandle_ = null;
    }
    this.workspace_ = null;
  }

  /**
   * Constrain the handle's length within the minimum (0) and maximum
   * (scrollbar background) values allowed for the scrollbar.
   * @param {number} value Value that is potentially out of bounds, in CSS
   *     pixels.
   * @return {number} Constrained value, in CSS pixels.
   * @private
   */
  constrainHandleLength_(value) {
    if (value <= 0 || isNaN(value)) {
      value = 0;
    } else {
      value = Math.min(value, this.scrollbarLength_);
    }
    return value;
  }

  /**
   * Set the length of the scrollbar's handle and change the SVG attribute
   * accordingly.
   * @param {number} newLength The new scrollbar handle length in CSS pixels.
   * @private
   */
  setHandleLength_(newLength) {
    this.handleLength_ = newLength;
    this.svgHandle_.setAttribute(this.lengthAttribute_, this.handleLength_);
  }

  /**
   * Constrain the handle's position within the minimum (0) and maximum values
   * allowed for the scrollbar.
   * @param {number} value Value that is potentially out of bounds, in CSS
   *     pixels.
   * @return {number} Constrained value, in CSS pixels.
   * @private
   */
  constrainHandlePosition_(value) {
    if (value <= 0 || isNaN(value)) {
      value = 0;
    } else {
      // Handle length should never be greater than this.scrollbarLength_.
      // If the viewSize is greater than or equal to the scrollSize, the
      // handleLength will end up equal to this.scrollbarLength_.
      value = Math.min(value, this.scrollbarLength_ - this.handleLength_);
    }
    return value;
  }

  /**
   * Set the offset of the scrollbar's handle from the scrollbar's position, and
   * change the SVG attribute accordingly.
   * @param {number} newPosition The new scrollbar handle offset in CSS pixels.
   */
  setHandlePosition(newPosition) {
    this.handlePosition_ = newPosition;
    this.svgHandle_.setAttribute(this.positionAttribute_, this.handlePosition_);
  }

  /**
   * Set the size of the scrollbar's background and change the SVG attribute
   * accordingly.
   * @param {number} newSize The new scrollbar background length in CSS pixels.
   * @private
   */
  setScrollbarLength_(newSize) {
    this.scrollbarLength_ = newSize;
    this.outerSvg_.setAttribute(this.lengthAttribute_, this.scrollbarLength_);
    this.svgBackground_.setAttribute(
        this.lengthAttribute_, this.scrollbarLength_);
  }

  /**
   * Set the position of the scrollbar's SVG group in CSS pixels relative to the
   * scrollbar's origin.  This sets the scrollbar's location within the
   * workspace.
   * @param {number} x The new x coordinate.
   * @param {number} y The new y coordinate.
   * @package
   */
  setPosition(x, y) {
    this.position.x = x;
    this.position.y = y;

    const tempX = this.position.x + this.origin_.x;
    const tempY = this.position.y + this.origin_.y;
    const transform = 'translate(' + tempX + 'px,' + tempY + 'px)';
    dom.setCssTransform(/** @type {!Element} */ (this.outerSvg_), transform);
  }

  /**
   * Recalculate the scrollbar's location and its length.
   * @param {Metrics=} opt_metrics A data structure of from the
   *     describing all the required dimensions.  If not provided, it will be
   *     fetched from the host object.
   */
  resize(opt_metrics) {
    // Determine the location, height and width of the host element.
    let hostMetrics = opt_metrics;
    if (!hostMetrics) {
      hostMetrics = this.workspace_.getMetrics();
      if (!hostMetrics) {
        // Host element is likely not visible.
        return;
      }
    }

    if (this.oldHostMetrics_ &&
        Scrollbar.metricsAreEquivalent_(hostMetrics, this.oldHostMetrics_)) {
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
  }

  /**
   * Returns whether the a resizeView is necessary by comparing the passed
   * hostMetrics with cached old host metrics.
   * @param {!Metrics} hostMetrics A data structure describing all
   *     the required dimensions, possibly fetched from the host object.
   * @return {boolean} Whether a resizeView is necessary.
   * @private
   */
  requiresViewResize_(hostMetrics) {
    if (!this.oldHostMetrics_) {
      return true;
    }
    return this.oldHostMetrics_.viewWidth !== hostMetrics.viewWidth ||
        this.oldHostMetrics_.viewHeight !== hostMetrics.viewHeight ||
        this.oldHostMetrics_.absoluteLeft !== hostMetrics.absoluteLeft ||
        this.oldHostMetrics_.absoluteTop !== hostMetrics.absoluteTop;
  }

  /**
   * Recalculate a horizontal scrollbar's location and length.
   * @param {!Metrics} hostMetrics A data structure describing all
   *     the required dimensions, possibly fetched from the host object.
   * @private
   */
  resizeHorizontal_(hostMetrics) {
    if (this.requiresViewResize_(hostMetrics)) {
      this.resizeViewHorizontal(hostMetrics);
    } else {
      this.resizeContentHorizontal(hostMetrics);
    }
  }

  /**
   * Recalculate a horizontal scrollbar's location on the screen and path
   * length. This should be called when the layout or size of the window has
   * changed.
   * @param {!Metrics} hostMetrics A data structure describing all
   *     the required dimensions, possibly fetched from the host object.
   */
  resizeViewHorizontal(hostMetrics) {
    let viewSize = hostMetrics.viewWidth - this.margin_ * 2;
    if (this.pair_) {
      // Shorten the scrollbar to make room for the corner square.
      viewSize -= Scrollbar.scrollbarThickness;
    }
    this.setScrollbarLength_(Math.max(0, viewSize));

    let xCoordinate = hostMetrics.absoluteLeft + this.margin_;
    if (this.pair_ && this.workspace_.RTL) {
      xCoordinate += Scrollbar.scrollbarThickness;
    }

    // Horizontal toolbar should always be just above the bottom of the
    // workspace.
    const yCoordinate = hostMetrics.absoluteTop + hostMetrics.viewHeight -
        Scrollbar.scrollbarThickness - this.margin_;
    this.setPosition(xCoordinate, yCoordinate);

    // If the view has been resized, a content resize will also be necessary.
    // The reverse is not true.
    this.resizeContentHorizontal(hostMetrics);
  }

  /**
   * Recalculate a horizontal scrollbar's location within its path and length.
   * This should be called when the contents of the workspace have changed.
   * @param {!Metrics} hostMetrics A data structure describing all
   *     the required dimensions, possibly fetched from the host object.
   */
  resizeContentHorizontal(hostMetrics) {
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
    let handleLength =
        this.scrollbarLength_ * hostMetrics.viewWidth / hostMetrics.scrollWidth;
    handleLength = this.constrainHandleLength_(handleLength);
    this.setHandleLength_(handleLength);

    // Compute the handle offset.
    // The position of the handle can be between:
    //     0 and this.scrollbarLength_ - handleLength
    // If viewLeft === scrollLeft
    //     then the offset should be 0
    // If viewRight === scrollRight
    //     then viewLeft = scrollLeft + scrollWidth - viewWidth
    //     then the offset should be max offset

    const maxScrollDistance = hostMetrics.scrollWidth - hostMetrics.viewWidth;
    const contentDisplacement = hostMetrics.viewLeft - hostMetrics.scrollLeft;
    // Percent of content to the left of our current position.
    const offsetRatio = contentDisplacement / maxScrollDistance;
    // Area available to scroll * percent to the left
    const maxHandleOffset = this.scrollbarLength_ - this.handleLength_;
    let handleOffset = maxHandleOffset * offsetRatio;
    handleOffset = this.constrainHandlePosition_(handleOffset);
    this.setHandlePosition(handleOffset);

    // Compute ratio (for use with set calls, which pass in content
    // displacement).
    this.ratio = maxHandleOffset / maxScrollDistance;
  }

  /**
   * Recalculate a vertical scrollbar's location and length.
   * @param {!Metrics} hostMetrics A data structure describing all
   *     the required dimensions, possibly fetched from the host object.
   * @private
   */
  resizeVertical_(hostMetrics) {
    if (this.requiresViewResize_(hostMetrics)) {
      this.resizeViewVertical(hostMetrics);
    } else {
      this.resizeContentVertical(hostMetrics);
    }
  }

  /**
   * Recalculate a vertical scrollbar's location on the screen and path length.
   * This should be called when the layout or size of the window has changed.
   * @param {!Metrics} hostMetrics A data structure describing all
   *     the required dimensions, possibly fetched from the host object.
   */
  resizeViewVertical(hostMetrics) {
    let viewSize = hostMetrics.viewHeight - this.margin_ * 2;
    if (this.pair_) {
      // Shorten the scrollbar to make room for the corner square.
      viewSize -= Scrollbar.scrollbarThickness;
    }
    this.setScrollbarLength_(Math.max(0, viewSize));

    const xCoordinate = this.workspace_.RTL ?
        hostMetrics.absoluteLeft + this.margin_ :
        hostMetrics.absoluteLeft + hostMetrics.viewWidth -
            Scrollbar.scrollbarThickness - this.margin_;

    const yCoordinate = hostMetrics.absoluteTop + this.margin_;
    this.setPosition(xCoordinate, yCoordinate);

    // If the view has been resized, a content resize will also be necessary.
    // The reverse is not true.
    this.resizeContentVertical(hostMetrics);
  }

  /**
   * Recalculate a vertical scrollbar's location within its path and length.
   * This should be called when the contents of the workspace have changed.
   * @param {!Metrics} hostMetrics A data structure describing all
   *     the required dimensions, possibly fetched from the host object.
   */
  resizeContentVertical(hostMetrics) {
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
    let handleLength = this.scrollbarLength_ * hostMetrics.viewHeight /
        hostMetrics.scrollHeight;
    handleLength = this.constrainHandleLength_(handleLength);
    this.setHandleLength_(handleLength);

    // Compute the handle offset.
    // The position of the handle can be between:
    //     0 and this.scrollbarLength_ - handleLength
    // If viewTop === scrollTop
    //     then the offset should be 0
    // If viewBottom === scrollBottom
    //     then viewTop = scrollTop + scrollHeight - viewHeight
    //     then the offset should be max offset

    const maxScrollDistance = hostMetrics.scrollHeight - hostMetrics.viewHeight;
    const contentDisplacement = hostMetrics.viewTop - hostMetrics.scrollTop;
    // Percent of content to the left of our current position.
    const offsetRatio = contentDisplacement / maxScrollDistance;
    // Area available to scroll * percent to the left
    const maxHandleOffset = this.scrollbarLength_ - this.handleLength_;
    let handleOffset = maxHandleOffset * offsetRatio;
    handleOffset = this.constrainHandlePosition_(handleOffset);
    this.setHandlePosition(handleOffset);

    // Compute ratio (for use with set calls, which pass in content
    // displacement).
    this.ratio = maxHandleOffset / maxScrollDistance;
  }

  /**
   * Create all the DOM elements required for a scrollbar.
   * The resulting widget is not sized.
   * @param {string=} opt_class A class to be applied to this scrollbar.
   * @private
   */
  createDom_(opt_class) {
    /* Create the following DOM:
    <svg class="blocklyScrollbarHorizontal  optionalClass">
      <g>
        <rect class="blocklyScrollbarBackground" />
        <rect class="blocklyScrollbarHandle" rx="8" ry="8" />
      </g>
    </svg>
    */
    let className =
        'blocklyScrollbar' + (this.horizontal_ ? 'Horizontal' : 'Vertical');
    if (opt_class) {
      className += ' ' + opt_class;
    }
    this.outerSvg_ = dom.createSvgElement(Svg.SVG, {'class': className}, null);
    this.svgGroup_ = dom.createSvgElement(Svg.G, {}, this.outerSvg_);
    this.svgBackground_ = dom.createSvgElement(
        Svg.RECT, {'class': 'blocklyScrollbarBackground'}, this.svgGroup_);
    const radius = Math.floor((Scrollbar.scrollbarThickness - 5) / 2);
    this.svgHandle_ = dom.createSvgElement(
        Svg.RECT,
        {'class': 'blocklyScrollbarHandle', 'rx': radius, 'ry': radius},
        this.svgGroup_);
    this.workspace_.getThemeManager().subscribe(
        this.svgHandle_, 'scrollbarColour', 'fill');
    this.workspace_.getThemeManager().subscribe(
        this.svgHandle_, 'scrollbarOpacity', 'fill-opacity');
    dom.insertAfter(this.outerSvg_, this.workspace_.getParentSvg());
  }

  /**
   * Is the scrollbar visible.  Non-paired scrollbars disappear when they aren't
   * needed.
   * @return {boolean} True if visible.
   */
  isVisible() {
    return this.isVisible_;
  }

  /**
   * Set whether the scrollbar's container is visible and update
   * display accordingly if visibility has changed.
   * @param {boolean} visible Whether the container is visible
   */
  setContainerVisible(visible) {
    const visibilityChanged = (visible !== this.containerVisible_);

    this.containerVisible_ = visible;
    if (visibilityChanged) {
      this.updateDisplay_();
    }
  }

  /**
   * Set whether the scrollbar is visible.
   * Only applies to non-paired scrollbars.
   * @param {boolean} visible True if visible.
   */
  setVisible(visible) {
    const visibilityChanged = (visible !== this.isVisible());

    // Ideally this would also apply to scrollbar pairs, but that's a bigger
    // headache (due to interactions with the corner square).
    if (this.pair_) {
      throw Error('Unable to toggle visibility of paired scrollbars.');
    }
    this.isVisible_ = visible;
    if (visibilityChanged) {
      this.updateDisplay_();
    }
  }

  /**
   * Update visibility of scrollbar based on whether it thinks it should
   * be visible and whether its containing workspace is visible.
   * We cannot rely on the containing workspace being hidden to hide us
   * because it is not necessarily our parent in the DOM.
   */
  updateDisplay_() {
    let show = true;
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
  }

  /**
   * Scroll by one pageful.
   * Called when scrollbar background is clicked.
   * @param {!Event} e Mouse down event.
   * @private
   */
  onMouseDownBar_(e) {
    this.workspace_.markFocused();
    Touch.clearTouchIdentifier();  // This is really a click.
    this.cleanUp_();
    if (browserEvents.isRightButton(e)) {
      // Right-click.
      // Scrollbars have no context menu.
      e.stopPropagation();
      return;
    }
    const mouseXY = browserEvents.mouseToSvg(
        e, this.workspace_.getParentSvg(),
        this.workspace_.getInverseScreenCTM());
    const mouseLocation = this.horizontal_ ? mouseXY.x : mouseXY.y;

    const handleXY =
        svgMath.getInjectionDivXY(/** @type {!Element} */ (this.svgHandle_));
    const handleStart = this.horizontal_ ? handleXY.x : handleXY.y;
    let handlePosition = this.handlePosition_;

    const pageLength = this.handleLength_ * 0.95;
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
  }

  /**
   * Start a dragging operation.
   * Called when scrollbar handle is clicked.
   * @param {!Event} e Mouse down event.
   * @private
   */
  onMouseDownHandle_(e) {
    this.workspace_.markFocused();
    this.cleanUp_();
    if (browserEvents.isRightButton(e)) {
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
    Scrollbar.onMouseUpWrapper_ = browserEvents.conditionalBind(
        document, 'mouseup', this, this.onMouseUpHandle_);
    Scrollbar.onMouseMoveWrapper_ = browserEvents.conditionalBind(
        document, 'mousemove', this, this.onMouseMoveHandle_);
    e.stopPropagation();
    e.preventDefault();
  }

  /**
   * Drag the scrollbar's handle.
   * @param {!Event} e Mouse up event.
   * @private
   */
  onMouseMoveHandle_(e) {
    const currentMouse = this.horizontal_ ? e.clientX : e.clientY;
    const mouseDelta = currentMouse - this.startDragMouse_;
    const handlePosition = this.startDragHandle + mouseDelta;
    // Position the bar.
    this.setHandlePosition(this.constrainHandlePosition_(handlePosition));
    this.updateMetrics_();
  }

  /**
   * Release the scrollbar handle and reset state accordingly.
   * @private
   */
  onMouseUpHandle_() {
    // Tell the workspace to clean up now that the workspace is done moving.
    this.workspace_.resetDragSurface();
    Touch.clearTouchIdentifier();
    this.cleanUp_();
  }

  /**
   * Hide chaff and stop binding to mouseup and mousemove events.  Call this to
   * wrap up loose ends associated with the scrollbar.
   * @private
   */
  cleanUp_() {
    this.workspace_.hideChaff(true);
    if (Scrollbar.onMouseUpWrapper_) {
      browserEvents.unbind(Scrollbar.onMouseUpWrapper_);
      Scrollbar.onMouseUpWrapper_ = null;
    }
    if (Scrollbar.onMouseMoveWrapper_) {
      browserEvents.unbind(Scrollbar.onMouseMoveWrapper_);
      Scrollbar.onMouseMoveWrapper_ = null;
    }
  }

  /**
   * Helper to calculate the ratio of handle position to scrollbar view size.
   * @return {number} Ratio.
   * @package
   */
  getRatio_() {
    const scrollHandleRange = this.scrollbarLength_ - this.handleLength_;
    let ratio = this.handlePosition_ / scrollHandleRange;
    if (isNaN(ratio)) {
      ratio = 0;
    }
    return ratio;
  }

  /**
   * Updates workspace metrics based on new scroll ratio. Called when scrollbar
   * is moved.
   * @private
   */
  updateMetrics_() {
    const ratio = this.getRatio_();
    const xyRatio = {};
    if (this.horizontal_) {
      xyRatio.x = ratio;
    } else {
      xyRatio.y = ratio;
    }
    this.workspace_.setMetrics(xyRatio);
  }

  /**
   * Set the scrollbar handle's position.
   * @param {number} value The content displacement, relative to the view in
   *    pixels.
   * @param {boolean=} updateMetrics Whether to update metrics on this set call.
   *    Defaults to true.
   */
  set(value, updateMetrics) {
    this.setHandlePosition(this.constrainHandlePosition_(value * this.ratio));
    if (updateMetrics || updateMetrics === undefined) {
      this.updateMetrics_();
    }
  }

  /**
   * Record the origin of the workspace that the scrollbar is in, in pixels
   * relative to the injection div origin. This is for times when the scrollbar
   * is used in an object whose origin isn't the same as the main workspace
   * (e.g. in a flyout.)
   * @param {number} x The x coordinate of the scrollbar's origin, in CSS
   *     pixels.
   * @param {number} y The y coordinate of the scrollbar's origin, in CSS
   *     pixels.
   */
  setOrigin(x, y) {
    this.origin_ = new Coordinate(x, y);
  }

  /**
   * @param {!Metrics} first An object containing computed
   *     measurements of a workspace.
   * @param {!Metrics} second Another object containing computed
   *     measurements of a workspace.
   * @return {boolean} Whether the two sets of metrics are equivalent.
   * @private
   */
  static metricsAreEquivalent_(first, second) {
    return (
        first.viewWidth === second.viewWidth &&
        first.viewHeight === second.viewHeight &&
        first.viewLeft === second.viewLeft &&
        first.viewTop === second.viewTop &&
        first.absoluteTop === second.absoluteTop &&
        first.absoluteLeft === second.absoluteLeft &&
        first.scrollWidth === second.scrollWidth &&
        first.scrollHeight === second.scrollHeight &&
        first.scrollLeft === second.scrollLeft &&
        first.scrollTop === second.scrollTop);
  }
}

/**
 * Width of vertical scrollbar or height of horizontal scrollbar in CSS pixels.
 * Scrollbars should be larger on touch devices.
 */
Scrollbar.scrollbarThickness = 15;

if (Touch.TOUCH_ENABLED) {
  Scrollbar.scrollbarThickness = 25;
}

/**
 * Default margin around the scrollbar (between the scrollbar and the edge of
 * the viewport in pixels).
 * @type {number}
 * @const
 * @package
 */
Scrollbar.DEFAULT_SCROLLBAR_MARGIN = 0.5;

exports.Scrollbar = Scrollbar;
