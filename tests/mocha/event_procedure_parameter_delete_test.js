/**
 * @license
 * Copyright 2022 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

goog.declareModuleId('Blockly.test.eventProcedureParameterDelete');

import {assertEventFiredShallow, assertEventNotFired, createChangeListenerSpy} from './test_helpers/events.js';
import {sharedTestSetup, sharedTestTeardown} from './test_helpers/setup_teardown.js';


suite('Procedure Parameter Delete Event', function() {
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

      this.createProcedureAndParameter =
        (procName, procId, paramName, paramId) => {
          const param = new Blockly.procedures.ObservableParameterModel(
                  this.workspace, procName, paramId);
          const proc = new Blockly.procedures.ObservableProcedureModel(
              this.workspace, paramName, procId)
              .insertParameter(param, 0);
          return {param, proc};
        };

      this.createEventToState = (procedureModel, parameterModel) => {
        return new Blockly.Events.ProcedureParameterDelete(
            this.workspace, procedureModel, parameterModel, 0);
      };
    });

    suite('forward', function() {
      test('a parameter is removed if it exists', function() {
        const {param, proc} =
            this.createProcedureAndParameter(
                'test name', 'test id', 'test param name', 'test param id');
        const event = this.createEventToState(proc, param);
        this.procedureMap.add(proc);

        event.run(/* forward= */ true);

        chai.assert.isUndefined(
            proc.getParameter(0),
            'Expected the parameter to be deleted');
      });
  
      test('removing a parameter fires a delete event', function() {
        const {param, proc} =
            this.createProcedureAndParameter(
                'test name', 'test id', 'test param name', 'test param id');
        const event = this.createEventToState(proc, param);
        this.procedureMap.add(proc);

        this.eventSpy.resetHistory();
        event.run(/* forward= */ true);

        assertEventFiredShallow(
            this.eventSpy,
            Blockly.Events.ProcedureParameterDelete,
            {
              model: proc,
              parameter: param,
              index: 0,
            },
            this.workspace.id);
      });
  
      test(
          'a parameter is not deleted if a parameter with a ' +
          'matching ID and index does not exist',
          function() {
            // TODO: Figure out what we want to do in this case.
          });
  
      test('not removing a parameter does not fire a delete event', function() {
        const {param, proc} =
            this.createProcedureAndParameter(
                'test name', 'test id', 'test param name', 'test param id');
        const event = this.createEventToState(proc, param);
        this.procedureMap.add(proc);
        proc.deleteParameter(0);

        this.eventSpy.resetHistory();
        event.run(/* forward= */ false);

        assertEventNotFired(
            this.eventSpy,
            Blockly.Events.ProcedureParameterDelete,
            {},
            this.workspace.id);
      });
    });
  
    suite('backward', function() {
      test('a parameter is inserted if it does not exist', function() {
        const {param: modelParam, proc: modelProc} =
            this.createProcedureAndParameter(
                'test name', 'test id', 'test param name', 'test param id');
        const event = this.createEventToState(modelProc, modelParam);
        const actualProc = this.createProcedureModel('test name', 'test id');
        this.procedureMap.add(actualProc);

        event.run(/* forward= */ false);

        const createdParam = actualProc.getParameter(0);
        chai.assert.isDefined(createdParam, 'Expected the parameter to exist');
        chai.assert.equal(
          createdParam.getName(),
          modelParam.getName(),
          "Expected the parameter's name to match the model");
        chai.assert.equal(
          createdParam.getId(),
          modelParam.getId(),
          "Expected the parameter's id to match the model");
      });
  
      test('inserting a parameter fires a create event', function() {
        const {param: modelParam, proc: modelProc} =
            this.createProcedureAndParameter(
                'test name', 'test id', 'test param name', 'test param id');
        const event = this.createEventToState(modelProc, modelParam);
        const actualProc = this.createProcedureModel('test name', 'test id');
        this.procedureMap.add(actualProc);

        this.eventSpy.resetHistory();
        event.run(/* forward= */ false);

        assertEventFiredShallow(
            this.eventSpy,
            Blockly.Events.ProcedureParameterCreate,
            {
              model: actualProc,
              parameter: actualProc.getParameter(0),
              index: 0,
            },
            this.workspace.id);
      });
  
      test(
          'a parameter is not created if a parameter with a ' +
          'matching ID and index already exists',
          function() {
            const {param: modelParam, proc: modelProc} =
                this.createProcedureAndParameter(
                    'test name', 'test id', 'test param name', 'test param id');
            const event = this.createEventToState(modelProc, modelParam);
            this.procedureMap.add(modelProc);
    
            this.eventSpy.resetHistory();
            event.run(/* forward= */ false);

            const actualProc = this.procedureMap.get('test id');
            chai.assert.equal(
                actualProc,
                modelProc,
                'Expected the procedure in the procedure map to not have changed');
            chai.assert.equal(
                actualProc.getParameter(0),
                modelParam,
                'Expected the parameter to not have changed');
          });
  
      test(
          'not creating a parameter model does not fire a create event',
          function() {
            const {param: modelParam, proc: modelProc} =
                this.createProcedureAndParameter(
                    'test name', 'test id', 'test param name', 'test param id');
            const event = this.createEventToState(modelProc, modelParam);
            this.procedureMap.add(modelProc);
    
            this.eventSpy.resetHistory();
            event.run(/* forward= */ false);

            assertEventNotFired(
                this.eventSpy,
                Blockly.Events.ProcedureParameterCreate,
                {},
                this.workspace.id);
          });
    });
  });

  suite('serialization', function() {
    test('events round-trip through JSON', function() {
      const param = new Blockly.procedures.ObservableParameterModel(
          this.workspace, 'test param name', 'test param id');
      const model =
          new Blockly.procedures.ObservableProcedureModel(
              this.workspace, 'test name', 'test id')
              .insertParameter(param, 0);
      this.procedureMap.add(model);
      const origEvent = new Blockly.Events.ProcedureParameterDelete(
          this.workspace, model);

      const json = origEvent.toJson();
      const newEvent = new Blockly.Events.fromJson(json, this.workspace);

      chai.assert.deepEqual(newEvent, origEvent);
    });
  });
});
