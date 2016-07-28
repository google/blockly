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
  // Xml representation of the toolbox
  this.view = new BlockExporterView(blockExporterContainerID,
      this.generateToolboxFromLibrary());
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
 * @private
 *
 * @return {!Array.<string>} types of blocks in workspace
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
