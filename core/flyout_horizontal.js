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
 * @fileoverview Horizontal flyout tray containing blocks which may be created.
 * @author fenichel@google.com (Rachel Fenichel)
 */
'use strict';

goog.provide('Blockly.HorizontalFlyout');

goog.require('Blockly.Block');
goog.require('Blockly.Events');
goog.require('Blockly.FlyoutButton');
goog.require('Blockly.Flyout');
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
Blockly.HorizontalFlyout = function(workspaceOptions) {
  workspaceOptions.getMetrics = this.getMetrics_.bind(this);
  workspaceOptions.setMetrics = this.setMetrics_.bind(this);

  Blockly.HorizontalFlyout.superClass_.constructor.call(this, workspaceOptions);
  /**
   * Flyout should be laid out horizontally.
   * @type {boolean}
   * @private
   */
  this.horizontalLayout_ = true;
};
goog.inherits(Blockly.HorizontalFlyout, Blockly.Flyout);

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
Blockly.HorizontalFlyout.prototype.getMetrics_ = function() {
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
  if (this.toolboxPosition_ == Blockly.TOOLBOX_AT_BOTTOM) {
    absoluteTop = 0;
  }
  var viewHeight = this.height_;
  if (this.toolboxPosition_ == Blockly.TOOLBOX_AT_TOP) {
    viewHeight -= this.SCROLLBAR_PADDING;
  }
  var viewWidth = this.width_ - 2 * this.SCROLLBAR_PADDING;

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
Blockly.HorizontalFlyout.prototype.setMetrics_ = function(xyRatio) {
  var metrics = this.getMetrics_();
  // This is a fix to an apparent race condition.
  if (!metrics) {
    return;
  }

  if (goog.isNumber(xyRatio.x)) {
    this.workspace_.scrollX = -metrics.contentWidth * xyRatio.x;
  }

  this.workspace_.translate(this.workspace_.scrollX + metrics.absoluteLeft,
      this.workspace_.scrollY + metrics.absoluteTop);
};

/**
 * Move the flyout to the edge of the workspace.
 */
Blockly.HorizontalFlyout.prototype.position = function() {
  if (!this.isVisible()) {
    return;
  }
  var targetWorkspaceMetrics = this.targetWorkspace_.getMetrics();
  if (!targetWorkspaceMetrics) {
    // Hidden components will return null.
    return;
  }
  // Record the width for Blockly.Flyout.getMetrics_.
  this.width_ = targetWorkspaceMetrics.viewWidth;

  var edgeWidth = targetWorkspaceMetrics.viewWidth - 2 * this.CORNER_RADIUS;
  var edgeHeight = this.height_ - this.CORNER_RADIUS;
  this.setBackgroundPath_(edgeWidth, edgeHeight);

  var x = targetWorkspaceMetrics.absoluteLeft;
  var y = targetWorkspaceMetrics.absoluteTop;
  if (this.toolboxPosition_ == Blockly.TOOLBOX_AT_BOTTOM) {
    y += (targetWorkspaceMetrics.viewHeight - this.height_);
  }
  this.positionAt_(this.width_, this.height_, x, y);
};

/**
 * Create and set the path for the visible boundaries of the flyout.
 * @param {number} width The width of the flyout, not including the
 *     rounded corners.
 * @param {number} height The height of the flyout, not including
 *     rounded corners.
 * @private
 */
Blockly.HorizontalFlyout.prototype.setBackgroundPath_ = function(width,
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
Blockly.HorizontalFlyout.prototype.scrollToStart = function() {
  this.scrollbar_.set(this.RTL ? Infinity : 0);
};

/**
 * Scroll the flyout.
 * @param {!Event} e Mouse wheel scroll event.
 * @private
 */
Blockly.HorizontalFlyout.prototype.wheel_ = function(e) {
  var delta = e.deltaX;

  if (delta) {
    if (goog.userAgent.GECKO) {
      // Firefox's deltas are a tenth that of Chrome/Safari.
      delta *= 10;
    }
    // TODO: #1093
    var metrics = this.getMetrics_();
    var pos = metrics.viewLeft + delta;
    var limit = metrics.contentWidth - metrics.viewWidth;
    pos = Math.min(pos, limit);
    pos = Math.max(pos, 0);
    this.scrollbar_.set(pos);
    // When the flyout moves from a wheel event, hide WidgetDiv.
    Blockly.WidgetDiv.hide();
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
Blockly.HorizontalFlyout.prototype.layout_ = function(contents, gaps) {
  this.workspace_.scale = this.targetWorkspace_.scale;
  var margin = this.MARGIN;
  var cursorX = this.RTL ? margin : margin + Blockly.BlockSvg.TAB_WIDTH;
  var cursorY = margin;
  if (this.RTL) {
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

      // Figure out where to place the block.
      var tab = block.outputConnection ? Blockly.BlockSvg.TAB_WIDTH : 0;
      if (this.RTL) {
        var moveX = cursorX + blockHW.width;
      } else {
        var moveX = cursorX + tab;
      }
      block.moveBy(moveX, cursorY);

      var rect = this.createRect_(block, moveX, cursorY, blockHW, i);
      cursorX += (blockHW.width + gaps[i]);

      this.addBlockListeners_(root, block, rect);
    } else if (item.type == 'button') {
      this.initFlyoutButton_(item.button, cursorX, cursorY);
      cursorX += (item.button.width + gaps[i]);
    }
  }
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
Blockly.HorizontalFlyout.prototype.isDragTowardWorkspace = function(
    currentDragDeltaXY) {
  var dx = currentDragDeltaXY.x;
  var dy = currentDragDeltaXY.y;
  // Direction goes from -180 to 180, with 0 toward the right and 90 on top.
  var dragDirection = Math.atan2(dy, dx) / Math.PI * 180;

  var range = this.dragAngleRange_;
  if (this.toolboxPosition_ == Blockly.TOOLBOX_AT_TOP) {
    // Horizontal at top.
    if (dragDirection < 90 + range && dragDirection > 90 - range) {
      return true;
    }
  } else {
    // Horizontal at bottom.
    if (dragDirection > -90 - range && dragDirection < -90 + range) {
      return true;
    }
  }
  return false;
};

/**
 * Copy a block from the flyout to the workspace and position it correctly.
 * @param {!Blockly.Block} originBlock The flyout block to copy..
 * @return {!Blockly.Block} The new block in the main workspace.
 * @private
 */
Blockly.HorizontalFlyout.prototype.placeNewBlock_ = function(originBlock) {
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
 * Return the deletion rectangle for this flyout in viewport coordinates.
 * @return {goog.math.Rect} Rectangle in which to delete.
 */
Blockly.HorizontalFlyout.prototype.getClientRect = function() {
  if (!this.svgGroup_) {
    return null;
  }

  var flyoutRect = this.svgGroup_.getBoundingClientRect();
  // BIG_NUM is offscreen padding so that blocks dragged beyond the shown flyout
  // area are still deleted.  Must be larger than the largest screen size,
  // but be smaller than half Number.MAX_SAFE_INTEGER (not available on IE).
  var BIG_NUM = 1000000000;
  var y = flyoutRect.top;
  var height = flyoutRect.height;

  if (this.toolboxPosition_ == Blockly.TOOLBOX_AT_TOP) {
    return new goog.math.Rect(-BIG_NUM, y - BIG_NUM, BIG_NUM * 2,
        BIG_NUM + height);
  } else if (this.toolboxPosition_ == Blockly.TOOLBOX_AT_BOTTOM) {
    return new goog.math.Rect(-BIG_NUM, y, BIG_NUM * 2,
        BIG_NUM + height);
  }
  // TODO: Else throw error (should never happen).
};

/**
 * Compute height of flyout.  Position button under each block.
 * For RTL: Lay out the blocks right-aligned.
 * @param {!Array<!Blockly.Block>} blocks The blocks to reflow.
 * @private
 */
Blockly.HorizontalFlyout.prototype.reflowInternal_ = function(blocks) {
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
      if (block.flyoutRect_) {
        this.moveRectToBlock_(block.flyoutRect_, block);
      }
    }
    // Record the height for .getMetrics_ and .position.
    this.height_ = flyoutHeight;
    // Call this since it is possible the trash and zoom buttons need
    // to move. e.g. on a bottom positioned flyout when zoom is clicked.
    this.targetWorkspace_.resize();
  }
};
