

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

drawDebug = function(block, info) {
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
};
