/**
 * @fileoverview Uses the BlockFactoryExpansion namespace and defines the init
 * function called on load of the BlockFactory Page and binds it to the onload
 * event as its handler.
 *
 * @author quachtina96 (Tina Quach)
 */
goog.provide('BlockFactoryExpansion');

goog.require('BlockFactory');
goog.require('BlockLibraryController');
goog.require('BlockExporterController');
goog.require('goog.dom.classlist');

// TODO(quachtina96): Refactor into object.

BlockFactoryExpansion.blockLibraryName = null;
BlockFactoryExpansion.blockLibraryController = null;
BlockFactoryExpansion.exporter = null;

// TODO(quachtina96): Split up into multiple functions.
/**
 * Initialize Blockly and layout.  Called on page load.
 */
BlockFactoryExpansion.init = function() {
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

  // Initialize Block Library
  BlockFactoryExpansion.blockLibraryName = 'blockLibrary';
  BlockFactoryExpansion.blockLibraryController =
      new BlockLibraryController(BlockFactoryExpansion.blockLibraryName);
  BlockFactoryExpansion.blockLibraryController.populateBlockLibrary();

  // Assign button click handlers for Block Library.
  document.getElementById('saveToBlockLibraryButton').addEventListener('click',
      function() {
        BlockFactoryExpansion.blockLibraryController.saveToBlockLibrary()
      });

  document.getElementById('removeBlockFromLibraryButton').addEventListener(
    'click',
      function() {
        BlockFactoryExpansion.blockLibraryController.removeFromBlockLibrary();
      });

  document.getElementById('clearBlockLibraryButton').addEventListener('click',
      function() {
            BlockFactoryExpansion.blockLibraryController.clearBlockLibrary();
      });

  // Defines the select (block libary dropdown) handler.
  BlockFactoryExpansion.onSelectedBlockChanged
      = function(blockLibraryDropdown) {
        var blockType = BlockFactoryExpansion.blockLibraryController.
            onSelectedBlockChanged(blockLibraryDropdown);
      };

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

  // Initialize Block Exporter
  BlockFactoryExpansion.exporter = new BlockExporterController(
      BlockFactoryExpansion.blockLibraryController.storage);

  // Assign button click handlers for Block Exporter.
  document.getElementById('exporterSubmitButton').addEventListener('click',
      function() {
        BlockFactoryExpansion.exporter.exportBlocks();
      });

  document.getElementById('clearSelectedButton').addEventListener('click',
      function() {
        BlockFactoryExpansion.exporter.clearSelectedBlocks();
      });

  /**
   * Add tab handlers to allow switching between the Block Factory
   * tab and the Block Exporter tab.
   *
   * @param {string} blockFactoryTabID - ID of element containing Block Factory
   * @param {string} blockExporterTabID - ID of element containing Block Exporter
   */
  var addTabHandlers =
      function(blockFactoryTabID, blockExporterTabID) {
        var blockFactoryTab = goog.dom.getElement(blockFactoryTabID);
        var blockExporterTab = goog.dom.getElement(blockExporterTabID);

        blockFactoryTab.addEventListener('click',
          function() {
            goog.dom.classlist.addRemove(blockFactoryTab, 'taboff', 'tabon');
            goog.dom.classlist.addRemove(blockExporterTab, 'tabon', 'taboff');

            // Hide container of exporter.
            BlockFactory.hide('blockLibraryExporter');

            // Resize to render workspaces' toolboxes correctly.
            window.dispatchEvent(new Event('resize'));
          });

        blockExporterTab.addEventListener('click',
          function() {
            goog.dom.classlist.addRemove(blockFactoryTab, 'tabon', 'taboff');
            goog.dom.classlist.addRemove(blockExporterTab, 'taboff', 'tabon');

            // Update toolbox to reflect current block library.
            BlockFactoryExpansion.exporter.updateToolbox();

            // Show container of exporter.
            BlockFactory.show('blockLibraryExporter');

            // Resize to render workspaces' toolboxes correctly.
            window.dispatchEvent(new Event('resize'));
          });
      };
  addTabHandlers("blockfactory_tab", "blocklibraryExporter_tab");

  BlockFactoryExpansion.exporter.addChangeListenersToSelectorWorkspace();

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
window.addEventListener('load', BlockFactoryExpansion.init);
