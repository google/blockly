/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import * as coreTestHelpers from './test_helpers.js';
import {testAWorkspace} from './workspace_test_helpers.js';

const {sharedTestSetup, sharedTestTeardown} = coreTestHelpers;

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
