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

Blockly.ToolboxSeparator = function(toolboxSeparatorDef, toolbox) {
  this.parentToolbox = toolbox;
};

Blockly.ToolboxSeparator.prototype.createDom = function() {
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
  // TODO: Figure out what spans and divs are actually necessary for this.
  return treeSeparatorContainer;
};

/**
 * Dispose of this separator.
 */
Blockly.ToolboxSeparator.prototype.dispose = function() {
  // TODO: Dispose of the toolbox category.
};

