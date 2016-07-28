/**
 * @fileoverview Javascript for the Block Exporter Controller class. Allows user to
 * inject the UI of the exporter into a div. Takes care of generating the
 * workspace through which users can select blocks to export.
 *
 * @author quachtina96 (Tina Quach)
 */

'use strict';

goog.provide('BlockExporterController');
// Need controller to get the specific BlockLibrary.Storage object.
goog.require('BlockExporterView');
goog.require('BlockExporterTools');
goog.require('goog.dom.xml');

/**
 * BlockExporter Controller Class
 * @constructor
 *
 * @param {string} blockExporterContainerID - ID of the div in which to inject
 * the block exporter.
 * @param {!BlockLibrary.Storage} blockLibStorage - Block Library Storage
 */
BlockExporterController = function(blockExporterContainerID, blockLibStorage) {
  this.containerID = blockExporterContainerID;
  // BlockLibrary.Storage object containing user's saved blocks
  this.blockLibStorage = blockLibStorage;
  // Utils for generating code to export
  this.tools = new BlockExporterTools();
  // View provides the selector workspace and export settings UI.
  this.view = new BlockExporterView(blockExporterContainerID,
      this.generateToolboxFromLibrary());
  // Object mapping disabled block types to their enabled xmls
  this.disabledBlocks = Object.create(null);
};

/**
 * Initializes all saved blocks by evaluating block definition code. Called in
 * order to be able to create instances of the blocks in the exporter workspace.
 */
BlockExporterController.prototype.initializeAllBlocks =
    function() {
      // Define the custom blocks in order to be able to
      var allBlockTypes = this.blockLibStorage.getBlockTypes();
      var blockXmls = this.blockLibStorage.getBlockXmls(allBlockTypes);
      var blockDefs =
          this.tools.getBlockDefs(allBlockTypes, blockXmls, 'JavaScript');
      eval(blockDefs);
    };

/**
 * Pulls information about all blocks in the block library to generate xml
 * for the selector workpace's toolbox.
 *
 * @return {!Element} xml representation of the toolbox
 */
BlockExporterController.prototype.generateToolboxFromLibrary = function() {
  // Create DOM for XML.
  var xmlDom = goog.dom.createDom('xml',
    {
      'id' : this.containerID + '_toolbox',
      'style' : 'display:none'
    });

  // Object mapping block type to XML
  var blocks = this.blockLibStorage.blocks;
  this.initializeAllBlocks();

  for (var blockType in blocks) {
    // Create category DOM element.
    var categoryElement = goog.dom.createDom('category');
    categoryElement.setAttribute('name',blockType);

    // Render block in hidden workspace.
    this.tools.hiddenWorkspace.clear();
    var block = this.tools.hiddenWorkspace.newBlock(blockType);

    // Get preview block XML
    var blockChild = Blockly.Xml.blockToDom(block);
    blockChild.removeAttribute('id');

    // Add block to category and category to XML
    categoryElement.appendChild(blockChild);
    xmlDom.appendChild(categoryElement);
  }
  return xmlDom;
};

/**
 * Get the selected block types.
 *
 * @return {!Array.<string>} types of blocks in workspace
 */
BlockExporterController.prototype.getSelectedBlockTypes = function() {
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
  var blockTypes = this.getSelectedBlockTypes();
  //TODO(quacht): check line below for errors
  var blockXmls = this.blockLibStorage.getBlockXmls(blockTypes);

  // Pull inputs from the Export Settings form.
  var definitionFormat = document.getElementById('exportFormat').value;
  var language = document.getElementById('exportLanguage').value;
  var blockDef_filename = document.getElementById('blockDef_filename').value;
  var generatorStub_filename = document.getElementById(
      'generatorStub_filename').value;
  var wantBlockDef = document.getElementById('blockDefCheck').checked;
  var wantGenStub = document.getElementById('genStubCheck').checked;

  if (wantBlockDef) {
    if (!blockDef_filename) {
      alert('Please enter a filename for your block definition(s) download.');
    } else {
      var blockDefs = this.tools.getBlockDefs(blockTypes, blockXmls,
          definitionFormat);
      BlockFactory.createAndDownloadFile_(
          blockDefs, blockDef_filename, definitionFormat);
    }
  }

  if (wantGenStub) {
    if (!generatorStub_filename) {
      alert('Please enter a filename for your generator stub(s) download.');
    } else {
      var genStubs = this.tools.getGeneratorCode(blockTypes, blockXmls,
          language);
      BlockFactory.createAndDownloadFile_(
          genStubs, generatorStub_filename, language);
    }
  }
};

/**
 * Update the Exporter's toolbox.
 *
 * @param {Element} opt_toolboxXml - xml to define toolbox of the selector
 * workspace
 */
BlockExporterController.prototype.updateToolbox = function(opt_toolboxXml) {
  var updatedToolbox = opt_toolboxXml || this.generateToolboxFromLibrary();
  this.view.setToolbox(updatedToolbox);
  this.view.renderToolbox(updatedToolbox);
};

/**
 * Disable block in selector workspace's toolbox.
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
  // Remove disabled block xml from toolbox.
  goog.dom.removeNode(block);
  // Get enabled block xml and add to toolbox, replacing disabled block xml
  // within category.
  var enabledBlock = this.disabledBlocks[blockType];
  goog.dom.appendChild(category, enabledBlock);
  // Remove block from map of disabled blocks.
  delete this.disabledBlocks[blockType];
  // Update toolbox.
  this.updateToolbox(toolboxXml);
};

BlockExporterController.prototype.onSelectBlockForExport = function(event) {
  // BUG: this is currently undefined
  if (event.type == Blockly.Events.CREATE) {
    // Get type of block created.
    var block = this.view.selectorWorkspace.getBlockById(event.blockId);
    var blockType = block.type;
    // Disable the selected block. Users can only export one copy of starter code
    // per block.
    this.disableBlock(blockType);
    // Edit helper text (currently selected)
    var selectedBlocksText = this.getSelectedBlockTypes().join(', ');
    this.view.updateHelperText('Currently Selected: ' + selectedBlocksText);
  }
};

BlockExporterController.prototype.onDeselectBlockForExport = function(event) {
  // this is currently undefined.
  if (event.type == Blockly.Events.DELETE) {
    // Get type of block created.
    var deletedBlockXml = event.oldXml;
    var blockType = deletedBlockXml.getAttribute('type');
    // Enable the deselected block.
    this.enableBlock(blockType);
    // Edit helper text (currently selected)
    var selectedBlocksText = this.getSelectedBlockTypes().join(', ');
    this.view.updateHelperText('Currently Selected: ' + selectedBlocksText);
  }
};


