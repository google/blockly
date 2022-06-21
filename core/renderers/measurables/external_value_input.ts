/**
 * @fileoverview Class representing external value inputs with connections on a
 * rendered block.
 */

/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */


/**
 * Class representing external value inputs with connections on a
 * rendered block.
 * @class
 */

/* eslint-disable-next-line no-unused-vars */
/* eslint-disable-next-line no-unused-vars */
import {Input} from '../../input.js';
import {ConstantProvider} from '../common/constants.js';

import {InputConnection} from './input_connection.js';
import {Types} from './types.js';


/**
 * An object containing information about the space an external value input
 * takes up during rendering
 * @struct
 * @alias Blockly.blockRendering.ExternalValueInput
 */
export class ExternalValueInput extends InputConnection {
  override height = 0;
  override width: number;
  override connectionOffsetY: number;
  connectionHeight: number;
  connectionWidth: number;

  /**
   * @param constants The rendering constants provider.
   * @param input The external value input to measure and store information for.
   * @internal
   */
  constructor(constants: ConstantProvider, input: Input) {
    super(constants, input);
    this.type |= Types.EXTERNAL_VALUE_INPUT;
    if (!this.connectedBlock) {
      this.height = this.shape.height as number;
    } else {
      this.height = this.connectedBlockHeight -
          this.constants.TAB_OFFSET_FROM_TOP - this.constants.MEDIUM_PADDING;
    }

    this.width = this.shape.width as
        number + this.constants.EXTERNAL_VALUE_INPUT_PADDING;

    this.connectionOffsetY = this.constants.TAB_OFFSET_FROM_TOP;

    this.connectionHeight = this.shape.height as number;

    this.connectionWidth = this.shape.width as number;
  }
}
