/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import * as goog from '../closure/goog/goog.js';
goog.declareModuleId('Blockly.renderManagement');

import {BlockSvg} from './block_svg';


/**
 * Constructs a subforest of blocks on the workspace when blocks are
 * added to it.
 *
 * @internal
 */
export class BlockTree {
  private root: Node = new Node();
  private map: Map<string, Node> = new Map();

  /** Adds the given block and all parent blocks to the tree. */
  add(block: BlockSvg) {
    this.addRec(block);
  }

  /** Recursively adds the given block and all parent blocks to the tree. */
  private addRec(block: BlockSvg): Node {
    if (this.map.has(block.id)) return this.map.get(block.id)!;
    const parent = block.getParent();
    const parentNode = parent ? this.addRec(parent) : this.root;
    const node = new Node(block, parentNode);
    parentNode.children.push(node);
    this.map.set(block.id, node);
    return node;
  }

  /** Removes the given block and all children from the tree. */
  remove(block: BlockSvg) {
    const node = this.getNodeFor(block);
    if (!node) return;
    this.removeRec(node);
  }
  
  /** Recursively removes the given node and all children from the tree. */
  private removeRec(node: Node) {
    if (node.block) this.map.delete(node.block.id);

    const parentNode = node.parent;
    // Should not happen, because only the root has no parent.
    if (!parentNode) return;
    parentNode.children.splice(parentNode.children.indexOf(node), 1);

    for (const child of node.children) {
      this.removeRec(child);
    }
  }

  /** @returns True if the tree contains the given block, false otherwise. */
  has(block: BlockSvg): boolean {
    return this.map.has(block.id);
  }

  /** @returns The node associated with the given block. */
  getNodeFor(block: BlockSvg): Node|undefined {
    return this.map.get(block.id);
  }

  /** @returns The root node of the tree. */
  getRootNode(): Node {
    return this.root;
  }

  /** Removes all nodes from the tree. */
  clear() {
    this.root = new Node();
  }
}

/**
 * @internal
 */
export class Node {
  constructor(
      public readonly block?: BlockSvg, public readonly parent?: Node,
      public readonly children: Node[] = []) {}
}
