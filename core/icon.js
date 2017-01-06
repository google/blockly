/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2013 Google Inc.
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
 * @fileoverview Object representing an icon on a block.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Blockly.Icon');

goog.require('goog.dom');
goog.require('goog.math.Coordinate');


/**
 * Class for an icon.
 * @param {Blockly.Block} block The block associated with this icon.
 * @constructor
 */
Blockly.Icon = function(block) {
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
 * @private
 */
Blockly.Icon.prototype.bubble_ = null;

/**
 * Absolute coordinate of icon's center.
 * @type {goog.math.Coordinate}
 * @private
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
  this.iconGroup_ = Blockly.utils.createSvgElement('g',
      {'class': 'blocklyIconGroup'}, null);
  if (this.block_.isInFlyout) {
    Blockly.utils.addClass(/** @type {!Element} */ (this.iconGroup_),
                      'blocklyIconGroupReadonly');
  }
  this.drawIcon_(this.iconGroup_);

  this.block_.getSvgRoot().appendChild(this.iconGroup_);
  Blockly.bindEventWithChecks_(this.iconGroup_, 'mouseup', this,
      this.iconClick_);
  this.updateEditable();
};

/**
 * Dispose of this icon.
 */
Blockly.Icon.prototype.dispose = function() {
  // Dispose of and unlink the icon.
  goog.dom.removeNode(this.iconGroup_);
  this.iconGroup_ = null;
  // Dispose of and unlink the bubble.
  this.setVisible(false);
  this.block_ = null;
};

/**
 * Add or remove the UI indicating if this icon may be clicked or not.
 */
Blockly.Icon.prototype.updateEditable = function() {
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
 * @private
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
Blockly.Icon.prototype.updateColour = function() {
  if (this.isVisible()) {
    this.bubble_.setColour(this.block_.getColour());
  }
};

/**
 * Render the icon.
 * @param {number} cursorX Horizontal offset at which to position the icon.
 * @return {number} Horizontal offset for next item to draw.
 */
Blockly.Icon.prototype.renderIcon = function(cursorX) {
  if (this.collapseHidden && this.block_.isCollapsed()) {
    this.iconGroup_.setAttribute('display', 'none');
    return cursorX;
  }
  this.iconGroup_.setAttribute('display', 'block');

  var TOP_MARGIN = 5;
  var width = this.SIZE;
  if (this.block_.RTL) {
    cursorX -= width;
  }
  this.iconGroup_.setAttribute('transform',
      'translate(' + cursorX + ',' + TOP_MARGIN + ')');
  this.computeIconLocation();
  if (this.block_.RTL) {
    cursorX -= Blockly.BlockSvg.SEP_SPACE_X;
  } else {
    cursorX += width + Blockly.BlockSvg.SEP_SPACE_X;
  }
  return cursorX;
};

/**
 * Notification that the icon has moved.  Update the arrow accordingly.
 * @param {!goog.math.Coordinate} xy Absolute location.
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
  var newXY = new goog.math.Coordinate(
      blockXY.x + iconXY.x + this.SIZE / 2,
      blockXY.y + iconXY.y + this.SIZE / 2);
  if (!goog.math.Coordinate.equals(this.getIconLocation(), newXY)) {
    this.setIconLocation(newXY);
  }
};

/**
 * Returns the center of the block's icon relative to the surface.
 * @return {!goog.math.Coordinate} Object with x and y properties.
 */
Blockly.Icon.prototype.getIconLocation = function() {
  return this.iconXY_;
};
