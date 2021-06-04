/**
 * @license
 * Copyright 2012 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Object representing a UI bubble.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Blockly.Bubble');

goog.require('Blockly.browserEvents');
goog.require('Blockly.IBubble');
goog.require('Blockly.Scrollbar');
goog.require('Blockly.Touch');
goog.require('Blockly.utils');
goog.require('Blockly.utils.Coordinate');
goog.require('Blockly.utils.dom');
goog.require('Blockly.utils.math');
goog.require('Blockly.utils.Size');
goog.require('Blockly.utils.Svg');
goog.require('Blockly.utils.userAgent');
/** @suppress {extraRequire} */
goog.require('Blockly.Workspace');

goog.requireType('Blockly.BlockDragSurfaceSvg');
goog.requireType('Blockly.BlockSvg');
goog.requireType('Blockly.MetricsManager');
goog.requireType('Blockly.WorkspaceSvg');


/**
 * Class for UI bubble.
 * @param {!Blockly.WorkspaceSvg} workspace The workspace on which to draw the
 *     bubble.
 * @param {!Element} content SVG content for the bubble.
 * @param {!Element} shape SVG element to avoid eclipsing.
 * @param {!Blockly.utils.Coordinate} anchorXY Absolute position of bubble's
 *     anchor point.
 * @param {?number} bubbleWidth Width of bubble, or null if not resizable.
 * @param {?number} bubbleHeight Height of bubble, or null if not resizable.
 * @implements {Blockly.IBubble}
 * @constructor
 */
Blockly.Bubble = function(
    workspace, content, shape, anchorXY, bubbleWidth, bubbleHeight) {
  this.workspace_ = workspace;
  this.content_ = content;
  this.shape_ = shape;

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
   * @type {?Blockly.browserEvents.Data}
   * @private
   */
  this.onMouseDownBubbleWrapper_ = null;

  /**
   * Mouse down on resizeGroup_ event data.
   * @type {?Blockly.browserEvents.Data}
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

  var angle = Blockly.Bubble.ARROW_ANGLE;
  if (this.workspace_.RTL) {
    angle = -angle;
  }
  this.arrow_radians_ = Blockly.utils.math.toRadians(angle);

  var canvas = workspace.getBubbleCanvas();
  canvas.appendChild(this.createDom_(content, !!(bubbleWidth && bubbleHeight)));

  this.setAnchorLocation(anchorXY);
  if (!bubbleWidth || !bubbleHeight) {
    var bBox = /** @type {SVGLocatable} */ (this.content_).getBBox();
    bubbleWidth = bBox.width + 2 * Blockly.Bubble.BORDER_WIDTH;
    bubbleHeight = bBox.height + 2 * Blockly.Bubble.BORDER_WIDTH;
  }
  this.setBubbleSize(bubbleWidth, bubbleHeight);

  // Render the bubble.
  this.positionBubble_();
  this.renderArrow_();
  this.rendered_ = true;
};

/**
 * Width of the border around the bubble.
 */
Blockly.Bubble.BORDER_WIDTH = 6;

/**
 * Determines the thickness of the base of the arrow in relation to the size
 * of the bubble.  Higher numbers result in thinner arrows.
 */
Blockly.Bubble.ARROW_THICKNESS = 5;

/**
 * The number of degrees that the arrow bends counter-clockwise.
 */
Blockly.Bubble.ARROW_ANGLE = 20;

/**
 * The sharpness of the arrow's bend.  Higher numbers result in smoother arrows.
 */
Blockly.Bubble.ARROW_BEND = 4;

/**
 * Distance between arrow point and anchor point.
 */
Blockly.Bubble.ANCHOR_RADIUS = 8;

/**
 * Mouse up event data.
 * @type {?Blockly.browserEvents.Data}
 * @private
 */
Blockly.Bubble.onMouseUpWrapper_ = null;

/**
 * Mouse move event data.
 * @type {?Blockly.browserEvents.Data}
 * @private
 */
Blockly.Bubble.onMouseMoveWrapper_ = null;

/**
 * Stop binding to the global mouseup and mousemove events.
 * @private
 */
Blockly.Bubble.unbindDragEvents_ = function() {
  if (Blockly.Bubble.onMouseUpWrapper_) {
    Blockly.browserEvents.unbind(Blockly.Bubble.onMouseUpWrapper_);
    Blockly.Bubble.onMouseUpWrapper_ = null;
  }
  if (Blockly.Bubble.onMouseMoveWrapper_) {
    Blockly.browserEvents.unbind(Blockly.Bubble.onMouseMoveWrapper_);
    Blockly.Bubble.onMouseMoveWrapper_ = null;
  }
};

/**
 * Handle a mouse-up event while dragging a bubble's border or resize handle.
 * @param {!Event} _e Mouse up event.
 * @private
 */
Blockly.Bubble.bubbleMouseUp_ = function(_e) {
  Blockly.Touch.clearTouchIdentifier();
  Blockly.Bubble.unbindDragEvents_();
};

/**
 * Flag to stop incremental rendering during construction.
 * @private
 */
Blockly.Bubble.prototype.rendered_ = false;

/**
 * Absolute coordinate of anchor point, in workspace coordinates.
 * @type {Blockly.utils.Coordinate}
 * @private
 */
Blockly.Bubble.prototype.anchorXY_ = null;

/**
 * Relative X coordinate of bubble with respect to the anchor's centre,
 * in workspace units.
 * In RTL mode the initial value is negated.
 * @private
 */
Blockly.Bubble.prototype.relativeLeft_ = 0;

/**
 * Relative Y coordinate of bubble with respect to the anchor's centre, in
 * workspace units.
 * @private
 */
Blockly.Bubble.prototype.relativeTop_ = 0;

/**
 * Width of bubble, in workspace units.
 * @private
 */
Blockly.Bubble.prototype.width_ = 0;

/**
 * Height of bubble, in workspace units.
 * @private
 */
Blockly.Bubble.prototype.height_ = 0;

/**
 * Automatically position and reposition the bubble.
 * @private
 */
Blockly.Bubble.prototype.autoLayout_ = true;

/**
 * Create the bubble's DOM.
 * @param {!Element} content SVG content for the bubble.
 * @param {boolean} hasResize Add diagonal resize gripper if true.
 * @return {!SVGElement} The bubble's SVG group.
 * @private
 */
Blockly.Bubble.prototype.createDom_ = function(content, hasResize) {
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
  this.bubbleGroup_ =
      Blockly.utils.dom.createSvgElement(Blockly.utils.Svg.G, {}, null);
  var filter = {
    'filter': 'url(#' +
        this.workspace_.getRenderer().getConstants().embossFilterId + ')'
  };
  if (Blockly.utils.userAgent.JAVA_FX) {
    // Multiple reports that JavaFX can't handle filters.
    // https://github.com/google/blockly/issues/99
    filter = {};
  }
  var bubbleEmboss = Blockly.utils.dom.createSvgElement(
      Blockly.utils.Svg.G, filter, this.bubbleGroup_);
  this.bubbleArrow_ = Blockly.utils.dom.createSvgElement(
      Blockly.utils.Svg.PATH, {}, bubbleEmboss);
  this.bubbleBack_ = Blockly.utils.dom.createSvgElement(
      Blockly.utils.Svg.RECT, {
        'class': 'blocklyDraggable',
        'x': 0,
        'y': 0,
        'rx': Blockly.Bubble.BORDER_WIDTH,
        'ry': Blockly.Bubble.BORDER_WIDTH
      },
      bubbleEmboss);
  if (hasResize) {
    this.resizeGroup_ = Blockly.utils.dom.createSvgElement(
        Blockly.utils.Svg.G,
        {'class': this.workspace_.RTL ? 'blocklyResizeSW' : 'blocklyResizeSE'},
        this.bubbleGroup_);
    var resizeSize = 2 * Blockly.Bubble.BORDER_WIDTH;
    Blockly.utils.dom.createSvgElement(
        Blockly.utils.Svg.POLYGON,
        {'points': '0,x x,x x,0'.replace(/x/g, resizeSize.toString())},
        this.resizeGroup_);
    Blockly.utils.dom.createSvgElement(
        Blockly.utils.Svg.LINE, {
          'class': 'blocklyResizeLine',
          'x1': resizeSize / 3,
          'y1': resizeSize - 1,
          'x2': resizeSize - 1,
          'y2': resizeSize / 3
        },
        this.resizeGroup_);
    Blockly.utils.dom.createSvgElement(
        Blockly.utils.Svg.LINE, {
          'class': 'blocklyResizeLine',
          'x1': resizeSize * 2 / 3,
          'y1': resizeSize - 1,
          'x2': resizeSize - 1,
          'y2': resizeSize * 2 / 3
        },
        this.resizeGroup_);
  } else {
    this.resizeGroup_ = null;
  }

  if (!this.workspace_.options.readOnly) {
    this.onMouseDownBubbleWrapper_ = Blockly.browserEvents.conditionalBind(
        this.bubbleBack_, 'mousedown', this, this.bubbleMouseDown_);
    if (this.resizeGroup_) {
      this.onMouseDownResizeWrapper_ = Blockly.browserEvents.conditionalBind(
          this.resizeGroup_, 'mousedown', this, this.resizeMouseDown_);
    }
  }
  this.bubbleGroup_.appendChild(content);
  return this.bubbleGroup_;
};

/**
 * Return the root node of the bubble's SVG group.
 * @return {!SVGElement} The root SVG node of the bubble's group.
 */
Blockly.Bubble.prototype.getSvgRoot = function() {
  return this.bubbleGroup_;
};

/**
 * Expose the block's ID on the bubble's top-level SVG group.
 * @param {string} id ID of block.
 */
Blockly.Bubble.prototype.setSvgId = function(id) {
  if (this.bubbleGroup_.dataset) {
    this.bubbleGroup_.dataset['blockId'] = id;
  }
};

/**
 * Handle a mouse-down on bubble's border.
 * @param {!Event} e Mouse down event.
 * @private
 */
Blockly.Bubble.prototype.bubbleMouseDown_ = function(e) {
  var gesture = this.workspace_.getGesture(e);
  if (gesture) {
    gesture.handleBubbleStart(e, this);
  }
};

/**
 * Show the context menu for this bubble.
 * @param {!Event} _e Mouse event.
 * @package
 */
Blockly.Bubble.prototype.showContextMenu = function(_e) {
  // NOP on bubbles, but used by the bubble dragger to pass events to
  // workspace comments.
};

/**
 * Get whether this bubble is deletable or not.
 * @return {boolean} True if deletable.
 * @package
 */
Blockly.Bubble.prototype.isDeletable = function() {
  return false;
};

/**
 * Update the style of this bubble when it is dragged over a delete area.
 * @param {boolean} _enable True if the bubble is about to be deleted, false
 *     otherwise.
 */
Blockly.Bubble.prototype.setDeleteStyle = function(_enable) {
  // NOP if bubble is not deletable.
};

/**
 * Handle a mouse-down on bubble's resize corner.
 * @param {!Event} e Mouse down event.
 * @private
 */
Blockly.Bubble.prototype.resizeMouseDown_ = function(e) {
  this.promote();
  Blockly.Bubble.unbindDragEvents_();
  if (Blockly.utils.isRightButton(e)) {
    // No right-click.
    e.stopPropagation();
    return;
  }
  // Left-click (or middle click)
  this.workspace_.startDrag(
      e,
      new Blockly.utils.Coordinate(
          this.workspace_.RTL ? -this.width_ : this.width_, this.height_));

  Blockly.Bubble.onMouseUpWrapper_ = Blockly.browserEvents.conditionalBind(
      document, 'mouseup', this, Blockly.Bubble.bubbleMouseUp_);
  Blockly.Bubble.onMouseMoveWrapper_ = Blockly.browserEvents.conditionalBind(
      document, 'mousemove', this, this.resizeMouseMove_);
  Blockly.hideChaff();
  // This event has been handled.  No need to bubble up to the document.
  e.stopPropagation();
};

/**
 * Resize this bubble to follow the mouse.
 * @param {!Event} e Mouse move event.
 * @private
 */
Blockly.Bubble.prototype.resizeMouseMove_ = function(e) {
  this.autoLayout_ = false;
  var newXY = this.workspace_.moveDrag(e);
  this.setBubbleSize(this.workspace_.RTL ? -newXY.x : newXY.x, newXY.y);
  if (this.workspace_.RTL) {
    // RTL requires the bubble to move its left edge.
    this.positionBubble_();
  }
};

/**
 * Register a function as a callback event for when the bubble is resized.
 * @param {!Function} callback The function to call on resize.
 */
Blockly.Bubble.prototype.registerResizeEvent = function(callback) {
  this.resizeCallback_ = callback;
};

/**
 * Register a function as a callback event for when the bubble is moved.
 * @param {!Function} callback The function to call on move.
 */
Blockly.Bubble.prototype.registerMoveEvent = function(callback) {
  this.moveCallback_ = callback;
};

/**
 * Move this bubble to the top of the stack.
 * @return {boolean} Whether or not the bubble has been moved.
 * @package
 */
Blockly.Bubble.prototype.promote = function() {
  var svgGroup = this.bubbleGroup_.parentNode;
  if (svgGroup.lastChild !== this.bubbleGroup_) {
    svgGroup.appendChild(this.bubbleGroup_);
    return true;
  }
  return false;
};

/**
 * Notification that the anchor has moved.
 * Update the arrow and bubble accordingly.
 * @param {!Blockly.utils.Coordinate} xy Absolute location.
 */
Blockly.Bubble.prototype.setAnchorLocation = function(xy) {
  this.anchorXY_ = xy;
  if (this.rendered_) {
    this.positionBubble_();
  }
};

/**
 * Position the bubble so that it does not fall off-screen.
 * @private
 */
Blockly.Bubble.prototype.layoutBubble_ = function() {
  // Get the metrics in workspace units.
  var viewMetrics = this.workspace_.getMetricsManager().getViewMetrics(true);

  var optimalLeft = this.getOptimalRelativeLeft_(viewMetrics);
  var optimalTop = this.getOptimalRelativeTop_(viewMetrics);
  var bbox = this.shape_.getBBox();

  var topPosition = {
    x: optimalLeft,
    y: -this.height_ -
        this.workspace_.getRenderer().getConstants().MIN_BLOCK_HEIGHT
  };
  var startPosition = {x: -this.width_ - 30, y: optimalTop};
  var endPosition = {x: bbox.width, y: optimalTop};
  var bottomPosition = {x: optimalLeft, y: bbox.height};

  var closerPosition = bbox.width < bbox.height ? endPosition : bottomPosition;
  var fartherPosition = bbox.width < bbox.height ? bottomPosition : endPosition;

  var topPositionOverlap = this.getOverlap_(topPosition, viewMetrics);
  var startPositionOverlap = this.getOverlap_(startPosition, viewMetrics);
  var closerPositionOverlap = this.getOverlap_(closerPosition, viewMetrics);
  var fartherPositionOverlap = this.getOverlap_(fartherPosition, viewMetrics);

  // Set the position to whichever position shows the most of the bubble,
  // with tiebreaks going in the order: top > start > close > far.
  var mostOverlap = Math.max(
      topPositionOverlap, startPositionOverlap, closerPositionOverlap,
      fartherPositionOverlap);
  if (topPositionOverlap == mostOverlap) {
    this.relativeLeft_ = topPosition.x;
    this.relativeTop_ = topPosition.y;
    return;
  }
  if (startPositionOverlap == mostOverlap) {
    this.relativeLeft_ = startPosition.x;
    this.relativeTop_ = startPosition.y;
    return;
  }
  if (closerPositionOverlap == mostOverlap) {
    this.relativeLeft_ = closerPosition.x;
    this.relativeTop_ = closerPosition.y;
    return;
  }
  // TODO: I believe relativeLeft_ should actually be called relativeStart_
  //  and then the math should be fixed to reflect this. (hopefully it'll
  //  make it look simpler)
  this.relativeLeft_ = fartherPosition.x;
  this.relativeTop_ = fartherPosition.y;
};

/**
 * Calculate the what percentage of the bubble overlaps with the visible
 * workspace (what percentage of the bubble is visible).
 * @param {!{x: number, y: number}} relativeMin The position of the top-left
 *     corner of the bubble relative to the anchor point.
 * @param {!Blockly.MetricsManager.ContainerRegion} viewMetrics The view metrics
 *     of the workspace the bubble will appear in.
 * @return {number} The percentage of the bubble that is visible.
 * @private
 */
Blockly.Bubble.prototype.getOverlap_ = function(relativeMin, viewMetrics) {
  // The position of the top-left corner of the bubble in workspace units.
  var bubbleMin = {
    x: this.workspace_.RTL ? (this.anchorXY_.x - relativeMin.x - this.width_) :
                             (relativeMin.x + this.anchorXY_.x),
    y: relativeMin.y + this.anchorXY_.y
  };
  // The position of the bottom-right corner of the bubble in workspace units.
  var bubbleMax = {x: bubbleMin.x + this.width_, y: bubbleMin.y + this.height_};

  // We could adjust these values to account for the scrollbars, but the
  // bubbles should have been adjusted to not collide with them anyway, so
  // giving the workspace a slightly larger "bounding box" shouldn't affect the
  // calculation.

  // The position of the top-left corner of the workspace.
  var workspaceMin = {x: viewMetrics.left, y: viewMetrics.top};
  // The position of the bottom-right corner of the workspace.
  var workspaceMax = {
    x: viewMetrics.left + viewMetrics.width,
    y: viewMetrics.top + viewMetrics.height
  };

  var overlapWidth = Math.min(bubbleMax.x, workspaceMax.x) -
      Math.max(bubbleMin.x, workspaceMin.x);
  var overlapHeight = Math.min(bubbleMax.y, workspaceMax.y) -
      Math.max(bubbleMin.y, workspaceMin.y);
  return Math.max(
      0,
      Math.min(
          1, (overlapWidth * overlapHeight) / (this.width_ * this.height_)));
};

/**
 * Calculate what the optimal horizontal position of the top-left corner of the
 * bubble is (relative to the anchor point) so that the most area of the
 * bubble is shown.
 * @param {!Blockly.MetricsManager.ContainerRegion} viewMetrics The view metrics
 *     of the workspace the bubble will appear in.
 * @return {number} The optimal horizontal position of the top-left corner
 *     of the bubble.
 * @private
 */
Blockly.Bubble.prototype.getOptimalRelativeLeft_ = function(viewMetrics) {
  var relativeLeft = -this.width_ / 4;

  // No amount of sliding left or right will give us a better overlap.
  if (this.width_ > viewMetrics.width) {
    return relativeLeft;
  }

  if (this.workspace_.RTL) {
    // Bubble coordinates are flipped in RTL.
    var bubbleRight = this.anchorXY_.x - relativeLeft;
    var bubbleLeft = bubbleRight - this.width_;

    var workspaceRight = viewMetrics.left + viewMetrics.width;
    var workspaceLeft = viewMetrics.left +
        // Thickness in workspace units.
        (Blockly.Scrollbar.scrollbarThickness / this.workspace_.scale);
  } else {
    var bubbleLeft = relativeLeft + this.anchorXY_.x;
    var bubbleRight = bubbleLeft + this.width_;

    var workspaceLeft = viewMetrics.left;
    var workspaceRight = viewMetrics.left + viewMetrics.width -
        // Thickness in workspace units.
        (Blockly.Scrollbar.scrollbarThickness / this.workspace_.scale);
  }

  if (this.workspace_.RTL) {
    if (bubbleLeft < workspaceLeft) {
      // Slide the bubble right until it is onscreen.
      relativeLeft = -(workspaceLeft - this.anchorXY_.x + this.width_);
    } else if (bubbleRight > workspaceRight) {
      // Slide the bubble left until it is onscreen.
      relativeLeft = -(workspaceRight - this.anchorXY_.x);
    }
  } else {
    if (bubbleLeft < workspaceLeft) {
      // Slide the bubble right until it is onscreen.
      relativeLeft = workspaceLeft - this.anchorXY_.x;
    } else if (bubbleRight > workspaceRight) {
      // Slide the bubble left until it is onscreen.
      relativeLeft = workspaceRight - this.anchorXY_.x - this.width_;
    }
  }

  return relativeLeft;
};

/**
 * Calculate what the optimal vertical position of the top-left corner of
 * the bubble is (relative to the anchor point) so that the most area of the
 * bubble is shown.
 * @param {!Blockly.MetricsManager.ContainerRegion} viewMetrics The view metrics
 *     of the workspace the bubble will appear in.
 * @return {number} The optimal vertical position of the top-left corner
 *     of the bubble.
 * @private
 */
Blockly.Bubble.prototype.getOptimalRelativeTop_ = function(viewMetrics) {
  var relativeTop = -this.height_ / 4;

  // No amount of sliding up or down will give us a better overlap.
  if (this.height_ > viewMetrics.height) {
    return relativeTop;
  }

  var bubbleTop = this.anchorXY_.y + relativeTop;
  var bubbleBottom = bubbleTop + this.height_;
  var workspaceTop = viewMetrics.top;
  var workspaceBottom = viewMetrics.top + viewMetrics.height -
      // Thickness in workspace units.
      (Blockly.Scrollbar.scrollbarThickness / this.workspace_.scale);

  var anchorY = this.anchorXY_.y;
  if (bubbleTop < workspaceTop) {
    // Slide the bubble down until it is onscreen.
    relativeTop = workspaceTop - anchorY;
  } else if (bubbleBottom > workspaceBottom) {
    // Slide the bubble up until it is onscreen.
    relativeTop = workspaceBottom - anchorY - this.height_;
  }

  return relativeTop;
};

/**
 * Move the bubble to a location relative to the anchor's centre.
 * @private
 */
Blockly.Bubble.prototype.positionBubble_ = function() {
  var left = this.anchorXY_.x;
  if (this.workspace_.RTL) {
    left -= this.relativeLeft_ + this.width_;
  } else {
    left += this.relativeLeft_;
  }
  var top = this.relativeTop_ + this.anchorXY_.y;
  this.moveTo(left, top);
};

/**
 * Move the bubble group to the specified location in workspace coordinates.
 * @param {number} x The x position to move to.
 * @param {number} y The y position to move to.
 * @package
 */
Blockly.Bubble.prototype.moveTo = function(x, y) {
  this.bubbleGroup_.setAttribute('transform', 'translate(' + x + ',' + y + ')');
};

/**
 * Triggers a move callback if one exists at the end of a drag.
 * @param {boolean} adding True if adding, false if removing.
 * @package
 */
Blockly.Bubble.prototype.setDragging = function(adding) {
  if (!adding && this.moveCallback_) {
    this.moveCallback_();
  }
};

/**
 * Get the dimensions of this bubble.
 * @return {!Blockly.utils.Size} The height and width of the bubble.
 */
Blockly.Bubble.prototype.getBubbleSize = function() {
  return new Blockly.utils.Size(this.width_, this.height_);
};

/**
 * Size this bubble.
 * @param {number} width Width of the bubble.
 * @param {number} height Height of the bubble.
 */
Blockly.Bubble.prototype.setBubbleSize = function(width, height) {
  var doubleBorderWidth = 2 * Blockly.Bubble.BORDER_WIDTH;
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
      var resizeSize = 2 * Blockly.Bubble.BORDER_WIDTH;
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
};

/**
 * Draw the arrow between the bubble and the origin.
 * @private
 */
Blockly.Bubble.prototype.renderArrow_ = function() {
  var steps = [];
  // Find the relative coordinates of the center of the bubble.
  var relBubbleX = this.width_ / 2;
  var relBubbleY = this.height_ / 2;
  // Find the relative coordinates of the center of the anchor.
  var relAnchorX = -this.relativeLeft_;
  var relAnchorY = -this.relativeTop_;
  if (relBubbleX == relAnchorX && relBubbleY == relAnchorY) {
    // Null case.  Bubble is directly on top of the anchor.
    // Short circuit this rather than wade through divide by zeros.
    steps.push('M ' + relBubbleX + ',' + relBubbleY);
  } else {
    // Compute the angle of the arrow's line.
    var rise = relAnchorY - relBubbleY;
    var run = relAnchorX - relBubbleX;
    if (this.workspace_.RTL) {
      run *= -1;
    }
    var hypotenuse = Math.sqrt(rise * rise + run * run);
    var angle = Math.acos(run / hypotenuse);
    if (rise < 0) {
      angle = 2 * Math.PI - angle;
    }
    // Compute a line perpendicular to the arrow.
    var rightAngle = angle + Math.PI / 2;
    if (rightAngle > Math.PI * 2) {
      rightAngle -= Math.PI * 2;
    }
    var rightRise = Math.sin(rightAngle);
    var rightRun = Math.cos(rightAngle);

    // Calculate the thickness of the base of the arrow.
    var bubbleSize = this.getBubbleSize();
    var thickness =
        (bubbleSize.width + bubbleSize.height) / Blockly.Bubble.ARROW_THICKNESS;
    thickness = Math.min(thickness, bubbleSize.width, bubbleSize.height) / 4;

    // Back the tip of the arrow off of the anchor.
    var backoffRatio = 1 - Blockly.Bubble.ANCHOR_RADIUS / hypotenuse;
    relAnchorX = relBubbleX + backoffRatio * run;
    relAnchorY = relBubbleY + backoffRatio * rise;

    // Coordinates for the base of the arrow.
    var baseX1 = relBubbleX + thickness * rightRun;
    var baseY1 = relBubbleY + thickness * rightRise;
    var baseX2 = relBubbleX - thickness * rightRun;
    var baseY2 = relBubbleY - thickness * rightRise;

    // Distortion to curve the arrow.
    var swirlAngle = angle + this.arrow_radians_;
    if (swirlAngle > Math.PI * 2) {
      swirlAngle -= Math.PI * 2;
    }
    var swirlRise =
        Math.sin(swirlAngle) * hypotenuse / Blockly.Bubble.ARROW_BEND;
    var swirlRun =
        Math.cos(swirlAngle) * hypotenuse / Blockly.Bubble.ARROW_BEND;

    steps.push('M' + baseX1 + ',' + baseY1);
    steps.push(
        'C' + (baseX1 + swirlRun) + ',' + (baseY1 + swirlRise) + ' ' +
        relAnchorX + ',' + relAnchorY + ' ' + relAnchorX + ',' + relAnchorY);
    steps.push(
        'C' + relAnchorX + ',' + relAnchorY + ' ' + (baseX2 + swirlRun) + ',' +
        (baseY2 + swirlRise) + ' ' + baseX2 + ',' + baseY2);
  }
  steps.push('z');
  this.bubbleArrow_.setAttribute('d', steps.join(' '));
};

/**
 * Change the colour of a bubble.
 * @param {string} hexColour Hex code of colour.
 */
Blockly.Bubble.prototype.setColour = function(hexColour) {
  this.bubbleBack_.setAttribute('fill', hexColour);
  this.bubbleArrow_.setAttribute('fill', hexColour);
};

/**
 * Dispose of this bubble.
 */
Blockly.Bubble.prototype.dispose = function() {
  if (this.onMouseDownBubbleWrapper_) {
    Blockly.browserEvents.unbind(this.onMouseDownBubbleWrapper_);
  }
  if (this.onMouseDownResizeWrapper_) {
    Blockly.browserEvents.unbind(this.onMouseDownResizeWrapper_);
  }
  Blockly.Bubble.unbindDragEvents_();
  Blockly.utils.dom.removeNode(this.bubbleGroup_);
  this.disposed = true;
};

/**
 * Move this bubble during a drag, taking into account whether or not there is
 * a drag surface.
 * @param {Blockly.BlockDragSurfaceSvg} dragSurface The surface that carries
 *     rendered items during a drag, or null if no drag surface is in use.
 * @param {!Blockly.utils.Coordinate} newLoc The location to translate to, in
 *     workspace coordinates.
 * @package
 */
Blockly.Bubble.prototype.moveDuringDrag = function(dragSurface, newLoc) {
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
};

/**
 * Return the coordinates of the top-left corner of this bubble's body relative
 * to the drawing surface's origin (0,0), in workspace units.
 * @return {!Blockly.utils.Coordinate} Object with .x and .y properties.
 */
Blockly.Bubble.prototype.getRelativeToSurfaceXY = function() {
  return new Blockly.utils.Coordinate(
      this.workspace_.RTL ?
          -this.relativeLeft_ + this.anchorXY_.x - this.width_ :
          this.anchorXY_.x + this.relativeLeft_,
      this.anchorXY_.y + this.relativeTop_);
};

/**
 * Set whether auto-layout of this bubble is enabled.  The first time a bubble
 * is shown it positions itself to not cover any blocks.  Once a user has
 * dragged it to reposition, it renders where the user put it.
 * @param {boolean} enable True if auto-layout should be enabled, false
 *     otherwise.
 * @package
 */
Blockly.Bubble.prototype.setAutoLayout = function(enable) {
  this.autoLayout_ = enable;
};

/**
 * Create the text for a non editable bubble.
 * @param {string} text The text to display.
 * @return {!SVGTextElement} The top-level node of the text.
 * @package
 */
Blockly.Bubble.textToDom = function(text) {
  var paragraph = Blockly.utils.dom.createSvgElement(
      Blockly.utils.Svg.TEXT, {
        'class': 'blocklyText blocklyBubbleText blocklyNoPointerEvents',
        'y': Blockly.Bubble.BORDER_WIDTH
      },
      null);
  var lines = text.split('\n');
  for (var i = 0; i < lines.length; i++) {
    var tspanElement = Blockly.utils.dom.createSvgElement(
        Blockly.utils.Svg.TSPAN,
        {'dy': '1em', 'x': Blockly.Bubble.BORDER_WIDTH}, paragraph);
    var textNode = document.createTextNode(lines[i]);
    tspanElement.appendChild(textNode);
  }
  return paragraph;
};

/**
 * Creates a bubble that can not be edited.
 * @param {!SVGTextElement} paragraphElement The text element for the non
 *     editable bubble.
 * @param {!Blockly.BlockSvg} block The block that the bubble is attached to.
 * @param {!Blockly.utils.Coordinate} iconXY The coordinate of the icon.
 * @return {!Blockly.Bubble} The non editable bubble.
 * @package
 */
Blockly.Bubble.createNonEditableBubble = function(
    paragraphElement, block, iconXY) {
  var bubble = new Blockly.Bubble(
      /** @type {!Blockly.WorkspaceSvg} */ (block.workspace), paragraphElement,
      block.pathObject.svgPath,
      /** @type {!Blockly.utils.Coordinate} */ (iconXY), null, null);
  // Expose this bubble's block's ID on its top-level SVG group.
  bubble.setSvgId(block.id);
  if (block.RTL) {
    // Right-align the paragraph.
    // This cannot be done until the bubble is rendered on screen.
    var maxWidth = paragraphElement.getBBox().width;
    for (var i = 0, textElement; (textElement = paragraphElement.childNodes[i]);
      i++) {
      textElement.setAttribute('text-anchor', 'end');
      textElement.setAttribute('x', maxWidth + Blockly.Bubble.BORDER_WIDTH);
    }
  }
  return bubble;
};
