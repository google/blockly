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
              this.blocksAdded_[event.blockId].splice(l, 1);
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
  }
};

Blockly.WorkspaceSearch.prototype.runSearch = function (inputVal) {
  var matchingBlockIds = Blockly.WorkspaceSearch.superClass_.runSearch.call(this, inputVal);

  // Initialize a list that will hold the results
  var finalResults = [];

  if (matchingBlockIds.length > 0) {
    var counter = 0;

    // Go through the temporary results
    while (counter < matchingBlockIds.length) {
      // Search for the block inside the workspace
      var block = this.workspace_.getBlockById(matchingBlockIds[counter]);

      // Only add the block if it is found (could be that the workspace has hidden blocks inside it?)
      if (block) {
        finalResults.push(block);
      }

      counter++;
    }

    // Sort the final results by the sortObjects_ function. It uses the physical
    // location of blocks so blocks on top of other blocks are always first.
    finalResults.sort(Blockly.Workspace.prototype.sortObjects_);
  }

  return finalResults;
};
