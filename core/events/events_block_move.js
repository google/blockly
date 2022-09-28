/**
 * @license
 * Copyright 2018 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Class for a block move event.
 */
'use strict';

/**
 * Class for a block move event.
 * @class
 */
goog.module('Blockly.Events.BlockMove');

const eventUtils = goog.require('Blockly.Events.utils');
const registry = goog.require('Blockly.registry');
const {BlockBase} = goog.require('Blockly.Events.BlockBase');
/* eslint-disable-next-line no-unused-vars */
const {Block} = goog.requireType('Blockly.Block');
const {ConnectionType} = goog.require('Blockly.ConnectionType');
const {Coordinate} = goog.require('Blockly.utils.Coordinate');


/**
 * Class for a block move event.  Created before the move.
 * @extends {BlockBase}
 * @alias Blockly.Events.BlockMove
 */
class BlockMove extends BlockBase {
  /**
   * @param {!Block=} opt_block The moved block.  Undefined for a blank
   *     event.
   */
  constructor(opt_block) {
    super(opt_block);

    /**
     * Type of this event.
     * @type {string}
     */
    this.type = eventUtils.BLOCK_MOVE;

    if (!opt_block) {
      return;  // Blank event to be populated by fromJson.
    }
    if (opt_block.isShadow()) {
      // Moving shadow blocks is handled via disconnection.
      this.recordUndo = false;
    }

    const location = this.currentLocation_();
    this.oldParentId = location.parentId;
    this.oldInputName = location.inputName;
    this.oldCoordinate = location.coordinate;

    this.newParentId = null;
    this.newInputName = null;
    this.newCoordinate = null;
  }

  /**
   * Encode the event as JSON.
   * @return {!Object} JSON representation.
   */
  toJson() {
    const json = super.toJson();
    if (this.newParentId) {
      json['newParentId'] = this.newParentId;
    }
    if (this.newInputName) {
      json['newInputName'] = this.newInputName;
    }
    if (this.newCoordinate) {
      json['newCoordinate'] = Math.round(this.newCoordinate.x) + ',' +
          Math.round(this.newCoordinate.y);
    }
    if (!this.recordUndo) {
      json['recordUndo'] = this.recordUndo;
    }
    return json;
  }

  /**
   * Decode the JSON event.
   * @param {!Object} json JSON representation.
   */
  fromJson(json) {
    super.fromJson(json);
    this.newParentId = json['newParentId'];
    this.newInputName = json['newInputName'];
    if (json['newCoordinate']) {
      const xy = json['newCoordinate'].split(',');
      this.newCoordinate = new Coordinate(Number(xy[0]), Number(xy[1]));
    }
    if (json['recordUndo'] !== undefined) {
      this.recordUndo = json['recordUndo'];
    }
  }

  /**
   * Record the block's new location.  Called after the move.
   */
  recordNew() {
    const location = this.currentLocation_();
    this.newParentId = location.parentId;
    this.newInputName = location.inputName;
    this.newCoordinate = location.coordinate;
  }

  /**
   * Returns the parentId and input if the block is connected,
   *   or the XY location if disconnected.
   * @return {!Object} Collection of location info.
   * @private
   */
  currentLocation_() {
    const workspace = this.getEventWorkspace_();
    const block = workspace.getBlockById(this.blockId);
    const location = {};
    const parent = block.getParent();
    if (parent) {
      location.parentId = parent.id;
      const input = parent.getInputWithBlock(block);
      if (input) {
        location.inputName = input.name;
      }
    } else {
      location.coordinate = block.getRelativeToSurfaceXY();
    }
    return location;
  }

  /**
   * Does this event record any change of state?
   * @return {boolean} False if something changed.
   */
  isNull() {
    return this.oldParentId === this.newParentId &&
        this.oldInputName === this.newInputName &&
        Coordinate.equals(this.oldCoordinate, this.newCoordinate);
  }

  /**
   * Run a move event.
   * @param {boolean} forward True if run forward, false if run backward (undo).
   */
  run(forward) {
    const workspace = this.getEventWorkspace_();
    const block = workspace.getBlockById(this.blockId);
    if (!block) {
      console.warn('Can\'t move non-existent block: ' + this.blockId);
      return;
    }
    const parentId = forward ? this.newParentId : this.oldParentId;
    const inputName = forward ? this.newInputName : this.oldInputName;
    const coordinate = forward ? this.newCoordinate : this.oldCoordinate;
    let parentBlock;
    if (parentId) {
      parentBlock = workspace.getBlockById(parentId);
      if (!parentBlock) {
        console.warn('Can\'t connect to non-existent block: ' + parentId);
        return;
      }
    }
    if (block.getParent()) {
      block.unplug();
    }
    if (coordinate) {
      const xy = block.getRelativeToSurfaceXY();
      block.moveBy(coordinate.x - xy.x, coordinate.y - xy.y);
    } else {
      let blockConnection = block.outputConnection;
      if (!blockConnection ||
          (block.previousConnection &&
           block.previousConnection.isConnected())) {
        blockConnection = block.previousConnection;
      }
      let parentConnection;
      const connectionType = blockConnection.type;
      if (inputName) {
        const input = parentBlock.getInput(inputName);
        if (input) {
          parentConnection = input.connection;
        }
      } else if (connectionType === ConnectionType.PREVIOUS_STATEMENT) {
        parentConnection = parentBlock.nextConnection;
      }
      if (parentConnection) {
        blockConnection.connect(parentConnection);
      } else {
        console.warn('Can\'t connect to non-existent input: ' + inputName);
      }
    }
  }
}

registry.register(registry.Type.EVENT, eventUtils.MOVE, BlockMove);

exports.BlockMove = BlockMove;
