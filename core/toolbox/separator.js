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

goog.module('Blockly.ToolboxSeparator');
goog.module.declareLegacyNamespace();

goog.require('Blockly.Css');
goog.require('Blockly.IToolboxItem');
goog.require('Blockly.registry');
goog.require('Blockly.ToolboxItem');
goog.require('Blockly.utils.dom');
goog.require('Blockly.utils.object');

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
const ToolboxSeparator = function(separatorDef, toolbox) {

  ToolboxSeparator.superClass_.constructor.call(
      this, separatorDef, toolbox);
  /**
   * All the CSS class names that are used to create a separator.
   * @type {!ToolboxSeparator.CssConfig}
   * @protected
   */
  this.cssConfig_ = {
    'container': 'blocklyTreeSeparator'
  };

  const cssConfig = separatorDef['cssconfig'] || separatorDef['cssConfig'];
  Blockly.utils.object.mixin(this.cssConfig_, cssConfig);
};
Blockly.utils.object.inherits(ToolboxSeparator, Blockly.ToolboxItem);

/**
 * All the CSS class names that are used to create a separator.
 * @typedef {{
 *            container:(string|undefined)
 *          }}
 */
ToolboxSeparator.CssConfig;

/**
 * Name used for registering a toolbox separator.
 * @const {string}
 */
ToolboxSeparator.registrationName = 'sep';

/**
 * @override
 */
ToolboxSeparator.prototype.init = function() {
  this.createDom_();
};

/**
 * Creates the DOM for a separator.
 * @return {!Element} The parent element for the separator.
 * @protected
 */
ToolboxSeparator.prototype.createDom_ = function() {
  const container = document.createElement('div');
  Blockly.utils.dom.addClass(container, this.cssConfig_['container']);
  this.htmlDiv_ = container;
  return container;
};

/**
 * @override
 */
ToolboxSeparator.prototype.getDiv = function() {
  return this.htmlDiv_;
};

/**
 * @override
 */
ToolboxSeparator.prototype.dispose = function() {
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
    ToolboxSeparator.registrationName, ToolboxSeparator);

exports = ToolboxSeparator;
