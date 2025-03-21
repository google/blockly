/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import type {IFocusableNode} from '../interfaces/i_focusable_node.js';
import type {IFocusableTree} from '../interfaces/i_focusable_tree.js';

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
    const activeElem = root.querySelector('.blocklyActiveFocus');
    let active: IFocusableNode | null = null;
    if (activeElem instanceof HTMLElement || activeElem instanceof SVGElement) {
      active = tree.findFocusableNodeFor(activeElem);
    }
    const passiveElems = Array.from(
      root.querySelectorAll('.blocklyPassiveFocus'),
    );
    const passive = passiveElems.map((elem) => {
      if (elem instanceof HTMLElement || elem instanceof SVGElement) {
        return tree.findFocusableNodeFor(elem);
      } else return null;
    });
    return active || passive.find((node) => !!node) || null;
  }

  /**
   * Returns the IFocusableNode corresponding to the specified HTML or SVG
   * element iff it's the root element or a descendent of the root element of
   * the specified IFocusableTree.
   *
   * If the tree contains another nested IFocusableTree, the nested tree may be
   * traversed but its nodes will never be returned here per the contract of
   * findChildById.
   *
   * findChildById is a provided callback that takes an element ID and maps it
   * back to the corresponding IFocusableNode within the provided
   * IFocusableTree. These IDs will match the contract specified in the
   * documentation for IFocusableNode. This function must not return any node
   * that doesn't directly belong to the node's nearest parent tree.
   *
   * @param element The HTML or SVG element being sought.
   * @param tree The tree under which the provided element may be a descendant.
   * @param findChildById The ID->IFocusableNode mapping callback that must
   *     follow the contract mentioned above.
   * @returns The matching IFocusableNode, or null if there is no match.
   */
  static findFocusableNodeFor(
    element: HTMLElement | SVGElement,
    tree: IFocusableTree,
    findChildById: (id: string) => IFocusableNode | null,
  ): IFocusableNode | null {
    if (element === tree.getRootFocusableNode().getFocusableElement()) {
      return tree.getRootFocusableNode();
    }
    const matchedChildNode = findChildById(element.id);
    const elementParent = element.parentElement;
    if (!matchedChildNode && elementParent) {
      // Recurse up to find the nearest tree/node.
      return FocusableTreeTraverser.findFocusableNodeFor(
        elementParent,
        tree,
        findChildById,
      );
    }
    return matchedChildNode;
  }
}
