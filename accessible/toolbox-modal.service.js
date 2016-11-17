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
  constructor: [function() {
    this.modalIsShown = false;
    this.onHideCallback = null;
    this.preShowHook = function() {
      throw Error(
          'A pre-show hook must be defined for the toolbox modal before it ' +
          'can be shown.');
    };
    this.toolboxCategories = [];

    // Populate the toolbox categories.
    var toolboxXmlElt = document.getElementById('blockly-toolbox-xml');
    var toolboxCategoryElts = toolboxXmlElt.getElementsByTagName('category');
    if (toolboxCategoryElts.length) {
      this.toolboxCategories = Array.from(toolboxCategoryElts).map(
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
      // If there are no top-level categories, we create a single category
      // containing all the top-level blocks.
      var workspace = new Blockly.Workspace();
      Array.from(xmlToolboxElt.children).forEach(function(topLevelNode) {
        Blockly.Xml.domToBlock(workspace, topLevelNode);
      });

      this.toolboxCategories = [{
        categoryName: 'Available Blocks',
        blocks: workspace.topBlocks_
      }];
    }
  }],
  registerPreShowHook: function(preShowHook) {
    this.preShowHook = function() {
      preShowHook(this.toolboxCategories);
    };
  },
  isModalShown: function() {
    return this.modalIsShown;
  },
  showModal: function(onHideCallback) {
    this.onHideCallback = onHideCallback;
    this.preShowHook();
    this.modalIsShown = true;
  },
  hideModal: function() {
    this.modalIsShown = false;
    if (this.onHideCallback) {
      this.onHideCallback();
    }
  }
});
