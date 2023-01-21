/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {BlockSvg} from './block_svg';

/**
 * @internal
 */
export class BlockTree {
  add(block: BlockSvg) {}

  remove(block: BlockSvg) {}

  has(block: BlockSvg): boolean {
    return false;
  }

  getNodeFor(block: BlockSvg): Node {
    return new Node();
  }

  getRootNode(): Node {
    return new Node();
  }

  clear() {}
}

export class Node {
  constructor(
      public readonly block?: BlockSvg, public readonly parent?: Node,
      public readonly children: [] = []) {}
}
