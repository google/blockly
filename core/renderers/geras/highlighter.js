/**
 * @license
 * Copyright 2019 Google LLC
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
 * @fileoverview Methods for adding highlights on block, for rendering in
 * compatibility mode.
 * @author fenichel@google.com (Rachel Fenichel)
 */
'use strict';

goog.provide('Blockly.geras.Highlighter');

goog.require('Blockly.blockRendering.BottomRow');
goog.require('Blockly.blockRendering.InputRow');
goog.require('Blockly.blockRendering.Measurable');
goog.require('Blockly.blockRendering.RenderInfo');
goog.require('Blockly.blockRendering.Row');
goog.require('Blockly.blockRendering.SpacerRow');
goog.require('Blockly.blockRendering.TopRow');
goog.require('Blockly.blockRendering.Types');
goog.require('Blockly.utils.svgPaths');


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
 * @param {!Blockly.geras.RenderInfo} info An object containing all
 *     information needed to render this block.
 * @package
 * @constructor
 */
Blockly.geras.Highlighter = function(info) {
  this.info_ = info;
  this.steps_ = '';
  this.inlineSteps_ = '';

  this.RTL_ = this.info_.RTL;

  var renderer = /** @type {!Blockly.geras.Renderer} */ (info.getRenderer());

  /**
   * The renderer's constant provider.
   * @type {!Blockly.blockRendering.ConstantProvider}
   */
  this.constants_ = renderer.getConstants();

  /**
   * @type {!Blockly.geras.HighlightConstantProvider}
   */
  this.highlightConstants_ = renderer.getHighlightConstants();
  /**
   * The offset between the block's main path and highlight path.
   * @type {number}
   * @private
   */
  this.highlightOffset_ = this.highlightConstants_.OFFSET;

  this.outsideCornerPaths_ = this.highlightConstants_.OUTSIDE_CORNER;
  this.insideCornerPaths_ = this.highlightConstants_.INSIDE_CORNER;
  this.puzzleTabPaths_ = this.highlightConstants_.PUZZLE_TAB;
  this.notchPaths_ = this.highlightConstants_.NOTCH;
  this.startPaths_ = this.highlightConstants_.START_HAT;
  this.jaggedTeethPaths_ =
      this.highlightConstants_.JAGGED_TEETH;
};

/**
 * Get the steps for the highlight path.
 * @return {string} The steps for the highlight path.
 * @package
 */
Blockly.geras.Highlighter.prototype.getPath = function() {
  return this.steps_ + '\n' + this.inlineSteps_;
};

Blockly.geras.Highlighter.prototype.drawTopCorner = function(row) {
  this.steps_ += Blockly.utils.svgPaths.moveBy(row.xPos, this.info_.startY);
  for (var i = 0, elem; (elem = row.elements[i]); i++) {
    if (Blockly.blockRendering.Types.isLeftSquareCorner(elem)) {
      this.steps_ += this.highlightConstants_.START_POINT;
    } else if (Blockly.blockRendering.Types.isLeftRoundedCorner(elem)) {
      this.steps_ += this.outsideCornerPaths_.topLeft(this.RTL_);
    } else if (Blockly.blockRendering.Types.isPreviousConnection(elem)) {
      this.steps_ += this.notchPaths_.pathLeft;
    } else if (Blockly.blockRendering.Types.isHat(elem)) {
      this.steps_ += this.startPaths_.path(this.RTL_);
    } else if (Blockly.blockRendering.Types.isSpacer(elem) && elem.width != 0) {
      // The end point of the spacer needs to be offset by the highlight amount.
      // So instead of using the spacer's width for a relative horizontal, use
      // its width and position for an absolute horizontal move.
      this.steps_ += Blockly.utils.svgPaths.lineOnAxis('H',
          elem.xPos + elem.width - this.highlightOffset_);
    }
  }

  var right = row.xPos + row.width - this.highlightOffset_;
  this.steps_ += Blockly.utils.svgPaths.lineOnAxis('H', right);
};

Blockly.geras.Highlighter.prototype.drawJaggedEdge_ = function(row) {
  if (this.info_.RTL) {
    this.steps_ += Blockly.utils.svgPaths.lineOnAxis('H', row.width - this.highlightOffset_);
    this.steps_ += this.jaggedTeethPaths_.pathLeft;
    var remainder =
        row.height - this.jaggedTeethPaths_.height - this.highlightOffset_;
    this.steps_ += Blockly.utils.svgPaths.lineOnAxis('v', remainder);
  }
};

Blockly.geras.Highlighter.prototype.drawValueInput = function(row) {
  var input = row.getLastInput();
  if (this.RTL_) {
    var belowTabHeight = row.height - input.connectionHeight;

    this.steps_ +=
        Blockly.utils.svgPaths.moveTo(
            input.xPos + input.width - this.highlightOffset_, row.yPos) +
        this.puzzleTabPaths_.pathDown(this.RTL_) +
        Blockly.utils.svgPaths.lineOnAxis('v', belowTabHeight);
  } else {
    this.steps_ +=
        Blockly.utils.svgPaths.moveTo(input.xPos + input.width, row.yPos) +
        this.puzzleTabPaths_.pathDown(this.RTL_);
  }
};

Blockly.geras.Highlighter.prototype.drawStatementInput = function(row) {
  var input = row.getLastInput();
  if (this.RTL_) {
    var innerHeight = row.height - (2 * this.insideCornerPaths_.height);
    this.steps_ +=
        Blockly.utils.svgPaths.moveTo(input.xPos, row.yPos) +
        this.insideCornerPaths_.pathTop(this.RTL_) +
        Blockly.utils.svgPaths.lineOnAxis('v', innerHeight) +
        this.insideCornerPaths_.pathBottom(this.RTL_) +
        Blockly.utils.svgPaths.lineTo(
            row.width - input.xPos - this.insideCornerPaths_.width, 0);
  } else {
    this.steps_ +=
        Blockly.utils.svgPaths.moveTo(input.xPos, row.yPos + row.height) +
        this.insideCornerPaths_.pathBottom(this.RTL_) +
        Blockly.utils.svgPaths.lineTo(
            row.width - input.xPos - this.insideCornerPaths_.width, 0);
  }
};

Blockly.geras.Highlighter.prototype.drawRightSideRow = function(row) {
  var rightEdge = row.xPos + row.width - this.highlightOffset_;
  if (row.followsStatement) {
    this.steps_ += Blockly.utils.svgPaths.lineOnAxis('H', rightEdge);
  }
  if (this.RTL_) {
    this.steps_ += Blockly.utils.svgPaths.lineOnAxis('H', rightEdge);
    if (row.height > this.highlightOffset_) {
      this.steps_ += Blockly.utils.svgPaths.lineOnAxis('V',
          row.yPos + row.height - this.highlightOffset_);
    }
  }
};

Blockly.geras.Highlighter.prototype.drawBottomRow = function(row) {
  // Highlight the vertical edge of the bottom row on the input side.
  // Highlighting is always from the top left, both in LTR and RTL.
  if (this.RTL_) {
    this.steps_ +=
        Blockly.utils.svgPaths.lineOnAxis('V', row.baseline - this.highlightOffset_);
  } else {
    var cornerElem = this.info_.bottomRow.elements[0];
    if (Blockly.blockRendering.Types.isLeftSquareCorner(cornerElem)) {
      this.steps_ += Blockly.utils.svgPaths.moveTo(
          row.xPos + this.highlightOffset_,
          row.baseline - this.highlightOffset_);
    } else if (Blockly.blockRendering.Types.isLeftRoundedCorner(cornerElem)) {
      this.steps_ += Blockly.utils.svgPaths.moveTo(row.xPos, row.baseline);
      this.steps_ += this.outsideCornerPaths_.bottomLeft();
    }
  }
};

Blockly.geras.Highlighter.prototype.drawLeft = function() {
  var outputConnection = this.info_.outputConnection;
  if (outputConnection) {
    var tabBottom =
        outputConnection.connectionOffsetY + outputConnection.height;
    // Draw a line up to the bottom of the tab.
    if (this.RTL_) {
      this.steps_ += Blockly.utils.svgPaths.moveTo(this.info_.startX, tabBottom);
    } else {
      var left = this.info_.startX + this.highlightOffset_;
      var bottom = this.info_.bottomRow.baseline - this.highlightOffset_;
      this.steps_ += Blockly.utils.svgPaths.moveTo(left, bottom);
      this.steps_ += Blockly.utils.svgPaths.lineOnAxis('V', tabBottom);
    }
    this.steps_ += this.puzzleTabPaths_.pathUp(this.RTL_);
  }

  if (!this.RTL_) {
    var topRow = this.info_.topRow;
    if (Blockly.blockRendering.Types.isLeftRoundedCorner(topRow.elements[0])) {
      this.steps_ += Blockly.utils.svgPaths.lineOnAxis('V', this.outsideCornerPaths_.height);
    } else {
      this.steps_ +=
          Blockly.utils.svgPaths.lineOnAxis('V', topRow.capline + this.highlightOffset_);
    }
  }
};

Blockly.geras.Highlighter.prototype.drawInlineInput = function(input) {
  var offset = this.highlightOffset_;

  // Relative to the block's left.
  var connectionRight = input.xPos + input.connectionWidth;
  var yPos = input.centerline - input.height / 2;
  var bottomHighlightWidth = input.width - input.connectionWidth;
  var startY = yPos + offset;

  if (this.RTL_) {
    var aboveTabHeight = input.connectionOffsetY - offset;
    var belowTabHeight = input.height -
        (input.connectionOffsetY + input.connectionHeight) + offset;

    var startX = connectionRight - offset;

    this.inlineSteps_ += Blockly.utils.svgPaths.moveTo(startX, startY) +
        // Right edge above tab.
        Blockly.utils.svgPaths.lineOnAxis('v', aboveTabHeight) +
        // Back of tab.
        this.puzzleTabPaths_.pathDown(this.RTL_) +
        // Right edge below tab.
        Blockly.utils.svgPaths.lineOnAxis('v', belowTabHeight) +
        // Bottom.
        Blockly.utils.svgPaths.lineOnAxis('h', bottomHighlightWidth);
  } else {

    this.inlineSteps_ +=
        // Go to top right corner.
        Blockly.utils.svgPaths.moveTo(input.xPos + input.width + offset, startY) +
        // Highlight right edge, bottom.
        Blockly.utils.svgPaths.lineOnAxis('v', input.height) +
        Blockly.utils.svgPaths.lineOnAxis('h', -bottomHighlightWidth) +
        // Go to top of tab.
        Blockly.utils.svgPaths.moveTo(connectionRight, yPos + input.connectionOffsetY) +
        // Short highlight glint at bottom of tab.
        this.puzzleTabPaths_.pathDown(this.RTL_);
  }
};
