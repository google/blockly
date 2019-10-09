/**
 * @license
 * Copyright 2018 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview Classes for all comment events.
 * @author fenichel@google.com (Rachel Fenichel)
 */
'use strict';

goog.provide('Blockly.Events.CommentBase');
goog.provide('Blockly.Events.CommentChange');
goog.provide('Blockly.Events.CommentCreate');
goog.provide('Blockly.Events.CommentDelete');
goog.provide('Blockly.Events.CommentMove');

goog.require('Blockly.Events');
goog.require('Blockly.Events.Abstract');
goog.require('Blockly.utils.Coordinate');
goog.require('Blockly.utils.object');
goog.require('Blockly.utils.xml');
// TODO: Fix recursive dependency.
// goog.require('Blockly.Xml');


/**
 * Abstract class for a comment event.
 * @param {Blockly.WorkspaceComment} comment The comment this event corresponds
 *     to.
 * @extends {Blockly.Events.Abstract}
 * @constructor
 */
Blockly.Events.CommentBase = function(comment) {
  /**
   * The ID of the comment this event pertains to.
   * @type {string}
   */
  this.commentId = comment.id;

  /**
   * The workspace identifier for this event.
   * @type {string}
   */
  this.workspaceId = comment.workspace.id;

  /**
   * The event group id for the group this event belongs to. Groups define
   * events that should be treated as an single action from the user's
   * perspective, and should be undone together.
   * @type {string}
   */
  this.group = Blockly.Events.getGroup();

  /**
   * Sets whether the event should be added to the undo stack.
   * @type {boolean}
   */
  this.recordUndo = Blockly.Events.recordUndo;
};
Blockly.utils.object.inherits(Blockly.Events.CommentBase,
    Blockly.Events.Abstract);

/**
 * Encode the event as JSON.
 * @return {!Object} JSON representation.
 */
Blockly.Events.CommentBase.prototype.toJson = function() {
  var json = Blockly.Events.CommentBase.superClass_.toJson.call(this);
  if (this.commentId) {
    json['commentId'] = this.commentId;
  }
  return json;
};

/**
 * Decode the JSON event.
 * @param {!Object} json JSON representation.
 */
Blockly.Events.CommentBase.prototype.fromJson = function(json) {
  Blockly.Events.CommentBase.superClass_.fromJson.call(this, json);
  this.commentId = json['commentId'];
};

/**
 * Class for a comment change event.
 * @param {Blockly.WorkspaceComment} comment The comment that is being changed.
 *     Null for a blank event.
 * @param {string} oldContents Previous contents of the comment.
 * @param {string} newContents New contents of the comment.
 * @extends {Blockly.Events.CommentBase}
 * @constructor
 */
Blockly.Events.CommentChange = function(comment, oldContents, newContents) {
  if (!comment) {
    return;  // Blank event to be populated by fromJson.
  }
  Blockly.Events.CommentChange.superClass_.constructor.call(this, comment);
  this.oldContents_ = oldContents;
  this.newContents_ = newContents;
};
Blockly.utils.object.inherits(Blockly.Events.CommentChange,
    Blockly.Events.CommentBase);

/**
 * Type of this event.
 * @type {string}
 */
Blockly.Events.CommentChange.prototype.type = Blockly.Events.COMMENT_CHANGE;

/**
 * Encode the event as JSON.
 * @return {!Object} JSON representation.
 */
Blockly.Events.CommentChange.prototype.toJson = function() {
  var json = Blockly.Events.CommentChange.superClass_.toJson.call(this);
  json['newContents'] = this.newContents_;
  return json;
};

/**
 * Decode the JSON event.
 * @param {!Object} json JSON representation.
 */
Blockly.Events.CommentChange.prototype.fromJson = function(json) {
  Blockly.Events.CommentChange.superClass_.fromJson.call(this, json);
  this.newContents_ = json['newValue'];
};

/**
 * Does this event record any change of state?
 * @return {boolean} False if something changed.
 */
Blockly.Events.CommentChange.prototype.isNull = function() {
  return this.oldContents_ == this.newContents_;
};

/**
 * Run a change event.
 * @param {boolean} forward True if run forward, false if run backward (undo).
 */
Blockly.Events.CommentChange.prototype.run = function(forward) {
  var workspace = this.getEventWorkspace_();
  var comment = workspace.getCommentById(this.commentId);
  if (!comment) {
    console.warn('Can\'t change non-existent comment: ' + this.commentId);
    return;
  }
  var contents = forward ? this.newContents_ : this.oldContents_;

  comment.setContent(contents);
};

/**
 * Class for a comment creation event.
 * @param {Blockly.WorkspaceComment} comment The created comment.
 *     Null for a blank event.
 * @extends {Blockly.Events.CommentBase}
 * @constructor
 */
Blockly.Events.CommentCreate = function(comment) {
  if (!comment) {
    return;  // Blank event to be populated by fromJson.
  }
  Blockly.Events.CommentCreate.superClass_.constructor.call(this, comment);

  this.xml = comment.toXmlWithXY();
};
Blockly.utils.object.inherits(Blockly.Events.CommentCreate,
    Blockly.Events.CommentBase);

/**
 * Type of this event.
 * @type {string}
 */
Blockly.Events.CommentCreate.prototype.type = Blockly.Events.COMMENT_CREATE;

/**
 * Encode the event as JSON.
 * @return {!Object} JSON representation.
 */
// TODO (#1266): "Full" and "minimal" serialization.
Blockly.Events.CommentCreate.prototype.toJson = function() {
  var json = Blockly.Events.CommentCreate.superClass_.toJson.call(this);
  json['xml'] = Blockly.Xml.domToText(this.xml);
  return json;
};

/**
 * Decode the JSON event.
 * @param {!Object} json JSON representation.
 */
Blockly.Events.CommentCreate.prototype.fromJson = function(json) {
  Blockly.Events.CommentCreate.superClass_.fromJson.call(this, json);
  this.xml = Blockly.Xml.textToDom(json['xml']);
};

/**
 * Run a creation event.
 * @param {boolean} forward True if run forward, false if run backward (undo).
 */
Blockly.Events.CommentCreate.prototype.run = function(forward) {
  Blockly.Events.CommentCreateDeleteHelper(this, forward);
};

/**
 * Helper function for Comment[Create|Delete]
 * @param {!Blockly.Events.CommentCreate|!Blockly.Events.CommentDelete} event
 *     The event to run.
 * @param {boolean} create if True then Create, if False then Delete
 */
Blockly.Events.CommentCreateDeleteHelper = function(event, create) {
  var workspace = event.getEventWorkspace_();
  if (create) {
    var xml = Blockly.utils.xml.createElement('xml');
    xml.appendChild(event.xml);
    Blockly.Xml.domToWorkspace(xml, workspace);
  } else {
    var comment = workspace.getCommentById(event.commentId);
    if (comment) {
      comment.dispose(false, false);
    } else {
      // Only complain about root-level block.
      console.warn("Can't uncreate non-existent comment: " + event.commentId);
    }
  }
};
/**
 * Class for a comment deletion event.
 * @param {Blockly.WorkspaceComment} comment The deleted comment.
 *     Null for a blank event.
 * @extends {Blockly.Events.CommentBase}
 * @constructor
 */
Blockly.Events.CommentDelete = function(comment) {
  if (!comment) {
    return;  // Blank event to be populated by fromJson.
  }
  Blockly.Events.CommentDelete.superClass_.constructor.call(this, comment);

  this.xml = comment.toXmlWithXY();
};
Blockly.utils.object.inherits(Blockly.Events.CommentDelete,
    Blockly.Events.CommentBase);

/**
 * Type of this event.
 * @type {string}
 */
Blockly.Events.CommentDelete.prototype.type = Blockly.Events.COMMENT_DELETE;

/**
 * Encode the event as JSON.
 * @return {!Object} JSON representation.
 */
// TODO (#1266): "Full" and "minimal" serialization.
Blockly.Events.CommentDelete.prototype.toJson = function() {
  var json = Blockly.Events.CommentDelete.superClass_.toJson.call(this);
  return json;
};

/**
 * Decode the JSON event.
 * @param {!Object} json JSON representation.
 */
Blockly.Events.CommentDelete.prototype.fromJson = function(json) {
  Blockly.Events.CommentDelete.superClass_.fromJson.call(this, json);
};

/**
 * Run a creation event.
 * @param {boolean} forward True if run forward, false if run backward (undo).
 */
Blockly.Events.CommentDelete.prototype.run = function(forward) {
  Blockly.Events.CommentCreateDeleteHelper(this, !forward);
};

/**
 * Class for a comment move event.  Created before the move.
 * @param {Blockly.WorkspaceComment} comment The comment that is being moved.
 *     Null for a blank event.
 * @extends {Blockly.Events.CommentBase}
 * @constructor
 */
Blockly.Events.CommentMove = function(comment) {
  if (!comment) {
    return;  // Blank event to be populated by fromJson.
  }
  Blockly.Events.CommentMove.superClass_.constructor.call(this, comment);

  /**
   * The comment that is being moved.  Will be cleared after recording the new
   * location.
   * @type {Blockly.WorkspaceComment}
   */
  this.comment_ = comment;

  /**
   * The location before the move, in workspace coordinates.
   * @type {!Blockly.utils.Coordinate}
   */
  this.oldCoordinate_ = comment.getXY();

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
