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
 * @fileoverview Methods for graphically rendering a block as SVG.
 * @author fenichel@google.com (Rachel Fenichel)
 */

//'use strict';
goog.provide('Blockly.BlockRendering.Debug');
goog.require('Blockly.BlockRendering.RenderInfo');
goog.require('Blockly.BlockRendering.Highlighter');
goog.require('BRC');
goog.require('Blockly.BlockRendering.Measurable');

/**
 * An object that renders rectangles and dots for debugging rendering code.
 * @package
 */
Blockly.BlockRendering.Debug = function() {
  /**
   * An array of SVG elements that have been created by this object.
   * @type {Array.<!SVGElement>}
   */
  this.debugElements_ = [];

  /**
   * The SVG root of the block that is being rendered.  Debug elements will
   * be attached to this root.
   * @type {!SVGElement}
   */
  this.svgRoot_ = null;
};

/**
 * Remove all elements the this object created on the last pass.
 * @package
 */
Blockly.BlockRendering.Debug.prototype.clearElems = function() {
  for (var i = 0, elem; elem = this.debugElements_[i]; i++) {
    Blockly.utils.dom.removeNode(elem);
  }

  this.debugElements_ = [];
};

/**
 * Draw a debug rectangle for a spacer (empty) row.
 * @param {!Blockly.BlockRendering.Row} row The row to render
 * @param {number} cursorY The y position of the top of the row.
 * @package
 */
Blockly.BlockRendering.Debug.prototype.drawSpacerRow = function(row, cursorY) {
  this.debugElements_.push(Blockly.utils.dom.createSvgElement('rect',
      {
        'class': 'rowSpacerRect blockRenderDebug',
        'x': 0,
        'y': cursorY,
        'width': row.width,
        'height': row.height,
      },
      this.svgRoot_));
};

/**
 * Draw a debug rectangle for a horizontal spacer.
 * @param {!Blockly.BlockSvg.InRowSpacer} elem The spacer to render
 * @param {number} cursorX The x position of the left of the row.
 * @param {number} centerY The y position of the center of the row, vertically.
 * @package
 */
Blockly.BlockRendering.Debug.prototype.drawSpacerElem = function(elem, cursorX, centerY) {
  var yPos = centerY - elem.height / 2;
  this.debugElements_.push(Blockly.utils.dom.createSvgElement('rect',
      {
        'class': 'elemSpacerRect blockRenderDebug',
        'x': cursorX,
        'y': yPos,
        'width': elem.width,
        'height': 15,
      },
      this.svgRoot_));
};

/**
 * Draw a debug rectangle for an in-row element.
 * @param {!Blockly.BlockSvg.Measurable} elem The element to render
 * @param {number} cursorX The x position of the left of the row.
 * @param {number} centerY The y position of the center of the row, vertically.
 * @package
 */
Blockly.BlockRendering.Debug.prototype.drawRenderedElem = function(elem, cursorX, centerY) {
  var yPos = centerY - elem.height / 2;
  this.debugElements_.push(Blockly.utils.dom.createSvgElement('rect',
      {
        'class': 'rowRenderingRect blockRenderDebug',
        'x': cursorX,
        'y': yPos,
        'width': elem.width,
        'height': elem.height ,
      },
      this.svgRoot_));

  if (elem.isInput) {
    this.drawConnection(elem.connection);
  }
};

/**
 * Draw a circle at the location of the given connection.  Inputs and outputs
 * share the same colors, as do previous and next.  When positioned correctly
 * a connected pair will look like a bullseye.
 * @param {Blockly.RenderedConnection} conn The connection to circle.
 * @package
 */
Blockly.BlockRendering.Debug.prototype.drawConnection = function(conn) {
  var colour;
  var size;
  var fill;
  if (conn.type == Blockly.INPUT_VALUE) {
    size = 4;
    colour = 'magenta';
    fill = 'none';
  } else if (conn.type == Blockly.OUTPUT_VALUE) {
    size = 2;
    colour = 'magenta';
    fill = colour;
  } else if (conn.type == Blockly.NEXT_STATEMENT) {
    size = 4;
    colour = 'goldenrod';
    fill = 'none';
  } else if (conn.type == Blockly.PREVIOUS_STATEMENT) {
    size = 2;
    colour = 'goldenrod';
    fill = colour;
  }
  this.debugElements_.push(Blockly.utils.dom.createSvgElement('circle',
      {
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
 * @param {!Blockly.BlockSvg.Row} row The non-empty row to render.
 * @param {number} cursorY The y position of the top of the row.
 * @package
 */
Blockly.BlockRendering.Debug.prototype.drawRenderedRow = function(row, cursorY) {
  this.debugElements_.push(Blockly.utils.dom.createSvgElement('rect',
      {
        'class': 'elemRenderingRect blockRenderDebug',
        'x': 0,
        'y': cursorY ,
        'width': row.width,
        'height': row.height,
      },
      this.svgRoot_));
};

/**
 * Draw debug rectangles for a non-empty row and all of its subcomponents.
 * @param {!Blockly.BlockSvg.Row} row The non-empty row to render.
 * @param {number} cursorY The y position of the top of the row.
 * @package
 */
Blockly.BlockRendering.Debug.prototype.drawRowWithElements = function(row, cursorY) {
  var centerY = cursorY + row.height / 2;
  var cursorX = 0;
  for (var e = 0; e < row.elements.length; e++) {
    var elem = row.elements[e];
    if (elem.isSpacer()) {
      this.drawSpacerElem(elem, cursorX, centerY);
    } else {
      this.drawRenderedElem(elem, cursorX, centerY);
    }
    cursorX += elem.width;
  }
  this.drawRenderedRow(row, cursorY);
};

/**
 * Do all of the work to draw debug information for the whole block.
 * @param {!Blockly.BlockSvg} block The block to draw debug information for.
 * @param {!Blockly.BlockRendering.RenderInfo} info Rendering information about
 *     the block to debug.
 * @package
 */
Blockly.BlockRendering.Debug.prototype.drawDebug = function(block, info) {
  this.clearElems();
  this.svgRoot_ = block.getSvgRoot();
  var cursorY = 0;
  for (var r = 0; r < info.rows.length; r++) {
    var row = info.rows[r];
    if (row.isSpacer()) {
      this.drawSpacerRow(row, cursorY);
    } else {
      this.drawRowWithElements(row, cursorY);
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
};
