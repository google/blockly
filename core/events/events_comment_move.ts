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

import {CommentBase} from './events_comment_base.js';
import * as eventUtils from './utils.js';


/**
 * Class for a comment move event.  Created before the move.
 *
 * @alias Blockly.Events.CommentMove
 */
export class CommentMove extends CommentBase {
  override type: string;

  // TODO(b/109816955): remove '!', see go/strict-prop-init-fix.
  comment_!: WorkspaceComment;
  // TODO(b/109816955): remove '!', see go/strict-prop-init-fix.
  oldCoordinate_!: Coordinate;

  /** The location after the move, in workspace coordinates. */
  // AnyDuringMigration because:  Type 'null' is not assignable to type
  // 'Coordinate'.
  newCoordinate_: Coordinate = null as AnyDuringMigration;

  /**
   * @param opt_comment The comment that is being moved.  Undefined for a blank
   *     event.
   */
  constructor(opt_comment?: WorkspaceComment) {
    super(opt_comment);

    /** Type of this event. */
    this.type = eventUtils.COMMENT_MOVE;

    if (!opt_comment) {
      return;  // Blank event to be populated by fromJson.
    }

    /**
     * The comment that is being moved.  Will be cleared after recording the new
     * location.
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
    if (!this.comment_) {
      throw Error(
          'Tried to record the new position of a comment on the ' +
          'same event twice.');
    }
    this.newCoordinate_ = this.comment_.getXY();
    // AnyDuringMigration because:  Type 'null' is not assignable to type
    // 'WorkspaceComment'.
    this.comment_ = null as AnyDuringMigration;
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
  override toJson(): AnyDuringMigration {
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
   *
   * @param json JSON representation.
   */
  override fromJson(json: AnyDuringMigration) {
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
