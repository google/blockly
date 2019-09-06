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
 * @fileoverview TODO
 * @author fenichel@google.com (Rachel Fenichel)
 */

'use strict';

goog.provide('Blockly.blockRendering.PathObject');

goog.require('Blockly.utils.dom');


Blockly.blockRendering.PathObject = function(root) {
  this.svgRoot = root;

  /**
   * @type {SVGElement}
   * @package
   */
  this.svgPath = Blockly.utils.dom.createSvgElement('path',
      {'class': 'blocklyPath'}, this.svgRoot);

  // The light and dark paths need to exist (for now) because there is colouring
  // code in block_svg that depends on them.  But we will always set them to
  // display: none, and eventually we want to remove them entirely.

  /**
   * @type {SVGElement}
   * @package
   */
  this.svgPathLight = Blockly.utils.dom.createSvgElement('path',
      {'class': 'blocklyPathLight'}, this.svgRoot);

  /**
   * @type {SVGElement}
   * @package
   */
  this.svgPathDark = Blockly.utils.dom.createSvgElement('path',
      {'class': 'blocklyPathDark', 'transform': 'translate(1,1)'},
      this.svgRoot);
};

Blockly.blockRendering.PathObject.prototype.setPaths = function(pathString) {
  this.svgPath.setAttribute('d', pathString);
  if (this.RTL) {
    // Mirror the block's path.
    this.svgPath.setAttribute('transform', 'scale(-1 1)');
  }

  this.svgPathLight.style.display = 'none';
  this.svgPathDark.style.display = 'none';
};
