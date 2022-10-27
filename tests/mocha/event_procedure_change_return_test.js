/**
 * @license
 * Copyright 2022 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

goog.declareModuleId('Blockly.test.eventProcedureChangeReturn');

import {sharedTestSetup, sharedTestTeardown} from './test_helpers/setup_teardown.js';


suite('Procedure Change Return Event', function() {
  setup(function() {
    sharedTestSetup.call(this);
    this.workspace = new Blockly.Workspace();
  });

  teardown(function() {
    sharedTestTeardown.call(this);
  });

  suite('running', function() {
    suite('forward', function() {
      test('the procedure with the matching ID has its return set', function() {
  
      });
  
      test('changing the return fires a change return event', function() {
  
      });
  
      test('noop return changes do not fire change return events', function() {
  
      });
  
      test(
          'attempting to change the return of a procedure that ' +
          'does not exist throws',
          function() {
  
          });
    });
  
    suite('backward', function() {
      test('the procedure with the matching ID has its return set', function() {
  
      });
  
      test('changing the return fires a change return event', function() {
  
      });
  
      test('noop return changes do not fire change return events', function() {
  
      });
  
      test(
          'attempting to change the return of a procedure that ' +
          'does not exist throws',
          function() {
  
          });
    });
  });
});
