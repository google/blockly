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

goog.provide('Blockly.Events.CommentCreate');

goog.require('Blockly.Events');
goog.require('Blockly.Events.CommentBase');
goog.require('Blockly.registry');
goog.require('Blockly.utils.object');
goog.require('Blockly.Xml');

goog.requireType('Blockly.WorkspaceComment');


/**
* Class for a comment creation event.
* @param {!Blockly.WorkspaceComment=} opt_comment The created comment.
*     Undefined for a blank event.
* @extends {Blockly.Events.CommentBase}
* @constructor
*/
Blockly.Events.CommentCreate = function(opt_comment) {
  Blockly.Events.CommentCreate.superClass_.constructor.call(this, opt_comment);
  if (!opt_comment) {
    return;  // Blank event to be populated by fromJson.
  }

  this.xml = opt_comment.toXmlWithXY();
};
Blockly.utils.object.inherits(Blockly.Events.CommentCreate,
    Blockly.Events.CommentBase);

/**
* Type of this event.
* @type {string}
*/
Blockly.Events.CommentCreate.prototype.type = Blockly.Events.COMMENT_CREATE;

/**
* Encode the event as JSON.
* @return {!Object} JSON representation.
*/
// TODO (#1266): "Full" and "minimal" serialization.
Blockly.Events.CommentCreate.prototype.toJson = function() {
  const json = Blockly.Events.CommentCreate.superClass_.toJson.call(this);
  json['xml'] = Blockly.Xml.domToText(this.xml);
  return json;
};

/**
* Decode the JSON event.
* @param {!Object} json JSON representation.
*/
Blockly.Events.CommentCreate.prototype.fromJson = function(json) {
  Blockly.Events.CommentCreate.superClass_.fromJson.call(this, json);
  this.xml = Blockly.Xml.textToDom(json['xml']);
};

/**
* Run a creation event.
* @param {boolean} forward True if run forward, false if run backward (undo).
*/
Blockly.Events.CommentCreate.prototype.run = function(forward) {
  Blockly.Events.CommentBase.CommentCreateDeleteHelper(this, forward);
};


Blockly.registry.register(Blockly.registry.Type.EVENT,
    Blockly.Events.COMMENT_CREATE, Blockly.Events.CommentCreate);
