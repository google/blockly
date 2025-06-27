/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {CommentIcon} from '../comments/comment_icon.js';
import type {IFocusableNode} from '../interfaces/i_focusable_node.js';
import type {INavigationPolicy} from '../interfaces/i_navigation_policy.js';

/**
 * Set of rules controlling keyboard navigation from a CommentIcon.
 */
export class CommentIconNavigationPolicy
  implements INavigationPolicy<CommentIcon>
{
  /**
   * Returns the first child of the given CommentIcon.
   *
   * @param _current The CommentIcon to return the first child of.
   * @returns Null.
   */
  getFirstChild(_current: CommentIcon): IFocusableNode | null {
    return null;
  }

  /**
   * Returns the parent of the given CommentIcon.
   *
   * @param current The CommentIcon to return the parent of.
   * @returns The parent comment of the given CommentIcon.
   */
  getParent(current: CommentIcon): IFocusableNode | null {
    return current.getParentComment();
  }

  /**
   * Returns the next peer node of the given CommentIcon.
   *
   * @param current The CommentIcon to find the following element of.
   * @returns The next CommentIcon, if any.
   */
  getNextSibling(current: CommentIcon): IFocusableNode | null {
    const children = current.getParentComment().view.getCommentIcons();
    const currentIndex = children.indexOf(current);
    if (currentIndex >= 0 && currentIndex + 1 < children.length) {
      return children[currentIndex + 1];
    }
    return null;
  }

  /**
   * Returns the previous peer node of the given CommentIcon.
   *
   * @param current The CommentIcon to find the preceding element of.
   * @returns The CommentIcon's previous CommentIcon, if any.
   */
  getPreviousSibling(current: CommentIcon): IFocusableNode | null {
    const children = current.getParentComment().view.getCommentIcons();
    const currentIndex = children.indexOf(current);
    if (currentIndex > 0) {
      return children[currentIndex - 1];
    }
    return null;
  }

  /**
   * Returns whether or not the given CommentIcon can be navigated to.
   *
   * @param current The instance to check for navigability.
   * @returns True if the given CommentIcon can be focused.
   */
  isNavigable(current: CommentIcon): boolean {
    return current.canBeFocused();
  }

  /**
   * Returns whether the given object can be navigated from by this policy.
   *
   * @param current The object to check if this policy applies to.
   * @returns True if the object is an CommentIcon.
   */
  isApplicable(current: any): current is CommentIcon {
    return current instanceof CommentIcon;
  }
}
