/**
 * @fileoverview Javascript for the Block Exporter View class. Allows user to
 * inject the UI of the exporter into a div. Takes care of generating the
 * workspace through which users can select blocks to export.
 *
 * @author quachtina96 (Tina Quach)
 */

'use strict';

goog.provide('BlockExporter.View');
goog.require('BlockExporter');
// Need controller to get the specific BlockLibrary.Storage object.
goog.require('BlockLibrary.Controller');
goog.require('BlockExporter.Tools');
goog.require('BlockFactory');
goog.require('goog.dom');

/**
 * BlockExporter View Class
 * @constructor
 *
 * @param {string} blockExporterContainerID - ID of the div in which to inject
 * the block exporter.
 * @param {!BlockLibrary.Storage} blockLibStorage - Block Library Storage
 */
BlockExporter.View = function(blockExporterContainerID, blockLibStorage) {
  // TODO(quacht): implement the injection of Block Exporter into the given
  // container div.
  this.containerID = blockExporterContainerID;
  this.blockLibStorage = blockLibStorage;
  this.tools = new BlockExporter.Tools();
  // Xml representation of the toolbox
  this.toolbox = this.generateToolboxXml();
  this.selectorWorkspace =
      // TODO(quacht): use container ID as prefix for the id of all dom elements
      // created for the the export (this.containerID + '_selectorWorkspace').
      Blockly.inject('exportSelector',
      {collapse: false,
       toolbox: this.toolbox,
       grid:
         {spacing: 20,
          length: 3,
          colour: '#ccc',
          snap: true}
        });
  // TODO(quacht): does this assign a pointer to the inputted blockLibStorage
  // object?
};

BlockExporter.View.prototype.initializeAllBlocks =
    function() {
      // Define the custom blocks in order to be able to create instances of
      // them in the exporter workspace.
      var blockTypes = Object.keys(this.blockLibStorage.blocks);
      var blockDefs =
          this.tools.getBlockDefs(blockTypes, 'JavaScript');
      eval(blockDefs);
    };

/**
 * Pulls information about all blocks in the block library to generate xml
 * for the selector workpace's toolbox.
 *
 * @return {!Element} xml representation of the toolbox
 */
BlockExporter.View.prototype.generateToolboxXml = function() {
  // Create DOM for XML.
  var xmlDom = goog.dom.createDom('xml',
    {
      'id' : this.containerID + '_toolbox',
      'style' : 'display:none'
    });

  // Object mapping block type to XML
  var blocks = this.blockLibStorage.blocks;

  for (var blockType in blocks) {
    // Create category DOM element.
    var categoryElement = goog.dom.createDom('category');
    categoryElement.setAttribute('name',blockType);

    this.initializeAllBlocks(this.blockLibStorage);

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
 * Update the toolbox of this instance of BlockExporter.View.
 */
BlockExporter.View.prototype.updateToolbox = function() {
  // Generate toolbox xml using the updated block library storage.
  var updatedToolboxXml = this.generateToolboxXml();
  // Parse the provided toolbox tree into a consistent DOM format.
  this.toolbox = Blockly.Options.parseToolboxTree(updatedToolboxXml);
};

/**
 * Renders the toolbox in the workspace. Used to update the toolbox upon
 * switching between Block Factory tab and Block Exporter Tab.
 */
BlockExporter.View.prototype.renderToolbox = function() {
  this.selectorWorkspace.toolbox_.populate_(this.toolbox);
};

/**
 * Get the selected block types.
 *
 * @return {!Array.<string>} types of blocks in workspace
 */
BlockExporter.View.prototype.getSelectedBlockTypes = function() {
  var selectedBlocks = this.selectorWorkspace.getAllBlocks();
  var blockTypes = [];
  for (var i = 0; i < selectedBlocks.length; i++) {
    blockTypes.push(selectedBlocks[i].type);
  }
  return blockTypes;
};

/**
 * Updates the helper text.
 *
 * @param {string} newText - new helper text
 * @param {boolean} opt_append - true if appending to helper Text, false if
 *    replacing
 */
BlockExporter.View.prototype.updateHelperText = function(newText, opt_append) {
  if (opt_append) {
    goog.dom.getElement('helperText').textContent =
        goog.dom.getElement('helperText').textContent + newText;
  } else {
    goog.dom.getElement('helperText').textContent = newText;
  }
  return goog.dom.getElement('helperText').textContent;
};

/**
 * Get selected blocks from selector workspace, pulls info from the Export
 * Settings form in Block Exporter, and downloads block code accordingly.
 */
BlockExporter.View.prototype.exportBlocks = function() {
  var blockTypes = this.getSelectedBlockTypes();
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
      var blockDefs = this.tools.getBlockDefs(blockTypes,
          definitionFormat);
      BlockFactory.createAndDownloadFile_(blockDefs, blockDef_filename, definitionFormat);
    }
  }

  if (wantGenStub) {
    if (!blockDef_filename) {
      alert('Please enter a filename for your generator stub(s) download.');
    } else {
      var genStubs = this.tools.getGeneratorCode(blockTypes,
          definitionFormat);
      BlockFactory.createAndDownloadFile_(genStubs, generatorStub_filename, language);
    }
  }
};

//TODO(quacht): catch blocks' create and delete events.
// upon create, disable block to limit the block to only one
// also update helper text e.g.
// this.updateHelperText('Selected BlockTypes: ' + JSON.stringify(blockTypes));
// upon delete, enable block


