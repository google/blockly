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
 * @fileoverview Workspace comment creation events fired as a result of actions in
 *     Blockly's editor.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Blockly.Events.WorkspaceCommentCreate');

goog.require('Blockly.Events');
goog.require('Blockly.Events.Abstract');
goog.require('goog.array');
goog.require('goog.math.Coordinate');

/**
 * Class for a workspace comment creation event.
 * @param {Blockly.WorkspaceComment} comment The created workspace comment.  Null for a blank event.
 * @extends {Blockly.Events.Abstract}
 * @constructor
 */
Blockly.Events.WorkspaceCommentCreate = function(comment) {
  if (!comment) {
    return;  // Blank event to be populated by fromJson.
  }
  Blockly.Events.Create.superClass_.constructor.call(this, comment);

  if (comment.workspace.rendered) {
    this.xml = comment.toXmlWithXY();
  } else {
    this.xml = comment.toXml();
  }
};
goog.inherits(Blockly.Events.WorkspaceCommentCreate, Blockly.Events.Abstract);

/**
 * Type of this event.
 * @type {string}
 */
Blockly.Events.WorkspaceCommentCreate.prototype.type = Blockly.Events.CREATE;

/**
 * Encode the event as JSON.
 * @return {!Object} JSON representation.
 */
Blockly.Events.WorkspaceCommentCreate.prototype.toJson = function() {
  var json = Blockly.Events.WorkspaceCommentCreate.superClass_.toJson.call(this);
  json['xml'] = Blockly.Xml.domToText(this.xml);
  json['ids'] = this.ids;
  return json;
};

/**
 * Decode the JSON event.
 * @param {!Object} json JSON representation.
 */
Blockly.Events.WorkspaceCommentCreate.prototype.fromJson = function(json) {
  Blockly.Events.WorkspaceCommentCreate.superClass_.fromJson.call(this, json);
  this.xml = Blockly.Xml.textToDom('<xml>' + json['xml'] + '</xml>').firstChild;
  this.ids = json['ids'];
};

/**
 * Run a creation event.
 * @param {boolean} forward True if run forward, false if run backward (undo).
 */
Blockly.Events.WorkspaceCommentCreate.prototype.run = function(forward) {
  var workspace = this.getEventWorkspace_();
  if (forward) {
    var xml = goog.dom.createDom('xml');
    xml.appendChild(this.xml);
    Blockly.Xml.domToWorkspace(xml, workspace);
  }
};
