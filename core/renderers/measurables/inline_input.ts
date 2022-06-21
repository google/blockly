/**
 * @fileoverview Class representing inline inputs with connections on a rendered
 * block.
 */

/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */


/**
 * Class representing inline inputs with connections on a rendered
 * block.
 * @class
 */

/* eslint-disable-next-line no-unused-vars */
/* eslint-disable-next-line no-unused-vars */
import {Input} from '../../input.js';
import {ConstantProvider} from '../common/constants.js';

import {InputConnection} from './input_connection.js';
import {Types} from './types.js';


/**
 * An object containing information about the space an inline input takes up
 * during rendering
 * @struct
 * @alias Blockly.blockRendering.InlineInput
 */
export class InlineInput extends InputConnection {
  connectionHeight: number;
  connectionWidth: number;

  /**
   * @param constants The rendering constants provider.
   * @param input The inline input to measure and store information for.
   * @internal
   */
  constructor(constants: ConstantProvider, input: Input) {
    super(constants, input);
    this.type |= Types.INLINE_INPUT;

    if (!this.connectedBlock) {
      this.height = this.constants.EMPTY_INLINE_INPUT_HEIGHT;
      this.width = this.constants.EMPTY_INLINE_INPUT_PADDING;
    } else {
      // We allow the dark path to show on the parent block so that the child
      // block looks embossed.  This takes up an extra pixel in both x and y.
      this.width = this.connectedBlockWidth;
      this.height = this.connectedBlockHeight;
    }

    this.connectionHeight = !this.isDynamicShape ?
        this.shape.height as number :
        (this.shape.height as (p1: number) => number)(this.height);

    this.connectionWidth = !this.isDynamicShape ?
        this.shape.width as number :
        (this.shape.width as (p1: number) => number)(this.height);
    if (!this.connectedBlock) {
      this.width += this.connectionWidth * (this.isDynamicShape ? 2 : 1);
    }

    this.connectionOffsetY = 'connectionOffsetY' in this.shape ?
        this.shape.connectionOffsetY(this.connectionHeight) :
        this.constants.TAB_OFFSET_FROM_TOP;

    this.connectionOffsetX = 'connectionOffsetX' in this.shape ?
        this.shape.connectionOffsetX(this.connectionWidth) :
        0;
  }
}
