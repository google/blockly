/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Check if a variable with the given values exists.
 * @param {Blockly.Workspace|Blockly.VariableMap} container The workspace  or
 *     variableMap the checked variable belongs to.
 * @param {!string} name The expected name of the variable.
 * @param {!string} type The expected type of the variable.
 * @param {!string} id The expected id of the variable.
 */
function assertVariableValues(container, name, type, id) {
  var variable = container.getVariableById(id);
  chai.assert.isDefined(variable);
  chai.assert.equal(variable.name, name);
  chai.assert.equal(variable.type, type);
  chai.assert.equal(variable.getId(), id);
}

/**
 * Captures the strings sent to console.warn() when calling a function.
 * @param {function} innerFunc The function where warnings may called.
 * @return {string[]} The warning messages (only the first arguments).
 */
function captureWarnings(innerFunc) {
  var msgs = [];
  var nativeConsoleWarn = console.warn;
  try {
    console.warn = function(msg) {
      msgs.push(msg);
    };
    innerFunc();
  } finally {
    console.warn = nativeConsoleWarn;
  }
  return msgs;
}

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
    console.error(this.currentTest.fullTitle() + '\n', e);
  }
}

/**
 * Creates stub for Blockly.Events.fire that advances the clock forward after
 * the event fires so it is processed immediately instead of on a timeout.
 * @param {!SinonClock} clock The sinon clock.
 * @param {SinonSandbox=} sandbox Optional sandbox to define stub on.
 * @return {!SinonStub} The created stub.
 * @private
 */
function createEventsFireStubFireImmediately_(clock, sandbox) {
  sandbox = sandbox || sinon;
  var stub = sandbox.stub(Blockly.Events, 'fire');
  stub.callsFake(function(event) {
    // TODO(#4070) Replace the fake function content with the following code
    // that uses wrappedMethod after cleanup is added to ALL tests.
    // Calling the original method will not consistently work if other tests
    // add things to the event queue because the setTimeout call will not be
    // added to the stubbed clock (so runAll cannot be used to control).
    // // Call original method.
    // stub.wrappedMethod.call(this, ...arguments);
    // // Advance clock forward to run any queued events.
    // clock.runAll();
    //
    if (!Blockly.Events.isEnabled()) {
      return;
    }
    Blockly.Events.FIRE_QUEUE_.push(event);
    Blockly.Events.fireNow_();
  });
  return stub;
}

/**
 * Shared setup method that sets up fake timer for clock so that pending
 * setTimeout calls can be cleared in test teardown along with other common
 * stubs. Should be called in setup of outermost suite using
 * sharedTestSetup.call(this).
 * @param {Object<string, boolean>} options Options to enable/disable setup
 *    of certain stubs.
 */
function sharedTestSetup(options = {}) {
  this.sharedSetupCalled_ = true;
  // Sandbox created for greater control when stubs are cleared.
  this.sharedSandbox_ = sinon.createSandbox();
  this.clock = this.sharedSandbox_.useFakeTimers();
  if (options['fireEventsNow'] === undefined || options['fireEventsNow']) {
    // Stubs event firing unless passed option "fireEventsNow: false"
    this.eventsFireStub =
        createEventsFireStubFireImmediately_(this.clock, this.sharedSandbox_);
  }
}

/**
 * Shared cleanup method that clears up pending setTimeout calls, disposes of
 * workspace, and resets global variables. Should be called in setup of
 * outermost suite using sharedTestTeardown.call(this).
 */
function sharedTestTeardown() {
  if (!this.sharedSetupCalled_) {
    console.error('"' + this.currentTest.fullTitle() +
        '" did not call sharedTestSetup');
  }

  try {
    if (this.workspace) {
      workspaceTeardown.call(this, this.workspace);
      this.workspace = null;
    } else {
      this.clock.runAll();  // Run all queued setTimeout calls.
    }
  } catch (e) {
    console.error(this.currentTest.fullTitle() + '\n', e);
  } finally {
    // Clear Blockly.Event state.
    Blockly.Events.setGroup(false);
    Blockly.Events.disabled_ = 0;
    if (Blockly.Events.FIRE_QUEUE_.length) {
      // If this happens, it may mean that some previous test is missing cleanup
      // (i.e. a previous test added an event to the queue on a timeout that
      // did not use a stubbed clock).
      Blockly.Events.FIRE_QUEUE_.length = 0;
      console.warn(this.currentTest.fullTitle() +
          '" needed cleanup of Blockly.Events.FIRE_QUEUE_. This may indicate ' +
          'leakage from an earlier test');
    }

    // Restore all stubbed methods.
    this.sharedSandbox_.restore();
    sinon.restore();
  }
}

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
  var stub = sinon.stub(Blockly.utils, "genUid");
  if (Array.isArray(returnIds)) {
    for (var i = 0; i < returnIds.length; i++) {
      stub.onCall(i).returns(returnIds[i]);
    }
  } else {
    stub.returns(returnIds);
  }
  return stub;
}

/**
 * Creates spy for workspace fireChangeListener
 * @param {!Blockly.Workspace} workspace The workspace to spy fireChangeListener
 *    calls on.
 * @return {!SinonSpy} The created spy.
 */
function createFireChangeListenerSpy(workspace) {
  return sinon.spy(workspace, 'fireChangeListener');
}

/**
 * Asserts that the given event has the expected values.
 * @param {!Blockly.Event.Abstract} event The event to check.
 * @param {string} expectedType Expected type of event fired.
 * @param {string} expectedWorkspaceId Expected workspace id of event fired.
 * @param {string} expectedBlockId Expected block id of event fired.
 * @param {!Object<string, *>} expectedProperties Map of of additional expected
 *    properties to check on fired event.
 * @param {string=} message Optional message to prepend assert messages.
 * @private
 */
function assertEventEquals(event, expectedType,
    expectedWorkspaceId, expectedBlockId, expectedProperties, message) {
  var prependMessage = message ? message + ' ' : '';
  chai.assert.equal(event.type, expectedType,
      prependMessage + 'Event fired type');
  chai.assert.equal(event.workspaceId, expectedWorkspaceId,
      prependMessage + 'Event fired workspace id');
  chai.assert.equal(event.blockId, expectedBlockId,
      prependMessage + 'Event fired block id');
  Object.keys(expectedProperties).map((key) => {
    var value = event[key];
    var expectedValue = expectedProperties[key];
    if (key.endsWith('Xml')) {
      value = Blockly.Xml.domToText(value);
      expectedValue = Blockly.Xml.domToText(expectedValue);
    }
    chai.assert.equal(value, expectedValue, prependMessage + 'Event fired ' + key);
  });
}

/**
 * Asserts that the event passed to the last call of the given spy has the
 * expected values. Assumes that the event is passed as the first argument.
 * @param {!SinonSpy} spy The spy to use.
 * @param {string} expectedType Expected type of event fired.
 * @param {string} expectedWorkspaceId Expected workspace id of event fired.
 * @param {string} expectedBlockId Expected block id of event fired.
 * @param {!Object<string, *>} expectedProperties Map of of expected properties
 *    to check on fired event.
 * @param {string=} message Optional message to prepend assert messages.
 */
function assertLastCallEventArgEquals(spy, expectedType,
    expectedWorkspaceId, expectedBlockId, expectedProperties, message) {
  var event = spy.lastCall.firstArg;
  assertEventEquals(event, expectedType, expectedWorkspaceId, expectedBlockId,
      expectedProperties, message);
}

/**
 * Asserts that the event passed to the nth call of the given spy has the
 * expected values. Assumes that the event is passed as the first argument.
 * @param {!SinonSpy} spy The spy to use.
 * @param {number} n Which call to check.
 * @param {string} expectedType Expected type of event fired.
 * @param {string} expectedWorkspaceId Expected workspace id of event fired.
 * @param {string} expectedBlockId Expected block id of event fired.
 * @param {Object<string, *>} expectedProperties Map of of expected properties
 *    to check on fired event.
 * @param {string=} message Optional message to prepend assert messages.
 */
function assertNthCallEventArgEquals(spy, n, expectedType,
    expectedWorkspaceId, expectedBlockId, expectedProperties, message) {
  var event = spy.getCall(n).firstArg;
  assertEventEquals(event, expectedType, expectedWorkspaceId, expectedBlockId,
      expectedProperties, message);
}

function defineStackBlock() {
  Blockly.defineBlocksWithJsonArray([{
    "type": "stack_block",
    "message0": "",
    "previousStatement": null,
    "nextStatement": null
  }]);
}

function defineRowBlock() {
  Blockly.defineBlocksWithJsonArray([{
    "type": "row_block",
    "message0": "%1",
    "args0": [
      {
        "type": "input_value",
        "name": "INPUT"
      }
    ],
    "output": null
  }]);
}

function defineStatementBlock() {
  Blockly.defineBlocksWithJsonArray([{
    "type": "statement_block",
    "message0": "%1",
    "args0": [
      {
        "type": "input_statement",
        "name": "NAME"
      }
    ],
    "previousStatement": null,
    "nextStatement": null,
    "colour": 230,
    "tooltip": "",
    "helpUrl": ""
  }]);
}

function createTestBlock() {
  return {
    id: 'test',
    rendered: false,
    workspace: {
      rendered: false
    }
  };
}
