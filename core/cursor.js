/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2012 Google Inc.
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
 * @fileoverview Methods for graphically rendering a cursor as SVG.
 * @author samelh@microsoft.com (Sam El-Husseini)
 */
'use strict';

goog.provide('Blockly.Cursor');


/**
 * Class for a cursor.
 * @param {!Blockly.Workspace} workspace The workspace to sit in.
 * @constructor
 */
Blockly.Cursor = function(workspace) {
  this.workspace_ = workspace;
};

/**
 * Height of the horizontal cursor.
 * @type {number}
 * @const
 */
Blockly.Cursor.CURSOR_HEIGHT = 5;

/**
 * Width of the horizontal cursor.
 * @type {number}
 * @const
 */
Blockly.Cursor.CURSOR_WIDTH = 100;

/**
 * The start length of the notch.
 * @type {number}
 * @const
 */
Blockly.Cursor.NOTCH_START_LENGTH = 24;

/**
 * Padding around the input.
 * @type {number}
 * @const
 */
Blockly.Cursor.VERTICAL_PADDING = 5;

/**
 * Cursor color.
 * @type {number}
 * @const
 */
Blockly.Cursor.CURSOR_COLOR = '#cc0a0a';

/**
 * A reference to the current object that the cursor is associated with
 * @type {goog.math.Coordinate|Blockly.Connection|Blockly.Field}
 */
Blockly.Cursor.CURSOR_REFERENCE = null;

/**
 * Create the zoom controls.
 * @return {!Element} The zoom controls SVG group.
 */
Blockly.Cursor.prototype.createDom = function() {
  this.svgGroup_ =
      Blockly.utils.createSvgElement('g', {
        'class': 'blocklyCursor'
      }, null);

  this.createCursorSvg_();
  return this.svgGroup_;
};

/**
 * Show the cursor on the workspace, use the event to determine it's positioning
 * @param {!Event} e Mouse event for the shift click that is making the cursor appear.
 * @param {boolean} rtl True if RTL, false if LTR.
 * @package
 */
Blockly.Cursor.prototype.workspaceShow = function(e) {
  var ws = this.workspace_;
  var injectionDiv = ws.getInjectionDiv();
  // Bounding rect coordinates are in client coordinates, meaning that they
  // are in pixels relative to the upper left corner of the visible browser
  // window.  These coordinates change when you scroll the browser window.
  var boundingRect = injectionDiv.getBoundingClientRect();

  // The client coordinates offset by the injection div's upper left corner.
  var clientOffsetPixels = new goog.math.Coordinate(
      e.clientX - boundingRect.left, e.clientY - boundingRect.top);

  // The offset in pixels between the main workspace's origin and the upper
  // left corner of the injection div.
  var mainOffsetPixels = ws.getOriginOffsetInPixels();

  // The position of the new comment in pixels relative to the origin of the
  // main workspace.
  var finalOffsetPixels = goog.math.Coordinate.difference(clientOffsetPixels,
      mainOffsetPixels);

  // The position of the new comment in main workspace coordinates.
  var finalOffsetMainWs = finalOffsetPixels.scale(1 / ws.scale);

  var x = finalOffsetMainWs.x;
  var y = finalOffsetMainWs.y;
  this.showWithCoordinates(x, y);
};

/**
 * Show the cursor using coordinates
 * @param {number} x The new x position to move the cursor to.
 * @param {number} y The new y position to move the cursor to.
 */
Blockly.Cursor.prototype.showWithCoordinates = function(x, y) {
  this.CURSOR_REFERENCE = new goog.math.Coordinate(x, y);

  this.positionHorizontal_(x, y, Blockly.Cursor.CURSOR_WIDTH);
  this.showHorizontal_();
};

/**
 * Show the cursor using a connection
 * @param {Blockly.Connection} connection The connection to position the cursor to
 */
Blockly.Cursor.prototype.showWithConnection = function(connection) {
  if (!connection) {
    return;
  }
  this.CURSOR_REFERENCE = connection;

  if (connection.type == Blockly.INPUT_VALUE) {
    this.positionInput(connection);
    this.showConnection_();
  } else if (connection.type == Blockly.OUTPUT_VALUE) {
    this.positionOutput(connection);
    this.showConnection_();
  } else {
    var targetBlock = connection.sourceBlock_;
    var xy = targetBlock.getRelativeToSurfaceXY();
    this.positionHorizontal_(xy.x + connection.offsetInBlock_.x - Blockly.Cursor.NOTCH_START_LENGTH,
        xy.y + connection.offsetInBlock_.y, targetBlock.getHeightWidth().width);
    this.showHorizontal_();
  }
};

/**
 * Show the cursor using a block
 * @param {Blockly.BlockSvg} block The block to position the cursor around
 */
Blockly.Cursor.prototype.showWithBlock = function(block) {
  var xy = block.getRelativeToSurfaceXY();
  this.positionVertical_(xy.x + Blockly.Cursor.VERTICAL_PADDING,
      xy.y - Blockly.Cursor.VERTICAL_PADDING,
      block.width + (Blockly.Cursor.VERTICAL_PADDING * 2),
      block.height + (Blockly.Cursor.VERTICAL_PADDING * 2));
  this.showVertical_();
};

Blockly.Cursor.prototype.showWithAnything = function(cursor) {
  if (cursor instanceof Blockly.BlockSvg) {
    this.showWithBlock(cursor);
  } else if (cursor instanceof Blockly.RenderedConnection) {
    this.showWithConnection(cursor);
  }
};

/**
 * Show the cursor using an input
 * @param {Blockly.Input} input The input to position the cursor around
 */
Blockly.Cursor.prototype.showWithInput = function(input) {
  var connection = input.connection;
  if (connection) {
    this.showWithConnection(connection);
  }
};

/**
 * Show the cursor using a field
 * @param {Blockly.Field} field The field to position the cursor around
 */
Blockly.Cursor.prototype.showWithField = function(field) {
  console.log('displaying cursor with field' + field);
};

/**
 * Move and show the cursor at the specified coordinate in workspace units.
 * @param {number} x The new x, in workspace units.
 * @param {number} y The new y, in workspace units.
 * @param {number} width The new width, in workspace units.
 */
Blockly.Cursor.prototype.positionHorizontal_ = function(x, y, width) {
  var cursorSize = new goog.math.Size(Blockly.Cursor.CURSOR_WIDTH, Blockly.Cursor.CURSOR_HEIGHT);

  this.cursorSvgHorizontal_.setAttribute('x', x + (this.workspace_.RTL ? -cursorSize.width : cursorSize.width));
  this.cursorSvgHorizontal_.setAttribute('y', y);
  this.cursorSvgHorizontal_.setAttribute('width', width);
};

/**
 * Move and show the cursor at the specified coordinate in workspace units.
 * @param {number} x The new x, in workspace units.
 * @param {number} y The new y, in workspace units.
 * @param {number} width The new width, in workspace units.
 * @param {number} height The new height, in workspace units.
 */
Blockly.Cursor.prototype.positionVertical_ = function(x, y, width, height) {
  var cursorSize = new goog.math.Size(Blockly.Cursor.CURSOR_WIDTH, Blockly.Cursor.CURSOR_HEIGHT);

  this.cursorSvgVertical_.setAttribute('x', x + (this.workspace_.RTL ? -cursorSize.width : cursorSize.width));
  this.cursorSvgVertical_.setAttribute('y', y);
  this.cursorSvgVertical_.setAttribute('width', width);
  this.cursorSvgVertical_.setAttribute('height', height);
};

/**
 * Position the cursor for an output connection.
 * @param{Blockly.Connection} connection The connection to position cursor around.
 */
Blockly.Cursor.prototype.positionOutput = function(connection) {
  var cursorSize = new goog.math.Size(Blockly.Cursor.CURSOR_WIDTH, Blockly.Cursor.CURSOR_HEIGHT);
  var xy = connection.sourceBlock_.getRelativeToSurfaceXY();
  var x = xy.x + connection.offsetInBlock_.x + cursorSize.width + cursorSize.height;
  var y = xy.y + connection.offsetInBlock_.y;
  this.cursorOutput_.setAttribute('fill', '#f44242');
  this.cursorOutput_.setAttribute('transform', 'translate(' + x + ',' + y + ')' +
            (connection.sourceBlock_.RTL ? ' scale(-1 1)' : ''));
};

/**
 * Position the cursor for an input connection.
 * @param{Blockly.Connection} connection The connection to position cursor around.
 */
Blockly.Cursor.prototype.positionInput = function(connection) {
  var cursorSize = new goog.math.Size(Blockly.Cursor.CURSOR_WIDTH, Blockly.Cursor.CURSOR_HEIGHT);
  var x = connection.x_ + cursorSize.width + cursorSize.height;
  var y = connection.y_;
  this.cursorOutput_.setAttribute('fill', '#9e42f4');
  this.cursorOutput_.setAttribute('transform', 'translate(' + x + ',' + y + ')' +
            (connection.sourceBlock_.RTL ? ' scale(-1 1)' : ''));
};

/**
 * Display the horizontal line used to represent next and previous connections.
 */
Blockly.Cursor.prototype.showHorizontal_ = function() {
  this.hide();
  this.cursorSvgHorizontal_.style.display = '';
};

/**
 * Display the box used to represent blocks
 */
Blockly.Cursor.prototype.showVertical_ = function() {
  this.hide();
  this.cursorSvgVertical_.style.display = '';
};

/**
 * Display the connection piece used to represent output and input conneections.
 */
Blockly.Cursor.prototype.showConnection_ = function() {
  this.hide();
  this.cursorOutput_.style.display = '';
};

/**
 * Hide the cursor.
 */
Blockly.Cursor.prototype.hide = function() {
  this.cursorSvgHorizontal_.style.display = 'none';
  this.cursorSvgVertical_.style.display = 'none';
  this.cursorOutput_.style.display = 'none';
};

/**
 * Create the cursor svg.
 * @return {Element} The SVG node created.
 * @private
 */
Blockly.Cursor.prototype.createCursorSvg_ = function() {
  /* This markup will be generated and added to the .svgGroup_:
  <g>
    <rect width="100" height="5">
      <animate attributeType="XML" attributeName="fill" dur="1s"
        values="transparent;transparent;#fff;transparent" repeatCount="indefinite" />
    </rect>
  </g>
  */
  this.cursorSvg_ = Blockly.utils.createSvgElement('g',
      {
        'width': Blockly.Cursor.CURSOR_WIDTH,
        'height': Blockly.Cursor.CURSOR_HEIGHT
      }, this.svgGroup_);

  this.cursorSvgHorizontal_ = Blockly.utils.createSvgElement('rect',
      {
        'x': '0',
        'y': '0',
        'fill': Blockly.Cursor.CURSOR_COLOR,
        'width': Blockly.Cursor.CURSOR_WIDTH,
        'height': Blockly.Cursor.CURSOR_HEIGHT,
        'style': 'display: none;'
      },
      this.cursorSvg_);

  this.cursorSvgVertical_ = Blockly.utils.createSvgElement('rect',
      {
        'class': 'blocklyVerticalCursor',
        'x': '0',
        'y': '0',
        'rx': '10', 'ry': '10',
        'style': 'display: none;'
      },
      this.cursorSvg_);

  this.cursorOutput_ = Blockly.utils.createSvgElement(
      'path',
      {
        'width': Blockly.Cursor.CURSOR_WIDTH,
        'height': Blockly.Cursor.CURSOR_HEIGHT,
        'd': 'm 0,0 ' + Blockly.BlockSvg.TAB_PATH_DOWN + ' v 5',
        'transform':'',
        'style':'display: none;'
      },
      this.cursorSvg_);

  Blockly.utils.createSvgElement('animate',
      {
        'attributeType': 'XML',
        'attributeName': 'fill',
        'dur': '1s',
        'values': Blockly.Cursor.CURSOR_COLOR + ';transparent;transparent;',
        'repeatCount': 'indefinite'
      },
      this.cursorSvgHorizontal_);

  Blockly.utils.createSvgElement('animate',
      {
        'attributeType': 'XML',
        'attributeName': 'fill',
        'dur': '1s',
        'values': Blockly.Cursor.CURSOR_COLOR + ';transparent;transparent;',
        'repeatCount': 'indefinite'
      },
      this.cursorOutput_);

  return this.cursorSvg_;
};
