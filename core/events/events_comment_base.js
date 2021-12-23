/**
 * @license
 * Copyright 2018 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Base class for comment events.
 */
'use strict';

/**
 * Base class for comment events.
 * @class
 */
goog.module('Blockly.Events.CommentBase');

const AbstractEvents = goog.require('Blockly.Events.Abstract');
const Xml = goog.require('Blockly.Xml');
const eventUtils = goog.require('Blockly.Events.utils');
const object = goog.require('Blockly.utils.object');
const utilsXml = goog.require('Blockly.utils.xml');
/* eslint-disable-next-line no-unused-vars */
const {CommentCreate} = goog.requireType('Blockly.Events.CommentCreate');
/* eslint-disable-next-line no-unused-vars */
const {CommentDelete} = goog.requireType('Blockly.Events.CommentDelete');
/* eslint-disable-next-line no-unused-vars */
const {WorkspaceComment} = goog.requireType('Blockly.WorkspaceComment');


/**
 * Abstract class for a comment event.
 * @param {!WorkspaceComment=} opt_comment The comment this event
 *     corresponds to.  Undefined for a blank event.
 * @extends {AbstractEvents}
 * @constructor
 * @alias Blockly.Events.CommentBase
 */
const CommentBase = function(opt_comment) {
  /**
   * Whether or not an event is blank.
   * @type {boolean}
   */
  this.isBlank = typeof opt_comment === 'undefined';

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
  this.group = eventUtils.getGroup();

  /**
   * Sets whether the event should be added to the undo stack.
   * @type {boolean}
   */
  this.recordUndo = eventUtils.getRecordUndo();
};
object.inherits(CommentBase, AbstractEvents);

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
 * @param {!CommentCreate|!CommentDelete} event
 *     The event to run.
 * @param {boolean} create if True then Create, if False then Delete
 */
CommentBase.CommentCreateDeleteHelper = function(event, create) {
  const workspace = event.getEventWorkspace_();
  if (create) {
    const xmlElement = utilsXml.createElement('xml');
    xmlElement.appendChild(event.xml);
    Xml.domToWorkspace(xmlElement, workspace);
  } else {
    const comment = workspace.getCommentById(event.commentId);
    if (comment) {
      comment.dispose();
    } else {
      // Only complain about root-level block.
      console.warn('Can\'t uncreate non-existent comment: ' + event.commentId);
    }
  }
};

exports.CommentBase = CommentBase;
