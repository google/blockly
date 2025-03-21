/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import type {IFocusableTree} from './i_focusable_tree.js';

/** Represents anything that can have input focus. */
export interface IFocusableNode {
  /**
   * Returns the DOM element that can be explicitly requested to receive focus.
   *
   * IMPORTANT: Please note that this element is expected to have a visual
   * presence on the page as it will both be explicitly focused and have its
   * style changed depending on its current focus state (i.e. blurred, actively
   * focused, and passively focused). The element will have one of two styles
   * attached (where no style indicates blurred/not focused):
   * - blocklyActiveFocus
   * - blocklyPassiveFocus
   *
   * The returned element must also have a valid ID specified, and unique to the
   * element relative to its nearest IFocusableTree parent. It must also have a
   * negative tabindex (since the focus manager itself will manage its tab index
   * and a tab index must be present in order for the element to be focusable in
   * the DOM).
   *
   * It's expected the return element will not change for the lifetime of the
   * node.
   */
  getFocusableElement(): HTMLElement | SVGElement;

  /**
   * Returns the closest parent tree of this node (in cases where a tree has
   * distinct trees underneath it), which represents the tree to which this node
   * belongs.
   */
  getFocusableTree(): IFocusableTree;
}
