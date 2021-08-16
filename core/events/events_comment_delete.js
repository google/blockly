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

goog.provide('Blockly.Events.CommentDelete');

goog.require('Blockly.Events');
goog.require('Blockly.Events.CommentBase');
goog.require('Blockly.registry');
goog.require('Blockly.utils.object');

goog.requireType('Blockly.WorkspaceComment');


/**
* Class for a comment deletion event.
* @param {!Blockly.WorkspaceComment=} opt_comment The deleted comment.
*     Undefined for a blank event.
* @extends {Blockly.Events.CommentBase}
* @constructor
*/
Blockly.Events.CommentDelete = function(opt_comment) {
  Blockly.Events.CommentDelete.superClass_.constructor.call(this, opt_comment);
  if (!opt_comment) {
    return;  // Blank event to be populated by fromJson.
  }

  this.xml = opt_comment.toXmlWithXY();
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
  Blockly.Events.CommentBase.CommentCreateDeleteHelper(this, !forward);
};

Blockly.registry.register(Blockly.registry.Type.EVENT,
    Blockly.Events.COMMENT_DELETE, Blockly.Events.CommentDelete);
