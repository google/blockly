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

    test('move events are fired when a comment is moved', function () {
      this.renderedComment = new Blockly.comments.RenderedWorkspaceComment(
        this.workspace,
      );
      const spy = createChangeListenerSpy(this.workspace);

      this.renderedComment.moveTo(new Blockly.utils.Coordinate(42, 42));

      assertEventFired(
        spy,
        Blockly.Events.CommentMove,
        {
          commentId: this.renderedComment.id,
          oldCoordinate_: {x: 0, y: 0},
          newCoordinate_: {x: 42, y: 42},
        },
        this.workspace.id,
      );
    });

    test('change events are fired when a comments text is edited', function () {
      this.renderedComment = new Blockly.comments.RenderedWorkspaceComment(
        this.workspace,
      );
      const spy = createChangeListenerSpy(this.workspace);

      this.renderedComment.setText('test text');

      assertEventFired(
        spy,
        Blockly.Events.CommentChange,
        {
          commentId: this.renderedComment.id,
          oldContents_: '',
          newContents_: 'test text',
        },
        this.workspace.id,
      );
    });

    test('collapse events are fired when a comment is collapsed', function () {
      this.renderedComment = new Blockly.comments.RenderedWorkspaceComment(
        this.workspace,
      );
      const spy = createChangeListenerSpy(this.workspace);

      this.renderedComment.setCollapsed(true);

      assertEventFired(
        spy,
        Blockly.Events.CommentCollapse,
        {
          commentId: this.renderedComment.id,
          newCollapsed: true,
        },
        this.workspace.id,
      );
    });

    test('collapse events are fired when a comment is uncollapsed', function () {
      this.renderedComment = new Blockly.comments.RenderedWorkspaceComment(
        this.workspace,
      );
      this.renderedComment.setCollapsed(true);
      const spy = createChangeListenerSpy(this.workspace);

      this.renderedComment.setCollapsed(false);

      assertEventFired(
        spy,
        Blockly.Events.CommentCollapse,
        {
          commentId: this.renderedComment.id,
          newCollapsed: false,
        },
        this.workspace.id,
      );
    });
  });
});
