/**
 * @license
 * Copyright 2024 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Class for comment resize event.
 *
 * @class
 */

import * as registry from '../registry.js';
import {Size} from '../utils/size.js';
import type {WorkspaceComment} from '../comments/workspace_comment.js';

import {CommentBase, CommentBaseJson} from './events_comment_base.js';
import * as eventUtils from './utils.js';
import type {Workspace} from '../workspace.js';

/**
 * Notifies listeners that a workspace comment has resized.
 */
export class CommentResize extends CommentBase {
  override type = eventUtils.COMMENT_RESIZE;

  /** The size of the comment before the resize. */
  oldSize?: Size;

  /** The size of the comment after the resize. */
  newSize?: Size;

  /**
   * @param opt_comment The comment that is being resized. Undefined for a blank
   *     event.
   */
  constructor(opt_comment?: WorkspaceComment) {
    super(opt_comment);

    if (!opt_comment) {
      return; // Blank event to be populated by fromJson.
    }

    this.oldSize = opt_comment.getSize();
  }

  /**
   * Record the comment's new size. Called after the resize. Can only be
   * called once.
   */
  recordNew() {
    if (this.newSize) {
      throw Error(
        'Tried to record the new size of a comment on the ' +
          'same event twice.',
      );
    }
    const workspace = this.getEventWorkspace_();
    if (!this.commentId) {
      throw new Error(
        'The comment ID is undefined. Either pass a comment to ' +
          'the constructor, or call fromJson',
      );
    }
    const comment = workspace.getCommentById(this.commentId);
    if (!comment) {
      throw new Error(
        'The comment associated with the comment resize event ' +
          'could not be found',
      );
    }
    this.newSize = comment.getSize();
  }

  /**
   * Encode the event as JSON.
   *
   * @returns JSON representation.
   */
  override toJson(): CommentResizeJson {
    const json = super.toJson() as CommentResizeJson;
    if (!this.oldSize) {
      throw new Error(
        'The old comment size is undefined. Either pass a comment to ' +
          'the constructor, or call fromJson',
      );
    }
    if (!this.newSize) {
      throw new Error(
        'The new comment size is undefined. Either call recordNew, or ' +
          'call fromJson',
      );
    }
    json['oldSize'] =
      `${Math.round(this.oldSize.width)}, ${Math.round(this.oldSize.height)}`;
    json['newSize'] =
      `${Math.round(this.newSize.width)}, ${Math.round(this.newSize.height)}`;
    return json;
  }

  /**
   * Deserializes the JSON event.
   *
   * @param event The event to append new properties to. Should be a subclass
   *     of CommentResize, but we can't specify that due to the fact that
   *     parameters to static methods in subclasses must be supertypes of
   *     parameters to static methods in superclasses.
   * @internal
   */
  static fromJson(
    json: CommentResizeJson,
    workspace: Workspace,
    event?: any,
  ): CommentResize {
    const newEvent = super.fromJson(
      json,
      workspace,
      event ?? new CommentResize(),
    ) as CommentResize;
    let dimensions = json['oldSize'].split(',');
    newEvent.oldSize = new Size(Number(dimensions[0]), Number(dimensions[1]));
    dimensions = json['newSize'].split(',');
    newEvent.newSize = new Size(Number(dimensions[0]), Number(dimensions[1]));
    return newEvent;
  }

  /**
   * Does this event record any change of state?
   *
   * @returns False if something changed.
   */
  override isNull(): boolean {
    return Size.equals(this.oldSize, this.newSize);
  }

  /**
   * Run a resize event.
   *
   * @param forward True if run forward, false if run backward (undo).
   */
  override run(forward: boolean) {
    const workspace = this.getEventWorkspace_();
    if (!this.commentId) {
      throw new Error(
        'The comment ID is undefined. Either pass a comment to ' +
          'the constructor, or call fromJson',
      );
    }
    const comment = workspace.getCommentById(this.commentId);
    if (!comment) {
      console.warn("Can't resize non-existent comment: " + this.commentId);
      return;
    }

    const size = forward ? this.newSize : this.oldSize;
    if (!size) {
      throw new Error(
        'Either oldSize or newSize is undefined. ' +
          'Either pass a comment to the constructor and call recordNew, ' +
          'or call fromJson',
      );
    }
    comment.setSize(size);
  }
}

export interface CommentResizeJson extends CommentBaseJson {
  oldSize: string;
  newSize: string;
}

registry.register(
  registry.Type.EVENT,
  eventUtils.COMMENT_RESIZE,
  CommentResize,
);
