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
 * @fileoverview An object that owns a block's rendering SVG elements.
 * @author samelh@google.com (Sam El-Husseini)
 */

'use strict';

goog.provide('Blockly.zelos.PathObject');

goog.require('Blockly.blockRendering.PathObject');
goog.require('Blockly.zelos.ConstantProvider');
goog.require('Blockly.utils.dom');
goog.require('Blockly.utils.object');


/**
 * An object that handles creating and setting each of the SVG elements
 * used by the renderer.
 * @param {!SVGElement} root The root SVG element.
 * @param {!Blockly.zelos.ConstantProvider} constants The renderer's constants.
 * @constructor
 * @extends {Blockly.blockRendering.PathObject}
 * @package
 */
Blockly.zelos.PathObject = function(root, constants) {
  Blockly.zelos.PathObject.superClass_.constructor.call(this, root, constants);

  /**
   * The renderer's constant provider.
   * @type {!Blockly.zelos.ConstantProvider}
   */
  this.constants_ = constants;

  /**
   * The selected path of the block.
   * @type {SVGElement}
   * @private
   */
  this.svgPathSelected_ = null;

  /**
   * The outline paths on the block.
   * @type {!Object.<string,!SVGElement>}
   * @private
   */
  this.outlines_ = {};

  /**
   * The set of outlines. This is used to keep track of all outlines that are
   * used during a draw pass and remove the ones that were not at the end of the
   * draw pass.
   * @type {Object.<string>}
   * @private
   */
  this.usedOutlines_ = null;
};
Blockly.utils.object.inherits(Blockly.zelos.PathObject,
    Blockly.blockRendering.PathObject);

/**
 * @override
 */
Blockly.zelos.PathObject.prototype.setPath = function(pathString) {
  Blockly.zelos.PathObject.superClass_.setPath.call(this, pathString);
  if (this.svgPathSelected_) {
    this.svgPathSelected_.setAttribute('d', pathString);
  }
};

/**
 * @override
 */
Blockly.zelos.PathObject.prototype.updateSelected = function(enable) {
  this.setClass_('blocklySelected', enable);
  if (enable) {
    this.svgPathSelected_ =
      /** @type {!SVGElement} */ (this.svgPath.cloneNode(true));
    this.svgPathSelected_.setAttribute('fill', 'none');
    this.svgPathSelected_.setAttribute('filter',
        'url(#' + this.constants_.highlightGlowFilterId + ')');
    this.svgRoot.appendChild(this.svgPathSelected_);
  } else {
    if (this.svgPathSelected_) {
      this.svgRoot.removeChild(this.svgPathSelected_);
      this.svgPathSelected_ = null;
    }
  }
};

/**
 * @override
 */
Blockly.zelos.PathObject.prototype.beginDrawing = function() {
  this.usedOutlines_ = {};
  for (var i = 0, keys = Object.keys(this.outlines_),
    key; (key = keys[i]); i++) {
    this.usedOutlines_[key] = 1;
  }
};

/**
 * @override
 */
Blockly.zelos.PathObject.prototype.endDrawing = function() {
  // Go through all remaining outlines that were not used this draw pass, and
  // remove them.
  if (this.usedOutlines_) {
    for (var i = 0, keys = Object.keys(this.usedOutlines_),
      key; (key = keys[i]); i++) {
      this.removeOutlinePath_(key);
    }
  }
  this.usedOutlines_ = null;
};

/**
 * Set the path generated by the renderer for an outline path on the respective
 * outline path SVG element.
 * @param {string} name The input name.
 * @param {string} pathString The path.
 * @package
 */
Blockly.zelos.PathObject.prototype.setOutlinePath = function(name, pathString) {
  var outline = this.getOutlinePath_(name);
  outline.setAttribute('d', pathString);
  outline.setAttribute('fill', this.style.colourTertiary);
};

/**
 * Create's an outline path for the specified input.
 * @param {string} name The input name.
 * @return {!SVGElement} The SVG outline path.
 * @private
 */
Blockly.zelos.PathObject.prototype.getOutlinePath_ = function(name) {
  if (!this.outlines_[name]) {
    this.outlines_[name] = Blockly.utils.dom.createSvgElement('path', {
      'class': 'blocklyOutlinePath',
      // IE doesn't like paths without the data definition, set empty default
      'd': ''
    },
    this.svgRoot);
  }
  if (this.usedOutlines_) {
    delete this.usedOutlines_[name];
  }
  return this.outlines_[name];
};

/**
 * Remove an outline path that is associated with the specified input.
 * @param {string} name The input name.
 * @private
 */
Blockly.zelos.PathObject.prototype.removeOutlinePath_ = function(name) {
  this.outlines_[name].parentNode.removeChild(this.outlines_[name]);
  delete this.outlines_[name];
};
