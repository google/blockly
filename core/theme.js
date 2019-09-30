/**
 * @license
 * Copyright 2018 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
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
 * @fileoverview The class representing a theme.
 */
'use strict';

goog.provide('Blockly.Theme');


/**
 * Class for a theme.
 * @param {!Object.<string, Blockly.Theme.BlockStyle>} blockStyles A map from
 *     style names (strings) to objects with style attributes for blocks.
 * @param {!Object.<string, Blockly.Theme.CategoryStyle>} categoryStyles A map
 *     from style names (strings) to objects with style attributes for
 *     categories.
 * @param {!Object.<string, *>=} opt_componentStyles A map of Blockly component
 *     names to style value.
 * @constructor
 */
Blockly.Theme = function(blockStyles, categoryStyles, opt_componentStyles) {
  /**
   * The block styles map.
   * @type {!Object.<string, Blockly.Theme.BlockStyle>}
   */
  this.blockStyles_ = blockStyles;

  /**
   * The category styles map.
   * @type {!Object.<string, Blockly.Theme.CategoryStyle>}
   */
  this.categoryStyles_ = categoryStyles;

  /**
   * The UI components styles map.
   * @type {!Object.<string, *>}
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
 * Overrides or adds all values from blockStyles to blockStyles_
 * @param {Object.<string, Blockly.Theme.BlockStyle>} blockStyles Map of
 *     block styles.
 */
Blockly.Theme.prototype.setAllBlockStyles = function(blockStyles) {
  for (var key in blockStyles) {
    this.setBlockStyle(key, blockStyles[key]);
  }
};

/**
 * Gets a map of all the block style names.
 * @return {!Object.<string, Blockly.Theme.BlockStyle>} Map of block styles.
 */
Blockly.Theme.prototype.getAllBlockStyles = function() {
  return this.blockStyles_;
};

/**
 * Gets the BlockStyle for the given block style name.
 * @param {string} blockStyleName The name of the block style.
 * @return {Blockly.Theme.BlockStyle|undefined} The named block style.
 */
Blockly.Theme.prototype.getBlockStyle = function(blockStyleName) {
  return this.blockStyles_[blockStyleName];
};

/**
 * Overrides or adds a style to the blockStyles map.
 * @param {string} blockStyleName The name of the block style.
 * @param {Blockly.Theme.BlockStyle} blockStyle The block style.
*/
Blockly.Theme.prototype.setBlockStyle = function(blockStyleName, blockStyle) {
  this.blockStyles_[blockStyleName] = blockStyle;
};

/**
 * Gets the CategoryStyle for the given category style name.
 * @param {string} categoryStyleName The name of the category style.
 * @return {Blockly.Theme.CategoryStyle|undefined} The named category style.
 */
Blockly.Theme.prototype.getCategoryStyle = function(categoryStyleName) {
  return this.categoryStyles_[categoryStyleName];
};

/**
 * Overrides or adds a style to the categoryStyles map.
 * @param {string} categoryStyleName The name of the category style.
 * @param {Blockly.Theme.CategoryStyle} categoryStyle The category style.
*/
Blockly.Theme.prototype.setCategoryStyle = function(categoryStyleName,
    categoryStyle) {
  this.categoryStyles_[categoryStyleName] = categoryStyle;
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
