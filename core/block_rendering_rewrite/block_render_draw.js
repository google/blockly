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

Blockly.BlockRendering.Draw = function(block, info) {
  this.block_ = block;
  this.info_ = info;
  this.pathObject_ = new Blockly.BlockSvg.PathObject();
  this.steps_ = this.pathObject_.steps;
  this.inlineSteps_ = this.pathObject_.inlineSteps;
  this.highlighter_ =
      new Blockly.BlockRendering.Highlighter(info, this.pathObject_);
};

Blockly.BlockRendering.Draw.prototype.renderDraw = function() {
  //Blockly.BlockRendering.Debug.drawDebug(this.block_, this.info_, this.pathObject_);
  this.drawOutline();
  this.drawInternals();
  this.block_.setPaths_(this.pathObject_);
};

Blockly.BlockRendering.Draw.prototype.drawOutline = function() {
  this.drawTopCorner();
  var cursorY = 0;
  for (var r = 0; r < this.info_.rows.length; r++) {
    var row = this.info_.rows[r];
    if (row.hasStatement) {
      this.drawStatementInput(row, cursorY);
    } else if (row.hasExternalInput) {
      this.drawValueInput(row, cursorY);
    } else {
      this.drawRightSideRow(row);
    }
    cursorY += row.height;
  }
  this.drawBottom();
  this.drawBottomCorner();
  this.drawLeft(cursorY);
};

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

Blockly.BlockRendering.Draw.prototype.drawValueInput = function(row, cursorY) {
  this.highlighter_.drawValueInput(row, cursorY);
  this.steps_.push('H', row.width);
  this.steps_.push(BRC.TAB_PATH_DOWN);
  this.steps_.push('v', row.height - BRC.TAB_HEIGHT);
};

Blockly.BlockRendering.Draw.prototype.drawStatementInput = function(row, cursorY) {
  this.highlighter_.drawStatementInput(row, cursorY);
  var x = row.statementEdge + BRC.NOTCH_OFFSET;
  this.steps_.push('H', x);
  this.steps_.push(BRC.INNER_TOP_LEFT_CORNER);
  this.steps_.push('v', row.height - 2 * BRC.CORNER_RADIUS);
  this.steps_.push(BRC.INNER_BOTTOM_LEFT_CORNER);
  this.steps_.push('H', this.info_.maxValueOrDummyWidth);
};

Blockly.BlockRendering.Draw.prototype.drawRightSideRow = function(row) {
  this.highlighter_.drawRightSideRow(row);
  this.steps_.push('H', row.width);
  this.steps_.push('v', row.height);
};

Blockly.BlockRendering.Draw.prototype.drawBottom = function() {
  if (this.block_.nextConnection) {
    this.steps_.push('H', (BRC.NOTCH_OFFSET + (this.info_.RTL ? 0.5 : - 0.5)) +
        ' ' + BRC.NOTCH_PATH_RIGHT);
  }
  this.steps_.push('H', BRC.CORNER_RADIUS);
};

Blockly.BlockRendering.Draw.prototype.drawBottomCorner = function() {
  this.highlighter_.drawBottomCorner();
  if (this.info_.squareBottomLeftCorner) {
    this.steps_.push('H 0');
  } else {
    this.steps_.push(BRC.BOTTOM_LEFT_CORNER);
  }
};

Blockly.BlockRendering.Draw.prototype.drawLeft = function(cursorY) {
  this.highlighter_.drawLeft();

  if (this.info_.hasOutputConnection) {
    // Draw a line up to the bottom of the tab.
    this.steps_.push('v', -(cursorY - BRC.TAB_HEIGHT - BRC.TAB_OFFSET_FROM_TOP));
    this.steps_.push(BRC.TAB_PATH_UP);
  }
  // Close off the path.  This draws a vertical line up to the start of the
  // block's path, which may be either a rounded or a sharp corner.
  this.steps_.push('z');
};

Blockly.BlockRendering.Draw.prototype.drawInternals = function() {
  var cursorY = 0;
  for (var r = 0; r < this.info_.rows.length; r++) {
    var row = this.info_.rows[r];
    var cursorX = 0;
    var centerline = cursorY + row.height / 2;
    if (!(row instanceof Blockly.BlockRendering.Measurables.RowSpacer)) {
      for (var e = 0; e < row.elements.length; e++) {
        var elem = row.elements[e];
        if (elem instanceof Blockly.BlockRendering.Measurables.InlineInputElement) {
          this.drawInlineInput(cursorX, cursorY, elem, centerline);
        } else if (elem instanceof Blockly.BlockRendering.Measurables.IconElement || elem instanceof Blockly.BlockRendering.Measurables.FieldElement) {
          this.layoutField(elem, cursorX, centerline);
        }
        cursorX += elem.width;
      }
    }
    cursorY += row.height;
  }
};

Blockly.BlockRendering.Draw.prototype.dealWithJackassFields = function(field) {
  if (field instanceof Blockly.FieldDropdown
      || field instanceof Blockly.FieldTextInput) {
    return 5;
  }
  return 0;
};

Blockly.BlockRendering.Draw.prototype.layoutField = function(fieldInfo, cursorX, centerline) {
  var yPos = centerline - fieldInfo.height / 2;
  if (this.info_.RTL) {
    cursorX = -(cursorX + fieldInfo.width);
  }
  if (fieldInfo.type == 'icon') {
    var icon = fieldInfo.icon;
    icon.iconGroup_.setAttribute('display', 'block');
    icon.iconGroup_.setAttribute('transform', 'translate(' + cursorX + ',' +
        yPos + ')');
    icon.computeIconLocation();
  } else {
    cursorX += this.dealWithJackassFields(fieldInfo.field);

    fieldInfo.field.getSvgRoot().setAttribute('transform',
        'translate(' + cursorX + ',' + yPos + ')');
  }
};

Blockly.BlockRendering.Draw.prototype.drawInlineInput = function(x, y, input, centerline) {
  this.highlighter_.drawInlineInput(x, y, input, centerline);
  var width = input.width;
  var height = input.height;
  var yPos = centerline - height / 2;

  this.inlineSteps_.push('M', (x + BRC.TAB_WIDTH) + ',' + yPos);
  this.inlineSteps_.push('v ', BRC.TAB_OFFSET_FROM_TOP);
  this.inlineSteps_.push(BRC.TAB_PATH_DOWN);
  this.inlineSteps_.push('v', height - BRC.TAB_HEIGHT - BRC.TAB_OFFSET_FROM_TOP);
  this.inlineSteps_.push('h', width - BRC.TAB_WIDTH);
  this.inlineSteps_.push('v', -height);
  this.inlineSteps_.push('z');
};

