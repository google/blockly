/**
 * @license
 * Copyright 2022 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {sharedTestSetup, sharedTestTeardown} from './test_helpers/setup_teardown.js';
import {assertEventFiredShallow, assertEventNotFired, createChangeListenerSpy} from './test_helpers/events.js';
import {MockProcedureModel} from './test_helpers/procedures.js';

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
        getProcedureModel: function() { },
        isProcedureDef: function() { },
      };

      this.procedureBlock = this.workspace.newBlock('procedure_mock');

      this.updateSpy = sinon.spy(this.procedureBlock, 'doProcedureUpdate');
    });

    teardown(function() {
      delete Blockly.Blocks['procedure_mock'];
    });

    suite('procedure map updates', function() {
      test('inserting a procedure does not trigger an update', function() {
        const procedureModel = new MockProcedureModel();
        this.procedureMap.set(procedureModel.getId(), procedureModel);

        chai.assert.isFalse(
            this.updateSpy.called, 'Expected no update to be triggered');
      });

      test('adding a procedure does not trigger an update', function() {
        this.procedureMap.add(new MockProcedureModel());

        chai.assert.isFalse(
            this.updateSpy.called, 'Expected no update to be triggered');
      });

      test('deleting a procedure triggers an update', function() {
        const procedureModel = new MockProcedureModel();
        this.procedureMap.add(procedureModel);

        this.procedureMap.delete(procedureModel.getId());

        chai.assert.isTrue(
            this.updateSpy.calledOnce, 'Expected an update to be triggered');
      });
    });
  });
});
