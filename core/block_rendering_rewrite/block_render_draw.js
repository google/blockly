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
renderDraw = function(block, info) {
  var pathObject = new Blockly.BlockSvg.PathObject();
  //drawDebug(block, info, pathObject);
  drawOutline(block, info, pathObject);
  drawInternals(block, info, pathObject);
  block.setPaths_(pathObject);
};

drawOutline = function(block, info, pathObject) {
  var steps = pathObject.steps;
  drawTopCorner(block, info, pathObject);
  var cursorY = 0;
  for (var r = 0; r < info.rows.length; r++) {
    var row = info.rows[r];
    if (row.hasStatement) {
      drawStatementInput(row, pathObject, info, cursorY);
    } else if (row.hasExternalInput) {
      drawValueInput(row, pathObject, info, cursorY);
    } else {
      drawRightSideRow(row, info, pathObject);
    }
    cursorY += row.height;
  }
  drawBottom(block, info, pathObject);
  drawBottomCorner(block, info, pathObject);
  drawLeft(block, info, pathObject, cursorY);
};

drawTopCorner = function(block, info, pathObject) {
  drawTopCornerHighlight(block, info, pathObject);
  var steps = pathObject.steps;
  // Position the cursor at the top-left starting point.
  if (info.squareTopLeftCorner) {
    steps.push(BRC.START_POINT);
    if (info.startHat) {
      steps.push(BRC.START_HAT_PATH);
    }
  } else {
    steps.push(BRC.TOP_LEFT_CORNER_START, BRC.TOP_LEFT_CORNER);
  }

  // Top edge.
  if (block.previousConnection) {
    steps.push('H', BRC.NOTCH_WIDTH, BRC.NOTCH_PATH_LEFT);
  }
  steps.push('H', info.maxValueOrDummyWidth);
};

drawValueInput = function(row, pathObject, info, cursorY) {
  highlightValueInput(row, pathObject, info, cursorY);
  var steps = pathObject.steps;
  steps.push('H', row.width);
  steps.push(BRC.TAB_PATH_DOWN);
  steps.push('v', row.height - BRC.TAB_HEIGHT);
};

drawStatementInput = function(row, pathObject, info, cursorY) {
  drawStatementInputHighlight(row, pathObject, info, cursorY);
  var steps = pathObject.steps;
  var x = row.statementEdge + BRC.NOTCH_OFFSET;
  steps.push('H', x);
  steps.push(BRC.INNER_TOP_LEFT_CORNER);
  steps.push('v', row.height - 2 * BRC.CORNER_RADIUS);
  steps.push(BRC.INNER_BOTTOM_LEFT_CORNER);
  steps.push('H', info.maxValueOrDummyWidth);
};

drawRightSideRow = function(row, info, pathObject) {
  drawRightSideRowHighlight(row, info, pathObject);
  var steps = pathObject.steps;
  steps.push('H', row.width);
  steps.push('v', row.height);
};

drawBottom = function(block, info, pathObject) {
  var steps = pathObject.steps;
  if (block.nextConnection) {
    steps.push('H', (BRC.NOTCH_OFFSET + (block.RTL ? 0.5 : - 0.5)) +
        ' ' + BRC.NOTCH_PATH_RIGHT);
  }
  steps.push('H', BRC.CORNER_RADIUS);
};

drawBottomCorner = function(block, info, pathObject) {
  drawBottomCornerHighlight(block, info, pathObject);
  var steps = pathObject.steps;
  if (info.squareBottomLeftCorner) {
    steps.push('H 0');
  } else {
    steps.push(BRC.BOTTOM_LEFT_CORNER);
  }
};

drawLeft = function(block, info, pathObject, cursorY) {
  drawLeftHighlight(block, info, pathObject);
  var steps = pathObject.steps;

  if (info.hasOutputConnection) {
    // Draw a line up to the bottom of the tab.
    steps.push('v', -(cursorY - BRC.TAB_HEIGHT - BRC.TAB_OFFSET_FROM_TOP));
    steps.push(BRC.TAB_PATH_UP);
  }
  // Close off the path.  This draws a vertical line up to the start of the
  // block's path, which may be either a rounded or a sharp corner.
  steps.push('z');
};



drawInternals = function(block, info, pathObject) {
  var inlineSteps = pathObject.inlineSteps;
  var cursorY = 0;
  for (var r = 0; r < info.rows.length; r++) {
    var row = info.rows[r];
    var cursorX = 0;
    var centerline = cursorY + row.height / 2;
    if (!(row instanceof Blockly.BlockRendering.Measurables.RowSpacer)) {
      for (var e = 0; e < row.elements.length; e++) {
        var elem = row.elements[e];
        if (elem instanceof Blockly.BlockRendering.Measurables.InlineInputElement) {
          drawInlineInput(pathObject, cursorX, cursorY, elem, centerline, info.RTL);
        } else if (elem instanceof Blockly.BlockRendering.Measurables.IconElement || elem instanceof Blockly.BlockRendering.Measurables.FieldElement) {
          layoutField(elem, cursorX, centerline, row.width, block.RTL);
        }
        cursorX += elem.width;
      }
    }
    cursorY += row.height;
  }
};

dealWithJackassFields = function(field) {
  if (field instanceof Blockly.FieldDropdown
      || field instanceof Blockly.FieldTextInput) {
    return 5;
  }
  return 0;
};

layoutField = function(fieldInfo, cursorX, centerline, rowWidth, RTL) {
  var yPos = centerline - fieldInfo.height / 2;
  if (RTL) {
    cursorX = -(cursorX + fieldInfo.width);
  }
  if (fieldInfo.type == 'icon') {
    var icon = fieldInfo.icon;
    icon.iconGroup_.setAttribute('display', 'block');
    icon.iconGroup_.setAttribute('transform', 'translate(' + cursorX + ',' +
        yPos + ')');
    icon.computeIconLocation();
  } else {
    cursorX += dealWithJackassFields(fieldInfo.field);

    fieldInfo.field.getSvgRoot().setAttribute('transform',
        'translate(' + cursorX + ',' + yPos + ')');
  }
};

drawInlineInput = function(pathObject, x, y, input, centerline, isRTL) {
  drawInlineInputHighlight(pathObject, x, y, input, centerline, isRTL);
  var inlineSteps = pathObject.inlineSteps;
  var width = input.width;
  var height = input.height;
  var yPos = centerline - height / 2;

  inlineSteps.push('M', (x + BRC.TAB_WIDTH) + ',' + yPos);
  inlineSteps.push('v ', BRC.TAB_OFFSET_FROM_TOP);
  inlineSteps.push(BRC.TAB_PATH_DOWN);
  inlineSteps.push('v', height - BRC.TAB_HEIGHT - BRC.TAB_OFFSET_FROM_TOP);
  inlineSteps.push('h', width - BRC.TAB_WIDTH);
  inlineSteps.push('v', -height);
  inlineSteps.push('z');
};

