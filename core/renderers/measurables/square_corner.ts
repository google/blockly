/**
 * @fileoverview Objects representing a square corner in a row of a rendered
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
 * Objects representing a square corner in a row of a rendered
 * block.
 * @class
 */

/* eslint-disable-next-line no-unused-vars */
import { ConstantProvider } from '../common/constants';

import { Measurable } from './base';
import { Types } from './types';


/**
 * An object containing information about the space a square corner takes up
 * during rendering.
 * @struct
 * @alias Blockly.blockRendering.SquareCorner
 */
export class SquareCorner extends Measurable {
  /**
   * @param constants The rendering constants provider.
   * @param opt_position The position of this corner.
   */
  constructor(constants: ConstantProvider, opt_position?: string) {
    super(constants);
    this.type =
      (!opt_position || opt_position === 'left' ? Types.LEFT_SQUARE_CORNER :
        Types.RIGHT_SQUARE_CORNER) |
      Types.CORNER;
    this.height = this.constants.NO_PADDING;
    this.width = this.constants.NO_PADDING;
  }
}
