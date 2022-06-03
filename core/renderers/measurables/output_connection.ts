/**
 * @fileoverview Class representing the space a output connection takes up
 * during rendering.
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
 * Class representing the space a output connection takes up
 * during rendering.
 * @class
 */

/* eslint-disable-next-line no-unused-vars */
import { RenderedConnection } from 'google3/third_party/javascript/blockly/core/rendered_connection';

/* eslint-disable-next-line no-unused-vars */
import { ConstantProvider } from '../common/constants';

import { Connection } from './connection';
import { Types } from './types';


/**
 * An object containing information about the space an output connection takes
 * up during rendering.
 * @struct
 * @alias Blockly.blockRendering.OutputConnection
 */
export class OutputConnection extends Connection {
  startX: number;
  connectionOffsetY: number;
  connectionOffsetX = 0;

  /**
   * @param constants The rendering constants provider.
   * @param connectionModel The connection object on the block that this
   *     represents.
   */
  constructor(
    constants: ConstantProvider, connectionModel: RenderedConnection) {
    super(constants, connectionModel);
    this.type |= Types.OUTPUT_CONNECTION;

    this.height = !this.isDynamicShape ? this.shape.height as number : 0;
    this.width = !this.isDynamicShape ? this.shape.width as number : 0;

    this.startX = this.width;

    this.connectionOffsetY = this.constants.TAB_OFFSET_FROM_TOP;
  }
}
