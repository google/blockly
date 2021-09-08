/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

goog.module('Blockly.test.workspace');

const {assertVariableValues, sharedTestSetup, sharedTestTeardown, workspaceTeardown} = goog.require('Blockly.test.helpers');
const {testAWorkspace} = goog.require('Blockly.test.workspaceHelpers');


suite('Workspace', function() {
  setup(function() {
    sharedTestSetup.call(this);
    this.workspace = new Blockly.Workspace();
  });

  teardown(function() {
    sharedTestTeardown.call(this);
  });

  // eslint-disable-next-line no-use-before-define
  testAWorkspace();
});
