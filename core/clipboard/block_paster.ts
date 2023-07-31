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
      copyData.saveInfo['x'] = coordinate.x;
      copyData.saveInfo['y'] = coordinate.y;
    }
    return append(copyData.saveInfo, workspace, {recordUndo: true}) as BlockSvg;
  }
}

export interface BlockCopyData extends ICopyData {
  saveInfo: State;
  typeCounts: {[key: string]: number};
}

registry.register(BlockPaster.TYPE, new BlockPaster());
