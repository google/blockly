/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import * as goog from '../../closure/goog/goog.js';
goog.declareModuleId('Blockly.ICopyable');

import type {ISelectable} from './i_selectable.js';

export interface ICopyable extends ISelectable {
  /**
   * Encode for copying.
   *
   * @returns Copy metadata.
   */
  toCopyData(): ICopyData | null;
}

export namespace ICopyable {
  export interface ICopyData {
    paster: string;
  }
}

export type ICopyData = ICopyable.ICopyData;
