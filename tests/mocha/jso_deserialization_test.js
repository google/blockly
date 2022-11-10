/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

goog.declareModuleId('Blockly.test.jsoDeserialization');

import {sharedTestSetup, sharedTestTeardown, workspaceTeardown} from './test_helpers/setup_teardown.js';
import {assertEventFired} from './test_helpers/events.js';
import * as eventUtils from '../../build/src/core/events/utils.js';


suite('JSO Deserialization', function() {
  setup(function() {
    sharedTestSetup.call(this);
    this.workspace = new Blockly.Workspace();
  });

  teardown(function() {
    sharedTestTeardown.call(this);
  });

  suite('Events', function() {
    suite('Finished loading', function() {
      test('Just var', function() {
        const state = {
          'blocks': {
            'blocks': [
              {
                'type': 'controls_if',
                'id': 'testId',
                'x': 42,
                'y': 42,
              },
            ],
          },
        };
        Blockly.serialization.workspaces.load(state, this.workspace);
        assertEventFired(
            this.eventsFireStub,
            Blockly.Events.FinishedLoading,
            {type: eventUtils.FINISHED_LOADING},
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
                'y': 42,
              },
            ],
          },
        };
        Blockly.Events.setGroup('my group');
        Blockly.serialization.workspaces.load(state, this.workspace);
        assertEventFired(
            this.eventsFireStub, Blockly.Events.FinishedLoading,
            {'group': 'my group', "type": eventUtils.FINISHED_LOADING},
            this.workspace.id);
      });

      test('Automatic group', function() {
        const state = {
          'variables': [
            {
              'name': 'test',
              'id': 'testId',
            },
          ],
          'blocks': {
            'blocks': [
              {
                'type': 'variables_get',
                'id': 'blockId',
                'x': 42,
                'y': 42,
                'fields': {
                  'VAR': {
                    'id': 'testId',
                  },
                },
              },
            ],
          },
        };
        Blockly.serialization.workspaces.load(state, this.workspace);
        const calls = this.eventsFireStub.getCalls();
        const group = calls[0].args[0].group;
        chai.assert.isTrue(calls.every((call) => call.args[0].group == group));
      });
    });

    suite('Var create', function() {
      test('Just var', function() {
        const state = {
          'variables': [
            {
              'name': 'test',
              'id': 'testId',
            },
          ],
        };
        Blockly.serialization.workspaces.load(state, this.workspace);
        assertEventFired(
            this.eventsFireStub, Blockly.Events.VarCreate, {
              'varName': 'test',
              'varId': 'testId',
              'varType': '',
              'recordUndo': false,
              "type": eventUtils.VAR_CREATE,
            },
            this.workspace.id);
      });

      test('Record undo', function() {
        const state = {
          'variables': [
            {
              'name': 'test',
              'id': 'testId',
            },
          ],
        };
        Blockly.serialization.workspaces.load(state, this.workspace, {recordUndo: true});
        assertEventFired(
            this.eventsFireStub, Blockly.Events.VarCreate, {
              'varName': 'test',
              'varId': 'testId',
              'varType': '',
              'recordUndo': true,
              "type": eventUtils.VAR_CREATE,
            },
            this.workspace.id);
      });

      test('Grouping', function() {
        const state = {
          'variables': [
            {
              'name': 'test',
              'id': 'testId',
            },
          ],
        };
        Blockly.Events.setGroup('my group');
        Blockly.serialization.workspaces.load(state, this.workspace);
        assertEventFired(
            this.eventsFireStub, Blockly.Events.VarCreate, {
              'varName': 'test',
              'varId': 'testId',
              'varType': '',
              'group': 'my group',
              "type": eventUtils.VAR_CREATE,
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
            },
          ],
        };
        Blockly.serialization.workspaces.load(state, this.workspace);
        const calls = this.eventsFireStub.getCalls();
        const group = calls[0].args[0].group;
        chai.assert.isTrue(calls.every((call) => call.args[0].group == group));
      });

      test('Var with block', function() {
        const state = {
          'variables': [
            {
              'name': 'test',
              'id': 'testId',
            },
          ],
          'blocks': {
            'blocks': [
              {
                'type': 'variables_get',
                'id': 'blockId',
                'x': 42,
                'y': 42,
                'fields': {
                  'VAR': {
                    'id': 'testId',
                  },
                },
              },
            ],
          },
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
            this.eventsFireStub, Blockly.Events.VarCreate, {
              'varName': 'test',
              'varId': 'testId',
              'varType': '',
              "type": eventUtils.VAR_CREATE,
            },
            this.workspace.id);
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
                  'y': 42,
                },
              ],
            },
          };
          Blockly.serialization.workspaces.load(state, this.workspace);
          assertEventFired(
              this.eventsFireStub,
              Blockly.Events.BlockCreate,
              {'recordUndo': false, "type": eventUtils.BLOCK_CREATE},
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
                  'y': 42,
                },
              ],
            },
          };
          Blockly.serialization.workspaces.load(state, this.workspace, {'recordUndo': true});
          assertEventFired(
              this.eventsFireStub,
              Blockly.Events.BlockCreate,
              {'recordUndo': true, "type": eventUtils.BLOCK_CREATE},
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
                  'y': 42,
                },
              ],
            },
          };
          Blockly.Events.setGroup('my group');
          Blockly.serialization.workspaces.load(state, this.workspace);
          assertEventFired(
              this.eventsFireStub,
              Blockly.Events.BlockCreate,
              {'group': 'my group', "type": eventUtils.BLOCK_CREATE},
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
                  'y': 42,
                },
                {
                  'type': 'controls_if',
                  'id': 'testId',
                  'x': 84,
                  'y': 84,
                },
              ],
            },
          };
          Blockly.serialization.workspaces.load(state, this.workspace);
          const calls = this.eventsFireStub.getCalls();
          const group = calls[0].args[0].group;
          chai.assert.isTrue(calls.every((call) => call.args[0].group == group));
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
                        'id': 'id2',
                      },
                    },
                  },
                  'next': {
                    'block': {
                      'type': 'controls_if',
                      'id': 'id3',
                    },
                  },
                },
              ],
            },
          };
          Blockly.serialization.workspaces.load(state, this.workspace);
          assertEventFired(
              this.eventsFireStub,
              Blockly.Events.BlockCreate,
              {type: eventUtils.BLOCK_CREATE},
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
            'y': 42,
          };
          Blockly.serialization.blocks.append(state, this.workspace);
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
            'y': 42,
          };
          Blockly.serialization.blocks.append(
              state, this.workspace, {'recordUndo': true});
          assertEventFired(
              this.eventsFireStub,
              Blockly.Events.BlockCreate,
              {'recordUndo': true, "type": eventUtils.BLOCK_CREATE},
              this.workspace.id,
              'testId');
        });

        test('Grouping', function() {
          const state = {
            'type': 'controls_if',
            'id': 'testId',
            'x': 42,
            'y': 42,
          };
          Blockly.Events.setGroup('my group');
          Blockly.serialization.blocks.append(state, this.workspace);
          assertEventFired(
              this.eventsFireStub,
              Blockly.Events.BlockCreate,
              {'group': 'my group', "type": eventUtils.BLOCK_CREATE},
              this.workspace.id,
              'testId');
        });
      });
    });
  });

  suite('Exceptions', function() {
    setup(function() {
      this.assertThrows = function(state, error) {
        chai.assert.throws(() => {
          Blockly.serialization.workspaces.load(state, this.workspace);
        }, error);
      };
    });

    suite('Undefined block type', function() {
      test('Name', function() {
        const state = {
          'blocks': {
            'blocks': [
              {
                'type': 'not_a_real_block',
              },
            ],
          },
        };
        this.assertThrows(state, TypeError);
      });

      test('Casing', function() {
        const state = {
          'blocks': {
            'blocks': [
              {
                'type': 'MATH_NUMBER',
              },
            ],
          },
        };
        this.assertThrows(state, TypeError);
      });
    });

    suite('Missing connection', function() {
      test('Input name', function() {
        const state = {
          'blocks': {
            'blocks': [
              {
                'type': 'logic_compare',
                'inputs': {
                  'not_an_input': {
                    'block': {
                      'type': 'logic_boolean',
                    },
                  },
                },
              },
            ],
          },
        };
        this.assertThrows(
            state, Blockly.serialization.exceptions.MissingConnection);
      });

      test('Input casing', function() {
        const state = {
          'blocks': {
            'blocks': [
              {
                'type': 'logic_compare',
                'inputs': {
                  'a': {
                    'block': {
                      'type': 'logic_boolean',
                    },
                  },
                },
              },
            ],
          },
        };
        this.assertThrows(
            state, Blockly.serialization.exceptions.MissingConnection);
      });

      test('Next', function() {
        const state = {
          'blocks': {
            'blocks': [
              {
                'type': 'logic_compare',
                'next': {
                  'block': {
                    'type': 'text_print',
                  },
                },
              },
            ],
          },
        };
        this.assertThrows(
            state, Blockly.serialization.exceptions.MissingConnection);
      });

      test('Previous', function() {
        const state = {
          'blocks': {
            'blocks': [
              {
                'type': 'text_print',
                'next': {
                  'block': {
                    'type': 'logic_compare',
                  },
                },
              },
            ],
          },
        };
        this.assertThrows(
            state, Blockly.serialization.exceptions.MissingConnection);
      });

      test('Output', function() {
        const state = {
          'blocks': {
            'blocks': [
              {
                'type': 'logic_compare',
                'inputs': {
                  'A': {
                    'block': {
                      'type': 'text_print',
                    },
                  },
                },
              },
            ],
          },
        };
        this.assertThrows(
            state, Blockly.serialization.exceptions.MissingConnection);
      });
    });

    suite('Bad connection check', function() {
      test('Bad checks', function() {
        const state = {
          'blocks': {
            'blocks': [
              {
                'type': 'logic_operation',
                'inputs': {
                  'A': {
                    'block': {
                      'type': 'math_number',
                    },
                  },
                },
              },
            ],
          },
        };
        this.assertThrows(
            state, Blockly.serialization.exceptions.BadConnectionCheck);
      });
    });

    suite('Real child of shadow', function() {
      test('Input', function() {
        const state = {
          'blocks': {
            'blocks': [
              {
                'type': 'logic_compare',
                'inputs': {
                  'A': {
                    'shadow': {
                      'type': 'logic_compare',
                      'inputs': {
                        'A': {
                          'block': {
                            'type': 'logic_boolean',
                          },
                        },
                      },
                    },
                  },
                },
              },
            ],
          },
        };
        this.assertThrows(
            state, Blockly.serialization.exceptions.RealChildOfShadow);
      });

      test('Next', function() {
        const state = {
          'blocks': {
            'blocks': [
              {
                'type': 'text_print',
                'next': {
                  'shadow': {
                    'type': 'text_print',
                    'next': {
                      'block': {
                        'type': 'text_print',
                      },
                    },
                  },
                },
              },
            ],
          },
        };
        this.assertThrows(
            state, Blockly.serialization.exceptions.RealChildOfShadow);
      });
    });
  });

  test('Priority', function() {
    const blocksSerializer = Blockly.registry.getClass(
        Blockly.registry.Type.SERIALIZER, 'blocks');
    const variablesSerializer = Blockly.registry.getClass(
        Blockly.registry.Type.SERIALIZER, 'variables');

    Blockly.serialization.registry.unregister('blocks');
    Blockly.serialization.registry.unregister('variables');

    const calls = [];

    const first = {
      priority: 100,
      save: () => null,
      load: () => calls.push('first-load'),
      clear: () => calls.push('first-clear'),
    };
    const second = {
      priority: 0,
      save: () => null,
      load: () => calls.push('second-load'),
      clear: () => calls.push('second-clear'),
    };
    const third = {
      priority: -10,
      save: () => null,
      load: () => calls.push('third-load'),
      clear: () => calls.push('third-clear'),
    };

    Blockly.serialization.registry.register('third', third);
    Blockly.serialization.registry.register('first', first);
    Blockly.serialization.registry.register('second', second);

    Blockly.serialization.workspaces.load(
        {'first': {}, 'third': {}, 'second': {}}, this.workspace);

    Blockly.serialization.registry.unregister('first');
    Blockly.serialization.registry.unregister('second');
    Blockly.serialization.registry.unregister('third');

    Blockly.serialization.registry.register('blocks', blocksSerializer);
    Blockly.serialization.registry.register('variables', variablesSerializer);

    chai.assert.deepEqual(
        calls,
        [
          'third-clear',
          'second-clear',
          'first-clear',
          'first-load',
          'second-load',
          'third-load',
        ]);
  });

  suite('Extra state', function() {
    // Most of this is covered by our round-trip tests. But we need one test
    // for old xml hooks.
    test('Xml hooks', function() {
      Blockly.Blocks['test_block'] = {
        init: function() { },

        mutationToDom: function() {
          const container = Blockly.utils.xml.createElement('mutation');
          container.setAttribute('value', 'some value');
          return container;
        },

        domToMutation: function(element) {
          this.someProperty = element.getAttribute('value');
        },
      };

      const block = Blockly.serialization.blocks.append(
          {
            'type': 'test_block',
            'extraState': '<mutation value="some value"></mutation>',
          },
          this.workspace);

      delete Blockly.Blocks['test_block'];

      chai.assert.equal(block.someProperty, 'some value');
    });
  });

  suite('Procedures', function() {
    class MockProcedureModel {
      constructor(workspace, name, id) {
        this.id = id ?? Blockly.utils.idGenerator.genUid();
        this.name = name;
        this.parameters = [];
        this.returnTypes = null;
        this.enabled = true;
      }

      setName(name) {
        this.name = name;
        return this;
      }

      insertParameter(parameterModel, index) {
        this.parameters.splice(index, 0, parameterModel);
        return this;
      }

      deleteParameter(index) {
        this.parameters.splice(index, 1);
        return this;
      }

      setReturnTypes(types) {
        this.returnTypes = types;
        return this;
      }

      setEnabled(enabled) {
        this.enabled = enabled;
        return this;
      }

      getId() {
        return this.id;
      }

      getName() {
        return this.name;
      }

      getParameter(index) {
        return this.parameters[index];
      }

      getParameters() {
        return [...this.parameters];
      }

      getReturnTypes() {
        return this.returnTypes;
      }

      getEnabled() {
        return this.enabled;
      }
    }

    class MockParameterModel {
      constructor(workspace, name, id) {
        this.id = id ?? Blockly.utils.idGenerator.genUid();
        this.name = name;
        this.types = [];
      }

      setName(name) {
        this.name = name;
        return this;
      }

      setTypes(types) {
        this.types = types;
        return this;
      }

      getName() {
        return this.name;
      }

      getTypes() {
        return this.types;
      }

      getId() {
        return this.id;
      }
    }

    setup(function() {
      this.procedureSerializer = new
          Blockly.serialization.procedures.ProcedureSerializer(
            MockProcedureModel, MockParameterModel);
      this.procedureMap = this.workspace.getProcedureMap();
    });

    teardown(function() {
      this.procedureSerializer = null;
      this.procedureMap = null;
    });

    suite('invariant properties', function() {
      test('the id property is assigned', function() {
        const jso = {
          'id': 'test id',
          'name': 'test name',
          'returnTypes': [],
        };

        this.procedureSerializer.load([jso], this.workspace);

        const procedureModel = this.procedureMap.getProcedures()[0];
        chai.assert.isNotNull(
            procedureModel, 'Expected a procedure model to exist');
        chai.assert.equal(
            procedureModel.getId(),
            'test id',
            'Expected the procedure model ID to match the serialized ID');
      });

      test('the name property is assigned', function() {
        const jso = {
          'id': 'test id',
          'name': 'test name',
          'returnTypes': [],
        };

        this.procedureSerializer.load([jso], this.workspace);

        const procedureModel = this.procedureMap.getProcedures()[0];
        chai.assert.isNotNull(
            procedureModel, 'Expected a procedure model to exist');
        chai.assert.equal(
            procedureModel.getName(),
            'test name',
            'Expected the procedure model name to match the serialized name');
      });
    });

    suite('return types', function() {
      test('if the return type property is null it is assigned', function() {
        const jso = {
          'id': 'test id',
          'name': 'test name',
          'returnTypes': null,
        };

        this.procedureSerializer.load([jso], this.workspace);

        const procedureModel = this.procedureMap.getProcedures()[0];
        chai.assert.isNotNull(
            procedureModel, 'Expected a procedure model to exist');
        chai.assert.isNull(
            procedureModel.getReturnTypes(),
            'Expected the procedure model types to be null');
      });

      test('if the return type property is an empty array it is assigned', function() {
        const jso = {
          'id': 'test id',
          'name': 'test name',
          'returnTypes': [],
        };

        this.procedureSerializer.load([jso], this.workspace);

        const procedureModel = this.procedureMap.getProcedures()[0];
        chai.assert.isNotNull(
            procedureModel, 'Expected a procedure model to exist');
        chai.assert.isArray(
            procedureModel.getReturnTypes(),
            'Expected the procedure model types to be an array');
        chai.assert.isEmpty(
            procedureModel.getReturnTypes(),
            'Expected the procedure model types array to be empty');
      });

      test('if the return type property is a string array it is assigned', function() {
        const jso = {
          'id': 'test id',
          'name': 'test name',
          'returnTypes': ['test type 1', 'test type 2'],
        };

        this.procedureSerializer.load([jso], this.workspace);

        const procedureModel = this.procedureMap.getProcedures()[0];
        chai.assert.isNotNull(
            procedureModel, 'Expected a procedure model to exist');
        chai.assert.isArray(
            procedureModel.getReturnTypes(),
            'Expected the procedure model types to be an array');
        chai.assert.deepEqual(
            procedureModel.getReturnTypes(),
            ['test type 1', 'test type 2'],
            'Expected the procedure model types array to be match the ' +
            'serialized array');
      });
    });

    suite('parameters', function() {
      suite('invariant properties', function() {
        test('the id property is assigned', function() {
          const jso = {
            'id': 'test id',
            'name': 'test name',
            'returnTypes': [],
            'parameters': [
              {
                'id': 'test id',
                'name': 'test name',
              },
            ],
          };

          this.procedureSerializer.load([jso], this.workspace);

          const parameterModel =
              this.procedureMap.getProcedures()[0].getParameters()[0];
          chai.assert.isNotNull(
              parameterModel, 'Expected a parameter model to exist');
          chai.assert.equal(
              parameterModel.getId(),
              'test id',
              'Expected the parameter model ID to match the serialized ID');
        });

        test('the name property is assigned', function() {
          const jso = {
            'id': 'test id',
            'name': 'test name',
            'returnTypes': [],
            'parameters': [
              {
                'id': 'test id',
                'name': 'test name',
              },
            ],
          };

          this.procedureSerializer.load([jso], this.workspace);

          const parameterModel =
              this.procedureMap.getProcedures()[0].getParameters()[0];
          chai.assert.isNotNull(
              parameterModel, 'Expected a parameter model to exist');
          chai.assert.equal(
              parameterModel.getName(),
              'test name',
              'Expected the parameter model name to match the serialized name');
        });
      });

      suite('types', function() {
        test('if the type property does not exist, nothing is assigned', function() {
          const jso = {
            'id': 'test id',
            'name': 'test name',
            'returnTypes': [],
            'parameters': [
              {
                'id': 'test id',
                'name': 'test name',
              },
            ],
          };

          chai.assert.doesNotThrow(
            () => {
              this.procedureMap.getProcedures()[0].getParameters()[0];
            },
            'Expected the deserializer to skip the non-existant type property');
        });

        test('if the type property exists, it is assigned', function() {
          const jso = {
            'id': 'test id',
            'name': 'test name',
            'returnTypes': [],
            'parameters': [
              {
                'id': 'test id',
                'name': 'test name',
                'types': ['test type 1', 'test type 2'],
              },
            ],
          };

          this.procedureSerializer.load([jso], this.workspace);

          const parameterModel =
              this.procedureMap.getProcedures()[0].getParameters()[0];
          chai.assert.isNotNull(
              parameterModel, 'Expected a parameter model to exist');
          chai.assert.deepEqual(
              parameterModel.getTypes(),
              ['test type 1', 'test type 2'],
              'Expected the parameter model types to match the serialized types');
        });
      });
    });
  });
});
