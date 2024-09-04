/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * The class representing a cursor.
 * Used primarily for keyboard navigation.
 *
 * @class
 */
// Former goog.module ID: Blockly.Cursor

import * as registry from '../registry.js';
import {ASTNode} from './ast_node.js';
import {Marker} from './marker.js';

/**
 * Class for a cursor.
 * A cursor controls how a user navigates the Blockly AST.
 */
export class Cursor extends Marker {
  override type = 'cursor';

  constructor() {
    super();
  }

  /**
   * Find the next connection, field, or block.
   *
   * @returns The next element, or null if the current node is not set or there
   *     is no next value.
   */
  next(): ASTNode | null {
    const curNode = this.getCurNode();
    if (!curNode) {
      return null;
    }

    let newNode = curNode.next();
    while (
      newNode &&
      newNode.next() &&
      (newNode.getType() === ASTNode.types.NEXT ||
        newNode.getType() === ASTNode.types.BLOCK)
    ) {
      newNode = newNode.next();
    }

    if (newNode) {
      this.setCurNode(newNode);
    }
    return newNode;
  }

  /**
   * Find the in connection or field.
   *
   * @returns The in element, or null if the current node is not set or there is
   *     no in value.
   */
  in(): ASTNode | null {
    let curNode: ASTNode | null = this.getCurNode();
    if (!curNode) {
      return null;
    }
    // If we are on a previous or output connection, go to the block level
    // before performing next operation.
    if (
      curNode.getType() === ASTNode.types.PREVIOUS ||
      curNode.getType() === ASTNode.types.OUTPUT
    ) {
      curNode = curNode.next();
    }
    const newNode = curNode?.in() ?? null;

    if (newNode) {
      this.setCurNode(newNode);
    }
    return newNode;
  }

  /**
   * Find the previous connection, field, or block.
   *
   * @returns The previous element, or null if the current node is not set or
   *     there is no previous value.
   */
  prev(): ASTNode | null {
    const curNode = this.getCurNode();
    if (!curNode) {
      return null;
    }
    let newNode = curNode.prev();

    while (
      newNode &&
      newNode.prev() &&
      (newNode.getType() === ASTNode.types.NEXT ||
        newNode.getType() === ASTNode.types.BLOCK)
    ) {
      newNode = newNode.prev();
    }

    if (newNode) {
      this.setCurNode(newNode);
    }
    return newNode;
  }

  /**
   * Find the out connection, field, or block.
   *
   * @returns The out element, or null if the current node is not set or there
   *     is no out value.
   */
  out(): ASTNode | null {
    const curNode = this.getCurNode();
    if (!curNode) {
      return null;
    }
    let newNode = curNode.out();

    if (newNode && newNode.getType() === ASTNode.types.BLOCK) {
      newNode = newNode.prev() || newNode;
    }

    if (newNode) {
      this.setCurNode(newNode);
    }
    return newNode;
  }
}

registry.register(registry.Type.CURSOR, registry.DEFAULT, Cursor);
