/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview An object representing the bottom row of a rendered block.
 */

/**
 * An object representing the bottom row of a rendered block.
 * @class
 */


/* eslint-disable-next-line no-unused-vars */
import {BlockSvg} from '../../../block_svg';
import {ConstantProvider} from '../../../renderers/common/constants';
import {BottomRow as BaseBottomRow} from '../../../renderers/measurables/bottom_row';


/**
 * An object containing information about what elements are in the bottom row of
 * a block as well as spacing information for the top row.
 * Elements in a bottom row can consist of corners, spacers and next
 * connections.
 * @alias Blockly.zelos.BottomRow
 */
export class BottomRow extends BaseBottomRow {
  /**
   * @param constants The rendering constants provider.
   * @internal
   */
  constructor(constants: ConstantProvider) {
    super(constants);
  }

  override endsWithElemSpacer() {
    return false;
  }

  /** Render a round corner unless the block has an output connection. */
  override hasLeftSquareCorner(block: BlockSvg) {
    return !!block.outputConnection;
  }

  /** Render a round corner unless the block has an output connection. */
  override hasRightSquareCorner(block: BlockSvg) {
    return !!block.outputConnection && !block.statementInputCount &&
        !block.nextConnection;
  }
}
