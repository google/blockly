/**
 * @license
 * Copyright 2022 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {assert} from '../../node_modules/chai/chai.js';
import {
  defineRowBlock,
  defineRowToStackBlock,
  defineStackBlock,
} from './test_helpers/block_definitions.js';
import {
  sharedTestSetup,
  sharedTestTeardown,
} from './test_helpers/setup_teardown.js';

suite('Insertion marker manager', function () {
  setup(function () {
    sharedTestSetup.call(this);
    defineRowBlock();
    defineStackBlock();
    defineRowToStackBlock();
    this.workspace = Blockly.inject('blocklyDiv');
  });
  teardown(function () {
    sharedTestTeardown.call(this);
  });

  suite('Creating markers', function () {
    function createBlocksAndManager(workspace, state) {
      Blockly.serialization.workspaces.load(state, workspace);
      const block = workspace.getBlockById('first');
      const manager = new Blockly.InsertionMarkerManager(block);
      return manager;
    }

    test('One stack block creates one marker', function () {
      const state = {
        'blocks': {
          'blocks': [
            {
              'type': 'stack_block',
              'id': 'first',
            },
          ],
        },
      };
      const manager = createBlocksAndManager(this.workspace, state);
      const markers = manager.getInsertionMarkers();
      assert.equal(markers.length, 1);
    });

    test('Two stack blocks create two markers', function () {
      const state = {
        'blocks': {
          'blocks': [
            {
              'type': 'stack_block',
              'id': 'first',
              'next': {
                'block': {
                  'type': 'stack_block',
                  'id': 'second',
                },
              },
            },
          ],
        },
      };
      const manager = createBlocksAndManager(this.workspace, state);
      const markers = manager.getInsertionMarkers();
      assert.equal(markers.length, 2);
    });

    test('Three stack blocks create two markers', function () {
      const state = {
        'blocks': {
          'blocks': [
            {
              'type': 'stack_block',
              'id': 'first',
              'next': {
                'block': {
                  'type': 'stack_block',
                  'id': 'second',
                  'next': {
                    'block': {
                      'type': 'stack_block',
                      'id': 'third',
                    },
                  },
                },
              },
            },
          ],
        },
      };
      const manager = createBlocksAndManager(this.workspace, state);
      const markers = manager.getInsertionMarkers();
      assert.equal(markers.length, 2);
    });

    test('One value block creates one marker', function () {
      const state = {
        'blocks': {
          'blocks': [
            {
              'type': 'row_block',
              'id': 'first',
            },
          ],
        },
      };
      const manager = createBlocksAndManager(this.workspace, state);
      const markers = manager.getInsertionMarkers();
      assert.equal(markers.length, 1);
    });

    test('Two value blocks create one marker', function () {
      const state = {
        'blocks': {
          'blocks': [
            {
              'type': 'row_block',
              'id': 'first',
              'inputs': {
                'INPUT': {
                  'block': {
                    'type': 'row_block',
                    'id': 'second',
                  },
                },
              },
            },
          ],
        },
      };
      const manager = createBlocksAndManager(this.workspace, state);
      const markers = manager.getInsertionMarkers();
      assert.equal(markers.length, 1);
    });

    test('One row to stack block creates one marker', function () {
      const state = {
        'blocks': {
          'blocks': [
            {
              'type': 'row_to_stack_block',
              'id': 'first',
            },
          ],
        },
      };
      const manager = createBlocksAndManager(this.workspace, state);
      const markers = manager.getInsertionMarkers();
      assert.equal(markers.length, 1);
    });

    test('Row to stack block with child creates two markers', function () {
      const state = {
        'blocks': {
          'blocks': [
            {
              'type': 'row_to_stack_block',
              'id': 'first',
              'next': {
                'block': {
                  'type': 'stack_block',
                  'id': 'second',
                },
              },
            },
          ],
        },
      };
      const manager = createBlocksAndManager(this.workspace, state);
      const markers = manager.getInsertionMarkers();
      assert.equal(markers.length, 2);
    });

    suite('children being set as insertion markers', function () {
      setup(function () {
        Blockly.Blocks['shadows_in_init'] = {
          init: function () {
            this.appendValueInput('test').connection.setShadowState({
              'type': 'math_number',
            });
            this.setPreviousStatement(true);
          },
        };

        Blockly.Blocks['shadows_in_load'] = {
          init: function () {
            this.appendValueInput('test');
            this.setPreviousStatement(true);
          },

          loadExtraState: function () {
            this.getInput('test').connection.setShadowState({
              'type': 'math_number',
            });
          },

          saveExtraState: function () {
            return true;
          },
        };
      });

      teardown(function () {
        delete Blockly.Blocks['shadows_in_init'];
        delete Blockly.Blocks['shadows_in_load'];
      });

      test('Shadows added in init are set as insertion markers', function () {
        const state = {
          'blocks': {
            'blocks': [
              {
                'id': 'first',
                'type': 'shadows_in_init',
              },
            ],
          },
        };
        const manager = createBlocksAndManager(this.workspace, state);
        const markers = manager.getInsertionMarkers();
        assert.isTrue(
          markers[0].getChildren()[0].isInsertionMarker(),
          'Expected the shadow block to be an insertion maker',
        );
      });

      test('Shadows added in `loadExtraState` are set as insertion markers', function () {
        const state = {
          'blocks': {
            'blocks': [
              {
                'id': 'first',
                'type': 'shadows_in_load',
              },
            ],
          },
        };
        const manager = createBlocksAndManager(this.workspace, state);
        const markers = manager.getInsertionMarkers();
        assert.isTrue(
          markers[0].getChildren()[0].isInsertionMarker(),
          'Expected the shadow block to be an insertion maker',
        );
      });
    });
  });

  suite('Would delete block', function () {
    setup(function () {
      const state = {
        'blocks': {
          'blocks': [
            {
              'type': 'stack_block',
              'id': 'first',
            },
          ],
        },
      };
      Blockly.serialization.workspaces.load(state, this.workspace);
      this.block = this.workspace.getBlockById('first');
      this.manager = new Blockly.InsertionMarkerManager(this.block);

      const componentManager = this.workspace.getComponentManager();
      this.stub = sinon.stub(componentManager, 'hasCapability');
      this.dxy = new Blockly.utils.Coordinate(0, 0);
    });

    test('Over delete area and accepted would delete', function () {
      this.stub
        .withArgs(
          'fakeDragTarget',
          Blockly.ComponentManager.Capability.DELETE_AREA,
        )
        .returns(true);
      const fakeDragTarget = {
        wouldDelete: sinon.fake.returns(true),
        id: 'fakeDragTarget',
      };
      this.manager.update(this.dxy, fakeDragTarget);
      assert.isTrue(this.manager.wouldDeleteBlock);
    });

    test('Over delete area and rejected would not delete', function () {
      this.stub
        .withArgs(
          'fakeDragTarget',
          Blockly.ComponentManager.Capability.DELETE_AREA,
        )
        .returns(true);
      const fakeDragTarget = {
        wouldDelete: sinon.fake.returns(false),
        id: 'fakeDragTarget',
      };
      this.manager.update(this.dxy, fakeDragTarget);
      assert.isFalse(this.manager.wouldDeleteBlock);
    });

    test('Drag target is not a delete area would not delete', function () {
      this.stub
        .withArgs(
          'fakeDragTarget',
          Blockly.ComponentManager.Capability.DELETE_AREA,
        )
        .returns(false);
      const fakeDragTarget = {
        wouldDelete: sinon.fake.returns(false),
        id: 'fakeDragTarget',
      };
      this.manager.update(this.dxy, fakeDragTarget);
      assert.isFalse(this.manager.wouldDeleteBlock);
    });

    test('Not over drag target would not delete', function () {
      this.manager.update(this.dxy, null);
      assert.isFalse(this.manager.wouldDeleteBlock);
    });
  });

  suite('Would connect stack blocks', function () {
    setup(function () {
      const state = {
        'blocks': {
          'blocks': [
            {
              'type': 'stack_block',
              'id': 'first',
              'x': 0,
              'y': 0,
            },
            {
              'type': 'stack_block',
              'id': 'other',
              'x': 200,
              'y': 200,
            },
          ],
        },
      };
      Blockly.serialization.workspaces.load(state, this.workspace);
      this.block = this.workspace.getBlockById('first');
      this.block.setDragging(true);
      this.manager = new Blockly.InsertionMarkerManager(this.block);
    });

    test('No other blocks nearby would not connect', function () {
      this.manager.update(new Blockly.utils.Coordinate(0, 0), null);
      assert.isFalse(this.manager.wouldConnectBlock());
    });

    test('Near other block and above would connect before', function () {
      this.manager.update(new Blockly.utils.Coordinate(200, 190), null);
      assert.isTrue(this.manager.wouldConnectBlock());
      const markers = this.manager.getInsertionMarkers();
      assert.equal(markers.length, 1);
      const marker = markers[0];
      assert.isTrue(marker.nextConnection.isConnected());
    });

    test('Near other block and below would connect after', function () {
      this.manager.update(new Blockly.utils.Coordinate(200, 210), null);
      assert.isTrue(this.manager.wouldConnectBlock());
      const markers = this.manager.getInsertionMarkers();
      assert.equal(markers.length, 1);
      const marker = markers[0];
      assert.isTrue(marker.previousConnection.isConnected());
    });

    test('Near other block and left would connect', function () {
      this.manager.update(new Blockly.utils.Coordinate(190, 200), null);
      assert.isTrue(this.manager.wouldConnectBlock());
    });

    test('Near other block and right would connect', function () {
      this.manager.update(new Blockly.utils.Coordinate(210, 200), null);
      assert.isTrue(this.manager.wouldConnectBlock());
    });
  });

  suite('Would connect row blocks', function () {
    setup(function () {
      const state = {
        'blocks': {
          'blocks': [
            {
              'type': 'row_block',
              'id': 'first',
              'x': 0,
              'y': 0,
            },
            {
              'type': 'row_block',
              'id': 'other',
              'x': 200,
              'y': 200,
            },
          ],
        },
      };
      Blockly.serialization.workspaces.load(state, this.workspace);
      this.block = this.workspace.getBlockById('first');
      this.block.setDragging(true);
      this.manager = new Blockly.InsertionMarkerManager(this.block);
    });

    test('No other blocks nearby would not connect', function () {
      this.manager.update(new Blockly.utils.Coordinate(0, 0), null);
      assert.isFalse(this.manager.wouldConnectBlock());
    });

    test('Near other block and above would connect', function () {
      this.manager.update(new Blockly.utils.Coordinate(200, 190), null);
      assert.isTrue(this.manager.wouldConnectBlock());
    });

    test('Near other block and below would connect', function () {
      this.manager.update(new Blockly.utils.Coordinate(200, 210), null);
      assert.isTrue(this.manager.wouldConnectBlock());
    });

    test('Near other block and left would connect before', function () {
      this.manager.update(new Blockly.utils.Coordinate(190, 200), null);
      assert.isTrue(this.manager.wouldConnectBlock());
      const markers = this.manager.getInsertionMarkers();
      assert.isTrue(markers[0].getInput('INPUT').connection.isConnected());
    });

    test('Near other block and right would connect after', function () {
      this.manager.update(new Blockly.utils.Coordinate(210, 200), null);
      assert.isTrue(this.manager.wouldConnectBlock());
      const markers = this.manager.getInsertionMarkers();
      assert.isTrue(markers[0].outputConnection.isConnected());
    });
  });
});
