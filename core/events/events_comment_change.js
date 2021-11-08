/**
 * @license
 * Copyright 2018 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Class for comment change event.
 */
'use strict';

/**
 * Class for comment change event.
 * @class
 */
goog.module('Blockly.Events.CommentChange');

const eventUtils = goog.require('Blockly.Events.utils');
const object = goog.require('Blockly.utils.object');
const registry = goog.require('Blockly.registry');
const {CommentBase} = goog.require('Blockly.Events.CommentBase');
/* eslint-disable-next-line no-unused-vars */
const {WorkspaceComment} = goog.requireType('Blockly.WorkspaceComment');


/**
 * Class for a comment change event.
 * @param {!WorkspaceComment=} opt_comment The comment that is being
 *     changed.  Undefined for a blank event.
 * @param {string=} opt_oldContents Previous contents of the comment.
 * @param {string=} opt_newContents New contents of the comment.
 * @extends {CommentBase}
 * @constructor
 * @alias Blockly.Events.CommentChange
 */
const CommentChange = function(opt_comment, opt_oldContents, opt_newContents) {
  CommentChange.superClass_.constructor.call(this, opt_comment);
  if (!opt_comment) {
    return;  // Blank event to be populated by fromJson.
  }

  this.oldContents_ =
      typeof opt_oldContents === 'undefined' ? '' : opt_oldContents;
  this.newContents_ =
      typeof opt_newContents === 'undefined' ? '' : opt_newContents;
};
object.inherits(CommentChange, CommentBase);

/**
 * Type of this event.
 * @type {string}
 */
CommentChange.prototype.type = eventUtils.COMMENT_CHANGE;

/**
 * Encode the event as JSON.
 * @return {!Object} JSON representation.
 */
CommentChange.prototype.toJson = function() {
  const json = CommentChange.superClass_.toJson.call(this);
  json['oldContents'] = this.oldContents_;
  json['newContents'] = this.newContents_;
  return json;
};

/**
 * Decode the JSON event.
 * @param {!Object} json JSON representation.
 */
CommentChange.prototype.fromJson = function(json) {
  CommentChange.superClass_.fromJson.call(this, json);
  this.oldContents_ = json['oldContents'];
  this.newContents_ = json['newContents'];
};

/**
 * Does this event record any change of state?
 * @return {boolean} False if something changed.
 */
CommentChange.prototype.isNull = function() {
  return this.oldContents_ === this.newContents_;
};

/**
 * Run a change event.
 * @param {boolean} forward True if run forward, false if run backward (undo).
 */
CommentChange.prototype.run = function(forward) {
  const workspace = this.getEventWorkspace_();
  const comment = workspace.getCommentById(this.commentId);
  if (!comment) {
    console.warn('Can\'t change non-existent comment: ' + this.commentId);
    return;
  }
  const contents = forward ? this.newContents_ : this.oldContents_;

  comment.setContent(contents);
};

registry.register(
    registry.Type.EVENT, eventUtils.COMMENT_CHANGE, CommentChange);

exports.CommentChange = CommentChange;
