/** @fileoverview An object representing the top row of a rendered block. */


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
 * An object representing the top row of a rendered block.
 * @class
 */

/* eslint-disable-next-line no-unused-vars */
import { BlockSvg } from 'google3/third_party/javascript/blockly/core/block_svg';
import { ConstantProvider } from 'google3/third_party/javascript/blockly/core/renderers/common/constants';
import { TopRow as BaseTopRow } from 'google3/third_party/javascript/blockly/core/renderers/measurables/top_row';


/**
 * An object containing information about what elements are in the top row of a
 * block as well as sizing information for the top row.
 * Elements in a top row can consist of corners, hats, spacers, and previous
 * connections.
 * After this constructor is called, the row will contain all non-spacer
 * elements it needs.
 * @alias Blockly.zelos.TopRow
 */
export class TopRow extends BaseTopRow {
  /** @param constants The rendering constants provider. */
  constructor(constants: ConstantProvider) {
    super(constants);
  }

  override endsWithElemSpacer() {
    return false;
  }

  /** Render a round corner unless the block has an output connection. */
  override hasLeftSquareCorner(block: BlockSvg) {
    // AnyDuringMigration because:  Property 'constants_' does not exist on type
    // 'TopRow'.
    const hasHat =
      (block.hat ? block.hat === 'cap' :
        (this as AnyDuringMigration).constants_.ADD_START_HATS) &&
      !block.outputConnection && !block.previousConnection;
    return !!block.outputConnection || hasHat;
  }

  /** Render a round corner unless the block has an output connection. */
  override hasRightSquareCorner(block: BlockSvg) {
    return !!block.outputConnection && !block.statementInputCount &&
      !block.nextConnection;
  }
}
