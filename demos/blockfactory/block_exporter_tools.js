/**
 * @fileoverview Javascript for the BlockExporter Tools class, which generates
 * block definitions and generator stubs for given blockTypes. Depends on the
 * BlockFactory for its code generation functions.
 *
 * @author quachtina96 (Tina Quach)
 */
'use strict';

goog.provide('BlockExporterTools');

goog.require('BlockFactory');
goog.require('goog.dom');
goog.require('goog.dom.xml');

/**
* Block Library Export Class
* @constructor
*
* @param {string} hiddenWorkspaceContainerID - ID of div element to contain the
* exporter's hidden workspace
*/
BlockExporterTools = function() {
  // Create container for hidden workspace
  this.container = goog.dom.createDom('div',
    {
      'id': 'blockExporterTools_hiddenWorkspace',
      'display': 'none'
    },
    '' // Empty div
    );
  goog.dom.appendChild(document.body, this.container);
  /**
   * Hidden workspace for the Block Exporter that holds pieces that make
   * up the block
   * @type {Blockly.Workspace}
   */
  this.hiddenWorkspace = Blockly.inject(this.container.id,
      {collapse: false,
       media: '../../media/'});
};

/**
 * Get Blockly Block object from the xml saved in block library.
 *
 * @param {!Element} xml - Xml element saved in block library for that block.
 * @return {!Blockly.Block} - Root block (factory_base block).
 */
BlockExporterTools.prototype.getRootBlockFromXml = function(xml) {
  // Render xml in hidden workspace.
  this.hiddenWorkspace.clear();
  Blockly.Xml.domToWorkspace(xml, this.hiddenWorkspace);
  // Get root block.
  return BlockFactory.getRootBlock(this.hiddenWorkspace);
};

/**
 * Get Blockly Blcokfrom the xml saved in block library.
 *
 * @param {!Element} xml - Xml element saved in block library for that block.
 * @return {!Blockly.Block} - Root block (factory_base block).
 */
BlockExporterTools.prototype.getDefinedBlock = function(blockType) {
  this.hiddenWorkspace.clear();
  return this.hiddenWorkspace.newBlock(blockType);
};

/**
 * Return the given language code of each block type in an array.
 *
 * @param {!Object} blockXmlMap - map of block type to xml
 * @param {string} definitionFormat - 'JSON' or 'JavaScript'
 * @return {string} in the desired format, the concatenation of each block's
 *    language code.
 */
BlockExporterTools.prototype.getBlockDefs =
    function(blockXmlMap, definitionFormat) {
      var blockCode = [];
      for (var blockType in blockXmlMap) {
        var xml = blockXmlMap[blockType];
        if (xml) {
          // Render and get block from hidden workspace.
          var rootBlock = this.getRootBlockFromXml(xml);
          // Generate the block's definition.
          var code = BlockFactory.getBlockDefinition(blockType, rootBlock,
              definitionFormat);
          // Add block's definition to the definitions to return.
        } else {
          // Append warning comment and write to console.
          var code = '// No block definition generated for ' + blockType +
            '. Block was not found in Block Library Storage.';
          console.log('No block definition generated for ' + blockType +
            '. Block was not found in Block Library Storage.');
        }
        blockCode.push(code);
      }
      return blockCode.join("\n\n");
    };

/**
 * Return the generator code of each block type in an array in a given language.
 *
 * @param {!Object} blockXmlMap - map of block type to xml
 * @param {string} generatorLanguage - e.g.'JavaScript', 'Python', 'PHP', 'Lua',
 *     'Dart'
 * @return {string} in the desired format, the concatenation of each block's
 * generator code.
 */
BlockExporterTools.prototype.getGeneratorCode =
    function(blockXmlMap, generatorLanguage) {
      var multiblockCode = [];
      // Define the custom blocks in order to be able to create instances of
      // them in the exporter workspace.
      var blockDefs = this.getBlockDefs(blockXmlMap, 'JavaScript');
      eval(blockDefs);

      for (var blockType in blockXmlMap) {
        var xml = blockXmlMap[blockType];
        if (xml) {
          // Render the preview block in the hidden workspace.
          var tempBlock = this.getDefinedBlock(blockType);
          // Get generator stub for the given block and add to  generator code.
          var blockGenCode =
              BlockFactory.getGeneratorStub(tempBlock, generatorLanguage);
        } else {
          // Append warning comment and write to console.
          var blockGenCode = '// No generator stub generated for ' + blockType +
            '. Block was not found in Block Library Storage.';
          console.log('No block generator stub generated for ' + blockType +
            '. Block was not found in Block Library Storage.');
        }
        multiblockCode.push(blockGenCode);
      }
      return multiblockCode.join("\n\n");
    };

/**
 * Initializes all saved blocks by evaluating block definition code. Called in
 * order to be able to create instances of the blocks in the exporter workspace.
 *
 * @param {!BlockLibrary.Storage} blockLibStorage - Block Library Storage object
 *    that contains all the blocks.
 */
BlockExporterTools.prototype.initializeAllBlocks = function(blockLibStorage) {
      var allBlockTypes = blockLibStorage.getBlockTypes();
      var blockXmlMap = blockLibStorage.getBlockXmls(allBlockTypes);
      var blockDefs =
          this.getBlockDefs(blockXmlMap, 'JavaScript');
      eval(blockDefs);
    };

/**
 * Pulls information about all blocks in the block library to generate xml
 * for the selector workpace's toolbox.
 *
 * @return {!Element} xml representation of the toolbox
 */
 // TODO(quacht):pass in blocks. move to tools
BlockExporterTools.prototype.generateToolboxFromLibrary
    = function(blockLibStorage) {
      // Create DOM for XML.
      var xmlDom = goog.dom.createDom('xml',
        {
          'id' : this.containerID + '_toolbox',
          'style' : 'display:none'
        });

      // Object mapping block type to XML
      var blocks = blockLibStorage.blocks;
      this.initializeAllBlocks(blockLibStorage);

      for (var blockType in blocks) {
        // Create category DOM element.
        var categoryElement = goog.dom.createDom('category');
        categoryElement.setAttribute('name',blockType);

        // Get block.
        var block = this.getDefinedBlock(blockType);

        // Get preview block XML
        var blockChild = Blockly.Xml.blockToDom(block);
        blockChild.removeAttribute('id');

        // Add block to category and category to XML
        categoryElement.appendChild(blockChild);
        xmlDom.appendChild(categoryElement);
      }
      return xmlDom;
    };
