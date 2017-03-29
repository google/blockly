/**
 * AccessibleBlockly
 *
 * Copyright 2017 Google Inc.
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
 * @fileoverview Angular2 Service for the variable modal.
 *
 * @author corydiers@google.com (Cory Diers)
 */

blocklyApp.VariableModalService = ng.core.Class({
  constructor: [
    function() {
      this.modalIsShown = false;
    }
  ],
  // Registers a hook to be called before the modal is shown.
  registerPreRenameShowHook: function(preShowHook) {
    this.preRenameShowHook = function(oldName) {
      preShowHook(oldName);
    };
  },
  registerPreRemoveShowHook: function(preShowHook) {
    this.preRemoveShowHook = function(oldName, count) {
      preShowHook(oldName, count);
    };
  },
  // Returns true if the variable modal is shown.
  isModalShown: function() {
    return this.modalIsShown;
  },
  // Show the variable modal.
  showRenameModal_: function(oldName) {
    this.preRenameShowHook(oldName);
    this.modalIsShown = true;
  },
  // Show the variable modal.
  showRemoveModal_: function(oldName) {
    var count = blocklyApp.workspace.getVariableUses(oldName).length;
    if (count > 1) {
      this.preRemoveShowHook(oldName, count);
      this.modalIsShown = true;
    } else {
      blocklyApp.workspace.deleteVariableInternal_(oldName);
    }
  },
  // Hide the variable modal.
  hideModal: function() {
    this.modalIsShown = false;
  }
});
