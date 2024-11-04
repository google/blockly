/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Visualizer for debugging custom renderers in Blockly.
 * @author fenichel@google.com (Rachel Fenichel)
 */
import * as Blockly from 'blockly/core';

/**
 * A basic visualizer for debugging custom renderers.
 */
export class DebugDrawer {
  /**
   * An object that renders rectangles and dots for debugging rendering code.
   * @param {!Blockly.blockRendering.ConstantProvider} constants The renderer's
   *     constants.
   * @package
   * @constructor
   */
  constructor(constants) {
    /**
     * An array of SVG elements that have been created by this object.
     * @type {Array.<!SVGElement>}
     * @private
     */
    this.debugElements_ = [];

    /**
     * The SVG root of the block that is being rendered.  Debug elements will
     * be attached to this root.
     * @type {SVGElement}
     * @private
     */
    this.svgRoot_ = null;

    /**
     * The renderer's constant provider.
     * @type {!Blockly.blockRendering.ConstantProvider}
     * @private
     */
    this.constants_ = constants;
  }

  /**
   * Remove all elements the this object created on the last pass.
   * @protected
   */
  clearElems() {
    for (let i = 0, elem; (elem = this.debugElements_[i]); i++) {
      Blockly.utils.dom.removeNode(elem);
    }

    this.debugElements_ = [];
  }

  /**
   * Draw a debug rectangle for a spacer (empty) row.
   * @param {!Blockly.blockRendering.Row} row The row to render.
   * @param {number} cursorY The y position of the top of the row.
   * @param {boolean} isRtl Whether the block is rendered RTL.
   * @protected
   */
  drawSpacerRow(row, cursorY, isRtl) {
    if (!DebugDrawer.config.rowSpacers) {
      return;
    }

    const height = Math.abs(row.height);
    const isNegativeSpacing = row.height < 0;
    if (isNegativeSpacing) {
      cursorY -= height;
    }

    this.debugElements_.push(
      Blockly.utils.dom.createSvgElement(
        'rect',
        {
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
        this.svgRoot_,
      ),
    );
  }

  /**
   * Draw a debug rectangle for a horizontal spacer.
   * @param {!Blockly.blockRendering.InRowSpacer} elem The spacer to render.
   * @param {number} rowHeight The height of the container row.
   * @param {boolean} isRtl Whether the block is rendered RTL.
   * @protected
   */
  drawSpacerElem(elem, rowHeight, isRtl) {
    if (!DebugDrawer.config.elemSpacers) {
      return;
    }

    const width = Math.abs(elem.width);
    const isNegativeSpacing = elem.width < 0;
    let xPos = isNegativeSpacing ? elem.xPos - width : elem.xPos;
    if (isRtl) {
      xPos = -(xPos + width);
    }
    const yPos = elem.centerline - elem.height / 2;
    this.debugElements_.push(
      Blockly.utils.dom.createSvgElement(
        'rect',
        {
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
        this.svgRoot_,
      ),
    );
  }

  /**
   * Draw a debug rectangle for an in-row element.
   * @param {!Blockly.blockRendering.Measurable} elem The element to render.
   * @param {boolean} isRtl Whether the block is rendered RTL.
   * @protected
   */
  drawRenderedElem(elem, isRtl) {
    if (DebugDrawer.config.elems) {
      let xPos = elem.xPos;
      if (isRtl) {
        xPos = -(xPos + elem.width);
      }
      const yPos = elem.centerline - elem.height / 2;
      this.debugElements_.push(
        Blockly.utils.dom.createSvgElement(
          'rect',
          {
            'class': 'rowRenderingRect blockRenderDebug',
            'x': xPos,
            'y': yPos,
            'width': elem.width,
            'height': elem.height,
            'stroke': 'black',
            'fill': 'none',
            'stroke-width': '1px',
          },
          this.svgRoot_,
        ),
      );

      if (
        Blockly.blockRendering.Types.isField(elem) &&
        elem.field instanceof Blockly.FieldLabel
      ) {
        const baseline = this.constants_.FIELD_TEXT_BASELINE;
        this.debugElements_.push(
          Blockly.utils.dom.createSvgElement(
            'rect',
            {
              'class': 'rowRenderingRect blockRenderDebug',
              'x': xPos,
              'y': yPos + baseline,
              'width': elem.width,
              'height': '0.1px',
              'stroke': 'red',
              'fill': 'none',
              'stroke-width': '0.5px',
            },
            this.svgRoot_,
          ),
        );
      }
    }

    if (
      Blockly.blockRendering.Types.isInput(elem) &&
      DebugDrawer.config.connections
    ) {
      this.drawConnection(elem.connectionModel);
    }
  }

  /**
   * Draw a circle at the location of the given connection.  Inputs and outputs
   * share the same colours, as do previous and next.  When positioned correctly
   * a connected pair will look like a bullseye.
   * @param {Blockly.RenderedConnection} conn The connection to circle.
   * @protected
   */
  drawConnection(conn) {
    if (!DebugDrawer.config.connections) {
      return;
    }

    let colour;
    let size;
    let fill;
    if (conn.type == Blockly.INPUT_VALUE) {
      size = 4;
      colour = 'magenta';
      fill = 'none';
    } else if (conn.type == Blockly.OUTPUT_VALUE) {
      size = 2;
      colour = 'magenta';
      fill = colour;
    } else if (conn.type == Blockly.NEXT_STATEMENT) {
      size = 4;
      colour = 'goldenrod';
      fill = 'none';
    } else if (conn.type == Blockly.PREVIOUS_STATEMENT) {
      size = 2;
      colour = 'goldenrod';
      fill = colour;
    }
    // TODO(blockly/7227): This method is still internal, so we're going to
    //   have continual problems. We should consider making it public.
    const offset = conn.getOffsetInBlock();
    this.debugElements_.push(
      Blockly.utils.dom.createSvgElement(
        'circle',
        {
          class: 'blockRenderDebug',
          cx: offset.x,
          cy: offset.y,
          r: size,
          fill: fill,
          stroke: colour,
        },
        this.svgRoot_,
      ),
    );
  }

  /**
   * Draw a debug rectangle for a non-empty row.
   * @param {!Blockly.blockRendering.Row} row The non-empty row to render.
   * @param {number} cursorY The y position of the top of the row.
   * @param {boolean} isRtl Whether the block is rendered RTL.
   * @protected
   */
  drawRenderedRow(row, cursorY, isRtl) {
    if (!DebugDrawer.config.rows) {
      return;
    }
    this.debugElements_.push(
      Blockly.utils.dom.createSvgElement(
        'rect',
        {
          'class': 'elemRenderingRect blockRenderDebug',
          'x': isRtl ? -(row.xPos + row.width) : row.xPos,
          'y': row.yPos,
          'width': row.width,
          'height': row.height,
          'stroke': 'red',
          'fill': 'none',
          'stroke-width': '1px',
        },
        this.svgRoot_,
      ),
    );

    if (Blockly.blockRendering.Types.isTopOrBottomRow(row)) {
      return;
    }

    if (DebugDrawer.config.connectedBlockBounds) {
      this.debugElements_.push(
        Blockly.utils.dom.createSvgElement(
          'rect',
          {
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
          this.svgRoot_,
        ),
      );
    }
  }

  /**
   * Draw debug rectangles for a non-empty row and all of its subcomponents.
   * @param {!Blockly.blockRendering.Row} row The non-empty row to render.
   * @param {number} cursorY The y position of the top of the row.
   * @param {boolean} isRtl Whether the block is rendered RTL.
   * @protected
   */
  drawRowWithElements(row, cursorY, isRtl) {
    for (let i = 0, l = row.elements.length; i < l; i++) {
      const elem = row.elements[i];
      if (!elem) {
        console.warn('A row has an undefined or null element.', row, elem);
        continue;
      }
      if (Blockly.blockRendering.Types.isSpacer(elem)) {
        this.drawSpacerElem(
          /** @type {!Blockly.blockRendering.InRowSpacer} */ (elem),
          row.height,
          isRtl,
        );
      } else {
        this.drawRenderedElem(elem, isRtl);
      }
    }
    this.drawRenderedRow(row, cursorY, isRtl);
  }

  /**
   * Draw a debug rectangle around the entire block.
   * @param {!Blockly.blockRendering.RenderInfo} info Rendering information
   *     about the block to debug.
   * @protected
   */
  drawBoundingBox(info) {
    if (!DebugDrawer.config.blockBounds) {
      return;
    }
    // Bounding box without children.
    let xPos = info.RTL ? -info.width : 0;
    const yPos = 0;
    this.debugElements_.push(
      Blockly.utils.dom.createSvgElement(
        'rect',
        {
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
        this.svgRoot_,
      ),
    );

    if (DebugDrawer.config.connectedBlockBounds) {
      // Bounding box with children.
      xPos = info.RTL ? -info.widthWithChildren : 0;
      this.debugElements_.push(
        Blockly.utils.dom.createSvgElement(
          'rect',
          {
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
          this.svgRoot_,
        ),
      );
    }
  }

  /**
   * Do all of the work to draw debug information for the whole block.
   * @param {!Blockly.BlockSvg} block The block to draw debug information for.
   * @param {!Blockly.blockRendering.RenderInfo} info Rendering information
   *     about the block to debug.
   */
  drawDebug(block, info) {
    this.clearElems();
    this.svgRoot_ = block.getSvgRoot();

    this.randomColour_ =
      '#' + Math.floor(Math.random() * 16777215).toString(16);

    let cursorY = 0;
    for (let i = 0, row; (row = info.rows[i]); i++) {
      if (Blockly.blockRendering.Types.isBetweenRowSpacer(row)) {
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
    if (info.rightSide) {
      this.drawRenderedElem(info.rightSide, info.RTL);
    }

    this.drawBoundingBox(info);

    this.drawRender(block.pathObject.svgPath);
  }

  /**
   * Show a debug filter to highlight that a block has been rendered.
   * @param {!SVGElement} svgPath The block's svg path.
   * @protected
   */
  drawRender(svgPath) {
    if (!DebugDrawer.config.render) {
      return;
    }
    svgPath.setAttribute(
      'filter',
      'url(#' + this.constants_.debugFilterId + ')',
    );
    setTimeout(function () {
      svgPath.setAttribute('filter', '');
    }, 100);
  }
}

/**
 * Configuration object containing booleans to enable and disable debug
 * rendering of specific rendering components.
 * @type {!Object.<string, boolean>}
 */
DebugDrawer.config = {
  rowSpacers: true,
  elemSpacers: true,
  rows: true,
  elems: true,
  connections: true,
  blockBounds: true,
  connectedBlockBounds: true,
  render: true,
};
