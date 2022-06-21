/** @fileoverview Methods for graphically rendering a block as SVG. */

/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */



/**
 * Methods for graphically rendering a block as SVG.
 * @class
 */
/* eslint-disable-next-line no-unused-vars */
import {ConstantProvider} from '../common/constants.js';

import {Types} from './types.js';


/**
 * The base class to represent a part of a block that takes up space during
 * rendering.  The constructor for each non-spacer Measurable records the size
 * of the block element (e.g. field, statement input).
 * @alias Blockly.blockRendering.Measurable
 */
export class Measurable {
  width: number = 0;

  height: number = 0;
  type: number;
  xPos = 0;

  centerline = 0;
  notchOffset: number;

  /**
   * @param constants The rendering constants provider.
   * @internal
   */
  constructor(protected readonly constants: ConstantProvider) {
    this.type = Types.NONE;

    this.notchOffset = this.constants.NOTCH_OFFSET_LEFT;
  }
}
