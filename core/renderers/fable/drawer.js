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
 * @fileoverview Renderer that preserves the look and feel of Blockly pre-2019.
 * @author ivan@shaperobotics.com (Ivan Mladenov)
 */
'use strict';

goog.provide('Blockly.fable.Drawer');

goog.require('Blockly.blockRendering.ConstantProvider');
goog.require('Blockly.blockRendering.Drawer');
goog.require('Blockly.fable.Highlighter');
goog.require('Blockly.fable.PathObject');
goog.require('Blockly.fable.RenderInfo');
goog.require('Blockly.utils.object');
goog.require('Blockly.utils.svgPaths');

/**
 * An object that draws a block based on the given rendering information.
 * @param {!Blockly.BlockSvg} block The block to render.
 * @param {!Blockly.fable.RenderInfo} info An object containing all
 *   information needed to render this block.
 * @package
 * @constructor
 * @extends {Blockly.blockRendering.Drawer}
 */
Blockly.fable.Drawer = function (block, info) {
  Blockly.fable.Drawer.superClass_.constructor.call(this, block, info);
  // Unlike Thrasos, fable has highlights and drop shadows.
  this.highlighter_ = new Blockly.fable.Highlighter(info);
};
Blockly.utils.object.inherits(Blockly.fable.Drawer,
  Blockly.blockRendering.Drawer);

/**
 * @override
 */
Blockly.fable.Drawer.prototype.draw = function () {
  var outputConnection = this.info_.outputConnection;
  if (outputConnection) {
    var tabBottom = 0;
    for (let i = 0; i < this.info_.rows.length; i++) {
      const row = this.info_.rows[i];

      tabBottom += row.height;

      if (Blockly.blockRendering.Types.isTopOrBottomRow(row)) {
        tabBottom += row.height;
      }
      if (Blockly.blockRendering.Types.isInputRow(row)) {
        break;
      }
    }

    tabBottom = (tabBottom / 2) + (outputConnection.shape.height / 2);
    this.info_.tabBottom_ = tabBottom;
  } else {
    this.info_.tabBottom_ = 0;
  }

  this.hideHiddenIcons_();
  this.drawOutline_();
  this.drawInternals_();

  this.block_.pathObject.setPaths(this.outlinePath_ + '\n' + this.inlinePath_,
    this.highlighter_.getPath());
  if (this.info_.RTL) {
    this.block_.pathObject.flipRTL();
  }
  if (Blockly.blockRendering.useDebugger) {
    this.block_.renderingDebugger.drawDebug(this.block_, this.info_);
  }
  this.recordSizeOnBlock_();
};

/**
 * @override
 */
Blockly.fable.Drawer.prototype.drawTop_ = function () {
  this.highlighter_.drawTopCorner(this.info_.topRow);
  this.highlighter_.drawRightSideRow(this.info_.topRow);

  Blockly.fable.Drawer.superClass_.drawTop_.call(this);
};

/**
 * @override
 */
Blockly.fable.Drawer.prototype.drawJaggedEdge_ = function (row) {
  this.highlighter_.drawJaggedEdge_(row);

  Blockly.fable.Drawer.superClass_.drawJaggedEdge_.call(this, row);
};

/**
 * @override
 */
Blockly.fable.Drawer.prototype.drawValueInput_ = function (row) {
  var rowHeight = 0;

  for (let i = 0; i < row.elements.length; i++) {
    const elem = row.elements[i];

    if (Blockly.blockRendering.Types.isInRowSpacer(elem)) {
      continue;
    } else if (Blockly.blockRendering.Types.isExternalInput(elem)) {
      if (elem.connectedBlock && elem.connectedBlock.firstRowHeight) {
        rowHeight = Math.max(rowHeight, elem.connectedBlock.firstRowHeight);
      }
    } else {
      rowHeight = Math.max(rowHeight, elem.height);
    }
  }

  if (rowHeight === 0) {
    rowHeight = row.height;
  }

  this.highlighter_.drawValueInput(row, rowHeight);
  this.drawValueInputInner_(row, rowHeight);
};

/**
   * Add steps for an external value input, rendered as a notch in the side
   * of the block.
   * @param {!Blockly.blockRendering.Row} row The row that this input
   *     belongs to.
   * @protected
   */
Blockly.blockRendering.Drawer.prototype.drawValueInputInner_ = function (row, rowHeight) {
  var input = row.getLastInput();
  this.positionExternalValueConnection_(row, rowHeight);

  var pathDown = (typeof input.shape.pathDown === 'function')
    ? input.shape.pathDown(input.height)
    : input.shape.pathDown;

  var addedHeight = rowHeight - input.connectionHeight;

  this.outlinePath_ +=
        Blockly.utils.svgPaths.lineOnAxis('H', input.xPos + input.width) +
        Blockly.utils.svgPaths.lineOnAxis('v', addedHeight / 2) +
        pathDown +
        Blockly.utils.svgPaths.lineOnAxis('v', addedHeight / 2);
};

/**
 * @override
 */
Blockly.fable.Drawer.prototype.drawStatementInput_ = function (row) {
  this.highlighter_.drawStatementInput(row);

  Blockly.fable.Drawer.superClass_.drawStatementInput_.call(this, row);
};

/**
 * @override
 */
Blockly.fable.Drawer.prototype.drawRightSideRow_ = function (row) {
  this.highlighter_.drawRightSideRow(row);
  Blockly.fable.Drawer.superClass_.drawRightSideRow_.call(this, row);
};

/**
 * @override
 */
Blockly.fable.Drawer.prototype.drawBottom_ = function () {
  this.highlighter_.drawBottomRow(this.info_.bottomRow);

  Blockly.fable.Drawer.superClass_.drawBottom_.call(this);
};

/**
 * Add steps for the left side of the block, which may include an output
 * connection
 * @private
 */
Blockly.fable.Drawer.prototype.drawLeft_ = function () {
  this.highlighter_.drawLeft();

  this.drawLeftInner_();
};

Blockly.fable.Drawer.prototype.drawLeftInner_ = function () {
  var outputConnection = this.info_.outputConnection;
  this.positionOutputConnection_();

  if (outputConnection) {
    var pathUp = (typeof outputConnection.shape.pathUp === 'function')
      ? outputConnection.shape.pathUp(outputConnection.height)
      : outputConnection.shape.pathUp;

    // Draw a line up to the bottom of the tab.
    this.outlinePath_ +=
        Blockly.utils.svgPaths.lineOnAxis('V', this.info_.tabBottom_) +
        pathUp;
  }
  // Close off the path.  This draws a vertical line up to the start of the
  // block's path, which may be either a rounded or a sharp corner.
  this.outlinePath_ += 'z';
};

/**
 * @override
 */
Blockly.fable.Drawer.prototype.drawInlineInput_ = function (input) {
  this.highlighter_.drawInlineInput(input);
  this.drawInlineInputInner_(input);
};

/**
   * Add steps for an inline input.
   * @param {!Blockly.blockRendering.InlineInput} input The information about the
   * input to render.
   * @protected
   */
Blockly.fable.Drawer.prototype.drawInlineInputInner_ = function (input) {
  var width = input.width;
  var height = input.height;
  var yPos = input.centerline - height / 2;

  var connectionTop = ((height - input.connectionHeight) / 2);
  var connectionBottom = input.connectionHeight + connectionTop;
  var connectionRight = input.xPos + input.connectionWidth;

  this.inlinePath_ += Blockly.utils.svgPaths.moveTo(connectionRight, yPos) +
        Blockly.utils.svgPaths.lineOnAxis('v', connectionTop) +
        input.shape.pathDown +
        Blockly.utils.svgPaths.lineOnAxis('v', height - connectionBottom) +
        Blockly.utils.svgPaths.lineOnAxis('h', width - input.connectionWidth) +
        Blockly.utils.svgPaths.lineOnAxis('v', -height) +
        'z';

  this.positionInlineInputConnection_(input);
};

/**
 * @override
 */
Blockly.fable.Drawer.prototype.positionInlineInputConnection_ = function (input) {
  var yPos = input.centerline - input.height / 2;
  // Move the connection.
  if (input.connection) {
    // xPos already contains info about startX
    var connX = input.xPos + input.connectionWidth +
        this.constants_.DARK_PATH_OFFSET;
    if (this.info_.RTL) {
      connX *= -1;
    }
    input.connection.setOffsetInBlock(
      connX, yPos + input.connectionOffsetY +
        this.constants_.DARK_PATH_OFFSET);
    var puzzlePieceOffset = (input.height - input.shape.height) / 2;
    input.connection.setPuzzlePieceVerticalOffset(puzzlePieceOffset);
  }
};

/**
 * @override
 */
Blockly.fable.Drawer.prototype.positionStatementInputConnection_ = function (row) {
  var input = row.getLastInput();
  if (input.connection) {
    var connX = row.xPos + row.statementEdge + input.notchOffset;
    if (this.info_.RTL) {
      connX *= -1;
    } else {
      connX += this.constants_.DARK_PATH_OFFSET;
    }
    input.connection.setOffsetInBlock(connX,
      row.yPos + this.constants_.DARK_PATH_OFFSET);
  }
};

/**
 * @override
 */
Blockly.fable.Drawer.prototype.positionExternalValueConnection_ = function (row, rowHeight) {
  var input = row.getLastInput();
  if (input.connection) {
    var connX = row.xPos + row.width +
        this.constants_.DARK_PATH_OFFSET;
    if (this.info_.RTL) {
      connX *= -1;
    }
    var heightAdded = this.info_.topRow.height + this.info_.bottomRow.height + ((rowHeight - input.shape.height) / 2);
    input.connection.setOffsetInBlock(connX, row.yPos);
    input.connection.setPuzzlePieceVerticalOffset(heightAdded);
  }
};

/**
 * @override
 */
Blockly.fable.Drawer.prototype.positionNextConnection_ = function () {
  var bottomRow = this.info_.bottomRow;

  if (bottomRow.connection) {
    var connInfo = bottomRow.connection;
    var x = connInfo.xPos; // Already contains info about startX
    var connX = (this.info_.RTL ? -x : x) +
        (this.constants_.DARK_PATH_OFFSET / 2);
    connInfo.connectionModel.setOffsetInBlock(
      connX, (connInfo.centerline - connInfo.height / 2) +
        this.constants_.DARK_PATH_OFFSET);
  }
};
