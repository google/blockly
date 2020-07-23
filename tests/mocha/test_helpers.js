/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/* exported assertVariableValues, captureWarnings, defineRowBlock,
   defineStackBlock, defineStatementBlock, createTestBlock, createEventsFireStub
   assertLastCallEventArgEquals, assertNthCallEventArgEquals, assertEventEquals
   createGenUidStubWithReturns
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
 * Creates stub for Blockly.utils.genUid that returns the provided id or ids.
 *    Recommended to also assert that the stub is called the expected number of
 *    times.
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
 * Creates stub for Blockly.Events.fire that fires events immediately instead of
 * with timeout.
 * @return {!SinonStub} The created stub.
 */
function createEventsFireStub() {
  // TODO(#4064): Remove clearing of event clear here in favor of adding cleanup
  // to other tests that cause events to be added to the queue even after they
  // end.
  Blockly.Events.FIRE_QUEUE_.length = 0;
  var stub = sinon.stub(Blockly.Events, 'fire');
  stub.callsFake(function(event) {
    if (!Blockly.Events.isEnabled()) {
      return;
    }
    Blockly.Events.FIRE_QUEUE_.push(event);
    Blockly.Events.fireNow_();
    console.log(arguments);
  });
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
 *    expected values. Assumes that the event is passed as the first argument.
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
 *    expected values. Assumes that the event is passed as the first argument.
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
