/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Objects representing a square corner in a row of a rendered
 * block.
 */

/**
 * Objects representing a square corner in a row of a rendered
 * block.
 * @class
 */
import * as goog from '../../../closure/goog/goog.js';
goog.declareModuleId('Blockly.blockRendering.SquareCorner');

/* eslint-disable-next-line no-unused-vars */
import {ConstantProvider} from '../common/constants.js';

import {Measurable} from './base.js';
import {Types} from './types.js';


/**
 * An object containing information about the space a square corner takes up
 * during rendering.
 * @struct
 * @alias Blockly.blockRendering.SquareCorner
 */
export class SquareCorner extends Measurable {
  /**
   * @param constants The rendering constants provider.
   * @param opt_position The position of this corner.
   */
  constructor(constants: ConstantProvider, opt_position?: string) {
    super(constants);
    this.type =
        (!opt_position || opt_position === 'left' ? Types.LEFT_SQUARE_CORNER :
                                                    Types.RIGHT_SQUARE_CORNER) |
        Types.CORNER;
    this.height = this.constants.NO_PADDING;
    this.width = this.constants.NO_PADDING;
  }
}
