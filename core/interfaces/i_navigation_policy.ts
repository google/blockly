/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import type {INavigable} from './i_navigable.js';

/**
 * A set of rules that specify where keyboard navigation should proceed.
 */
export interface INavigationPolicy<T> {
  /**
   * Returns the first child element of the given element, if any.
   *
   * @param current The element which the user is navigating into.
   * @returns The current element's first child, or null if it has none.
   */
  getFirstChild(current: T): INavigable<any> | null;

  /**
   * Returns the parent element of the given element, if any.
   *
   * @param current The element which the user is navigating out of.
   * @returns The parent element of the current element, or null if it has none.
   */
  getParent(current: T): INavigable<any> | null;

  /**
   * Returns the peer element following the given element, if any.
   *
   * @param current The element which the user is navigating past.
   * @returns The next peer element of the current element, or null if there is
   *     none.
   */
  getNextSibling(current: T): INavigable<any> | null;

  /**
   * Returns the peer element preceding the given element, if any.
   *
   * @param current The element which the user is navigating past.
   * @returns The previous peer element of the current element, or null if
   *     there is none.
   */
  getPreviousSibling(current: T): INavigable<any> | null;
}
