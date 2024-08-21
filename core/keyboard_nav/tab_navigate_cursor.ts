/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * The class representing a cursor that is used to navigate
 * between tab navigable fields.
 *
 * @class
 */
// Former goog.module ID: Blockly.TabNavigateCursor

import type {Field} from '../field.js';
import {ASTNode} from './ast_node.js';
import {BasicCursor} from './basic_cursor.js';

/**
 * A cursor for navigating between tab navigable fields.
 */
export class TabNavigateCursor extends BasicCursor {
  /**
   * Skip all nodes except for tab navigable fields.
   *
   * @param node The AST node to check whether it is valid.
   * @returns True if the node should be visited, false otherwise.
   */
  override validNode_(node: ASTNode | null): boolean {
    let isValid = false;
    const type = node && node.getType();
    if (node) {
      const location = node.getLocation() as Field;
      if (
        type === ASTNode.types.FIELD &&
        location &&
        location.isTabNavigable() &&
        location.isClickable()
      ) {
        isValid = true;
      }
    }
    return isValid;
  }
}
