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
 * @fileoverview Javascript for the Block Exporter Controller class. Allows
 * users to export block definitions and generator stubs of their saved blocks
 * easily using a visual interface. Depends on Block Exporter View and Block
 * Exporter Tools classes. Interacts with Export Settings in the index.html.
 *
 * @author quachtina96 (Tina Quach)
 */

'use strict';

goog.provide('BlockExporterController');

goog.require('FactoryUtils');
goog.require('BlockExporterView');
goog.require('BlockExporterTools');
goog.require('goog.dom.xml');

/**
 * BlockExporter Controller Class
 * @constructor
 *
 * @param {!BlockLibrary.Storage} blockLibStorage - Block Library Storage.
 */
BlockExporterController = function(blockLibStorage) {
  // BlockLibrary.Storage object containing user's saved blocks.
  this.blockLibStorage = blockLibStorage;
  // Utils for generating code to export.
  this.tools = new BlockExporterTools();
  this.selectorID = 'blockSelector';
  // Map of block types stored in block library to their corresponding Block
  // Option objects.
  this.blockOptions = this.tools.createBlockSelectorFromLib(this.blockLibStorage,
    this.selectorID);
  // View provides the selector workspace and export settings UI.
  this.view = new BlockExporterView(this.blockOptions);
};

/**
 * Set the block library storage object from which exporter exports.
 *
 * @param {!BlockLibraryStorage} blockLibStorage - Block Library Storage object
 *    that stores the blocks.
 */
BlockExporterController.prototype.setBlockLibStorage =
    function(blockLibStorage) {
  this.blockLibStorage = blockLibStorage;
};

/**
 * Get the block library storage object from which exporter exports.
 *
 * @return {!BlockLibraryStorage} blockLibStorage - Block Library Storage object
 *    that stores the blocks.
 */
BlockExporterController.prototype.getBlockLibStorage =
    function(blockLibStorage) {
  return this.blockLibStorage;
};

/**
 * Get the selected block types.
 * @private
 *
 * @return {!Array.<string>} Types of blocks in workspace.
 */
BlockExporterController.prototype.getSelectedBlockTypes_ = function() {
  return this.view.getSelectedBlockTypes();
};

/**
 * Get selected blocks from selector workspace, pulls info from the Export
 * Settings form in Block Exporter, and downloads code accordingly.
 *
 * TODO(quachtina96): allow export as zip.
 */
BlockExporterController.prototype.export = function() {
  // Get selected blocks' information.
  var blockTypes = this.getSelectedBlockTypes_();
  var blockXmlMap = this.blockLibStorage.getBlockXmlMap(blockTypes);

  // Pull block definition(s) settings from the Export Settings form.
  var wantBlockDef = document.getElementById('blockDefCheck').checked;
  var definitionFormat = document.getElementById('exportFormat').value;
  var blockDef_filename = document.getElementById('blockDef_filename').value;

  // Pull block generator stub(s) settings from the Export Settings form.
  var wantGenStub = document.getElementById('genStubCheck').checked;
  var language = document.getElementById('exportLanguage').value;
  var generatorStub_filename = document.getElementById(
      'generatorStub_filename').value;

  if (wantBlockDef) {
    // User wants to export selected blocks' definitions.
    if (!blockDef_filename) {
      // User needs to enter filename.
      alert('Please enter a filename for your block definition(s) download.');
    } else {
      // Get block definition code in the selected format for the blocks.
      var blockDefs = this.tools.getBlockDefs(blockXmlMap,
          definitionFormat);
      // Download the file.
      FactoryUtils.createAndDownloadFile(
          blockDefs, blockDef_filename, definitionFormat);
    }
  }

  if (wantGenStub) {
    // User wants to export selected blocks' generator stubs.
    if (!generatorStub_filename) {
      // User needs to enter filename.
      alert('Please enter a filename for your generator stub(s) download.');
    } else {
      // Get generator stub code in the selected language for the blocks.
      var genStubs = this.tools.getGeneratorCode(blockXmlMap,
          language);
      // Download the file.
      FactoryUtils.createAndDownloadFile(
          genStubs, generatorStub_filename, language);
    }
  }

};

/**
 * Update the Exporter's block selector with block options generated from blocks
 * stored in block library.
 */
BlockExporterController.prototype.updateSelector = function() {
  this.blockOptions = this.tools.createBlockSelectorFromLib(this.blockLibStorage,
    this.selectorID);
  this.addBlockOptSelectHandlers();
  this.view.setBlockOptions(this.blockOptions);
};

/**
 * Tied to the 'Clear Selected Blocks' button in the Block Exporter.
 * Deselects all blocks in the selector and updates text accordingly.
 */
BlockExporterController.prototype.clearSelectedBlocks = function() {
  this.view.deselectAllBlocks();
  this.view.listSelectedBlocks();
};

/**
 * Tied to the 'Add All Stored Blocks' button in the Block Exporter.
 * Adds all blocks stored in block library to the selector workspace.
 */
BlockExporterController.prototype.addAllBlocksToWorkspace = function() {
  // For every block, render in selector workspace.
  var allBlockTypes = this.blockLibStorage.getBlockTypes();
  for (var i = 0, blockType; blockType = allBlockTypes[i]; i++) {
    this.view.select(blockType);
  }
  this.view.listSelectedBlocks();
};

/**
 * Returns the category xml containing all blocks in the block library.
 *
 * @return {Element} Xml for a category to be used in toolbox.
 */
BlockExporterController.prototype.getBlockLibCategory = function() {
  return this.tools.generateCategoryFromBlockLib(this.blockLibStorage);
};

/**
 * Add select handlers to each block option to update the view and the selected
 * blocks accordingly.
 */
BlockExporterController.prototype.addBlockOptSelectHandlers = function() {
  var self = this;
  for (var blockType in this.blockOptions) {
    var blockOption = this.blockOptions[blockType];
    // Use an additional closure to correctly assign the tab callback.
    blockOption.dom.addEventListener(
        'click', self.makeBlockOptSelectHandler_(blockOption));
  }
};

/**
 * Click handler for a block option. Toggles whether or not it's selected and
 * updates helper text accordingly.
 * @private
 *
 * @param {!BlockOption} A block option object belonging to the exporter's
 *    selector.
 */
BlockExporterController.prototype.updateSelectedBlockTypes_ =
    function(blockOption) {
  // Toggle selected.
  var selected = blockOption.isSelected() ? false : true;
  blockOption.setSelected(selected);

  // Show currently selected blocks in helper text.
  var selectedBlockTypes = this.view.getSelectedBlockTypes();
  this.view.listSelectedBlocks(this.selectedBlockTypes);
};

/**
 * Creates the block option select handler.
 * @private
 *
 * @param {!BlockOption} A block option object belonging to the exporter's
 *    selector.
 * @return {!Function} The select handler for a block option.
 */
BlockExporterController.prototype.makeBlockOptSelectHandler_ = function(blockOption) {
  var self = this;
  return function() {
    self.updateSelectedBlockTypes_(blockOption);
    // TODO(quachtiana96): uncomment line below once CL is merged.
    // self.updatePreview();
  };
};

