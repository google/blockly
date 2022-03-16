/**
 * @license
 * Copyright 2018 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Class for comment move event.
 */
'use strict';

/**
 * Class for comment move event.
 * @class
 */
goog.module('Blockly.Events.CommentMove');

const eventUtils = goog.require('Blockly.Events.utils');
const registry = goog.require('Blockly.registry');
const {CommentBase} = goog.require('Blockly.Events.CommentBase');
const {Coordinate} = goog.require('Blockly.utils.Coordinate');
/* eslint-disable-next-line no-unused-vars */
const {WorkspaceComment} = goog.requireType('Blockly.WorkspaceComment');


/**
 * Class for a comment move event.  Created before the move.
 * @extends {CommentBase}
 * @alias Blockly.Events.CommentMove
 */
class CommentMove extends CommentBase {
  /**
   * @param {!WorkspaceComment=} opt_comment The comment that is being
   *     moved.  Undefined for a blank event.
   */
  constructor(opt_comment) {
    super(opt_comment);

    /**
     * Type of this event.
     * @type {string}
     */
    this.type = eventUtils.COMMENT_MOVE;

    if (!opt_comment) {
      return;  // Blank event to be populated by fromJson.
    }

    /**
     * The comment that is being moved.  Will be cleared after recording the new
     * location.
     * @type {WorkspaceComment}
     */
    this.comment_ = opt_comment;

    /**
     * The location before the move, in workspace coordinates.
     * @type {!Coordinate}
     */
    this.oldCoordinate_ = opt_comment.getXY();

    /**
     * The location after the move, in workspace coordinates.
     * @type {Coordinate}
     */
    this.newCoordinate_ = null;
  }

  /**
   * Record the comment's new location.  Called after the move.  Can only be
   * called once.
   */
  recordNew() {
    if (!this.comment_) {
      throw Error(
          'Tried to record the new position of a comment on the ' +
          'same event twice.');
    }
    this.newCoordinate_ = this.comment_.getXY();
    this.comment_ = null;
  }

  /**
   * Override the location before the move.  Use this if you don't create the
   * event until the end of the move, but you know the original location.
   * @param {!Coordinate} xy The location before the move,
   *     in workspace coordinates.
   */
  setOldCoordinate(xy) {
    this.oldCoordinate_ = xy;
  }

  // TODO (#1266): "Full" and "minimal" serialization.
  /**
   * Encode the event as JSON.
   * @return {!Object} JSON representation.
   */
  toJson() {
    const json = super.toJson();
    if (this.oldCoordinate_) {
      json['oldCoordinate'] = Math.round(this.oldCoordinate_.x) + ',' +
          Math.round(this.oldCoordinate_.y);
    }
    if (this.newCoordinate_) {
      json['newCoordinate'] = Math.round(this.newCoordinate_.x) + ',' +
          Math.round(this.newCoordinate_.y);
    }
    return json;
  }

  /**
   * Decode the JSON event.
   * @param {!Object} json JSON representation.
   */
  fromJson(json) {
    super.fromJson(json);

    if (json['oldCoordinate']) {
      const xy = json['oldCoordinate'].split(',');
      this.oldCoordinate_ = new Coordinate(Number(xy[0]), Number(xy[1]));
    }
    if (json['newCoordinate']) {
      const xy = json['newCoordinate'].split(',');
      this.newCoordinate_ = new Coordinate(Number(xy[0]), Number(xy[1]));
    }
  }

  /**
   * Does this event record any change of state?
   * @return {boolean} False if something changed.
   */
  isNull() {
    return Coordinate.equals(this.oldCoordinate_, this.newCoordinate_);
  }

  /**
   * Run a move event.
   * @param {boolean} forward True if run forward, false if run backward (undo).
   */
  run(forward) {
    const workspace = this.getEventWorkspace_();
    const comment = workspace.getCommentById(this.commentId);
    if (!comment) {
      console.warn('Can\'t move non-existent comment: ' + this.commentId);
      return;
    }

    const target = forward ? this.newCoordinate_ : this.oldCoordinate_;
    // TODO: Check if the comment is being dragged, and give up if so.
    const current = comment.getXY();
    comment.moveBy(target.x - current.x, target.y - current.y);
  }
}

registry.register(registry.Type.EVENT, eventUtils.COMMENT_MOVE, CommentMove);

exports.CommentMove = CommentMove;
