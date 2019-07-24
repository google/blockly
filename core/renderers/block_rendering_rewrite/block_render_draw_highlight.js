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
goog.provide('Blockly.blockRendering.Highlighter');

goog.require('Blockly.blockRendering.constants');
goog.require('Blockly.blockRendering.RenderInfo');
goog.require('Blockly.blockRendering.Measurable');

/**
 * An object that adds highlights to a block based on the given rendering
 * information.
 *
 * Highlighting is interesting because the highlights do not fully enclose the
 * block.  Instead, they are positioned based on a light source in the top left.
 * This means that rendering highlights requires exact information about the
 * position of each part of the block.  The resulting paths are not continuous
 * or closed paths.  The highlights for tabs and notches are loosely based on
 * tab and notch shapes, but are not exactly the same.
 *
 * @param {!Blockly.blockRendering.RenderInfo} info An object containing all
 *     information needed to render this block.
 * @param {!Blockly.BlockSvg.PathObject} pathObject An object that stores all of
 *     the block's paths before they are propagated to the page.
 * @package
 */
Blockly.blockRendering.Highlighter = function(info, pathObject) {
  this.info_ = info;
  this.pathObject_ = pathObject;
  this.highlightSteps_ = this.pathObject_.highlightSteps;
  this.highlightInlineSteps_ = this.pathObject_.highlightInlineSteps;
};

Blockly.blockRendering.Highlighter.prototype.drawTopCorner = function(row) {
  for (var i = 0, elem; elem = row.elements[i]; i++) {
    if (elem.type === 'square corner') {
      this.highlightSteps_.push(Blockly.blockRendering.constants.START_POINT_HIGHLIGHT);
    } else if (elem.type === 'round corner') {
      this.highlightSteps_.push(this.info_.RTL ?
          Blockly.blockRendering.constants.TOP_LEFT_CORNER_START_HIGHLIGHT_RTL :
          Blockly.blockRendering.constants.TOP_LEFT_CORNER_START_HIGHLIGHT_LTR);
      this.highlightSteps_.push(Blockly.blockRendering.constants.TOP_LEFT_CORNER_HIGHLIGHT);
    } else if (elem.type === 'previous connection') {
      this.highlightSteps_.push(Blockly.blockRendering.constants.NOTCH_PATH_LEFT_HIGHLIGHT);
    } else if (elem.type === 'hat') {
      this.highlightSteps_.push(this.info_.RTL ?
          Blockly.BlockSvg.START_HAT_HIGHLIGHT_RTL :
          Blockly.BlockSvg.START_HAT_HIGHLIGHT_LTR);
    } else if (elem.isSpacer()) {
      this.highlightSteps_.push('h', elem.width - Blockly.blockRendering.constants.HIGHLIGHT_OFFSET);
    }
  }

  this.highlightSteps_.push('H', row.width - Blockly.blockRendering.constants.HIGHLIGHT_OFFSET);
};

Blockly.blockRendering.Highlighter.prototype.drawValueInput = function(row) {
  //var v = row.height - Blockly.blockRendering.constants.TAB_HEIGHT;

  if (this.info_.RTL) {
    var aboveTabHeight =
        Blockly.blockRendering.constants.TAB_VERTICAL_OVERLAP -
        Blockly.blockRendering.constants.HIGHLIGHT_OFFSET;
    var belowTabHeight = row.height -
        (Blockly.blockRendering.constants.TAB_HEIGHT -
            Blockly.blockRendering.constants.TAB_VERTICAL_OVERLAP) +
        Blockly.blockRendering.constants.HIGHLIGHT_OFFSET;
    // Edge above tab.
    this.highlightSteps_.push('v', aboveTabHeight);
    // Highlight around back of tab.
    this.highlightSteps_.push(Blockly.blockRendering.constants.TAB_PATH_DOWN_HIGHLIGHT_RTL);
    // Edge below tab.
    this.highlightSteps_.push('v', belowTabHeight);
  } else {
    // Short highlight glint at bottom of tab.
    this.highlightSteps_.push('M', (row.width - 5) + ',' +
        (row.yPos + Blockly.blockRendering.constants.TAB_HEIGHT - 0.7));
    this.highlightSteps_.push('l', (Blockly.blockRendering.constants.TAB_WIDTH * 0.46) + ',-2.1');
  }
};

Blockly.blockRendering.Highlighter.prototype.drawStatementInput = function(row) {
  var x = row.statementEdge;
  if (this.info_.RTL) {
    this.highlightSteps_.push('M',
        (x + Blockly.blockRendering.constants.DISTANCE_45_OUTSIDE) +
        ',' + (row.yPos + Blockly.blockRendering.constants.DISTANCE_45_OUTSIDE));
    this.highlightSteps_.push(
        Blockly.blockRendering.constants.INNER_TOP_LEFT_CORNER_HIGHLIGHT_RTL);
    this.highlightSteps_.push('v',
        row.height - 2 * Blockly.blockRendering.constants.CORNER_RADIUS);
    this.highlightSteps_.push(
        Blockly.blockRendering.constants.INNER_BOTTOM_LEFT_CORNER_HIGHLIGHT_RTL);
  } else {
    this.highlightSteps_.push('M',
        (x + Blockly.blockRendering.constants.DISTANCE_45_OUTSIDE) + ',' +
        (row.yPos + row.height - Blockly.blockRendering.constants.DISTANCE_45_OUTSIDE));
    this.highlightSteps_.push(
        Blockly.blockRendering.constants.INNER_BOTTOM_LEFT_CORNER_HIGHLIGHT_LTR);
  }
};

Blockly.blockRendering.Highlighter.prototype.drawRightSideRow = function(row) {
  if (row.followsStatement) {
    this.highlightSteps_.push('H', row.width);
  }
  if (this.info_.RTL) {
    this.highlightSteps_.push('H', row.width - Blockly.blockRendering.constants.HIGHLIGHT_OFFSET);
    this.highlightSteps_.push('v', row.height);
  }
};

Blockly.blockRendering.Highlighter.prototype.drawBottomCorner = function(_row) {
  var height = this.info_.height;
  var elems = this.info_.bottomRow.elements;

  if (this.info_.RTL) {
    this.highlightSteps_.push('V', height);
  }

  for (var i = elems.length - 1; i >= 0; i--) {
    var elem = elems[i];
    if (elem.type === 'square corner') {
      if (!this.info_.RTL) {
        this.highlightSteps_.push('M',
            Blockly.blockRendering.constants.HIGHLIGHT_OFFSET + ',' +
            (height - Blockly.blockRendering.constants.HIGHLIGHT_OFFSET));
      }
    } else if (elem.type === 'round corner') {
      if (!this.info_.RTL) {
        this.highlightSteps_.push(
            Blockly.blockRendering.constants.BOTTOM_LEFT_CORNER_HIGHLIGHT_START +
            (height - Blockly.BlockSvg.DISTANCE_45_INSIDE) +
            Blockly.blockRendering.constants.BOTTOM_LEFT_CORNER_HIGHLIGHT_MID +
            (height - Blockly.BlockSvg.CORNER_RADIUS));
      }
    }
  }
};

Blockly.blockRendering.Highlighter.prototype.drawLeft = function() {
  if (this.info_.hasOutputConnection) {
    if (this.info_.RTL) {
      this.highlightSteps_.push(Blockly.blockRendering.constants.OUTPUT_CONNECTION_HIGHLIGHT_RTL);
    } else {
      this.highlightSteps_.push(Blockly.blockRendering.constants.OUTPUT_CONNECTION_HIGHLIGHT_LTR);
    }
  }

  if (!this.info_.RTL) {
    if (this.info_.topRow.elements[0].isSquareCorner()) {
      this.highlightSteps_.push('V', Blockly.blockRendering.constants.HIGHLIGHT_OFFSET);
    } else {
      this.highlightSteps_.push('V', Blockly.blockRendering.constants.CORNER_RADIUS);
    }
  }
};

Blockly.blockRendering.Highlighter.prototype.drawInlineInput = function(input) {
  var width = input.width;
  var height = input.height;
  var x = input.xPos;
  var yPos = input.centerline - height / 2;
  var bottomHighlightWidth = width - Blockly.blockRendering.constants.TAB_WIDTH;

  if (this.info_.RTL) {
    // TODO: Check if this is different when the inline input is populated.

    var aboveTabHeight =
        Blockly.blockRendering.constants.TAB_OFFSET_FROM_TOP +
       Blockly.blockRendering.constants.TAB_VERTICAL_OVERLAP -
       Blockly.blockRendering.constants.HIGHLIGHT_OFFSET;

    var belowTabHeight =
        height -
        (Blockly.blockRendering.constants.TAB_OFFSET_FROM_TOP +
            Blockly.blockRendering.constants.TAB_HEIGHT -
            Blockly.blockRendering.constants.TAB_VERTICAL_OVERLAP) +
        Blockly.blockRendering.constants.HIGHLIGHT_OFFSET;

    var startX = x + Blockly.blockRendering.constants.TAB_WIDTH -
        Blockly.blockRendering.constants.HIGHLIGHT_OFFSET;
    var startY = yPos + Blockly.blockRendering.constants.HIGHLIGHT_OFFSET;

    // Highlight right edge, around back of tab, and bottom.
    this.highlightInlineSteps_.push('M', startX + ',' + startY);
    // Right edge above tab.
    this.highlightInlineSteps_.push('v', aboveTabHeight);
    // Back of tab.
    this.highlightInlineSteps_.push(Blockly.blockRendering.constants.TAB_PATH_DOWN_HIGHLIGHT_RTL);
    // Right edge below tab.
    this.highlightInlineSteps_.push('v', belowTabHeight);
    // Bottom (horizontal).
    this.highlightInlineSteps_.push('h', bottomHighlightWidth);
  } else {
    // Highlight right edge, bottom.
    this.highlightInlineSteps_.push('M',
        (x + width + Blockly.blockRendering.constants.HIGHLIGHT_OFFSET) + ',' +
        (yPos + Blockly.blockRendering.constants.HIGHLIGHT_OFFSET));
    this.highlightInlineSteps_.push('v', height);
    this.highlightInlineSteps_.push('h ', -bottomHighlightWidth);
    // Short highlight glint at bottom of tab.
    // Bad: reference to Blockly.BlockSvg
    this.highlightInlineSteps_.push('M',
        (x + 2.9) + ',' + (yPos + Blockly.BlockSvg.INLINE_PADDING_Y +
         Blockly.blockRendering.constants.TAB_HEIGHT - 0.7));
    this.highlightInlineSteps_.push('l',
        (Blockly.blockRendering.constants.TAB_WIDTH * 0.46) + ',-2.1');
  }
};
