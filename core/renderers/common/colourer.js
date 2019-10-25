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

goog.provide('Blockly.blockRendering.Colourer');
goog.provide('Blockly.blockRendering.IColourer');

goog.require('Blockly.blockRendering.IPathObject');

/**
 * An interface for a block's colourer object.
 * @param {!SVGElement} _root The root SVG element.
 * @interface
 */
Blockly.blockRendering.IColourer = function(block, pathObject) {};

/**
 * )
 * @param {[type]} block [description]
 * @param {[type]} pathObject [description]
 * @implements {Blockly.blockRendering.IColourer}
 * @constructor
 */
Blockly.blockRendering.Colourer = function(block, pathObject) {
  this.block = block;
  /**
   * The renderer's path object.
   * @type {Blockly.blockRendering.IPathObject}
   * @package
   */
  this.pathObject = /** {Blockly.BlockRender.PathObject} */ (pathObject);

  this.svgPath = this.pathObject.svgPath;

  this.hue_;
  this.colour_;
  this.colourSecondary_;
  this.colourTertiary_;
};

Blockly.blockRendering.Colourer.prototype.applyColours = function(isShadow) {
  if (isShadow) {
    this.svgPath.setAttribute('stroke', 'none');
    this.svgPath.setAttribute('fill', this.colourSecondary_);
  } else {
    this.svgPath.setAttribute('stroke', this.colourTertiary_);
    this.svgPath.setAttribute('fill', this.colour_);
  }
};

/**
 * Change the colour of a block.
 * @param {number|string} colour HSV hue value (0 to 360), #RRGGBB string,
 *     or a message reference string pointing to one of those two values.
 */
Blockly.blockRendering.Colourer.prototype.setColour = function(colour) {
  console.log('todo: set colour');
  // this.colour_ = colour;
  // this.colourSecondary_ = Blockly.utils.colour.blend('#fff', this.colour, 0.6);
  // this.colourTertiary_ = Blockly.utils.colour.blend('#fff', this.colour, 0.3);
};

Blockly.blockRendering.Colourer.prototype.setFromStyle = function(blockStyle) {
  this.parseColour(blockStyle['colourPrimary']);
  this.colourSecondary_ = blockStyle['colourSecondary'] ||
      Blockly.utils.colour.blend('#fff', this.colour_, 0.6);
  this.colourTertiary_ = blockStyle['colourTertiary'] ||
      Blockly.utils.colour.blend('#fff', this.colour_, 0.3);
};

Blockly.blockRendering.Colourer.prototype.getBorderColour = function() {
  return this.colourTertiary_;
};

Blockly.blockRendering.Colourer.prototype.getShadowColour = function() {
  return this.colourSecondary_;
};

/**
 * Change the colour of a block.
 * @param {number|string} colour HSV hue value (0 to 360), #RRGGBB string,
 *     or a message reference string pointing to one of those two values.
 * @return {{hue: ?number, colour: string}} An object containing the colour as
 *     a #RRGGBB string, and the hue if the input was an HSV hue value.
 */
Blockly.blockRendering.Colourer.parseColour = function(colour) {
  var dereferenced = (typeof colour == 'string') ?
      Blockly.utils.replaceMessageReferences(colour) : colour;

  var hue = Number(dereferenced);
  if (!isNaN(hue) && 0 <= hue && hue <= 360) {
    return {
      hue: hue,
      colour: Blockly.hueToHex(hue)
    };
  } else {
    var hex = Blockly.utils.colour.parse(dereferenced);
    if (hex) {
      // Only store hue if colour is set as a hue.
      return {
        hue: null,
        colour: hex
      };
    } else {
      var errorMsg = 'Invalid colour: "' + dereferenced + '"';
      if (colour != dereferenced) {
        errorMsg += ' (from "' + colour + '")';
      }
      throw Error(errorMsg);
    }
  }
};
