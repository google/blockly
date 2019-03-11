// New constants.
Blockly.BlockSvg.EMPTY_INPUT_X = Blockly.BlockSvg.TAB_WIDTH +
          Blockly.BlockSvg.SEP_SPACE_X * 1.25;

Blockly.BlockSvg.START_PADDING = Blockly.BlockSvg.SEP_SPACE_X - 1

Blockly.BlockSvg.RenderInfo = function() {
  /**
   *
   * @type {boolean}
   */
  this.startHat = false;

  /**
   *
   * @type {boolean}
   */
  this.squareTopLeftCorner = false;

  /**
   *
   * @type {boolean}
   */
  this.squareBottomLeftCorner = false;

  /**
   *
   * @type {boolean}
   */
  this.hasValue = false;

  /**
   *
   * @type {boolean}
   */
  this.hasStatement = false;

  /**
   *
   * @type {boolean}
   */
  this.hasDummy = false;

  /**
   *
   * @type {number}
   */
  this.height = 0;

  /**
   *
   * @type {number}
   */
  this.width = 0;

  /**
   *
   * @type {number}
   */
  this.rightEdge = 0;

  /**
   *
   * @type {number}
   */
  this.statementEdge = 0;

  this.startPadding = Blockly.BlockSvg.START_PADDING;

  // topPadding should be unnecessary: this is the height of the first spacer
  // row.
  this.topPadding = Blockly.BlockSvg.SEP_SPACE_X / 2;

  this.rows = [];
};

Blockly.BlockSvg.RenderedRow = function() {
  /**
   *
   * @type {number}
   */
  this.height = 0;

  /**
   *
   * @type {number}
   */
  this.width = 0;

  /**
   *
   * @type {number}
   */
  this.statementWidth = 0;

  /**
   *
   * @type {number}
   */
  this.fieldValueWidth = 0;

  /**
   * 'spacer', Blockly.BlockSvg.INLINE, 'external value', 'dummy', 'statement'
   * @type {string}
   */
  this.type = '';

  this.inputs = [];
};

Blockly.BlockSvg.RenderedInput = function() {
  /**
   *
   * @type {number}
   */
  this.height = 0;

  /**
   *
   * @type {number}
   */
  this.width = 0;

  /**
   *
   * @type {number}
   */
  this.connectedBlockHeight = 0;

  /**
   *
   * @type {number}
   */
  this.connectedBlockHeight = 0;

  /**
   *
   * @type {number}
   */
  this.fieldHeight = 0;

  /**
   *
   * @type {number}
   */
  this.fieldWidth = 0;

  /**
   *
   * @type {boolean}
   */
  this.isVisible = true;

  /**
   * 'spacer', 'icon', 'statement', 'value', or 'dummy'
   * @type {string}
   */
  this.type = '';

  this.fields = [];

  // The actual input on the block.
  // TODO: scrape all information we need from this, rather than storing it
  // directly.
  this.input = null;
};

Blockly.BlockSvg.RenderedField = function() {
  /**
   *
   * @type {number}
   */
  this.height = 0;

  /**
   *
   * @type {number}
   */
  this.width = 0;

  /**
   * 'spacer' or 'block field'
   * @type {string}
   */
  this.type = '';

  /**
   * The source field.
   *
   */
  this.field = null;
};

Blockly.BlockSvg.FieldSpacer = function() {
  this.height = 0;
  this.width = 0;
  this.type = 'spacer';
};

Blockly.BlockSvg.InputSpacer = function() {
  this.height = 0;
  this.width = 0;
  this.type = 'spacer';
};

Blockly.BlockSvg.RowSpacer = function() {
  this.height = 0;
  this.width = 0;
  this.type = 'spacer';
};

Blockly.BlockSvg.renderComputeForRealThough = function(block) {
  var renderInfo = createRenderInfo(block);

  // measure passes:
  for (var r = 1; r < renderInfo.rows.length - 1; r += 2) {
    var row = renderInfo.rows[r];
    for (var i = 1; i < row.inputs.length - 1; i += 2) {
      var input = row.inputs[i];
      for (var f = 1; f < input.fields.length - 1; f += 2) {
        var field = input.fields[f];
        measureField(field);
      }
      padFields(input);
      measureInput(input, renderInfo.isInline);
    }
    padInputs(row, renderInfo);
    measureRow(row);
  }
  padRows(renderInfo);
  completeInfo(renderInfo);
  console.log(renderInfo);
  return renderInfo;
};

createRenderInfo = function(block) {
  var info = new Blockly.BlockSvg.RenderInfo();
  info.startHat = this.hat ? this.hat === 'cap' : Blockly.BlockSvg.START_HAT;

  setShouldSquareCorners(block, info);
  setHasStuff(block, info);

  createRows(block, info);
  return info;
};

completeInfo = function(info) {
  var statementEdge = 0;
  var rightEdge = 0;
  for (var r = 1; r < info.rows.length - 1; r += 2) {
    var row = info.rows[r];
    statementEdge = Math.max(statementEdge, row.statementWidth);
    rightEdge = Math.max(rightEdge, row.fieldValueWidth);
  }
  // start padding is added equally to everything.
  info.statementEdge = statementEdge + info.startPadding;
  info.rightEdge = rightEdge + info.startPadding;

  for (var i = 0; i < info.rows.length; i++) {
    var row = info.rows[i];
    info.height += row.height;
    info.width = Math.max(info.width, row.width);
  }
  // Fuck it, add some padding.
  info.width = info.width + info.startPadding;
};

padRows = function(renderInfo) {
  var rowArr = renderInfo.rows;

  for (var r = 1; r < rowArr.length - 1; r += 2) {
    var row = rowArr[r];
    var prevSpacer = rowArr[r - 1];
    var nextSpacer = rowArr[r + 1];

    // Inline rows get extra padding both above and below.
    if (row.type == Blockly.BlockSvg.INLINE){
      prevSpacer.height += Blockly.BlockSvg.INLINE_PADDING_Y;
      nextSpacer.height += Blockly.BlockSvg.INLINE_PADDING_Y;
    }
  }

  // If the last rendered row is a statement input, the padding row after it
  // gets a bit taller to draw the bar between the statement input and the next
  // connection.
  var lastRenderedRow = rowArr[rowArr.length  - 2];
  var lastSpacer = rowArr[rowArr.length - 1];
  if (lastRenderedRow.type == 'statement') {
    lastSpacer.height = Blockly.BlockSvg.SEP_SPACE_Y;
  }

  // The first row gets some padding.  TODO: Does this depend on the start hat?
  rowArr[0].height = Blockly.BlockSvg.SEP_SPACE_X / 2;
};

measureRow = function(renderedRow) {
  var height = 0;
  var width = 0;

  var statementWidth = 0;
  var fieldValueWidth = 0;

  if (renderedRow.type == Blockly.BlockSvg.INLINE) {
    // row width is the sum of all input widths.
    // row height is the max of all input heights.
    // statement width doesn't matter.
    // fieldvaluewidth is misnamed, but is rightEdge and is the same as the
    // row width.
    for (var i = 0; i < renderedRow.inputs.length; i++) {
      var input = renderedRow.inputs[i];
      height = Math.max(height, input.height);
      width += input.width;
    }
    statementWidth = 0;
    fieldValueWidth = width;
  } else {
    for (var i = 0; i < renderedRow.inputs.length; i++) {
      var input = renderedRow.inputs[i];
      height = Math.max(height, input.height);
      if (renderedRow.type == 'statement' && input.type == Blockly.NEXT_STATEMENT) {
        width += input.fieldWidth;
        fieldValueWidth = width;
        statementWidth = width;
      } else {
        width += input.width;
        fieldValueWidth = width;
      }
    }
  }

  renderedRow.height = height;
  renderedRow.width = width;
  renderedRow.statementWidth = statementWidth;
  renderedRow.fieldValueWidth = fieldValueWidth;
};

padInputs = function(renderedRow, isInline) {
  // is there any padding?
  // is this the right place to adjust height of inputs down?
  var inputs = renderedRow.inputs;
  // Spacers sit between inputs.
  // for now, spacers stay at zero and we're only looking at the inputs
  // themselves.
  // The first and last ones are skipped (left at zero width).  Can I just
  // delete them?
  // Are these bounds right?
  for (var i = 1; i < inputs.length - 1; i += 2) {
    var cur = inputs[i];
    var prev = inputs[i - 2];
    var next = inputs[i + 2];
    // Blocks have a one pixel shadow that should sometimes overhang.
    if (isInline && !next) {
      // Last value input should overhang.
      cur.connectedBlockHeight--;
    } else if (!isInline && cur.type == Blockly.INPUT_VALUE &&
        next && next.type == Blockly.NEXT_STATEMENT) {
      // Value input above statement input should overhang.
      cur.connectedBlockHeight--;
    }
    // This includes the last spacer but not the first spacer.
    var spacer = inputs[i + 1];
    spacer.width = Blockly.BlockSvg.SEP_SPACE_X;
  }

  // The end of a row with an external input will have a tab rendered.  Add
  // space for that.
  // TODO: Decide if this is the right place to have that spacing live.
  //
  // if (renderedRow.type == 'external value') {
  //   inputs[inputs.length - 1].width = Blockly.BlockSvg.TAB_WIDTH;
  // }
  //  else if (renderedRow.type == 'dummy') {
  //   // dummies get a bit of padding too.
  //   inputs[inputs.length - 1].width = Blockly.BlockSvg.SEP_SPACE_X;
  // }
};

measureInput = function(renderedInput, isInline) {
  var fieldHeight = 0;
  var fieldWidth = 0;
  // If we're setting width on the first and last, maybe here is a good place.
  for (var f = 0; f < renderedInput.fields.length; f++) {
    var field = renderedInput.fields[f];
    fieldHeight = Math.max(fieldHeight, field.height);
    fieldWidth += field.width;
  }

  var blockWidth = 0;
  var blockHeight = 0;
  if (renderedInput.input.connection && renderedInput.input.connection.isConnected()) {
    var linkedBlock = renderedInput.input.connection.targetBlock();
    var bBox = linkedBlock.getHeightWidth();
    blockWidth = bBox.width;
    blockHeight = bBox.height;
  }

  // Compute minimum input size.
  var connectedBlockHeight = 0;
  var connectedBlockWidth = 0;

  // For statement inputs, keep track of both width and height.
  if (renderedInput.type == Blockly.NEXT_STATEMENT) {
    connectedBlockWidth = blockWidth;
    connectedBlockHeight = blockHeight;
  } else if (renderedInput.type == Blockly.INPUT_VALUE) {
    // Value input sizing depends on whether or not the block is inline.
    if (isInline) {
      connectedBlockWidth = Math.max(Blockly.BlockSvg.EMPTY_INPUT_X, blockWidth);
      connectedBlockHeight = Math.max(Blockly.BlockSvg.MIN_BLOCK_Y, blockHeight);
    } else {
      connectedBlockWidth = 0;
      connectedBlockHeight = Math.max(Blockly.BlockSvg.MIN_BLOCK_Y, blockHeight);
    }
  } else {
    // Dummies have no connected blocks.
    connectedBlockWidth = 0;
    connectedBlockHeight = 0;
  }

  renderedInput.fieldHeight = fieldHeight;
  renderedInput.fieldWidth = fieldWidth;
  renderedInput.connectedBlockHeight = connectedBlockHeight;
  renderedInput.connectedBlockWidth = connectedBlockWidth;

  renderedInput.height = Math.max(fieldHeight, connectedBlockHeight);
  renderedInput.width = fieldWidth + connectedBlockWidth;
};

measureField = function(renderedField) {
  // renderedField.field is the instance of Blockly.Field
  var size = renderedField.field.getSize();
  // if (renderedField.field instanceof Blockly.FieldDropdown) {
  //   // For some reason dropdown height had a minimum that included the padding.
  //   // TODO: Figure out if this causes a problem when the dropdown is tall
  //   // (contains images?)
  //   renderedField.height = size.height - 5;
  // } else if (renderedField.field instanceof Blockly.FieldImage) {
  //   renderedField.height = size.height - (2 * Blockly.BlockSvg.INLINE_PADDING_Y);
  // } else {
  //   renderedField.height = size.height;
  // }

  renderedField.height = size.height;
  renderedField.width = size.width;
};

padFields = function(renderedInput) {
  var fields = renderedInput.fields;

  // Spacers sit between fields.
  // SEP_SPACE_X is the minimum separation between fields, but two editable
  // fields will get a bit of extra separation.
  // TODO: Check bounds on this loop.
  for (var i = 2; i < fields.length - 2; i += 2) {
    console.log(i);
    var spacer = fields[i];
    var prevField = fields[i - 1];
    var nextField = fields[i + 1];

    if (prevField && nextField && prevField.EDITABLE && nextField.EDITABLE) {
      spacer.width = Blockly.BlockSvg.SEP_SPACE_X * 2;
    } else {
      spacer.width = Blockly.BlockSvg.SEP_SPACE_X;
    }
  }

  // If there is at least one rendered field and there's an input tab, add a
  // spacer between the last field and the input tab.
  if ((renderedInput.type == Blockly.INPUT_VALUE  ||
      renderedInput.type == Blockly.NEXT_STATEMENT) && fields.length > 1) {
    console.log('last spacer before an input');
    fields[fields.length - 1].width = Blockly.BlockSvg.SEP_SPACE_X;
  }
};

createFields = function(fieldRow) {
  var result = [];
  // One spacer at the beginning.
  var spacer = new Blockly.BlockSvg.FieldSpacer();
  result.push(spacer);
  for (var i = 0; i < fieldRow.length; i++) {
    var renderedField = new Blockly.BlockSvg.RenderedField();
    renderedField.type = 'block field';
    renderedField.field = fieldRow[i];
    result.push(renderedField);
    // Spacers between each pair of fields, and after the last field.
    var spacer = new Blockly.BlockSvg.FieldSpacer();
    result.push(spacer);
  }
  return result;
};

// Turn into a constructor?
createInput = function(blockInput) {
  var result = new Blockly.BlockSvg.RenderedInput();
  result.type = blockInput.type;
  result.isVisible = blockInput.isVisible();
  result.fields = createFields(blockInput.fieldRow);
  // TODO: scrape necessary info, rather than storing a pointer to the input.
  result.input = blockInput;
  return result;
};

createRows = function(block, info) {
  // todo: add icons
  var inputRows = [];
  inputRows.push(new Blockly.BlockSvg.RowSpacer());
  var lastType = undefined;
  var lastRow = null;
  var isInline = block.getInputsInline() && !block.isCollapsed();
  info.isInline = isInline;
  for (var i = 0; i < block.inputList.length; i++) {
    var input = createInput(block.inputList[i]);
    if (!input.isVisible) {
      continue;
    }
    var row;
    if (!isInline || !lastType ||
        lastType == Blockly.NEXT_STATEMENT ||
        input.type == Blockly.NEXT_STATEMENT) {
      // Create new row.
      lastType = input.type;
      row = new Blockly.BlockSvg.RenderedRow();
      lastRow = row;
      row.inputs.push(new Blockly.BlockSvg.InputSpacer());
      if (isInline && input.type != Blockly.NEXT_STATEMENT) {
        row.type = Blockly.BlockSvg.INLINE;
      } else {
        if (input.type == Blockly.NEXT_STATEMENT) {
          row.type = 'statement';
        } else if (input.type == Blockly.DUMMY_INPUT) {
          row.type = 'dummy';
        } else if (input.type == Blockly.INPUT_VALUE) {
          row.type = 'external value';
        }
        //row.type = input.type;
      }
      row.height = 0;
      inputRows.push(row);
      inputRows.push(new Blockly.BlockSvg.RowSpacer());
    } else {
      row = lastRow;
    }
    row.inputs.push(input);
    row.inputs.push(new Blockly.BlockSvg.InputSpacer());
  }
  info.rows = inputRows;
};

setShouldSquareCorners = function(block, info) {
  var prevBlock = block.getPreviousBlock();
  var nextBlock = block.getNextBlock();

  info.squareTopLeftCorner =
      !!block.outputConnection ||
      info.startHat ||
      (prevBlock && prevBlock.getNextBlock() == this);

  info.squareBottomLeftCorner = !!block.outputConnection || !!nextBlock;
};

setHasStuff = function(block, info) {
  for (var i = 0; i < block.inputList.length; i++) {
    var input = block.inputList[i];
    if (input.type == Blockly.DUMMY_INPUT) {
      info.hasDummy = true;
    } else if (input.type == Blockly.INPUT_VALUE) {
      info.hasValue = true;
    } else if (input.type == Blockly.NEXT_STATEMENT) {
      info.hasStatement = true;
    } else {
      throw new Error('what why');
    }
  }
};
