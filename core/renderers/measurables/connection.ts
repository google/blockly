/**
 * @fileoverview Base class representing the space a connection takes up during
 * rendering.
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
 * Base class representing the space a connection takes up during
 * rendering.
 * @class
 */

/* eslint-disable-next-line no-unused-vars */
/* eslint-disable-next-line no-unused-vars */
import { RenderedConnection } from '../../rendered_connection';

import { ConstantProvider, Shape } from '../common/constants';

import { Measurable } from './base';
import { Types } from './types';

/**
 * The base class to represent a connection and the space that it takes up on
 * the block.
 * @alias Blockly.blockRendering.Connection
 */
export class Connection extends Measurable {
  shape: Shape;
  isDynamicShape: boolean;

  /**
   * @param constants The rendering constants provider.
   * @param connectionModel The connection object on the block that this
   *     represents.
   */
  constructor(
    constants: ConstantProvider, public connectionModel: RenderedConnection) {
    super(constants);

    this.shape = this.constants.shapeFor(connectionModel);

    this.isDynamicShape = 'isDynamic' in this.shape && this.shape.isDynamic;
    this.type |= Types.CONNECTION;
  }
}
