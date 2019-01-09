/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2018 Google Inc.
 * https://developers.google.com/blockly/
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
 * @param {?Object.<string, Blockly.BlockStyle>} blockStyles A map from style
 * names (strings) to objects with style attributes relating to blocks.
 * @param {?Object.<string, Blockly.CategoryStyle>} categoryStyles A map from style
 * names (strings) to objects with style attributes relating to categories.
 * @constructor
 */
Blockly.Theme = function(blockStyles, categoryStyles) {
  this.blockStyles_ = blockStyles;
  this.categoryStyles_ = categoryStyles;
};

/**
 * Overrides or adds all values from blockStyles to blockStyles_
 * @param {Object.<string, Blockly.BlockStyle>} blockStyles List of
 * block styles.
 */
Blockly.Theme.prototype.setAllBlockStyles = function(blockStyles) {
  for (var key in blockStyles) {
    this.setBlockStyle(key, blockStyles[key]);
  }
};

/**
 * Gets a list of all the block style names.
 * @return{Array.<String>} styleName List of blockstyle names.
 */
Blockly.Theme.prototype.getAllBlockStyles = function() {
  return this.blockStyles_;
};

/**
 * Gets the BlockStyle for the given block style name.
 * @param{String} blockStyleName The name of the block style.
 * @return {Blockly.BlockStyle} The style with the block style name.
 */
Blockly.Theme.prototype.getBlockStyle = function(blockStyleName) {
  return this.blockStyles_[blockStyleName];
};

/**
 * Overrides or adds a style to the blockStyles map.
 * @param{String} blockStyleName The name of the block style.
 * @param{Blockly.BlockStyle} blockStyle The block style
*/
Blockly.Theme.prototype.setBlockStyle = function(blockStyleName, blockStyle) {
  this.blockStyles_[blockStyleName] = blockStyle;
};

/**
 * Gets the CategoryStyle for the given category style name.
 * @param{String} categoryStyleName The name of the block style.
 * @return {Blockly.CategoryStyle} The style with the block style name.
 */
Blockly.Theme.prototype.getCategoryStyle = function(categoryStyleName) {
  return this.categoryStyles_[categoryStyleName];
};

/**
 * Overrides or adds a style to the categoryStyles map.
 * @param{String} categoryStyleName The name of the category style.
 * @param{Blockly.CategoryStyle} categoryStyle The category style
*/
Blockly.Theme.prototype.setCategoryStyle = function(categoryStyleName, categoryStyle) {
  this.categoryStyles_[categoryStyleName] = categoryStyle;
};
