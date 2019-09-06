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
 * @fileoverview Zelos renderer.
 * @author samelh@google.com (Sam El-Husseini)
 */
'use strict';

goog.provide('Blockly.zelos.Drawer');

goog.require('Blockly.blockRendering.ConstantProvider');
goog.require('Blockly.blockRendering.Drawer');
goog.require('Blockly.blockRendering.Types');
goog.require('Blockly.zelos.RenderInfo');


/**
 * An object that draws a block based on the given rendering information.
 * @param {!Blockly.BlockSvg} block The block to render.
 * @param {!Blockly.zelos.RenderInfo} info An object containing all
 *   information needed to render this block.
 * @package
 * @constructor
 * @extends {Blockly.blockRendering.Drawer}
 */
Blockly.zelos.Drawer = function(block, info) {
  Blockly.zelos.Drawer.superClass_.constructor.call(this, block, info);
};
goog.inherits(Blockly.zelos.Drawer, Blockly.blockRendering.Drawer);


/**
 * Add steps for the top corner of the block, taking into account
 * details such as hats and rounded corners.
 * @protected
 */
Blockly.zelos.Drawer.prototype.drawTop_ = function() {
  var topRow = this.info_.topRow;
  var elements = topRow.elements;

  this.positionPreviousConnection_();
  this.outlinePath_ +=
      Blockly.utils.svgPaths.moveBy(topRow.xPos, this.info_.startY);
  for (var i = 0, elem; (elem = elements[i]); i++) {
    if (Blockly.blockRendering.Types.isLeftRoundedCorner(elem)) {
      this.outlinePath_ +=
          this.constants_.OUTSIDE_CORNERS.topLeft;
    } else if (Blockly.blockRendering.Types.isRightRoundedCorner(elem)) {
      this.outlinePath_ +=
          this.constants_.OUTSIDE_CORNERS.topRight;
    } else if (Blockly.blockRendering.Types.isPreviousConnection(elem)) {
      this.outlinePath_ += elem.shape.pathLeft;
    } else if (Blockly.blockRendering.Types.isHat(elem)) {
      this.outlinePath_ += this.constants_.START_HAT.path;
    } else if (Blockly.blockRendering.Types.isSpacer(elem)) {
      this.outlinePath_ += Blockly.utils.svgPaths.lineOnAxis('h', elem.width);
    }
    // No branch for a square corner because it's a no-op.
  }

  if (!this.info_.outputConnection ||
      !this.info_.outputConnection.isDynamic()) {
    this.outlinePath_ += Blockly.utils.svgPaths.lineOnAxis('v', topRow.height);
  }
};


/**
 * Add steps for the bottom edge of a block, possibly including a notch
 * for the next connection
 * @protected
 */
Blockly.zelos.Drawer.prototype.drawBottom_ = function() {
  var bottomRow = this.info_.bottomRow;
  var elems = bottomRow.elements;
  this.positionNextConnection_();

  var rightCornerYOffset = 0;
  var outlinePath = '';
  for (var i = elems.length - 1, elem; (elem = elems[i]); i--) {
    if (Blockly.blockRendering.Types.isNextConnection(elem)) {
      outlinePath += elem.shape.pathRight;
    } else if (Blockly.blockRendering.Types.isLeftSquareCorner(elem)) {
      outlinePath += Blockly.utils.svgPaths.lineOnAxis('H', bottomRow.xPos);
    } else if (Blockly.blockRendering.Types.isLeftRoundedCorner(elem)) {
      outlinePath += this.constants_.OUTSIDE_CORNERS.bottomLeft;
    } else if (Blockly.blockRendering.Types.isRightRoundedCorner(elem)) {
      outlinePath += this.constants_.OUTSIDE_CORNERS.bottomRight;
      rightCornerYOffset = this.constants_.INSIDE_CORNERS.rightHeight;
    } else if (Blockly.blockRendering.Types.isSpacer(elem)) {
      outlinePath += Blockly.utils.svgPaths.lineOnAxis('h', elem.width * -1);
    }
  }

  if (!this.info_.outputConnection ||
      !this.info_.outputConnection.isDynamic()) {
    this.outlinePath_ +=
        Blockly.utils.svgPaths.lineOnAxis('V',
            bottomRow.baseline - rightCornerYOffset);
  }
  this.outlinePath_ += outlinePath;
};

/**
 * Add steps for the right side of a row that does not have value or
 * statement input connections.
 * @param {!Blockly.blockRendering.Row} row The row to draw the
 *     side of.
 * @protected
 */
Blockly.zelos.Drawer.prototype.drawRightSideRow_ = function(row) {
  if (this.info_.outputConnection && this.info_.outputConnection.isDynamic()) {
    this.drawRightConnection_(row);
    return;
  }
  if (row.type & Blockly.blockRendering.Types.getType('BEFORE_STATEMENT_SPACER_ROW')) {
    var remainingHeight = row.height - this.constants_.INSIDE_CORNERS.rightWidth;
    this.outlinePath_ +=
        (remainingHeight > 0 ?
            Blockly.utils.svgPaths.lineOnAxis('V', row.yPos + remainingHeight) : '') +
        this.constants_.INSIDE_CORNERS.pathTopRight;
  } else if (row.type & Blockly.blockRendering.Types.getType('AFTER_STATEMENT_SPACER_ROW')) {
    var remainingHeight = row.height - this.constants_.INSIDE_CORNERS.rightWidth;
    this.outlinePath_ +=
        this.constants_.INSIDE_CORNERS.pathBottomRight +
        (remainingHeight > 0 ?
            Blockly.utils.svgPaths.lineOnAxis('V', row.yPos + row.height) : '');
  } else {
    this.outlinePath_ +=
        Blockly.utils.svgPaths.lineOnAxis('V', row.yPos + row.height);
  }
};

/**
 * Add steps to draw the right side of an output connection.
 * @param {!Blockly.blockRendering.Row} row The row to draw the
 *     side of.
 * @protected
 */
Blockly.zelos.Drawer.prototype.drawRightConnection_ = function(row) {
  // We only want to draw this once, so determine if this is the first row.
  var index = this.info_.rows.indexOf(row);
  if (index === 1) {
    var height = this.info_.outputConnection.height;
    var pathRightDown = this.info_.outputConnection.shape.pathRightDown(height);
    this.outlinePath_ += pathRightDown;
  }
};

/**
 * @override
 */
Blockly.zelos.Drawer.prototype.drawInlineInput_ = function(input) {
  // Don't draw an inline input.
  this.positionInlineInputConnection_(input);
};

/**
 * @override
 */
Blockly.zelos.Drawer.prototype.positionInlineInputConnection_ = function(input) {
  var yPos = input.centerline - input.height / 2;
  // Move the connection.
  if (input.connection) {
    // xPos already contains info about startX
    var connX = input.xPos + input.connectionWidth +
        this.constants_.DARK_PATH_OFFSET;
    if (this.info_.RTL) {
      connX *= -1;
    }
    input.connection.setOffsetInBlock(
        connX, yPos + input.connectionOffsetY +
        this.constants_.DARK_PATH_OFFSET);
  }
};
