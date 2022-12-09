/**
 * @license
 * Copyright 2022 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

goog.declareModuleId('Blockly.test.eventProcedureDelete');

import {assertEventFiredShallow, assertEventNotFired, createChangeListenerSpy} from './test_helpers/events.js';
import {sharedTestSetup, sharedTestTeardown} from './test_helpers/setup_teardown.js';


suite('Procedure Delete Event', function() {
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
      this.createProcedureModel = (name, id) => {
        return new Blockly.procedures.ObservableProcedureModel(
            this.workspace, name, id);
      };

      this.createEventToState = (procedureModel) => {
        return new Blockly.Events.ProcedureDelete(this.workspace, procedureModel);
      };
    });

    suite('forward', function() {
      test(
          'a procedure model is deleted if a model with a matching ID exists',
          function() {
            const model = this.createProcedureModel('test name', 'test id');
            const event = this.createEventToState(model);
            this.procedureMap.add(model);
    
            event.run(/* forward= */ true);
    
            chai.assert.isUndefined(
                this.procedureMap.get('test id'),
                'Expected the procedure to be deleted');
          });

      test('deleting a model fires a delete event', function() {
        const model = this.createProcedureModel('test name', 'test id');
        const event = this.createEventToState(model);
        this.procedureMap.add(model);

        this.eventSpy.resetHistory();
        event.run(/* forward= */ true);

        assertEventFiredShallow(
            this.eventSpy,
            Blockly.Events.ProcedureDelete,
            {model},
            this.workspace.id);
      });
          
      test('not deleting a model does not fire a delete event', function() {
        const model = this.createProcedureModel('test name', 'test id');
        const event = this.createEventToState(model);

        this.eventSpy.resetHistory();
        event.run(/* forward= */ true);

        assertEventNotFired(
            this.eventSpy,
            Blockly.Events.ProcedureDelete,
            {},
            this.workspace.id);
      });
    });

    suite('backward', function() {
      test('a procedure model is created if it does not exist', function() {
        const model = this.createProcedureModel('test name', 'test id');
        const event = this.createEventToState(model);

        event.run(/* forward= */ false);

        const createdProc = this.procedureMap.get('test id');
        chai.assert.isDefined(createdProc, 'Expected the procedure to exist');
        chai.assert.equal(
          createdProc.getName(),
          model.getName(),
          "Expected the procedure's name to match the model");
        chai.assert.equal(
          createdProc.getId(),
          model.getId(),
          "Expected the procedure's id to match the model");
      });

      test('creating a procedure model fires a create event', function() {
        const model = this.createProcedureModel('test name', 'test id');
        const event = this.createEventToState(model);

        this.eventSpy.resetHistory();
        event.run(/* forward= */ false);

        assertEventFiredShallow(
            this.eventSpy,
            Blockly.Events.ProcedureCreate,
            {model: this.procedureMap.get('test id')},
            this.workspace.id);
      });

      test(
          'a procedure model is not created if a model with a ' +
          'matching ID exists',
          function() {
            const model = this.createProcedureModel('test name', 'test id');
            const event = this.createEventToState(model);
            this.procedureMap.add(model);
    
            event.run(/* forward= */ false);
    
            chai.assert.equal(
                this.procedureMap.get('test id'),
                model,
                'Expected the model in the procedure map to be the same ' +
                'as the original model');
          });

      test('not creating a model does not fire a create event', function() {
        const model = this.createProcedureModel('test name', 'test id');
        const event = this.createEventToState(model);
        this.procedureMap.add(model);

        this.eventSpy.resetHistory();
        event.run(/* forward= */ true);

        assertEventNotFired(
            this.eventSpy,
            Blockly.Events.ProcedureCreate,
            {},
            this.workspace.id);
      });
    });
  });

  suite('serialization', function() {
    test('events round-trip through JSON', function() {
      const model = new Blockly.procedures.ObservableProcedureModel(
          this.workspace, 'test name', 'test id');
      this.procedureMap.add(model);
      const origEvent = new Blockly.Events.ProcedureDelete(this.workspace, model);

      const json = origEvent.toJson();
      const newEvent = new Blockly.Events.fromJson(json, this.workspace);

      chai.assert.deepEqual(newEvent, origEvent);
    });
  });
});
