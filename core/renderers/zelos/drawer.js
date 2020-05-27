/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Zelos renderer.
 * @author samelh@google.com (Sam El-Husseini)
 */
'use strict';

goog.provide('Blockly.zelos.Drawer');

goog.require('Blockly.blockRendering.ConstantProvider');
goog.require('Blockly.blockRendering.Drawer');
goog.require('Blockly.blockRendering.Types');
goog.require('Blockly.utils.object');
goog.require('Blockly.zelos.RenderInfo');

goog.requireType('Blockly.zelos.PathObject');


/**
 * An object that draws a block based on the given rendering information.
 * @param {!Blockly.BlockSvg} block The block to render.
 * @param {!Blockly.zelos.RenderInfo} info An object containing all
 *   information needed to render this block.
 * @package
 * @constructor
 * @extends {Blockly.blockRendering.Drawer}
 */
Blockly.zelos.Drawer = function(block, info) {
  Blockly.zelos.Drawer.superClass_.constructor.call(this, block, info);
};
Blockly.utils.object.inherits(Blockly.zelos.Drawer,
    Blockly.blockRendering.Drawer);


/**
 * @override
 */
Blockly.zelos.Drawer.prototype.draw = function() {
  var pathObject =
    /** @type {!Blockly.zelos.PathObject} */ (this.block_.pathObject);
  pathObject.beginDrawing();
  this.hideHiddenIcons_();
  this.drawOutline_();
  this.drawInternals_();

  pathObject.setPath(this.outlinePath_ + '\n' + this.inlinePath_);
  if (this.info_.RTL) {
    pathObject.flipRTL();
  }
  if (Blockly.blockRendering.useDebugger) {
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
Blockly.zelos.Drawer.prototype.drawOutline_ = function() {
  if (this.info_.outputConnection &&
      this.info_.outputConnection.isDynamicShape &&
      !this.info_.hasStatementInput &&
      !this.info_.bottomRow.hasNextConnection) {
    this.drawFlatTop_();
    this.drawRightDynamicConnection_();
    this.drawFlatBottom_();
    this.drawLeftDynamicConnection_();
  } else {
    Blockly.zelos.Drawer.superClass_.drawOutline_.call(this);
  }
};

/**
 * @override
 */
Blockly.zelos.Drawer.prototype.drawLeft_ = function() {
  if (this.info_.outputConnection &&
      this.info_.outputConnection.isDynamicShape) {
    this.drawLeftDynamicConnection_();
  } else {
    Blockly.zelos.Drawer.superClass_.drawLeft_.call(this);
  }
};

/**
 * Add steps for the right side of a row that does not have value or
 * statement input connections.
 * @param {!Blockly.blockRendering.Row} row The row to draw the
 *     side of.
 * @protected
 */
Blockly.zelos.Drawer.prototype.drawRightSideRow_ = function(row) {
  if (row.height <= 0) {
    return;
  }
  if (row.precedesStatement || row.followsStatement) {
    var cornerHeight = this.constants_.INSIDE_CORNERS.rightHeight;
    var remainingHeight = row.height -
        (row.precedesStatement ? cornerHeight : 0);
    this.outlinePath_ +=
        (row.followsStatement ?
            this.constants_.INSIDE_CORNERS.pathBottomRight : '') +
        (remainingHeight > 0 ?
            Blockly.utils.svgPaths
                .lineOnAxis('V', row.yPos + remainingHeight) : '') +
        (row.precedesStatement ?
            this.constants_.INSIDE_CORNERS.pathTopRight : '');
  } else {
    this.outlinePath_ +=
        Blockly.utils.svgPaths.lineOnAxis('V', row.yPos + row.height);
  }
};

/**
 * Add steps to draw the right side of an output with a dynamic connection.
 * @protected
 */
Blockly.zelos.Drawer.prototype.drawRightDynamicConnection_ = function() {
  this.outlinePath_ += this.info_.outputConnection.shape.pathRightDown(
      this.info_.outputConnection.height);
};

/**
 * Add steps to draw the left side of an output with a dynamic connection.
 * @protected
 */
Blockly.zelos.Drawer.prototype.drawLeftDynamicConnection_ = function() {
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
Blockly.zelos.Drawer.prototype.drawFlatTop_ = function() {
  var topRow = this.info_.topRow;
  this.positionPreviousConnection_();

  this.outlinePath_ +=
      Blockly.utils.svgPaths.moveBy(topRow.xPos, this.info_.startY);

  this.outlinePath_ += Blockly.utils.svgPaths.lineOnAxis('h', topRow.width);
};

/**
 * Add steps to draw a flat bottom row.
 * @protected
 */
Blockly.zelos.Drawer.prototype.drawFlatBottom_ = function() {
  var bottomRow = this.info_.bottomRow;
  this.positionNextConnection_();

  this.outlinePath_ +=
    Blockly.utils.svgPaths.lineOnAxis('V', bottomRow.baseline);

  this.outlinePath_ += Blockly.utils.svgPaths.lineOnAxis('h', -bottomRow.width);
};

/**
 * @override
 */
Blockly.zelos.Drawer.prototype.drawInlineInput_ = function(input) {
  this.positionInlineInputConnection_(input);

  var inputName = input.input.name;
  if (input.connectedBlock || this.info_.isInsertionMarker) {
    return;
  }

  var width = input.width - (input.connectionWidth * 2);
  var height = input.height;
  var yPos = input.centerline - height / 2;

  var connectionRight = input.xPos + input.connectionWidth;

  var outlinePath = Blockly.utils.svgPaths.moveTo(connectionRight, yPos) +
      Blockly.utils.svgPaths.lineOnAxis('h', width) +
      input.shape.pathRightDown(input.height) +
      Blockly.utils.svgPaths.lineOnAxis('h', -width) +
      input.shape.pathUp(input.height) +
      'z';
  this.block_.pathObject.setOutlinePath(inputName, outlinePath);
};

/**
 * @override
 */
Blockly.zelos.Drawer.prototype.drawStatementInput_ = function(row) {
  var input = row.getLastInput();
  // Where to start drawing the notch, which is on the right side in LTR.
  var x = input.xPos + input.notchOffset + input.shape.width;

  var innerTopLeftCorner =
      input.shape.pathRight +
      Blockly.utils.svgPaths.lineOnAxis('h',
          -(input.notchOffset - this.constants_.INSIDE_CORNERS.width)) +
      this.constants_.INSIDE_CORNERS.pathTop;

  var innerHeight =
      row.height - (2 * this.constants_.INSIDE_CORNERS.height);

  var innerBottomLeftCorner =
    this.constants_.INSIDE_CORNERS.pathBottom +
    Blockly.utils.svgPaths.lineOnAxis('h',
        (input.notchOffset - this.constants_.INSIDE_CORNERS.width)) +
    (input.connectedBottomNextConnection ? '' : input.shape.pathLeft);

  this.outlinePath_ += Blockly.utils.svgPaths.lineOnAxis('H', x) +
      innerTopLeftCorner +
      Blockly.utils.svgPaths.lineOnAxis('v', innerHeight) +
      innerBottomLeftCorner +
      Blockly.utils.svgPaths.lineOnAxis('H', row.xPos + row.width);

  this.positionStatementInputConnection_(row);
};
