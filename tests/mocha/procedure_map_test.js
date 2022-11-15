/**
 * @license
 * Copyright 2022 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {sharedTestSetup, sharedTestTeardown} from './test_helpers/setup_teardown.js';
import {assertEventFired, assertEventNotFired, createChangeListenerSpy} from './test_helpers/events.js';

goog.declareModuleId('Blockly.test.procedureMap');

suite('Procedure Map', function() {
  setup(function() {
    sharedTestSetup.call(this);
    this.workspace = new Blockly.Workspace();
    this.procedureMap = this.workspace.getProcedureMap();
  });

  teardown(function() {
    sharedTestTeardown.call(this);
  });

  suite('triggering block updates', function() {
    setup(function() {
      Blockly.Blocks['procedure_mock'] = {
        init: function() { },
        doProcedureUpdate: function() { },
      };

      this.procedureBlock = this.workspace.newBlock('procedure_mock');

      this.updateSpy = sinon.spy(this.procedureBlock, 'doProcedureUpdate');
    });

    teardown(function() {
      delete Blockly.Blocks['procedure_mock'];
    });

    suite('procedure map updates', function() {
      test('inserting a procedure does not trigger an update', function() {
        const procedureModel =
            new Blockly.procedures.ObservableProcedureModel(
                this.workspace, 'test name');
        this.procedureMap.set(procedureModel.getId(), procedureModel);

        chai.assert.isFalse(
            this.updateSpy.called, 'Expected no update to be triggered');
      });

      test('adding a procedure does not trigger an update', function() {
        this.procedureMap.add(
            new Blockly.procedures.ObservableProcedureModel(
                this.workspace, 'test name'));

        chai.assert.isFalse(
            this.updateSpy.called, 'Expected no update to be triggered');
      });

      test('deleting a procedure triggers an update', function() {
        const procedureModel =
            new Blockly.procedures.ObservableProcedureModel(
                this.workspace, 'test name');
        this.procedureMap.add(procedureModel);

        this.procedureMap.delete(procedureModel.getId());

        chai.assert.isTrue(
            this.updateSpy.calledOnce, 'Expected an update to be triggered');
      });
    });

    suite('procedure model updates', function() {
      test('setting the name triggers an update', function() {
        const procedureModel =
            new Blockly.procedures.ObservableProcedureModel(
                this.workspace, 'test name');
        this.procedureMap.add(procedureModel);

        procedureModel.setName('new name');

        chai.assert.isTrue(
            this.updateSpy.calledOnce, 'Expected an update to be triggered');
      });

      test('setting the return type triggers an update', function() {
        const procedureModel =
            new Blockly.procedures.ObservableProcedureModel(
                this.workspace, 'test name');
        this.procedureMap.add(procedureModel);

        procedureModel.setReturnTypes([]);

        chai.assert.isTrue(
            this.updateSpy.calledOnce, 'Expected an update to be triggered');
      });

      test('removing the return type triggers an update', function() {
        const procedureModel =
            new Blockly.procedures.ObservableProcedureModel(
                this.workspace, 'test name')
                .setReturnTypes([]);
        this.procedureMap.add(procedureModel);
        this.updateSpy.resetHistory();

        procedureModel.setReturnTypes(null);

        chai.assert.isTrue(
            this.updateSpy.calledOnce, 'Expected an update to be triggered');
      });

      test('disabling the procedure triggers an update', function() {
        const procedureModel =
            new Blockly.procedures.ObservableProcedureModel(
                this.workspace, 'test name');
        this.procedureMap.add(procedureModel);

        procedureModel.setEnabled(false);

        chai.assert.isTrue(
            this.updateSpy.calledOnce, 'Expected an update to be triggered');
      });

      test('enabling the procedure triggers an update', function() {
        const procedureModel =
            new Blockly.procedures.ObservableProcedureModel(
                this.workspace, 'test name')
                .setEnabled(false);
        this.procedureMap.add(procedureModel);
        this.updateSpy.resetHistory();

        procedureModel.setEnabled(true);

        chai.assert.isTrue(
            this.updateSpy.calledOnce, 'Expected an update to be triggered');
      });

      test('inserting a parameter triggers an update', function() {
        const procedureModel =
            new Blockly.procedures.ObservableProcedureModel(
                this.workspace, 'test name');
        this.procedureMap.add(procedureModel);

        procedureModel.insertParameter(
            new Blockly.procedures.ObservableParameterModel(this.workspace));

        chai.assert.isTrue(
            this.updateSpy.calledOnce, 'Expected an update to be triggered');
      });

      test('deleting a parameter triggers an update', function() {
        const procedureModel =
            new Blockly.procedures.ObservableProcedureModel(
                this.workspace, 'test name')
                .insertParameter(
                    new Blockly.procedures.ObservableParameterModel(
                        this.workspace));
        this.procedureMap.add(procedureModel);
        this.updateSpy.resetHistory();

        procedureModel.deleteParameter(0);

        chai.assert.isTrue(
            this.updateSpy.calledOnce, 'Expected an update to be triggered');
      });
    });

    suite('parameter model updates', function() {
      test('setting the name triggers an update', function() {
        const parameterModel =
            new Blockly.procedures.ObservableParameterModel(
                this.workspace, 'test1');
        this.procedureMap.add(
            new Blockly.procedures.ObservableProcedureModel(
                this.workspace, 'test name')
                .insertParameter(parameterModel));
        this.updateSpy.resetHistory();

        parameterModel.setName('test2');

        chai.assert.isTrue(
            this.updateSpy.calledOnce, 'Expected an update to be triggered');
      });

      test('modifying the variable model does not trigger an update', function() {
        const parameterModel =
            new Blockly.procedures.ObservableParameterModel(
                this.workspace, 'test1');
        this.procedureMap.add(
            new Blockly.procedures.ObservableProcedureModel(
                this.workspace, 'test name')
                .insertParameter(parameterModel));
        this.updateSpy.resetHistory();

        const variableModel = parameterModel.getVariableModel();
        variableModel.name = 'some name';
        variableModel.type = 'some type';

        chai.assert.isFalse(
            this.updateSpy.called, 'Expected no update to be triggered');
      });
    });
  });

  suite.skip('event firing', function() {
    setup(function() {
      this.eventSpy = createChangeListenerSpy(this.workspace);
    });

    teardown(function() {
      this.workspace.removeChangeListener(this.eventSpy);
    });

    test('create events are fired when a procedure is inserted', function() {
      const procedureModel =
          new Blockly.procedures.ObservableProcedureModel(this.workspace);
      this.procedureMap.set(procedureModel.getId(), procedureModel);

      assertEventFired(
        this.eventSpy,
        Blockly.Events.ProcedureCreate,
        {model: procedureModel},
        this.workspace.id);
    });

    test(
        'create events are not fired if a procedure is already inserted',
        function() {
          const procedureModel =
              new Blockly.procedures.ObservableProcedureModel(this.workspace);
          this.procedureMap.set(procedureModel.getId(), procedureModel);

          this.eventSpy.resetHistory();
          this.procedureMap.set(procedureModel.getId(), procedureModel);

          assertEventNotFired(
            this.eventSpy,
            Blockly.Events.ProcedureCreate,
            {},
            this.workspace.id);
        });

    test('create events are fired when a procedure is added', function() {
      const procedureModel =
          new Blockly.procedures.ObservableProcedureModel(this.workspace);
      this.procedureMap.add(procedureModel);

      assertEventFired(
        this.eventSpy,
        Blockly.Events.ProcedureCreate,
        {model: procedureModel},
        this.workspace.id);
    });

    test(
        'create events are not fired if a procedure is already added',
        function() {
          const procedureModel =
              new Blockly.procedures.ObservableProcedureModel(this.workspace);
          this.procedureMap.add(procedureModel);

          this.eventSpy.resetHistory();
          this.procedureMap.add(procedureModel);

          assertEventNotFired(
            this.eventSpy,
            Blockly.Events.ProcedureCreate,
            {},
            this.workspace.id);
        });

    test('delete events are fired when a procedure is deleted', function() {
      const procedureModel =
          new Blockly.procedures.ObservableProcedureModel(this.workspace);
      this.procedureMap.add(procedureModel);
      this.procedureMap.delete(procedureModel.getId());

      assertEventFired(
        this.eventSpy,
        Blockly.Events.ProcedureDelete,
        {model: procedureModel},
        this.workspace.id);
    });

    test(
        'delete events are not fired if a procedure does not exist',
        function() {
          const procedureModel =
              new Blockly.procedures.ObservableProcedureModel(this.workspace);
          this.procedureMap.delete(procedureModel.getId());

          assertEventNotFired(
            this.eventSpy,
            Blockly.Events.ProcedureDelete,
            {},
            this.workspace.id);
        });

    test(
        'delete events are fired when the procedure map is cleared',
        function() {
          const procedureModel1 =
              new Blockly.procedures.ObservableProcedureModel(this.workspace);
          const procedureModel2 =
              new Blockly.procedures.ObservableProcedureModel(this.workspace);
          const procedureModel3 =
              new Blockly.procedures.ObservableProcedureModel(this.workspace);
          this.procedureMap.add(procedureModel1);
          this.procedureMap.add(procedureModel2);
          this.procedureMap.add(procedureModel3);
          this.procedureMap.clear();

          assertEventFired(
            this.eventSpy,
            Blockly.Events.ProcedureDelete,
            {model: procedureModel1},
            this.workspace.id);
          assertEventFired(
            this.eventSpy,
            Blockly.Events.ProcedureDelete,
            {model: procedureModel2},
            this.workspace.id);
          assertEventFired(
            this.eventSpy,
            Blockly.Events.ProcedureDelete,
            {model: procedureModel3},
            this.workspace.id);
        });

    test('rename events are fired when a procedure is renamed', function() {
      const procedureModel =
          new Blockly.procedures.ObservableProcedureModel(this.workspace)
          .setName('test name');
      this.procedureMap.add(procedureModel);
      procedureModel.setName('new name');

      assertEventFired(
        this.eventSpy,
        Blockly.Events.ProcedureRename,
        {
          model: procedureModel,
          oldName: 'test name',
        },
        this.workspace.id);
    });

    test('rename events are not fired if the rename is noop', function() {
      const procedureModel =
          new Blockly.procedures.ObservableProcedureModel(this.workspace)
          .setName('test name');
      this.procedureMap.add(procedureModel);
      procedureModel.setName('test name');

      assertEventNotFired(
        this.eventSpy,
        Blockly.Events.ProcedureRename,
        {},
        this.workspace.id);
    });

    test(
        'rename events are not fired if the procedure is not in the map',
        function() {
          const procedureModel =
              new Blockly.procedures.ObservableProcedureModel(this.workspace)
              .setName('test name');
          procedureModel.setName('new name');

          assertEventNotFired(
            this.eventSpy,
            Blockly.Events.ProcedureRename,
            {},
            this.workspace.id);
        });

    test('enable events are fired when a procedure is enabled', function() {
      const procedureModel =
          new Blockly.procedures.ObservableProcedureModel(this.workspace)
          .setEnabled(false);
      this.procedureMap.add(procedureModel);
      procedureModel.setEnabled(true);

      assertEventFired(
        this.eventSpy,
        Blockly.Events.ProcedureEnable,
        {model: procedureModel},
        this.workspace.id);
    });

    test('enable events are fired when a procedure is disabled', function() {
      const procedureModel =
          new Blockly.procedures.ObservableProcedureModel(this.workspace);
      this.procedureMap.add(procedureModel);
      procedureModel.setEnabled(false);

      assertEventFired(
        this.eventSpy,
        Blockly.Events.ProcedureEnable,
        {model: procedureModel},
        this.workspace.id);
    });

    test('enable events are not fired if enabling is noop', function() {
      const procedureModel =
          new Blockly.procedures.ObservableProcedureModel(this.workspace);
      this.procedureMap.add(procedureModel);
      procedureModel.setEnabled(true);

      assertEventNotFired(
        this.eventSpy,
        Blockly.Events.ProcedureEnable,
        {},
        this.workspace.id);
    });

    test('enable events are not fired if disabling is noop', function() {
      const procedureModel =
          new Blockly.procedures.ObservableProcedureModel(this.workspace)
          .setEnabled(false);
      this.procedureMap.add(procedureModel);
      procedureModel.setEnabled(false);

      assertEventNotFired(
        this.eventSpy,
        Blockly.Events.ProcedureEnable,
        {},
        this.workspace.id);
    });

    test(
        'enable events are not fired if the procedure is not in the map',
        function() {
          const procedureModel =
              new Blockly.procedures.ObservableProcedureModel(this.workspace)
              .setEnabled(false);
          procedureModel.setEnabled(true);
    
          assertEventNotFired(
            this.eventSpy,
            Blockly.Events.ProcedureEnable,
            {},
            this.workspace.id);
        });

    test(
        'parameter create events are fired when a parameter is inserted',
        function() {
          const procedureModel =
              new Blockly.procedures.ObservableProcedureModel(this.workspace);
          this.procedureMap.add(procedureModel);
          const parameterModel =
              new Blockly.procedures.ObservableParameterModel(
                  this.workspace, 'test name');
          procedureModel.insertParameter(0, parameterModel);

          assertEventFired(
            this.eventSpy,
            Blockly.Events.ProcedureParameterCreate,
            {
              model: procedureModel,
              parameter: parameterModel,
              index: 0,
            },
            this.workspace.id);
        });

    test(
        'parameter create events are not fired if the procedure is ' +
        'not in the map',
        function() {
          const procedureModel =
              new Blockly.procedures.ObservableProcedureModel(this.workspace);
          procedureModel.insertParameter(
              0,
              new Blockly.procedures.ObservableParameterModel(
                  this.workspace, 'test name'));

          assertEventNotFired(
            this.eventSpy,
            Blockly.Events.ProcedureParameterCreate,
            {},
            this.workspace.id);
        });

    test(
        'parameter delete events are fired when a parameter is deleted',
        function() {
          const procedureModel =
              new Blockly.procedures.ObservableProcedureModel(this.workspace);
          this.procedureMap.add(procedureModel);
          const parameterModel =
              new Blockly.procedures.ObservableParameterModel(
                  this.workspace, 'test name');
          procedureModel.insertParameter(0, parameterModel);
          procedureModel.deleteParameter(0);

          assertEventFired(
            this.eventSpy,
            Blockly.Events.ProcedureParameterDelete,
            {
              model: procedureModel,
              parameter: parameterModel,
              index: 0,
            },
            this.workspace.id);
        });

    test(
        'parameter delete events are not fired if the procedure is ' +
        'not in the map',
        function() {
          const procedureModel =
              new Blockly.procedures.ObservableProcedureModel(this.workspace)
                  .insertParameter(
                      0,
                      new Blockly.procedures.ObservableParameterModel(
                          this.workspace, 'test name'));
          procedureModel.deleteParameter(0);

          assertEventNotFired(
            this.eventSpy,
            Blockly.Events.ProcedureParameterDelete,
            {},
            this.workspace.id);
        });

    test(
        'parameter rename events are fired when a parameter is renamed',
        function() {
          const procedureModel =
              new Blockly.procedures.ObservableProcedureModel(this.workspace);
          this.procedureMap.add(procedureModel);
          const parameterModel =
              new Blockly.procedures.ObservableParameterModel(
                  this.workspace, 'test name');
          procedureModel.insertParameter(0, parameterModel);

          parameterModel.setName('new name');

          assertEventFired(
            this.eventSpy,
            Blockly.Events.ProcedureParameterRename,
            {
              model: procedureModel,
              parameter: parameterModel,
              oldName: 'test name',
            },
            this.workspace.id);
        });

    test(
        'parameter rename events are not fired if the rename is noop',
        function() {
          const procedureModel =
              new Blockly.procedures.ObservableProcedureModel(this.workspace);
          this.procedureMap.add(procedureModel);
          const parameterModel =
              new Blockly.procedures.ObservableParameterModel(
                  this.workspace, 'test name');
          procedureModel.insertParameter(0, parameterModel);

          parameterModel.setName('test name');

          assertEventNotFired(
            this.eventSpy,
            Blockly.Events.ProcedureParameterRename,
            {},
            this.workspace.id);
        });
    
    test(
        'parameter rename events are not fired if the procedure is ' +
        'not in the map',
        function() {
          const parameterModel =
              new Blockly.procedures.ObservableParameterModel(
                  this.workspace, 'test name');
          new Blockly.procedures.ObservableProcedureModel(this.workspace)
              .insertParameter(0, parameterModel);

          parameterModel.setName('new name');

          assertEventNotFired(
            this.eventSpy,
            Blockly.Events.ProcedureParameterRename,
            {},
            this.workspace.id);
        });

    test(
        'parameter rename events are not fired if the parameter is ' +
        'not in a procedure',
        function() {
          const parameterModel =
              new Blockly.procedures.ObservableParameterModel(
                  this.workspace, 'test name');

          parameterModel.setName('new name');

          assertEventNotFired(
            this.eventSpy,
            Blockly.Events.ProcedureParameterRename,
            {},
            this.workspace.id);
        });

    test(
        'return type change events are fired when the return is added',
        function() {
          const procedureModel =
              new Blockly.procedures.ObservableProcedureModel(this.workspace)
                  .setReturnTypes(null);
          this.procedureMap.add(procedureModel);
          procedureModel.setReturnTypes([]);

          assertEventFired(
            this.eventSpy,
            Blockly.Events.ProcedureChangeReturn,
            {
              model: procedureModel,
              oldTypes: null,
            },
            this.workspace.id);
        });

    test(
        'return type change events are fired when the return is removed',
        function() {
          const procedureModel =
              new Blockly.procedures.ObservableProcedureModel(this.workspace)
                  .setReturnTypes([]);
          this.procedureMap.add(procedureModel);
          procedureModel.setReturnTypes(null);

          assertEventFired(
            this.eventSpy,
            Blockly.Events.ProcedureChangeReturn,
            {
              model: procedureModel,
              oldTypes: [],
            },
            this.workspace.id);
        });

    test(
        'return type change events are not fired if adding is noop',
        function() {
          const procedureModel =
              new Blockly.procedures.ObservableProcedureModel(this.workspace)
                  .setReturnTypes([]);
          this.procedureMap.add(procedureModel);
          procedureModel.setReturnTypes([]);

          assertEventNotFired(
            this.eventSpy,
            Blockly.Events.ProcedureChangeReturn,
            {},
            this.workspace.id);
        });

    test(
        'return type change events are not fired if removing is noop',
        function() {
          const procedureModel =
              new Blockly.procedures.ObservableProcedureModel(this.workspace)
                  .setReturnTypes(null);
          this.procedureMap.add(procedureModel);
          procedureModel.setReturnTypes(null);

          assertEventNotFired(
            this.eventSpy,
            Blockly.Events.ProcedureChangeReturn,
            {},
            this.workspace.id);
        });

    test(
        'return type change events are not fired if the procedure is ' +
        'not in the map',
        function() {
          const procedureModel =
              new Blockly.procedures.ObservableProcedureModel(this.workspace)
                  .setReturnTypes(null);

          procedureModel.setReturnTypes([]);

          assertEventNotFired(
            this.eventSpy,
            Blockly.Events.ProcedureChangeReturn,
            {},
            this.workspace.id);
        });
  });

  suite('backing variable to parameters', function() {
    test(
        'construction references an existing variable if available',
        function() {
          const variable = this.workspace.createVariable('test1');
          const param = new Blockly.procedures.ObservableParameterModel(
              this.workspace, 'test1');

          chai.assert.equal(
              variable,
              param.getVariableModel(),
              'Expected the parameter model to reference the existing variable');
        });

    test('construction creates a variable if none exists', function() {
      const param = new Blockly.procedures.ObservableParameterModel(
          this.workspace, 'test1');

      chai.assert.equal(
          this.workspace.getVariable('test1'),
          param.getVariableModel(),
          'Expected the parameter model to create a variable');
    });

    test('setName references an existing variable if available', function() {
      const variable = this.workspace.createVariable('test2');
      const param = new Blockly.procedures.ObservableParameterModel(
          this.workspace, 'test1');

      param.setName('test2');

      chai.assert.equal(
          variable,
          param.getVariableModel(),
          'Expected the parameter model to reference the existing variable');
    });

    test('setName creates a variable if none exits', function() {
      const param = new Blockly.procedures.ObservableParameterModel(
          this.workspace, 'test1');

      param.setName('test2');

      chai.assert.equal(
          this.workspace.getVariable('test2'),
          param.getVariableModel(),
          'Expected the parameter model to create a variable');
    });

    test('setTypes is unimplemented', function() {
      const param = new Blockly.procedures.ObservableParameterModel(
          this.workspace, 'test1');

      chai.assert.throws(
        () => {
          param.setTypes(['some', 'types']);
        },
        'The built-in ParameterModel does not support typing');
    });
  });
});
