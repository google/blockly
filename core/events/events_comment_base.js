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

const Xml = goog.require('Blockly.Xml');
const eventUtils = goog.require('Blockly.Events.utils');
const utilsXml = goog.require('Blockly.utils.xml');
const {Abstract: AbstractEvent} = goog.require('Blockly.Events.Abstract');
/* eslint-disable-next-line no-unused-vars */
const {CommentCreate} = goog.requireType('Blockly.Events.CommentCreate');
/* eslint-disable-next-line no-unused-vars */
const {CommentDelete} = goog.requireType('Blockly.Events.CommentDelete');
/* eslint-disable-next-line no-unused-vars */
const {WorkspaceComment} = goog.requireType('Blockly.WorkspaceComment');


/**
 * Abstract class for a comment event.
 * @extends {AbstractEvent}
 * @alias Blockly.Events.CommentBase
 */
class CommentBase extends AbstractEvent {
  /**
   * @param {!WorkspaceComment=} opt_comment The comment this event
   *     corresponds to.  Undefined for a blank event.
   */
  constructor(opt_comment) {
    super();
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
  }

  /**
   * Encode the event as JSON.
   * @return {!Object} JSON representation.
   */
  toJson() {
    const json = super.toJson();
    if (this.commentId) {
      json['commentId'] = this.commentId;
    }
    return json;
  }

  /**
   * Decode the JSON event.
   * @param {!Object} json JSON representation.
   */
  fromJson(json) {
    super.fromJson(json);
    this.commentId = json['commentId'];
  }

  /**
   * Helper function for Comment[Create|Delete]
   * @param {!CommentCreate|!CommentDelete} event
   *     The event to run.
   * @param {boolean} create if True then Create, if False then Delete
   */
  static CommentCreateDeleteHelper(event, create) {
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
        console.warn(
            'Can\'t uncreate non-existent comment: ' + event.commentId);
      }
    }
  }
}

exports.CommentBase = CommentBase;
