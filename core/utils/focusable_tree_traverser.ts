/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import type {IFocusableNode} from '../interfaces/i_focusable_node.js';
import type {IFocusableTree} from '../interfaces/i_focusable_tree.js';
import * as dom from '../utils/dom.js';

/**
 * A helper utility for IFocusableTree implementations to aid with common
 * tree traversals.
 */
export class FocusableTreeTraverser {
  /**
   * Returns the current IFocusableNode that either has the CSS class
   * 'blocklyActiveFocus' or 'blocklyPassiveFocus', only considering HTML and
   * SVG elements.
   *
   * This can match against the tree's root.
   *
   * @param tree The IFocusableTree in which to search for a focused node.
   * @returns The IFocusableNode currently with focus, or null if none.
   */
  static findFocusedNode(tree: IFocusableTree): IFocusableNode | null {
    const root = tree.getRootFocusableNode().getFocusableElement();
    if (
      dom.hasClass(root, 'blocklyActiveFocus') ||
      dom.hasClass(root, 'blocklyPassiveFocus')
    ) {
      // The root has focus.
      return tree.getRootFocusableNode();
    }

    const activeEl = root.querySelector('.blocklyActiveFocus');
    let active: IFocusableNode | null = null;
    if (activeEl instanceof HTMLElement || activeEl instanceof SVGElement) {
      active = tree.findFocusableNodeFor(activeEl);
    }

    // At most there should be one passive indicator per tree (not considering
    // subtrees).
    const passiveEl = root.querySelector('.blocklyPassiveFocus');
    let passive: IFocusableNode | null = null;
    if (passiveEl instanceof HTMLElement || passiveEl instanceof SVGElement) {
      passive = tree.findFocusableNodeFor(passiveEl);
    }

    return active ?? passive;
  }

  /**
   * Returns the IFocusableNode corresponding to the specified HTML or SVG
   * element iff it's the root element or a descendent of the root element of
   * the specified IFocusableTree.
   *
   * If the tree contains another nested IFocusableTree, the nested tree may be
   * traversed but its nodes will never be returned here per the contract of
   * IFocusableTree.lookUpFocusableNode.
   *
   * @param element The HTML or SVG element being sought.
   * @param tree The tree under which the provided element may be a descendant.
   * @returns The matching IFocusableNode, or null if there is no match.
   */
  static findFocusableNodeFor(
    element: HTMLElement | SVGElement,
    tree: IFocusableTree,
  ): IFocusableNode | null {
    // First, match against subtrees.
    const subTreeMatches = tree
      .getNestedTrees()
      .map((tree) => tree.findFocusableNodeFor(element));
    if (subTreeMatches.findIndex((match) => !!match) !== -1) {
      // At least one subtree has a match for the element so it cannot be part
      // of the outer tree.
      return null;
    }

    // Second, check against the tree's root.
    if (element === tree.getRootFocusableNode().getFocusableElement()) {
      return tree.getRootFocusableNode();
    }

    // Third, check if the element has a node.
    const matchedChildNode = tree.lookUpFocusableNode(element.id) ?? null;
    if (matchedChildNode) return matchedChildNode;

    // Fourth, recurse up to find the nearest tree/node if it's possible.
    const elementParent = element.parentElement;
    if (!matchedChildNode && elementParent) {
      return FocusableTreeTraverser.findFocusableNodeFor(elementParent, tree);
    }

    // Otherwise, there's no matching node.
    return null;
  }
}
