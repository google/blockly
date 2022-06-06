/**
 * @fileoverview Class representing statement inputs with connections on a
 * rendered block.
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
 * Class representing statement inputs with connections on a
 * rendered block.
 * @class
 */
/* eslint-disable-next-line no-unused-vars */
/* eslint-disable-next-line no-unused-vars */
import { Input } from '../../input';

import { ConstantProvider } from '../common/constants';

import { InputConnection } from './input_connection';
import { Types } from './types';


/**
 * An object containing information about the space a statement input takes up
 * during rendering
 * @struct
 * @alias Blockly.blockRendering.StatementInput
 */
export class StatementInput extends InputConnection {
  /**
   * @param constants The rendering constants provider.
   * @param input The statement input to measure and store information for.
   */
  constructor(constants: ConstantProvider, input: Input) {
    super(constants, input);
    this.type |= Types.STATEMENT_INPUT;

    if (!this.connectedBlock) {
      this.height = this.constants.EMPTY_STATEMENT_INPUT_HEIGHT;
    } else {
      // We allow the dark path to show on the parent block so that the child
      // block looks embossed.  This takes up an extra pixel in both x and y.
      this.height =
        this.connectedBlockHeight + this.constants.STATEMENT_BOTTOM_SPACER;
    }
    this.width = this.constants.STATEMENT_INPUT_NOTCH_OFFSET +
      (this.shape.width as number);
  }
}
