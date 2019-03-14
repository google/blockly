//goog.require('BlockRenderingConstants');

renderDraw = function(block, info) {
  var pathObject = new Blockly.BlockSvg.PathObject();
  boxElems(block, info);
};

drawSpacerRow = function(row, cursorY, svgRoot) {
  row.rect = Blockly.utils.createSvgElement('rect',
      {
        'class': 'rowSpacerRect displayable',
        'x': 0,
        'y': cursorY,
        'width': row.width,
        'height': row.height,
      },
      svgRoot);
};

drawSpacerElem = function(elem, cursorX, centerY, svgRoot) {
  elem.rect = Blockly.utils.createSvgElement('rect',
      {
        'class': 'elemSpacerRect displayable',
        'x': cursorX,
        'y': centerY - elem.height / 2,
        'width': elem.width,
        'height': 15,
      },
      svgRoot);
};

drawRenderedElem = function(elem, cursorX, centerY, svgRoot) {
  var yPos = centerY - elem.height / 2;
  elem.rect = Blockly.utils.createSvgElement('rect',
      {
        'class': 'rowRenderingRect displayable',
        'x': cursorX,
        'y': yPos,
        'width': elem.width,
        'height': elem.height ,
      },
      svgRoot);

  // if (elem.type == 'field') {
  //   // THEY RENDER AT X=-5 ON THEIR TOP LEVEL GROUP
  //   // IT'S THE FUCKING WORST
  //   if (elem.field instanceof Blockly.FieldDropdown ||
  //       elem.field instanceof Blockly.FieldTextInput) {
  //     cursorX += 5;
  //   }
  //   elem.field.getSvgRoot().setAttribute('transform',
  //       'translate(' + cursorX + ',' + yPos + ')');
  // }
};

drawRenderedRow = function(row, cursorY, svgRoot) {
  row.rect = Blockly.utils.createSvgElement('rect',
      {
        'class': 'elemRenderingRect displayable',
        'x': 0,
        'y': cursorY ,
        'width': row.width,
        'height': row.height,
      },
      svgRoot);
};

drawRowWithElements = function(row, cursorY, svgRoot) {
  var centerY = cursorY + row.height / 2;
  var cursorX = 0;
  for (var e = 0; e < row.elements.length; e++) {
    var elem = row.elements[e];
    if (elem instanceof ElemSpacer) {
      drawSpacerElem(elem, cursorX, centerY, svgRoot);
    } else {
      drawRenderedElem(elem, cursorX, centerY, svgRoot);
    }
    cursorX += elem.width;
  }
  drawRenderedRow(row, cursorY, svgRoot);
};

boxElems = function(block, info) {
  var svgRoot = block.getSvgRoot();
  var cursorY = 0;
  for (var r = 0; r < info.rows.length; r++) {
    var row = info.rows[r];
    if (row instanceof RowSpacer) {
      drawSpacerRow(row, cursorY, svgRoot);
    } else {
      drawRowWithElements(row, cursorY, svgRoot);
    }
    cursorY += row.height;
  }

  var pathObject = new Blockly.BlockSvg.PathObject();
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
    // if (row instanceof RowSpacer) {
    // } else
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
  //steps.push('m 0,0');

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
  steps.push('H', info.width);
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
    steps.push('H', BRC.CORNER_RADIUS);
    steps.push('a', BRC.CORNER_RADIUS + ',' +
               BRC.CORNER_RADIUS + ' 0 0,1 -' +
               BRC.CORNER_RADIUS + ',-' +
               BRC.CORNER_RADIUS);
  }
};

drawLeft = function(block, info, pathObject, cursorY) {
  var steps = pathObject.steps;

  if (info.hasOutputConnection) {
    // Draw a line up to the bottom of the tab.
    steps.push('v', -(cursorY - BRC.TAB_HEIGHT - BRC.TAB_OFFSET_FROM_TOP));
    // Move (without drawing) to the top of the tab.
    steps.push('m 0,-' + BRC.TAB_HEIGHT);
    // Draw the tab down, to use the same path as other tab drawing uses.
    steps.push(BRC.TAB_PATH_DOWN);
    // Move (without drawing) back up by the tab height.
    steps.push('m 0,' + BRC.TAB_HEIGHT);
    // Close off the path.  This should move up to the top left corner right now.
    steps.push('z');
  } else {
    steps.push('v', -cursorY);
    steps.push('z');
  }
};

drawInternals = function(block, info, pathObject) {
  var inlineSteps = pathObject.inlineSteps;
  var cursorY = 0;
  var cursorX = 0;
  for (var r = 0; r < info.rows.length; r++) {
    var row = info.rows[r];
    var centerline = cursorY + row.height / 2;
    if (row.hasInlineInput) {
      for (var e = 0; e < row.elements.length; e++) {
        var elem = row.elements[e];
        if (elem instanceof InlineInputElement) {
          drawInlineInput(inlineSteps, cursorX, cursorY, elem, centerline);
        }
        cursorX += elem.width;
      }
    }
    cursorY += row.height;
  }
};

layoutField = function(fieldInfo, cursorX, cursorY, centerline) {
  var yPos = centerline - fieldInfo.height / 2;
  if (fieldInfo.type == 'icon') {
    var icon = fieldInfo.field;
    icon.iconGroup_.setAttribute('display', 'block');
    icon.iconGroup_.setAttribute('transform', 'translate(' + cursorX + ',' +
        yPos + ')');
    icon.computeIconLocation();
  } else {
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
  inlineSteps.push('v 5');
  // todo: this version of tab path down includes the "v 5" at the beginning.
  inlineSteps.push(BRC.TAB_PATH_DOWN);
  inlineSteps.push('v', height - BRC.TAB_HEIGHT - 5);
  inlineSteps.push('h', width - BRC.TAB_WIDTH);
  inlineSteps.push('v', - height);
  inlineSteps.push('z');
};

// updated
drawStatementInput = function(row, steps, info) {
  var x = row.statementEdge + BRC.NOTCH_OFFSET;
  steps.push('H', x);
  steps.push(BRC.INNER_TOP_LEFT_CORNER);
  steps.push('v', row.height - 2 * BRC.CORNER_RADIUS);
  steps.push(BRC.INNER_BOTTOM_LEFT_CORNER);
  steps.push('H', info.maxValueOrDummyWidth);
};
