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

goog.module('Blockly.geras.Drawer');
goog.module.declareLegacyNamespace();

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
const Drawer = function(block, info) {
  Drawer.superClass_.constructor.call(this, block, info);
  // Unlike Thrasos, Geras has highlights and drop shadows.
  this.highlighter_ = new Blockly.geras.Highlighter(info);
};
Blockly.utils.object.inherits(Drawer,
    Blockly.blockRendering.Drawer);

/**
 * @override
 */
Drawer.prototype.draw = function() {
  this.hideHiddenIcons_();
  this.drawOutline_();
  this.drawInternals_();

  const pathObject =
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
Drawer.prototype.drawTop_ = function() {
  this.highlighter_.drawTopCorner(this.info_.topRow);
  this.highlighter_.drawRightSideRow(this.info_.topRow);

  Drawer.superClass_.drawTop_.call(this);
};

/**
 * @override
 */
Drawer.prototype.drawJaggedEdge_ = function(row) {
  this.highlighter_.drawJaggedEdge_(row);

  Drawer.superClass_.drawJaggedEdge_.call(this, row);
};

/**
 * @override
 */
Drawer.prototype.drawValueInput_ = function(row) {
  this.highlighter_.drawValueInput(row);

  Drawer.superClass_.drawValueInput_.call(this, row);
};

/**
 * @override
 */
Drawer.prototype.drawStatementInput_ = function(row) {
  this.highlighter_.drawStatementInput(row);

  Drawer.superClass_.drawStatementInput_.call(this, row);
};

/**
 * @override
 */
Drawer.prototype.drawRightSideRow_ = function(row) {
  this.highlighter_.drawRightSideRow(row);

  this.outlinePath_ +=
      Blockly.utils.svgPaths.lineOnAxis('H', row.xPos + row.width) +
      Blockly.utils.svgPaths.lineOnAxis('V', row.yPos + row.height);
};

/**
 * @override
 */
Drawer.prototype.drawBottom_ = function() {
  this.highlighter_.drawBottomRow(this.info_.bottomRow);

  Drawer.superClass_.drawBottom_.call(this);
};

/**
 * Add steps for the left side of the block, which may include an output
 * connection
 * @protected
 * @override
 */
Drawer.prototype.drawLeft_ = function() {
  this.highlighter_.drawLeft();

  Drawer.superClass_.drawLeft_.call(this);
};

/**
 * @override
 */
Drawer.prototype.drawInlineInput_ = function(input) {
  this.highlighter_.drawInlineInput(input);

  Drawer.superClass_.drawInlineInput_.call(this, input);
};

/**
 * @override
 */
Drawer.prototype.positionInlineInputConnection_ = function(input) {
  const yPos = input.centerline - input.height / 2;
  // Move the connection.
  if (input.connectionModel) {
    // xPos already contains info about startX
    let connX = input.xPos + input.connectionWidth +
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
Drawer.prototype.positionStatementInputConnection_ = function(row) {
  const input = row.getLastInput();
  if (input.connectionModel) {
    let connX = row.xPos + row.statementEdge + input.notchOffset;
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
Drawer.prototype.positionExternalValueConnection_ = function(row) {
  const input = row.getLastInput();
  if (input.connectionModel) {
    let connX = row.xPos + row.width +
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
Drawer.prototype.positionNextConnection_ = function() {
  const bottomRow = this.info_.bottomRow;

  if (bottomRow.connection) {
    const connInfo = bottomRow.connection;
    const x = connInfo.xPos;  // Already contains info about startX.
    const connX = (this.info_.RTL ? -x : x) +
        (this.constants_.DARK_PATH_OFFSET / 2);
    connInfo.connectionModel.setOffsetInBlock(
        connX, bottomRow.baseline + this.constants_.DARK_PATH_OFFSET);
  }
};

exports = Drawer;
