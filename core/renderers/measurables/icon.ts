/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Objects representing an icon in a row of a rendered
 * block.
 */

/**
 * Objects representing an icon in a row of a rendered
 * block.
 * @class
 */
goog.module('Blockly.blockRendering.Icon');

/* eslint-disable-next-line no-unused-vars */
const {ConstantProvider} = goog.requireType('Blockly.blockRendering.ConstantProvider');
/* eslint-disable-next-line no-unused-vars */
const {Icon: BlocklyIcon} = goog.requireType('Blockly.Icon');
const {Measurable} = goog.require('Blockly.blockRendering.Measurable');
const {Types} = goog.require('Blockly.blockRendering.Types');


/**
 * An object containing information about the space an icon takes up during
 * rendering
 * @extends {Measurable}
 * @struct
 * @alias Blockly.blockRendering.Icon
 */
class Icon extends Measurable {
  /**
   * An object containing information about the space an icon takes up during
   * rendering
   * @param {!ConstantProvider} constants The rendering
   *   constants provider.
   * @param {!BlocklyIcon} icon The icon to measure and store information for.
   * @package
   */
  constructor(constants, icon) {
    super(constants);

    /** @type {!BlocklyIcon} */
    this.icon = icon;

    /** @type {boolean} */
    this.isVisible = icon.isVisible();
    this.type |= Types.ICON;

    const size = icon.getCorrectedSize();
    this.height = size.height;
    this.width = size.width;
  }
}
exports.Icon = Icon;
