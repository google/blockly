/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {BlockSvg} from '../block_svg.js';
import * as registry from './registry.js';
import {ICopyData} from '../interfaces/i_copyable.js';
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

    if (coordinate) {
      copyData.blockState['x'] = coordinate.x;
      copyData.blockState['y'] = coordinate.y;
    }
    return append(copyData.blockState, workspace, {
      recordUndo: true,
    }) as BlockSvg;
  }
}

export interface BlockCopyData extends ICopyData {
  blockState: State;
  typeCounts: {[key: string]: number};
}

registry.register(BlockPaster.TYPE, new BlockPaster());
