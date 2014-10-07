/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2012 Google Inc.
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
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Blockly.BlockSvg');

goog.require('goog.userAgent');


/**
 * Class for a block's SVG representation.
 * @param {!Blockly.Block} block The underlying block object.
 * @constructor
 */
Blockly.BlockSvg = function(block) {
  this.block_ = block;
  // Create core elements for the block.
  this.svgGroup_ = Blockly.createSvgElement('g', {}, null);
  this.svgPathDark_ = Blockly.createSvgElement('path',
      {'class': 'blocklyPathDark', 'transform': 'translate(1, 1)'},
      this.svgGroup_);
  this.svgPath_ = Blockly.createSvgElement('path', {'class': 'blocklyPath'},
      this.svgGroup_);
  this.svgPathLight_ = Blockly.createSvgElement('path',
      {'class': 'blocklyPathLight'}, this.svgGroup_);
  this.svgPath_.tooltip = this.block_;
  Blockly.Tooltip.bindMouseEvents(this.svgPath_);
  this.updateMovable();
};

/**
 * Height of this block, not including any statement blocks above or below.
 */
Blockly.BlockSvg.prototype.height = 0;
/**
 * Width of this block, including any connected value blocks.
 */
Blockly.BlockSvg.prototype.width = 0;

/**
 * Constant for identifying rows that are to be rendered inline.
 * Don't collide with Blockly.INPUT_VALUE and friends.
 * @const
 */
Blockly.BlockSvg.INLINE = -1;

/**
 * Initialize the SVG representation with any block attributes which have
 * already been defined.
 */
Blockly.BlockSvg.prototype.init = function() {
  var block = this.block_;
  this.updateColour();
  for (var x = 0, input; input = block.inputList[x]; x++) {
    input.init();
  }
  if (block.mutator) {
    block.mutator.createIcon();
  }
};

/**
 * Add or remove the UI indicating if this block is movable or not.
 */
Blockly.BlockSvg.prototype.updateMovable = function() {
  if (this.block_.isMovable()) {
    Blockly.addClass_(/** @type {!Element} */ (this.svgGroup_),
                      'blocklyDraggable');
  } else {
    Blockly.removeClass_(/** @type {!Element} */ (this.svgGroup_),
                         'blocklyDraggable');
  }
};

/**
 * Get the root SVG element.
 * @return {!Element} The root SVG element.
 */
Blockly.BlockSvg.prototype.getRootElement = function() {
  return this.svgGroup_;
};

// UI constants for rendering blocks.
/**
 * Horizontal space between elements.
 * @const
 */
Blockly.BlockSvg.SEP_SPACE_X = 10;
/**
 * Vertical space between elements.
 * @const
 */
Blockly.BlockSvg.SEP_SPACE_Y = 10;
/**
 * Vertical padding around inline elements.
 * @const
 */
Blockly.BlockSvg.INLINE_PADDING_Y = 5;
/**
 * Minimum height of a block.
 * @const
 */
Blockly.BlockSvg.MIN_BLOCK_Y = 25;
/**
 * Height of horizontal puzzle tab.
 * @const
 */
Blockly.BlockSvg.TAB_HEIGHT = 20;
/**
 * Width of horizontal puzzle tab.
 * @const
 */
Blockly.BlockSvg.TAB_WIDTH = 8;
/**
 * Width of vertical tab (inc left margin).
 * @const
 */
Blockly.BlockSvg.NOTCH_WIDTH = 30;
/**
 * Rounded corner radius.
 * @const
 */
Blockly.BlockSvg.CORNER_RADIUS = 8;
/**
 * Minimum height of field rows.
 * @const
 */
Blockly.BlockSvg.FIELD_HEIGHT = 18;
/**
 * Distance from shape edge to intersect with a curved corner at 45 degrees.
 * Applies to highlighting on around the inside of a curve.
 * @const
 */
Blockly.BlockSvg.DISTANCE_45_INSIDE = (1 - Math.SQRT1_2) *
      (Blockly.BlockSvg.CORNER_RADIUS - 1) + 1;
/**
 * Distance from shape edge to intersect with a curved corner at 45 degrees.
 * Applies to highlighting on around the outside of a curve.
 * @const
 */
Blockly.BlockSvg.DISTANCE_45_OUTSIDE = (1 - Math.SQRT1_2) *
      (Blockly.BlockSvg.CORNER_RADIUS + 1) - 1;
/**
 * SVG path for drawing next/previous notch from left to right.
 * @const
 */
Blockly.BlockSvg.NOTCH_PATH_LEFT = 'l 6,4 3,0 6,-4';
/**
 * SVG path for drawing next/previous notch from left to right with
 * highlighting.
 * @const
 */
Blockly.BlockSvg.NOTCH_PATH_LEFT_HIGHLIGHT = 'l 6.5,4 2,0 6.5,-4';
/**
 * SVG path for drawing next/previous notch from right to left.
 * @const
 */
Blockly.BlockSvg.NOTCH_PATH_RIGHT = 'l -6,4 -3,0 -6,-4';
/**
 * SVG path for drawing jagged teeth at the end of collapsed blocks.
 * @const
 */
Blockly.BlockSvg.JAGGED_TEETH = 'l 8,0 0,4 8,4 -16,8 8,4';
/**
 * Height of SVG path for jagged teeth at the end of collapsed blocks.
 * @const
 */
Blockly.BlockSvg.JAGGED_TEETH_HEIGHT = 20;
/**
 * Width of SVG path for jagged teeth at the end of collapsed blocks.
 * @const
 */
Blockly.BlockSvg.JAGGED_TEETH_WIDTH = 15;
/**
 * SVG path for drawing a horizontal puzzle tab from top to bottom.
 * @const
 */
Blockly.BlockSvg.TAB_PATH_DOWN = 'v 5 c 0,10 -' + Blockly.BlockSvg.TAB_WIDTH +
    ',-8 -' + Blockly.BlockSvg.TAB_WIDTH + ',7.5 s ' +
    Blockly.BlockSvg.TAB_WIDTH + ',-2.5 ' + Blockly.BlockSvg.TAB_WIDTH + ',7.5';
/**
 * SVG path for drawing a horizontal puzzle tab from top to bottom with
 * highlighting from the upper-right.
 * @const
 */
Blockly.BlockSvg.TAB_PATH_DOWN_HIGHLIGHT_RTL = 'v 6.5 m -' +
    (Blockly.BlockSvg.TAB_WIDTH * 0.98) + ',2.5 q -' +
    (Blockly.BlockSvg.TAB_WIDTH * .05) + ',10 ' +
    (Blockly.BlockSvg.TAB_WIDTH * .27) + ',10 m ' +
    (Blockly.BlockSvg.TAB_WIDTH * .71) + ',-2.5 v 1.5';

/**
 * SVG start point for drawing the top-left corner.
 * @const
 */
Blockly.BlockSvg.TOP_LEFT_CORNER_START =
    'm 0,' + Blockly.BlockSvg.CORNER_RADIUS;
/**
 * SVG start point for drawing the top-left corner's highlight in RTL.
 * @const
 */
Blockly.BlockSvg.TOP_LEFT_CORNER_START_HIGHLIGHT_RTL =
    'm ' + Blockly.BlockSvg.DISTANCE_45_INSIDE + ',' +
    Blockly.BlockSvg.DISTANCE_45_INSIDE;
/**
 * SVG start point for drawing the top-left corner's highlight in LTR.
 * @const
 */
Blockly.BlockSvg.TOP_LEFT_CORNER_START_HIGHLIGHT_LTR =
    'm 1,' + (Blockly.BlockSvg.CORNER_RADIUS - 1);
/**
 * SVG path for drawing the rounded top-left corner.
 * @const
 */
Blockly.BlockSvg.TOP_LEFT_CORNER =
    'A ' + Blockly.BlockSvg.CORNER_RADIUS + ',' +
    Blockly.BlockSvg.CORNER_RADIUS + ' 0 0,1 ' +
    Blockly.BlockSvg.CORNER_RADIUS + ',0';
/**
 * SVG path for drawing the highlight on the rounded top-left corner.
 * @const
 */
Blockly.BlockSvg.TOP_LEFT_CORNER_HIGHLIGHT =
    'A ' + (Blockly.BlockSvg.CORNER_RADIUS - 1) + ',' +
    (Blockly.BlockSvg.CORNER_RADIUS - 1) + ' 0 0,1 ' +
    Blockly.BlockSvg.CORNER_RADIUS + ',1';
/**
 * SVG path for drawing the top-left corner of a statement input.
 * Includes the top notch, a horizontal space, and the rounded inside corner.
 * @const
 */
Blockly.BlockSvg.INNER_TOP_LEFT_CORNER =
    Blockly.BlockSvg.NOTCH_PATH_RIGHT + ' h -' +
    (Blockly.BlockSvg.NOTCH_WIDTH - 15 - Blockly.BlockSvg.CORNER_RADIUS) +
    ' a ' + Blockly.BlockSvg.CORNER_RADIUS + ',' +
    Blockly.BlockSvg.CORNER_RADIUS + ' 0 0,0 -' +
    Blockly.BlockSvg.CORNER_RADIUS + ',' +
    Blockly.BlockSvg.CORNER_RADIUS;
/**
 * SVG path for drawing the bottom-left corner of a statement input.
 * Includes the rounded inside corner.
 * @const
 */
Blockly.BlockSvg.INNER_BOTTOM_LEFT_CORNER =
    'a ' + Blockly.BlockSvg.CORNER_RADIUS + ',' +
    Blockly.BlockSvg.CORNER_RADIUS + ' 0 0,0 ' +
    Blockly.BlockSvg.CORNER_RADIUS + ',' +
    Blockly.BlockSvg.CORNER_RADIUS;
/**
 * SVG path for drawing highlight on the top-left corner of a statement
 * input in RTL.
 * @const
 */
Blockly.BlockSvg.INNER_TOP_LEFT_CORNER_HIGHLIGHT_RTL =
    'a ' + (Blockly.BlockSvg.CORNER_RADIUS + 1) + ',' +
    (Blockly.BlockSvg.CORNER_RADIUS + 1) + ' 0 0,0 ' +
    (-Blockly.BlockSvg.DISTANCE_45_OUTSIDE - 1) + ',' +
    (Blockly.BlockSvg.CORNER_RADIUS -
    Blockly.BlockSvg.DISTANCE_45_OUTSIDE);
/**
 * SVG path for drawing highlight on the bottom-left corner of a statement
 * input in RTL.
 * @const
 */
Blockly.BlockSvg.INNER_BOTTOM_LEFT_CORNER_HIGHLIGHT_RTL =
    'a ' + (Blockly.BlockSvg.CORNER_RADIUS + 1) + ',' +
    (Blockly.BlockSvg.CORNER_RADIUS + 1) + ' 0 0,0 ' +
    (Blockly.BlockSvg.CORNER_RADIUS + 1) + ',' +
    (Blockly.BlockSvg.CORNER_RADIUS + 1);
/**
 * SVG path for drawing highlight on the bottom-left corner of a statement
 * input in LTR.
 * @const
 */
Blockly.BlockSvg.INNER_BOTTOM_LEFT_CORNER_HIGHLIGHT_LTR =
    'a ' + (Blockly.BlockSvg.CORNER_RADIUS + 1) + ',' +
    (Blockly.BlockSvg.CORNER_RADIUS + 1) + ' 0 0,0 ' +
    (Blockly.BlockSvg.CORNER_RADIUS -
    Blockly.BlockSvg.DISTANCE_45_OUTSIDE) + ',' +
    (Blockly.BlockSvg.DISTANCE_45_OUTSIDE + 1);

/**
 * Dispose of this SVG block.
 */
Blockly.BlockSvg.prototype.dispose = function() {
  goog.dom.removeNode(this.svgGroup_);
  // Sever JavaScript to DOM connections.
  this.svgGroup_ = null;
  this.svgPath_ = null;
  this.svgPathLight_ = null;
  this.svgPathDark_ = null;
  // Break circular references.
  this.block_ = null;
};

/**
 * Play some UI effects (sound, animation) when disposing of a block.
 */
Blockly.BlockSvg.prototype.disposeUiEffect = function() {
  Blockly.playAudio('delete');

  var xy = Blockly.getSvgXY_(/** @type {!Element} */ (this.svgGroup_));
  // Deeply clone the current block.
  var clone = this.svgGroup_.cloneNode(true);
  clone.translateX_ = xy.x;
  clone.translateY_ = xy.y;
  clone.setAttribute('transform',
      'translate(' + clone.translateX_ + ',' + clone.translateY_ + ')');
  Blockly.svg.appendChild(clone);
  clone.bBox_ = clone.getBBox();
  // Start the animation.
  clone.startDate_ = new Date();
  Blockly.BlockSvg.disposeUiStep_(clone);
};

/**
 * Animate a cloned block and eventually dispose of it.
 * @param {!Element} clone SVG element to animate and dispose of.
 * @private
 */
Blockly.BlockSvg.disposeUiStep_ = function(clone) {
  var ms = (new Date()) - clone.startDate_;
  var percent = ms / 150;
  if (percent > 1) {
    goog.dom.removeNode(clone);
  } else {
    var x = clone.translateX_ +
        (Blockly.RTL ? -1 : 1) * clone.bBox_.width / 2 * percent;
    var y = clone.translateY_ + clone.bBox_.height * percent;
    var translate = x + ', ' + y;
    var scale = 1 - percent;
    clone.setAttribute('transform', 'translate(' + translate + ')' +
        ' scale(' + scale + ')');
    var closure = function() {
      Blockly.BlockSvg.disposeUiStep_(clone);
    };
    window.setTimeout(closure, 10);
  }
};

/**
 * Play some UI effects (sound, ripple) after a connection has been established.
 */
Blockly.BlockSvg.prototype.connectionUiEffect = function() {
  Blockly.playAudio('click');

  // Determine the absolute coordinates of the inferior block.
  var xy = Blockly.getSvgXY_(/** @type {!Element} */ (this.svgGroup_));
  // Offset the coordinates based on the two connection types.
  if (this.block_.outputConnection) {
    xy.x += Blockly.RTL ? 3 : -3;
    xy.y += 13;
  } else if (this.block_.previousConnection) {
    xy.x += Blockly.RTL ? -23 : 23;
    xy.y += 3;
  }
  var ripple = Blockly.createSvgElement('circle',
      {'cx': xy.x, 'cy': xy.y, 'r': 0, 'fill': 'none',
       'stroke': '#888', 'stroke-width': 10},
      Blockly.svg);
  // Start the animation.
  ripple.startDate_ = new Date();
  Blockly.BlockSvg.connectionUiStep_(ripple);
};

/**
 * Expand a ripple around a connection.
 * @param {!Element} ripple Element to animate.
 * @private
 */
Blockly.BlockSvg.connectionUiStep_ = function(ripple) {
  var ms = (new Date()) - ripple.startDate_;
  var percent = ms / 150;
  if (percent > 1) {
    goog.dom.removeNode(ripple);
  } else {
    ripple.setAttribute('r', percent * 25);
    ripple.style.opacity = 1 - percent;
    var closure = function() {
      Blockly.BlockSvg.connectionUiStep_(ripple);
    };
    window.setTimeout(closure, 10);
  }
};

/**
 * Change the colour of a block.
 */
Blockly.BlockSvg.prototype.updateColour = function() {
  if (this.block_.disabled) {
    // Disabled blocks don't have colour.
    return;
  }
  var hexColour = Blockly.makeColour(this.block_.getColour());
  var rgb = goog.color.hexToRgb(hexColour);
  var rgbLight = goog.color.lighten(rgb, 0.3);
  var rgbDark = goog.color.darken(rgb, 0.4);
  this.svgPathLight_.setAttribute('stroke', goog.color.rgbArrayToHex(rgbLight));
  this.svgPathDark_.setAttribute('fill', goog.color.rgbArrayToHex(rgbDark));
  this.svgPath_.setAttribute('fill', hexColour);
};

/**
 * Enable or disable a block.
 */
Blockly.BlockSvg.prototype.updateDisabled = function() {
  if (this.block_.disabled || this.block_.getInheritedDisabled()) {
    Blockly.addClass_(/** @type {!Element} */ (this.svgGroup_),
                      'blocklyDisabled');
    this.svgPath_.setAttribute('fill', 'url(#blocklyDisabledPattern)');
  } else {
    Blockly.removeClass_(/** @type {!Element} */ (this.svgGroup_),
                         'blocklyDisabled');
    this.updateColour();
  }
  var children = this.block_.getChildren();
  for (var x = 0, child; child = children[x]; x++) {
    child.svg_.updateDisabled();
  }
};

/**
 * Select this block.  Highlight it visually.
 */
Blockly.BlockSvg.prototype.addSelect = function() {
  Blockly.addClass_(/** @type {!Element} */ (this.svgGroup_),
                    'blocklySelected');
  // Move the selected block to the top of the stack.
  this.svgGroup_.parentNode.appendChild(this.svgGroup_);
};

/**
 * Unselect this block.  Remove its highlighting.
 */
Blockly.BlockSvg.prototype.removeSelect = function() {
  Blockly.removeClass_(/** @type {!Element} */ (this.svgGroup_),
                       'blocklySelected');
};

/**
 * Adds the dragging class to this block.
 * Also disables the highlights/shadows to improve performance.
 */
Blockly.BlockSvg.prototype.addDragging = function() {
  Blockly.addClass_(/** @type {!Element} */ (this.svgGroup_),
                    'blocklyDragging');
};

/**
 * Removes the dragging class from this block.
 */
Blockly.BlockSvg.prototype.removeDragging = function() {
  Blockly.removeClass_(/** @type {!Element} */ (this.svgGroup_),
                       'blocklyDragging');
};

/**
 * Render the block.
 * Lays out and reflows a block based on its contents and settings.
 */
Blockly.BlockSvg.prototype.render = function() {
  this.block_.rendered = true;

  var cursorX = Blockly.BlockSvg.SEP_SPACE_X;
  if (Blockly.RTL) {
    cursorX = -cursorX;
  }
  // Move the icons into position.
  var icons = this.block_.getIcons();
  for (var x = 0; x < icons.length; x++) {
    cursorX = icons[x].renderIcon(cursorX);
  }
  cursorX += Blockly.RTL ?
      Blockly.BlockSvg.SEP_SPACE_X : -Blockly.BlockSvg.SEP_SPACE_X;
  // If there are no icons, cursorX will be 0, otherwise it will be the
  // width that the first label needs to move over by.

  var inputRows = this.renderCompute_(cursorX);
  this.renderDraw_(cursorX, inputRows);

  // Render all blocks above this one (propagate a reflow).
  var parentBlock = this.block_.getParent();
  if (parentBlock) {
    parentBlock.render();
  } else {
    // Top-most block.  Fire an event to allow scrollbars to resize.
    Blockly.fireUiEvent(window, 'resize');
  }
};

/**
 * Render a list of fields starting at the specified location.
 * @param {!Array.<!Blockly.Field>} fieldList List of fields.
 * @param {number} cursorX X-coordinate to start the fields.
 * @param {number} cursorY Y-coordinate to start the fields.
 * @return {number} X-coordinate of the end of the field row (plus a gap).
 * @private
 */
Blockly.BlockSvg.prototype.renderFields_ =
    function(fieldList, cursorX, cursorY) {
  if (Blockly.RTL) {
    cursorX = -cursorX;
  }
  for (var t = 0, field; field = fieldList[t]; t++) {
    if (Blockly.RTL) {
      cursorX -= field.renderSep + field.renderWidth;
      field.getRootElement().setAttribute('transform',
          'translate(' + cursorX + ', ' + cursorY + ')');
      if (field.renderWidth) {
        cursorX -= Blockly.BlockSvg.SEP_SPACE_X;
      }
    } else {
      field.getRootElement().setAttribute('transform',
          'translate(' + (cursorX + field.renderSep) + ', ' + cursorY + ')');
      if (field.renderWidth) {
        cursorX += field.renderSep + field.renderWidth +
            Blockly.BlockSvg.SEP_SPACE_X;
      }
    }
  }
  return Blockly.RTL ? -cursorX : cursorX;
};

/**
 * Computes the height and widths for each row and field.
 * @param {number} iconWidth Offset of first row due to icons.
 * @return {!Array.<!Array.<!Object>>} 2D array of objects, each containing
 *     position information.
 * @private
 */
Blockly.BlockSvg.prototype.renderCompute_ = function(iconWidth) {
  var inputList = this.block_.inputList;
  var inputRows = [];
  inputRows.rightEdge = iconWidth + Blockly.BlockSvg.SEP_SPACE_X * 2;
  if (this.block_.previousConnection || this.block_.nextConnection) {
    inputRows.rightEdge = Math.max(inputRows.rightEdge,
        Blockly.BlockSvg.NOTCH_WIDTH + Blockly.BlockSvg.SEP_SPACE_X);
  }
  var fieldValueWidth = 0;  // Width of longest external value field.
  var fieldStatementWidth = 0;  // Width of longest statement field.
  var hasValue = false;
  var hasStatement = false;
  var hasDummy = false;
  var lastType = undefined;
  var isInline = this.block_.inputsInline && !this.block_.isCollapsed();
  for (var i = 0, input; input = inputList[i]; i++) {
    if (!input.isVisible()) {
      continue;
    }
    var row;
    if (!isInline || !lastType ||
        lastType == Blockly.NEXT_STATEMENT ||
        input.type == Blockly.NEXT_STATEMENT) {
      // Create new row.
      lastType = input.type;
      row = [];
      if (isInline && input.type != Blockly.NEXT_STATEMENT) {
        row.type = Blockly.BlockSvg.INLINE;
      } else {
        row.type = input.type;
      }
      row.height = 0;
      inputRows.push(row);
    } else {
      row = inputRows[inputRows.length - 1];
    }
    row.push(input);

    // Compute minimum input size.
    input.renderHeight = Blockly.BlockSvg.MIN_BLOCK_Y;
    // The width is currently only needed for inline value inputs.
    if (isInline && input.type == Blockly.INPUT_VALUE) {
      input.renderWidth = Blockly.BlockSvg.TAB_WIDTH +
          Blockly.BlockSvg.SEP_SPACE_X * 1.25;
    } else {
      input.renderWidth = 0;
    }
    // Expand input size if there is a connection.
    if (input.connection && input.connection.targetConnection) {
      var linkedBlock = input.connection.targetBlock();
      var bBox = linkedBlock.getHeightWidth();
      input.renderHeight = Math.max(input.renderHeight, bBox.height);
      input.renderWidth = Math.max(input.renderWidth, bBox.width);
    }

    if (i == inputList.length - 1) {
      // Last element should overhang slightly due to shadow.
      input.renderHeight--;
    }
    row.height = Math.max(row.height, input.renderHeight);
    input.fieldWidth = 0;
    if (inputRows.length == 1) {
      // The first row gets shifted to accommodate any icons.
      input.fieldWidth += Blockly.RTL ? -iconWidth : iconWidth;
    }
    var previousFieldEditable = false;
    for (var j = 0, field; field = input.fieldRow[j]; j++) {
      if (j != 0) {
        input.fieldWidth += Blockly.BlockSvg.SEP_SPACE_X;
      }
      // Get the dimensions of the field.
      var fieldSize = field.getSize();
      field.renderWidth = fieldSize.width;
      field.renderSep = (previousFieldEditable && field.EDITABLE) ?
          Blockly.BlockSvg.SEP_SPACE_X : 0;
      input.fieldWidth += field.renderWidth + field.renderSep;
      row.height = Math.max(row.height, fieldSize.height);
      previousFieldEditable = field.EDITABLE;
    }

    if (row.type != Blockly.BlockSvg.INLINE) {
      if (row.type == Blockly.NEXT_STATEMENT) {
        hasStatement = true;
        fieldStatementWidth = Math.max(fieldStatementWidth, input.fieldWidth);
      } else {
        if (row.type == Blockly.INPUT_VALUE) {
          hasValue = true;
        } else if (row.type == Blockly.DUMMY_INPUT) {
          hasDummy = true;
        }
        fieldValueWidth = Math.max(fieldValueWidth, input.fieldWidth);
      }
    }
  }

  // Make inline rows a bit thicker in order to enclose the values.
  for (var y = 0, row; row = inputRows[y]; y++) {
    row.thicker = false;
    if (row.type == Blockly.BlockSvg.INLINE) {
      for (var z = 0, input; input = row[z]; z++) {
        if (input.type == Blockly.INPUT_VALUE) {
          row.height += 2 * Blockly.BlockSvg.INLINE_PADDING_Y;
          row.thicker = true;
          break;
        }
      }
    }
  }

  // Compute the statement edge.
  // This is the width of a block where statements are nested.
  inputRows.statementEdge = 2 * Blockly.BlockSvg.SEP_SPACE_X +
      fieldStatementWidth;
  // Compute the preferred right edge.  Inline blocks may extend beyond.
  // This is the width of the block where external inputs connect.
  if (hasStatement) {
    inputRows.rightEdge = Math.max(inputRows.rightEdge,
        inputRows.statementEdge + Blockly.BlockSvg.NOTCH_WIDTH);
  }
  if (hasValue) {
    inputRows.rightEdge = Math.max(inputRows.rightEdge, fieldValueWidth +
        Blockly.BlockSvg.SEP_SPACE_X * 2 + Blockly.BlockSvg.TAB_WIDTH);
  } else if (hasDummy) {
    inputRows.rightEdge = Math.max(inputRows.rightEdge, fieldValueWidth +
        Blockly.BlockSvg.SEP_SPACE_X * 2);
  }

  inputRows.hasValue = hasValue;
  inputRows.hasStatement = hasStatement;
  inputRows.hasDummy = hasDummy;
  return inputRows;
};


/**
 * Draw the path of the block.
 * Move the fields to the correct locations.
 * @param {number} iconWidth Offset of first row due to icons.
 * @param {!Array.<!Array.<!Object>>} inputRows 2D array of objects, each
 *     containing position information.
 * @private
 */
Blockly.BlockSvg.prototype.renderDraw_ = function(iconWidth, inputRows) {
  // Should the top and bottom left corners be rounded or square?
  if (this.block_.outputConnection) {
    this.squareTopLeftCorner_ = true;
    this.squareBottomLeftCorner_ = true;
  } else {
    this.squareTopLeftCorner_ = false;
    this.squareBottomLeftCorner_ = false;
    // If this block is in the middle of a stack, square the corners.
    if (this.block_.previousConnection) {
      var prevBlock = this.block_.previousConnection.targetBlock();
      if (prevBlock && prevBlock.getNextBlock() == this.block_) {
        this.squareTopLeftCorner_ = true;
       }
    }
    var nextBlock = this.block_.getNextBlock();
    if (nextBlock) {
      this.squareBottomLeftCorner_ = true;
    }
  }

  // Fetch the block's coordinates on the surface for use in anchoring
  // the connections.
  var connectionsXY = this.block_.getRelativeToSurfaceXY();

  // Assemble the block's path.
  var steps = [];
  var inlineSteps = [];
  // The highlighting applies to edges facing the upper-left corner.
  // Since highlighting is a two-pixel wide border, it would normally overhang
  // the edge of the block by a pixel. So undersize all measurements by a pixel.
  var highlightSteps = [];
  var highlightInlineSteps = [];

  this.renderDrawTop_(steps, highlightSteps, connectionsXY,
      inputRows.rightEdge);
  var cursorY = this.renderDrawRight_(steps, highlightSteps, inlineSteps,
      highlightInlineSteps, connectionsXY, inputRows, iconWidth);
  this.renderDrawBottom_(steps, highlightSteps, connectionsXY, cursorY);
  this.renderDrawLeft_(steps, highlightSteps, connectionsXY, cursorY);

  var pathString = steps.join(' ') + '\n' + inlineSteps.join(' ');
  this.svgPath_.setAttribute('d', pathString);
  this.svgPathDark_.setAttribute('d', pathString);
  pathString = highlightSteps.join(' ') + '\n' + highlightInlineSteps.join(' ');
  this.svgPathLight_.setAttribute('d', pathString);
  if (Blockly.RTL) {
    // Mirror the block's path.
    this.svgPath_.setAttribute('transform', 'scale(-1 1)');
    this.svgPathLight_.setAttribute('transform', 'scale(-1 1)');
    this.svgPathDark_.setAttribute('transform', 'translate(1,1) scale(-1 1)');
  }
};

/**
 * Render the top edge of the block.
 * @param {!Array.<string>} steps Path of block outline.
 * @param {!Array.<string>} highlightSteps Path of block highlights.
 * @param {!Object} connectionsXY Location of block.
 * @param {number} rightEdge Minimum width of block.
 * @private
 */
Blockly.BlockSvg.prototype.renderDrawTop_ =
    function(steps, highlightSteps, connectionsXY, rightEdge) {
  // Position the cursor at the top-left starting point.
  if (this.squareTopLeftCorner_) {
    steps.push('m 0,0');
    highlightSteps.push('m 1,1');
  } else {
    steps.push(Blockly.BlockSvg.TOP_LEFT_CORNER_START);
    highlightSteps.push(Blockly.RTL ?
        Blockly.BlockSvg.TOP_LEFT_CORNER_START_HIGHLIGHT_RTL :
        Blockly.BlockSvg.TOP_LEFT_CORNER_START_HIGHLIGHT_LTR);
    // Top-left rounded corner.
    steps.push(Blockly.BlockSvg.TOP_LEFT_CORNER);
    highlightSteps.push(Blockly.BlockSvg.TOP_LEFT_CORNER_HIGHLIGHT);
  }

  // Top edge.
  if (this.block_.previousConnection) {
    steps.push('H', Blockly.BlockSvg.NOTCH_WIDTH - 15);
    highlightSteps.push('H', Blockly.BlockSvg.NOTCH_WIDTH - 15);
    steps.push(Blockly.BlockSvg.NOTCH_PATH_LEFT);
    highlightSteps.push(Blockly.BlockSvg.NOTCH_PATH_LEFT_HIGHLIGHT);
    // Create previous block connection.
    var connectionX = connectionsXY.x + (Blockly.RTL ?
        -Blockly.BlockSvg.NOTCH_WIDTH : Blockly.BlockSvg.NOTCH_WIDTH);
    var connectionY = connectionsXY.y;
    this.block_.previousConnection.moveTo(connectionX, connectionY);
    // This connection will be tightened when the parent renders.
  }
  steps.push('H', rightEdge);
  highlightSteps.push('H', rightEdge + (Blockly.RTL ? -1 : 0));
  this.width = rightEdge;
};

/**
 * Render the right edge of the block.
 * @param {!Array.<string>} steps Path of block outline.
 * @param {!Array.<string>} highlightSteps Path of block highlights.
 * @param {!Array.<string>} inlineSteps Inline block outlines.
 * @param {!Array.<string>} highlightInlineSteps Inline block highlights.
 * @param {!Object} connectionsXY Location of block.
 * @param {!Array.<!Array.<!Object>>} inputRows 2D array of objects, each
 *     containing position information.
 * @param {number} iconWidth Offset of first row due to icons.
 * @return {number} Height of block.
 * @private
 */
Blockly.BlockSvg.prototype.renderDrawRight_ = function(steps, highlightSteps,
    inlineSteps, highlightInlineSteps, connectionsXY, inputRows, iconWidth) {
  var cursorX;
  var cursorY = 0;
  var connectionX, connectionY;
  for (var y = 0, row; row = inputRows[y]; y++) {
    cursorX = Blockly.BlockSvg.SEP_SPACE_X;
    if (y == 0) {
      cursorX += Blockly.RTL ? -iconWidth : iconWidth;
    }
    highlightSteps.push('M', (inputRows.rightEdge - 1) + ',' + (cursorY + 1));
    if (this.block_.isCollapsed()) {
      // Jagged right edge.
      var input = row[0];
      var fieldX = cursorX;
      var fieldY = cursorY + Blockly.BlockSvg.FIELD_HEIGHT;
      this.renderFields_(input.fieldRow, fieldX, fieldY);
      steps.push(Blockly.BlockSvg.JAGGED_TEETH);
      if (Blockly.RTL) {
        highlightSteps.push('l 8,0 0,3.8 7,3.2 m -14.5,9 l 8,4');
      } else {
        highlightSteps.push('h 8');
      }
      var remainder = row.height - Blockly.BlockSvg.JAGGED_TEETH_HEIGHT;
      steps.push('v', remainder);
      if (Blockly.RTL) {
        highlightSteps.push('v', remainder - 2);
      }
      this.width += Blockly.BlockSvg.JAGGED_TEETH_WIDTH;
    } else if (row.type == Blockly.BlockSvg.INLINE) {
      // Inline inputs.
      for (var x = 0, input; input = row[x]; x++) {
        var fieldX = cursorX;
        var fieldY = cursorY + Blockly.BlockSvg.FIELD_HEIGHT;
        if (row.thicker) {
          // Lower the field slightly.
          fieldY += Blockly.BlockSvg.INLINE_PADDING_Y;
        }
        // TODO: Align inline field rows (left/right/centre).
        cursorX = this.renderFields_(input.fieldRow, fieldX, fieldY);
        if (input.type != Blockly.DUMMY_INPUT) {
          cursorX += input.renderWidth + Blockly.BlockSvg.SEP_SPACE_X;
        }
        if (input.type == Blockly.INPUT_VALUE) {
          inlineSteps.push('M', (cursorX - Blockly.BlockSvg.SEP_SPACE_X) +
                           ',' + (cursorY + Blockly.BlockSvg.INLINE_PADDING_Y));
          inlineSteps.push('h', Blockly.BlockSvg.TAB_WIDTH - 2 -
                           input.renderWidth);
          inlineSteps.push(Blockly.BlockSvg.TAB_PATH_DOWN);
          inlineSteps.push('v', input.renderHeight + 1 -
                                Blockly.BlockSvg.TAB_HEIGHT);
          inlineSteps.push('h', input.renderWidth + 2 -
                           Blockly.BlockSvg.TAB_WIDTH);
          inlineSteps.push('z');
          if (Blockly.RTL) {
            // Highlight right edge, around back of tab, and bottom.
            highlightInlineSteps.push('M',
                (cursorX - Blockly.BlockSvg.SEP_SPACE_X - 3 +
                 Blockly.BlockSvg.TAB_WIDTH - input.renderWidth) + ',' +
                (cursorY + Blockly.BlockSvg.INLINE_PADDING_Y + 1));
            highlightInlineSteps.push(
                Blockly.BlockSvg.TAB_PATH_DOWN_HIGHLIGHT_RTL);
            highlightInlineSteps.push('v',
                input.renderHeight - Blockly.BlockSvg.TAB_HEIGHT + 3);
            highlightInlineSteps.push('h',
                input.renderWidth - Blockly.BlockSvg.TAB_WIDTH + 1);
          } else {
            // Highlight right edge, bottom, and glint at bottom of tab.
            highlightInlineSteps.push('M',
                (cursorX - Blockly.BlockSvg.SEP_SPACE_X + 1) + ',' +
                (cursorY + Blockly.BlockSvg.INLINE_PADDING_Y + 1));
            highlightInlineSteps.push('v', input.renderHeight + 1);
            highlightInlineSteps.push('h', Blockly.BlockSvg.TAB_WIDTH - 2 -
                                           input.renderWidth);
            highlightInlineSteps.push('M',
                (cursorX - input.renderWidth - Blockly.BlockSvg.SEP_SPACE_X +
                 0.8) + ',' + (cursorY + Blockly.BlockSvg.INLINE_PADDING_Y +
                 Blockly.BlockSvg.TAB_HEIGHT - 0.4));
            highlightInlineSteps.push('l',
                (Blockly.BlockSvg.TAB_WIDTH * 0.42) + ',-1.8');
          }
          // Create inline input connection.
          if (Blockly.RTL) {
            connectionX = connectionsXY.x - cursorX -
                Blockly.BlockSvg.TAB_WIDTH + Blockly.BlockSvg.SEP_SPACE_X +
                input.renderWidth + 1;
          } else {
            connectionX = connectionsXY.x + cursorX +
                Blockly.BlockSvg.TAB_WIDTH - Blockly.BlockSvg.SEP_SPACE_X -
                input.renderWidth - 1;
          }
          connectionY = connectionsXY.y + cursorY +
              Blockly.BlockSvg.INLINE_PADDING_Y + 1;
          input.connection.moveTo(connectionX, connectionY);
          if (input.connection.targetConnection) {
            input.connection.tighten_();
          }
        }
      }

      cursorX = Math.max(cursorX, inputRows.rightEdge);
      this.width = Math.max(this.width, cursorX);
      steps.push('H', cursorX);
      highlightSteps.push('H', cursorX + (Blockly.RTL ? -1 : 0));
      steps.push('v', row.height);
      if (Blockly.RTL) {
        highlightSteps.push('v', row.height - 2);
      }
    } else if (row.type == Blockly.INPUT_VALUE) {
      // External input.
      var input = row[0];
      var fieldX = cursorX;
      var fieldY = cursorY + Blockly.BlockSvg.FIELD_HEIGHT;
      if (input.align != Blockly.ALIGN_LEFT) {
        var fieldRightX = inputRows.rightEdge - input.fieldWidth -
            Blockly.BlockSvg.TAB_WIDTH - 2 * Blockly.BlockSvg.SEP_SPACE_X;
        if (input.align == Blockly.ALIGN_RIGHT) {
          fieldX += fieldRightX;
        } else if (input.align == Blockly.ALIGN_CENTRE) {
          fieldX += (fieldRightX + fieldX) / 2;
        }
      }
      this.renderFields_(input.fieldRow, fieldX, fieldY);
      steps.push(Blockly.BlockSvg.TAB_PATH_DOWN);
      var v = row.height - Blockly.BlockSvg.TAB_HEIGHT;
      steps.push('v', v);
      if (Blockly.RTL) {
        // Highlight around back of tab.
        highlightSteps.push(Blockly.BlockSvg.TAB_PATH_DOWN_HIGHLIGHT_RTL);
        highlightSteps.push('v', v);
      } else {
        // Short highlight glint at bottom of tab.
        highlightSteps.push('M', (inputRows.rightEdge - 4.2) + ',' +
            (cursorY + Blockly.BlockSvg.TAB_HEIGHT - 0.4));
        highlightSteps.push('l', (Blockly.BlockSvg.TAB_WIDTH * 0.42) +
            ',-1.8');
      }
      // Create external input connection.
      connectionX = connectionsXY.x +
          (Blockly.RTL ? -inputRows.rightEdge - 1 : inputRows.rightEdge + 1);
      connectionY = connectionsXY.y + cursorY;
      input.connection.moveTo(connectionX, connectionY);
      if (input.connection.targetConnection) {
        input.connection.tighten_();
        this.width = Math.max(this.width, inputRows.rightEdge +
            input.connection.targetBlock().getHeightWidth().width -
            Blockly.BlockSvg.TAB_WIDTH + 1);
      }
    } else if (row.type == Blockly.DUMMY_INPUT) {
      // External naked field.
      var input = row[0];
      var fieldX = cursorX;
      var fieldY = cursorY + Blockly.BlockSvg.FIELD_HEIGHT;
      if (input.align != Blockly.ALIGN_LEFT) {
        var fieldRightX = inputRows.rightEdge - input.fieldWidth -
            2 * Blockly.BlockSvg.SEP_SPACE_X;
        if (inputRows.hasValue) {
          fieldRightX -= Blockly.BlockSvg.TAB_WIDTH;
        }
        if (input.align == Blockly.ALIGN_RIGHT) {
          fieldX += fieldRightX;
        } else if (input.align == Blockly.ALIGN_CENTRE) {
          fieldX += (fieldRightX + fieldX) / 2;
        }
      }
      this.renderFields_(input.fieldRow, fieldX, fieldY);
      steps.push('v', row.height);
      if (Blockly.RTL) {
        highlightSteps.push('v', row.height - 2);
      }
    } else if (row.type == Blockly.NEXT_STATEMENT) {
      // Nested statement.
      var input = row[0];
      if (y == 0) {
        // If the first input is a statement stack, add a small row on top.
        steps.push('v', Blockly.BlockSvg.SEP_SPACE_Y);
        if (Blockly.RTL) {
          highlightSteps.push('v', Blockly.BlockSvg.SEP_SPACE_Y - 1);
        }
        cursorY += Blockly.BlockSvg.SEP_SPACE_Y;
      }
      var fieldX = cursorX;
      var fieldY = cursorY + Blockly.BlockSvg.FIELD_HEIGHT;
      if (input.align != Blockly.ALIGN_LEFT) {
        var fieldRightX = inputRows.statementEdge - input.fieldWidth -
            2 * Blockly.BlockSvg.SEP_SPACE_X;
        if (input.align == Blockly.ALIGN_RIGHT) {
          fieldX += fieldRightX;
        } else if (input.align == Blockly.ALIGN_CENTRE) {
          fieldX += (fieldRightX + fieldX) / 2;
        }
      }
      this.renderFields_(input.fieldRow, fieldX, fieldY);
      cursorX = inputRows.statementEdge + Blockly.BlockSvg.NOTCH_WIDTH;
      steps.push('H', cursorX);
      steps.push(Blockly.BlockSvg.INNER_TOP_LEFT_CORNER);
      steps.push('v', row.height - 2 * Blockly.BlockSvg.CORNER_RADIUS);
      steps.push(Blockly.BlockSvg.INNER_BOTTOM_LEFT_CORNER);
      steps.push('H', inputRows.rightEdge);
      if (Blockly.RTL) {
        highlightSteps.push('M',
            (cursorX - Blockly.BlockSvg.NOTCH_WIDTH +
             Blockly.BlockSvg.DISTANCE_45_OUTSIDE) +
            ',' + (cursorY + Blockly.BlockSvg.DISTANCE_45_OUTSIDE));
        highlightSteps.push(
            Blockly.BlockSvg.INNER_TOP_LEFT_CORNER_HIGHLIGHT_RTL);
        highlightSteps.push('v',
            row.height - 2 * Blockly.BlockSvg.CORNER_RADIUS);
        highlightSteps.push(
            Blockly.BlockSvg.INNER_BOTTOM_LEFT_CORNER_HIGHLIGHT_RTL);
        highlightSteps.push('H', inputRows.rightEdge - 1);
      } else {
        highlightSteps.push('M',
            (cursorX - Blockly.BlockSvg.NOTCH_WIDTH +
             Blockly.BlockSvg.DISTANCE_45_OUTSIDE) + ',' +
            (cursorY + row.height - Blockly.BlockSvg.DISTANCE_45_OUTSIDE));
        highlightSteps.push(
            Blockly.BlockSvg.INNER_BOTTOM_LEFT_CORNER_HIGHLIGHT_LTR);
        highlightSteps.push('H', inputRows.rightEdge);
      }
      // Create statement connection.
      connectionX = connectionsXY.x + (Blockly.RTL ? -cursorX : cursorX);
      connectionY = connectionsXY.y + cursorY + 1;
      input.connection.moveTo(connectionX, connectionY);
      if (input.connection.targetConnection) {
        input.connection.tighten_();
        this.width = Math.max(this.width, inputRows.statementEdge +
            input.connection.targetBlock().getHeightWidth().width);
      }
      if (y == inputRows.length - 1 ||
          inputRows[y + 1].type == Blockly.NEXT_STATEMENT) {
        // If the final input is a statement stack, add a small row underneath.
        // Consecutive statement stacks are also separated by a small divider.
        steps.push('v', Blockly.BlockSvg.SEP_SPACE_Y);
        if (Blockly.RTL) {
          highlightSteps.push('v', Blockly.BlockSvg.SEP_SPACE_Y - 1);
        }
        cursorY += Blockly.BlockSvg.SEP_SPACE_Y;
      }
    }
    cursorY += row.height;
  }
  if (!inputRows.length) {
    cursorY = Blockly.BlockSvg.MIN_BLOCK_Y;
    steps.push('V', cursorY);
    if (Blockly.RTL) {
      highlightSteps.push('V', cursorY - 1);
    }
  }
  return cursorY;
};

/**
 * Render the bottom edge of the block.
 * @param {!Array.<string>} steps Path of block outline.
 * @param {!Array.<string>} highlightSteps Path of block highlights.
 * @param {!Object} connectionsXY Location of block.
 * @param {number} cursorY Height of block.
 * @private
 */
Blockly.BlockSvg.prototype.renderDrawBottom_ =
    function(steps, highlightSteps, connectionsXY, cursorY) {
  this.height = cursorY + 1;  // Add one for the shadow.
  if (this.block_.nextConnection) {
    steps.push('H', Blockly.BlockSvg.NOTCH_WIDTH + ' ' +
        Blockly.BlockSvg.NOTCH_PATH_RIGHT);
    // Create next block connection.
    var connectionX;
    if (Blockly.RTL) {
      connectionX = connectionsXY.x - Blockly.BlockSvg.NOTCH_WIDTH;
    } else {
      connectionX = connectionsXY.x + Blockly.BlockSvg.NOTCH_WIDTH;
    }
    var connectionY = connectionsXY.y + cursorY + 1;
    this.block_.nextConnection.moveTo(connectionX, connectionY);
    if (this.block_.nextConnection.targetConnection) {
      this.block_.nextConnection.tighten_();
    }
    this.height += 4;  // Height of tab.
  }

  // Should the bottom-left corner be rounded or square?
  if (this.squareBottomLeftCorner_) {
    steps.push('H 0');
    if (!Blockly.RTL) {
      highlightSteps.push('M', '1,' + cursorY);
    }
  } else {
    steps.push('H', Blockly.BlockSvg.CORNER_RADIUS);
    steps.push('a', Blockly.BlockSvg.CORNER_RADIUS + ',' +
               Blockly.BlockSvg.CORNER_RADIUS + ' 0 0,1 -' +
               Blockly.BlockSvg.CORNER_RADIUS + ',-' +
               Blockly.BlockSvg.CORNER_RADIUS);
    if (!Blockly.RTL) {
      highlightSteps.push('M', Blockly.BlockSvg.DISTANCE_45_INSIDE + ',' +
          (cursorY - Blockly.BlockSvg.DISTANCE_45_INSIDE));
      highlightSteps.push('A', (Blockly.BlockSvg.CORNER_RADIUS - 1) + ',' +
          (Blockly.BlockSvg.CORNER_RADIUS - 1) + ' 0 0,1 ' +
          '1,' + (cursorY - Blockly.BlockSvg.CORNER_RADIUS));
    }
  }
};

/**
 * Render the left edge of the block.
 * @param {!Array.<string>} steps Path of block outline.
 * @param {!Array.<string>} highlightSteps Path of block highlights.
 * @param {!Object} connectionsXY Location of block.
 * @param {number} cursorY Height of block.
 * @private
 */
Blockly.BlockSvg.prototype.renderDrawLeft_ =
    function(steps, highlightSteps, connectionsXY, cursorY) {
  if (this.block_.outputConnection) {
    // Create output connection.
    this.block_.outputConnection.moveTo(connectionsXY.x, connectionsXY.y);
    // This connection will be tightened when the parent renders.
    steps.push('V', Blockly.BlockSvg.TAB_HEIGHT);
    steps.push('c 0,-10 -' + Blockly.BlockSvg.TAB_WIDTH + ',8 -' +
        Blockly.BlockSvg.TAB_WIDTH + ',-7.5 s ' + Blockly.BlockSvg.TAB_WIDTH +
        ',2.5 ' + Blockly.BlockSvg.TAB_WIDTH + ',-7.5');
    if (Blockly.RTL) {
      highlightSteps.push('M', (Blockly.BlockSvg.TAB_WIDTH * -0.3) + ',8.9');
      highlightSteps.push('l', (Blockly.BlockSvg.TAB_WIDTH * -0.45) + ',-2.1');
    } else {
      highlightSteps.push('V', Blockly.BlockSvg.TAB_HEIGHT - 1);
      highlightSteps.push('m', (Blockly.BlockSvg.TAB_WIDTH * -0.92) +
                          ',-1 q ' + (Blockly.BlockSvg.TAB_WIDTH * -0.19) +
                          ',-5.5 0,-11');
      highlightSteps.push('m', (Blockly.BlockSvg.TAB_WIDTH * 0.92) +
                          ',1 V 1 H 2');
    }
    this.width += Blockly.BlockSvg.TAB_WIDTH;
  } else if (!Blockly.RTL) {
    if (this.squareTopLeftCorner_) {
      highlightSteps.push('V', 1);
    } else {
      highlightSteps.push('V', Blockly.BlockSvg.CORNER_RADIUS);
    }
  }
  steps.push('z');
};
