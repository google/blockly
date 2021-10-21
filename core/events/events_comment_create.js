/**
 * @license
 * Copyright 2018 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Class for comment creation event.
 */
'use strict';

/**
 * Class for comment creation event.
 * @class
 */
goog.module('Blockly.Events.CommentCreate');

const Xml = goog.require('Blockly.Xml');
const eventUtils = goog.require('Blockly.Events.utils');
const object = goog.require('Blockly.utils.object');
const registry = goog.require('Blockly.registry');
const {CommentBase} = goog.require('Blockly.Events.CommentBase');
/* eslint-disable-next-line no-unused-vars */
const {WorkspaceComment} = goog.requireType('Blockly.WorkspaceComment');


/**
 * Class for a comment creation event.
 * @param {!WorkspaceComment=} opt_comment The created comment.
 *     Undefined for a blank event.
 * @extends {CommentBase}
 * @constructor
 * @alias Blockly.Events.CommentCreate
 */
const CommentCreate = function(opt_comment) {
  CommentCreate.superClass_.constructor.call(this, opt_comment);
  if (!opt_comment) {
    return;  // Blank event to be populated by fromJson.
  }

  this.xml = opt_comment.toXmlWithXY();
};
object.inherits(CommentCreate, CommentBase);

/**
 * Type of this event.
 * @type {string}
 */
CommentCreate.prototype.type = eventUtils.COMMENT_CREATE;

/**
 * Encode the event as JSON.
 * @return {!Object} JSON representation.
 */
// TODO (#1266): "Full" and "minimal" serialization.
CommentCreate.prototype.toJson = function() {
  const json = CommentCreate.superClass_.toJson.call(this);
  json['xml'] = Xml.domToText(this.xml);
  return json;
};

/**
 * Decode the JSON event.
 * @param {!Object} json JSON representation.
 */
CommentCreate.prototype.fromJson = function(json) {
  CommentCreate.superClass_.fromJson.call(this, json);
  this.xml = Xml.textToDom(json['xml']);
};

/**
 * Run a creation event.
 * @param {boolean} forward True if run forward, false if run backward (undo).
 */
CommentCreate.prototype.run = function(forward) {
  CommentBase.CommentCreateDeleteHelper(this, forward);
};

registry.register(
    registry.Type.EVENT, eventUtils.COMMENT_CREATE, CommentCreate);

exports.CommentCreate = CommentCreate;
