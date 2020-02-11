/**
 * @license
 * Copyright 2018 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview The class representing a theme.
 */
'use strict';

goog.provide('Blockly.Theme');

goog.require('Blockly.utils');
goog.require('Blockly.utils.colour');


/**
 * Class for a theme.
 * @param {string} name Theme name.
 * @param {!Object.<string, Blockly.Theme.BlockStyle>} blockStyles A map from
 *     style names (strings) to objects with style attributes for blocks.
 * @param {!Object.<string, Blockly.Theme.CategoryStyle>} categoryStyles A map
 *     from style names (strings) to objects with style attributes for
 *     categories.
 * @param {!Object.<string, *>=} opt_componentStyles A map of Blockly component
 *     names to style value.
 * @constructor
 */
Blockly.Theme = function(name, blockStyles, categoryStyles,
    opt_componentStyles) {

  /**
   * The theme name. This can be used to reference a specific theme in CSS.
   * @type {string}
   * @package
   */
  this.name = name;

  /**
   * The block styles map.
   * @type {!Object.<string, !Blockly.Theme.BlockStyle>}
   * @package
   */
  this.blockStyles = blockStyles;

  /**
   * The category styles map.
   * @type {!Object.<string, Blockly.Theme.CategoryStyle>}
   * @package
   */
  this.categoryStyles = categoryStyles;

  /**
   * The UI components styles map.
   * @type {!Object.<string, *>}
   * @private
   */
  this.componentStyles_ = opt_componentStyles || Object.create(null);
};

/**
 * A block style.
 * @typedef {{
  *            colourPrimary:string,
  *            colourSecondary:string,
  *            colourTertiary:string,
  *            hat:string
  *          }}
  */
Blockly.Theme.BlockStyle;

/**
 * A category style.
 * @typedef {{
  *            colour:string
  *          }}
  */
Blockly.Theme.CategoryStyle;

/**
 * Overrides or adds a style to the blockStyles map.
 * @param {string} blockStyleName The name of the block style.
 * @param {Blockly.Theme.BlockStyle} blockStyle The block style.
*/
Blockly.Theme.prototype.setBlockStyle = function(blockStyleName, blockStyle) {
  this.blockStyles[blockStyleName] = blockStyle;
};

/**
 * Overrides or adds a style to the categoryStyles map.
 * @param {string} categoryStyleName The name of the category style.
 * @param {Blockly.Theme.CategoryStyle} categoryStyle The category style.
*/
Blockly.Theme.prototype.setCategoryStyle = function(categoryStyleName,
    categoryStyle) {
  this.categoryStyles[categoryStyleName] = categoryStyle;
};

/**
 * Gets the style for a given Blockly UI component.  If the style value is a
 * string, we attempt to find the value of any named references.
 * @param {string} componentName The name of the component.
 * @return {?string} The style value.
 */
Blockly.Theme.prototype.getComponentStyle = function(componentName) {
  var style = this.componentStyles_[componentName];
  if (style && typeof propertyValue == 'string' &&
      this.getComponentStyle(/** @type {string} */ (style))) {
    return this.getComponentStyle(/** @type {string} */ (style));
  }
  return style ? String(style) : null;
};

/**
 * Configure a specific Blockly UI component with a style value.
 * @param {string} componentName The name of the component.
 * @param {*} styleValue The style value.
*/
Blockly.Theme.prototype.setComponentStyle = function(componentName,
    styleValue) {
  this.componentStyles_[componentName] = styleValue;
};
