/**
 * AccessibleBlockly
 *
 * Copyright 2016 Google Inc.
 * https://developers.google.com/blockly/
 *
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview Angular2 utility service for multiple components. This is a
 * singleton service that is used for the entire application. In general, it
 * should only be used as a stateless adapter for native Blockly functions.
 *
 * @author madeeha@google.com (Madeeha Ghori)
 */

goog.provide('blocklyApp.UtilsService');


blocklyApp.ID_FOR_EMPTY_WORKSPACE_BTN = 'blocklyEmptyWorkspaceBtn';
blocklyApp.BLOCK_ROOT_ID_SUFFIX = '-blockRoot';

blocklyApp.UtilsService = ng.core.Class({
  constructor: [function() {}],
  getBlockDescription: function(block) {
    // We use 'BLANK' instead of the default '?' so that the string is read
    // out. (By default, screen readers tend to ignore punctuation.)
    return block.toString(undefined, 'BLANK');
  },
  isWorkspaceEmpty: function() {
    return !blocklyApp.workspace.topBlocks_.length;
  }
});
