/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Represents a UI element which can be navigated to using the keyboard.
 */
export interface INavigable<T> {
  /**
   * Returns whether or not this specific instance should be reachable via
   * keyboard navigation.
   *
   * Implementors should generally return true, unless there are circumstances
   * under which this item should be skipped while using keyboard navigation.
   * Common examples might include being disabled, invalid, readonly, or purely
   * a visual decoration. For example, while Fields are navigable, non-editable
   * fields return false, since they cannot be interacted with when focused.
   *
   * @returns True if this element should be included in keyboard navigation.
   */
  isNavigable(): boolean;

  /**
   * Returns the class of this instance.
   *
   * @returns This object's class.
   */
  getClass(): new (...args: any) => T;
}
