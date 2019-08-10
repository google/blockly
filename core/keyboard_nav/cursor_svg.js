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
 * @fileoverview Methods for graphically rendering a cursor as SVG.
 * @author samelh@microsoft.com (Sam El-Husseini)
 */
'use strict';

goog.provide('Blockly.CursorSvg');

goog.require('Blockly.Cursor');


/**
 * Class for a cursor.
 * @param {!Blockly.Workspace} workspace The workspace to sit in.
 * @param {boolean=} opt_marker True if the cursor is a marker. A marker is used
 *     to save a location and is an immovable cursor. False or undefined if the
 *     cursor is not a marker.
 * @extends {Blockly.Cursor}
 * @constructor
 */
Blockly.CursorSvg = function(workspace, opt_marker) {
  Blockly.CursorSvg.superClass_.constructor.call(this, opt_marker);
  this.workspace_ = workspace;
};
goog.inherits(Blockly.CursorSvg, Blockly.Cursor);

/**
 * Height of the horizontal cursor.
 * @type {number}
 * @const
 */
Blockly.CursorSvg.CURSOR_HEIGHT = 5;

/**
 * Width of the horizontal cursor.
 * @type {number}
 * @const
 */
Blockly.CursorSvg.CURSOR_WIDTH = 100;

/**
 * The start length of the notch.
 * @type {number}
 * @const
 */
Blockly.CursorSvg.NOTCH_START_LENGTH = 24;

/**
 * Padding around the input.
 * @type {number}
 * @const
 */
Blockly.CursorSvg.VERTICAL_PADDING = 5;

/**
 * Padding around a stack.
 * @type {number}
 * @const
 */
Blockly.CursorSvg.STACK_PADDING = 10;
/**
 * Cursor color.
 * @type {string}
 * @const
 */
Blockly.CursorSvg.CURSOR_COLOR = '#cc0a0a';

/**
 * Immovable marker color.
 * @type {string}
 * @const
 */
Blockly.CursorSvg.MARKER_COLOR = '#4286f4';

/**
 * Parent SVG element.
 * This is generally a block's SVG root, unless the cursor is on the workspace.
 * @type {Element}
 */
Blockly.CursorSvg.prototype.parent_ = null;

/**
 * The current SVG element for the cursor.
 * @type {Element}
 */
Blockly.CursorSvg.prototype.currentCursorSvg = null;

/**
 * Return the root node of the SVG or null if none exists.
 * @return {Element} The root SVG node.
 */
Blockly.CursorSvg.prototype.getSvgRoot = function() {
  return this.svgGroup_;
};

/**
 * Create the DOM element for the cursor.
 * @return {!Element} The cursor controls SVG group.
 */
Blockly.CursorSvg.prototype.createDom = function() {
  this.svgGroup_ =
      Blockly.utils.dom.createSvgElement('g', {
        'class': 'blocklyCursor'
      }, null);

  this.createCursorSvg_();
  return this.svgGroup_;
};

/**
 * Set parent of the cursor. This is so that the cursor will be on the correct
 * SVG group.
 * @param {Element} newParent New parent of the cursor.
 * @private
 */
Blockly.CursorSvg.prototype.setParent_ = function(newParent) {
  var oldParent = this.parent_;
  if (newParent == oldParent) {
    return;
  }

  var svgRoot = this.getSvgRoot();

  if (newParent) {
    newParent.appendChild(svgRoot);
  }
  // If we are losing a parent, we want to move our DOM element to the
  // root of the workspace.
  else if (oldParent) {
    this.workspace_.getCanvas().appendChild(svgRoot);
  }
  this.parent_ = newParent;
};

/**************************/
/**** Display          ****/
/**************************/

/**
 * Show the cursor using coordinates.
 * @private
 */
Blockly.CursorSvg.prototype.showWithCoordinates_ = function() {
  var workspaceNode = this.getCurNode();
  var wsCoordinate = workspaceNode.getWsCoordinate();
  this.currentCursorSvg = this.cursorSvgLine_;
  this.setParent_(this.workspace_.svgBlockCanvas_);
  this.positionLine_(wsCoordinate.x, wsCoordinate.y, Blockly.CursorSvg.CURSOR_WIDTH);
  this.showCurrent_();
};

/**
 * Show the cursor using a block
 * @private
 */
Blockly.CursorSvg.prototype.showWithBlock_ = function() {
  //TODO: Change this from getLocation to something else
  var block = this.getCurNode().getLocation();

  this.currentCursorSvg = this.cursorSvgRect_;
  this.setParent_(block.getSvgRoot());
  this.positionRect_(0, 0, block.width , block.height);
  this.showCurrent_();
};

/**
 * Show the cursor using a connection with input or output type
 * @private
 */
Blockly.CursorSvg.prototype.showWithInputOutput_ = function() {
  var connection = /** @type {Blockly.Connection} */
      (this.getCurNode().getLocation());
  this.currentCursorSvg = this.cursorInputOutput_;
  this.setParent_(connection.getSourceBlock().getSvgRoot());
  this.positionInputOutput_(connection);
  this.showCurrent_();
};

/**
 * Show the cursor using a next connection
 * @private
 */
Blockly.CursorSvg.prototype.showWithNext_ = function() {
  var connection = this.getCurNode().getLocation();
  var targetBlock = connection.getSourceBlock();
  var x = 0;
  var y = connection.getOffsetInBlock().y;
  var width = targetBlock.getHeightWidth().width;

  this.currentCursorSvg = this.cursorSvgLine_;
  this.setParent_(connection.getSourceBlock().getSvgRoot());
  this.positionLine_(x, y, width);
  this.showCurrent_();
};

/**
 * Show the cursor using a previous connection.
 * @private
 */
Blockly.CursorSvg.prototype.showWithPrev_ = function() {
  var connection = this.getCurNode().getLocation();
  var targetBlock = connection.getSourceBlock();
  var width = targetBlock.getHeightWidth().width;

  this.currentCursorSvg = this.cursorSvgLine_;
  this.setParent_(connection.getSourceBlock().getSvgRoot());
  this.positionLine_(0, 0, width);
  this.showCurrent_();
};

/**
 * Show the cursor using a field.
 * @private
 */
Blockly.CursorSvg.prototype.showWithField_ = function() {
  var field = this.getCurNode().getLocation();
  var width = field.borderRect_.width.baseVal.value;
  var height = field.borderRect_.height.baseVal.value;

  this.currentCursorSvg = this.cursorSvgRect_;
  this.setParent_(field.getSvgRoot());
  this.positionRect_(0, 0, width, height);
  this.showCurrent_();
};

/**
 * Show the cursor using a stack.
 * @private
 */
Blockly.CursorSvg.prototype.showWithStack_ = function() {
  var block = this.getCurNode().getLocation();

  // Gets the height and width of entire stack.
  var heightWidth = block.getHeightWidth();

  // Add padding so that being on a stack looks different than being on a block.
  var width = heightWidth.width + Blockly.CursorSvg.STACK_PADDING;
  var height = heightWidth.height + Blockly.CursorSvg.STACK_PADDING;

  // Shift the rectangle slightly to upper left so padding is equal on all sides.
  var x = -1 * Blockly.CursorSvg.STACK_PADDING / 2;
  var y = -1 * Blockly.CursorSvg.STACK_PADDING / 2;

  // If the block has an output connection it needs more padding.
  if (block.outputConnection) {
    x -= Blockly.BlockSvg.TAB_WIDTH;
  }

  this.currentCursorSvg = this.cursorSvgRect_;
  this.setParent_(block.getSvgRoot());

  this.positionRect_(x, y, width, height);
  this.showCurrent_();
};


/**************************/
/**** Position         ****/
/**************************/

/**
 * Move and show the cursor at the specified coordinate in workspace units.
 * @param {number} x The new x, in workspace units.
 * @param {number} y The new y, in workspace units.
 * @param {number} width The new width, in workspace units.
 * @private
 */
Blockly.CursorSvg.prototype.positionLine_ = function(x, y, width) {
  this.cursorSvgLine_.setAttribute('x', x);
  this.cursorSvgLine_.setAttribute('y', y);
  this.cursorSvgLine_.setAttribute('width', width);
};

/**
 * Move and show the cursor at the specified coordinate in workspace units.
 * @param {number} x The new x, in workspace units.
 * @param {number} y The new y, in workspace units.
 * @param {number} width The new width, in workspace units.
 * @param {number} height The new height, in workspace units.
 * @private
 */
Blockly.CursorSvg.prototype.positionRect_ = function(x, y, width, height) {
  this.cursorSvgRect_.setAttribute('x', x);
  this.cursorSvgRect_.setAttribute('y', y);
  this.cursorSvgRect_.setAttribute('width', width);
  this.cursorSvgRect_.setAttribute('height', height);
};

/**
 * Position the cursor for an output connection.
 * @param {Blockly.Connection} connection The connection to position cursor around.
 * @private
 */
Blockly.CursorSvg.prototype.positionInputOutput_ = function(connection) {
  var x = connection.getOffsetInBlock().x;
  var y = connection.getOffsetInBlock().y;

  this.cursorInputOutput_.setAttribute('transform', 'translate(' + x + ',' + y + ')' +
            (connection.getSourceBlock().RTL ? ' scale(-1 1)' : ''));
};

/**
 * Show the current cursor.
 * @private
 */
Blockly.CursorSvg.prototype.showCurrent_ = function() {
  this.hide();
  this.currentCursorSvg.style.display = '';
};

/**
 * Hide the cursor.
 */
Blockly.CursorSvg.prototype.hide = function() {
  this.cursorSvgLine_.style.display = 'none';
  this.cursorSvgRect_.style.display = 'none';
  this.cursorInputOutput_.style.display = 'none';
};

/**
 * Update the cursor.
 * @package
 */
Blockly.CursorSvg.prototype.update_ = function() {
  if (!this.getCurNode()) {
    return;
  }
  var curNode = this.getCurNode();
  if (curNode.getType() === Blockly.ASTNode.types.BLOCK) {
    this.showWithBlock_();
    //This needs to be the location type because next connections can be input
    //type but they need to draw like they are a next statement
  } else if (curNode.getLocation().type === Blockly.INPUT_VALUE ||
      curNode.getType() === Blockly.ASTNode.types.OUTPUT) {
    this.showWithInputOutput_();
  } else if (curNode.getLocation().type === Blockly.NEXT_STATEMENT) {
    this.showWithNext_();
  } else if (curNode.getType() === Blockly.ASTNode.types.PREVIOUS) {
    this.showWithPrev_();
  } else if (curNode.getType() === Blockly.ASTNode.types.FIELD) {
    this.showWithField_();
  } else if (curNode.getType() === Blockly.ASTNode.types.WORKSPACE) {
    this.showWithCoordinates_();
  } else if (curNode.getType() === Blockly.ASTNode.types.STACK) {
    this.showWithStack_();
  }
};

/**
 * Create the cursor SVG.
 * @return {Element} The SVG node created.
 * @private
 */
Blockly.CursorSvg.prototype.createCursorSvg_ = function() {
  /* This markup will be generated and added to the .svgGroup_:
  <g>
    <rect width="100" height="5">
      <animate attributeType="XML" attributeName="fill" dur="1s"
        values="transparent;transparent;#fff;transparent" repeatCount="indefinite" />
    </rect>
  </g>
  */

  var colour = this.isMarker_ ? Blockly.CursorSvg.MARKER_COLOR :
      Blockly.CursorSvg.CURSOR_COLOR;
  this.cursorSvg_ = Blockly.utils.dom.createSvgElement('g',
      {
        'width': Blockly.CursorSvg.CURSOR_WIDTH,
        'height': Blockly.CursorSvg.CURSOR_HEIGHT
      }, this.svgGroup_);

  this.cursorSvgLine_ = Blockly.utils.dom.createSvgElement('rect',
      {
        'x': '0',
        'y': '0',
        'fill': colour,
        'width': Blockly.CursorSvg.CURSOR_WIDTH,
        'height': Blockly.CursorSvg.CURSOR_HEIGHT,
        'style': 'display: none;'
      },
      this.cursorSvg_);

  this.cursorSvgRect_ = Blockly.utils.dom.createSvgElement('rect',
      {
        'class': 'blocklyVerticalCursor',
        'x': '0',
        'y': '0',
        'rx': '10', 'ry': '10',
        'style': 'display: none;',
        'stroke': colour
      },
      this.cursorSvg_);

  this.cursorInputOutput_ = Blockly.utils.dom.createSvgElement(
      'path',
      {
        'width': Blockly.CursorSvg.CURSOR_WIDTH,
        'height': Blockly.CursorSvg.CURSOR_HEIGHT,
        'd': 'm 0,0 ' + Blockly.BlockSvg.TAB_PATH_DOWN + ' v 5',
        'transform':'',
        'style':'display: none;',
        'fill': colour
      },
      this.cursorSvg_);

  // Markers don't blink.
  if (!this.isMarker_) {
    Blockly.utils.dom.createSvgElement('animate',
        {
          'attributeType': 'XML',
          'attributeName': 'fill',
          'dur': '1s',
          'values': Blockly.CursorSvg.CURSOR_COLOR + ';transparent;transparent;',
          'repeatCount': 'indefinite'
        },
        this.cursorSvgLine_);

    Blockly.utils.dom.createSvgElement('animate',
        {
          'attributeType': 'XML',
          'attributeName': 'fill',
          'dur': '1s',
          'values': Blockly.CursorSvg.CURSOR_COLOR + ';transparent;transparent;',
          'repeatCount': 'indefinite'
        },
        this.cursorInputOutput_);
  }

  return this.cursorSvg_;
};

/**
 * Find the next connection, field, or block.
 * Does nothing if this cursor is an immovable marker.
 * @return {Blockly.ASTNode} The next element, or null if the current node is
 *     not set or there is no next value.
 */
Blockly.CursorSvg.prototype.next = function() {
  if (this.isMarker_) {
    return null;
  }
  return Blockly.CursorSvg.superClass_.next.call(this);
};

/**
 * Find the in connection or field.
 * Does nothing if this cursor is an immovable marker.
 * @return {Blockly.ASTNode} The in element, or null if the current node is
 *     not set or there is no in value.
 */
Blockly.CursorSvg.prototype.in = function() {
  if (this.isMarker_) {
    return null;
  }
  return Blockly.CursorSvg.superClass_.in.call(this);
};

/**
 * Find the previous connection, field, or block.
 * Does nothing if this cursor is an immovable marker.
 * @return {Blockly.ASTNode} The previous element, or null if the current node
 *     is not set or there is no previous value.
 */
Blockly.CursorSvg.prototype.prev = function() {
  if (this.isMarker_) {
    return null;
  }
  return Blockly.CursorSvg.superClass_.prev.call(this);
};

/**
 * Find the out connection, field, or block.
 * Does nothing if this cursor is an immovable marker.
 * @return {Blockly.ASTNode} The out element, or null if the current node is
 *     not set or there is no out value.
 */
Blockly.CursorSvg.prototype.out = function() {
  if (this.isMarker_) {
    return null;
  }
  return Blockly.CursorSvg.superClass_.out.call(this);
};

/**
 * Dispose of this cursor.
 */
Blockly.CursorSvg.prototype.dispose = function() {
  if (this.svgGroup_) {
    Blockly.utils.dom.removeNode(this.svgGroup_);
  }
};
