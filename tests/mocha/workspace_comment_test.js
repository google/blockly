/**
 * @license
 * Copyright 2024 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  sharedTestSetup,
  sharedTestTeardown,
} from './test_helpers/setup_teardown.js';
import {
  createChangeListenerSpy,
  assertEventFired,
} from './test_helpers/events.js';

suite('Workspace comment', function () {
  setup(function () {
    sharedTestSetup.call(this);
    this.workspace = new Blockly.inject('blocklyDiv', {});
  });

  teardown(function () {
    sharedTestTeardown.call(this);
  });

  suite('Events', function () {
    test('create events are fired when a comment is constructed', function () {
      const spy = createChangeListenerSpy(this.workspace);

      this.renderedComment = new Blockly.comments.RenderedWorkspaceComment(
        this.workspace,
      );

      assertEventFired(
        spy,
        Blockly.Events.CommentCreate,
        {commentId: this.renderedComment.id},
        this.workspace.id,
      );
    });

    test('delete events are fired when a comment is disposed', function () {
      this.renderedComment = new Blockly.comments.RenderedWorkspaceComment(
        this.workspace,
      );
      const spy = createChangeListenerSpy(this.workspace);

      this.renderedComment.dispose();

      assertEventFired(
        spy,
        Blockly.Events.CommentDelete,
        {commentId: this.renderedComment.id},
        this.workspace.id,
      );
    });
  });
});
