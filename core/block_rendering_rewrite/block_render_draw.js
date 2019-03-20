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
goog.provide('Blockly.BlockRendering.Draw');


/**
 * An object that draws a block based on the given rendering information.
 * @param {!Blockly.BlockSvg} block The block to render
 * @param {!Blockly.BlockRendering.Info} info An object containing all
 *   information needed to render this block.
 * @package
 */
Blockly.BlockRendering.Draw = function(block, info) {
  this.block_ = block;
  this.info_ = info;
  this.pathObject_ = new Blockly.BlockSvg.PathObject();
  this.steps_ = this.pathObject_.steps;
  this.inlineSteps_ = this.pathObject_.inlineSteps;
  this.highlighter_ =
      new Blockly.BlockRendering.Highlighter(info, this.pathObject_);
};

/**
 * Draw the block to the workspace.
 * @package
 */
Blockly.BlockRendering.Draw.prototype.renderDraw = function() {
  //Blockly.BlockRendering.Debug.drawDebug(this.block_, this.info_, this.pathObject_);
  this.drawOutline();
  this.drawInternals();
  this.block_.setPaths_(this.pathObject_);
};


/**
 * Create the outline of the block.  This is a single continuous path.
 * @package
 */
Blockly.BlockRendering.Draw.prototype.drawOutline = function() {
  this.drawTopCorner();
  for (var r = 0; r < this.info_.rows.length; r++) {
    var row = this.info_.rows[r];
    if (row.hasStatement) {
      this.drawStatementInput(row);
    } else if (row.hasExternalInput) {
      this.drawValueInput(row);
    } else {
      this.drawRightSideRow(row);
    }
  }
  this.drawBottom();
  this.drawBottomCorner();
  this.drawLeft();
};


/**
 * Create the path for the top corner of the block, taking into account
 * details such as hats and rounded corners.
 * @package
 */
Blockly.BlockRendering.Draw.prototype.drawTopCorner = function() {
  this.highlighter_.drawTopCorner();
  // Position the cursor at the top-left starting point.
  if (this.info_.squareTopLeftCorner) {
    this.steps_.push(BRC.START_POINT);
    if (this.info_.startHat) {
      this.steps_.push(BRC.START_HAT_PATH);
    }
  } else {
    this.steps_.push(BRC.TOP_LEFT_CORNER_START, BRC.TOP_LEFT_CORNER);
  }

  // Top edge.
  if (this.block_.previousConnection) {
    this.steps_.push('H', BRC.NOTCH_WIDTH, BRC.NOTCH_PATH_LEFT);
  }
  this.steps_.push('H', this.info_.maxValueOrDummyWidth);
};


/**
 * Create the path for an external value input, rendered as a notch in the side
 * of the block.
 * @param {!Blockly.BlockRendering.Row} row The row that this input
 *     belongs to.
 * @package
 */
Blockly.BlockRendering.Draw.prototype.drawValueInput = function(row) {
  this.highlighter_.drawValueInput(row);
  this.steps_.push('H', row.width);
  this.steps_.push(BRC.TAB_PATH_DOWN);
  this.steps_.push('v', row.height - BRC.TAB_HEIGHT);
};

/**
 * Create the path for a statement input.
 * @param {!Blockly.BlockRendering.Row} row The row that this input
 *     belongs to.
 * @package
 */
Blockly.BlockRendering.Draw.prototype.drawStatementInput = function(row) {
  this.highlighter_.drawStatementInput(row);
  var x = row.statementEdge + BRC.NOTCH_OFFSET;
  this.steps_.push('H', x);
  this.steps_.push(BRC.INNER_TOP_LEFT_CORNER);
  this.steps_.push('v', row.height - 2 * BRC.CORNER_RADIUS);
  this.steps_.push(BRC.INNER_BOTTOM_LEFT_CORNER);
  this.steps_.push('H', this.info_.maxValueOrDummyWidth);
};

/**
 * Create the path for the right side of a row that does not have value or
 * statement input connections.
 * @param {!Blockly.BlockRendering.Row} row The row to draw the
 *     side of.
 * @package
 */
Blockly.BlockRendering.Draw.prototype.drawRightSideRow = function(row) {
  this.highlighter_.drawRightSideRow(row);
  this.steps_.push('H', row.width);
  this.steps_.push('v', row.height);
};


/**
 * Create the path for the bottom edge of a block, possibly including a notch
 * for the next connection
 * @package
 */
Blockly.BlockRendering.Draw.prototype.drawBottom = function() {
  if (this.block_.nextConnection) {
    this.steps_.push('H', (BRC.NOTCH_OFFSET + (this.info_.RTL ? 0.5 : - 0.5)) +
        ' ' + BRC.NOTCH_PATH_RIGHT);
  }
  this.steps_.push('H', BRC.CORNER_RADIUS);
};

/**
 * Create the path for the bottom left corner of the block, which may be rounded
 * or squared off.
 * @package
 */
Blockly.BlockRendering.Draw.prototype.drawBottomCorner = function() {
  this.highlighter_.drawBottomCorner();
  if (this.info_.squareBottomLeftCorner) {
    this.steps_.push('H 0');
  } else {
    this.steps_.push(BRC.BOTTOM_LEFT_CORNER);
  }
};


/**
 * Create the path for the left side of the block, which may include an output
 * connection
 * @package
 */
Blockly.BlockRendering.Draw.prototype.drawLeft = function() {
  this.highlighter_.drawLeft();

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
 * @package
 */
Blockly.BlockRendering.Draw.prototype.drawInternals = function() {
  for (var r = 0; r < this.info_.rows.length; r++) {
    var row = this.info_.rows[r];
    if (!(row.isSpacer)) {
      for (var e = 0; e < row.elements.length; e++) {
        var elem = row.elements[e];
        if (elem instanceof Blockly.BlockRendering.InlineInput) {
          this.drawInlineInput(elem);
        } else if (elem instanceof Blockly.BlockRendering.Icon || elem instanceof Blockly.BlockRendering.Field) {
          this.layoutField(elem);
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
 * @package
 */
Blockly.BlockRendering.Draw.prototype.dealWithJackassFields = function(field) {
  if (field instanceof Blockly.FieldDropdown
      || field instanceof Blockly.FieldTextInput) {
    return 5;
  }
  return 0;
};

/**
 * Push a field or icon's new position to its SVG root.
 * @param {!Blockly.BlockRendering.Icon|!Blockly.BlockRendering.Field} fieldInfo The rendering information for the field or icon.
 * @package
 */
Blockly.BlockRendering.Draw.prototype.layoutField = function(fieldInfo) {
  var yPos = fieldInfo.centerline - fieldInfo.height / 2;
  var xPos = fieldInfo.xPos;
  if (this.info_.RTL) {
    xPos = -(xPos + fieldInfo.width);
  }
  if (fieldInfo.type == 'icon') {
    var icon = fieldInfo.icon;
    icon.iconGroup_.setAttribute('display', 'block');
    icon.iconGroup_.setAttribute('transform', 'translate(' + xPos + ',' +
        yPos + ')');
    icon.computeIconLocation();
  } else {
    xPos += this.dealWithJackassFields(fieldInfo.field);

    fieldInfo.field.getSvgRoot().setAttribute('transform',
        'translate(' + xPos + ',' + yPos + ')');
  }
};

/**
 * Create the path for an inline input.
 * @param {Blockly.BlockRendering.RenderableInput} input The information about the
 * input to render.
 * @package
 */
Blockly.BlockRendering.Draw.prototype.drawInlineInput = function(input) {
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
};

