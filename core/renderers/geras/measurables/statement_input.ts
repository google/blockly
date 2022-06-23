/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Objects representing statement inputs with connections on a
 * rendered block.
 */


/**
 * Objects representing statement inputs with connections on a
 * rendered block.
 * @class
 */
goog.declareModuleId('Blockly.geras.StatementInput');

/* eslint-disable-next-line no-unused-vars */
/* eslint-disable-next-line no-unused-vars */
import {Input} from '../../../input.js';
import {ConstantProvider as BaseConstantProvider} from '../../../renderers/common/constants.js';
import {StatementInput as BaseStatementInput} from '../../../renderers/measurables/statement_input.js';
/* eslint-disable-next-line no-unused-vars */
import {ConstantProvider as GerasConstantProvider} from '../constants.js';


/**
 * An object containing information about the space a statement input takes up
 * during rendering.
 * @alias Blockly.geras.StatementInput
 */
export class StatementInput extends BaseStatementInput {
  override constants: GerasConstantProvider;

  /**
   * @param constants The rendering constants provider.
   * @param input The statement input to measure and store information for.
   */
  constructor(constants: BaseConstantProvider, input: Input) {
    super(constants, input);
    this.constants = constants as GerasConstantProvider;

    if (this.connectedBlock) {
      // We allow the dark path to show on the parent block so that the child
      // block looks embossed.  This takes up an extra pixel in both x and y.
      this.height += this.constants.DARK_PATH_OFFSET;
    }
  }
}
