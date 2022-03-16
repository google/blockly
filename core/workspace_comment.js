/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Object representing a code comment on the workspace.
 */
'use strict';

/**
 * Object representing a code comment on the workspace.
 * @class
 */
goog.module('Blockly.WorkspaceComment');

const eventUtils = goog.require('Blockly.Events.utils');
const idGenerator = goog.require('Blockly.utils.idGenerator');
const xml = goog.require('Blockly.utils.xml');
const {Coordinate} = goog.require('Blockly.utils.Coordinate');
/* eslint-disable-next-line no-unused-vars */
const {CommentMove} = goog.require('Blockly.Events.CommentMove');
/* eslint-disable-next-line no-unused-vars */
const {Workspace} = goog.requireType('Blockly.Workspace');
/** @suppress {extraRequire} */
goog.require('Blockly.Events.CommentChange');
/** @suppress {extraRequire} */
goog.require('Blockly.Events.CommentCreate');
/** @suppress {extraRequire} */
goog.require('Blockly.Events.CommentDelete');


/**
 * Class for a workspace comment.
 * @alias Blockly.WorkspaceComment
 */
class WorkspaceComment {
  /**
   * @param {!Workspace} workspace The block's workspace.
   * @param {string} content The content of this workspace comment.
   * @param {number} height Height of the comment.
   * @param {number} width Width of the comment.
   * @param {string=} opt_id Optional ID.  Use this ID if provided, otherwise
   *     create a new ID.
   */
  constructor(workspace, content, height, width, opt_id) {
    /** @type {string} */
    this.id = (opt_id && !workspace.getCommentById(opt_id)) ?
        opt_id :
        idGenerator.genUid();

    workspace.addTopComment(this);

    /**
     * The comment's position in workspace units.  (0, 0) is at the workspace's
     * origin; scale does not change this value.
     * @type {!Coordinate}
     * @protected
     */
    this.xy_ = new Coordinate(0, 0);

    /**
     * The comment's height in workspace units.  Scale does not change this
     * value.
     * @type {number}
     * @protected
     */
    this.height_ = height;

    /**
     * The comment's width in workspace units.  Scale does not change this
     * value.
     * @type {number}
     * @protected
     */
    this.width_ = width;

    /**
     * @type {!Workspace}
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
     * Whether this comment has been disposed.
     * @protected
     * @type {boolean}
     */
    this.disposed_ = false;

    /**
     * @package
     * @type {boolean}
     */
    this.isComment = true;

    WorkspaceComment.fireCreateEvent(this);
  }

  /**
   * Dispose of this comment.
   * @package
   */
  dispose() {
    if (this.disposed_) {
      return;
    }

    if (eventUtils.isEnabled()) {
      eventUtils.fire(new (eventUtils.get(eventUtils.COMMENT_DELETE))(this));
    }

    // Remove from the list of top comments and the comment database.
    this.workspace.removeTopComment(this);
    this.disposed_ = true;
  }

  // Height, width, x, and y are all stored on even non-rendered comments, to
  // preserve state if you pass the contents through a headless workspace.

  /**
   * Get comment height.
   * @return {number} Comment height.
   * @package
   */
  getHeight() {
    return this.height_;
  }

  /**
   * Set comment height.
   * @param {number} height Comment height.
   * @package
   */
  setHeight(height) {
    this.height_ = height;
  }

  /**
   * Get comment width.
   * @return {number} Comment width.
   * @package
   */
  getWidth() {
    return this.width_;
  }

  /**
   * Set comment width.
   * @param {number} width comment width.
   * @package
   */
  setWidth(width) {
    this.width_ = width;
  }

  /**
   * Get stored location.
   * @return {!Coordinate} The comment's stored location.
   *   This is not valid if the comment is currently being dragged.
   * @package
   */
  getXY() {
    return new Coordinate(this.xy_.x, this.xy_.y);
  }

  /**
   * Move a comment by a relative offset.
   * @param {number} dx Horizontal offset, in workspace units.
   * @param {number} dy Vertical offset, in workspace units.
   * @package
   */
  moveBy(dx, dy) {
    const event = /** @type {!CommentMove} */ (
        new (eventUtils.get(eventUtils.COMMENT_MOVE))(this));
    this.xy_.translate(dx, dy);
    event.recordNew();
    eventUtils.fire(event);
  }

  /**
   * Get whether this comment is deletable or not.
   * @return {boolean} True if deletable.
   * @package
   */
  isDeletable() {
    return this.deletable_ &&
        !(this.workspace && this.workspace.options.readOnly);
  }

  /**
   * Set whether this comment is deletable or not.
   * @param {boolean} deletable True if deletable.
   * @package
   */
  setDeletable(deletable) {
    this.deletable_ = deletable;
  }

  /**
   * Get whether this comment is movable or not.
   * @return {boolean} True if movable.
   * @package
   */
  isMovable() {
    return this.movable_ &&
        !(this.workspace && this.workspace.options.readOnly);
  }

  /**
   * Set whether this comment is movable or not.
   * @param {boolean} movable True if movable.
   * @package
   */
  setMovable(movable) {
    this.movable_ = movable;
  }

  /**
   * Get whether this comment is editable or not.
   * @return {boolean} True if editable.
   */
  isEditable() {
    return this.editable_ &&
        !(this.workspace && this.workspace.options.readOnly);
  }

  /**
   * Set whether this comment is editable or not.
   * @param {boolean} editable True if editable.
   */
  setEditable(editable) {
    this.editable_ = editable;
  }

  /**
   * Returns this comment's text.
   * @return {string} Comment text.
   * @package
   */
  getContent() {
    return this.content_;
  }

  /**
   * Set this comment's content.
   * @param {string} content Comment content.
   * @package
   */
  setContent(content) {
    if (this.content_ !== content) {
      eventUtils.fire(new (eventUtils.get(eventUtils.COMMENT_CHANGE))(
          this, this.content_, content));
      this.content_ = content;
    }
  }

  /**
   * Encode a comment subtree as XML with XY coordinates.
   * @param {boolean=} opt_noId True if the encoder should skip the comment ID.
   * @return {!Element} Tree of XML elements.
   * @package
   */
  toXmlWithXY(opt_noId) {
    const element = this.toXml(opt_noId);
    element.setAttribute('x', Math.round(this.xy_.x));
    element.setAttribute('y', Math.round(this.xy_.y));
    element.setAttribute('h', this.height_);
    element.setAttribute('w', this.width_);
    return element;
  }

  /**
   * Encode a comment subtree as XML, but don't serialize the XY coordinates.
   * This method avoids some expensive metrics-related calls that are made in
   * toXmlWithXY().
   * @param {boolean=} opt_noId True if the encoder should skip the comment ID.
   * @return {!Element} Tree of XML elements.
   * @package
   */
  toXml(opt_noId) {
    const commentElement = xml.createElement('comment');
    if (!opt_noId) {
      commentElement.id = this.id;
    }
    commentElement.textContent = this.getContent();
    return commentElement;
  }

  /**
   * Fire a create event for the given workspace comment, if comments are
   * enabled.
   * @param {!WorkspaceComment} comment The comment that was just created.
   * @package
   */
  static fireCreateEvent(comment) {
    if (eventUtils.isEnabled()) {
      const existingGroup = eventUtils.getGroup();
      if (!existingGroup) {
        eventUtils.setGroup(true);
      }
      try {
        eventUtils.fire(
            new (eventUtils.get(eventUtils.COMMENT_CREATE))(comment));
      } finally {
        if (!existingGroup) {
          eventUtils.setGroup(false);
        }
      }
    }
  }

  /**
   * Decode an XML comment tag and create a comment on the workspace.
   * @param {!Element} xmlComment XML comment element.
   * @param {!Workspace} workspace The workspace.
   * @return {!WorkspaceComment} The created workspace comment.
   * @package
   */
  static fromXml(xmlComment, workspace) {
    const info = WorkspaceComment.parseAttributes(xmlComment);

    const comment =
        new WorkspaceComment(workspace, info.content, info.h, info.w, info.id);

    const commentX = parseInt(xmlComment.getAttribute('x'), 10);
    const commentY = parseInt(xmlComment.getAttribute('y'), 10);
    if (!isNaN(commentX) && !isNaN(commentY)) {
      comment.moveBy(commentX, commentY);
    }

    WorkspaceComment.fireCreateEvent(comment);
    return comment;
  }

  /**
   * Decode an XML comment tag and return the results in an object.
   * @param {!Element} xml XML comment element.
   * @return {{w: number, h: number, x: number, y: number, content: string}} An
   *     object containing the id, size, position, and comment string.
   * @package
   */
  static parseAttributes(xml) {
    const xmlH = xml.getAttribute('h');
    const xmlW = xml.getAttribute('w');

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
      content: xml.textContent,
    };
  }
}

exports.WorkspaceComment = WorkspaceComment;
