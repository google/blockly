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

goog.provide('blocklyApp.ToolboxModalService');

goog.require('blocklyApp.UtilsService');

goog.require('blocklyApp.BlockConnectionService');
goog.require('blocklyApp.NotificationsService');
goog.require('blocklyApp.TreeService');


blocklyApp.ToolboxModalService = ng.core.Class({
  constructor: [
    blocklyApp.BlockConnectionService,
    blocklyApp.NotificationsService,
    blocklyApp.TreeService,
    blocklyApp.UtilsService,
    function(
        blockConnectionService, notificationsService, treeService,
        utilsService) {
      this.blockConnectionService = blockConnectionService;
      this.notificationsService = notificationsService;
      this.treeService = treeService;
      this.utilsService = utilsService;

      this.modalIsShown = false;

      this.selectedToolboxCategories = null;
      this.onSelectBlockCallback = null;
      this.onDismissCallback = null;
      this.hasVariableCategory = null;
      // The aim of the pre-show hook is to populate the modal component with
      // the information it needs to display the modal (e.g., which categories
      // and blocks to display).
      this.preShowHook = function() {
        throw Error(
            'A pre-show hook must be defined for the toolbox modal before it ' +
            'can be shown.');
      };
    }
  ],
  populateToolbox_: function() {
    // Populate the toolbox categories.
    this.allToolboxCategories = [];
    var toolboxXmlElt = document.getElementById('blockly-toolbox-xml');
    var toolboxCategoryElts = toolboxXmlElt.getElementsByTagName('category');
    if (toolboxCategoryElts.length) {
      this.allToolboxCategories = Array.from(toolboxCategoryElts).map(
        function(categoryElt) {
          var tmpWorkspace = new Blockly.Workspace();
          var custom = categoryElt.attributes.custom
          // TODO (corydiers): Implement custom flyouts once #1153 is solved.
          if (custom && custom.value == Blockly.VARIABLE_CATEGORY_NAME) {
            var varBlocks =
              Blockly.Variables.flyoutCategoryBlocks(blocklyApp.workspace);
            varBlocks.forEach(function(block) {
              Blockly.Xml.domToBlock(block, tmpWorkspace);
            });
          } else {
            Blockly.Xml.domToWorkspace(categoryElt, tmpWorkspace);
          }
          return {
            categoryName: categoryElt.attributes.name.value,
            blocks: tmpWorkspace.topBlocks_
          };
        }
      );
      this.computeCategoriesForCreateNewGroupModal_();
    } else {
      var that = this;
      // If there are no top-level categories, we create a single category
      // containing all the top-level blocks.
      var tmpWorkspace = new Blockly.Workspace();
      Array.from(toolboxXmlElt.children).forEach(function(topLevelNode) {
        Blockly.Xml.domToBlock(tmpWorkspace, topLevelNode);
      });

      that.allToolboxCategories = [{
        categoryName: '',
        blocks: tmpWorkspace.topBlocks_
      }];

      that.computeCategoriesForCreateNewGroupModal_();
    }
  },
  computeCategoriesForCreateNewGroupModal_: function() {
    // Precompute toolbox categories for blocks that have no output
    // connection (and that can therefore be used as the base block of a
    // "create new block group" action).
    this.toolboxCategoriesForNewGroup = [];
    var that = this;
    this.allToolboxCategories.forEach(function(toolboxCategory) {
      var baseBlocks = toolboxCategory.blocks.filter(function(block) {
        return !block.outputConnection;
      });

      if (baseBlocks.length > 0) {
        that.toolboxCategoriesForNewGroup.push({
          categoryName: toolboxCategory.categoryName,
          blocks: baseBlocks
        });
      }
    });
  },
  registerPreShowHook: function(preShowHook) {
    var that = this;
    this.preShowHook = function() {
      preShowHook(
          that.selectedToolboxCategories, that.onSelectBlockCallback,
          that.onDismissCallback);
    };
  },
  isModalShown: function() {
    return this.modalIsShown;
  },
  toolboxHasVariableCategory: function() {
    if (this.hasVariableCategory === null) {
      var toolboxXmlElt = document.getElementById('blockly-toolbox-xml');
      var toolboxCategoryElts = toolboxXmlElt.getElementsByTagName('category');
      var that = this;
      Array.from(toolboxCategoryElts).forEach(
        function(categoryElt) {
          var custom = categoryElt.attributes.custom;
          if (custom && custom.value == Blockly.VARIABLE_CATEGORY_NAME) {
            that.hasVariableCategory = true;
          }
        });

      if (this.hasVariableCategory === null) {
        this.hasVariableCategory = false;
      }
    }

    return this.hasVariableCategory;
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
    this.populateToolbox_();
    this.allToolboxCategories.forEach(function(toolboxCategory) {
      var selectedBlocks = toolboxCategory.blocks.filter(function(block) {
        return that.blockConnectionService.canBeAttachedToMarkedConnection(
            block);
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

      // Clear the active desc for the destination tree, so that it can be
      // cleanly reinstated after the new block is attached.
      var destinationTreeId = that.treeService.getTreeIdForBlock(
          that.blockConnectionService.getMarkedConnectionSourceBlock().id);
      that.treeService.clearActiveDesc(destinationTreeId);
      var newBlockId = that.blockConnectionService.attachToMarkedConnection(
          block);

      // Invoke a digest cycle, so that the DOM settles.
      setTimeout(function() {
        that.treeService.focusOnBlock(newBlockId);
        that.notificationsService.speak(
            'Attached. Now on, ' + blockDescription + ', block in workspace.');
      });
    }, function() {
      document.getElementById(sourceButtonId).focus();
    });
  },
  showToolboxModalForCreateNewGroup: function(sourceButtonId) {
    var that = this;
    this.populateToolbox_();
    this.showModal_(this.toolboxCategoriesForNewGroup, function(block) {
      var blockDescription = that.utilsService.getBlockDescription(block);
      var xml = Blockly.Xml.blockToDom(block);
      var newBlockId = Blockly.Xml.domToBlock(blocklyApp.workspace, xml).id;

      // Invoke a digest cycle, so that the DOM settles.
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
