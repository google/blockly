/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Methods for graphically rendering a block as SVG.
 *
 * @class
 */
import * as goog from '../../../closure/goog/goog.js';
goog.declareModuleId('Blockly.blockRendering.Measurable');

import type {ConstantProvider} from '../common/constants.js';

import {Types} from './types.js';


/**
 * The base class to represent a part of a block that takes up space during
 * rendering.  The constructor for each non-spacer Measurable records the size
 * of the block element (e.g. field, statement input).
 *
 * @alias Blockly.blockRendering.Measurable
 */
export class Measurable {
  width = 0;

  height = 0;
  type: number;
  xPos = 0;

  centerline = 0;
  notchOffset: number;

  /** The renderer's constant provider. */
  protected readonly constants_: ConstantProvider;

  /**
   * @param constants The rendering constants provider.
   * @internal
   */
  constructor(constants: ConstantProvider) {
    this.constants_ = constants;

    this.type = Types.NONE;

    this.notchOffset = this.constants_.NOTCH_OFFSET_LEFT;
  }
}
