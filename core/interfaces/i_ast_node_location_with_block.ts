/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

// Former goog.module ID: Blockly.IASTNodeLocationWithBlock

import type {Block} from '../block.js';
import type {INavigable} from './i_navigable.js';

/**
 * An AST node location that has an associated block.
 */
export interface IASTNodeLocationWithBlock extends INavigable {
  /**
   * Get the source block associated with this node.
   *
   * @returns The source block.
   */
  getSourceBlock(): Block | null;
}
