/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Objects representing a jagged edge in a row of a rendered
 * block.
 */

/**
 * Objects representing a jagged edge in a row of a rendered
 * block.
 * @class
 */
goog.declareModuleId('Blockly.blockRendering.JaggedEdge');

/* eslint-disable-next-line no-unused-vars */
const {ConstantProvider} = goog.requireType('Blockly.blockRendering.ConstantProvider');
import {Measurable} from './base.js';
import {Types} from './types.js';


/**
 * An object containing information about the jagged edge of a collapsed block
 * takes up during rendering
 * @extends {Measurable}
 * @struct
 * @alias Blockly.blockRendering.JaggedEdge
 */
class JaggedEdge extends Measurable {
  /**
   * @param {!ConstantProvider} constants The rendering
   *   constants provider.
   * @package
   */
  constructor(constants) {
    super(constants);
    this.type |= Types.JAGGED_EDGE;
    this.height = this.constants_.JAGGED_TEETH.height;
    this.width = this.constants_.JAGGED_TEETH.width;
  }
}

export {JaggedEdge};
