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
 * @fileoverview Methods for graphically rendering a cursor as SVG.
 * @author samelh@microsoft.com (Sam El-Husseini)
 */
'use strict';

goog.provide('Blockly.zelos.CursorSvg');

goog.require('Blockly.blockRendering.CursorSvg');


/**
 * Class for a cursor.
 * @param {!Blockly.WorkspaceSvg} workspace The workspace the cursor belongs to.
 * @param {!Blockly.blockRendering.ConstantProvider} constants The constants for
 *     the renderer.
  * @param {boolean=} opt_marker True if the cursor is a marker. A marker is used
 *     to save a location and is an immovable cursor. False or undefined if the
 *     cursor is not a marker.
 * @constructor
 * @extends {Blockly.blockRendering.CursorSvg}
 */
Blockly.zelos.CursorSvg = function(workspace, constants, opt_marker) {
  Blockly.zelos.CursorSvg.superClass_.constructor.call(
      this, workspace, constants, opt_marker);
};
Blockly.utils.object.inherits(Blockly.zelos.CursorSvg,
    Blockly.blockRendering.CursorSvg);

/**
 * @override
 */
Blockly.zelos.CursorSvg.prototype.showWithInput_ = function(curNode) {
  var block = /** @type {!Blockly.BlockSvg} */ (curNode.getSourceBlock());
  var connection = curNode.getLocation();
  var offsetInBlock = connection.getOffsetInBlock();

  var y = offsetInBlock.y + this.constants_.CURSOR_RADIUS;
  
  this.positionCircle_(offsetInBlock.x, y);
  this.setParent_(block);
  this.showCurrent_();
};

/**
 * Draw a rectangle around the block.
 * @param {!Blockly.ASTNode} curNode The current node of the cursor.
 */
Blockly.zelos.CursorSvg.prototype.showWithBlock_ = function(curNode) {
  var block = /** @type {!Blockly.BlockSvg} */ (curNode.getLocation());

  // Gets the height and width of entire stack.
  var heightWidth = block.getHeightWidth();

  // Add padding so that being on a stack looks different than being on a block.
  this.positionRect_(0, 0, heightWidth.width, heightWidth.height);
  this.setParent_(block);
  this.showCurrent_();
};

/**
 * Position the circle we use for input and output connections.
 * @param {number} x The x position of the circle.
 * @param {number} y The y position of the circle.
 * @private
 */
Blockly.zelos.CursorSvg.prototype.positionCircle_ = function(x, y) {
  this.cursorCircle_.setAttribute('cx', x);
  this.cursorCircle_.setAttribute('cy', y);
  this.currentCursorSvg = this.cursorCircle_;
};

/**
 * @override
 */
Blockly.zelos.CursorSvg.prototype.showAtLocation_ = function(curNode) {
  var handled = false;
  if (curNode.getType() == Blockly.ASTNode.types.OUTPUT) {
    // Inputs and outputs are drawn the same.
    this.showWithInput_(curNode);
    handled = true;
  } else if (curNode.getType() == Blockly.ASTNode.types.BLOCK) {
    this.showWithBlock_(curNode);
    handled = true;
  }

  if (!handled) {
    Blockly.zelos.CursorSvg.superClass_.showAtLocation_.call(this, curNode);
  }
};

/**
 * @override
 */
Blockly.zelos.CursorSvg.prototype.hide = function() {
  Blockly.zelos.CursorSvg.superClass_.hide.call(this);
  this.cursorCircle_.style.display = 'none';
};

/**
 * @override
 */
Blockly.zelos.CursorSvg.prototype.createDomInternal_ = function() {
  /* This markup will be generated and added to the .svgGroup_:
  <g>
    <rect width="100" height="5">
      <animate attributeType="XML" attributeName="fill" dur="1s"
        values="transparent;transparent;#fff;transparent" repeatCount="indefinite" />
    </rect>
  </g>
  */

  Blockly.zelos.CursorSvg.superClass_.createDomInternal_.call(this);
  var colour = this.isMarker() ? this.constants_.MARKER_COLOUR :
      this.constants_.CURSOR_COLOUR;

  this.cursorCircle_ = Blockly.utils.dom.createSvgElement('circle', {
    'r': this.constants_.CURSOR_RADIUS,
    'style': 'display: none',
    'fill': colour,
    'stroke': colour,
    'stroke-width': this.constants_.CURSOR_STROKE_WIDTH
  },
  this.cursorSvg_);

  // Markers and stack cursors don't blink.
  if (!this.isMarker()) {
    var blinkProperties = this.getBlinkProperties_();
    Blockly.utils.dom.createSvgElement('animate', blinkProperties,
        this.cursorCircle_);
  }

  return this.cursorSvg_;
};

