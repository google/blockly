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
import * as goog from '../../closure/goog/goog.js';
goog.declareModuleId('Blockly.Events.CommentCreate');

import * as registry from '../registry.js';
import type {WorkspaceComment} from '../workspace_comment.js';
import * as Xml from '../xml.js';

import {CommentBase, CommentBaseJson} from './events_comment_base.js';
import * as eventUtils from './utils.js';


/**
 * Class for a comment creation event.
 *
 * @alias Blockly.Events.CommentCreate
 */
export class CommentCreate extends CommentBase {
  override type = eventUtils.COMMENT_CREATE;

  xml?: Element|DocumentFragment;

  /**
   * @param opt_comment The created comment.
   *     Undefined for a blank event.
   */
  constructor(opt_comment?: WorkspaceComment) {
    super(opt_comment);

    if (!opt_comment) {
      return;
    }
    // Blank event to be populated by fromJson.
    this.xml = opt_comment.toXmlWithXY();
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
          'the constructor, or call fromJson');
    }
    json['xml'] = Xml.domToText(this.xml);
    return json;
  }

  /**
   * Decode the JSON event.
   *
   * @param json JSON representation.
   */
  override fromJson(json: CommentCreateJson) {
    super.fromJson(json);
    this.xml = Xml.textToDom(json['xml']);
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
}

registry.register(
    registry.Type.EVENT, eventUtils.COMMENT_CREATE, CommentCreate);
