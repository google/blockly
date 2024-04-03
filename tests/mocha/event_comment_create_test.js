/**
 * @license
 * Copyright 2022 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  sharedTestSetup,
  sharedTestTeardown,
} from './test_helpers/setup_teardown.js';

suite('Comment Create Event', function () {
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
      const origEvent = new Blockly.Events.CommentCreate(comment);

      const json = origEvent.toJson();
      const newEvent = new Blockly.Events.fromJson(json, this.workspace);
      delete origEvent.xml; // xml fails deep equals for some reason.
      delete newEvent.xml; // xml fails deep equals for some reason.

      chai.assert.deepEqual(newEvent, origEvent);
    });
  });
});
