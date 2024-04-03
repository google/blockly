/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

// Former goog.module ID: Blockly.blockRendering.Icon

/* eslint-disable-next-line no-unused-vars */
import type {IIcon as BlocklyIcon} from '../../interfaces/i_icon.js';
import type {ConstantProvider} from '../common/constants.js';

import {Measurable} from './base.js';
import {Types} from './types.js';
import {hasBubble} from '../../interfaces/i_has_bubble.js';

/**
 * An object containing information about the space an icon takes up during
 * rendering.
 */
export class Icon extends Measurable {
  /**
   * @deprecated Will be removed in v11. Create a subclass of the Icon
   *     measurable if this data is necessary for you.
   */
  isVisible: boolean;
  flipRtl = false;

  /**
   * An object containing information about the space an icon takes up during
   * rendering.
   *
   * @param constants The rendering constants provider.
   * @param icon The icon to measure and store information for.
   */
  constructor(
    constants: ConstantProvider,
    public icon: BlocklyIcon,
  ) {
    super(constants);

    this.isVisible = hasBubble(icon) && icon.bubbleIsVisible();
    this.type |= Types.ICON;

    const size = icon.getSize();
    this.height = size.height;
    this.width = size.width;
  }
}
