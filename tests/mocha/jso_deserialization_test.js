/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

suite.only('JSO Deserialization', function() {
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

      test('Explicit group', function() {
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
        Blockly.Events.setGroup('my group');
        Blockly.serialization.load(state, this.workspace);
        assertEventFired(
            this.eventsFireStub,
            Blockly.Events.FinishedLoading,
            {'group': 'my group'},
            this.workspace.id);
      });

<<<<<<< HEAD
      test('Only fire one event with var and var on block', function() {
=======
      test('Automatic group', function() {
>>>>>>> 44418b3d (Add grouping of events)
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
        const group = calls[0].args[0].group;
        chai.assert.isTrue(calls.every(call => call.args[0].group == group));
      });
    });

<<<<<<< HEAD
    suite('Block create', function() {
      test('Simple', function() {
        const state = {
          'blocks': {
            'blocks': [
=======
    suite('Var create', function() {
      suite('Top-level call', function() {
        test('Just var', function() {
          const state = {
            'variables': [
>>>>>>> 44418b3d (Add grouping of events)
              {
                'name': 'test',
                'id': 'testId',
              }
            ]
          };
          Blockly.serialization.load(state, this.workspace);
          assertEventFired(
              this.eventsFireStub,
              Blockly.Events.VarCreate,
              {
                'varName': 'test',
                'varId': 'testId',
                'varType': '',
                'recordUndo': false
              },
              this.workspace.id);
        });

        test('Record undo', function() {
          const state = {
            'variables': [
              {
                'name': 'test',
                'id': 'testId',
              }
            ]
<<<<<<< HEAD
          }
        };
        Blockly.serialization.workspaces.load(state, this.workspace);
        assertEventFired(
            this.eventsFireStub,
            Blockly.Events.BlockCreate,
            {'recordUndo': false},
            this.workspace.id,
            'testId');
      });
=======
          };
          Blockly.serialization.load(state, this.workspace, {recordUndo: true});
          assertEventFired(
              this.eventsFireStub,
              Blockly.Events.VarCreate,
              {
                'varName': 'test',
                'varId': 'testId',
                'varType': '',
                'recordUndo': true
              },
              this.workspace.id);
        });
>>>>>>> 44418b3d (Add grouping of events)

        test('Grouping', function() {
          const state = {
            'variables': [
              {
                'name': 'test',
                'id': 'testId',
              }
            ]
          };
          Blockly.Events.setGroup('my group');
          Blockly.serialization.load(state, this.workspace);
          assertEventFired(
              this.eventsFireStub,
              Blockly.Events.VarCreate,
              {
                'varName': 'test',
                'varId': 'testId',
                'varType': '',
                'group': 'my group'
              },
              this.workspace.id);
        });

        test('Multiple vars grouped', function() {
          const state = {
            'variables': [
              {
                'name': 'test',
                'id': 'testId',
              },
              {
                'name': 'test2',
                'id': 'testId2',
              }
            ]
          };
          Blockly.serialization.load(state, this.workspace);
          const calls = this.eventsFireStub.getCalls();
          const group = calls[0].args[0].group;
          chai.assert.isTrue(calls.every(call => call.args[0].group == group));
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
          Blockly.serialization.load(state, this.workspace);
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

<<<<<<< HEAD
      test('Only fire event for top block', function() {
        const state = {
          'blocks': {
            'blocks': [
=======
      suite('Direct call', function() {
        test('Just var', function() {
          const state = {
            'name': 'test',
            'id': 'testId',
          };
          Blockly.serialization.variables.load(state, this.workspace);
          assertEventFired(
              this.eventsFireStub,
              Blockly.Events.VarCreate,
>>>>>>> 44418b3d (Add grouping of events)
              {
                'varName': 'test',
                'varId': 'testId',
                'varType': '',
                'recordUndo': false
              },
              this.workspace.id);
        });

        test('Record undo', function() {
          const state = {
            'name': 'test',
            'id': 'testId',
          };
          Blockly.serialization.variables
              .load(state, this.workspace, {recordUndo: true});
          assertEventFired(
              this.eventsFireStub,
              Blockly.Events.VarCreate,
              {
                'varName': 'test',
                'varId': 'testId',
                'varType': '',
                'recordUndo': true
              },
              this.workspace.id);
        });

        test('Grouping', function() {
          const state = {
            'name': 'test',
            'id': 'testId',
          };
          Blockly.Events.setGroup('my group');
          Blockly.serialization.variables.load(state, this.workspace);
          assertEventFired(
              this.eventsFireStub,
              Blockly.Events.VarCreate,
              {
                'varName': 'test',
                'varId': 'testId',
                'varType': '',
                'group': 'my group'
              },
              this.workspace.id);
        });
      });
    });

    suite('Block create', function() {
      suite('Top-level call', function() {
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
          Blockly.serialization.load(state, this.workspace);
          assertEventFired(
              this.eventsFireStub,
              Blockly.Events.BlockCreate,
              {'recordUndo': false},
              this.workspace.id,
              'testId');
        });

        test('Record undo', function() {
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
          Blockly.serialization.load(state, this.workspace, {'recordUndo': true});
          assertEventFired(
              this.eventsFireStub,
              Blockly.Events.BlockCreate,
              {'recordUndo': true},
              this.workspace.id,
              'testId');
        });

        test('Grouping', function() {
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
          Blockly.Events.setGroup('my group');
          Blockly.serialization.load(state, this.workspace);
          assertEventFired(
              this.eventsFireStub,
              Blockly.Events.BlockCreate,
              {'group': 'my group'},
              this.workspace.id,
              'testId');
        });

        test('Multiple blocks grouped', function() {
          const state = {
            'blocks': {
              'blocks': [
                {
                  'type': 'controls_if',
                  'id': 'testId',
                  'x': 42,
                  'y': 42
                },
                {
                  'type': 'controls_if',
                  'id': 'testId',
                  'x': 84,
                  'y': 84
                },
              ]
            }
          };
          Blockly.serialization.load(state, this.workspace);
          const calls = this.eventsFireStub.getCalls();
          const group = calls[0].args[0].group;
          chai.assert.isTrue(calls.every(call => call.args[0].group == group));
        });

        test('With children', function() {
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
<<<<<<< HEAD
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
=======
              ]
            }
          };
          Blockly.serialization.load(state, this.workspace);
          assertEventFired(
              this.eventsFireStub,
              Blockly.Events.BlockCreate,
              {},
              this.workspace.id,
              'id1');
        });
      });

      suite('Direct call', function() {
        test('No children', function() {
          const state = {
            'type': 'controls_if',
            'id': 'testId',
            'x': 42,
            'y': 42
          };
          Blockly.serialization.blocks.load(state, this.workspace);
          assertEventFired(
              this.eventsFireStub,
              Blockly.Events.BlockCreate,
              {'recordUndo': false},
              this.workspace.id,
              'testId');
        });

        test('Record undo', function() {
          const state = {
            'type': 'controls_if',
            'id': 'testId',
            'x': 42,
            'y': 42
          };
          Blockly.serialization.blocks
              .load(state, this.workspace, {'recordUndo': true});
          assertEventFired(
              this.eventsFireStub,
              Blockly.Events.BlockCreate,
              {'recordUndo': true},
              this.workspace.id,
              'testId');
        });

        test('Grouping', function() {
          const state = {
            'type': 'controls_if',
            'id': 'testId',
            'x': 42,
            'y': 42
          };
          Blockly.Events.setGroup('my group');
          Blockly.serialization.blocks.load(state, this.workspace);
          assertEventFired(
              this.eventsFireStub,
              Blockly.Events.BlockCreate,
              {'group': 'my group'},
              this.workspace.id,
              'testId');
        });
>>>>>>> 44418b3d (Add grouping of events)
      });
    });
  });
});
