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

Blockly.BlockRendering.Debug.drawSpacerRow = function(row, cursorY, svgRoot) {
  row.rect = Blockly.utils.createSvgElement('rect',
      {
        'class': 'rowSpacerRect displayable',
        'x': 0,
        'y': cursorY,
        'width': row.width,
        'height': row.height,
      },
      svgRoot);
};

Blockly.BlockRendering.Debug.drawSpacerElem = function(elem, cursorX, centerY, svgRoot) {
  elem.rect = Blockly.utils.createSvgElement('rect',
      {
        'class': 'elemSpacerRect displayable',
        'x': cursorX,
        'y': centerY - elem.height / 2,
        'width': elem.width,
        'height': 15,
      },
      svgRoot);
};

Blockly.BlockRendering.Debug.drawRenderedElem = function(elem, cursorX, centerY, svgRoot) {
  var yPos = centerY - elem.height / 2;
  elem.rect = Blockly.utils.createSvgElement('rect',
      {
        'class': 'rowRenderingRect displayable',
        'x': cursorX,
        'y': yPos,
        'width': elem.width,
        'height': elem.height ,
      },
      svgRoot);

  if (elem.isInput) {
    Blockly.BlockRendering.Debug.drawConnection(elem.connection, svgRoot);
  }
};

Blockly.BlockRendering.Debug.drawConnection = function(conn, svgRoot) {
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
  Blockly.utils.createSvgElement('circle',
      {
        'class': 'connectionRenderingDot',
        'cx': conn.offsetInBlock_.x,
        'cy': conn.offsetInBlock_.y,
        'r': size,
        'fill': fill,
        'stroke': colour,
      },
      svgRoot);
};

Blockly.BlockRendering.Debug.drawRenderedRow = function(row, cursorY, svgRoot) {
  row.rect = Blockly.utils.createSvgElement('rect',
      {
        'class': 'elemRenderingRect displayable',
        'x': 0,
        'y': cursorY ,
        'width': row.width,
        'height': row.height,
      },
      svgRoot);
};

Blockly.BlockRendering.Debug.drawRowWithElements = function(row, cursorY, svgRoot) {
  var centerY = cursorY + row.height / 2;
  var cursorX = 0;
  for (var e = 0; e < row.elements.length; e++) {
    var elem = row.elements[e];
    if (elem.isSpacer()) {
      Blockly.BlockRendering.Debug.drawSpacerElem(elem, cursorX, centerY, svgRoot);
    } else {
      Blockly.BlockRendering.Debug.drawRenderedElem(elem, cursorX, centerY, svgRoot);
    }
    cursorX += elem.width;
  }
  Blockly.BlockRendering.Debug.drawRenderedRow(row, cursorY, svgRoot);
};

Blockly.BlockRendering.Debug.drawDebug = function(block, info) {
  var svgRoot = block.getSvgRoot();
  var cursorY = 0;
  for (var r = 0; r < info.rows.length; r++) {
    var row = info.rows[r];
    if (row.isSpacer()) {
      Blockly.BlockRendering.Debug.drawSpacerRow(row, cursorY, svgRoot);
    } else {
      Blockly.BlockRendering.Debug.drawRowWithElements(row, cursorY, svgRoot);
    }
    cursorY += row.height;
  }

  if (block.previousConnection) {
    Blockly.BlockRendering.Debug.drawConnection(block.previousConnection, svgRoot);
  }
  if (block.nextConnection) {
    Blockly.BlockRendering.Debug.drawConnection(block.nextConnection, svgRoot);
  }
  if (block.outputConnection) {
    Blockly.BlockRendering.Debug.drawConnection(block.outputConnection, svgRoot);
  }
};
