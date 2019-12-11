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
 * @fileoverview Search handler for Blockly. Gets added to 
 * a workspace and handles all searches in that workspace.
 * 
 * @author ivan@shaperobotics.com
 */
'use strict';

goog.provide('Blockly.Search');

goog.require('goog.structs.Set');
goog.require('goog.structs.Trie');
// goog.require('goog.ui.LabelInput');
// goog.require('goog.ui.tree.TreeNode');

 /**
 * Initializes the search handler.
 * 
 * @param {!Blockly.Workspace} workspace The workspace which the search will work in.
 */
Blockly.Search = function(workspace) {
  this.workspace_ = workspace;

  //Initializes a trie. The trie is the way blocks are stored for quick search results.
  this.blockTrie_ = new goog.structs.Trie;
};

/**
 * Adds a single keyword and a block associated with it to the search trie.
 * 
 * It should be expected to execute this method multiple times 
 * per block (since a block will have multiple keywords).
 * 
 * @param {!String} key A single keyword
 * @param {!String} value The associated block. Will either be XML 
 * (if the Search handler works on the Toolbox) or block type ID (if the Search handler works on a Workspace)
 */
Blockly.Search.prototype.addToTrie = function(key, value) {
  //Add the keyword to the trie, if it doesn't exist
  if (!this.blockTrie_.containsKey(key)) {
    this.blockTrie_.add(key, []);
  }

  //Add the block data to the keyword's values
  this.blockTrie_.set(key, this.blockTrie_.get(key).concat(value));
};

/**
 * Removes a block from a single keyword's values. Used when removing 
 * a block from somewhere (e.g. deleting it from the workspace).
 * 
 * @param {!String} key A single keyword
 * @param {!String} value The associated block. Will either be XML 
 * (if the Search handler works on the Toolbox) or the unique block ID (if the Search handler works on a Workspace)
 */
Blockly.Search.prototype.removeFromTrie = function(key, value) {
  if (!this.blockTrie_.containsKey(key)) {
    return;
  }

  if (value in this.blockTrie_.get(key)) {
    this.blockTrie_.set(key, this.blockTrie_.get(key).pop(value));
  }
}

/**
 * Adds a new block to the Search handler's trie.
 * 
 * @param {!String} type The type ID of the block, e.g. "fable_play_sound".
 * @param {!String} val The block itself. Similar to addToTrie, will either be XML or the unique block ID.
 */
Blockly.Search.prototype.onBlockAdded = function(type, val) {
  try {
    //Make sure the block's search keywords list is initialized. 
    //If the function doesn't exist for this block, warn in the console.
    Blockly.Blocks[type].ensureSearchKeywords();

    //If there are any keywords, add them to the trie. Otherwise, warn in the console.
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
  catch (err) {
    console.warn("Block " + type + " has no ensureSearchKeywords function");
  }
};

/**
 * Removes a block from the Search handler's trie.
 * 
 * @param {!String} type The type ID of the block, e.g. "fable_play_sound".
 * @param {!String} val The block itself. Similar to addToTrie, will either be XML or the unique block ID.
 */
Blockly.Search.prototype.onBlockRemoved = function(type, val) {
  //If the block has any keywords, get them and remove all of their references to the block from the trie
  if (Blockly.Blocks[type].SearchKeywords) {
    var keys = Blockly.Blocks[type].SearchKeywords;
  
    for (var j = 0; j < keys.length; j++) {
      this.removeFromTrie(keys[j], val);
    }
  }
};

/**
 * Finds all blocks that match a single search word.
 * 
 * Lowercases the word because all of the words in the trie are also lowercased.
 * 
 * @param {!String} term Single word that will be used to search for blocks.
 * 
 * @return {!Array<String>} A list of all block IDs (or XML, see onBlockAdded) that match the keyword.
 */
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

/**
 * Finds all blocks that match a search term. The search term is
 * the entire string the user entered. Will be split into single words and
 * the results for each single word will be intersected.
 * 
 * @param {!Array<String>} terms Entire contents of the user's search. Must be in a list.
 * 
 * @return {!Array<String>} A list of all block IDs (or XML, see onBlockAdded) that match the user's search.
 */
Blockly.Search.prototype.blocksMatchingSearchTerms = function(terms) {
  var intersectingMatches = null;

  //Go through each word in the terms
  for (var i = 0; i < terms.length; i++) {
    if (terms[i].length == 0) {
      continue;
    }

    //Get a set with all of the results for that word
    var matchSet = new goog.structs.Set(this.blocksMatchingSearchTerm(terms[i]));

    //Intersect the results with previous results (if any)
    if (intersectingMatches) {
      intersectingMatches = intersectingMatches.intersection(matchSet);
    } 
    else {
      intersectingMatches = matchSet;
    }
  }

  return intersectingMatches.getValues();
};

/**
 * Clears the Search handler's trie and reinitializes it.
 * 
 * Useful when all blocks get permanently removed (e.g. when changing from Simple to Advanced mode).
 */
Blockly.Search.prototype.clearAll = function() {
  delete this.blockTrie_;

  this.blockTrie_ = new goog.structs.Trie;
};


/**
 * Static method that preprocesses all of a specific block's associated keywords
 * and puts them in a list. Ensures the elements of the list are single words, trimmed from any
 * exess whitespaces and other symbols.
 * 
 * @param {!String} block_type The block's type ID, e.g. "fable_play_sound".
 * @param {!Array<String>} keyword_list A list of all strings associated with the 
 * block. Might have multiple words in a single element.
 */
Blockly.Search.preprocessSearchKeywords = function(block_type, keyword_list) {
  //If the list is already initialized, we are done here
  if (Blockly.Blocks[block_type].SearchKeywords && Blockly.Blocks[block_type].SearchKeywords.length > 0) {
    return;
  }

  Blockly.Blocks[block_type].SearchKeywords = [];

    //Go through the provided list of words/sentences
    for (let i = 0; i < keyword_list.length; i++) {
      //Try to decode a string. Used for the blocks that are defined in JSON (e.g. blocks/lists.js), where strings are defined in a different way - the "%{BKY_" prefix. Will not decode the string if the prefix isn't there.
      let interpolizedMessage = Blockly.utils.tokenizeInterpolation(keyword_list[i])[0];

      //Skip this element if it ends up being undefined
      if (!interpolizedMessage) {
        continue;
      }
      
      //Clean the string (trim, lowercase, etc). Then split by whitespace.
      let splitText = interpolizedMessage.trim().toLowerCase().replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/gi ,'').split(' ');
      
      //Go through the single words of the element after splitting it.
      for (let j = 0; j < splitText.length; j++) {
          let text = splitText[j];
    
          //Add the keyword to the block's keywords
          if (text && text != '') {
              Blockly.Blocks[block_type].SearchKeywords.push(text);
          }
      }
  }
};