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
 * @fileoverview Comment delete events fired as a result of actions in Blockly's
 *     editor.
 * @author fenichel@google.com (Rachel Fenichel)
 */
'use strict';

goog.provide('Blockly.Events.CommentDelete');

goog.require('Blockly.Events');
goog.require('Blockly.Events.CommentBase');

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
goog.inherits(Blockly.Events.CommentDelete, Blockly.Events.CommentBase);

/**
 * Type of this event.
 * @type {string}
 */
Blockly.Events.CommentDelete.prototype.type = Blockly.Events.COMMENT_DELETE;

/**
 * Encode the event as JSON.
 * TODO (#1266): "Full" and "minimal" serialization.
 * @return {!Object} JSON representation.
 */
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
  var workspace = this.getEventWorkspace_();
  if (forward) {
    var comment = workspace.getCommentById(this.commentId);
    if (comment) {
      comment.dispose(false, false);
    } else {
      // Only complain about root-level block.
      console.warn("Can't uncreate non-existent comment: " + this.commentId);
    }
  } else {
    var xml = goog.dom.createDom('xml');
    xml.appendChild(this.xml);
    Blockly.Xml.domToWorkspace(xml, workspace);
  }
};
