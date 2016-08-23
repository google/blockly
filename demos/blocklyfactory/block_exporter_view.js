/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2016 Google Inc.
 * https://developers.google.com/blockly/
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * You may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview Javascript for the Block Exporter View class. Reads from and
 * manages a block selector through which users select blocks to export.
 *
 * @author quachtina96 (Tina Quach)
 */

'use strict';

goog.provide('BlockExporterView');

goog.require('BlockExporterTools');
goog.require('BlockOption');
goog.require('goog.dom');

/**
 * BlockExporter View Class
 * @constructor
 *
 * @param {!Object} blockOptions - Map of block types to BlockOption objects.
 */
BlockExporterView = function(blockOptions) {
  //  Map of block types to BlockOption objects to select from.
  this.blockOptions = blockOptions;
};

/**
 * Set the block options in the selector of this instance of
 * BlockExporterView.
 *
 * @param {!Object} blockOptions - Map of block types to BlockOption objects.
 */
BlockExporterView.prototype.setBlockOptions = function(blockOpts) {
  this.blockOptions = blockOpts;
};

/**
 * Set the block options in the selector of this instance of
 * BlockExporterView.
 *
 * @param {!Object} blockOptions - Map of block types to BlockOption objects.
 */
BlockExporterView.prototype.getBlockOptions = function(blockOpts) {
  this.blockOptions = blockOpts;
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
 */
BlockExporterView.prototype.listSelectedBlocks = function() {
  var selectedBlockTypes = this.getSelectedBlockTypes();
  var selectedBlocksText = selectedBlockTypes.join(', ');
  this.updateHelperText('Currently Selected: ' + selectedBlocksText);
};

/**
 * Selects a given block type in the selector.
 *
 * @param {string} blockType - Type of block to selector.
 */
BlockExporterView.prototype.select = function(blockType) {
  this.blockOptions[blockType].setSelected(true);
};

/**
 * Deselects a block in the selector.
 *
 * @param {!Blockly.Block} block - Type of block to add to selector workspce.
 */
BlockExporterView.prototype.deselect = function(blockType) {
  this.blockOptions[blockType].setSelected(false);
};


/**
 * Deselects all blocks.
 */
BlockExporterView.prototype.deselectAllBlocks = function() {
  for (var blockType in this.blockOptions) {
    this.deselect(blockType);
  }
};

/**
 * Given an array of selected blocks, selects these blocks in the view, marking
 * the checkboxes accordingly.
 *
 * @param {Array.<Blockly.Block>} blockTypes - Array of block types to select.
 */
BlockExporterView.prototype.setSelectedBlockTypes = function(blockTypes) {
  for (var i =0, blockType; blockType = blockTypes[i]; i++) {
    this.select(blockType);
  }
};

/**
 * Returns array of selected blocks.
 *
 * @return {!Array.<!string>} Array of all selected block types.
 */
BlockExporterView.prototype.getSelectedBlockTypes = function() {
  var selectedTypes = [];
  for (var blockType in this.blockOptions) {
    var blockOption = this.blockOptions[blockType];
    if (blockOption.isSelected()) {
      selectedTypes.push(blockOption.blockType);
    }
  }
  return selectedTypes;
};

/**
 * Centers the preview block of each block option in the exporter selector.
 */
BlockExporterView.prototype.centerPreviewBlocks = function() {
  for (var blockType in this.blockOptions) {
    this.blockOptions[blockType].centerBlock();
  }
};
