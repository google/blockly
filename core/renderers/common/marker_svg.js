/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Methods for graphically rendering a marker as SVG.
 * @author samelh@microsoft.com (Sam El-Husseini)
 */
'use strict';


goog.provide('Blockly.blockRendering.MarkerSvg');

goog.require('Blockly.ASTNode');


/**
 * Class for a marker.
 * @param {!Blockly.WorkspaceSvg} workspace The workspace the marker belongs to.
 * @param {!Blockly.blockRendering.ConstantProvider} constants The constants for
 *     the renderer.
 * @param {!Blockly.Marker} marker The marker to draw.
 * @constructor
 */
Blockly.blockRendering.MarkerSvg = function(workspace, constants, marker) {
  /**
   * The workspace the marker belongs to.
   * @type {!Blockly.WorkspaceSvg}
   * @private
   */
  this.workspace_ = workspace;

  /**
   * The marker to draw.
   * @type {!Blockly.Marker}
   * @private
   */
  this.marker_ = marker;

  /**
   * The workspace, field, or block that the marker SVG element should be
   * attached to.
   * @type {Blockly.IASTNodeLocationSvg}
   * @private
   */
  this.parent_ = null;

  /**
   * The constants necessary to draw the marker.
   * @type {Blockly.blockRendering.ConstantProvider}
   * @protected
   */
  this.constants_ = constants;

  /**
   * The current SVG element for the marker.
   * @type {Element}
   */
  this.currentMarkerSvg = null;

  var defaultColour = this.isCursor() ? this.constants_.CURSOR_COLOUR :
      this.constants_.MARKER_COLOUR;

  /**
   * The colour of the marker.
   * @type {string}
   */
  this.colour_ = marker.colour || defaultColour;
};

/**
 * The name of the CSS class for a cursor.
 * @const {string}
 */
Blockly.blockRendering.MarkerSvg.CURSOR_CLASS = 'blocklyCursor';

/**
 * The name of the CSS class for a marker.
 * @const {string}
 */
Blockly.blockRendering.MarkerSvg.MARKER_CLASS = 'blocklyMarker';

/**
 * What we multiply the height by to get the height of the marker.
 * Only used for the block and block connections.
 * @const {number}
 */
Blockly.blockRendering.MarkerSvg.HEIGHT_MULTIPLIER = 3 / 4;

/**
 * Return the root node of the SVG or null if none exists.
 * @return {SVGElement} The root SVG node.
 */
Blockly.blockRendering.MarkerSvg.prototype.getSvgRoot = function() {
  return this.svgGroup_;
};

/**
 * Get the marker.
 * @return {!Blockly.Marker} The marker to draw for.
 */
Blockly.blockRendering.MarkerSvg.prototype.getMarker = function() {
  return this.marker_;
};

/**
 * True if the marker should be drawn as a cursor, false otherwise.
 * A cursor is drawn as a flashing line. A marker is drawn as a solid line.
 * @return {boolean} True if the marker is a cursor, false otherwise.
 */
Blockly.blockRendering.MarkerSvg.prototype.isCursor = function() {
  return this.marker_.type == 'cursor';
};

/**
 * Create the DOM element for the marker.
 * @return {!SVGElement} The marker controls SVG group.
 * @package
 */
Blockly.blockRendering.MarkerSvg.prototype.createDom = function() {
  var className = this.isCursor() ?
      Blockly.blockRendering.MarkerSvg.CURSOR_CLASS :
      Blockly.blockRendering.MarkerSvg.MARKER_CLASS;

  this.svgGroup_ =
      Blockly.utils.dom.createSvgElement('g', {
        'class': className
      }, null);

  this.createDomInternal_();
  return this.svgGroup_;
};

/**
 * Attaches the SVG root of the marker to the SVG group of the parent.
 * @param {!Blockly.IASTNodeLocationSvg} newParent The workspace, field, or
 *     block that the marker SVG element should be attached to.
 * @protected
 */
Blockly.blockRendering.MarkerSvg.prototype.setParent_ = function(newParent) {
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
};

/**
 * Update the marker.
 * @param {Blockly.ASTNode} oldNode The previous node the marker was on or null.
 * @param {Blockly.ASTNode} curNode The node that we want to draw the marker for.
 */
Blockly.blockRendering.MarkerSvg.prototype.draw = function(oldNode, curNode) {
  if (!curNode) {
    this.hide();
    return;
  }

  this.constants_ = this.workspace_.getRenderer().getConstants();

  var defaultColour = this.isCursor() ? this.constants_.CURSOR_COLOUR :
    this.constants_.MARKER_COLOUR;
  this.colour_ = this.marker_.colour || defaultColour;
  this.applyColour_(curNode);

  this.showAtLocation_(curNode);

  this.fireMarkerEvent_(oldNode, curNode);

  // Ensures the marker will be visible immediately after the move.
  var animate = this.currentMarkerSvg.childNodes[0];
  if (animate !== undefined) {
    animate.beginElement && animate.beginElement();
  }
};


/**
 * Update the marker's visible state based on the type of curNode..
 * @param {!Blockly.ASTNode} curNode The node that we want to draw the marker for.
 * @protected
 */
Blockly.blockRendering.MarkerSvg.prototype.showAtLocation_ = function(curNode) {
  var curNodeAsConnection =
    /** @type {!Blockly.Connection} */ (curNode.getLocation());
  if (curNode.getType() == Blockly.ASTNode.types.BLOCK) {
    this.showWithBlock_(curNode);
  } else if (curNode.getType() == Blockly.ASTNode.types.OUTPUT) {
    this.showWithOutput_(curNode);
  } else if (curNodeAsConnection.type == Blockly.INPUT_VALUE) {
    this.showWithInput_(curNode);
  } else if (curNodeAsConnection.type == Blockly.NEXT_STATEMENT) {
    this.showWithNext_(curNode);
  } else if (curNode.getType() == Blockly.ASTNode.types.PREVIOUS) {
    this.showWithPrevious_(curNode);
  } else if (curNode.getType() == Blockly.ASTNode.types.FIELD) {
    this.showWithField_(curNode);
  } else if (curNode.getType() == Blockly.ASTNode.types.WORKSPACE) {
    this.showWithCoordinates_(curNode);
  } else if (curNode.getType() == Blockly.ASTNode.types.STACK) {
    this.showWithStack_(curNode);
  }
};

/**************************
 * Display
 **************************/

/**
 * Show the marker as a combination of the previous connection and block,
 * the output connection and block, or just the block.
 * @param {!Blockly.ASTNode} curNode The node to draw the marker for.
 * @private
 */
Blockly.blockRendering.MarkerSvg.prototype.showWithBlockPrevOutput_ = function(
    curNode) {
  var block = /** @type {!Blockly.BlockSvg} */ (curNode.getSourceBlock());
  var width = block.width;
  var height = block.height;
  var markerHeight = height * Blockly.blockRendering.MarkerSvg.HEIGHT_MULTIPLIER;
  var markerOffset = this.constants_.CURSOR_BLOCK_PADDING;

  if (block.previousConnection) {
    var connectionShape = this.constants_.shapeFor(block.previousConnection);
    this.positionPrevious_(width, markerOffset, markerHeight, connectionShape);
  } else if (block.outputConnection) {
    var connectionShape = this.constants_.shapeFor(block.outputConnection);
    this.positionOutput_(width, height, connectionShape);
  } else {
    this.positionBlock_(width, markerOffset, markerHeight);
  }
  this.setParent_(block);
  this.showCurrent_();
};

/**
 * Position and display the marker for a block.
 * @param {!Blockly.ASTNode} curNode The node to draw the marker for.
 * @protected
 */
Blockly.blockRendering.MarkerSvg.prototype.showWithBlock_ = function(curNode) {
  this.showWithBlockPrevOutput_(curNode);
};

/**
 * Position and display the marker for a previous connection.
 * @param {!Blockly.ASTNode} curNode The node to draw the marker for.
 * @protected
 */
Blockly.blockRendering.MarkerSvg.prototype.showWithPrevious_ = function(
    curNode) {
  this.showWithBlockPrevOutput_(curNode);
};

/**
 * Position and display the marker for an output connection.
 * @param {!Blockly.ASTNode} curNode The node to draw the marker for.
 * @protected
 */
Blockly.blockRendering.MarkerSvg.prototype.showWithOutput_ = function(curNode) {
  this.showWithBlockPrevOutput_(curNode);
};

/**
 * Position and display the marker for a workspace coordinate.
 * This is a horizontal line.
 * @param {!Blockly.ASTNode} curNode The node to draw the marker for.
 * @protected
 */
Blockly.blockRendering.MarkerSvg.prototype.showWithCoordinates_ = function(
    curNode) {
  var wsCoordinate = curNode.getWsCoordinate();
  var x = wsCoordinate.x;
  var y = wsCoordinate.y;

  if (this.workspace_.RTL) {
    x -= this.constants_.CURSOR_WS_WIDTH;
  }

  this.positionLine_(x, y, this.constants_.CURSOR_WS_WIDTH);
  this.setParent_(this.workspace_);
  this.showCurrent_();
};

/**
 * Position and display the marker for a field.
 * This is a box around the field.
 * @param {!Blockly.ASTNode} curNode The node to draw the marker for.
 * @protected
 */
Blockly.blockRendering.MarkerSvg.prototype.showWithField_ = function(curNode) {
  var field = /** @type {Blockly.Field} */ (curNode.getLocation());
  var width = field.getSize().width;
  var height = field.getSize().height;

  this.positionRect_(0, 0, width, height);
  this.setParent_(field);
  this.showCurrent_();
};

/**
 * Position and display the marker for an input.
 * This is a puzzle piece.
 * @param {!Blockly.ASTNode} curNode The node to draw the marker for.
 * @protected
 */
Blockly.blockRendering.MarkerSvg.prototype.showWithInput_ = function(curNode) {
  var connection = /** @type {Blockly.RenderedConnection} */
      (curNode.getLocation());
  var sourceBlock = /** @type {!Blockly.BlockSvg} */ (connection.getSourceBlock());

  this.positionInput_(connection);
  this.setParent_(sourceBlock);
  this.showCurrent_();
};


/**
 * Position and display the marker for a next connection.
 * This is a horizontal line.
 * @param {!Blockly.ASTNode} curNode The node to draw the marker for.
 * @protected
 */
Blockly.blockRendering.MarkerSvg.prototype.showWithNext_ = function(curNode) {
  var connection =
    /** @type {!Blockly.RenderedConnection} */ (curNode.getLocation());
  var targetBlock =
    /** @type {Blockly.BlockSvg} */ (connection.getSourceBlock());
  var x = 0;
  var y = connection.getOffsetInBlock().y;
  var width = targetBlock.getHeightWidth().width;
  if (this.workspace_.RTL) {
    x = -width;
  }
  this.positionLine_(x, y, width);
  this.setParent_(targetBlock);
  this.showCurrent_();
};

/**
 * Position and display the marker for a stack.
 * This is a box with extra padding around the entire stack of blocks.
 * @param {!Blockly.ASTNode} curNode The node to draw the marker for.
 * @protected
 */
Blockly.blockRendering.MarkerSvg.prototype.showWithStack_ = function(curNode) {
  var block = /** @type {Blockly.BlockSvg} */ (curNode.getLocation());

  // Gets the height and width of entire stack.
  var heightWidth = block.getHeightWidth();

  // Add padding so that being on a stack looks different than being on a block.
  var width = heightWidth.width + this.constants_.CURSOR_STACK_PADDING;
  var height = heightWidth.height + this.constants_.CURSOR_STACK_PADDING;

  // Shift the rectangle slightly to upper left so padding is equal on all sides.
  var xPadding = -this.constants_.CURSOR_STACK_PADDING / 2;
  var yPadding = -this.constants_.CURSOR_STACK_PADDING / 2;

  var x = xPadding;
  var y = yPadding;

  if (this.workspace_.RTL) {
    x = -(width + xPadding);
  }
  this.positionRect_(x, y, width, height);
  this.setParent_(block);
  this.showCurrent_();
};

/**
 * Show the current marker.
 * @protected
 */
Blockly.blockRendering.MarkerSvg.prototype.showCurrent_ = function() {
  this.hide();
  this.currentMarkerSvg.style.display = '';
};

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
Blockly.blockRendering.MarkerSvg.prototype.positionBlock_ = function(
    width, markerOffset, markerHeight) {
  var markerPath = Blockly.utils.svgPaths.moveBy(-markerOffset, markerHeight) +
      Blockly.utils.svgPaths.lineOnAxis('V', -markerOffset) +
      Blockly.utils.svgPaths.lineOnAxis('H', width + markerOffset * 2) +
      Blockly.utils.svgPaths.lineOnAxis('V', markerHeight);
  this.markerBlock_.setAttribute('d', markerPath);
  if (this.workspace_.RTL) {
    this.flipRtl_(this.markerBlock_);
  }
  this.currentMarkerSvg = this.markerBlock_;
};

/**
 * Position the marker for an input connection.
 * Displays a filled in puzzle piece.
 * @param {!Blockly.RenderedConnection} connection The connection to position
 *     marker around.
 * @protected
 */
Blockly.blockRendering.MarkerSvg.prototype.positionInput_ = function(
    connection) {
  var x = connection.getOffsetInBlock().x;
  var y = connection.getOffsetInBlock().y;

  var path = Blockly.utils.svgPaths.moveTo(0, 0) +
      this.constants_.shapeFor(connection).pathDown;

  this.markerInput_.setAttribute('d', path);
  this.markerInput_.setAttribute('transform',
      'translate(' + x + ',' + y + ')' +
      (this.workspace_.RTL ? ' scale(-1 1)' : ''));
  this.currentMarkerSvg = this.markerInput_;
};

/**
 * Move and show the marker at the specified coordinate in workspace units.
 * Displays a horizontal line.
 * @param {number} x The new x, in workspace units.
 * @param {number} y The new y, in workspace units.
 * @param {number} width The new width, in workspace units.
 * @protected
 */
Blockly.blockRendering.MarkerSvg.prototype.positionLine_ = function(
    x, y, width) {
  this.markerSvgLine_.setAttribute('x', x);
  this.markerSvgLine_.setAttribute('y', y);
  this.markerSvgLine_.setAttribute('width', width);
  this.currentMarkerSvg = this.markerSvgLine_;
};

/**
 * Position the marker for an output connection.
 * Displays a puzzle outline and the top and bottom path.
 * @param {number} width The width of the block.
 * @param {number} height The height of the block.
 * @param {!Object} connectionShape The shape object for the connection.
 * @protected
 */
Blockly.blockRendering.MarkerSvg.prototype.positionOutput_ = function(
    width, height, connectionShape) {
  var markerPath = Blockly.utils.svgPaths.moveBy(width, 0) +
      Blockly.utils.svgPaths.lineOnAxis(
          'h', -(width - connectionShape.width)) +
      Blockly.utils.svgPaths.lineOnAxis(
          'v', this.constants_.TAB_OFFSET_FROM_TOP) +
      connectionShape.pathDown +
      Blockly.utils.svgPaths.lineOnAxis('V', height) +
      Blockly.utils.svgPaths.lineOnAxis('H', width);
  this.markerBlock_.setAttribute('d', markerPath);
  if (this.workspace_.RTL) {
    this.flipRtl_(this.markerBlock_);
  }
  this.currentMarkerSvg = this.markerBlock_;
};

/**
 * Position the marker for a previous connection.
 * Displays a half rectangle with a notch in the top to represent the previous
 * connection.
 * @param {number} width The width of the block.
 * @param {number} markerOffset The offset of the marker from around the block.
 * @param {number} markerHeight The height of the marker.
 * @param {!Object} connectionShape The shape object for the connection.
 * @protected
 */
Blockly.blockRendering.MarkerSvg.prototype.positionPrevious_ = function(
    width, markerOffset, markerHeight, connectionShape) {
  var markerPath = Blockly.utils.svgPaths.moveBy(-markerOffset, markerHeight) +
      Blockly.utils.svgPaths.lineOnAxis('V', -markerOffset) +
      Blockly.utils.svgPaths.lineOnAxis(
          'H', this.constants_.NOTCH_OFFSET_LEFT) +
      connectionShape.pathLeft +
      Blockly.utils.svgPaths.lineOnAxis(
          'H', width + markerOffset * 2) +
      Blockly.utils.svgPaths.lineOnAxis('V', markerHeight);
  this.markerBlock_.setAttribute('d', markerPath);
  if (this.workspace_.RTL) {
    this.flipRtl_(this.markerBlock_);
  }
  this.currentMarkerSvg = this.markerBlock_;
};

/**
 * Move and show the marker at the specified coordinate in workspace units.
 * Displays a filled in rectangle.
 * @param {number} x The new x, in workspace units.
 * @param {number} y The new y, in workspace units.
 * @param {number} width The new width, in workspace units.
 * @param {number} height The new height, in workspace units.
 * @protected
 */
Blockly.blockRendering.MarkerSvg.prototype.positionRect_ = function(
    x, y, width, height) {
  this.markerSvgRect_.setAttribute('x', x);
  this.markerSvgRect_.setAttribute('y', y);
  this.markerSvgRect_.setAttribute('width', width);
  this.markerSvgRect_.setAttribute('height', height);
  this.currentMarkerSvg = this.markerSvgRect_;
};

/**
 * Flip the SVG paths in RTL.
 * @param {!SVGElement} markerSvg The marker that we want to flip.
 * @private
 */
Blockly.blockRendering.MarkerSvg.prototype.flipRtl_ = function(markerSvg) {
  markerSvg.setAttribute('transform', 'scale(-1 1)');
};

/**
 * Hide the marker.
 */
Blockly.blockRendering.MarkerSvg.prototype.hide = function() {
  this.markerSvgLine_.style.display = 'none';
  this.markerSvgRect_.style.display = 'none';
  this.markerInput_.style.display = 'none';
  this.markerBlock_.style.display = 'none';
};


/**
 * Fire event for the marker or marker.
 * @param {Blockly.ASTNode} oldNode The old node the marker used to be on.
 * @param {!Blockly.ASTNode} curNode The new node the marker is currently on.
 * @private
 */
Blockly.blockRendering.MarkerSvg.prototype.fireMarkerEvent_ = function(
    oldNode, curNode) {
  var curBlock = curNode.getSourceBlock();
  var eventType = this.isCursor() ? 'cursorMove' : 'markerMove';
  var event = new Blockly.Events.Ui(curBlock, eventType, oldNode, curNode);
  if (curNode.getType() == Blockly.ASTNode.types.WORKSPACE) {
    event.workspaceId =
      (/** @type {!Blockly.Workspace} */ (curNode.getLocation())).id;
  }
  Blockly.Events.fire(event);
};

/**
 * Get the properties to make a marker blink.
 * @return {!Object} The object holding attributes to make the marker blink.
 * @protected
 */
Blockly.blockRendering.MarkerSvg.prototype.getBlinkProperties_ = function() {
  return {
    'attributeType': 'XML',
    'attributeName': 'fill',
    'dur': '1s',
    'values': this.colour_ + ';transparent;transparent;',
    'repeatCount': 'indefinite'
  };
};


/**
 * Create the marker SVG.
 * @return {Element} The SVG node created.
 * @protected
 */
Blockly.blockRendering.MarkerSvg.prototype.createDomInternal_ = function() {
  /* This markup will be generated and added to the .svgGroup_:
  <g>
    <rect width="100" height="5">
      <animate attributeType="XML" attributeName="fill" dur="1s"
        values="transparent;transparent;#fff;transparent" repeatCount="indefinite" />
    </rect>
  </g>
  */

  this.markerSvg_ = Blockly.utils.dom.createSvgElement('g',
      {
        'width': this.constants_.CURSOR_WS_WIDTH,
        'height': this.constants_.WS_CURSOR_HEIGHT
      }, this.svgGroup_);

  // A horizontal line used to represent a workspace coordinate or next
  // connection.
  this.markerSvgLine_ = Blockly.utils.dom.createSvgElement('rect',
      {
        'width': this.constants_.CURSOR_WS_WIDTH,
        'height': this.constants_.WS_CURSOR_HEIGHT,
        'style': 'display: none'
      },
      this.markerSvg_);

  // A filled in rectangle used to represent a stack.
  this.markerSvgRect_ = Blockly.utils.dom.createSvgElement('rect',
      {
        'class': 'blocklyVerticalMarker',
        'rx': 10, 'ry': 10,
        'style': 'display: none'
      },
      this.markerSvg_);

  // A filled in puzzle piece used to represent an input value.
  this.markerInput_ = Blockly.utils.dom.createSvgElement('path',
      {
        'transform': '',
        'style': 'display: none'
      },
      this.markerSvg_);

  // A path used to represent a previous connection and a block, an output
  // connection and a block, or a block.
  this.markerBlock_ = Blockly.utils.dom.createSvgElement('path',
      {
        'transform': '',
        'style': 'display: none',
        'fill': 'none',
        'stroke-width': this.constants_.CURSOR_STROKE_WIDTH
      },
      this.markerSvg_);

  // Markers and stack markers don't blink.
  if (this.isCursor()) {
    var blinkProperties = this.getBlinkProperties_();
    Blockly.utils.dom.createSvgElement('animate', blinkProperties,
        this.markerSvgLine_);
    Blockly.utils.dom.createSvgElement('animate', blinkProperties,
        this.markerInput_);
    blinkProperties['attributeName'] = 'stroke';
    Blockly.utils.dom.createSvgElement('animate', blinkProperties,
        this.markerBlock_);
  }

  return this.markerSvg_;
};

/**
 * Apply the marker's colour.
 * @param {!Blockly.ASTNode} _curNode The node that we want to draw the marker
 *    for.
 * @protected
 */
Blockly.blockRendering.MarkerSvg.prototype.applyColour_ = function(_curNode) {
  this.markerSvgLine_.setAttribute('fill', this.colour_);
  this.markerSvgRect_.setAttribute('stroke', this.colour_);
  this.markerInput_.setAttribute('fill', this.colour_);
  this.markerBlock_.setAttribute('stroke', this.colour_);

  if (this.isCursor()) {
    var values = this.colour_ + ';transparent;transparent;';
    this.markerSvgLine_.firstChild.setAttribute('values', values);
    this.markerInput_.firstChild.setAttribute('values', values);
    this.markerBlock_.firstChild.setAttribute('values', values);
  }
};

/**
 * Dispose of this marker.
 */
Blockly.blockRendering.MarkerSvg.prototype.dispose = function() {
  if (this.svgGroup_) {
    Blockly.utils.dom.removeNode(this.svgGroup_);
  }
};
