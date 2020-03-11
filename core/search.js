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

goog.require('Blockly.Set');
goog.require('Blockly.Trie');

/**
 * Initializes the search handler.
 *
 * @param {!Blockly.Workspace} workspace The workspace which the search will work in.
 */
Blockly.Search = function (workspace) {
  this.workspace_ = workspace;

  // Initializes a trie. The trie is the way blocks are stored for quick search results.
  this.blockTrie_ = new Blockly.Trie();

  // Initialize a key-value dictionary which holds the block-keyword connection in reverse to the trie. This is used for easier de-registering of blocks in onBlockRemoved
  this.blocksAdded_ = {};
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
Blockly.Search.prototype.addToTrie = function (key, value) {
  // Add the keyword to the trie, if it doesn't exist
  if (!this.blockTrie_.containsKey(key)) {
    this.blockTrie_.add(key, []);
  }

  // Add the block data to the keyword's values
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
Blockly.Search.prototype.removeFromTrie = function (key, value) {
  if (!this.blockTrie_.containsKey(key)) {
    return;
  }

  if (value in this.blockTrie_.get(key)) {
    this.blockTrie_.set(key, this.blockTrie_.get(key).pop(value));
  }
};

/**
 * Adds a new block to the Search handler's trie.
 *
 * @param {!String} type The type ID of the block, e.g. "fable_play_sound".
 * @param {!String} val The block itself. Similar to addToTrie, will either be XML or the unique block ID.
 */
Blockly.Search.prototype.onBlockAdded = function (type, val) {
  try {
    // Make sure the block's search keywords list is initialized.
    // If the function doesn't exist for this block, warn in the console.
    Blockly.Blocks[type].ensureSearchKeywords();

    // If there are any keywords, add them to the trie. Otherwise, warn in the console.
    if (Blockly.Blocks[type].StaticSearchKeywords) {
      var keys = Blockly.Blocks[type].StaticSearchKeywords;

      // See if the block has been initialized before
      if (!this.blocksAdded_[val]) {
        this.blocksAdded_[val] = [];
      }

      for (var j = 0; j < keys.length; j++) {
        // Add a keyword to the search trie
        this.addToTrie(keys[j], val);

        // Add the reverse information as well, i.e. add the keyword to the block's list of keywords
        this.blocksAdded_[val].push(keys[j]);
      }
    } else {
      console.warn('Keywords not found for block ' + type);
    }
  } catch (err) {
    console.warn('Block ' + type + ' has no ensureSearchKeywords function');
  }
};

/**
 * Removes a block from the Search handler's trie.
 *
 * @param {!String} type The type ID of the block, e.g. "fable_play_sound".
 * @param {!String} val The block itself. Similar to addToTrie, will either be XML or the unique block ID.
 */
Blockly.Search.prototype.onBlockRemoved = function (type, val) {
  // If the block has any keywords, get them and remove all of their references to the block from the trie
  if (this.blocksAdded_[val]) {
    var keys = this.blocksAdded_[val];

    for (var j = 0; j < keys.length; j++) {
      this.removeFromTrie(keys[j], val);
    }

    // Reset the list of keywords for this block
    delete this.blocksAdded_[val];
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
Blockly.Search.prototype.blocksMatchingSearchTerm = function (term) {
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
};

/**
 * Finds all blocks that match a search term. The search term is
 * the entire string the user entered. Will be split into single words and
 * the results for each single word will be intersected.
 *
 * @param {!Array<String>} terms Entire contents of the user's search. Must be in a list.
 *
 * @return {!Array<String>} A list of all block IDs (or XML, see onBlockAdded) that match the user's search.
 */
Blockly.Search.prototype.blocksMatchingSearchTerms = function (terms) {
  var intersectingMatches = null;

  // Go through each word in the terms
  for (var i = 0; i < terms.length; i++) {
    if (terms[i].length === 0) {
      continue;
    }

    // Get a set with all of the results for that word
    var matchSet = new Blockly.Set(this.blocksMatchingSearchTerm(terms[i]));

    // Intersect the results with previous results (if any)
    if (intersectingMatches) {
      intersectingMatches = intersectingMatches.intersection(matchSet);
    } else {
      intersectingMatches = matchSet;
    }
  }

  return intersectingMatches.getValues();
};

Blockly.Search.prototype.runSearch = function (inputValue) {
  // Prepare the contents of the search by trimming, lowercasing and splitting by whitespace
  var searchTerms = inputValue.trim().toLowerCase().split(/\s+/);

  // Remove those elements of the search terms that are empty (so no empty strings are in the search)
  searchTerms = Blockly.Search.filter(searchTerms, function (term) {
    return term.length > 0;
  });

  // Temporary list for results
  var matchingBlockIds = [];

  if (searchTerms.length > 0) {
    matchingBlockIds = this.blocksMatchingSearchTerms(searchTerms);
  }

  return matchingBlockIds;
};

/**
 * Clears the Search handler's trie and reinitializes it.
 *
 * Useful when all blocks get permanently removed (e.g. when changing from Simple to Advanced mode).
 */
Blockly.Search.prototype.clearAll = function () {
  delete this.blockTrie_;

  this.blockTrie_ = new Blockly.Trie();
};

// Filters out empty spaces. Stolen from Closure's goog.array.filter so we can remove it completely.
Blockly.Search.filter = function (arr, f, optObj) {
  var l = arr.length; // must be fixed during loop... see docs
  var res = [];
  var resLength = 0;
  var arr2 = (typeof arr === 'string') ? arr.split(' ') : arr;
  for (var i = 0; i < l; i++) {
    if (i in arr2) {
      var val = arr2[i]; // in case f mutates arr2
      if (f.call(optObj, val, i, arr)) {
        res[resLength++] = val;
      }
    }
  }
  return res;
};

/**
 * Static method that preprocesses all of a specific block's associated keywords
 * and puts them in a list. Ensures the elements of the list are single words, trimmed from any
 * exess whitespaces and other symbols.
 *
 * @param {!String} blockType The block's type ID, e.g. "fable_play_sound".
 * @param {!Array<String>} staticKeywords A list of all strings associated with the
 * block. Might have multiple words in a single element.
 * @param {!Array<String>} extraToolboxKeywords A list of extra strings that will be added to the toolbox search words.
 * These are for example, shadow blocks attached to the toolbox block, and all dropdown options.
 */
Blockly.Search.preprocessSearchKeywords = function (blockType, staticKeywords, extraToolboxKeywords) {
  // If the list is already initialized, we are done here
  if (!Blockly.Blocks[blockType].StaticSearchKeywords || Blockly.Blocks[blockType].StaticSearchKeywords.length === 0) {
    Blockly.Blocks[blockType].StaticSearchKeywords = [];
    Blockly.Search.initStaticKeywords(staticKeywords, Blockly.Blocks[blockType].StaticSearchKeywords);
  }

  if (!extraToolboxKeywords) {
    return;
  }

  if (!Blockly.Blocks[blockType].StaticToolboxSearchKeywords || Blockly.Blocks[blockType].StaticToolboxSearchKeywords.length === 0) {
    Blockly.Blocks[blockType].StaticToolboxSearchKeywords = [];
    Blockly.Search.initStaticKeywords(extraToolboxKeywords, Blockly.Blocks[blockType].StaticToolboxSearchKeywords);
  }
};

Blockly.Search.initStaticKeywords = function (keywordList, arrayToUse) {
  // Go through the provided list of words/sentences
  for (let i = 0; i < keywordList.length; i++) {
    // Try to decode a string. Used for the blocks that are defined in JSON (e.g. blocks/lists.js), where strings are defined in a different way - the "%{BKY_" prefix. Will not decode the string if the prefix isn't there.
    const interpolizedMessage = Blockly.utils.tokenizeInterpolation(keywordList[i])[0];

    // Skip this element if it ends up being undefined
    if (!interpolizedMessage) {
      continue;
    }

    // Clean the string (trim, lowercase, etc). Then split by whitespace.
    // Please ignore the linter on the regex
    const splitText = interpolizedMessage.trim().toLowerCase().replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/gi, '').split(' ');

    // Go through the single words of the element after splitting it.
    for (let j = 0; j < splitText.length; j++) {
      const text = splitText[j];

      // Add the keyword to the block's keywords
      if (text && text !== '') {
        arrayToUse.push(text);
      }
    }
  }
};

Blockly.Search.onLanguageChange = function () {
  const keys = Object.keys(Blockly.Blocks);

  if (keys.length > 0) {
    for (let i = 0; i < keys.length; i++) {
      const singleKey = keys[i];

      if (Blockly.Blocks[singleKey].StaticSearchKeywords) {
        Blockly.Blocks[singleKey].StaticSearchKeywords.length = 0;
      }

      if (Blockly.Blocks[singleKey].StaticToolboxSearchKeywords) {
        Blockly.Blocks[singleKey].StaticToolboxSearchKeywords.length = 0;
      }
    }
  }
};
