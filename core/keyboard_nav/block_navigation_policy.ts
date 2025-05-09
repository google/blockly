/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import type {BlockSvg} from '../block_svg.js';
import type {INavigable} from '../interfaces/i_navigable.js';
import type {INavigationPolicy} from '../interfaces/i_navigation_policy.js';
import type {RenderedConnection} from '../rendered_connection.js';

/**
 * Set of rules controlling keyboard navigation from a block.
 */
export class BlockNavigationPolicy implements INavigationPolicy<BlockSvg> {
  /**
   * Returns the first child of the given block.
   *
   * @param current The block to return the first child of.
   * @returns The first field or input of the given block, if any.
   */
  getFirstChild(current: BlockSvg): INavigable<unknown> | null {
    for (const input of current.inputList) {
      for (const field of input.fieldRow) {
        return field;
      }
      if (input.connection) return input.connection as RenderedConnection;
    }

    return null;
  }

  /**
   * Returns the parent of the given block.
   *
   * @param current The block to return the parent of.
   * @returns The top block of the given block's stack, or the connection to
   *     which it is attached.
   */
  getParent(current: BlockSvg): INavigable<unknown> | null {
    const topBlock = current.getTopStackBlock();

    return (
      (this.getParentConnection(topBlock)?.targetConnection?.getParentInput()
        ?.connection as RenderedConnection) ?? topBlock
    );
  }

  /**
   * Returns the next peer node of the given block.
   *
   * @param current The block to find the following element of.
   * @returns The first block of the next stack if the given block is a terminal
   *     block, or its next connection.
   */
  getNextSibling(current: BlockSvg): INavigable<unknown> | null {
    const nextConnection = current.nextConnection;
    if (!current.outputConnection?.targetConnection && !nextConnection) {
      // If this block has no connected output connection and no next
      // connection, it must be the last block in the stack, so its next sibling
      // is the first block of the next stack on the workspace.
      const topBlocks = current.workspace.getTopBlocks(true);
      const targetIndex = topBlocks.indexOf(current.getRootBlock()) + 1;
      if (targetIndex >= topBlocks.length) {
        return current.workspace;
      }
      const previousBlock = topBlocks[targetIndex];
      return this.getParentConnection(previousBlock) ?? previousBlock;
    }

    return nextConnection;
  }

  /**
   * Returns the previous peer node of the given block.
   *
   * @param current The block to find the preceding element of.
   * @returns The block's previous/output connection, or the last
   *     connection/block of the previous block stack if it is a root block.
   */
  getPreviousSibling(current: BlockSvg): INavigable<unknown> | null {
    const parentConnection = this.getParentConnection(current);
    if (parentConnection) return parentConnection;

    // If this block has no output/previous connection, it must be a root block,
    // so its previous sibling is the last connection of the last block of the
    // previous stack on the workspace.
    const topBlocks = current.workspace.getTopBlocks(true);
    const targetIndex = topBlocks.indexOf(current.getRootBlock()) - 1;
    if (targetIndex < 0) {
      return current.workspace;
    }

    const block = topBlocks[targetIndex];
    return block.lastConnectionInStack(false) ?? block;
  }

  /**
   * Gets the parent connection on a block.
   * This is either an output connection, previous connection or undefined.
   * If both connections exist return the one that is actually connected
   * to another block.
   *
   * @param block The block to find the parent connection on.
   * @returns The connection connecting to the parent of the block.
   */
  protected getParentConnection(block: BlockSvg) {
    if (!block.outputConnection || block.previousConnection?.isConnected()) {
      return block.previousConnection;
    }
    return block.outputConnection;
  }
}
