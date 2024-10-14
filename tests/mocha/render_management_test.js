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
        getRelativeToSurfaceXY: () => ({x: 0, y: 0}),
        updateComponentLocations: () => {},
        bumpNeighbours: () => {},
        initialized: true,
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

  suite('triggering queued renders', function () {
    function createMockBlock(ws) {
      return {
        hasRendered: false,
        renderEfficiently: function () {
          this.hasRendered = true;
        },

        // All of the APIs the render management system needs.
        getParent: () => null,
        getChildren: () => [],
        isDisposed: () => false,
        getRelativeToSurfaceXY: () => ({x: 0, y: 0}),
        updateComponentLocations: () => {},
        bumpNeighbours: () => {},
        initialized: true,
        workspace: ws || createMockWorkspace(),
      };
    }

    function createMockWorkspace() {
      return {
        resizeContents: () => {},
      };
    }

    test('triggering queued renders rerenders blocks', function () {
      const block = createMockBlock();
      Blockly.renderManagement.queueRender(block);

      Blockly.renderManagement.triggerQueuedRenders();

      chai.assert.isTrue(block.hasRendered, 'Expected block to be rendered');
    });

    test('triggering queued renders rerenders blocks in all workspaces', function () {
      const workspace1 = createMockWorkspace();
      const workspace2 = createMockWorkspace();
      const block1 = createMockBlock(workspace1);
      const block2 = createMockBlock(workspace2);
      Blockly.renderManagement.queueRender(block1);
      Blockly.renderManagement.queueRender(block2);

      Blockly.renderManagement.triggerQueuedRenders();

      chai.assert.isTrue(block1.hasRendered, 'Expected block1 to be rendered');
      chai.assert.isTrue(block2.hasRendered, 'Expected block2 to be rendered');
    });

    test('triggering queued renders in one workspace does not rerender blocks in another workspace', function () {
      const workspace1 = createMockWorkspace();
      const workspace2 = createMockWorkspace();
      const block1 = createMockBlock(workspace1);
      const block2 = createMockBlock(workspace2);
      Blockly.renderManagement.queueRender(block1);
      Blockly.renderManagement.queueRender(block2);

      Blockly.renderManagement.triggerQueuedRenders(workspace1);

      chai.assert.isTrue(block1.hasRendered, 'Expected block1 to be rendered');
      chai.assert.isFalse(
        block2.hasRendered,
        'Expected block2 to not be rendered',
      );
    });
  });
});
