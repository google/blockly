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
 * @fileoverview Flyout tray containing blocks which may be created.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Blockly.Flyout');

goog.require('Blockly.Block');
goog.require('Blockly.Comment');
goog.require('Blockly.Events');
goog.require('Blockly.FlyoutButton');
goog.require('Blockly.Touch');
goog.require('Blockly.WorkspaceSvg');
goog.require('goog.dom');
goog.require('goog.events');
goog.require('goog.math.Rect');
goog.require('goog.userAgent');


/**
 * Class for a flyout.
 * @param {!Object} workspaceOptions Dictionary of options for the workspace.
 * @constructor
 */
Blockly.Flyout = function(workspaceOptions) {
  workspaceOptions.getMetrics = this.getMetrics_.bind(this);
  workspaceOptions.setMetrics = this.setMetrics_.bind(this);
  /**
   * @type {!Blockly.Workspace}
   * @private
   */
  this.workspace_ = new Blockly.WorkspaceSvg(workspaceOptions);
  this.workspace_.isFlyout = true;

  /**
   * Is RTL vs LTR.
   * @type {boolean}
   */
  this.RTL = !!workspaceOptions.RTL;

  /**
   * Flyout should be laid out horizontally vs vertically.
   * @type {boolean}
   * @private
   */
  this.horizontalLayout_ = workspaceOptions.horizontalLayout;

  /**
   * Position of the toolbox and flyout relative to the workspace.
   * @type {number}
   * @private
   */
  this.toolboxPosition_ = workspaceOptions.toolboxPosition;

  /**
   * Opaque data that can be passed to Blockly.unbindEvent_.
   * @type {!Array.<!Array>}
   * @private
   */
  this.eventWrappers_ = [];

  /**
   * List of background buttons that lurk behind each block to catch clicks
   * landing in the blocks' lakes and bays.
   * @type {!Array.<!Element>}
   * @private
   */
  this.backgroundButtons_ = [];

  /**
   * List of visible buttons.
   * @type {!Array.<!Blockly.FlyoutButton>}
   * @private
   */
  this.buttons_ = [];

  /**
   * List of event listeners.
   * @type {!Array.<!Array>}
   * @private
   */
  this.listeners_ = [];

  /**
   * List of blocks that should always be disabled.
   * @type {!Array.<!Blockly.Block>}
   * @private
   */
  this.permanentlyDisabled_ = [];

  /**
   * y coordinate of mousedown - used to calculate scroll distances.
   * @type {number}
   * @private
   */
  this.startDragMouseY_ = 0;

  /**
   * x coordinate of mousedown - used to calculate scroll distances.
   * @type {number}
   * @private
   */
  this.startDragMouseX_ = 0;
};

/**
 * When a flyout drag is in progress, this is a reference to the flyout being
 * dragged. This is used by Flyout.terminateDrag_ to reset dragMode_.
 * @type {Blockly.Flyout}
 * @private
 */
Blockly.Flyout.startFlyout_ = null;

/**
 * Event that started a drag. Used to determine the drag distance/direction and
 * also passed to BlockSvg.onMouseDown_() after creating a new block.
 * @type {Event}
 * @private
 */
Blockly.Flyout.startDownEvent_ = null;

/**
 * Flyout block where the drag/click was initiated. Used to fire click events or
 * create a new block.
 * @type {Event}
 * @private
 */
Blockly.Flyout.startBlock_ = null;

/**
 * Wrapper function called when a mouseup occurs during a background or block
 * drag operation.
 * @type {Array.<!Array>}
 * @private
 */
Blockly.Flyout.onMouseUpWrapper_ = null;

/**
 * Wrapper function called when a mousemove occurs during a background drag.
 * @type {Array.<!Array>}
 * @private
 */
Blockly.Flyout.onMouseMoveWrapper_ = null;

/**
 * Wrapper function called when a mousemove occurs during a block drag.
 * @type {Array.<!Array>}
 * @private
 */
Blockly.Flyout.onMouseMoveBlockWrapper_ = null;

/**
 * Does the flyout automatically close when a block is created?
 * @type {boolean}
 */
Blockly.Flyout.prototype.autoClose = true;

/**
 * Whether the flyout is visible.
 * @type {boolean}
 * @private
 */
Blockly.Flyout.prototype.isVisible_ = false;

/**
 * Whether the workspace containing this flyout is visible.
 * @type {boolean}
 * @private
 */
Blockly.Flyout.prototype.containerVisible_ = true;

/**
 * Corner radius of the flyout background.
 * @type {number}
 * @const
 */
Blockly.Flyout.prototype.CORNER_RADIUS = 8;

/**
 * Number of pixels the mouse must move before a drag/scroll starts. Because the
 * drag-intention is determined when this is reached, it is larger than
 * Blockly.DRAG_RADIUS so that the drag-direction is clearer.
 */
Blockly.Flyout.prototype.DRAG_RADIUS = 10;

/**
 * Margin around the edges of the blocks in the flyout.
 * @type {number}
 * @const
 */
Blockly.Flyout.prototype.MARGIN = Blockly.Flyout.prototype.CORNER_RADIUS;

/**
 * Gap between items in horizontal flyouts. Can be overridden with the "sep"
 * element.
 * @const {number}
 */
Blockly.Flyout.prototype.GAP_X = Blockly.Flyout.prototype.MARGIN * 3;

/**
 * Gap between items in vertical flyouts. Can be overridden with the "sep"
 * element.
 * @const {number}
 */
Blockly.Flyout.prototype.GAP_Y = Blockly.Flyout.prototype.MARGIN * 3;

/**
 * Top/bottom padding between scrollbar and edge of flyout background.
 * @type {number}
 * @const
 */
Blockly.Flyout.prototype.SCROLLBAR_PADDING = 2;

/**
 * Width of flyout.
 * @type {number}
 * @private
 */
Blockly.Flyout.prototype.width_ = 0;

/**
 * Height of flyout.
 * @type {number}
 * @private
 */
Blockly.Flyout.prototype.height_ = 0;

/**
 * Is the flyout dragging (scrolling)?
 * DRAG_NONE - no drag is ongoing or state is undetermined.
 * DRAG_STICKY - still within the sticky drag radius.
 * DRAG_FREE - in scroll mode (never create a new block).
 * @private
 */
Blockly.Flyout.prototype.dragMode_ = Blockly.DRAG_NONE;

/**
 * Range of a drag angle from a flyout considered "dragging toward workspace".
 * Drags that are within the bounds of this many degrees from the orthogonal
 * line to the flyout edge are considered to be "drags toward the workspace".
 * Example:
 * Flyout                                                  Edge   Workspace
 * [block] /  <-within this angle, drags "toward workspace" |
 * [block] ---- orthogonal to flyout boundary ----          |
 * [block] \                                                |
 * The angle is given in degrees from the orthogonal.
 *
 * This is used to know when to create a new block and when to scroll the
 * flyout. Setting it to 360 means that all drags create a new block.
 * @type {number}
 * @private
*/
Blockly.Flyout.prototype.dragAngleRange_ = 70;

/**
 * Creates the flyout's DOM.  Only needs to be called once.  The flyout can
 * either exist as its own svg element or be a g element nested inside a
 * separate svg element.
 * @param {string} tagName The type of tag to put the flyout in. This
 *     should be <svg> or <g>.
 * @return {!Element} The flyout's SVG group.
 */
Blockly.Flyout.prototype.createDom = function(tagName) {
  /*
  <svg | g>
    <path class="blocklyFlyoutBackground"/>
    <g class="blocklyFlyout"></g>
  </ svg | g>
  */
  // Setting style to display:none to start. The toolbox and flyout
  // hide/show code will set up proper visibility and size later.
  this.svgGroup_ = Blockly.utils.createSvgElement(tagName,
      {'class': 'blocklyFlyout', 'style': 'display: none'}, null);
  this.svgBackground_ = Blockly.utils.createSvgElement('path',
      {'class': 'blocklyFlyoutBackground'}, this.svgGroup_);
  this.svgGroup_.appendChild(this.workspace_.createDom());
  return this.svgGroup_;
};

/**
 * Initializes the flyout.
 * @param {!Blockly.Workspace} targetWorkspace The workspace in which to create
 *     new blocks.
 */
Blockly.Flyout.prototype.init = function(targetWorkspace) {
  this.targetWorkspace_ = targetWorkspace;
  this.workspace_.targetWorkspace = targetWorkspace;
  // Add scrollbar.
  this.scrollbar_ = new Blockly.Scrollbar(this.workspace_,
      this.horizontalLayout_, false, 'blocklyFlyoutScrollbar');

  this.hide();

  Array.prototype.push.apply(this.eventWrappers_,
      Blockly.bindEventWithChecks_(this.svgGroup_, 'wheel', this, this.wheel_));
  if (!this.autoClose) {
    this.filterWrapper_ = this.filterForCapacity_.bind(this);
    this.targetWorkspace_.addChangeListener(this.filterWrapper_);
  }
  // Dragging the flyout up and down.
  Array.prototype.push.apply(this.eventWrappers_,
      Blockly.bindEventWithChecks_(this.svgGroup_, 'mousedown', this,
      this.onMouseDown_));
};

/**
 * Dispose of this flyout.
 * Unlink from all DOM elements to prevent memory leaks.
 */
Blockly.Flyout.prototype.dispose = function() {
  this.hide();
  Blockly.unbindEvent_(this.eventWrappers_);
  if (this.filterWrapper_) {
    this.targetWorkspace_.removeChangeListener(this.filterWrapper_);
    this.filterWrapper_ = null;
  }
  if (this.scrollbar_) {
    this.scrollbar_.dispose();
    this.scrollbar_ = null;
  }
  if (this.workspace_) {
    this.workspace_.targetWorkspace = null;
    this.workspace_.dispose();
    this.workspace_ = null;
  }
  if (this.svgGroup_) {
    goog.dom.removeNode(this.svgGroup_);
    this.svgGroup_ = null;
  }
  this.svgBackground_ = null;
  this.targetWorkspace_ = null;
};

/**
 * Get the width of the flyout.
 * @return {number} The width of the flyout.
 */
Blockly.Flyout.prototype.getWidth = function() {
  return this.width_;
};

/**
 * Get the height of the flyout.
 * @return {number} The width of the flyout.
 */
Blockly.Flyout.prototype.getHeight = function() {
  return this.height_;
};

/**
 * Return an object with all the metrics required to size scrollbars for the
 * flyout.  The following properties are computed:
 * .viewHeight: Height of the visible rectangle,
 * .viewWidth: Width of the visible rectangle,
 * .contentHeight: Height of the contents,
 * .contentWidth: Width of the contents,
 * .viewTop: Offset of top edge of visible rectangle from parent,
 * .contentTop: Offset of the top-most content from the y=0 coordinate,
 * .absoluteTop: Top-edge of view.
 * .viewLeft: Offset of the left edge of visible rectangle from parent,
 * .contentLeft: Offset of the left-most content from the x=0 coordinate,
 * .absoluteLeft: Left-edge of view.
 * @return {Object} Contains size and position metrics of the flyout.
 * @private
 */
Blockly.Flyout.prototype.getMetrics_ = function() {
  if (!this.isVisible()) {
    // Flyout is hidden.
    return null;
  }

  try {
    var optionBox = this.workspace_.getCanvas().getBBox();
  } catch (e) {
    // Firefox has trouble with hidden elements (Bug 528969).
    var optionBox = {height: 0, y: 0, width: 0, x: 0};
  }

  var absoluteTop = this.SCROLLBAR_PADDING;
  var absoluteLeft = this.SCROLLBAR_PADDING;
  if (this.horizontalLayout_) {
    if (this.toolboxPosition_ == Blockly.TOOLBOX_AT_BOTTOM) {
      absoluteTop = 0;
    }
    var viewHeight = this.height_;
    if (this.toolboxPosition_ == Blockly.TOOLBOX_AT_TOP) {
      viewHeight -= this.SCROLLBAR_PADDING;
    }
    var viewWidth = this.width_ - 2 * this.SCROLLBAR_PADDING;
  } else {
    absoluteLeft = 0;
    var viewHeight = this.height_ - 2 * this.SCROLLBAR_PADDING;
    var viewWidth = this.width_;
    if (!this.RTL) {
      viewWidth -= this.SCROLLBAR_PADDING;
    }
  }

  var metrics = {
    viewHeight: viewHeight,
    viewWidth: viewWidth,
    contentHeight: (optionBox.height + 2 * this.MARGIN) * this.workspace_.scale,
    contentWidth: (optionBox.width + 2 * this.MARGIN) * this.workspace_.scale,
    viewTop: -this.workspace_.scrollY,
    viewLeft: -this.workspace_.scrollX,
    contentTop: optionBox.y,
    contentLeft: optionBox.x,
    absoluteTop: absoluteTop,
    absoluteLeft: absoluteLeft
  };
  return metrics;
};

/**
 * Sets the translation of the flyout to match the scrollbars.
 * @param {!Object} xyRatio Contains a y property which is a float
 *     between 0 and 1 specifying the degree of scrolling and a
 *     similar x property.
 * @private
 */
Blockly.Flyout.prototype.setMetrics_ = function(xyRatio) {
  var metrics = this.getMetrics_();
  // This is a fix to an apparent race condition.
  if (!metrics) {
    return;
  }
  if (!this.horizontalLayout_ && goog.isNumber(xyRatio.y)) {
    this.workspace_.scrollY = -metrics.contentHeight * xyRatio.y;
  } else if (this.horizontalLayout_ && goog.isNumber(xyRatio.x)) {
    this.workspace_.scrollX = -metrics.contentWidth * xyRatio.x;
  }

  this.workspace_.translate(this.workspace_.scrollX + metrics.absoluteLeft,
      this.workspace_.scrollY + metrics.absoluteTop);
};

/**
 * Move the flyout to the edge of the workspace.
 */
Blockly.Flyout.prototype.position = function() {
  if (!this.isVisible()) {
    return;
  }
  var targetWorkspaceMetrics = this.targetWorkspace_.getMetrics();
  if (!targetWorkspaceMetrics) {
    // Hidden components will return null.
    return;
  }
  var edgeWidth = this.horizontalLayout_ ?
      targetWorkspaceMetrics.viewWidth - 2 * this.CORNER_RADIUS :
      this.width_ - this.CORNER_RADIUS;

  var edgeHeight = this.horizontalLayout_ ?
      this.height_ - this.CORNER_RADIUS :
      targetWorkspaceMetrics.viewHeight - 2 * this.CORNER_RADIUS;

  this.setBackgroundPath_(edgeWidth, edgeHeight);

  var x = targetWorkspaceMetrics.absoluteLeft;
  if (this.toolboxPosition_ == Blockly.TOOLBOX_AT_RIGHT) {
    x += targetWorkspaceMetrics.viewWidth;
    x -= this.width_;
  }

  var y = targetWorkspaceMetrics.absoluteTop;
  if (this.toolboxPosition_ == Blockly.TOOLBOX_AT_BOTTOM) {
    y += targetWorkspaceMetrics.viewHeight;
    y -= this.height_;
  }

  // Record the height for Blockly.Flyout.getMetrics_, or width if the layout is
  // horizontal.
  if (this.horizontalLayout_) {
    this.width_ = targetWorkspaceMetrics.viewWidth;
  } else {
    this.height_ = targetWorkspaceMetrics.viewHeight;
  }

  this.svgGroup_.setAttribute("width", this.width_);
  this.svgGroup_.setAttribute("height", this.height_);
  var transform = 'translate(' + x + 'px,' + y + 'px)';
  Blockly.utils.setCssTransform(this.svgGroup_, transform);

  // Update the scrollbar (if one exists).
  if (this.scrollbar_) {
    // Set the scrollbars origin to be the top left of the flyout.
    this.scrollbar_.setOrigin(x, y);
    this.scrollbar_.resize();
  }
};

/**
 * Create and set the path for the visible boundaries of the flyout.
 * @param {number} width The width of the flyout, not including the
 *     rounded corners.
 * @param {number} height The height of the flyout, not including
 *     rounded corners.
 * @private
 */
Blockly.Flyout.prototype.setBackgroundPath_ = function(width, height) {
  if (this.horizontalLayout_) {
    this.setBackgroundPathHorizontal_(width, height);
  } else {
    this.setBackgroundPathVertical_(width, height);
  }
};

/**
 * Create and set the path for the visible boundaries of the flyout in vertical
 * mode.
 * @param {number} width The width of the flyout, not including the
 *     rounded corners.
 * @param {number} height The height of the flyout, not including
 *     rounded corners.
 * @private
 */
Blockly.Flyout.prototype.setBackgroundPathVertical_ = function(width, height) {
  var atRight = this.toolboxPosition_ == Blockly.TOOLBOX_AT_RIGHT;
  var totalWidth = width + this.CORNER_RADIUS;

  // Decide whether to start on the left or right.
  var path = ['M ' + (atRight ? totalWidth : 0) + ',0'];
  // Top.
  path.push('h', atRight ? -width : width);
  // Rounded corner.
  path.push('a', this.CORNER_RADIUS, this.CORNER_RADIUS, 0, 0,
      atRight ? 0 : 1,
      atRight ? -this.CORNER_RADIUS : this.CORNER_RADIUS,
      this.CORNER_RADIUS);
  // Side closest to workspace.
  path.push('v', Math.max(0, height));
  // Rounded corner.
  path.push('a', this.CORNER_RADIUS, this.CORNER_RADIUS, 0, 0,
      atRight ? 0 : 1,
      atRight ? this.CORNER_RADIUS : -this.CORNER_RADIUS,
      this.CORNER_RADIUS);
  // Bottom.
  path.push('h',  atRight ? width : -width);
  path.push('z');
  this.svgBackground_.setAttribute('d', path.join(' '));
};

/**
 * Create and set the path for the visible boundaries of the flyout in
 * horizontal mode.
 * @param {number} width The width of the flyout, not including the
 *     rounded corners.
 * @param {number} height The height of the flyout, not including
 *     rounded corners.
 * @private
 */
Blockly.Flyout.prototype.setBackgroundPathHorizontal_ = function(width,
    height) {
  var atTop = this.toolboxPosition_ == Blockly.TOOLBOX_AT_TOP;
  // Start at top left.
  var path = ['M 0,' + (atTop ? 0 : this.CORNER_RADIUS)];

  if (atTop) {
    // Top.
    path.push('h', width + 2 * this.CORNER_RADIUS);
    // Right.
    path.push('v', height);
    // Bottom.
    path.push('a', this.CORNER_RADIUS, this.CORNER_RADIUS, 0, 0, 1,
        -this.CORNER_RADIUS, this.CORNER_RADIUS);
    path.push('h', -1 * width);
    // Left.
    path.push('a', this.CORNER_RADIUS, this.CORNER_RADIUS, 0, 0, 1,
        -this.CORNER_RADIUS, -this.CORNER_RADIUS);
    path.push('z');
  } else {
    // Top.
    path.push('a', this.CORNER_RADIUS, this.CORNER_RADIUS, 0, 0, 1,
        this.CORNER_RADIUS, -this.CORNER_RADIUS);
    path.push('h', width);
     // Right.
    path.push('a', this.CORNER_RADIUS, this.CORNER_RADIUS, 0, 0, 1,
        this.CORNER_RADIUS, this.CORNER_RADIUS);
    path.push('v', height);
    // Bottom.
    path.push('h', -width - 2 * this.CORNER_RADIUS);
    // Left.
    path.push('z');
  }
  this.svgBackground_.setAttribute('d', path.join(' '));
};

/**
 * Scroll the flyout to the top.
 */
Blockly.Flyout.prototype.scrollToStart = function() {
  this.scrollbar_.set((this.horizontalLayout_ && this.RTL) ? Infinity : 0);
};

/**
 * Scroll the flyout.
 * @param {!Event} e Mouse wheel scroll event.
 * @private
 */
Blockly.Flyout.prototype.wheel_ = function(e) {
  var delta = this.horizontalLayout_ ? e.deltaX : e.deltaY;

  if (delta) {
    if (goog.userAgent.GECKO) {
      // Firefox's deltas are a tenth that of Chrome/Safari.
      delta *= 10;
    }
    var metrics = this.getMetrics_();
    var pos = this.horizontalLayout_ ? metrics.viewLeft + delta :
        metrics.viewTop + delta;
    var limit = this.horizontalLayout_ ?
        metrics.contentWidth - metrics.viewWidth :
        metrics.contentHeight - metrics.viewHeight;
    pos = Math.min(pos, limit);
    pos = Math.max(pos, 0);
    this.scrollbar_.set(pos);
  }

  // Don't scroll the page.
  e.preventDefault();
  // Don't propagate mousewheel event (zooming).
  e.stopPropagation();
};

/**
 * Is the flyout visible?
 * @return {boolean} True if visible.
 */
Blockly.Flyout.prototype.isVisible = function() {
  return this.isVisible_;
};

 /**
 * Set whether the flyout is visible. A value of true does not necessarily mean
 * that the flyout is shown. It could be hidden because its container is hidden.
 * @param {boolean} visible True if visible.
 */
Blockly.Flyout.prototype.setVisible = function(visible) {
  var visibilityChanged = (visible != this.isVisible());

  this.isVisible_ = visible;
  if (visibilityChanged) {
    this.updateDisplay_();
  }
};

/**
 * Set whether this flyout's container is visible.
 * @param {boolean} visible Whether the container is visible.
 */
Blockly.Flyout.prototype.setContainerVisible = function(visible) {
  var visibilityChanged = (visible != this.containerVisible_);
  this.containerVisible_ = visible;
  if (visibilityChanged) {
    this.updateDisplay_();
  }
};

/**
 * Update the display property of the flyout based whether it thinks it should
 * be visible and whether its containing workspace is visible.
 * @private
 */
Blockly.Flyout.prototype.updateDisplay_ = function() {
  var show = true;
  if (!this.containerVisible_) {
    show = false;
  } else {
    show = this.isVisible();
  }
  this.svgGroup_.style.display = show ? 'block' : 'none';
  // Update the scrollbar's visiblity too since it should mimic the
  // flyout's visibility.
  this.scrollbar_.setContainerVisible(show);
};

/**
 * Hide and empty the flyout.
 */
Blockly.Flyout.prototype.hide = function() {
  if (!this.isVisible()) {
    return;
  }
  this.setVisible(false);
  // Delete all the event listeners.
  for (var x = 0, listen; listen = this.listeners_[x]; x++) {
    Blockly.unbindEvent_(listen);
  }
  this.listeners_.length = 0;
  if (this.reflowWrapper_) {
    this.workspace_.removeChangeListener(this.reflowWrapper_);
    this.reflowWrapper_ = null;
  }
  // Do NOT delete the blocks here.  Wait until Flyout.show.
  // https://neil.fraser.name/news/2014/08/09/
};

/**
 * Show and populate the flyout.
 * @param {!Array|string} xmlList List of blocks to show.
 *     Variables and procedures have a custom set of blocks.
 */
Blockly.Flyout.prototype.show = function(xmlList) {
  this.workspace_.setResizesEnabled(false);
  this.hide();
  this.clearOldBlocks_();

  // Handle dynamic categories, represented by a name instead of a list of XML.
  // Look up the correct category generation function and call that to get a
  // valid XML list.
  if (typeof xmlList == 'string') {
    var fnToApply = this.workspace_.targetWorkspace.getToolboxCategoryCallback(
        xmlList);
    goog.asserts.assert(goog.isFunction(fnToApply),
        'Couldn\'t find a callback function when opening a toolbox category.');
    xmlList = fnToApply(this.workspace_.targetWorkspace);
    goog.asserts.assert(goog.isArray(xmlList),
        'The result of a toolbox category callback must be an array.');
  }

  this.setVisible(true);
  // Create the blocks to be shown in this flyout.
  var contents = [];
  var gaps = [];
  this.permanentlyDisabled_.length = 0;
  for (var i = 0, xml; xml = xmlList[i]; i++) {
    if (xml.tagName) {
      var tagName = xml.tagName.toUpperCase();
      var default_gap = this.horizontalLayout_ ? this.GAP_X : this.GAP_Y;
      if (tagName == 'BLOCK') {
        var curBlock = Blockly.Xml.domToBlock(xml, this.workspace_);
        if (curBlock.disabled) {
          // Record blocks that were initially disabled.
          // Do not enable these blocks as a result of capacity filtering.
          this.permanentlyDisabled_.push(curBlock);
        }
        contents.push({type: 'block', block: curBlock});
        var gap = parseInt(xml.getAttribute('gap'), 10);
        gaps.push(isNaN(gap) ? default_gap : gap);
      } else if (xml.tagName.toUpperCase() == 'SEP') {
        // Change the gap between two blocks.
        // <sep gap="36"></sep>
        // The default gap is 24, can be set larger or smaller.
        // This overwrites the gap attribute on the previous block.
        // Note that a deprecated method is to add a gap to a block.
        // <block type="math_arithmetic" gap="8"></block>
        var newGap = parseInt(xml.getAttribute('gap'), 10);
        // Ignore gaps before the first block.
        if (!isNaN(newGap) && gaps.length > 0) {
          gaps[gaps.length - 1] = newGap;
        } else {
          gaps.push(default_gap);
        }
      } else if (tagName == 'BUTTON' || tagName == 'LABEL') {
        // Labels behave the same as buttons, but are styled differently.
        var isLabel = tagName == 'LABEL';
        var curButton = new Blockly.FlyoutButton(this.workspace_,
            this.targetWorkspace_, xml, isLabel);
        contents.push({type: 'button', button: curButton});
        gaps.push(default_gap);
      }
    }
  }

  this.layout_(contents, gaps);

  // IE 11 is an incompetent browser that fails to fire mouseout events.
  // When the mouse is over the background, deselect all blocks.
  var deselectAll = function() {
    var topBlocks = this.workspace_.getTopBlocks(false);
    for (var i = 0, block; block = topBlocks[i]; i++) {
      block.removeSelect();
    }
  };

  this.listeners_.push(Blockly.bindEventWithChecks_(this.svgBackground_,
      'mouseover', this, deselectAll));

  if (this.horizontalLayout_) {
    this.height_ = 0;
  } else {
    this.width_ = 0;
  }
  this.workspace_.setResizesEnabled(true);
  this.reflow();

  this.filterForCapacity_();

  // Correctly position the flyout's scrollbar when it opens.
  this.position();

  this.reflowWrapper_ = this.reflow.bind(this);
  this.workspace_.addChangeListener(this.reflowWrapper_);
};

/**
 * Lay out the blocks in the flyout.
 * @param {!Array.<!Object>} contents The blocks and buttons to lay out.
 * @param {!Array.<number>} gaps The visible gaps between blocks.
 * @private
 */
Blockly.Flyout.prototype.layout_ = function(contents, gaps) {
  this.workspace_.scale = this.targetWorkspace_.scale;
  var margin = this.MARGIN;
  var cursorX = this.RTL ? margin : margin + Blockly.BlockSvg.TAB_WIDTH;
  var cursorY = margin;
  if (this.horizontalLayout_ && this.RTL) {
    contents = contents.reverse();
  }

  for (var i = 0, item; item = contents[i]; i++) {
    if (item.type == 'block') {
      var block = item.block;
      var allBlocks = block.getDescendants();
      for (var j = 0, child; child = allBlocks[j]; j++) {
        // Mark blocks as being inside a flyout.  This is used to detect and
        // prevent the closure of the flyout if the user right-clicks on such a
        // block.
        child.isInFlyout = true;
      }
      block.render();
      var root = block.getSvgRoot();
      var blockHW = block.getHeightWidth();
      var tab = block.outputConnection ? Blockly.BlockSvg.TAB_WIDTH : 0;
      if (this.horizontalLayout_) {
        cursorX += tab;
      }
      block.moveBy((this.horizontalLayout_ && this.RTL) ?
          cursorX + blockHW.width - tab : cursorX,
          cursorY);
      if (this.horizontalLayout_) {
        cursorX += (blockHW.width + gaps[i] - tab);
      } else {
        cursorY += blockHW.height + gaps[i];
      }

      // Create an invisible rectangle under the block to act as a button.  Just
      // using the block as a button is poor, since blocks have holes in them.
      var rect = Blockly.utils.createSvgElement('rect', {'fill-opacity': 0}, null);
      rect.tooltip = block;
      Blockly.Tooltip.bindMouseEvents(rect);
      // Add the rectangles under the blocks, so that the blocks' tooltips work.
      this.workspace_.getCanvas().insertBefore(rect, block.getSvgRoot());
      block.flyoutRect_ = rect;
      this.backgroundButtons_[i] = rect;

      this.addBlockListeners_(root, block, rect);
    } else if (item.type == 'button') {
      var button = item.button;
      var buttonSvg = button.createDom();
      button.moveTo(cursorX, cursorY);
      button.show();
      Blockly.bindEventWithChecks_(buttonSvg, 'mouseup', button,
          button.onMouseUp);

      this.buttons_.push(button);
      if (this.horizontalLayout_) {
        cursorX += (button.width + gaps[i]);
      } else {
        cursorY += button.height + gaps[i];
      }
    }
  }
};

/**
 * Delete blocks and background buttons from a previous showing of the flyout.
 * @private
 */
Blockly.Flyout.prototype.clearOldBlocks_ = function() {
  // Delete any blocks from a previous showing.
  var oldBlocks = this.workspace_.getTopBlocks(false);
  for (var i = 0, block; block = oldBlocks[i]; i++) {
    if (block.workspace == this.workspace_) {
      block.dispose(false, false);
    }
  }
  // Delete any background buttons from a previous showing.
  for (var j = 0, rect; rect = this.backgroundButtons_[j]; j++) {
    goog.dom.removeNode(rect);
  }
  this.backgroundButtons_.length = 0;

  for (var i = 0, button; button = this.buttons_[i]; i++) {
    button.dispose();
  }
  this.buttons_.length = 0;
};

/**
 * Add listeners to a block that has been added to the flyout.
 * @param {!Element} root The root node of the SVG group the block is in.
 * @param {!Blockly.Block} block The block to add listeners for.
 * @param {!Element} rect The invisible rectangle under the block that acts as
 *     a button for that block.
 * @private
 */
Blockly.Flyout.prototype.addBlockListeners_ = function(root, block, rect) {
  this.listeners_.push(Blockly.bindEventWithChecks_(root, 'mousedown', null,
      this.blockMouseDown_(block)));
  this.listeners_.push(Blockly.bindEventWithChecks_(rect, 'mousedown', null,
      this.blockMouseDown_(block)));
  this.listeners_.push(Blockly.bindEvent_(root, 'mouseover', block,
      block.addSelect));
  this.listeners_.push(Blockly.bindEvent_(root, 'mouseout', block,
      block.removeSelect));
  this.listeners_.push(Blockly.bindEvent_(rect, 'mouseover', block,
      block.addSelect));
  this.listeners_.push(Blockly.bindEvent_(rect, 'mouseout', block,
      block.removeSelect));
};

/**
 * Actions to take when a block in the flyout is right-clicked.
 * @param {!Event} e Event that triggered the right-click.  Could originate from
 *     a long-press in a touch environment.
 * @param {Blockly.BlockSvg} block The block that was clicked.
 */
Blockly.Flyout.blockRightClick_ = function(e, block) {
  Blockly.terminateDrag_();
  Blockly.hideChaff(true);
  block.showContextMenu_(e);
  // This was a right-click, so end the gesture immediately.
  Blockly.Touch.clearTouchIdentifier();
};

/**
 * Handle a mouse-down on an SVG block in a non-closing flyout.
 * @param {!Blockly.Block} block The flyout block to copy.
 * @return {!Function} Function to call when block is clicked.
 * @private
 */
Blockly.Flyout.prototype.blockMouseDown_ = function(block) {
  var flyout = this;
  return function(e) {
    if (Blockly.utils.isRightButton(e)) {
      Blockly.Flyout.blockRightClick_(e, block);
    } else {
      Blockly.terminateDrag_();
      Blockly.hideChaff(true);
      // Left-click (or middle click)
      Blockly.Css.setCursor(Blockly.Css.Cursor.CLOSED);
      // Record the current mouse position.
      flyout.startDragMouseY_ = e.clientY;
      flyout.startDragMouseX_ = e.clientX;
      Blockly.Flyout.startDownEvent_ = e;
      Blockly.Flyout.startBlock_ = block;
      Blockly.Flyout.startFlyout_ = flyout;
      Blockly.Flyout.onMouseUpWrapper_ = Blockly.bindEventWithChecks_(document,
          'mouseup', flyout, flyout.onMouseUp_);
      Blockly.Flyout.onMouseMoveBlockWrapper_ = Blockly.bindEventWithChecks_(
          document, 'mousemove', flyout, flyout.onMouseMoveBlock_);
    }
    // This event has been handled.  No need to bubble up to the document.
    e.stopPropagation();
    e.preventDefault();
  };
};

/**
 * Mouse down on the flyout background.  Start a vertical scroll drag.
 * @param {!Event} e Mouse down event.
 * @private
 */
Blockly.Flyout.prototype.onMouseDown_ = function(e) {
  if (Blockly.utils.isRightButton(e)) {
    // Don't start drags with right clicks.
    Blockly.Touch.clearTouchIdentifier();
    return;
  }
  Blockly.hideChaff(true);
  this.dragMode_ = Blockly.DRAG_FREE;
  this.startDragMouseY_ = e.clientY;
  this.startDragMouseX_ = e.clientX;
  Blockly.Flyout.startFlyout_ = this;
  Blockly.Flyout.onMouseMoveWrapper_ = Blockly.bindEventWithChecks_(document,
      'mousemove', this, this.onMouseMove_);
  Blockly.Flyout.onMouseUpWrapper_ = Blockly.bindEventWithChecks_(document,
      'mouseup', this, Blockly.Flyout.terminateDrag_);
  // This event has been handled.  No need to bubble up to the document.
  e.preventDefault();
  e.stopPropagation();
};

/**
 * Handle a mouse-up anywhere in the SVG pane.  Is only registered when a
 * block is clicked.  We can't use mouseUp on the block since a fast-moving
 * cursor can briefly escape the block before it catches up.
 * @param {!Event} e Mouse up event.
 * @private
 */
Blockly.Flyout.prototype.onMouseUp_ = function(e) {
  if (!this.workspace_.isDragging()) {
    // This was a click, not a drag.  End the gesture.
    Blockly.Touch.clearTouchIdentifier();
    if (this.autoClose) {
      this.createBlockFunc_(Blockly.Flyout.startBlock_)(
          Blockly.Flyout.startDownEvent_);
    } else if (!Blockly.WidgetDiv.isVisible()) {
      Blockly.Events.fire(
          new Blockly.Events.Ui(Blockly.Flyout.startBlock_, 'click',
                                undefined, undefined));
    }
  }
  Blockly.terminateDrag_();
};

/**
 * Handle a mouse-move to vertically drag the flyout.
 * @param {!Event} e Mouse move event.
 * @private
 */
Blockly.Flyout.prototype.onMouseMove_ = function(e) {
  var metrics = this.getMetrics_();
  if (this.horizontalLayout_) {
    if (metrics.contentWidth - metrics.viewWidth < 0) {
      return;
    }
    var dx = e.clientX - this.startDragMouseX_;
    this.startDragMouseX_ = e.clientX;
    var x = metrics.viewLeft - dx;
    x = goog.math.clamp(x, 0, metrics.contentWidth - metrics.viewWidth);
    this.scrollbar_.set(x);
  } else {
    if (metrics.contentHeight - metrics.viewHeight < 0) {
      return;
    }
    var dy = e.clientY - this.startDragMouseY_;
    this.startDragMouseY_ = e.clientY;
    var y = metrics.viewTop - dy;
    y = goog.math.clamp(y, 0, metrics.contentHeight - metrics.viewHeight);
    this.scrollbar_.set(y);
  }
};

/**
 * Mouse button is down on a block in a non-closing flyout.  Create the block
 * if the mouse moves beyond a small radius.  This allows one to play with
 * fields without instantiating blocks that instantly self-destruct.
 * @param {!Event} e Mouse move event.
 * @private
 */
Blockly.Flyout.prototype.onMouseMoveBlock_ = function(e) {
  if (e.type == 'mousemove' && e.clientX <= 1 && e.clientY == 0 &&
      e.button == 0) {
    /* HACK:
     Safari Mobile 6.0 and Chrome for Android 18.0 fire rogue mousemove events
     on certain touch actions. Ignore events with these signatures.
     This may result in a one-pixel blind spot in other browsers,
     but this shouldn't be noticeable. */
    e.stopPropagation();
    return;
  }
  var dx = e.clientX - Blockly.Flyout.startDownEvent_.clientX;
  var dy = e.clientY - Blockly.Flyout.startDownEvent_.clientY;

  var createBlock = this.determineDragIntention_(dx, dy);
  if (createBlock) {
    Blockly.longStop_();
    this.createBlockFunc_(Blockly.Flyout.startBlock_)(
        Blockly.Flyout.startDownEvent_);
  } else if (this.dragMode_ == Blockly.DRAG_FREE) {
    Blockly.longStop_();
    // Do a scroll.
    this.onMouseMove_(e);
  }
  e.stopPropagation();
};

/**
 * Determine the intention of a drag.
 * Updates dragMode_ based on a drag delta and the current mode,
 * and returns true if we should create a new block.
 * @param {number} dx X delta of the drag.
 * @param {number} dy Y delta of the drag.
 * @return {boolean} True if a new block should be created.
 * @private
 */
Blockly.Flyout.prototype.determineDragIntention_ = function(dx, dy) {
  if (this.dragMode_ == Blockly.DRAG_FREE) {
    // Once in free mode, always stay in free mode and never create a block.
    return false;
  }
  var dragDistance = Math.sqrt(dx * dx + dy * dy);
  if (dragDistance < this.DRAG_RADIUS) {
    // Still within the sticky drag radius.
    this.dragMode_ = Blockly.DRAG_STICKY;
    return false;
  } else {
    if (this.isDragTowardWorkspace_(dx, dy) || !this.scrollbar_.isVisible()) {
      // Immediately create a block.
      return true;
    } else {
      // Immediately move to free mode - the drag is away from the workspace.
      this.dragMode_ = Blockly.DRAG_FREE;
      return false;
    }
  }
};

/**
 * Determine if a drag delta is toward the workspace, based on the position
 * and orientation of the flyout. This is used in determineDragIntention_ to
 * determine if a new block should be created or if the flyout should scroll.
 * @param {number} dx X delta of the drag.
 * @param {number} dy Y delta of the drag.
 * @return {boolean} true if the drag is toward the workspace.
 * @private
 */
Blockly.Flyout.prototype.isDragTowardWorkspace_ = function(dx, dy) {
  // Direction goes from -180 to 180, with 0 toward the right and 90 on top.
  var dragDirection = Math.atan2(dy, dx) / Math.PI * 180;

  var range = this.dragAngleRange_;
  if (this.horizontalLayout_) {
    // Check for up or down dragging.
    if ((dragDirection < 90 + range && dragDirection > 90 - range) ||
        (dragDirection > -90 - range && dragDirection < -90 + range)) {
      return true;
    }
  } else {
    // Check for left or right dragging.
    if ((dragDirection < range && dragDirection > -range) ||
        (dragDirection < -180 + range || dragDirection > 180 - range)) {
      return true;
    }
  }
  return false;
};

/**
 * Create a copy of this block on the workspace.
 * @param {!Blockly.Block} originBlock The flyout block to copy.
 * @return {!Function} Function to call when block is clicked.
 * @private
 */
Blockly.Flyout.prototype.createBlockFunc_ = function(originBlock) {
  var flyout = this;
  return function(e) {
    if (Blockly.utils.isRightButton(e)) {
      // Right-click.  Don't create a block, let the context menu show.
      return;
    }
    if (originBlock.disabled) {
      // Beyond capacity.
      return;
    }
    Blockly.Events.disable();
    // Disable workspace resizing. Reenable at the end of the drag. This avoids
    // a spurious resize between creating the new block and placing it in the
    // workspace.
    flyout.targetWorkspace_.setResizesEnabled(false);
    try {
      var block = flyout.placeNewBlock_(originBlock);
    } finally {
      Blockly.Events.enable();
    }
    if (Blockly.Events.isEnabled()) {
      Blockly.Events.setGroup(true);
      Blockly.Events.fire(new Blockly.Events.Create(block));
    }
    if (flyout.autoClose) {
      flyout.hide();
    } else {
      flyout.filterForCapacity_();
    }

    // Re-render the blocks before starting the drag:
    // Force a render on IE and Edge to get around the issue described in
    // Blockly.Field.getCachedWidth
    if (goog.userAgent.IE || goog.userAgent.EDGE) {
      var blocks = block.getDescendants();
      for (var i = blocks.length - 1; i >= 0; i--) {
        blocks[i].render(false);
      }
    }

    // Start a dragging operation on the new block.
    block.onMouseDown_(e);
    Blockly.dragMode_ = Blockly.DRAG_FREE;
    block.setDragging_(true);
    block.moveToDragSurface_();
  };
};

/**
 * Copy a block from the flyout to the workspace and position it correctly.
 * @param {!Blockly.Block} originBlock The flyout block to copy..
 * @return {!Blockly.Block} The new block in the main workspace.
 * @private
 */
Blockly.Flyout.prototype.placeNewBlock_ = function(originBlock) {
  var targetWorkspace = this.targetWorkspace_;
  var svgRootOld = originBlock.getSvgRoot();
  if (!svgRootOld) {
    throw 'originBlock is not rendered.';
  }
  // Figure out where the original block is on the screen, relative to the upper
  // left corner of the main workspace.
  if (targetWorkspace.isMutator) {
    var xyOld = this.workspace_.getSvgXY(/** @type {!Element} */ (svgRootOld));
  } else {
    var xyOld = Blockly.utils.getInjectionDivXY_(svgRootOld);
  }
  // Take into account that the flyout might have been scrolled horizontally
  // (separately from the main workspace).
  // Generally a no-op in vertical mode but likely to happen in horizontal
  // mode.
  var scrollX = this.workspace_.scrollX;
  var scale = this.workspace_.scale;
  xyOld.x += scrollX / scale - scrollX;
  // If the flyout is on the right side, (0, 0) in the flyout is offset to
  // the right of (0, 0) in the main workspace.  Add an offset to take that
  // into account.
  if (this.toolboxPosition_ == Blockly.TOOLBOX_AT_RIGHT) {
    scrollX = targetWorkspace.getMetrics().viewWidth - this.width_;
    scale = targetWorkspace.scale;
    // Scale the scroll (getSvgXY_ did not do this).
    xyOld.x += scrollX / scale - scrollX;
  }

  // Take into account that the flyout might have been scrolled vertically
  // (separately from the main workspace).
  // Generally a no-op in horizontal mode but likely to happen in vertical
  // mode.
  var scrollY = this.workspace_.scrollY;
  scale = this.workspace_.scale;
  xyOld.y += scrollY / scale - scrollY;
  // If the flyout is on the bottom, (0, 0) in the flyout is offset to be below
  // (0, 0) in the main workspace.  Add an offset to take that into account.
  if (this.toolboxPosition_ == Blockly.TOOLBOX_AT_BOTTOM) {
    scrollY = targetWorkspace.getMetrics().viewHeight - this.height_;
    scale = targetWorkspace.scale;
    xyOld.y += scrollY / scale - scrollY;
  }

  // Create the new block by cloning the block in the flyout (via XML).
  var xml = Blockly.Xml.blockToDom(originBlock);
  var block = Blockly.Xml.domToBlock(xml, targetWorkspace);
  var svgRootNew = block.getSvgRoot();
  if (!svgRootNew) {
    throw 'block is not rendered.';
  }
  // Figure out where the new block got placed on the screen, relative to the
  // upper left corner of the workspace.  This may not be the same as the
  // original block because the flyout's origin may not be the same as the
  // main workspace's origin.
  if (targetWorkspace.isMutator) {
    var xyNew = targetWorkspace.getSvgXY(/* @type {!Element} */(svgRootNew));
  } else {
    var xyNew = Blockly.utils.getInjectionDivXY_(svgRootNew);
  }

  // Scale the scroll (getSvgXY_ did not do this).
  xyNew.x +=
      targetWorkspace.scrollX / targetWorkspace.scale - targetWorkspace.scrollX;
  xyNew.y +=
      targetWorkspace.scrollY / targetWorkspace.scale - targetWorkspace.scrollY;
  // If the flyout is collapsible and the workspace can't be scrolled.
  if (targetWorkspace.toolbox_ && !targetWorkspace.scrollbar) {
    xyNew.x += targetWorkspace.toolbox_.getWidth() / targetWorkspace.scale;
    xyNew.y += targetWorkspace.toolbox_.getHeight() / targetWorkspace.scale;
  }

  // Move the new block to where the old block is.
  block.moveBy(xyOld.x - xyNew.x, xyOld.y - xyNew.y);
  return block;
};

/**
 * Filter the blocks on the flyout to disable the ones that are above the
 * capacity limit.
 * @private
 */
Blockly.Flyout.prototype.filterForCapacity_ = function() {
  var remainingCapacity = this.targetWorkspace_.remainingCapacity();
  var blocks = this.workspace_.getTopBlocks(false);
  for (var i = 0, block; block = blocks[i]; i++) {
    if (this.permanentlyDisabled_.indexOf(block) == -1) {
      var allBlocks = block.getDescendants();
      block.setDisabled(allBlocks.length > remainingCapacity);
    }
  }
};

/**
 * Return the deletion rectangle for this flyout.
 * @return {goog.math.Rect} Rectangle in which to delete.
 */
Blockly.Flyout.prototype.getClientRect = function() {
  if (!this.svgGroup_) {
    return null;
  }

  var flyoutRect = this.svgGroup_.getBoundingClientRect();
  // BIG_NUM is offscreen padding so that blocks dragged beyond the shown flyout
  // area are still deleted.  Must be larger than the largest screen size,
  // but be smaller than half Number.MAX_SAFE_INTEGER (not available on IE).
  var BIG_NUM = 1000000000;
  var x = flyoutRect.left;
  var y = flyoutRect.top;
  var width = flyoutRect.width;
  var height = flyoutRect.height;

  if (this.toolboxPosition_ == Blockly.TOOLBOX_AT_TOP) {
    return new goog.math.Rect(-BIG_NUM, y - BIG_NUM, BIG_NUM * 2,
        BIG_NUM + height);
  } else if (this.toolboxPosition_ == Blockly.TOOLBOX_AT_BOTTOM) {
    return new goog.math.Rect(-BIG_NUM, y, BIG_NUM * 2,
        BIG_NUM + height);
  } else if (this.toolboxPosition_ == Blockly.TOOLBOX_AT_LEFT) {
    return new goog.math.Rect(x - BIG_NUM, -BIG_NUM, BIG_NUM + width,
        BIG_NUM * 2);
  } else {  // Right
    return new goog.math.Rect(x, -BIG_NUM, BIG_NUM + width, BIG_NUM * 2);
  }
};

/**
 * Stop binding to the global mouseup and mousemove events.
 * @private
 */
Blockly.Flyout.terminateDrag_ = function() {
  if (Blockly.Flyout.startFlyout_) {
    // User was dragging the flyout background, and has stopped.
    if (Blockly.Flyout.startFlyout_.dragMode_ == Blockly.DRAG_FREE) {
      Blockly.Touch.clearTouchIdentifier();
    }
    Blockly.Flyout.startFlyout_.dragMode_ = Blockly.DRAG_NONE;
    Blockly.Flyout.startFlyout_ = null;
  }
  if (Blockly.Flyout.onMouseUpWrapper_) {
    Blockly.unbindEvent_(Blockly.Flyout.onMouseUpWrapper_);
    Blockly.Flyout.onMouseUpWrapper_ = null;
  }
  if (Blockly.Flyout.onMouseMoveBlockWrapper_) {
    Blockly.unbindEvent_(Blockly.Flyout.onMouseMoveBlockWrapper_);
    Blockly.Flyout.onMouseMoveBlockWrapper_ = null;
  }
  if (Blockly.Flyout.onMouseMoveWrapper_) {
    Blockly.unbindEvent_(Blockly.Flyout.onMouseMoveWrapper_);
    Blockly.Flyout.onMouseMoveWrapper_ = null;
  }
  Blockly.Flyout.startDownEvent_ = null;
  Blockly.Flyout.startBlock_ = null;
};

/**
 * Compute height of flyout.  Position button under each block.
 * For RTL: Lay out the blocks right-aligned.
 * @param {!Array<!Blockly.Block>} blocks The blocks to reflow.
 */
Blockly.Flyout.prototype.reflowHorizontal = function(blocks) {
  this.workspace_.scale = this.targetWorkspace_.scale;
  var flyoutHeight = 0;
  for (var i = 0, block; block = blocks[i]; i++) {
    flyoutHeight = Math.max(flyoutHeight, block.getHeightWidth().height);
  }
  flyoutHeight += this.MARGIN * 1.5;
  flyoutHeight *= this.workspace_.scale;
  flyoutHeight += Blockly.Scrollbar.scrollbarThickness;
  if (this.height_ != flyoutHeight) {
    for (var i = 0, block; block = blocks[i]; i++) {
      var blockHW = block.getHeightWidth();
      if (block.flyoutRect_) {
        block.flyoutRect_.setAttribute('width', blockHW.width);
        block.flyoutRect_.setAttribute('height', blockHW.height);
        // Rectangles behind blocks with output tabs are shifted a bit.
        var tab = block.outputConnection ? Blockly.BlockSvg.TAB_WIDTH : 0;
        var blockXY = block.getRelativeToSurfaceXY();
        block.flyoutRect_.setAttribute('y', blockXY.y);
        block.flyoutRect_.setAttribute('x',
            this.RTL ? blockXY.x - blockHW.width + tab : blockXY.x - tab);
        // For hat blocks we want to shift them down by the hat height
        // since the y coordinate is the corner, not the top of the hat.
        var hatOffset =
            block.startHat_ ? Blockly.BlockSvg.START_HAT_HEIGHT : 0;
        if (hatOffset) {
          block.moveBy(0, hatOffset);
        }
        block.flyoutRect_.setAttribute('y', blockXY.y);
      }
    }
    // Record the height for .getMetrics_ and .position.
    this.height_ = flyoutHeight;
    // Call this since it is possible the trash and zoom buttons need
    // to move. e.g. on a bottom positioned flyout when zoom is clicked.
    this.targetWorkspace_.resize();
  }
};

/**
 * Compute width of flyout.  Position button under each block.
 * For RTL: Lay out the blocks right-aligned.
 * @param {!Array<!Blockly.Block>} blocks The blocks to reflow.
 */
Blockly.Flyout.prototype.reflowVertical = function(blocks) {
  this.workspace_.scale = this.targetWorkspace_.scale;
  var flyoutWidth = 0;
  for (var i = 0, block; block = blocks[i]; i++) {
    var width = block.getHeightWidth().width;
    if (block.outputConnection) {
      width -= Blockly.BlockSvg.TAB_WIDTH;
    }
    flyoutWidth = Math.max(flyoutWidth, width);
  }
  for (var i = 0, button; button = this.buttons_[i]; i++) {
    flyoutWidth = Math.max(flyoutWidth, button.width);
  }
  flyoutWidth += this.MARGIN * 1.5 + Blockly.BlockSvg.TAB_WIDTH;
  flyoutWidth *= this.workspace_.scale;
  flyoutWidth += Blockly.Scrollbar.scrollbarThickness;
  if (this.width_ != flyoutWidth) {
    for (var i = 0, block; block = blocks[i]; i++) {
      var blockHW = block.getHeightWidth();
      if (this.RTL) {
        // With the flyoutWidth known, right-align the blocks.
        var oldX = block.getRelativeToSurfaceXY().x;
        var newX = flyoutWidth / this.workspace_.scale - this.MARGIN;
        newX -= Blockly.BlockSvg.TAB_WIDTH;
        block.moveBy(newX - oldX, 0);
      }
      if (block.flyoutRect_) {
        block.flyoutRect_.setAttribute('width', blockHW.width);
        block.flyoutRect_.setAttribute('height', blockHW.height);
        // Blocks with output tabs are shifted a bit.
        var tab = block.outputConnection ? Blockly.BlockSvg.TAB_WIDTH : 0;
        var blockXY = block.getRelativeToSurfaceXY();
        block.flyoutRect_.setAttribute('x',
            this.RTL ? blockXY.x - blockHW.width + tab : blockXY.x - tab);
        // For hat blocks we want to shift them down by the hat height
        // since the y coordinate is the corner, not the top of the hat.
        var hatOffset =
            block.startHat_ ? Blockly.BlockSvg.START_HAT_HEIGHT : 0;
        if (hatOffset) {
          block.moveBy(0, hatOffset);
        }
        block.flyoutRect_.setAttribute('y', blockXY.y);
      }
    }
    // Record the width for .getMetrics_ and .position.
    this.width_ = flyoutWidth;
    // Call this since it is possible the trash and zoom buttons need
    // to move. e.g. on a bottom positioned flyout when zoom is clicked.
    this.targetWorkspace_.resize();
  }
};

/**
 * Reflow blocks and their buttons.
 */
Blockly.Flyout.prototype.reflow = function() {
  if (this.reflowWrapper_) {
    this.workspace_.removeChangeListener(this.reflowWrapper_);
  }
  var blocks = this.workspace_.getTopBlocks(false);
  if (this.horizontalLayout_) {
    this.reflowHorizontal(blocks);
  } else {
    this.reflowVertical(blocks);
  }
  if (this.reflowWrapper_) {
    this.workspace_.addChangeListener(this.reflowWrapper_);
  }
};
