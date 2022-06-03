/** @fileoverview Methods for rendering debug graphics. */


/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2018 Google Inc.
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
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */



/**
 * Methods for rendering debug graphics.
 * @class
 */

/* eslint-disable-next-line no-unused-vars */
import { BlockSvg } from 'google3/third_party/javascript/blockly/core/block_svg';
import { ConnectionType } from 'google3/third_party/javascript/blockly/core/connection_type';
import { FieldLabel } from 'google3/third_party/javascript/blockly/core/field_label';
/* eslint-disable-next-line no-unused-vars */
import { RenderedConnection } from 'google3/third_party/javascript/blockly/core/rendered_connection';
import * as dom from 'google3/third_party/javascript/blockly/core/utils/dom';
import { Svg } from 'google3/third_party/javascript/blockly/core/utils/svg';

/* eslint-disable-next-line no-unused-vars */
import { Measurable } from '../measurables/base';
import { Field } from '../measurables/field';
/* eslint-disable-next-line no-unused-vars */
import { InRowSpacer } from '../measurables/in_row_spacer';
import { InputConnection } from '../measurables/input_connection';
/* eslint-disable-next-line no-unused-vars */
import { Row } from '../measurables/row';
import { Types } from '../measurables/types';
/* eslint-disable-next-line no-unused-vars */
import { RenderInfo as ZelosInfo } from '../zelos/info';

/* eslint-disable-next-line no-unused-vars */
import { ConstantProvider } from './constants';
/* eslint-disable-next-line no-unused-vars */
import { RenderInfo } from './info';


/**
 * An object that renders rectangles and dots for debugging rendering code.
 * @alias Blockly.blockRendering.Debug
 */
export class Debug {
  /**
   * Configuration object containing booleans to enable and disable debug
   * rendering of specific rendering components.
   * @struct
   */
  static config = {
    rowSpacers: true,
    elemSpacers: true,
    rows: true,
    elems: true,
    connections: true,
    blockBounds: true,
    connectedBlockBounds: true,
    render: true,
  };

  /** An array of SVG elements that have been created by this object. */
  private debugElements_: SVGElement[] = [];

  /**
   * The SVG root of the block that is being rendered.  Debug elements will
   * be attached to this root.
   */
  // AnyDuringMigration because:  Type 'null' is not assignable to type
  // 'SVGElement'.
  private svgRoot_: SVGElement = null as AnyDuringMigration;

  private randomColour_ = '';

  /** @param constants The renderer's constants. */
  constructor(private readonly constants: ConstantProvider) {}

  /** Remove all elements the this object created on the last pass. */
  clearElems() {
    for (let i = 0; i < this.debugElements_.length; i++) {
      const elem = this.debugElements_[i];
      dom.removeNode(elem);
    }

    this.debugElements_ = [];
  }

  /**
   * Draw a debug rectangle for a spacer (empty) row.
   * @param row The row to render.
   * @param cursorY The y position of the top of the row.
   * @param isRtl Whether the block is rendered RTL.
   */
  drawSpacerRow(row: Row, cursorY: number, isRtl: boolean) {
    if (!Debug.config.rowSpacers) {
      return;
    }

    const height = Math.abs(row.height);
    const isNegativeSpacing = row.height < 0;
    if (isNegativeSpacing) {
      cursorY -= height;
    }

    this.debugElements_.push(dom.createSvgElement(
      Svg.RECT, {
      'class': 'rowSpacerRect blockRenderDebug',
      'x': isRtl ? -(row.xPos + row.width) : row.xPos,
      'y': cursorY,
      'width': row.width,
      'height': height,
      'stroke': isNegativeSpacing ? 'black' : 'blue',
      'fill': 'blue',
      'fill-opacity': '0.5',
      'stroke-width': '1px',
    },
      this.svgRoot_));
  }

  /**
   * Draw a debug rectangle for a horizontal spacer.
   * @param elem The spacer to render.
   * @param rowHeight The height of the container row.
   * @param isRtl Whether the block is rendered RTL.
   */
  drawSpacerElem(elem: InRowSpacer, rowHeight: number, isRtl: boolean) {
    if (!Debug.config.elemSpacers) {
      return;
    }

    const width = Math.abs(elem.width);
    const isNegativeSpacing = elem.width < 0;
    let xPos = isNegativeSpacing ? elem.xPos - width : elem.xPos;
    if (isRtl) {
      xPos = -(xPos + width);
    }
    const yPos = elem.centerline - elem.height / 2;
    this.debugElements_.push(dom.createSvgElement(
      Svg.RECT, {
      'class': 'elemSpacerRect blockRenderDebug',
      'x': xPos,
      'y': yPos,
      'width': width,
      'height': elem.height,
      'stroke': 'pink',
      'fill': isNegativeSpacing ? 'black' : 'pink',
      'fill-opacity': '0.5',
      'stroke-width': '1px',
    },
      this.svgRoot_));
  }

  /**
   * Draw a debug rectangle for an in-row element.
   * @param elem The element to render.
   * @param isRtl Whether the block is rendered RTL.
   */
  drawRenderedElem(elem: Measurable, isRtl: boolean) {
    if (Debug.config.elems) {
      let xPos = elem.xPos;
      if (isRtl) {
        xPos = -(xPos + elem.width);
      }
      const yPos = elem.centerline - elem.height / 2;
      this.debugElements_.push(dom.createSvgElement(
        Svg.RECT, {
        'class': 'rowRenderingRect blockRenderDebug',
        'x': xPos,
        'y': yPos,
        'width': elem.width,
        'height': elem.height,
        'stroke': 'black',
        'fill': 'none',
        'stroke-width': '1px',
      },
        this.svgRoot_));

      if (Types.isField(elem) && elem instanceof Field &&
        elem.field instanceof FieldLabel) {
        const baseline = this.constants.FIELD_TEXT_BASELINE;
        this.debugElements_.push(dom.createSvgElement(
          Svg.RECT, {
          'class': 'rowRenderingRect blockRenderDebug',
          'x': xPos,
          'y': yPos + baseline,
          'width': elem.width,
          'height': '0.1px',
          'stroke': 'red',
          'fill': 'none',
          'stroke-width': '0.5px',
        },
          this.svgRoot_));
      }
    }


    if (Types.isInput(elem) && elem instanceof InputConnection &&
      Debug.config.connections) {
      this.drawConnection(elem.connectionModel);
    }
  }

  /**
   * Draw a circle at the location of the given connection.  Inputs and outputs
   * share the same colours, as do previous and next.  When positioned correctly
   * a connected pair will look like a bullseye.
   * @param conn The connection to circle.
   * @suppress {visibility} Suppress visibility of conn.offsetInBlock_ since
   * this is a debug module.
   */
  drawConnection(conn: RenderedConnection) {
    if (!Debug.config.connections) {
      return;
    }

    let colour;
    let size;
    let fill;
    if (conn.type === ConnectionType.INPUT_VALUE) {
      size = 4;
      colour = 'magenta';
      fill = 'none';
    } else if (conn.type === ConnectionType.OUTPUT_VALUE) {
      size = 2;
      colour = 'magenta';
      fill = colour;
    } else if (conn.type === ConnectionType.NEXT_STATEMENT) {
      size = 4;
      colour = 'goldenrod';
      fill = 'none';
    } else if (conn.type === ConnectionType.PREVIOUS_STATEMENT) {
      size = 2;
      colour = 'goldenrod';
      fill = colour;
    }
    // AnyDuringMigration because:  Property 'offsetInBlock_' is private and
    // only accessible within class 'RenderedConnection'. AnyDuringMigration
    // because:  Property 'offsetInBlock_' is private and only accessible within
    // class 'RenderedConnection'.
    this.debugElements_.push(dom.createSvgElement(
      Svg.CIRCLE, {
      'class': 'blockRenderDebug',
      'cx': (conn as AnyDuringMigration).offsetInBlock_.x,
      'cy': (conn as AnyDuringMigration).offsetInBlock_.y,
      'r': size,
      'fill': fill,
      'stroke': colour,
    },
      this.svgRoot_));
  }

  /**
   * Draw a debug rectangle for a non-empty row.
   * @param row The non-empty row to render.
   * @param cursorY The y position of the top of the row.
   * @param isRtl Whether the block is rendered RTL.
   */
  drawRenderedRow(row: Row, cursorY: number, isRtl: boolean) {
    if (!Debug.config.rows) {
      return;
    }
    this.debugElements_.push(dom.createSvgElement(
      Svg.RECT, {
      'class': 'elemRenderingRect blockRenderDebug',
      'x': isRtl ? -(row.xPos + row.width) : row.xPos,
      'y': row.yPos,
      'width': row.width,
      'height': row.height,
      'stroke': 'red',
      'fill': 'none',
      'stroke-width': '1px',
    },
      this.svgRoot_));

    // AnyDuringMigration because:  Property 'isTopOrBottomRow' does not exist
    // on type 'typeof Types'.
    if ((Types as AnyDuringMigration).isTopOrBottomRow(row)) {
      return;
    }

    if (Debug.config.connectedBlockBounds) {
      this.debugElements_.push(dom.createSvgElement(
        Svg.RECT, {
        'class': 'connectedBlockWidth blockRenderDebug',
        'x': isRtl ? -(row.xPos + row.widthWithConnectedBlocks) : row.xPos,
        'y': row.yPos,
        'width': row.widthWithConnectedBlocks,
        'height': row.height,
        'stroke': this.randomColour_,
        'fill': 'none',
        'stroke-width': '1px',
        'stroke-dasharray': '3,3',
      },
        this.svgRoot_));
    }
  }

  /**
   * Draw debug rectangles for a non-empty row and all of its subcomponents.
   * @param row The non-empty row to render.
   * @param cursorY The y position of the top of the row.
   * @param isRtl Whether the block is rendered RTL.
   */
  drawRowWithElements(row: Row, cursorY: number, isRtl: boolean) {
    for (let i = 0; i < row.elements.length; i++) {
      const elem = row.elements[i];
      if (!elem) {
        console.warn('A row has an undefined or null element.', row, elem);
        continue;
      }
      if (Types.isSpacer(elem)) {
        this.drawSpacerElem(elem as InRowSpacer, row.height, isRtl);
      } else {
        this.drawRenderedElem(elem, isRtl);
      }
    }
    this.drawRenderedRow(row, cursorY, isRtl);
  }

  /**
   * Draw a debug rectangle around the entire block.
   * @param info Rendering information about the block to debug.
   */
  drawBoundingBox(info: RenderInfo) {
    if (!Debug.config.blockBounds) {
      return;
    }
    // Bounding box without children.
    let xPos = info.RTL ? -info.width : 0;
    const yPos = 0;
    this.debugElements_.push(dom.createSvgElement(
      Svg.RECT, {
      'class': 'blockBoundingBox blockRenderDebug',
      'x': xPos,
      'y': yPos,
      'width': info.width,
      'height': info.height,
      'stroke': 'black',
      'fill': 'none',
      'stroke-width': '1px',
      'stroke-dasharray': '5,5',
    },
      this.svgRoot_));

    if (Debug.config.connectedBlockBounds) {
      // Bounding box with children.
      xPos = info.RTL ? -info.widthWithChildren : 0;
      this.debugElements_.push(dom.createSvgElement(
        Svg.RECT, {
        'class': 'blockRenderDebug',
        'x': xPos,
        'y': yPos,
        'width': info.widthWithChildren,
        'height': info.height,
        'stroke': '#DF57BC',
        'fill': 'none',
        'stroke-width': '1px',
        'stroke-dasharray': '3,3',
      },
        this.svgRoot_));
    }
  }

  /**
   * Do all of the work to draw debug information for the whole block.
   * @param block The block to draw debug information for.
   * @param info Rendering information about the block to debug.
   */
  drawDebug(block: BlockSvg, info: RenderInfo) {
    this.clearElems();
    this.svgRoot_ = block.getSvgRoot();

    this.randomColour_ =
      '#' + Math.floor(Math.random() * 16777215).toString(16);

    let cursorY = 0;
    for (let i = 0; i < info.rows.length; i++) {
      const row = info.rows[i];
      if (Types.isBetweenRowSpacer(row)) {
        this.drawSpacerRow(row, cursorY, info.RTL);
      } else {
        this.drawRowWithElements(row, cursorY, info.RTL);
      }
      cursorY += row.height;
    }

    if (block.previousConnection) {
      this.drawConnection(block.previousConnection);
    }
    if (block.nextConnection) {
      this.drawConnection(block.nextConnection);
    }
    if (block.outputConnection) {
      this.drawConnection(block.outputConnection);
    }
    /**
     * TODO: Find a better way to do this check without pulling in all of
     * zelos, or just delete this line or the whole debug renderer.
     */
    const maybeZelosInfo = info as ZelosInfo;
    if (maybeZelosInfo.rightSide) {
      this.drawRenderedElem(maybeZelosInfo.rightSide, info.RTL);
    }

    this.drawBoundingBox(info);

    this.drawRender(block.pathObject.svgPath);
  }

  /**
   * Show a debug filter to highlight that a block has been rendered.
   * @param svgPath The block's SVG path.
   */
  drawRender(svgPath: SVGElement) {
    if (!Debug.config.render) {
      return;
    }
    svgPath.setAttribute(
      'filter', 'url(#' + this.constants.debugFilterId + ')');
    setTimeout(function () {
      svgPath.setAttribute('filter', '');
    }, 100);
  }
}
