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

goog.require('goog.userAgent');


/**
 * Class for a pair of scrollbars.  Horizontal and vertical.
 * @param {!Blockly.Workspace} workspace Workspace to bind the scrollbars to.
 * @constructor
 */
Blockly.ScrollbarPair = function(workspace) {
  this.workspace_ = workspace;
  this.oldHostMetrics_ = null;
  this.hScroll = new Blockly.Scrollbar(workspace, true, true);
  this.vScroll = new Blockly.Scrollbar(workspace, false, true);
  this.corner_ = Blockly.createSvgElement('rect',
      {'height': Blockly.Scrollbar.scrollbarThickness,
      'width': Blockly.Scrollbar.scrollbarThickness,
      'style': 'fill: #fff'}, null);
  Blockly.Scrollbar.insertAfter_(this.corner_, workspace.getBubbleCanvas());
};

/**
 * Dispose of this pair of scrollbars.
 * Unlink from all DOM elements to prevent memory leaks.
 */
Blockly.ScrollbarPair.prototype.dispose = function() {
  Blockly.unbindEvent_(this.onResizeWrapper_);
  this.onResizeWrapper_ = null;
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
    this.corner_.setAttribute('x', this.vScroll.xCoordinate);
  }
  if (!this.oldHostMetrics_ ||
      this.oldHostMetrics_.viewHeight != hostMetrics.viewHeight ||
      this.oldHostMetrics_.absoluteTop != hostMetrics.absoluteTop) {
    this.corner_.setAttribute('y', this.hScroll.yCoordinate);
  }

  // Cache the current metrics to potentially short-cut the next resize event.
  this.oldHostMetrics_ = hostMetrics;
};

/**
 * Set the sliders of both scrollbars to be at a certain position.
 * @param {number} x Horizontal scroll value.
 * @param {number} y Vertical scroll value.
 */
Blockly.ScrollbarPair.prototype.set = function(x, y) {
  this.hScroll.set(x);
  this.vScroll.set(y);
};

// --------------------------------------------------------------------

/**
 * Class for a pure SVG scrollbar.
 * This technique offers a scrollbar that is guaranteed to work, but may not
 * look or behave like the system's scrollbars.
 * @param {!Blockly.Workspace} workspace Workspace to bind the scrollbar to.
 * @param {boolean} horizontal True if horizontal, false if vertical.
 * @param {boolean} opt_pair True if the scrollbar is part of a horiz/vert pair.
 * @constructor
 */
Blockly.Scrollbar = function(workspace, horizontal, opt_pair) {
  this.workspace_ = workspace;
  this.pair_ = opt_pair || false;
  this.horizontal_ = horizontal;

  this.createDom_();

  if (horizontal) {
    this.svgBackground_.setAttribute('height',
        Blockly.Scrollbar.scrollbarThickness);
    this.svgKnob_.setAttribute('height',
        Blockly.Scrollbar.scrollbarThickness - 6);
    this.svgKnob_.setAttribute('y', 3);
  } else {
    this.svgBackground_.setAttribute('width',
        Blockly.Scrollbar.scrollbarThickness);
    this.svgKnob_.setAttribute('width',
        Blockly.Scrollbar.scrollbarThickness - 6);
    this.svgKnob_.setAttribute('x', 3);
  }
  var scrollbar = this;
  this.onMouseDownBarWrapper_ = Blockly.bindEvent_(this.svgBackground_,
      'mousedown', scrollbar, scrollbar.onMouseDownBar_);
  this.onMouseDownKnobWrapper_ = Blockly.bindEvent_(this.svgKnob_,
      'mousedown', scrollbar, scrollbar.onMouseDownKnob_);
};

/**
 * Width of vertical scrollbar or height of horizontal scrollbar.
 * Increase the size of scrollbars on touch devices.
 * Don't define if there is no document object (e.g. node.js).
 */
Blockly.Scrollbar.scrollbarThickness = 15
if (goog.getObjectByName('document.documentElement.ontouchstart')) {
  Blockly.Scrollbar.scrollbarThickness = 25
}

/**
 * Dispose of this scrollbar.
 * Unlink from all DOM elements to prevent memory leaks.
 */
Blockly.Scrollbar.prototype.dispose = function() {
  this.onMouseUpKnob_();
  if (this.onResizeWrapper_) {
    Blockly.unbindEvent_(this.onResizeWrapper_);
    this.onResizeWrapper_ = null;
  }
  Blockly.unbindEvent_(this.onMouseDownBarWrapper_);
  this.onMouseDownBarWrapper_ = null;
  Blockly.unbindEvent_(this.onMouseDownKnobWrapper_);
  this.onMouseDownKnobWrapper_ = null;

  goog.dom.removeNode(this.svgGroup_);
  this.svgGroup_ = null;
  this.svgBackground_ = null;
  this.svgKnob_ = null;
  this.workspace_ = null;
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
    var outerLength = hostMetrics.viewWidth;
    if (this.pair_) {
      // Shorten the scrollbar to make room for the corner square.
      outerLength -= Blockly.Scrollbar.scrollbarThickness;
    } else {
      // Only show the scrollbar if needed.
      // Ideally this would also apply to scrollbar pairs, but that's a bigger
      // headache (due to interactions with the corner square).
      this.setVisible(outerLength < hostMetrics.contentHeight);
    }
    this.ratio_ = outerLength / hostMetrics.contentWidth;
    if (this.ratio_ === -Infinity || this.ratio_ === Infinity ||
        isNaN(this.ratio_)) {
      this.ratio_ = 0;
    }
    var innerLength = hostMetrics.viewWidth * this.ratio_;
    var innerOffset = (hostMetrics.viewLeft - hostMetrics.contentLeft) *
        this.ratio_;
    this.svgKnob_.setAttribute('width', Math.max(0, innerLength));
    this.xCoordinate = hostMetrics.absoluteLeft;
    if (this.pair_ && Blockly.RTL) {
      this.xCoordinate += hostMetrics.absoluteLeft +
          Blockly.Scrollbar.scrollbarThickness;
    }
    this.yCoordinate = hostMetrics.absoluteTop + hostMetrics.viewHeight -
        Blockly.Scrollbar.scrollbarThickness;
    this.svgGroup_.setAttribute('transform',
        'translate(' + this.xCoordinate + ', ' + this.yCoordinate + ')');
    this.svgBackground_.setAttribute('width', Math.max(0, outerLength));
    this.svgKnob_.setAttribute('x', this.constrainKnob_(innerOffset));
  } else {
    var outerLength = hostMetrics.viewHeight;
    if (this.pair_) {
      // Shorten the scrollbar to make room for the corner square.
      outerLength -= Blockly.Scrollbar.scrollbarThickness;
    } else {
      // Only show the scrollbar if needed.
      this.setVisible(outerLength < hostMetrics.contentHeight);
    }
    this.ratio_ = outerLength / hostMetrics.contentHeight;
    if (this.ratio_ === -Infinity || this.ratio_ === Infinity ||
        isNaN(this.ratio_)) {
      this.ratio_ = 0;
    }
    var innerLength = hostMetrics.viewHeight * this.ratio_;
    var innerOffset = (hostMetrics.viewTop - hostMetrics.contentTop) *
        this.ratio_;
    this.svgKnob_.setAttribute('height', Math.max(0, innerLength));
    this.xCoordinate = hostMetrics.absoluteLeft;
    if (!Blockly.RTL) {
      this.xCoordinate += hostMetrics.viewWidth -
          Blockly.Scrollbar.scrollbarThickness;
    }
    this.yCoordinate = hostMetrics.absoluteTop;
    this.svgGroup_.setAttribute('transform',
        'translate(' + this.xCoordinate + ', ' + this.yCoordinate + ')');
    this.svgBackground_.setAttribute('height', Math.max(0, outerLength));
    this.svgKnob_.setAttribute('y', this.constrainKnob_(innerOffset));
  }
  // Resizing may have caused some scrolling.
  this.onScroll_();
};

/**
 * Create all the DOM elements required for a scrollbar.
 * The resulting widget is not sized.
 * @private
 */
Blockly.Scrollbar.prototype.createDom_ = function() {
  /* Create the following DOM:
  <g>
    <rect class="blocklyScrollbarBackground" />
    <rect class="blocklyScrollbarKnob" rx="7" ry="7" />
  </g>
  */
  this.svgGroup_ = Blockly.createSvgElement('g', {}, null);
  this.svgBackground_ = Blockly.createSvgElement('rect',
      {'class': 'blocklyScrollbarBackground'}, this.svgGroup_);
  var radius = Math.floor((Blockly.Scrollbar.scrollbarThickness - 6) / 2);
  this.svgKnob_ = Blockly.createSvgElement('rect',
      {'class': 'blocklyScrollbarKnob', 'rx': radius, 'ry': radius},
      this.svgGroup_);
  Blockly.Scrollbar.insertAfter_(this.svgGroup_,
                                 this.workspace_.getBubbleCanvas());
};

/**
 * Is the scrollbar visible.  Non-paired scrollbars disappear when they aren't
 * needed.
 * @return {boolean} True if visible.
 */
Blockly.Scrollbar.prototype.isVisible = function() {
  return this.svgGroup_.getAttribute('display') != 'none';
};

/**
 * Set whether the scrollbar is visible.
 * Only applies to non-paired scrollbars.
 * @param {boolean} visible True if visible.
 */
Blockly.Scrollbar.prototype.setVisible = function(visible) {
  if (visible == this.isVisible()) {
    return;
  }
  // Ideally this would also apply to scrollbar pairs, but that's a bigger
  // headache (due to interactions with the corner square).
  if (this.pair_) {
    throw 'Unable to toggle visibility of paired scrollbars.';
  }
  if (visible) {
    this.svgGroup_.setAttribute('display', 'block');
  } else {
    // Hide the scrollbar.
    this.workspace_.setMetrics({x: 0, y: 0});
    this.svgGroup_.setAttribute('display', 'none');
  }
};

/**
 * Scroll by one pageful.
 * Called when scrollbar background is clicked.
 * @param {!Event} e Mouse down event.
 * @private
 */
Blockly.Scrollbar.prototype.onMouseDownBar_ = function(e) {
  this.onMouseUpKnob_();
  if (Blockly.isRightButton(e)) {
    // Right-click.
    // Scrollbars have no context menu.
    e.stopPropagation();
    return;
  }
  var mouseXY = Blockly.mouseToSvg(e);
  var mouseLocation = this.horizontal_ ? mouseXY.x : mouseXY.y;

  var knobXY = Blockly.getSvgXY_(this.svgKnob_);
  var knobStart = this.horizontal_ ? knobXY.x : knobXY.y;
  var knobLength = parseFloat(
      this.svgKnob_.getAttribute(this.horizontal_ ? 'width' : 'height'));
  var knobValue = parseFloat(
      this.svgKnob_.getAttribute(this.horizontal_ ? 'x' : 'y'));

  var pageLength = knobLength * 0.95;
  if (mouseLocation <= knobStart) {
    // Decrease the scrollbar's value by a page.
    knobValue -= pageLength;
  } else if (mouseLocation >= knobStart + knobLength) {
    // Increase the scrollbar's value by a page.
    knobValue += pageLength;
  }
  this.svgKnob_.setAttribute(this.horizontal_ ? 'x' : 'y',
                             this.constrainKnob_(knobValue));
  this.onScroll_();
  e.stopPropagation();
};

/**
 * Start a dragging operation.
 * Called when scrollbar knob is clicked.
 * @param {!Event} e Mouse down event.
 * @private
 */
Blockly.Scrollbar.prototype.onMouseDownKnob_ = function(e) {
  this.onMouseUpKnob_();
  if (Blockly.isRightButton(e)) {
    // Right-click.
    // Scrollbars have no context menu.
    e.stopPropagation();
    return;
  }
  // Look up the current translation and record it.
  this.startDragKnob = parseFloat(
      this.svgKnob_.getAttribute(this.horizontal_ ? 'x' : 'y'));
  // Record the current mouse position.
  this.startDragMouse = this.horizontal_ ? e.clientX : e.clientY;
  Blockly.Scrollbar.onMouseUpWrapper_ = Blockly.bindEvent_(document,
      'mouseup', this, this.onMouseUpKnob_);
  Blockly.Scrollbar.onMouseMoveWrapper_ = Blockly.bindEvent_(document,
      'mousemove', this, this.onMouseMoveKnob_);
  e.stopPropagation();
};

/**
 * Drag the scrollbar's knob.
 * @param {!Event} e Mouse up event.
 * @private
 */
Blockly.Scrollbar.prototype.onMouseMoveKnob_ = function(e) {
  var currentMouse = this.horizontal_ ? e.clientX : e.clientY;
  var mouseDelta = currentMouse - this.startDragMouse;
  var knobValue = this.startDragKnob + mouseDelta;
  // Position the bar.
  this.svgKnob_.setAttribute(this.horizontal_ ? 'x' : 'y',
                             this.constrainKnob_(knobValue));
  this.onScroll_();
};

/**
 * Stop binding to the global mouseup and mousemove events.
 * @private
 */
Blockly.Scrollbar.prototype.onMouseUpKnob_ = function() {
  Blockly.removeAllRanges();
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
 * Constrain the knob's position within the minimum (0) and maximum
 * (length of scrollbar) values allowed for the scrollbar.
 * @param {number} value Value that is potentially out of bounds.
 * @return {number} Constrained value.
 * @private
 */
Blockly.Scrollbar.prototype.constrainKnob_ = function(value) {
  if (value <= 0 || isNaN(value)) {
    value = 0;
  } else {
    var axis = this.horizontal_ ? 'width' : 'height';
    var barLength = parseFloat(this.svgBackground_.getAttribute(axis));
    var knobLength = parseFloat(this.svgKnob_.getAttribute(axis));
    value = Math.min(value, barLength - knobLength);
  }
  return value;
};

/**
 * Called when scrollbar is moved.
 * @private
 */
Blockly.Scrollbar.prototype.onScroll_ = function() {
  var knobValue = parseFloat(
      this.svgKnob_.getAttribute(this.horizontal_ ? 'x' : 'y'));
  var barLength = parseFloat(
      this.svgBackground_.getAttribute(this.horizontal_ ? 'width' : 'height'));
  var ratio = knobValue / barLength;
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
 * Set the scrollbar slider's position.
 * @param {number} value The distance from the top/left end of the bar.
 */
Blockly.Scrollbar.prototype.set = function(value) {
  // Move the scrollbar slider.
  this.svgKnob_.setAttribute(this.horizontal_ ? 'x' : 'y', value * this.ratio_);
  this.onScroll_();
};

/**
 * Insert a node after a reference node.
 * Contrast with node.insertBefore function.
 * @param {!Element} newNode New element to insert.
 * @param {!Element} refNode Existing element to precede new node.
 * @private
 */
Blockly.Scrollbar.insertAfter_ = function(newNode, refNode) {
  var siblingNode = refNode.nextSibling;
  var parentNode = refNode.parentNode;
  if (!parentNode) {
    throw 'Reference node has no parent.';
  }
  if (siblingNode) {
    parentNode.insertBefore(newNode, siblingNode);
  } else {
    parentNode.appendChild(newNode);
  }
};
