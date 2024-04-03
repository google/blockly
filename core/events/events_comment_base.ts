/**
 * @license
 * Copyright 2018 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Base class for comment events.
 *
 * @class
 */
// Former goog.module ID: Blockly.Events.CommentBase

import * as utilsXml from '../utils/xml.js';
import type {WorkspaceComment} from '../workspace_comment.js';
import * as Xml from '../xml.js';

import {
  Abstract as AbstractEvent,
  AbstractEventJson,
} from './events_abstract.js';
import type {CommentCreate} from './events_comment_create.js';
import type {CommentDelete} from './events_comment_delete.js';
import * as eventUtils from './utils.js';
import type {Workspace} from '../workspace.js';

/**
 * Abstract class for a comment event.
 */
export class CommentBase extends AbstractEvent {
  override isBlank = true;

  /** The ID of the comment that this event references. */
  commentId?: string;

  /**
   * @param opt_comment The comment this event corresponds to.  Undefined for a
   *     blank event.
   */
  constructor(opt_comment?: WorkspaceComment) {
    super();
    /** Whether or not an event is blank. */
    this.isBlank = !opt_comment;

    if (!opt_comment) return;

    this.commentId = opt_comment.id;
    this.workspaceId = opt_comment.workspace.id;
    this.group = eventUtils.getGroup();
    this.recordUndo = eventUtils.getRecordUndo();
  }

  /**
   * Encode the event as JSON.
   *
   * @returns JSON representation.
   */
  override toJson(): CommentBaseJson {
    const json = super.toJson() as CommentBaseJson;
    if (!this.commentId) {
      throw new Error(
        'The comment ID is undefined. Either pass a comment to ' +
          'the constructor, or call fromJson',
      );
    }
    json['commentId'] = this.commentId;
    return json;
  }

  /**
   * Deserializes the JSON event.
   *
   * @param event The event to append new properties to. Should be a subclass
   *     of CommentBase, but we can't specify that due to the fact that
   *     parameters to static methods in subclasses must be supertypes of
   *     parameters to static methods in superclasses.
   * @internal
   */
  static fromJson(
    json: CommentBaseJson,
    workspace: Workspace,
    event?: any,
  ): CommentBase {
    const newEvent = super.fromJson(
      json,
      workspace,
      event ?? new CommentBase(),
    ) as CommentBase;
    newEvent.commentId = json['commentId'];
    return newEvent;
  }

  /**
   * Helper function for Comment[Create|Delete]
   *
   * @param event The event to run.
   * @param create if True then Create, if False then Delete
   */
  static CommentCreateDeleteHelper(
    event: CommentCreate | CommentDelete,
    create: boolean,
  ) {
    const workspace = event.getEventWorkspace_();
    if (create) {
      const xmlElement = utilsXml.createElement('xml');
      if (!event.xml) {
        throw new Error('Ecountered a comment event without proper xml');
      }
      xmlElement.appendChild(event.xml);
      Xml.domToWorkspace(xmlElement, workspace);
    } else {
      if (!event.commentId) {
        throw new Error(
          'The comment ID is undefined. Either pass a comment to ' +
            'the constructor, or call fromJson',
        );
      }
      const comment = workspace.getCommentById(event.commentId);
      if (comment) {
        comment.dispose();
      } else {
        // Only complain about root-level block.
        console.warn("Can't uncreate non-existent comment: " + event.commentId);
      }
    }
  }
}

export interface CommentBaseJson extends AbstractEventJson {
  commentId: string;
}
