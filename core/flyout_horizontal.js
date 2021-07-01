/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Horizontal flyout tray containing blocks which may be created.
 * @author fenichel@google.com (Rachel Fenichel)
 */
'use strict';

goog.provide('Blockly.HorizontalFlyout');

/** @suppress {extraRequire} */
goog.require('Blockly.Block');
/** @suppress {extraRequire} */
goog.require('Blockly.constants');
goog.require('Blockly.DropDownDiv');
goog.require('Blockly.Flyout');
goog.require('Blockly.registry');
goog.require('Blockly.Scrollbar');
goog.require('Blockly.utils');
goog.require('Blockly.utils.object');
goog.require('Blockly.utils.Rect');
goog.require('Blockly.utils.toolbox');
goog.require('Blockly.WidgetDiv');

goog.requireType('Blockly.Options');
goog.requireType('Blockly.utils.Coordinate');


/**
 * Class for a flyout.
 * @param {!Blockly.Options} workspaceOptions Dictionary of options for the
 *     workspace.
 * @extends {Blockly.Flyout}
 * @constructor
 */
Blockly.HorizontalFlyout = function(workspaceOptions) {
  Blockly.HorizontalFlyout.superClass_.constructor.call(this, workspaceOptions);
  this.horizontalLayout = true;
};
Blockly.utils.object.inherits(Blockly.HorizontalFlyout, Blockly.Flyout);

/**
 * Sets the translation of the flyout to match the scrollbars.
 * @param {!{x:number,y:number}} xyRatio Contains a y property which is a float
 *     between 0 and 1 specifying the degree of scrolling and a
 *     similar x property.
 * @protected
 */
Blockly.HorizontalFlyout.prototype.setMetrics_ = function(xyRatio) {
  if (!this.isVisible()) {
    return;
  }

  var metricsManager = this.workspace_.getMetricsManager();
  var scrollMetrics = metricsManager.getScrollMetrics();
  var viewMetrics = metricsManager.getViewMetrics();
  var absoluteMetrics = metricsManager.getAbsoluteMetrics();

  if (typeof xyRatio.x == 'number') {
    this.workspace_.scrollX =
        -(scrollMetrics.left +
            (scrollMetrics.width - viewMetrics.width) * xyRatio.x);
  }

  this.workspace_.translate(this.workspace_.scrollX + absoluteMetrics.left,
      this.workspace_.scrollY + absoluteMetrics.top);
};

/**
 * Calculates the x coordinate for the flyout position.
 * @return {number} X coordinate.
 */
Blockly.HorizontalFlyout.prototype.getX = function() {
  // X is always 0 since this is a horizontal flyout.
  return 0;
};

/**
 * Calculates the y coordinate for the flyout position.
 * @return {number} Y coordinate.
 */
Blockly.HorizontalFlyout.prototype.getY = function() {
  if (!this.isVisible()) {
    return 0;
  }
  var metricsManager = this.targetWorkspace.getMetricsManager();
  var absoluteMetrics = metricsManager.getAbsoluteMetrics();
  var viewMetrics = metricsManager.getViewMetrics();
  var toolboxMetrics = metricsManager.getToolboxMetrics();

  var y = 0;
  var atTop = this.toolboxPosition_ == Blockly.utils.toolbox.Position.TOP;
  // If this flyout is not the trashcan flyout (e.g. toolbox or mutator).
  if (this.targetWorkspace.toolboxPosition == this.toolboxPosition_) {
    // If there is a category toolbox.
    if (this.targetWorkspace.getToolbox()) {
      if (atTop) {
        y = toolboxMetrics.height;
      } else {
        y = viewMetrics.height - this.height_;
      }
      // Simple (flyout-only) toolbox.
    } else {
      if (atTop) {
        y = 0;
      } else {
        // The simple flyout does not cover the workspace.
        y = viewMetrics.height;
      }
    }
    // Trashcan flyout is opposite the main flyout.
  } else {
    if (atTop) {
      y = 0;
    } else {
      // Because the anchor point of the flyout is on the top, but we want
      // to align the bottom edge of the flyout with the bottom edge of the
      // blocklyDiv, we calculate the full height of the div minus the height
      // of the flyout.
      y = viewMetrics.height + absoluteMetrics.top - this.height_;
    }
  }

  return y;
};

/**
 * Move the flyout to the edge of the workspace.
 */
Blockly.HorizontalFlyout.prototype.position = function() {
  if (!this.isVisible() || !this.targetWorkspace.isVisible()) {
    return;
  }
  var metricsManager = this.targetWorkspace.getMetricsManager();
  var targetWorkspaceViewMetrics = metricsManager.getViewMetrics();

  // Record the width for workspace metrics.
  this.width_ = targetWorkspaceViewMetrics.width;

  var edgeWidth = targetWorkspaceViewMetrics.width - 2 * this.CORNER_RADIUS;
  var edgeHeight = this.height_ - this.CORNER_RADIUS;
  this.setBackgroundPath_(edgeWidth, edgeHeight);

  var x = this.getX();
  var y = this.getY();

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
Blockly.HorizontalFlyout.prototype.setBackgroundPath_ = function(
    width, height) {
  var atTop = this.toolboxPosition_ == Blockly.utils.toolbox.Position.TOP;
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
    path.push('h', -width);
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
  this.workspace_.scrollbar.setX(this.RTL ? Infinity : 0);
};

/**
 * Scroll the flyout.
 * @param {!Event} e Mouse wheel scroll event.
 * @protected
 */
Blockly.HorizontalFlyout.prototype.wheel_ = function(e) {
  var scrollDelta = Blockly.utils.getScrollDeltaPixels(e);
  var delta = scrollDelta.x || scrollDelta.y;

  if (delta) {
    var metricsManager = this.workspace_.getMetricsManager();
    var scrollMetrics = metricsManager.getScrollMetrics();
    var viewMetrics = metricsManager.getViewMetrics();

    var pos = (viewMetrics.left - scrollMetrics.left) + delta;
    this.workspace_.scrollbar.setX(pos);
    // When the flyout moves from a wheel event, hide WidgetDiv and DropDownDiv.
    Blockly.WidgetDiv.hide();
    Blockly.DropDownDiv.hideWithoutAnimation();
  }

  // Don't scroll the page.
  e.preventDefault();
  // Don't propagate mousewheel event (zooming).
  e.stopPropagation();
};

/**
 * Lay out the blocks in the flyout.
 * @param {!Array<!Object>} contents The blocks and buttons to lay out.
 * @param {!Array<number>} gaps The visible gaps between blocks.
 * @protected
 */
Blockly.HorizontalFlyout.prototype.layout_ = function(contents, gaps) {
  this.workspace_.scale = this.targetWorkspace.scale;
  var margin = this.MARGIN;
  var cursorX = margin + this.tabWidth_;
  var cursorY = margin;
  if (this.RTL) {
    contents = contents.reverse();
  }

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

      // Figure out where to place the block.
      var tab = block.outputConnection ? this.tabWidth_ : 0;
      if (this.RTL) {
        var moveX = cursorX + blockHW.width;
      } else {
        var moveX = cursorX - tab;
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
 * @param {!Blockly.utils.Coordinate} currentDragDeltaXY How far the pointer has
 *     moved from the position at mouse down, in pixel units.
 * @return {boolean} True if the drag is toward the workspace.
 * @package
 */
Blockly.HorizontalFlyout.prototype.isDragTowardWorkspace = function(
    currentDragDeltaXY) {
  var dx = currentDragDeltaXY.x;
  var dy = currentDragDeltaXY.y;
  // Direction goes from -180 to 180, with 0 toward the right and 90 on top.
  var dragDirection = Math.atan2(dy, dx) / Math.PI * 180;

  var range = this.dragAngleRange_;
  // Check for up or down dragging.
  if ((dragDirection < 90 + range && dragDirection > 90 - range) ||
      (dragDirection > -90 - range && dragDirection < -90 + range)) {
    return true;
  }
  return false;
};

/**
 * Returns the bounding rectangle of the drag target area in pixel units
 * relative to viewport.
 * @return {?Blockly.utils.Rect} The component's bounding box. Null if drag
 *   target area should be ignored.
 */
Blockly.HorizontalFlyout.prototype.getClientRect = function() {
  if (!this.svgGroup_ || this.autoClose || !this.isVisible()) {
    // The bounding rectangle won't compute correctly if the flyout is closed
    // and auto-close flyouts aren't valid drag targets (or delete areas).
    return null;
  }

  var flyoutRect = this.svgGroup_.getBoundingClientRect();
  // BIG_NUM is offscreen padding so that blocks dragged beyond the shown flyout
  // area are still deleted.  Must be larger than the largest screen size,
  // but be smaller than half Number.MAX_SAFE_INTEGER (not available on IE).
  var BIG_NUM = 1000000000;
  var top = flyoutRect.top;

  if (this.toolboxPosition_ == Blockly.utils.toolbox.Position.TOP) {
    var height = flyoutRect.height;
    return new Blockly.utils.Rect(-BIG_NUM, top + height, -BIG_NUM, BIG_NUM);
  } else {  // Bottom.
    return new Blockly.utils.Rect(top, BIG_NUM, -BIG_NUM, BIG_NUM);
  }
};

/**
 * Compute height of flyout.  Position mat under each block.
 * For RTL: Lay out the blocks right-aligned.
 * @protected
 */
Blockly.HorizontalFlyout.prototype.reflowInternal_ = function() {
  this.workspace_.scale = this.getFlyoutScale();
  var flyoutHeight = 0;
  var blocks = this.workspace_.getTopBlocks(false);
  for (var i = 0, block; (block = blocks[i]); i++) {
    flyoutHeight = Math.max(flyoutHeight, block.getHeightWidth().height);
  }
  flyoutHeight += this.MARGIN * 1.5;
  flyoutHeight *= this.workspace_.scale;
  flyoutHeight += Blockly.Scrollbar.scrollbarThickness;

  if (this.height_ != flyoutHeight) {
    for (var i = 0, block; (block = blocks[i]); i++) {
      if (block.flyoutRect_) {
        this.moveRectToBlock_(block.flyoutRect_, block);
      }
    }

    if (this.targetWorkspace.toolboxPosition == this.toolboxPosition_ &&
        this.toolboxPosition_ == Blockly.utils.toolbox.Position.TOP &&
        !this.targetWorkspace.getToolbox()) {
      // This flyout is a simple toolbox. Reposition the workspace so that (0,0)
      // is in the correct position relative to the new absolute edge (ie
      // toolbox edge).
      this.targetWorkspace.translate(
          this.targetWorkspace.scrollX, this.targetWorkspace.scrollY + flyoutHeight);
    }

    // Record the height for workspace metrics and .position.
    this.height_ = flyoutHeight;
    this.position();
    this.targetWorkspace.recordDragTargets();
  }
};

Blockly.registry.register(Blockly.registry.Type.FLYOUTS_HORIZONTAL_TOOLBOX,
    Blockly.registry.DEFAULT, Blockly.HorizontalFlyout);
