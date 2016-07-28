/**
 * @fileoverview Javascript for Block Library's Storage Class.
 * Depends on Block Library for its namespace.
 *
 * @author quachtina96 (Tina Quach)
 */

'use strict';

goog.provide('BlockLibrary.Storage');

/**
 * Represents a block library's storage.
 * @constructor
 *
 * @param {string} blockLibraryName - desired name of Block Library, also used
 * to create the key for where it's stored in local storage.
 */
BlockLibrary.Storage = function(blockLibraryName) {
  // Add prefix to this.name to avoid collisions in local storage.
  this.name = 'BlockLibrary.Storage.' + blockLibraryName;
  // Initialize this.blocks by loading from local storage.
  this.loadFromLocalStorage();
  if (this.blocks == null) {
    this.blocks = Object.create(null);
    /**
     * The line above is equivalent of {} except that this object is TRULY
     * empty. It doesn't have built-in attributes/functions such as length
     * or toString.
     */
    this.saveToLocalStorage();
  }
};

/**
 * Reads the named block library from local storage and saves it in this.blocks.
 * @private
 * TODO(quacht): add semicolon to the end
 */

BlockLibrary.Storage.prototype.loadFromLocalStorage = function() {
  // goog.global is synonymous to window, and  allows for flexibility
  // between browsers.
  var object = goog.global.localStorage[this.name];
  this.blocks = object ? JSON.parse(object) : null;
};

/**
 * Writes the current block library (this.blocks) to local storage.
 * @private
 * TODO(quacht): add semicolon to the end
 */
BlockLibrary.Storage.prototype.saveToLocalStorage = function() {
  goog.global.localStorage[this.name] = JSON.stringify(this.blocks);
};

/**
 * Clears the current block library.
 */
BlockLibrary.Storage.prototype.clear = function() {
  this.blocks = Object.create(null);
  // The line above is equivalent of {} except that this object is TRULY
  // empty. It doesn't have built-in attributes/functions such as length or
  // toString.
};

/**
 * Saves block to block library.
 *
 * @param {string} blockType - type of block
 * @param {Element} blockXML - the block's XML pulled from workspace
 */
BlockLibrary.Storage.prototype.addBlock = function(blockType, blockXML) {
  var prettyXml = Blockly.Xml.domToPrettyText(blockXML);
  this.blocks[blockType] = prettyXml;
};

/**
 * Removes block from current block library (this.blocks).
 *
 * @param {string} blockType - type of block
 */
BlockLibrary.Storage.prototype.removeBlock = function(blockType) {
  delete this.blocks[blockType];
};

/**
 * Returns the xml of given block type stored in current block library
 * (this.blocks).
 *
 * @param {string} blockType - type of block
 * @return {Element} the xml that represents the block type or null
 */
BlockLibrary.Storage.prototype.getBlockXml = function(blockType) {
  var xml = this.blocks[blockType] || null;
  if (xml) {
    var xml = Blockly.Xml.textToDom(xml);
  }
  return xml;
};

/**
 * Returns array of xmls of given block types stored in current block library
 * (this.blocks).
 *
 * @param {string} blockType - type of block
 * @return {!Array.<Element>} array of xmls that represents the block types
 * or null if that block isn't stored in library
 */
BlockLibrary.Storage.prototype.getBlockXmls = function(blockTypes) {
  var blockXmls = [];
  for (var i = 0; i < blockTypes.length; i++) {
    var xml = this.getBlockXml(blockTypes[i]);
    blockXmls.push(xml);
  }
  return blockXmls;
};

/**
 * Returns array of all block types stored in current block library.
 *
 * @return {!Array.<string>} array of block types stored in library
 */
BlockLibrary.Storage.prototype.getBlockTypes = function() {
  return Object.keys(this.blocks);
};

/**
 * Checks to see if block library is empty.
 *
 * @return {Boolean} true if empty, false otherwise.
 */
BlockLibrary.Storage.prototype.isEmpty = function() {
  for (var blockType in this.blocks) {
    return false;
  }
  return true;
};
