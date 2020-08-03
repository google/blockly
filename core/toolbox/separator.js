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

goog.require('Blockly.ToolboxItem');


/**
 * Class for a toolbox separator. This is the thin visual line that appears on
 * the toolbox. This item is not interactable.
 * @param {!Blockly.utils.toolbox.Separator} toolboxSeparatorDef The information
 *     needed to create a separator.
 * @param {!Blockly.IToolbox} toolbox The parent toolbox for the separator.
 * @constructor
 * @extends {Blockly.ToolboxItem}
 */
Blockly.ToolboxSeparator = function(toolboxSeparatorDef, toolbox) {

  Blockly.ToolboxSeparator.superClass_.constructor.call(
      this, toolboxSeparatorDef, toolbox);
  /**
   * All the css class names that are used to create a separator.
   * @type {!Blockly.ToolboxSeparator.CssConfig}
   * @protected
   */
  this.cssConfig_ = {
    'container': 'blocklyTreeSeparator'
  };

  Blockly.utils.object.mixin(this.cssConfig_,
      toolboxSeparatorDef['cssConfig']);
};
Blockly.utils.object.inherits(Blockly.ToolboxSeparator, Blockly.ToolboxItem);

/**
 * All the css class names that are used to create a separator.
 * @typedef {{
 *            container:?string,
 *          }}
 */
Blockly.ToolboxSeparator.CssConfig;

/**
 * @override
 */
Blockly.ToolboxSeparator.prototype.createDom = function() {
  var container = document.createElement('div');
  Blockly.utils.dom.addClass(container, this.cssConfig_['container']);
  this.htmlDiv_ = container;
  return container;
};

/**
 * @override
 */
Blockly.ToolboxSeparator.prototype.getDiv = function() {
  return this.htmlDiv_;
};

/**
 * @override
 */
Blockly.ToolboxSeparator.prototype.dispose = function() {
  Blockly.utils.dom.removeNode(this.htmlDiv_);
};
