/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import type {IFocusableNode} from './i_focusable_node.js';

/**
 * Represents a tree of focusable elements with its own active/passive focus
 * context.
 *
 * Note that focus is handled by FocusManager, and tree implementations can have
 * at most one IFocusableNode focused at one time. If the tree itself has focus,
 * then the tree's focused node is considered 'active' ('passive' if another
 * tree has focus).
 *
 * Focus is shared between one or more trees, where each tree can have exactly
 * one active or passive node (and only one active node can exist on the whole
 * page at any given time). The idea of passive focus is to provide context to
 * users on where their focus will be restored upon navigating back to a
 * previously focused tree.
 */
export interface IFocusableTree {
  /**
   * Returns the current node with focus in this tree, or null if none (or if
   * the root has focus).
   *
   * Note that this will never return a node from a nested sub-tree as that tree
   * should specifically be called in order to retrieve its focused node.
   */
  getFocusedNode(): IFocusableNode | null;

  /**
   * Returns the top-level focusable node of the tree.
   *
   * It's expected that the returned node will be focused in cases where
   * FocusManager wants to focus a tree in a situation where it does not
   * currently have a focused node.
   */
  getRootFocusableNode(): IFocusableNode;

  /**
   * Returns all directly nested trees under this tree.
   *
   * Note that the returned list of trees doesn't need to be stable, however all
   * returned trees *do* need to be registered with FocusManager. Additionally,
   * this must return actual nested trees as omitting a nested tree will affect
   * how focus changes map to a specific node and its tree, potentially leading
   * to user confusion.
   */
  getNestedTrees(): Array<IFocusableTree>;

  /**
   * Returns the IFocusableNode corresponding to the specified element ID, or
   * null if there's no exact node within this tree with that ID or if the ID
   * corresponds to the root of the tree.
   *
   * This will never match against nested trees.
   *
   * @param id The ID of the node's focusable HTMLElement or SVGElement.
   */
  lookUpFocusableNode(id: string): IFocusableNode | null;

  /**
   * Returns the IFocusableNode corresponding to the select element, or null if
   * the element does not have such a node.
   *
   * The provided element must have a non-null ID that conforms to the contract
   * mentioned in IFocusableNode.
   *
   * This function may match against the root node of the tree. It will also map
   * against the nearest node to the provided element if the element does not
   * have an exact matching corresponding node. This function filters out
   * matches against nested trees, so long as they are represented in the return
   * value of getNestedTrees.
   */
  findFocusableNodeFor(
    element: HTMLElement | SVGElement,
  ): IFocusableNode | null;
}
