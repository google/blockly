/** @fileoverview Methods for graphically rendering a block as SVG. */


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
 * Methods for graphically rendering a block as SVG.
 * @class
 */
/* eslint-disable-next-line no-unused-vars */
import { ConstantProvider } from '../common/constants';

import { Types } from './types';


/**
 * The base class to represent a part of a block that takes up space during
 * rendering.  The constructor for each non-spacer Measurable records the size
 * of the block element (e.g. field, statement input).
 * @alias Blockly.blockRendering.Measurable
 */
export class Measurable {
  width: number = 0;

  height: number = 0;
  type: number;
  xPos = 0;

  centerline = 0;
  notchOffset: number;

  /** @param constants The rendering constants provider. */
  constructor(protected readonly constants: ConstantProvider) {
    this.type = Types.NONE;

    this.notchOffset = this.constants.NOTCH_OFFSET_LEFT;
  }
}
