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

'use strict';
goog.provide('Blockly.blockRendering.Highlighter');

goog.require('Blockly.blockRendering.highlightConstants');
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

  this.highlightOffset_ = Blockly.blockRendering.highlightConstants.OFFSET;

  this.outsideCornerPaths_ = Blockly.blockRendering.highlightConstants.OUTSIDE_CORNER;
  this.insideCornerPaths_ = Blockly.blockRendering.highlightConstants.INSIDE_CORNER;
  this.puzzleTabPaths_ = Blockly.blockRendering.highlightConstants.PUZZLE_TAB;
  this.notchPaths_ = Blockly.blockRendering.highlightConstants.NOTCH;
  this.startPaths_ = Blockly.blockRendering.highlightConstants.START_HAT;
};

Blockly.blockRendering.Highlighter.prototype.drawTopCorner = function(row) {
  for (var i = 0, elem; elem = row.elements[i]; i++) {
    if (elem.type === 'square corner') {
      this.highlightSteps_.push(Blockly.blockRendering.highlightConstants.START_POINT);
    } else if (elem.type === 'round corner') {
      this.highlightSteps_.push(
          this.outsideCornerPaths_.topLeft(this.info_.RTL));
    } else if (elem.type === 'previous connection') {
      // TODO: move the offsets into the definition of the notch highlight, maybe.
      this.highlightSteps_.push('h',  (this.RTL ? 0.5 : - 0.5));
      this.highlightSteps_.push(this.notchPaths_.pathLeft);
      this.highlightSteps_.push('h',  (this.RTL ? -0.5 : 0.5));
    } else if (elem.type === 'hat') {
      this.highlightSteps_.push(
          this.startPaths_.path(this.info_.RTL));
    } else if (elem.isSpacer()) {
      this.highlightSteps_.push('h', elem.width - this.highlightOffset_);
    }
  }

  this.highlightSteps_.push('H', row.width - this.highlightOffset_);
};

Blockly.blockRendering.Highlighter.prototype.drawValueInput = function(row) {
  var input = row.getLastInput();
  if (this.info_.RTL) {
    var aboveTabHeight = -this.highlightOffset_;
    var belowTabHeight = row.height -
        input.connectionHeight +
        this.highlightOffset_;
    // Edge above tab.
    this.highlightSteps_.push('v', aboveTabHeight);
    // Highlight around back of tab.
    this.highlightSteps_.push(this.puzzleTabPaths_.pathDown(this.info_.RTL));
    // Edge below tab.
    this.highlightSteps_.push('v', belowTabHeight);
  } else {
    this.highlightSteps_.push(Blockly.utils.svgPaths.moveTo(row.width, row.yPos));
    this.highlightSteps_.push(
        this.puzzleTabPaths_.pathDown(this.info_.RTL));
  }
};

Blockly.blockRendering.Highlighter.prototype.drawStatementInput = function(row) {
  var x = row.statementEdge;
  var distance45outside = Blockly.blockRendering.highlightConstants.DISTANCE_45_OUTSIDE;
  if (this.info_.RTL) {
    this.highlightSteps_.push('M',
        (x + distance45outside) +
        ',' + (row.yPos + distance45outside));
    this.highlightSteps_.push(this.insideCornerPaths_.pathTop(this.info_.RTL));
    this.highlightSteps_.push('v',
        row.height - 2 * this.insideCornerPaths_.height);
    this.highlightSteps_.push(this.insideCornerPaths_.pathBottom(this.info_.RTL));
  } else {
    this.highlightSteps_.push('M',
        (x + distance45outside) + ',' +
        (row.yPos + row.height - distance45outside));
    this.highlightSteps_.push(this.insideCornerPaths_.pathBottom(this.info_.RTL));
  }
};

Blockly.blockRendering.Highlighter.prototype.drawRightSideRow = function(row) {
  if (row.followsStatement) {
    this.highlightSteps_.push('H', row.width);
  }
  if (this.info_.RTL) {
    this.highlightSteps_.push('H', row.width - this.highlightOffset_);
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
            this.highlightOffset_ + ',' +
            (height - this.highlightOffset_));
      }
    } else if (elem.type === 'round corner') {
      if (!this.info_.RTL) {
        this.highlightSteps_.push(this.outsideCornerPaths_.bottomLeft(height));
      }
    }
  }
};

Blockly.blockRendering.Highlighter.prototype.drawLeft = function() {
  if (this.info_.outputConnection) {
    this.highlightSteps_.push(
        this.puzzleTabPaths_.pathUp(this.info_.RTL));
  }

  if (!this.info_.RTL) {
    if (this.info_.topRow.elements[0].isSquareCorner()) {
      this.highlightSteps_.push('V', this.highlightOffset_);
    } else {
      this.highlightSteps_.push('V', this.outsideCornerPaths_.height);
    }
  }
};

Blockly.blockRendering.Highlighter.prototype.drawInlineInput = function(input) {
  var offset = this.highlightOffset_;

  // Relative to the block's left.
  var connectionRight = input.xPos + input.connectionWidth;
  var yPos = input.centerline - input.height / 2;
  var bottomHighlightWidth = input.width - input.connectionWidth;
  var startY = yPos + offset;

  if (this.info_.RTL) {
    // TODO: Check if this is different when the inline input is populated.
    var aboveTabHeight = input.connectionOffsetY - offset;
    var belowTabHeight =
        input.height - (input.connectionOffsetY + input.connectionHeight) + offset;

    var startX = connectionRight - offset;

    // Highlight right edge, around back of tab, and bottom.
    this.highlightInlineSteps_.push('M', startX + ',' + startY);
    // Right edge above tab.
    this.highlightInlineSteps_.push('v', aboveTabHeight);
    // Back of tab.
    this.highlightInlineSteps_.push(
        this.puzzleTabPaths_.pathDown(this.info_.RTL));
    // Right edge below tab.
    this.highlightInlineSteps_.push('v', belowTabHeight);
    // Bottom (horizontal).
    this.highlightInlineSteps_.push('h', bottomHighlightWidth);
  } else {
    // Go to top right corner.
    this.highlightInlineSteps_.push(
        Blockly.utils.svgPaths.moveTo(input.xPos + input.width + offset, startY));
    // Highlight right edge, bottom.
    this.highlightInlineSteps_.push('v', input.height);
    this.highlightInlineSteps_.push('h ', -bottomHighlightWidth);
    // Go to top of tab.
    this.highlightSteps_.push(Blockly.utils.svgPaths.moveTo(
        connectionRight, yPos + input.connectionOffsetY));
    // Short highlight glint at bottom of tab.
    this.highlightSteps_.push(
        this.puzzleTabPaths_.pathDown(this.info_.RTL));
  }
};
