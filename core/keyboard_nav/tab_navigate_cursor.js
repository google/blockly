/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview The class representing a cursor that is used to navigate
 * between tab navigable fields.
 */
'use strict';

/**
 * The class representing a cursor that is used to navigate
 * between tab navigable fields.
 * @class
 */
goog.declareModuleId('Blockly.TabNavigateCursor');

import {ASTNode} from './ast_node.js';
import {BasicCursor} from './basic_cursor.js';
/* eslint-disable-next-line no-unused-vars */
const {Field} = goog.requireType('Blockly.Field');


/**
 * A cursor for navigating between tab navigable fields.
 * @extends {BasicCursor}
 * @alias Blockly.TabNavigateCursor
 */
class TabNavigateCursor extends BasicCursor {
  /**
   * Skip all nodes except for tab navigable fields.
   * @param {?ASTNode} node The AST node to check whether it is valid.
   * @return {boolean} True if the node should be visited, false otherwise.
   * @override
   */
  validNode_(node) {
    let isValid = false;
    const type = node && node.getType();
    if (node) {
      const location = /** @type {Field} */ (node.getLocation());
      if (type === ASTNode.types.FIELD && location &&
          location.isTabNavigable() && location.isClickable()) {
        isValid = true;
      }
    }
    return isValid;
  }
}

export {TabNavigateCursor};
