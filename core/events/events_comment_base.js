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

goog.module('Blockly.Events.CommentBase');
goog.module.declareLegacyNamespace();
 
goog.require('Blockly.Events');
goog.require('Blockly.Events.Abstract');
goog.require('Blockly.utils.object');
goog.require('Blockly.utils.xml');
goog.require('Blockly.Xml');
 
goog.requireType('Blockly.WorkspaceComment');


/**
* Abstract class for a comment event.
* @param {!Blockly.WorkspaceComment=} opt_comment The comment this event
*     corresponds to.  Undefined for a blank event.
* @extends {Blockly.Events.Abstract}
* @constructor
*/
const CommentBase = function(opt_comment) {

  /**
  * Whether or not an event is blank.
  * @type {boolean}
  */
  this.isBlank = typeof opt_comment == 'undefined';

  /**
  * The ID of the comment this event pertains to.
  * @type {string}
  */
  this.commentId = this.isBlank ? '' : opt_comment.id;

  /**
  * The workspace identifier for this event.
  * @type {string}
  */
  this.workspaceId = this.isBlank ? '' : opt_comment.workspace.id;

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
Blockly.utils.object.inherits(CommentBase,
    Blockly.Events.Abstract);
 
/**
 * Encode the event as JSON.
 * @return {!Object} JSON representation.
 */
CommentBase.prototype.toJson = function() {
  const json = CommentBase.superClass_.toJson.call(this);
  if (this.commentId) {
    json['commentId'] = this.commentId;
  }
  return json;
};
 
/**
 * Decode the JSON event.
 * @param {!Object} json JSON representation.
 */
CommentBase.prototype.fromJson = function(json) {
  CommentBase.superClass_.fromJson.call(this, json);
  this.commentId = json['commentId'];
};

/**
* Helper function for Comment[Create|Delete]
* @param {!Blockly.Events.CommentCreate|!Blockly.Events.CommentDelete} event
*     The event to run.
* @param {boolean} create if True then Create, if False then Delete
*/
CommentBase.CommentCreateDeleteHelper = function(event, create) {
  const workspace = event.getEventWorkspace_();
  if (create) {
    const xml = Blockly.utils.xml.createElement('xml');
    xml.appendChild(event.xml);
    Blockly.Xml.domToWorkspace(xml, workspace);
  } else {
    const comment = workspace.getCommentById(event.commentId);
    if (comment) {
      comment.dispose();
    } else {
      // Only complain about root-level block.
      console.warn("Can't uncreate non-existent comment: " + event.commentId);
    }
  }
};

exports = CommentBase;
