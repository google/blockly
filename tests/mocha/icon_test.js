/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

goog.declareModuleId('Blockly.test.icon');

import {sharedTestSetup, sharedTestTeardown} from './test_helpers/setup_teardown.js';

suite('Icon', function() {
  setup(function() {
    this.clock = sharedTestSetup.call(this, {fireEventsNow: false}).clock;
  });

  teardown(function() {
    sharedTestTeardown.call(this);
  });

  suite('hooks getting properly triggered by the block', function() {
    suite('triggering view initialization', function() {
      test('initView is not called by headless blocks', function() {

      });

      test('initView is called by headful blocks during initSvg', function() {

      });

      test(
          'initView is called by headful blocks that are currently ' +
          'rendered when the icon is added',
          function() {

          });
    });

    suite('triggering applying colors', function() {
      test('applyColour is called by headful blocks during initSvg', function() {

      });

      test(
          'applyColour is called by headful blocks that are currently ' +
          'rendered when the icon is added',
          function() {

          });

      test("applyColour is called when the block's color changes", function() {

      });

      test("applyColour is called when the block's style changes", function() {

      });

      test('applyColour is called when the block is disabled', function() {

      });

      test('applyColour is called when the block becomes a shadow', function() {

      });
    });

    suite('triggering updating editability', function() {
      test('updateEditable is called by headful blocks during initSvg',
          function() {

          });

      test(
          'updateEditable is called by headful blocks that are currently ' +
          'rendered when the icon is added',
          function() {

          });

      test(
          'updateEditable is called when the block is made ineditable',
          function() {

          });

      test(
          'updateEditable is called when the block is made editable',
          function() {

          });
    });

    suite('triggering updating collapsed-ness', function() {
      test('updateCollapsed is called when the block is collapsed', function() {

      });

      test('updateCollapsed is called when the block is expanded', function() {

      });
    });
  });
});
