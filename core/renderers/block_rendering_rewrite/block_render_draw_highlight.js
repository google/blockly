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
  this.steps_ = this.pathObject_.highlightSteps;
  this.inlineSteps_ = this.pathObject_.highlightInlineSteps;

  this.RTL_ = this.info_.RTL;

  /**
   * The offset between the block's main path and highlight path.
   * @type {number}
   * @private
   */
  this.highlightOffset_ = Blockly.blockRendering.highlightConstants.OFFSET;

  this.outsideCornerPaths_ = Blockly.blockRendering.highlightConstants.OUTSIDE_CORNER;
  this.insideCornerPaths_ = Blockly.blockRendering.highlightConstants.INSIDE_CORNER;
  this.puzzleTabPaths_ = Blockly.blockRendering.highlightConstants.PUZZLE_TAB;
  this.notchPaths_ = Blockly.blockRendering.highlightConstants.NOTCH;
  this.startPaths_ = Blockly.blockRendering.highlightConstants.START_HAT;
  this.jaggedTeethPaths_ =
      Blockly.blockRendering.highlightConstants.JAGGED_TEETH;
};

Blockly.blockRendering.Highlighter.prototype.drawTopCorner = function(row) {
  for (var i = 0, elem; elem = row.elements[i]; i++) {
    if (elem.type === 'square corner') {
      this.steps_.push(Blockly.blockRendering.highlightConstants.START_POINT);
    } else if (elem.type === 'round corner') {
      this.steps_.push(
          this.outsideCornerPaths_.topLeft(this.RTL_));
    } else if (elem.type === 'previous connection') {
      this.steps_.push(this.notchPaths_.pathLeft);
    } else if (elem.type === 'hat') {
      this.steps_.push(this.startPaths_.path(this.RTL_));
    } else if (elem.isSpacer()) {
      // The end point of the spacer needs to be offset by the highlight amount.
      // So instead of using the spacer's width for a relative horizontal, use
      // its width and position for an absolute horizontal move.
      this.steps_.push('H', elem.xPos + elem.width - this.highlightOffset_);
    }
  }

  this.steps_.push('H', row.width - this.highlightOffset_);
};

Blockly.blockRendering.Highlighter.prototype.drawJaggedEdge_ = function(row) {
  if (this.info_.RTL) {
    this.steps_.push('H', row.width - this.highlightOffset_);
    this.steps_.push(this.jaggedTeethPaths_.pathLeft);
    var remainder =
        row.height - this.jaggedTeethPaths_.height - this.highlightOffset_;
    this.steps_.push(Blockly.utils.svgPaths.lineOnAxis('v', remainder));
  }
};

Blockly.blockRendering.Highlighter.prototype.drawValueInput = function(row) {
  var input = row.getLastInput();
  var steps = '';
  if (this.RTL_) {
    var aboveTabHeight = -this.highlightOffset_;
    var belowTabHeight =
        row.height - input.connectionHeight + this.highlightOffset_;

    steps =
        Blockly.utils.svgPaths.lineOnAxis('v', aboveTabHeight) +
        this.puzzleTabPaths_.pathDown(this.RTL_) +
        Blockly.utils.svgPaths.lineOnAxis('v', belowTabHeight);
  } else {
    steps =
        Blockly.utils.svgPaths.moveTo(row.width, row.yPos) +
        this.puzzleTabPaths_.pathDown(this.RTL_);
  }

  this.steps_.push(steps);
};

Blockly.blockRendering.Highlighter.prototype.drawStatementInput = function(row) {
  var steps = '';
  if (this.RTL_) {
    var innerHeight = row.height - (2 * this.insideCornerPaths_.height);
    steps =
        Blockly.utils.svgPaths.moveTo(row.statementEdge, row.yPos) +
        this.insideCornerPaths_.pathTop(this.RTL_) +
        Blockly.utils.svgPaths.lineOnAxis('v', innerHeight) +
        this.insideCornerPaths_.pathBottom(this.RTL_);
  } else {
    steps =
        Blockly.utils.svgPaths.moveTo(row.statementEdge, row.yPos + row.height) +
        this.insideCornerPaths_.pathBottom(this.RTL_);
  }
  this.steps_.push(steps);
};

Blockly.blockRendering.Highlighter.prototype.drawRightSideRow = function(row) {
  if (row.followsStatement) {
    this.steps_.push('H', row.width);
  }
  if (this.RTL_) {
    this.steps_.push('H', row.width - this.highlightOffset_);
    this.steps_.push('v', row.height);
  }
};

Blockly.blockRendering.Highlighter.prototype.drawBottomRow = function(_row) {
  var height = this.info_.height;

  // Highlight the vertical edge of the bottom row on the input side.
  // Highlighting is always from the top left, both in LTR and RTL.
  if (this.RTL_) {
    this.steps_.push('V', height);
  } else {
    var cornerElem = this.info_.bottomRow.elements[0];
    if (cornerElem.type === 'square corner') {
      this.steps_.push(
          Blockly.utils.svgPaths.moveTo(
              this.highlightOffset_, height - this.highlightOffset_));
    } else if (cornerElem.type === 'round corner') {
      this.steps_.push(this.outsideCornerPaths_.bottomLeft(height));
    }
  }
};

Blockly.blockRendering.Highlighter.prototype.drawLeft = function() {
  if (this.info_.outputConnection) {
    this.steps_.push(
        this.puzzleTabPaths_.pathUp(this.RTL_));
  }

  if (!this.RTL_) {
    if (this.info_.topRow.elements[0].isSquareCorner()) {
      this.steps_.push('V', this.highlightOffset_);
    } else {
      this.steps_.push('V', this.outsideCornerPaths_.height);
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

  if (this.RTL_) {
    // TODO: Check if this is different when the inline input is populated.
    var aboveTabHeight = input.connectionOffsetY - offset;
    var belowTabHeight =
        input.height - (input.connectionOffsetY + input.connectionHeight) + offset;

    var startX = connectionRight - offset;

    var steps = Blockly.utils.svgPaths.moveTo(startX, startY) +
        // Right edge above tab.
        Blockly.utils.svgPaths.lineOnAxis('v', aboveTabHeight) +
        // Back of tab.
        this.puzzleTabPaths_.pathDown(this.RTL_) +
        // Right edge below tab.
        Blockly.utils.svgPaths.lineOnAxis('v', belowTabHeight) +
        // Bottom.
        Blockly.utils.svgPaths.lineOnAxis('h', bottomHighlightWidth);

    this.inlineSteps_.push(steps);

  } else {

    var steps =
        // Go to top right corner.
        Blockly.utils.svgPaths.moveTo(input.xPos + input.width + offset, startY) +
        // Highlight right edge, bottom.
        Blockly.utils.svgPaths.lineOnAxis('v', input.height) +
        Blockly.utils.svgPaths.lineOnAxis('h', -bottomHighlightWidth) +
        // Go to top of tab.
        Blockly.utils.svgPaths.moveTo(connectionRight, yPos + input.connectionOffsetY) +
        // Short highlight glint at bottom of tab.
        this.puzzleTabPaths_.pathDown(this.RTL_);

    this.inlineSteps_.push(steps);
  }
};
