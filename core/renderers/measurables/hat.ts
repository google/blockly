/**
 * @fileoverview Objects representing a hat in a row of a rendered
 * block.
 */

/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */


/**
 * Objects representing a hat in a row of a rendered
 * block.
 * @class
 */

/* eslint-disable-next-line no-unused-vars */
import { ConstantProvider } from '../common/constants.js';

import { Measurable } from './base.js';
import { Types } from './types.js';


/**
 * An object containing information about the space a hat takes up during
 * rendering.
 * @struct
 * @alias Blockly.blockRendering.Hat
 */
export class Hat extends Measurable {
  ascenderHeight: number;

  /** @param constants The rendering constants provider. */
  constructor(constants: ConstantProvider) {
    super(constants);
    this.type |= Types.HAT;

    this.height = this.constants.START_HAT.height;
    this.width = this.constants.START_HAT.width;

    this.ascenderHeight = this.height;
  }
}
