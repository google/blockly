/**
 * Copyright 2018 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Class for a block move event.
 *
 * @class
 */
import * as goog from '../../closure/goog/goog.js';
goog.declareModuleId('Blockly.Events.BlockMove');

import type {Block} from '../block.js';
import {ConnectionType} from '../connection_type.js';
import * as registry from '../registry.js';
import {Coordinate} from '../utils/coordinate.js';

import {BlockBase} from './events_block_base.js';
import * as eventUtils from './utils.js';


interface BlockLocation {
  parentId: string;
  inputName: string;
  coordinate: Coordinate|null;
}  // eslint-disable-line no-unused-vars

/**
 * Class for a block move event.  Created before the move.
 *
 * @alias Blockly.Events.BlockMove
 */
export class BlockMove extends BlockBase {
  override type: string;
  // TODO(b/109816955): remove '!', see go/strict-prop-init-fix.
  oldParentId!: string;
  // TODO(b/109816955): remove '!', see go/strict-prop-init-fix.
  oldInputName!: string;
  // TODO(b/109816955): remove '!', see go/strict-prop-init-fix.
  oldCoordinate!: Coordinate|null;

  newParentId: string|null = null;
  newInputName: string|null = null;
  newCoordinate: Coordinate|null = null;

  /** @param opt_block The moved block.  Undefined for a blank event. */
  constructor(opt_block?: Block) {
    super(opt_block);

    /** Type of this event. */
    this.type = eventUtils.BLOCK_MOVE;

    if (!opt_block) {
      return;
    }
    // Blank event to be populated by fromJson.
    if (opt_block.isShadow()) {
      // Moving shadow blocks is handled via disconnection.
      this.recordUndo = false;
    }

    const location = this.currentLocation_();
    this.oldParentId = location.parentId;
    this.oldInputName = location.inputName;
    this.oldCoordinate = location.coordinate;
  }

  /**
   * Encode the event as JSON.
   *
   * @returns JSON representation.
   */
  override toJson(): AnyDuringMigration {
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
   *
   * @param json JSON representation.
   */
  override fromJson(json: AnyDuringMigration) {
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

  /** Record the block's new location.  Called after the move. */
  recordNew() {
    const location = this.currentLocation_();
    this.newParentId = location.parentId;
    this.newInputName = location.inputName;
    this.newCoordinate = location.coordinate;
  }

  /**
   * Returns the parentId and input if the block is connected,
   *   or the XY location if disconnected.
   *
   * @returns Collection of location info.
   */
  private currentLocation_(): BlockLocation {
    const workspace = this.getEventWorkspace_();
    const block = workspace.getBlockById(this.blockId);
    const location = {} as BlockLocation;
    const parent = block!.getParent();
    if (parent) {
      location.parentId = parent.id;
      // AnyDuringMigration because:  Argument of type 'Block | null' is not
      // assignable to parameter of type 'Block'.
      const input = parent.getInputWithBlock(block as AnyDuringMigration);
      if (input) {
        location.inputName = input.name;
      }
    } else {
      location.coordinate = block!.getRelativeToSurfaceXY();
    }
    return location;
  }

  /**
   * Does this event record any change of state?
   *
   * @returns False if something changed.
   */
  override isNull(): boolean {
    return this.oldParentId === this.newParentId &&
        this.oldInputName === this.newInputName &&
        Coordinate.equals(this.oldCoordinate, this.newCoordinate);
  }

  /**
   * Run a move event.
   *
   * @param forward True if run forward, false if run backward (undo).
   */
  override run(forward: boolean) {
    const workspace = this.getEventWorkspace_();
    const block = workspace.getBlockById(this.blockId);
    if (!block) {
      console.warn('Can\'t move non-existent block: ' + this.blockId);
      return;
    }
    const parentId = forward ? this.newParentId : this.oldParentId;
    const inputName = forward ? this.newInputName : this.oldInputName;
    const coordinate = forward ? this.newCoordinate : this.oldCoordinate;
    let parentBlock: Block|null;
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
          block.previousConnection && block.previousConnection.isConnected()) {
        blockConnection = block.previousConnection;
      }
      let parentConnection;
      const connectionType = blockConnection.type;
      if (inputName) {
        const input = parentBlock!.getInput(inputName);
        if (input) {
          parentConnection = input.connection;
        }
      } else if (connectionType === ConnectionType.PREVIOUS_STATEMENT) {
        parentConnection = parentBlock!.nextConnection;
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
