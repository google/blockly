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

goog.provide('blocklyApp.VariableModalService');

blocklyApp.VariableModalService = ng.core.Class({
  constructor: [
    function() {
      this.modalIsShown = false;
    }
  ],
  // Registers a hook to be called before the add modal is shown.
  registerPreAddShowHook: function(preShowHook) {
    this.preAddShowHook = function() {
      preShowHook();
    };
  },
  // Registers a hook to be called before the rename modal is shown.
  registerPreRenameShowHook: function(preShowHook) {
    this.preRenameShowHook = function(oldName) {
      preShowHook(oldName);
    };
  },
  // Registers a hook to be called before the remove modal is shown.
  registerPreRemoveShowHook: function(preShowHook) {
    this.preRemoveShowHook = function(oldName, count) {
      preShowHook(oldName, count);
    };
  },
  // Returns true if the variable modal is shown.
  isModalShown: function() {
    return this.modalIsShown;
  },
  // Show the add variable modal.
  showAddModal_: function() {
    this.preAddShowHook();
    this.modalIsShown = true;
  },
  // Show the rename variable modal.
  showRenameModal_: function(oldName) {
    this.preRenameShowHook(oldName);
    this.modalIsShown = true;
  },
  // Show the remove variable modal.
  showRemoveModal_: function(oldName) {
    var count = this.getNumVariables(oldName);
    this.modalIsShown = true;
    if (count > 1) {
      this.preRemoveShowHook(oldName, count);
    } else {
      var variable = blocklyApp.workspace.getVariable(oldName);
      blocklyApp.workspace.deleteVariableInternal_(variable);
      // Allow the execution loop to finish before "closing" the modal. While
      // the modal never opens, its being "open" should prevent other keypresses
      // anyway.
      var that = this;
      setTimeout(function() {
        that.modalIsShown = false;
      });
    }
  },
  getNumVariables: function(oldName) {
    return blocklyApp.workspace.getVariableUses(oldName).length;
  },
  // Hide the variable modal.
  hideModal: function() {
    this.modalIsShown = false;
  }
});
