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
  * @author ivan@shaperobotics.com
 */
'use strict';

goog.provide('Blockly.Search');

goog.require('goog.structs.Set');
goog.require('goog.structs.Trie');
goog.require('goog.ui.LabelInput');
goog.require('goog.ui.tree.TreeNode');

 /**
 * Initializes the search button.
 * @param {!Blockly.Workspace} workspace The workspace in which to create the button callback.
 * @param {!Blockly.Toolbox} toolbox The toolbox containing the search category.
 */
Blockly.Search = function(workspace) {
  this.workspace_ = workspace;
  this.blockTrie_ = new goog.structs.Trie;
};

Blockly.Search.prototype.addToTrie = function(key, value) {
  if (!this.blockTrie_.containsKey(key)) {
    this.blockTrie_.add(key, []);
  }

  this.blockTrie_.set(key, this.blockTrie_.get(key).concat(value));
};

Blockly.Search.prototype.removeFromTrie = function(key, value) {
  if (!this.blockTrie_.containsKey(key)) {
    return;
  }

  if (value in this.blockTrie_.get(key)) {
    this.blockTrie_.set(key, this.blockTrie_.get(key).pop(value));
  }
}

Blockly.Search.prototype.onBlockAdded = function(type, val) {
  try {
    Blockly.Blocks[type].ensureSearchKeywords();

    if (Blockly.Blocks[type].SearchKeywords) {
      var keys = Blockly.Blocks[type].SearchKeywords;

      for (var j = 0; j < keys.length; j++) {
        this.addToTrie(keys[j], val);
      }
    }
    else {
      console.warn('Keywords not found for block ' + type);
    }
  }
  catch (err)
  {
    console.log("Block " + type + " has no ensureSearchKeywords function");
  }
};

Blockly.Search.prototype.onBlockRemoved = function(type, val) {
  if (Blockly.Blocks[type].SearchKeywords) {
    var keys = Blockly.Blocks[type].SearchKeywords;
  
    for (var j = 0; j < keys.length; j++) {
      this.removeFromTrie(keys[j], val);
    }
  }
};

Blockly.Search.preprocessSearchKeywords = function(block_type, keyword_list) {
  if (Blockly.Blocks[block_type].SearchKeywords) {
    return;
  }

  Blockly.Blocks[block_type].SearchKeywords = [];

  for (let i = 0; i < keyword_list.length; i++) {
    let splitText = keyword_list[i].trim().toLowerCase().replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/gi ,'').split(' ');
    
    for (let j = 0; j < splitText.length; j++) {
        let text = splitText[j];
  
        if (text && text != '') {
            Blockly.Blocks[block_type].SearchKeywords.push(text);
        }
    }
}
};

Blockly.Search.prototype.blocksMatchingSearchTerm = function(term) {
  if (!this.blockTrie_) {
    return [];
  }

  var keys = this.blockTrie_.getKeys(term.toLowerCase());
  var blocks = [];

    for (var i = 0; i < keys.length; i++) {
    var key = keys[i];
    var blocksForKey = this.blockTrie_.get(key);

    for (var j = 0; j < blocksForKey.length; j++) {
      blocks.push(blocksForKey[j]);
    }
  }

  return blocks;
}

Blockly.Search.prototype.blocksMatchingSearchTerms = function(terms) {
  var intersectingMatches = null;

    for (var i = 0; i < terms.length; i++) {

      if (terms[i].length == 0) {
        continue;
      }

    var matchSet = new goog.structs.Set(this.blocksMatchingSearchTerm(terms[i]));
    if (intersectingMatches) {
      intersectingMatches = intersectingMatches.intersection(matchSet);
    } else {
      intersectingMatches = matchSet;
    }
  }

    return intersectingMatches.getValues();
};