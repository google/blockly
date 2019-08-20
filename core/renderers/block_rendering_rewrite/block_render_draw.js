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
'use strict';

goog.provide('Blockly.blockRendering.Drawer');

goog.require('Blockly.blockRendering.constants');
goog.require('Blockly.blockRendering.Debug');
goog.require('Blockly.blockRendering.RenderInfo');
goog.require('Blockly.blockRendering.Highlighter');
goog.require('Blockly.blockRendering.Measurable');
goog.require('Blockly.blockRendering.BottomRow');
goog.require('Blockly.blockRendering.InputRow');
goog.require('Blockly.blockRendering.Row');
goog.require('Blockly.blockRendering.SpacerRow');
goog.require('Blockly.blockRendering.TopRow');


/**
 * An object that draws a block based on the given rendering information.
 * @param {!Blockly.BlockSvg} block The block to render.
 * @param {!Blockly.blockRendering.RenderInfo} info An object containing all
 *   information needed to render this block.
 * @package
 * @constructor
 */
Blockly.blockRendering.Drawer = function(block, info) {
  this.block_ = block;
  this.info_ = info;
  this.topLeft_ = block.getRelativeToSurfaceXY();
  this.outlinePath_ = '';
  this.inlinePath_ = '';
  this.pathObject_ = new Blockly.BlockSvg.PathObject();
  this.highlighter_ =
      new Blockly.blockRendering.Highlighter(this.info_, this.pathObject_);
};

/**
 * Draw the block to the workspace. Here "drawing" means setting SVG path
 * elements and moving fields, icons, and connections on the screen.
 *
 * The pieces of the paths are pushed into arrays of "steps", which are then
 * joined with spaces and set directly on the block.  This guarantees that
 * the steps are separated by spaces for improved readability, but isn't
 * required.
 * @private
 */
Blockly.blockRendering.Drawer.prototype.draw_ = function() {
  this.hideHiddenIcons_();
  this.drawOutline_();
  this.drawInternals_();

  this.pathObject_.steps = [this.outlinePath_];
  this.pathObject_.inlineSteps = [this.inlinePath_];

  this.block_.setPaths_(this.pathObject_);
  // Uncomment to enable debug rendering.
  // this.block_.renderingDebugger.drawDebug(this.block_, this.info_);
  this.recordSizeOnBlock_();
};

/**
 * Save sizing information back to the block
 * Most of the rendering information can be thrown away at the end of the render.
 * Anything that needs to be kept around should be set in this function.
 * @private
 */
Blockly.blockRendering.Drawer.prototype.recordSizeOnBlock_ = function() {
  // This is used when the block is reporting its size to anyone else.
  // The dark path adds to the size of the block in both X and Y.
  this.block_.height = this.info_.height +
      Blockly.blockRendering.constants.DARK_PATH_OFFSET;
  this.block_.width = this.info_.widthWithChildren +
      Blockly.blockRendering.constants.DARK_PATH_OFFSET;
};

/**
 * Hide icons that were marked as hidden.
 * @private
 */
Blockly.blockRendering.Drawer.prototype.hideHiddenIcons_ = function() {
  for (var i = 0, iconInfo; iconInfo = this.info_.hiddenIcons[i]; i++) {
    iconInfo.icon.iconGroup_.setAttribute('display', 'none');
  }
};

/**
 * Create the outline of the block.  This is a single continuous path.
 * @private
 */
Blockly.blockRendering.Drawer.prototype.drawOutline_ = function() {
  this.drawTop_();
  for (var r = 1; r < this.info_.rows.length - 1; r++) {
    var row = this.info_.rows[r];
    if (row.hasJaggedEdge) {
      this.drawJaggedEdge_(row);
    } else if (row.hasStatement) {
      this.drawStatementInput_(row);
    } else if (row.hasExternalInput) {
      this.drawValueInput_(row);
    } else {
      this.drawRightSideRow_(row);
    }
  }
  this.drawBottom_();
  this.drawLeft_();
};


/**
 * Add steps for the top corner of the block, taking into account
 * details such as hats and rounded corners.
 * @private
 */
Blockly.blockRendering.Drawer.prototype.drawTop_ = function() {
  var topRow = this.info_.topRow;
  var elements = topRow.elements;

  if (this.highlighter_) {
    this.highlighter_.drawTopCorner(topRow);
    this.highlighter_.drawRightSideRow(topRow);
  }
  this.positionPreviousConnection_();
  this.outlinePath_ +=
      Blockly.utils.svgPaths.moveBy(topRow.xPos, this.info_.startY);
  for (var i = 0, elem; elem = elements[i]; i++) {
    if (elem.type == 'round corner') {
      this.outlinePath_ +=
          Blockly.blockRendering.constants.OUTSIDE_CORNERS.topLeft;
    } else if (elem.type == 'previous connection') {
      this.outlinePath_ += topRow.notchShape.pathLeft;
    } else if (elem.type == 'hat') {
      this.outlinePath_ += Blockly.blockRendering.constants.START_HAT.path;
    } else if (elem.isSpacer()) {
      this.outlinePath_ += Blockly.utils.svgPaths.lineOnAxis('h', elem.width);
    }
    // No branch for a 'square corner', because it's a no-op.
  }
  this.outlinePath_ += Blockly.utils.svgPaths.lineOnAxis('v', topRow.height);
};

/**
 * Add steps for the jagged edge of a row on a collapsed block.
 * @param {!Blockly.blockRendering.Row} row The row to draw the side of.
 * @private
 */
Blockly.blockRendering.Drawer.prototype.drawJaggedEdge_ = function(row) {
  if (this.highlighter_) {
    this.highlighter_.drawJaggedEdge_(row);
  }
  var remainder =
      row.height - Blockly.blockRendering.constants.JAGGED_TEETH.height;
  this.outlinePath_ += Blockly.blockRendering.constants.JAGGED_TEETH.path +
      Blockly.utils.svgPaths.lineOnAxis('v', remainder);
};

/**
 * Add steps for an external value input, rendered as a notch in the side
 * of the block.
 * @param {!Blockly.blockRendering.Row} row The row that this input
 *     belongs to.
 * @private
 */
Blockly.blockRendering.Drawer.prototype.drawValueInput_ = function(row) {
  var input = row.getLastInput();
  if (this.highlighter_) {
    this.highlighter_.drawValueInput(row);
  }
  this.positionExternalValueConnection_(row);

  this.outlinePath_ +=
      Blockly.utils.svgPaths.lineOnAxis('H', input.xPos + input.width) +
      input.connectionShape.pathDown +
      Blockly.utils.svgPaths.lineOnAxis('v', row.height - input.connectionHeight);
};


/**
 * Add steps for a statement input.
 * @param {!Blockly.blockRendering.Row} row The row that this input
 *     belongs to.
 * @private
 */
Blockly.blockRendering.Drawer.prototype.drawStatementInput_ = function(row) {
  if (this.highlighter_) {
    this.highlighter_.drawStatementInput(row);
  }
  var input = row.getLastInput();
  // Where to start drawing the notch, which is on the right side in LTR.
  var x = input.xPos + input.width;

  var innerTopLeftCorner =
      input.notchShape.pathRight +
      Blockly.utils.svgPaths.lineOnAxis('h',
          -(Blockly.blockRendering.constants.NOTCH_OFFSET_LEFT -
              Blockly.blockRendering.constants.INSIDE_CORNERS.width)) +
      Blockly.blockRendering.constants.INSIDE_CORNERS.pathTop;

  var innerHeight =
      row.height - (2 * Blockly.blockRendering.constants.INSIDE_CORNERS.height);

  this.outlinePath_ += Blockly.utils.svgPaths.lineOnAxis('H', x) +
      innerTopLeftCorner +
      Blockly.utils.svgPaths.lineOnAxis('v', innerHeight) +
      Blockly.blockRendering.constants.INSIDE_CORNERS.pathBottom;

  this.positionStatementInputConnection_(row);
};

/**
 * Add steps for the right side of a row that does not have value or
 * statement input connections.
 * @param {!Blockly.blockRendering.Row} row The row to draw the
 *     side of.
 * @private
 */
Blockly.blockRendering.Drawer.prototype.drawRightSideRow_ = function(row) {
  if (this.highlighter_) {
    this.highlighter_.drawRightSideRow(row);
  }
  this.outlinePath_ +=
      Blockly.utils.svgPaths.lineOnAxis('H', row.xPos + row.width) +
      Blockly.utils.svgPaths.lineOnAxis('V', row.yPos + row.height);
};


/**
 * Add steps for the bottom edge of a block, possibly including a notch
 * for the next connection
 * @private
 */
Blockly.blockRendering.Drawer.prototype.drawBottom_ = function() {
  var bottomRow = this.info_.bottomRow;
  var elems = bottomRow.elements;
  if (this.highlighter_) {
    this.highlighter_.drawBottomRow(bottomRow);
  }
  this.positionNextConnection_();

  this.outlinePath_ +=
    Blockly.utils.svgPaths.lineOnAxis('v', bottomRow.height - bottomRow.overhangY);

  for (var i = elems.length - 1; i >= 0; i--) {
    var elem = elems[i];
    if (elem.isNextConnection()) {
      this.outlinePath_ += bottomRow.notchShape.pathRight;
    } else if (elem.isSquareCorner()) {
      this.outlinePath_ += Blockly.utils.svgPaths.lineOnAxis('H', bottomRow.xPos);
    } else if (elem.isRoundedCorner()) {
      this.outlinePath_ += Blockly.blockRendering.constants.OUTSIDE_CORNERS.bottomLeft;
    } else if (elem.isSpacer()) {
      this.outlinePath_ += Blockly.utils.svgPaths.lineOnAxis('h', elem.width * -1);
    }
  }
};

/**
 * Add steps for the left side of the block, which may include an output
 * connection
 * @private
 */
Blockly.blockRendering.Drawer.prototype.drawLeft_ = function() {
  if (this.highlighter_) {
    this.highlighter_.drawLeft();
  }

  var outputConnection = this.info_.outputConnection;
  this.positionOutputConnection_();

  if (outputConnection) {
    var tabBottom = outputConnection.connectionOffsetY +
        outputConnection.height;
    // Draw a line up to the bottom of the tab.
    this.outlinePath_ +=
        Blockly.utils.svgPaths.lineOnAxis('V', tabBottom) +
        outputConnection.connectionShape.pathUp;
  }
  // Close off the path.  This draws a vertical line up to the start of the
  // block's path, which may be either a rounded or a sharp corner.
  this.outlinePath_ += 'z';
};

/**
 * Draw the internals of the block: inline inputs, fields, and icons.  These do
 * not depend on the outer path for placement.
 * @private
 */
Blockly.blockRendering.Drawer.prototype.drawInternals_ = function() {
  for (var i = 0, row; row = this.info_.rows[i]; i++) {
    for (var j = 0, elem; elem = row.elements[j]; j++) {
      if (elem.isInlineInput()) {
        this.drawInlineInput_(elem);
      } else if (elem.isIcon() || elem.isField()) {
        this.layoutField_(elem);
      }
    }
  }
};

/**
 * Push a field or icon's new position to its SVG root.
 * @param {!Blockly.blockRendering.Icon|!Blockly.blockRendering.Field} fieldInfo
 *     The rendering information for the field or icon.
 * @private
 */
Blockly.blockRendering.Drawer.prototype.layoutField_ = function(fieldInfo) {
  if (fieldInfo.isField()) {
    var svgGroup = fieldInfo.field.getSvgRoot();
  } else if (fieldInfo.isIcon()) {
    var svgGroup = fieldInfo.icon.iconGroup_;
  }

  var yPos = fieldInfo.centerline - fieldInfo.height / 2;
  var xPos = fieldInfo.xPos;
  var scale = '';
  if (this.info_.RTL) {
    xPos = -(xPos + fieldInfo.width);
    if (fieldInfo.flipRtl) {
      xPos += fieldInfo.width;
      scale = 'scale(-1 1)';
    }
  }
  if (fieldInfo.isIcon()) {
    svgGroup.setAttribute('display', 'block');
    svgGroup.setAttribute('transform', 'translate(' + xPos + ',' + yPos + ')');
    fieldInfo.icon.computeIconLocation();
  } else {
    svgGroup.setAttribute(
        'transform', 'translate(' + xPos + ',' + yPos + ')' + scale);
  }

  if (this.info_.isInsertionMarker) {
    // Fields and icons are invisible on insertion marker.  They still have to
    // be rendered so that the block can be sized correctly.
    svgGroup.setAttribute('display', 'none');
  }
};

/**
 * Add steps for an inline input.
 * @param {Blockly.blockRendering.InlineInput} input The information about the
 * input to render.
 * @private
 */
Blockly.blockRendering.Drawer.prototype.drawInlineInput_ = function(input) {
  if (this.highlighter_) {
    this.highlighter_.drawInlineInput(input);
  }
  var width = input.width;
  var height = input.height;
  var yPos = input.centerline - height / 2;

  var connectionTop = input.connectionOffsetY;
  var connectionBottom = input.connectionHeight + connectionTop;
  var connectionRight = input.xPos + input.connectionWidth;

  this.inlinePath_ += Blockly.utils.svgPaths.moveTo(connectionRight, yPos) +
      Blockly.utils.svgPaths.lineOnAxis('v', connectionTop) +
      input.connectionShape.pathDown +
      Blockly.utils.svgPaths.lineOnAxis('v', height - connectionBottom) +
      Blockly.utils.svgPaths.lineOnAxis('h', width - input.connectionWidth) +
      Blockly.utils.svgPaths.lineOnAxis('v', -height) +
      'z';

  this.positionInlineInputConnection_(input);
};

/**
 * Position the connection on an inline value input, taking into account
 * RTL and the small gap between the parent block and child block which lets the
 * parent block's dark path show through.
 * @param {Blockly.blockRendering.InlineInput} input The information about
 * the input that the connection is on.
 * @private
 */
Blockly.blockRendering.Drawer.prototype.positionInlineInputConnection_ = function(input) {
  var yPos = input.centerline - input.height / 2;
  // Move the connection.
  if (input.connection) {
    // xPos already contains info about startX
    var connX = input.xPos + input.connectionWidth +
        Blockly.blockRendering.constants.DARK_PATH_OFFSET;
    if (this.info_.RTL) {
      connX *= -1;
    }
    input.connection.setOffsetInBlock(
        connX, yPos + input.connectionOffsetY +
        Blockly.blockRendering.constants.DARK_PATH_OFFSET);
  }
};

/**
 * Position the connection on a statement input, taking into account
 * RTL and the small gap between the parent block and child block which lets the
 * parent block's dark path show through.
 * @param {!Blockly.blockRendering.Row} row The row that the connection is on.
 * @private
 */
Blockly.blockRendering.Drawer.prototype.positionStatementInputConnection_ = function(row) {
  var input = row.getLastInput();
  if (input.connection) {
    var connX = row.xPos + row.statementEdge +
        Blockly.blockRendering.constants.NOTCH_OFFSET_LEFT;
    if (this.info_.RTL) {
      connX *= -1;
    }
    connX += 0.5;
    input.connection.setOffsetInBlock(connX,
        row.yPos + Blockly.blockRendering.constants.DARK_PATH_OFFSET);
  }
};

/**
 * Position the connection on an external value input, taking into account
 * RTL and the small gap between the parent block and child block which lets the
 * parent block's dark path show through.
 * @param {!Blockly.blockRendering.Row} row The row that the connection is on.
 * @private
 */
Blockly.blockRendering.Drawer.prototype.positionExternalValueConnection_ = function(row) {
  var input = row.getLastInput();
  if (input.connection) {
    var connX = row.xPos + row.width +
        Blockly.blockRendering.constants.DARK_PATH_OFFSET;
    if (this.info_.RTL) {
      connX *= -1;
    }
    input.connection.setOffsetInBlock(connX, row.yPos);
  }
};

/**
 * Position the previous connection on a block.
 * @private
 */
Blockly.blockRendering.Drawer.prototype.positionPreviousConnection_ = function() {
  var topRow = this.info_.topRow;
  if (topRow.connection) {
    var x = topRow.xPos + Blockly.blockRendering.constants.NOTCH_OFFSET_LEFT;
    var connX = (this.info_.RTL ? -x : x);
    topRow.connection.connectionModel.setOffsetInBlock(connX, 0);
  }
};

/**
 * Position the next connection on a block.
 * @private
 */
Blockly.blockRendering.Drawer.prototype.positionNextConnection_ = function() {
  var bottomRow = this.info_.bottomRow;

  if (bottomRow.connection) {
    var connInfo = bottomRow.connection;
    var x = connInfo.xPos; // Already contains info about startX
    var connX = (this.info_.RTL ? -x : x) + 0.5;
    connInfo.connectionModel.setOffsetInBlock(
        connX, (connInfo.centerline - connInfo.height / 2) +
            Blockly.blockRendering.constants.DARK_PATH_OFFSET);
  }
};

/**
 * Position the output connection on a block.
 * @private
 */
Blockly.blockRendering.Drawer.prototype.positionOutputConnection_ = function() {
  if (this.info_.outputConnection) {
    var x = this.info_.startX;
    var connX = this.info_.RTL ? -x : x;
    this.block_.outputConnection.setOffsetInBlock(connX,
        this.info_.outputConnection.connectionOffsetY);
  }
};
