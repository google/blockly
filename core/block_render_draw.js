//goog.require('BlockRenderingConstants');

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
      drawRightSideRow(row, info, pathObject, cursorY);
    }
    cursorY += row.height;
  }
  drawBottom(block, info, pathObject);
  drawBottomCorner(block, info, pathObject);
  drawLeft(block, info, pathObject, cursorY);
};

drawRightSideRow = function(row, info, pathObject, cursorY) {
  var steps = pathObject.steps;
  steps.push('H', row.width);
  steps.push('v', row.height);

  var highlightSteps = pathObject.highlightSteps;
  if (info.RTL) {
    highlightSteps.push('v', row.height);
  }

};

drawTopCornerHighlight = function(block, info, pathObject) {
  var highlightSteps = pathObject.highlightSteps;

  // Position the cursor at the top-left starting point.
  if (info.squareTopLeftCorner) {
    highlightSteps.push(BRC.START_POINT_HIGHLIGHT);
    if (info.startHat) {
      highlightSteps.push(this.RTL ?
          Blockly.BlockSvg.START_HAT_HIGHLIGHT_RTL :
          Blockly.BlockSvg.START_HAT_HIGHLIGHT_LTR);
    }
  } else {
    highlightSteps.push(this.RTL ?
        Blockly.BlockSvg.TOP_LEFT_CORNER_START_HIGHLIGHT_RTL :
        Blockly.BlockSvg.TOP_LEFT_CORNER_START_HIGHLIGHT_LTR);
    highlightSteps.push(Blockly.BlockSvg.TOP_LEFT_CORNER_HIGHLIGHT);
  }

  // Top edge.
  if (block.previousConnection) {
    highlightSteps.push('H', BRC.NOTCH_WIDTH, BRC.NOTCH_PATH_LEFT_HIGHLIGHT);
  }
  highlightSteps.push('H', info.maxValueOrDummyWidth - BRC.HIGHLIGHT_OFFSET);
};

drawTopCorner = function(block, info, pathObject) {
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

  drawTopCornerHighlight(block, info, pathObject);
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
  var highlightSteps = pathObject.highlightSteps;
  var steps = pathObject.steps;
  // Should the bottom-left corner be rounded or square?
  if (info.squareBottomLeftCorner) {
    steps.push('H 0');
    if (!block.RTL) {
      highlightSteps.push('M',
          BRC.HIGHLIGHT_OFFSET + ',' + (info.height - BRC.HIGHLIGHT_OFFSET));
    }
  } else {
    steps.push(BRC.BOTTOM_LEFT_CORNER);
    if (!block.RTL) {
      highlightSteps.push(BRC.BOTTOM_LEFT_CORNER_HIGHLIGHT_START +
          (info.height - Blockly.BlockSvg.DISTANCE_45_INSIDE) +
          BRC.BOTTOM_LEFT_CORNER_HIGHLIGHT_MID +
          (info.height - Blockly.BlockSvg.CORNER_RADIUS));
    }
  }
};

drawLeftHighlight = function(block, info, pathObject) {
  var highlightSteps = pathObject.highlightSteps;

  if (info.hasOutputConnection) {
    if (block.RTL) {
      highlightSteps.push(BRC.OUTPUT_CONNECTION_HIGHLIGHT_RTL);
    } else {
      highlightSteps.push(BRC.OUTPUT_CONNECTION_HIGHLIGHT_LTR);
    }
  }

  if (!block.RTL) {
    if (info.squareTopLeftCorner) {
      highlightSteps.push('V', BRC.HIGHLIGHT_OFFSET);
    } else {
      highlightSteps.push('V', BRC.CORNER_RADIUS);
    }
  }
};

drawLeft = function(block, info, pathObject, cursorY) {
  var steps = pathObject.steps;

  if (info.hasOutputConnection) {
    // Draw a line up to the bottom of the tab.
    steps.push('v', -(cursorY - BRC.TAB_HEIGHT - BRC.TAB_OFFSET_FROM_TOP));
    steps.push(BRC.TAB_PATH_UP);
  }
  // Close off the path.  This draws a vertical line up to the start of the
  // block's path, which may be either a rounded or a sharp corner.
  steps.push('z');
  drawLeftHighlight(block, info, pathObject);
};

drawInternals = function(block, info, pathObject) {
  var inlineSteps = pathObject.inlineSteps;
  var cursorY = 0;
  for (var r = 0; r < info.rows.length; r++) {
    var row = info.rows[r];
    var cursorX = 0;
    var centerline = cursorY + row.height / 2;
    if (!(row instanceof RowSpacer)) {
      for (var e = 0; e < row.elements.length; e++) {
        var elem = row.elements[e];
        if (elem instanceof InlineInputElement) {
          drawInlineInput(pathObject, cursorX, cursorY, elem, centerline, info.RTL);
        } else if (elem instanceof IconElement || elem instanceof FieldElement) {
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

highlightValueInput = function(row, pathObject, info, cursorY) {
  var highlightSteps = pathObject.highlightSteps;
  //var v = row.height - BRC.TAB_HEIGHT;

  if (info.RTL) {
    // Highlight around back of tab.
    // TODO: Unfuck this.
    highlightSteps.push('v', BRC.TAB_OFFSET_FROM_TOP - 3);
    highlightSteps.push('m 0,2.5')
    highlightSteps.push(BRC.TAB_PATH_DOWN_HIGHLIGHT_RTL);
    highlightSteps.push('v', row.height - BRC.TAB_HEIGHT);
  } else {
    // Short highlight glint at bottom of tab.
    highlightSteps.push('M', (info.maxValueOrDummyWidth - 5) + ',' +
        (cursorY + BRC.TAB_HEIGHT - 0.7));
    highlightSteps.push('l', (BRC.TAB_WIDTH * 0.46) + ',-2.1');
  }
};

drawValueInput = function(row, pathObject, info, cursorY) {
  var steps = pathObject.steps;
  steps.push('H', row.width);
  steps.push(BRC.TAB_PATH_DOWN);
  steps.push('v', row.height - BRC.TAB_HEIGHT);

  highlightValueInput(row, pathObject, info, cursorY);
};

drawInlineInputHighlight = function(pathObject, x, y, input, centerline, isRTL) {
  var highlightInlineSteps = pathObject.highlightInlineSteps;

  var width = input.width;
  var height = input.height;
  var yPos = centerline - height / 2;
  if (isRTL) {
    // Highlight right edge, around back of tab, and bottom.
    highlightInlineSteps.push('M', (x + BRC.TAB_WIDTH - 0.5) +
      ',' + (yPos + BRC.TAB_OFFSET_FROM_TOP + 5));
    highlightInlineSteps.push(
        BRC.TAB_PATH_DOWN_HIGHLIGHT_RTL);
    highlightInlineSteps.push('v',
        height - Blockly.BlockSvg.TAB_HEIGHT + 1.5);
    highlightInlineSteps.push('h',
        width - BRC.TAB_WIDTH);
  } else {
    // Highlight right edge, bottom.
    highlightInlineSteps.push('M',
        (x + width + 0.5) + ',' +
        (yPos + 0.5));
    highlightInlineSteps.push('v', height);
    highlightInlineSteps.push('h', BRC.TAB_WIDTH - width);
    // Short highlight glint at bottom of tab.
    highlightInlineSteps.push('M',
        (x + 2.9) + ',' + (yPos + Blockly.BlockSvg.INLINE_PADDING_Y +
         BRC.TAB_HEIGHT - 0.7));
    highlightInlineSteps.push('l',
        (BRC.TAB_WIDTH * 0.46) + ',-2.1');
  }
};

drawInlineInput = function(pathObject, x, y, input, centerline, isRTL) {
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

  drawInlineInputHighlight(pathObject, x, y, input, centerline, isRTL);
};

drawStatementInputHighlight = function(row, pathObject, info, cursorY) {
  var highlightSteps = pathObject.highlightSteps;
  var x = row.statementEdge;
  if (info.RTL) {
    highlightSteps.push('M',
        (x + BRC.DISTANCE_45_OUTSIDE) +
        ',' + (cursorY + BRC.DISTANCE_45_OUTSIDE));
    highlightSteps.push(
        BRC.INNER_TOP_LEFT_CORNER_HIGHLIGHT_RTL);
    highlightSteps.push('v',
        row.height - 2 * BRC.CORNER_RADIUS);
    highlightSteps.push(
        BRC.INNER_BOTTOM_LEFT_CORNER_HIGHLIGHT_RTL);
    highlightSteps.push('H', info.maxValueOrDummyWidth - BRC.HIGHLIGHT_OFFSET);
  } else {
    highlightSteps.push('M',
        (x + BRC.DISTANCE_45_OUTSIDE) + ',' +
        (cursorY + row.height - BRC.DISTANCE_45_OUTSIDE));
    highlightSteps.push(
        BRC.INNER_BOTTOM_LEFT_CORNER_HIGHLIGHT_LTR);
    highlightSteps.push('H', info.maxValueOrDummyWidth - BRC.HIGHLIGHT_OFFSET);
  }
};

drawStatementInput = function(row, pathObject, info, cursorY) {
  var steps = pathObject.steps;
  var x = row.statementEdge + BRC.NOTCH_OFFSET;
  steps.push('H', x);
  steps.push(BRC.INNER_TOP_LEFT_CORNER);
  steps.push('v', row.height - 2 * BRC.CORNER_RADIUS);
  steps.push(BRC.INNER_BOTTOM_LEFT_CORNER);
  steps.push('H', info.maxValueOrDummyWidth);

  drawStatementInputHighlight(row, pathObject, info, cursorY);
};
