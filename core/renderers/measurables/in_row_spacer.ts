/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Objects representing a spacer in a row of a rendered
 * block.
 */


/**
 * Objects representing a spacer in a row of a rendered
 * block.
 * @class
 */
import * as goog from '../../../closure/goog/goog.js';
goog.declareModuleId('Blockly.blockRendering.InRowSpacer');

/* eslint-disable-next-line no-unused-vars */
import {ConstantProvider} from '../common/constants.js';

import {Measurable} from './base.js';
import {Types} from './types.js';


/**
 * An object containing information about a spacer between two elements on a
 * row.
 * @struct
 * @alias Blockly.blockRendering.InRowSpacer
 */
export class InRowSpacer extends Measurable {
  /**
   * @param constants The rendering constants provider.
   * @param width The width of the spacer.
   */
  constructor(constants: ConstantProvider, width: number) {
    super(constants);
    this.type |= Types.SPACER | Types.IN_ROW_SPACER;
    this.width = width;
    this.height = this.constants.SPACER_DEFAULT_HEIGHT;
  }
}
