/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

goog.declareModuleId('Blockly.test.clipboard');

import {
  sharedTestSetup,
  sharedTestTeardown,
} from './test_helpers/setup_teardown.js';

suite('Clipboard', function () {
  setup(function () {
    this.clock = sharedTestSetup.call(this, {fireEventsNow: false}).clock;
    this.workspace = new Blockly.WorkspaceSvg(new Blockly.Options({}));
  });

  teardown(function () {
    sharedTestTeardown.call(this);
  });

  test('a paster registered with a given type is called when pasting that type', function () {
    const paster = {
      paste: sinon.stub().returns(null),
    };
    Blockly.clipboard.registry.register('test-paster', paster);

    Blockly.clipboard.paste({paster: 'test-paster'}, this.workspace);
    chai.assert.isTrue(paster.paste.calledOnce);

    Blockly.clipboard.registry.unregister('test-paster');
  });
});
