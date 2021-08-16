/**
 * @license
 * Copyright 2018 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Classes for all comment events.
 * @author fenichel@google.com (Rachel Fenichel)
 */
'use strict';

goog.provide('Blockly.Events.CommentMove');

goog.require('Blockly.Events');
goog.require('Blockly.Events.CommentBase');
goog.require('Blockly.registry');
goog.require('Blockly.utils.Coordinate');
goog.require('Blockly.utils.object');

goog.requireType('Blockly.WorkspaceComment');

/**
* Class for a comment move event.  Created before the move.
* @param {!Blockly.WorkspaceComment=} opt_comment The comment that is being
*     moved.  Undefined for a blank event.
* @extends {Blockly.Events.CommentBase}
* @constructor
*/
Blockly.Events.CommentMove = function(opt_comment) {
  Blockly.Events.CommentMove.superClass_.constructor.call(this, opt_comment);
  if (!opt_comment) {
    return;  // Blank event to be populated by fromJson.
  }

  /**
  * The comment that is being moved.  Will be cleared after recording the new
  * location.
  * @type {Blockly.WorkspaceComment}
  */
  this.comment_ = opt_comment;

  /**
  * The location before the move, in workspace coordinates.
  * @type {!Blockly.utils.Coordinate}
  */
  this.oldCoordinate_ = opt_comment.getXY();

  /**
  * The location after the move, in workspace coordinates.
  * @type {Blockly.utils.Coordinate}
  */
  this.newCoordinate_ = null;
};
Blockly.utils.object.inherits(Blockly.Events.CommentMove,
    Blockly.Events.CommentBase);

/**
* Record the comment's new location.  Called after the move.  Can only be
* called once.
*/
Blockly.Events.CommentMove.prototype.recordNew = function() {
  if (!this.comment_) {
    throw Error('Tried to record the new position of a comment on the ' +
        'same event twice.');
  }
  this.newCoordinate_ = this.comment_.getXY();
  this.comment_ = null;
};

/**
* Type of this event.
* @type {string}
*/
Blockly.Events.CommentMove.prototype.type = Blockly.Events.COMMENT_MOVE;

/**
* Override the location before the move.  Use this if you don't create the
* event until the end of the move, but you know the original location.
* @param {!Blockly.utils.Coordinate} xy The location before the move,
*     in workspace coordinates.
*/
Blockly.Events.CommentMove.prototype.setOldCoordinate = function(xy) {
  this.oldCoordinate_ = xy;
};

/**
* Encode the event as JSON.
* @return {!Object} JSON representation.
*/
// TODO (#1266): "Full" and "minimal" serialization.
Blockly.Events.CommentMove.prototype.toJson = function() {
  var json = Blockly.Events.CommentMove.superClass_.toJson.call(this);
  if (this.oldCoordinate_) {
    json['oldCoordinate'] = Math.round(this.oldCoordinate_.x) + ',' +
        Math.round(this.oldCoordinate_.y);
  }
  if (this.newCoordinate_) {
    json['newCoordinate'] = Math.round(this.newCoordinate_.x) + ',' +
        Math.round(this.newCoordinate_.y);
  }
  return json;
};

/**
* Decode the JSON event.
* @param {!Object} json JSON representation.
*/
Blockly.Events.CommentMove.prototype.fromJson = function(json) {
  Blockly.Events.CommentMove.superClass_.fromJson.call(this, json);

  if (json['oldCoordinate']) {
    var xy = json['oldCoordinate'].split(',');
    this.oldCoordinate_ =
        new Blockly.utils.Coordinate(Number(xy[0]), Number(xy[1]));
  }
  if (json['newCoordinate']) {
    var xy = json['newCoordinate'].split(',');
    this.newCoordinate_ =
        new Blockly.utils.Coordinate(Number(xy[0]), Number(xy[1]));
  }
};

/**
* Does this event record any change of state?
* @return {boolean} False if something changed.
*/
Blockly.Events.CommentMove.prototype.isNull = function() {
  return Blockly.utils.Coordinate.equals(this.oldCoordinate_,
      this.newCoordinate_);
};

/**
* Run a move event.
* @param {boolean} forward True if run forward, false if run backward (undo).
*/
Blockly.Events.CommentMove.prototype.run = function(forward) {
  var workspace = this.getEventWorkspace_();
  var comment = workspace.getCommentById(this.commentId);
  if (!comment) {
    console.warn('Can\'t move non-existent comment: ' + this.commentId);
    return;
  }

  var target = forward ? this.newCoordinate_ : this.oldCoordinate_;
  // TODO: Check if the comment is being dragged, and give up if so.
  var current = comment.getXY();
  comment.moveBy(target.x - current.x, target.y - current.y);
};

Blockly.registry.register(Blockly.registry.Type.EVENT,
    Blockly.Events.COMMENT_MOVE, Blockly.Events.CommentMove);
