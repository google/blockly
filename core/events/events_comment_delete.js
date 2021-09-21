/**
 * @license
 * Copyright 2018 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Class for comment deletion event.
 * @author fenichel@google.com (Rachel Fenichel)
 */
'use strict';

goog.module('Blockly.Events.CommentDelete');

const CommentBase = goog.require('Blockly.Events.CommentBase');
/* eslint-disable-next-line no-unused-vars */
const WorkspaceComment = goog.requireType('Blockly.WorkspaceComment');
const helpers = goog.require('Blockly.Events.helpers');
const object = goog.require('Blockly.utils.object');
const registry = goog.require('Blockly.registry');


/**
 * Class for a comment deletion event.
 * @param {!WorkspaceComment=} opt_comment The deleted comment.
 *     Undefined for a blank event.
 * @extends {CommentBase}
 * @constructor
 */
const CommentDelete = function(opt_comment) {
  CommentDelete.superClass_.constructor.call(this, opt_comment);
  if (!opt_comment) {
    return;  // Blank event to be populated by fromJson.
  }

  this.xml = opt_comment.toXmlWithXY();
};
object.inherits(CommentDelete, CommentBase);

/**
 * Type of this event.
 * @type {string}
 */
CommentDelete.prototype.type = helpers.COMMENT_DELETE;

/**
 * Encode the event as JSON.
 * @return {!Object} JSON representation.
 */
// TODO (#1266): "Full" and "minimal" serialization.
CommentDelete.prototype.toJson = function() {
  const json = CommentDelete.superClass_.toJson.call(this);
  return json;
};

/**
 * Decode the JSON event.
 * @param {!Object} json JSON representation.
 */
CommentDelete.prototype.fromJson = function(json) {
  CommentDelete.superClass_.fromJson.call(this, json);
};

/**
 * Run a creation event.
 * @param {boolean} forward True if run forward, false if run backward (undo).
 */
CommentDelete.prototype.run = function(forward) {
  CommentBase.CommentCreateDeleteHelper(this, !forward);
};

registry.register(registry.Type.EVENT, helpers.COMMENT_DELETE, CommentDelete);

exports = CommentDelete;
