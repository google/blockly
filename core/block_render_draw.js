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
      drawStatementInput(row, steps, info);
    } else if (row.hasExternalInput) {
      drawValueInput(row, steps, info);
    } else {
      steps.push('H', row.width);
      steps.push('v', row.height);
    }
    cursorY += row.height;
  }
  drawBottom(block, info, pathObject);
  drawBottomCorner(block, info, pathObject);
  drawLeft(block, info, pathObject, cursorY);

};

drawTopCorner = function(block, info, pathObject) {
  var steps = pathObject.steps;
  // Position the cursor at the top-left starting point.
  if (info.squareTopLeftCorner) {
    steps.push('m 0,0');
    if (info.startHat) {
      steps.push(BRC.START_HAT_PATH);
    }
  } else {
    steps.push(BRC.TOP_LEFT_CORNER_START);
    // Top-left rounded corner.
    steps.push(BRC.TOP_LEFT_CORNER);
  }

  // Top edge.
  if (block.previousConnection) {
    steps.push('H', BRC.NOTCH_WIDTH);
    steps.push(BRC.NOTCH_PATH_LEFT);
  }
  console.log(info.width);
  steps.push('H', info.maxValueOrDummyWidth);
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
  var steps = pathObject.steps;
  // Should the bottom-left corner be rounded or square?
  if (info.squareBottomLeftCorner) {
    steps.push('H 0');
  } else {
    steps.push(BRC.BOTTOM_LEFT_CORNER);
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
          drawInlineInput(inlineSteps, cursorX, cursorY, elem, centerline);
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

drawValueInput = function(row, steps, info) {
  steps.push('H', row.width);
  steps.push(BRC.TAB_PATH_DOWN);
  steps.push('v', row.height - BRC.TAB_HEIGHT);
};

drawInlineInput = function(inlineSteps, x, y, input, centerline) {
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

drawStatementInput = function(row, steps, info) {
  var x = row.statementEdge + BRC.NOTCH_OFFSET;
  steps.push('H', x);
  steps.push(BRC.INNER_TOP_LEFT_CORNER);
  steps.push('v', row.height - 2 * BRC.CORNER_RADIUS);
  steps.push(BRC.INNER_BOTTOM_LEFT_CORNER);
  steps.push('H', info.maxValueOrDummyWidth);
};
