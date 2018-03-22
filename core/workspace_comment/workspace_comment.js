/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2017 Google Inc.
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
 * @fileoverview Object representing a code comment on the workspace.
 * @author fenichel@google.com (Rachel Fenichel)
 */
'use strict';

goog.provide('Blockly.WorkspaceComment');

goog.require('Blockly.Events.CommentCreate');

/**
 * Class for a workspace comment.
 * @param {!Blockly.Workspace} workspace The block's workspace.
 * @param {string} content The content of this workspace comment.
 * @param {number} height Height of the comment.
 * @param {number} width Width of the comment.
 * @param {string=} opt_id Optional ID.  Use this ID if provided, otherwise
 *     create a new ID.
 * @constructor
 */
Blockly.WorkspaceComment = function(workspace, content, height, width, opt_id) {
  /** @type {string} */
  this.id = (opt_id && !workspace.getCommentById(opt_id)) ?
      opt_id : Blockly.utils.genUid();

  workspace.addCommentById(this);
  workspace.addTopComment(this);

  /**
   * The comment's position in workspace units.  (0, 0) is at the workspace's
   * origin; scale does not change this value.
   * @type {!goog.math.Coordinate}
   * @private
   */
  this.xy_ = new goog.math.Coordinate(0, 0);

  /**
   * The comment's height in workspace units.  Scale does not change this value.
   * @type {number}
   * @private
   */
  this.height_ = height;

  /**
   * The comment's width in workspace units.  Scale does not change this value.
   * @type {number}
   * @private
   */
  this.width_ = width;

  /** @type {!Blockly.Workspace} */
  this.workspace = workspace;

  /** @type {boolean} */
  this.RTL = workspace.RTL;

  /**
   * @type {boolean}
   * @private
   */
  this.deletable_ = true;

  /**
   * @type {boolean}
   * @private
   */
  this.movable_ = true;

  /** @type {!string} */
  this.content_ = content;

  /** @type {boolean} */
  this.isComment = true;

  Blockly.WorkspaceComment.fireCreateEvent(this);
};

/**
 * Dispose of this comment.
 * @public
 */
Blockly.WorkspaceComment.prototype.dispose = function() {
  if (!this.workspace) {
    // The comment has already been deleted.
    return;
  }

  if (Blockly.Events.isEnabled()) {
    Blockly.Events.fire(new Blockly.Events.CommentDelete(this));
  }

  // Remove from the list of top comments.
  this.workspace.removeTopComment(this);
  // Remove from the comment DB.
  this.workspace.removeCommentById(this.id);
  this.workspace = null;
};


/**
 * Return the coordinates of the top-left corner of this comment relative to the
 * drawing surface's origin (0,0), in workspace units.
 * @return {!goog.math.Coordinate} Object with .x and .y properties.
 */
Blockly.WorkspaceComment.prototype.getRelativeToSurfaceXY = function() {
  return this.xy_;
};

/**
 * Move a comment by a relative offset.
 * @param {number} dx Horizontal offset, in workspace units.
 * @param {number} dy Vertical offset, in workspace units.
 */
Blockly.WorkspaceComment.prototype.moveBy = function(dx, dy) {
  // TODO (#1580): Fire an event for move
  this.xy_.translate(dx, dy);
};

/**
 * Get whether this comment is deletable or not.
 * @return {boolean} True if deletable.
 */
Blockly.WorkspaceComment.prototype.isDeletable = function() {
  return this.deletable_ &&
      !(this.workspace && this.workspace.options.readOnly);
};

/**
 * Set whether this comment is deletable or not.
 * @param {boolean} deletable True if deletable.
 */
Blockly.WorkspaceComment.prototype.setDeletable = function(deletable) {
  this.deletable_ = deletable;
};

/**
 * Get whether this comment is movable or not.
 * @return {boolean} True if movable.
 */
Blockly.WorkspaceComment.prototype.isMovable = function() {
  return this.movable_ &&
      !(this.workspace && this.workspace.options.readOnly);
};

/**
 * Set whether this comment is movable or not.
 * @param {boolean} movable True if movable.
 */
Blockly.WorkspaceComment.prototype.setMovable = function(movable) {
  this.movable_ = movable;
};

/**
 * Returns this comment's text.
 * @return {string} Comment text.
 */
Blockly.WorkspaceComment.prototype.getContent = function() {
  return this.content_;
};

/**
 * Set this comment's content.
 * @param {string} content Comment content.
 */
Blockly.WorkspaceComment.prototype.setContent = function(content) {
  if (this.content_ != content) {
    // TODO (#1580): Fire a event for change
    this.text_ = content;
  }
};

/**
 * Encode a comment subtree as XML with XY coordinates.
 * @param {boolean} opt_noId True if the encoder should skip the comment id.
 * @return {!Element} Tree of XML elements.
 */
Blockly.WorkspaceComment.prototype.toXmlWithXY = function(opt_noId) {
  var width;  // Not used in LTR.
  if (this.workspace.RTL) {
    // Here be performance dragons: On a rendered workspace, this will call
    // getMetrics().
    width = this.workspace.getWidth();
  }
  var element = this.toXml(opt_noId);
  var xy = this.getRelativeToSurfaceXY();
  element.setAttribute('x',
      Math.round(this.workspace.RTL ? width - xy.x : xy.x));
  element.setAttribute('y', Math.round(xy.y));
  element.setAttribute('h', this.getHeight());
  element.setAttribute('w', this.getWidth());
  return element;
};

/**
 * Encode a comment subtree as XML, but don't serialize the XY coordinates.
 * This method avoids some expensive metrics-related calls that are made in
 * toXmlWithXY().
 * @param {boolean} opt_noId True if the encoder should skip the comment id.
 * @return {!Element} Tree of XML elements.
 * @package
 */
Blockly.WorkspaceComment.prototype.toXml = function(opt_noId) {
  var commentElement = goog.dom.createDom('comment');
  if (!opt_noId) {
    commentElement.setAttribute('id', this.id);
  }
  commentElement.textContent = this.getContent();
  return commentElement;
};

/**
 * Fire a create event for the given workspace comment, if comments are enabled.
 * @param {!Blockly.WorkspaceComment} comment The comment that was just created.
 * @package
 */
Blockly.WorkspaceComment.fireCreateEvent = function(comment) {
  if (Blockly.Events.isEnabled()) {
    var existingGroup = Blockly.Events.getGroup();
    if (!existingGroup) {
      Blockly.Events.setGroup(true);
    }
    try {
      Blockly.Events.fire(new Blockly.Events.CommentCreate(comment));
    } finally {
      if (!existingGroup) {
        Blockly.Events.setGroup(false);
      }
    }
  }
};

/**
 * Decode an XML comment tag and create a comment on the workspace.
 * @param {!Element} xmlComment XML comment element.
 * @param {!Blockly.Workspace} workspace The workspace.
 * @return {!Blockly.WorkspaceComment} The created workspace comment.
 * @public
 */
Blockly.WorkspaceComment.fromXml = function(xmlComment, workspace) {
  var comment = null;
  var id = xmlComment.getAttribute('id');
  var h = parseInt(xmlComment.getAttribute('h'), 10);
  var w = parseInt(xmlComment.getAttribute('w'), 10);
  var content = xmlComment.textContent;

  comment = workspace.newComment(content, h, w, id);
  Blockly.WorkspaceComment.fireCreateEvent(comment);
  return comment;
};
