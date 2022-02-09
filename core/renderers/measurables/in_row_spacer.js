/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Objects representing a spacer in a row of a rendered
 * block.
 */

/**
 * Objects representing a spacer in a row of a rendered
 * block.
 * @class
 */
goog.declareModuleId('Blockly.blockRendering.InRowSpacer');

/* eslint-disable-next-line no-unused-vars */
const {ConstantProvider} = goog.requireType('Blockly.blockRendering.ConstantProvider');
const {Measurable} = goog.require('Blockly.blockRendering.Measurable');
const {Types} = goog.require('Blockly.blockRendering.Types');


/**
 * An object containing information about a spacer between two elements on a
 * row.
 * @extends {Measurable}
 * @struct
 */
class InRowSpacer extends Measurable {
  /**
   * @param {!ConstantProvider} constants The rendering
   *   constants provider.
   * @param {number} width The width of the spacer.
   * @package
   * @alias Blockly.blockRendering.InRowSpacer
   */
  constructor(constants, width) {
    super(constants);
    this.type |= Types.SPACER | Types.IN_ROW_SPACER;
    this.width = width;
    this.height = this.constants_.SPACER_DEFAULT_HEIGHT;
  }
}

export {InRowSpacer};
