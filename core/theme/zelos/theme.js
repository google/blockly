/**
 * @license
 * Copyright 2019 Google LLC
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
 * @fileoverview The class representing a Zelos theme.
 */
'use strict';

goog.provide('Blockly.zelos.Theme');

goog.require('Blockly.Theme');
goog.require('Blockly.utils.object');

/**
 * Class for a Zelos-specific theme.  This overrides the secondary and tertiary
 * colour generators to derive dark shades of the primary colour for both.
 * @param {string} name Theme name.
 * @param {!Object.<string, Blockly.Theme.BlockStyle>} blockStyles A map from
 *     style names (strings) to objects with style attributes for blocks.
 * @param {!Object.<string, Blockly.Theme.CategoryStyle>} categoryStyles A map
 *     from style names (strings) to objects with style attributes for
 *     categories.
 * @param {!Object.<string, *>=} opt_componentStyles A map of Blockly component
 *     names to style value.
 * @constructor
 * @extends {Blockly.Theme}
 */
Blockly.zelos.Theme = function(name, blockStyles, categoryStyles,
    opt_componentStyles) {
  Blockly.zelos.Theme.superClass_.constructor.call(this, name,
      blockStyles, categoryStyles, opt_componentStyles);
};
Blockly.utils.object.inherits(Blockly.zelos.Theme, Blockly.Theme);


/**
 * @override
 */
Blockly.zelos.Theme.prototype.generateSecondaryColour_ = function(colour) {
  return Blockly.utils.colour.blend('#000', colour, 0.15) || colour;
};

/**
 * @override
 */
Blockly.zelos.Theme.prototype.generateTertiaryColour_ = function(colour) {
  return Blockly.utils.colour.blend('#000', colour, 0.25) || colour;
};
