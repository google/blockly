/**
 * @license
 * Copyright 2012 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Object representing a warning.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Blockly.Warning');

goog.require('Blockly.Bubble');
goog.require('Blockly.Events');
/** @suppress {extraRequire} */
goog.require('Blockly.Events.BubbleOpen');
goog.require('Blockly.Icon');
goog.require('Blockly.utils.dom');
goog.require('Blockly.utils.object');
goog.require('Blockly.utils.Svg');

goog.requireType('Blockly.Block');
goog.requireType('Blockly.BlockSvg');
goog.requireType('Blockly.utils.Coordinate');


/**
 * Class for a warning.
 * @param {!Blockly.Block} block The block associated with this warning.
 * @extends {Blockly.Icon}
 * @constructor
 */
Blockly.Warning = function(block) {
  Blockly.Warning.superClass_.constructor.call(this, block);
  this.createIcon();
  // The text_ object can contain multiple warnings.
  this.text_ = Object.create(null);
};
Blockly.utils.object.inherits(Blockly.Warning, Blockly.Icon);

/**
 * Does this icon get hidden when the block is collapsed.
 */
Blockly.Warning.prototype.collapseHidden = false;

/**
 * Draw the warning icon.
 * @param {!Element} group The icon group.
 * @protected
 */
Blockly.Warning.prototype.drawIcon_ = function(group) {
  // Triangle with rounded corners.
  Blockly.utils.dom.createSvgElement(
      Blockly.utils.Svg.PATH,
      {
        'class': 'blocklyIconShape',
        'd': 'M2,15Q-1,15 0.5,12L6.5,1.7Q8,-1 9.5,1.7L15.5,12Q17,15 14,15z'
      },
      group);
  // Can't use a real '!' text character since different browsers and operating
  // systems render it differently.
  // Body of exclamation point.
  Blockly.utils.dom.createSvgElement(
      Blockly.utils.Svg.PATH,
      {
        'class': 'blocklyIconSymbol',
        'd': 'm7,4.8v3.16l0.27,2.27h1.46l0.27,-2.27v-3.16z'
      },
      group);
  // Dot of exclamation point.
  Blockly.utils.dom.createSvgElement(
      Blockly.utils.Svg.RECT,
      {
        'class': 'blocklyIconSymbol',
        'x': '7', 'y': '11', 'height': '2', 'width': '2'
      },
      group);
};

/**
 * Show or hide the warning bubble.
 * @param {boolean} visible True if the bubble should be visible.
 */
Blockly.Warning.prototype.setVisible = function(visible) {
  if (visible == this.isVisible()) {
    return;
  }
  Blockly.Events.fire(new (Blockly.Events.get(Blockly.Events.BUBBLE_OPEN))(
      this.block_, visible, 'warning'));
  if (visible) {
    this.createBubble_();
  } else {
    this.disposeBubble_();
  }
};

/**
 * Show the bubble.
 * @private
 */
Blockly.Warning.prototype.createBubble_ = function() {
  this.paragraphElement_ = Blockly.Bubble.textToDom(this.getText());
  this.bubble_ = Blockly.Bubble.createNonEditableBubble(
      this.paragraphElement_, /** @type {!Blockly.BlockSvg} */ (this.block_),
      /** @type {!Blockly.utils.Coordinate} */ (this.iconXY_));
  this.applyColour();
};

/**
 * Dispose of the bubble and references to it.
 * @private
 */
Blockly.Warning.prototype.disposeBubble_ = function() {
  this.bubble_.dispose();
  this.bubble_ = null;
  this.paragraphElement_ = null;
};

/**
 * Set this warning's text.
 * @param {string} text Warning text (or '' to delete). This supports
 *    linebreaks.
 * @param {string} id An ID for this text entry to be able to maintain
 *     multiple warnings.
 */
Blockly.Warning.prototype.setText = function(text, id) {
  if (this.text_[id] == text) {
    return;
  }
  if (text) {
    this.text_[id] = text;
  } else {
    delete this.text_[id];
  }
  if (this.isVisible()) {
    this.setVisible(false);
    this.setVisible(true);
  }
};

/**
 * Get this warning's texts.
 * @return {string} All texts concatenated into one string.
 */
Blockly.Warning.prototype.getText = function() {
  var allWarnings = [];
  for (var id in this.text_) {
    allWarnings.push(this.text_[id]);
  }
  return allWarnings.join('\n');
};

/**
 * Dispose of this warning.
 */
Blockly.Warning.prototype.dispose = function() {
  this.block_.warning = null;
  Blockly.Icon.prototype.dispose.call(this);
};
