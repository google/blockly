/**
 * @fileoverview Zelos specific objects representing inputs with connections on
 * a rendered block.
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
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */


/**
 * Zelos specific objects representing inputs with connections on
 * a rendered block.
 * @class
 */

/* eslint-disable-next-line no-unused-vars */
/* eslint-disable-next-line no-unused-vars */
import { Input } from '../../../input';
import { ConstantProvider } from '../../../renderers/common/constants';
import { StatementInput as BaseStatementInput } from '../../../renderers/measurables/statement_input';


/**
 * An object containing information about the space a statement input takes up
 * during rendering.
 * @alias Blockly.zelos.StatementInput
 */
export class StatementInput extends BaseStatementInput {
  connectedBottomNextConnection = false;
  override height: AnyDuringMigration;

  /**
   * @param constants The rendering constants provider.
   * @param input The statement input to measure and store information for.
   */
  constructor(constants: ConstantProvider, input: Input) {
    super(constants, input);

    if (this.connectedBlock) {
      // Find the bottom-most connected block in the stack.
      let block = this.connectedBlock;
      let nextBlock;
      while (nextBlock = block.getNextBlock()) {
        block = nextBlock;
      }
      if (!block.nextConnection) {
        this.height = this.connectedBlockHeight;
        this.connectedBottomNextConnection = true;
      }
    }
  }
}
