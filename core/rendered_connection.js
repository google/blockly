/**
 * @license
 * Copyright 2016 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Components for creating connections between blocks.
 * @author fenichel@google.com (Rachel Fenichel)
 */
'use strict';

goog.provide('Blockly.RenderedConnection');

goog.require('Blockly.Connection');
goog.require('Blockly.constants');
goog.require('Blockly.Events');
goog.require('Blockly.utils');
goog.require('Blockly.utils.Coordinate');
goog.require('Blockly.utils.deprecation');
goog.require('Blockly.utils.dom');
goog.require('Blockly.utils.object');
goog.require('Blockly.utils.Svg');


/**
 * Class for a connection between blocks that may be rendered on screen.
 * @param {!Blockly.BlockSvg} source The block establishing this connection.
 * @param {number} type The type of the connection.
 * @extends {Blockly.Connection}
 * @constructor
 */
Blockly.RenderedConnection = function(source, type) {
  Blockly.RenderedConnection.superClass_.constructor.call(this, source, type);

  /**
   * Connection database for connections of this type on the current workspace.
   * @const {!Blockly.ConnectionDB}
   * @private
   */
  this.db_ = source.workspace.connectionDBList[type];

  /**
   * Connection database for connections compatible with this type on the
   * current workspace.
   * @const {!Blockly.ConnectionDB}
   * @private
   */
  this.dbOpposite_ = source.workspace
      .connectionDBList[Blockly.OPPOSITE_TYPE[type]];

  /**
   * Workspace units, (0, 0) is top left of block.
   * @type {!Blockly.utils.Coordinate}
   * @private
   */
  this.offsetInBlock_ = new Blockly.utils.Coordinate(0, 0);

  /**
   * Describes the state of this connection's tracked-ness.
   * @type {Blockly.RenderedConnection.TrackedState}
   * @private
   */
  this.trackedState_ = Blockly.RenderedConnection.TrackedState.WILL_TRACK;

  /**
   * Connection this connection connects to.  Null if not connected.
   * @type {Blockly.RenderedConnection}
   */
  this.targetConnection = null;
};
Blockly.utils.object.inherits(Blockly.RenderedConnection, Blockly.Connection);

/**
 * Enum for different kinds of tracked states.
 *
 * WILL_TRACK means that this connection will add itself to
 * the db on the next moveTo call it receives.
 *
 * UNTRACKED means that this connection will not add
 * itself to the database until setTracking(true) is explicitly called.
 *
 * TRACKED means that this connection is currently being tracked.
 * @enum {number}
 */
Blockly.RenderedConnection.TrackedState = {
  WILL_TRACK: -1,
  UNTRACKED: 0,
  TRACKED: 1
};

/**
 * Dispose of this connection. Remove it from the database (if it is
 * tracked) and call the super-function to deal with connected blocks.
 * @override
 * @package
 */
Blockly.RenderedConnection.prototype.dispose = function() {
  Blockly.RenderedConnection.superClass_.dispose.call(this);
  if (this.trackedState_ == Blockly.RenderedConnection.TrackedState.TRACKED) {
    this.db_.removeConnection(this, this.y);
  }
};

/**
 * Get the source block for this connection.
 * @return {!Blockly.BlockSvg} The source block.
 * @override
 */
Blockly.RenderedConnection.prototype.getSourceBlock = function() {
  return /** @type {!Blockly.BlockSvg} */ (
    Blockly.RenderedConnection.superClass_.getSourceBlock.call(this));
};

/**
 * Returns the block that this connection connects to.
 * @return {Blockly.BlockSvg} The connected block or null if none is connected.
 * @override
 */
Blockly.RenderedConnection.prototype.targetBlock = function() {
  return /** @type {Blockly.BlockSvg} */ (
    Blockly.RenderedConnection.superClass_.targetBlock.call(this));
};

/**
 * Returns the distance between this connection and another connection in
 * workspace units.
 * @param {!Blockly.Connection} otherConnection The other connection to measure
 *     the distance to.
 * @return {number} The distance between connections, in workspace units.
 */
Blockly.RenderedConnection.prototype.distanceFrom = function(otherConnection) {
  var xDiff = this.x - otherConnection.x;
  var yDiff = this.y - otherConnection.y;
  return Math.sqrt(xDiff * xDiff + yDiff * yDiff);
};

/**
 * Move the block(s) belonging to the connection to a point where they don't
 * visually interfere with the specified connection.
 * @param {!Blockly.Connection} staticConnection The connection to move away
 *     from.
 * @package
 */
Blockly.RenderedConnection.prototype.bumpAwayFrom = function(staticConnection) {
  if (this.sourceBlock_.workspace.isDragging()) {
    // Don't move blocks around while the user is doing the same.
    return;
  }
  // Move the root block.
  var rootBlock = this.sourceBlock_.getRootBlock();
  if (rootBlock.isInFlyout) {
    // Don't move blocks around in a flyout.
    return;
  }
  var reverse = false;
  if (!rootBlock.isMovable()) {
    // Can't bump an uneditable block away.
    // Check to see if the other block is movable.
    rootBlock = staticConnection.getSourceBlock().getRootBlock();
    if (!rootBlock.isMovable()) {
      return;
    }
    // Swap the connections and move the 'static' connection instead.
    staticConnection = this;
    reverse = true;
  }
  // Raise it to the top for extra visibility.
  var selected = Blockly.selected == rootBlock;
  selected || rootBlock.addSelect();
  var dx = (staticConnection.x + Blockly.SNAP_RADIUS +
      Math.floor(Math.random() * Blockly.BUMP_RANDOMNESS)) - this.x;
  var dy = (staticConnection.y + Blockly.SNAP_RADIUS +
      Math.floor(Math.random() * Blockly.BUMP_RANDOMNESS)) - this.y;
  if (reverse) {
    // When reversing a bump due to an uneditable block, bump up.
    dy = -dy;
  }
  if (rootBlock.RTL) {
    dx = (staticConnection.x - Blockly.SNAP_RADIUS -
      Math.floor(Math.random() * Blockly.BUMP_RANDOMNESS)) - this.x;
  }
  rootBlock.moveBy(dx, dy);
  selected || rootBlock.removeSelect();
};

/**
 * Change the connection's coordinates.
 * @param {number} x New absolute x coordinate, in workspace coordinates.
 * @param {number} y New absolute y coordinate, in workspace coordinates.
 */
Blockly.RenderedConnection.prototype.moveTo = function(x, y) {
  if (this.trackedState_ == Blockly.RenderedConnection.TrackedState.WILL_TRACK) {
    this.db_.addConnection(this, y);
    this.trackedState_ = Blockly.RenderedConnection.TrackedState.TRACKED;
  } else if (this.trackedState_ == Blockly.RenderedConnection
      .TrackedState.TRACKED) {
    this.db_.removeConnection(this, this.y);
    this.db_.addConnection(this, y);
  }
  this.x = x;
  this.y = y;
};

/**
 * Change the connection's coordinates.
 * @param {number} dx Change to x coordinate, in workspace units.
 * @param {number} dy Change to y coordinate, in workspace units.
 */
Blockly.RenderedConnection.prototype.moveBy = function(dx, dy) {
  this.moveTo(this.x + dx, this.y + dy);
};

/**
 * Move this connection to the location given by its offset within the block and
 * the location of the block's top left corner.
 * @param {!Blockly.utils.Coordinate} blockTL The location of the top left
 *     corner of the block, in workspace coordinates.
 */
Blockly.RenderedConnection.prototype.moveToOffset = function(blockTL) {
  this.moveTo(blockTL.x + this.offsetInBlock_.x,
      blockTL.y + this.offsetInBlock_.y);
};

/**
 * Set the offset of this connection relative to the top left of its block.
 * @param {number} x The new relative x, in workspace units.
 * @param {number} y The new relative y, in workspace units.
 */
Blockly.RenderedConnection.prototype.setOffsetInBlock = function(x, y) {
  this.offsetInBlock_.x = x;
  this.offsetInBlock_.y = y;
};

/**
 * Get the offset of this connection relative to the top left of its block.
 * @return {!Blockly.utils.Coordinate} The offset of the connection.
 * @package
 */
Blockly.RenderedConnection.prototype.getOffsetInBlock = function() {
  return this.offsetInBlock_;
};

/**
 * Move the blocks on either side of this connection right next to each other.
 * @package
 */
Blockly.RenderedConnection.prototype.tighten = function() {
  var dx = this.targetConnection.x - this.x;
  var dy = this.targetConnection.y - this.y;
  if (dx != 0 || dy != 0) {
    var block = this.targetBlock();
    var svgRoot = block.getSvgRoot();
    if (!svgRoot) {
      throw Error('block is not rendered.');
    }
    // Workspace coordinates.
    var xy = Blockly.utils.getRelativeXY(svgRoot);
    block.getSvgRoot().setAttribute('transform',
        'translate(' + (xy.x - dx) + ',' + (xy.y - dy) + ')');
    block.moveConnections(-dx, -dy);
  }
};

/**
 * Find the closest compatible connection to this connection.
 * All parameters are in workspace units.
 * @param {number} maxLimit The maximum radius to another connection.
 * @param {!Blockly.utils.Coordinate} dxy Offset between this connection's location
 *     in the database and the current location (as a result of dragging).
 * @return {!{connection: ?Blockly.Connection, radius: number}} Contains two
 *     properties: 'connection' which is either another connection or null,
 *     and 'radius' which is the distance.
 */
Blockly.RenderedConnection.prototype.closest = function(maxLimit, dxy) {
  return this.dbOpposite_.searchForClosest(this, maxLimit, dxy);
};

/**
 * Add highlighting around this connection.
 */
Blockly.RenderedConnection.prototype.highlight = function() {
  var steps;
  var sourceBlockSvg = /** @type {!Blockly.BlockSvg} */ (this.sourceBlock_);
  var renderConstants = sourceBlockSvg.workspace.getRenderer().getConstants();
  var shape = renderConstants.shapeFor(this);
  if (this.type == Blockly.INPUT_VALUE || this.type == Blockly.OUTPUT_VALUE) {
    // Vertical line, puzzle tab, vertical line.
    var yLen = renderConstants.TAB_OFFSET_FROM_TOP;
    steps = Blockly.utils.svgPaths.moveBy(0, -yLen) +
        Blockly.utils.svgPaths.lineOnAxis('v', yLen) +
        shape.pathDown +
        Blockly.utils.svgPaths.lineOnAxis('v', yLen);
  } else {
    var xLen =
        renderConstants.NOTCH_OFFSET_LEFT - renderConstants.CORNER_RADIUS;
    // Horizontal line, notch, horizontal line.
    steps = Blockly.utils.svgPaths.moveBy(-xLen, 0) +
        Blockly.utils.svgPaths.lineOnAxis('h', xLen) +
        shape.pathLeft +
        Blockly.utils.svgPaths.lineOnAxis('h', xLen);
  }
  var xy = this.sourceBlock_.getRelativeToSurfaceXY();
  var x = this.x - xy.x;
  var y = this.y - xy.y;
  Blockly.Connection.highlightedPath_ = Blockly.utils.dom.createSvgElement(
      Blockly.utils.Svg.PATH,
      {
        'class': 'blocklyHighlightedConnectionPath',
        'd': steps,
        transform: 'translate(' + x + ',' + y + ')' +
            (this.sourceBlock_.RTL ? ' scale(-1 1)' : '')
      },
      this.sourceBlock_.getSvgRoot());
};

/**
 * Remove the highlighting around this connection.
 */
Blockly.RenderedConnection.prototype.unhighlight = function() {
  Blockly.utils.dom.removeNode(Blockly.Connection.highlightedPath_);
  delete Blockly.Connection.highlightedPath_;
};

/**
 * Set whether this connections is tracked in the database or not.
 * @param {boolean} doTracking If true, start tracking. If false, stop tracking.
 * @package
 */
Blockly.RenderedConnection.prototype.setTracking = function(doTracking) {
  if ((doTracking && this.trackedState_ ==
      Blockly.RenderedConnection.TrackedState.TRACKED) ||
      (!doTracking && this.trackedState_ ==
      Blockly.RenderedConnection.TrackedState.UNTRACKED)) {
    return;
  }
  if (this.sourceBlock_.isInFlyout) {
    // Don't bother maintaining a database of connections in a flyout.
    return;
  }
  if (doTracking) {
    this.db_.addConnection(this, this.y);
    this.trackedState_ = Blockly.RenderedConnection.TrackedState.TRACKED;
    return;
  }
  if (this.trackedState_ == Blockly.RenderedConnection.TrackedState.TRACKED) {
    this.db_.removeConnection(this, this.y);
  }
  this.trackedState_ = Blockly.RenderedConnection.TrackedState.UNTRACKED;
};

/**
 * Stop tracking this connection, as well as all down-stream connections on
 * any block attached to this connection. This happens when a block is
 * collapsed.
 *
 * Also closes down-stream icons/bubbles.
 * @package
 */
Blockly.RenderedConnection.prototype.stopTrackingAll = function() {
  this.setTracking(false);
  if (this.targetConnection) {
    var blocks = this.targetBlock().getDescendants(false);
    for (var i = 0; i < blocks.length; i++) {
      var block = blocks[i];
      // Stop tracking connections of all children.
      var connections = block.getConnections_(true);
      for (var j = 0; j < connections.length; j++) {
        connections[j].setTracking(false);
      }
      // Close all bubbles of all children.
      var icons = block.getIcons();
      for (var j = 0; j < icons.length; j++) {
        icons[j].setVisible(false);
      }
    }
  }
};

/**
 * Start tracking this connection, as well as all down-stream connections on
 * any block attached to this connection. This happens when a block is expanded.
 * @return {!Array.<!Blockly.Block>} List of blocks to render.
 */
Blockly.RenderedConnection.prototype.startTrackingAll = function() {
  this.setTracking(true);
  // All blocks that are not tracked must start tracking before any
  // rendering takes place, since rendering requires knowing the dimensions
  // of lower blocks. Also, since rendering a block renders all its parents,
  // we only need to render the leaf nodes.
  var renderList = [];
  if (this.type != Blockly.INPUT_VALUE && this.type != Blockly.NEXT_STATEMENT) {
    // Only spider down.
    return renderList;
  }
  var block = this.targetBlock();
  if (block) {
    var connections;
    if (block.isCollapsed()) {
      // This block should only be partially revealed since it is collapsed.
      connections = [];
      block.outputConnection && connections.push(block.outputConnection);
      block.nextConnection && connections.push(block.nextConnection);
      block.previousConnection && connections.push(block.previousConnection);
    } else {
      // Show all connections of this block.
      connections = block.getConnections_(true);
    }
    for (var i = 0; i < connections.length; i++) {
      renderList.push.apply(renderList, connections[i].startTrackingAll());
    }
    if (!renderList.length) {
      // Leaf block.
      renderList[0] = block;
    }
  }
  return renderList;
};

/**
 * Check if the two connections can be dragged to connect to each other.
 * @param {!Blockly.Connection} candidate A nearby connection to check.
 * @param {number=} maxRadius The maximum radius allowed for connections, in
 *     workspace units.
 * @return {boolean} True if the connection is allowed, false otherwise.
 * @deprecated July 2020
 */
Blockly.RenderedConnection.prototype.isConnectionAllowed = function(candidate,
    maxRadius) {
  Blockly.utils.deprecation.warn(
      'RenderedConnection.prototype.isConnectionAllowed',
      'July 2020',
      'July 2021',
      'Blockly.Workspace.prototype.getConnectionChecker().canConnect');
  if (this.distanceFrom(candidate) > maxRadius) {
    return false;
  }

  return Blockly.RenderedConnection.superClass_.isConnectionAllowed.call(this,
      candidate);
};

/**
 * Behavior after a connection attempt fails.
 * @param {!Blockly.Connection} otherConnection Connection that this connection
 *     failed to connect to.
 * @package
 */
Blockly.RenderedConnection.prototype.onFailedConnect = function(
    otherConnection) {
  this.bumpAwayFrom(otherConnection);
};


/**
 * Disconnect two blocks that are connected by this connection.
 * @param {!Blockly.Block} parentBlock The superior block.
 * @param {!Blockly.Block} childBlock The inferior block.
 * @private
 */
Blockly.RenderedConnection.prototype.disconnectInternal_ = function(parentBlock,
    childBlock) {
  Blockly.RenderedConnection.superClass_.disconnectInternal_.call(this,
      parentBlock, childBlock);
  // Rerender the parent so that it may reflow.
  if (parentBlock.rendered) {
    parentBlock.render();
  }
  if (childBlock.rendered) {
    childBlock.updateDisabled();
    childBlock.render();
    // Reset visibility, since the child is now a top block.
    childBlock.getSvgRoot().style.display = 'block';
  }
};

/**
 * Respawn the shadow block if there was one connected to the this connection.
 * Render/rerender blocks as needed.
 * @private
 */
Blockly.RenderedConnection.prototype.respawnShadow_ = function() {
  Blockly.RenderedConnection.superClass_.respawnShadow_.call(this);
  var blockShadow = this.targetBlock();
  if (!blockShadow) {
    // This connection must not have a shadowDom_.
    return;
  }
  blockShadow.initSvg();
  blockShadow.render(false);

  var parentBlock = this.getSourceBlock();
  if (parentBlock.rendered) {
    parentBlock.render();
  }
};

/**
 * Find all nearby compatible connections to this connection.
 * Type checking does not apply, since this function is used for bumping.
 * @param {number} maxLimit The maximum radius to another connection, in
 *     workspace units.
 * @return {!Array.<!Blockly.Connection>} List of connections.
 * @package
 */
Blockly.RenderedConnection.prototype.neighbours = function(maxLimit) {
  return this.dbOpposite_.getNeighbours(this, maxLimit);
};

/**
 * Connect two connections together.  This is the connection on the superior
 * block.  Rerender blocks as needed.
 * @param {!Blockly.Connection} childConnection Connection on inferior block.
 * @protected
 */
Blockly.RenderedConnection.prototype.connect_ = function(childConnection) {
  Blockly.RenderedConnection.superClass_.connect_.call(this, childConnection);

  var parentConnection = this;
  var parentBlock = parentConnection.getSourceBlock();
  var childBlock = childConnection.getSourceBlock();
  var parentRendered = parentBlock.rendered;
  var childRendered = childBlock.rendered;

  if (parentRendered) {
    parentBlock.updateDisabled();
  }
  if (childRendered) {
    childBlock.updateDisabled();
  }
  if (parentRendered && childRendered) {
    if (parentConnection.type == Blockly.NEXT_STATEMENT ||
        parentConnection.type == Blockly.PREVIOUS_STATEMENT) {
      // Child block may need to square off its corners if it is in a stack.
      // Rendering a child will render its parent.
      childBlock.render();
    } else {
      // Child block does not change shape.  Rendering the parent node will
      // move its connected children into position.
      parentBlock.render();
    }
  }

  // The input the child block is connected to (if any).
  var parentInput = parentBlock.getInputWithBlock(childBlock);
  if (parentInput) {
    var visible = parentInput.isVisible();
    childBlock.getSvgRoot().style.display = visible ? 'block' : 'none';
  }
};

/**
 * Function to be called when this connection's compatible types have changed.
 * @protected
 */
Blockly.RenderedConnection.prototype.onCheckChanged_ = function() {
  // The new value type may not be compatible with the existing connection.
  if (this.isConnected() && (!this.targetConnection ||
      !this.getConnectionChecker().canConnect(
          this, this.targetConnection, false))) {
    var child = this.isSuperior() ? this.targetBlock() : this.sourceBlock_;
    child.unplug();
    // Bump away.
    this.sourceBlock_.bumpNeighbours();
  }
};
