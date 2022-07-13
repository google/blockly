/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview The class representing a cursor.
 * Used primarily for keyboard navigation.
 */
'use strict';

/**
 * The class representing a cursor.
 * Used primarily for keyboard navigation.
 * @class
 */
goog.module('Blockly.Cursor');

const registry = goog.require('Blockly.registry');
const {ASTNode} = goog.require('Blockly.ASTNode');
const {Marker} = goog.require('Blockly.Marker');

/**
 * Class for a cursor.
 * A cursor controls how a user navigates the Blockly AST.
 * @extends {Marker}
 * @alias Blockly.Cursor
 */
class Cursor extends Marker {
  /**
   * @alias Blockly.Cursor
   */
  constructor() {
    super();

    /**
     * @override
     */
    this.type = 'cursor';
  }

  /**
   * Find the next connection, field, or block.
   * @return {ASTNode} The next element, or null if the current node is
   *     not set or there is no next value.
   * @public
   */
  next() {
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
   * @return {ASTNode} The in element, or null if the current node is
   *     not set or there is no in value.
   * @public
   */
  in() {
    let curNode = this.getCurNode();
    if (!curNode) {
      return null;
    }
    // If we are on a previous or output connection, go to the block level
    // before performing next operation.
    if (curNode.getType() === ASTNode.types.PREVIOUS ||
        curNode.getType() === ASTNode.types.OUTPUT) {
      curNode = curNode.next();
    }
    const newNode = curNode.in();

    if (newNode) {
      this.setCurNode(newNode);
    }
    return newNode;
  }

  /**
   * Find the previous connection, field, or block.
   * @return {ASTNode} The previous element, or null if the current node
   *     is not set or there is no previous value.
   * @public
   */
  prev() {
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
   * @return {ASTNode} The out element, or null if the current node is
   *     not set or there is no out value.
   * @public
   */
  out() {
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

exports.Cursor = Cursor;
