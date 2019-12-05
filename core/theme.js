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
   * @private
   */
  this.blockStyles_ = {};

  // Make sure all styles are valid before inserting them into the map.
  this.setAllBlockStyles(blockStyles);

  /**
   * The category styles map.
   * @type {!Object.<string, Blockly.Theme.CategoryStyle>}
   * @private
   */
  this.categoryStyles_ = categoryStyles;

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
 * @param {?string} blockStyleName The name of the block style.
 * @return {!Blockly.Theme.BlockStyle} The named block style, or a default style
 *     if no style with the given name was found.
 */
Blockly.Theme.prototype.getBlockStyle = function(blockStyleName) {
  return this.blockStyles_[blockStyleName || ''] ||
      this.createBlockStyle_('#000000');
};

/**
 * Overrides or adds a style to the blockStyles map.
 * @param {string} blockStyleName The name of the block style.
 * @param {Blockly.Theme.BlockStyle} blockStyle The block style.
 */
Blockly.Theme.prototype.setBlockStyle = function(blockStyleName, blockStyle) {
  blockStyle = this.validatedBlockStyle_(blockStyle);
  this.blockStyles_[blockStyleName] = blockStyle;
};

/**
 * Get or create a block style based on a single colour value.  Generate a name
 * for the style based on the colour.
 * @param {string} colour #RRGGBB colour string.
 * @return {{style: !Blockly.Theme.BlockStyle, name: string}} An object
 *     containing the style and an autogenerated name for that style.
 * @package
 */
Blockly.Theme.prototype.getBlockStyleForColour = function(colour) {
  var name = 'auto_' + colour;
  if (!this.blockStyles_[name]) {
    this.blockStyles_[name] = this.createBlockStyle_(colour);
  }
  return {style: this.blockStyles_[name], name: name};
};

/**
 * Create a block style object based on the given colour.
 * @param {string} colour #RRGGBB colour string.
 * @return {!Blockly.Theme.BlockStyle} A fully populated block style based on
 *     the given colour.
 * @protected
 */
Blockly.Theme.prototype.createBlockStyle_ = function(colour) {
  return this.validatedBlockStyle_({
    colourPrimary: colour
  });
};

/**
 * Get a full block style object based on the input style object.  Populate
 * any missing values.
 * @param {{
 *     colourPrimary:string,
 *     colourSecondary:(string|undefined),
 *     colourTertiary:(string|undefined),
 *     hat:(string|undefined)
 * }} blockStyle A full or partial block style object.
 * @return {!Blockly.Theme.BlockStyle} A full block style object, with all
 *     required properties populated.
 * @protected
 */
Blockly.Theme.prototype.validatedBlockStyle_ = function(blockStyle) {
  // Make a new object with all of the same properties.
  var valid = /** @type {!Blockly.Theme.BlockStyle} */ ({});
  if (blockStyle) {
    Blockly.utils.object.mixin(valid, blockStyle);
  }

  // Validate required properties.
  var parsedColour = Blockly.utils.parseBlockColour(
      valid['colourPrimary'] || '#000');
  valid.colourPrimary = parsedColour.hex;
  valid.colourSecondary = valid['colourSecondary'] ?
      Blockly.utils.parseBlockColour(valid['colourSecondary']).hex :
      this.generateSecondaryColour_(valid.colourPrimary);
  valid.colourTertiary = valid.colourTertiary ?
      Blockly.utils.parseBlockColour(valid['colourTertiary']).hex :
      this.generateTertiaryColour_(valid.colourPrimary);

  valid.hat = valid['hat'] || '';
  return valid;
};

/**
 * Generate a secondary colour from the passed in primary colour.
 * @param {string} colour Primary colour.
 * @return {string} The generated secondary colour.
 * @protected
 */
Blockly.Theme.prototype.generateSecondaryColour_ = function(colour) {
  return Blockly.utils.colour.blend('#fff', colour, 0.6) || colour;
};

/**
 * Generate a tertiary colour from the passed in primary colour.
 * @param {string} colour Primary colour.
 * @return {string} The generated tertiary colour.
 * @protected
 */
Blockly.Theme.prototype.generateTertiaryColour_ = function(colour) {
  return Blockly.utils.colour.blend('#fff', colour, 0.3) || colour;
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
 * Gets a map of all the category style names.
 * @return {!Object.<string, Blockly.Theme.CategoryStyle>} Map of category
 *     styles.
 */
Blockly.Theme.prototype.getAllCategoryStyles = function() {
  return this.categoryStyles_;
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
