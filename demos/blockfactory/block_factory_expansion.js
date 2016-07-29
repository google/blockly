/**
 * @fileoverview The BlockFactoryExpansion Class brings together the Block
 * Factory, Block Library, and Block Exporter functionality into a single web
 * app.
 *
 * @author quachtina96 (Tina Quach)
 */
goog.provide('BlockFactoryExpansion');
goog.require('BlockFactory');
goog.require('BlockLibraryController');
goog.require('BlockExporterController');
goog.require('goog.dom.classlist');

BlockFactoryExpansion = function() {
  // Initialize Block Library
  this.blockLibraryName = 'blockLibrary';
  this.blockLibraryController =
      new BlockLibraryController(this.blockLibraryName);
  this.blockLibraryController.populateBlockLibrary();

  // Initialize Block Exporter
  this.exporter =
      new BlockExporterController(this.blockLibraryController.storage);
};

/**
 * Updates the Block Factory tab to show selected block when user selects a
 * different block in the block library dropdown.
 *
 * @param {!Element} blockLibraryDropdown - HTML select element from which the
 *    user selects a block to work on.
 */
BlockFactoryExpansion.prototype.onSelectedBlockChanged = function(blockLibraryDropdown) {
  var self = this;
  var onSelect = function(blockLibraryDropdown) {
    var blockType
        = self.blockLibraryController.getSelectedBlockType(blockLibraryDropdown);
    self.blockLibraryController.openBlock(blockType);
  };
  onSelect(blockLibraryDropdown);
};

/**
 * Tied to 'Block Factory' Tab. Shows Block Factory and Block Library.
 */
BlockFactoryExpansion.prototype.onFactoryTab =
    function(blockFactoryTab, blockExporterTab) {
      // Turn factory tab on and exporter tab off.
      goog.dom.classlist.addRemove(blockFactoryTab, 'taboff', 'tabon');
      goog.dom.classlist.addRemove(blockExporterTab, 'tabon', 'taboff');

      // Hide container of exporter.
      BlockFactory.hide('blockLibraryExporter');

      // Resize to render workspaces' toolboxes correctly.
      window.dispatchEvent(new Event('resize'));
    };

/**
 * Tied to 'Block Exporter' Tab. Shows Block Exporter.
 */
BlockFactoryExpansion.prototype.onExporterTab =
    function(blockFactoryTab, blockExporterTab, bfeSelf) {
      var onTab = function(blockFactoryTab, blockExporterTab) {
        // Turn exporter tab on and factory tab off.
        goog.dom.classlist.addRemove(blockFactoryTab, 'tabon', 'taboff');
        goog.dom.classlist.addRemove(blockExporterTab, 'taboff', 'tabon');

        // Update toolbox to reflect current block library.
        bfeSelf.exporter.updateToolbox();

        // Show container of exporter.
        BlockFactory.show('blockLibraryExporter');

        // Resize to render workspaces' toolboxes correctly.
        window.dispatchEvent(new Event('resize'));
      };
      onTab(blockFactoryTab, blockExporterTab);
    };

/**
 * Add tab handlers to allow switching between the Block Factory
 * tab and the Block Exporter tab.
 *
 * @param {string} blockFactoryTabID - ID of element containing Block Factory
 * @param {string} blockExporterTabID - ID of element containing Block
 *    Exporter
 */
BlockFactoryExpansion.prototype.addTabHandlers =
    function(blockFactoryTabID, blockExporterTabID) {
      var self = this;
      var addTabHandler = function(blockFactoryTabID, blockExporterTabID){
        // Get div elements representing tabs
        var blockFactoryTab = goog.dom.getElement(blockFactoryTabID);
        var blockExporterTab = goog.dom.getElement(blockExporterTabID);
        blockFactoryTab.addEventListener('click',
            function() {
              self.onFactoryTab(blockFactoryTab, blockExporterTab);
            });
        blockExporterTab.addEventListener('click',
            function() {
              self.onExporterTab(blockFactoryTab, blockExporterTab, self);
            });
      };
      addTabHandler(blockFactoryTabID, blockExporterTabID);
    };

/**
 * Assign button click handlers for the exporter.
 */
BlockFactoryExpansion.prototype.assignExporterClickHandlers = function() {
  var self = this;
  // Export blocks when the user submits the export settings.
  document.getElementById('exporterSubmitButton').addEventListener('click',
      function() {
        self.exporter.exportBlocks();
      });
};

/**
 * Assign button click handlers for the block library.
 */
BlockFactoryExpansion.prototype.assignLibraryClickHandlers = function() {
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
  dropdown.addEventListener('changed',
      function() {
        self.onSelectedBlockChanged(dropdown);
      });
};

/**
 * Assign button click handlers for the block factory.
 */
BlockFactoryExpansion.prototype.assignFactoryClickHandlers = function() {
  // Assign button event handlers for Block Factory.
  document.getElementById('localSaveButton')
    .addEventListener('click', BlockFactory.saveWorkspaceToFile);

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
      BlockFactory.importBlockFromFile();
      // Clear this so that the change event still fires even if the
      // same file is chosen again. If the user re-imports a file, we
      // want to reload the workspace with its contents.
      this.value = null;
    });
};

/**
 * Initialize Blockly and layout.  Called on page load.
 */
BlockFactoryExpansion.prototype.init = function() {
  // Handle Blockly Storage with App Engine
  if ('BlocklyStorage' in window) {
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
  }
  this.assignExporterClickHandlers();
  this.assignLibraryClickHandlers();
  this.assignFactoryClickHandlers();

  // ---- BBS----
  // Handle resizing of elements.
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
  //--- BBF ---
  onresize();
  window.addEventListener('resize', onresize);

  // --- BBS
  // Inject Block Factory Main Workspace
  var toolbox = document.getElementById('toolbox');
  BlockFactory.mainWorkspace = Blockly.inject('blockly',
      {collapse: false,
       toolbox: toolbox,
       media: '../../media/'});
  // --- BBF
  this.addTabHandlers("blockfactory_tab", "blocklibraryExporter_tab");

  // Create the root block.on main workspace.
  if ('BlocklyStorage' in window && window.location.hash.length > 1) {
    BlocklyStorage.retrieveXml(window.location.hash.substring(1),
                               BlockFactory.mainWorkspace);
  } else {
    var xml = '<xml><block type="factory_base" deletable="false" ' +
        'movable="false"></block></xml>';
    Blockly.Xml.domToWorkspace(
        Blockly.Xml.textToDom(xml), BlockFactory.mainWorkspace);
  }
  BlockFactory.mainWorkspace.clearUndo();

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
