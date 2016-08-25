/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2016 Google Inc.
 * https://developers.google.com/blockly/
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * You may not use this file except in compliance with the License.
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
 * @fileoverview Javascript for BlockLibraryView class. It manages display of
 * the Block Library dropdown, save, and delete buttons.
 *
 * @author quachtina96 (Tina Quach)
 */

'use strict';

goog.provide('BlockLibraryView');

goog.require('goog.dom');
goog.require('goog.dom.classlist');

/**
 * BlockLibraryView Class
 * @constructor
 *
 * @param {!string} blockLibraryViewId - Id of the div element for the block
 *    library view.
 */
var BlockLibraryView = function(blockLibraryViewDivId) {
  // Div element to contain the block types to choose from.
  this.dropdown = goog.dom.getElement(blockLibraryViewDivId);
  // Map of block type to corresponding 'a' element that is the option in the
  // dropdown. Used to quickly and easily get a specific option.
  this.optionMap = Object.create(null);
  this.saveButton = goog.dom.getElement('saveToBlockLibraryButton');
  this.deleteButton = goog.dom.getElement('removeBlockFromLibraryButton');
  // Initially, user should not be able to delete a block. They must save a
  // block or select a stored block first.
  this.deleteButton.disabled = true;
};

/**
 * Creates a node of a given element type and appends to the node with given id.
 *
 * @param {!string} blockType - Type of block.
 * @param {boolean} selected - Whether or not the option should be selected on
 *    the dropdown.
 */
BlockLibraryView.prototype.addOption = function(blockType, selected) {
  // Create option.
  var option = goog.dom.createDom('a', {
    'id': 'dropdown_' + blockType,
    'class': 'blockLibOpt'
  }, blockType);

  // Add option to dropdown.
  this.dropdown.appendChild(option);
  this.optionMap[blockType] = option;

  // Select the block.
  if (selected) {
    this.setSelectedBlockType(blockType);
  }
};

/**
 * Sets a given block type to selected and all other blocks to deselected.
 * If null, deselects all blocks.
 *
 * @param {string} blockTypeToSelect - Type of block to select or null.
 */
BlockLibraryView.prototype.setSelectedBlockType = function(blockTypeToSelect) {
  if (this.optionMap[blockTypeToSelect]) {
    // Select given block type and deselect all others.
    for (var blockType in this.optionMap) {
      var option = this.optionMap[blockType];
      if (blockType == blockTypeToSelect) {
        this.select_(option);
      } else {
        this.deselect_(option);
      }
    }
  // Update save and delete buttons.
  // Block type is in library and has saved all changes.
  this.updateButtons(blockTypeToSelect, true, true);
  } else {
    // Deselect all buttons.
    for (var blockType in this.optionMap) {
      var option = this.optionMap[blockType];
      this.deselect_(option);
    }
  // Update save and delete buttons to reflect no selected block.
  this.updateButtons(blockTypeToSelect);
  }
};

/**
 * Selects a given option.
 *
 * @param {!Element} option - HTML 'a' element in the dropdown that represents
 *    a particular block type.
 */
BlockLibraryView.prototype.select_ = function(option) {
  goog.dom.classlist.add(option, 'dropdown-content-selected');
};

/**
 * Deselects a given option.
 *
 * @param {!Element} option - HTML 'a' element in the dropdown that represents
 *    a particular block type.
 */
BlockLibraryView.prototype.deselect_ = function(option) {
  goog.dom.classlist.remove(option, 'dropdown-content-selected');
};

/**
 * Updates the save and delete buttons to represent how the current block will
 * be saved by including the block type in the button text as well as indicating
 * whether the block is being saved or updated.
 *
 * @param {!Element} option - HTML 'a' element in the dropdown that represents
 *    a particular block type.
 * @param {boolean} inLib - Whether the block type is in the library.
 * @param {boolean} saved - Whether changes to block have been saved.
 */
BlockLibraryView.prototype.updateButtons =
    function(blockType, inLib, savedChanges) {
  if (blockType) {
    // User is editing a block.

    if (!inLib) {
      // Block type has not been saved to library yet.
      this.saveButton.textContent = 'Save "' + blockType + '"';
      this.saveButton.disabled = false;
      this.deleteButton.disabled = true;
    } else {
      // Block type has already been saved.
      this.saveButton.textContent = 'Update "' + blockType + '"';
      this.saveButton.disabled = true;
      this.deleteButton.disabled = false;
    }
    this.deleteButton.textContent = 'Delete "' + blockType + '"';

    if (!savedChanges) {
      // If changes to block have been made and are not saved, make button
      // green to encourage user to save the block.
      var buttonFormatClass = 'button_warn';
      // If block type is the default, 'block_type', make button red to alert
      // user.
      if (blockType == 'block_type') {
        buttonFormatClass = 'button_alert';
      }
      goog.dom.classlist.add(this.saveButton, buttonFormatClass);
      this.saveButton.disabled = false;
    } else {
      var classesToRemove = ['button_alert', 'button_warn'];
      goog.dom.classlist.removeAll(this.saveButton, classesToRemove);
      this.saveButton.disabled = true;
    }

  } else {
    // User has created new block.
    this.saveButton.textContent = 'Save "block_type"';
    this.deleteButton.textContent = 'Delete "block_type"';
    this.saveButton.disabled = true;
    this.deleteButton.disabled = true;
  }
};

/**
 * Removes option currently selected in dropdown from dropdown menu.
 */
BlockLibraryView.prototype.removeSelectedOption = function() {
  var selectedOption = this.getSelectedOption();
  this.dropdown.removeNode(selectedOption);
};

/**
 * Returns block type of selected block.
 *
 * @return {string} Type of block selected.
 */
BlockLibraryView.prototype.getSelectedBlockType = function() {
  var selectedOption = this.getSelectedOption();
  var blockType = selectedOption.textContent;
  return blockType;
};

/**
 * Returns selected option.
 *
 * @return {!Element} HTML 'a' element that is the option for a block type.
 */
BlockLibraryView.prototype.getSelectedOption = function() {
  return goog.dom.getElementByClass('dropdown-content-selected', this.dropdown);
};

/**
 * Removes all options from dropdown.
 */
BlockLibraryView.prototype.clearOptions = function() {
  var blockOpts = goog.dom.getElementsByClass('blockLibOpt', this.dropdown);
  if (blockOpts) {
    for (var i = 0, option; option = blockOpts[i]; i++) {
      goog.dom.removeNode(option);
    }
  }
};


