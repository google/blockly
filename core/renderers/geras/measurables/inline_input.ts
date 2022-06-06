/**
 * @fileoverview Objects representing inline inputs with connections on a
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
 * Objects representing inline inputs with connections on a
 * rendered block.
 * @class
 */
/* eslint-disable-next-line no-unused-vars */
/* eslint-disable-next-line no-unused-vars */
import { Input } from '../../../input';
import { ConstantProvider as BaseConstantProvider } from '../../../renderers/common/constants';
import { InlineInput as BaseInlineInput } from '../../../renderers/measurables/inline_input';

/* eslint-disable-next-line no-unused-vars */
import { ConstantProvider as GerasConstantProvider } from '../constants';


/**
 * An object containing information about the space an inline input takes up
 * during rendering.
 * @alias Blockly.geras.InlineInput
 */
export class InlineInput extends BaseInlineInput {
  override constants: GerasConstantProvider;

  /**
   * @param constants The rendering constants provider.
   * @param input The inline input to measure and store information for.
   */
  constructor(constants: BaseConstantProvider, input: Input) {
    super(constants, input);
    this.constants = constants as GerasConstantProvider;

    if (this.connectedBlock) {
      // We allow the dark path to show on the parent block so that the child
      // block looks embossed.  This takes up an extra pixel in both x and y.
      this.width += this.constants.DARK_PATH_OFFSET;
      this.height += this.constants.DARK_PATH_OFFSET;
    }
  }
}
