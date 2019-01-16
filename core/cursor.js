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
        'class': 'blocklyCursor',
        'style': 'display: none'
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
Blockly.Cursor.prototype.workspaceShow = function(e, rtl) {
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

  var cursorSize = new goog.math.Size(Blockly.Cursor.CURSOR_WIDTH, Blockly.Cursor.CURSOR_HEIGHT);

  var x = finalOffsetMainWs.x + (rtl ? -cursorSize.width : cursorSize.width);
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
  
  this.cursorSvgRect_.setAttribute('x', x);
  this.cursorSvgRect_.setAttribute('y', y);

  this.show();
};

/**
 * Show the cursor using a connection
 * @param {Blockly.Connection} connection The connection to position the cursor to
 */
Blockly.Cursor.prototype.showWithConnection = function(connection) {
  this.CURSOR_REFERENCE = connection;

  // TODO: position to connection
  
  this.show();
};

/**
 * Show the cursor
 */
Blockly.Cursor.prototype.show = function() {
  this.svgGroup_.style.display = '';
};

/**
 * Hide the cursor.
 */
Blockly.Cursor.prototype.hide = function() {
  this.svgGroup_.style.display = 'none';
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
  this.cursorSvgRect_ = Blockly.utils.createSvgElement('rect',
      {
        'x': '0',
        'y': '0',
        'fill': Blockly.Cursor.CURSOR_COLOR,
        'width': Blockly.Cursor.CURSOR_WIDTH,
        'height': Blockly.Cursor.CURSOR_HEIGHT
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
      this.cursorSvgRect_);
  return this.cursorSvg_;
};
