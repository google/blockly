/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2017 Google Inc.
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
 * @fileoverview Object representing a code comment on the workspace.
 * @author fenichel@google.com (Rachel Fenichel)
 */
'use strict';

goog.provide('Blockly.WorkspaceComment');

/**
 * Class for a workspace comment.
 * @param {!Blockly.Workspace} workspace The block's workspace.
 * @param {string} content The content of this workspace comment.
 * @param {string=} opt_id Optional ID.  Use this ID if provided, otherwise
 *     create a new ID.
 * @constructor
 */
Blockly.WorkspaceComment = function(workspace, content, opt_id) {
  console.log('New workspace comment!');
  /** @type {string} */
  this.id = (opt_id && !workspace.getCommentById(opt_id)) ?
      opt_id : Blockly.utils.genUid();

  workspace.addCommentById(this);
  workspace.addTopComment(this);

  /**
   * The comment's position in workspace units.  (0, 0) is at the workspace's
   * origin; scale does not change this value.
   * @type {!goog.math.Coordinate}
   * @private
   */
  this.xy_ = new goog.math.Coordinate(0, 0);

  /** @type {!Blockly.Workspace} */
  this.workspace = workspace;

  /** @type {!string} */
  this.content = content;
};

/**
 * Dispose of this comment.
 * @public
 */
Blockly.WorkspaceComment.prototype.dispose = function() {
  if (!this.workspace) {
    // The comment has already been deleted.
    return;
  }

  // TODO: Fire an event for deletion.

  // Remove from the list of top comments.
  this.workspace.removeTopComment(this);
  // Remove from the comment DB.
  this.workspace.removeCommentById(this.id);
  this.workspace = null;
};


/**
 * Return the coordinates of the top-left corner of this comment relative to the
 * drawing surface's origin (0,0), in workspace units.
 * @return {!goog.math.Coordinate} Object with .x and .y properties.
 */
Blockly.WorkspaceComment.prototype.getRelativeToSurfaceXY = function() {
  return this.xy_;
};
