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
 * @fileoverview Angular2 utility service for multiple components. All
 * functions in this service should be stateless, since this is a singleton
 * service that is used for the entire application.
 *
 * @author madeeha@google.com (Madeeha Ghori)
 */

var blocklyApp = {};

blocklyApp.UtilsService = ng.core
  .Class({
    constructor: function() {},
    generateUniqueId: function() {
      return 'blockly-' + Blockly.genUid();
    },
    generateIds: function(elementsList) {
      var idMap = {};
      for (var i = 0; i < elementsList.length; i++){
        idMap[elementsList[i]] = this.generateUniqueId();
      }
      return idMap;
    },
    generateAriaLabelledByAttr: function(mainLabel, secondLabel) {
      return mainLabel + (secondLabel ? ' ' + secondLabel : '');
    },
    getInputTypeLabel: function(connection) {
      // Returns the input type name, or 'any' if any official input type
      // qualifies.
      if (connection.check_) {
        return connection.check_.join(', ');
      } else {
        return Blockly.Msg.ANY;
      }
    },
    getBlockTypeLabel: function(inputBlock) {
      if (inputBlock.type == Blockly.NEXT_STATEMENT) {
        return Blockly.Msg.BLOCK;
      } else {
        return Blockly.Msg.VALUE;
      }
    },
    getBlockDescription: function(block) {
      // We use 'BLANK' instead of the default '?' so that the string is read
      // out. (By default, screen readers tend to ignore punctuation.)
      return block.toString(undefined, 'BLANK');
    },
    isWorkspaceEmpty: function() {
      return !blocklyApp.workspace.topBlocks_.length;
    },
    getBlockById: function(blockId) {
      return this.getBlockByIdFromWorkspace(blockId, blocklyApp.workspace);
    },
    getBlockByIdFromWorkspace: function(blockId, workspace) {
      // This is used for non-default workspaces, such as those comprising the
      // toolbox.
      return workspace.getBlockById(blockId);
    }
  });
