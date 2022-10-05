/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * The interface for an object that is copyable.
 *
 * @namespace Blockly.ICopyable
 */
import * as goog from '../../closure/goog/goog.js';
goog.declareModuleId('Blockly.ICopyable');

import type {WorkspaceSvg} from '../workspace_svg.js';
import type {ISelectable} from './i_selectable.js';


/** @alias Blockly.ICopyable */
export interface ICopyable extends ISelectable {
  /**
   * Encode for copying.
   *
   * @returns Copy metadata.
   * @internal
   */
  toCopyData(): CopyData|null;
}

export namespace ICopyable {
  export interface CopyData {
    saveInfo: Object|Element;
    source: WorkspaceSvg;
    typeCounts: Object|null;
  }
}

export type CopyData = ICopyable.CopyData;
