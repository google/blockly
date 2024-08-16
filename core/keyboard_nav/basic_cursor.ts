/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * The class representing a basic cursor.
 * Used to demo switching between different cursors.
 *
 * @class
 */
// Former goog.module ID: Blockly.BasicCursor

import * as registry from '../registry.js';
import {ASTNode} from './ast_node.js';
import {Cursor} from './cursor.js';

/**
 * Class for a basic cursor.
 * This will allow the user to get to all nodes in the AST by hitting next or
 * previous.
 */
export class BasicCursor extends Cursor {
  /** Name used for registering a basic cursor. */
  static readonly registrationName = 'basicCursor';

  constructor() {
    super();
  }

  /**
   * Find the next node in the pre order traversal.
   *
   * @returns The next node, or null if the current node is not set or there is
   *     no next value.
   */
  override next(): ASTNode | null {
    const curNode = this.getCurNode();
    if (!curNode) {
      return null;
    }
    const newNode = this.getNextNode_(curNode, this.validNode_);

    if (newNode) {
      this.setCurNode(newNode);
    }
    return newNode;
  }

  /**
   * For a basic cursor we only have the ability to go next and previous, so
   * in will also allow the user to get to the next node in the pre order
   * traversal.
   *
   * @returns The next node, or null if the current node is not set or there is
   *     no next value.
   */
  override in(): ASTNode | null {
    return this.next();
  }

  /**
   * Find the previous node in the pre order traversal.
   *
   * @returns The previous node, or null if the current node is not set or there
   *     is no previous value.
   */
  override prev(): ASTNode | null {
    const curNode = this.getCurNode();
    if (!curNode) {
      return null;
    }
    const newNode = this.getPreviousNode_(curNode, this.validNode_);

    if (newNode) {
      this.setCurNode(newNode);
    }
    return newNode;
  }

  /**
   * For a basic cursor we only have the ability to go next and previous, so
   * out will allow the user to get to the previous node in the pre order
   * traversal.
   *
   * @returns The previous node, or null if the current node is not set or there
   *     is no previous value.
   */
  override out(): ASTNode | null {
    return this.prev();
  }

  /**
   * Uses pre order traversal to navigate the Blockly AST. This will allow
   * a user to easily navigate the entire Blockly AST without having to go in
   * and out levels on the tree.
   *
   * @param node The current position in the AST.
   * @param isValid A function true/false depending on whether the given node
   *     should be traversed.
   * @returns The next node in the traversal.
   */
  protected getNextNode_(
    node: ASTNode | null,
    isValid: (p1: ASTNode | null) => boolean,
  ): ASTNode | null {
    if (!node) {
      return null;
    }
    const newNode = node.in() || node.next();
    if (isValid(newNode)) {
      return newNode;
    } else if (newNode) {
      return this.getNextNode_(newNode, isValid);
    }
    const siblingOrParent = this.findSiblingOrParent(node.out());
    if (isValid(siblingOrParent)) {
      return siblingOrParent;
    } else if (siblingOrParent) {
      return this.getNextNode_(siblingOrParent, isValid);
    }
    return null;
  }

  /**
   * Reverses the pre order traversal in order to find the previous node. This
   * will allow a user to easily navigate the entire Blockly AST without having
   * to go in and out levels on the tree.
   *
   * @param node The current position in the AST.
   * @param isValid A function true/false depending on whether the given node
   *     should be traversed.
   * @returns The previous node in the traversal or null if no previous node
   *     exists.
   */
  protected getPreviousNode_(
    node: ASTNode | null,
    isValid: (p1: ASTNode | null) => boolean,
  ): ASTNode | null {
    if (!node) {
      return null;
    }
    let newNode: ASTNode | null = node.prev();

    if (newNode) {
      newNode = this.getRightMostChild(newNode);
    } else {
      newNode = node.out();
    }
    if (isValid(newNode)) {
      return newNode;
    } else if (newNode) {
      return this.getPreviousNode_(newNode, isValid);
    }
    return null;
  }

  /**
   * Decides what nodes to traverse and which ones to skip. Currently, it
   * skips output, stack and workspace nodes.
   *
   * @param node The AST node to check whether it is valid.
   * @returns True if the node should be visited, false otherwise.
   */
  protected validNode_(node: ASTNode | null): boolean {
    let isValid = false;
    const type = node && node.getType();
    if (
      type === ASTNode.types.OUTPUT ||
      type === ASTNode.types.INPUT ||
      type === ASTNode.types.FIELD ||
      type === ASTNode.types.NEXT ||
      type === ASTNode.types.PREVIOUS ||
      type === ASTNode.types.WORKSPACE
    ) {
      isValid = true;
    }
    return isValid;
  }

  /**
   * From the given node find either the next valid sibling or parent.
   *
   * @param node The current position in the AST.
   * @returns The parent AST node or null if there are no valid parents.
   */
  private findSiblingOrParent(node: ASTNode | null): ASTNode | null {
    if (!node) {
      return null;
    }
    const nextNode = node.next();
    if (nextNode) {
      return nextNode;
    }
    return this.findSiblingOrParent(node.out());
  }

  /**
   * Get the right most child of a node.
   *
   * @param node The node to find the right most child of.
   * @returns The right most child of the given node, or the node if no child
   *     exists.
   */
  private getRightMostChild(node: ASTNode | null): ASTNode | null {
    if (!node!.in()) {
      return node;
    }
    let newNode = node!.in();
    while (newNode && newNode.next()) {
      newNode = newNode.next();
    }
    return this.getRightMostChild(newNode);
  }
}

registry.register(
  registry.Type.CURSOR,
  BasicCursor.registrationName,
  BasicCursor,
);
