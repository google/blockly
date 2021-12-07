/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Methods for rendering debug graphics.
 */
'use strict';

/**
 * Methods for rendering debug graphics.
 * @class
 */
goog.module('Blockly.blockRendering.Debug');

const dom = goog.require('Blockly.utils.dom');
/* eslint-disable-next-line no-unused-vars */
const {BlockSvg} = goog.requireType('Blockly.BlockSvg');
const {ConnectionType} = goog.require('Blockly.ConnectionType');
/* eslint-disable-next-line no-unused-vars */
const {ConstantProvider} = goog.requireType('Blockly.blockRendering.ConstantProvider');
const {FieldLabel} = goog.require('Blockly.FieldLabel');
/* eslint-disable-next-line no-unused-vars */
const {InRowSpacer} = goog.requireType('Blockly.blockRendering.InRowSpacer');
/* eslint-disable-next-line no-unused-vars */
const {Measurable} = goog.requireType('Blockly.blockRendering.Measurable');
/* eslint-disable-next-line no-unused-vars */
const {RenderInfo} = goog.requireType('Blockly.blockRendering.RenderInfo');
/* eslint-disable-next-line no-unused-vars */
const {RenderedConnection} = goog.requireType('Blockly.RenderedConnection');
/* eslint-disable-next-line no-unused-vars */
const {Row} = goog.requireType('Blockly.blockRendering.Row');
const {Svg} = goog.require('Blockly.utils.Svg');
const {Types} = goog.require('Blockly.blockRendering.Types');


/**
 * An object that renders rectangles and dots for debugging rendering code.
 * @param {!ConstantProvider} constants The renderer's
 *     constants.
 * @package
 * @constructor
 * @alias Blockly.blockRendering.Debug
 */
const Debug = function(constants) {
  /**
   * An array of SVG elements that have been created by this object.
   * @type {Array<!SVGElement>}
   * @private
   */
  this.debugElements_ = [];

  /**
   * The SVG root of the block that is being rendered.  Debug elements will
   * be attached to this root.
   * @type {SVGElement}
   * @private
   */
  this.svgRoot_ = null;

  /**
   * The renderer's constant provider.
   * @type {!ConstantProvider}
   * @private
   */
  this.constants_ = constants;
};

/**
 * Configuration object containing booleans to enable and disable debug
 * rendering of specific rendering components.
 * @type {!Object<string, boolean>}
 */
Debug.config = {
  rowSpacers: true,
  elemSpacers: true,
  rows: true,
  elems: true,
  connections: true,
  blockBounds: true,
  connectedBlockBounds: true,
  render: true,
};

/**
 * Remove all elements the this object created on the last pass.
 * @package
 */
Debug.prototype.clearElems = function() {
  for (let i = 0; i < this.debugElements_.length; i++) {
    const elem = this.debugElements_[i];
    dom.removeNode(elem);
  }

  this.debugElements_ = [];
};

/**
 * Draw a debug rectangle for a spacer (empty) row.
 * @param {!Row} row The row to render.
 * @param {number} cursorY The y position of the top of the row.
 * @param {boolean} isRtl Whether the block is rendered RTL.
 * @package
 */
Debug.prototype.drawSpacerRow = function(row, cursorY, isRtl) {
  if (!Debug.config.rowSpacers) {
    return;
  }

  const height = Math.abs(row.height);
  const isNegativeSpacing = row.height < 0;
  if (isNegativeSpacing) {
    cursorY -= height;
  }

  this.debugElements_.push(dom.createSvgElement(
      Svg.RECT, {
        'class': 'rowSpacerRect blockRenderDebug',
        'x': isRtl ? -(row.xPos + row.width) : row.xPos,
        'y': cursorY,
        'width': row.width,
        'height': height,
        'stroke': isNegativeSpacing ? 'black' : 'blue',
        'fill': 'blue',
        'fill-opacity': '0.5',
        'stroke-width': '1px',
      },
      this.svgRoot_));
};

/**
 * Draw a debug rectangle for a horizontal spacer.
 * @param {!InRowSpacer} elem The spacer to render.
 * @param {number} rowHeight The height of the container row.
 * @param {boolean} isRtl Whether the block is rendered RTL.
 * @package
 */
Debug.prototype.drawSpacerElem = function(elem, rowHeight, isRtl) {
  if (!Debug.config.elemSpacers) {
    return;
  }

  const width = Math.abs(elem.width);
  const isNegativeSpacing = elem.width < 0;
  let xPos = isNegativeSpacing ? elem.xPos - width : elem.xPos;
  if (isRtl) {
    xPos = -(xPos + width);
  }
  const yPos = elem.centerline - elem.height / 2;
  this.debugElements_.push(dom.createSvgElement(
      Svg.RECT, {
        'class': 'elemSpacerRect blockRenderDebug',
        'x': xPos,
        'y': yPos,
        'width': width,
        'height': elem.height,
        'stroke': 'pink',
        'fill': isNegativeSpacing ? 'black' : 'pink',
        'fill-opacity': '0.5',
        'stroke-width': '1px',
      },
      this.svgRoot_));
};

/**
 * Draw a debug rectangle for an in-row element.
 * @param {!Measurable} elem The element to render.
 * @param {boolean} isRtl Whether the block is rendered RTL.
 * @package
 */
Debug.prototype.drawRenderedElem = function(elem, isRtl) {
  if (Debug.config.elems) {
    let xPos = elem.xPos;
    if (isRtl) {
      xPos = -(xPos + elem.width);
    }
    const yPos = elem.centerline - elem.height / 2;
    this.debugElements_.push(dom.createSvgElement(
        Svg.RECT, {
          'class': 'rowRenderingRect blockRenderDebug',
          'x': xPos,
          'y': yPos,
          'width': elem.width,
          'height': elem.height,
          'stroke': 'black',
          'fill': 'none',
          'stroke-width': '1px',
        },
        this.svgRoot_));

    if (Types.isField(elem) && elem.field instanceof FieldLabel) {
      const baseline = this.constants_.FIELD_TEXT_BASELINE;
      this.debugElements_.push(dom.createSvgElement(
          Svg.RECT, {
            'class': 'rowRenderingRect blockRenderDebug',
            'x': xPos,
            'y': yPos + baseline,
            'width': elem.width,
            'height': '0.1px',
            'stroke': 'red',
            'fill': 'none',
            'stroke-width': '0.5px',
          },
          this.svgRoot_));
    }
  }


  if (Types.isInput(elem) && Debug.config.connections) {
    this.drawConnection(elem.connectionModel);
  }
};

/**
 * Draw a circle at the location of the given connection.  Inputs and outputs
 * share the same colours, as do previous and next.  When positioned correctly
 * a connected pair will look like a bullseye.
 * @param {RenderedConnection} conn The connection to circle.
 * @suppress {visibility} Suppress visibility of conn.offsetInBlock_ since this
 *     is a debug module.
 * @package
 */
Debug.prototype.drawConnection = function(conn) {
  if (!Debug.config.connections) {
    return;
  }

  let colour;
  let size;
  let fill;
  if (conn.type === ConnectionType.INPUT_VALUE) {
    size = 4;
    colour = 'magenta';
    fill = 'none';
  } else if (conn.type === ConnectionType.OUTPUT_VALUE) {
    size = 2;
    colour = 'magenta';
    fill = colour;
  } else if (conn.type === ConnectionType.NEXT_STATEMENT) {
    size = 4;
    colour = 'goldenrod';
    fill = 'none';
  } else if (conn.type === ConnectionType.PREVIOUS_STATEMENT) {
    size = 2;
    colour = 'goldenrod';
    fill = colour;
  }
  this.debugElements_.push(dom.createSvgElement(
      Svg.CIRCLE, {
        'class': 'blockRenderDebug',
        'cx': conn.offsetInBlock_.x,
        'cy': conn.offsetInBlock_.y,
        'r': size,
        'fill': fill,
        'stroke': colour,
      },
      this.svgRoot_));
};

/**
 * Draw a debug rectangle for a non-empty row.
 * @param {!Row} row The non-empty row to render.
 * @param {number} cursorY The y position of the top of the row.
 * @param {boolean} isRtl Whether the block is rendered RTL.
 * @package
 */
Debug.prototype.drawRenderedRow = function(row, cursorY, isRtl) {
  if (!Debug.config.rows) {
    return;
  }
  this.debugElements_.push(dom.createSvgElement(
      Svg.RECT, {
        'class': 'elemRenderingRect blockRenderDebug',
        'x': isRtl ? -(row.xPos + row.width) : row.xPos,
        'y': row.yPos,
        'width': row.width,
        'height': row.height,
        'stroke': 'red',
        'fill': 'none',
        'stroke-width': '1px',
      },
      this.svgRoot_));

  if (Types.isTopOrBottomRow(row)) {
    return;
  }

  if (Debug.config.connectedBlockBounds) {
    this.debugElements_.push(dom.createSvgElement(
        Svg.RECT, {
          'class': 'connectedBlockWidth blockRenderDebug',
          'x': isRtl ? -(row.xPos + row.widthWithConnectedBlocks) : row.xPos,
          'y': row.yPos,
          'width': row.widthWithConnectedBlocks,
          'height': row.height,
          'stroke': this.randomColour_,
          'fill': 'none',
          'stroke-width': '1px',
          'stroke-dasharray': '3,3',
        },
        this.svgRoot_));
  }
};

/**
 * Draw debug rectangles for a non-empty row and all of its subcomponents.
 * @param {!Row} row The non-empty row to render.
 * @param {number} cursorY The y position of the top of the row.
 * @param {boolean} isRtl Whether the block is rendered RTL.
 * @package
 */
Debug.prototype.drawRowWithElements = function(row, cursorY, isRtl) {
  for (let i = 0; i < row.elements.length; i++) {
    const elem = row.elements[i];
    if (!elem) {
      console.warn('A row has an undefined or null element.', row, elem);
      continue;
    }
    if (Types.isSpacer(elem)) {
      this.drawSpacerElem(
          /** @type {!InRowSpacer} */ (elem), row.height, isRtl);
    } else {
      this.drawRenderedElem(elem, isRtl);
    }
  }
  this.drawRenderedRow(row, cursorY, isRtl);
};

/**
 * Draw a debug rectangle around the entire block.
 * @param {!RenderInfo} info Rendering information about
 *     the block to debug.
 * @package
 */
Debug.prototype.drawBoundingBox = function(info) {
  if (!Debug.config.blockBounds) {
    return;
  }
  // Bounding box without children.
  let xPos = info.RTL ? -info.width : 0;
  const yPos = 0;
  this.debugElements_.push(dom.createSvgElement(
      Svg.RECT, {
        'class': 'blockBoundingBox blockRenderDebug',
        'x': xPos,
        'y': yPos,
        'width': info.width,
        'height': info.height,
        'stroke': 'black',
        'fill': 'none',
        'stroke-width': '1px',
        'stroke-dasharray': '5,5',
      },
      this.svgRoot_));

  if (Debug.config.connectedBlockBounds) {
    // Bounding box with children.
    xPos = info.RTL ? -info.widthWithChildren : 0;
    this.debugElements_.push(dom.createSvgElement(
        Svg.RECT, {
          'class': 'blockRenderDebug',
          'x': xPos,
          'y': yPos,
          'width': info.widthWithChildren,
          'height': info.height,
          'stroke': '#DF57BC',
          'fill': 'none',
          'stroke-width': '1px',
          'stroke-dasharray': '3,3',
        },
        this.svgRoot_));
  }
};

/**
 * Do all of the work to draw debug information for the whole block.
 * @param {!BlockSvg} block The block to draw debug information for.
 * @param {!RenderInfo} info Rendering information about
 *     the block to debug.
 * @package
 */
Debug.prototype.drawDebug = function(block, info) {
  this.clearElems();
  this.svgRoot_ = block.getSvgRoot();

  this.randomColour_ = '#' + Math.floor(Math.random() * 16777215).toString(16);

  let cursorY = 0;
  for (let i = 0; i < info.rows.length; i++) {
    const row = info.rows[i];
    if (Types.isBetweenRowSpacer(row)) {
      this.drawSpacerRow(row, cursorY, info.RTL);
    } else {
      this.drawRowWithElements(row, cursorY, info.RTL);
    }
    cursorY += row.height;
  }

  if (block.previousConnection) {
    this.drawConnection(block.previousConnection);
  }
  if (block.nextConnection) {
    this.drawConnection(block.nextConnection);
  }
  if (block.outputConnection) {
    this.drawConnection(block.outputConnection);
  }
  if (info.rightSide) {
    this.drawRenderedElem(info.rightSide, info.RTL);
  }

  this.drawBoundingBox(info);

  this.drawRender(block.pathObject.svgPath);
};


/**
 * Show a debug filter to highlight that a block has been rendered.
 * @param {!SVGElement} svgPath The block's SVG path.
 * @package
 */
Debug.prototype.drawRender = function(svgPath) {
  if (!Debug.config.render) {
    return;
  }
  svgPath.setAttribute('filter', 'url(#' + this.constants_.debugFilterId + ')');
  setTimeout(function() {
    svgPath.setAttribute('filter', '');
  }, 100);
};

exports.Debug = Debug;
