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
};

/**
 * Does the flyout automatically close when a block is created?
 * @type {boolean}
 */
Blockly.Flyout.prototype.autoClose = true;

/**
 * Corner radius of the flyout background.
 * @type {number}
 * @const
 */
Blockly.Flyout.prototype.CORNER_RADIUS = 8;

/**
 * Margin around the edges of the blocks in the flyout.
 * @type {number}
 * @const
 */
Blockly.Flyout.prototype.MARGIN = Blockly.Flyout.prototype.CORNER_RADIUS;

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
 * Creates the flyout's DOM.  Only needs to be called once.
 * @return {!Element} The flyout's SVG group.
 */
Blockly.Flyout.prototype.createDom = function() {
  /*
  <g>
    <path class="blocklyFlyoutBackground"/>
    <g class="blocklyFlyout"></g>
  </g>
  */
  this.svgGroup_ = Blockly.createSvgElement('g',
      {'class': 'blocklyFlyout'}, null);
  this.svgBackground_ = Blockly.createSvgElement('path',
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
      this.horizontalLayout_, false);

  this.hide();

  Array.prototype.push.apply(this.eventWrappers_,
      Blockly.bindEvent_(this.svgGroup_, 'wheel', this, this.wheel_));
  if (!this.autoClose) {
    this.filterWrapper_ = this.filterForCapacity_.bind(this);
    this.targetWorkspace_.addChangeListener(this.filterWrapper_);
  }
  // Dragging the flyout up and down.
  Array.prototype.push.apply(this.eventWrappers_,
      Blockly.bindEvent_(this.svgGroup_, 'mousedown', this, this.onMouseDown_));
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
      viewHeight += this.MARGIN - this.SCROLLBAR_PADDING;
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
    contentTop: 0, // TODO: #349
    contentLeft: 0, // TODO: #349
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
  var metrics = this.targetWorkspace_.getMetrics();
  if (!metrics) {
    // Hidden components will return null.
    return;
  }
  var edgeWidth = this.horizontalLayout_ ? metrics.viewWidth : this.width_;
  edgeWidth -= this.CORNER_RADIUS;
  if (this.toolboxPosition_ == Blockly.TOOLBOX_AT_RIGHT) {
    edgeWidth *= -1;
  }

  this.setBackgroundPath_(edgeWidth,
      this.horizontalLayout_ ? this.height_ : metrics.viewHeight);

  var x = metrics.absoluteLeft;
  if (this.toolboxPosition_ == Blockly.TOOLBOX_AT_RIGHT) {
    x += metrics.viewWidth;
    x -= this.width_;
  }

  var y = metrics.absoluteTop;
  if (this.toolboxPosition_ == Blockly.TOOLBOX_AT_BOTTOM) {
    y += metrics.viewHeight;
    y -= this.height_;
  }

  this.svgGroup_.setAttribute('transform', 'translate(' + x + ',' + y + ')');

  // Record the height for Blockly.Flyout.getMetrics_, or width if the layout is
  // horizontal.
  if (this.horizontalLayout_) {
    this.width_ = metrics.viewWidth;
  } else {
    this.height_ = metrics.viewHeight;
  }

  // Update the scrollbar (if one exists).
  if (this.scrollbar_) {
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
  // Decide whether to start on the left or right.
  var path = ['M ' + (atRight ? this.width_ : 0) + ',0'];
  // Top.
  path.push('h', width);
  // Rounded corner.
  path.push('a', this.CORNER_RADIUS, this.CORNER_RADIUS, 0, 0,
      atRight ? 0 : 1,
      atRight ? -this.CORNER_RADIUS : this.CORNER_RADIUS,
      this.CORNER_RADIUS);
  // Side closest to workspace.
  path.push('v', Math.max(0, height - this.CORNER_RADIUS * 2));
  // Rounded corner.
  path.push('a', this.CORNER_RADIUS, this.CORNER_RADIUS, 0, 0,
      atRight ? 0 : 1,
      atRight ? this.CORNER_RADIUS : -this.CORNER_RADIUS,
      this.CORNER_RADIUS);
  // Bottom.
  path.push('h', -width);
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
Blockly.Flyout.prototype.setBackgroundPathHorizontal_ =
    function(width, height) {
  var atTop = this.toolboxPosition_ == Blockly.TOOLBOX_AT_TOP;
  // Start at top left.
  var path = ['M 0,' + (atTop ? 0 : this.CORNER_RADIUS)];

  if (atTop) {
    // Top.
    path.push('h', width + this.CORNER_RADIUS);
    // Right.
    path.push('v', height);
    // Bottom.
    path.push('a', this.CORNER_RADIUS, this.CORNER_RADIUS, 0, 0, 1,
        -this.CORNER_RADIUS, this.CORNER_RADIUS);
    path.push('h', -1 * (width - this.CORNER_RADIUS));
    // Left.
    path.push('a', this.CORNER_RADIUS, this.CORNER_RADIUS, 0, 0, 1,
        -this.CORNER_RADIUS, -this.CORNER_RADIUS);
    path.push('z');
  } else {
    // Top.
    path.push('a', this.CORNER_RADIUS, this.CORNER_RADIUS, 0, 0, 1,
        this.CORNER_RADIUS, -this.CORNER_RADIUS);
    path.push('h', width - this.CORNER_RADIUS);
     // Right.
    path.push('a', this.CORNER_RADIUS, this.CORNER_RADIUS, 0, 0, 1,
        this.CORNER_RADIUS, this.CORNER_RADIUS);
    path.push('v', height - this.CORNER_RADIUS);
    // Bottom.
    path.push('h', -width - this.CORNER_RADIUS);
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
  return this.svgGroup_ && this.svgGroup_.style.display == 'block';
};

/**
 * Hide and empty the flyout.
 */
Blockly.Flyout.prototype.hide = function() {
  if (!this.isVisible()) {
    return;
  }
  this.svgGroup_.style.display = 'none';
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
  this.hide();
  this.clearOldBlocks_();

  if (xmlList == Blockly.Variables.NAME_TYPE) {
    // Special category for variables.
    xmlList =
        Blockly.Variables.flyoutCategory(this.workspace_.targetWorkspace);
  } else if (xmlList == Blockly.Procedures.NAME_TYPE) {
    // Special category for procedures.
    xmlList =
        Blockly.Procedures.flyoutCategory(this.workspace_.targetWorkspace);
  }

  this.svgGroup_.style.display = 'block';
  // Create the blocks to be shown in this flyout.
  var blocks = [];
  var gaps = [];
  this.permanentlyDisabled_.length = 0;
  for (var i = 0, xml; xml = xmlList[i]; i++) {
    if (xml.tagName && xml.tagName.toUpperCase() == 'BLOCK') {
      var curBlock = Blockly.Xml.domToBlock(xml, this.workspace_);
      if (curBlock.disabled) {
        // Record blocks that were initially disabled.
        // Do not enable these blocks as a result of capacity filtering.
        this.permanentlyDisabled_.push(curBlock);
      }
      blocks.push(curBlock);
      var gap = parseInt(xml.getAttribute('gap'), 10);
      gaps.push(isNaN(gap) ? this.MARGIN * 3 : gap);
    }
  }

  this.layoutBlocks_(blocks, gaps);

  // IE 11 is an incompetant browser that fails to fire mouseout events.
  // When the mouse is over the background, deselect all blocks.
  var deselectAll = function(e) {
    var topBlocks = this.workspace_.getTopBlocks(false);
    for (var i = 0, block; block = topBlocks[i]; i++) {
      block.removeSelect();
    }
  };
  this.listeners_.push(Blockly.bindEvent_(this.svgBackground_, 'mouseover',
      this, deselectAll));

  if (this.horizontalLayout_) {
    this.height_ = 0;
  } else {
    this.width_ = 0;
  }
  this.reflow();

  this.offsetHorizontalRtlBlocks(this.workspace_.getTopBlocks(false));
  this.filterForCapacity_();

  // Fire a resize event to update the flyout's scrollbar.
  Blockly.svgResize(this.workspace_);
  this.reflowWrapper_ = this.reflow.bind(this);
  this.workspace_.addChangeListener(this.reflowWrapper_);
};

/**
 * Lay out the blocks in the flyout.
 * @param {!Array.<!Blockly.BlockSvg>} blocks The blocks to lay out.
 * @param {!Array.<number>} gaps The visible gaps between blocks.
 * @private
 */
Blockly.Flyout.prototype.layoutBlocks_ = function(blocks, gaps) {
  var margin = this.MARGIN * this.workspace_.scale;
  var cursorX = this.RTL ? margin : margin + Blockly.BlockSvg.TAB_WIDTH;
  var cursorY = margin;
  for (var i = 0, block; block = blocks[i]; i++) {
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
    block.moveBy((this.horizontalLayout_ && this.RTL) ? -cursorX : cursorX,
        cursorY);
    if (this.horizontalLayout_) {
      cursorX += (blockHW.width + gaps[i] - tab);
    } else {
      cursorY += blockHW.height + gaps[i];
    }

    // Create an invisible rectangle under the block to act as a button.  Just
    // using the block as a button is poor, since blocks have holes in them.
    var rect = Blockly.createSvgElement('rect', {'fill-opacity': 0}, null);
    rect.tooltip = block;
    Blockly.Tooltip.bindMouseEvents(rect);
    // Add the rectangles under the blocks, so that the blocks' tooltips work.
    this.workspace_.getCanvas().insertBefore(rect, block.getSvgRoot());
    block.flyoutRect_ = rect;
    this.buttons_[i] = rect;

    this.addBlockListeners_(root, block, rect);
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
  for (var j = 0, rect; rect = this.buttons_[j]; j++) {
    goog.dom.removeNode(rect);
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
  if (this.autoClose) {
    this.listeners_.push(Blockly.bindEvent_(root, 'mousedown', null,
        this.createBlockFunc_(block)));
    this.listeners_.push(Blockly.bindEvent_(rect, 'mousedown', null,
        this.createBlockFunc_(block)));
  } else {
    this.listeners_.push(Blockly.bindEvent_(root, 'mousedown', null,
        this.blockMouseDown_(block)));
    this.listeners_.push(Blockly.bindEvent_(rect, 'mousedown', null,
        this.blockMouseDown_(block)));
  }
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
 * Handle a mouse-down on an SVG block in a non-closing flyout.
 * @param {!Blockly.Block} block The flyout block to copy.
 * @return {!Function} Function to call when block is clicked.
 * @private
 */
Blockly.Flyout.prototype.blockMouseDown_ = function(block) {
  var flyout = this;
  return function(e) {
    Blockly.terminateDrag_();
    Blockly.hideChaff();
    if (Blockly.isRightButton(e)) {
      // Right-click.
      block.showContextMenu_(e);
    } else {
      // Left-click (or middle click)
      Blockly.Css.setCursor(Blockly.Css.Cursor.CLOSED);
      // Record the current mouse position.
      Blockly.Flyout.startDownEvent_ = e;
      Blockly.Flyout.startBlock_ = block;
      Blockly.Flyout.startFlyout_ = flyout;
      Blockly.Flyout.onMouseUpWrapper_ = Blockly.bindEvent_(document,
          'mouseup', this, flyout.onMouseUp_);
      Blockly.Flyout.onMouseMoveBlockWrapper_ = Blockly.bindEvent_(document,
          'mousemove', this, flyout.onMouseMoveBlock_);
    }
    // This event has been handled.  No need to bubble up to the document.
    e.stopPropagation();
  };
};

/**
 * Mouse down on the flyout background.  Start a vertical scroll drag.
 * @param {!Event} e Mouse down event.
 * @private
 */
Blockly.Flyout.prototype.onMouseDown_ = function(e) {
  if (Blockly.isRightButton(e)) {
    return;
  }
  Blockly.hideChaff(true);
  Blockly.Flyout.terminateDrag_();
  this.startDragMouseY_ = e.clientY;
  this.startDragMouseX_ = e.clientX;
  Blockly.Flyout.onMouseMoveWrapper_ = Blockly.bindEvent_(document, 'mousemove',
      this, this.onMouseMove_);
  Blockly.Flyout.onMouseUpWrapper_ = Blockly.bindEvent_(document, 'mouseup',
      this, Blockly.Flyout.terminateDrag_);
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
  if (Blockly.dragMode_ != Blockly.DRAG_FREE &&
      !Blockly.WidgetDiv.isVisible()) {
    Blockly.Events.fire(
        new Blockly.Events.Ui(Blockly.Flyout.startBlock_, 'click',
                              undefined, undefined));
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
     but this shouldn't be noticable. */
    e.stopPropagation();
    return;
  }
  var dx = e.clientX - Blockly.Flyout.startDownEvent_.clientX;
  var dy = e.clientY - Blockly.Flyout.startDownEvent_.clientY;
  // Still dragging within the sticky DRAG_RADIUS.
  if (Math.sqrt(dx * dx + dy * dy) > Blockly.DRAG_RADIUS) {
    // Create the block.
    Blockly.Flyout.startFlyout_.createBlockFunc_(Blockly.Flyout.startBlock_)(
        Blockly.Flyout.startDownEvent_);
  }
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
    if (Blockly.isRightButton(e)) {
      // Right-click.  Don't create a block, let the context menu show.
      return;
    }
    if (originBlock.disabled) {
      // Beyond capacity.
      return;
    }
    Blockly.Events.disable();
    var block = flyout.placeNewBlock_(originBlock);
    Blockly.Events.enable();
    if (Blockly.Events.isEnabled()) {
      Blockly.Events.setGroup(true);
      Blockly.Events.fire(new Blockly.Events.Create(block));
    }
    if (flyout.autoClose) {
      flyout.hide();
    } else {
      flyout.filterForCapacity_();
    }
    // Start a dragging operation on the new block.
    block.onMouseDown_(e);
    Blockly.dragMode_ = Blockly.DRAG_FREE;
    block.setDragging_(true);
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
  var xyOld = Blockly.getSvgXY_(svgRootOld, targetWorkspace);
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
  var xyNew = Blockly.getSvgXY_(svgRootNew, targetWorkspace);
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
  if (Blockly.Flyout.onMouseUpWrapper_) {
    Blockly.unbindEvent_(Blockly.Flyout.onMouseUpWrapper_);
    Blockly.Flyout.onMouseUpWrapper_ = null;
  }
  Blockly.Flyout.startDownEvent_ = null;
  Blockly.Flyout.startBlock_ = null;
  Blockly.Flyout.startFlyout_ = null;
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
    Blockly.asyncSvgResize(this.workspace_);
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
  flyoutWidth += this.MARGIN * 1.5 + Blockly.BlockSvg.TAB_WIDTH;
  flyoutWidth *= this.workspace_.scale;
  flyoutWidth += Blockly.Scrollbar.scrollbarThickness;
  if (this.width_ != flyoutWidth) {
    for (var i = 0, block; block = blocks[i]; i++) {
      var blockHW = block.getHeightWidth();
      if (this.RTL) {
        // With the flyoutWidth known, right-align the blocks.
        var oldX = block.getRelativeToSurfaceXY().x;
        var dx = flyoutWidth - this.MARGIN;
        dx /= this.workspace_.scale;
        dx -= Blockly.BlockSvg.TAB_WIDTH;
        block.moveBy(dx - oldX, 0);
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
    Blockly.asyncSvgResize(this.workspace_);
  }
};

/**
 * Reflow blocks and their buttons.
 */
Blockly.Flyout.prototype.reflow = function() {
  var blocks = this.workspace_.getTopBlocks(false);
  if (this.horizontalLayout_) {
    this.reflowHorizontal(blocks);
  } else {
    this.reflowVertical(blocks);
  }
};

/**
 * In the horizontal RTL case all of the blocks will be laid out to the left of
 * the origin, but we won't know how big the workspace is until the layout pass
 * is done.
 * Now that it's done, shunt all the blocks to be right of the origin.
 * @param {!Array<!Blockly.Block>} blocks The blocks to reposition.
 */
Blockly.Flyout.prototype.offsetHorizontalRtlBlocks = function(blocks) {
  if (this.horizontalLayout_ && this.RTL) {
    // We don't know this workspace's view width yet.
    this.position();
    try {
      var optionBox = this.workspace_.getCanvas().getBBox();
    } catch (e) {
      // Firefox has trouble with hidden elements (Bug 528969).
      optionBox = {height: 0, y: 0, width: 0, x: 0};
    }

    var offset = Math.max(-optionBox.x + this.MARGIN,
        this.width_ / this.workspace_.scale);

    for (var i = 0, block; block = blocks[i]; i++) {
      block.moveBy(offset, 0);
      if (block.flyoutRect_) {
        block.flyoutRect_.setAttribute('x',
            offset + Number(block.flyoutRect_.getAttribute('x')));
      }
    }
  }
};
