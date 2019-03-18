
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
        (x + 2.9) + ',' + (y + Blockly.BlockSvg.INLINE_PADDING_Y +
         BRC.TAB_HEIGHT - 0.7));
    highlightInlineSteps.push('l',
        (BRC.TAB_WIDTH * 0.46) + ',-2.1');
  }
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

drawBottomCornerHighlight = function(block, info, pathObject) {
  var highlightSteps = pathObject.highlightSteps;
  if (info.squareBottomLeftCorner) {
    if (!block.RTL) {
      highlightSteps.push('M',
          BRC.HIGHLIGHT_OFFSET + ',' + (info.height - BRC.HIGHLIGHT_OFFSET));
    }
  } else {
    if (!block.RTL) {
      highlightSteps.push(BRC.BOTTOM_LEFT_CORNER_HIGHLIGHT_START +
          (info.height - Blockly.BlockSvg.DISTANCE_45_INSIDE) +
          BRC.BOTTOM_LEFT_CORNER_HIGHLIGHT_MID +
          (info.height - Blockly.BlockSvg.CORNER_RADIUS));
    }
  }
};

drawRightSideRowHighlight = function(row, info, pathObject) {
  var highlightSteps = pathObject.highlightSteps;
  if (info.RTL) {
    highlightSteps.push('v', row.height);
  }
};
