/**
 * @fileoverview Javascript for the Block Exporter View class. Allows user to
 * inject the UI of the exporter into a div. Takes care of generating the
 * workspace through which users can select blocks to export.
 *
 * @author quachtina96 (Tina Quach)
 */

'use strict';

goog.provide('BlockExporterView');
// Need controller to get the specific BlockLibrary.Storage object.
goog.require('BlockLibrary.Controller');
goog.require('BlockFactory');
goog.require('goog.dom');

/**
 * BlockExporter View Class
 * @constructor
 *
 * @param {string} blockExporterContainerID - ID of the div in which to inject
 * the block exporter.
 * @param {Element} toolbox - toolbox xml for the selector workspace
 */
BlockExporterView = function(blockExporterContainerID, toolbox) {
  // TODO(quacht): implement the injection of Block Exporter into the given
  // container div.
  // Container in which to inject Block Exporter UI
  this.containerID = blockExporterContainerID;
  // Xml representation of the toolbox
  this.toolbox = toolbox;
  // Workspace users use to select blocks for export
  this.selectorWorkspace =
      // TODO(quacht): use container ID as prefix for the id of all dom elements
      // created for the the export (this.containerID + '_selectorWorkspace').
      Blockly.inject('exportSelector',
      {collapse: false,
       toolbox: this.toolbox,
       grid:
         {spacing: 20,
          length: 3,
          colour: '#ccc',
          snap: true}
        });
  // TODO(quacht): does this assign a pointer to the inputted blockLibStorage
  // object?
};

/**
 * Update the toolbox of this instance of BlockExporterView.
 *
 * @param {Element} toolboxXml - xml for toolbox of the selector workspace
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
 * @param {string} newText - new helper text
 * @param {boolean} opt_append - true if appending to helper Text, false if
 *    replacing
 */
BlockExporterView.prototype.updateHelperText = function(newText, opt_append) {
  if (opt_append) {
    goog.dom.getElement('helperText').textContent =
        goog.dom.getElement('helperText').textContent + newText;
  } else {
    goog.dom.getElement('helperText').textContent = newText;
  }
  return goog.dom.getElement('helperText').textContent;
};



