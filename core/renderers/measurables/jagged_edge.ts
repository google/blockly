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
import * as goog from '../../../closure/goog/goog.js';
goog.declareModuleId('Blockly.blockRendering.JaggedEdge');

/* eslint-disable-next-line no-unused-vars */
import {ConstantProvider} from '../common/constants.js';

import {Measurable} from './base.js';
import {Types} from './types.js';


/**
 * An object containing information about the jagged edge of a collapsed block
 * takes up during rendering
 * @struct
 * @alias Blockly.blockRendering.JaggedEdge
 */
export class JaggedEdge extends Measurable {
  /** @param constants The rendering constants provider. */
  constructor(constants: ConstantProvider) {
    super(constants);
    this.type |= Types.JAGGED_EDGE;
    this.height = this.constants.JAGGED_TEETH.height;
    this.width = this.constants.JAGGED_TEETH.width;
  }
}
