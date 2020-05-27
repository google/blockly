/**
 * @license
 * Copyright 2013 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Object representing an icon on a block.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Blockly.Icon');

goog.require('Blockly.utils');
goog.require('Blockly.utils.Coordinate');
goog.require('Blockly.utils.dom');
goog.require('Blockly.utils.Size');


/**
 * Class for an icon.
 * @param {Blockly.BlockSvg} block The block associated with this icon.
 * @constructor
 */
Blockly.Icon = function(block) {
  /**
   * The block this icon is attached to.
   * @type {Blockly.BlockSvg}
   * @protected
   */
  this.block_ = block;
};

/**
 * Does this icon get hidden when the block is collapsed.
 */
Blockly.Icon.prototype.collapseHidden = true;

/**
 * Height and width of icons.
 */
Blockly.Icon.prototype.SIZE = 17;

/**
 * Bubble UI (if visible).
 * @type {Blockly.Bubble}
 * @protected
 */
Blockly.Icon.prototype.bubble_ = null;

/**
 * Absolute coordinate of icon's center.
 * @type {Blockly.utils.Coordinate}
 * @protected
 */
Blockly.Icon.prototype.iconXY_ = null;

/**
 * Create the icon on the block.
 */
Blockly.Icon.prototype.createIcon = function() {
  if (this.iconGroup_) {
    // Icon already exists.
    return;
  }
  /* Here's the markup that will be generated:
  <g class="blocklyIconGroup">
    ...
  </g>
  */
  this.iconGroup_ = Blockly.utils.dom.createSvgElement('g',
      {'class': 'blocklyIconGroup'}, null);
  if (this.block_.isInFlyout) {
    Blockly.utils.dom.addClass(
        /** @type {!Element} */ (this.iconGroup_), 'blocklyIconGroupReadonly');
  }
  this.drawIcon_(this.iconGroup_);

  this.block_.getSvgRoot().appendChild(this.iconGroup_);
  Blockly.bindEventWithChecks_(
      this.iconGroup_, 'mouseup', this, this.iconClick_);
  this.updateEditable();
};

/**
 * Dispose of this icon.
 */
Blockly.Icon.prototype.dispose = function() {
  // Dispose of and unlink the icon.
  Blockly.utils.dom.removeNode(this.iconGroup_);
  this.iconGroup_ = null;
  // Dispose of and unlink the bubble.
  this.setVisible(false);
  this.block_ = null;
};

/**
 * Add or remove the UI indicating if this icon may be clicked or not.
 */
Blockly.Icon.prototype.updateEditable = function() {
  // No-op on the base class.
};

/**
 * Is the associated bubble visible?
 * @return {boolean} True if the bubble is visible.
 */
Blockly.Icon.prototype.isVisible = function() {
  return !!this.bubble_;
};

/**
 * Clicking on the icon toggles if the bubble is visible.
 * @param {!Event} e Mouse click event.
 * @protected
 */
Blockly.Icon.prototype.iconClick_ = function(e) {
  if (this.block_.workspace.isDragging()) {
    // Drag operation is concluding.  Don't open the editor.
    return;
  }
  if (!this.block_.isInFlyout && !Blockly.utils.isRightButton(e)) {
    this.setVisible(!this.isVisible());
  }
};

/**
 * Change the colour of the associated bubble to match its block.
 */
Blockly.Icon.prototype.applyColour = function() {
  if (this.isVisible()) {
    this.bubble_.setColour(this.block_.style.colourPrimary);
  }
};

/**
 * Notification that the icon has moved.  Update the arrow accordingly.
 * @param {!Blockly.utils.Coordinate} xy Absolute location in workspace coordinates.
 */
Blockly.Icon.prototype.setIconLocation = function(xy) {
  this.iconXY_ = xy;
  if (this.isVisible()) {
    this.bubble_.setAnchorLocation(xy);
  }
};

/**
 * Notification that the icon has moved, but we don't really know where.
 * Recompute the icon's location from scratch.
 */
Blockly.Icon.prototype.computeIconLocation = function() {
  // Find coordinates for the centre of the icon and update the arrow.
  var blockXY = this.block_.getRelativeToSurfaceXY();
  var iconXY = Blockly.utils.getRelativeXY(this.iconGroup_);
  var newXY = new Blockly.utils.Coordinate(
      blockXY.x + iconXY.x + this.SIZE / 2,
      blockXY.y + iconXY.y + this.SIZE / 2);
  if (!Blockly.utils.Coordinate.equals(this.getIconLocation(), newXY)) {
    this.setIconLocation(newXY);
  }
};

/**
 * Returns the center of the block's icon relative to the surface.
 * @return {Blockly.utils.Coordinate} Object with x and y properties in
 *     workspace coordinates.
 */
Blockly.Icon.prototype.getIconLocation = function() {
  return this.iconXY_;
};

/**
 * Get the size of the icon as used for rendering.
 * This differs from the actual size of the icon, because it bulges slightly
 * out of its row rather than increasing the height of its row.
 * @return {!Blockly.utils.Size} Height and width.
 */
// TODO (#2562): Remove getCorrectedSize.
Blockly.Icon.prototype.getCorrectedSize = function() {
  return new Blockly.utils.Size(
      Blockly.Icon.prototype.SIZE, Blockly.Icon.prototype.SIZE - 2);
};
