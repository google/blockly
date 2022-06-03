/**
 * @fileoverview Zelos specific objects representing elements in a row of a
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
 * Zelos specific objects representing elements in a row of a
 * rendered block.
 * @class
 */

/* eslint-disable-next-line no-unused-vars */
import { ConstantProvider } from 'google3/third_party/javascript/blockly/core/renderers/common/constants';
import { Measurable } from 'google3/third_party/javascript/blockly/core/renderers/measurables/base';
import { Types } from 'google3/third_party/javascript/blockly/core/renderers/measurables/types';


/**
 * An object containing information about the space a right connection shape
 * takes up during rendering.
 * @alias Blockly.zelos.RightConnectionShape
 */
export class RightConnectionShape extends Measurable {
  // Size is dynamic
  override height = 0;
  override width = 0;

  /** @param constants The rendering constants provider. */
  constructor(constants: ConstantProvider) {
    super(constants);
    // AnyDuringMigration because:  Property 'getType' does not exist on type
    // 'typeof Types'.
    this.type |= (Types as AnyDuringMigration).getType('RIGHT_CONNECTION');
  }
}
