/**
 * @fileoverview The class representing a cursor that is used to navigate
 * between tab navigable fields.
 */

/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */


/**
 * The class representing a cursor that is used to navigate
 * between tab navigable fields.
 * @class
 */

/* eslint-disable-next-line no-unused-vars */
import { Field } from '../field';

import { ASTNode } from './ast_node';
import { BasicCursor } from './basic_cursor';


/**
 * A cursor for navigating between tab navigable fields.
 * @alias Blockly.TabNavigateCursor
 */
export class TabNavigateCursor extends BasicCursor {
  /**
   * Skip all nodes except for tab navigable fields.
   * @param node The AST node to check whether it is valid.
   * @return True if the node should be visited, false otherwise.
   */
  override validNode_(node: ASTNode | null): boolean {
    let isValid = false;
    const type = node && node.getType();
    if (node) {
      const location = node.getLocation() as Field;
      if (type === ASTNode.types.FIELD && location &&
        location.isTabNavigable() && location.isClickable()) {
        isValid = true;
      }
    }
    return isValid;
  }
}
