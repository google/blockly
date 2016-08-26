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
};

/**
 * Returns the block type of the block the user is building.
 * @private
 *
 * @return {string} The current block's type.
 */
BlockLibraryController.prototype.getCurrentBlockType = function() {
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
  var blockType = this.getCurrentBlockType();
  this.storage.removeBlock(blockType);
  this.storage.saveToLocalStorage();
  this.populateBlockLibrary();
  // Show default block.
  BlockFactory.showStarterBlock();
};

/**
 * Updates the workspace to show the block user selected from library
 *
 * @param {string} blockType - Block to edit on block factory.
 */
BlockLibraryController.prototype.openBlock = function(blockType) {
  if (blockType =='BLOCK_LIBRARY_DEFAULT_BLANK') {
    BlockFactory.showStarterBlock();
  } else {
    var xml = this.storage.getBlockXml(blockType);
    BlockFactory.mainWorkspace.clear();
    Blockly.Xml.domToWorkspace(xml, BlockFactory.mainWorkspace);
    BlockFactory.mainWorkspace.clearUndo();
  }
};

/**
 * Returns type of block selected from library.
 *
 * @param {Element} blockLibraryDropdown - The block library dropdown.
 * @return {string} Type of block selected.
 */
BlockLibraryController.prototype.getSelectedBlockType =
    function(blockLibraryDropdown) {
  return BlockLibraryView.getSelected(blockLibraryDropdown);
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
    BlockLibraryView.clearOptions('blockLibraryDropdown');
    // Add a default, blank option to dropdown for when no block from library is
    // selected.
    BlockLibraryView.addDefaultOption('blockLibraryDropdown');
    // Show default block.
    BlockFactory.showStarterBlock();
  }
};

/**
 * Saves current block to local storage and updates dropdown.
 */
BlockLibraryController.prototype.saveToBlockLibrary = function() {
  var blockType = this.getCurrentBlockType();
  // If block under that name already exists, confirm that user wants to replace
  // saved block.
  if (this.has(blockType)) {
    var replace = confirm('You already have a block called "' + blockType +
      '" in your library. Replace this block?');
    if (!replace) {
      // Do not save if user doesn't want to replace the saved block.
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
  BlockLibraryView.addOption(
      blockType, blockType, 'blockLibraryDropdown', true, true);
};

/**
 * Checks to see if the given blockType is already in Block Library
 *
 * @param {string} blockType - Type of block.
 * @return {boolean} Boolean indicating whether or not block is in the library.
 */
BlockLibraryController.prototype.has = function(blockType) {
  var blockLibrary = this.storage.blocks;
  return (blockType in blockLibrary && blockLibrary[blockType] != null);
};

/**
 *  Populates the dropdown menu.
 */
BlockLibraryController.prototype.populateBlockLibrary = function() {
  BlockLibraryView.clearOptions('blockLibraryDropdown');
  // Add a default, blank option to dropdown for when no block from library is
  // selected.
  BlockLibraryView.addDefaultOption('blockLibraryDropdown');
  // Add option for each saved block.
  var blockLibrary = this.storage.blocks;
  for (var block in blockLibrary) {
    // Make sure the block wasn't deleted.
    if (blockLibrary[block] != null) {
      BlockLibraryView.addOption(
          block, block, 'blockLibraryDropdown', false, true);
    }
  }
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
 * Return stored xml of a given block type.
 *
 * @param {!string} blockType - The type of block.
 * @return {!Element} Xml element of a given block type or null.
 */
BlockLibraryController.prototype.getBlockXml = function(blockType) {
  return this.storage.getBlockXml(blockType);
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
