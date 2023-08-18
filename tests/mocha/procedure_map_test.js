/**
 * @license
 * Copyright 2022 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  sharedTestSetup,
  sharedTestTeardown,
} from './test_helpers/setup_teardown.js';
import {
  assertEventFiredShallow,
  assertEventNotFired,
  createChangeListenerSpy,
} from './test_helpers/events.js';
import {MockProcedureModel} from './test_helpers/procedures.js';

suite('Procedure Map', function () {
  setup(function () {
    sharedTestSetup.call(this);
    this.workspace = new Blockly.Workspace();
    this.procedureMap = this.workspace.getProcedureMap();
  });

  teardown(function () {
    sharedTestTeardown.call(this);
  });

  suite('publishing', function () {
    test('inserting a procedure tells it to start publishing', function () {
      const procedureModel = new MockProcedureModel();
      const spy = sinon.spy(procedureModel, 'startPublishing');
      this.procedureMap.set(procedureModel.getId(), procedureModel);

      chai.assert.isTrue(spy.called, 'Expected the model to start publishing');
    });

    test('adding a procedure tells it to start publishing', function () {
      const procedureModel = new MockProcedureModel();
      const spy = sinon.spy(procedureModel, 'startPublishing');
      this.procedureMap.add(procedureModel);

      chai.assert.isTrue(spy.called, 'Expected the model to start publishing');
    });

    test('deleting a procedure tells it to stop publishing', function () {
      const procedureModel = new MockProcedureModel();
      const spy = sinon.spy(procedureModel, 'stopPublishing');
      this.procedureMap.add(procedureModel);

      this.procedureMap.delete(procedureModel.getId());

      chai.assert.isTrue(spy.calledOnce, 'Expected the model stop publishing');
    });
  });
});
