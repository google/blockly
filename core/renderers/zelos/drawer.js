/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Zelos renderer.
 */
'use strict';

/**
 * Zelos renderer.
 * @class
 */
goog.module('Blockly.zelos.Drawer');

const debug = goog.require('Blockly.blockRendering.debug');
const object = goog.require('Blockly.utils.object');
const svgPaths = goog.require('Blockly.utils.svgPaths');
/* eslint-disable-next-line no-unused-vars */
const {BlockSvg} = goog.requireType('Blockly.BlockSvg');
const {Drawer: BaseDrawer} = goog.require('Blockly.blockRendering.Drawer');
/* eslint-disable-next-line no-unused-vars */
const {PathObject} = goog.requireType('Blockly.zelos.PathObject');
/* eslint-disable-next-line no-unused-vars */
const {RenderInfo} = goog.requireType('Blockly.zelos.RenderInfo');
/* eslint-disable-next-line no-unused-vars */
const {Row} = goog.requireType('Blockly.blockRendering.Row');


/**
 * An object that draws a block based on the given rendering information.
 * @param {!BlockSvg} block The block to render.
 * @param {!RenderInfo} info An object containing all
 *   information needed to render this block.
 * @package
 * @constructor
 * @extends {BaseDrawer}
 * @alias Blockly.zelos.Drawer
 */
const Drawer = function(block, info) {
  Drawer.superClass_.constructor.call(this, block, info);
};
object.inherits(Drawer, BaseDrawer);


/**
 * @override
 */
Drawer.prototype.draw = function() {
  const pathObject =
      /** @type {!PathObject} */ (this.block_.pathObject);
  pathObject.beginDrawing();
  this.hideHiddenIcons_();
  this.drawOutline_();
  this.drawInternals_();

  pathObject.setPath(this.outlinePath_ + '\n' + this.inlinePath_);
  if (this.info_.RTL) {
    pathObject.flipRTL();
  }
  if (debug.isDebuggerEnabled()) {
    this.block_.renderingDebugger.drawDebug(this.block_, this.info_);
  }
  this.recordSizeOnBlock_();
  if (this.info_.outputConnection) {
    // Store the output connection shape type for parent blocks to use during
    // rendering.
    pathObject.outputShapeType = this.info_.outputConnection.shape.type;
  }
  pathObject.endDrawing();
};

/**
 * @override
 */
Drawer.prototype.drawOutline_ = function() {
  if (this.info_.outputConnection &&
      this.info_.outputConnection.isDynamicShape &&
      !this.info_.hasStatementInput &&
      !this.info_.bottomRow.hasNextConnection) {
    this.drawFlatTop_();
    this.drawRightDynamicConnection_();
    this.drawFlatBottom_();
    this.drawLeftDynamicConnection_();
  } else {
    Drawer.superClass_.drawOutline_.call(this);
  }
};

/**
 * @override
 */
Drawer.prototype.drawLeft_ = function() {
  if (this.info_.outputConnection &&
      this.info_.outputConnection.isDynamicShape) {
    this.drawLeftDynamicConnection_();
  } else {
    Drawer.superClass_.drawLeft_.call(this);
  }
};

/**
 * Add steps for the right side of a row that does not have value or
 * statement input connections.
 * @param {!Row} row The row to draw the
 *     side of.
 * @protected
 */
Drawer.prototype.drawRightSideRow_ = function(row) {
  if (row.height <= 0) {
    return;
  }
  if (row.precedesStatement || row.followsStatement) {
    const cornerHeight = this.constants_.INSIDE_CORNERS.rightHeight;
    const remainingHeight =
        row.height - (row.precedesStatement ? cornerHeight : 0);
    this.outlinePath_ +=
        (row.followsStatement ? this.constants_.INSIDE_CORNERS.pathBottomRight :
                                '') +
        (remainingHeight > 0 ?
             svgPaths.lineOnAxis('V', row.yPos + remainingHeight) :
             '') +
        (row.precedesStatement ? this.constants_.INSIDE_CORNERS.pathTopRight :
                                 '');
  } else {
    this.outlinePath_ += svgPaths.lineOnAxis('V', row.yPos + row.height);
  }
};

/**
 * Add steps to draw the right side of an output with a dynamic connection.
 * @protected
 */
Drawer.prototype.drawRightDynamicConnection_ = function() {
  this.outlinePath_ += this.info_.outputConnection.shape.pathRightDown(
      this.info_.outputConnection.height);
};

/**
 * Add steps to draw the left side of an output with a dynamic connection.
 * @protected
 */
Drawer.prototype.drawLeftDynamicConnection_ = function() {
  this.positionOutputConnection_();

  this.outlinePath_ += this.info_.outputConnection.shape.pathUp(
      this.info_.outputConnection.height);

  // Close off the path.  This draws a vertical line up to the start of the
  // block's path, which may be either a rounded or a sharp corner.
  this.outlinePath_ += 'z';
};

/**
 * Add steps to draw a flat top row.
 * @protected
 */
Drawer.prototype.drawFlatTop_ = function() {
  const topRow = this.info_.topRow;
  this.positionPreviousConnection_();

  this.outlinePath_ += svgPaths.moveBy(topRow.xPos, this.info_.startY);

  this.outlinePath_ += svgPaths.lineOnAxis('h', topRow.width);
};

/**
 * Add steps to draw a flat bottom row.
 * @protected
 */
Drawer.prototype.drawFlatBottom_ = function() {
  const bottomRow = this.info_.bottomRow;
  this.positionNextConnection_();

  this.outlinePath_ += svgPaths.lineOnAxis('V', bottomRow.baseline);

  this.outlinePath_ += svgPaths.lineOnAxis('h', -bottomRow.width);
};

/**
 * @override
 */
Drawer.prototype.drawInlineInput_ = function(input) {
  this.positionInlineInputConnection_(input);

  const inputName = input.input.name;
  if (input.connectedBlock || this.info_.isInsertionMarker) {
    return;
  }

  const width = input.width - (input.connectionWidth * 2);
  const height = input.height;
  const yPos = input.centerline - height / 2;

  const connectionRight = input.xPos + input.connectionWidth;

  const outlinePath = svgPaths.moveTo(connectionRight, yPos) +
      svgPaths.lineOnAxis('h', width) +
      input.shape.pathRightDown(input.height) +
      svgPaths.lineOnAxis('h', -width) + input.shape.pathUp(input.height) + 'z';
  this.block_.pathObject.setOutlinePath(inputName, outlinePath);
};

/**
 * @override
 */
Drawer.prototype.drawStatementInput_ = function(row) {
  const input = row.getLastInput();
  // Where to start drawing the notch, which is on the right side in LTR.
  const x = input.xPos + input.notchOffset + input.shape.width;

  const innerTopLeftCorner = input.shape.pathRight +
      svgPaths.lineOnAxis(
          'h', -(input.notchOffset - this.constants_.INSIDE_CORNERS.width)) +
      this.constants_.INSIDE_CORNERS.pathTop;

  const innerHeight = row.height - (2 * this.constants_.INSIDE_CORNERS.height);

  const innerBottomLeftCorner = this.constants_.INSIDE_CORNERS.pathBottom +
      svgPaths.lineOnAxis(
          'h', (input.notchOffset - this.constants_.INSIDE_CORNERS.width)) +
      (input.connectedBottomNextConnection ? '' : input.shape.pathLeft);

  this.outlinePath_ += svgPaths.lineOnAxis('H', x) + innerTopLeftCorner +
      svgPaths.lineOnAxis('v', innerHeight) + innerBottomLeftCorner +
      svgPaths.lineOnAxis('H', row.xPos + row.width);

  this.positionStatementInputConnection_(row);
};

exports.Drawer = Drawer;
