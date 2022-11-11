/**
 * @license
 * Copyright 2022 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

goog.declareModuleId('Blockly.test.eventProcedureParameterRename');

import {assertEventFiredShallow, assertEventNotFired, createChangeListenerSpy} from './test_helpers/events.js';
import {sharedTestSetup, sharedTestTeardown} from './test_helpers/setup_teardown.js';


suite('Procedure Parameter Rename Event', function() {
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
      this.createProcedureAndParameter = (procId, paramId) => {
        const param = new Blockly.procedures.ObservableParameterModel(
                this.workspace, DEFAULT_NAME, paramId);
        const proc = new Blockly.procedures.ObservableProcedureModel(
            this.workspace, 'test name', procId)
            .insertParameter(param, 0);
        return {param, proc};
      };

      this.createEventToState = (procedureModel, parameterModel) => {
        return new Blockly.Events.ProcedureParameterRename(
            this.workspace,
            procedureModel,
            parameterModel,
            parameterModel.getName() === DEFAULT_NAME ?
                NON_DEFAULT_NAME :
                DEFAULT_NAME);
      };
    });

    suite('forward', function() {
      test('the parameter with the matching ID and index is renamed', function() {
        const {param: initialParam, proc: initialProc} =
            this.createProcedureAndParameter('test procId', 'test paramId');
        const {param: finalParam, proc: finalProc} =
            this.createProcedureAndParameter('test procId', 'test paramId');
        finalParam.setName(NON_DEFAULT_NAME);
        const event = this.createEventToState(finalProc, finalParam);
        this.procedureMap.add(initialProc);

        event.run(/* forward= */ true);

        chai.assert.equal(
          initialParam.getName(),
          finalParam.getName(),
          "Expected the procedure parameter's name to be changed");
      });
  
      test('renaming a parameter fires a rename event', function() {
        const {param: initialParam, proc: initialProc} =
            this.createProcedureAndParameter('test procId', 'test paramId');
        const {param: finalParam, proc: finalProc} =
            this.createProcedureAndParameter('test procId', 'test paramId');
        finalParam.setName(NON_DEFAULT_NAME);
        const event = this.createEventToState(finalProc, finalParam);
        this.procedureMap.add(initialProc);

        this.eventSpy.resetHistory();
        event.run(/* forward= */ true);

        assertEventFiredShallow(
            this.eventSpy,
            Blockly.Events.ProcedureParameterRename,
            {
              model: initialProc,
              parameter: initialParam,
              oldName: DEFAULT_NAME,
            },
            this.workspace.id);
      });
  
      test('noop renames do not fire rename events', function() {
        const {param: initialParam, proc: initialProc} =
            this.createProcedureAndParameter('test procId', 'test paramId');
        const {param: finalParam, proc: finalProc} =
            this.createProcedureAndParameter('test procId', 'test paramId');
        const event = this.createEventToState(finalProc, finalParam);
        this.procedureMap.add(initialProc);

        this.eventSpy.resetHistory();
        event.run(/* forward= */ true);

        assertEventNotFired(
            this.eventSpy,
            Blockly.Events.ProcedureParameterRename,
            {},
            this.workspace.id);
      });
  
      test(
          'attempting to rename a parameter that does not exist throws',
          function() {
            const {param: initialParam, proc: initialProc} =
                this.createProcedureAndParameter('test procId', 'test paramId');
            const {param: finalParam, proc: finalProc} =
                this.createProcedureAndParameter('test procId', 'test paramId');
            finalParam.setName(NON_DEFAULT_NAME);
            const event = this.createEventToState(finalProc, finalParam);
    
            chai.assert.throws(() => {
              event.run(/* forward= */ true);
            });
          });
    });
  
    suite('backward', function() {
      test('the parameter with the matching ID and index is renamed', function() {
        const {param: initialParam, proc: initialProc} =
            this.createProcedureAndParameter('test procId', 'test paramId');
        const {param: undoableParam, proc: undoableProc} =
            this.createProcedureAndParameter('test procId', 'test paramId');
        initialParam.setName(NON_DEFAULT_NAME);
        undoableParam.setName(NON_DEFAULT_NAME);
        const event = this.createEventToState(undoableProc, undoableParam);
        this.procedureMap.add(initialProc);

        this.eventSpy.resetHistory();
        event.run(/* forward= */ false);

        chai.assert.equal(
          initialParam.getName(),
          DEFAULT_NAME,
          "Expected the procedure parameter's name to be changed");
      });
  
      test('renaming a parameter fires a rename event', function() {
        const {param: initialParam, proc: initialProc} =
            this.createProcedureAndParameter('test procId', 'test paramId');
        const {param: undoableParam, proc: undoableProc} =
            this.createProcedureAndParameter('test procId', 'test paramId');
        initialParam.setName(NON_DEFAULT_NAME);
        undoableParam.setName(NON_DEFAULT_NAME);
        const event = this.createEventToState(undoableProc, undoableParam);
        this.procedureMap.add(initialProc);

        this.eventSpy.resetHistory();
        event.run(/* forward= */ false);


        assertEventFiredShallow(
            this.eventSpy,
            Blockly.Events.ProcedureParameterRename,
            {
              model: initialProc,
              parameter: initialParam,
              oldName: NON_DEFAULT_NAME,
            },
            this.workspace.id);
      });
  
      test('noop renames do not fire rename events', function() {
        const {param: initialParam, proc: initialProc} =
            this.createProcedureAndParameter('test procId', 'test paramId');
        const {param: undoableParam, proc: undoableProc} =
            this.createProcedureAndParameter('test procId', 'test paramId');
        undoableParam.setName(NON_DEFAULT_NAME);
        const event = this.createEventToState(undoableProc, undoableParam);
        this.procedureMap.add(initialProc);

        event.run(/* forward= */ false);


        assertEventNotFired(
            this.eventSpy,
            Blockly.Events.ProcedureParameterRename,
            {},
            this.workspace.id);
      });
  
      test(
          'attempting to rename a parameter that does not exist throws',
          function() {
            const {param: initialParam, proc: initialProc} =
                this.createProcedureAndParameter('test procId', 'test paramId');
            const {param: undoableParam, proc: undoableProc} =
                this.createProcedureAndParameter('test procId', 'test paramId');
            initialParam.setName(NON_DEFAULT_NAME);
            undoableParam.setName(NON_DEFAULT_NAME);
            const event = this.createEventToState(undoableProc, undoableParam);

            chai.assert.throws(() => {
              event.run(/* forward= */ false);
            });
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
