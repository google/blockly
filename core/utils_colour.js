/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2019 Google Inc.
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
 * @fileoverview Utility methods for colour manipulation.
 * These methods are not specific to Blockly, and could be factored out into
 * a JavaScript framework such as Closure.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

/**
 * @name Blockly.utils.colour
 * @namespace
 */
goog.provide('Blockly.utils.colour');

goog.require('Blockly.utils');

goog.require('goog.color');


/**
 * Parses a colour from a string.
 * .parse('red') -> '#ff0000'
 * .parse('#f00') -> '#ff0000'
 * .parse('#ff0000') -> '#ff0000'
 * .parse('rgb(255, 0, 0)') -> '#ff0000'
 * @param {string} str Colour in some CSS format.
 * @return {string|null} A string containing a hex representation of the colour,
 *   or null if can't be parsed.
 */
Blockly.utils.colour.parse = function(str) {
  str = String(str).toLowerCase().trim();
  var hex = Blockly.utils.colour.names[str];
  if (hex) {
    // e.g. 'red'
    return hex;
  }
  hex = str[0] == '#' ? str : '#' + str;
  if (/^#[0-9a-f]{6}$/.test(hex)) {
    // e.g. '#00ff88'
    return hex;
  }
  if (/^#[0-9a-f]{3}$/.test(hex)) {
    // e.g. '#0f8'
    return ['#', hex[1], hex[1], hex[2], hex[2], hex[3], hex[3]].join('');
  }
  var rgb = str.match(/^(?:rgb)?\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/);
  if (rgb) {
    // e.g. 'rgb(0, 128, 255)'
    var r = Number(rgb[1]);
    var g = Number(rgb[2]);
    var b = Number(rgb[3]);
    if (r >= 0 && r < 256 && g >= 0 && g < 256 && b >= 0 && b < 256) {
      return goog.color.rgbArrayToHex([r, g, b]);
    }
  }
  return null;
};



/**
 * A map that contains the 16 basic colour keywords as defined by W3C:
 * https://www.w3.org/TR/2018/REC-css-color-3-20180619/#html4
 * The keys of this map are the lowercase "readable" names of the colours,
 * while the values are the "hex" values.
 *
 * @type {!Object<string, string>}
 */
Blockly.utils.colour.names = {
  'aqua': '#00ffff',
  'black': '#000000',
  'blue': '#0000ff',
  'fuchsia': '#ff00ff',
  'gray': '#808080',
  'green': '#008000',
  'lime': '#00ff00',
  'maroon': '#800000',
  'navy': '#000080',
  'olive': '#808000',
  'purple': '#800080',
  'red': '#ff0000',
  'silver': '#c0c0c0',
  'teal': '#008080',
  'white': '#ffffff',
  'yellow': '#ffff00'
};
