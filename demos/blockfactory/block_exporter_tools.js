/**
 * @fileoverview Javascript for the BlockExporter Tools class, which generates
 * block definitions and generator stubs for given blockTypes. Depends on the
 * BlockLibrary.Controller for its storage object and on the BlockFactory for
 * its code generation functions.
 *
 * @author quachtina96 (Tina Quach)
 */
'use strict';

goog.provide('BlockExporterTools');

goog.require('BlockFactory');
goog.require('BlockLibrary.Controller');
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
          this.hiddenWorkspace.clear();
          Blockly.Xml.domToWorkspace(xml, this.hiddenWorkspace);
          var rootBlock = BlockFactory.getRootBlock(this.hiddenWorkspace);
          // Generate the block's definition.
          var code =
              BlockFactory.getBlockDefinition(blockType, rootBlock, definitionFormat);
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
      // Define the custom blocks in order to be able to create instances of them in
      // the exporter workspace.
      var blockDefs = this.getBlockDefs(blockXmlMap, 'JavaScript');
      eval(blockDefs);

      for (var blockType in blockXmlMap) {
        var xml = blockXmlMap[blockType];
        if (xml) {
          // Render the preview block in the hidden workspace.
          this.hiddenWorkspace.clear();
          var tempBlock = this.hiddenWorkspace.newBlock(blockType);
          this.hiddenWorkspace.clearUndo();
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

// TODO(quachtina96): Figure out what to do with this-- I dont actually use this
// function in the code. Should I just save it somewhere in case I want it in
// the future?
BlockExporterTools.prototype.getBlockTypeFromStoredXml = function(storedXml) {
  var storedXml = Blockly.Options.parseToolboxTree(storedXml);
  // Find factory base block.
  var factoryBaseBlockXml = storedXml.getElementsByTagName('block')[0];
  // Get field elements from factory base.
  var fields = factoryBaseBlockXml.getElementsByTagName('field');
  for (var i = 0; i < fields.length; i++) {
    if (fields[i].getAttribute('name') == 'NAME') {
      return fields[i].childNodes[0].nodeValue;
    }
  }
};
