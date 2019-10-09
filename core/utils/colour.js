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
      return Blockly.utils.colour.rgbToHex(r, g, b);
    }
  }
  return null;
};

/**
 * Converts a colour from RGB to hex representation.
 * @param {number} r Amount of red, int between 0 and 255.
 * @param {number} g Amount of green, int between 0 and 255.
 * @param {number} b Amount of blue, int between 0 and 255.
 * @return {string} Hex representation of the colour.
 */
Blockly.utils.colour.rgbToHex = function(r, g, b) {
  var rgb = (r << 16) | (g << 8) | b;
  if (r < 0x10) {
    return '#' + (0x1000000 | rgb).toString(16).substr(1);
  }
  return '#' + rgb.toString(16);
};

/**
 * Converts a hex representation of a colour to RGB.
 * @param {string} hexColor Colour in '#ff0000' format.
 * @return {!Array.<number>} RGB representation of the colour.
 */
Blockly.utils.colour.hexToRgb = function(hexColor) {
  var rgb = parseInt(hexColor.substr(1), 16);
  var r = rgb >> 16;
  var g = (rgb >> 8) & 255;
  var b = rgb & 255;

  return [r, g, b];
};

/**
 * Converts an HSV triplet to hex representation.
 * @param {number} h Hue value in [0, 360].
 * @param {number} s Saturation value in [0, 1].
 * @param {number} v Brightness in [0, 255].
 * @return {string} Hex representation of the colour.
 */
Blockly.utils.colour.hsvToHex = function(h, s, v) {
  var red = 0;
  var green = 0;
  var blue = 0;
  if (s == 0) {
    red = v;
    green = v;
    blue = v;
  } else {
    var sextant = Math.floor(h / 60);
    var remainder = (h / 60) - sextant;
    var val1 = v * (1 - s);
    var val2 = v * (1 - (s * remainder));
    var val3 = v * (1 - (s * (1 - remainder)));
    switch (sextant) {
      case 1:
        red = val2;
        green = v;
        blue = val1;
        break;
      case 2:
        red = val1;
        green = v;
        blue = val3;
        break;
      case 3:
        red = val1;
        green = val2;
        blue = v;
        break;
      case 4:
        red = val3;
        green = val1;
        blue = v;
        break;
      case 5:
        red = v;
        green = val1;
        blue = val2;
        break;
      case 6:
      case 0:
        red = v;
        green = val3;
        blue = val1;
        break;
    }
  }
  return Blockly.utils.colour.rgbToHex(
      Math.floor(red), Math.floor(green), Math.floor(blue));
};

/**
 * Blend two colours together, using the specified factor to indicate the
 * weight given to the first colour.
 * @param {string} colour1 First colour.
 * @param {string} colour2 Second colour.
 * @param {number} factor The weight to be given to colour1 over colour2.
 *     Values should be in the range [0, 1].
 * @return {string} Combined colour represented in hex.
 */
Blockly.utils.colour.blend = function(colour1, colour2, factor) {
  var rgb1 = Blockly.utils.colour.hexToRgb(Blockly.utils.colour.parse(colour1));
  var rgb2 = Blockly.utils.colour.hexToRgb(Blockly.utils.colour.parse(colour2));
  var r = Math.round(rgb2[0] + factor * (rgb1[0] - rgb2[0]));
  var g = Math.round(rgb2[1] + factor * (rgb1[1] - rgb2[1]));
  var b = Math.round(rgb2[2] + factor * (rgb1[2] - rgb2[2]));
  return Blockly.utils.colour.rgbToHex(r, g, b);
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
