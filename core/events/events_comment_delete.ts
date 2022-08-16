/**
 * Copyright 2018 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Class for comment deletion event.
 *
 * @class
 */
import * as goog from '../../closure/goog/goog.js';
goog.declareModuleId('Blockly.Events.CommentDelete');

import * as registry from '../registry.js';
import type {WorkspaceComment} from '../workspace_comment.js';

import {CommentBase} from './events_comment_base.js';
import * as eventUtils from './utils.js';


/**
 * Class for a comment deletion event.
 *
 * @alias Blockly.Events.CommentDelete
 */
export class CommentDelete extends CommentBase {
  override type: string;
  xml: AnyDuringMigration;

  /**
   * @param opt_comment The deleted comment.
   *     Undefined for a blank event.
   */
  constructor(opt_comment?: WorkspaceComment) {
    super(opt_comment);

    /** Type of this event. */
    this.type = eventUtils.COMMENT_DELETE;

    if (!opt_comment) {
      return;  // Blank event to be populated by fromJson.
    }

    this.xml = opt_comment.toXmlWithXY();
  }
  // TODO (#1266): "Full" and "minimal" serialization.
  /**
   * Encode the event as JSON.
   *
   * @returns JSON representation.
   */
  override toJson(): AnyDuringMigration {
    const json = super.toJson();
    return json;
  }

  /**
   * Decode the JSON event.
   *
   * @param json JSON representation.
   */
  override fromJson(json: AnyDuringMigration) {
    super.fromJson(json);
  }

  /**
   * Run a creation event.
   *
   * @param forward True if run forward, false if run backward (undo).
   */
  override run(forward: boolean) {
    CommentBase.CommentCreateDeleteHelper(this, !forward);
  }
}

registry.register(
    registry.Type.EVENT, eventUtils.COMMENT_DELETE, CommentDelete);
