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
  block.setPaths_(pathObject);
  renderFields(block, info);
};

layoutField = function(field, cursorX, cursorY) {
  field.field.getSvgRoot().setAttribute('transform',
      'translate(' + cursorX + ',' + cursorY + ')');
};

renderFields = function(block, info) {
  var cursorX = 0;
  var cursorY = info.topPadding;
  // field layout passes:
  for (var r = 0; r < info.rows.length; r++) {
    var row = info.rows[r];
    cursorX = info.startPadding;
    if (row.type == 'spacer') {
      //cursorX += row.width;
    } else {
      for (var i = 0; i < row.inputs.length; i++) {
        var input = row.inputs[i];
        //cursorX += input.width;
        if (input.type != 'spacer') {
          for (var f = 0; f < input.fields.length; f++) {
            var field = input.fields[f];
            if (field.type != 'spacer') {
              layoutField(field, cursorX, cursorY);
            }
            cursorX += field.width;
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

drawValueInput = function(pathObject) {
  pathObject.steps.push(Blockly.BlockSvg.TAB_PATH_DOWN);

};

drawInlineInput = function(pathObject, x, y, input) {
  var width = input.connectedBlockWidth;
  var height = input.connectedBlockHeight;
  x += input.fieldWidth;

  var steps = pathObject.steps;
  var inlineSteps = pathObject.inlineSteps;

  inlineSteps.push('M', (x - Blockly.BlockSvg.SEP_SPACE_X) +
                       ',' + (y + Blockly.BlockSvg.INLINE_PADDING_Y));
  inlineSteps.push('h', Blockly.BlockSvg.TAB_WIDTH - 2 -
                   width);
  inlineSteps.push(Blockly.BlockSvg.TAB_PATH_DOWN);
  inlineSteps.push('v', height + 1 -
                        Blockly.BlockSvg.TAB_HEIGHT);
  inlineSteps.push('h', width + 2 -
                   Blockly.BlockSvg.TAB_WIDTH);
  inlineSteps.push('z');
};

renderDrawRight = function(block, info, pathObject) {
  var cursorX = 0;
  var cursorY = 0;
  // field layout passes:
  for (var r = 0; r < info.rows.length; r++) {
    var row = info.rows[r];
    cursorY += row.height;
    if (row.type == 'spacer') {
      cursorX += row.width;
    } else {
      if (row.type != Blockly.BlockSvg.INLINE && row.inputs[1].type == Blockly.INPUT_VALUE) {
        pathObject.steps.push(Blockly.BlockSvg.TAB_PATH_DOWN);
        pathObject.steps.push('V', cursorY);
      } else {
        for (var i = 0; i < row.inputs.length; i++) {
          var input = row.inputs[i];
          if (input.type == Blockly.INPUT_VALUE) {
            drawInlineInput(pathObject, cursorX, cursorY, input);
          }
        }
      }
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
  //this.width = rightEdge;
};
