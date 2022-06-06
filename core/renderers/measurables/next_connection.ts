/**
 * @fileoverview Class representing the space a next connection takes up during
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
 * Class representing the space a next connection takes up during
 * rendering.
 * @class
 */
/* eslint-disable-next-line no-unused-vars */
import { RenderedConnection } from '../../rendered_connection';

/* eslint-disable-next-line no-unused-vars */
import { ConstantProvider } from '../common/constants';

import { Connection } from './connection';
import { Types } from './types';


/**
 * An object containing information about the space a next connection takes
 * up during rendering.
 * @struct
 * @alias Blockly.blockRendering.NextConnection
 */
export class NextConnection extends Connection {
  /**
   * @param constants The rendering constants provider.
   * @param connectionModel The connection object on the block that this
   *     represents.
   */
  constructor(
    constants: ConstantProvider, connectionModel: RenderedConnection) {
    super(constants, connectionModel);
    this.type |= Types.NEXT_CONNECTION;
    this.height = this.shape.height as number;
    this.width = this.shape.width as number;
  }
}
