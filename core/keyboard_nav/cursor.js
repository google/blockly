/**
 * @fileoverview The class representing a cursor.
 * Used primarily for keyboard navigation.
 */


/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2018 Google Inc.
 * https://developers.google.com/blockly/
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */


/**
 * The class representing a cursor.
 * Used primarily for keyboard navigation.
 * @class
 */

import * as registry from '../registry';

import { ASTNode } from './ast_node';
import { Marker } from './marker';

/**
 * Class for a cursor.
 * A cursor controls how a user navigates the Blockly AST.
 * @alias Blockly.Cursor
 */
export class Cursor extends Marker {
  override type = 'cursor';

  /** @alias Blockly.Cursor */
  constructor() {
    super();
  }

  /**
   * Find the next connection, field, or block.
   * @return The next element, or null if the current node is not set or there
   *     is no next value.
   */
  next(): ASTNode | null {
    const curNode = this.getCurNode();
    if (!curNode) {
      return null;
    }

    let newNode = curNode.next();
    while (newNode && newNode.next() &&
      (newNode.getType() === ASTNode.types.NEXT ||
        newNode.getType() === ASTNode.types.BLOCK)) {
      newNode = newNode.next();
    }

    if (newNode) {
      this.setCurNode(newNode);
    }
    return newNode;
  }

  /**
   * Find the in connection or field.
   * @return The in element, or null if the current node is not set or there is
   *     no in value.
   */
  in(): ASTNode | null {
    let curNode: ASTNode | null = this.getCurNode();
    if (!curNode) {
      return null;
    }
    // If we are on a previous or output connection, go to the block level
    // before performing next operation.
    if (curNode.getType() === ASTNode.types.PREVIOUS ||
      curNode.getType() === ASTNode.types.OUTPUT) {
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
   * @return The previous element, or null if the current node is not set or
   *     there is no previous value.
   */
  prev(): ASTNode | null {
    const curNode = this.getCurNode();
    if (!curNode) {
      return null;
    }
    let newNode = curNode.prev();

    while (newNode && newNode.prev() &&
      (newNode.getType() === ASTNode.types.NEXT ||
        newNode.getType() === ASTNode.types.BLOCK)) {
      newNode = newNode.prev();
    }

    if (newNode) {
      this.setCurNode(newNode);
    }
    return newNode;
  }

  /**
   * Find the out connection, field, or block.
   * @return The out element, or null if the current node is not set or there is
   *     no out value.
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
