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
 * @fileoverview The AppController Class brings together the Block
 * Factory, Block Library, and Block Exporter functionality into a single web
 * app.
 *
 * @author quachtina96 (Tina Quach)
 */
goog.provide('AppController');

goog.require('BlockFactory');
goog.require('BlockLibraryController');
goog.require('BlockExporterController');
goog.require('goog.dom.classlist');
goog.require('goog.string');

/**
 * Controller for the Blockly Factory
 * @constructor
 */
AppController = function() {
  // Initialize Block Library
  this.blockLibraryName = 'blockLibrary';
  this.blockLibraryController =
      new BlockLibraryController(this.blockLibraryName);
  this.blockLibraryController.populateBlockLibrary();

  // Initialize Block Exporter
  this.exporter =
      new BlockExporterController(this.blockLibraryController.storage);

  // Map of tab type to the div element for the tab.
  this.tabMap = {
    'BLOCK_FACTORY' : goog.dom.getElement('blockFactory_tab'),
    'WORKSPACE_FACTORY': goog.dom.getElement('workspaceFactory_tab'),
    'EXPORTER' : goog.dom.getElement('blocklibraryExporter_tab')
  };

  // Selected tab.
  this.selectedTab = 'BLOCK_FACTORY';
};

/**
 * Tied to the 'Import Block Library' button. Imports block library from file to
 * Block Factory. Expects user to upload a single file of JSON mapping each
 * block type to its xml text representation.
 */
AppController.prototype.importBlockLibraryFromFile = function() {
  var self = this;
  var files = document.getElementById('files');
  // If the file list is empty, the user likely canceled in the dialog.
  if (files.files.length > 0) {
    // The input tag doesn't have the "multiple" attribute
    // so the user can only choose 1 file.
    var file = files.files[0];
    var fileReader = new FileReader();

    // Create a map of block type to xml text from the file when it has been
    // read.
    fileReader.addEventListener('load', function(event) {
      var fileContents = event.target.result;
      // Create empty object to hold the read block library information.
      var blockXmlTextMap = Object.create(null);
      try {
        // Parse the file to get map of block type to xml text.
        blockXmlTextMap = self.formatBlockLibForImport_(fileContents);
      } catch (e) {
        var message = 'Could not load your block library file.\n'
        window.alert(message + '\nFile Name: ' + file.name);
        return;
      }

      // Create a new block library storage object with inputted block library.
      var blockLibStorage = new BlockLibraryStorage(
          self.blockLibraryName, blockXmlTextMap);

      // Update block library controller with the new block library
      // storage.
      self.blockLibraryController.setBlockLibStorage(blockLibStorage);
      // Update the block library dropdown.
      self.blockLibraryController.populateBlockLibrary();
      // Update the exporter's block library storage.
      self.exporter.setBlockLibStorage(blockLibStorage);
    });
    // Read the file.
    fileReader.readAsText(file);
  }
};

/**
 * Tied to the 'Export Block Library' button. Exports block library to file that
 * contains JSON mapping each block type to its xml text representation.
 */
AppController.prototype.exportBlockLibraryToFile = function() {
  // Get map of block type to xml.
  var blockLib = this.blockLibraryController.getBlockLibrary();
  // Concatenate the xmls, each separated by a blank line.
  var blockLibText = this.formatBlockLibForExport_(blockLib);
  // Get file name.
  var filename = prompt('Enter the file name under which to save your block' +
      'library.');
  // Download file if all necessary parameters are provided.
  if (filename) {
    BlockFactory.createAndDownloadFile_(blockLibText, filename, 'xml');
  } else {
    alert('Could not export Block Library without file name under which to ' +
      'save library.');
  }
};

/**
 * Converts an object mapping block type to xml to text file for output.
 * @private
 *
 * @param {!Object} blockXmlMap - object mapping block type to xml
 * @return {string} String of each block's xml separated by a new line.
 */
AppController.prototype.formatBlockLibForExport_ = function(blockXmlMap) {
  var blockXmls = [];
  for (var blockType in blockXmlMap) {
    blockXmls.push(blockXmlMap[blockType]);
  }
  return blockXmls.join("\n\n");
};

/**
 * Converts imported block library to an object mapping block type to block xml.
 * @private
 *
 * @param {string} xmlText - String containing each block's xml optionally
 *    separated by whitespace.
 * @return {!Object} object mapping block type to xml text.
 */
AppController.prototype.formatBlockLibForImport_ = function(xmlText) {
  // Get array of xmls.
  var xmlText = goog.string.collapseWhitespace(xmlText);
  var blockXmls = goog.string.splitLimit(xmlText, '</xml>', 500);

  // Create and populate map.
  var blockXmlTextMap = Object.create(null);
  // The line above is equivalent of {} except that this object is TRULY
  // empty. It doesn't have built-in attributes/functions such as length or
  // toString.
  for (var i = 0, xml; xml = blockXmls[i]; i++) {
    var blockType = this.getBlockTypeFromXml_(xml);
    blockXmlTextMap[blockType] = xml;
  }

  return blockXmlTextMap;
};

/**
 * Extracts out block type from xml text, the kind that is saved in block
 * library storage.
 * @private
 *
 * @param {!string} xmlText - A block's xml text.
 * @return {string} The block type that corresponds to the provided xml text.
 */
AppController.prototype.getBlockTypeFromXml_ = function(xmlText) {
  var xmlText = Blockly.Options.parseToolboxTree(xmlText);
  // Find factory base block.
  var factoryBaseBlockXml = xmlText.getElementsByTagName('block')[0];
  // Get field elements from factory base.
  var fields = factoryBaseBlockXml.getElementsByTagName('field');
  for (var i = 0; i < fields.length; i++) {
    // The field whose name is 'NAME' holds the block type as its value.
    if (fields[i].getAttribute('name') == 'NAME') {
      return fields[i].childNodes[0].nodeValue;
    }
  }
};

/**
 * Updates the Block Factory tab to show selected block when user selects a
 * different block in the block library dropdown. Tied to block library dropdown
 * in index.html.
 *
 * @param {!Element} blockLibraryDropdown - HTML select element from which the
 *    user selects a block to work on.
 */
AppController.prototype.onSelectedBlockChanged = function(blockLibraryDropdown) {
  // Get selected block type.
  var blockType = this.blockLibraryController.getSelectedBlockType(
      blockLibraryDropdown);
  // Update Block Factory page by showing the selected block.
  this.blockLibraryController.openBlock(blockType);
};

/**
 * Add click handlers to each tab to allow switching between the Block Factory,
 * Workspace Factory, and Block Exporter tab.
 *
 * @param {!Object} tabMap - Map of tab name to div element that is the tab.
 */
AppController.prototype.addTabHandlers = function(tabMap) {
  var self = this;
  for (var tabName in tabMap) {
    var tab = tabMap[tabName];
    // Use an additional closure to correctly assign the tab callback.
    tab.addEventListener('click', self.makeTabClickHandler_(tabName));
  }
};

/**
 * Set the selected tab.
 * @private
 *
 * @param {string} tabName 'BLOCK_FACTORY', 'WORKSPACE_FACTORY', or 'EXPORTER'
 */
AppController.prototype.setSelected_ = function(tabName) {
  this.selectedTab = tabName;
};

/**
 * Creates the tab click handler specific to the tab specified.
 * @private
 *
 * @param {string} tabName 'BLOCK_FACTORY', 'WORKSPACE_FACTORY', or 'EXPORTER'
 * @return {Function} The tab click handler.
 */
AppController.prototype.makeTabClickHandler_ = function(tabName) {
  var self = this;
  return function() {
    self.setSelected_(tabName);
    self.onTab();
  };
};

/**
 * Called on each tab click. Hides and shows specific content based on which tab
 * (Block Factory, Workspace Factory, or Exporter) is selected.
 */
AppController.prototype.onTab = function() {
  // Get tab div elements.
  var blockFactoryTab = this.tabMap['BLOCK_FACTORY'];
  var exporterTab = this.tabMap['EXPORTER'];
  var workspaceFactoryTab = this.tabMap['WORKSPACE_FACTORY'];

  if (this.selectedTab == 'EXPORTER') {
    // Turn exporter tab on and other tabs off.
    goog.dom.classlist.addRemove(exporterTab, 'taboff', 'tabon');
    goog.dom.classlist.addRemove(blockFactoryTab, 'tabon', 'taboff');
    goog.dom.classlist.addRemove(workspaceFactoryTab, 'tabon', 'taboff');

    // Update toolbox to reflect current block library.
    this.exporter.updateToolbox();

    // Show container of exporter.
    BlockFactory.show('blockLibraryExporter');
    BlockFactory.hide('workspaceFactoryContent');

  } else if (this.selectedTab ==  'BLOCK_FACTORY') {
    // Turn factory tab on and other tabs off.
    goog.dom.classlist.addRemove(blockFactoryTab, 'taboff', 'tabon');
    goog.dom.classlist.addRemove(exporterTab, 'tabon', 'taboff');
    goog.dom.classlist.addRemove(workspaceFactoryTab, 'tabon', 'taboff');

    // Hide container of exporter.
    BlockFactory.hide('blockLibraryExporter');
    BlockFactory.hide('workspaceFactoryContent');

  } else if (this.selectedTab == 'WORKSPACE_FACTORY') {
    console.log('workspaceFactoryTab');
    goog.dom.classlist.addRemove(workspaceFactoryTab, 'taboff', 'tabon');
    goog.dom.classlist.addRemove(blockFactoryTab, 'tabon', 'taboff');
    goog.dom.classlist.addRemove(exporterTab, 'tabon', 'taboff');
    // Hide container of exporter.
    BlockFactory.hide('blockLibraryExporter');
    // Show workspace factory container.
    BlockFactory.show('workspaceFactoryContent');
  }

  // Resize to render workspaces' toolboxes correctly for all tabs.
  window.dispatchEvent(new Event('resize'));
};

/**
 * Assign button click handlers for the exporter.
 */
AppController.prototype.assignExporterClickHandlers = function() {
  var self = this;
  // Export blocks when the user submits the export settings.
  document.getElementById('exporterSubmitButton').addEventListener('click',
      function() {
        self.exporter.export();
      });
  document.getElementById('clearSelectedButton').addEventListener('click',
      function() {
        self.exporter.clearSelectedBlocks();
      });
  document.getElementById('addAllFromLibButton').addEventListener('click',
      function() {
        self.exporter.addAllBlocksToWorkspace();
      });
};

/**
 * Assign button click handlers for the block library.
 */
AppController.prototype.assignLibraryClickHandlers = function() {
  var self = this;
  // Assign button click handlers for Block Library.
  document.getElementById('saveToBlockLibraryButton').addEventListener('click',
      function() {
        self.blockLibraryController.saveToBlockLibrary();
      });

  document.getElementById('removeBlockFromLibraryButton').addEventListener(
    'click',
      function() {
        self.blockLibraryController.removeFromBlockLibrary();
      });

  document.getElementById('clearBlockLibraryButton').addEventListener('click',
      function() {
        self.blockLibraryController.clearBlockLibrary();
      });

  var dropdown = document.getElementById('blockLibraryDropdown');
  dropdown.addEventListener('change',
      function() {
        self.onSelectedBlockChanged(dropdown);
      });
};

/**
 * Assign button click handlers for the block factory.
 */
AppController.prototype.assignFactoryClickHandlers = function() {
  var self = this;
  // Assign button event handlers for Block Factory.
  document.getElementById('localSaveButton')
      .addEventListener('click', function() {
        self.exportBlockLibraryToFile();
      });
  document.getElementById('helpButton').addEventListener('click',
      function() {
        open('https://developers.google.com/blockly/custom-blocks/block-factory',
             'BlockFactoryHelp');
      });
  document.getElementById('downloadBlocks').addEventListener('click',
      function() {
        BlockFactory.downloadTextArea('blocks', 'languagePre');
      });
  document.getElementById('downloadGenerator').addEventListener('click',
      function() {
        BlockFactory.downloadTextArea('generator', 'generatorPre');
      });
  document.getElementById('files').addEventListener('change',
      function() {
        // Warn user.
        var replace = confirm('This imported block library will ' +
            'replace your current block library.');
        if (replace) {
          self.importBlockLibraryFromFile();
          // Clear this so that the change event still fires even if the
          // same file is chosen again. If the user re-imports a file, we
          // want to reload the workspace with its contents.
          this.value = null;
        }
      });
  document.getElementById('createNewBlockButton')
    .addEventListener('click', function() {
        BlockFactory.mainWorkspace.clear();
        BlockFactory.showStarterBlock();
        BlockLibraryView.selectDefaultOption('blockLibraryDropdown');
    });
};

/**
 * Add event listeners for the block factory.
 */
AppController.prototype.addFactoryEventListeners = function() {
  BlockFactory.mainWorkspace.addChangeListener(BlockFactory.updateLanguage);
  document.getElementById('direction')
      .addEventListener('change', BlockFactory.updatePreview);
  document.getElementById('languageTA')
      .addEventListener('change', BlockFactory.updatePreview);
  document.getElementById('languageTA')
      .addEventListener('keyup', BlockFactory.updatePreview);
  document.getElementById('format')
      .addEventListener('change', BlockFactory.formatChange);
  document.getElementById('language')
      .addEventListener('change', BlockFactory.updatePreview);
};

/**
 * Handle Blockly Storage with App Engine.
 */
AppController.prototype.initializeBlocklyStorage = function() {
  BlocklyStorage.HTTPREQUEST_ERROR =
      'There was a problem with the request.\n';
  BlocklyStorage.LINK_ALERT =
      'Share your blocks with this link:\n\n%1';
  BlocklyStorage.HASH_ERROR =
      'Sorry, "%1" doesn\'t correspond with any saved Blockly file.';
  BlocklyStorage.XML_ERROR = 'Could not load your saved file.\n' +
      'Perhaps it was created with a different version of Blockly?';
  var linkButton = document.getElementById('linkButton');
  linkButton.style.display = 'inline-block';
  linkButton.addEventListener('click',
      function() {
          BlocklyStorage.link(BlockFactory.mainWorkspace);});
  BlockFactory.disableEnableLink();
};
/**
 * Initialize Blockly and layout.  Called on page load.
 */
AppController.prototype.init = function() {
  // Handle Blockly Storage with App Engine
  if ('BlocklyStorage' in window) {
    this.initializeBlocklyStorage();
  }

  // Assign click handlers.
  this.assignExporterClickHandlers();
  this.assignLibraryClickHandlers();
  this.assignFactoryClickHandlers();

  // Handle resizing of Block Factory elements.
  var expandList = [
    document.getElementById('blockly'),
    document.getElementById('blocklyMask'),
    document.getElementById('preview'),
    document.getElementById('languagePre'),
    document.getElementById('languageTA'),
    document.getElementById('generatorPre')
  ];

  var onresize = function(e) {
    for (var i = 0, expand; expand = expandList[i]; i++) {
      expand.style.width = (expand.parentNode.offsetWidth - 2) + 'px';
      expand.style.height = (expand.parentNode.offsetHeight - 2) + 'px';
    }
  };
  onresize();
  window.addEventListener('resize', onresize);

  // Inject Block Factory Main Workspace.
  var toolbox = document.getElementById('toolbox');
  BlockFactory.mainWorkspace = Blockly.inject('blockly',
      {collapse: false,
       toolbox: toolbox,
       media: '../../media/'});

  // Add tab handlers for switching between Block Factory and Block Exporter.
  this.addTabHandlers(this.tabMap);

  this.exporter.addChangeListenersToSelectorWorkspace();

  // Create the root block on Block Factory main workspace.
  if ('BlocklyStorage' in window && window.location.hash.length > 1) {
    BlocklyStorage.retrieveXml(window.location.hash.substring(1),
                               BlockFactory.mainWorkspace);
  } else {
    BlockFactory.showStarterBlock();
  }
  BlockFactory.mainWorkspace.clearUndo();

  // Add Block Factory event listeners.
  this.addFactoryEventListeners();
};
