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

    function createBlocksAndManager(workspace, state) {
        Blockly.serialization.workspaces.load(state, workspace);
        const block = workspace.getBlockById('first');
        const manager = new Blockly.InsertionMarkerManager(block);
        return manager;
    }

    suite('Create markers', function() {
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
                      'type': 'text_print',
                      'id': 'first',
                      'next': {
                        'block': {
                          'type': 'text_print',
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
                      'type': 'text_print',
                      'id': 'first',
                      'next': {
                        'block': {
                          'type': 'text_print',
                          'id': 'second',
                          'next': {
                            'block': {
                              'type': 'text_print',
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
});
