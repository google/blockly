/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import * as goog from '../../../closure/goog/goog.js';
goog.declareModuleId('Blockly.blockRendering.Icon');

/* eslint-disable-next-line no-unused-vars */
import type {Icon as BlocklyIcon} from '../../icon.js';
import type {ConstantProvider} from '../common/constants.js';

import {Measurable} from './base.js';
import {Types} from './types.js';


/**
 * An object containing information about the space an icon takes up during
 * rendering.
 */
export class Icon extends Measurable {
  isVisible: boolean;
  flipRtl = false;

  /**
   * An object containing information about the space an icon takes up during
   * rendering.
   *
   * @param constants The rendering constants provider.
   * @param icon The icon to measure and store information for.
   */
  constructor(constants: ConstantProvider, public icon: BlocklyIcon) {
    super(constants);

    this.isVisible = icon.isVisible();
    this.type |= Types.ICON;

    const size = icon.getCorrectedSize();
    this.height = size.height;
    this.width = size.width;
  }
}
