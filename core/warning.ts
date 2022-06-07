/**
 * @license
 * Copyright 2012 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Object representing a warning.
 */
'use strict';

/**
 * Object representing a warning.
 * @class
 */
goog.module('Blockly.Warning');

const dom = goog.require('Blockly.utils.dom');
const eventUtils = goog.require('Blockly.Events.utils');
/* eslint-disable-next-line no-unused-vars */
const {BlockSvg} = goog.requireType('Blockly.BlockSvg');
const {Bubble} = goog.require('Blockly.Bubble');
/* eslint-disable-next-line no-unused-vars */
const {Coordinate} = goog.requireType('Blockly.utils.Coordinate');
const {Icon} = goog.require('Blockly.Icon');
const {Svg} = goog.require('Blockly.utils.Svg');
/** @suppress {extraRequire} */
goog.require('Blockly.Events.BubbleOpen');


/**
 * Class for a warning.
 * @extends {Icon}
 * @alias Blockly.Warning
 */
class Warning extends Icon {
  /**
   * @param {!BlockSvg} block The block associated with this warning.
   */
  constructor(block) {
    super(block);
    this.createIcon();
    // The text_ object can contain multiple warnings.
    this.text_ = Object.create(null);

    /**
     * The top-level node of the warning text, or null if not created.
     * @type {?SVGTextElement}
     * @private
     */
    this.paragraphElement_ = null;

    /**
     * Does this icon get hidden when the block is collapsed?
     * @type {boolean}
     */
    this.collapseHidden = false;
  }

  /**
   * Draw the warning icon.
   * @param {!Element} group The icon group.
   * @protected
   */
  drawIcon_(group) {
    // Triangle with rounded corners.
    dom.createSvgElement(
        Svg.PATH, {
          'class': 'blocklyIconShape',
          'd': 'M2,15Q-1,15 0.5,12L6.5,1.7Q8,-1 9.5,1.7L15.5,12Q17,15 14,15z',
        },
        group);
    // Can't use a real '!' text character since different browsers and
    // operating systems render it differently. Body of exclamation point.
    dom.createSvgElement(
        Svg.PATH, {
          'class': 'blocklyIconSymbol',
          'd': 'm7,4.8v3.16l0.27,2.27h1.46l0.27,-2.27v-3.16z',
        },
        group);
    // Dot of exclamation point.
    dom.createSvgElement(
        Svg.RECT, {
          'class': 'blocklyIconSymbol',
          'x': '7',
          'y': '11',
          'height': '2',
          'width': '2',
        },
        group);
  }

  /**
   * Show or hide the warning bubble.
   * @param {boolean} visible True if the bubble should be visible.
   */
  setVisible(visible) {
    if (visible === this.isVisible()) {
      return;
    }
    eventUtils.fire(new (eventUtils.get(eventUtils.BUBBLE_OPEN))(
        this.block_, visible, 'warning'));
    if (visible) {
      this.createBubble_();
    } else {
      this.disposeBubble_();
    }
  }

  /**
   * Show the bubble.
   * @private
   */
  createBubble_() {
    this.paragraphElement_ = Bubble.textToDom(this.getText());
    this.bubble_ = Bubble.createNonEditableBubble(
        this.paragraphElement_, /** @type {!BlockSvg} */ (this.block_),
        /** @type {!Coordinate} */ (this.iconXY_));
    this.applyColour();
  }

  /**
   * Dispose of the bubble and references to it.
   * @private
   */
  disposeBubble_() {
    this.bubble_.dispose();
    this.bubble_ = null;
    this.paragraphElement_ = null;
  }

  /**
   * Set this warning's text.
   * @param {string} text Warning text (or '' to delete). This supports
   *    linebreaks.
   * @param {string} id An ID for this text entry to be able to maintain
   *     multiple warnings.
   */
  setText(text, id) {
    if (this.text_[id] === text) {
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
  }

  /**
   * Get this warning's texts.
   * @return {string} All texts concatenated into one string.
   */
  getText() {
    const allWarnings = [];
    for (const id in this.text_) {
      allWarnings.push(this.text_[id]);
    }
    return allWarnings.join('\n');
  }

  /**
   * Dispose of this warning.
   */
  dispose() {
    this.block_.warning = null;
    Icon.prototype.dispose.call(this);
  }
}

exports.Warning = Warning;
