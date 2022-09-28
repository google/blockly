/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

goog.module('Blockly.test.helpers.setupTeardown');

const eventUtils = goog.require('Blockly.Events.utils');
const {Blocks} = goog.require('Blockly.blocks');


/**
 * Safely disposes of Blockly workspace, logging any errors.
 * Assumes that sharedTestSetup has also been called. This should be called
 * using workspaceTeardown.call(this).
 * @param {!Blockly.Workspace} workspace The workspace to dispose.
 */
function workspaceTeardown(workspace) {
  try {
    this.clock.runAll();  // Run all queued setTimeout calls.
    workspace.dispose();
    this.clock.runAll();  // Run all remaining queued setTimeout calls.
  } catch (e) {
    const testRef = this.currentTest || this.test;
    console.error(testRef.fullTitle() + '\n', e);
  }
}
exports.workspaceTeardown = workspaceTeardown;

/**
 * Creates stub for Blockly.Events.fire that advances the clock forward after
 * the event fires so it is processed immediately instead of on a timeout.
 * @param {!SinonClock} clock The sinon clock.
 * @return {!SinonStub} The created stub.
 * @private
 */
function createEventsFireStubFireImmediately_(clock) {
  const stub = sinon.stub(eventUtils, 'fire');
  stub.callsFake(function(event) {
    // Call original method.
    stub.wrappedMethod.call(this, ...arguments);
    // Advance clock forward to run any queued events.
    clock.runAll();
  });
  return stub;
}

/**
 * Adds message to shared cleanup object so that it is cleaned from
 *    Blockly.Messages global in sharedTestTeardown.
 * @param {!Object} sharedCleanupObj The shared cleanup object created in
 *    sharedTestSetup.
 * @param {string} message The message to add to shared cleanup object.
 */
function addMessageToCleanup(sharedCleanupObj, message) {
  sharedCleanupObj.messagesCleanup_.push(message);
}
exports.addMessageToCleanup = addMessageToCleanup;

/**
 * Adds block type to shared cleanup object so that it is cleaned from
 *    Blockly.Blocks global in sharedTestTeardown.
 * @param {!Object} sharedCleanupObj The shared cleanup object created in
 *    sharedTestSetup.
 * @param {string} blockType The block type to add to shared cleanup object.
 */
function addBlockTypeToCleanup(sharedCleanupObj, blockType) {
  sharedCleanupObj.blockTypesCleanup_.push(blockType);
}
exports.addBlockTypeToCleanup = addBlockTypeToCleanup;

/**
 * Wraps Blockly.defineBlocksWithJsonArray using stub in order to keep track of
 * block types passed in to method on shared cleanup object so they are cleaned
 * from Blockly.Blocks global in sharedTestTeardown.
 * @param {!Object} sharedCleanupObj The shared cleanup object created in
 *    sharedTestSetup.
 * @private
 */
function wrapDefineBlocksWithJsonArrayWithCleanup_(sharedCleanupObj) {
  const stub = sinon.stub(Blockly, 'defineBlocksWithJsonArray');
  stub.callsFake(function(jsonArray) {
    if (jsonArray) {
      jsonArray.forEach((jsonBlock) => {
        if (jsonBlock) {
          addBlockTypeToCleanup(sharedCleanupObj, jsonBlock['type']);
        }
      });
    }
    // Calls original method.
    stub.wrappedMethod.call(this, ...arguments);
  });
}

/**
 * Shared setup method that sets up fake timer for clock so that pending
 * setTimeout calls can be cleared in test teardown along with other common
 * stubs. Should be called in setup of outermost suite using
 * sharedTestSetup.call(this).
 * The sinon fake timer defined on this.clock_ should not be reset in tests to
 * avoid causing issues with cleanup in sharedTestTeardown.
 *
 * Stubs created in this setup (unless disabled by options passed):
 *  - Blockly.Events.fire - this.eventsFireStub - wraps fire event to trigger
 *      fireNow_ call immediately, rather than on timeout
 *  - Blockly.defineBlocksWithJsonArray - thin wrapper that adds logic to keep
 *      track of block types defined so that they can be undefined in
 *      sharedTestTeardown and calls original method.
 *
 * @param {Object<string, boolean>} options Options to enable/disable setup
 *    of certain stubs.
 */
function sharedTestSetup(options = {}) {
  this.sharedSetupCalled_ = true;
  // Sandbox created for greater control when certain stubs are cleared.
  this.sharedSetupSandbox_ = sinon.createSandbox();
  this.clock = this.sharedSetupSandbox_.useFakeTimers();
  if (options['fireEventsNow'] === undefined || options['fireEventsNow']) {
    // Stubs event firing unless passed option "fireEventsNow: false"
    this.eventsFireStub = createEventsFireStubFireImmediately_(this.clock);
  }
  this.sharedCleanup = {
    blockTypesCleanup_: [],
    messagesCleanup_: [],
  };
  this.blockTypesCleanup_ = this.sharedCleanup.blockTypesCleanup_;
  this.messagesCleanup_ = this.sharedCleanup.messagesCleanup_;
  wrapDefineBlocksWithJsonArrayWithCleanup_(this.sharedCleanup);
}
exports.sharedTestSetup = sharedTestSetup;

/**
 * Shared cleanup method that clears up pending setTimeout calls, disposes of
 * workspace, and resets global variables. Should be called in setup of
 * outermost suite using sharedTestTeardown.call(this).
 */
function sharedTestTeardown() {
  const testRef = this.currentTest || this.test;
  if (!this.sharedSetupCalled_) {
    console.error('"' + testRef.fullTitle() + '" did not call sharedTestSetup');
  }

  try {
    if (this.workspace) {
      workspaceTeardown.call(this, this.workspace);
      this.workspace = null;
    } else {
      this.clock.runAll();  // Run all queued setTimeout calls.
    }
  } catch (e) {
    console.error(testRef.fullTitle() + '\n', e);
  } finally {
    // Clear Blockly.Event state.
    eventUtils.setGroup(false);
    while (!eventUtils.isEnabled()) {
      eventUtils.enable();
    }
    eventUtils.setRecordUndo(true);
    if (eventUtils.TEST_ONLY.FIRE_QUEUE.length) {
      // If this happens, it may mean that some previous test is missing cleanup
      // (i.e. a previous test added an event to the queue on a timeout that
      // did not use a stubbed clock).
      eventUtils.TEST_ONLY.FIRE_QUEUE.length = 0;
      console.warn('"' + testRef.fullTitle() +
          '" needed cleanup of Blockly.Events.TEST_ONLY.FIRE_QUEUE. This may ' +
          'indicate leakage from an earlier test');
    }

    // Restore all stubbed methods.
    this.sharedSetupSandbox_.restore();
    sinon.restore();

    const blockTypes = this.sharedCleanup.blockTypesCleanup_;
    for (let i = 0; i < blockTypes.length; i++) {
      delete Blocks[blockTypes[i]];
    }
    const messages = this.sharedCleanup.messagesCleanup_;
    for (let i = 0; i < messages.length; i++) {
      delete Blockly.Msg[messages[i]];
    }

    Blockly.WidgetDiv.testOnly_setDiv(null);
  }
}
exports.sharedTestTeardown = sharedTestTeardown;

/**
 * Creates stub for Blockly.utils.genUid that returns the provided id or ids.
 * Recommended to also assert that the stub is called the expected number of
 * times.
 * @param {string|!Array<string>} returnIds The return values to use for the
 *    created stub. If a single value is passed, then the stub always returns
 *    that value.
 * @return {!SinonStub} The created stub.
 */
function createGenUidStubWithReturns(returnIds) {
  const stub = sinon.stub(Blockly.utils.idGenerator.TEST_ONLY, "genUid");
  if (Array.isArray(returnIds)) {
    for (let i = 0; i < returnIds.length; i++) {
      stub.onCall(i).returns(returnIds[i]);
    }
  } else {
    stub.returns(returnIds);
  }
  return stub;
}
exports.createGenUidStubWithReturns = createGenUidStubWithReturns;
