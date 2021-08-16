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

goog.provide('Blockly.Events.CommentChange');

goog.require('Blockly.Events');
goog.require('Blockly.Events.CommentBase');
goog.require('Blockly.registry');
goog.require('Blockly.utils.object');

goog.requireType('Blockly.WorkspaceComment');


/**
* Class for a comment change event.
* @param {!Blockly.WorkspaceComment=} opt_comment The comment that is being
*     changed.  Undefined for a blank event.
* @param {string=} opt_oldContents Previous contents of the comment.
* @param {string=} opt_newContents New contents of the comment.
* @extends {Blockly.Events.CommentBase}
* @constructor
*/
Blockly.Events.CommentChange = function(opt_comment, opt_oldContents,
    opt_newContents) {
  Blockly.Events.CommentChange.superClass_.constructor.call(this, opt_comment);
  if (!opt_comment) {
    return;  // Blank event to be populated by fromJson.
  }

  this.oldContents_ = typeof opt_oldContents == 'undefined' ? '' :
      opt_oldContents;
  this.newContents_ = typeof opt_newContents == 'undefined' ? '' :
      opt_newContents;
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
  json['oldContents'] = this.oldContents_;
  json['newContents'] = this.newContents_;
  return json;
};

/**
* Decode the JSON event.
* @param {!Object} json JSON representation.
*/
Blockly.Events.CommentChange.prototype.fromJson = function(json) {
  Blockly.Events.CommentChange.superClass_.fromJson.call(this, json);
  this.oldContents_ = json['oldContents'];
  this.newContents_ = json['newContents'];
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

Blockly.registry.register(Blockly.registry.Type.EVENT,
    Blockly.Events.COMMENT_CHANGE, Blockly.Events.CommentChange);
