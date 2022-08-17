/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

goog.declareModuleId('Blockly.test.blockDeleteEvent');

import * as eventUtils from '../../build/src/core/events/utils.js';
import {sharedTestSetup, sharedTestTeardown} from './test_helpers/setup_teardown.js';

suite('Block Delete Event', function() {
  setup(function() {
    sharedTestSetup.call(this);
    this.workspace = new Blockly.Workspace();
  });

  teardown(function() {
    sharedTestTeardown.call(this);
  });

  suite('Receiving', function() {
    test('blocks receive their own delete events', function() {
      Blockly.Blocks['test'] = {
        onchange: function(e) {},
      };
      // Need to stub the definition, because the property on the definition is
      // what gets registered as an event listener.
      const spy = sinon.spy(Blockly.Blocks['test'], 'onchange');
      const testBlock = this.workspace.newBlock('test');

      testBlock.dispose();

      const deleteClass = eventUtils.get(eventUtils.BLOCK_DELETE);
      chai.assert.isTrue(spy.calledOnce);
      chai.assert.isTrue(spy.getCall(0).args[0] instanceof deleteClass);
    });
  });
});
