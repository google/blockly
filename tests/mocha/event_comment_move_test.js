/**
 * @license
 * Copyright 2022 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  sharedTestSetup,
  sharedTestTeardown,
} from './test_helpers/setup_teardown.js';

suite('Comment Move Event', function () {
  setup(function () {
    sharedTestSetup.call(this);
    this.workspace = new Blockly.Workspace();
  });

  teardown(function () {
    sharedTestTeardown.call(this);
  });

  suite('Serialization', function () {
    test('events round-trip through JSON', function () {
      const comment = new Blockly.WorkspaceComment(
        this.workspace,
        'test text',
        10,
        10,
      );
      const origEvent = new Blockly.Events.CommentMove(comment);
      comment.moveBy(10, 10);
      origEvent.recordNew();

      const json = origEvent.toJson();
      const newEvent = new Blockly.Events.fromJson(json, this.workspace);
      delete origEvent.comment_; // Ignore private properties.
      delete newEvent.comment_; // Ignore private properties.

      chai.assert.deepEqual(newEvent, origEvent);
    });
  });
});
