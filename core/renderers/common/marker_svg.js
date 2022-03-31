/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Methods for graphically rendering a marker as SVG.
 */
'use strict';


/**
 * Methods for graphically rendering a marker as SVG.
 * @class
 */
goog.module('Blockly.blockRendering.MarkerSvg');

const dom = goog.require('Blockly.utils.dom');
const eventUtils = goog.require('Blockly.Events.utils');
const svgPaths = goog.require('Blockly.utils.svgPaths');
const {ASTNode} = goog.require('Blockly.ASTNode');
/* eslint-disable-next-line no-unused-vars */
const {BlockSvg} = goog.requireType('Blockly.BlockSvg');
const {ConnectionType} = goog.require('Blockly.ConnectionType');
/* eslint-disable-next-line no-unused-vars */
const {Connection} = goog.requireType('Blockly.Connection');
/* eslint-disable-next-line no-unused-vars */
const {ConstantProvider} = goog.requireType('Blockly.blockRendering.ConstantProvider');
/* eslint-disable-next-line no-unused-vars */
const {Field} = goog.requireType('Blockly.Field');
/* eslint-disable-next-line no-unused-vars */
const {IASTNodeLocationSvg} = goog.requireType('Blockly.IASTNodeLocationSvg');
/* eslint-disable-next-line no-unused-vars */
const {Marker} = goog.requireType('Blockly.Marker');
/* eslint-disable-next-line no-unused-vars */
const {RenderedConnection} = goog.requireType('Blockly.RenderedConnection');
const {Svg} = goog.require('Blockly.utils.Svg');
/* eslint-disable-next-line no-unused-vars */
const {WorkspaceSvg} = goog.requireType('Blockly.WorkspaceSvg');
/** @suppress {extraRequire} */
goog.require('Blockly.Events.MarkerMove');


/**
 * The name of the CSS class for a cursor.
 * @const {string}
 */
const CURSOR_CLASS = 'blocklyCursor';

/**
 * The name of the CSS class for a marker.
 * @const {string}
 */
const MARKER_CLASS = 'blocklyMarker';

/**
 * What we multiply the height by to get the height of the marker.
 * Only used for the block and block connections.
 * @const {number}
 */
const HEIGHT_MULTIPLIER = 3 / 4;

/**
 * Class for a marker.
 * @alias Blockly.blockRendering.MarkerSvg
 */
class MarkerSvg {
  /**
   * @param {!WorkspaceSvg} workspace The workspace the marker belongs to.
   * @param {!ConstantProvider} constants The constants for
   *     the renderer.
   * @param {!Marker} marker The marker to draw.
   */
  constructor(workspace, constants, marker) {
    /**
     * The workspace the marker belongs to.
     * @type {!WorkspaceSvg}
     * @private
     */
    this.workspace_ = workspace;

    /**
     * The marker to draw.
     * @type {!Marker}
     * @private
     */
    this.marker_ = marker;

    /**
     * The workspace, field, or block that the marker SVG element should be
     * attached to.
     * @type {IASTNodeLocationSvg}
     * @private
     */
    this.parent_ = null;

    /**
     * The constants necessary to draw the marker.
     * @type {ConstantProvider}
     * @protected
     */
    this.constants_ = constants;

    /**
     * The current SVG element for the marker.
     * @type {Element}
     */
    this.currentMarkerSvg = null;

    const defaultColour = this.isCursor() ? this.constants_.CURSOR_COLOUR :
                                            this.constants_.MARKER_COLOUR;

    /**
     * The colour of the marker.
     * @type {string}
     */
    this.colour_ = marker.colour || defaultColour;

    /**
     * The root SVG group containing the marker.
     * @type {SVGGElement}
     * @protected
     */
    this.markerSvg_ = null;

    /**
     * @type {?SVGGElement}
     * @protected
     */
    this.svgGroup_ = null;

    /**
     * @type {?SVGPathElement}
     * @protected
     */
    this.markerBlock_ = null;

    /**
     * @type {?SVGPathElement}
     * @protected
     */
    this.markerInput_ = null;

    /**
     * @type {?SVGRectElement}
     * @protected
     */
    this.markerSvgLine_ = null;

    /**
     * @type {?SVGRectElement}
     * @protected
     */
    this.markerSvgRect_ = null;
  }

  /**
   * Return the root node of the SVG or null if none exists.
   * @return {SVGElement} The root SVG node.
   */
  getSvgRoot() {
    return this.svgGroup_;
  }

  /**
   * Get the marker.
   * @return {!Marker} The marker to draw for.
   */
  getMarker() {
    return this.marker_;
  }

  /**
   * True if the marker should be drawn as a cursor, false otherwise.
   * A cursor is drawn as a flashing line. A marker is drawn as a solid line.
   * @return {boolean} True if the marker is a cursor, false otherwise.
   */
  isCursor() {
    return this.marker_.type === 'cursor';
  }

  /**
   * Create the DOM element for the marker.
   * @return {!SVGElement} The marker controls SVG group.
   * @package
   */
  createDom() {
    const className = this.isCursor() ? CURSOR_CLASS : MARKER_CLASS;

    this.svgGroup_ = dom.createSvgElement(Svg.G, {'class': className}, null);

    this.createDomInternal_();
    return this.svgGroup_;
  }

  /**
   * Attaches the SVG root of the marker to the SVG group of the parent.
   * @param {!IASTNodeLocationSvg} newParent The workspace, field, or
   *     block that the marker SVG element should be attached to.
   * @protected
   */
  setParent_(newParent) {
    if (!this.isCursor()) {
      if (this.parent_) {
        this.parent_.setMarkerSvg(null);
      }
      newParent.setMarkerSvg(this.getSvgRoot());
    } else {
      if (this.parent_) {
        this.parent_.setCursorSvg(null);
      }
      newParent.setCursorSvg(this.getSvgRoot());
    }
    this.parent_ = newParent;
  }

  /**
   * Update the marker.
   * @param {ASTNode} oldNode The previous node the marker was on or null.
   * @param {ASTNode} curNode The node that we want to draw the marker for.
   */
  draw(oldNode, curNode) {
    if (!curNode) {
      this.hide();
      return;
    }

    this.constants_ = this.workspace_.getRenderer().getConstants();

    const defaultColour = this.isCursor() ? this.constants_.CURSOR_COLOUR :
                                            this.constants_.MARKER_COLOUR;
    this.colour_ = this.marker_.colour || defaultColour;
    this.applyColour_(curNode);

    this.showAtLocation_(curNode);

    this.fireMarkerEvent_(oldNode, curNode);

    // Ensures the marker will be visible immediately after the move.
    const animate = this.currentMarkerSvg.childNodes[0];
    if (animate !== undefined) {
      animate.beginElement && animate.beginElement();
    }
  }

  /**
   * Update the marker's visible state based on the type of curNode..
   * @param {!ASTNode} curNode The node that we want to draw the marker for.
   * @protected
   */
  showAtLocation_(curNode) {
    const curNodeAsConnection =
        /** @type {!Connection} */ (curNode.getLocation());
    const connectionType = curNodeAsConnection.type;
    if (curNode.getType() === ASTNode.types.BLOCK) {
      this.showWithBlock_(curNode);
    } else if (curNode.getType() === ASTNode.types.OUTPUT) {
      this.showWithOutput_(curNode);
    } else if (connectionType === ConnectionType.INPUT_VALUE) {
      this.showWithInput_(curNode);
    } else if (connectionType === ConnectionType.NEXT_STATEMENT) {
      this.showWithNext_(curNode);
    } else if (curNode.getType() === ASTNode.types.PREVIOUS) {
      this.showWithPrevious_(curNode);
    } else if (curNode.getType() === ASTNode.types.FIELD) {
      this.showWithField_(curNode);
    } else if (curNode.getType() === ASTNode.types.WORKSPACE) {
      this.showWithCoordinates_(curNode);
    } else if (curNode.getType() === ASTNode.types.STACK) {
      this.showWithStack_(curNode);
    }
  }

  /**************************
   * Display
   **************************/

  /**
   * Show the marker as a combination of the previous connection and block,
   * the output connection and block, or just the block.
   * @param {!ASTNode} curNode The node to draw the marker for.
   * @private
   */
  showWithBlockPrevOutput_(curNode) {
    const block = /** @type {!BlockSvg} */ (curNode.getSourceBlock());
    const width = block.width;
    const height = block.height;
    const markerHeight = height * HEIGHT_MULTIPLIER;
    const markerOffset = this.constants_.CURSOR_BLOCK_PADDING;

    if (block.previousConnection) {
      const connectionShape =
          this.constants_.shapeFor(block.previousConnection);
      this.positionPrevious_(
          width, markerOffset, markerHeight, connectionShape);
    } else if (block.outputConnection) {
      const connectionShape = this.constants_.shapeFor(block.outputConnection);
      this.positionOutput_(width, height, connectionShape);
    } else {
      this.positionBlock_(width, markerOffset, markerHeight);
    }
    this.setParent_(block);
    this.showCurrent_();
  }

  /**
   * Position and display the marker for a block.
   * @param {!ASTNode} curNode The node to draw the marker for.
   * @protected
   */
  showWithBlock_(curNode) {
    this.showWithBlockPrevOutput_(curNode);
  }

  /**
   * Position and display the marker for a previous connection.
   * @param {!ASTNode} curNode The node to draw the marker for.
   * @protected
   */
  showWithPrevious_(curNode) {
    this.showWithBlockPrevOutput_(curNode);
  }

  /**
   * Position and display the marker for an output connection.
   * @param {!ASTNode} curNode The node to draw the marker for.
   * @protected
   */
  showWithOutput_(curNode) {
    this.showWithBlockPrevOutput_(curNode);
  }

  /**
   * Position and display the marker for a workspace coordinate.
   * This is a horizontal line.
   * @param {!ASTNode} curNode The node to draw the marker for.
   * @protected
   */
  showWithCoordinates_(curNode) {
    const wsCoordinate = curNode.getWsCoordinate();
    let x = wsCoordinate.x;
    const y = wsCoordinate.y;

    if (this.workspace_.RTL) {
      x -= this.constants_.CURSOR_WS_WIDTH;
    }

    this.positionLine_(x, y, this.constants_.CURSOR_WS_WIDTH);
    this.setParent_(this.workspace_);
    this.showCurrent_();
  }

  /**
   * Position and display the marker for a field.
   * This is a box around the field.
   * @param {!ASTNode} curNode The node to draw the marker for.
   * @protected
   */
  showWithField_(curNode) {
    const field = /** @type {Field} */ (curNode.getLocation());
    const width = field.getSize().width;
    const height = field.getSize().height;

    this.positionRect_(0, 0, width, height);
    this.setParent_(field);
    this.showCurrent_();
  }

  /**
   * Position and display the marker for an input.
   * This is a puzzle piece.
   * @param {!ASTNode} curNode The node to draw the marker for.
   * @protected
   */
  showWithInput_(curNode) {
    const connection = /** @type {RenderedConnection} */
        (curNode.getLocation());
    const sourceBlock = /** @type {!BlockSvg} */ (connection.getSourceBlock());

    this.positionInput_(connection);
    this.setParent_(sourceBlock);
    this.showCurrent_();
  }

  /**
   * Position and display the marker for a next connection.
   * This is a horizontal line.
   * @param {!ASTNode} curNode The node to draw the marker for.
   * @protected
   */
  showWithNext_(curNode) {
    const connection =
        /** @type {!RenderedConnection} */ (curNode.getLocation());
    const targetBlock =
        /** @type {BlockSvg} */ (connection.getSourceBlock());
    let x = 0;
    const y = connection.getOffsetInBlock().y;
    const width = targetBlock.getHeightWidth().width;
    if (this.workspace_.RTL) {
      x = -width;
    }
    this.positionLine_(x, y, width);
    this.setParent_(targetBlock);
    this.showCurrent_();
  }

  /**
   * Position and display the marker for a stack.
   * This is a box with extra padding around the entire stack of blocks.
   * @param {!ASTNode} curNode The node to draw the marker for.
   * @protected
   */
  showWithStack_(curNode) {
    const block = /** @type {BlockSvg} */ (curNode.getLocation());

    // Gets the height and width of entire stack.
    const heightWidth = block.getHeightWidth();

    // Add padding so that being on a stack looks different than being on a
    // block.
    const width = heightWidth.width + this.constants_.CURSOR_STACK_PADDING;
    const height = heightWidth.height + this.constants_.CURSOR_STACK_PADDING;

    // Shift the rectangle slightly to upper left so padding is equal on all
    // sides.
    const xPadding = -this.constants_.CURSOR_STACK_PADDING / 2;
    const yPadding = -this.constants_.CURSOR_STACK_PADDING / 2;

    let x = xPadding;
    const y = yPadding;

    if (this.workspace_.RTL) {
      x = -(width + xPadding);
    }
    this.positionRect_(x, y, width, height);
    this.setParent_(block);
    this.showCurrent_();
  }

  /**
   * Show the current marker.
   * @protected
   */
  showCurrent_() {
    this.hide();
    this.currentMarkerSvg.style.display = '';
  }

  /**************************
   * Position
   **************************/

  /**
   * Position the marker for a block.
   * Displays an outline of the top half of a rectangle around a block.
   * @param {number} width The width of the block.
   * @param {number} markerOffset The extra padding for around the block.
   * @param {number} markerHeight The height of the marker.
   * @protected
   */
  positionBlock_(width, markerOffset, markerHeight) {
    const markerPath = svgPaths.moveBy(-markerOffset, markerHeight) +
        svgPaths.lineOnAxis('V', -markerOffset) +
        svgPaths.lineOnAxis('H', width + markerOffset * 2) +
        svgPaths.lineOnAxis('V', markerHeight);
    this.markerBlock_.setAttribute('d', markerPath);
    if (this.workspace_.RTL) {
      this.flipRtl_(this.markerBlock_);
    }
    this.currentMarkerSvg = this.markerBlock_;
  }

  /**
   * Position the marker for an input connection.
   * Displays a filled in puzzle piece.
   * @param {!RenderedConnection} connection The connection to position
   *     marker around.
   * @protected
   */
  positionInput_(connection) {
    const x = connection.getOffsetInBlock().x;
    const y = connection.getOffsetInBlock().y;

    const path =
        svgPaths.moveTo(0, 0) + this.constants_.shapeFor(connection).pathDown;

    this.markerInput_.setAttribute('d', path);
    this.markerInput_.setAttribute(
        'transform',
        'translate(' + x + ',' + y + ')' +
            (this.workspace_.RTL ? ' scale(-1 1)' : ''));
    this.currentMarkerSvg = this.markerInput_;
  }

  /**
   * Move and show the marker at the specified coordinate in workspace units.
   * Displays a horizontal line.
   * @param {number} x The new x, in workspace units.
   * @param {number} y The new y, in workspace units.
   * @param {number} width The new width, in workspace units.
   * @protected
   */
  positionLine_(x, y, width) {
    this.markerSvgLine_.setAttribute('x', x);
    this.markerSvgLine_.setAttribute('y', y);
    this.markerSvgLine_.setAttribute('width', width);
    this.currentMarkerSvg = this.markerSvgLine_;
  }

  /**
   * Position the marker for an output connection.
   * Displays a puzzle outline and the top and bottom path.
   * @param {number} width The width of the block.
   * @param {number} height The height of the block.
   * @param {!Object} connectionShape The shape object for the connection.
   * @protected
   */
  positionOutput_(width, height, connectionShape) {
    const markerPath = svgPaths.moveBy(width, 0) +
        svgPaths.lineOnAxis('h', -(width - connectionShape.width)) +
        svgPaths.lineOnAxis('v', this.constants_.TAB_OFFSET_FROM_TOP) +
        connectionShape.pathDown + svgPaths.lineOnAxis('V', height) +
        svgPaths.lineOnAxis('H', width);
    this.markerBlock_.setAttribute('d', markerPath);
    if (this.workspace_.RTL) {
      this.flipRtl_(this.markerBlock_);
    }
    this.currentMarkerSvg = this.markerBlock_;
  }

  /**
   * Position the marker for a previous connection.
   * Displays a half rectangle with a notch in the top to represent the previous
   * connection.
   * @param {number} width The width of the block.
   * @param {number} markerOffset The offset of the marker from around the
   *     block.
   * @param {number} markerHeight The height of the marker.
   * @param {!Object} connectionShape The shape object for the connection.
   * @protected
   */
  positionPrevious_(width, markerOffset, markerHeight, connectionShape) {
    const markerPath = svgPaths.moveBy(-markerOffset, markerHeight) +
        svgPaths.lineOnAxis('V', -markerOffset) +
        svgPaths.lineOnAxis('H', this.constants_.NOTCH_OFFSET_LEFT) +
        connectionShape.pathLeft +
        svgPaths.lineOnAxis('H', width + markerOffset * 2) +
        svgPaths.lineOnAxis('V', markerHeight);
    this.markerBlock_.setAttribute('d', markerPath);
    if (this.workspace_.RTL) {
      this.flipRtl_(this.markerBlock_);
    }
    this.currentMarkerSvg = this.markerBlock_;
  }

  /**
   * Move and show the marker at the specified coordinate in workspace units.
   * Displays a filled in rectangle.
   * @param {number} x The new x, in workspace units.
   * @param {number} y The new y, in workspace units.
   * @param {number} width The new width, in workspace units.
   * @param {number} height The new height, in workspace units.
   * @protected
   */
  positionRect_(x, y, width, height) {
    this.markerSvgRect_.setAttribute('x', x);
    this.markerSvgRect_.setAttribute('y', y);
    this.markerSvgRect_.setAttribute('width', width);
    this.markerSvgRect_.setAttribute('height', height);
    this.currentMarkerSvg = this.markerSvgRect_;
  }

  /**
   * Flip the SVG paths in RTL.
   * @param {!SVGElement} markerSvg The marker that we want to flip.
   * @private
   */
  flipRtl_(markerSvg) {
    markerSvg.setAttribute('transform', 'scale(-1 1)');
  }

  /**
   * Hide the marker.
   */
  hide() {
    this.markerSvgLine_.style.display = 'none';
    this.markerSvgRect_.style.display = 'none';
    this.markerInput_.style.display = 'none';
    this.markerBlock_.style.display = 'none';
  }

  /**
   * Fire event for the marker or marker.
   * @param {ASTNode} oldNode The old node the marker used to be on.
   * @param {!ASTNode} curNode The new node the marker is currently on.
   * @private
   */
  fireMarkerEvent_(oldNode, curNode) {
    const curBlock = curNode.getSourceBlock();
    const event = new (eventUtils.get(eventUtils.MARKER_MOVE))(
        curBlock, this.isCursor(), oldNode, curNode);
    eventUtils.fire(event);
  }

  /**
   * Get the properties to make a marker blink.
   * @return {!Object} The object holding attributes to make the marker blink.
   * @protected
   */
  getBlinkProperties_() {
    return {
      'attributeType': 'XML',
      'attributeName': 'fill',
      'dur': '1s',
      'values': this.colour_ + ';transparent;transparent;',
      'repeatCount': 'indefinite',
    };
  }

  /**
   * Create the marker SVG.
   * @return {Element} The SVG node created.
   * @protected
   */
  createDomInternal_() {
    /* This markup will be generated and added to the .svgGroup_:
    <g>
      <rect width="100" height="5">
        <animate attributeType="XML" attributeName="fill" dur="1s"
          values="transparent;transparent;#fff;transparent"
    repeatCount="indefinite" />
      </rect>
    </g>
    */

    this.markerSvg_ = dom.createSvgElement(
        Svg.G, {
          'width': this.constants_.CURSOR_WS_WIDTH,
          'height': this.constants_.WS_CURSOR_HEIGHT,
        },
        this.svgGroup_);

    // A horizontal line used to represent a workspace coordinate or next
    // connection.
    this.markerSvgLine_ = dom.createSvgElement(
        Svg.RECT, {
          'width': this.constants_.CURSOR_WS_WIDTH,
          'height': this.constants_.WS_CURSOR_HEIGHT,
          'style': 'display: none',
        },
        this.markerSvg_);

    // A filled in rectangle used to represent a stack.
    this.markerSvgRect_ = dom.createSvgElement(
        Svg.RECT, {
          'class': 'blocklyVerticalMarker',
          'rx': 10,
          'ry': 10,
          'style': 'display: none',
        },
        this.markerSvg_);

    // A filled in puzzle piece used to represent an input value.
    this.markerInput_ = dom.createSvgElement(
        Svg.PATH, {'transform': '', 'style': 'display: none'}, this.markerSvg_);

    // A path used to represent a previous connection and a block, an output
    // connection and a block, or a block.
    this.markerBlock_ = dom.createSvgElement(
        Svg.PATH, {
          'transform': '',
          'style': 'display: none',
          'fill': 'none',
          'stroke-width': this.constants_.CURSOR_STROKE_WIDTH,
        },
        this.markerSvg_);

    // Markers and stack markers don't blink.
    if (this.isCursor()) {
      const blinkProperties = this.getBlinkProperties_();
      dom.createSvgElement(Svg.ANIMATE, blinkProperties, this.markerSvgLine_);
      dom.createSvgElement(Svg.ANIMATE, blinkProperties, this.markerInput_);
      blinkProperties['attributeName'] = 'stroke';
      dom.createSvgElement(Svg.ANIMATE, blinkProperties, this.markerBlock_);
    }

    return this.markerSvg_;
  }

  /**
   * Apply the marker's colour.
   * @param {!ASTNode} _curNode The node that we want to draw the marker
   *    for.
   * @protected
   */
  applyColour_(_curNode) {
    this.markerSvgLine_.setAttribute('fill', this.colour_);
    this.markerSvgRect_.setAttribute('stroke', this.colour_);
    this.markerInput_.setAttribute('fill', this.colour_);
    this.markerBlock_.setAttribute('stroke', this.colour_);

    if (this.isCursor()) {
      const values = this.colour_ + ';transparent;transparent;';
      this.markerSvgLine_.firstChild.setAttribute('values', values);
      this.markerInput_.firstChild.setAttribute('values', values);
      this.markerBlock_.firstChild.setAttribute('values', values);
    }
  }

  /**
   * Dispose of this marker.
   */
  dispose() {
    if (this.svgGroup_) {
      dom.removeNode(this.svgGroup_);
    }
  }
}

exports.MarkerSvg = MarkerSvg;
