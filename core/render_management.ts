/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {BlockSvg} from './block_svg';


const rootBlocks = new Set<BlockSvg>();
const dirtyBlocks = new WeakSet<BlockSvg>();
let pid = 0;

/**
 * Registers that the given block and all of its parents need to be rerendered,
 * and registers a callback to do so after a delay, to allowf or batching.
 *
 * @param block The block to rerender.
 * @internal
 */
export function queueRender(block: BlockSvg) {
  queueBlock(block);
  if (!pid) pid = window.requestAnimationFrame(doRenders);
}

/**
 * Adds the given block and its parents to the render queue. Adds the root block
 * to the list of root blocks.
 *
 * @param block The block to queue.
 */
function queueBlock(block: BlockSvg) {
  dirtyBlocks.add(block);
  const parent = block.getParent();
  if (parent) {
    queueBlock(parent);
  } else {
    rootBlocks.add(block);
  }
}

/**
 * Rerenders all of the blocks in the queue.
 */
function doRenders() {
  for (const block of rootBlocks) {
    if (block.isDisposed()) continue;
    renderBlock(block);
  }

  pid = 0;
}

/**
 * Recursively renders all of the children of the given block, and then renders
 * the block.
 *
 * @param block The block to rerender.
 */
function renderBlock(block: BlockSvg) {
  for (const child of block.getChildren(false)) {
    renderBlock(child);
  }
  if (dirtyBlocks.has(block)) {
    dirtyBlocks.delete(block);
    rootBlocks.delete(block);
    block.render(false);
  } else {
    block.updateConnectionLocations();
  }
}
