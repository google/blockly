/** @fileoverview Class for comment change event. */


/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2018 Google Inc.
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
 * @license
 * Copyright 2018 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */


/**
 * Class for comment change event.
 * @class
 */

import * as registry from '../registry';
/* eslint-disable-next-line no-unused-vars */
import { WorkspaceComment } from '../workspace_comment';

import { CommentBase } from './events_comment_base';
import * as eventUtils from './utils';


/**
 * Class for a comment change event.
 * @alias Blockly.Events.CommentChange
 */
export class CommentChange extends CommentBase {
  override type: string;

  // TODO(b/109816955): remove '!', see go/strict-prop-init-fix.
  oldContents_!: string;
  // TODO(b/109816955): remove '!', see go/strict-prop-init-fix.
  newContents_!: string;

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

    /** Type of this event. */
    this.type = eventUtils.COMMENT_CHANGE;

    if (!opt_comment) {
      return;
    }
    // Blank event to be populated by fromJson.
    this.oldContents_ =
      typeof opt_oldContents === 'undefined' ? '' : opt_oldContents;
    this.newContents_ =
      typeof opt_newContents === 'undefined' ? '' : opt_newContents;
  }

  /**
   * Encode the event as JSON.
   * @return JSON representation.
   */
  override toJson(): AnyDuringMigration {
    const json = super.toJson();
    json['oldContents'] = this.oldContents_;
    json['newContents'] = this.newContents_;
    return json;
  }

  /**
   * Decode the JSON event.
   * @param json JSON representation.
   */
  override fromJson(json: AnyDuringMigration) {
    super.fromJson(json);
    this.oldContents_ = json['oldContents'];
    this.newContents_ = json['newContents'];
  }

  /**
   * Does this event record any change of state?
   * @return False if something changed.
   */
  override isNull(): boolean {
    return this.oldContents_ === this.newContents_;
  }

  /**
   * Run a change event.
   * @param forward True if run forward, false if run backward (undo).
   */
  override run(forward: boolean) {
    const workspace = this.getEventWorkspace_();
    const comment = workspace.getCommentById(this.commentId);
    if (!comment) {
      console.warn('Can\'t change non-existent comment: ' + this.commentId);
      return;
    }
    const contents = forward ? this.newContents_ : this.oldContents_;

    comment.setContent(contents);
  }
}

registry.register(
  registry.Type.EVENT, eventUtils.COMMENT_CHANGE, CommentChange);
