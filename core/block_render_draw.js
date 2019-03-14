renderDraw = function(block, info) {

  // Assemble the block's path.
  /**
   * @type !Blockly.BlockSvg.PathObject
   */
  var pathObject = new Blockly.BlockSvg.PathObject();
  boxElems(block, info);
  // renderDrawTop(block, info, pathObject);
  // renderDrawRight(block, info, pathObject);
  // renderDrawBottom(block, info, pathObject);
  // renderDrawLeft(block, info, pathObject);
  // renderFields(block, info, pathObject);
  // block.setPaths_(pathObject);

  // block.width = info.width;
  // block.height = info.height;
};

drawSpacerRow = function(row, cursorY, svgRoot) {
  row.rect = Blockly.utils.createSvgElement('rect',
      {
        'class': 'rowSpacerRect',
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
        'class': 'elemSpacerRect',
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
        'class': 'rowRenderingRect',
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
        'class': 'elemRenderingRect',
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
  steps.push('m 0,0');
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
  steps.push('H', 0);
  drawLeft(block, info, pathObject, cursorY);
};

drawLeft = function(block, info, pathObject, cursorY) {
  var steps = pathObject.steps;

  if (info.hasOutputConnection) {
    var TAB_PATH_DOWN = 'c 0,10 -' + Blockly.BlockSvg.TAB_WIDTH +
      ',-8 -' + Blockly.BlockSvg.TAB_WIDTH + ',7.5 s ' +
      Blockly.BlockSvg.TAB_WIDTH + ',-2.5 ' + Blockly.BlockSvg.TAB_WIDTH + ',7.5';
    var TAB_HEIGHT = 15;
    var TAB_OFFSET_FROM_TOP = 5;  // Possibly the height of the first row?
    // Draw a line up to the bottom of the tab.
    steps.push('v', -(cursorY - TAB_HEIGHT - TAB_OFFSET_FROM_TOP));
    // Move (without drawing) to the top of the tab.
    steps.push('m 0,-' + TAB_HEIGHT);
    // Draw the tab down, to use the same path as other tab drawing uses.
    steps.push(TAB_PATH_DOWN);
    // Move (without drawing) back up by the tab height.
    steps.push('m 0,' + TAB_HEIGHT);
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

// RenderFields is really "render internals".  That should include fields,
// icons (which are basically fields), and internal inputs.
renderFields = function(block, info, pathObject) {
  var cursorX = 0;
  var cursorY = 0;
  // field layout passes:
  for (var r = 0; r < info.rows.length; r++) {
    var row = info.rows[r];
    var isInline = row.type == Blockly.BlockSvg.INLINE;
    cursorX = info.startPadding;
    // Vertical center
    var centerline = cursorY + row.height / 2;
    if (row.type == 'spacer') {
      //cursorX += row.width;
    } else {
      for (var i = 0; i < row.inputs.length; i++) {
        var input = row.inputs[i];
        if (input.type != 'spacer') {
          for (var f = 0; f < input.fields.length; f++) {
            var field = input.fields[f];
            if (field.type != 'spacer') {
              console.log('lay out field at ' + cursorX);
              layoutField(field, cursorX, cursorY, centerline);
            }
            cursorX += field.width;
          }
          if (isInline && input.type == Blockly.INPUT_VALUE) {
            console.log('lay out inline input at ' + cursorX);
            drawInlineInput(pathObject, cursorX, cursorY, input, centerline);
            cursorX += input.connectedBlockWidth;
          }
        } else {
          cursorX += input.width;
        }
        // TODO: Add space for connected inline blocks.
      }
    }
    cursorY += row.height;
  }
};

renderDrawLeft = function(block, info, pathObject) {
  var steps = pathObject.steps;
  var highlightSteps = pathObject.highlightSteps;
  if (block.outputConnection) {
    // Create output connection.
    block.outputConnection.setOffsetInBlock(0, 0);
    steps.push('V', Blockly.BlockSvg.TAB_HEIGHT);
    steps.push('c 0,-10 -' + Blockly.BlockSvg.TAB_WIDTH + ',8 -' +
        Blockly.BlockSvg.TAB_WIDTH + ',-7.5 s ' + Blockly.BlockSvg.TAB_WIDTH +
        ',2.5 ' + Blockly.BlockSvg.TAB_WIDTH + ',-7.5');
    if (block.RTL) {
      highlightSteps.push('M', (Blockly.BlockSvg.TAB_WIDTH * -0.25) + ',8.4');
      highlightSteps.push('l', (Blockly.BlockSvg.TAB_WIDTH * -0.45) + ',-2.1');
    } else {
      highlightSteps.push('V', Blockly.BlockSvg.TAB_HEIGHT - 1.5);
      highlightSteps.push('m', (Blockly.BlockSvg.TAB_WIDTH * -0.92) +
                          ',-0.5 q ' + (Blockly.BlockSvg.TAB_WIDTH * -0.19) +
                          ',-5.5 0,-11');
      highlightSteps.push('m', (Blockly.BlockSvg.TAB_WIDTH * 0.92) +
                          ',1 V 0.5 H 1');
    }
  } else if (!block.RTL) {
    if (info.squareTopLeftCorner) {
      // Statement block in a stack.
      highlightSteps.push('V', 0.5);
    } else {
      highlightSteps.push('V', Blockly.BlockSvg.CORNER_RADIUS);
    }
  }
  steps.push('z');
};

drawValueInput = function(row, steps, info) {
  /**
   * SVG path for drawing a horizontal puzzle tab from top to bottom.
   * currently is "c 0,10 -8,-8 -8,7.5 s 8,-2.5 8,7.5"
   * @const
   */
  var TAB_PATH_DOWN = 'c 0,10 -' + Blockly.BlockSvg.TAB_WIDTH +
      ',-8 -' + Blockly.BlockSvg.TAB_WIDTH + ',7.5 s ' +
      Blockly.BlockSvg.TAB_WIDTH + ',-2.5 ' + Blockly.BlockSvg.TAB_WIDTH + ',7.5';

  var halfHeight = row.height / 2;
  var TAB_HEIGHT = 15;
  steps.push('H', row.width);
  // Does the tab path down just start too high up?
  // TODO: Pull this out into a constant.  The tab path starts out down by
  // 5, and shouldn't.
  //steps.push('v', TAB_HEIGHT / 2);
  steps.push(TAB_PATH_DOWN);
  steps.push('v', row.height - TAB_HEIGHT);
  //pathObject.steps.push(Blockly.BlockSvg.TAB_PATH_DOWN);

};

drawInlineInput = function(inlineSteps, x, y, input, centerline) {
  var width = input.width;
  var height = input.height;
  //x += Blockly.BlockSvg.TAB_WIDTH;  // TODO: This shouldn't be added here.  It
  // should be added as part of the padding instead.
  //x += input.fieldWidth;

  var yPos = centerline - height / 2;

  inlineSteps.push('M', (x + Blockly.BlockSvg.TAB_WIDTH) + ',' + yPos);
  // todo: this version of tab path down includes the "v 5" at the beginning.
  inlineSteps.push(Blockly.BlockSvg.TAB_PATH_DOWN);
  inlineSteps.push('v', height - Blockly.BlockSvg.TAB_HEIGHT);
  inlineSteps.push('h', width - Blockly.BlockSvg.TAB_WIDTH);
  inlineSteps.push('v', - height);
  inlineSteps.push('z');
};

// updated
drawStatementInput = function(row, steps, info) {
  var x = row.statementEdge + Blockly.BlockSvg.NOTCH_WIDTH;
  steps.push('H', x);
  steps.push(Blockly.BlockSvg.INNER_TOP_LEFT_CORNER);
  steps.push('v', row.height - 2 * Blockly.BlockSvg.CORNER_RADIUS);
  steps.push(Blockly.BlockSvg.INNER_BOTTOM_LEFT_CORNER);
  steps.push('H', info.maxValueOrDummyWidth);
};

renderDrawRight = function(block, info, pathObject) {
  var cursorX = 0;
  var cursorY = 0;
  for (var r = 0; r < info.rows.length; r++) {
    var row = info.rows[r];
    cursorX = info.startPadding;
    cursorY += row.height;
    if (row.type == 'external value') {
      drawValueInput(pathObject, info.rightEdge, cursorY);
    } else if (row.type == 'statement') {
      var realInput = row.inputs[1];
      drawStatementInput(block, pathObject, cursorX, cursorY, realInput, info);
    } else {
      pathObject.steps.push('H', info.rightEdge);
      pathObject.steps.push('v', row.height);
    }
  }
  pathObject.steps.push('V', info.height);
};

renderDrawBottom = function(block, info, pathObject) {
  var steps = pathObject.steps;
  var highlightSteps = pathObject.highlightSteps;
  if (block.nextConnection) {
    steps.push('H', (Blockly.BlockSvg.NOTCH_WIDTH + (block.RTL ? 0.5 : - 0.5)) +
        ' ' + Blockly.BlockSvg.NOTCH_PATH_RIGHT);
    // Create next block connection.
    var connectionX;
    if (block.RTL) {
      connectionX = -Blockly.BlockSvg.NOTCH_WIDTH;
    } else {
      connectionX = Blockly.BlockSvg.NOTCH_WIDTH;
    }
    block.nextConnection.setOffsetInBlock(connectionX, info.height + 1);
  }

  // Should the bottom-left corner be rounded or square?
  if (info.squareBottomLeftCorner) {
    steps.push('H 0');
    if (!block.RTL) {
      highlightSteps.push('M', '0.5,' + (info.height - 0.5));
    }
  } else {
    steps.push('H', Blockly.BlockSvg.CORNER_RADIUS);
    steps.push('a', Blockly.BlockSvg.CORNER_RADIUS + ',' +
               Blockly.BlockSvg.CORNER_RADIUS + ' 0 0,1 -' +
               Blockly.BlockSvg.CORNER_RADIUS + ',-' +
               Blockly.BlockSvg.CORNER_RADIUS);
    if (!block.RTL) {
      highlightSteps.push('M', Blockly.BlockSvg.DISTANCE_45_INSIDE + ',' +
          (info.height - Blockly.BlockSvg.DISTANCE_45_INSIDE));
      highlightSteps.push('A', (Blockly.BlockSvg.CORNER_RADIUS - 0.5) + ',' +
          (Blockly.BlockSvg.CORNER_RADIUS - 0.5) + ' 0 0,1 ' +
          '0.5,' + (info.height - Blockly.BlockSvg.CORNER_RADIUS));
    }
  }
};

renderDrawTop = function(block, info, pathObject) {
  var steps = pathObject.steps;
  var highlightSteps = pathObject.highlightSteps;
  // Position the cursor at the top-left starting point.
  if (info.squareTopLeftCorner) {
    steps.push('m 0,0');
    highlightSteps.push('m 0.5,0.5');
    if (info.startHat) {
      steps.push(Blockly.BlockSvg.START_HAT_PATH);
      highlightSteps.push(block.RTL ?
          Blockly.BlockSvg.START_HAT_HIGHLIGHT_RTL :
          Blockly.BlockSvg.START_HAT_HIGHLIGHT_LTR);
    }
  } else {
    steps.push(Blockly.BlockSvg.TOP_LEFT_CORNER_START);
    highlightSteps.push(block.RTL ?
        Blockly.BlockSvg.TOP_LEFT_CORNER_START_HIGHLIGHT_RTL :
        Blockly.BlockSvg.TOP_LEFT_CORNER_START_HIGHLIGHT_LTR);
    // Top-left rounded corner.
    steps.push(Blockly.BlockSvg.TOP_LEFT_CORNER);
    highlightSteps.push(Blockly.BlockSvg.TOP_LEFT_CORNER_HIGHLIGHT);
  }

  // Top edge.
  if (block.previousConnection) {
    steps.push('H', Blockly.BlockSvg.NOTCH_WIDTH - 15);
    highlightSteps.push('H', Blockly.BlockSvg.NOTCH_WIDTH - 15);
    steps.push(Blockly.BlockSvg.NOTCH_PATH_LEFT);
    highlightSteps.push(Blockly.BlockSvg.NOTCH_PATH_LEFT_HIGHLIGHT);

    var connectionX = (block.RTL ?
        -Blockly.BlockSvg.NOTCH_WIDTH : Blockly.BlockSvg.NOTCH_WIDTH);
    block.previousConnection.setOffsetInBlock(connectionX, 0);
  }
  steps.push('H', info.width);
  highlightSteps.push('H', info.width - 0.5);
};
