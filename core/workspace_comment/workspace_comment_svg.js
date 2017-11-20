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
 * @fileoverview Object representing a code comment on a rendered workspace.
 * @author fenichel@google.com (Rachel Fenichel)
 */
'use strict';

goog.provide('Blockly.WorkspaceCommentSvg');

goog.require('Blockly.WorkspaceComment');

/**
 * Class for a workspace comment's SVG representation.
 * @extends {Blockly.WorkspaceComment}
 * @constructor
 */
Blockly.WorkspaceCommentSvg = function() {
  console.log('New workspace comment SVG!');
}; goog.inherits(Blockly.WorkspaceCommentSvg, Blockly.WorkspaceComment);


/**
 * Create and initialize the SVG representation of a workspace comment.
 * May be called more than once.
 */
Blockly.WorkspaceCommentSvg.prototype.initSvg = function() {
  // Initialize comment SVG
}

/**
 * Move a comment by a relative offset.
 * @param {number} dx Horizontal offset, in workspace units.
 * @param {number} dy Vertical offset, in workspace units.
 */
Blockly.WorkspaceCommentSvg.prototype.moveBy = function(dx, dy) {
  // Move comment by
}