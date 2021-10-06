/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Renderer that preserves the look and feel of Blockly pre-2019.
 * @author fenichel@google.com (Rachel Fenichel)
 */
'use strict';

goog.provide('Blockly.geras.Drawer');

goog.require('Blockly.blockRendering.Drawer');
goog.require('Blockly.geras.Highlighter');
goog.require('Blockly.geras.RenderInfo');
goog.require('Blockly.utils.object');
goog.require('Blockly.utils.svgPaths');

goog.requireType('Blockly.BlockSvg');
goog.requireType('Blockly.geras.PathObject');


/**
 * An object that draws a block based on the given rendering information.
 * @param {!Blockly.BlockSvg} block The block to render.
 * @param {!Blockly.geras.RenderInfo} info An object containing all
 *   information needed to render this block.
 * @package
 * @constructor
 * @extends {Blockly.blockRendering.Drawer}
 */
Blockly.geras.Drawer = function(block, info) {
  Blockly.geras.Drawer.superClass_.constructor.call(this, block, info);
  // Unlike Thrasos, Geras has highlights and drop shadows.
  this.highlighter_ = new Blockly.geras.Highlighter(info);
};
Blockly.utils.object.inherits(Blockly.geras.Drawer,
    Blockly.blockRendering.Drawer);

/**
 * @override
 */
Blockly.geras.Drawer.prototype.draw = function() {
  this.hideHiddenIcons_();
  this.drawOutline_();
  this.drawInternals_();

  var pathObject =
    /** @type {!Blockly.geras.PathObject} */ (this.block_.pathObject);
  pathObject.setPath(this.outlinePath_ + '\n' + this.inlinePath_);
  pathObject.setHighlightPath(this.highlighter_.getPath());
  if (this.info_.RTL) {
    pathObject.flipRTL();
  }
  if (Blockly.blockRendering.useDebugger) {
    this.block_.renderingDebugger.drawDebug(this.block_, this.info_);
  }
  this.recordSizeOnBlock_();
};

/**
 * @override
 */
Blockly.geras.Drawer.prototype.drawTop_ = function() {
  this.highlighter_.drawTopCorner(this.info_.topRow);
  this.highlighter_.drawRightSideRow(this.info_.topRow);

  Blockly.geras.Drawer.superClass_.drawTop_.call(this);
};

/**
 * @override
 */
Blockly.geras.Drawer.prototype.drawJaggedEdge_ = function(row) {
  this.highlighter_.drawJaggedEdge_(row);

  Blockly.geras.Drawer.superClass_.drawJaggedEdge_.call(this, row);
};

/**
 * @override
 */
Blockly.geras.Drawer.prototype.drawValueInput_ = function(row) {
  this.highlighter_.drawValueInput(row);

  Blockly.geras.Drawer.superClass_.drawValueInput_.call(this, row);
};

/**
 * @override
 */
Blockly.geras.Drawer.prototype.drawStatementInput_ = function(row) {
  this.highlighter_.drawStatementInput(row);

  Blockly.geras.Drawer.superClass_.drawStatementInput_.call(this, row);
};

/**
 * @override
 */
Blockly.geras.Drawer.prototype.drawRightSideRow_ = function(row) {
  this.highlighter_.drawRightSideRow(row);

  this.outlinePath_ +=
      Blockly.utils.svgPaths.lineOnAxis('H', row.xPos + row.width) +
      Blockly.utils.svgPaths.lineOnAxis('V', row.yPos + row.height);
};

/**
 * @override
 */
Blockly.geras.Drawer.prototype.drawBottom_ = function() {
  this.highlighter_.drawBottomRow(this.info_.bottomRow);

  Blockly.geras.Drawer.superClass_.drawBottom_.call(this);
};

/**
 * Add steps for the left side of the block, which may include an output
 * connection
 * @protected
 * @override
 */
Blockly.geras.Drawer.prototype.drawLeft_ = function() {
  this.highlighter_.drawLeft();

  Blockly.geras.Drawer.superClass_.drawLeft_.call(this);
};

/**
 * @override
 */
Blockly.geras.Drawer.prototype.drawInlineInput_ = function(input) {
  this.highlighter_.drawInlineInput(input);

  Blockly.geras.Drawer.superClass_.drawInlineInput_.call(this, input);
};

/**
 * @override
 */
Blockly.geras.Drawer.prototype.positionInlineInputConnection_ = function(input) {
  var yPos = input.centerline - input.height / 2;
  // Move the connection.
  if (input.connectionModel) {
    // xPos already contains info about startX
    var connX = input.xPos + input.connectionWidth +
        this.constants_.DARK_PATH_OFFSET;
    if (this.info_.RTL) {
      connX *= -1;
    }
    input.connectionModel.setOffsetInBlock(
        connX, yPos + input.connectionOffsetY +
        this.constants_.DARK_PATH_OFFSET);
  }
};

/**
 * @override
 */
Blockly.geras.Drawer.prototype.positionStatementInputConnection_ = function(row) {
  var input = row.getLastInput();
  if (input.connectionModel) {
    var connX = row.xPos + row.statementEdge + input.notchOffset;
    if (this.info_.RTL) {
      connX *= -1;
    } else {
      connX += this.constants_.DARK_PATH_OFFSET;
    }
    input.connectionModel.setOffsetInBlock(connX,
        row.yPos + this.constants_.DARK_PATH_OFFSET);
  }
};

/**
 * @override
 */
Blockly.geras.Drawer.prototype.positionExternalValueConnection_ = function(row) {
  var input = row.getLastInput();
  if (input.connectionModel) {
    var connX = row.xPos + row.width +
        this.constants_.DARK_PATH_OFFSET;
    if (this.info_.RTL) {
      connX *= -1;
    }
    input.connectionModel.setOffsetInBlock(connX, row.yPos);
  }
};

/**
 * @override
 */
Blockly.geras.Drawer.prototype.positionNextConnection_ = function() {
  var bottomRow = this.info_.bottomRow;

  if (bottomRow.connection) {
    var connInfo = bottomRow.connection;
    var x = connInfo.xPos;  // Already contains info about startX.
    var connX = (this.info_.RTL ? -x : x) +
        (this.constants_.DARK_PATH_OFFSET / 2);
    connInfo.connectionModel.setOffsetInBlock(
        connX, bottomRow.baseline + this.constants_.DARK_PATH_OFFSET);
  }
};
