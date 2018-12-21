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
 * @fileoverview The class representing a style.
 * @author aschmiedt@google.com (Abby Schmiedt)
 */
'use strict';

goog.provide('Blockly.Style');
/**
 * Class for a style.
 * @param {Object.<string, Blockly.BlockStyle>} blockStyles A map from style
 * names (strings) to objects with color attributes.
 * @constructor
 */
Blockly.Style = function(blockStyles) {
  this.blockStyles_ = blockStyles;
};

/**
 * Overrides or adds all values from blockStyles to blockStyles_
 * @param {Object.<string, Blockly.BlockStyle>} blockStyles List of a
 * block styles.
 */
Blockly.Style.prototype.setAllBlockStyles = function(blockStyles) {
  for (var key in blockStyles) {
    this.setBlockStyle(key, blockStyles[key]);
  }
};

/**
 * Gets a list of all the block style names.
 * @return{Array.<String>} styleName List of blockstyle names.
 */
Blockly.Style.prototype.getAllBlockStyles = function() {
  return this.blockStyles_;
};

/**
 * Gets the BlockStyle for the given block style name.
 * @param{String} blockStyleName The name of the block style.
 * @return {Blockly.Style} The style with the block style name.
 */
Blockly.Style.prototype.getBlockStyle = function(blockStyleName) {
  return this.blockStyles_[blockStyleName];
};

/**
 * Overrides or adds a style to the blockStyles map.
 * @param{String} blockStyleName The name of the block style.
 * @param{Blockly.BlockStyle} blockStyle The block style
*/
Blockly.Style.prototype.setBlockStyle = function(blockStyleName, blockStyle) {
  this.blockStyles_[blockStyleName] = blockStyle;
};
