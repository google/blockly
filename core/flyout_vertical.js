/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2017 Google Inc.
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
 * @fileoverview Layout code for a vertical variant of the flyout.
 * @author fenichel@google.com (Rachel Fenichel)
 */
'use strict';

goog.provide('Blockly.VerticalFlyout');

goog.require('Blockly.Block');
goog.require('Blockly.Comment');
goog.require('Blockly.Events');
goog.require('Blockly.Flyout');
goog.require('Blockly.FlyoutButton');
goog.require('Blockly.utils');
goog.require('Blockly.WorkspaceSvg');
goog.require('goog.dom');
goog.require('goog.events');
goog.require('goog.math.Rect');
goog.require('goog.userAgent');


/**
 * Class for a flyout.
 * @param {!Object} workspaceOptions Dictionary of options for the workspace.
 * @extends {Blockly.Flyout}
 * @constructor
 */
Blockly.VerticalFlyout = function(workspaceOptions) {
  // TODO: FIX
  workspaceOptions.getMetrics = this.getMetrics_.bind(this);
  workspaceOptions.setMetrics = this.setMetrics_.bind(this);

  Blockly.VerticalFlyout.superClass_.constructor.call(this, workspaceOptions);
  /**
   * Flyout should be laid out horizontally vs vertically.
   * @type {boolean}
   * @private
   */
  this.horizontalLayout_ = false;
};
goog.inherits(Blockly.VerticalFlyout, Blockly.Flyout);

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
Blockly.VerticalFlyout.prototype.getMetrics_ = function() {
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

  // Padding for the end of the scrollbar.
  var absoluteTop = this.SCROLLBAR_PADDING;
  var absoluteLeft = 0;

  var viewHeight = this.height_ - 2 * this.SCROLLBAR_PADDING;
  var viewWidth = this.width_;
  if (!this.RTL) {
    viewWidth -= this.SCROLLBAR_PADDING;
  }

  var metrics = {
    viewHeight: viewHeight,
    viewWidth: viewWidth,
    contentHeight: optionBox.height * this.workspace_.scale + 2 * this.MARGIN,
    contentWidth: optionBox.width * this.workspace_.scale + 2 * this.MARGIN,
    viewTop: -this.workspace_.scrollY + optionBox.y,
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
Blockly.VerticalFlyout.prototype.setMetrics_ = function(xyRatio) {
  var metrics = this.getMetrics_();
  // This is a fix to an apparent race condition.
  if (!metrics) {
    return;
  }
  if (goog.isNumber(xyRatio.y)) {
    this.workspace_.scrollY = -metrics.contentHeight * xyRatio.y;
  }
  this.workspace_.translate(this.workspace_.scrollX + metrics.absoluteLeft,
      this.workspace_.scrollY + metrics.absoluteTop);
};

/**
 * Move the flyout to the edge of the workspace.
 */
Blockly.VerticalFlyout.prototype.position = function() {
  if (!this.isVisible()) {
    return;
  }
  var targetWorkspaceMetrics = this.targetWorkspace_.getMetrics();
  if (!targetWorkspaceMetrics) {
    // Hidden components will return null.
    return;
  }

  var edgeWidth = this.width_ - this.CORNER_RADIUS;
  var edgeHeight = targetWorkspaceMetrics.viewHeight - 2 * this.CORNER_RADIUS;

  this.setBackgroundPath_(edgeWidth, edgeHeight);

  var x = targetWorkspaceMetrics.absoluteLeft;
  if (this.toolboxPosition_ == Blockly.TOOLBOX_AT_RIGHT) {
    x += targetWorkspaceMetrics.viewWidth;
    x -= this.width_;
  }

  var y = targetWorkspaceMetrics.absoluteTop;

  // Record the height for Blockly.Flyout.getMetrics_
  this.height_ = targetWorkspaceMetrics.viewHeight;

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
  // TODO: Do we still need this?
  // The blocks need to be visible in order to be laid out and measured
  // correctly, but we don't want the flyout to show up until it's properly
  // sized.  Opacity is set to zero in show().
  this.svgGroup_.style.opacity = 1;
};

/**
 * Create and set the path for the visible boundaries of the flyout.
 * @param {number} width The width of the flyout, not including the
 *     rounded corners.
 * @param {number} height The height of the flyout, not including
 *     rounded corners.
 * @private
 */
Blockly.VerticalFlyout.prototype.setBackgroundPath_ = function(width, height) {
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
 * Scroll the flyout to the top.
 */
Blockly.VerticalFlyout.prototype.scrollToStart = function() {
  this.scrollbar_.set(0);
};

/**
 * Scroll the flyout.
 * @param {!Event} e Mouse wheel scroll event.
 * @private
 */
Blockly.VerticalFlyout.prototype.wheel_ = function(e) {
  var delta = e.deltaY;

  if (delta) {
    if (goog.userAgent.GECKO) {
      // Firefox's deltas are a tenth that of Chrome/Safari.
      delta *= 10;
    }
    var metrics = this.getMetrics_();
    var pos = metrics.viewTop + delta;
    var limit = metrics.contentHeight - metrics.viewHeight;
    pos = Math.min(pos, limit);
    pos = Math.max(pos, 0);
    this.scrollbar_.set(pos);
    // When the flyout moves from a wheel event, hide WidgetDiv.
    Blockly.WidgetDiv.hide(true);
  }

  // Don't scroll the page.
  e.preventDefault();
  // Don't propagate mousewheel event (zooming).
  e.stopPropagation();
};

/**
 * Lay out the blocks in the flyout.
 * @param {!Array.<!Object>} contents The blocks and buttons to lay out.
 * @param {!Array.<number>} gaps The visible gaps between blocks.
 * @private
 */
Blockly.VerticalFlyout.prototype.layout_ = function(contents, gaps) {
  this.workspace_.scale = this.targetWorkspace_.scale;
  var margin = this.MARGIN;
  var cursorX = this.RTL ? margin : margin + Blockly.BlockSvg.TAB_WIDTH;
  var cursorY = margin;

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
      block.moveBy(cursorX, cursorY);

      var rect = this.createRect_(block,
          this.RTL ? cursorX - blockHW.width : cursorX, cursorY, blockHW, i);

      this.addBlockListeners_(root, block, rect);

      cursorY += blockHW.height + gaps[i];
    } else if (item.type == 'button') {
      // TODO: Move some of this to flyout_base
      var button = item.button;
      var buttonSvg = button.createDom();
      button.moveTo(cursorX, cursorY);
      button.show();
      // Clicking on a flyout button or label is a lot like clicking on the
      // flyout background.
      this.listeners_.push(Blockly.bindEventWithChecks_(buttonSvg, 'mousedown',
           this, this.onMouseDown_));

      this.buttons_.push(button);
      cursorY += button.height + gaps[i];
    }
  }
};

/**
 * Create and place a rectangle corresponding to the given block.
 * @param {!Blockly.Block} block The block to associate the rect to.
 * @param {number} x The x position of the cursor during this layout pass.
 * @param {number} y The y position of the cursor during this layout pass.
 * @param {!{height: number, width: number}} blockHW The height and width of the
 *     block.
 * @param {number} index The index into the background buttons list where this
 *     rect should be placed.
 * @return {!SVGElement} Newly created SVG element for the rectangle behind the
 *     block.
 * @private
 */
Blockly.VerticalFlyout.prototype.createRect_ = function(block, x, y,
    blockHW, index) {
  // TODO: Move into flyout_base
  // Create an invisible rectangle under the block to act as a button.  Just
  // using the block as a button is poor, since blocks have holes in them.
  var rect = Blockly.utils.createSvgElement('rect',
    {
      'fill-opacity': 0,
      'x': x,
      'y': y,
      'height': blockHW.height,
      'width': blockHW.width
    }, null);
  rect.tooltip = block;
  Blockly.Tooltip.bindMouseEvents(rect);
  // Add the rectangles under the blocks, so that the blocks' tooltips work.
  this.workspace_.getCanvas().insertBefore(rect, block.getSvgRoot());

  block.flyoutRect_ = rect;
  this.backgroundButtons_[index] = rect;
  return rect;
};

/**
 * Determine if a drag delta is toward the workspace, based on the position
 * and orientation of the flyout. This is used in determineDragIntention_ to
 * determine if a new block should be created or if the flyout should scroll.
 * @param {!goog.math.Coordinate} currentDragDeltaXY How far the pointer has
 *     moved from the position at mouse down, in pixel units.
 * @return {boolean} true if the drag is toward the workspace.
 * @package
 */
Blockly.VerticalFlyout.prototype.isDragTowardWorkspace = function(
    currentDragDeltaXY) {
  var dx = currentDragDeltaXY.x;
  var dy = currentDragDeltaXY.y;
  // Direction goes from -180 to 180, with 0 toward the right and 90 on top.
  var dragDirection = Math.atan2(dy, dx) / Math.PI * 180;

  var range = this.dragAngleRange_;
  if (this.toolboxPosition_ == Blockly.TOOLBOX_AT_LEFT) {
    // Vertical at left.
    if (dragDirection < range && dragDirection > -range) {
      return true;
    }
  } else {
    // Vertical at right.
    if (dragDirection < -180 + range || dragDirection > 180 - range) {
      return true;
    }
  }
  return false;
};

/**
 * Copy a block from the flyout to the workspace and position it correctly.
 * @param {!Blockly.Block} originBlock The flyout block to copy.
 * @return {!Blockly.Block} The new block in the main workspace.
 * @private
 */
Blockly.VerticalFlyout.prototype.placeNewBlock_ = function(originBlock) {
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

  var targetMetrics = targetWorkspace.getMetrics();

  // If the flyout is on the right side, (0, 0) in the flyout is offset to
  // the right of (0, 0) in the main workspace.  Add an offset to take that
  // into account.
  var scrollX = 0;
  if (this.toolboxPosition_ == Blockly.TOOLBOX_AT_RIGHT) {
    scrollX = targetMetrics.viewWidth - this.width_;
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
 * Return the deletion rectangle for this flyout in viewport coordinates.
 * @return {goog.math.Rect} Rectangle in which to delete.
 */
Blockly.VerticalFlyout.prototype.getClientRect = function() {
  if (!this.svgGroup_) {
    return null;
  }

  var flyoutRect = this.svgGroup_.getBoundingClientRect();
  // BIG_NUM is offscreen padding so that blocks dragged beyond the shown flyout
  // area are still deleted.  Must be larger than the largest screen size,
  // but be smaller than half Number.MAX_SAFE_INTEGER (not available on IE).
  var BIG_NUM = 1000000000;
  var x = flyoutRect.left;
  var width = flyoutRect.width;

  if (this.toolboxPosition_ == Blockly.TOOLBOX_AT_LEFT) {
    return new goog.math.Rect(x - BIG_NUM, -BIG_NUM, BIG_NUM + width,
        BIG_NUM * 2);
  } else {  // Right
    return new goog.math.Rect(x, -BIG_NUM, BIG_NUM + width, BIG_NUM * 2);
  }
};

/**
 * Compute width of flyout.  Position button under each block.
 * For RTL: Lay out the blocks right-aligned.
 * @param {!Array<!Blockly.Block>} blocks The blocks to reflow.
 */
Blockly.VerticalFlyout.prototype.reflowInternal_ = function(blocks) {
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
        // TOOD: There may be an off-by-a-tab here, and the rectangle may be
        // the wrong size in some cases.
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
