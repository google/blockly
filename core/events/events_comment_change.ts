/**
 * @license
 * Copyright 2018 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Class for comment change event.
 *
 * @class
 */
import * as goog from '../../closure/goog/goog.js';
goog.declareModuleId('Blockly.Events.CommentChange');

import * as registry from '../registry.js';
import type {WorkspaceComment} from '../workspace_comment.js';

import {CommentBase, CommentBaseJson} from './events_comment_base.js';
import * as eventUtils from './utils.js';


/**
 * Class for a comment change event.
 *
 * @alias Blockly.Events.CommentChange
 */
export class CommentChange extends CommentBase {
  override type = eventUtils.COMMENT_CHANGE;
  oldContents_?: string;
  newContents_?: string;

  /**
   * @param opt_comment The comment that is being changed.  Undefined for a
   *     blank event.
   * @param opt_oldContents Previous contents of the comment.
   * @param opt_newContents New contents of the comment.
   */
  constructor(
      opt_comment?: WorkspaceComment, opt_oldContents?: string,
      opt_newContents?: string) {
    super(opt_comment);

    if (!opt_comment) {
      return;  // Blank event to be populated by fromJson.
    }

    this.oldContents_ =
        typeof opt_oldContents === 'undefined' ? '' : opt_oldContents;
    this.newContents_ =
        typeof opt_newContents === 'undefined' ? '' : opt_newContents;
  }

  /**
   * Encode the event as JSON.
   *
   * @returns JSON representation.
   */
  override toJson(): CommentChangeJson {
    const json = super.toJson() as CommentChangeJson;
    if (!this.oldContents_) {
      throw new Error(
          'The old contents is undefined. Either pass a value to ' +
          'the constructor, or call fromJson');
    }
    if (!this.newContents_) {
      throw new Error(
          'The new contents is undefined. Either pass a value to ' +
          'the constructor, or call fromJson');
    }
    json['oldContents'] = this.oldContents_;
    json['newContents'] = this.newContents_;
    return json;
  }

  /**
   * Decode the JSON event.
   *
   * @param json JSON representation.
   */
  override fromJson(json: CommentChangeJson) {
    super.fromJson(json);
    this.oldContents_ = json['oldContents'];
    this.newContents_ = json['newContents'];
  }

  /**
   * Does this event record any change of state?
   *
   * @returns False if something changed.
   */
  override isNull(): boolean {
    return this.oldContents_ === this.newContents_;
  }

  /**
   * Run a change event.
   *
   * @param forward True if run forward, false if run backward (undo).
   */
  override run(forward: boolean) {
    const workspace = this.getEventWorkspace_();
    if (!this.commentId) {
      throw new Error(
          'The comment ID is undefined. Either pass a comment to ' +
          'the constructor, or call fromJson');
    }
    const comment = workspace.getCommentById(this.commentId);
    if (!comment) {
      console.warn('Can\'t change non-existent comment: ' + this.commentId);
      return;
    }
    const contents = forward ? this.newContents_ : this.oldContents_;
    if (!contents) {
      if (forward) {
        throw new Error(
            'The new contents is undefined. Either pass a value to ' +
            'the constructor, or call fromJson');
      }
      throw new Error(
          'The old contents is undefined. Either pass a value to ' +
          'the constructor, or call fromJson');
    }
    comment.setContent(contents);
  }
}

export interface CommentChangeJson extends CommentBaseJson {
  oldContents: string;
  newContents: string;
}

registry.register(
    registry.Type.EVENT, eventUtils.COMMENT_CHANGE, CommentChange);
