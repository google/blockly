/**
 * @fileoverview Javascript for the BlockExporter Tools class.
 *
 * @author quachtina96 (Tina Quach)
 */
'use strict';

goog.provide('BlockExporter.Tools');

goog.require('BlockExporter');
goog.require('BlockFactory');
goog.require('BlockLibrary.Controller');
goog.require('goog.dom');


/**
* Block Library Export Class
* @constructor
*
* @param {string} hiddenWorkspaceContainerID - ID of div element to contain the
* exporter's hidden workspace
*/
BlockExporter.Tools = function() {
  // Create container for hidden workspace
  this.container = goog.dom.createDom('div',
    {
      'id': 'blockExporterTools_hiddenWorkspace',
      'display':'none'
    },
    '' // Empty div
    );
  goog.dom.appendChild(
      document.getElementsByTagName('body')[0], this.container);
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
 * Return the given language code of each block type in an array.
 *
 * @param {string[]} blockTypes - array of block types for which to get block
 * definitions
 * @param {string} definitionFormat - 'JSON' or 'JavaScript'
 * @return {string} in the desired format, the concatenation of each block's
 * language code.
 */
BlockExporter.Tools.prototype.getBlockDefs =
    function(blockTypes, definitionFormat) {
  var blockCode = [];
  for (var i = 0; i < blockTypes.length; i++) {
    var blockType = blockTypes[i];
    var xml = BlockLibrary.Controller.storage.getBlockXML(blockType);

    // Render and get block from hidden workspace.
    this.hiddenWorkspace.clear();
    Blockly.Xml.domToWorkspace(xml, this.hiddenWorkspace);
    var rootBlock = BlockFactory.getRootBlock(this.hiddenWorkspace);
    // Generate the block's definition.
    var code =
        BlockFactory.getBlockDefinition(blockType, rootBlock, definitionFormat);
    // Add block's definition to the definitions to return.
    blockCode.push(code);
  }
  return blockCode.join("\n\n");
};

/**
 * Return the generator code of each block type in an array in a given language.
 *
 * @param {string[]} blockTypes - array of block types for which to get block
 * definitions
 * @param {string} generatorLanguage - e.g.'JavaScript', 'Python', 'PHP', 'Lua',
 *     'Dart'
 * @return {string} in the desired format, the concatenation of each block's
 * generator code.
 */
BlockExporter.Tools.prototype.getGeneratorCode =
    function(blockTypes, generatorLanguage) {
  var multiblockCode = [];
  // Define the custom blocks in order to be able to create instances of them in
  // the exporter workspace.
  var blockDefs = this.getBlockDefs(blockTypes, 'JavaScript');
  eval(blockDefs);

  for (var i = 0; i < blockTypes.length; i++) {
    var blockType = blockTypes[i];
    // Render the preview block in the hidden workspace.
    this.hiddenWorkspace.clear();
    var tempBlock = this.hiddenWorkspace.newBlock(blockType);
    this.hiddenWorkspace.clearUndo();
    // Get generator stub for the given block and add to  generator code.
    var blockGenCode =
        BlockFactory.getGeneratorStub(tempBlock, generatorLanguage);
    multiblockCode.push(blockGenCode);
  }
  return multiblockCode.join("\n\n");
};

