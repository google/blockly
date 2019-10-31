/**
 * @license
 * Copyright 2017 Google LLC
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
goog.require('Blockly.Flyout');
goog.require('Blockly.Scrollbar');
goog.require('Blockly.utils');
goog.require('Blockly.utils.object');
goog.require('Blockly.utils.Rect');
goog.require('Blockly.utils.userAgent');
goog.require('Blockly.WidgetDiv');


/**
 * Class for a flyout.
 * @param {!Blockly.Options} workspaceOptions Dictionary of options for the
 *     workspace.
 * @extends {Blockly.Flyout}
 * @constructor
 */
Blockly.VerticalFlyout = function(workspaceOptions) {
  workspaceOptions.getMetrics = /** @type {function():!Object} */ (
    this.getMetrics_.bind(this));
  workspaceOptions.setMetrics = this.setMetrics_.bind(this);

  Blockly.VerticalFlyout.superClass_.constructor.call(this, workspaceOptions);
  /**
   * Flyout should be laid out vertically.
   * @type {boolean}
   * @private
   */
  this.horizontalLayout_ = false;
};
Blockly.utils.object.inherits(Blockly.VerticalFlyout, Blockly.Flyout);

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
  if (typeof xyRatio.y == 'number') {
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
  // Record the height for Blockly.Flyout.getMetrics_
  this.height_ = targetWorkspaceMetrics.viewHeight;

  var edgeWidth = this.width_ - this.CORNER_RADIUS;
  var edgeHeight = targetWorkspaceMetrics.viewHeight - 2 * this.CORNER_RADIUS;
  this.setBackgroundPath_(edgeWidth, edgeHeight);

  // Y is always 0 since this is a vertical flyout.
  var y = 0;
  // If this flyout is the toolbox flyout.
  if (this.targetWorkspace_.toolboxPosition == this.toolboxPosition_) {
    // If there is a category toolbox.
    if (targetWorkspaceMetrics.toolboxWidth) {
      if (this.toolboxPosition_ == Blockly.TOOLBOX_AT_LEFT) {
        var x = targetWorkspaceMetrics.toolboxWidth;
      } else {
        var x = targetWorkspaceMetrics.viewWidth - this.width_;
      }
    } else {
      if (this.toolboxPosition_ == Blockly.TOOLBOX_AT_LEFT) {
        var x = 0;
      } else {
        var x = targetWorkspaceMetrics.viewWidth;
      }
    }
  } else {
    if (this.toolboxPosition_ == Blockly.TOOLBOX_AT_LEFT) {
      var x = 0;
    } else {
      // Because the anchor point of the flyout is on the left, but we want
      // to align the right edge of the flyout with the right edge of the
      // blocklyDiv, we calculate the full width of the div minus the width
      // of the flyout.
      var x = targetWorkspaceMetrics.viewWidth +
          targetWorkspaceMetrics.absoluteLeft - this.width_;
    }
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
  path.push('h', atRight ? width : -width);
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
  var scrollDelta = Blockly.utils.getScrollDeltaPixels(e);

  if (scrollDelta.y) {
    var metrics = this.getMetrics_();
    var pos = (metrics.viewTop - metrics.contentTop) + scrollDelta.y;
    var limit = metrics.contentHeight - metrics.viewHeight;
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
Blockly.VerticalFlyout.prototype.layout_ = function(contents, gaps) {
  this.workspace_.scale = this.targetWorkspace_.scale;
  var margin = this.MARGIN;
  var cursorX = this.RTL ? margin : margin + this.tabWidth_;
  var cursorY = margin;

  for (var i = 0, item; (item = contents[i]); i++) {
    if (item.type == 'block') {
      var block = item.block;
      var allBlocks = block.getDescendants(false);
      for (var j = 0, child; (child = allBlocks[j]); j++) {
        // Mark blocks as being inside a flyout.  This is used to detect and
        // prevent the closure of the flyout if the user right-clicks on such a
        // block.
        child.isInFlyout = true;
      }
      block.render();
      var root = block.getSvgRoot();
      var blockHW = block.getHeightWidth();
      var moveX = block.outputConnection ? cursorX - this.tabWidth_ : cursorX;
      block.moveBy(moveX, cursorY);

      var rect = this.createRect_(block,
          this.RTL ? moveX - blockHW.width : moveX, cursorY, blockHW, i);

      this.addBlockListeners_(root, block, rect);

      cursorY += blockHW.height + gaps[i];
    } else if (item.type == 'button') {
      this.initFlyoutButton_(item.button, cursorX, cursorY);
      cursorY += item.button.height + gaps[i];
    }
  }
};

/**
 * Determine if a drag delta is toward the workspace, based on the position
 * and orientation of the flyout. This is used in determineDragIntention_ to
 * determine if a new block should be created or if the flyout should scroll.
 * @param {!Blockly.utils.Coordinate} currentDragDeltaXY How far the pointer has
 *     moved from the position at mouse down, in pixel units.
 * @return {boolean} True if the drag is toward the workspace.
 * @package
 */
Blockly.VerticalFlyout.prototype.isDragTowardWorkspace = function(
    currentDragDeltaXY) {
  var dx = currentDragDeltaXY.x;
  var dy = currentDragDeltaXY.y;
  // Direction goes from -180 to 180, with 0 toward the right and 90 on top.
  var dragDirection = Math.atan2(dy, dx) / Math.PI * 180;

  var range = this.dragAngleRange_;
  // Check for left or right dragging.
  if ((dragDirection < range && dragDirection > -range) ||
      (dragDirection < -180 + range || dragDirection > 180 - range)) {
    return true;
  }
  return false;
};

/**
 * Return the deletion rectangle for this flyout in viewport coordinates.
 * @return {Blockly.utils.Rect} Rectangle in which to delete.
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
  var left = flyoutRect.left;

  if (this.toolboxPosition_ == Blockly.TOOLBOX_AT_LEFT) {
    var width = flyoutRect.width;
    return new Blockly.utils.Rect(-BIG_NUM, BIG_NUM, -BIG_NUM, left + width);
  } else {  // Right
    return new Blockly.utils.Rect(-BIG_NUM, BIG_NUM, left, BIG_NUM);
  }
};

/**
 * Compute width of flyout.  Position mat under each block.
 * For RTL: Lay out the blocks and buttons to be right-aligned.
 * @private
 */
Blockly.VerticalFlyout.prototype.reflowInternal_ = function() {
  this.workspace_.scale = this.targetWorkspace_.scale;
  var flyoutWidth = 0;
  var blocks = this.workspace_.getTopBlocks(false);
  for (var i = 0, block; (block = blocks[i]); i++) {
    var width = block.getHeightWidth().width;
    if (block.outputConnection) {
      width -= this.tabWidth_;
    }
    flyoutWidth = Math.max(flyoutWidth, width);
  }
  for (var i = 0, button; (button = this.buttons_[i]); i++) {
    flyoutWidth = Math.max(flyoutWidth, button.width);
  }
  flyoutWidth += this.MARGIN * 1.5 + this.tabWidth_;
  flyoutWidth *= this.workspace_.scale;
  flyoutWidth += Blockly.Scrollbar.scrollbarThickness;

  if (this.width_ != flyoutWidth) {
    for (var i = 0, block; (block = blocks[i]); i++) {
      if (this.RTL) {
        // With the flyoutWidth known, right-align the blocks.
        var oldX = block.getRelativeToSurfaceXY().x;
        var newX = flyoutWidth / this.workspace_.scale - this.MARGIN;
        if (!block.outputConnection) {
          newX -= this.tabWidth_;
        }
        block.moveBy(newX - oldX, 0);
      }
      if (block.flyoutRect_) {
        this.moveRectToBlock_(block.flyoutRect_, block);
      }
    }
    if (this.RTL) {
      // With the flyoutWidth known, right-align the buttons.
      for (var i = 0, button; (button = this.buttons_[i]); i++) {
        var y = button.getPosition().y;
        var x = flyoutWidth / this.workspace_.scale - button.width -
            this.MARGIN - this.tabWidth_;
        button.moveTo(x, y);
      }
    }
    // Record the width for .getMetrics_ and .position.
    this.width_ = flyoutWidth;
    this.position();
  }
};
