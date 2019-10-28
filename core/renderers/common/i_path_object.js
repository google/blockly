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
 * @fileoverview The interface for an object that owns a block's rendering SVG
 * elements.
 * @author fenichel@google.com (Rachel Fenichel)
 */

'use strict';

goog.provide('Blockly.blockRendering.IPathObject');


/**
 * An interface for a block's path object.
 * @param {!SVGElement} _root The root SVG element.
 * @interface
 */
Blockly.blockRendering.IPathObject = function(_root) {};

/**
 * Apply the stored colours to the block's path, taking into account whether
 * the paths belong to a shadow block.
 * @param {boolean} isShadow True if the block is a shadow block.
 * @package
 */
Blockly.blockRendering.IPathObject.prototype.applyColour;

/**
 * Update colour properties based on a single colour value.
 * @param {number|string} colour HSV hue value (0 to 360), #RRGGBB string,
 *     or a message reference string pointing to one of those two values.
 * @package
 */
Blockly.blockRendering.IPathObject.prototype.setColour;

/**
 * Update colour properties based on a block style.
 * @param {!Blockly.Theme.BlockStyle} blockStyle The block style to use.
 * @package
 */
Blockly.blockRendering.IPathObject.prototype.setColourFromStyle;

/**
 * Flip the SVG paths in RTL.
 * @package
 */
Blockly.geras.PathObject.prototype.flipRTL;
