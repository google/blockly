/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Object representing a spacer between two rows.
 */

/**
 * Object representing a spacer between two rows.
 * @class
 */
goog.declareModuleId('Blockly.blockRendering.SpacerRow');

/* eslint-disable-next-line no-unused-vars */
const {ConstantProvider} = goog.requireType('Blockly.blockRendering.ConstantProvider');
import {InRowSpacer} from './in_row_spacer.js';
import {Row} from './row.js';
import {Types} from './types.js';


/**
 * An object containing information about a spacer between two rows.
 * @extends {Row}
 * @struct
 * @alias Blockly.blockRendering.SpacerRow
 */
class SpacerRow extends Row {
  /**
   * @param {!ConstantProvider} constants The rendering
   *   constants provider.
   * @param {number} height The height of the spacer.
   * @param {number} width The width of the spacer.
   * @package
   */
  constructor(constants, height, width) {
    super(constants);
    this.type |= Types.SPACER | Types.BETWEEN_ROW_SPACER;

    /** @type {number} */
    this.width = width;

    /** @type {number} */
    this.height = height;

    /** @type {boolean} */
    this.followsStatement = false;

    /** @type {boolean} */
    this.precedesStatement = false;

    /** @type {number} */
    this.widthWithConnectedBlocks = 0;

    /** @type {!Array.<!InRowSpacer>} */
    this.elements = [new InRowSpacer(this.constants_, width)];
  }

  /**
   * @override
   */
  measure() {
    // NOP.  Width and height were set at creation.
  }
}

export {SpacerRow};
