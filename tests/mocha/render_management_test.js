/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  sharedTestSetup,
  sharedTestTeardown,
} from './test_helpers/setup_teardown.js';

suite('Render Management', function () {
  setup(function () {
    this.clock = sharedTestSetup.call(this).clock;
  });

  teardown(function () {
    sharedTestTeardown.call(this);
  });

  suite('finish queued renders callback', function () {
    function createMockBlock() {
      return {
        hasRendered: false,
        renderEfficiently: function () {
          this.hasRendered = true;
        },

        // All of the APIs the render management system needs.
        getParent: () => null,
        getChildren: () => [],
        isDisposed: () => false,
        getConnections_: () => [],
        getRelativeToSurfaceXY: () => ({x: 0, y: 0}),
        workspace: {
          resizeContents: () => {},
        },
      };
    }

    test('the queueRender promise is properly resolved after rendering', function () {
      const block = createMockBlock();
      const promise = Blockly.renderManagement.queueRender(block).then(() => {
        chai.assert.isTrue(block.hasRendered, 'Expected block to be rendered');
      });
      this.clock.runAll();
      return promise;
    });

    test('the finish queued renders promise is properly resolved after rendering', function () {
      const block = createMockBlock();
      Blockly.renderManagement.queueRender(block);
      const promise = Blockly.renderManagement.finishQueuedRenders(() => {
        chai.assert.isTrue(block.hasRendered, 'Expected block to be rendered');
      });
      this.clock.runAll();
      return promise;
    });
  });
});
