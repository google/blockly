/**
 * @license
 * Copyright 2017 Google LLC
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
  } finally {
    workspaceCommentTest_tearDown();
  }
}

function test_wsCommentHeightWidth() {
  workspaceCommentTest_setUp();
  try {
    var comment =
        new Blockly.WorkspaceComment(workspace, 'comment text', 10, 20, 'comment id');
    assertEquals('Initial width', 20, comment.getWidth());
    assertEquals('Initial height', 10, comment.getHeight());

    comment.setWidth(30);
    assertEquals('New width should be different', 30, comment.getWidth());
    assertEquals('New height should not be different', 10, comment.getHeight());

    comment.setHeight(40);
    assertEquals('New width should not be different', 30, comment.getWidth());
    assertEquals('New height should be different', 40, comment.getHeight());
    comment.dispose();
  } finally {
    workspaceCommentTest_tearDown();
  }
}

function test_wsCommentXY() {
  workspaceCommentTest_setUp();
  try {
    var comment =
        new Blockly.WorkspaceComment(workspace, 'comment text', 10, 20, 'comment id');
    var xy = comment.getXY();
    assertEquals('Initial X position', 0, xy.x);
    assertEquals('Initial Y position', 0, xy.y);

    comment.moveBy(10, 100);
    xy = comment.getXY();
    assertEquals('New X position', 10, xy.x);
    assertEquals('New Y position', 100, xy.y);
    comment.dispose();
  } finally {
    workspaceCommentTest_tearDown();
  }
}

function test_wsCommentContent() {
  workspaceCommentTest_setUp();

  Blockly.Events.fire = temporary_fireEvent;
  temporary_fireEvent.firedEvents_ = [];
  try {
    var comment =
        new Blockly.WorkspaceComment(workspace, 'comment text', 10, 20, 'comment id');
    assertEquals(
        'Check comment text', 'comment text', comment.getContent());
    assertEquals(
        'Workspace undo stack has one event', 1, workspace.undoStack_.length);

    comment.setContent('comment text');
    assertEquals(
        'Comment text has not changed', 'comment text', comment.getContent());
    // Setting the text to the old value does not fire an event.
    assertEquals(
        'Workspace undo stack has one event', 1, workspace.undoStack_.length);

    comment.setContent('new comment text');
    assertEquals(
        'Comment text has changed', 'new comment text', comment.getContent());
    assertEquals(
        'Workspace undo stack has two events', 2, workspace.undoStack_.length);
    comment.dispose();
  } finally {
    workspaceCommentTest_tearDown();
    Blockly.Events.fire = savedFireFunc;
  }
}
