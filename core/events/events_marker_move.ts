/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Events fired as a result of a marker move.
 */
'use strict';

/**
 * Events fired as a result of a marker move.
 * @class
 */
goog.module('Blockly.Events.MarkerMove');

const eventUtils = goog.require('Blockly.Events.utils');
const registry = goog.require('Blockly.registry');
const {ASTNode} = goog.require('Blockly.ASTNode');
/* eslint-disable-next-line no-unused-vars */
const {Block} = goog.requireType('Blockly.Block');
const {UiBase} = goog.require('Blockly.Events.UiBase');
/* eslint-disable-next-line no-unused-vars */
const {Workspace} = goog.requireType('Blockly.Workspace');


/**
 * Class for a marker move event.
 * @extends {UiBase}
 * @alias Blockly.Events.MarkerMove
 */
class MarkerMove extends UiBase {
  /**
   * @param {?Block=} opt_block The affected block. Null if current node
   *    is of type workspace. Undefined for a blank event.
   * @param {boolean=} isCursor Whether this is a cursor event. Undefined for a
   *    blank event.
   * @param {?ASTNode=} opt_oldNode The old node the marker used to be on.
   *    Undefined for a blank event.
   * @param {!ASTNode=} opt_newNode The new node the marker is now on.
   *    Undefined for a blank event.
   */
  constructor(opt_block, isCursor, opt_oldNode, opt_newNode) {
    let workspaceId = opt_block ? opt_block.workspace.id : undefined;
    if (opt_newNode && opt_newNode.getType() === ASTNode.types.WORKSPACE) {
      workspaceId = (/** @type {!Workspace} */ (opt_newNode.getLocation())).id;
    }
    super(workspaceId);

    /**
     * The workspace identifier for this event.
     * @type {?string}
     */
    this.blockId = opt_block ? opt_block.id : null;

    /**
     * The old node the marker used to be on.
     * @type {?ASTNode|undefined}
     */
    this.oldNode = opt_oldNode;

    /**
     * The new node the  marker is now on.
     * @type {ASTNode|undefined}
     */
    this.newNode = opt_newNode;

    /**
     * Whether this is a cursor event.
     * @type {boolean|undefined}
     */
    this.isCursor = isCursor;

    /**
     * Type of this event.
     * @type {string}
     */
    this.type = eventUtils.MARKER_MOVE;
  }

  /**
   * Encode the event as JSON.
   * @return {!Object} JSON representation.
   */
  toJson() {
    const json = super.toJson();
    json['isCursor'] = this.isCursor;
    json['blockId'] = this.blockId;
    json['oldNode'] = this.oldNode;
    json['newNode'] = this.newNode;
    return json;
  }

  /**
   * Decode the JSON event.
   * @param {!Object} json JSON representation.
   */
  fromJson(json) {
    super.fromJson(json);
    this.isCursor = json['isCursor'];
    this.blockId = json['blockId'];
    this.oldNode = json['oldNode'];
    this.newNode = json['newNode'];
  }
}

registry.register(registry.Type.EVENT, eventUtils.MARKER_MOVE, MarkerMove);

exports.MarkerMove = MarkerMove;
