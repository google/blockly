/**
 * @fileoverview Search handler for Blockly.
 * Specifically handles all searches that happen in the toolbox.
 *
 * @author ivan@shaperobotics.com
 */
'use strict';

goog.provide('Blockly.ToolboxSearch');

goog.require('Blockly.Search');
goog.require('Blockly.ToolboxSearchHelper');

/**
 * Initializes the search handler.
 *
 * @param {!Blockly.Workspace} workspace The workspace in which to create the button callback.
 */
Blockly.ToolboxSearch = function (workspace) {
  // Initialize the base search handler
  Blockly.ToolboxSearch.superClass_.constructor.call(
    this, workspace);

  // Create a helper for any function blocks
  this.helper_ = new Blockly.ToolboxSearchHelper(this, workspace);
};
Blockly.utils.object.inherits(Blockly.ToolboxSearch, Blockly.Search);

/**
 * Initializes any extra stuff.
 * In particular, initializes the flyout that shows results.
 *
 * Has to be done away from the constructor, as some elements cannot be guaranteed to have loaded immediately.
 */
Blockly.ToolboxSearch.prototype.init_ = function () {
  // Define the flyout options.
  var flyoutWorkspaceOptions = {
    scrollbars: true,
    disabledPatternId: this.workspace_.options.disabledPatternId,
    parentWorkspace: this.workspace_,
    RTL: this.workspace_.RTL,
    oneBasedIndex: this.workspace_.options.oneBasedIndex,
    renderer: this.workspace_.options.renderer
  };

  // Create the vertical or horizontal flyout.
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

  // Insert the flyout immediately after the workspace's svg element.
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
 * @param {!String} val The XML structure of the block.
 */
Blockly.ToolboxSearch.prototype.onBlockAdded = function (type, val) {
  // Call the base class' onBlockAdded
  Blockly.ToolboxSearch.superClass_.onBlockAdded.call(this, type, val);

  // If there are any extra keywords for the toolbox, add them to the trie.
  if (Blockly.Blocks[type].StaticToolboxSearchKeywords) {
    var extraKeys = Blockly.Blocks[type].StaticToolboxSearchKeywords;

    // See if the block has been initialized before
    if (!this.blocksAdded_[val]) {
      this.blocksAdded_[val] = [];
    }

    // Go through all extra blocks
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
 * Executes a single search based on a search term.
 * The term gets cleaned up (separate words split, all lowercase, etc)
 * and the search is conducted.
 *
 * @param {String} inputValue the string which represents the search terms.
 *
 * @returns {int} the number results that match the search term.
 */
Blockly.ToolboxSearch.prototype.runSearch = function (inputVal) {
  this.finalResults_ = [];

  var matchingBlocks = Blockly.ToolboxSearch.superClass_.runSearch.call(this, inputVal);

  // // Create a label for the search results category
  // // TODO: Localization
  // var labelText = 'Search results:';
  // if (matchingBlocks.length === 0) {
  //   labelText = 'No results found';
  // }
  // var label = '<label web-class="subcategoryClass" text="' + labelText + '"></label>';

  // // Add the label to the flyout of results. Put it in the beginning.
  // matchingBlocks.splice(0, 0, label);

  // Go through the results and convert them to XML
  for (let i = 0; i < matchingBlocks.length; i++) {
    matchingBlocks[i] = Blockly.Xml.textToDom(matchingBlocks[i]);
  }

  // Show the resulting XML list in the flyout
  if (matchingBlocks.length > 0) {
    this.flyout_.show(matchingBlocks);
    this.flyout_.scrollToStart();

    // Store the results
    this.finalResults_ = this.flyout_.workspace_.topBlocks_;
  }

  return this.finalResults_.length;
};

/**
 * Highlights a result from a previously executed search.
 *
 * @param {number} index - The index of the result that should be highlighted
 * @returns {Void}
 */
Blockly.ToolboxSearch.prototype.highlightResult = function (index) {
  // Do nothing if there are no results
  if (!this.finalResults_ || this.finalResults_.length === 0) {
    return;
  }

  // Clamp the index so it's not out of bounds from the results
  index = Math.max(0, index);
  index = Math.min(index, this.finalResults_.length);

  // Find the result that should be highlighted
  var resultToScrollTo = this.finalResults_[index];

  // Highlight it
  resultToScrollTo.select();

  // Try to find its Y position so the flyout can scroll to it.
  try {
    var blockYPos = resultToScrollTo.flyoutRect_.getAttribute('y');
    this.flyout_.scrollbar_.set(blockYPos - 10);
  } catch (e) {
    console.log('Could not get the Y position of the block');
  }
};

/**
 * Execute this when the user "ends" a search by closing it.
 *
 * Resets the array which holds results. Also hides the flyout that had results.
 */
Blockly.ToolboxSearch.prototype.onCloseSearch = function () {
  // call the base method
  Blockly.ToolboxSearch.superClass_.onCloseSearch.call(this);

  // hide the flyout
  this.flyout_.hide();
};
