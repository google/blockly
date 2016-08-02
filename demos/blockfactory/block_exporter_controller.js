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
  // BlockLibrary.Storage object containing user's saved blocks
  this.blockLibStorage = blockLibStorage;
  // Utils for generating code to export
  this.tools = new BlockExporterTools();
  // View provides the selector workspace and export settings UI.
  this.view = new BlockExporterView(
      //Xml representation of the toolbox
      this.tools.generateToolboxFromLibrary(this.blockLibStorage));
  // Object mapping disabled block types to their enabled xmls
  this.disabledBlocks = Object.create(null);
};

/**
 * Get the selected block types.
 * @private
 *
 * @return {!Array.<string>} Types of blocks in workspace.
 */
BlockExporterController.prototype.getSelectedBlockTypes_ = function() {
  var selectedBlocks = this.view.selectorWorkspace.getAllBlocks();
  var blockTypes = [];
  for (var i = 0; i < selectedBlocks.length; i++) {
    blockTypes.push(selectedBlocks[i].type);
  }
  return blockTypes;
};

/**
 * Get selected blocks from selector workspace, pulls info from the Export
 * Settings form in Block Exporter, and downloads block code accordingly.
 */
BlockExporterController.prototype.exportBlocks = function() {
  var blockTypes = this.getSelectedBlockTypes_();
  var blockXmlMap = this.blockLibStorage.getBlockXmlMap(blockTypes);

  // Pull inputs from the Export Settings form.
  var definitionFormat = document.getElementById('exportFormat').value;
  var language = document.getElementById('exportLanguage').value;
  var blockDef_filename = document.getElementById('blockDef_filename').value;
  var generatorStub_filename = document.getElementById(
      'generatorStub_filename').value;
  var wantBlockDef = document.getElementById('blockDefCheck').checked;
  var wantGenStub = document.getElementById('genStubCheck').checked;

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
      BlockFactory.createAndDownloadFile_(
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
      BlockFactory.createAndDownloadFile_(
          genStubs, generatorStub_filename, language);
    }
  }
};

/**
 * Update the Exporter's toolbox.
 *
 * @param {Element} opt_toolboxXml - Xml to define toolbox of the selector
 *    workspace.
 */
BlockExporterController.prototype.updateToolbox = function(opt_toolboxXml) {
  var updatedToolbox = opt_toolboxXml ||
      this.tools.generateToolboxFromLibrary(this.blockLibStorage);
  this.view.setToolbox(updatedToolbox);
  this.view.renderToolbox(updatedToolbox);
};

/**
 * Enable or Disable block in selector workspace's toolbox.
 *
 * @param {string} blockType - type of block to disable
 */
BlockExporterController.prototype.disableBlock = function(blockType) {
  var toolboxXml = this.view.toolbox;
  var category = goog.dom.xml.selectSingleNode(toolboxXml,
      '//category[@name="' + blockType + '"]');
  var block = goog.dom.getFirstElementChild(category);
  // Save enabled block xml.
  var clonedBlock = block.cloneNode(true);
  this.disabledBlocks[blockType] = clonedBlock;
  // Disable block.
  goog.dom.xml.setAttributes(block, {disabled: true});
};

/**
 * Enable block in selector workspace's toolbox.
 *
 * @param {string} blockType - type of block to enable
 */
BlockExporterController.prototype.enableBlock = function(blockType) {
  var toolboxXml = this.view.toolbox;
  var category = goog.dom.xml.selectSingleNode(toolboxXml,
      '//category[@name="' + blockType + '"]');
  var block = goog.dom.getFirstElementChild(category);
  goog.dom.xml.setAttributes(block, {disabled: false});
  // // Remove disabled block xml from toolbox.
  // goog.dom.removeNode(block);
  // // Get enabled block xml and add to toolbox, replacing disabled block xml
  // // within category.
  // var enabledBlock = this.disabledBlocks[blockType];
  // goog.dom.appendChild(category, enabledBlock);
  // // Remove block from map of disabled blocks.
  // delete this.disabledBlocks[blockType];
  // // Update toolbox.
  // this.updateToolbox(toolboxXml);
};

/**
 * Add change listeners to the exporter's selector workspace.
 */
BlockExporterController.prototype.addChangeListenersToSelectorWorkspace
    = function() {
      // Assign the BlockExporterController to 'self' to be called in the change
      // listeners. This keeps it in scope--otherwise, 'this' in the change
      // listeners refers to the wrong thing.
      var self = this;
      var selector = this.view.selectorWorkspace;
      selector.addChangeListener(
        function(event) {
          self.onSelectBlockForExport(event);
        });
      selector.addChangeListener(
        function(event) {
          self.onDeselectBlockForExport(event);
        });
    };

/**
 * Callback function for when a user selects a block for export in selector
 * workspace. Disables selected block so that the user only exports one
 * copy of starter code per block. Attached to the blockly create event in block
 * factory expansion's init.
 *
 * @param {!Blockly.Events} event - The fired Blockly event.
 */
BlockExporterController.prototype.onSelectBlockForExport = function(event) {
  // The user created a block in selector workspace.
  if (event.type == Blockly.Events.CREATE) {
    // Get type of block created.
    var block = this.view.selectorWorkspace.getBlockById(event.blockId);
    var blockType = block.type;
    // Disable the selected block. Users can only export one copy of starter
    // code per block.
    this.disableBlock(blockType);
    // Edit helper text (currently selected)
    var selectedBlocksText = this.getSelectedBlockTypes_().join(', ');
    this.view.updateHelperText('Currently Selected: ' + selectedBlocksText);
  }
};

/**
 * Callback function for when a user deselects a block in selector
 * workspace by deleting it. Re-enables block so that the user may select it for
 * export
 *
 * @param {!Blockly.Events} event - The fired Blockly event.
 */
BlockExporterController.prototype.onDeselectBlockForExport = function(event) {
  // The user deleted a block in selector workspace.
  if (event.type == Blockly.Events.DELETE) {
    // Get type of block created.
    var deletedBlockXml = event.oldXml;
    var blockType = deletedBlockXml.getAttribute('type');
    // Enable the deselected block.
    this.enableBlock(blockType);
    // Edit helper text (currently selected)
    var selectedBlocksText = this.getSelectedBlockTypes_().join(', ');
    this.view.updateHelperText('Currently Selected: ' + selectedBlocksText);
  }
};

