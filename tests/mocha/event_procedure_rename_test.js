/**
 * @license
 * Copyright 2022 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

goog.declareModuleId('Blockly.test.eventProcedureRename');

import {assertEventFiredShallow, assertEventNotFired, createChangeListenerSpy} from './test_helpers/events.js';
import {sharedTestSetup, sharedTestTeardown} from './test_helpers/setup_teardown.js';


// TODO (#6519): Unskip.
suite.skip('Procedure Rename Event', function() {
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
    const DEFAULT_NAME = 'default';
    const NON_DEFAULT_NAME = 'non-default';

    setup(function() {
      this.createProcedureModel = (id) => {
        return new Blockly.procedures.ObservableProcedureModel(
            this.workspace, DEFAULT_NAME, id);
      };

      this.createEventToState = (procedureModel) => {
        return new Blockly.Events.ProcedureRename(
            this.workspace,
            procedureModel,
            procedureModel.getName());
      };
    });

    suite('forward', function() {
      test('the procedure with the matching ID is renamed', function() {
        const initial = this.createProcedureModel('test id');
        const final = this.createProcedureModel('test id');
        final.setName(NON_DEFAULT_NAME);
        const event = this.createEventToState(final);
        this.procedureMap.add(initial);

        event.run(true /* forward */);

        chai.assert.equal(
          initial.getName(),
          final.getName(),
          "Expected the procedure's name to be changed");
      });
  
      test('renaming a procedure fires a rename event', function() {
        const initial = this.createProcedureModel('test id');
        const final = this.createProcedureModel('test id');
        final.setName(NON_DEFAULT_NAME);
        const event = this.createEventToState(final);
        this.procedureMap.add(initial);

        event.run(true /* forward */);

        assertEventFiredShallow(
            this.eventSpy,
            Blockly.Events.ProcedureRename,
            {model: initial, oldName: DEFAULT_NAME},
            this.workspace.id);
      });
  
      test('noop renames do not fire rename events', function() {
        const initial = this.createProcedureModel('test id');
        const final = this.createProcedureModel('test id');
        const event = this.createEventToState(final);
        this.procedureMap.add(initial);

        event.run(true /* forward */);

        assertEventNotFired(
            this.eventSpy,
            Blockly.Events.ProcedureRename,
            {},
            this.workspace.id);
      });
  
      test(
          'attempting to rename a procedure that does not exist throws',
          function() {
            const initial = this.createProcedureModel('test id');
            const final = this.createProcedureModel('test id');
            final.setName(NON_DEFAULT_NAME);
            const event = this.createEventToState(final);
    
            chai.assert.throws(() => {
              event.run(true /* forward */);
            });
          });
    });
  
    suite('backward', function() {
      test('the procedure with the matching ID is renamed', function() {
        const initial = this.createProcedureModel('test id');
        const undoable = this.createProcedureModel('test id');
        initial.setName(NON_DEFAULT_NAME);
        undoable.setName(NON_DEFAULT_NAME);
        const event = this.createEventToState(undoable);
        this.procedureMap.add(initial);

        event.run(false /* backward */);

        chai.assert.equal(
          initial.getName(),
          DEFAULT_NAME,
          "Expected the procedure's name to be changed");
      });
  
      test('renaming a procedure fires a rename event', function() {
        const initial = this.createProcedureModel('test id');
        const undoable = this.createProcedureModel('test id');
        initial.setName(NON_DEFAULT_NAME);
        undoable.setName(NON_DEFAULT_NAME);
        const event = this.createEventToState(undoable);
        this.procedureMap.add(initial);

        event.run(false /* backward */);

        assertEventFiredShallow(
            this.eventSpy,
            Blockly.Events.ProcedureRename,
            {model: initial, oldName: NON_DEFAULT_NAME},
            this.workspace.id);
      });
  
      test('noop renames do not fire rename events', function() {
        const initial = this.createProcedureModel('test id');
        const undoable = this.createProcedureModel('test id');
        initial.setName(NON_DEFAULT_NAME);
        const event = this.createEventToState(undoable);
        this.procedureMap.add(initial);

        event.run(false /* backward */);

        assertEventNotFired(
            this.eventSpy,
            Blockly.Events.ProcedureRename,
            {},
            this.workspace.id);
      });
  
      test(
          'attempting to rename a procedure that does not exist throws',
          function() {
            const initial = this.createProcedureModel('test id');
            const undoable = this.createProcedureModel('test id');
            initial.setName(NON_DEFAULT_NAME);
            undoable.setName(NON_DEFAULT_NAME);
            const event = this.createEventToState(undoable);
    
            chai.assert.throws(() => {
              event.run(false /* backward */);
            });
          });
    });
  });
});
