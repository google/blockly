/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2012 Google Inc.
 * https://developers.google.com/blockly/
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview Utility functions for handling searches within the Toolbox.

 * @author oliverbmwilson@gmail.com
 * @author deborahcrook01.gmail.com
 * @author raissa.north@gmail.com
 * @author mikesolvalou@gmail.com
 * @author johncarlo.initeractive@gmail.com
 */
'use strict';

goog.provide('Blockly.Search');

goog.require('Blockly.Workspace');
goog.require('Blockly.Toolbox');

/**
 * Category to separate search names from variables, procedures and generated functions.
 */
Blockly.Search.NAME_TYPE = 'SEARCH';
Blockly.Search.SEARCH_TERMS = [];
Blockly.Search.button = {};

/**
 * Initializes the search button.
 * @param {!Blockly.Workspace} workspace The workspace in which to create the button callback.
 * @param {!Blockly.Toolbox} toolbox The toolbox containing the search category.
 */
Blockly.Search.init = function(workspace, toolbox) {
  this.button = goog.dom.createDom('button');
  this.button.setAttribute('text', Blockly.Msg.SEARCH);
  this.button.setAttribute('callbackKey', 'START_SEARCH');
  workspace.registerButtonCallback('START_SEARCH', function(button) {
    var searchTerm = Blockly.Search.startSearch(button.getTargetWorkspace());
    if (searchTerm) {
      Blockly.Search.setSearchTerms(searchTerm);
      toolbox.refreshSelection();
    }
  });
};

/**
 * Goes through tree recursively and add blocks to the searchNode.
 * @param {!Node} treeIn DOM tree of blocks.
 * @param {!Node} searchNode DOM tree of search category's blocks.
 */
Blockly.Search.addSearchBlocks = function(treeIn, searchNode) {
  if (!treeIn.hasChildren()) return;
  for (var i = 0; i < treeIn.getChildren().length; i++) {
    var childIn = treeIn.getChildren()[i];
    if (childIn.blocks && childIn.blocks.length > 0) {
      for (var j = 0; j < childIn.blocks.length; j++) {
        if (typeof childIn.blocks[j] === 'string') {
          continue;
        }
        searchNode.blocks.push(childIn.blocks[j]);
      }
    }
    this.addSearchBlocks(childIn, searchNode);
  }
};

/**
 * Finds node search category node and performs search on blocks.
 * @param {Node} node DOM tree of search category's blocks.
 * @param {!Blockly.Workspace} flyoutWorkspace The flyout's workspace.
 * @param {!Blockly.Workspace} workspace The main workspace.
 * @return {!Array.<!Element>} Array of XML block elements.
 */
Blockly.Search.flyoutCategory = function(node, flyoutWorkspace, workspace) {
  var treeIn = node.getParent();
  var searchNode = {};
  for (var i = 0; i < treeIn.getChildren().length; i++) {
    if ((treeIn.getChildren()[i].getHtml().toUpperCase()) === 'SEARCH') {
      searchNode = treeIn.getChildren()[i];
      break;
    }
  }

  searchNode.blocks = [];
  this.addSearchBlocks(treeIn, searchNode);
  var newArray = searchNode.blocks.concat(Blockly.Variables.flyoutCategory(workspace));
  searchNode.blocks = newArray.concat(Blockly.Procedures.flyoutCategory(workspace));
  var allBlocks = [];
  for (var i = 0; i < searchNode.blocks.length; i++) {
    if (searchNode.blocks[i].tagName) {
      var tagName = searchNode.blocks[i].tagName.toUpperCase();
    }
    if (tagName === 'BLOCK') {
      allBlocks.push(Blockly.Xml.domToInvisibleBlock(searchNode.blocks[i], flyoutWorkspace));
    }
  }

  var foundBlocks = [];
  foundBlocks.push(this.button);
  if (this.SEARCH_TERMS.length) {
    for (var i = 0; i < allBlocks.length; i++) {
      if (allBlocks[i].search(this.SEARCH_TERMS)) {
        foundBlocks.push(Blockly.Xml.blockToDom(allBlocks[i]));
        allBlocks[i].dispose(false);
      }
    }
  }

  flyoutWorkspace.clear();
  return foundBlocks;
};

/**
 * Gets the search text from the user.
 * @param {!Blockly.Workspace} workspace
 * @return {String} The search text.
 */
Blockly.Search.startSearch = function(workspace) {
  var text = window.prompt(Blockly.Msg.SEARCH_TITLE, '');
  if (text) {
    return text;
  }
  return null;
};

/**
 * Parses search text into array of search terms.
 * @param {!String} search Search text.
 */
Blockly.Search.setSearchTerms = function(search) {
  this.SEARCH_TERMS = search.trim().toLowerCase().split(' ');
};
