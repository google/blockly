/**
 * @fileoverview Javascript for the BlockExporter Tools class, which generates
 * block definitions and generator stubs for given block types. Also generates
 * toolbox xml for the exporter's workspace. Depends on the BlockFactory for
 * its code generation functions.
 *
 * @author quachtina96 (Tina Quach)
 */
'use strict';

goog.provide('BlockExporterTools');

goog.require('BlockFactory');
goog.require('goog.dom');
goog.require('goog.dom.xml');

/**
* Block Exporter Tools Class
* @constructor
*/
BlockExporterTools = function() {
  // Create container for hidden workspace.
  this.container = goog.dom.createDom('div', {
    'id': 'blockExporterTools_hiddenWorkspace'
  }, ''); // Empty quotes for empty div.
  // Hide hidden workspace.
  this.container.style.display = 'none';
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
 * Get Blockly Block object from xml that encodes the blocks used to design
 * the block.
 * @private
 *
 * @param {!Element} xml - Xml element that encodes the blocks used to design
 *    the block. For example, the block xmls saved in block library.
 * @return {!Blockly.Block} - Root block (factory_base block) which contains
 *    all information needed to generate block definition or null.
 */
BlockExporterTools.prototype.getRootBlockFromXml_ = function(xml) {
  // Render xml in hidden workspace.
  this.hiddenWorkspace.clear();
  Blockly.Xml.domToWorkspace(xml, this.hiddenWorkspace);
  // Get root block.
  var rootBlock = this.hiddenWorkspace.getTopBlocks()[0] || null;
  return rootBlock;
};

/**
 * Get Blockly Block by rendering pre-defined block in workspace.
 * @private
 *
 * @param {!Element} blockType - Type of block.
 * @return {!Blockly.Block} the Blockly.Block of desired type.
 */
BlockExporterTools.prototype.getDefinedBlock_ = function(blockType) {
  this.hiddenWorkspace.clear();
  return this.hiddenWorkspace.newBlock(blockType);
};

/**
 * Return the given language code of each block type in an array.
 *
 * @param {!Object} blockXmlMap - Map of block type to xml.
 * @param {string} definitionFormat - 'JSON' or 'JavaScript'
 * @return {string} The concatenation of each block's language code in the
 *    desired format.
 */
BlockExporterTools.prototype.getBlockDefs =
    function(blockXmlMap, definitionFormat) {
      var blockCode = [];
      for (var blockType in blockXmlMap) {
        var xml= blockXmlMap[blockType];
        if (xml) {
          // Render and get block from hidden workspace.
          var rootBlock = this.getRootBlockFromXml_(xml);
          if (rootBlock) {
            // Generate the block's definition.
            var code = BlockFactory.getBlockDefinition(blockType, rootBlock,
                definitionFormat, this.hiddenWorkspace);
            // Add block's definition to the definitions to return.
          } else {
            // Append warning comment and write to console.
            var code = '// No block definition generated for ' + blockType +
              '. Could not find root block in xml stored for this block.';
            console.log('No block definition generated for ' + blockType +
              '. Could not find root block in xml stored for this block.');
          }
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
 * @param {!Object} blockXmlMap - Map of block type to xml.
 * @param {string} generatorLanguage - e.g.'JavaScript', 'Python', 'PHP', 'Lua',
 *     'Dart'
 * @return {string} The concatenation of each block's generator code in the
 * desired format.
 */
BlockExporterTools.prototype.getGeneratorCode =
    function(blockXmlMap, generatorLanguage) {
      var multiblockCode = [];
      // Define the custom blocks in order to be able to create instances of
      // them in the exporter workspace.
      this.addBlockDefinitions(blockXmlMap);

      for (var blockType in blockXmlMap) {
        var xml = blockXmlMap[blockType];
        if (xml) {
          // Render the preview block in the hidden workspace.
          var tempBlock = this.getDefinedBlock_(blockType);
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
 * Evaluates block definition code of each block in given object mapping
 * block type to xml. Called in order to be able to create instances of the
 * blocks in the exporter workspace.
 *
 * @param {!Object} blockXmlMap - Map of block type to xml.
 */
BlockExporterTools.prototype.addBlockDefinitions = function(blockXmlMap) {
      var blockDefs = this.getBlockDefs(blockXmlMap, 'JavaScript');
      eval(blockDefs);
    };

/**
 * Pulls information about all blocks in the block library to generate xml
 * for the selector workpace's toolbox.
 *
 * @param {!BlockLibrary.Storage} blockLibStorage - Block Library Storage object
 * @return {!Element} Xml representation of the toolbox.
 */
BlockExporterTools.prototype.generateToolboxFromLibrary
    = function(blockLibStorage) {
      // Create DOM for XML.
      var xmlDom = goog.dom.createDom('xml', {
        'id' : 'blockExporterTools_toolbox',
        'style' : 'display:none'
      });

      var allBlockTypes = blockLibStorage.getBlockTypes();
      // Object mapping block type to XML.
      var blockXmlMap = blockLibStorage.getBlockXmlMap(allBlockTypes);

      // Define the custom blocks in order to be able to create instances of
      // them in the exporter workspace.
      this.addBlockDefinitions(blockXmlMap);

      for (var blockType in blockXmlMap) {
        // Create category DOM element.
        var categoryElement = goog.dom.createDom('category');
        categoryElement.setAttribute('name',blockType);

        // Get block.
        var block = this.getDefinedBlock_(blockType);

        // Get preview block XML.
        var blockChild = Blockly.Xml.blockToDom(block);
        blockChild.removeAttribute('id');

        // Add block to category and category to XML.
        categoryElement.appendChild(blockChild);
        xmlDom.appendChild(categoryElement);
      }

      // If there are no blocks in library, append dummy category.
      var categoryElement = goog.dom.createDom('category');
      categoryElement.setAttribute('name','Next Saved Block');
      xmlDom.appendChild(categoryElement);
      return xmlDom;
    };
