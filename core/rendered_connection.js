/**
 * @license
 * Copyright 2016 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Components for creating connections between blocks.
 */
'use strict';

/**
 * Components for creating connections between blocks.
 * @class
 */
goog.module('Blockly.RenderedConnection');

const common = goog.require('Blockly.common');
const dom = goog.require('Blockly.utils.dom');
const eventUtils = goog.require('Blockly.Events.utils');
const internalConstants = goog.require('Blockly.internalConstants');
const svgPaths = goog.require('Blockly.utils.svgPaths');
const svgMath = goog.require('Blockly.utils.svgMath');
/* eslint-disable-next-line no-unused-vars */
const {BlockSvg} = goog.requireType('Blockly.BlockSvg');
/* eslint-disable-next-line no-unused-vars */
const {Block} = goog.requireType('Blockly.Block');
const {config} = goog.require('Blockly.config');
/* eslint-disable-next-line no-unused-vars */
const {ConnectionDB} = goog.requireType('Blockly.ConnectionDB');
const {ConnectionType} = goog.require('Blockly.ConnectionType');
const {Connection} = goog.require('Blockly.Connection');
const {Coordinate} = goog.require('Blockly.utils.Coordinate');
const {Svg} = goog.require('Blockly.utils.Svg');


/**
 * Maximum randomness in workspace units for bumping a block.
 * @const
 */
const BUMP_RANDOMNESS = 10;

/**
 * Class for a connection between blocks that may be rendered on screen.
 * @extends {Connection}
 * @alias Blockly.RenderedConnection
 */
class RenderedConnection extends Connection {
  /**
   * @param {!BlockSvg} source The block establishing this connection.
   * @param {number} type The type of the connection.
   */
  constructor(source, type) {
    super(source, type);

    /** @type {!BlockSvg} */
    this.sourceBlock_;

    /**
     * Connection database for connections of this type on the current
     * workspace.
     * @const {!ConnectionDB}
     * @private
     */
    this.db_ = source.workspace.connectionDBList[type];

    /**
     * Connection database for connections compatible with this type on the
     * current workspace.
     * @const {!ConnectionDB}
     * @private
     */
    this.dbOpposite_ =
        source.workspace
            .connectionDBList[internalConstants.OPPOSITE_TYPE[type]];

    /**
     * Workspace units, (0, 0) is top left of block.
     * @type {!Coordinate}
     * @private
     */
    this.offsetInBlock_ = new Coordinate(0, 0);

    /**
     * Describes the state of this connection's tracked-ness.
     * @type {RenderedConnection.TrackedState}
     * @private
     */
    this.trackedState_ = RenderedConnection.TrackedState.WILL_TRACK;

    /**
     * Connection this connection connects to.  Null if not connected.
     * @type {RenderedConnection}
     */
    this.targetConnection = null;
  }

  /**
   * Dispose of this connection. Remove it from the database (if it is
   * tracked) and call the super-function to deal with connected blocks.
   * @override
   * @package
   */
  dispose() {
    super.dispose();
    if (this.trackedState_ === RenderedConnection.TrackedState.TRACKED) {
      this.db_.removeConnection(this, this.y);
    }
  }

  /**
   * Get the source block for this connection.
   * @return {!BlockSvg} The source block.
   * @override
   */
  getSourceBlock() {
    return /** @type {!BlockSvg} */ (super.getSourceBlock());
  }

  /**
   * Returns the block that this connection connects to.
   * @return {?BlockSvg} The connected block or null if none is connected.
   * @override
   */
  targetBlock() {
    return /** @type {BlockSvg} */ (super.targetBlock());
  }

  /**
   * Returns the distance between this connection and another connection in
   * workspace units.
   * @param {!Connection} otherConnection The other connection to measure
   *     the distance to.
   * @return {number} The distance between connections, in workspace units.
   */
  distanceFrom(otherConnection) {
    const xDiff = this.x - otherConnection.x;
    const yDiff = this.y - otherConnection.y;
    return Math.sqrt(xDiff * xDiff + yDiff * yDiff);
  }

  /**
   * Move the block(s) belonging to the connection to a point where they don't
   * visually interfere with the specified connection.
   * @param {!RenderedConnection} staticConnection The connection to move away
   *     from.
   * @package
   */
  bumpAwayFrom(staticConnection) {
    if (this.sourceBlock_.workspace.isDragging()) {
      // Don't move blocks around while the user is doing the same.
      return;
    }
    // Move the root block.
    let rootBlock = this.sourceBlock_.getRootBlock();
    if (rootBlock.isInFlyout) {
      // Don't move blocks around in a flyout.
      return;
    }
    let reverse = false;
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
    const selected = common.getSelected() == rootBlock;
    selected || rootBlock.addSelect();
    let dx = (staticConnection.x + config.snapRadius +
              Math.floor(Math.random() * BUMP_RANDOMNESS)) -
        this.x;
    let dy = (staticConnection.y + config.snapRadius +
              Math.floor(Math.random() * BUMP_RANDOMNESS)) -
        this.y;
    if (reverse) {
      // When reversing a bump due to an uneditable block, bump up.
      dy = -dy;
    }
    if (rootBlock.RTL) {
      dx = (staticConnection.x - config.snapRadius -
            Math.floor(Math.random() * BUMP_RANDOMNESS)) -
          this.x;
    }
    rootBlock.moveBy(dx, dy);
    selected || rootBlock.removeSelect();
  }

  /**
   * Change the connection's coordinates.
   * @param {number} x New absolute x coordinate, in workspace coordinates.
   * @param {number} y New absolute y coordinate, in workspace coordinates.
   */
  moveTo(x, y) {
    if (this.trackedState_ === RenderedConnection.TrackedState.WILL_TRACK) {
      this.db_.addConnection(this, y);
      this.trackedState_ = RenderedConnection.TrackedState.TRACKED;
    } else if (this.trackedState_ === RenderedConnection.TrackedState.TRACKED) {
      this.db_.removeConnection(this, this.y);
      this.db_.addConnection(this, y);
    }
    this.x = x;
    this.y = y;
  }

  /**
   * Change the connection's coordinates.
   * @param {number} dx Change to x coordinate, in workspace units.
   * @param {number} dy Change to y coordinate, in workspace units.
   */
  moveBy(dx, dy) {
    this.moveTo(this.x + dx, this.y + dy);
  }

  /**
   * Move this connection to the location given by its offset within the block
   * and the location of the block's top left corner.
   * @param {!Coordinate} blockTL The location of the top left
   *     corner of the block, in workspace coordinates.
   */
  moveToOffset(blockTL) {
    this.moveTo(
        blockTL.x + this.offsetInBlock_.x, blockTL.y + this.offsetInBlock_.y);
  }

  /**
   * Set the offset of this connection relative to the top left of its block.
   * @param {number} x The new relative x, in workspace units.
   * @param {number} y The new relative y, in workspace units.
   */
  setOffsetInBlock(x, y) {
    this.offsetInBlock_.x = x;
    this.offsetInBlock_.y = y;
  }

  /**
   * Get the offset of this connection relative to the top left of its block.
   * @return {!Coordinate} The offset of the connection.
   * @package
   */
  getOffsetInBlock() {
    return this.offsetInBlock_;
  }

  /**
   * Move the blocks on either side of this connection right next to each other.
   * @package
   */
  tighten() {
    const dx = this.targetConnection.x - this.x;
    const dy = this.targetConnection.y - this.y;
    if (dx !== 0 || dy !== 0) {
      const block = this.targetBlock();
      const svgRoot = block.getSvgRoot();
      if (!svgRoot) {
        throw Error('block is not rendered.');
      }
      // Workspace coordinates.
      const xy = svgMath.getRelativeXY(svgRoot);
      block.getSvgRoot().setAttribute(
          'transform', 'translate(' + (xy.x - dx) + ',' + (xy.y - dy) + ')');
      block.moveConnections(-dx, -dy);
    }
  }

  /**
   * Find the closest compatible connection to this connection.
   * All parameters are in workspace units.
   * @param {number} maxLimit The maximum radius to another connection.
   * @param {!Coordinate} dxy Offset between this connection's location
   *     in the database and the current location (as a result of dragging).
   * @return {!{connection: ?Connection, radius: number}} Contains two
   *     properties: 'connection' which is either another connection or null,
   *     and 'radius' which is the distance.
   */
  closest(maxLimit, dxy) {
    return this.dbOpposite_.searchForClosest(this, maxLimit, dxy);
  }

  /**
   * Add highlighting around this connection.
   */
  highlight() {
    let steps;
    const sourceBlockSvg = /** @type {!BlockSvg} */ (this.sourceBlock_);
    const renderConstants =
        sourceBlockSvg.workspace.getRenderer().getConstants();
    const shape = renderConstants.shapeFor(this);
    if (this.type === ConnectionType.INPUT_VALUE ||
        this.type === ConnectionType.OUTPUT_VALUE) {
      // Vertical line, puzzle tab, vertical line.
      const yLen = renderConstants.TAB_OFFSET_FROM_TOP;
      steps = svgPaths.moveBy(0, -yLen) + svgPaths.lineOnAxis('v', yLen) +
          shape.pathDown + svgPaths.lineOnAxis('v', yLen);
    } else {
      const xLen =
          renderConstants.NOTCH_OFFSET_LEFT - renderConstants.CORNER_RADIUS;
      // Horizontal line, notch, horizontal line.
      steps = svgPaths.moveBy(-xLen, 0) + svgPaths.lineOnAxis('h', xLen) +
          shape.pathLeft + svgPaths.lineOnAxis('h', xLen);
    }
    const xy = this.sourceBlock_.getRelativeToSurfaceXY();
    const x = this.x - xy.x;
    const y = this.y - xy.y;
    Connection.highlightedPath_ = dom.createSvgElement(
        Svg.PATH, {
          'class': 'blocklyHighlightedConnectionPath',
          'd': steps,
          'transform': 'translate(' + x + ',' + y + ')' +
              (this.sourceBlock_.RTL ? ' scale(-1 1)' : ''),
        },
        this.sourceBlock_.getSvgRoot());
  }

  /**
   * Remove the highlighting around this connection.
   */
  unhighlight() {
    dom.removeNode(Connection.highlightedPath_);
    delete Connection.highlightedPath_;
  }

  /**
   * Set whether this connections is tracked in the database or not.
   * @param {boolean} doTracking If true, start tracking. If false, stop
   *     tracking.
   * @package
   */
  setTracking(doTracking) {
    if ((doTracking &&
         this.trackedState_ === RenderedConnection.TrackedState.TRACKED) ||
        (!doTracking &&
         this.trackedState_ === RenderedConnection.TrackedState.UNTRACKED)) {
      return;
    }
    if (this.sourceBlock_.isInFlyout) {
      // Don't bother maintaining a database of connections in a flyout.
      return;
    }
    if (doTracking) {
      this.db_.addConnection(this, this.y);
      this.trackedState_ = RenderedConnection.TrackedState.TRACKED;
      return;
    }
    if (this.trackedState_ === RenderedConnection.TrackedState.TRACKED) {
      this.db_.removeConnection(this, this.y);
    }
    this.trackedState_ = RenderedConnection.TrackedState.UNTRACKED;
  }

  /**
   * Stop tracking this connection, as well as all down-stream connections on
   * any block attached to this connection. This happens when a block is
   * collapsed.
   *
   * Also closes down-stream icons/bubbles.
   * @package
   */
  stopTrackingAll() {
    this.setTracking(false);
    if (this.targetConnection) {
      const blocks = this.targetBlock().getDescendants(false);
      for (let i = 0; i < blocks.length; i++) {
        const block = blocks[i];
        // Stop tracking connections of all children.
        const connections = block.getConnections_(true);
        for (let j = 0; j < connections.length; j++) {
          /** @type {!RenderedConnection} */ (connections[j])
              .setTracking(false);
        }
        // Close all bubbles of all children.
        const icons = block.getIcons();
        for (let j = 0; j < icons.length; j++) {
          icons[j].setVisible(false);
        }
      }
    }
  }

  /**
   * Start tracking this connection, as well as all down-stream connections on
   * any block attached to this connection. This happens when a block is
   * expanded.
   * @return {!Array<!Block>} List of blocks to render.
   */
  startTrackingAll() {
    this.setTracking(true);
    // All blocks that are not tracked must start tracking before any
    // rendering takes place, since rendering requires knowing the dimensions
    // of lower blocks. Also, since rendering a block renders all its parents,
    // we only need to render the leaf nodes.
    let renderList = [];
    if (this.type !== ConnectionType.INPUT_VALUE &&
        this.type !== ConnectionType.NEXT_STATEMENT) {
      // Only spider down.
      return renderList;
    }
    const block = this.targetBlock();
    if (block) {
      let connections;
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
      for (let i = 0; i < connections.length; i++) {
        renderList.push.apply(renderList, connections[i].startTrackingAll());
      }
      if (!renderList.length) {
        // Leaf block.
        renderList = [block];
      }
    }
    return renderList;
  }

  /**
   * Behavior after a connection attempt fails.
   * Bumps this connection away from the other connection. Called when an
   * attempted connection fails.
   * @param {!Connection} otherConnection Connection that this connection
   *     failed to connect to.
   * @package
   */
  onFailedConnect(otherConnection) {
    const block = this.getSourceBlock();
    if (eventUtils.getRecordUndo()) {
      const group = eventUtils.getGroup();
      setTimeout(function() {
        if (!block.isDisposed() && !block.getParent()) {
          eventUtils.setGroup(group);
          this.bumpAwayFrom(
              /** @type {!RenderedConnection} */ (otherConnection));
          eventUtils.setGroup(false);
        }
      }.bind(this), config.bumpDelay);
    }
  }

  /**
   * Disconnect two blocks that are connected by this connection.
   * @param {!Block} parentBlock The superior block.
   * @param {!Block} childBlock The inferior block.
   * @protected
   * @override
   */
  disconnectInternal_(parentBlock, childBlock) {
    super.disconnectInternal_(parentBlock, childBlock);
    const renderedParent = /** @type {!BlockSvg} */ (parentBlock);
    const renderedChild = /** @type {!BlockSvg} */ (childBlock);

    // Rerender the parent so that it may reflow.
    if (renderedParent.rendered) {
      renderedParent.render();
    }
    if (renderedChild.rendered) {
      renderedChild.updateDisabled();
      renderedChild.render();
      // Reset visibility, since the child is now a top block.
      renderedChild.getSvgRoot().style.display = 'block';
    }
  }

  /**
   * Respawn the shadow block if there was one connected to the this connection.
   * Render/rerender blocks as needed.
   * @protected
   * @override
   */
  respawnShadow_() {
    super.respawnShadow_();
    const blockShadow = this.targetBlock();
    if (!blockShadow) {
      return;
    }
    blockShadow.initSvg();
    blockShadow.render(false);

    const parentBlock = this.getSourceBlock();
    if (parentBlock.rendered) {
      parentBlock.render();
    }
  }

  /**
   * Find all nearby compatible connections to this connection.
   * Type checking does not apply, since this function is used for bumping.
   * @param {number} maxLimit The maximum radius to another connection, in
   *     workspace units.
   * @return {!Array<!Connection>} List of connections.
   * @package
   */
  neighbours(maxLimit) {
    return this.dbOpposite_.getNeighbours(this, maxLimit);
  }

  /**
   * Connect two connections together.  This is the connection on the superior
   * block.  Rerender blocks as needed.
   * @param {!Connection} childConnection Connection on inferior block.
   * @protected
   */
  connect_(childConnection) {
    super.connect_(childConnection);

    const renderedChildConnection = /** @type {!RenderedConnection} */
        (childConnection);

    const parentConnection = this;
    const parentBlock = parentConnection.getSourceBlock();
    const childBlock = renderedChildConnection.getSourceBlock();
    const parentRendered = parentBlock.rendered;
    const childRendered = childBlock.rendered;

    if (parentRendered) {
      parentBlock.updateDisabled();
    }
    if (childRendered) {
      childBlock.updateDisabled();
    }
    if (parentRendered && childRendered) {
      if (parentConnection.type === ConnectionType.NEXT_STATEMENT ||
          parentConnection.type === ConnectionType.PREVIOUS_STATEMENT) {
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
    const parentInput = parentBlock.getInputWithBlock(childBlock);
    if (parentInput) {
      const visible = parentInput.isVisible();
      childBlock.getSvgRoot().style.display = visible ? 'block' : 'none';
    }
  }

  /**
   * Function to be called when this connection's compatible types have changed.
   * @protected
   */
  onCheckChanged_() {
    // The new value type may not be compatible with the existing connection.
    if (this.isConnected() &&
        (!this.targetConnection ||
         !this.getConnectionChecker().canConnect(
             this, this.targetConnection, false))) {
      const child = this.isSuperior() ? this.targetBlock() : this.sourceBlock_;
      child.unplug();
      // Bump away.
      this.sourceBlock_.bumpNeighbours();
    }
  }
}

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
RenderedConnection.TrackedState = {
  WILL_TRACK: -1,
  UNTRACKED: 0,
  TRACKED: 1,
};

exports.RenderedConnection = RenderedConnection;
