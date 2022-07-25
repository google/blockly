/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

goog.declareModuleId('Blockly.test.workspace');

import {assertVariableValues} from './test_helpers/variables.js';
import {sharedTestSetup, sharedTestTeardown, workspaceTeardown} from './test_helpers/setup_teardown.js';
import {testAWorkspace} from './test_helpers/workspace.js';


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
