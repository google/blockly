/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

// Former goog.module ID: Blockly.zelos.Drawer

import type {BlockSvg} from '../../block_svg.js';
import * as svgPaths from '../../utils/svg_paths.js';
import type {BaseShape, DynamicShape, Notch} from '../common/constants.js';
import {Drawer as BaseDrawer} from '../common/drawer.js';
import type {InlineInput} from '../measurables/inline_input.js';
import type {Row} from '../measurables/row.js';
import type {SpacerRow} from '../measurables/spacer_row.js';
import {Types} from '../measurables/types.js';

import type {InsideCorners} from './constants.js';
import type {RenderInfo} from './info.js';
import type {StatementInput} from './measurables/inputs.js';
import type {PathObject} from './path_object.js';

/**
 * An object that draws a block based on the given rendering information.
 */
export class Drawer extends BaseDrawer {
  // TODO(b/109816955): remove '!', see go/strict-prop-init-fix.
  override info_!: RenderInfo;

  /**
   * @param block The block to render.
   * @param info An object containing all information needed to render this
   *     block.
   */
  constructor(block: BlockSvg, info: RenderInfo) {
    super(block, info);
  }

  override draw() {
    const pathObject = this.block_.pathObject as PathObject;
    pathObject.beginDrawing();
    this.drawOutline_();
    this.drawInternals_();

    pathObject.setPath(this.outlinePath_ + '\n' + this.inlinePath_);
    if (this.info_.RTL) {
      pathObject.flipRTL();
    }
    this.recordSizeOnBlock_();
    if (this.info_.outputConnection) {
      // Store the output connection shape type for parent blocks to use during
      // rendering.
      pathObject.outputShapeType = this.info_.outputConnection.shape.type;
    }
    pathObject.endDrawing();
  }

  override drawOutline_() {
    if (
      this.info_.outputConnection &&
      this.info_.outputConnection.isDynamicShape &&
      !this.info_.hasStatementInput &&
      !this.info_.bottomRow.hasNextConnection
    ) {
      this.drawFlatTop_();
      this.drawRightDynamicConnection_();
      this.drawFlatBottom_();
      this.drawLeftDynamicConnection_();
    } else {
      super.drawOutline_();
    }
  }

  override drawLeft_() {
    if (
      this.info_.outputConnection &&
      this.info_.outputConnection.isDynamicShape
    ) {
      this.drawLeftDynamicConnection_();
    } else {
      super.drawLeft_();
    }
  }

  /**
   * Add steps for the right side of a row that does not have value or
   * statement input connections.
   *
   * @param row The row to draw the side of.
   */
  protected override drawRightSideRow_(row: Row) {
    if (row.height <= 0) {
      return;
    }
    if (Types.isSpacer(row)) {
      const spacerRow = row as SpacerRow;
      const precedesStatement = spacerRow.precedesStatement;
      const followsStatement = spacerRow.followsStatement;
      if (precedesStatement || followsStatement) {
        const insideCorners = this.constants_.INSIDE_CORNERS as InsideCorners;
        const cornerHeight = insideCorners.rightHeight;
        const remainingHeight =
          spacerRow.height - (precedesStatement ? cornerHeight : 0);
        const bottomRightPath = followsStatement
          ? insideCorners.pathBottomRight
          : '';
        const verticalPath =
          remainingHeight > 0
            ? svgPaths.lineOnAxis('V', spacerRow.yPos + remainingHeight)
            : '';
        const topRightPath = precedesStatement
          ? insideCorners.pathTopRight
          : '';
        // Put all of the partial paths together.
        this.outlinePath_ += bottomRightPath + verticalPath + topRightPath;
        return;
      }
    }
    this.outlinePath_ += svgPaths.lineOnAxis('V', row.yPos + row.height);
  }

  /**
   * Add steps to draw the right side of an output with a dynamic connection.
   */
  protected drawRightDynamicConnection_() {
    if (!this.info_.outputConnection) {
      throw new Error(
        `Cannot draw the output connection of a block that doesn't have one`,
      );
    }
    this.outlinePath_ += (
      this.info_.outputConnection.shape as DynamicShape
    ).pathRightDown(this.info_.outputConnection.height);
  }

  /**
   * Add steps to draw the left side of an output with a dynamic connection.
   */
  protected drawLeftDynamicConnection_() {
    if (!this.info_.outputConnection) {
      throw new Error(
        `Cannot draw the output connection of a block that doesn't have one`,
      );
    }
    this.positionOutputConnection_();

    this.outlinePath_ += (
      this.info_.outputConnection.shape as DynamicShape
    ).pathUp(this.info_.outputConnection.height);

    // Close off the path.  This draws a vertical line up to the start of the
    // block's path, which may be either a rounded or a sharp corner.
    this.outlinePath_ += 'z';
  }

  /** Add steps to draw a flat top row. */
  protected drawFlatTop_() {
    const topRow = this.info_.topRow;
    this.positionPreviousConnection_();

    this.outlinePath_ += svgPaths.moveBy(topRow.xPos, this.info_.startY);
    this.outlinePath_ += svgPaths.lineOnAxis('h', topRow.width);
  }

  /** Add steps to draw a flat bottom row. */
  protected drawFlatBottom_() {
    const bottomRow = this.info_.bottomRow;
    this.positionNextConnection_();

    this.outlinePath_ += svgPaths.lineOnAxis('V', bottomRow.baseline);
    this.outlinePath_ += svgPaths.lineOnAxis('h', -bottomRow.width);
  }

  override drawInlineInput_(input: InlineInput) {
    this.positionInlineInputConnection_(input);

    const inputName = input.input.name;
    if (input.connectedBlock || this.info_.isInsertionMarker) {
      return;
    }

    const width = input.width - input.connectionWidth * 2;
    const height = input.height;
    const yPos = input.centerline - height / 2;

    const connectionRight = input.xPos + input.connectionWidth;

    const outlinePath =
      svgPaths.moveTo(connectionRight, yPos) +
      svgPaths.lineOnAxis('h', width) +
      (input.shape as DynamicShape).pathRightDown(input.height) +
      svgPaths.lineOnAxis('h', -width) +
      (input.shape as DynamicShape).pathUp(input.height) +
      'z';
    const pathObject = this.block_.pathObject as PathObject;
    pathObject.setOutlinePath(inputName, outlinePath);
  }

  override drawStatementInput_(row: Row) {
    const input = row.getLastInput() as StatementInput;
    // Where to start drawing the notch, which is on the right side in LTR.
    const x = input.xPos + input.notchOffset + (input.shape as BaseShape).width;

    const insideCorners = this.constants_.INSIDE_CORNERS;
    const innerTopLeftCorner =
      (input.shape as Notch).pathRight +
      svgPaths.lineOnAxis('h', -(input.notchOffset - insideCorners.width)) +
      insideCorners.pathTop;

    const innerHeight = row.height - 2 * insideCorners.height;

    const innerBottomLeftCorner =
      insideCorners.pathBottom +
      svgPaths.lineOnAxis('h', input.notchOffset - insideCorners.width) +
      (input.connectedBottomNextConnection
        ? ''
        : (input.shape as Notch).pathLeft);

    this.outlinePath_ +=
      svgPaths.lineOnAxis('H', x) +
      innerTopLeftCorner +
      svgPaths.lineOnAxis('v', innerHeight) +
      innerBottomLeftCorner +
      svgPaths.lineOnAxis('H', row.xPos + row.width);

    this.positionStatementInputConnection_(row);
  }
}
