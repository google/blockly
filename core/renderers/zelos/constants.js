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
 * @fileoverview An object that provides constants for rendering blocks in Zelos
 * mode.
 * @author fenichel@google.com (Rachel Fenichel)
 */
'use strict';

goog.provide('Blockly.zelos.ConstantProvider');

goog.require('Blockly.blockRendering.ConstantProvider');
goog.require('Blockly.utils.object');
goog.require('Blockly.utils.svgPaths');


/**
 * An object that provides constants for rendering blocks in Zelos mode.
 * @constructor
 * @package
 * @extends {Blockly.blockRendering.ConstantProvider}
 */
Blockly.zelos.ConstantProvider = function() {
  Blockly.zelos.ConstantProvider.superClass_.constructor.call(this);

  this.GRID_UNIT = 4;

  /**
   * @override
   */
  this.CORNER_RADIUS = 1 * this.GRID_UNIT;

  /**
   * @override
   */
  this.NOTCH_WIDTH = 9 * this.GRID_UNIT;

  /**
   * @override
   */
  this.NOTCH_HEIGHT = 2 * this.GRID_UNIT;

  /**
   * @override
   */
  this.NOTCH_OFFSET_LEFT = 3 * this.GRID_UNIT;

  /**
   * @override
   */
  this.MIN_BLOCK_HEIGHT = 12 * this.GRID_UNIT;

  /**
   * @override
   */
  this.TAB_OFFSET_FROM_TOP = 0;

};
Blockly.utils.object.inherits(Blockly.zelos.ConstantProvider,
    Blockly.blockRendering.ConstantProvider);

/**
 * @override
 */
Blockly.zelos.ConstantProvider.prototype.init = function() {
  Blockly.zelos.ConstantProvider.superClass_.init.call(this);
  this.HEXAGONAL = this.makeHexagonal();
  this.ROUNDED = this.makeRounded();
};

/**
 * @return {!Object} An object containing sizing and path information about
 *     a hexagonal shape for connections.
 * @package
 */
Blockly.zelos.ConstantProvider.prototype.makeHexagonal = function() {
  // The 'up' and 'down' versions of the paths are the same, but the Y sign
  // flips.  Forward and back are the signs to use to move the cursor in the
  // direction that the path is being drawn.
  function makeMainPath(height, up, right) {
    var width = height / 2;
    var forward = up ? -1 : 1;
    var direction = right ? -1 : 1;

    return Blockly.utils.svgPaths.lineTo(-1 * direction * width, forward * height / 2) +
        Blockly.utils.svgPaths.lineTo(direction * width, forward * height / 2);
  }

  return {
    width: 0,
    height: 0,
    isDynamic: true,
    pathDown: function(height) {
      return makeMainPath(height, false, false);
    },
    pathUp: function(height) {
      return makeMainPath(height, true, false);
    },
    pathRightDown: function(height) {
      return makeMainPath(height, false, true);
    },
    pathRightUp: function(height) {
      return makeMainPath(height, false, true);
    },
  };
};

/**
 * @return {!Object} An object containing sizing and path information about
 *     a rounded shape for connections.
 * @package
 */
Blockly.zelos.ConstantProvider.prototype.makeRounded = function() {
  // The 'up' and 'down' versions of the paths are the same, but the Y sign
  // flips.  Forward and back are the signs to use to move the cursor in the
  // direction that the path is being drawn.
  function makeMainPath(height, up, right) {
    var edgeWidth = height / 2;
    return Blockly.utils.svgPaths.arc('a', '0 0 ' + (up || right ? 1 : 0), edgeWidth,
        Blockly.utils.svgPaths.point(0, (up ? -1 : 1) * edgeWidth * 2));
  }

  return {
    width: 0,
    height: 0,
    isDynamic: true,
    pathDown: function(height) {
      return makeMainPath(height, false, false);
    },
    pathUp: function(height) {
      return makeMainPath(height, true, false);
    },
    pathRightDown: function(height) {
      return makeMainPath(height, false, true);
    },
    pathRightUp: function(height) {
      return makeMainPath(height, false, true);
    },
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
        return this.HEXAGONAL;
      }
      if (checks && checks.indexOf('Number') != -1) {
        return this.ROUNDED;
      }
      if (checks && checks.indexOf('String') != -1) {
        return this.ROUNDED;
      }
      return this.PUZZLE_TAB;
    case Blockly.PREVIOUS_STATEMENT:
    case Blockly.NEXT_STATEMENT:
      return this.NOTCH;
    default:
      throw Error('Unknown type');
  }
};

/**
 * @override
 */
Blockly.zelos.ConstantProvider.prototype.makeNotch = function() {
  var width = this.NOTCH_WIDTH;
  var height = this.NOTCH_HEIGHT;

  var innerWidth = width / 3;
  var curveWidth = innerWidth / 3;

  var halfHeight = height / 2;
  var quarterHeight = halfHeight / 2;

  function makeMainPath(dir) {
    return (
      Blockly.utils.svgPaths.curve('c', [
        Blockly.utils.svgPaths.point(dir * curveWidth / 2,
            0),
        Blockly.utils.svgPaths.point(dir * curveWidth * 3 / 4,
            quarterHeight / 2),
        Blockly.utils.svgPaths.point(dir * curveWidth,
            quarterHeight)
      ]) +
      Blockly.utils.svgPaths.line([
        Blockly.utils.svgPaths.point(dir * curveWidth,
            halfHeight)
      ]) +
      Blockly.utils.svgPaths.curve('c', [
        Blockly.utils.svgPaths.point(dir * curveWidth / 4,
            quarterHeight / 2),
        Blockly.utils.svgPaths.point(dir * curveWidth / 2,
            quarterHeight),
        Blockly.utils.svgPaths.point(dir * curveWidth,
            quarterHeight)
      ]) +
      Blockly.utils.svgPaths.lineOnAxis('h', dir * innerWidth) +
      Blockly.utils.svgPaths.curve('c', [
        Blockly.utils.svgPaths.point(dir * curveWidth / 2,
            0),
        Blockly.utils.svgPaths.point(dir * curveWidth * 3 / 4,
            -(quarterHeight / 2)),
        Blockly.utils.svgPaths.point(dir * curveWidth,
            -quarterHeight)
      ]) +
      Blockly.utils.svgPaths.line([
        Blockly.utils.svgPaths.point(dir * curveWidth,
            -halfHeight)
      ]) +
      Blockly.utils.svgPaths.curve('c', [
        Blockly.utils.svgPaths.point(dir * curveWidth / 4,
            -(quarterHeight / 2)),
        Blockly.utils.svgPaths.point(dir * curveWidth / 2,
            -quarterHeight),
        Blockly.utils.svgPaths.point(dir * curveWidth,
            -quarterHeight)
      ])
    );
  }

  // TODO: Find a relationship between width and path
  var pathLeft = makeMainPath(1);
  var pathRight = makeMainPath(-1);

  return {
    width: width,
    height: height,
    pathLeft: pathLeft,
    pathRight: pathRight
  };
};

/**
 * @return {!Object} An object containing sizing and path information about
 *     outside corners.
 * @package
 */
Blockly.zelos.ConstantProvider.prototype.makeOutsideCorners = function() {
  var radius = this.CORNER_RADIUS;
  /**
   * SVG path for drawing the rounded top-left corner.
   * @const
   */
  var topLeft =
      Blockly.utils.svgPaths.moveBy(0, radius) +
      Blockly.utils.svgPaths.arc('a', '0 0,1', radius,
          Blockly.utils.svgPaths.point(radius, -radius));

  /**
   * SVG path for drawing the rounded top-right corner.
   * @const
   */
  var topRight =
      Blockly.utils.svgPaths.arc('a', '0 0,1', radius,
          Blockly.utils.svgPaths.point(radius, radius));

  /**
   * SVG path for drawing the rounded bottom-left corner.
   * @const
   */
  var bottomLeft = Blockly.utils.svgPaths.arc('a', '0 0,1', radius,
      Blockly.utils.svgPaths.point(-radius, -radius));

  /**
   * SVG path for drawing the rounded bottom-right corner.
   * @const
   */
  var bottomRight = Blockly.utils.svgPaths.arc('a', '0 0,1', radius,
      Blockly.utils.svgPaths.point(-radius, radius));

  return {
    topLeft: topLeft,
    topRight: topRight,
    bottomRight: bottomRight,
    bottomLeft: bottomLeft
  };
};

/**
 * @override
 */
Blockly.zelos.ConstantProvider.prototype.makeInsideCorners = function() {
  var radius = this.CORNER_RADIUS;

  var innerTopLeftCorner = Blockly.utils.svgPaths.arc('a', '0 0,0', radius,
      Blockly.utils.svgPaths.point(-radius, radius));

  var innerTopRightCorner = Blockly.utils.svgPaths.arc('a', '0 0,1', radius,
      Blockly.utils.svgPaths.point(-radius, radius));

  var innerBottomLeftCorner = Blockly.utils.svgPaths.arc('a', '0 0,0', radius,
      Blockly.utils.svgPaths.point(radius, radius));

  var innerBottomRightCorner = Blockly.utils.svgPaths.arc('a', '0 0,1', radius,
      Blockly.utils.svgPaths.point(radius, radius));

  return {
    width: radius,
    height: radius,
    pathTop: innerTopLeftCorner,
    pathBottom: innerBottomLeftCorner,
    rightWidth: radius,
    rightHeight: radius,
    pathTopRight: innerTopRightCorner,
    pathBottomRight: innerBottomRightCorner
  };
};
