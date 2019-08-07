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

/**
 * An object that draws a block based on the given rendering information.
 * @param {!Blockly.BlockSvg} block The block to render
 * @param {!Blockly.blockRendering.RenderInfo} info An object containing all
 *   information needed to render this block.
 * @package
 */
Blockly.blockRendering.Drawer = function(block, info) {
  this.block_ = block;
  this.info_ = info;
  this.topLeft_ = block.getRelativeToSurfaceXY();
  this.pathObject_ = new Blockly.BlockSvg.PathObject();
  this.steps_ = this.pathObject_.steps;
  this.inlineSteps_ = this.pathObject_.inlineSteps;
  this.highlighter_ = new Blockly.blockRendering.Highlighter(this.info_, this.pathObject_);
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
  this.block_.setPaths_(this.pathObject_);
  this.block_.renderingDebugger.drawDebug(this.block_, this.info_);
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
  this.block_.height = this.info_.height + Blockly.blockRendering.constants.DARK_PATH_OFFSET;
  this.block_.width = this.info_.widthWithChildren +
      Blockly.blockRendering.constants.DARK_PATH_OFFSET;
  // The flyout uses this information.
  this.block_.startHat_ = this.info_.topRow.startHat;
};

/**
 * Hide icons that were marked as hidden.
 * @private
 */
Blockly.blockRendering.Drawer.prototype.hideHiddenIcons_ = function() {
  for (var i = 0; i < this.info_.hiddenIcons.length; i++) {
    var iconInfo = this.info_.hiddenIcons[i];
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

  for (var i = 0, elem; elem = elements[i]; i++) {
    if (elem.type === 'square corner') {
      this.steps_.push(Blockly.blockRendering.constants.START_POINT);
    } else if (elem.type === 'round corner') {
      this.steps_.push(Blockly.blockRendering.constants.TOP_LEFT_CORNER_START,
          Blockly.blockRendering.constants.OUTSIDE_CORNERS.topLeft);
    } else if (elem.type === 'previous connection') {
      this.steps_.push(Blockly.blockRendering.constants.NOTCH.pathLeft);
    } else if (elem.type === 'hat') {
      this.steps_.push(Blockly.blockRendering.constants.START_HAT.path);
    } else if (elem.isSpacer()) {
      this.steps_.push('h', elem.width);
    }
  }
  this.steps_.push('v', topRow.height);
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
  this.steps_.push(Blockly.blockRendering.constants.JAGGED_TEETH.path);
  var remainder =
      row.height - Blockly.blockRendering.constants.JAGGED_TEETH.height;
  this.steps_.push('v', remainder);
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
  this.steps_.push('H', row.width);
  this.steps_.push(Blockly.blockRendering.constants.PUZZLE_TAB.pathDown);
  this.steps_.push('v', row.height - input.connectionHeight);
  this.positionExternalValueConnection_(row);
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
  // Where to start drawing the notch, which is on the right side in LTR.
  var x = row.statementEdge + Blockly.blockRendering.constants.NOTCH_OFFSET_LEFT +
    Blockly.blockRendering.constants.NOTCH.width;

  this.steps_.push('H', x);

  var innerTopLeftCorner =
      Blockly.blockRendering.constants.NOTCH.pathRight + ' h -' +
      (Blockly.blockRendering.constants.NOTCH_WIDTH -
          Blockly.blockRendering.constants.CORNER_RADIUS) +
      Blockly.blockRendering.constants.INSIDE_CORNERS.pathTop;
  this.steps_.push(innerTopLeftCorner);
  this.steps_.push('v',
      row.height - (2 * Blockly.blockRendering.constants.INSIDE_CORNERS.height));
  this.steps_.push(Blockly.blockRendering.constants.INSIDE_CORNERS.pathBottom);

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
  this.steps_.push('H', row.width);
  this.steps_.push('v', row.height);
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
  this.steps_.push('v', bottomRow.height);
  for (var i = elems.length - 1; i >= 0; i--) {
    var elem = elems[i];
    if (elem.type === 'next connection') {
      this.steps_.push(Blockly.blockRendering.constants.NOTCH.pathRight);
    } else if (elem.type === 'square corner') {
      this.steps_.push('H 0');
    } else if (elem.type === 'round corner') {
      this.steps_.push(Blockly.blockRendering.constants.OUTSIDE_CORNERS.bottomLeft);
    } else if (elem.isSpacer()) {
      this.steps_.push('h', elem.width * -1);
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
    // Draw a line up to the bottom of the tab.
    this.steps_.push('V',
        outputConnection.connectionOffsetY + outputConnection.height);
    this.steps_.push(Blockly.blockRendering.constants.PUZZLE_TAB.pathUp);
  }
  // Close off the path.  This draws a vertical line up to the start of the
  // block's path, which may be either a rounded or a sharp corner.
  this.steps_.push('z');
};

/**
 * Draw the internals of the block: inline inputs, fields, and icons.  These do
 * not depend on the outer path for placement.
 * @private
 */
Blockly.blockRendering.Drawer.prototype.drawInternals_ = function() {
  for (var r = 0; r < this.info_.rows.length; r++) {
    var row = this.info_.rows[r];
    if (!(row.isSpacer())) {
      for (var e = 0; e < row.elements.length; e++) {
        var elem = row.elements[e];
        if (elem.isInlineInput()) {
          this.drawInlineInput_(elem);
        } else if (elem.isIcon() || elem.isField()) {
          this.layoutField_(elem);
        }
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
  if (fieldInfo.type == 'field') {
    var svgGroup = fieldInfo.field.getSvgRoot();
  } else if (fieldInfo.type == 'icon') {
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
  if (fieldInfo.type == 'icon') {
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
 * @param {Blockly.blockRendering.RenderableInput} input The information about the
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


  this.inlineSteps_.push('M', connectionRight + ',' + yPos);
  this.inlineSteps_.push('v ', connectionTop);
  this.inlineSteps_.push(Blockly.blockRendering.constants.PUZZLE_TAB.pathDown);
  this.inlineSteps_.push('v', height - connectionBottom);
  this.inlineSteps_.push('h', width - input.connectionWidth);
  this.inlineSteps_.push('v', -height);
  this.inlineSteps_.push('z');

  this.positionInlineInputConnection_(input);

};

/**
 * Position the connection on an inline value input, taking into account
 * RTL and the small gap between the parent block and child block which lets the
 * parent block's dark path show through.
 * @param {Blockly.blockRendering.RenderableInput} input The information about
 * the input that the connection is on.
 * @private
 */
Blockly.blockRendering.Drawer.prototype.positionInlineInputConnection_ = function(input) {
  var yPos = input.centerline - input.height / 2;
  // Move the connection.
  if (input.connection) {
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
    var connX = row.statementEdge +
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
    var connX = row.width + Blockly.blockRendering.constants.DARK_PATH_OFFSET;
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
  if (this.info_.topRow.hasPreviousConnection) {
    var x = Blockly.blockRendering.constants.NOTCH_OFFSET_LEFT;
    var connX = (this.info_.RTL ? -x : x);
    this.info_.topRow.connection.setOffsetInBlock(connX, 0);
  }
};

/**
 * Position the next connection on a block.
 * @private
 */
Blockly.blockRendering.Drawer.prototype.positionNextConnection_ = function() {
  var bottomRow = this.info_.bottomRow;

  if (bottomRow.hasNextConnection) {
    var connInfo = bottomRow.getNextConnection();
    var x = connInfo.xPos;
    var connX = (this.info_.RTL ? -x : x) + 0.5;
    bottomRow.connection.setOffsetInBlock(
        connX, this.info_.height + Blockly.blockRendering.constants.DARK_PATH_OFFSET);
  }
};

/**
 * Position the output connection on a block.
 * @param {!Blockly.blockRendering.BottomRow} row The bottom row on the block.
 * @private
 */
Blockly.blockRendering.Drawer.prototype.positionOutputConnection_ = function() {
  if (this.info_.outputConnection) {
    this.block_.outputConnection.setOffsetInBlock(0,
        this.info_.outputConnection.connectionOffsetY);
  }
};
