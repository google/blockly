/**
 * @license
 * Copyright 2022 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

goog.declareModuleId('Blockly.test.eventProcedureParameterRename');

import {assertEventFiredShallow, assertEventNotFired, createChangeListenerSpy} from './test_helpers/events.js';
import {sharedTestSetup, sharedTestTeardown} from './test_helpers/setup_teardown.js';


// TODO (#6519): Unskip.
suite.skip('Procedure Parameter Rename Event', function() {
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
        return new Blockly.Events.ProcedureRename(
            this.workspace,
            procedureModel,
            parameterModel,
            parameterModel.getName());
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

        event.run(true /* forward */);

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
        event.run(true /* forward */);

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
        event.run(true /* forward */);

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
              event.run(true /* forward */);
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
        event.run(false /* backward */);

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
        event.run(false /* backward */);


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

        event.run(false /* backward */);


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
            this.procedureMap.add(initialProc);

            chai.assert.throws(() => {
              event.run(false /* backward */);
            });
          });
    });
  });
});
