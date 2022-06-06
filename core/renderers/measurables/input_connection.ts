/**
 * @fileoverview Class representing inputs with connections on a rendered block.
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
 * Class representing inputs with connections on a rendered block.
 * @class
 */

/* eslint-disable-next-line no-unused-vars */
import { BlockSvg } from '../../block_svg';
/* eslint-disable-next-line no-unused-vars */
import { Input } from '../../input';
/* eslint-disable-next-line no-unused-vars */
import { RenderedConnection } from '../../rendered_connection';

/* eslint-disable-next-line no-unused-vars */
import { ConstantProvider } from '../common/constants';

import { Connection } from './connection';
import { Types } from './types';


/**
 * The base class to represent an input that takes up space on a block
 * during rendering
 * @alias Blockly.blockRendering.InputConnection
 */
export class InputConnection extends Connection {
  align: number;
  connectedBlock: BlockSvg | null;
  connectedBlockWidth: number;
  connectedBlockHeight: number;
  connectionOffsetX: number = 0;
  connectionOffsetY: number = 0;

  /**
   * @param constants The rendering constants provider.
   * @param input The input to measure and store information for.
   */
  constructor(constants: ConstantProvider, public input: Input) {
    super(constants, input.connection as RenderedConnection);

    this.type |= Types.INPUT;

    this.align = input.align;

    this.connectedBlock =
      (input.connection && input.connection.targetBlock() ?
        input.connection.targetBlock() as BlockSvg :
        null);

    if (this.connectedBlock) {
      const bBox = this.connectedBlock.getHeightWidth();
      this.connectedBlockWidth = bBox.width;
      this.connectedBlockHeight = bBox.height;
    } else {
      this.connectedBlockWidth = 0;
      this.connectedBlockHeight = 0;
    }
  }
}
