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
 * @fileoverview An object that provides constants for rendering blocks in Zelos
 * mode.
 * @author fenichel@google.com (Rachel Fenichel)
 */
'use strict';

goog.provide('Blockly.zelos.ConstantProvider');

goog.require('Blockly.blockRendering.ConstantProvider');
goog.require('Blockly.utils.svgPaths');

/**
 * An object that provides constants for rendering blocks in Zelos mode.
 * @constructor
 * @package
 * @extends {Blockly.blockRendering.ConstantProvider}
 */
Blockly.zelos.ConstantProvider = function() {
  Blockly.zelos.ConstantProvider.superClass_.constructor.call(this);
};
goog.inherits(Blockly.zelos.ConstantProvider,
    Blockly.blockRendering.ConstantProvider);

/**
 * @override
 */
Blockly.zelos.ConstantProvider.prototype.init = function() {
  Blockly.zelos.ConstantProvider.superClass_.init.call(this);
  this.TRIANGLE = this.makeTriangle();
};

/**
 * @return {!Object} An object containing sizing and path information about
 *     a triangle shape for connections.
 * @package
 */
Blockly.zelos.ConstantProvider.prototype.makeTriangle = function() {
  var width = 20;
  var height = 20;
  // The 'up' and 'down' versions of the paths are the same, but the Y sign
  // flips.  Forward and back are the signs to use to move the cursor in the
  // direction that the path is being drawn.
  function makeMainPath(up) {
    var forward = up ? -1 : 1;

    return Blockly.utils.svgPaths.lineTo(-width, forward * height / 2) +
        Blockly.utils.svgPaths.lineTo(width, forward * height / 2);
  }

  var pathUp = makeMainPath(true);
  var pathDown = makeMainPath(false);

  return {
    width: width,
    height: height,
    pathDown: pathDown,
    pathUp: pathUp
  };
};

/**
 * @override
 */
Blockly.zelos.ConstantProvider.prototype.shapeFor = function(
    connection) {
  var checks = connection.getCheck();
  switch (connection.type) {
    case Blockly.INPUT_VALUE:
    case Blockly.OUTPUT_VALUE:
      // Includes doesn't work in IE.
      if (checks && checks.indexOf('Boolean') != -1) {
        return Blockly.blockRendering.constants.TRIANGLE;
      }
      return Blockly.blockRendering.constants.PUZZLE_TAB;
    case Blockly.PREVIOUS_STATEMENT:
    case Blockly.NEXT_STATEMENT:
      return this.NOTCH;
    default:
      throw new Error('Unknown type');
  }
};
