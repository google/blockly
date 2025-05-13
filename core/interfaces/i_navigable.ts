/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import type {IFocusableNode} from './i_focusable_node.js';

/**
 * Represents a UI element which can be navigated to using the keyboard.
 */
export interface INavigable<T> extends IFocusableNode {
  /**
   * Returns the class of this instance.
   *
   * @returns This object's class.
   */
  getClass(): new (...args: any) => T;
}

/**
 * Determines whether the provided object fulfills the contract of INavigable.
 *
 * @param object The object to test.
 * @returns Whether the provided object can be used as an INavigable.
 */
export function isNavigable(object: any | null): object is INavigable<any> {
  return object && 'isNavigable' in object && 'getClass' in object;
}
