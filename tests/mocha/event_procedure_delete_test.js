/**
 * @license
 * Copyright 2022 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

goog.declareModuleId('Blockly.test.eventProcedureDelete');

import {sharedTestSetup, sharedTestTeardown} from './test_helpers/setup_teardown.js';


suite('Procedure Delete Event', function() {
  setup(function() {
    sharedTestSetup.call(this);
    this.workspace = new Blockly.Workspace();
  });

  teardown(function() {
    sharedTestTeardown.call(this);
  });

  suite('running', function() {
    suite('forward', function() {
      test(
          'a procedure model is deleted if a model with a matching ID exists',
          function() {

          });

      test('deleting a model fires a delete event', function() {

      });

      test(
          'a model is not deleted if if nodel with a matching ID exists',
          function() {

          });
          
      test('not deleting a model does not fire a delete event', function() {

      });
    });

    suite('backward', function() {
      test('a procedure model is created if it does not exist', function() {

      });

      test('creating a procedure model fires a create event', function() {

      });

      test(
          'a procedure model is not created if a model with a ' +
          'matching ID exists',
          function() {

          });

      test('not creating a model does not fire a create event', function() {

      });
    });
  });
});
