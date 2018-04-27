/**
 * @license
 * Blockly Tests
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
'use strict';

goog.require('goog.testing');

var workspace;

function workspaceCommentTest_setUp() {
  workspace = new Blockly.Workspace();
}

function workspaceCommentTest_tearDown() {
  workspace.dispose();
}

function test_noWorkspaceComments() {
  workspaceCommentTest_setUp();
  try {
    assertEquals('Empty workspace: no comments (1).', 0, workspace.getTopComments(true).length);
    assertEquals('Empty workspace: no comments (2).', 0, workspace.getTopComments(false).length);
    workspace.clear();
    assertEquals('Empty workspace: no comments (3).', 0, workspace.getTopComments(true).length);
    assertEquals('Empty workspace: no comments (4).', 0, workspace.getTopComments(false).length);
  } finally {
    workspaceCommentTest_tearDown();
  }
}

function test_oneWorkspaceComment() {
  workspaceCommentTest_setUp();
  try {
    var comment = new Blockly.WorkspaceComment(workspace, 'comment text', 0, 0, 'comment id');
    assertEquals('One comment on workspace (1).', 1, workspace.getTopComments(true).length);
    assertEquals('One comment on workspace  (2).', 1, workspace.getTopComments(false).length);
    assertEquals('Comment db contains this comment.', comment, workspace.commentDB_['comment id']);
    workspace.clear();
    assertEquals('Cleared workspace: no comments (3).', 0, workspace.getTopComments(true).length);
    assertEquals('Cleared workspace: no comments (4).', 0, workspace.getTopComments(false).length);
    assertFalse('Comment DB does not contain this comment.', 'comment id' in workspace.commentDB_);
  } finally {
    workspaceCommentTest_tearDown();
  }
}

function test_getWorkspaceCommentById() {
  workspaceCommentTest_setUp();
  try {
    var comment = new Blockly.WorkspaceComment(workspace, 'comment text', 0, 0, 'comment id');
    assertEquals('Getting a comment by id.', comment, workspace.getCommentById('comment id'));
    assertEquals('No comment found.', null, workspace.getCommentById('not a comment'));
    comment.dispose();
    assertEquals('Can\'t find the comment.', null, workspace.getCommentById('comment id'));
  } finally {
    workspaceCommentTest_tearDown();
  }
}

function test_disposeWsCommentTwice() {
  workspaceCommentTest_setUp();
  try {
    var comment = new Blockly.WorkspaceComment(workspace, 'comment text', 0, 0, 'comment id');
    comment.dispose();
    // Nothing should go wrong the second time dispose is called.
    comment.dispose();
  }finally {
    workspaceCommentTest_tearDown();
  }
}
