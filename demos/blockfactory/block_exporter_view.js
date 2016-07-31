/**
 * @fileoverview Javascript for the Block Exporter View class. Takes care of
 * generating the workspace through which users can select blocks to export.
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
  this.selectorWorkspace.toolbox_.populate_(this.toolbox);
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
 * Clears selector workspace.
 */
BlockExporterView.prototype.clearSelectorWorkspace = function() {
  this.selectorWorkspace.clear();
};

/**
 * Returns array of selected blocks.
 *
 * @return {Array.<Blockly.Block>} Array of all blocks in selector workspace.
 */
BlockExporterView.prototype.getSelectedBlocks = function() {
  return this.selectorWorkspace.getAllBlocks();
};


