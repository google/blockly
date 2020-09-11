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
 * Asserts that the given function logs the provided warning messages.
 * @param {function} innerFunc The function to call.
 * @param {Array<!RegExp>|!RegExp} messages A list of regex for the expected
 *    messages (in the expected order).
 */
function assertWarnings(innerFunc, messages) {
  if (!Array.isArray(messages)) {
    messages = [messages];
  }
  var warnings = captureWarnings(innerFunc);
  chai.assert.lengthOf(warnings, messages.length);
  messages.forEach((message, i) => {
    chai.assert.match(warnings[i], message);
  });
}

/**
 * Asserts that the given function logs no warning messages.
 * @param {function} innerFunc The function to call.
 */
function assertNoWarnings(innerFunc) {
  assertWarnings(innerFunc, []);
}

/**
 * Stubs Blockly.utils.deprecation.warn call.
 * @return {!SinonStub} The created stub.
 */
function createDeprecationWarningStub() {
  return sinon.stub(Blockly.utils.deprecation, 'warn');
}

/**
 * Asserts whether the given deprecation warning stub or call was called with
 * the expected functionName.
 * @param {!SinonSpy|!SinonSpyCall} spyOrSpyCall The spy or spy call to use.
 * @param {string} functionName The function name to check that the given spy or
 *    spy call was called with.
 */
function assertDeprecationWarningCall(spyOrSpyCall, functionName) {
  sinon.assert.calledWith(spyOrSpyCall, functionName);
}

/**
 * Asserts that there was a single deprecation warning call with the given
 * functionName passed.
 * @param {!SinonSpy} spy The spy to use.
 * @param {string} functionName The function name to check that the given spy
 *    was called with.
 */
function assertSingleDeprecationWarningCall(spy, functionName) {
  sinon.assert.calledOnce(spy);
  assertDeprecationWarningCall(spy.getCall(0), functionName);
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
    var testRef = this.currentTest || this.test;
    console.error(testRef.fullTitle() + '\n', e);
  }
}

/**
 * Creates stub for Blockly.Events.fire that advances the clock forward after
 * the event fires so it is processed immediately instead of on a timeout.
 * @param {!SinonClock} clock The sinon clock.
 * @return {!SinonStub} The created stub.
 * @private
 */
function createEventsFireStubFireImmediately_(clock) {
  var stub = sinon.stub(Blockly.Events, 'fire');
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

/**
 * Wraps Blockly.defineBlocksWithJsonArray using stub in order to keep track of
 * block types passed in to method on shared cleanup object so they are cleaned
 * from Blockly.Blocks global in sharedTestTeardown.
 * @param {!Object} sharedCleanupObj The shared cleanup object created in
 *    sharedTestSetup.
 * @private
 */
function wrapDefineBlocksWithJsonArrayWithCleanup_(sharedCleanupObj) {
  var stub = sinon.stub(Blockly, 'defineBlocksWithJsonArray');
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
    messagesCleanup_: []

  };
  this.blockTypesCleanup_ = this.sharedCleanup.blockTypesCleanup_;
  this.messagesCleanup_ = this.sharedCleanup.messagesCleanup_;
  wrapDefineBlocksWithJsonArrayWithCleanup_(this.sharedCleanup);
}

/**
 * Shared cleanup method that clears up pending setTimeout calls, disposes of
 * workspace, and resets global variables. Should be called in setup of
 * outermost suite using sharedTestTeardown.call(this).
 */
function sharedTestTeardown() {
  var testRef = this.currentTest || this.test;
  if (!this.sharedSetupCalled_) {
    console.error('"' + testRef.fullTitle() +
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
    console.error(testRef.fullTitle() + '\n', e);
  } finally {
    // Clear Blockly.Event state.
    Blockly.Events.setGroup(false);
    Blockly.Events.disabled_ = 0;
    if (Blockly.Events.FIRE_QUEUE_.length) {
      // If this happens, it may mean that some previous test is missing cleanup
      // (i.e. a previous test added an event to the queue on a timeout that
      // did not use a stubbed clock).
      Blockly.Events.FIRE_QUEUE_.length = 0;
      console.warn(testRef.fullTitle() +
          '" needed cleanup of Blockly.Events.FIRE_QUEUE_. This may indicate ' +
          'leakage from an earlier test');
    }

    // Restore all stubbed methods.
    this.sharedSetupSandbox_.restore();
    sinon.restore();

    var blockTypes = this.sharedCleanup.blockTypesCleanup_;
    for (let i = 0; i < blockTypes.length; i++) {
      delete Blockly.Blocks[blockTypes[i]];
    }
    var messages = this.sharedCleanup.messagesCleanup_;
    for (let i = 0; i < messages.length; i++) {
      delete Blockly.Msg[messages[i]];
    }
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
 * Asserts whether the given xml property has the expected property.
 * @param {!Node} xmlValue The xml value to check.
 * @param {!Node|string} expectedValue The expected value.
 * @param {string=} message Optional message to use in assert message.
 * @private
 */
function assertXmlPropertyEqual_(xmlValue, expectedValue, message) {
  var value = Blockly.Xml.domToText(xmlValue);
  if (expectedValue instanceof Node) {
    expectedValue = Blockly.Xml.domToText(expectedValue);
  }
  chai.assert.equal(value, expectedValue, message);
}

/**
 * Asserts that the given object has the expected xml properties.
 * @param {Object} obj The object to check.
 * @param {Object<string, Node|string>} expectedXmlProperties The expected xml
 *    properties.
 * @private
 */
function assertXmlProperties_(obj, expectedXmlProperties) {
  Object.keys(expectedXmlProperties).map((key) => {
    var value = obj[key];
    var expectedValue = expectedXmlProperties[key];
    if (expectedValue === undefined) {
      chai.assert.isUndefined(value,
          'Expected ' + key + ' property to be undefined');
      return;
    }
    chai.assert.exists(value, 'Expected ' + key + ' property to exist');
    assertXmlPropertyEqual_(value, expectedValue, 'Checking property ' + key);
  });
}

/**
 * Whether given key indicates that the property is xml.
 * @param {string} key The key to check.
 * @return {boolean} Whether the given key is for xml property.
 * @private
 */
function isXmlProperty_(key) {
  return key.toLowerCase().endsWith('xml');
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
 */
function assertEventEquals(event, expectedType,
    expectedWorkspaceId, expectedBlockId, expectedProperties, message) {
  var prependMessage = message ? message + ' ' : '';
  prependMessage += 'Event fired ';
  chai.assert.equal(event.type, expectedType,
      prependMessage + 'type');
  chai.assert.equal(event.workspaceId, expectedWorkspaceId,
      prependMessage + 'workspace id');
  chai.assert.equal(event.blockId, expectedBlockId,
      prependMessage + 'block id');
  Object.keys(expectedProperties).map((key) => {
    var value = event[key];
    var expectedValue = expectedProperties[key];
    if (expectedValue === undefined) {
      chai.assert.isUndefined(value, prependMessage + key);
      return;
    }
    chai.assert.exists(value, prependMessage + key);
    if (isXmlProperty_(key)) {
      assertXmlPropertyEqual_(value, expectedValue,
          prependMessage + key);
    } else {
      chai.assert.equal(value, expectedValue,
          prependMessage + key);
    }
  });
}

/**
 * Asserts that an event with the given values was fired.
 * @param {!SinonSpy|!SinonSpyCall} spy The spy or spy call to use.
 * @param {function(new:Blockly.Events.Abstract)} instanceType Expected instance
 *    type of event fired.
 * @param {!Object<string, *>} expectedProperties Map of of expected properties
 *    to check on fired event.
 * @param {string} expectedWorkspaceId Expected workspace id of event fired.
 * @param {?string=} expectedBlockId Expected block id of event fired.
 */
function assertEventFired(spy, instanceType, expectedProperties,
    expectedWorkspaceId, expectedBlockId) {
  expectedProperties = Object.assign({
    type: instanceType.prototype.type,
    workspaceId: expectedWorkspaceId,
    blockId: expectedBlockId,
  }, expectedProperties);
  var expectedEvent =
      sinon.match.instanceOf(instanceType).and(sinon.match(expectedProperties));
  sinon.assert.calledWith(spy, expectedEvent);
}

/**
 * Asserts that an event with the given values was not fired.
 * @param {!SpyCall} spy The spy to use.
 * @param {function(new:Blockly.Events.Abstract)} instanceType Expected instance
 *    type of event fired.
 * @param {!Object<string, *>} expectedProperties Map of of expected properties
 *    to check on fired event.
 * @param {string=} expectedWorkspaceId Expected workspace id of event fired.
 * @param {?string=} expectedBlockId Expected block id of event fired.
 */
function assertEventNotFired(spy, instanceType, expectedProperties,
    expectedWorkspaceId, expectedBlockId) {
  expectedProperties.type = instanceType.prototype.type;
  if (expectedWorkspaceId !== undefined) {
    expectedProperties.workspaceId = expectedWorkspaceId;
  }
  if (expectedBlockId !== undefined) {
    expectedProperties.blockId = expectedBlockId;
  }
  var expectedEvent =
      sinon.match.instanceOf(instanceType).and(sinon.match(expectedProperties));
  sinon.assert.neverCalledWith(spy, expectedEvent);
}

/**
 * Filters out xml properties from given object based on key.
 * @param {Object<string, *>} properties The properties to filter.
 * @return {[Object<string, *>, Object<string, *>]} A list containing split non
 *    xml properties and xml properties.
 * @private
 */
function splitByXmlProperties_(properties) {
  var xmlProperties = {};
  var nonXmlProperties = {};
  Object.keys(properties).forEach((key) => {
    if (isXmlProperty_(key)) {
      xmlProperties[key] = properties[key];
      return false;
    } else {
      nonXmlProperties[key] = properties[key];
    }
  });
  return [nonXmlProperties, xmlProperties];
}

/**
 * Asserts that the event passed to the nth call of the given spy has the
 * expected values. Assumes that the event is passed as the first argument.
 * @param {!SinonSpy} spy The spy to use.
 * @param {number} n Which call to check.
 * @param {function(new:Blockly.Events.Abstract)} instanceType Expected instance
 *    type of event fired.
 * @param {Object<string, *>} expectedProperties Map of of expected properties
 *    to check on fired event.
 * @param {string} expectedWorkspaceId Expected workspace id of event fired.
 * @param {?string=} expectedBlockId Expected block id of event fired.
 */
function assertNthCallEventArgEquals(spy, n, instanceType, expectedProperties,
    expectedWorkspaceId, expectedBlockId) {
  var nthCall = spy.getCall(n);
  var splitProperties = splitByXmlProperties_(expectedProperties);
  var nonXmlProperties = splitProperties[0];
  var xmlProperties = splitProperties[1];

  assertEventFired(nthCall, instanceType, nonXmlProperties, expectedWorkspaceId,
      expectedBlockId);
  var eventArg = nthCall.firstArg;
  assertXmlProperties_(eventArg, xmlProperties);
}

function defineStackBlock(sharedCleanupObj) {
  Blockly.defineBlocksWithJsonArray([{
    "type": "stack_block",
    "message0": "",
    "previousStatement": null,
    "nextStatement": null
  }]);
}

function defineRowBlock(sharedCleanupObj) {
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

function defineStatementBlock(sharedCleanupObj) {
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
function defineBasicBlockWithField(sharedCleanupObj) {
  Blockly.defineBlocksWithJsonArray([{
    "type": "test_field_block",
    "message0": "%1",
    "args0": [
      {
        "type": "field_input",
        "name": "NAME"
      }
    ],
    "output": null
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

function createRenderedBlock(workspaceSvg, type) {
  var block = workspaceSvg.newBlock(type);
  block.initSvg();
  block.render();
  return block;
}

/**
 * Triggers pointer event on target.
 * @param {!EventTarget} target The object receiving the event.
 * @param {string} type The type of mouse event (eg: mousedown, mouseup,
 *    click).
 * @param {Object<string, string>=} properties Properties to pass into event
 *    constructor.
 */
function dispatchPointerEvent(target, type, properties) {
  const eventInitDict = {
    cancelable: true,
    bubbles: true,
    isPrimary: true,
    pressure: 0.5,
    clientX: 10,
    clientY: 10,
  };
  if (properties) {
    Object.assign(eventInitDict, properties);
  }
  const event = new PointerEvent(type, eventInitDict);
  target.dispatchEvent(event);
}

/**
 * Simulates mouse click by triggering relevant mouse events.
 * @param {!EventTarget} target The object receiving the event.
 * @param {Object<string, string>=} properties Properties to pass into event
 *    constructor.
 */
function simulateClick(target, properties) {
  dispatchPointerEvent(target, 'pointerdown', properties);
  dispatchPointerEvent(target, 'pointerup', properties);
  dispatchPointerEvent(target, 'click', properties);
}
