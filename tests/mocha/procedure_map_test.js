/**
 * @license
 * Copyright 2022 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {sharedTestSetup, sharedTestTeardown} from './test_helpers/setup_teardown.js';

goog.declareModuleId('Blockly.test.procedureMap');

suite('Procedure Map', function() {
  setup(function() {
    sharedTestSetup.call(this);
    this.workspace = new Blockly.Workspace();
    //this.procedureMap = this.workspace.getProcedureMap();
  });

  teardown(function() {
    sharedTestTeardown.call(this);
  });

  suite.skip('triggering block updates', function() {
    setup(function() {
      Blockly.Blocks['procedure_mock'] = {
        init: function() { },
        doProcedureUpdate: function() {},
      };

      this.procedureBlock = this.workspace.newBlock('procedure_mock');

      this.updateSpy = sinon.spy(this.procedureBlock, 'doProcedureUpdate');
    });

    teardown(function() {
      delete Blockly.Blocks['procedure_mock'];
    });

    suite('procedure map updates', function() {
      test('adding a procedure does not trigger an update', function() {
        this.procedureMap.addProcedure(
            new Blockly.procedures.ObservableProcedureModel(this.workspace));

        chai.assert.isFalse(
            this.updateSpy.called, 'Expected no update to be triggered');
      });

      test('deleting a procedure triggers an update', function() {
        const procedureModel =
            new Blockly.procedures.ObservableProcedureModel(this.workspace);
        this.procedureMap.addProcedure(procedureModel);

        this.procedureMap.deleteProcedure(procedureModel.getId());

        chai.assert.isTrue(
            this.updateSpy.calledOnce, 'Expected an update to be triggered');
      });
    });

    suite('procedure model updates', function() {
      test('setting the name triggers an update', function() {
        const procedureModel =
            new Blockly.procedures.ObservableProcedureModel(this.workspace);
        this.procedureMap.addProcedure(procedureModel);

        procedureModel.setName('new name');

        chai.assert.isTrue(
            this.updateSpy.calledOnce, 'Expected an update to be triggered');
      });
  
      test('setting the return type triggers an update', function() {
        const procedureModel =
            new Blockly.procedures.ObservableProcedureModel(this.workspace);
        this.procedureMap.addProcedure(procedureModel);

        procedureModel.setReturnType(['return type 1', 'return type 2']);

        chai.assert.isTrue(
            this.updateSpy.calledOnce, 'Expected an update to be triggered');
      });
  
      test('removing the return type triggers an update', function() {
        const procedureModel =
            new Blockly.procedures.ObservableProcedureModel(this.workspace);
        this.procedureMap.addProcedure(procedureModel);

        procedureModel.setReturnType(['return type']);
        this.updateSpy.reset();
        procedureModel.setReturnType(null);

        chai.assert.isTrue(
            this.updateSpy.calledOnce, 'Expected an update to be triggered');
      });
  
      test('disabling the procedure triggers an update', function() {
        const procedureModel =
            new Blockly.procedures.ObservableProcedureModel(this.workspace);
        this.procedureMap.addProcedure(procedureModel);

        procedureModel.setEnabled(false);

        chai.assert.isTrue(
            this.updateSpy.calledOnce, 'Expected an update to be triggered');
      });
  
      test('enabling the procedure triggers an update', function() {
        const procedureModel =
            new Blockly.procedures.ObservableProcedureModel(this.workspace);
        this.procedureMap.addProcedure(procedureModel);
        procedureModel.setEnabled(false);
        this.updateSpy.reset();

        procedureModel.setEnabled(true);

        chai.assert.isTrue(
            this.updateSpy.calledOnce, 'Expected an update to be triggered');
      });

      test('inserting a parameter triggers an update', function() {
        const procedureModel =
            new Blockly.procedures.ObservableProcedureModel(this.workspace);
        this.procedureMap.addProcedure(procedureModel);

        procedureModel.insertParameter(
            new Blockly.procedures.ObservableParameterModel(this.workspace));

        chai.assert.isTrue(
            this.updateSpy.calledOnce, 'Expected an update to be triggered');
      });
  
      test('deleting a parameter triggers an update', function() {
        const procedureModel =
            new Blockly.procedures.ObservableProcedureModel(this.workspace);
        this.procedureMap.addProcedure(procedureModel);
        procedureModel.insertParameter(
            new Blockly.procedures.ObservableParameterModel(this.workspace));
        this.updateSpy.reset();

        procedureModel.deleteParameter(0);

        chai.assert.isTrue(
            this.updateSpy.calledOnce, 'Expected an update to be triggered');
      });
    });

    suite('parameter model updates', function() {
      test('setting the variable model triggers an update', function() {
        const procedureModel =
            new Blockly.procedures.ObservableProcedureModel(this.workspace);
        this.procedureMap.addProcedure(procedureModel);
        const parameterModel =
            new Blockly.procedures.ObservableParameterModel(this.workspace);
        procedureModel.insertParameter(parameterModel);
        this.updateSpy.reset();

        parameterModel.setVariable(
            new Blockly.VariableModel(this.workspace, 'variable'));

        chai.assert.isTrue(
            this.updateSpy.calledOnce, 'Expected an update to be triggered');
      });
  
      test('modifying the variable model does not trigger an update', function() {
        const procedureModel =
            new Blockly.procedures.ObservableProcedureModel(this.workspace);
        this.procedureMap.addProcedure(procedureModel);
        const parameterModel =
            new Blockly.procedures.ObservableParameterModel(this.workspace);
        procedureModel.insertParameter(parameterModel);
        const variableModel =
            new Blockly.VariableModel(this.workspace, 'variable');
        parameterModel.setVariable(variableModel);
        this.updateSpy.reset();

        variableModel.name = 'some name';
        variableModel.type = 'some type';

        chai.assert.isFalse(
            this.updateSpy.called, 'Expected no update to be triggered');
      });
    });
  });

  suite('event firing', function() {
    // TBA after the procedure map is implemented
  });

  suite('backing variable to parameters', function() {
    test(
        'construction references an existing variable if available',
        function() {
          const variable = this.workspace.createVariable('test1');
          const param = new Blockly.procedures.ObservableParameterModel(
              this.workspace, 'test1');

          console.log(param);

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
  })
});
