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
      this.tools.generateToolboxFromLibrary(this.blockLibStorage));
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
  var blockXmlMap = this.blockLibStorage.getBlockXmls(blockTypes);

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
      var blockDefs = this.tools.getBlockDefs(blockXmlMap,
          definitionFormat);
      BlockFactory.createAndDownloadFile_(
          blockDefs, blockDef_filename, definitionFormat);
    }
  }

  if (wantGenStub) {
    if (!generatorStub_filename) {
      alert('Please enter a filename for your generator stub(s) download.');
    } else {
      var genStubs = this.tools.getGeneratorCode(blockXmlMap,
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
  var updatedToolbox = opt_toolboxXml ||
      this.tools.generateToolboxFromLibrary(this.blockLibStorage);
  this.view.setToolbox(updatedToolbox);
  this.view.renderToolbox(updatedToolbox);
};
