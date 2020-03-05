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

  // Nothing else has to be done (yet) :)
};
Blockly.utils.object.inherits(Blockly.ToolboxSearch, Blockly.Search);

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
