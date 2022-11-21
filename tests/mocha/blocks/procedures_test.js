/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

goog.declareModuleId('Blockly.test.procedures');

import * as Blockly from '../../../build/src/core/blockly.js';
import {ObservableParameterModel} from '../../../build/src/core/procedures.js';
import {assertCallBlockStructure, assertDefBlockStructure, createProcDefBlock, createProcCallBlock} from '../test_helpers/procedures.js';
import {assertEventNotFired, createChangeListenerSpy} from '../test_helpers/events.js';
import {runSerializationTestSuite} from '../test_helpers/serialization.js';
import {createGenUidStubWithReturns, sharedTestSetup, sharedTestTeardown, workspaceTeardown} from '../test_helpers/setup_teardown.js';


suite('Procedures', function() {
  setup(function() {
    sharedTestSetup.call(this);
    this.workspace = Blockly.inject('blocklyDiv', {});
    this.workspace.createVariable('preCreatedVar', '', 'preCreatedVarId');
    this.workspace.createVariable(
        'preCreatedTypedVar', 'type', 'preCreatedTypedVarId');
  });

  teardown(function() {
    sharedTestTeardown.call(this);
  });

  suite.only('updating data models', function() {
    test(
        'renaming a procedure def block updates the procedure model',
        function() {
          const defBlock = createProcDefBlock(this.workspace);

          defBlock.setFieldValue('new name', 'NAME');

          chai.assert.equal(
              defBlock.getProcedureModel().getName(),
              'new name',
              'Expected the procedure model name to be updated');
        });

    test(
        'disabling a procedure def block updates the procedure model',
        function() {
          const defBlock = createProcDefBlock(this.workspace);

          defBlock.setEnabled(false);

          chai.assert.isFalse(
              defBlock.getProcedureModel().getEnabled(),
              'Expected the procedure model to be disabled');
        });

    test(
        'adding a parameter to a procedure def updates the procedure model',
        function() {
          // Create a stack of container, parameter.
          const defBlock = createProcDefBlock(this.workspace);
          const containerBlock =
              this.workspace.newBlock('procedures_mutatorcontainer');
          const paramBlock = this.workspace.newBlock('procedures_mutatorarg');
          paramBlock.setFieldValue('param name', 'NAME');
          containerBlock.getInput('STACK').connection.connect(paramBlock.previousConnection);

          defBlock.compose(containerBlock);

          chai.assert.equal(
              defBlock.getProcedureModel().getParameter(0).getName(),
              'param name',
              'Expected the procedure model to have a matching parameter');
        });

    test('adding a parameter adds a variable to the variable map', function() {
      // Create a stack of container, parameter.
      const defBlock = createProcDefBlock(this.workspace);
      const containerBlock =
          this.workspace.newBlock('procedures_mutatorcontainer');
      const paramBlock = this.workspace.newBlock('procedures_mutatorarg');
      paramBlock.setFieldValue('param name', 'NAME');
      containerBlock.getInput('STACK').connection
          .connect(paramBlock.previousConnection);

      defBlock.compose(containerBlock);

      chai.assert.isTrue(
          this.workspace.getVariableMap().getVariables('')
               .some((variable) => variable.name === 'param name'),
          'Expected the variable map to have a matching variable');
    });


    test(
        'moving a parameter in the procedure def updates the procedure model',
        function() {
          // Create a stack of container, param1, param2.
          const defBlock = createProcDefBlock(this.workspace);
          const containerBlock =
              this.workspace.newBlock('procedures_mutatorcontainer');
          const paramBlock1 = this.workspace.newBlock('procedures_mutatorarg');
          paramBlock1.setFieldValue('param name1', 'NAME');
          const paramBlock2 = this.workspace.newBlock('procedures_mutatorarg');
          paramBlock2.setFieldValue('param name2', 'NAME');
          containerBlock.getInput('STACK').connection
              .connect(paramBlock1.previousConnection);
          paramBlock1.nextConnection.connect(paramBlock2.previousConnection);
          defBlock.compose(containerBlock);

          // Reconfigure the stack to be container, param2, param1.
          paramBlock2.previousConnection.disconnect();
          paramBlock1.previousConnection.disconnect();
          containerBlock.getInput('STACK').connection
              .connect(paramBlock2.previousConnection);
          paramBlock2.nextConnection.connect(paramBlock1.previousConnection);
          defBlock.compose(containerBlock);

          chai.assert.equal(
              defBlock.getProcedureModel().getParameter(0).getName(),
              'param name2',
              'Expected the first parameter of the procedure to be param 2');
          chai.assert.equal(
              defBlock.getProcedureModel().getParameter(1).getName(),
              'param name2',
              'Expected the second parameter of the procedure to be param 1');
        });

    test(
        'deleting a parameter from a procedure def updates the procedure model',
        function() {
          // Create a stack of container, parameter.
          const defBlock = createProcDefBlock(this.workspace);
          const containerBlock =
              this.workspace.newBlock('procedures_mutatorcontainer');
          const paramBlock = this.workspace.newBlock('procedures_mutatorarg');
          containerBlock.getInput('STACK').connection
              .connect(paramBlock.previousConnection);
          defBlock.compose(containerBlock);

          containerBlock.getInput('STACK').connection.disconnect();
          defBlock.compose(containerBlock);

          chai.assert.isEmpty(
              defBlock.getProcedureModel().getParameters(),
              'Expected the procedure model to have no parameters');
        });

    test('renaming a procedure parameter updates the parameter model', function() {
      // Create a stack of container, parameter.
      const defBlock = createProcDefBlock(this.workspace);
      const containerBlock =
          this.workspace.newBlock('procedures_mutatorcontainer');
      const paramBlock = this.workspace.newBlock('procedures_mutatorarg');
      paramBlock.setFieldValue('param name', 'NAME');
      containerBlock.getInput('STACK').connection
          .connect(paramBlock.previousConnection);
      defBlock.compose(containerBlock);

      paramBlock.setFieldValue('new param name', 'NAME');
      defBlock.compose(containerBlock);

      chai.assert.isEmpty(
          defBlock.getProcedureModel().getParameters(),
          'Expected the procedure model to have no parameters');
    });

    test('deleting a procedure deletes the procedure model', function() {
      const defBlock = createProcDefBlock(this.workspace);
      const model = defBlock.getProcedureModel();
      defBlock.dispose();

      chai.assert.isUndefined(
          this.workspace.getProcedureMap().get(model.getId()),
          'Expected the model to be removed from the procedure map');
    });
  });

  suite.skip('responding to data model updates', function() {
    suite('def blocks', function() {
      test('renaming the procedure data model updates blocks', function() {
        const defBlock = createProcDefBlock(this.workspace);
        const procModel = defBlock.getProcedureModel();

        procModel.setName('new name');

        chai.assert.equal(
          defBlock.getFieldValue('NAME'),
          'new name',
          'Expected the procedure block to be renamed');
      });
  
      test('disabling a procedure data model disables blocks', function() {
        const defBlock = createProcDefBlock(this.workspace);
        const procModel = defBlock.getProcedureModel();

        procModel.setEnabled(false);

        chai.assert.isFalse(
          defBlock.getEnabled(),
          'Expected the procedure block to be disabled');
      });
  
      test('adding a parameter to a data model updates blocks', function() {
        const defBlock = createProcDefBlock(this.workspace);
        const procModel = defBlock.getProcedureModel();

        procModel.insertParameter(
            new ObservableParameterModel(this.workspace, 'param1', 'id'), 0);

        chai.assert.isNotNull(
          defBlock.getField('PARAMS'),
          'Expected the params field to exist');
        chai.assert.isTrue(
          defBlock.getFieldValue('PARAMS').includes('param1'),
          'Expected the params field to contain the name of the new param');
      });
  
      test('moving a parameter in the data model updates blocks', function() {
        const defBlock = createProcDefBlock(this.workspace);
        const procModel = defBlock.getProcedureModel();
        const param1 =
            new ObservableParameterModel(this.workspace, 'param1', 'id1');
        const param2 =
            new ObservableParameterModel(this.workspace, 'param2', 'id2');
        procModel.insertParameter(param1, 0);
        procModel.insertParameter(param2, 1);

        procModel.deleteParameter(1);
        procModel.insertParameter(param2, 0);

        chai.assert.isNotNull(
          defBlock.getField('PARAMS'),
          'Expected the params field to exist');
        chai.assert.isTrue(
          defBlock.getFieldValue('PARAMS').includes('param2, param1'),
          'Expected the params field order to match the parameter order');
      });
  
      test(
          'deleting a parameter from the data model updates blocks',
          function() {
            const defBlock = createProcDefBlock(this.workspace);
            const procModel = defBlock.getProcedureModel();
            const param1 =
                new ObservableParameterModel(this.workspace, 'param1', 'id1');
            const param2 =
                new ObservableParameterModel(this.workspace, 'param2', 'id2');
            procModel.insertParameter(param1, 0);
            procModel.insertParameter(param2, 1);
    
            procModel.deleteParameter(0);
    
            chai.assert.isNotNull(
              defBlock.getField('PARAMS'),
              'Expected the params field to exist');
            chai.assert.isTrue(
              defBlock.getFieldValue('PARAMS').includes('param2'),
              'Expected the params field order to contain one parameter');
            chai.assert.isFalse(
              defBlock.getFieldValue('PARAMS').includes('param1'),
              'Expected the params field to not contain the deleted parameter');
          });
  
      test(
          'renaming a procedure parameter in the data model updates blocks',
          function() {
            const defBlock = createProcDefBlock(this.workspace);
            const procModel = defBlock.getProcedureModel();
            const param1 =
                new ObservableParameterModel(this.workspace, 'param1', 'id1');
            procModel.insertParameter(param1, 0);
    
            param1.setName('new name');
    
            chai.assert.isNotNull(
              defBlock.getField('PARAMS'),
              'Expected the params field to exist');
            chai.assert.isTrue(
              defBlock.getFieldValue('PARAMS').includes('new name'),
              'Expected the params field to contain the new param name');
          });
    });

    suite('caller blocks', function() {
      test('renaming the procedure data model updates blocks', function() {
        const defBlock = createProcDefBlock(this.workspace);
        const callBlock = createProcCallBlock(this.workspace);
        const procModel = defBlock.getProcedureModel();

        procModel.setName('new name');

        chai.assert.equal(
          callBlock.getFieldValue('NAME'),
          'new name',
          'Expected the procedure block to be renamed');
      });
  
      test('disabling a procedure data model disables blocks', function() {
        const defBlock = createProcDefBlock(this.workspace);
        const callBlock = createProcCallBlock(this.workspace);
        const procModel = defBlock.getProcedureModel();

        procModel.setEnabled(false);

        chai.assert.isFalse(
          callBlock.getEnabled(),
          'Expected the procedure block to be disabled');
      });
  
      test('adding a parameter to a data model updates blocks', function() {
        const defBlock = createProcDefBlock(this.workspace);
        const callBlock = createProcCallBlock(this.workspace);
        const procModel = defBlock.getProcedureModel();

        procModel.insertParameter(
            new ObservableParameterModel(this.workspace, 'param1', 'id'), 0);

        chai.assert.isNotNull(
          callBlock.getInput('ARG0'),
          'Expected the param input to exist');
        chai.assert.equal(
          callBlock.getFieldValue('ARGNAME0'),
          'param1',
          'Expected the params field to match the name of the new param');
      });
  
      test('moving a parameter in the data model updates blocks', function() {
        const defBlock = createProcDefBlock(this.workspace);
        const callBlock = createProcCallBlock(this.workspace);
        const procModel = defBlock.getProcedureModel();
        const param1 =
            new ObservableParameterModel(this.workspace, 'param1', 'id1');
        const param2 =
            new ObservableParameterModel(this.workspace, 'param2', 'id2');
        procModel.insertParameter(param1, 0);
        procModel.insertParameter(param2, 1);

        procModel.deleteParameter(1);
        procModel.insertParameter(param2, 0);

        chai.assert.isNotNull(
          callBlock.getInput('ARG0'),
          'Expected the first param input to exist');
        chai.assert.isNotNull(
          callBlock.getInput('ARG1'),
          'Expected the second param input to exist');
        chai.assert.equal(
          callBlock.getFieldValue('ARGNAME0'),
          'param1',
          'Expected the first params field to match the name of the param');
        chai.assert.equal(
          callBlock.getFieldValue('ARGNAME1'),
          'param2',
          'Expected the second params field to match the name of the param');
      });
  
      test(
          'deleting a parameter from the data model updates blocks',
          function() {
            const defBlock = createProcDefBlock(this.workspace);
            const callBlock = createProcCallBlock(this.workspace);
            const procModel = defBlock.getProcedureModel();
            const param1 =
                new ObservableParameterModel(this.workspace, 'param1', 'id1');
            const param2 =
                new ObservableParameterModel(this.workspace, 'param2', 'id2');
            procModel.insertParameter(param1, 0);
            procModel.insertParameter(param2, 1);
    
            procModel.deleteParameter(0);
    
            chai.assert.isNotNull(
              callBlock.getInput('ARG0'),
              'Expected the first param input to exist');
            chai.assert.isNull(
              callBlock.getInput('ARG1'),
              'Expected the second param input to not exist');
            chai.assert.equal(
              callBlock.getFieldValue('ARGNAME0'),
              'param2',
              'Expected the first params field to match the name of the param');
          });
  
      test(
          'renaming a procedure parameter in the data model updates blocks',
          function() {
            const defBlock = createProcDefBlock(this.workspace);
            const callBlock = createProcCallBlock(this.workspace);
            const procModel = defBlock.getProcedureModel();
            const param1 =
                new ObservableParameterModel(this.workspace, 'param1', 'id1');
            procModel.insertParameter(param1, 0);
    
            param1.setName('new name');
    
            chai.assert.isNotNull(
              callBlock.getInput('ARG0'),
              'Expected the param input to exist');
            chai.assert.equal(
              callBlock.getFieldValue('ARGNAME0'),
              'new name',
              'Expected the params field to match the new name of the param');
          });
    });
  });

  suite('Renaming procedures', function() {
    test('callers are updated to have the new name', function() {
      const defBlock = createProcDefBlock(this.workspace);
      const callBlock = createProcCallBlock(this.workspace);

      defBlock.setFieldValue('new name', 'NAME');

      chai.assert.equal(
        callBlock.getFieldValue('NAME'),
        'new name',
        'Expected the procedure block to be renamed');
    });

    test(
        'setting an illegal name results in both the ' +
        'procedure and the caller getting the legal name',
        function() {
          createProcDefBlock(this.workspace, undefined, undefined, 'procA');
          const defBlockB =
              createProcDefBlock(this.workspace, undefined, undefined, 'procB');
          const callBlockB =
              createProcCallBlock(this.workspace, undefined, 'procB');
    
          defBlockB.setFieldValue('procA', 'NAME');
    
          chai.assert.notEqual(
            defBlockB.getFieldValue('NAME'),
            'procA',
            'Expected the procedure def block to have a legal name');
          chai.assert.notEqual(
            callBlockB.getFieldValue('NAME'),
            'procA',
            'Expected the procedure call block to have a legal name');
        });
  });

  suite('Adding procedure parameters', function() {
    test('no variable create event is fired', function() {
      const eventSpy = createChangeListenerSpy(this.workspace);
      const defBlock = createProcDefBlock(this.workspace);
      defBlock.mutator.setVisible(true);
      const mutatorWorkspace = defBlock.mutator.getWorkspace();
      const containerBlock =
          mutatorWorkspace.newBlock('procedures_mutatorcontainer');
      const paramBlock = mutatorWorkspace.newBlock('procedures_mutatorarg');
      paramBlock.setFieldValue('param name', 'NAME');
      containerBlock.getInput('STACK').connection.connect(paramBlock.previousConnection);

      eventSpy.resetHistory();
      defBlock.compose(containerBlock);

      assertEventNotFired(
          eventSpy, Blockly.Events.VarCreate, {}, this.workspace.id);
    });

    test(
        'the mutator flyout updates to avoid parameter name conflicts',
        function() {
          const defBlock = createProcDefBlock(this.workspace);
          defBlock.mutator.setVisible(true);
          const mutatorWorkspace = defBlock.mutator.getWorkspace();
          const origFlyoutParamName =
              mutatorWorkspace.getFlyout().getWorkspace().getTopBlocks(true)[0]
                  .getFieldValue('NAME');
          Blockly.serialization.blocks.append(
            {
              'type': 'procedures_mutatorarg',
              'fields': {
                'NAME': origFlyoutParamName,
              },
            },
            mutatorWorkspace);
          
          const newFlyoutParamName =
              mutatorWorkspace.getFlyout().getWorkspace().getTopBlocks(true)[0]
                  .getFieldValue('NAME');
          chai.assert.notEqual(
              newFlyoutParamName,
              origFlyoutParamName,
              'Expected the flyout param to have updated to not conflict');
        });

    test('adding a parameter to the procedure updates procedure defs', function() {
      // Create a stack of container, parameter.
      const defBlock = createProcDefBlock(this.workspace);
      defBlock.mutator.setVisible(true);
      const mutatorWorkspace = defBlock.mutator.getWorkspace();
      const containerBlock =
          mutatorWorkspace.newBlock('procedures_mutatorcontainer');
      const paramBlock = mutatorWorkspace.newBlock('procedures_mutatorarg');
      paramBlock.setFieldValue('param1', 'NAME');
      containerBlock.getInput('STACK').connection.connect(paramBlock.previousConnection);

      defBlock.compose(containerBlock);

      chai.assert.isNotNull(
        defBlock.getField('PARAMS'),
        'Expected the params field to exist');
      chai.assert.isTrue(
        defBlock.getFieldValue('PARAMS').includes('param1'),
        'Expected the params field to contain the name of the new param');
    });

    test('adding a parameter to the procedure updates procedure callers', function() {
      // Create a stack of container, parameter.
      const defBlock = createProcDefBlock(this.workspace);
      const callBlock = createProcCallBlock(this.workspace);
      defBlock.mutator.setVisible(true);
      const mutatorWorkspace = defBlock.mutator.getWorkspace();
      const containerBlock =
          mutatorWorkspace.newBlock('procedures_mutatorcontainer');
      const paramBlock = mutatorWorkspace.newBlock('procedures_mutatorarg');
      paramBlock.setFieldValue('param1', 'NAME');
      containerBlock.getInput('STACK').connection.connect(paramBlock.previousConnection);

      defBlock.compose(containerBlock);

      chai.assert.isNotNull(
        callBlock.getInput('ARG0'),
        'Expected the param input to exist');
      chai.assert.equal(
        callBlock.getFieldValue('ARGNAME0'),
        'param1',
        'Expected the params field to match the name of the new param');
    });
  });

  suite('Renaming procedure parameters', function() {
    test('defs are updated for parameter renames', function() {
      // Create a stack of container, parameter.
      const defBlock = createProcDefBlock(this.workspace);
      defBlock.mutator.setVisible(true);
      const mutatorWorkspace = defBlock.mutator.getWorkspace();
      const containerBlock =
          mutatorWorkspace.newBlock('procedures_mutatorcontainer');
      const paramBlock = mutatorWorkspace.newBlock('procedures_mutatorarg');
      paramBlock.setFieldValue('param1', 'NAME');
      containerBlock.getInput('STACK').connection.connect(paramBlock.previousConnection);
      defBlock.compose(containerBlock);

      paramBlock.setFieldValue('new name', 'NAME');
      defBlock.compose(containerBlock);

      chai.assert.isNotNull(
        defBlock.getField('PARAMS'),
        'Expected the params field to exist');
      chai.assert.isTrue(
        defBlock.getFieldValue('PARAMS').includes('new name'),
        'Expected the params field to contain the new name of the param');
    });

    test('callers are updated for parameter renames', function() {
      // Create a stack of container, parameter.
      const defBlock = createProcDefBlock(this.workspace);
      const callBlock = createProcCallBlock(this.workspace);
      defBlock.mutator.setVisible(true);
      const mutatorWorkspace = defBlock.mutator.getWorkspace();
      const containerBlock =
          mutatorWorkspace.newBlock('procedures_mutatorcontainer');
      const paramBlock = mutatorWorkspace.newBlock('procedures_mutatorarg');
      paramBlock.setFieldValue('param1', 'NAME');
      containerBlock.getInput('STACK').connection.connect(paramBlock.previousConnection);
      defBlock.compose(containerBlock);

      paramBlock.setFieldValue('new name', 'NAME');
      defBlock.compose(containerBlock);

      chai.assert.isNotNull(
        callBlock.getInput('ARG0'),
        'Expected the param input to exist');
      chai.assert.equal(
        callBlock.getFieldValue('ARGNAME0'),
        'new name',
        'Expected the params field to match the name of the new param');
    });

    test(
        'variables associated with procedure parameters are not renamed',
        function() {
          // Create a stack of container, parameter.
          const defBlock = createProcDefBlock(this.workspace);
          const callBlock = createProcCallBlock(this.workspace);
          defBlock.mutator.setVisible(true);
          const mutatorWorkspace = defBlock.mutator.getWorkspace();
          const containerBlock =
              mutatorWorkspace.newBlock('procedures_mutatorcontainer');
          const paramBlock = mutatorWorkspace.newBlock('procedures_mutatorarg');
          paramBlock.setFieldValue('param1', 'NAME');
          containerBlock.getInput('STACK').connection.connect(paramBlock.previousConnection);
          defBlock.compose(containerBlock);
    
          paramBlock.setFieldValue('param2', 'NAME');
          defBlock.compose(containerBlock);
    
          chai.assert.isNotNull(
              this.workspace.getVariable('param1', ''),
              'Expected the old variable to continue to exist');
        });

    test(
        'renaming a variable associated with a parameter updates procedure defs',
        function() {
          // Create a stack of container, parameter.
          const defBlock = createProcDefBlock(this.workspace);
          defBlock.mutator.setVisible(true);
          const mutatorWorkspace = defBlock.mutator.getWorkspace();
          const containerBlock =
              mutatorWorkspace.newBlock('procedures_mutatorcontainer');
          const paramBlock = mutatorWorkspace.newBlock('procedures_mutatorarg');
          paramBlock.setFieldValue('param1', 'NAME');
          containerBlock.getInput('STACK').connection.connect(paramBlock.previousConnection);
          defBlock.compose(containerBlock);
          defBlock.mutator.setVisible(false);
    
          const variable = this.workspace.getVariable('param1', '');
          this.workspace.renameVariableById(variable.getId(), 'new name');
    
          chai.assert.isNotNull(
              defBlock.getField('PARAMS'),
              'Expected the params field to exist');
          chai.assert.isTrue(
              defBlock.getFieldValue('PARAMS').includes('new name'),
              'Expected the params field to contain the new name of the param');
        });

    test(
        'renaming a variable associated with a parameter updates procedure callers',
        function() {
          // Create a stack of container, parameter.
          const defBlock = createProcDefBlock(this.workspace);
          const callBlock = createProcCallBlock(this.workspace);
          defBlock.mutator.setVisible(true);
          const mutatorWorkspace = defBlock.mutator.getWorkspace();
          const containerBlock =
              mutatorWorkspace.newBlock('procedures_mutatorcontainer');
          const paramBlock = mutatorWorkspace.newBlock('procedures_mutatorarg');
          paramBlock.setFieldValue('param1', 'NAME');
          containerBlock.getInput('STACK').connection.connect(paramBlock.previousConnection);
          defBlock.compose(containerBlock);
          defBlock.mutator.setVisible(false);
    
          const variable = this.workspace.getVariable('param1', '');
          this.workspace.renameVariableById(variable.getId(), 'new name');

          chai.assert.isNotNull(
            callBlock.getInput('ARG0'),
            'Expected the param input to exist');
          chai.assert.equal(
            callBlock.getFieldValue('ARGNAME0'),
            'new name',
            'Expected the params field to match the name of the new param');
        });

    test.skip(
        'renaming a variable such that you get a parameter ' +
        'conflict does... something!',
        function() {

        });
  });

  suite('Reordering procedure parameters', function() {
    test('reordering procedure parameters updates procedure blocks', function() {
      // Create a stack of container, parameter, parameter.
      const defBlock = createProcDefBlock(this.workspace);
      defBlock.mutator.setVisible(true);
      const mutatorWorkspace = defBlock.mutator.getWorkspace();
      const containerBlock =
          mutatorWorkspace.newBlock('procedures_mutatorcontainer');
      const paramBlock1 = mutatorWorkspace.newBlock('procedures_mutatorarg');
      paramBlock1.setFieldValue('param1', 'NAME');
      const paramBlock2 = mutatorWorkspace.newBlock('procedures_mutatorarg');
      paramBlock2.setFieldValue('param2', 'NAME');
      containerBlock.getInput('STACK').connection.connect(paramBlock1.previousConnection);
      paramBlock1.nextConnection.connect(paramBlock2.previousConnection);
      defBlock.compose(containerBlock);

      // Reorder the parameters.
      paramBlock2.previousConnection.disconnect();
      paramBlock1.previousConnection.disconnect();
      containerBlock.getInput('STACK').connection.connect(paramBlock2.previousConnection);
      paramBlock2.nextConnection.connect(paramBlock1.previousConnection);
      defBlock.compose(containerBlock);

      chai.assert.isNotNull(
        defBlock.getField('PARAMS'),
        'Expected the params field to exist');
      chai.assert.isTrue(
        defBlock.getFieldValue('PARAMS').includes('param2, param1'),
        'Expected the params field order to match the parameter order');
    });

    test('reordering procedure parameters updates caller blocks', function() {
      // Create a stack of container, parameter, parameter.
      const defBlock = createProcDefBlock(this.workspace);
      const callBlock = createProcCallBlock(this.workspace);
      defBlock.mutator.setVisible(true);
      const mutatorWorkspace = defBlock.mutator.getWorkspace();
      const containerBlock =
          mutatorWorkspace.newBlock('procedures_mutatorcontainer');
      const paramBlock1 = mutatorWorkspace.newBlock('procedures_mutatorarg');
      paramBlock1.setFieldValue('param1', 'NAME');
      const paramBlock2 = mutatorWorkspace.newBlock('procedures_mutatorarg');
      paramBlock2.setFieldValue('param2', 'NAME');
      containerBlock.getInput('STACK').connection.connect(paramBlock1.previousConnection);
      paramBlock1.nextConnection.connect(paramBlock2.previousConnection);
      defBlock.compose(containerBlock);

      // Reorder the parameters.
      paramBlock2.previousConnection.disconnect();
      paramBlock1.previousConnection.disconnect();
      containerBlock.getInput('STACK').connection.connect(paramBlock2.previousConnection);
      paramBlock2.nextConnection.connect(paramBlock1.previousConnection);
      defBlock.compose(containerBlock);

      chai.assert.isNotNull(
        callBlock.getInput('ARG0'),
        'Expected the param input to exist');
      chai.assert.equal(
        callBlock.getFieldValue('ARGNAME0'),
        'param2',
        'Expected the params field to match the name of the second param');
      chai.assert.isNotNull(
        callBlock.getInput('ARG1'),
        'Expected the param input to exist');
      chai.assert.equal(
        callBlock.getFieldValue('ARGNAME1'),
        'param1',
        'Expected the params field to match the name of the first param');
    });

    test(
        'reordering procedure parameters reorders the blocks ' +
        'attached to caller inputs',
        function() {
          // Create a stack of container, parameter, parameter.
          const defBlock = createProcDefBlock(this.workspace);
          const callBlock = createProcCallBlock(this.workspace);
          defBlock.mutator.setVisible(true);
          const mutatorWorkspace = defBlock.mutator.getWorkspace();
          const containerBlock =
              mutatorWorkspace.newBlock('procedures_mutatorcontainer');
          const paramBlock1 = mutatorWorkspace.newBlock('procedures_mutatorarg');
          paramBlock1.setFieldValue('param1', 'NAME');
          const paramBlock2 = mutatorWorkspace.newBlock('procedures_mutatorarg');
          paramBlock2.setFieldValue('param2', 'NAME');
          containerBlock.getInput('STACK').connection.connect(paramBlock1.previousConnection);
          paramBlock1.nextConnection.connect(paramBlock2.previousConnection);
          defBlock.compose(containerBlock);

          // Add args to the parameter inputs on the caller.
          const block1 = this.workspace.newBlock('text');
          const block2 = this.workspace.newBlock('text');
          callBlock.getInput('ARG0').connection
              .connect(block1.outputConnection);
          callBlock.getInput('ARG1').connection
              .connect(block2.outputConnection);
    
          // Reorder the parameters.
          paramBlock2.previousConnection.disconnect();
          paramBlock1.previousConnection.disconnect();
          containerBlock.getInput('STACK').connection.connect(paramBlock2.previousConnection);
          paramBlock2.nextConnection.connect(paramBlock1.previousConnection);
          defBlock.compose(containerBlock);
    
          chai.assert.equal(
            callBlock.getInputTargetBlock('ARG0'),
            block2,
            'Expected the second block to be in the first slot');
          chai.assert.equal(
            callBlock.getInputTargetBlock('ARG1'),
            block1,
            'Expected the first block to be in the second slot');
        });
  });

  suite('Enabling and disabling procedure blocks', function() {
    test(
        'if a procedure definition is disabled, the procedure caller ' +
        'is also disabled',
        function() {
          const defBlock = createProcDefBlock(this.workspace);
          const callBlock = createProcCallBlock(this.workspace);

          defBlock.setEnabled(false);

          chai.assert.isFalse(
              callBlock.isEnabled(),
              'Expected the caller block to be disabled');
        });

    test(
        'if a procedure definition is enabled, the procedure caller ' +
        'is also enabled',
        function() {
          const defBlock = createProcDefBlock(this.workspace);
          const callBlock = createProcCallBlock(this.workspace);
          defBlock.setEnabled(false);

          defBlock.setEnabled(true);

          chai.assert.isTrue(
              callBlock.isEnabled(),
              'Expected the caller block to be enabled');
        });

    test(
        'if a procedure caller block was already disabled before ' +
        'its definition was disabled, it is not reenabled',
        function() {
          const defBlock = createProcDefBlock(this.workspace);
          const callBlock = createProcCallBlock(this.workspace);
          callBlock.setEnabled(false);
          defBlock.setEnabled(false);

          defBlock.setEnabled(true);

          chai.assert.isFalse(
              callBlock.isEnabled(),
              'Expected the caller block to continue to be disabled');
        });
  });

  suite('Deleting procedure blocks', function() {
    // Currently fails because of event ordering.
    test.skip(
        'when the procedure definition block is deleted, all of its ' +
        'associated callers are deleted as well',
        function() {
          const defBlock = createProcDefBlock(this.workspace);
          const callBlock1 = createProcCallBlock(this.workspace);
          const callBlock2 = createProcCallBlock(this.workspace);

          this.clock.runAll();
          chai.assert.isTrue(
              callBlock1.disposed, 'Expected the first caller to be disposed');
          chai.assert.isTrue(
              callBlock2.disposed, 'Expected the second caller to be disposed');
        });
  });

  suite('allProcedures', function() {
    test('Only Procedures', function() {
      const noReturnBlock = this.workspace.newBlock('procedures_defnoreturn');
      noReturnBlock.setFieldValue('no return', 'NAME');
      const returnBlock = this.workspace.newBlock('procedures_defreturn');
      returnBlock.setFieldValue('return', 'NAME');

      const allProcedures = Blockly.Procedures.allProcedures(this.workspace);
      chai.assert.lengthOf(allProcedures, 2);

      chai.assert.lengthOf(allProcedures[0], 1);
      chai.assert.equal(allProcedures[0][0][0], 'no return');

      chai.assert.lengthOf(allProcedures[1], 1);
      chai.assert.equal(allProcedures[1][0][0], 'return');
    });

    test('Multiple Blocks', function() {
      const noReturnBlock = this.workspace.newBlock('procedures_defnoreturn');
      noReturnBlock.setFieldValue('no return', 'NAME');
      const returnBlock = this.workspace.newBlock('procedures_defreturn');
      returnBlock.setFieldValue('return', 'NAME');
      const returnBlock2 = this.workspace.newBlock('procedures_defreturn');
      returnBlock2.setFieldValue('return2', 'NAME');
      const _ = this.workspace.newBlock('controls_if');

      const allProcedures = Blockly.Procedures.allProcedures(this.workspace);
      chai.assert.lengthOf(allProcedures, 2);

      chai.assert.lengthOf(allProcedures[0], 1);
      chai.assert.equal(allProcedures[0][0][0], 'no return');

      chai.assert.lengthOf(allProcedures[1], 2);
      chai.assert.equal(allProcedures[1][0][0], 'return');
      chai.assert.equal(allProcedures[1][1][0], 'return2');
    });

    test('No Procedures', function() {
      const _ = this.workspace.newBlock('controls_if');
      const allProcedures = Blockly.Procedures.allProcedures(this.workspace);
      chai.assert.lengthOf(allProcedures, 2);
      chai.assert.lengthOf(allProcedures[0], 0, 'No procedures_defnoreturn blocks expected');
      chai.assert.lengthOf(allProcedures[1], 0, 'No procedures_defreturn blocks expected');
    });
  });

  suite('isNameUsed', function() {
    test('No Blocks', function() {
      chai.assert.isFalse(
          Blockly.Procedures.isNameUsed('name1', this.workspace)
      );
    });
  });

  suite('Multiple block serialization', function() {
    function assertDefAndCallBlocks(workspace, noReturnNames, returnNames, hasCallers) {
      const allProcedures = Blockly.Procedures.allProcedures(workspace);
      const defNoReturnBlocks = allProcedures[0];
      chai.assert.lengthOf(defNoReturnBlocks, noReturnNames.length);
      for (let i = 0; i < noReturnNames.length; i++) {
        const expectedName = noReturnNames[i];
        chai.assert.equal(defNoReturnBlocks[i][0], expectedName);
        if (hasCallers) {
          const callers =
              Blockly.Procedures.getCallers(expectedName, workspace);
          chai.assert.lengthOf(callers, 1);
        }
      }
      const defReturnBlocks = allProcedures[1];
      chai.assert.lengthOf(defReturnBlocks, returnNames.length);
      for (let i = 0; i < returnNames.length; i++) {
        const expectedName = returnNames[i];
        chai.assert.equal(defReturnBlocks[i][0], expectedName);
        if (hasCallers) {
          const callers =
              Blockly.Procedures.getCallers(expectedName, workspace);
          chai.assert.lengthOf(callers, 1);
        }
      }

      // Expecting def and caller blocks are the only blocks on workspace
      let expectedCount = noReturnNames.length + returnNames.length;
      if (hasCallers) {
        expectedCount *= 2;
      }
      const blocks = workspace.getAllBlocks(false);
      chai.assert.lengthOf(blocks, expectedCount);
    }

    suite('no name renamed to unnamed', function() {
      test('defnoreturn and defreturn', function() {
        const xml = Blockly.Xml.textToDom(`
              <xml xmlns="https://developers.google.com/blockly/xml">
                <block type="procedures_defnoreturn"/>
                <block type="procedures_defreturn"/>
              </xml>`);
        Blockly.Xml.domToWorkspace(xml, this.workspace);
        assertDefAndCallBlocks(
            this.workspace, ['unnamed'], ['unnamed2'], false);
      });

      test('defreturn and defnoreturn', function() {
        const xml = Blockly.Xml.textToDom(`
              <xml xmlns="https://developers.google.com/blockly/xml">
                <block type="procedures_defreturn"/>
                <block type="procedures_defnoreturn"/>
              </xml>`);
        Blockly.Xml.domToWorkspace(xml, this.workspace);
        assertDefAndCallBlocks(
            this.workspace, ['unnamed2'], ['unnamed'], false);
      });

      test('callnoreturn (no def in xml)', function() {
        const xml = Blockly.Xml.textToDom(`
              <xml xmlns="https://developers.google.com/blockly/xml">
                <block type="procedures_callnoreturn"/>
              </xml>`);
        Blockly.Xml.domToWorkspace(xml, this.workspace);
        assertDefAndCallBlocks(
            this.workspace, ['unnamed'], [], true);
      });

      test('callreturn (no def in xml)', function() {
        const xml = Blockly.Xml.textToDom(`
              <xml xmlns="https://developers.google.com/blockly/xml">
                <block type="procedures_callreturn"/>
              </xml>`);
        Blockly.Xml.domToWorkspace(xml, this.workspace);
        assertDefAndCallBlocks(
            this.workspace, [], ['unnamed'], true);
      });

      test('callnoreturn and callreturn (no def in xml)', function() {
        const xml = Blockly.Xml.textToDom(`
              <xml xmlns="https://developers.google.com/blockly/xml">
                <block type="procedures_callnoreturn"/>
                <block type="procedures_callreturn"/>
              </xml>`);
        Blockly.Xml.domToWorkspace(xml, this.workspace);
        assertDefAndCallBlocks(
            this.workspace, ['unnamed'], ['unnamed2'], true);
      });

      test('callreturn and callnoreturn (no def in xml)', function() {
        const xml = Blockly.Xml.textToDom(`
              <xml xmlns="https://developers.google.com/blockly/xml">
                <block type="procedures_callreturn"/>
                <block type="procedures_callnoreturn"/>
              </xml>`);
        Blockly.Xml.domToWorkspace(xml, this.workspace);
        assertDefAndCallBlocks(
            this.workspace, ['unnamed2'], ['unnamed'], true);
      });
    });

    suite('caller param mismatch', function() {
      setup(function() {
        this.TEST_VAR_ID = 'test-id';
        this.genUidStub = createGenUidStubWithReturns(this.TEST_VAR_ID);
      });

      test('callreturn with missing args', function() {
        const defBlock = Blockly.Xml.domToBlock(Blockly.Xml.textToDom(`
            <block type="procedures_defreturn">
              <field name="NAME">do something</field>
              <mutation>
                <arg name="x" varid="arg"></arg>
              </mutation>
            </block>
        `), this.workspace);
        const callBlock = Blockly.Xml.domToBlock(Blockly.Xml.textToDom(
            '<block type="procedures_callreturn">' +
            '  <mutation name="do something"/>' +
            '</block>'
        ), this.workspace);
        assertDefBlockStructure(defBlock, true, ['x'], ['arg']);
        assertCallBlockStructure(callBlock, [], [], 'do something2');
      });

      test('callreturn with bad args', function() {
        const defBlock = Blockly.Xml.domToBlock(Blockly.Xml.textToDom(`
            <block type="procedures_defreturn">
              <field name="NAME">do something</field>
              <mutation>
                <arg name="x" varid="arg"></arg>
              </mutation>
            </block>
        `), this.workspace);
        const callBlock = Blockly.Xml.domToBlock(Blockly.Xml.textToDom(`
            <block type="procedures_callreturn">
              <mutation name="do something">
                <arg name="y"></arg>
              </mutation>
            </block>
        `), this.workspace);
        assertDefBlockStructure(defBlock, true, ['x'], ['arg']);
        assertCallBlockStructure(
            callBlock, ['y'], [this.TEST_VAR_ID], 'do something2');
      });

      test('callnoreturn with missing args', function() {
        const defBlock = Blockly.Xml.domToBlock(Blockly.Xml.textToDom(`
            <block type="procedures_defnoreturn">
              <field name="NAME">do something</field>
              <mutation>
                <arg name="x" varid="arg"></arg>
              </mutation>
            </block>
        `), this.workspace);
        const callBlock = Blockly.Xml.domToBlock(Blockly.Xml.textToDom(
            '<block type="procedures_callnoreturn">' +
            '  <mutation name="do something"/>' +
            '</block>'
        ), this.workspace);
        assertDefBlockStructure(defBlock, false, ['x'], ['arg']);
        assertCallBlockStructure(callBlock, [], [], 'do something2');
      });

      test('callnoreturn with bad args', function() {
        const defBlock = Blockly.Xml.domToBlock(Blockly.Xml.textToDom(`
            <block type="procedures_defnoreturn">
              <field name="NAME">do something</field>
              <mutation>
                <arg name="x" varid="arg"></arg>
              </mutation>
            </block>
        `), this.workspace);
        const callBlock = Blockly.Xml.domToBlock(Blockly.Xml.textToDom(`
            <block type="procedures_callnoreturn">
              <mutation name="do something">
                <arg name="y"></arg>
              </mutation>
            </block>
        `), this.workspace);
        assertDefBlockStructure(defBlock, false, ['x'], ['arg']);
        assertCallBlockStructure(
            callBlock, ['y'], [this.TEST_VAR_ID], 'do something2');
      });
    });
  });

  suite('getDefinition - Modified cases', function() {
    setup(function() {
      Blockly.Blocks['new_proc'] = {
        init: function() { },
        getProcedureDef: function() {
          return [this.name, [], false];
        },
        name: 'test',
      };

      Blockly.Blocks['nested_proc'] = {
        init: function() {
          this.setPreviousStatement(true, null);
          this.setNextStatement(true, null);
        },
        getProcedureDef: function() {
          return [this.name, [], false];
        },
        name: 'test',
      };
    });

    teardown(function() {
      delete Blockly.Blocks['new_proc'];
      delete Blockly.Blocks['nested_proc'];
    });

    test('Custom procedure block', function() {
      // Do not require procedures to be the built-in procedures.
      const defBlock = this.workspace.newBlock('new_proc');
      const def = Blockly.Procedures.getDefinition('test', this.workspace);
      chai.assert.equal(def, defBlock);
    });

    test('Stacked procedures', function() {
      const blockA = this.workspace.newBlock('nested_proc');
      const blockB = this.workspace.newBlock('nested_proc');
      blockA.name = 'a';
      blockB.name = 'b';
      blockA.nextConnection.connect(blockB.previousConnection);
      const def = Blockly.Procedures.getDefinition('b', this.workspace);
      chai.assert.equal(def, blockB);
    });
  });

  const testSuites = [
    {title: 'procedures_defreturn', hasReturn: true,
      defType: 'procedures_defreturn', callType: 'procedures_callreturn'},
    {title: 'procedures_defnoreturn', hasReturn: false,
      defType: 'procedures_defnoreturn', callType: 'procedures_callnoreturn'},
  ];

  testSuites.forEach((testSuite) => {
    suite(testSuite.title, function() {
      suite('Structure', function() {
        setup(function() {
          this.defBlock = this.workspace.newBlock(testSuite.defType);
          this.defBlock.setFieldValue('proc name', 'NAME');
        });
        test('Definition block', function() {
          assertDefBlockStructure(this.defBlock, testSuite.hasReturn);
        });

        test('Call block', function() {
          this.callBlock = this.workspace.newBlock(testSuite.callType);
          this.callBlock.setFieldValue('proc name', 'NAME');
          assertCallBlockStructure(this.callBlock);
        });
      });
      suite('isNameUsed', function() {
        setup(function() {
          this.defBlock = this.workspace.newBlock(testSuite.defType);
          this.defBlock.setFieldValue('proc name', 'NAME');
          this.callBlock = this.workspace.newBlock(testSuite.callType);
          this.callBlock.setFieldValue('proc name', 'NAME');
        });
        test('True', function() {
          chai.assert.isTrue(
              Blockly.Procedures.isNameUsed('proc name', this.workspace));
        });
        test('False', function() {
          chai.assert.isFalse(
              Blockly.Procedures.isNameUsed('unused proc name', this.workspace));
        });
      });
      suite('rename', function() {
        setup(function() {
          this.defBlock = this.workspace.newBlock(testSuite.defType);
          this.defBlock.setFieldValue('proc name', 'NAME');
          this.callBlock = this.workspace.newBlock(testSuite.callType);
          this.callBlock.setFieldValue('proc name', 'NAME');
          sinon.stub(this.defBlock.getField('NAME'), 'resizeEditor_');
        });
        test('Simple, Programmatic', function() {
          this.defBlock.setFieldValue(
              this.defBlock.getFieldValue('NAME') + '2',
              'NAME'
          );
          chai.assert.equal(
              this.defBlock.getFieldValue('NAME'), 'proc name2');
          chai.assert.equal(
              this.callBlock.getFieldValue('NAME'), 'proc name2');
        });
        test('Simple, Input', function() {
          const defInput = this.defBlock.getField('NAME');
          defInput.htmlInput_ = document.createElement('input');
          defInput.htmlInput_.setAttribute('data-untyped-default-value', 'proc name');

          defInput.htmlInput_.value = 'proc name2';
          defInput.onHtmlInputChange_(null);
          chai.assert.equal(
              this.defBlock.getFieldValue('NAME'), 'proc name2');
          chai.assert.equal(
              this.callBlock.getFieldValue('NAME'), 'proc name2');
        });
        test('lower -> CAPS', function() {
          const defInput = this.defBlock.getField('NAME');
          defInput.htmlInput_ = document.createElement('input');
          defInput.htmlInput_.setAttribute('data-untyped-default-value', 'proc name');

          defInput.htmlInput_.value = 'PROC NAME';
          defInput.onHtmlInputChange_(null);
          chai.assert.equal(
              this.defBlock.getFieldValue('NAME'), 'PROC NAME');
          chai.assert.equal(
              this.callBlock.getFieldValue('NAME'), 'PROC NAME');
        });
        test('CAPS -> lower', function() {
          this.defBlock.setFieldValue('PROC NAME', 'NAME');
          this.callBlock.setFieldValue('PROC NAME', 'NAME');
          const defInput = this.defBlock.getField('NAME');
          defInput.htmlInput_ = document.createElement('input');
          defInput.htmlInput_.setAttribute('data-untyped-default-value', 'PROC NAME');

          defInput.htmlInput_.value = 'proc name';
          defInput.onHtmlInputChange_(null);
          chai.assert.equal(
              this.defBlock.getFieldValue('NAME'), 'proc name');
          chai.assert.equal(
              this.callBlock.getFieldValue('NAME'), 'proc name');
        });
        test('Whitespace', function() {
          const defInput = this.defBlock.getField('NAME');
          defInput.htmlInput_ = document.createElement('input');
          defInput.htmlInput_.setAttribute('data-untyped-default-value', 'proc name');

          defInput.htmlInput_.value = 'proc name ';
          defInput.onHtmlInputChange_(null);
          chai.assert.equal(
              this.defBlock.getFieldValue('NAME'), 'proc name');
          chai.assert.equal(
              this.callBlock.getFieldValue('NAME'), 'proc name');
        });
        test('Whitespace then Text', function() {
          const defInput = this.defBlock.getField('NAME');
          defInput.htmlInput_ = document.createElement('input');
          defInput.htmlInput_.setAttribute('data-untyped-default-value', 'proc name');

          defInput.htmlInput_.value = 'proc name ';
          defInput.onHtmlInputChange_(null);
          defInput.htmlInput_.value = 'proc name 2';
          defInput.onHtmlInputChange_(null);
          chai.assert.equal(
              this.defBlock.getFieldValue('NAME'), 'proc name 2');
          chai.assert.equal(
              this.callBlock.getFieldValue('NAME'), 'proc name 2');
        });
        test('Set Empty', function() {
          const defInput = this.defBlock.getField('NAME');
          defInput.htmlInput_ = document.createElement('input');
          defInput.htmlInput_.setAttribute('data-untyped-default-value', 'proc name');

          defInput.htmlInput_.value = '';
          defInput.onHtmlInputChange_(null);
          chai.assert.equal(
              this.defBlock.getFieldValue('NAME'),
              Blockly.Msg['UNNAMED_KEY']);
          chai.assert.equal(
              this.callBlock.getFieldValue('NAME'),
              Blockly.Msg['UNNAMED_KEY']);
        });
        test('Set Empty, and Create New', function() {
          const defInput = this.defBlock.getField('NAME');
          defInput.htmlInput_ = document.createElement('input');
          defInput.htmlInput_.setAttribute('data-untyped-default-value', 'proc name');

          defInput.htmlInput_.value = '';
          defInput.onHtmlInputChange_(null);
          const newDefBlock = this.workspace.newBlock(testSuite.defType);
          newDefBlock.setFieldValue('new name', 'NAME');
          chai.assert.equal(
              this.defBlock.getFieldValue('NAME'),
              Blockly.Msg['UNNAMED_KEY']);
          chai.assert.equal(
              this.callBlock.getFieldValue('NAME'),
              Blockly.Msg['UNNAMED_KEY']);
        });
      });
      suite('getCallers', function() {
        setup(function() {
          this.defBlock = this.workspace.newBlock(testSuite.defType);
          this.defBlock.setFieldValue('proc name', 'NAME');
          this.callBlock = this.workspace.newBlock(testSuite.callType);
          this.callBlock.setFieldValue('proc name', 'NAME');
        });
        test('Simple', function() {
          const callers =
              Blockly.Procedures.getCallers('proc name', this.workspace);
          chai.assert.equal(callers.length, 1);
          chai.assert.equal(callers[0], this.callBlock);
        });
        test('Multiple Callers', function() {
          const caller2 = this.workspace.newBlock(testSuite.callType);
          caller2.setFieldValue('proc name', 'NAME');
          const caller3 = this.workspace.newBlock(testSuite.callType);
          caller3.setFieldValue('proc name', 'NAME');

          const callers =
              Blockly.Procedures.getCallers('proc name', this.workspace);
          chai.assert.equal(callers.length, 3);
          chai.assert.equal(callers[0], this.callBlock);
          chai.assert.equal(callers[1], caller2);
          chai.assert.equal(callers[2], caller3);
        });
        test('Multiple Procedures', function() {
          const def2 = this.workspace.newBlock(testSuite.defType);
          def2.setFieldValue('proc name2', 'NAME');
          const caller2 = this.workspace.newBlock(testSuite.callType);
          caller2.setFieldValue('proc name2', 'NAME');

          const callers =
              Blockly.Procedures.getCallers('proc name', this.workspace);
          chai.assert.equal(callers.length, 1);
          chai.assert.equal(callers[0], this.callBlock);
        });
        // This can occur if you:
        //  1) Create an uppercase definition and call block.
        //  2) Delete both blocks.
        //  3) Create a lowercase definition and call block.
        //  4) Retrieve the uppercase call block from the trashcan.
        // (And vise versa for creating lowercase blocks first)
        // When converted to code all function names will be lowercase, so a
        // caller should still be returned for a differently-cased procedure.
        test('Call Different Case', function() {
          this.callBlock.setFieldValue('PROC NAME', 'NAME');
          const callers =
              Blockly.Procedures.getCallers('proc name', this.workspace);
          chai.assert.equal(callers.length, 1);
          chai.assert.equal(callers[0], this.callBlock);
        });
        test('Multiple Workspaces', function() {
          const workspace = new Blockly.Workspace();
          try {
            const def2 = workspace.newBlock(testSuite.defType);
            def2.setFieldValue('proc name', 'NAME');
            const caller2 = workspace.newBlock(testSuite.callType);
            caller2.setFieldValue('proc name', 'NAME');

            let callers =
                Blockly.Procedures.getCallers('proc name', this.workspace);
            chai.assert.equal(callers.length, 1);
            chai.assert.equal(callers[0], this.callBlock);

            callers = Blockly.Procedures.getCallers('proc name', workspace);
            chai.assert.equal(callers.length, 1);
            chai.assert.equal(callers[0], caller2);
          } finally {
            workspaceTeardown.call(this, workspace);
          }
        });
      });
      suite('getDefinition', function() {
        setup(function() {
          this.defBlock = this.workspace.newBlock(testSuite.defType);
          this.defBlock.setFieldValue('proc name', 'NAME');
          this.callBlock = this.workspace.newBlock(testSuite.callType);
          this.callBlock.setFieldValue('proc name', 'NAME');
        });
        test('Simple', function() {
          const def =
              Blockly.Procedures.getDefinition('proc name', this.workspace);
          chai.assert.equal(def, this.defBlock);
        });
        test('Multiple Procedures', function() {
          const def2 = this.workspace.newBlock(testSuite.defType);
          def2.setFieldValue('proc name2', 'NAME');
          const caller2 = this.workspace.newBlock(testSuite.callType);
          caller2.setFieldValue('proc name2', 'NAME');

          const def =
              Blockly.Procedures.getDefinition('proc name', this.workspace);
          chai.assert.equal(def, this.defBlock);
        });
        test('Multiple Workspaces', function() {
          const workspace = new Blockly.Workspace();
          try {
            const def2 = workspace.newBlock(testSuite.defType);
            def2.setFieldValue('proc name', 'NAME');
            const caller2 = workspace.newBlock(testSuite.callType);
            caller2.setFieldValue('proc name', 'NAME');

            let def =
                Blockly.Procedures.getDefinition('proc name', this.workspace);
            chai.assert.equal(def, this.defBlock);

            def = Blockly.Procedures.getDefinition('proc name', workspace);
            chai.assert.equal(def, def2);
          } finally {
            workspaceTeardown.call(this, workspace);
          }
        });
      });

      suite('Enable/Disable', function() {
        setup(function() {
          const toolbox = document.getElementById('toolbox-categories');
          this.workspaceSvg = Blockly.inject('blocklyDiv', {toolbox: toolbox});
        });
        teardown(function() {
          workspaceTeardown.call(this, this.workspaceSvg);
        });
        const domText = (testSuite.defType === 'procedures_defreturn') ?
            ('<xml xmlns="https://developers.google.com/blockly/xml">' +
                '<block type="procedures_defreturn" id="bar-def">' +
                '<field name="NAME">bar</field>' +
                '<value name="RETURN">' +
                '<block type="procedures_callreturn" id="bar-c1">' +
                '<mutation name="bar"></mutation>' +
                '</block>' +
                '</value>' +
                '</block>' +
                '<block type="procedures_callreturn" id="bar-c2">' +
                '<mutation name="bar"></mutation>' +
                '</block>' +
                '</xml>') :
            ('<xml xmlns="https://developers.google.com/blockly/xml">' +
                '<block type="procedures_defnoreturn" id="bar-def">' +
                '<field name="NAME">bar</field>' +
                '</block>' +
                '<block type="procedures_callnoreturn" id="bar-c1">' +
                '<mutation name="bar"></mutation>' +
                '</block>' +
                '<block type="procedures_callnoreturn" id="bar-c2">' +
                '<mutation name="bar"></mutation>' +
                '</block>' +
                '</xml>');
        setup(function() {
          const dom = Blockly.Xml.textToDom(domText);

          Blockly.Xml.appendDomToWorkspace(dom, this.workspaceSvg);
          this.barDef = this.workspaceSvg.getBlockById('bar-def');
          this.barCalls = [
            this.workspaceSvg.getBlockById('bar-c1'),
            this.workspaceSvg.getBlockById('bar-c2'),
          ];
        });

        test('Set disabled updates callers', function() {
          this.workspaceSvg.clearUndo();
          Blockly.Events.setGroup('g1');
          this.barDef.setEnabled(false);
          Blockly.Events.setGroup(false);

          for (let i = 0; i < 2; i++) {
            chai.assert.isFalse(this.barCalls[i].isEnabled(),
                'Callers are disabled when their definition is disabled (call ' +
                i + ')');
          }
          const firedEvents = this.workspaceSvg.undoStack_;
          chai.assert.equal(firedEvents.length, 3,
              'An event was fired for the definition and each caller');
          for (let i = 0; i < 3; i++) {
            chai.assert.equal(firedEvents[i].group, 'g1',
                'Disable events are in the same group (event ' + i + ')');
          }

          this.workspaceSvg.clearUndo();
          Blockly.Events.setGroup('g2');
          this.barDef.setEnabled(true);
          Blockly.Events.setGroup(false);

          for (let i = 0; i < 2; i++) {
            chai.assert.isTrue(this.barCalls[i].isEnabled(),
                'Callers are enabled when their definition is enabled (call ' +
                i + ')');
          }
          chai.assert.equal(firedEvents.length, 3,
              'An event was fired for the definition and each caller');
          for (let i = 0; i < 3; i++) {
            chai.assert.equal(firedEvents[i].group, 'g2',
                'Enable events are in the same group (event ' + i + ')');
          }
        });
        test('Set disabled updates callers while remembering old caller state', function() {
          this.barCalls[0].setEnabled(false);
          this.workspaceSvg.clearUndo();
          Blockly.Events.setGroup('g1');
          this.barDef.setEnabled(false);
          Blockly.Events.setGroup(false);

          for (let i = 0; i < 2; i++) {
            chai.assert.isFalse(this.barCalls[i].isEnabled(),
                'Callers are disabled when their definition is disabled (call ' +
                i + ')');
          }
          const firedEvents = this.workspaceSvg.undoStack_;
          chai.assert.equal(firedEvents.length, 2,
              'An event was fired for the definition and the enabled caller');
          for (let i = 0; i < 2; i++) {
            chai.assert.equal(firedEvents[i].group, 'g1',
                'Disable events are in the same group (event ' + i + ')');
          }

          this.workspaceSvg.clearUndo();
          Blockly.Events.setGroup('g2');
          this.barDef.setEnabled(true);
          Blockly.Events.setGroup(false);

          chai.assert.isFalse(this.barCalls[0].isEnabled(),
              'Caller remains in disabled state when the definition is enabled');
          chai.assert.isTrue(this.barCalls[1].isEnabled(),
              'Caller returns to previous enabled state when the definition is enabled');
          chai.assert.equal(firedEvents.length, 2,
              'An event was fired for the definition and the enabled caller');
          for (let i = 0; i < 2; i++) {
            chai.assert.equal(firedEvents[i].group, 'g2',
                'Enable events are in the same group (event ' + i + ')');
          }
        });
      });
      suite('Mutation', function() {
        setup(function() {
          this.defBlock = this.workspace.newBlock(testSuite.defType);
          this.defBlock.setFieldValue('proc name', 'NAME');
          this.callBlock = this.workspace.newBlock(testSuite.callType);
          this.callBlock.setFieldValue('proc name', 'NAME');
          this.findParentStub = sinon.stub(Blockly.Mutator, 'findParentWs')
              .returns(this.workspace);
        });
        teardown(function() {
          this.findParentStub.restore();
        });
        suite('Composition', function() {
          suite('Statements', function() {
            function setStatementValue(mainWorkspace, defBlock, value) {
              const mutatorWorkspace = new Blockly.Workspace(
                  new Blockly.Options({
                    parentWorkspace: mainWorkspace,
                  }));
              defBlock.decompose(mutatorWorkspace);
              const containerBlock = mutatorWorkspace.getTopBlocks()[0];
              const statementField = containerBlock.getField('STATEMENTS');
              statementField.setValue(value);
              defBlock.compose(containerBlock);
            }
            if (testSuite.defType === 'procedures_defreturn') {
              test('Has Statements', function() {
                setStatementValue(this.workspace, this.defBlock, true);
                chai.assert.isTrue(this.defBlock.hasStatements_);
              });
              test('Has No Statements', function() {
                setStatementValue(this.workspace, this.defBlock, false);
                chai.assert.isFalse(this.defBlock.hasStatements_);
              });
              test('Saving Statements', function() {
                const blockXml = Blockly.Xml.textToDom(
                    '<block type="procedures_defreturn">' +
                    '  <statement name="STACK">' +
                    '    <block type="procedures_ifreturn" id="test"></block>' +
                    '  </statement> ' +
                    '</block>'
                );
                const defBlock = Blockly.Xml.domToBlock(blockXml, this.workspace);
                setStatementValue(this.workspace, defBlock, false);
                chai.assert.isNull(defBlock.getInput('STACK'));
                setStatementValue(this.workspace, defBlock, true);
                chai.assert.isNotNull(defBlock.getInput('STACK'));
                const statementBlocks = defBlock.getChildren();
                chai.assert.equal(statementBlocks.length, 1);
                const block = statementBlocks[0];
                chai.assert.equal(block.type, 'procedures_ifreturn');
                chai.assert.equal(block.id, 'test');
              });
            }
          });
          suite('Untyped Arguments', function() {
            function createMutator(argArray) {
              this.mutatorWorkspace = new Blockly.Workspace(
                  new Blockly.Options({
                    parentWorkspace: this.workspace,
                  }));
              this.containerBlock = this.defBlock.decompose(this.mutatorWorkspace);
              this.connection = this.containerBlock.getInput('STACK').connection;
              for (let i = 0; i < argArray.length; i++) {
                this.argBlock = this.mutatorWorkspace.newBlock('procedures_mutatorarg');
                this.argBlock.setFieldValue(argArray[i], 'NAME');
                this.connection.connect(this.argBlock.previousConnection);
                this.connection = this.argBlock.nextConnection;
              }
              this.defBlock.compose(this.containerBlock);
            }
            function assertArgs(argArray) {
              chai.assert.equal(this.defBlock.arguments_.length, argArray.length);
              for (let i = 0; i < argArray.length; i++) {
                chai.assert.equal(this.defBlock.arguments_[i], argArray[i]);
              }
              chai.assert.equal(this.callBlock.arguments_.length, argArray.length);
              for (let i = 0; i < argArray.length; i++) {
                chai.assert.equal(this.callBlock.arguments_[i], argArray[i]);
              }
            }
            test('Simple Add Arg', function() {
              const args = ['arg1'];
              createMutator.call(this, args);
              assertArgs.call(this, args);
            });
            test('Multiple Args', function() {
              const args = ['arg1', 'arg2', 'arg3'];
              createMutator.call(this, args);
              assertArgs.call(this, args);
            });
            test('Simple Change Arg', function() {
              createMutator.call(this, ['arg1']);
              this.argBlock.setFieldValue('arg2', 'NAME');
              this.defBlock.compose(this.containerBlock);
              assertArgs.call(this, ['arg2']);
            });
            test('lower -> CAPS', function() {
              createMutator.call(this, ['arg']);
              this.argBlock.setFieldValue('ARG', 'NAME');
              this.defBlock.compose(this.containerBlock);
              assertArgs.call(this, ['ARG']);
            });
            test('CAPS -> lower', function() {
              createMutator.call(this, ['ARG']);
              this.argBlock.setFieldValue('arg', 'NAME');
              this.defBlock.compose(this.containerBlock);
              assertArgs.call(this, ['arg']);
            });
            // Test case for #1958
            test('Set Arg Empty', function() {
              const args = ['arg1'];
              createMutator.call(this, args);
              this.argBlock.setFieldValue('', 'NAME');
              this.defBlock.compose(this.containerBlock);
              assertArgs.call(this, args);
            });
            test('Whitespace', function() {
              const args = ['arg1'];
              createMutator.call(this, args);
              this.argBlock.setFieldValue(' ', 'NAME');
              this.defBlock.compose(this.containerBlock);
              assertArgs.call(this, args);
            });
            test('Whitespace and Text', function() {
              createMutator.call(this, ['arg1']);
              this.argBlock.setFieldValue(' text ', 'NAME');
              this.defBlock.compose(this.containerBlock);
              assertArgs.call(this, ['text']);
            });
            test('<>', function() {
              const args = ['<>'];
              createMutator.call(this, args);
              assertArgs.call(this, args);
            });
          });
        });
        suite('Decomposition', function() {
          suite('Statements', function() {
            if (testSuite.defType === 'procedures_defreturn') {
              test('Has Statement Input', function() {
                const mutatorWorkspace = new Blockly.Workspace(
                    new Blockly.Options({
                      parentWorkspace: this.workspace,
                    }));
                this.defBlock.decompose(mutatorWorkspace);
                const statementInput = mutatorWorkspace.getTopBlocks()[0]
                    .getInput('STATEMENT_INPUT');
                chai.assert.isNotNull(statementInput);
              });
              test('Has Statements', function() {
                this.defBlock.hasStatements_ = true;
                const mutatorWorkspace = new Blockly.Workspace(
                    new Blockly.Options({
                      parentWorkspace: this.workspace,
                    }));
                this.defBlock.decompose(mutatorWorkspace);
                const statementValue = mutatorWorkspace.getTopBlocks()[0]
                    .getField('STATEMENTS').getValueBoolean();
                chai.assert.isTrue(statementValue);
              });
              test('No Has Statements', function() {
                this.defBlock.hasStatements_ = false;
                const mutatorWorkspace = new Blockly.Workspace(
                    new Blockly.Options({
                      parentWorkspace: this.workspace,
                    }));
                this.defBlock.decompose(mutatorWorkspace);
                const statementValue = mutatorWorkspace.getTopBlocks()[0]
                    .getField('STATEMENTS').getValueBoolean();
                chai.assert.isFalse(statementValue);
              });
            } else {
              test('Has no Statement Input', function() {
                const mutatorWorkspace = new Blockly.Workspace(
                    new Blockly.Options({
                      parentWorkspace: this.workspace,
                    }));
                this.defBlock.decompose(mutatorWorkspace);
                const statementInput = mutatorWorkspace.getTopBlocks()[0]
                    .getInput('STATEMENT_INPUT');
                chai.assert.isNull(statementInput);
              });
            }
          });
          suite('Untyped Arguments', function() {
            function assertArguments(argumentsArray) {
              this.defBlock.arguments_ = argumentsArray;
              const mutatorWorkspace = new Blockly.Workspace(
                  new Blockly.Options({
                    parentWorkspace: this.workspace,
                  }));
              this.defBlock.decompose(mutatorWorkspace);
              const argBlocks = mutatorWorkspace.getBlocksByType('procedures_mutatorarg');
              chai.assert.equal(argBlocks.length, argumentsArray.length);

              for (let i = 0; i < argumentsArray.length; i++) {
                const argString = argumentsArray[i];
                const argBlockValue = argBlocks[i].getFieldValue('NAME');
                chai.assert.equal(argBlockValue, argString);
              }
            }
            test('Simple Single Arg', function() {
              assertArguments.call(this, ['arg']);
            });
            test('Multiple Args', function() {
              assertArguments.call(this, ['arg1', 'arg2']);
            });
            test('<>', function() {
              assertArguments.call(this, ['<>']);
            });
          });
        });
      });
      /**
       * Test cases for serialization tests.
       * @type {Array<SerializationTestCase>}
       */
      const testCases = [
        {
          title: 'Minimal definition',
          xml: '<block type="' + testSuite.defType + '"/>',
          expectedXml:
              '<block xmlns="https://developers.google.com/blockly/xml" ' +
              'type="' + testSuite.defType + '" id="1">\n' +
              '  <field name="NAME">unnamed</field>\n' +
              '</block>',
          assertBlockStructure:
              (block) => {
                assertDefBlockStructure(block, testSuite.hasReturn);
              },
        },
        {
          title: 'Common definition',
          xml:
              '<block type="' + testSuite.defType + '">' +
              '  <field name="NAME">do something</field>' +
              '</block>',
          expectedXml:
              '<block xmlns="https://developers.google.com/blockly/xml" ' +
              'type="' + testSuite.defType + '" id="1">\n' +
              '  <field name="NAME">do something</field>\n' +
              '</block>',
          assertBlockStructure:
              (block) => {
                assertDefBlockStructure(block, testSuite.hasReturn);
              },
        },
        {
          title: 'With vars definition',
          xml:
              '<block type="' + testSuite.defType + '">\n' +
              '  <mutation>\n' +
              '    <arg name="x" varid="arg1"></arg>\n' +
              '    <arg name="y" varid="arg2"></arg>\n' +
              '  </mutation>\n' +
              '  <field name="NAME">do something</field>\n' +
              '</block>',
          expectedXml:
              '<block xmlns="https://developers.google.com/blockly/xml" ' +
              'type="' + testSuite.defType + '" id="1">\n' +
              '  <mutation>\n' +
              '    <arg name="x" varid="arg1"></arg>\n' +
              '    <arg name="y" varid="arg2"></arg>\n' +
              '  </mutation>\n' +
              '  <field name="NAME">do something</field>\n' +
              '</block>',
          assertBlockStructure:
              (block) => {
                assertDefBlockStructure(
                    block, testSuite.hasReturn, ['x', 'y'], ['arg1', 'arg2']);
              },
        },
        {
          title: 'With pre-created vars definition',
          xml:
              '<block type="' + testSuite.defType + '">\n' +
              '  <mutation>\n' +
              '    <arg name="preCreatedVar" varid="preCreatedVarId"></arg>\n' +
              '  </mutation>\n' +
              '  <field name="NAME">do something</field>\n' +
              '</block>',
          expectedXml:
              '<block xmlns="https://developers.google.com/blockly/xml" ' +
              'type="' + testSuite.defType + '" id="1">\n' +
              '  <mutation>\n' +
              '    <arg name="preCreatedVar" varid="preCreatedVarId"></arg>\n' +
              '  </mutation>\n' +
              '  <field name="NAME">do something</field>\n' +
              '</block>',
          assertBlockStructure:
              (block) => {
                assertDefBlockStructure(block, testSuite.hasReturn,
                    ['preCreatedVar'], ['preCreatedVarId']);
              },
        },
        {
          title: 'With pre-created typed vars definition',
          xml:
              '<block type="' + testSuite.defType + '">\n' +
              '  <mutation>\n' +
              '    <arg name="preCreatedTypedVar" varid="preCreatedTypedVarId"></arg>\n' +
              '  </mutation>\n' +
              '  <field name="NAME">do something</field>\n' +
              '</block>',
          expectedXml:
              '<block xmlns="https://developers.google.com/blockly/xml" ' +
              'type="' + testSuite.defType + '" id="1">\n' +
              '  <mutation>\n' +
              '    <arg name="preCreatedTypedVar" varid="preCreatedTypedVarId"></arg>\n' +
              '  </mutation>\n' +
              '  <field name="NAME">do something</field>\n' +
              '</block>',
          assertBlockStructure:
              (block) => {
                assertDefBlockStructure(block, testSuite.hasReturn,
                    ['preCreatedTypedVar'], ['preCreatedTypedVarId']);
              },
        },
        {
          title: 'No statements definition',
          xml:
              '<block type="procedures_defreturn">\n' +
              '  <mutation statements="false"></mutation>\n' +
              '  <field name="NAME">do something</field>\n' +
              '</block>',
          expectedXml:
              '<block xmlns="https://developers.google.com/blockly/xml" ' +
              'type="procedures_defreturn" id="1">\n' +
              '  <mutation statements="false"></mutation>\n' +
              '  <field name="NAME">do something</field>\n' +
              '</block>',
          assertBlockStructure:
              (block) => {
                assertDefBlockStructure(block, true, [], [], false);
              },
        },
        {
          title: 'Minimal caller',
          xml: '<block type="' + testSuite.callType + '"/>',
          expectedXml:
              '<block xmlns="https://developers.google.com/blockly/xml" ' +
              'type="' + testSuite.callType + '" id="1">\n' +
              '  <mutation name="unnamed"></mutation>\n' +
              '</block>',
          assertBlockStructure:
              (block) => {
                assertCallBlockStructure(block);
              },
        },
        {
          title: 'Common caller',
          xml:
              '<block type="' + testSuite.callType + '">\n' +
              '  <mutation name="do something"/>\n' +
              '</block>',
          expectedXml:
              '<block xmlns="https://developers.google.com/blockly/xml" ' +
              'type="' + testSuite.callType + '" id="1">\n' +
              '  <mutation name="do something"></mutation>\n' +
              '</block>',
          assertBlockStructure:
              (block) => {
                assertCallBlockStructure(block);
              },
        },
        {
          title: 'With pre-created vars caller',
          xml:
              '<block type="' + testSuite.callType + '">\n' +
              '  <mutation name="do something">\n' +
              '    <arg name="preCreatedVar"></arg>\n' +
              '  </mutation>\n' +
              '</block>',
          expectedXml:
              '<block xmlns="https://developers.google.com/blockly/xml" ' +
              'type="' + testSuite.callType + '" id="1">\n' +
              '  <mutation name="do something">\n' +
              '    <arg name="preCreatedVar"></arg>\n' +
              '  </mutation>\n' +
              '</block>',
          assertBlockStructure:
              (block) => {
                assertCallBlockStructure(block, ['preCreatedVar'], ['preCreatedVarId']);
              },
        },
      ];
      runSerializationTestSuite(testCases);
    });
  });
});
