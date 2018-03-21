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
 * @fileoverview Base class for comment events.
 * @author fenichel@google.com (Rachel Fenichel)
 */
'use strict';

goog.provide('Blockly.Events.CommentBase');

goog.require('Blockly.Events');
goog.require('Blockly.Events.Abstract');

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
  this.group = Blockly.Events.group_;

  /**
   * Sets whether the event should be added to the undo stack.
   * @type {boolean}
   */
  this.recordUndo = Blockly.Events.recordUndo;
};
goog.inherits(Blockly.Events.CommentBase, Blockly.Events.Abstract);

/**
 * Encode the event as JSON.
 * @return {!Object} JSON representation.
 */
Blockly.Events.CommentBase.prototype.toJson = function() {
  var json = {
    'type': this.type
  };
  if (this.group) {
    json['group'] = this.group;
  }
  if (this.commentId) {
    json['commentId'] = this.commentId;
  }
  return json;
};

/**
 * Decode the JSON event.
 * @param {!Object} json JSON representation.
 */
Blockly.Events.Abstract.prototype.fromJson = function(json) {
  this.commentId = json['commentId'];
  this.group = json['group'];
};
