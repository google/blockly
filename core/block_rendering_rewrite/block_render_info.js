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

//goog.provide('Blockly.BlockRendering.Info');

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

  this.hasOutputConnection = false;

  this.rows = [];
};

Blockly.BlockSvg.renderComputeForRealThough = function(block) {
  var renderInfo = createRenderInfo(block);

  addElemSpacing(renderInfo);

  computeBounds(renderInfo);
  alignRowElements(renderInfo);


  addRowSpacing(renderInfo);

  computeHeight(renderInfo);
  console.log(renderInfo);
  block.height = renderInfo.height;
  block.width = renderInfo.widthWithConnectedBlocks;
  return renderInfo;
};

computeHeight = function(info) {
  var height = 0;
  for (var r = 0; r < info.rows.length; r++) {
    var row = info.rows[r];
    height += row.height;
  }
  info.height = height;
};

addAlignmentPadding = function(row, missingSpace) {
  var elems = row.elements;
  if (row.hasExternalInput) { // TODO: handle for dummy inputs.
    var externalInput = row.getLastInput();
    // Decide where the extra padding goes.
    // TODO: set the alignment value in the constructor.
    if (externalInput.input.align == Blockly.ALIGN_LEFT) {
      // Add padding just before the input socket.
      elems[elems.length - 3].width += missingSpace;
      row.width += missingSpace;
    } else if (externalInput.input.align == Blockly.ALIGN_CENTRE) {
      // Split the padding between the beginning of the row and just
      // before the socket.
      row.getFirstSpacer().width += missingSpace / 2;
      elems[elems.length - 3].width += missingSpace / 2;
      row.width += missingSpace;
    } else if (externalInput.input.align == Blockly.ALIGN_RIGHT) {
      // Add padding at the beginning of the row.
      row.getFirstSpacer().width += missingSpace;
      row.width += missingSpace;
    }
  }
};

/**
 * Extra spacing may be necessary to make sure that the right sides of all
 * rows line up.  This can only be calculated after a first pass to calculate
 * the sizes of all rows.
 */
alignRowElements = function(renderInfo) {

  for (var r = 0; r < renderInfo.rows.length; r++) {
    var row = renderInfo.rows[r];
    if (!row.hasStatement && !row.hasInlineInput) {
      var currentWidth = row.width;
      var desiredWidth = renderInfo.maxValueOrDummyWidth;
      var missingSpace = desiredWidth - currentWidth;
      if (missingSpace) {
        addAlignmentPadding(row, missingSpace);
      }
    }
  }
};

computeBounds = function(renderInfo) {
  var widestStatementRowFields = 0;
  var widestValueOrDummyRow = 0;
  var widestRowWithConnectedBlocks = 0;
  for (var r = 0; r < renderInfo.rows.length; r++) {
    var row = renderInfo.rows[r];
    row.measure();
    if (!row.hasStatement) {
      widestValueOrDummyRow = Math.max(widestValueOrDummyRow, row.width);
    }
    if (row.hasStatement) {
      var statementInput = row.getLastInput();
      var innerWidth = row.width - statementInput.width;
      widestStatementRowFields = Math.max(widestStatementRowFields, innerWidth);
    }
    widestRowWithConnectedBlocks =
        Math.max(widestRowWithConnectedBlocks, row.widthWithConnectedBlocks);
  }


  renderInfo.statementEdge = widestStatementRowFields;

  if (widestStatementRowFields) {
    renderInfo.maxValueOrDummyWidth =
        Math.max(widestValueOrDummyRow,
            widestStatementRowFields + BRC.NOTCH_WIDTH * 2);
  } else {
    renderInfo.maxValueOrDummyWidth = widestValueOrDummyRow;
  }

  for (var r = 0; r < renderInfo.rows.length; r++) {
    var row = renderInfo.rows[r];
    if (row.hasStatement) {
      row.statementEdge = renderInfo.statementEdge;
    }
  }

  renderInfo.widthWithConnectedBlocks =
      Math.max(widestValueOrDummyRow, widestRowWithConnectedBlocks);
};

/**
 * Add spacers between rows and set their sizes.
 */
addRowSpacing = function(info) {
  var oldRows = info.rows;
  var newRows = [];

  // There's a spacer before the first row.
  var spacing = calculateSpacingBetweenRows(null, oldRows[0]);
  var width = calculateWidthOfSpacerRow(oldRows[null], oldRows[0], info);
  newRows.push(new RowSpacer(spacing, width));
  for (var r = 0; r < oldRows.length; r++) {
    newRows.push(oldRows[r]);
    var spacing = calculateSpacingBetweenRows(oldRows[r], oldRows[r + 1]);
    var width = calculateWidthOfSpacerRow(oldRows[r], oldRows[r + 1], info);
    newRows.push(new RowSpacer(spacing, width));
  }
  info.rows = newRows;
};

/**
 * Calculate the width of a spacer row.  Almost all spacers will be the full
 * width of the block, but there are some exceptions (e.g. the small spacer row
 * after a statement input).
 */
calculateWidthOfSpacerRow = function(prev, next, info) {
  if (!prev) {
    return info.maxValueOrDummyWidth;
  }

  // spacer row after the last statement input.
  if (!next && prev.hasStatement) {
    if (info.isInline) {
      return info.maxValueOrDummyWidth;
    } else {
      return info.maxValueOrDummyWidth;
    }
  }

  return info.maxValueOrDummyWidth;
};

/**
 * Calculate the height of a spacer row based on the previous and next rows.
 * For instance, extra vertical space is added between two rows with external
 * value inputs.
 */
calculateSpacingBetweenRows = function(prev, next) {
  // First row is always (?) 5.
  if (!prev) {
    if (next && next.hasStatement) {
      return 10;
    }
    return 5;
  }

  // Slightly taller row after the last statement input.
  if (!next && prev.hasStatement) {
    return 10;
  }

  if (!next) {
    return 5;
  }

  if (prev.hasExternalInput && next.hasExternalInput) {
    return 10;
  }
  return 5;
};

/**
 * Add spacers between elements in a single row and set their sizes.
 */
addElemSpacing = function(info) {
  for (var r = 0; r < info.rows.length; r++) {
    var row = info.rows[r];
    var oldElems = row.elements;
    var newElems = [];
    // There's a spacer before the first element in the row.
    newElems.push(new ElemSpacer(calculateSpacingBetweenElems(null, oldElems[0])));
    for (var e = 0; e < row.elements.length; e++) {
      newElems.push(oldElems[e]);
      var spacing = calculateSpacingBetweenElems(oldElems[e], oldElems[e + 1]);
      newElems.push(new ElemSpacer(spacing));
    }
    row.elements = newElems;
  }
};

/**
 * Calculate the width of a spacer element in a row based on the previous and
 * next elements.  For instance, extra padding is added between two editable
 * fields.
 */
calculateSpacingBetweenElems = function(prev, next) {
  if (!prev) {
    // Between an editable field and the beginning of the row.
    if (next instanceof FieldElement && next.isEditable) {
      return 5;
    }
    // Inline input at the beginning of the row.
    if (next.isInput && next instanceof InlineInputElement) {
      return 9;
    }
    // Anything else at the beginning of the row.
    return 10;
  }

  // Spacing between a field or icon and the end of the row.
  if (!prev.isInput && !next) {
    // Between an editable field and the end of the row.
    if (prev instanceof FieldElement && prev.isEditable) {
      return 5;
    }
    // Between noneditable fields and icons and the end of the row.
    return 10;
  }

  // Between inputs and the end of the row.
  if (prev.isInput && !next) {
    if (prev instanceof ExternalValueInputElement) {
      return 0;
    } else if (prev instanceof InlineInputElement) {
      return 10;
    } else if (prev instanceof StatementInputElement) {
      return 0;
    }
  }

  // Between anything else and the end of the row?  Probably gets folded into
  // the previous two checks.
  if (!next) {
    return 5;
  }

  // Spacing between a field or icon and an input.
  if (!prev.isInput && next.isInput) {
    // Between an editable field and an input.
    if (prev.isEditable) {
      if (next instanceof InlineInputElement) {
        return 3;
      } else if (next instanceof ExternalValueInputElement) {
        return 5;
      }
    }
    return 9;
  }

  // Spacing between an icon and an icon or field.
  if (prev instanceof IconElement && !next.isInput) {
    return 11;
  }

  // Spacing between an inline input and a field.
  if (prev instanceof InlineInputElement && !next.isInput) {
    // Editable field after inline input.
    if (next.isEditable) {
      return 5;
    } else {
      // Noneditable field after inline input.
      return 10;
    }
  }

  return 5;
};

createRenderInfo = function(block) {
  var info = new Blockly.BlockSvg.RenderInfo();
  info.startHat = this.hat ? this.hat === 'cap' : Blockly.BlockSvg.START_HAT;
  if (block.outputConnection) {
    info.hasOutputConnection = true;
  }

  info.RTL = block.RTL;
  setShouldSquareCorners(block, info);

  createRows(block, info);
  return info;
};

shouldStartNewRow = function(input, lastInput, isInline) {
  // If this is the first input, just add to the existing row.
  // That row is either empty or has some icons in it.
  if (!lastInput) {
    return false;
  }

  // A statement input always gets a new row.
  if (input.type == Blockly.NEXT_STATEMENT) {
    return true;
  }

  // External value inputs get their own rows.
  if (input.type == Blockly.INPUT_VALUE && !isInline) {
    return true;
  }

  return false;
};

createRows = function(block, info) {
  // necessary data
  var isInline = block.getInputsInline() && !block.isCollapsed();
  info.isInline = isInline;

  var rowArr = [];
  var activeRow = new Row();

  var icons = block.getIcons();
  if (icons.length) {
    for (var i = 0; i < icons.length; i++) {
      activeRow.elements.push(new IconElement(icons[i]));
    }
  }

  for (var i = 0; i < block.inputList.length; i++) {
    var input = block.inputList[i];
    if (shouldStartNewRow(input, block.inputList[i - 1], isInline)) {
      rowArr.push(activeRow);
      activeRow = new Row();
    }
    for (var f = 0; f < input.fieldRow.length; f++) {
      var field = input.fieldRow[f];
      activeRow.elements.push(new FieldElement(field));
    }

    if (isInline && input.type == Blockly.INPUT_VALUE) {
      activeRow.elements.push(new InlineInputElement(input));
      activeRow.hasInlineInput = true;
    } else if (input.type == Blockly.NEXT_STATEMENT) {
      activeRow.elements.push(new StatementInputElement(input));
      activeRow.hasStatement = true;
    } else if (input.type == Blockly.INPUT_VALUE) {
      activeRow.elements.push(new ExternalValueInputElement(input));
      activeRow.hasExternalInput = true;
    }
  }

  if (activeRow.elements.length) {
    rowArr.push(activeRow);
  }

  info.rows = rowArr;
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

RenderableBlockElement = function() {
  this.isInput = false;
  this.width = 0;
  this.height = 0;
  this.type = null;
};

RenderableInputElement = function(input) {
  RenderableInputElement.superClass_.constructor.call(this);

  this.isInput = true;
  this.input = input;
  this.connectedBlock = input.connection && input.connection.targetBlock() ?
      input.connection.targetBlock() : null;

  if (this.connectedBlock) {
    var bBox = this.connectedBlock.getHeightWidth();
    this.connectedBlockWidth = bBox.width;
    this.connectedBlockHeight = bBox.height;
  } else {
    this.connectedBlockWidth = 0;
    this.connectedBlockHeight = 0;
  }
};
goog.inherits(RenderableInputElement, RenderableBlockElement);

IconElement = function(icon) {
  IconElement.superClass_.constructor.call(this);
  this.icon = icon;
  this.isVisible = icon.isVisible();
  this.renderRect = null;
  this.type = 'icon';

  this.height = 16;
  this.width = 16;
};
goog.inherits(IconElement, RenderableBlockElement);

FieldElement = function(field) {
  FieldElement.superClass_.constructor.call(this);
  this.field = field;
  this.renderRect = null;
  this.isEditable = field.isCurrentlyEditable();
  this.type = 'field';

  var size = this.field.getCorrectedSize();
  this.height = size.height;
  this.width = size.width;
};
goog.inherits(FieldElement, RenderableBlockElement);

InlineInputElement = function(input) {
  InlineInputElement.superClass_.constructor.call(this, input);
  this.type = 'inline input';

  if (!this.connectedBlock) {
    this.height = 26;
    this.width = 22;
  } else {
    this.width = this.connectedBlockWidth;
    this.height = this.connectedBlockHeight;
  }
};
goog.inherits(InlineInputElement, RenderableInputElement);

StatementInputElement = function(input) {
  InlineInputElement.superClass_.constructor.call(this, input);
  this.type = 'statement input';

  if (!this.connectedBlock) {
    this.height = 24;
    this.width = 32;
  } else {
    this.width = 25;
    this.height = this.connectedBlockHeight;
  }
};
goog.inherits(StatementInputElement, RenderableInputElement);

ExternalValueInputElement = function(input) {
  ExternalValueInputElement.superClass_.constructor.call(this, input);
  this.type = 'external value input';

  if (!this.connectedBlock) {
    this.height = 15;
  } else {
    this.height = this.connectedBlockHeight - 2 * BRC.TAB_OFFSET_FROM_TOP;
  }
  this.width = 10;
};
goog.inherits(ExternalValueInputElement, RenderableInputElement);

Row = function() {
  this.elements = [];
  this.width = 0;
  this.height = 0;

  this.hasExternalInput = false;
  this.hasStatement = false;
  this.hasInlineInput = false;
};

Row.prototype.measure = function() {
  var connectedBlockWidths = 0;
  for (var e = 0; e < this.elements.length; e++) {
    var elem = this.elements[e];
    this.width += elem.width;
    if (elem.isInput) {
      connectedBlockWidths += elem.connectedBlockWidth;
    }
    if (!(elem instanceof ElemSpacer)) {
      this.height = Math.max(this.height, elem.height);
    }
  }
  this.widthWithConnectedBlocks = this.width + connectedBlockWidths;
};

Row.prototype.getLastInput = function() {
  // There's always a spacer after the last input, unless there are no inputs.
  if (this.elements.length > 1) {
    var elem = this.elements[this.elements.length - 2];
    if (!elem.isInput) {
      return null;
    }
    return elem;
  }
  // Return null if there are no inputs.
  return null;
};

Row.prototype.getFirstSpacer = function() {
  return this.elements[0];
};

Row.prototype.getLastSpacer = function() {
  return this.elements[this.elements.length - 1];
};

RowSpacer = function(height, width) {
  this.height = height;
  this.rect = null;
  this.width = width;
};

ElemSpacer = function(width) {
  this.height = 15; // Only for visible rendering during debugging.
  this.width = width;
  this.rect = null;
};
