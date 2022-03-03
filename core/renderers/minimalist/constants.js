/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview An object that provides constants for rendering blocks in the
 * minimalist renderer.
 */
'use strict';

/**
 * An object that provides constants for rendering blocks in the
 * minimalist renderer.
 * @class
 */
goog.declareModuleId('Blockly.minimalist.ConstantProvider');

import {ConstantProvider as BaseConstantProvider} from '../common/constants.js';


/**
 * An object that provides constants for rendering blocks in the sample.
 * @extends {BaseConstantProvider}
 * @alias Blockly.minimalist.ConstantProvider
 */
class ConstantProvider extends BaseConstantProvider {
  /**
   * @package
   */
  constructor() {
    super();
  }
}

export {ConstantProvider};
