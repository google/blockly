renderDraw = function(block, info) {

  // Assemble the block's path.
  /**
   * @type !Blockly.BlockSvg.PathObject
   */
  var pathObject = new Blockly.BlockSvg.PathObject();
  renderDrawTop(block, info, pathObject);
  renderDrawRight(block, info, pathObject);
  renderDrawBottom(block, info, pathObject);
  renderDrawLeft(block, info, pathObject);
  renderFields(block, info, pathObject);
  block.setPaths_(pathObject);

  block.width = info.width;
  block.height = info.height;
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

drawValueInput = function(pathObject, cursorX, cursorY) {
  pathObject.steps.push('H', cursorX);
  // Does the tab path down just start too high up?
  // TODO: Pull this out into a constant.  The tab path starts out down by
  // 5, and shouldn't.
  pathObject.steps.push('v', 0);
  pathObject.steps.push(Blockly.BlockSvg.TAB_PATH_DOWN);
  pathObject.steps.push('V', cursorY);
  //pathObject.steps.push(Blockly.BlockSvg.TAB_PATH_DOWN);

};

drawInlineInput = function(pathObject, x, y, input, centerline) {
  var width = input.connectedBlockWidth;
  var height = input.connectedBlockHeight;
  //x += Blockly.BlockSvg.TAB_WIDTH;  // TODO: This shouldn't be added here.  It
  // should be added as part of the padding instead.
  //x += input.fieldWidth;

  var yPos = centerline - height / 2;
  var inlineSteps = pathObject.inlineSteps;

  inlineSteps.push('M', (x + Blockly.BlockSvg.TAB_WIDTH) + ',' + yPos);
  inlineSteps.push(Blockly.BlockSvg.TAB_PATH_DOWN);
  inlineSteps.push('v', height - Blockly.BlockSvg.TAB_HEIGHT);
  inlineSteps.push('h', width - Blockly.BlockSvg.TAB_WIDTH);
  inlineSteps.push('v', - height);
  inlineSteps.push('z');
};

drawStatementInput = function(block, pathObject, x, y, input, info) {
  var steps = pathObject.steps;
  x = info.statementEdge + Blockly.BlockSvg.NOTCH_WIDTH;
  steps.push('H', x);
  steps.push(Blockly.BlockSvg.INNER_TOP_LEFT_CORNER);
  steps.push('v', input.height - 2 * Blockly.BlockSvg.CORNER_RADIUS);
  steps.push(Blockly.BlockSvg.INNER_BOTTOM_LEFT_CORNER);
  steps.push('H', info.rightEdge);
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
