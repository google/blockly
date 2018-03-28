/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2018 Google Inc.
 * https://developers.google.com/blockly/
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
 * @fileoverview Comment change events fired as a result of actions in Blockly's
 *     editor.
 * @author fenichel@google.com (Rachel Fenichel)
 */
'use strict';

goog.provide('Blockly.Events.CommentChange');

goog.require('Blockly.Events');
goog.require('Blockly.Events.CommentBase');

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
goog.inherits(Blockly.Events.CommentChange, Blockly.Events.CommentBase);

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
