/**
 * @license
 * Copyright 2013 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Object representing an icon on a block.
 */
'use strict';

/**
 * Object representing an icon on a block.
 * @class
 */
goog.module('Blockly.Icon');

const browserEvents = goog.require('Blockly.browserEvents');
const dom = goog.require('Blockly.utils.dom');
const svgMath = goog.require('Blockly.utils.svgMath');
/* eslint-disable-next-line no-unused-vars */
const {BlockSvg} = goog.requireType('Blockly.BlockSvg');
/* eslint-disable-next-line no-unused-vars */
const {Bubble} = goog.requireType('Blockly.Bubble');
const {Coordinate} = goog.require('Blockly.utils.Coordinate');
const {Size} = goog.require('Blockly.utils.Size');
const {Svg} = goog.require('Blockly.utils.Svg');


/**
 * Class for an icon.
 * @param {BlockSvg} block The block associated with this icon.
 * @constructor
 * @abstract
 * @alias Blockly.Icon
 */
const Icon = function(block) {
  /**
   * The block this icon is attached to.
   * @type {BlockSvg}
   * @protected
   */
  this.block_ = block;

  /**
   * The icon SVG group.
   * @type {?SVGGElement}
   */
  this.iconGroup_ = null;
};

/**
 * Does this icon get hidden when the block is collapsed.
 */
Icon.prototype.collapseHidden = true;

/**
 * Height and width of icons.
 * @const
 */
Icon.prototype.SIZE = 17;

/**
 * Bubble UI (if visible).
 * @type {?Bubble}
 * @protected
 */
Icon.prototype.bubble_ = null;

/**
 * Absolute coordinate of icon's center.
 * @type {?Coordinate}
 * @protected
 */
Icon.prototype.iconXY_ = null;

/**
 * Create the icon on the block.
 */
Icon.prototype.createIcon = function() {
  if (this.iconGroup_) {
    // Icon already exists.
    return;
  }
  /* Here's the markup that will be generated:
  <g class="blocklyIconGroup">
    ...
  </g>
  */
  this.iconGroup_ =
      dom.createSvgElement(Svg.G, {'class': 'blocklyIconGroup'}, null);
  if (this.block_.isInFlyout) {
    dom.addClass(
        /** @type {!Element} */ (this.iconGroup_), 'blocklyIconGroupReadonly');
  }
  this.drawIcon_(this.iconGroup_);

  this.block_.getSvgRoot().appendChild(this.iconGroup_);
  browserEvents.conditionalBind(
      this.iconGroup_, 'mouseup', this, this.iconClick_);
  this.updateEditable();
};

/**
 * Dispose of this icon.
 */
Icon.prototype.dispose = function() {
  // Dispose of and unlink the icon.
  dom.removeNode(this.iconGroup_);
  this.iconGroup_ = null;
  // Dispose of and unlink the bubble.
  this.setVisible(false);
  this.block_ = null;
};

/**
 * Add or remove the UI indicating if this icon may be clicked or not.
 */
Icon.prototype.updateEditable = function() {
  // No-op on the base class.
};

/**
 * Is the associated bubble visible?
 * @return {boolean} True if the bubble is visible.
 */
Icon.prototype.isVisible = function() {
  return !!this.bubble_;
};

/**
 * Clicking on the icon toggles if the bubble is visible.
 * @param {!Event} e Mouse click event.
 * @protected
 */
Icon.prototype.iconClick_ = function(e) {
  if (this.block_.workspace.isDragging()) {
    // Drag operation is concluding.  Don't open the editor.
    return;
  }
  if (!this.block_.isInFlyout && !browserEvents.isRightButton(e)) {
    this.setVisible(!this.isVisible());
  }
};

/**
 * Change the colour of the associated bubble to match its block.
 */
Icon.prototype.applyColour = function() {
  if (this.isVisible()) {
    this.bubble_.setColour(this.block_.style.colourPrimary);
  }
};

/**
 * Notification that the icon has moved.  Update the arrow accordingly.
 * @param {!Coordinate} xy Absolute location in workspace coordinates.
 */
Icon.prototype.setIconLocation = function(xy) {
  this.iconXY_ = xy;
  if (this.isVisible()) {
    this.bubble_.setAnchorLocation(xy);
  }
};

/**
 * Notification that the icon has moved, but we don't really know where.
 * Recompute the icon's location from scratch.
 */
Icon.prototype.computeIconLocation = function() {
  // Find coordinates for the centre of the icon and update the arrow.
  const blockXY = this.block_.getRelativeToSurfaceXY();
  const iconXY = svgMath.getRelativeXY(
      /** @type {!SVGElement} */ (this.iconGroup_));
  const newXY = new Coordinate(
      blockXY.x + iconXY.x + this.SIZE / 2,
      blockXY.y + iconXY.y + this.SIZE / 2);
  if (!Coordinate.equals(this.getIconLocation(), newXY)) {
    this.setIconLocation(newXY);
  }
};

/**
 * Returns the center of the block's icon relative to the surface.
 * @return {?Coordinate} Object with x and y properties in
 *     workspace coordinates.
 */
Icon.prototype.getIconLocation = function() {
  return this.iconXY_;
};

/**
 * Get the size of the icon as used for rendering.
 * This differs from the actual size of the icon, because it bulges slightly
 * out of its row rather than increasing the height of its row.
 * @return {!Size} Height and width.
 */
// TODO (#2562): Remove getCorrectedSize.
Icon.prototype.getCorrectedSize = function() {
  return new Size(Icon.prototype.SIZE, Icon.prototype.SIZE - 2);
};

/**
 * Draw the icon.
 * @param {!Element} group The icon group.
 * @protected
 */
Icon.prototype.drawIcon_;

/**
 * Show or hide the icon.
 * @param {boolean} visible True if the icon should be visible.
 */
Icon.prototype.setVisible;

exports.Icon = Icon;
