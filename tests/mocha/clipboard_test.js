/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  sharedTestSetup,
  sharedTestTeardown,
} from './test_helpers/setup_teardown.js';
import {
  assertEventFired,
  createChangeListenerSpy,
} from './test_helpers/events.js';

suite('Clipboard', function () {
  setup(function () {
    this.clock = sharedTestSetup.call(this, {fireEventsNow: false}).clock;
    this.workspace = Blockly.inject('blocklyDiv');
  });

  teardown(function () {
    sharedTestTeardown.call(this);
  });

  test('a paster registered with a given type is called when pasting that type', function () {
    const paster = {
      paste: sinon.stub().returns(null),
    };
    Blockly.clipboard.registry.register('test-paster', paster);

    Blockly.clipboard.paste({paster: 'test-paster'}, this.workspace);
    chai.assert.isTrue(paster.paste.calledOnce);

    Blockly.clipboard.registry.unregister('test-paster');
  });

  suite('pasting blocks', function () {
    test('pasting blocks fires a create event', function () {
      const eventSpy = createChangeListenerSpy(this.workspace);
      const block = Blockly.serialization.blocks.append(
        {
          'type': 'controls_if',
          'id': 'blockId',
        },
        this.workspace,
      );
      const data = block.toCopyData();
      this.clock.runAll();
      eventSpy.resetHistory();

      Blockly.clipboard.paste(data, this.workspace);
      this.clock.runAll();

      assertEventFired(
        eventSpy,
        Blockly.Events.BlockCreate,
        {'recordUndo': true, 'type': Blockly.Events.BLOCK_CREATE},
        this.workspace.id,
      );
    });

    suite('pasted blocks are placed in unambiguous locations', function () {
      test('pasted blocks are bumped to not overlap', function () {
        const block = Blockly.serialization.blocks.append(
          {
            'type': 'controls_if',
            'x': 38,
            'y': 13,
          },
          this.workspace,
        );
        const data = block.toCopyData();

        const newBlock = Blockly.clipboard.paste(data, this.workspace);
        chai.assert.deepEqual(
          newBlock.getRelativeToSurfaceXY(),
          new Blockly.utils.Coordinate(66, 69),
        );
      });

      test('pasted blocks are bumped to be outside the connection snap radius', function () {
        Blockly.serialization.workspaces.load(
          {
            'blocks': {
              'languageVersion': 0,
              'blocks': [
                {
                  'type': 'controls_if',
                  'id': 'sourceBlockId',
                  'x': 38,
                  'y': 13,
                },
                {
                  'type': 'logic_compare',
                  'x': 113,
                  'y': 63,
                },
              ],
            },
          },
          this.workspace,
        );
        this.clock.runAll(); // Update the connection DB.
        const data = this.workspace.getBlockById('sourceBlockId').toCopyData();

        const newBlock = Blockly.clipboard.paste(data, this.workspace);
        chai.assert.deepEqual(
          newBlock.getRelativeToSurfaceXY(),
          new Blockly.utils.Coordinate(94, 125),
        );
      });
    });
  });

  suite('pasting comments', function () {
    test('pasted comments are bumped to not overlap', function () {
      Blockly.Xml.domToWorkspace(
        Blockly.utils.xml.textToDom(
          '<xml><comment id="test" x=10 y=10/></xml>',
        ),
        this.workspace,
      );
      const comment = this.workspace.getTopComments(false)[0];
      const data = comment.toCopyData();

      const newComment = Blockly.clipboard.paste(data, this.workspace);
      chai.assert.deepEqual(
        newComment.getRelativeToSurfaceXY(),
        new Blockly.utils.Coordinate(60, 60),
      );
    });
  });
});
