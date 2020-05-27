/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Object representing a code comment on the workspace.
 * @author fenichel@google.com (Rachel Fenichel)
 */
'use strict';

goog.provide('Blockly.WorkspaceComment');

goog.require('Blockly.Events');
goog.require('Blockly.Events.CommentChange');
goog.require('Blockly.Events.CommentCreate');
goog.require('Blockly.Events.CommentDelete');
goog.require('Blockly.Events.CommentMove');
goog.require('Blockly.utils');
goog.require('Blockly.utils.Coordinate');
goog.require('Blockly.utils.xml');


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

  workspace.addTopComment(this);

  /**
   * The comment's position in workspace units.  (0, 0) is at the workspace's
   * origin; scale does not change this value.
   * @type {!Blockly.utils.Coordinate}
   * @protected
   */
  this.xy_ = new Blockly.utils.Coordinate(0, 0);

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

  /**
   * @type {!Blockly.Workspace}
   */
  this.workspace = workspace;

  /**
   * @protected
   * @type {boolean}
   */
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

  /**
   * @type {boolean}
   * @private
   */
  this.editable_ = true;

  /**
   * @protected
   * @type {string}
   */
  this.content_ = content;

  /**
   * @package
   * @type {boolean}
   */
  this.isComment = true;

  Blockly.WorkspaceComment.fireCreateEvent(this);
};

/**
 * Dispose of this comment.
 * @package
 */
Blockly.WorkspaceComment.prototype.dispose = function() {
  if (!this.workspace) {
    // The comment has already been deleted.
    return;
  }

  if (Blockly.Events.isEnabled()) {
    Blockly.Events.fire(new Blockly.Events.CommentDelete(this));
  }

  // Remove from the list of top comments and the comment database.
  this.workspace.removeTopComment(this);
  this.workspace = null;
};

// Height, width, x, and y are all stored on even non-rendered comments, to
// preserve state if you pass the contents through a headless workspace.

/**
 * Get comment height.
 * @return {number} Comment height.
 * @package
 */
Blockly.WorkspaceComment.prototype.getHeight = function() {
  return this.height_;
};

/**
 * Set comment height.
 * @param {number} height Comment height.
 * @package
 */
Blockly.WorkspaceComment.prototype.setHeight = function(height) {
  this.height_ = height;
};

/**
 * Get comment width.
 * @return {number} Comment width.
 * @package
 */
Blockly.WorkspaceComment.prototype.getWidth = function() {
  return this.width_;
};

/**
 * Set comment width.
 * @param {number} width comment width.
 * @package
 */
Blockly.WorkspaceComment.prototype.setWidth = function(width) {
  this.width_ = width;
};

/**
 * Get stored location.
 * @return {!Blockly.utils.Coordinate} The comment's stored location.
 *   This is not valid if the comment is currently being dragged.
 * @package
 */
Blockly.WorkspaceComment.prototype.getXY = function() {
  return new Blockly.utils.Coordinate(this.xy_.x, this.xy_.y);
};

/**
 * Move a comment by a relative offset.
 * @param {number} dx Horizontal offset, in workspace units.
 * @param {number} dy Vertical offset, in workspace units.
 * @package
 */
Blockly.WorkspaceComment.prototype.moveBy = function(dx, dy) {
  var event = new Blockly.Events.CommentMove(this);
  this.xy_.translate(dx, dy);
  event.recordNew();
  Blockly.Events.fire(event);
};

/**
 * Get whether this comment is deletable or not.
 * @return {boolean} True if deletable.
 * @package
 */
Blockly.WorkspaceComment.prototype.isDeletable = function() {
  return this.deletable_ &&
      !(this.workspace && this.workspace.options.readOnly);
};

/**
 * Set whether this comment is deletable or not.
 * @param {boolean} deletable True if deletable.
 * @package
 */
Blockly.WorkspaceComment.prototype.setDeletable = function(deletable) {
  this.deletable_ = deletable;
};

/**
 * Get whether this comment is movable or not.
 * @return {boolean} True if movable.
 * @package
 */
Blockly.WorkspaceComment.prototype.isMovable = function() {
  return this.movable_ &&
      !(this.workspace && this.workspace.options.readOnly);
};

/**
 * Set whether this comment is movable or not.
 * @param {boolean} movable True if movable.
 * @package
 */
Blockly.WorkspaceComment.prototype.setMovable = function(movable) {
  this.movable_ = movable;
};

/**
 * Get whether this comment is editable or not.
 * @return {boolean} True if editable.
 */
Blockly.WorkspaceComment.prototype.isEditable = function() {
  return this.editable_ &&
      !(this.workspace && this.workspace.options.readOnly);
};

/**
 * Set whether this comment is editable or not.
 * @param {boolean} editable True if editable.
 */
Blockly.WorkspaceComment.prototype.setEditable = function(editable) {
  this.editable_ = editable;
};

/**
 * Returns this comment's text.
 * @return {string} Comment text.
 * @package
 */
Blockly.WorkspaceComment.prototype.getContent = function() {
  return this.content_;
};

/**
 * Set this comment's content.
 * @param {string} content Comment content.
 * @package
 */
Blockly.WorkspaceComment.prototype.setContent = function(content) {
  if (this.content_ != content) {
    Blockly.Events.fire(
        new Blockly.Events.CommentChange(this, this.content_, content));
    this.content_ = content;
  }
};

/**
 * Encode a comment subtree as XML with XY coordinates.
 * @param {boolean=} opt_noId True if the encoder should skip the comment ID.
 * @return {!Element} Tree of XML elements.
 * @package
 */
Blockly.WorkspaceComment.prototype.toXmlWithXY = function(opt_noId) {
  var element = this.toXml(opt_noId);
  element.setAttribute('x', Math.round(this.xy_.x));
  element.setAttribute('y', Math.round(this.xy_.y));
  element.setAttribute('h', this.height_);
  element.setAttribute('w', this.width_);
  return element;
};

/**
 * Encode a comment subtree as XML, but don't serialize the XY coordinates.
 * This method avoids some expensive metrics-related calls that are made in
 * toXmlWithXY().
 * @param {boolean=} opt_noId True if the encoder should skip the comment ID.
 * @return {!Element} Tree of XML elements.
 * @package
 */
Blockly.WorkspaceComment.prototype.toXml = function(opt_noId) {
  var commentElement = Blockly.utils.xml.createElement('comment');
  if (!opt_noId) {
    commentElement.id = this.id;
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
 * @package
 */
Blockly.WorkspaceComment.fromXml = function(xmlComment, workspace) {
  var info = Blockly.WorkspaceComment.parseAttributes(xmlComment);

  var comment = new Blockly.WorkspaceComment(
      workspace, info.content, info.h, info.w, info.id);

  var commentX = parseInt(xmlComment.getAttribute('x'), 10);
  var commentY = parseInt(xmlComment.getAttribute('y'), 10);
  if (!isNaN(commentX) && !isNaN(commentY)) {
    comment.moveBy(commentX, commentY);
  }

  Blockly.WorkspaceComment.fireCreateEvent(comment);
  return comment;
};

/**
 * Decode an XML comment tag and return the results in an object.
 * @param {!Element} xml XML comment element.
 * @return {{w: number, h: number, x: number, y: number, content: string}} An
 *     object containing the id, size, position, and comment string.
 * @package
 */
Blockly.WorkspaceComment.parseAttributes = function(xml) {
  var xmlH = xml.getAttribute('h');
  var xmlW = xml.getAttribute('w');

  return {
    // @type {string}
    id: xml.getAttribute('id'),
    // The height of the comment in workspace units, or 100 if not specified.
    // @type {number}
    h: xmlH ? parseInt(xmlH, 10) : 100,
    // The width of the comment in workspace units, or 100 if not specified.
    // @type {number}
    w: xmlW ? parseInt(xmlW, 10) : 100,
    // The x position of the comment in workspace coordinates, or NaN if not
    // specified in the XML.
    // @type {number}
    x: parseInt(xml.getAttribute('x'), 10),
    // The y position of the comment in workspace coordinates, or NaN if not
    // specified in the XML.
    // @type {number}
    y: parseInt(xml.getAttribute('y'), 10),
    // @type {string}
    content: xml.textContent
  };
};
