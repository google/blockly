/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import * as goog from '../../../closure/goog/goog.js';
goog.declareModuleId('Blockly.minimalist.ConstantProvider');

import {ConstantProvider as BaseConstantProvider} from '../common/constants.js';


/**
 * An object that provides constants for rendering blocks in the minimalist
 * renderer.
 */
export class ConstantProvider extends BaseConstantProvider {
  constructor() {
    super();
  }
}
