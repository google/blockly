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
import * as goog from '../../closure/goog/goog.js';
goog.declareModuleId('Blockly.Events.CommentBase');

import * as utilsXml from '../utils/xml.js';
import type {WorkspaceComment} from '../workspace_comment.js';
import * as Xml from '../xml.js';

import {Abstract as AbstractEvent, AbstractEventJson} from './events_abstract.js';
import type {CommentCreate} from './events_comment_create.js';
import type {CommentDelete} from './events_comment_delete.js';
import * as eventUtils from './utils.js';


/**
 * Abstract class for a comment event.
 *
 * @alias Blockly.Events.CommentBase
 */
export class CommentBase extends AbstractEvent {
  override isBlank: boolean;
  commentId: string;
  override workspaceId: string;

  /**
   * @param opt_comment The comment this event corresponds to.  Undefined for a
   *     blank event.
   */
  constructor(opt_comment?: WorkspaceComment) {
    super();
    /** Whether or not an event is blank. */
    this.isBlank = typeof opt_comment === 'undefined';

    /** The ID of the comment this event pertains to. */
    this.commentId = this.isBlank ? '' : opt_comment!.id;

    /** The workspace identifier for this event. */
    this.workspaceId = this.isBlank ? '' : opt_comment!.workspace.id;

    /**
     * The event group ID for the group this event belongs to. Groups define
     * events that should be treated as an single action from the user's
     * perspective, and should be undone together.
     */
    this.group = eventUtils.getGroup();

    /** Sets whether the event should be added to the undo stack. */
    this.recordUndo = eventUtils.getRecordUndo();
  }

  /**
   * Encode the event as JSON.
   *
   * @returns JSON representation.
   */
  override toJson(): CommentBaseJson {
    const json = super.toJson() as CommentBaseJson;
    if (this.commentId) {
      json['commentId'] = this.commentId;
    }
    return json;
  }

  /**
   * Decode the JSON event.
   *
   * @param json JSON representation.
   */
  override fromJson(json: CommentBaseJson) {
    super.fromJson(json);
    this.commentId = json['commentId'] || '';
  }

  /**
   * Helper function for Comment[Create|Delete]
   *
   * @param event The event to run.
   * @param create if True then Create, if False then Delete
   */
  static CommentCreateDeleteHelper(
      event: CommentCreate|CommentDelete, create: boolean) {
    const workspace = event.getEventWorkspace_();
    if (create) {
      const xmlElement = utilsXml.createElement('xml');
      xmlElement.appendChild(event.xml);
      Xml.domToWorkspace(xmlElement, workspace);
    } else {
      const comment = workspace.getCommentById(event.commentId);
      if (comment) {
        comment.dispose();
      } else {
        // Only complain about root-level block.
        console.warn(
            'Can\'t uncreate non-existent comment: ' + event.commentId);
      }
    }
  }
}

export interface CommentBaseJson extends AbstractEventJson {
  commentId?: string;
}
