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
goog.provide('Blockly.BlockRendering.Highlighter');


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
 * @param {!Blockly.BlockRendering.RenderInfo} info An object containing all
 *     information needed to render this block.
 * @param {!Blockly.BlockSvg.PathObject} pathObject An object that stores all of
 *     the block's paths before they are propagated to the page.
 * @package
 */
Blockly.BlockRendering.Highlighter = function(info, pathObject) {
  this.info_ = info;
  this.pathObject_ = pathObject;
  this.highlightSteps_ = this.pathObject_.highlightSteps;
  this.highlightInlineSteps_ = this.pathObject_.highlightInlineSteps;
};

Blockly.BlockRendering.Highlighter.prototype.drawTopCorner = function(row) {
  for (var i = 0, elem; elem = row.elements[i]; i++) {
    if (elem.type === 'square corner') {
      this.highlightSteps_.push(BRC.START_POINT_HIGHLIGHT);
    } else if (elem.type === 'round corner') {
      this.highlightSteps_.push(this.RTL ?
          Blockly.BlockSvg.TOP_LEFT_CORNER_START_HIGHLIGHT_RTL :
          Blockly.BlockSvg.TOP_LEFT_CORNER_START_HIGHLIGHT_LTR);
      this.highlightSteps_.push(Blockly.BlockSvg.TOP_LEFT_CORNER_HIGHLIGHT);
    } else if (elem.type === 'previous connection') {
      this.highlightSteps_.push(BRC.NOTCH_PATH_LEFT_HIGHLIGHT);
    } else if (elem.type === 'hat') {
      this.highlightSteps_.push(this.RTL ?
          Blockly.BlockSvg.START_HAT_HIGHLIGHT_RTL :
          Blockly.BlockSvg.START_HAT_HIGHLIGHT_LTR);
    } else if (elem.isSpacer()) {
      this.highlightSteps_.push('h', elem.width - BRC.HIGHLIGHT_OFFSET);
    }
  }

  this.highlightSteps_.push('H', row.width - BRC.HIGHLIGHT_OFFSET);
};

Blockly.BlockRendering.Highlighter.prototype.drawValueInput = function(row) {
  //var v = row.height - BRC.TAB_HEIGHT;

  if (this.info_.RTL) {
    // Highlight around back of tab.
    // TODO: Clean up.
    this.highlightSteps_.push('v', BRC.TAB_OFFSET_FROM_TOP - 3);
    this.highlightSteps_.push('m 0,2.5');
    this.highlightSteps_.push(BRC.TAB_PATH_DOWN_HIGHLIGHT_RTL);
    this.highlightSteps_.push('v', row.height - BRC.TAB_HEIGHT);
  } else {
    // Short highlight glint at bottom of tab.
    this.highlightSteps_.push('M', (row.width - 5) + ',' +
        (row.yPos + BRC.TAB_HEIGHT - 0.7));
    this.highlightSteps_.push('l', (BRC.TAB_WIDTH * 0.46) + ',-2.1');
  }
};

Blockly.BlockRendering.Highlighter.prototype.drawStatementInput = function(row) {
  var x = row.statementEdge;
  if (this.info_.RTL) {
    this.highlightSteps_.push('M',
        (x + BRC.DISTANCE_45_OUTSIDE) +
        ',' + (row.yPos + BRC.DISTANCE_45_OUTSIDE));
    this.highlightSteps_.push(
        BRC.INNER_TOP_LEFT_CORNER_HIGHLIGHT_RTL);
    this.highlightSteps_.push('v',
        row.height - 2 * BRC.CORNER_RADIUS);
    this.highlightSteps_.push(
        BRC.INNER_BOTTOM_LEFT_CORNER_HIGHLIGHT_RTL);
  } else {
    this.highlightSteps_.push('M',
        (x + BRC.DISTANCE_45_OUTSIDE) + ',' +
        (row.yPos + row.height - BRC.DISTANCE_45_OUTSIDE));
    this.highlightSteps_.push(
        BRC.INNER_BOTTOM_LEFT_CORNER_HIGHLIGHT_LTR);
  }
};

Blockly.BlockRendering.Highlighter.prototype.drawRightSideRow = function(row) {
  if (this.info_.RTL) {
    this.highlightSteps_.push('H', row.width);
    this.highlightSteps_.push('v', row.height);
  }
};

Blockly.BlockRendering.Highlighter.prototype.drawBottomCorner = function(row) {
  var height = this.info_.height;
  var elems = this.info_.bottomRow.elements;

  if (this.info_.RTL) {
    height -= BRC.BOTTOM_HIGHLIGHT_OFFSET;
    this.highlightSteps_.push('V', height);
  }

  for (var i = elems.length - 1; i >= 0; i--) {
    var elem = elems[i];
    if (elem.type === 'square corner') {
      if (!this.info_.RTL) {
        this.highlightSteps_.push('M',
            BRC.HIGHLIGHT_OFFSET + ',' + (height - BRC.HIGHLIGHT_OFFSET));
      }
    } else if (elem.type === 'round corner') {
      if (!this.info_.RTL) {
        height -= BRC.BOTTOM_HIGHLIGHT_OFFSET;
        this.highlightSteps_.push(BRC.BOTTOM_LEFT_CORNER_HIGHLIGHT_START +
            (height - Blockly.BlockSvg.DISTANCE_45_INSIDE) +
            BRC.BOTTOM_LEFT_CORNER_HIGHLIGHT_MID +
            (height - Blockly.BlockSvg.CORNER_RADIUS));
      }
    }
  }
};

Blockly.BlockRendering.Highlighter.prototype.drawLeft = function() {
  if (this.info_.hasOutputConnection) {
    if (this.info_.RTL) {
      this.highlightSteps_.push(BRC.OUTPUT_CONNECTION_HIGHLIGHT_RTL);
    } else {
      this.highlightSteps_.push(BRC.OUTPUT_CONNECTION_HIGHLIGHT_LTR);
    }
  }

  if (!this.info_.RTL) {
    if (this.info_.topRow.elements[0].isSquareCorner()) {
      this.highlightSteps_.push('V', BRC.HIGHLIGHT_OFFSET);
    } else {
      this.highlightSteps_.push('V', BRC.CORNER_RADIUS);
    }
  }
};

Blockly.BlockRendering.Highlighter.prototype.drawInlineInput = function(input) {
  var width = input.width;
  var height = input.height;
  var x = input.xPos;
  var yPos = input.centerline - height / 2;
  if (this.info_.RTL) {
    // Highlight right edge, around back of tab, and bottom.
    this.highlightInlineSteps_.push('M', (x + BRC.TAB_WIDTH - 0.5) +
      ',' + (yPos + BRC.TAB_OFFSET_FROM_TOP + 5));
    this.highlightInlineSteps_.push(
        BRC.TAB_PATH_DOWN_HIGHLIGHT_RTL);
    this.highlightInlineSteps_.push('v',
        height - Blockly.BlockSvg.TAB_HEIGHT + 1.5);
    this.highlightInlineSteps_.push('h',
        width - BRC.TAB_WIDTH);
  } else {
    // Highlight right edge, bottom.
    this.highlightInlineSteps_.push('M',
        (x + width + 0.5) + ',' +
        (yPos + 0.5));
    this.highlightInlineSteps_.push('v', height);
    this.highlightInlineSteps_.push('h', BRC.TAB_WIDTH - width);
    // Short highlight glint at bottom of tab.
    this.highlightInlineSteps_.push('M',
        (x + 2.9) + ',' + (yPos + Blockly.BlockSvg.INLINE_PADDING_Y +
         BRC.TAB_HEIGHT - 0.7));
    this.highlightInlineSteps_.push('l',
        (BRC.TAB_WIDTH * 0.46) + ',-2.1');
  }
};
