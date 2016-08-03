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
 * @param {blockLibrary} blockLibraryName - Desired name of Block Library, also
 *    used to create the key for where it's stored in local storage.
 */
BlockLibraryController = function(blockLibraryName) {
  this.name = blockLibraryName;
  // Create a new, empty Block Library Storage object, or load existing one.
  this.storage = new BlockLibraryStorage(this.name);
};

/**
 * Returns the block type of the block the user is building.
 *
 * @return {string} The current block's type.
 */
BlockLibraryController.prototype.getCurrentBlockType = function() {
  var rootBlock = BlockFactory.getRootBlock(BlockFactory.mainWorkspace);
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
};

/**
 * Updates the workspace to show the block user selected from library
 *
 * @param {string} blockType - Block to edit on block factory.
 */
BlockLibraryController.prototype.openBlock = function(blockType) {
   var xml = this.storage.getBlockXml(blockType);
   BlockFactory.mainWorkspace.clear();
   Blockly.Xml.domToWorkspace(xml, BlockFactory.mainWorkspace);
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
 * updating the dropdown.
 */
BlockLibraryController.prototype.clearBlockLibrary = function() {
  var check = confirm(
      'Click OK to clear your block library.');
  if (check) {
    // Clear Block Library Storage.
    this.storage.clear();
    this.storage.saveToLocalStorage();
    // Update dropdown.
    BlockLibraryView.clearOptions('blockLibraryDropdown');
    // Add a default, blank option to dropdown for when no block from library is
    // selected.
    BlockLibraryView.addDefaultOption('blockLibraryDropdown');
  }
};

/**
 * Saves current block to local storage and updates dropdown.
 */
BlockLibraryController.prototype.saveToBlockLibrary = function() {
  var blockType = this.getCurrentBlockType();
  // If block under that name already exists, confirm that user wants to replace
  // saved block.
  if (this.isInBlockLibrary(blockType)) {
    var replace = confirm('You already have a block called ' + blockType +
      ' in your library. Click OK to replace.');
    if (!replace) {
      // Do not save if user doesn't want to replace the saved block.
      return;
    }
  }
  // Save block.
  var xmlElement = Blockly.Xml.workspaceToDom(BlockFactory.mainWorkspace);
  this.storage.addBlock(blockType, xmlElement);
  this.storage.saveToLocalStorage();
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
BlockLibraryController.prototype.isInBlockLibrary = function(blockType) {
  var blockLibrary = this.storage.blocks;
  return (blockType in blockLibrary && blockLibrary[blockType] != null);
};

/**
 *  Populates the dropdown menu.
 */
BlockLibraryController.prototype.populateBlockLibrary = function() {
  if (this.storage.isEmpty()) {
    alert('Your block library is empty! Click "Save to Block Library" so ' +
         'you can reopen it the next time you visit Block Factory!');
  }
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

