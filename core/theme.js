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
 * A block style or a category style.
 * @typedef {!Object.<string, string>}
 */
Blockly.Theme.Style;

/**
 * Class for a theme.
 * @param {!Object.<string, Blockly.Theme.Style>} blockStyles A map from style
 *     names (strings) to objects with style attributes relating to blocks.
 * @param {!Object.<string, Blockly.Theme.Style>} categoryStyles A map from
 *     style names (strings) to objects with style attributes relating to
 *     categories.
 * @constructor
 */
Blockly.Theme = function(blockStyles, categoryStyles) {
  this.blockStyles_ = blockStyles;
  this.categoryStyles_ = categoryStyles;
};

/**
 * Overrides or adds all values from blockStyles to blockStyles_
 * @param {Object.<string, Blockly.Theme.Style>} blockStyles Map of
 *     block styles.
 */
Blockly.Theme.prototype.setAllBlockStyles = function(blockStyles) {
  for (var key in blockStyles) {
    this.setBlockStyle(key, blockStyles[key]);
  }
};

/**
 * Gets a map of all the block style names.
 * @return {!Object.<string, Blockly.Theme.Style>} Map of block styles.
 */
Blockly.Theme.prototype.getAllBlockStyles = function() {
  return this.blockStyles_;
};

/**
 * Gets the BlockStyle for the given block style name.
 * @param {string} blockStyleName The name of the block style.
 * @return {Blockly.Theme.Style|undefined} The named block style.
 */
Blockly.Theme.prototype.getBlockStyle = function(blockStyleName) {
  return this.blockStyles_[blockStyleName];
};

/**
 * Overrides or adds a style to the blockStyles map.
 * @param {string} blockStyleName The name of the block style.
 * @param {Blockly.Theme.Style} blockStyle The block style.
*/
Blockly.Theme.prototype.setBlockStyle = function(blockStyleName, blockStyle) {
  this.blockStyles_[blockStyleName] = blockStyle;
};

/**
 * Gets the CategoryStyle for the given category style name.
 * @param {string} categoryStyleName The name of the category style.
 * @return {Blockly.Theme.Style|undefined} The named category style.
 */
Blockly.Theme.prototype.getCategoryStyle = function(categoryStyleName) {
  return this.categoryStyles_[categoryStyleName];
};

/**
 * Overrides or adds a style to the categoryStyles map.
 * @param {string} categoryStyleName The name of the category style.
 * @param {Blockly.Theme.Style} categoryStyle The category style.
*/
Blockly.Theme.prototype.setCategoryStyle = function(categoryStyleName,
    categoryStyle) {
  this.categoryStyles_[categoryStyleName] = categoryStyle;
};
