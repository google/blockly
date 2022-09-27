/**
 * @license
 * Copyright 2018 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Class for comment move event.
 *
 * @class
 */
import * as goog from '../../closure/goog/goog.js';
goog.declareModuleId('Blockly.Events.CommentMove');

import * as registry from '../registry.js';
import {Coordinate} from '../utils/coordinate.js';
import type {WorkspaceComment} from '../workspace_comment.js';

import {CommentBase, CommentBaseJson} from './events_comment_base.js';
import * as eventUtils from './utils.js';


/**
 * Class for a comment move event.  Created before the move.
 *
 * @alias Blockly.Events.CommentMove
 */
export class CommentMove extends CommentBase {
  override type = eventUtils.COMMENT_MOVE;
  comment_?: WorkspaceComment;
  oldCoordinate_?: Coordinate;
  /** The location after the move, in workspace coordinates. */
  newCoordinate_?: Coordinate;

  /**
   * @param opt_comment The comment that is being moved.  Undefined for a blank
   *     event.
   */
  constructor(opt_comment?: WorkspaceComment) {
    super(opt_comment);

    if (!opt_comment) {
      return;  // Blank event to be populated by fromJson.
    }

    /**
     * The comment that is being moved.
     */
    this.comment_ = opt_comment;

    /** The location before the move, in workspace coordinates. */
    this.oldCoordinate_ = opt_comment.getXY();
  }

  /**
   * Record the comment's new location.  Called after the move.  Can only be
   * called once.
   */
  recordNew() {
    if (this.newCoordinate_) {
      throw Error(
          'Tried to record the new position of a comment on the ' +
          'same event twice.');
    }
    if (!this.comment_) {
      throw new Error(
          'The comment is undefined. Pass a comment to ' +
          'the constructor if you want to use the record functionality');
    }
    this.newCoordinate_ = this.comment_.getXY();
  }

  /**
   * Override the location before the move.  Use this if you don't create the
   * event until the end of the move, but you know the original location.
   *
   * @param xy The location before the move, in workspace coordinates.
   */
  setOldCoordinate(xy: Coordinate) {
    this.oldCoordinate_ = xy;
  }

  // TODO (#1266): "Full" and "minimal" serialization.
  /**
   * Encode the event as JSON.
   *
   * @returns JSON representation.
   */
  override toJson(): CommentMoveJson {
    const json = super.toJson() as CommentMoveJson;
    if (!this.oldCoordinate_) {
      throw new Error(
          'The old comment position is undefined. Either pass a comment to ' +
          'the constructor, or call fromJson');
    }
    if (!this.newCoordinate_) {
      throw new Error(
          'The new comment position is undefined. Either call recordNew, or ' +
          'call fromJson');
    }
    json['oldCoordinate'] = `${Math.round(this.oldCoordinate_.x)}, ` +
        `${Math.round(this.oldCoordinate_.y)}`;
    json['newCoordinate'] = Math.round(this.newCoordinate_.x) + ',' +
        Math.round(this.newCoordinate_.y);
    return json;
  }

  /**
   * Decode the JSON event.
   *
   * @param json JSON representation.
   */
  override fromJson(json: CommentMoveJson) {
    super.fromJson(json);
    let xy = json['oldCoordinate'].split(',');
    this.oldCoordinate_ = new Coordinate(Number(xy[0]), Number(xy[1]));
    xy = json['newCoordinate'].split(',');
    this.newCoordinate_ = new Coordinate(Number(xy[0]), Number(xy[1]));
  }

  /**
   * Does this event record any change of state?
   *
   * @returns False if something changed.
   */
  override isNull(): boolean {
    return Coordinate.equals(this.oldCoordinate_, this.newCoordinate_);
  }

  /**
   * Run a move event.
   *
   * @param forward True if run forward, false if run backward (undo).
   */
  override run(forward: boolean) {
    const workspace = this.getEventWorkspace_();
    if (!this.commentId) {
      throw new Error(
          'The comment ID is undefined. Either pass a comment to ' +
          'the constructor, or call fromJson');
    }
    const comment = workspace.getCommentById(this.commentId);
    if (!comment) {
      console.warn('Can\'t move non-existent comment: ' + this.commentId);
      return;
    }

    const target = forward ? this.newCoordinate_ : this.oldCoordinate_;
    if (!target) {
      throw new Error(
          'Either oldCoordinate_ or newCoordinate_ is undefined. ' +
          'Either pass a comment to the constructor and call recordNew, ' +
          'or call fromJson');
    }
    // TODO: Check if the comment is being dragged, and give up if so.
    const current = comment.getXY();
    comment.moveBy(target.x - current.x, target.y - current.y);
  }
}

export interface CommentMoveJson extends CommentBaseJson {
  oldCoordinate: string;
  newCoordinate: string;
}

registry.register(registry.Type.EVENT, eventUtils.COMMENT_MOVE, CommentMove);
