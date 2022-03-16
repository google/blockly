/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Renderer that preserves the look and feel of Blockly pre-2019.
 */
'use strict';

/**
 * Renderer that preserves the look and feel of Blockly pre-2019.
 * @class
 */
goog.module('Blockly.geras.Drawer');

const debug = goog.require('Blockly.blockRendering.debug');
const svgPaths = goog.require('Blockly.utils.svgPaths');
/* eslint-disable-next-line no-unused-vars */
const {BlockSvg} = goog.requireType('Blockly.BlockSvg');
/* eslint-disable-next-line no-unused-vars */
const {ConstantProvider} = goog.requireType('Blockly.geras.ConstantProvider');
const {Drawer: BaseDrawer} = goog.require('Blockly.blockRendering.Drawer');
const {Highlighter} = goog.require('Blockly.geras.Highlighter');
/* eslint-disable-next-line no-unused-vars */
const {InlineInput} = goog.require('Blockly.geras.InlineInput');
/* eslint-disable-next-line no-unused-vars */
const {PathObject} = goog.requireType('Blockly.geras.PathObject');
/* eslint-disable-next-line no-unused-vars */
const {RenderInfo} = goog.requireType('Blockly.geras.RenderInfo');


/**
 * An object that draws a block based on the given rendering information.
 * @extends {BaseDrawer}
 * @alias Blockly.geras.Drawer
 */
class Drawer extends BaseDrawer {
  /**
   * @param {!BlockSvg} block The block to render.
   * @param {!RenderInfo} info An object containing all
   *   information needed to render this block.
   * @package
   */
  constructor(block, info) {
    super(block, info);
    // Unlike Thrasos, Geras has highlights and drop shadows.
    this.highlighter_ = new Highlighter(info);

    /** @type {!ConstantProvider} */
    this.constants_;
  }

  /**
   * @override
   */
  draw() {
    this.hideHiddenIcons_();
    this.drawOutline_();
    this.drawInternals_();

    const pathObject =
        /** @type {!PathObject} */ (this.block_.pathObject);
    pathObject.setPath(this.outlinePath_ + '\n' + this.inlinePath_);
    pathObject.setHighlightPath(this.highlighter_.getPath());
    if (this.info_.RTL) {
      pathObject.flipRTL();
    }
    if (debug.isDebuggerEnabled()) {
      this.block_.renderingDebugger.drawDebug(this.block_, this.info_);
    }
    this.recordSizeOnBlock_();
  }

  /**
   * @override
   */
  drawTop_() {
    this.highlighter_.drawTopCorner(this.info_.topRow);
    this.highlighter_.drawRightSideRow(this.info_.topRow);

    super.drawTop_();
  }

  /**
   * @override
   */
  drawJaggedEdge_(row) {
    this.highlighter_.drawJaggedEdge_(row);

    super.drawJaggedEdge_(row);
  }

  /**
   * @override
   */
  drawValueInput_(row) {
    this.highlighter_.drawValueInput(row);

    super.drawValueInput_(row);
  }

  /**
   * @override
   */
  drawStatementInput_(row) {
    this.highlighter_.drawStatementInput(row);

    super.drawStatementInput_(row);
  }

  /**
   * @override
   */
  drawRightSideRow_(row) {
    this.highlighter_.drawRightSideRow(row);

    this.outlinePath_ += svgPaths.lineOnAxis('H', row.xPos + row.width) +
        svgPaths.lineOnAxis('V', row.yPos + row.height);
  }

  /**
   * @override
   */
  drawBottom_() {
    this.highlighter_.drawBottomRow(this.info_.bottomRow);

    super.drawBottom_();
  }

  /**
   * Add steps for the left side of the block, which may include an output
   * connection
   * @protected
   * @override
   */
  drawLeft_() {
    this.highlighter_.drawLeft();

    super.drawLeft_();
  }

  /**
   * @override
   */
  drawInlineInput_(input) {
    this.highlighter_.drawInlineInput(/** @type {!InlineInput} */ (input));

    super.drawInlineInput_(input);
  }

  /**
   * @override
   */
  positionInlineInputConnection_(input) {
    const yPos = input.centerline - input.height / 2;
    // Move the connection.
    if (input.connectionModel) {
      // xPos already contains info about startX
      let connX =
          input.xPos + input.connectionWidth + this.constants_.DARK_PATH_OFFSET;
      if (this.info_.RTL) {
        connX *= -1;
      }
      input.connectionModel.setOffsetInBlock(
          connX,
          yPos + input.connectionOffsetY + this.constants_.DARK_PATH_OFFSET);
    }
  }

  /**
   * @override
   */
  positionStatementInputConnection_(row) {
    const input = row.getLastInput();
    if (input.connectionModel) {
      let connX = row.xPos + row.statementEdge + input.notchOffset;
      if (this.info_.RTL) {
        connX *= -1;
      } else {
        connX += this.constants_.DARK_PATH_OFFSET;
      }
      input.connectionModel.setOffsetInBlock(
          connX, row.yPos + this.constants_.DARK_PATH_OFFSET);
    }
  }

  /**
   * @override
   */
  positionExternalValueConnection_(row) {
    const input = row.getLastInput();
    if (input.connectionModel) {
      let connX = row.xPos + row.width + this.constants_.DARK_PATH_OFFSET;
      if (this.info_.RTL) {
        connX *= -1;
      }
      input.connectionModel.setOffsetInBlock(connX, row.yPos);
    }
  }

  /**
   * @override
   */
  positionNextConnection_() {
    const bottomRow = this.info_.bottomRow;

    if (bottomRow.connection) {
      const connInfo = bottomRow.connection;
      const x = connInfo.xPos;  // Already contains info about startX.
      const connX =
          (this.info_.RTL ? -x : x) + (this.constants_.DARK_PATH_OFFSET / 2);
      connInfo.connectionModel.setOffsetInBlock(
          connX, bottomRow.baseline + this.constants_.DARK_PATH_OFFSET);
    }
  }
}

exports.Drawer = Drawer;
