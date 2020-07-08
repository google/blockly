/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview A separator used for separating toolbox categories.
 * @author aschmiedt@google.com (Abby Schmiedt)
 * @author maribethb@google.com (Maribeth Bottorff)
 */
'use strict';

goog.provide('Blockly.ToolboxSeparator');

/**
 * Class for a toolbox separator.
 * @param {!Blockly.utils.toolbox.Separator} toolboxSeparatorDef The information
 *     needed
 * @param {!Blockly.IToolbox} toolbox The parent toolbox for the category.
 * @constructor
 */
Blockly.ToolboxSeparator = function(toolboxSeparatorDef, toolbox) {
  /**
   * The toolbox this category belongs to.
   * @type {!Blockly.IToolbox}
   * @protected
   */
  this.parentToolbox = toolbox;
};

/**
 * Create the dom for a toolbox separator.
 * @return {HTMLDivElement} The div for the separator.
 */
Blockly.ToolboxSeparator.prototype.createDom = function() {
  // TODO: Figure out what spans and divs are actually necessary for this.
  var treeSeparatorContainer = document.createElement('div');
  if (this.parentToolbox.isHorizontal()) {
    treeSeparatorContainer.classList.add('blocklyTreeSeparatorHorizontal');
    if (this.parentToolbox.isRtl()) {
      treeSeparatorContainer.classList.add('blocklyHorizontalTreeRtl');
    } else {
      treeSeparatorContainer.classList.add('blocklyHorizontalTree');
    }
  } else {
    treeSeparatorContainer.classList.add('blocklyTreeSeparator');
  }
  return treeSeparatorContainer;
};

/**
 * Dispose of this separator.
 */
Blockly.ToolboxSeparator.prototype.setSelected = function() {
  // TODO: Figure out what to do here.
};

/**
 * Dispose of this separator.
 */
Blockly.ToolboxSeparator.prototype.dispose = function() {
  // TODO: Dispose of the toolbox category.
};

