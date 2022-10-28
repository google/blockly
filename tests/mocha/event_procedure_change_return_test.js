/**
 * @license
 * Copyright 2022 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

goog.declareModuleId('Blockly.test.eventProcedureChangeReturn');

import {assertEventFiredShallow, assertEventNotFired, createChangeListenerSpy} from './test_helpers/events.js';
import {sharedTestSetup, sharedTestTeardown} from './test_helpers/setup_teardown.js';


suite('Procedure Change Return Event', function() {
  setup(function() {
    sharedTestSetup.call(this);
    this.workspace = new Blockly.Workspace();
    this.procedureMap = this.workspace.getProcedureMap();
    this.eventSpy = createChangeListenerSpy(this.workspace);
  });

  teardown(function() {
    sharedTestTeardown.call(this);
  });

  suite('running', function() {
    const TYPES_A = [];
    const TYPES_B = null;

    setup(function() {
      this.createProcedureModel = (returnTypes) => {
        return new Blockly.procedures.ObservableProcedureModel(
            this.workspace, 'test name')
            .setReturnTypes(returnTypes);
      };

      this.createChangeReturnEventToCurrentState = (procedureModel) => {
        return new Blockly.Events.ProcedureChangeReturn(
            this.workspace,
            procedureModel,
            // oldTypes
            procedureModel.getReturnTypes() === TYPES_A ? TYPES_B : TYPES_A);
      };
    });

    suite('forward (redo)', function() {
      test('the procedure with the matching ID has its return set', function() {
        const procedureModel = this.createProcedureModel(TYPES_A);
        this.procedureMap.add(procedureModel);
        const eventToA =
            this.createChangeReturnEventToCurrentState(procedureModel);
        procedureModel.setReturnTypes(TYPES_B);

        eventToA.run(/* redo */ true);

        chai.assert.equal(
            procedureModel.getReturnTypes(),
            TYPES_A,
            "Expected the procedure's return type to be reverted");
      });
  
      test('changing the return fires a change return event', function() {
        const procedureModel = this.createProcedureModel(TYPES_A);
        this.procedureMap.add(procedureModel);
        const eventToA =
            this.createChangeReturnEventToCurrentState(procedureModel);
        procedureModel.setReturnTypes(TYPES_B);

        eventToA.run(/* redo */ true);

        assertEventFiredShallow(
          this.eventSpy,
          Blockly.Events.ProcedureChangeReturn,
          {
            model: procedureModel,
            oldTypes: TYPES_B,
          },
          this.workspace.id);
      });
  
      test('noop return changes do not fire change return events', function() {
        const procedureModel = this.createProcedureModel(TYPES_A);
        this.procedureMap.add(procedureModel);
        const eventToA =
            this.createChangeReturnEventToCurrentState(procedureModel);

        this.eventSpy.resetHistory();
        eventToA.run(/* redo */ true);

        assertEventNotFired(
          this.eventSpy,
          Blockly.Events.ProcedureChangeReturn,
          {},
          this.workspace.id);
      });
  
      test(
          'attempting to change the return of a procedure that ' +
          'does not exist in the map throws',
          function() {
            const procedureModel = this.createProcedureModel(TYPES_A);
            const eventToA =
                this.createChangeReturnEventToCurrentState(procedureModel);
            procedureModel.setReturnTypes(TYPES_B);
    
            chai.assert.throws(() => {
              eventToA.run(/* redo */ true);
            });
          });
    });
  
    suite('backward (undo)', function() {
      test('the procedure with the matching ID has its return set', function() {
        const procedureModel = this.createProcedureModel(TYPES_A);
        this.procedureMap.add(procedureModel);
        procedureModel.setReturnTypes(TYPES_B);
        const eventToB =
            this.createChangeReturnEventToCurrentState(procedureModel);

        eventToB.run(/* undo */ false);

        chai.assert.equal(
            procedureModel.getReturnTypes(),
            TYPES_A,
            "Expected the procedure's return type to be reverted");
      });
  
      test('changing the return fires a change return event', function() {
        const procedureModel = this.createProcedureModel(TYPES_A);
        this.procedureMap.add(procedureModel);
        procedureModel.setReturnTypes(TYPES_B);
        const eventToB =
            this.createChangeReturnEventToCurrentState(procedureModel);

        eventToB.run(/* undo */ false);

        assertEventFiredShallow(
          this.eventSpy,
          Blockly.Events.ProcedureChangeReturn,
          {
            model: procedureModel,
            oldTypes: TYPES_B,
          },
          this.workspace.id);
      });
  
      test('noop return changes do not fire change return events', function() {
        const procedureModel = this.createProcedureModel(TYPES_A);
        this.procedureMap.add(procedureModel);
        const eventToA =
            this.createChangeReturnEventToCurrentState(procedureModel);
        procedureModel.setReturnTypes(TYPES_B);

        this.eventSpy.resetHistory();
        eventToA.run(/* undo */ false);

        assertEventNotFired(
          this.eventSpy,
          Blockly.Events.ProcedureChangeReturn,
          {},
          this.workspace.id);
      });
  
      test(
          'attempting to change the return of a procedure that ' +
          'does not exist throws',
          function() {
            const procedureModel = this.createProcedureModel(TYPES_A);
            const eventToA =
                this.createChangeReturnEventToCurrentState(procedureModel);
    
            chai.assert.throws(() => {
              eventToA.run(/* undo */ false);
            });
          });
    });
  });
});
