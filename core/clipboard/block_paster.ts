/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {BlockSvg} from '../block_svg.js';
import {registry} from '../clipboard.js';
import {CopyData} from '../interfaces/i_copyable.js';
import {IPaster} from '../interfaces/i_paster.js';
import {State, append} from '../serialization/blocks.js';
import {Coordinate} from '../utils/coordinate.js';
import {WorkspaceSvg} from '../workspace_svg.js';

export class BlockPaster implements IPaster<BlockCopyData, BlockSvg> {
  static TYPE = 'block';

  paste(
    copyData: BlockCopyData,
    workspace: WorkspaceSvg,
    coordinate?: Coordinate,
  ): BlockSvg | null {
    if (!workspace.isCapacityAvailable(copyData.typeCounts!)) return null;

    const state = copyData.saveInfo as State;
    if (coordinate) {
      state['x'] = coordinate.x;
      state['y'] = coordinate.y;
    }
    return append(state, workspace, {recordUndo: true}) as BlockSvg;
  }
}

export interface BlockCopyData extends CopyData {}

registry.register(BlockPaster.TYPE, new BlockPaster());
