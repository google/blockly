/**
 * @license
 * Copyright 2022 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

goog.declareModuleId('Blockly.test.insertionMarkerManager');

import {sharedTestSetup, sharedTestTeardown} from './test_helpers/setup_teardown.js';
import {defineRowBlock, defineStackBlock} from './test_helpers/block_definitions.js';

suite('Insertion marker manager', function() {
  setup(function() {
    sharedTestSetup.call(this);
    defineRowBlock();
    defineStackBlock();
    this.workspace = Blockly.inject('blocklyDiv');
  });
  teardown(function() {
    sharedTestTeardown.call(this);
  });

  suite('Creating markers', function() {
    function createBlocksAndManager(workspace, state) {
      Blockly.serialization.workspaces.load(state, workspace);
      const block = workspace.getBlockById('first');
      const manager = new Blockly.InsertionMarkerManager(block);
      return manager;
    }

    test('One stack block', function() {
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
      chai.assert.equal(markers.length, 1);
    });

    test('Two stack blocks', function() {
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
      chai.assert.equal(markers.length, 2);
    });

    test('Three stack blocks', function() {
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
      chai.assert.equal(markers.length, 2);
    });

    test('One value block', function() {
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
      chai.assert.equal(markers.length, 1);
    });

    test('Two value blocks', function() {
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
      chai.assert.equal(markers.length, 1);
    });
  });

  suite('Would delete block', function() {
    setup(function() {
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
    });

    function stubComponentManager(workspace) {
      const componentManager = workspace.getComponentManager();
      const stub = sinon.stub(componentManager, 'hasCapability');
      return stub;
    }

    test('Over delete area: accepted', function() {
      const dxy = new Blockly.utils.Coordinate(0, 0);
      const stub = stubComponentManager(this.workspace);
      stub.withArgs('fakeDragTarget',
        Blockly.ComponentManager.Capability.DELETE_AREA).returns(true);
      const fakeDragTarget = {
        wouldDelete: sinon.fake.returns(true),
        id: 'fakeDragTarget',
      };
      this.manager.update(dxy, fakeDragTarget);
      chai.assert.isTrue(this.manager.wouldDeleteBlock());
      chai.assert.isTrue(fakeDragTarget.wouldDelete.called);
    });

    test('Over delete area: rejected', function() {
      const dxy = new Blockly.utils.Coordinate(0, 0);
      const stub = stubComponentManager(this.workspace);
      stub.withArgs('fakeDragTarget',
        Blockly.ComponentManager.Capability.DELETE_AREA).returns(true);
      const fakeDragTarget = {
        wouldDelete: sinon.fake.returns(false),
        id: 'fakeDragTarget',
      };
      this.manager.update(dxy, fakeDragTarget);
      chai.assert.isFalse(this.manager.wouldDeleteBlock());
      chai.assert.isTrue(fakeDragTarget.wouldDelete.called);
    });

    test('Drag target is not a delete area', function() {
      const dxy = new Blockly.utils.Coordinate(0, 0);
      const stub = stubComponentManager(this.workspace);
      stub.withArgs('fakeDragTarget',
        Blockly.ComponentManager.Capability.DELETE_AREA).returns(false);
      const fakeDragTarget = {
        wouldDelete: sinon.fake.returns(false),
        id: 'fakeDragTarget',
      };
      this.manager.update(dxy, fakeDragTarget);
      chai.assert.isFalse(this.manager.wouldDeleteBlock());
      chai.assert.isFalse(fakeDragTarget.wouldDelete.called);
    });

    test('Not over drag target', function() {
      const dxy = new Blockly.utils.Coordinate(0, 0);
      this.manager.update(dxy, null);
      chai.assert.isFalse(this.manager.wouldDeleteBlock());
    });
  });

  suite('Would connect stack blocks', function() {
    setup(function() {
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

    test('No other blocks nearby', function() {
      this.manager.update(new Blockly.utils.Coordinate(0, 0), null);
      chai.assert.isFalse(this.manager.wouldConnectBlock());
    });

    test('Near other block: above', function() {
      this.manager.update(new Blockly.utils.Coordinate(200, 190), null);
      chai.assert.isTrue(this.manager.wouldConnectBlock());
      const markers = this.manager.getInsertionMarkers();
      chai.assert.equal(markers.length, 1);
      const marker = markers[0];
      chai.assert.isTrue(marker.nextConnection.isConnected());
    });

    test('Near other block: below', function() {
      this.manager.update(new Blockly.utils.Coordinate(200, 210), null);
      chai.assert.isTrue(this.manager.wouldConnectBlock());
      const markers = this.manager.getInsertionMarkers();
      chai.assert.equal(markers.length, 1);
      const marker = markers[0];
      chai.assert.isTrue(marker.previousConnection.isConnected());
    });

    test('Near other block: left', function() {
      this.manager.update(new Blockly.utils.Coordinate(190, 200), null);
      chai.assert.isTrue(this.manager.wouldConnectBlock());
    });

    test('Near other block: right', function() {
      this.manager.update(new Blockly.utils.Coordinate(210, 200), null);
      chai.assert.isTrue(this.manager.wouldConnectBlock());
    });
  });

  suite('Would connect row blocks', function() {
    setup(function() {
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

    test('No other blocks nearby', function() {
      this.manager.update(new Blockly.utils.Coordinate(0, 0), null);
      chai.assert.isFalse(this.manager.wouldConnectBlock());
    });

    test('Near other block: above', function() {
      this.manager.update(new Blockly.utils.Coordinate(200, 190), null);
      chai.assert.isTrue(this.manager.wouldConnectBlock());
    });

    test('Near other block: below', function() {
      this.manager.update(new Blockly.utils.Coordinate(200, 210), null);
      chai.assert.isTrue(this.manager.wouldConnectBlock());
    });

    test('Near other block: left', function() {
      this.manager.update(new Blockly.utils.Coordinate(190, 200), null);
      chai.assert.isTrue(this.manager.wouldConnectBlock());
      const markers = this.manager.getInsertionMarkers();
      chai.assert.equal(markers.length, 1);
      const marker = markers[0];
      chai.assert.isTrue(marker.getInput('INPUT').connection.isConnected());
    });

    test('Near other block: right', function() {
      this.manager.update(new Blockly.utils.Coordinate(210, 200), null);
      chai.assert.isTrue(this.manager.wouldConnectBlock());
      const markers = this.manager.getInsertionMarkers();
      chai.assert.equal(markers.length, 1);
      const marker = markers[0];
      chai.assert.isTrue(marker.outputConnection.isConnected());
    });
  });
});
