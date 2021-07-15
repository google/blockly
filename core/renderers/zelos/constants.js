/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview An object that provides constants for rendering blocks in Zelos
 * mode.
 * @author fenichel@google.com (Rachel Fenichel)
 */
'use strict';

goog.provide('Blockly.zelos.ConstantProvider');

goog.require('Blockly.blockRendering.ConstantProvider');
goog.require('Blockly.connectionTypes');
/** @suppress {extraRequire} */
goog.require('Blockly.constants');
goog.require('Blockly.utils.colour');
goog.require('Blockly.utils.dom');
goog.require('Blockly.utils.object');
goog.require('Blockly.utils.Svg');
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
  this.SMALL_PADDING = this.GRID_UNIT;

  /**
   * @override
   */
  this.MEDIUM_PADDING = 2 * this.GRID_UNIT;

  /**
   * @override
   */
  this.MEDIUM_LARGE_PADDING = 3 * this.GRID_UNIT;

  /**
   * @override
   */
  this.LARGE_PADDING = 4 * this.GRID_UNIT;

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
  this.STATEMENT_INPUT_NOTCH_OFFSET = this.NOTCH_OFFSET_LEFT;

  /**
   * @override
   */
  this.MIN_BLOCK_WIDTH = 2 * this.GRID_UNIT;

  /**
   * @override
   */
  this.MIN_BLOCK_HEIGHT = 12 * this.GRID_UNIT;

  /**
   * @override
   */
  this.EMPTY_STATEMENT_INPUT_HEIGHT = 6 * this.GRID_UNIT;

  /**
   * @override
   */
  this.TAB_OFFSET_FROM_TOP = 0;

  /**
   * @override
   */
  this.TOP_ROW_MIN_HEIGHT = this.CORNER_RADIUS;

  /**
   * @override
   */
  this.TOP_ROW_PRECEDES_STATEMENT_MIN_HEIGHT = this.LARGE_PADDING;

  /**
   * @override
   */
  this.BOTTOM_ROW_MIN_HEIGHT = this.CORNER_RADIUS;

  /**
   * @override
   */
  this.BOTTOM_ROW_AFTER_STATEMENT_MIN_HEIGHT = 6 * this.GRID_UNIT;

  /**
   * @override
   */
  this.STATEMENT_BOTTOM_SPACER = -this.NOTCH_HEIGHT;

  /**
   * Minimum statement input spacer width.
   * @type {number}
   */
  this.STATEMENT_INPUT_SPACER_MIN_WIDTH = 40 * this.GRID_UNIT;

  /**
   * @override
   */
  this.STATEMENT_INPUT_PADDING_LEFT = 4 * this.GRID_UNIT;

  /**
   * @override
   */
  this.EMPTY_INLINE_INPUT_PADDING = 4 * this.GRID_UNIT;

  /**
   * @override
   */
  this.EMPTY_INLINE_INPUT_HEIGHT = 8 * this.GRID_UNIT;

  /**
   * @override
   */
  this.DUMMY_INPUT_MIN_HEIGHT = 8 * this.GRID_UNIT;

  /**
   * @override
   */
  this.DUMMY_INPUT_SHADOW_MIN_HEIGHT = 6 * this.GRID_UNIT;

  /**
   * @override
   */
  this.CURSOR_WS_WIDTH = 20 * this.GRID_UNIT;

  /**
   * @override
   */
  this.CURSOR_COLOUR = '#ffa200';

  /**
   * Radius of the cursor for input and output connections.
   * @type {number}
   * @package
   */
  this.CURSOR_RADIUS = 5;

  /**
   * @override
   */
  this.JAGGED_TEETH_HEIGHT = 0;

  /**
   * @override
   */
  this.JAGGED_TEETH_WIDTH = 0;

  /**
   * @override
   */
  this.START_HAT_HEIGHT = 22;

  /**
   * @override
   */
  this.START_HAT_WIDTH = 96;

  /**
   * @enum {number}
   * @override
   */
  this.SHAPES = {
    HEXAGONAL: 1,
    ROUND: 2,
    SQUARE: 3,
    PUZZLE: 4,
    NOTCH: 5
  };

  /**
   * Map of output/input shapes and the amount they should cause a block to be
   * padded. Outer key is the outer shape, inner key is the inner shape.
   * When a block with the outer shape contains an input block with the inner
   * shape on its left or right edge, the block elements are aligned such that
   * the padding specified is reached.
   * @package
   */
  this.SHAPE_IN_SHAPE_PADDING = {
    1: {  // Outer shape: hexagon.
      0: 5 * this.GRID_UNIT,  // Field in hexagon.
      1: 2 * this.GRID_UNIT,  // Hexagon in hexagon.
      2: 5 * this.GRID_UNIT,  // Round in hexagon.
      3: 5 * this.GRID_UNIT   // Square in hexagon.
    },
    2: {  // Outer shape: round.
      0: 3 * this.GRID_UNIT,  // Field in round.
      1: 3 * this.GRID_UNIT,  // Hexagon in round.
      2: 1 * this.GRID_UNIT,  // Round in round.
      3: 2 * this.GRID_UNIT   // Square in round.
    },
    3: {  // Outer shape: square.
      0: 2 * this.GRID_UNIT,  // Field in square.
      1: 2 * this.GRID_UNIT,  // Hexagon in square.
      2: 2 * this.GRID_UNIT,  // Round in square.
      3: 2 * this.GRID_UNIT   // Square in square.
    }
  };

  /**
   * @override
   */
  this.FULL_BLOCK_FIELDS = true;

  /**
   * @override
   */
  this.FIELD_TEXT_FONTSIZE = 3 * this.GRID_UNIT;

  /**
   * @override
   */
  this.FIELD_TEXT_FONTWEIGHT = 'bold';

  /**
   * @override
   */
  this.FIELD_TEXT_FONTFAMILY =
    '"Helvetica Neue", "Segoe UI", Helvetica, sans-serif';

  /**
   * @override
   */
  this.FIELD_BORDER_RECT_RADIUS = this.CORNER_RADIUS;

  /**
   * @override
   */
  this.FIELD_BORDER_RECT_X_PADDING = 2 * this.GRID_UNIT;

  /**
   * @override
   */
  this.FIELD_BORDER_RECT_Y_PADDING = 1.625 * this.GRID_UNIT;

  /**
   * @override
   */
  this.FIELD_BORDER_RECT_HEIGHT = 8 * this.GRID_UNIT;

  /**
   * @override
   */
  this.FIELD_DROPDOWN_BORDER_RECT_HEIGHT = 8 * this.GRID_UNIT;

  /**
   * @override
   */
  this.FIELD_DROPDOWN_NO_BORDER_RECT_SHADOW = true;

  /**
   * @override
   */
  this.FIELD_DROPDOWN_COLOURED_DIV = true;

  /**
   * @override
   */
  this.FIELD_DROPDOWN_SVG_ARROW = true;

  /**
   * @override
   */
  this.FIELD_DROPDOWN_SVG_ARROW_PADDING = this.FIELD_BORDER_RECT_X_PADDING;

  /**
   * @override
   */
  this.FIELD_TEXTINPUT_BOX_SHADOW = true;

  /**
   * @override
   */
  this.FIELD_COLOUR_FULL_BLOCK = true;

  /**
   * @override
   */
  this.FIELD_COLOUR_DEFAULT_WIDTH = 2 * this.GRID_UNIT;

  /**
   * @override
   */
  this.FIELD_COLOUR_DEFAULT_HEIGHT = 4 * this.GRID_UNIT;

  /**
   * @override
   */
  this.FIELD_CHECKBOX_X_OFFSET = 1 * this.GRID_UNIT;

  /**
   * The maximum width of a dynamic connection shape.
   * @type {number}
   */
  this.MAX_DYNAMIC_CONNECTION_SHAPE_WIDTH = 12 * this.GRID_UNIT;

  /**
   * The selected glow colour.
   * @type {string}
   */
  this.SELECTED_GLOW_COLOUR = '#fff200';

  /**
   * The size of the selected glow.
   * @type {number}
   */
  this.SELECTED_GLOW_SIZE = 0.5;

  /**
   * The replacement glow colour.
   * @type {string}
   */
  this.REPLACEMENT_GLOW_COLOUR = '#fff200';

  /**
   * The size of the selected glow.
   * @type {number}
   */
  this.REPLACEMENT_GLOW_SIZE = 2;

  /**
   * The ID of the selected glow filter, or the empty string if no filter is
   * set.
   * @type {string}
   * @package
   */
  this.selectedGlowFilterId = '';

  /**
   * The <filter> element to use for a selected glow, or null if not set.
   * @type {SVGElement}
   * @private
   */
  this.selectedGlowFilter_ = null;

  /**
   * The ID of the replacement glow filter, or the empty string if no filter is
   * set.
   * @type {string}
   * @package
   */
  this.replacementGlowFilterId = '';

  /**
   * The <filter> element to use for a replacement glow, or null if not set.
   * @type {SVGElement}
   * @private
   */
  this.replacementGlowFilter_ = null;
};
Blockly.utils.object.inherits(Blockly.zelos.ConstantProvider,
    Blockly.blockRendering.ConstantProvider);

/**
 * @override
 */
Blockly.zelos.ConstantProvider.prototype.setFontConstants_ = function(theme) {
  Blockly.zelos.ConstantProvider.superClass_.setFontConstants_.call(this,
      theme);

  this.FIELD_BORDER_RECT_HEIGHT = this.FIELD_TEXT_HEIGHT +
      this.FIELD_BORDER_RECT_Y_PADDING * 2;
  this.FIELD_DROPDOWN_BORDER_RECT_HEIGHT = this.FIELD_BORDER_RECT_HEIGHT;
};

/**
 * @override
 */
Blockly.zelos.ConstantProvider.prototype.init = function() {
  Blockly.zelos.ConstantProvider.superClass_.init.call(this);
  this.HEXAGONAL = this.makeHexagonal();
  this.ROUNDED = this.makeRounded();
  this.SQUARED = this.makeSquared();

  this.STATEMENT_INPUT_NOTCH_OFFSET = this.NOTCH_OFFSET_LEFT +
      this.INSIDE_CORNERS.rightWidth;
};

/**
 * @override
 */
Blockly.zelos.ConstantProvider.prototype.setDynamicProperties_ = function(
    theme) {
  Blockly.zelos.ConstantProvider.superClass_.setDynamicProperties_.call(this,
      theme);

  this.SELECTED_GLOW_COLOUR =
      theme.getComponentStyle('selectedGlowColour') ||
      this.SELECTED_GLOW_COLOUR;
  var selectedGlowSize =
      Number(theme.getComponentStyle('selectedGlowSize'));
  this.SELECTED_GLOW_SIZE =
      selectedGlowSize && !isNaN(selectedGlowSize) ?
      selectedGlowSize : this.SELECTED_GLOW_SIZE;
  this.REPLACEMENT_GLOW_COLOUR =
      theme.getComponentStyle('replacementGlowColour') ||
      this.REPLACEMENT_GLOW_COLOUR;
  var replacementGlowSize =
      Number(theme.getComponentStyle('replacementGlowSize'));
  this.REPLACEMENT_GLOW_SIZE =
      replacementGlowSize && !isNaN(replacementGlowSize) ?
      replacementGlowSize : this.REPLACEMENT_GLOW_SIZE;
};

/**
 * @override
 */
Blockly.zelos.ConstantProvider.prototype.dispose = function() {
  Blockly.zelos.ConstantProvider.superClass_.dispose.call(this);
  if (this.selectedGlowFilter_) {
    Blockly.utils.dom.removeNode(this.selectedGlowFilter_);
  }
  if (this.replacementGlowFilter_) {
    Blockly.utils.dom.removeNode(this.replacementGlowFilter_);
  }
};

/**
 * @override
 */
Blockly.zelos.ConstantProvider.prototype.makeStartHat = function() {
  var height = this.START_HAT_HEIGHT;
  var width = this.START_HAT_WIDTH;

  var mainPath =
      Blockly.utils.svgPaths.curve('c',
          [
            Blockly.utils.svgPaths.point(25, -height),
            Blockly.utils.svgPaths.point(71, -height),
            Blockly.utils.svgPaths.point(width, 0)
          ]);
  return {
    height: height,
    width: width,
    path: mainPath
  };
};

/**
 * Create sizing and path information about a hexagonal shape.
 * @return {!Object} An object containing sizing and path information about
 *     a hexagonal shape for connections.
 * @package
 */
Blockly.zelos.ConstantProvider.prototype.makeHexagonal = function() {
  var maxWidth = this.MAX_DYNAMIC_CONNECTION_SHAPE_WIDTH;

  // The main path for the hexagonal connection shape is made out of two lines.
  // The lines are defined with relative positions and require the block height.
  // The 'up' and 'down' versions of the paths are the same, but the Y sign
  // flips.  The 'left' and 'right' versions of the path are also the same, but
  // the X sign flips.
  function makeMainPath(height, up, right) {
    var halfHeight = height / 2;
    var width = halfHeight > maxWidth ? maxWidth : halfHeight;
    var forward = up ? -1 : 1;
    var direction = right ? -1 : 1;
    var dy = forward * height / 2;
    return Blockly.utils.svgPaths.lineTo(-direction * width, dy) +
        Blockly.utils.svgPaths.lineTo(direction * width, dy);
  }

  return {
    type: this.SHAPES.HEXAGONAL,
    isDynamic: true,
    width: function(height) {
      var halfHeight = height / 2;
      return halfHeight > maxWidth ? maxWidth : halfHeight;
    },
    height: function(height) {
      return height;
    },
    connectionOffsetY: function(connectionHeight) {
      return connectionHeight / 2;
    },
    connectionOffsetX: function(connectionWidth) {
      return - connectionWidth;
    },
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
 * Create sizing and path information about a rounded shape.
 * @return {!Object} An object containing sizing and path information about
 *     a rounded shape for connections.
 * @package
 */
Blockly.zelos.ConstantProvider.prototype.makeRounded = function() {
  var maxWidth = this.MAX_DYNAMIC_CONNECTION_SHAPE_WIDTH;
  var maxHeight = maxWidth * 2;

  // The main path for the rounded connection shape is made out of two arcs and
  // a line that joins them.  The arcs are defined with relative positions.
  // Usually, the height of the block is split between the two arcs. In the case
  // where the height of the block exceeds the maximum height, a line is drawn
  // in between the two arcs.
  // The 'up' and 'down' versions of the paths are the same, but the Y sign
  // flips.  The 'up' and 'right' versions of the path flip the sweep-flag
  // which moves the arc at negative angles.
  function makeMainPath(blockHeight, up, right) {
    var remainingHeight = blockHeight > maxHeight ? blockHeight - maxHeight : 0;
    var height = blockHeight > maxHeight ? maxHeight : blockHeight;
    var radius = height / 2;
    return Blockly.utils.svgPaths.arc('a', '0 0,1', radius,
        Blockly.utils.svgPaths.point((up ? -1 : 1) * radius, (up ? -1 : 1) * radius)) +
      Blockly.utils.svgPaths.lineOnAxis('v', (right ? 1 : -1) * remainingHeight) +
      Blockly.utils.svgPaths.arc('a', '0 0,1', radius,
          Blockly.utils.svgPaths.point((up ? 1 : -1) * radius, (up ? -1 : 1) * radius));
  }

  return {
    type: this.SHAPES.ROUND,
    isDynamic: true,
    width: function(height) {
      var halfHeight = height / 2;
      return halfHeight > maxWidth ? maxWidth : halfHeight;
    },
    height: function(height) {
      return height;
    },
    connectionOffsetY: function(connectionHeight) {
      return connectionHeight / 2;
    },
    connectionOffsetX: function(connectionWidth) {
      return - connectionWidth;
    },
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
 * Create sizing and path information about a squared shape.
 * @return {!Object} An object containing sizing and path information about
 *     a squared shape for connections.
 * @package
 */
Blockly.zelos.ConstantProvider.prototype.makeSquared = function() {
  var radius = this.CORNER_RADIUS;

  // The main path for the squared connection shape is made out of two corners
  // and a single line in-between (a and v). These are defined in relative
  // positions and require the height of the block.
  // The 'left' and 'right' versions of the paths are the same, but the Y sign
  // flips.  The 'up' and 'down' versions of the path determine where the corner
  // point is placed and in-turn the direction of the corners.
  function makeMainPath(height, up, right) {
    var innerHeight = height - radius * 2;
    return Blockly.utils.svgPaths.arc('a', '0 0,1', radius,
        Blockly.utils.svgPaths.point((up ? -1 : 1) * radius, (up ? -1 : 1) * radius)) +
      Blockly.utils.svgPaths.lineOnAxis('v', (right ? 1 : -1) * innerHeight) +
      Blockly.utils.svgPaths.arc('a', '0 0,1', radius,
          Blockly.utils.svgPaths.point((up ? 1 : -1) * radius, (up ? -1 : 1) * radius));
  }

  return {
    type: this.SHAPES.SQUARE,
    isDynamic: true,
    width: function(_height) {
      return radius;
    },
    height: function(height) {
      return height;
    },
    connectionOffsetY: function(connectionHeight) {
      return connectionHeight / 2;
    },
    connectionOffsetX: function(connectionWidth) {
      return - connectionWidth;
    },
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
  if (!checks && connection.targetConnection) {
    checks = connection.targetConnection.getCheck();
  }
  switch (connection.type) {
    case Blockly.connectionTypes.INPUT_VALUE:
    case Blockly.connectionTypes.OUTPUT_VALUE:
      var outputShape = connection.getSourceBlock().getOutputShape();
      // If the block has an output shape set, use that instead.
      if (outputShape != null) {
        switch (outputShape) {
          case this.SHAPES.HEXAGONAL: return this.HEXAGONAL;
          case this.SHAPES.ROUND: return this.ROUNDED;
          case this.SHAPES.SQUARE: return this.SQUARED;
        }
      }
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
      return this.ROUNDED;
    case Blockly.connectionTypes.PREVIOUS_STATEMENT:
    case Blockly.connectionTypes.NEXT_STATEMENT:
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

  var pathLeft = makeMainPath(1);
  var pathRight = makeMainPath(-1);

  return {
    type: this.SHAPES.NOTCH,
    width: width,
    height: height,
    pathLeft: pathLeft,
    pathRight: pathRight
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

/**
 * @override
 */
Blockly.zelos.ConstantProvider.prototype.generateSecondaryColour_ = function(
    colour) {
  return Blockly.utils.colour.blend('#000', colour, 0.15) || colour;
};

/**
 * @override
 */
Blockly.zelos.ConstantProvider.prototype.generateTertiaryColour_ = function(
    colour) {
  return Blockly.utils.colour.blend('#000', colour, 0.25) || colour;
};

/**
 * @override
 */
Blockly.zelos.ConstantProvider.prototype.createDom = function(svg,
    tagName, selector) {
  Blockly.zelos.ConstantProvider.superClass_.createDom.call(this, svg,
      tagName, selector);
  /*
  <defs>
    ... filters go here ...
  </defs>
  */
  var defs = Blockly.utils.dom.createSvgElement(
      Blockly.utils.Svg.DEFS, {}, svg);
  // Using a dilate distorts the block shape.
  // Instead use a gaussian blur, and then set all alpha to 1 with a transfer.
  var selectedGlowFilter = Blockly.utils.dom.createSvgElement(
      Blockly.utils.Svg.FILTER,
      {
        'id': 'blocklySelectedGlowFilter' + this.randomIdentifier,
        'height': '160%',
        'width': '180%',
        y: '-30%',
        x: '-40%'
      },
      defs);
  Blockly.utils.dom.createSvgElement(
      Blockly.utils.Svg.FEGAUSSIANBLUR,
      {
        'in': 'SourceGraphic',
        'stdDeviation': this.SELECTED_GLOW_SIZE
      },
      selectedGlowFilter);
  // Set all gaussian blur pixels to 1 opacity before applying flood
  var selectedComponentTransfer = Blockly.utils.dom.createSvgElement(
      Blockly.utils.Svg.FECOMPONENTTRANSFER, {
        'result': 'outBlur'
      }, selectedGlowFilter);
  Blockly.utils.dom.createSvgElement(
      Blockly.utils.Svg.FEFUNCA,
      {
        'type': 'table', 'tableValues': '0 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1'
      },
      selectedComponentTransfer);
  // Color the highlight
  Blockly.utils.dom.createSvgElement(
      Blockly.utils.Svg.FEFLOOD,
      {
        'flood-color': this.SELECTED_GLOW_COLOUR,
        'flood-opacity': 1,
        'result': 'outColor'
      },
      selectedGlowFilter);
  Blockly.utils.dom.createSvgElement(
      Blockly.utils.Svg.FECOMPOSITE,
      {
        'in': 'outColor', 'in2': 'outBlur',
        'operator': 'in', 'result': 'outGlow'
      },
      selectedGlowFilter);
  this.selectedGlowFilterId = selectedGlowFilter.id;
  this.selectedGlowFilter_ = selectedGlowFilter;

  // Using a dilate distorts the block shape.
  // Instead use a gaussian blur, and then set all alpha to 1 with a transfer.
  var replacementGlowFilter = Blockly.utils.dom.createSvgElement(
      Blockly.utils.Svg.FILTER,
      {
        'id': 'blocklyReplacementGlowFilter' + this.randomIdentifier,
        'height': '160%',
        'width': '180%',
        y: '-30%',
        x: '-40%'
      },
      defs);
  Blockly.utils.dom.createSvgElement(
      Blockly.utils.Svg.FEGAUSSIANBLUR,
      {
        'in': 'SourceGraphic',
        'stdDeviation': this.REPLACEMENT_GLOW_SIZE
      },
      replacementGlowFilter);
  // Set all gaussian blur pixels to 1 opacity before applying flood
  var replacementComponentTransfer = Blockly.utils.dom.createSvgElement(
      Blockly.utils.Svg.FECOMPONENTTRANSFER, {
        'result': 'outBlur'
      }, replacementGlowFilter);
  Blockly.utils.dom.createSvgElement(
      Blockly.utils.Svg.FEFUNCA,
      {
        'type': 'table', 'tableValues': '0 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1'
      },
      replacementComponentTransfer);
  // Color the highlight
  Blockly.utils.dom.createSvgElement(
      Blockly.utils.Svg.FEFLOOD,
      {
        'flood-color': this.REPLACEMENT_GLOW_COLOUR,
        'flood-opacity': 1,
        'result': 'outColor'
      },
      replacementGlowFilter);
  Blockly.utils.dom.createSvgElement(
      Blockly.utils.Svg.FECOMPOSITE,
      {
        'in': 'outColor', 'in2': 'outBlur',
        'operator': 'in', 'result': 'outGlow'
      },
      replacementGlowFilter);
  Blockly.utils.dom.createSvgElement(
      Blockly.utils.Svg.FECOMPOSITE,
      {
        'in': 'SourceGraphic', 'in2': 'outGlow',
        'operator': 'over',
      },
      replacementGlowFilter);
  this.replacementGlowFilterId = replacementGlowFilter.id;
  this.replacementGlowFilter_ = replacementGlowFilter;
};

/**
 * @override
 */
Blockly.zelos.ConstantProvider.prototype.getCSS_ = function(selector) {
  return [
    /* eslint-disable indent */
    // Text.
    selector + ' .blocklyText,',
    selector + ' .blocklyFlyoutLabelText {',
      'font: ' + this.FIELD_TEXT_FONTWEIGHT + ' ' +
          this.FIELD_TEXT_FONTSIZE + 'pt ' + this.FIELD_TEXT_FONTFAMILY + ';',
    '}',

    // Fields.
    selector + ' .blocklyText {',
      'fill: #fff;',
    '}',
    selector + ' .blocklyNonEditableText>rect:not(.blocklyDropdownRect),',
    selector + ' .blocklyEditableText>rect:not(.blocklyDropdownRect) {',
      'fill: ' + this.FIELD_BORDER_RECT_COLOUR + ';',
    '}',
    selector + ' .blocklyNonEditableText>text,',
    selector + ' .blocklyEditableText>text,',
    selector + ' .blocklyNonEditableText>g>text,',
    selector + ' .blocklyEditableText>g>text {',
      'fill: #575E75;',
    '}',

    // Flyout labels.
    selector + ' .blocklyFlyoutLabelText {',
      'fill: #575E75;',
    '}',

    // Bubbles.
    selector + ' .blocklyText.blocklyBubbleText {',
      'fill: #575E75;',
    '}',

    // Editable field hover.
    selector + ' .blocklyDraggable:not(.blocklyDisabled)',
    ' .blocklyEditableText:not(.editing):hover>rect,',
    selector + ' .blocklyDraggable:not(.blocklyDisabled)',
    ' .blocklyEditableText:not(.editing):hover>.blocklyPath {',
      'stroke: #fff;',
      'stroke-width: 2;',
    '}',

    // Text field input.
    selector + ' .blocklyHtmlInput {',
      'font-family: ' + this.FIELD_TEXT_FONTFAMILY + ';',
      'font-weight: ' + this.FIELD_TEXT_FONTWEIGHT + ';',
      'color: #575E75;',
    '}',

    // Dropdown field.
    selector + ' .blocklyDropdownText {',
      'fill: #fff !important;',
    '}',
    // Widget and Dropdown Div
    selector + '.blocklyWidgetDiv .goog-menuitem,',
    selector + '.blocklyDropDownDiv .goog-menuitem {',
      'font-family: ' + this.FIELD_TEXT_FONTFAMILY + ';',
    '}',
    selector + '.blocklyDropDownDiv .goog-menuitem-content {',
      'color: #fff;',
    '}',

    // Connection highlight.
    selector + ' .blocklyHighlightedConnectionPath {',
      'stroke: ' + this.SELECTED_GLOW_COLOUR + ';',
    '}',

    // Disabled outline paths.
    selector + ' .blocklyDisabled > .blocklyOutlinePath {',
      'fill: url(#blocklyDisabledPattern' + this.randomIdentifier + ')',
    '}',

    // Insertion marker.
    selector + ' .blocklyInsertionMarker>.blocklyPath {',
      'fill-opacity: ' + this.INSERTION_MARKER_OPACITY + ';',
      'stroke: none;',
    '}',
    /* eslint-enable indent */
  ];
};
