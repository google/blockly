/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import type {FlyoutButton} from '../flyout_button.js';
import type {INavigable} from '../interfaces/i_navigable.js';
import type {INavigationPolicy} from '../interfaces/i_navigation_policy.js';

/**
 * Set of rules controlling keyboard navigation from a flyout button.
 */
export class FlyoutButtonNavigationPolicy
  implements INavigationPolicy<FlyoutButton>
{
  /**
   * Returns null since flyout buttons have no children.
   *
   * @param _current The FlyoutButton instance to navigate from.
   * @returns Null.
   */
  getFirstChild(_current: FlyoutButton): INavigable<unknown> | null {
    return null;
  }

  /**
   * Returns the parent workspace of the given flyout button.
   *
   * @param current The FlyoutButton instance to navigate from.
   * @returns The given flyout button's parent workspace.
   */
  getParent(current: FlyoutButton): INavigable<unknown> | null {
    return current.getWorkspace();
  }

  /**
   * Returns null since inter-item navigation is done by FlyoutNavigationPolicy.
   *
   * @param _current The FlyoutButton instance to navigate from.
   * @returns Null.
   */
  getNextSibling(_current: FlyoutButton): INavigable<unknown> | null {
    return null;
  }

  /**
   * Returns null since inter-item navigation is done by FlyoutNavigationPolicy.
   *
   * @param _current The FlyoutButton instance to navigate from.
   * @returns Null.
   */
  getPreviousSibling(_current: FlyoutButton): INavigable<unknown> | null {
    return null;
  }
}
