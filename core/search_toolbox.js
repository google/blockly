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
 * @fileoverview Search handler for Blockly. Specifically handles
 * all searches that happen in the main workspace.
 *
 * @author ivan@shaperobotics.com
 */
'use strict';

goog.provide('Blockly.ToolboxSearch');

goog.require('Blockly.Search');

/**
 * Initializes the search handler and its associated GUI.
 *
 * @param {!Blockly.Workspace} workspace The workspace in which to create the button callback.
 */
Blockly.ToolboxSearch = function (workspace) {
  // Initialize the search handler
  Blockly.ToolboxSearch.superClass_.constructor.call(
    this, workspace);

  // TODO: Change listener for adding/removing function blocks
  // this.workspace_.addChangeListener(this.onDelete_.bind(this));
};
Blockly.utils.object.inherits(Blockly.ToolboxSearch, Blockly.Search);

Blockly.ToolboxSearch.prototype.init_ = function () {
  // Create flyout options.
  var flyoutWorkspaceOptions = {
    scrollbars: true,
    disabledPatternId: this.workspace_.options.disabledPatternId,
    parentWorkspace: this.workspace_,
    RTL: this.workspace_.RTL,
    oneBasedIndex: this.workspace_.options.oneBasedIndex,
    renderer: this.workspace_.options.renderer
  };

  // Create vertical or horizontal flyout.
  if (this.workspace_.horizontalLayout) {
    flyoutWorkspaceOptions.toolboxPosition =
        this.workspace_.toolboxPosition === Blockly.TOOLBOX_AT_TOP
          ? Blockly.TOOLBOX_AT_BOTTOM : Blockly.TOOLBOX_AT_TOP;
    if (!Blockly.HorizontalFlyout) {
      throw Error('Missing require for Blockly.HorizontalFlyout');
    }
    this.flyout_ = new Blockly.HorizontalFlyout(flyoutWorkspaceOptions);
  } else {
    flyoutWorkspaceOptions.toolboxPosition =
      this.workspace_.toolboxPosition === Blockly.TOOLBOX_AT_RIGHT
        ? Blockly.TOOLBOX_AT_LEFT : Blockly.TOOLBOX_AT_RIGHT;
    if (!Blockly.VerticalFlyout) {
      throw Error('Missing require for Blockly.VerticalFlyout');
    }
    this.flyout_ = new Blockly.VerticalFlyout(flyoutWorkspaceOptions);
  }

  Blockly.utils.dom.insertAfter(this.flyout_.createDom('svg'),
    this.workspace_.getParentSvg());
  this.flyout_.init(this.workspace_);
  this.flyout_.isBlockCreatable_ = function () {
    // All blocks, including disabled ones, can be dragged from the
    // search flyout.
    return true;
  };
};
/**
 * Adds a new block to the toolbox search handler's trie.
 * Extends the logic of its parent class (@see search.js) by including all "dropdown" options to the search.
 *
 * @param {!String} type The type ID of the block, e.g. "fable_play_sound".
 * @param {!String} val The block itself. Similar to addToTrie, will either be XML or the unique block ID.
 */
Blockly.ToolboxSearch.prototype.onBlockAdded = function (type, val) {
  Blockly.ToolboxSearch.superClass_.onBlockAdded.call(this, type, val);

  // If there are any extra keywords, add them to the trie. Otherwise, warn in the console.
  if (Blockly.Blocks[type].StaticToolboxSearchKeywords) {
    var extraKeys = Blockly.Blocks[type].StaticToolboxSearchKeywords;

    // See if the block has been initialized before
    if (!this.blocksAdded_[val]) {
      this.blocksAdded_[val] = [];
    }

    for (var j = 0; j < extraKeys.length; j++) {
      // Add a keyword to the search trie
      this.addToTrie(extraKeys[j], val);

      // Add the reverse information as well, i.e. add the keyword to the block's list of keywords
      this.blocksAdded_[val].push(extraKeys[j]);
    }
  } else {
    console.warn('Extra static keywords not found for block ' + type);
  }
};

/**
 * Inspect the contents of the trash.
 */
Blockly.ToolboxSearch.prototype.runSearch = function (inputVal) {
  var matchingBlocks = Blockly.WorkspaceSearch.superClass_.runSearch.call(this, inputVal);

  // // Create a label for the search results category
  // // TODO: Localization
  // var labelText = 'Search results:';
  // if (matchingBlocks.length === 0) {
  //   labelText = 'No results found';
  // }
  // var label = '<label web-class="subcategoryClass" text="' + labelText + '"></label>';

  // // Add the label to the flyout of results. Put it in the beginning.
  // matchingBlocks.splice(0, 0, label);

  for (let i = 0; i < matchingBlocks.length; i++) {
    matchingBlocks[i] = Blockly.Xml.textToDom(matchingBlocks[i]);
  }

  // Show the resulting XML in the flyout
  if (matchingBlocks.length > 0) {
    this.flyout_.show(matchingBlocks);
    this.flyout_.scrollToStart();

    return this.flyout_.workspace_.topBlocks_;
  }

  return [];
};
