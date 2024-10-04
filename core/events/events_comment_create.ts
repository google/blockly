/**
 * @license
 * Copyright 2018 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Class for comment creation event.
 *
 * @class
 */
// Former goog.module ID: Blockly.Events.CommentCreate

import * as registry from '../registry.js';
import type {WorkspaceComment} from '../comments/workspace_comment.js';
import * as comments from '../serialization/workspace_comments.js';
import * as utilsXml from '../utils/xml.js';
import * as Xml from '../xml.js';
import {CommentBase, CommentBaseJson} from './events_comment_base.js';
import * as eventUtils from './utils.js';
import type {Workspace} from '../workspace.js';

/**
 * Notifies listeners that a workspace comment was created.
 */
export class CommentCreate extends CommentBase {
  override type = eventUtils.COMMENT_CREATE;

  /** The XML representation of the created workspace comment. */
  xml?: Element | DocumentFragment;

  /** The JSON representation of the created workspace comment. */
  json?: comments.State;

  /**
   * @param opt_comment The created comment.
   *     Undefined for a blank event.
   */
  constructor(opt_comment?: WorkspaceComment) {
    super(opt_comment);

    if (!opt_comment) {
      return; // Blank event to be populated by fromJson.
    }

    this.xml = Xml.saveWorkspaceComment(opt_comment);
    this.json = comments.save(opt_comment, {addCoordinates: true});
  }

  // TODO (#1266): "Full" and "minimal" serialization.
  /**
   * Encode the event as JSON.
   *
   * @returns JSON representation.
   */
  override toJson(): CommentCreateJson {
    const json = super.toJson() as CommentCreateJson;
    if (!this.xml) {
      throw new Error(
        'The comment XML is undefined. Either pass a comment to ' +
          'the constructor, or call fromJson',
      );
    }
    if (!this.json) {
      throw new Error(
        'The comment JSON is undefined. Either pass a block to ' +
          'the constructor, or call fromJson',
      );
    }
    json['xml'] = Xml.domToText(this.xml);
    json['json'] = this.json;
    return json;
  }

  /**
   * Deserializes the JSON event.
   *
   * @param event The event to append new properties to. Should be a subclass
   *     of CommentCreate, but we can't specify that due to the fact that
   *     parameters to static methods in subclasses must be supertypes of
   *     parameters to static methods in superclasses.
   * @internal
   */
  static fromJson(
    json: CommentCreateJson,
    workspace: Workspace,
    event?: any,
  ): CommentCreate {
    const newEvent = super.fromJson(
      json,
      workspace,
      event ?? new CommentCreate(),
    ) as CommentCreate;
    newEvent.xml = utilsXml.textToDom(json['xml']);
    newEvent.json = json['json'];
    return newEvent;
  }

  /**
   * Run a creation event.
   *
   * @param forward True if run forward, false if run backward (undo).
   */
  override run(forward: boolean) {
    CommentBase.CommentCreateDeleteHelper(this, forward);
  }
}

export interface CommentCreateJson extends CommentBaseJson {
  xml: string;
  json: object;
}

registry.register(
  registry.Type.EVENT,
  eventUtils.COMMENT_CREATE,
  CommentCreate,
);
