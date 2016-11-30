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
 * @fileoverview Angular2 Service for the toolbox modal.
 *
 * @author sll@google.com (Sean Lip)
 */

blocklyApp.ToolboxModalService = ng.core.Class({
  constructor: [
    blocklyApp.TreeService, blocklyApp.UtilsService,
    blocklyApp.NotificationsService, blocklyApp.ClipboardService,
    function(
        _treeService, _utilsService,
        _notificationsService, _clipboardService) {
      this.treeService = _treeService;
      this.utilsService = _utilsService;
      this.notificationsService = _notificationsService;
      this.clipboardService = _clipboardService;

      this.modalIsShown = false;

      this.selectedToolboxCategories = null;
      this.onSelectBlockCallback = null;
      this.onDismissCallback = null;
      this.preShowHook = function() {
        throw Error(
            'A pre-show hook must be defined for the toolbox modal before it ' +
            'can be shown.');
      };

      // Populate the toolbox categories.
      this.allToolboxCategories = [];
      var toolboxXmlElt = document.getElementById('blockly-toolbox-xml');
      var toolboxCategoryElts = toolboxXmlElt.getElementsByTagName('category');
      if (toolboxCategoryElts.length) {
        this.allToolboxCategories = Array.from(toolboxCategoryElts).map(
          function(categoryElt) {
            var workspace = new Blockly.Workspace();
            Blockly.Xml.domToWorkspace(categoryElt, workspace);
            return {
              categoryName: categoryElt.attributes.name.value,
              blocks: workspace.topBlocks_
            };
          }
        );
      } else {
        // A timeout seems to be needed in order for the .children accessor to
        // work correctly.
        var that = this;
        setTimeout(function() {
          // If there are no top-level categories, we create a single category
          // containing all the top-level blocks.
          var workspace = new Blockly.Workspace();
          Array.from(toolboxXmlElt.children).forEach(function(topLevelNode) {
            Blockly.Xml.domToBlock(workspace, topLevelNode);
          });

          that.allToolboxCategories = [{
            categoryName: '',
            blocks: workspace.topBlocks_
          }];
        });
      }
    }
  ],
  registerPreShowHook: function(preShowHook) {
    this.preShowHook = function() {
      preShowHook(
          this.selectedToolboxCategories, this.onSelectBlockCallback,
          this.onDismissCallback);
    };
  },
  isModalShown: function() {
    return this.modalIsShown;
  },
  showModal_: function(
      selectedToolboxCategories, onSelectBlockCallback, onDismissCallback) {
    this.selectedToolboxCategories = selectedToolboxCategories;
    this.onSelectBlockCallback = onSelectBlockCallback;
    this.onDismissCallback = onDismissCallback;

    this.preShowHook();
    this.modalIsShown = true;
  },
  hideModal: function() {
    this.modalIsShown = false;
  },
  showToolboxModalForAttachToMarkedConnection: function(sourceButtonId) {
    var that = this;

    var selectedToolboxCategories = [];
    this.allToolboxCategories.forEach(function(toolboxCategory) {
      var selectedBlocks = toolboxCategory.blocks.filter(function(block) {
        return that.clipboardService.canBeAttachedToMarkedConnection(block);
      });

      if (selectedBlocks.length > 0) {
        selectedToolboxCategories.push({
          categoryName: toolboxCategory.categoryName,
          blocks: selectedBlocks
        });
      }
    });

    this.showModal_(selectedToolboxCategories, function(block) {
      var blockDescription = that.utilsService.getBlockDescription(block);

      // Clean up the active desc for the destination tree.
      var oldDestinationTreeId = that.treeService.getTreeIdForBlock(
          that.clipboardService.getMarkedConnectionBlock().id);
      that.treeService.clearActiveDesc(oldDestinationTreeId);
      var newBlockId = that.clipboardService.pasteToMarkedConnection(block);

      // Invoke a digest cycle, so that the DOM settles.
      setTimeout(function() {
        that.treeService.focusOnBlock(newBlockId);

        var newDestinationTreeId = that.treeService.getTreeIdForBlock(
            newBlockId);
        if (newDestinationTreeId != oldDestinationTreeId) {
          // It is possible for the tree ID for the pasted block to change
          // after the paste operation, e.g. when inserting a block between two
          // existing blocks that are joined together. In this case, we need to
          // also reset the active desc for the old destination tree.
          that.treeService.initActiveDesc(oldDestinationTreeId);
        }

        that.notificationsService.speak(
            'Attached. Now on, ' + blockDescription + ', block in workspace.');
      });
    }, function() {
      document.getElementById(sourceButtonId).focus();
    });
  },
  showToolboxModalForCreateNewGroup: function(sourceButtonId) {
    var that = this;
    this.showModal_(this.allToolboxCategories, function(block) {
      var blockDescription = that.utilsService.getBlockDescription(block);
      var xml = Blockly.Xml.blockToDom(block);
      var newBlockId = Blockly.Xml.domToBlock(blocklyApp.workspace, xml).id;

      setTimeout(function() {
        that.treeService.focusOnBlock(newBlockId);
        that.notificationsService.speak(
            'Created new group in workspace. Now on, ' + blockDescription +
            ', block in workspace.');
      });
    }, function() {
      document.getElementById(sourceButtonId).focus();
    });
  }
});
