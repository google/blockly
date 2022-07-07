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
import * as goog from '../../../../closure/goog/goog';
goog.declareModuleId('Blockly.geras.InlineInput');

/* eslint-disable-next-line no-unused-vars */
/* eslint-disable-next-line no-unused-vars */
import {Input} from '../../../input';
import {ConstantProvider as BaseConstantProvider} from '../../../renderers/common/constants';
import {InlineInput as BaseInlineInput} from '../../../renderers/measurables/inline_input';
/* eslint-disable-next-line no-unused-vars */
import {ConstantProvider as GerasConstantProvider} from '../constants';


/**
 * An object containing information about the space an inline input takes up
 * during rendering.
 * @alias Blockly.geras.InlineInput
 */
export class InlineInput extends BaseInlineInput {
  override constants_: GerasConstantProvider;

  /**
   * @param constants The rendering constants provider.
   * @param input The inline input to measure and store information for.
   * @internal
   */
  constructor(constants: BaseConstantProvider, input: Input) {
    super(constants, input);
    this.constants_ = constants as GerasConstantProvider;

    if (this.connectedBlock) {
      // We allow the dark path to show on the parent block so that the child
      // block looks embossed.  This takes up an extra pixel in both x and y.
      this.width += this.constants_.DARK_PATH_OFFSET;
      this.height += this.constants_.DARK_PATH_OFFSET;
    }
  }
}
