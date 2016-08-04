/**
 * @fileoverview Javascript for the Block Exporter View class. Takes care of
 * generating the selector workspace through which users select blocks to
 * export.
 *
 * @author quachtina96 (Tina Quach)
 */

'use strict';

goog.provide('BlockExporterView');

goog.require('goog.dom');

/**
 * BlockExporter View Class
 * @constructor
 *
 * @param {Element} toolbox - Xml for the toolbox of the selector workspace.
 */
BlockExporterView = function(toolbox) {
  // Xml representation of the toolbox
  if (toolbox.hasChildNodes) {
    this.toolbox = toolbox;
  } else {
    // Toolbox is empty. Append dummy category to toolbox because toolbox
    // cannot switch between category and flyout-only mode after injection.
    var categoryElement = goog.dom.createDom('category');
    categoryElement.setAttribute('name', 'Next Saved Block');
    toolbox.appendChild(categoryElement);
    this.toolbox = toolbox;
  }
  // Workspace users use to select blocks for export
  this.selectorWorkspace =
      Blockly.inject('exportSelector',
      {collapse: false,
       toolbox: this.toolbox,
       grid:
         {spacing: 20,
          length: 3,
          colour: '#ccc',
          snap: true}
        });
};

/**
 * Update the toolbox of this instance of BlockExporterView.
 *
 * @param {Element} toolboxXml - Xml for the toolbox of the selector workspace.
 */
BlockExporterView.prototype.setToolbox = function(toolboxXml) {
  // Parse the provided toolbox tree into a consistent DOM format.
  this.toolbox = Blockly.Options.parseToolboxTree(toolboxXml);
};

/**
 * Renders the toolbox in the workspace. Used to update the toolbox upon
 * switching between Block Factory tab and Block Exporter Tab.
 */
BlockExporterView.prototype.renderToolbox = function() {
  this.selectorWorkspace.updateToolbox(this.toolbox);
};

/**
 * Updates the helper text.
 *
 * @param {string} newText - New helper text.
 * @param {boolean} opt_append - True if appending to helper Text, false if
 *    replacing.
 */
BlockExporterView.prototype.updateHelperText = function(newText, opt_append) {
  if (opt_append) {
    goog.dom.getElement('helperText').textContent =
        goog.dom.getElement('helperText').textContent + newText;
  } else {
    goog.dom.getElement('helperText').textContent = newText;
  }
};

/**
 * Updates the helper text to show list of currently selected blocks.
 *
 * @param {!Array.<string>} selectedBlockTypes - Array of blocks selected in workspace.
 */
BlockExporterView.prototype.listSelectedBlocks = function(selectedBlockTypes) {
  var selectedBlocksText = selectedBlockTypes.join(', ');
  this.updateHelperText('Currently Selected: ' + selectedBlocksText);
};

/**
 * Renders block of given type on selector workspace assuming block has already
 * been defined.
 *
 * @param {string} blockType - Type of block to select.
 */
BlockExporterView.prototype.selectBlock = function(blockType) {
  var selectedBlock = this.selectorWorkspace.newBlock(blockType);
  selectedBlock.initSvg();
  selectedBlock.render();
};

/**
 * Clears selector workspace.
 */
BlockExporterView.prototype.clearSelectorWorkspace = function() {
  this.selectorWorkspace.clear();
};

/**
 * Neatly layout the blocks in selector workspace.
 */
BlockExporterView.prototype.cleanSelectorWorkspace = function() {
  this.selectorWorkspace.cleanUp_();
};

/**
 * Returns array of selected blocks.
 *
 * @return {Array.<Blockly.Block>} Array of all blocks in selector workspace.
 */
BlockExporterView.prototype.getSelectedBlocks = function() {
  return this.selectorWorkspace.getAllBlocks();
};


