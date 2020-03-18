/**
 * @fileoverview Search handler for Blockly.
 * Specifically handles all searches that happen in the main workspace.
 *
 * @author ivan@shaperobotics.com
 */
'use strict';

goog.provide('Blockly.WorkspaceSearch');

goog.require('Blockly.Search');
goog.require('Blockly.WorkspaceSearchHelper');

/**
 * Initializes the search handler and its associated GUI.
 *
 * @param {!Blockly.Workspace} workspace The workspace in which to create the button callback.
 */
Blockly.WorkspaceSearch = function (workspace) {
  // Initialize the search handler
  Blockly.WorkspaceSearch.superClass_.constructor.call(
    this, workspace);

  // Create a helper for any blocks added/deleted/modified in the workspace
  this.helper_ = new Blockly.WorkspaceSearchHelper(this, workspace);
};
Blockly.utils.object.inherits(Blockly.WorkspaceSearch, Blockly.Search);

/**
 * Adds a new block to the toolbox search handler's trie.
 * Extends the logic of its parent class (@see search.js) by including all "dropdown" options to the search.
 *
 * @param {!String} type The type ID of the block, e.g. "fable_play_sound".
 * @param {!String} val The ID of the block that's being added.
 */
Blockly.WorkspaceSearch.prototype.onBlockAdded = function (type, val) {
  // Call the base method
  Blockly.WorkspaceSearch.superClass_.onBlockAdded.call(this, type, val);

  // Get the block from the workspace
  const block = this.workspace_.getBlockById(val);

  // If the block is not found, there's nothing we can do.
  if (!block) {
    console.warn('Cannot find newly created block with ID ' + val);
    return;
  }
  // Get the block's dynamic inputs
  // FieldDropdown / FieldTextInput / FieldBoolean / ButtonInput / AsciiInput / FieldAngle / FieldJointAngle
  // @todo Add any other types that we end up creating
  var dynamicKeywords = this.helper_.generateDynamicKeywords_(block);

  // See if the block has been initialized before
  if (!this.blocksAdded_[val]) {
    this.blocksAdded_[val] = [];
  }

  // Go through all dynamic keywords and add them to the trie
  for (var i = 0; i < dynamicKeywords.length; i++) {
    // Clean the string (trim, lowercase, etc). Then split by whitespace.
    // Please ignore the linter on the regex
    const splitText = dynamicKeywords[i].trim().toLowerCase().replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/gi, '').split(' ');

    // Go through the single words of the element after splitting it.
    for (let j = 0; j < splitText.length; j++) {
      const text = splitText[j];

      // Add the keyword to the block's keywords
      if (text && text !== '') {
        // Add a keyword to the search trie
        this.addToTrie(text, val);

        // Add the reverse information as well, i.e. add the keyword to the block's list of keywords
        this.blocksAdded_[val].push(text);
      }
    }
  }
};

/**
 * Executes a single search based on a search term.
 * The term gets cleaned up (separate words split, all lowercase, etc)
 * and the search is conducted.
 *
 * Additionally, any blocks that cannot be verified are removed from the results.
 * The results are also sorted by their vertical position in the workspace.
 *
 * @param {String} inputValue the string which represents the search terms.
 *
 * @returns {int} the number results that match the search term.
 */
Blockly.WorkspaceSearch.prototype.runSearch = function (inputVal) {
  var matchingBlockIds = Blockly.WorkspaceSearch.superClass_.runSearch.call(this, inputVal);

  // Initialize a list that will hold the results
  this.finalResults_ = [];

  if (matchingBlockIds.length > 0) {
    var counter = 0;

    // Go through the temporary results
    while (counter < matchingBlockIds.length) {
      // Search for the block inside the workspace
      var block = this.workspace_.getBlockById(matchingBlockIds[counter]);

      // Only add the block if it is found (could be that the workspace has hidden blocks inside it?)
      if (block) {
        this.finalResults_.push(block);
      }

      counter++;
    }

    // Sort the final results by the sortObjects_ function. It uses the physical
    // location of blocks so blocks on top of other blocks are always first.
    this.finalResults_.sort(Blockly.Workspace.prototype.sortObjects_);
  }

  return this.finalResults_.length;
};

/**
 * Highlights a result from a previously executed search.
 *
 * @param {number} index - The index of the result that should be highlighted
 * @returns {Void}
 */
Blockly.WorkspaceSearch.prototype.highlightResult = function (index) {
  // Do nothing if there are no results
  if (!this.finalResults_ || this.finalResults_.length === 0) {
    return;
  }

  // Clamp the index so it's not out of bounds from the results
  index = Math.max(0, index);
  index = Math.min(index, this.finalResults_.length);

  // Find the result that should be highlighted
  var resultToShow = this.finalResults_[index];

  // Center the workspace on it and hightlight it
  this.workspace_.centerOnBlock(resultToShow.id);
  resultToShow.select();
};

/**
 * Execute this when the user "ends" a search by closing it.
 *
 * Resets the array which holds results.
 * Removes any highlighting applied to blocks in the workspace.
 */
Blockly.WorkspaceSearch.prototype.onCloseSearch = function () {
  // call the base method
  Blockly.WorkspaceSearch.superClass_.onCloseSearch.call(this);

  // Reset workspace highlighting
  this.workspace_.highlightBlock('');
  if (Blockly.selected) {
    Blockly.selected.unselect();
  }
};
