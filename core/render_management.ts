/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {BlockSvg} from './block_svg.js';
import {Coordinate} from './utils/coordinate.js';


const rootBlocks = new Set<BlockSvg>();
let dirtyBlocks = new WeakSet<BlockSvg>();
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
  const workspaces = new Set([...rootBlocks].map((block) => block.workspace));
  for (const block of rootBlocks) {
    // No need to render a dead block.
    if (block.isDisposed()) continue;
    // A render for this block may have been queued, and then the block was
    // connected to a parent, so it is no longer a root block.
    // Rendering will be triggered through the real root block.
    if (block.getParent()) continue;

    renderBlock(block);
    updateConnectionLocations(block, block.getRelativeToSurfaceXY());
    updateIconLocations(block);
  }
  for (const workspace of workspaces) {
    workspace.resizeContents();
  }

  rootBlocks.clear();
  dirtyBlocks = new Set();
  pid = 0;
}

/**
 * Recursively renders all of the dirty children of the given block, and
 * then renders the block.
 *
 * @param block The block to rerender.
 */
function renderBlock(block: BlockSvg) {
  if (!dirtyBlocks.has(block)) return;
  for (const child of block.getChildren(false)) {
    renderBlock(child);
  }
  block.renderEfficiently();
}

/**
 * Updates the connection database with the new locations of all of the
 * connections that are children of the given block.
 *
 * @param block The block to update the connection locations of.
 * @param blockOrigin The top left of the given block in workspace coordinates.
 */
function updateConnectionLocations(block: BlockSvg, blockOrigin: Coordinate) {
  for (const conn of block.getConnections_(false)) {
    const moved = conn.moveToOffset(blockOrigin);
    const target = conn.targetBlock();
    if (!conn.isSuperior()) continue;
    if (!target) continue;
    if (moved || dirtyBlocks.has(target)) {
      updateConnectionLocations(
          target, Coordinate.sum(blockOrigin, target.relativeCoords));
    }
  }
}

/**
 * Updates all icons that are children of the given block with their new
 * locations.
 *
 * @param block The block to update the icon locations of.
 */
function updateIconLocations(block: BlockSvg) {
  if (!block.getIcons) return;
  for (const icon of block.getIcons()) {
    icon.computeIconLocation();
  }
  for (const child of block.getChildren(false)) {
    updateIconLocations(child);
  }
}
