/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

// Former goog.module ID: Blockly.ICopyable

import type {ISelectable} from './i_selectable.js';

export interface ICopyable<T extends ICopyData> extends ISelectable {
  /**
   * Encode for copying.
   *
   * @returns Copy metadata.
   */
  toCopyData(): T | null;
}

export namespace ICopyable {
  export interface ICopyData {
    paster: string;
  }
}

export type ICopyData = ICopyable.ICopyData;

/** @returns true if the given object is copyable. */
export function isCopyable(obj: any): obj is ICopyable<ICopyData> {
  return obj.toCopyData !== undefined;
}
