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
import * as eventUtils from '../events/utils.js';
import {config} from '../config.js';

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

    eventUtils.disable();
    let block;
    try {
      block = append(copyData.blockState, workspace) as BlockSvg;
      moveBlockToNotConflict(block);
    } finally {
      eventUtils.enable();
    }

    if (!block) return block;

    if (eventUtils.isEnabled() && !block.isShadow()) {
      eventUtils.fire(new (eventUtils.get(eventUtils.BLOCK_CREATE))(block));
    }
    block.select();
    return block;
  }
}

/**
 * Moves the given block to a location where it does not: (1) overlap exactly
 * with any other blocks, or (2) look like it is connected to any other blocks.
 *
 * Exported for testing.
 *
 * @param block The block to move to an unambiguous location.
 * @internal
 */
export function moveBlockToNotConflict(block: BlockSvg) {
  const workspace = block.workspace;
  const snapRadius = config.snapRadius;
  const coord = block.getRelativeToSurfaceXY();
  const offset = new Coordinate(0, 0);
  // getRelativeToSurfaceXY is really expensive, so we want to cache this.
  const otherCoords = workspace
    .getAllBlocks(false)
    .filter((otherBlock) => otherBlock.id != block.id)
    .map((b) => b.getRelativeToSurfaceXY());

  while (
    blockOverlapsOtherExactly(Coordinate.sum(coord, offset), otherCoords) ||
    blockIsInSnapRadius(block, offset, snapRadius)
  ) {
    if (workspace.RTL) {
      offset.translate(-snapRadius, snapRadius * 2);
    } else {
      offset.translate(snapRadius, snapRadius * 2);
    }
  }

  block!.moveTo(Coordinate.sum(coord, offset));
}

/**
 * @returns true if the given block coordinates are less than a delta of 1 from
 *     any of the other coordinates.
 */
function blockOverlapsOtherExactly(
  coord: Coordinate,
  otherCoords: Coordinate[],
): boolean {
  return otherCoords.some(
    (otherCoord) =>
      Math.abs(otherCoord.x - coord.x) <= 1 &&
      Math.abs(otherCoord.y - coord.y) <= 1,
  );
}

/**
 * @returns true if the given block (when offset by the given amount) is close
 *     enough to any other connections (within the snap radius) that it looks
 *     like they could connect.
 */
function blockIsInSnapRadius(
  block: BlockSvg,
  offset: Coordinate,
  snapRadius: number,
): boolean {
  return block
    .getConnections_(false)
    .some((connection) => !!connection.closest(snapRadius, offset).connection);
}

export interface BlockCopyData extends ICopyData {
  blockState: State;
  typeCounts: {[key: string]: number};
}

registry.register(BlockPaster.TYPE, new BlockPaster());
