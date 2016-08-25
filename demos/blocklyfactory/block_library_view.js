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
 * @fileoverview Javascript for BlockLibraryView class. It manages the display
 * of the Block Library dropdown, save, and delete buttons.
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
 */
var BlockLibraryView = function() {
  // Div element to contain the block types to choose from.
  // Id of the div that holds the block library view.
  this.blockLibraryViewDivID = 'dropdownDiv_blockLib';
  this.dropdown = goog.dom.getElement('dropdownDiv_blockLib');
  // Map of block type to corresponding 'a' element that is the option in the
  // dropdown. Used to quickly and easily get a specific option.
  this.optionMap = Object.create(null);
  // Save and delete buttons.
  this.saveButton = goog.dom.getElement('saveToBlockLibraryButton');
  this.deleteButton = goog.dom.getElement('removeBlockFromLibraryButton');
  // Initially, user should not be able to delete a block. They must save a
  // block or select a stored block first.
  this.deleteButton.disabled = true;
};

/**
 * Open the Block Library dropdown.
 */
BlockLibraryView.prototype.show = function() {
  this.dropdown.classList.add("show");
};

/**
 * Close the Block Library dropdown.
 */
BlockLibraryView.prototype.hide = function() {
  this.dropdown.classList.remove("show");
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
  // Select given block type and deselect all others. Will deselect all blocks
  // if null or invalid block type selected.
  for (var blockType in this.optionMap) {
    var option = this.optionMap[blockType];
    if (blockType == blockTypeToSelect) {
      this.selectOption_(option);
    } else {
      this.deselectOption_(option);
    }
  }
};

/**
 * Selects a given option.
 * @private
 *
 * @param {!Element} option - HTML 'a' element in the dropdown that represents
 *    a particular block type.
 */
BlockLibraryView.prototype.selectOption_ = function(option) {
  goog.dom.classlist.add(option, 'dropdown-content-selected');
};

/**
 * Deselects a given option.
 * @private
 *
 * @param {!Element} option - HTML 'a' element in the dropdown that represents
 *    a particular block type.
 */
BlockLibraryView.prototype.deselectOption_ = function(option) {
  goog.dom.classlist.remove(option, 'dropdown-content-selected');
};

/**
 * Updates the save and delete buttons to represent how the current block will
 * be saved by including the block type in the button text as well as indicating
 * whether the block is being saved or updated.
 *
 * @param {!string} blockType - The type of block being edited.
 * @param {boolean} isInLibrary - Whether the block type is in the library.
 * @param {boolean} savedChanges - Whether changes to block have been saved.
 */
BlockLibraryView.prototype.updateButtons =
    function(blockType, isInLibrary, savedChanges) {
  if (blockType) {
    // User is editing a block.

    if (!isInLibrary) {
      // Block type has not been saved to library yet. Disable the delete button
      // and allow user to save.
      this.saveButton.textContent = 'Save "' + blockType + '"';
      this.saveButton.disabled = false;
      this.deleteButton.disabled = true;
    } else {
      // Block type has already been saved. Disable the save button unless the
      // there are unsaved changes (checked below).
      this.saveButton.textContent = 'Update "' + blockType + '"';
      this.saveButton.disabled = true;
      this.deleteButton.disabled = false;
    }
    this.deleteButton.textContent = 'Delete "' + blockType + '"';

    // If changes to block have been made and are not saved, make button
    // green to encourage user to save the block.
    if (!savedChanges) {
      var buttonFormatClass = 'button_warn';

      // If block type is the default, 'block_type', make button red to alert
      // user.
      if (blockType == 'block_type') {
        buttonFormatClass = 'button_alert';
      }
      goog.dom.classlist.add(this.saveButton, buttonFormatClass);
      this.saveButton.disabled = false;

    } else {
      // No changes to save.
      var classesToRemove = ['button_alert', 'button_warn'];
      goog.dom.classlist.removeAll(this.saveButton, classesToRemove);
      this.saveButton.disabled = true;
    }

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


