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

goog.require('Blockly.IToolboxItem');
goog.require('Blockly.registry');
goog.require('Blockly.ToolboxItem');
goog.require('Blockly.utils.dom');

goog.requireType('Blockly.IToolbox');
goog.requireType('Blockly.utils.toolbox');


/**
 * Class for a toolbox separator. This is the thin visual line that appears on
 * the toolbox. This item is not interactable.
 * @param {!Blockly.utils.toolbox.SeparatorInfo} separatorDef The information
 *     needed to create a separator.
 * @param {!Blockly.IToolbox} toolbox The parent toolbox for the separator.
 * @constructor
 * @extends {Blockly.ToolboxItem}
 * @implements {Blockly.IToolboxItem}
 */
Blockly.ToolboxSeparator = function(separatorDef, toolbox) {

  Blockly.ToolboxSeparator.superClass_.constructor.call(
      this, separatorDef, toolbox);
  /**
   * All the CSS class names that are used to create a separator.
   * @type {!Blockly.ToolboxSeparator.CssConfig}
   * @protected
   */
  this.cssConfig_ = {
    'container': 'blocklyTreeSeparator'
  };

  var cssConfig = separatorDef['cssconfig'] || separatorDef['cssConfig'];
  Blockly.utils.object.mixin(this.cssConfig_, cssConfig);
};
Blockly.utils.object.inherits(Blockly.ToolboxSeparator, Blockly.ToolboxItem);

/**
 * All the CSS class names that are used to create a separator.
 * @typedef {{
 *            container:(string|undefined)
 *          }}
 */
Blockly.ToolboxSeparator.CssConfig;

/**
 * Name used for registering a toolbox separator.
 * @const {string}
 */
Blockly.ToolboxSeparator.registrationName = 'sep';

/**
 * @override
 */
Blockly.ToolboxSeparator.prototype.init = function() {
  this.createDom_();
};

/**
 * Creates the DOM for a separator.
 * @return {!Element} The parent element for the separator.
 * @protected
 */
Blockly.ToolboxSeparator.prototype.createDom_ = function() {
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

/**
 * CSS for Toolbox.  See css.js for use.
 */
Blockly.Css.register([
  /* eslint-disable indent */
  '.blocklyTreeSeparator {',
    'border-bottom: solid #e5e5e5 1px;',
    'height: 0;',
    'margin: 5px 0;',
  '}',

  '.blocklyToolboxDiv[layout="h"] .blocklyTreeSeparator {',
    'border-right: solid #e5e5e5 1px;',
    'border-bottom: none;',
    'height: auto;',
    'margin: 0 5px 0 5px;',
    'padding: 5px 0;',
    'width: 0;',
  '}',
  /* eslint-enable indent */
]);

Blockly.registry.register(Blockly.registry.Type.TOOLBOX_ITEM,
    Blockly.ToolboxSeparator.registrationName, Blockly.ToolboxSeparator);
