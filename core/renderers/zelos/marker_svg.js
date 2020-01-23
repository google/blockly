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
 * @fileoverview Methods for graphically rendering a marker as SVG.
 * @author samelh@microsoft.com (Sam El-Husseini)
 */
'use strict';

goog.provide('Blockly.zelos.MarkerSvg');

goog.require('Blockly.blockRendering.MarkerSvg');


/**
 * Class to draw a marker.
 * @param {!Blockly.WorkspaceSvg} workspace The workspace the marker belongs to.
 * @param {!Blockly.blockRendering.ConstantProvider} constants The constants for
 *     the renderer.
 * @param {!Blockly.Marker} marker The marker to draw.
 * @constructor
 * @extends {Blockly.blockRendering.MarkerSvg}
 */
Blockly.zelos.MarkerSvg = function(workspace, constants, marker) {
  Blockly.zelos.MarkerSvg.superClass_.constructor.call(
      this, workspace, constants, marker);
};
Blockly.utils.object.inherits(Blockly.zelos.MarkerSvg,
    Blockly.blockRendering.MarkerSvg);

/**
 * @override
 */
Blockly.zelos.MarkerSvg.prototype.showWithInput_ = function(curNode) {
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
 * @param {!Blockly.ASTNode} curNode The current node of the marker.
 */
Blockly.zelos.MarkerSvg.prototype.showWithBlock_ = function(curNode) {
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
Blockly.zelos.MarkerSvg.prototype.positionCircle_ = function(x, y) {
  this.markerCircle_.setAttribute('cx', x);
  this.markerCircle_.setAttribute('cy', y);
  this.currentMarkerSvg = this.markerCircle_;
};

/**
 * @override
 */
Blockly.zelos.MarkerSvg.prototype.showAtLocation_ = function(curNode) {
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
    Blockly.zelos.MarkerSvg.superClass_.showAtLocation_.call(this, curNode);
  }
};

/**
 * @override
 */
Blockly.zelos.MarkerSvg.prototype.hide = function() {
  Blockly.zelos.MarkerSvg.superClass_.hide.call(this);
  this.markerCircle_.style.display = 'none';
};

/**
 * @override
 */
Blockly.zelos.MarkerSvg.prototype.createDomInternal_ = function() {
  /* This markup will be generated and added to the .svgGroup_:
  <g>
    <rect width="100" height="5">
      <animate attributeType="XML" attributeName="fill" dur="1s"
        values="transparent;transparent;#fff;transparent" repeatCount="indefinite" />
    </rect>
  </g>
  */

  Blockly.zelos.MarkerSvg.superClass_.createDomInternal_.call(this);

  this.markerCircle_ = Blockly.utils.dom.createSvgElement('circle', {
    'r': this.constants_.CURSOR_RADIUS,
    'style': 'display: none',
    'fill': this.colour_,
    'stroke': this.colour_,
    'stroke-width': this.constants_.CURSOR_STROKE_WIDTH
  },
  this.markerSvg_);

  // Markers and stack cursors don't blink.
  if (this.isCursor()) {
    var blinkProperties = this.getBlinkProperties_();
    Blockly.utils.dom.createSvgElement('animate', blinkProperties,
        this.markerCircle_);
  }

  return this.markerSvg_;
};

