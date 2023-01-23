/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import * as goog from '../closure/goog/goog.js';
goog.declareModuleId('Blockly.renderManagement');

import {BlockSvg} from './block_svg';


/**
 * @internal
 */
export class BlockTree {
  private root: Node = new Node();
  private map: Map<string, Node> = new Map();

  add(block: BlockSvg) {
    this.addRec(block);
  }

  private addRec(block: BlockSvg): Node {
    if (this.map.has(block.id)) return this.map.get(block.id)!;
    const parent = block.getParent();
    const parentNode = parent ? this.addRec(parent) : this.root;
    const node = new Node(block, parentNode);
    parentNode.children.push(node);
    this.map.set(block.id, node);
    return node;
  }

  remove(block: BlockSvg) {
    const node = this.getNodeFor(block);
    if (!node) return;
    this.removeRec(node);
  }
  
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

  has(block: BlockSvg): boolean {
    return this.map.has(block.id);
  }

  getNodeFor(block: BlockSvg): Node|undefined {
    return this.map.get(block.id);
  }

  getRootNode(): Node {
    return this.root;
  }

  clear() {
    this.root = new Node();
  }
}

export class Node {
  constructor(
      public readonly block?: BlockSvg, public readonly parent?: Node,
      public readonly children: Node[] = []) {}
}
