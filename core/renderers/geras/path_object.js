/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2016 Google Inc.
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
 * @fileoverview Methods for graphically rendering a block as SVG.
 * @author fenichel@google.com (Rachel Fenichel)
 */

'use strict';

goog.provide('Blockly.geras.PathObject');

goog.require('Blockly.BlockSvg');
goog.require('Blockly.utils.dom');


/**
 * An object that holds information about the paths that are used to render the
 * block.  Each path is built up as an array of steps during the render process.
 * The arrays are then turned into strings, which are set in the block's SVG.
 * @constructor
 * @struct
 * @private
 */
Blockly.geras.PathObject = function(block) {
  this.svgRoot = block.getSvgRoot();

  /**
   * @type {SVGElement}
   * @package
   */
  this.svgPath = Blockly.utils.dom.createSvgElement('path',
      {'class': 'blocklyPath'}, this.svgGroup_);

  /**
   * @type {SVGElement}
   * @package
   */
  this.svgPathDark = Blockly.utils.dom.createSvgElement('path',
      {'class': 'blocklyPathDark', 'transform': 'translate(1,1)'},
      this.svgGroup_);

  /**
   * @type {SVGElement}
   * @package
   */
  this.svgPathLight = Blockly.utils.dom.createSvgElement('path',
      {'class': 'blocklyPathLight'}, this.svgGroup_);
};

/**
 * Update the block's SVG paths based on the paths that were computed during
 * this render pass.
 * @param {!Blockly.BlockSvg.PathObject} pathObject The object containing
 *     partially constructed SVG paths, which will be modified by this function.
 * @private
 */
Blockly.geras.PathObject.prototype.setPaths = function(mainPath, highlightPath) {
  this.svgPath.setAttribute('d', mainPath);
  this.svgPathDark.setAttribute('d', mainPath);
  this.svgPathLight.setAttribute('d', highlightPath);
  if (this.RTL) {
    // Mirror the block's path.
    this.svgPath.setAttribute('transform', 'scale(-1 1)');
    this.svgPathLight.setAttribute('transform', 'scale(-1 1)');
    this.svgPathDark.setAttribute('transform', 'translate(1,1) scale(-1 1)');
  }
};
