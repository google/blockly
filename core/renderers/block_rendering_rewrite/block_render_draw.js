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
goog.provide('Blockly.blockRendering.Drawer');

goog.require('Blockly.blockRendering.Debug');
goog.require('Blockly.blockRendering.RenderInfo');
goog.require('Blockly.blockRendering.Highlighter');
goog.require('BRC');
/* global BRC */
goog.require('Blockly.blockRendering.Measurable');

/**
 * Render the given block.
 * @param {!Blockly.BlockSvg} block The block to render
 * @public
 */
Blockly.blockRendering.render = function(block) {
  if (!block.renderingDebugger) {
    block.renderingDebugger = new Blockly.blockRendering.Debug();
  }
  new Blockly.blockRendering.Drawer(block).draw_();
};

/**
 * An object that draws a block based on the given rendering information.
 * @param {!Blockly.BlockSvg} block The block to render
 * @param {!Blockly.blockRendering.RenderInfo} info An object containing all
 *   information needed to render this block.
 * @private
 */
Blockly.blockRendering.Drawer = function(block) {
  this.block_ = block;
  this.topLeft_ = block.getRelativeToSurfaceXY();
  this.info_ = new Blockly.blockRendering.RenderInfo(block);
  this.pathObject_ = new Blockly.BlockSvg.PathObject();
  this.steps_ = this.pathObject_.steps;
  this.inlineSteps_ = this.pathObject_.inlineSteps;
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
  this.block_.height = this.info_.height + BRC.DARK_PATH_OFFSET;
  this.block_.width = this.info_.widthWithChildren + BRC.DARK_PATH_OFFSET;
  // The flyout uses this information.
  this.block_.startHat_ = this.info_.topRow.startHat;
};

/**
 * Create the outline of the block.  This is a single continuous path.
 * @private
 */
Blockly.blockRendering.Drawer.prototype.drawOutline_ = function() {
  this.drawTop_();
  for (var r = 1; r < this.info_.rows.length - 1; r++) {
    var row = this.info_.rows[r];
    if (row.hasStatement) {
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

  this.highlighter_.drawTopCorner(topRow);
  this.highlighter_.drawRightSideRow(topRow);
  this.positionPreviousConnection_();

  for (var i = 0, elem; elem = elements[i]; i++) {
    if (elem.type === 'square corner') {
      this.steps_.push(BRC.START_POINT);
    } else if (elem.type === 'round corner') {
      this.steps_.push(BRC.TOP_LEFT_CORNER_START, BRC.TOP_LEFT_CORNER);
    } else if (elem.type === 'previous connection') {
      this.steps_.push(BRC.NOTCH_PATH_LEFT);
    } else if (elem.type === 'hat') {
      this.steps_.push(BRC.START_HAT_PATH);
    } else if (elem.isSpacer()) {
      this.steps_.push('h', elem.width);
    }
  }
  this.steps_.push('v', topRow.height);
};


/**
 * Add steps for an external value input, rendered as a notch in the side
 * of the block.
 * @param {!Blockly.blockRendering.Row} row The row that this input
 *     belongs to.
 * @private
 */
Blockly.blockRendering.Drawer.prototype.drawValueInput_ = function(row) {
  this.highlighter_.drawValueInput(row);
  this.steps_.push('H', row.width);
  this.steps_.push(BRC.TAB_PATH_DOWN);
  this.steps_.push('v', row.height - BRC.TAB_HEIGHT);
  this.positionExternalValueConnection_(row);
};


/**
 * Add steps for a statement input.
 * @param {!Blockly.blockRendering.Row} row The row that this input
 *     belongs to.
 * @private
 */
Blockly.blockRendering.Drawer.prototype.drawStatementInput_ = function(row) {
  this.highlighter_.drawStatementInput(row);
  var x = row.statementEdge + BRC.NOTCH_OFFSET_RIGHT;
  this.steps_.push('H', x);
  this.steps_.push(BRC.INNER_TOP_LEFT_CORNER);
  this.steps_.push('v', row.height - 2 * BRC.CORNER_RADIUS);
  this.steps_.push(BRC.INNER_BOTTOM_LEFT_CORNER);

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
  this.highlighter_.drawRightSideRow(row);
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
  this.highlighter_.drawBottomCorner(bottomRow);
  this.positionNextConnection_();
  this.steps_.push('v', bottomRow.height);
  for (var i = elems.length - 1; i >= 0; i--) {
    var elem = elems[i];
    if (elem.type === 'next connection') {
      this.steps_.push(BRC.NOTCH_PATH_RIGHT);
    } else if (elem.type === 'square corner') {
      this.steps_.push('H 0');
    } else if (elem.type === 'round corner') {
      this.steps_.push(BRC.BOTTOM_LEFT_CORNER);
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
  this.highlighter_.drawLeft();

  this.positionOutputConnection_();
  if (this.info_.hasOutputConnection) {
    // Draw a line up to the bottom of the tab.
    this.steps_.push('V', BRC.TAB_OFFSET_FROM_TOP + BRC.TAB_HEIGHT);
    this.steps_.push(BRC.TAB_PATH_UP);
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
 * Some fields are terrible and render offset from where they claim to be
 * rendered.  This function calculates an x offset for fields that need it.
 * No one is happy about this.
 * @param {!Blockly.Field} field The field to find an offset for.
 * @return {number} How far to offset the field in the x direction.
 * @private
 */
Blockly.blockRendering.Drawer.prototype.dealWithOffsetFields_ = function(field) {
  if (field instanceof Blockly.FieldDropdown
      || field instanceof Blockly.FieldTextInput
      || field instanceof Blockly.FieldColour
      || field instanceof Blockly.FieldCheckbox) {
    return 5;
  }
  return 0;
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
  if (this.info_.RTL) {
    xPos = -(xPos + fieldInfo.width);
  }
  if (fieldInfo.type == 'icon') {
    svgGroup.setAttribute('display', 'block');
    svgGroup.setAttribute('transform', 'translate(' + xPos + ',' + yPos + ')');
    fieldInfo.icon.computeIconLocation();
  } else {
    xPos += this.dealWithOffsetFields_(fieldInfo.field);

    svgGroup.setAttribute('transform', 'translate(' + xPos + ',' + yPos + ')');
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
  this.highlighter_.drawInlineInput(input);
  var width = input.width;
  var height = input.height;
  var yPos = input.centerline - height / 2;

  this.inlineSteps_.push('M', (input.xPos + BRC.TAB_WIDTH) + ',' + yPos);
  this.inlineSteps_.push('v ', BRC.TAB_OFFSET_FROM_TOP);
  this.inlineSteps_.push(BRC.TAB_PATH_DOWN);
  this.inlineSteps_.push('v', height - BRC.TAB_HEIGHT - BRC.TAB_OFFSET_FROM_TOP);
  this.inlineSteps_.push('h', width - BRC.TAB_WIDTH);
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
    var connX = input.xPos + BRC.TAB_WIDTH + BRC.DARK_PATH_OFFSET;
    if (this.info_.RTL) {
      connX *= -1;
    }
    input.connection.setOffsetInBlock(
        connX, yPos + BRC.TAB_OFFSET_FROM_TOP + BRC.DARK_PATH_OFFSET);
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
    var connX = row.statementEdge + BRC.NOTCH_OFFSET_LEFT + BRC.DARK_PATH_OFFSET;
    if (this.info_.RTL) {
      connX *= -1;
    }
    input.connection.setOffsetInBlock(connX, row.yPos + BRC.DARK_PATH_OFFSET);
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
    var connX = row.width + BRC.DARK_PATH_OFFSET;
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
    var connX = this.info_.RTL ? -BRC.NOTCH_OFFSET_LEFT : BRC.NOTCH_OFFSET_LEFT;
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
    var connX = this.info_.RTL ? -BRC.NOTCH_OFFSET_LEFT : BRC.NOTCH_OFFSET_LEFT;
    bottomRow.connection.setOffsetInBlock(
        connX, this.info_.height + BRC.DARK_PATH_OFFSET);
  }
};

/**
 * Position the output connection on a block.
 * @param {!Blockly.blockRendering.BottomRow} row The bottom row on the block.
 * @private
 */
Blockly.blockRendering.Drawer.prototype.positionOutputConnection_ = function() {
  if (this.info_.hasOutputConnection) {
    this.block_.outputConnection.setOffsetInBlock(0, BRC.TAB_OFFSET_FROM_TOP);
  }
};
