/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Objects representing a round corner in a row of a rendered
 * block.
 *
 * @class
 */
import * as goog from '../../../closure/goog/goog.js';
goog.declareModuleId('Blockly.blockRendering.RoundCorner');

import type {ConstantProvider} from '../common/constants.js';

import {Measurable} from './base.js';
import {Types} from './types.js';


/**
 * An object containing information about the space a rounded corner takes up
 * during rendering.
 *
 * @alias Blockly.blockRendering.RoundCorner
 */
export class RoundCorner extends Measurable {
  /**
   * @param constants The rendering constants provider.
   * @param opt_position The position of this corner.
   * @internal
   */
  constructor(constants: ConstantProvider, opt_position?: string) {
    super(constants);
    this.type =
        (!opt_position || opt_position === 'left' ? Types.LEFT_ROUND_CORNER :
                                                    Types.RIGHT_ROUND_CORNER) |
        Types.CORNER;
    this.width = this.constants_.CORNER_RADIUS;
    // The rounded corner extends into the next row by 4 so we only take the
    // height that is aligned with this row.
    this.height = this.constants_.CORNER_RADIUS / 2;
  }
}
