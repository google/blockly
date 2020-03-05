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

goog.provide('Blockly.WorkspaceSearch');

goog.require('Blockly.Search');

/**
 * Initializes the search handler and its associated GUI.
 *
 * @param {!Blockly.Workspace} workspace The workspace in which to create the button callback.
 */
Blockly.WorkspaceSearch = function (workspace) {
  // Initialize the search handler
  Blockly.WorkspaceSearch.superClass_.constructor.call(
    this, workspace);

  var thisObj = this;

  // Add a workspace change listener (so blocks get added/removed to a trie when
  // the user adds/removes them to/from the workspace)
  this.workspace_.addChangeListener(function (event) {
    thisObj.onNewWorkspaceEvent(event);
  });

  // Get the GUI elements
  this.searchMenu_ = document.getElementById('workspaceSearchDiv');

  this.searchInput_ = document.getElementById('workspaceSearchInput');

  this.resultsNumberHolder_ = document.getElementById('resultsCount');

  this.buttonsHolder_ = document.getElementById('buttonsHolder');
  this.prevButton_ = document.getElementById('prevWorkspaceHolder');
  this.nextButton_ = document.getElementById('nextWorkspaceHolder');

  // Set some styling (for an expanding animation)
  this.resultsNumberHolder_.style.minWidth = '0px';
  this.resultsNumberHolder_.style.maxWidth = '0px';
  this.buttonsHolder_.style.maxWidth = '0px';

  // Add more event listeners
  this.searchInput_.addEventListener('keydown', function (event) {
    event.stopPropagation();
  });

  this.searchInput_.addEventListener('click', function (event) {
    event.stopPropagation();

    // Change the styling to trigger the expanding animation
    thisObj.resultsNumberHolder_.style.minWidth = '50px';
    thisObj.resultsNumberHolder_.style.maxWidth = '50px';
    thisObj.buttonsHolder_.style.maxWidth = '140px';
  });

  // Add an event listener for when the user clicks outside the search bar
  this.searchInput_.addEventListener('blur', function (event) {
    // Specifically check for the search bar's children elements. Do NOT blur if those are clicked.
    if (event.relatedTarget &&
      ((event.relatedTarget.id && event.relatedTarget.id === 'workspaceSearchDiv') ||
      (event.relatedTarget.id && event.relatedTarget.id === 'resultsCount') ||
      (event.relatedTarget.id && event.relatedTarget.id === 'prevWorkspaceHolder') ||
      (event.relatedTarget.id && event.relatedTarget.id === 'nextWorkspaceHolder') ||
      (event.relatedTarget.id && event.relatedTarget.id === 'closeWorkspaceHolder'))) {
      event.stopPropagation();
      thisObj.focusSearchField();
      return;
    }

    thisObj.lastSearchValue_ = '';
    thisObj.onBlur(event);
  });

  this.searchInput_.addEventListener('search', function (event) {
    event.preventDefault();

    if (thisObj.searchInput_.value.length === 0) {
      thisObj.lastSearchValue_ = '';
      thisObj.searchInput_.blur();
      thisObj.onBlur(event);
    }

    // thisObj.executeSearchOnKeyUp(event, thisObj);
  });

  // Execute the search on a keyup event
  this.searchInput_.addEventListener('keyup', function (event) {
    thisObj.executeSearchOnKeyUp(event, thisObj);
  });

  // Event listener for clicking the "next" button. Will try to show the next result, if one exists.
  this.nextButton_.addEventListener('click', function (event) {
    event.preventDefault();
    thisObj.showNextResult(true);
  });

  // Event listener for clicking the "previous" button. Will try to show the previous result, if one exists.
  this.prevButton_.addEventListener('click', function (event) {
    event.preventDefault();
    thisObj.showNextResult(false);
  });
};
Blockly.utils.object.inherits(Blockly.WorkspaceSearch, Blockly.Search);

/**
 * Adds a new block to the toolbox search handler's trie.
 * Extends the logic of its parent class (@see search.js) by including all "dropdown" options to the search.
 *
 * @param {!String} type The type ID of the block, e.g. "fable_play_sound".
 * @param {!String} val The block itself. Similar to addToTrie, will either be XML or the unique block ID.
 */
Blockly.WorkspaceSearch.prototype.onBlockAdded = function (type, val) {
  Blockly.WorkspaceSearch.superClass_.onBlockAdded.call(this, type, val);

  // Iterate through the block's dynamic inputs
  // FieldDropdown / FieldTextInput / FieldBoolean / ButtonInput / AsciiInput / FieldAngle / FieldJointAngle
  // TODO: Add any other types that we end up creating
  const block = this.workspace_.getBlockById(val);

  if (!block) {
    console.warn('Cannot find newly created block with ID ' + val);
    return;
  }

  var dynamicKeywords = this.generateDynamicKeywords_(block);

  // See if the block has been initialized before
  if (!this.blocksAdded_[val]) {
    this.blocksAdded_[val] = [];
  }

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

Blockly.WorkspaceSearch.prototype.generateDynamicKeywords_ = function (block) {
  var dynamicKeywords = [];

  for (var i = 0; i < block.inputList.length; i++) {
    var input = block.inputList[i];

    for (var j = 0; j < input.fieldRow.length; j++) {
      var field = input.fieldRow[j];

      if (field instanceof Blockly.FieldDropdown) {
        var selectedDropdown;
        if (field.menuGenerator_ && typeof field.menuGenerator_ !== 'function') {
          selectedDropdown = field.menuGenerator_[field.selectedIndex_];
        } else if (field.generatedOptions_) {
          selectedDropdown = field.generatedOptions_[field.selectedIndex_];
        }

        if (selectedDropdown[0] && typeof selectedDropdown[0] === 'string') {
          dynamicKeywords.push(selectedDropdown[0].toString());
        }
        if (selectedDropdown[1]) {
          dynamicKeywords.push(selectedDropdown[1].toString());
        }
      } else if (field instanceof Blockly.FieldTextInput ||
                 field instanceof Blockly.FieldAngle ||
                 field instanceof Blockly.FieldJointAngle) {
        dynamicKeywords.push(field.value_.toString());
      } else if (field instanceof Blockly.ButtonInput ||
                 field instanceof Blockly.AsciiInput) {
        dynamicKeywords.push(field.getDisplayText_());
      } else if (field instanceof Blockly.FieldBoolean) {
        dynamicKeywords.push(field.value_.toString());
        dynamicKeywords.push(field.value_ ? Blockly.Msg.LOGIC_BOOLEAN_TRUE : Blockly.Msg.LOGIC_BOOLEAN_FALSE);
      }
    }
  }

  return dynamicKeywords;
};

/**
 * Event handler for whenever the Blockly workspace changes.
 * Specifically needed to add or remove blocks to the Search handler's trie
 * whenever the user adds or removes blocks from the workspace.
 *
 * @param {!Blockly.Event} event The Blockly event that got fired because of something changing in Blockly.
 */
Blockly.WorkspaceSearch.prototype.onNewWorkspaceEvent = function (event) {
  var i;
  var blockData;

  // If a block was added to the workspace, add it's associated keywords to the handler's trie.
  if (event.type === Blockly.Events.CREATE) {
    // Decode the XML contents so any child blocks that also got added to the workspace get added to the trie as well,
    // e.g. for procedure blocks that hold multiple children inside them.
    var blocksAdded = this.decodeXmlBlocks(event.xml);

    for (i = 0; i < blocksAdded.length; i++) {
      blockData = blocksAdded[i];

      if (blockData[0] && blockData[1]) {
        this.onBlockAdded(blockData[0], blockData[1]);
      }
    }
  } else if (event.type === Blockly.Events.DELETE) {
    // If a block was removed from the workspace, remove it's associated keywords from the handler's trie.
    // Decode the XML contents so any child blocks that got removed from the workspace also get removed from the trie,
    // e.g. for procedure blocks that hold multiple children inside them.
    var blocksRemoved = this.decodeXmlBlocks(event.oldXml);

    for (i = 0; i < blocksRemoved.length; i++) {
      blockData = blocksRemoved[i];

      if (blockData[0] && blockData[1]) {
        this.onBlockRemoved(blockData[0], blockData[1]);
      }
    }
  } else if (event.type === Blockly.Events.CHANGE && event.element === 'field') {
    var blockInfo = this.workspace_.getBlockById(event.blockId);
    var changedField = blockInfo.getField(event.name);
    var toAdd = [];
    var toRemove = [];

    if (changedField instanceof Blockly.FieldDropdown) {
      var dropdownOptions;
      if (changedField.menuGenerator_ && typeof changedField.menuGenerator_ !== 'function') {
        dropdownOptions = changedField.menuGenerator_;
      } else if (changedField.generatedOptions_) {
        dropdownOptions = changedField.generatedOptions_;
      }

      for (var i = 0; i < dropdownOptions.length; i++) {
        var dropdown = dropdownOptions[i];
        if (dropdown[1]) {
          if (dropdown[1] === event.oldValue) {
            if (typeof dropdown[0] === 'string') {
              toRemove.push(dropdown[0]);
            }
            toRemove.push(dropdown[1]);
          } else if (dropdown[1] === event.newValue) {
            if (typeof dropdown[0] === 'string') {
              toAdd.push(dropdown[0]);
            }
            toAdd.push(dropdown[1]);
          }
        }
      }
    } else if (changedField instanceof Blockly.FieldBoolean) {
      toAdd.push(event.newValue.toString());
      toAdd.push(event.newValue ? Blockly.Msg.LOGIC_BOOLEAN_TRUE : Blockly.Msg.LOGIC_BOOLEAN_FALSE);
      toRemove.push((!event.newValue).toString());
      toRemove.push(!event.newValue ? Blockly.Msg.LOGIC_BOOLEAN_TRUE : Blockly.Msg.LOGIC_BOOLEAN_FALSE);
    } else if (changedField instanceof Blockly.ButtonInput ||
               changedField instanceof Blockly.AsciiInput) {
      toAdd.push(changedField.getDisplayText_());
      toRemove.push(changedField.getDisplayText_(event.oldValue));
    } else if (changedField instanceof Blockly.FieldTextInput ||
              changedField instanceof Blockly.FieldAngle ||
              changedField instanceof Blockly.FieldJointAngle) {
      toAdd.push(event.newValue.toString());
      toRemove.push(event.oldValue.toString());
    }

    var j;
    for (j = 0; j < toRemove.length; j++) {
      const splitText = toRemove[j].trim().toLowerCase().replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/gi, '').split(' ');

      // Go through the single words of the element after splitting it.
      for (let k = 0; k < splitText.length; k++) {
        const text = splitText[k];

        // Remove the keyword from the block's keywords
        if (text && text !== '') {
          // Remove a keyword from the search trie
          this.removeFromTrie(text, event.blockId);

          // Remove the reverse information as well, i.e. remove the keyword from the block's list of keywords
          for (let l = 0; l < this.blocksAdded_[event.blockId].length; l++) {
            if (this.blocksAdded_[event.blockId][l] === text) {
              this.blocksAdded_[event.blockId] = this.blocksAdded_[event.blockId].splice(l, 1);
              l--;
            }
          }
        }
      }
    }

    for (j = 0; j < toAdd.length; j++) {
      const splitText = toAdd[j].trim().toLowerCase().replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/gi, '').split(' ');
      // Go through the single words of the element after splitting it.
      for (let k = 0; k < splitText.length; k++) {
        const text = splitText[k];

        // Add the keyword to the block's keywords
        if (text && text !== '') {
          // Add a keyword to the search trie
          this.addToTrie(text, event.blockId);

          // Add the reverse information as well, i.e. add the keyword to the block's list of keywords
          this.blocksAdded_[event.blockId].push(text);
        }
      }
    }

    console.log(changedField);
    console.log(event.oldValue);
    console.log(event.newValue);
  }
};

/**
 * Utility function that decode's a Blockly event's XML contents.
 * Used to find all blocks that got simultaneously added/removed in the same Blockly event.
 *
 * Loosely based on Blockly.Xml.domToBlockHeadless_, with the main
 * difference that it doesn't create any new blocks (so it avoids creating the block that was just created AGAIN).
 *
 * @param {!String} xmlBlock XML of the block. Provided by the Blockly event.
 */
Blockly.WorkspaceSearch.prototype.decodeXmlBlocks = function (xmlBlock) {
  var allBlocks = [];

  var nodeName = xmlBlock.nodeName;

  // Skip XML elements that are not blocks or shadow blocks
  if (nodeName.toUpperCase() !== 'BLOCK' &&
      nodeName.toUpperCase() !== 'SHADOW') {
    return allBlocks;
  }

  // Add the topmost block of the provided XML
  var topMostBlockType = xmlBlock.getAttribute('type');
  var id = xmlBlock.getAttribute('id');

  allBlocks.push([topMostBlockType, id]);

  // Go through the children of the topmost block
  for (var i = 0, xmlChild; xmlChild = xmlBlock.childNodes[i]; i++) {
    if (xmlChild.nodeType === 3) {
      // Ignore any text at the <block> level.  It's all whitespace anyway.
      continue;
    }

    // Find any enclosed blocks or shadows in this tag.
    var childBlockElement = null;
    var childShadowElement = null;

    // Get the current child. Either a block or a shadow block
    for (var j = 0, grandchild; grandchild = xmlChild.childNodes[j]; j++) {
      if (grandchild.nodeType === 1) {
        if (grandchild.nodeName.toLowerCase() === 'block') {
          childBlockElement = /** @type {!Element} */ (grandchild);
        } else if (grandchild.nodeName.toLowerCase() === 'shadow') {
          childShadowElement = /** @type {!Element} */ (grandchild);
        }
      }
    }
    // Use the shadow block if there is no child block.
    if (!childBlockElement && childShadowElement) {
      childBlockElement = childShadowElement;
    }

    // If the element is a value, statement, or next element, then it might have further child blocks inside.
    // Recursively call the same function to get those potential inner blocks.
    switch (xmlChild.nodeName.toLowerCase()) {
      default:
        break;
      case 'value':
      case 'statement':
      case 'next':
        if (childBlockElement) {
          var blockChild = this.decodeXmlBlocks(childBlockElement);

          for (var k = 0, grandchild; grandchild = blockChild[k]; k++) {
            allBlocks.push(grandchild);
          }
        }
        break;
    }
  }

  return allBlocks;
};

/**
 * Event handler for executing a search. Happens upon the user adding a new character (or removing one, as well).
 *
 */
Blockly.WorkspaceSearch.prototype.executeSearchOnKeyUp = function (e) {
  var search = this;

  // If the user pressed Escape, clear the search and unfocus the search box.
  if (e.keyCode === 27) {
    search.lastSearchValue_ = '';
    search.searchInput_.blur();
    search.onBlur(e);
    return;
  } else if (e.keyCode === 13) {
    // If the user pressed Enter, show the next result (or previous when Shift + Enter)
    search.showNextResult(!e.shiftKey);
    return;
  }

  // Get the text inside the search bar
  const searchBarValue = e.target.value;

  // Do NOT continue with the search if nothing changed in the text inside the search bar
  if (search.lastSearchValue_ && searchBarValue === search.lastSearchValue_) {
    return;
  }

  // Save the user's saved text
  search.lastSearchValue_ = searchBarValue;

  // Prepare the contents of the search by trimming, lowercasing and splitting by whitespace
  var searchTerms = search.lastSearchValue_.trim().toLowerCase().split(/\s+/);

  // Remove those elements of the search terms that are empty (so no empty strings are in the search)
  searchTerms = Blockly.Toolbox.TreeSearch.filter(searchTerms, function (term) {
    return term.length > 0;
  });

  // Initialize a list that will hold the results
  search.finalResults_ = [];

  // Temporary list for results
  var matchingBlockIds = [];

  if (searchTerms.length > 0) {
    matchingBlockIds = search.blocksMatchingSearchTerms(searchTerms);
  }

  if (matchingBlockIds.length > 0) {
    var counter = 0;

    // Go through the temporary results
    while (counter < matchingBlockIds.length) {
      // Search for the block inside the workspace
      var block = search.workspace_.getBlockById(matchingBlockIds[counter]);

      // Only add the block if it is found (could be that the workspace has hidden blocks inside it?)
      if (block) {
        search.finalResults_.push(block);
      }

      counter++;
    }
  }

  // Sort the final results by the sortObjects_ function. It uses the physical
  // location of blocks so blocks on top of other blocks are always first.
  search.finalResults_.sort(Blockly.Workspace.prototype.sortObjects_);

  // Show the first result, if possible
  search.currentIndex = -1;
  search.showNextResult(true);
};

/**
 * Hightlights the next (or previous) result from a search.
 * Unhighlights the previously shown result.
 *
 * @param {!Boolean} direction If true, will show next result. If false, will show previous result.
 */
Blockly.WorkspaceSearch.prototype.showNextResult = function (direction) {
  var search = this;

  // If no results were found, do not hightlight anything. Unhighlight any previously highlighted blocks
  if (search.finalResults_.length === 0) {
    search.workspace_.highlightBlock('');
    if (search.currentResult) {
      search.currentResult.unselect();
    }
    search.resultsNumberHolder_.innerHTML = '0/0';
    // search.nextButton_.disabled = true;
    // search.prevButton_.disabled = true;
    return;
  }

  // search.nextButton_.disabled = false;
  // search.prevButton_.disabled = false;

  // Determine whether the next or previous block will be shown
  if (direction) {
    search.currentIndex++;
  } else {
    search.currentIndex--;
  }

  // Wrap around to the start (or end) of the results if
  // "next" if pressed after the last block was shown
  if (search.finalResults_.length <= search.currentIndex) {
    search.currentIndex = 0;
  } else if (search.currentIndex < 0) {
    search.currentIndex = search.finalResults_.length - 1;
  }

  // Show the number of results
  search.resultsNumberHolder_.innerHTML = (search.currentIndex + 1) + '/' + (search.finalResults_.length);

  // Hightlight the block (and move the workspace to show it in the center)
  search.currentResult = search.finalResults_[search.currentIndex];
  search.currentResult.select();
  search.workspace_.centerOnBlock(search.currentResult.id);
  search.workspace_.highlightBlock(search.currentResult.id);
};

/**
 * Event handler for whenever the user moves out of the search bar.
 * Unhighlights all blocks and starts the shrinking animation of the search bar.
 */
Blockly.WorkspaceSearch.prototype.onBlur = function (e) {
  var search = this;
  search.workspace_.highlightBlock('');

  if (search.currentResult) {
    search.currentResult.unselect();
  }

  search.searchInput_.value = '';

  search.resultsNumberHolder_.innerHTML = '';

  // search.searchMenu_.style.visibility = "hidden";
  search.resultsNumberHolder_.style.minWidth = '0px';
  search.resultsNumberHolder_.style.maxWidth = '0px';
  search.buttonsHolder_.style.maxWidth = '0px';

  search.finalResults_ = [];
};

/**
 * Event handler for focusing the search bar in the top menu bar.
 * Starts the expand animation of the bar and focuses it so the user can type in it.
 */
Blockly.WorkspaceSearch.prototype.focusSearchField = function () {
  // this.searchMenu_.style.visibility = "visible";
  this.resultsNumberHolder_.style.minWidth = '50px';
  this.resultsNumberHolder_.style.maxWidth = '50px';
  this.buttonsHolder_.style.maxWidth = '140px';

  this.searchInput_.focus();
};
