/**
 * @license
 * Copyright 2022 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

goog.declareModuleId('Blockly.test.eventProcedureParameterCreate');

import {sharedTestSetup, sharedTestTeardown} from './test_helpers/setup_teardown.js';


suite('Procedure Parameter Create Event', function() {
  setup(function() {
    sharedTestSetup.call(this);
    this.workspace = new Blockly.Workspace();
  });

  teardown(function() {
    sharedTestTeardown.call(this);
  });

  suite('running', function() {
    suite('forward', function() {
      test('a parameter is inserted if it does not exist', function() {
  
      });
  
      test('inserting a parameter fires a create event', function() {
  
      });
  
      test(
          'a parameter is not created if a parameter with a ' +
          'matching ID and index already exists',
          function() {
  
          });
  
      test(
          'not creating a parameter model does not fire a create event',
          function() {
  
          });
    });
  
    suite('backward', function() {
      test('a parameter is removed if it exists', function() {
  
      });
  
      test('removing a parameter fires a delete event', function() {
  
      });
  
      test(
          'a parameter is not deleted if a parameter with a ' +
          'matching ID and index does not exist',
          function() {
  
          });
  
      test('not removing a parameter does not fire a delete event', function() {
  
      });
    });
  });
});
