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
 * @fileoverview Javascript for the BlockOption class, used to represent each of
 * the various blocks that you may select. Each block option has a checkbox,
 * a label, and a preview workspace through which to view the block.
 *
 * @author quachtina96 (Tina Quach)
 */
'use strict';

goog.provide('BlockOption');
goog.require('goog.dom');

 /**
 * BlockOption Class
 * A block option includes checkbox, label, and div element that shows a preview
 * of the block.
 * @constructor
 *
 * @param {!Element} blockSelector - Scrollable div that will contain the
 *    block options for the selector.
 * @param {!string} blockType - Type of block for which to create an option.
 * @param {!Element} previewBlockXml - Xml element containing the preview block.
 */
var BlockOption = function(blockSelector, blockType, previewBlockXml) {
  // The div to contain the block option.
  this.blockSelector = blockSelector;
  // The type of block represented by the option.
  this.blockType = blockType;
  // The checkbox for the option. Set in createDom.
  this.checkbox = null;
  // The dom for the option. Set in createDom.
  this.dom = null;
  // Xml element containing the preview block.
  this.previewBlockXml = previewBlockXml;
  // Workspace containing preview of block. Set upon injection of workspace in
  // showPreviewBlock.
  this.previewWorkspace = null;
  // Whether or not block the option is selected.
  this.selected = false;
  // Using this.selected rather than this.checkbox.checked allows for proper
  // handling of click events on the block option; Without this, clicking
  // directly on the checkbox does not toggle selection.
};

/**
 * Creates the dom for a single block option. Includes checkbox, label, and div
 * in which to inject the preview block.
 *
 * @return {!Element} Root node of the selector dom which consists of a
 * checkbox, a label, and a fixed size preview workspace per block.
 */
BlockOption.prototype.createDom = function() {
  // Create the div for the block option.
  var blockOptContainer = goog.dom.createDom('div', {
    'id': this.blockType,
    'class': 'blockOption'
  }, ''); // Empty quotes for empty div.

  // Create and append div in which to inject the workspace for viewing the
  // block option.
  var blockOptionPreview = goog.dom.createDom('div', {
    'id' : this.blockType + '_workspace',
    'class': 'blockOption_preview'
  }, '');
  goog.dom.appendChild(blockOptContainer,blockOptionPreview);

  // Create and append container to hold checkbox and label.
  var checkLabelContainer = goog.dom.createDom('div', {
    'class': 'blockOption_checkLabel'
  }, '');
  goog.dom.appendChild(blockOptContainer,checkLabelContainer);

  // Create and append container for checkbox.
  var checkContainer = goog.dom.createDom('div', {
    'class': 'blockOption_check'
  }, '');
  goog.dom.appendChild(checkLabelContainer, checkContainer);

  // Create and append checkbox.
  this.checkbox = goog.dom.createDom('input', {
    'type': 'checkbox',
    'id': this.blockType + '_check'
  }, '');
  goog.dom.appendChild(checkContainer, this.checkbox);

  // Create and append container for block label.
  var labelContainer = goog.dom.createDom('div', {
    'class': 'blockOption_label'
  }, '');
  goog.dom.appendChild(checkLabelContainer, labelContainer);

  // Create and append text node for the label.
  var labelText = goog.dom.createDom('p', {
    'id': this.blockType + '_text'
  }, this.blockType);
  goog.dom.appendChild(labelContainer, labelText);

  this.dom = blockOptContainer;
  return this.dom;
};

/**
 * Injects a workspace containing the block into the block option's preview div.
 */
BlockOption.prototype.showPreviewBlock = function() {
  // Get ID of preview workspace.
  var blockOptPreviewID = this.dom.id + '_workspace';

  // Inject preview block.
  var workspace = Blockly.inject(blockOptPreviewID, {readOnly:true});
  Blockly.Xml.domToWorkspace(this.previewBlockXml, workspace);
  this.previewWorkspace = workspace;

  // Center the preview block in the workspace.
  this.centerBlock();
};

/**
 * Centers the preview block in the workspace.
 */
BlockOption.prototype.centerBlock = function() {
  // Get metrics.
  var block = this.previewWorkspace.getTopBlocks()[0];
  var blockMetrics = block.getHeightWidth();
  var blockCoordinates = block.getRelativeToSurfaceXY();
  var workspaceMetrics = this.previewWorkspace.getMetrics();

  // Calculate new coordinates.
  var x = workspaceMetrics.viewWidth/2 - blockMetrics['width']/2 -
      blockCoordinates.x;
  var y = workspaceMetrics.viewHeight/2 - blockMetrics['height']/2 -
      blockCoordinates.y;

  // Move block.
  block.moveBy(x, y);
};

/**
 * Selects or deselects the block option.
 *
 * @param {!boolean} selected - True if selecting option, false if deselecting
 *    option.
 */
BlockOption.prototype.setSelected = function(selected) {
  this.selected = selected;
  if (this.checkbox) {
    this.checkbox.checked = selected;
  }
};

/**
 * Returns boolean telling whether or not block is selected.
 *
 * @return {!boolean} True if selecting option, false if deselecting
 *    option.
 */
BlockOption.prototype.isSelected = function() {
  return this.selected;
};


