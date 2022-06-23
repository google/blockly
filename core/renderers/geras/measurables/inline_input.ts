/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Objects representing inline inputs with connections on a
 * rendered block.
 */


/**
 * Objects representing inline inputs with connections on a
 * rendered block.
 * @class
 */
/* eslint-disable-next-line no-unused-vars */
/* eslint-disable-next-line no-unused-vars */
import {Input} from '../../../input.js';
import {ConstantProvider as BaseConstantProvider} from '../../../renderers/common/constants.js';
import {InlineInput as BaseInlineInput} from '../../../renderers/measurables/inline_input.js';
/* eslint-disable-next-line no-unused-vars */
import {ConstantProvider as GerasConstantProvider} from '../constants.js';


/**
 * An object containing information about the space an inline input takes up
 * during rendering.
 * @alias Blockly.geras.InlineInput
 */
export class InlineInput extends BaseInlineInput {
  override constants: GerasConstantProvider;

  /**
   * @param constants The rendering constants provider.
   * @param input The inline input to measure and store information for.
   */
  constructor(constants: BaseConstantProvider, input: Input) {
    super(constants, input);
    this.constants = constants as GerasConstantProvider;

    if (this.connectedBlock) {
      // We allow the dark path to show on the parent block so that the child
      // block looks embossed.  This takes up an extra pixel in both x and y.
      this.width += this.constants.DARK_PATH_OFFSET;
      this.height += this.constants.DARK_PATH_OFFSET;
    }
  }
}
