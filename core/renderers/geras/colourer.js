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
 * @fileoverview
 * @author fenichel@google.com (Rachel Fenichel)
 */
'use strict';

goog.provide('Blockly.geras.Colourer');

goog.require('Blockly.geras.PathObject');


/**
 * )
 * @param {[type]} block [description]
 * @param {[type]} pathObject [description]
 * @implements {Blockly.blockRendering.IColourer}
 * @constructor
 */
Blockly.geras.Colourer = function(block, pathObject) {
  /**
   * The renderer's path object.
   * @type {Blockly.geras.PathObject}
   * @package
   */
  this.pathObject = /** {Blockly.geras.PathObject} */ (pathObject);

  this.svgPath = this.pathObject.svgPath;
  this.svgPathLight = this.pathObject.svgPathLight;
  this.svgPathDark = this.pathObject.svgPathDark;
  this.svgPath.setAttribute('stroke', 'none');
  this.svgPathLight.style.display = '';
  this.svgPathDark.setAttribute('display', '');

  this.colour_;
  this.colourTertiary_;
  this.colourDark_;
  this.colourSecondary_;
  this.styleName_;
};

Blockly.geras.Colourer.prototype.applyColour = function(isShadow) {
  if (isShadow) {
    this.svgPathLight.style.display = 'none';
    this.svgPathDark.setAttribute('fill', this.colourSecondary_);
    this.svgPath.setAttribute('stroke', 'none');
    this.svgPath.setAttribute('fill', this.colourSecondary_);
  } else {
    this.svgPathLight.style.display = '';
    this.svgPathDark.style.display = '';
    this.svgPath.setAttribute('stroke', 'none');
    this.svgPathLight.setAttribute('stroke', this.colourTertiary_);
    this.svgPathDark.setAttribute('fill', this.colourDark_);
    this.svgPath.setAttribute('fill', this.colour_);
  }
};

/**
 * Get the colour of a block.
 * @return {string} #RRGGBB string.
 */
Blockly.geras.Colourer.prototype.getColour = function() {
  return this.colour_;
};

Blockly.geras.Colourer.prototype.getShadowColour = function() {
  return this.colourSecondary_;
};

Blockly.geras.Colourer.prototype.getBorderColour = function() {
  return this.colourTertiary_;
};

Blockly.geras.Colourer.prototype.setColourFromTriplet = function(primary,
    secondary, tertiary) {
  this.colour_ = primary;
  this.colourSecondary_ = secondary ||
      Blockly.utils.colour.blend('#fff', primary, 0.6);
  this.colourTertiary_ = tertiary ||
      Blockly.utils.colour.blend('#fff', primary, 0.3);
  this.colourDark_ = tertiary ||
      Blockly.utils.colour.blend('#000', primary, 0.2);
};

/**
 * Change the colour of a block.
 * @param {number|string} colour HSV hue value (0 to 360), #RRGGBB string,
 *     or a message reference string pointing to one of those two values.
 */
Blockly.geras.Colourer.prototype.setColour = function(colour) {
  var primary = Blockly.blockRendering.Colourer.parseColour(colour).colour;
  this.setColourFromTriplet(primary, null, null);
};

Blockly.geras.Colourer.prototype.setFromStyle = function(blockStyle) {
  var primary =
      Blockly.blockRendering.Colourer.parseColour(blockStyle['colourPrimary'])
          .colour;
  this.setColourFromTriplet(primary,
      blockStyle['colourSecondary'],
      blockStyle['colourTertiary']);
};

