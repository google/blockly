/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Layout code for a vertical variant of the flyout.
 */
'use strict';

/**
 * Layout code for a vertical variant of the flyout.
 * @class
 */
goog.module('Blockly.VerticalFlyout');

const WidgetDiv = goog.require('Blockly.WidgetDiv');
const browserEvents = goog.require('Blockly.browserEvents');
const dropDownDiv = goog.require('Blockly.dropDownDiv');
const registry = goog.require('Blockly.registry');
const toolbox = goog.require('Blockly.utils.toolbox');
/* eslint-disable-next-line no-unused-vars */
const {Coordinate} = goog.requireType('Blockly.utils.Coordinate');
const {Flyout} = goog.require('Blockly.Flyout');
/* eslint-disable-next-line no-unused-vars */
const {Options} = goog.requireType('Blockly.Options');
const {Rect} = goog.require('Blockly.utils.Rect');
const {Scrollbar} = goog.require('Blockly.Scrollbar');
/** @suppress {extraRequire} */
goog.require('Blockly.Block');
/** @suppress {extraRequire} */
goog.require('Blockly.constants');


/**
 * Class for a flyout.
 * @extends {Flyout}
 * @alias Blockly.VerticalFlyout
 */
class VerticalFlyout extends Flyout {
  /**
   * @param {!Options} workspaceOptions Dictionary of options for the
   *     workspace.
   */
  constructor(workspaceOptions) {
    super(workspaceOptions);
  }

  /**
   * Sets the translation of the flyout to match the scrollbars.
   * @param {!{x:number,y:number}} xyRatio Contains a y property which is a
   *     float between 0 and 1 specifying the degree of scrolling and a similar
   *     x property.
   * @protected
   */
  setMetrics_(xyRatio) {
    if (!this.isVisible()) {
      return;
    }
    const metricsManager = this.workspace_.getMetricsManager();
    const scrollMetrics = metricsManager.getScrollMetrics();
    const viewMetrics = metricsManager.getViewMetrics();
    const absoluteMetrics = metricsManager.getAbsoluteMetrics();

    if (typeof xyRatio.y === 'number') {
      this.workspace_.scrollY =
          -(scrollMetrics.top +
            (scrollMetrics.height - viewMetrics.height) * xyRatio.y);
    }
    this.workspace_.translate(
        this.workspace_.scrollX + absoluteMetrics.left,
        this.workspace_.scrollY + absoluteMetrics.top);
  }

  /**
   * Calculates the x coordinate for the flyout position.
   * @return {number} X coordinate.
   */
  getX() {
    if (!this.isVisible()) {
      return 0;
    }
    const metricsManager = this.targetWorkspace.getMetricsManager();
    const absoluteMetrics = metricsManager.getAbsoluteMetrics();
    const viewMetrics = metricsManager.getViewMetrics();
    const toolboxMetrics = metricsManager.getToolboxMetrics();
    let x = 0;

    // If this flyout is not the trashcan flyout (e.g. toolbox or mutator).
    if (this.targetWorkspace.toolboxPosition === this.toolboxPosition_) {
      // If there is a category toolbox.
      if (this.targetWorkspace.getToolbox()) {
        if (this.toolboxPosition_ === toolbox.Position.LEFT) {
          x = toolboxMetrics.width;
        } else {
          x = viewMetrics.width - this.width_;
        }
        // Simple (flyout-only) toolbox.
      } else {
        if (this.toolboxPosition_ === toolbox.Position.LEFT) {
          x = 0;
        } else {
          // The simple flyout does not cover the workspace.
          x = viewMetrics.width;
        }
      }
      // Trashcan flyout is opposite the main flyout.
    } else {
      if (this.toolboxPosition_ === toolbox.Position.LEFT) {
        x = 0;
      } else {
        // Because the anchor point of the flyout is on the left, but we want
        // to align the right edge of the flyout with the right edge of the
        // blocklyDiv, we calculate the full width of the div minus the width
        // of the flyout.
        x = viewMetrics.width + absoluteMetrics.left - this.width_;
      }
    }

    return x;
  }

  /**
   * Calculates the y coordinate for the flyout position.
   * @return {number} Y coordinate.
   */
  getY() {
    // Y is always 0 since this is a vertical flyout.
    return 0;
  }

  /**
   * Move the flyout to the edge of the workspace.
   */
  position() {
    if (!this.isVisible() || !this.targetWorkspace.isVisible()) {
      return;
    }
    const metricsManager = this.targetWorkspace.getMetricsManager();
    const targetWorkspaceViewMetrics = metricsManager.getViewMetrics();

    // Record the height for workspace metrics.
    this.height_ = targetWorkspaceViewMetrics.height;

    const edgeWidth = this.width_ - this.CORNER_RADIUS;
    const edgeHeight =
        targetWorkspaceViewMetrics.height - 2 * this.CORNER_RADIUS;
    this.setBackgroundPath_(edgeWidth, edgeHeight);

    const x = this.getX();
    const y = this.getY();

    this.positionAt_(this.width_, this.height_, x, y);
  }

  /**
   * Create and set the path for the visible boundaries of the flyout.
   * @param {number} width The width of the flyout, not including the
   *     rounded corners.
   * @param {number} height The height of the flyout, not including
   *     rounded corners.
   * @private
   */
  setBackgroundPath_(width, height) {
    const atRight = this.toolboxPosition_ === toolbox.Position.RIGHT;
    const totalWidth = width + this.CORNER_RADIUS;

    // Decide whether to start on the left or right.
    const path = ['M ' + (atRight ? totalWidth : 0) + ',0'];
    // Top.
    path.push('h', atRight ? -width : width);
    // Rounded corner.
    path.push(
        'a', this.CORNER_RADIUS, this.CORNER_RADIUS, 0, 0, atRight ? 0 : 1,
        atRight ? -this.CORNER_RADIUS : this.CORNER_RADIUS, this.CORNER_RADIUS);
    // Side closest to workspace.
    path.push('v', Math.max(0, height));
    // Rounded corner.
    path.push(
        'a', this.CORNER_RADIUS, this.CORNER_RADIUS, 0, 0, atRight ? 0 : 1,
        atRight ? this.CORNER_RADIUS : -this.CORNER_RADIUS, this.CORNER_RADIUS);
    // Bottom.
    path.push('h', atRight ? width : -width);
    path.push('z');
    this.svgBackground_.setAttribute('d', path.join(' '));
  }

  /**
   * Scroll the flyout to the top.
   */
  scrollToStart() {
    this.workspace_.scrollbar.setY(0);
  }

  /**
   * Scroll the flyout.
   * @param {!Event} e Mouse wheel scroll event.
   * @protected
   */
  wheel_(e) {
    const scrollDelta = browserEvents.getScrollDeltaPixels(e);

    if (scrollDelta.y) {
      const metricsManager = this.workspace_.getMetricsManager();
      const scrollMetrics = metricsManager.getScrollMetrics();
      const viewMetrics = metricsManager.getViewMetrics();
      const pos = (viewMetrics.top - scrollMetrics.top) + scrollDelta.y;

      this.workspace_.scrollbar.setY(pos);
      // When the flyout moves from a wheel event, hide WidgetDiv and
      // dropDownDiv.
      WidgetDiv.hide();
      dropDownDiv.hideWithoutAnimation();
    }

    // Don't scroll the page.
    e.preventDefault();
    // Don't propagate mousewheel event (zooming).
    e.stopPropagation();
  }

  /**
   * Lay out the blocks in the flyout.
   * @param {!Array<!Object>} contents The blocks and buttons to lay out.
   * @param {!Array<number>} gaps The visible gaps between blocks.
   * @protected
   */
  layout_(contents, gaps) {
    this.workspace_.scale = this.targetWorkspace.scale;
    const margin = this.MARGIN;
    const cursorX = this.RTL ? margin : margin + this.tabWidth_;
    let cursorY = margin;

    for (let i = 0, item; (item = contents[i]); i++) {
      if (item.type === 'block') {
        const block = item.block;
        const allBlocks = block.getDescendants(false);
        for (let j = 0, child; (child = allBlocks[j]); j++) {
          // Mark blocks as being inside a flyout.  This is used to detect and
          // prevent the closure of the flyout if the user right-clicks on such
          // a block.
          child.isInFlyout = true;
        }
        block.render();
        const root = block.getSvgRoot();
        const blockHW = block.getHeightWidth();
        const moveX =
            block.outputConnection ? cursorX - this.tabWidth_ : cursorX;
        block.moveBy(moveX, cursorY);

        const rect = this.createRect_(
            block, this.RTL ? moveX - blockHW.width : moveX, cursorY, blockHW,
            i);

        this.addBlockListeners_(root, block, rect);

        cursorY += blockHW.height + gaps[i];
      } else if (item.type === 'button') {
        this.initFlyoutButton_(item.button, cursorX, cursorY);
        cursorY += item.button.height + gaps[i];
      }
    }
  }

  /**
   * Determine if a drag delta is toward the workspace, based on the position
   * and orientation of the flyout. This is used in determineDragIntention_ to
   * determine if a new block should be created or if the flyout should scroll.
   * @param {!Coordinate} currentDragDeltaXY How far the pointer has
   *     moved from the position at mouse down, in pixel units.
   * @return {boolean} True if the drag is toward the workspace.
   * @package
   */
  isDragTowardWorkspace(currentDragDeltaXY) {
    const dx = currentDragDeltaXY.x;
    const dy = currentDragDeltaXY.y;
    // Direction goes from -180 to 180, with 0 toward the right and 90 on top.
    const dragDirection = Math.atan2(dy, dx) / Math.PI * 180;

    const range = this.dragAngleRange_;
    // Check for left or right dragging.
    if ((dragDirection < range && dragDirection > -range) ||
        (dragDirection < -180 + range || dragDirection > 180 - range)) {
      return true;
    }
    return false;
  }

  /**
   * Returns the bounding rectangle of the drag target area in pixel units
   * relative to viewport.
   * @return {?Rect} The component's bounding box. Null if drag
   *   target area should be ignored.
   */
  getClientRect() {
    if (!this.svgGroup_ || this.autoClose || !this.isVisible()) {
      // The bounding rectangle won't compute correctly if the flyout is closed
      // and auto-close flyouts aren't valid drag targets (or delete areas).
      return null;
    }

    const flyoutRect = this.svgGroup_.getBoundingClientRect();
    // BIG_NUM is offscreen padding so that blocks dragged beyond the shown
    // flyout area are still deleted.  Must be larger than the largest screen
    // size, but be smaller than half Number.MAX_SAFE_INTEGER (not available on
    // IE).
    const BIG_NUM = 1000000000;
    const left = flyoutRect.left;

    if (this.toolboxPosition_ === toolbox.Position.LEFT) {
      const width = flyoutRect.width;
      return new Rect(-BIG_NUM, BIG_NUM, -BIG_NUM, left + width);
    } else {  // Right
      return new Rect(-BIG_NUM, BIG_NUM, left, BIG_NUM);
    }
  }

  /**
   * Compute width of flyout.  toolbox.Position mat under each block.
   * For RTL: Lay out the blocks and buttons to be right-aligned.
   * @protected
   */
  reflowInternal_() {
    this.workspace_.scale = this.getFlyoutScale();
    let flyoutWidth = 0;
    const blocks = this.workspace_.getTopBlocks(false);
    for (let i = 0, block; (block = blocks[i]); i++) {
      let width = block.getHeightWidth().width;
      if (block.outputConnection) {
        width -= this.tabWidth_;
      }
      flyoutWidth = Math.max(flyoutWidth, width);
    }
    for (let i = 0, button; (button = this.buttons_[i]); i++) {
      flyoutWidth = Math.max(flyoutWidth, button.width);
    }
    flyoutWidth += this.MARGIN * 1.5 + this.tabWidth_;
    flyoutWidth *= this.workspace_.scale;
    flyoutWidth += Scrollbar.scrollbarThickness;

    if (this.width_ !== flyoutWidth) {
      for (let i = 0, block; (block = blocks[i]); i++) {
        if (this.RTL) {
          // With the flyoutWidth known, right-align the blocks.
          const oldX = block.getRelativeToSurfaceXY().x;
          let newX = flyoutWidth / this.workspace_.scale - this.MARGIN;
          if (!block.outputConnection) {
            newX -= this.tabWidth_;
          }
          block.moveBy(newX - oldX, 0);
        }
        if (this.rectMap_.has(block)) {
          this.moveRectToBlock_(this.rectMap_.get(block), block);
        }
      }
      if (this.RTL) {
        // With the flyoutWidth known, right-align the buttons.
        for (let i = 0, button; (button = this.buttons_[i]); i++) {
          const y = button.getPosition().y;
          const x = flyoutWidth / this.workspace_.scale - button.width -
              this.MARGIN - this.tabWidth_;
          button.moveTo(x, y);
        }
      }

      if (this.targetWorkspace.toolboxPosition === this.toolboxPosition_ &&
          this.toolboxPosition_ === toolbox.Position.LEFT &&
          !this.targetWorkspace.getToolbox()) {
        // This flyout is a simple toolbox. Reposition the workspace so that
        // (0,0) is in the correct position relative to the new absolute edge
        // (ie toolbox edge).
        this.targetWorkspace.translate(
            this.targetWorkspace.scrollX + flyoutWidth,
            this.targetWorkspace.scrollY);
      }

      // Record the width for workspace metrics and .position.
      this.width_ = flyoutWidth;
      this.position();
      this.targetWorkspace.recordDragTargets();
    }
  }
}

/**
 * The name of the vertical flyout in the registry.
 * @type {string}
 */
VerticalFlyout.registryName = 'verticalFlyout';

registry.register(
    registry.Type.FLYOUTS_VERTICAL_TOOLBOX, registry.DEFAULT, VerticalFlyout);

exports.VerticalFlyout = VerticalFlyout;
