/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

// Former goog.module ID: Blockly.minimalist.ConstantProvider

import {ConstantProvider as BaseConstantProvider} from '../common/constants.js';
import * as deprecation from '../../utils/deprecation.js';

/**
 * An object that provides constants for rendering blocks in the minimalist
 * renderer.
 *
 * @deprecated Use Blockly.blockRendering.ConstantProvider instead.
 *     To be removed in v11.
 */
export class ConstantProvider extends BaseConstantProvider {
  /**
   * @deprecated Use Blockly.blockRendering.ConstantProvider instead.
   *     To be removed in v11.
   */
  constructor() {
    super();
    deprecation.warn(
      'Blockly.minimalist.ConstantProvider',
      'v10',
      'v11',
      'Blockly.blockRendering.ConstantProvider',
    );
  }
}
