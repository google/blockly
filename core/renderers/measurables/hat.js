/**
 * @fileoverview Objects representing a hat in a row of a rendered
 * block.
 */


/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2018 Google Inc.
 * https://developers.google.com/blockly/
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */


/**
 * Objects representing a hat in a row of a rendered
 * block.
 * @class
 */

/* eslint-disable-next-line no-unused-vars */
import { ConstantProvider } from '../common/constants';

import { Measurable } from './base';
import { Types } from './types';


/**
 * An object containing information about the space a hat takes up during
 * rendering.
 * @struct
 * @alias Blockly.blockRendering.Hat
 */
export class Hat extends Measurable {
  ascenderHeight: number;

  /** @param constants The rendering constants provider. */
  constructor(constants: ConstantProvider) {
    super(constants);
    this.type |= Types.HAT;

    this.height = this.constants.START_HAT.height;
    this.width = this.constants.START_HAT.width;

    this.ascenderHeight = this.height;
  }
}
