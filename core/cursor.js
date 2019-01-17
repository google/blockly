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
Blockly.Cursor.CURSOR_COLOR = '#FFCC33';

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

  var targetBlock = connection.sourceBlock_;
  var xy = targetBlock.getRelativeToSurfaceXY();
  if (connection.type == Blockly.INPUT_VALUE || connection.type == Blockly.OUTPUT_VALUE) {
    targetBlock = connection.targetConnection.sourceBlock_;
    this.positionVertical_(xy.x + connection.offsetInBlock_.x - Blockly.Cursor.VERTICAL_PADDING,
        xy.y + connection.offsetInBlock_.y - Blockly.Cursor.VERTICAL_PADDING,
        targetBlock.getHeightWidth().width + (Blockly.Cursor.VERTICAL_PADDING * 2),
        targetBlock.getHeightWidth().height + (Blockly.Cursor.VERTICAL_PADDING * 2));
    this.showVertical_();
  } else {
    this.positionHorizontal_(xy.x + connection.offsetInBlock_.x - Blockly.Cursor.NOTCH_START_LENGTH,
        xy.y + connection.offsetInBlock_.y, targetBlock.getHeightWidth().width);
    this.showHorizontal_();
  }
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

Blockly.Cursor.prototype.showHorizontal_ = function() {
  this.hide();
  this.cursorSvgHorizontal_.style.display = '';
};

Blockly.Cursor.prototype.showVertical_ = function() {
  this.hide();
  this.cursorSvgVertical_.style.display = '';
};

/**
 * Hide the cursor.
 */
Blockly.Cursor.prototype.hide = function() {
  this.cursorSvgHorizontal_.style.display = 'none';
  this.cursorSvgVertical_.style.display = 'none';
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
  Blockly.utils.createSvgElement('animate',
      {
        'attributeType': 'XML',
        'attributeName': 'fill',
        'dur': '1s',
        'values': Blockly.Cursor.CURSOR_COLOR + ';transparent;transparent;',
        'repeatCount': 'indefinite'
      },
      this.cursorSvgHorizontal_);
  this.cursorSvgVertical_ = Blockly.utils.createSvgElement('rect',
      {
        'class': 'blocklyVerticalCursor',
        'x': '0',
        'y': '0',
        'rx': '10', 'ry': '10',
        'style': 'display: none;'
      },
      this.cursorSvg_);
  return this.cursorSvg_;
};
