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

Blockly.BlockRendering.Debug = function() {
  this.debugElements_ = [];
  this.svgRoot_ = null;
};

Blockly.BlockRendering.Debug.prototype.clearElems = function() {
  for (var i = 0, elem; elem = this.debugElements_[i]; i++) {
    Blockly.utils.removeNode(elem);
  }

  this.debugElements_ = [];
};

Blockly.BlockRendering.Debug.prototype.drawSpacerRow = function(row, cursorY) {
  this.debugElements_.push(Blockly.utils.createSvgElement('rect',
      {
        'class': 'rowSpacerRect displayable',
        'x': 0,
        'y': cursorY,
        'width': row.width,
        'height': row.height,
      },
      this.svgRoot_));
};

Blockly.BlockRendering.Debug.prototype.drawSpacerElem = function(elem, cursorX, centerY) {
  var yPos = centerY - elem.height / 2;
  this.debugElements_.push(Blockly.utils.createSvgElement('rect',
      {
        'class': 'elemSpacerRect displayable',
        'x': cursorX,
        'y': yPos,
        'width': elem.width,
        'height': 15,
      },
      this.svgRoot_));
};

Blockly.BlockRendering.Debug.prototype.drawRenderedElem = function(elem, cursorX, centerY) {
  var yPos = centerY - elem.height / 2;
  this.debugElements_.push(Blockly.utils.createSvgElement('rect',
      {
        'class': 'rowRenderingRect displayable',
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
  this.debugElements_.push(Blockly.utils.createSvgElement('circle',
      {
        'class': 'connectionRenderingDot',
        'cx': conn.offsetInBlock_.x,
        'cy': conn.offsetInBlock_.y,
        'r': size,
        'fill': fill,
        'stroke': colour,
      },
      this.svgRoot_));
};

Blockly.BlockRendering.Debug.prototype.drawRenderedRow = function(row, cursorY) {
  this.debugElements_.push(Blockly.utils.createSvgElement('rect',
      {
        'class': 'elemRenderingRect displayable',
        'x': 0,
        'y': cursorY ,
        'width': row.width,
        'height': row.height,
      },
      this.svgRoot_));
};

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


