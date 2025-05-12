/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import type {FlyoutSeparator} from '../flyout_separator.js';
import type {INavigable} from '../interfaces/i_navigable.js';
import type {INavigationPolicy} from '../interfaces/i_navigation_policy.js';

/**
 * Set of rules controlling keyboard navigation from a flyout separator.
 * This is a no-op placeholder, since flyout separators can't be navigated to.
 */
export class FlyoutSeparatorNavigationPolicy
  implements INavigationPolicy<FlyoutSeparator>
{
  getFirstChild(_current: FlyoutSeparator): INavigable<unknown> | null {
    return null;
  }

  getParent(_current: FlyoutSeparator): INavigable<unknown> | null {
    return null;
  }

  getNextSibling(_current: FlyoutSeparator): INavigable<unknown> | null {
    return null;
  }

  getPreviousSibling(_current: FlyoutSeparator): INavigable<unknown> | null {
    return null;
  }

  /**
   * Returns whether or not the given flyout separator can be navigated to.
   *
   * @param _current The instance to check for navigability.
   * @returns False.
   */
  isNavigable(_current: FlyoutSeparator): boolean {
    return false;
  }
}
