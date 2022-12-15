/**
 * @license
 * Copyright 2022 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

goog.declareModuleId('Blockly.test.eventProcedureChangeReturn');

import {assertEventFiredShallow, assertEventNotFired, createChangeListenerSpy} from './test_helpers/events.js';
import {sharedTestSetup, sharedTestTeardown} from './test_helpers/setup_teardown.js';


suite('Procedure Change Return Event', function() {
  const DEFAULT_TYPES = null;
  const NON_DEFAULT_TYPES = [];

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
    setup(function() {
      this.createProcedureModel = (id) => {
        return new Blockly.procedures.ObservableProcedureModel(
            this.workspace, 'test name', id);
      };

      this.createEventToState = (procedureModel) => {
        const event = new Blockly.Events.ProcedureChangeReturn(
            this.workspace,
            procedureModel,
            procedureModel.getReturnTypes() === DEFAULT_TYPES ?
                NON_DEFAULT_TYPES :
                DEFAULT_TYPES);
        return event;
      };
    });

    suite('forward (redo)', function() {
      test('the procedure with the matching ID has its return set', function() {
        const initial = this.createProcedureModel('test id');
        const final = this.createProcedureModel('test id');
        final.setReturnTypes(NON_DEFAULT_TYPES);
        const event = this.createEventToState(final);
        this.procedureMap.add(initial);

        event.run(/* forward= */ true);

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
        event.run(/* forward= */ true);

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
        event.run(/* forward= */ true);

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
              event.run(/* forward= */ true);
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

        event.run(/* forward= */ false);

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
        event.run(/* forward= */ false);

        assertEventFiredShallow(
            this.eventSpy,
            Blockly.Events.ProcedureChangeReturn,
            {
              model: initial,
              oldTypes: NON_DEFAULT_TYPES,
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
        event.run(/* forward= */ false);

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
              event.run(/* forward= */ false);
            });
          });
    });
  });

  suite('serialization', function() {
    test('events round-trip through JSON', function() {
      const model = new Blockly.procedures.ObservableProcedureModel(
          this.workspace, 'test name', 'test id');
      this.procedureMap.add(model);
      const origEvent = new Blockly.Events.ProcedureChangeReturn(
          this.workspace, model, NON_DEFAULT_TYPES);

      const json = origEvent.toJson();
      const newEvent = new Blockly.Events.fromJson(json, this.workspace);

      chai.assert.deepEqual(newEvent, origEvent);
    });
  });
});
