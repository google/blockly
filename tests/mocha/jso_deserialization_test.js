/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

suite('JSO Deserialization', function() {
  setup(function() {
    sharedTestSetup.call(this);
    this.workspace = new Blockly.Workspace();
  });

  teardown(function() {
    workspaceTeardown.call(this, this.workspace);
    sharedTestTeardown.call(this);
  });

  suite('Events', function() {
    test('Finished loading', function() {
      const state = {
        'blocks': {
          'blocks': [
            {
              'type': 'controls_if',
              'id': 'testId',
              'x': 42,
              'y': 42
            },
          ]
        }
      };
      Blockly.serialization.workspaces.load(state, this.workspace);
      assertEventFired(
          this.eventsFireStub,
          Blockly.Events.FinishedLoading,
          {},
          this.workspace.id);
    });

    suite('Var create', function() {
      test('Just var', function() {
        const state = {
          'variables': [
            {
              'name': 'test',
              'id': 'testId',
            }
          ]
        };
        Blockly.serialization.workspaces.load(state, this.workspace);
        assertEventFired(
            this.eventsFireStub,
            Blockly.Events.VarCreate,
            {'varName': 'test', 'varId': 'testId', 'varType': ''},
            this.workspace.id);
      });

      test('Var with block', function() {
        const state = {
          'variables': [
            {
              'name': 'test',
              'id': 'testId',
            }
          ],
          'blocks': {
            'blocks': [
              {
                'type': 'variables_get',
                'id': 'blockId',
                'x': 42,
                'y': 42,
                'fields': {
                  'VAR': 'testId'
                }
              },
            ]
          }
        };
        Blockly.serialization.workspaces.load(state, this.workspace);
        const calls = this.eventsFireStub.getCalls();
        const count = calls.reduce((acc, call) => {
          if (call.args[0] instanceof Blockly.Events.VarCreate) {
            return acc + 1;
          }
          return acc;
        }, 0);
        chai.assert.equal(count, 1);
        assertEventFired(
            this.eventsFireStub,
            Blockly.Events.VarCreate,
            {'varName': 'test', 'varId': 'testId', 'varType': ''},
            this.workspace.id);
      });
    });

    suite('Block create', function() {
      test('No children', function() {
        const state = {
          'blocks': {
            'blocks': [
              {
                'type': 'controls_if',
                'id': 'testId',
                'x': 42,
                'y': 42
              },
            ]
          }
        };
        Blockly.serialization.workspaces.load(state, this.workspace);
        assertEventFired(
            this.eventsFireStub,
            Blockly.Events.BlockCreate,
            {},
            this.workspace.id,
            'testId');
      });

      test('with children', function() {
        const state = {
          'blocks': {
            'blocks': [
              {
                'type': 'controls_if',
                'id': 'id1',
                'x': 42,
                'y': 42,
                'inputs': {
                  'DO0': {
                    'block': {
                      'type': 'controls_if',
                      'id': 'id2'
                    }
                  }
                },
                'next': {
                  'block': {
                    'type': 'controls_if',
                    'id': 'id3'
                  }
                }
              },
            ]
          }
        };
        Blockly.serialization.workspaces.load(state, this.workspace);
        assertEventFired(
            this.eventsFireStub,
            Blockly.Events.BlockCreate,
            {},
            this.workspace.id,
            'id1');
      });
    });
  });
});
