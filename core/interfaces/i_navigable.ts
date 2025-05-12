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
