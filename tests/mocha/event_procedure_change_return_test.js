/**
 * @license
 * Copyright 2022 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

goog.declareModuleId('Blockly.test.eventProcedureChangeReturn');

import {assertEventFiredShallow, assertEventNotFired, createChangeListenerSpy} from './test_helpers/events.js';
import {sharedTestSetup, sharedTestTeardown} from './test_helpers/setup_teardown.js';


// TODO (#6519): Unskip.
suite.skip('Procedure Change Return Event', function() {
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
    const DEFAULT_TYPES = null;
    const NON_DEFAULT_TYPES = [];

    setup(function() {
      this.createProcedureModel = (id) => {
        return new Blockly.procedures.ObservableProcedureModel(
            this.workspace, 'test name', id);
      };

      this.createEventToState = (procedureModel) => {
        return new Blockly.Events.ProcedureChangeReturn(
            this.workspace,
            procedureModel,
            procedureModel.getReturnTypes());
      };
    });

    suite('forward (redo)', function() {
      test('the procedure with the matching ID has its return set', function() {
        const initial = this.createProcedureModel('test id');
        const final = this.createProcedureModel('test id');
        final.setReturnTypes(NON_DEFAULT_TYPES);
        const event = this.createEventToState(final);
        this.procedureMap.add(initial);

        event.run(true /* forward */);

        chai.assert.equal(
          initial.getReturnTypes(),
          final.getReturnTypes(),
          "Expected the procedure's return type to be toggled");
      });
  
      test('changing the return fires a change return event', function() {
        const initial = this.createProcedureModel('test id');
        const final = this.createProcedureModel('test id');
        final.setReturnTypes(NON_DEFAULT_TYPES);
        const event = this.createEventToState(final);
        this.procedureMap.add(initial);

        this.eventSpy.resetHistory();
        event.run(true /* forward */);

        assertEventFiredShallow(
            this.eventSpy,
            Blockly.Events.ProcedureChangeReturn,
            {
              model: initial,
              oldTypes: DEFAULT_TYPES,
            },
            this.workspace.id);
      });
  
      test('noop return changes do not fire change return events', function() {
        const initial = this.createProcedureModel('test id');
        const final = this.createProcedureModel('test id');
        const event = this.createEventToState(final);
        this.procedureMap.add(initial);

        this.eventSpy.resetHistory();
        event.run(true /* forward */);

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
            const initial = this.createProcedureModel('test id');
            const final = this.createProcedureModel('test id');
            const event = this.createEventToState(final);
    
            chai.assert.throws(() => {
              event.run(true /* forward */);
            });
          });
    });
  
    suite('backward (undo)', function() {
      test('the procedure with the matching ID has its return set', function() {
        const initial = this.createProcedureModel('test id');
        const undoable = this.createProcedureModel('test id');
        initial.setReturnTypes(NON_DEFAULT_TYPES);
        undoable.setReturnTypes(NON_DEFAULT_TYPES);
        const event = this.createEventToState(undoable);
        this.procedureMap.add(initial);

        event.run(false /* backward */);

        chai.assert.equal(
          initial.getReturnTypes(),
          DEFAULT_TYPES,
          "Expected the procedure's return type to be toggled");
      });
  
      test('changing the return fires a change return event', function() {
        const initial = this.createProcedureModel('test id');
        const undoable = this.createProcedureModel('test id');
        initial.setReturnTypes(NON_DEFAULT_TYPES);
        undoable.setReturnTypes(NON_DEFAULT_TYPES);
        const event = this.createEventToState(undoable);
        this.procedureMap.add(initial);

        this.eventSpy.resetHistory();
        event.run(false /* backward */);

        assertEventFiredShallow(
            this.eventSpy,
            Blockly.Events.ProcedureChangeReturn,
            {
              model: initial,
              oldTypes: DEFAULT_TYPES,
            },
            this.workspace.id);
      });
  
      test('noop return changes do not fire change return events', function() {
        const initial = this.createProcedureModel('test id');
        const undoable = this.createProcedureModel('test id');
        undoable.setReturnTypes(NON_DEFAULT_TYPES);
        const event = this.createEventToState(undoable);
        this.procedureMap.add(initial);

        this.eventSpy.resetHistory();
        event.run(false /* backward */);

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
            const initial = this.createProcedureModel('test id');
            const undoable = this.createProcedureModel('test id');
            initial.setReturnTypes(NON_DEFAULT_TYPES);
            undoable.setReturnTypes(NON_DEFAULT_TYPES);
            const event = this.createEventToState(undoable);
    
            chai.assert.throws(() => {
              event.run(false /* backward */);
            });
          });
    });
  });
});
