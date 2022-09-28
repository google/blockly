/**
 * @license
 * Copyright 2012 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Object representing a UI bubble.
 */
'use strict';

/**
 * Object representing a UI bubble.
 * @class
 */
goog.module('Blockly.Bubble');

const Touch = goog.require('Blockly.Touch');
const browserEvents = goog.require('Blockly.browserEvents');
const dom = goog.require('Blockly.utils.dom');
const math = goog.require('Blockly.utils.math');
const userAgent = goog.require('Blockly.utils.userAgent');
/* eslint-disable-next-line no-unused-vars */
const {BlockDragSurfaceSvg} = goog.requireType('Blockly.BlockDragSurfaceSvg');
/* eslint-disable-next-line no-unused-vars */
const {BlockSvg} = goog.requireType('Blockly.BlockSvg');
const {Coordinate} = goog.require('Blockly.utils.Coordinate');
/* eslint-disable-next-line no-unused-vars */
const {IBubble} = goog.require('Blockly.IBubble');
/* eslint-disable-next-line no-unused-vars */
const {MetricsManager} = goog.requireType('Blockly.MetricsManager');
const {Scrollbar} = goog.require('Blockly.Scrollbar');
const {Size} = goog.require('Blockly.utils.Size');
const {Svg} = goog.require('Blockly.utils.Svg');
/* eslint-disable-next-line no-unused-vars */
const {WorkspaceSvg} = goog.requireType('Blockly.WorkspaceSvg');
/** @suppress {extraRequire} */
goog.require('Blockly.Workspace');


/**
 * Class for UI bubble.
 * @implements {IBubble}
 * @alias Blockly.Bubble
 */
const Bubble = class {
  /**
   * @param {!WorkspaceSvg} workspace The workspace on which to draw the
   *     bubble.
   * @param {!Element} content SVG content for the bubble.
   * @param {!Element} shape SVG element to avoid eclipsing.
   * @param {!Coordinate} anchorXY Absolute position of bubble's
   *     anchor point.
   * @param {?number} bubbleWidth Width of bubble, or null if not resizable.
   * @param {?number} bubbleHeight Height of bubble, or null if not resizable.
   * @struct
   */
  constructor(workspace, content, shape, anchorXY, bubbleWidth, bubbleHeight) {
    this.workspace_ = workspace;
    this.content_ = content;
    this.shape_ = shape;

    /**
     * Flag to stop incremental rendering during construction.
     * @type {boolean}
     * @private
     */
    this.rendered_ = false;

    /**
     * The SVG group containing all parts of the bubble.
     * @type {SVGGElement}
     * @private
     */
    this.bubbleGroup_ = null;

    /**
     * The SVG path for the arrow from the bubble to the icon on the block.
     * @type {SVGPathElement}
     * @private
     */
    this.bubbleArrow_ = null;

    /**
     * The SVG rect for the main body of the bubble.
     * @type {SVGRectElement}
     * @private
     */
    this.bubbleBack_ = null;

    /**
     * The SVG group for the resize hash marks on some bubbles.
     * @type {SVGGElement}
     * @private
     */
    this.resizeGroup_ = null;

    /**
     * Absolute coordinate of anchor point, in workspace coordinates.
     * @type {Coordinate}
     * @private
     */
    this.anchorXY_ = null;

    /**
     * Relative X coordinate of bubble with respect to the anchor's centre,
     * in workspace units.
     * In RTL mode the initial value is negated.
     * @type {number}
     * @private
     */
    this.relativeLeft_ = 0;

    /**
     * Relative Y coordinate of bubble with respect to the anchor's centre, in
     * workspace units.
     * @type {number}
     * @private
     */
    this.relativeTop_ = 0;

    /**
     * Width of bubble, in workspace units.
     * @type {number}
     * @private
     */
    this.width_ = 0;

    /**
     * Height of bubble, in workspace units.
     * @type {number}
     * @private
     */
    this.height_ = 0;

    /**
     * Automatically position and reposition the bubble.
     * @type {boolean}
     * @private
     */
    this.autoLayout_ = true;

    /**
     * Method to call on resize of bubble.
     * @type {?function()}
     * @private
     */
    this.resizeCallback_ = null;

    /**
     * Method to call on move of bubble.
     * @type {?function()}
     * @private
     */
    this.moveCallback_ = null;

    /**
     * Mouse down on bubbleBack_ event data.
     * @type {?browserEvents.Data}
     * @private
     */
    this.onMouseDownBubbleWrapper_ = null;

    /**
     * Mouse down on resizeGroup_ event data.
     * @type {?browserEvents.Data}
     * @private
     */
    this.onMouseDownResizeWrapper_ = null;

    /**
     * Describes whether this bubble has been disposed of (nodes and event
     * listeners removed from the page) or not.
     * @type {boolean}
     * @package
     */
    this.disposed = false;

    let angle = Bubble.ARROW_ANGLE;
    if (this.workspace_.RTL) {
      angle = -angle;
    }
    this.arrow_radians_ = math.toRadians(angle);

    const canvas = workspace.getBubbleCanvas();
    canvas.appendChild(
        this.createDom_(content, !!(bubbleWidth && bubbleHeight)));

    this.setAnchorLocation(anchorXY);
    if (!bubbleWidth || !bubbleHeight) {
      const bBox = /** @type {SVGLocatable} */ (this.content_).getBBox();
      bubbleWidth = bBox.width + 2 * Bubble.BORDER_WIDTH;
      bubbleHeight = bBox.height + 2 * Bubble.BORDER_WIDTH;
    }
    this.setBubbleSize(bubbleWidth, bubbleHeight);

    // Render the bubble.
    this.positionBubble_();
    this.renderArrow_();
    this.rendered_ = true;
  }

  /**
   * Create the bubble's DOM.
   * @param {!Element} content SVG content for the bubble.
   * @param {boolean} hasResize Add diagonal resize gripper if true.
   * @return {!SVGElement} The bubble's SVG group.
   * @private
   */
  createDom_(content, hasResize) {
    /* Create the bubble.  Here's the markup that will be generated:
    <g>
      <g filter="url(#blocklyEmbossFilter837493)">
        <path d="... Z" />
        <rect class="blocklyDraggable" rx="8" ry="8" width="180" height="180"/>
      </g>
      <g transform="translate(165, 165)" class="blocklyResizeSE">
        <polygon points="0,15 15,15 15,0"/>
        <line class="blocklyResizeLine" x1="5" y1="14" x2="14" y2="5"/>
        <line class="blocklyResizeLine" x1="10" y1="14" x2="14" y2="10"/>
      </g>
      [...content goes here...]
    </g>
    */
    this.bubbleGroup_ = dom.createSvgElement(Svg.G, {}, null);
    let filter = {
      'filter': 'url(#' +
          this.workspace_.getRenderer().getConstants().embossFilterId + ')',
    };
    if (userAgent.JAVA_FX) {
      // Multiple reports that JavaFX can't handle filters.
      // https://github.com/google/blockly/issues/99
      filter = {};
    }
    const bubbleEmboss = dom.createSvgElement(Svg.G, filter, this.bubbleGroup_);
    this.bubbleArrow_ = dom.createSvgElement(Svg.PATH, {}, bubbleEmboss);
    this.bubbleBack_ = dom.createSvgElement(
        Svg.RECT, {
          'class': 'blocklyDraggable',
          'x': 0,
          'y': 0,
          'rx': Bubble.BORDER_WIDTH,
          'ry': Bubble.BORDER_WIDTH,
        },
        bubbleEmboss);
    if (hasResize) {
      this.resizeGroup_ = dom.createSvgElement(
          Svg.G, {
            'class': this.workspace_.RTL ? 'blocklyResizeSW' :
                                           'blocklyResizeSE',
          },
          this.bubbleGroup_);
      const resizeSize = 2 * Bubble.BORDER_WIDTH;
      dom.createSvgElement(
          Svg.POLYGON,
          {'points': '0,x x,x x,0'.replace(/x/g, resizeSize.toString())},
          this.resizeGroup_);
      dom.createSvgElement(
          Svg.LINE, {
            'class': 'blocklyResizeLine',
            'x1': resizeSize / 3,
            'y1': resizeSize - 1,
            'x2': resizeSize - 1,
            'y2': resizeSize / 3,
          },
          this.resizeGroup_);
      dom.createSvgElement(
          Svg.LINE, {
            'class': 'blocklyResizeLine',
            'x1': resizeSize * 2 / 3,
            'y1': resizeSize - 1,
            'x2': resizeSize - 1,
            'y2': resizeSize * 2 / 3,
          },
          this.resizeGroup_);
    } else {
      this.resizeGroup_ = null;
    }

    if (!this.workspace_.options.readOnly) {
      this.onMouseDownBubbleWrapper_ = browserEvents.conditionalBind(
          this.bubbleBack_, 'mousedown', this, this.bubbleMouseDown_);
      if (this.resizeGroup_) {
        this.onMouseDownResizeWrapper_ = browserEvents.conditionalBind(
            this.resizeGroup_, 'mousedown', this, this.resizeMouseDown_);
      }
    }
    this.bubbleGroup_.appendChild(content);
    return this.bubbleGroup_;
  }

  /**
   * Return the root node of the bubble's SVG group.
   * @return {!SVGElement} The root SVG node of the bubble's group.
   */
  getSvgRoot() {
    return /** @type {!SVGElement} */ (this.bubbleGroup_);
  }

  /**
   * Expose the block's ID on the bubble's top-level SVG group.
   * @param {string} id ID of block.
   */
  setSvgId(id) {
    if (this.bubbleGroup_.dataset) {
      this.bubbleGroup_.dataset['blockId'] = id;
    }
  }

  /**
   * Handle a mouse-down on bubble's border.
   * @param {!Event} e Mouse down event.
   * @private
   */
  bubbleMouseDown_(e) {
    const gesture = this.workspace_.getGesture(e);
    if (gesture) {
      gesture.handleBubbleStart(e, this);
    }
  }

  /**
   * Show the context menu for this bubble.
   * @param {!Event} _e Mouse event.
   * @package
   */
  showContextMenu(_e) {
    // NOP on bubbles, but used by the bubble dragger to pass events to
    // workspace comments.
  }

  /**
   * Get whether this bubble is deletable or not.
   * @return {boolean} True if deletable.
   * @package
   */
  isDeletable() {
    return false;
  }

  /**
   * Update the style of this bubble when it is dragged over a delete area.
   * @param {boolean} _enable True if the bubble is about to be deleted, false
   *     otherwise.
   */
  setDeleteStyle(_enable) {
    // NOP if bubble is not deletable.
  }

  /**
   * Handle a mouse-down on bubble's resize corner.
   * @param {!Event} e Mouse down event.
   * @private
   */
  resizeMouseDown_(e) {
    this.promote();
    Bubble.unbindDragEvents_();
    if (browserEvents.isRightButton(e)) {
      // No right-click.
      e.stopPropagation();
      return;
    }
    // Left-click (or middle click)
    this.workspace_.startDrag(
        e,
        new Coordinate(
            this.workspace_.RTL ? -this.width_ : this.width_, this.height_));

    Bubble.onMouseUpWrapper_ = browserEvents.conditionalBind(
        document, 'mouseup', this, Bubble.bubbleMouseUp_);
    Bubble.onMouseMoveWrapper_ = browserEvents.conditionalBind(
        document, 'mousemove', this, this.resizeMouseMove_);
    this.workspace_.hideChaff();
    // This event has been handled.  No need to bubble up to the document.
    e.stopPropagation();
  }

  /**
   * Resize this bubble to follow the mouse.
   * @param {!Event} e Mouse move event.
   * @private
   */
  resizeMouseMove_(e) {
    this.autoLayout_ = false;
    const newXY = this.workspace_.moveDrag(e);
    this.setBubbleSize(this.workspace_.RTL ? -newXY.x : newXY.x, newXY.y);
    if (this.workspace_.RTL) {
      // RTL requires the bubble to move its left edge.
      this.positionBubble_();
    }
  }

  /**
   * Register a function as a callback event for when the bubble is resized.
   * @param {!Function} callback The function to call on resize.
   */
  registerResizeEvent(callback) {
    this.resizeCallback_ = callback;
  }

  /**
   * Register a function as a callback event for when the bubble is moved.
   * @param {!Function} callback The function to call on move.
   */
  registerMoveEvent(callback) {
    this.moveCallback_ = callback;
  }

  /**
   * Move this bubble to the top of the stack.
   * @return {boolean} Whether or not the bubble has been moved.
   * @package
   */
  promote() {
    const svgGroup = this.bubbleGroup_.parentNode;
    if (svgGroup.lastChild !== this.bubbleGroup_) {
      svgGroup.appendChild(this.bubbleGroup_);
      return true;
    }
    return false;
  }

  /**
   * Notification that the anchor has moved.
   * Update the arrow and bubble accordingly.
   * @param {!Coordinate} xy Absolute location.
   */
  setAnchorLocation(xy) {
    this.anchorXY_ = xy;
    if (this.rendered_) {
      this.positionBubble_();
    }
  }

  /**
   * Position the bubble so that it does not fall off-screen.
   * @private
   */
  layoutBubble_() {
    // Get the metrics in workspace units.
    const viewMetrics =
        this.workspace_.getMetricsManager().getViewMetrics(true);

    const optimalLeft = this.getOptimalRelativeLeft_(viewMetrics);
    const optimalTop = this.getOptimalRelativeTop_(viewMetrics);
    const bbox = this.shape_.getBBox();

    const topPosition = {
      x: optimalLeft,
      y: -this.height_ -
          this.workspace_.getRenderer().getConstants().MIN_BLOCK_HEIGHT,
    };
    const startPosition = {x: -this.width_ - 30, y: optimalTop};
    const endPosition = {x: bbox.width, y: optimalTop};
    const bottomPosition = {x: optimalLeft, y: bbox.height};

    const closerPosition =
        bbox.width < bbox.height ? endPosition : bottomPosition;
    const fartherPosition =
        bbox.width < bbox.height ? bottomPosition : endPosition;

    const topPositionOverlap = this.getOverlap_(topPosition, viewMetrics);
    const startPositionOverlap = this.getOverlap_(startPosition, viewMetrics);
    const closerPositionOverlap = this.getOverlap_(closerPosition, viewMetrics);
    const fartherPositionOverlap =
        this.getOverlap_(fartherPosition, viewMetrics);

    // Set the position to whichever position shows the most of the bubble,
    // with tiebreaks going in the order: top > start > close > far.
    const mostOverlap = Math.max(
        topPositionOverlap, startPositionOverlap, closerPositionOverlap,
        fartherPositionOverlap);
    if (topPositionOverlap === mostOverlap) {
      this.relativeLeft_ = topPosition.x;
      this.relativeTop_ = topPosition.y;
      return;
    }
    if (startPositionOverlap === mostOverlap) {
      this.relativeLeft_ = startPosition.x;
      this.relativeTop_ = startPosition.y;
      return;
    }
    if (closerPositionOverlap === mostOverlap) {
      this.relativeLeft_ = closerPosition.x;
      this.relativeTop_ = closerPosition.y;
      return;
    }
    // TODO: I believe relativeLeft_ should actually be called relativeStart_
    //  and then the math should be fixed to reflect this. (hopefully it'll
    //  make it look simpler)
    this.relativeLeft_ = fartherPosition.x;
    this.relativeTop_ = fartherPosition.y;
  }

  /**
   * Calculate the what percentage of the bubble overlaps with the visible
   * workspace (what percentage of the bubble is visible).
   * @param {!{x: number, y: number}} relativeMin The position of the top-left
   *     corner of the bubble relative to the anchor point.
   * @param {!MetricsManager.ContainerRegion} viewMetrics The view metrics
   *     of the workspace the bubble will appear in.
   * @return {number} The percentage of the bubble that is visible.
   * @private
   */
  getOverlap_(relativeMin, viewMetrics) {
    // The position of the top-left corner of the bubble in workspace units.
    const bubbleMin = {
      x: this.workspace_.RTL ?
          (this.anchorXY_.x - relativeMin.x - this.width_) :
          (relativeMin.x + this.anchorXY_.x),
      y: relativeMin.y + this.anchorXY_.y,
    };
    // The position of the bottom-right corner of the bubble in workspace units.
    const bubbleMax = {
      x: bubbleMin.x + this.width_,
      y: bubbleMin.y + this.height_,
    };

    // We could adjust these values to account for the scrollbars, but the
    // bubbles should have been adjusted to not collide with them anyway, so
    // giving the workspace a slightly larger "bounding box" shouldn't affect
    // the calculation.

    // The position of the top-left corner of the workspace.
    const workspaceMin = {x: viewMetrics.left, y: viewMetrics.top};
    // The position of the bottom-right corner of the workspace.
    const workspaceMax = {
      x: viewMetrics.left + viewMetrics.width,
      y: viewMetrics.top + viewMetrics.height,
    };

    const overlapWidth = Math.min(bubbleMax.x, workspaceMax.x) -
        Math.max(bubbleMin.x, workspaceMin.x);
    const overlapHeight = Math.min(bubbleMax.y, workspaceMax.y) -
        Math.max(bubbleMin.y, workspaceMin.y);
    return Math.max(
        0,
        Math.min(
            1, (overlapWidth * overlapHeight) / (this.width_ * this.height_)));
  }

  /**
   * Calculate what the optimal horizontal position of the top-left corner of
   * the bubble is (relative to the anchor point) so that the most area of the
   * bubble is shown.
   * @param {!MetricsManager.ContainerRegion} viewMetrics The view metrics
   *     of the workspace the bubble will appear in.
   * @return {number} The optimal horizontal position of the top-left corner
   *     of the bubble.
   * @private
   */
  getOptimalRelativeLeft_(viewMetrics) {
    let relativeLeft = -this.width_ / 4;

    // No amount of sliding left or right will give us a better overlap.
    if (this.width_ > viewMetrics.width) {
      return relativeLeft;
    }

    if (this.workspace_.RTL) {
      // Bubble coordinates are flipped in RTL.
      const bubbleRight = this.anchorXY_.x - relativeLeft;
      const bubbleLeft = bubbleRight - this.width_;

      const workspaceRight = viewMetrics.left + viewMetrics.width;
      const workspaceLeft = viewMetrics.left +
          // Thickness in workspace units.
          (Scrollbar.scrollbarThickness / this.workspace_.scale);

      if (bubbleLeft < workspaceLeft) {
        // Slide the bubble right until it is onscreen.
        relativeLeft = -(workspaceLeft - this.anchorXY_.x + this.width_);
      } else if (bubbleRight > workspaceRight) {
        // Slide the bubble left until it is onscreen.
        relativeLeft = -(workspaceRight - this.anchorXY_.x);
      }
    } else {
      const bubbleLeft = relativeLeft + this.anchorXY_.x;
      const bubbleRight = bubbleLeft + this.width_;

      const workspaceLeft = viewMetrics.left;
      const workspaceRight = viewMetrics.left + viewMetrics.width -
          // Thickness in workspace units.
          (Scrollbar.scrollbarThickness / this.workspace_.scale);

      if (bubbleLeft < workspaceLeft) {
        // Slide the bubble right until it is onscreen.
        relativeLeft = workspaceLeft - this.anchorXY_.x;
      } else if (bubbleRight > workspaceRight) {
        // Slide the bubble left until it is onscreen.
        relativeLeft = workspaceRight - this.anchorXY_.x - this.width_;
      }
    }

    return relativeLeft;
  }

  /**
   * Calculate what the optimal vertical position of the top-left corner of
   * the bubble is (relative to the anchor point) so that the most area of the
   * bubble is shown.
   * @param {!MetricsManager.ContainerRegion} viewMetrics The view metrics
   *     of the workspace the bubble will appear in.
   * @return {number} The optimal vertical position of the top-left corner
   *     of the bubble.
   * @private
   */
  getOptimalRelativeTop_(viewMetrics) {
    let relativeTop = -this.height_ / 4;

    // No amount of sliding up or down will give us a better overlap.
    if (this.height_ > viewMetrics.height) {
      return relativeTop;
    }

    const bubbleTop = this.anchorXY_.y + relativeTop;
    const bubbleBottom = bubbleTop + this.height_;
    const workspaceTop = viewMetrics.top;
    const workspaceBottom = viewMetrics.top + viewMetrics.height -
        // Thickness in workspace units.
        (Scrollbar.scrollbarThickness / this.workspace_.scale);

    const anchorY = this.anchorXY_.y;
    if (bubbleTop < workspaceTop) {
      // Slide the bubble down until it is onscreen.
      relativeTop = workspaceTop - anchorY;
    } else if (bubbleBottom > workspaceBottom) {
      // Slide the bubble up until it is onscreen.
      relativeTop = workspaceBottom - anchorY - this.height_;
    }

    return relativeTop;
  }

  /**
   * Move the bubble to a location relative to the anchor's centre.
   * @private
   */
  positionBubble_() {
    let left = this.anchorXY_.x;
    if (this.workspace_.RTL) {
      left -= this.relativeLeft_ + this.width_;
    } else {
      left += this.relativeLeft_;
    }
    const top = this.relativeTop_ + this.anchorXY_.y;
    this.moveTo(left, top);
  }

  /**
   * Move the bubble group to the specified location in workspace coordinates.
   * @param {number} x The x position to move to.
   * @param {number} y The y position to move to.
   * @package
   */
  moveTo(x, y) {
    this.bubbleGroup_.setAttribute(
        'transform', 'translate(' + x + ',' + y + ')');
  }

  /**
   * Triggers a move callback if one exists at the end of a drag.
   * @param {boolean} adding True if adding, false if removing.
   * @package
   */
  setDragging(adding) {
    if (!adding && this.moveCallback_) {
      this.moveCallback_();
    }
  }

  /**
   * Get the dimensions of this bubble.
   * @return {!Size} The height and width of the bubble.
   */
  getBubbleSize() {
    return new Size(this.width_, this.height_);
  }

  /**
   * Size this bubble.
   * @param {number} width Width of the bubble.
   * @param {number} height Height of the bubble.
   */
  setBubbleSize(width, height) {
    const doubleBorderWidth = 2 * Bubble.BORDER_WIDTH;
    // Minimum size of a bubble.
    width = Math.max(width, doubleBorderWidth + 45);
    height = Math.max(height, doubleBorderWidth + 20);
    this.width_ = width;
    this.height_ = height;
    this.bubbleBack_.setAttribute('width', width);
    this.bubbleBack_.setAttribute('height', height);
    if (this.resizeGroup_) {
      if (this.workspace_.RTL) {
        // Mirror the resize group.
        const resizeSize = 2 * Bubble.BORDER_WIDTH;
        this.resizeGroup_.setAttribute(
            'transform',
            'translate(' + resizeSize + ',' + (height - doubleBorderWidth) +
                ') scale(-1 1)');
      } else {
        this.resizeGroup_.setAttribute(
            'transform',
            'translate(' + (width - doubleBorderWidth) + ',' +
                (height - doubleBorderWidth) + ')');
      }
    }
    if (this.autoLayout_) {
      this.layoutBubble_();
    }
    this.positionBubble_();
    this.renderArrow_();

    // Allow the contents to resize.
    if (this.resizeCallback_) {
      this.resizeCallback_();
    }
  }

  /**
   * Draw the arrow between the bubble and the origin.
   * @private
   */
  renderArrow_() {
    const steps = [];
    // Find the relative coordinates of the center of the bubble.
    const relBubbleX = this.width_ / 2;
    const relBubbleY = this.height_ / 2;
    // Find the relative coordinates of the center of the anchor.
    let relAnchorX = -this.relativeLeft_;
    let relAnchorY = -this.relativeTop_;
    if (relBubbleX === relAnchorX && relBubbleY === relAnchorY) {
      // Null case.  Bubble is directly on top of the anchor.
      // Short circuit this rather than wade through divide by zeros.
      steps.push('M ' + relBubbleX + ',' + relBubbleY);
    } else {
      // Compute the angle of the arrow's line.
      const rise = relAnchorY - relBubbleY;
      let run = relAnchorX - relBubbleX;
      if (this.workspace_.RTL) {
        run *= -1;
      }
      const hypotenuse = Math.sqrt(rise * rise + run * run);
      let angle = Math.acos(run / hypotenuse);
      if (rise < 0) {
        angle = 2 * Math.PI - angle;
      }
      // Compute a line perpendicular to the arrow.
      let rightAngle = angle + Math.PI / 2;
      if (rightAngle > Math.PI * 2) {
        rightAngle -= Math.PI * 2;
      }
      const rightRise = Math.sin(rightAngle);
      const rightRun = Math.cos(rightAngle);

      // Calculate the thickness of the base of the arrow.
      const bubbleSize = this.getBubbleSize();
      let thickness =
          (bubbleSize.width + bubbleSize.height) / Bubble.ARROW_THICKNESS;
      thickness = Math.min(thickness, bubbleSize.width, bubbleSize.height) / 4;

      // Back the tip of the arrow off of the anchor.
      const backoffRatio = 1 - Bubble.ANCHOR_RADIUS / hypotenuse;
      relAnchorX = relBubbleX + backoffRatio * run;
      relAnchorY = relBubbleY + backoffRatio * rise;

      // Coordinates for the base of the arrow.
      const baseX1 = relBubbleX + thickness * rightRun;
      const baseY1 = relBubbleY + thickness * rightRise;
      const baseX2 = relBubbleX - thickness * rightRun;
      const baseY2 = relBubbleY - thickness * rightRise;

      // Distortion to curve the arrow.
      let swirlAngle = angle + this.arrow_radians_;
      if (swirlAngle > Math.PI * 2) {
        swirlAngle -= Math.PI * 2;
      }
      const swirlRise = Math.sin(swirlAngle) * hypotenuse / Bubble.ARROW_BEND;
      const swirlRun = Math.cos(swirlAngle) * hypotenuse / Bubble.ARROW_BEND;

      steps.push('M' + baseX1 + ',' + baseY1);
      steps.push(
          'C' + (baseX1 + swirlRun) + ',' + (baseY1 + swirlRise) + ' ' +
          relAnchorX + ',' + relAnchorY + ' ' + relAnchorX + ',' + relAnchorY);
      steps.push(
          'C' + relAnchorX + ',' + relAnchorY + ' ' + (baseX2 + swirlRun) +
          ',' + (baseY2 + swirlRise) + ' ' + baseX2 + ',' + baseY2);
    }
    steps.push('z');
    this.bubbleArrow_.setAttribute('d', steps.join(' '));
  }

  /**
   * Change the colour of a bubble.
   * @param {string} hexColour Hex code of colour.
   */
  setColour(hexColour) {
    this.bubbleBack_.setAttribute('fill', hexColour);
    this.bubbleArrow_.setAttribute('fill', hexColour);
  }

  /**
   * Dispose of this bubble.
   */
  dispose() {
    if (this.onMouseDownBubbleWrapper_) {
      browserEvents.unbind(this.onMouseDownBubbleWrapper_);
    }
    if (this.onMouseDownResizeWrapper_) {
      browserEvents.unbind(this.onMouseDownResizeWrapper_);
    }
    Bubble.unbindDragEvents_();
    dom.removeNode(this.bubbleGroup_);
    this.disposed = true;
  }

  /**
   * Move this bubble during a drag, taking into account whether or not there is
   * a drag surface.
   * @param {BlockDragSurfaceSvg} dragSurface The surface that carries
   *     rendered items during a drag, or null if no drag surface is in use.
   * @param {!Coordinate} newLoc The location to translate to, in
   *     workspace coordinates.
   * @package
   */
  moveDuringDrag(dragSurface, newLoc) {
    if (dragSurface) {
      dragSurface.translateSurface(newLoc.x, newLoc.y);
    } else {
      this.moveTo(newLoc.x, newLoc.y);
    }
    if (this.workspace_.RTL) {
      this.relativeLeft_ = this.anchorXY_.x - newLoc.x - this.width_;
    } else {
      this.relativeLeft_ = newLoc.x - this.anchorXY_.x;
    }
    this.relativeTop_ = newLoc.y - this.anchorXY_.y;
    this.renderArrow_();
  }

  /**
   * Return the coordinates of the top-left corner of this bubble's body
   * relative to the drawing surface's origin (0,0), in workspace units.
   * @return {!Coordinate} Object with .x and .y properties.
   */
  getRelativeToSurfaceXY() {
    return new Coordinate(
        this.workspace_.RTL ?
            -this.relativeLeft_ + this.anchorXY_.x - this.width_ :
            this.anchorXY_.x + this.relativeLeft_,
        this.anchorXY_.y + this.relativeTop_);
  }

  /**
   * Set whether auto-layout of this bubble is enabled.  The first time a bubble
   * is shown it positions itself to not cover any blocks.  Once a user has
   * dragged it to reposition, it renders where the user put it.
   * @param {boolean} enable True if auto-layout should be enabled, false
   *     otherwise.
   * @package
   */
  setAutoLayout(enable) {
    this.autoLayout_ = enable;
  }

  /**
   * Stop binding to the global mouseup and mousemove events.
   * @private
   */
  static unbindDragEvents_() {
    if (Bubble.onMouseUpWrapper_) {
      browserEvents.unbind(Bubble.onMouseUpWrapper_);
      Bubble.onMouseUpWrapper_ = null;
    }
    if (Bubble.onMouseMoveWrapper_) {
      browserEvents.unbind(Bubble.onMouseMoveWrapper_);
      Bubble.onMouseMoveWrapper_ = null;
    }
  }

  /**
   * Handle a mouse-up event while dragging a bubble's border or resize handle.
   * @param {!Event} _e Mouse up event.
   * @private
   */
  static bubbleMouseUp_(_e) {
    Touch.clearTouchIdentifier();
    Bubble.unbindDragEvents_();
  }

  /**
   * Create the text for a non editable bubble.
   * @param {string} text The text to display.
   * @return {!SVGTextElement} The top-level node of the text.
   * @package
   */
  static textToDom(text) {
    const paragraph = dom.createSvgElement(
        Svg.TEXT, {
          'class': 'blocklyText blocklyBubbleText blocklyNoPointerEvents',
          'y': Bubble.BORDER_WIDTH,
        },
        null);
    const lines = text.split('\n');
    for (let i = 0; i < lines.length; i++) {
      const tspanElement = dom.createSvgElement(
          Svg.TSPAN, {'dy': '1em', 'x': Bubble.BORDER_WIDTH}, paragraph);
      const textNode = document.createTextNode(lines[i]);
      tspanElement.appendChild(textNode);
    }
    return paragraph;
  }

  /**
   * Creates a bubble that can not be edited.
   * @param {!SVGTextElement} paragraphElement The text element for the non
   *     editable bubble.
   * @param {!BlockSvg} block The block that the bubble is attached to.
   * @param {!Coordinate} iconXY The coordinate of the icon.
   * @return {!Bubble} The non editable bubble.
   * @package
   */
  static createNonEditableBubble(paragraphElement, block, iconXY) {
    const bubble = new Bubble(
        /** @type {!WorkspaceSvg} */ (block.workspace), paragraphElement,
        block.pathObject.svgPath,
        /** @type {!Coordinate} */ (iconXY), null, null);
    // Expose this bubble's block's ID on its top-level SVG group.
    bubble.setSvgId(block.id);
    if (block.RTL) {
      // Right-align the paragraph.
      // This cannot be done until the bubble is rendered on screen.
      const maxWidth = paragraphElement.getBBox().width;
      for (let i = 0, textElement;
           (textElement = paragraphElement.childNodes[i]); i++) {
        textElement.setAttribute('text-anchor', 'end');
        textElement.setAttribute('x', maxWidth + Bubble.BORDER_WIDTH);
      }
    }
    return bubble;
  }
};

/**
 * Width of the border around the bubble.
 */
Bubble.BORDER_WIDTH = 6;

/**
 * Determines the thickness of the base of the arrow in relation to the size
 * of the bubble.  Higher numbers result in thinner arrows.
 */
Bubble.ARROW_THICKNESS = 5;

/**
 * The number of degrees that the arrow bends counter-clockwise.
 */
Bubble.ARROW_ANGLE = 20;

/**
 * The sharpness of the arrow's bend.  Higher numbers result in smoother arrows.
 */
Bubble.ARROW_BEND = 4;

/**
 * Distance between arrow point and anchor point.
 */
Bubble.ANCHOR_RADIUS = 8;

/**
 * Mouse up event data.
 * @type {?browserEvents.Data}
 * @private
 */
Bubble.onMouseUpWrapper_ = null;

/**
 * Mouse move event data.
 * @type {?browserEvents.Data}
 * @private
 */
Bubble.onMouseMoveWrapper_ = null;

exports.Bubble = Bubble;
