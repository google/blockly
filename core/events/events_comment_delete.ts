/** @fileoverview Class for comment deletion event. */


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
 * Class for comment deletion event.
 * @class
 */

import * as registry from '../registry';
/* eslint-disable-next-line no-unused-vars */
import { WorkspaceComment } from '../workspace_comment';

import { CommentBase } from './events_comment_base';
import * as eventUtils from './utils';


/**
 * Class for a comment deletion event.
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
      return;
    }
    // Blank event to be populated by fromJson.
    this.xml = opt_comment.toXmlWithXY();
  }
  // TODO (#1266): "Full" and "minimal" serialization.
  /**
   * Encode the event as JSON.
   * @return JSON representation.
   */
  override toJson(): AnyDuringMigration {
    const json = super.toJson();
    return json;
  }

  /**
   * Decode the JSON event.
   * @param json JSON representation.
   */
  override fromJson(json: AnyDuringMigration) {
    super.fromJson(json);
  }

  /**
   * Run a creation event.
   * @param forward True if run forward, false if run backward (undo).
   */
  override run(forward: boolean) {
    CommentBase.CommentCreateDeleteHelper(this, !forward);
  }
}

registry.register(
  registry.Type.EVENT, eventUtils.COMMENT_DELETE, CommentDelete);
