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
 * @fileoverview Contains the code for Block Library Controller, which
 * depends on Block Library Storage and Block Library UI. Provides the
 * interfaces for the user to
 *  - save their blocks to the browser
 *  - re-open and edit saved blocks
 *  - delete blocks
 *  - clear their block library
 * Depends on BlockFactory functions defined in factory.js.
 *
 * @author quachtina96 (Tina Quach)
 */
'use strict';

goog.provide('BlockLibraryController');

goog.require('BlockLibraryStorage');
goog.require('BlockLibraryView');
goog.require('BlockFactory');

/**
 * Block Library Controller Class
 * @constructor
 *
 * @param {string} blockLibraryName - Desired name of Block Library, also used
 *    to create the key for where it's stored in local storage.
 * @param {!BlockLibraryStorage} opt_blockLibraryStorage - optional storage
 *    object that allows user to import a block library.
 */
BlockLibraryController = function(blockLibraryName, opt_blockLibraryStorage) {
  this.name = blockLibraryName;
  // Create a new, empty Block Library Storage object, or load existing one.
  this.storage = opt_blockLibraryStorage || new BlockLibraryStorage(this.name);
  // Id of the div that holds the block library.
  this.blockLibraryViewDivID = 'dropdownDiv_blockLib';
  // The BlockLibraryView object handles the proper updating and formatting of
  // the dropdown.
  this.view = new BlockLibraryView(this.blockLibraryViewDivID);
};

/**
 * Returns the block type of the block the user is building.
 * @private
 *
 * @return {string} The current block's type.
 */
BlockLibraryController.prototype.getCurrentBlockType_ = function() {
  var rootBlock = FactoryUtils.getRootBlock(BlockFactory.mainWorkspace);
  var blockType = rootBlock.getFieldValue('NAME').trim().toLowerCase();
  // Replace white space with underscores
  return blockType.replace(/\W/g, '_').replace(/^(\d)/, '_\\1');
};

/**
 * Removes current block from Block Library
 *
 * @param {string} blockType - Type of block.
 */
BlockLibraryController.prototype.removeFromBlockLibrary = function() {
  var blockType = this.getCurrentBlockType_();
  this.storage.removeBlock(blockType);
  this.storage.saveToLocalStorage();
  this.populateBlockLibrary();
  this.view.setSelectedBlockType(blockType);
};

/**
 * Updates the workspace to show the block user selected from library
 *
 * @param {string} blockType - Block to edit on block factory.
 */
BlockLibraryController.prototype.openBlock = function(blockType) {
  if (blockType) {
    var xml = this.storage.getBlockXml(blockType);
    BlockFactory.mainWorkspace.clear();
    Blockly.Xml.domToWorkspace(xml, BlockFactory.mainWorkspace);
    BlockFactory.mainWorkspace.clearUndo();
  } else {
    BlockFactory.showStarterBlock();
    this.view.setSelectedBlockType(null);
  }
};

/**
 * Returns type of block selected from library.
 *
 * @return {string} Type of block selected.
 */
BlockLibraryController.prototype.getSelectedBlockType =
    function() {
  return this.view.getSelectedBlockType();
};

/**
 * Confirms with user before clearing the block library in local storage and
 * updating the dropdown and displaying the starter block (factory_base).
 */
BlockLibraryController.prototype.clearBlockLibrary = function() {
  var check = confirm('Delete all blocks from library?');
  if (check) {
    // Clear Block Library Storage.
    this.storage.clear();
    this.storage.saveToLocalStorage();
    // Update dropdown.
    this.view.clearOptions();
    // Show default block.
    BlockFactory.showStarterBlock();
    this.view.updateButtons(null);
  }
};

/**
 * Saves current block to local storage and updates dropdown.
 */
BlockLibraryController.prototype.saveToBlockLibrary = function() {
  var blockType = this.getCurrentBlockType_();

  // If user has not changed the name of the starter block.
  if (blockType == 'block_type') {
    // Do not save if the user doesn't want their block saved under the default name.
    if (!confirm('Are you sure you want to save your block as "block_type"?')) {
      return;
    }
  }

  // Create block xml.
  var xmlElement = goog.dom.createDom('xml');
  var block = FactoryUtils.getRootBlock(BlockFactory.mainWorkspace);
  xmlElement.appendChild(Blockly.Xml.blockToDomWithXY(block));

  // Save block.
  this.storage.addBlock(blockType, xmlElement);
  this.storage.saveToLocalStorage();

  // Show saved block without other stray blocks sitting in Block Factory's
  // main workspace.
  this.openBlock(blockType);

  // Do not add another option to dropdown if replacing.
  if (replace) {
    return;
  }
  this.view.addOption(blockType, true);
};

/**
 * Checks to see if the given blockType is already in Block Library
 *
 * @param {string} blockType - Type of block.
 * @return {boolean} Boolean indicating whether or not block is in the library.
 */
BlockLibraryController.prototype.isInBlockLibrary = function(blockType) {
  var blockLibrary = this.storage.blocks;
  return (blockType in blockLibrary && blockLibrary[blockType] != null);
};

/**
 *  Populates the dropdown menu.
 */
BlockLibraryController.prototype.populateBlockLibrary = function() {
  this.view.clearOptions();
  // Add option for each saved block.
  var blockLibrary = this.storage.blocks;
  for (var blockType in blockLibrary) {
    this.view.addOption(blockType, false);
  }
  this.addOptionSelectHandlers();
};

/**
 * Return block library mapping block type to xml.
 *
 * @return {Object} Object mapping block type to xml text.
 */
BlockLibraryController.prototype.getBlockLibrary = function() {
  return this.storage.getBlockXmlTextMap();
};

/**
 * Set the block library storage object from which exporter exports.
 *
 * @param {!BlockLibraryStorage} blockLibStorage - Block Library Storage
 *    object.
 */
BlockLibraryController.prototype.setBlockLibraryStorage
    = function(blockLibStorage) {
  this.storage = blockLibStorage;
};

/**
 * Get the block library storage object from which exporter exports.
 *
 * @return {!BlockLibraryStorage} blockLibStorage - Block Library Storage object
 *    that stores the blocks.
 */
BlockLibraryController.prototype.getBlockLibraryStorage = function() {
  return this.blockLibStorage;
};

/**
 * Get the block library storage object from which exporter exports.
 *
 * @return {boolean} True if the Block Library is empty, false otherwise.
 */
BlockLibraryController.prototype.hasEmptyBlockLibrary = function() {
  return this.storage.isEmpty();
};

/**
 * Get all block types stored in block library.
 *
 * @return {!Array<!string>} Array of block types.
 */
BlockLibraryController.prototype.getStoredBlockTypes = function() {
  return this.storage.getBlockTypes();
};

/**
 * Sets the currently selected block option to none.
 */
BlockLibraryController.prototype.setNoneSelected = function() {
  this.view.setSelectedBlockType(null);
};

/**
 * Add select handlers to each option to update the view and the selected
 * blocks accordingly.
 */
BlockLibraryController.prototype.addOptionSelectHandlers = function() {
  var self = this;

  // Click handler for a block option. Sets the block option as the selected
  // option and opens the block for edit in Block Factory.
  var setSelectedAndOpen_ = function(blockOption) {
    var blockType = blockOption.textContent;
    self.view.setSelectedBlockType(blockType);
    self.openBlock(blockType);
    self.view.updateButtons(blockType, true);
    goog.dom.getElement(self.blockLibraryViewDivID).classList.remove("show");
  };

  // Returns a block option select handler.
  var makeOptionSelectHandler_ = function(blockOption) {
    return function() {
      setSelectedAndOpen_(blockOption);
    };
  };

  // Assign a click handler to each block option.
  for (var blockType in this.view.optionMap) {
    var blockOption = this.view.optionMap[blockType];
    // Use an additional closure to correctly assign the tab callback.
    blockOption.addEventListener(
        'click', makeOptionSelectHandler_(blockOption));
  }
};

/**
 * Update the save and delete buttons based on the current block type of the
 * block the user is currently editing.
 */
BlockLibraryController.prototype.updateButtons = function() {
  var blockType = this.getCurrentBlockType_();
  var saved = this.isInBlockLibrary(blockType);
  this.view.updateButtons(blockType, saved);
};
