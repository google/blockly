/**
 * @license
 * Copyright 2018 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Class for comment deletion event.
 */
'use strict';

/**
 * Class for comment deletion event.
 * @class
 */
goog.module('Blockly.Events.CommentDelete');

const eventUtils = goog.require('Blockly.Events.utils');
const registry = goog.require('Blockly.registry');
const {CommentBase} = goog.require('Blockly.Events.CommentBase');
/* eslint-disable-next-line no-unused-vars */
const {WorkspaceComment} = goog.requireType('Blockly.WorkspaceComment');


/**
 * Class for a comment deletion event.
 * @extends {CommentBase}
 * @alias Blockly.Events.CommentDelete
 */
class CommentDelete extends CommentBase {
  /**
   * @param {!WorkspaceComment=} opt_comment The deleted comment.
   *     Undefined for a blank event.
   */
  constructor(opt_comment) {
    super(opt_comment);

    /**
     * Type of this event.
     * @type {string}
     */
    this.type = eventUtils.COMMENT_DELETE;

    if (!opt_comment) {
      return;  // Blank event to be populated by fromJson.
    }

    this.xml = opt_comment.toXmlWithXY();
  }

  // TODO (#1266): "Full" and "minimal" serialization.
  /**
   * Encode the event as JSON.
   * @return {!Object} JSON representation.
   */
  toJson() {
    const json = super.toJson();
    return json;
  }

  /**
   * Decode the JSON event.
   * @param {!Object} json JSON representation.
   */
  fromJson(json) {
    super.fromJson(json);
  }

  /**
   * Run a creation event.
   * @param {boolean} forward True if run forward, false if run backward (undo).
   */
  run(forward) {
    CommentBase.CommentCreateDeleteHelper(this, !forward);
  }
}

registry.register(
    registry.Type.EVENT, eventUtils.COMMENT_DELETE, CommentDelete);

exports.CommentDelete = CommentDelete;
