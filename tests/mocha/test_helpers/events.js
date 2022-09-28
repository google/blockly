/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

goog.module('Blockly.test.helpers.events');


/**
 * Creates spy for workspace fireChangeListener
 * @param {!Blockly.Workspace} workspace The workspace to spy fireChangeListener
 *    calls on.
 * @return {!SinonSpy} The created spy.
 */
function createFireChangeListenerSpy(workspace) {
  return sinon.spy(workspace, 'fireChangeListener');
}
exports.createFireChangeListenerSpy = createFireChangeListenerSpy;

/**
 * Asserts whether the given xml property has the expected property.
 * @param {!Node} xmlValue The xml value to check.
 * @param {!Node|string} expectedValue The expected value.
 * @param {string=} message Optional message to use in assert message.
 * @private
 */
function assertXmlPropertyEqual_(xmlValue, expectedValue, message) {
  const value = Blockly.Xml.domToText(xmlValue);
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
    const value = obj[key];
    const expectedValue = expectedXmlProperties[key];
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
 * @param {!Blockly.Events.Abstract} event The event to check.
 * @param {string} expectedType Expected type of event fired.
 * @param {string} expectedWorkspaceId Expected workspace id of event fired.
 * @param {?string} expectedBlockId Expected block id of event fired.
 * @param {!Object<string, *>} expectedProperties Map of of additional expected
 *    properties to check on fired event.
 * @param {boolean=} [isUiEvent=false] Whether the event is a UI event.
 * @param {string=} message Optional message to prepend assert messages.
 */
function assertEventEquals(event, expectedType,
    expectedWorkspaceId, expectedBlockId, expectedProperties, isUiEvent = false, message) {
  let prependMessage = message ? message + ' ' : '';
  prependMessage += 'Event fired ';
  chai.assert.equal(event.type, expectedType,
      prependMessage + 'type');
  chai.assert.equal(event.workspaceId, expectedWorkspaceId,
      prependMessage + 'workspace id');
  chai.assert.equal(event.blockId, expectedBlockId,
      prependMessage + 'block id');
  Object.keys(expectedProperties).map((key) => {
    const value = event[key];
    const expectedValue = expectedProperties[key];
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
  if (isUiEvent) {
    chai.assert.isTrue(event.isUiEvent);
  } else {
    chai.assert.isFalse(event.isUiEvent);
  }
}
exports.assertEventEquals = assertEventEquals;

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
    workspaceId: expectedWorkspaceId,
    blockId: expectedBlockId,
  }, expectedProperties);
  const expectedEvent =
      sinon.match.instanceOf(instanceType).and(sinon.match(expectedProperties));
  sinon.assert.calledWith(spy, expectedEvent);
}
exports.assertEventFired = assertEventFired;

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
  const expectedEvent =
      sinon.match.instanceOf(instanceType).and(sinon.match(expectedProperties));
  sinon.assert.neverCalledWith(spy, expectedEvent);
}
exports.assertEventNotFired = assertEventNotFired;

/**
 * Filters out xml properties from given object based on key.
 * @param {Object<string, *>} properties The properties to filter.
 * @return {Array<Object<string, *>>} A list containing split non
 *    xml properties and xml properties. [Object<string, *>, Object<string, *>]
 * @private
 */
function splitByXmlProperties_(properties) {
  const xmlProperties = {};
  const nonXmlProperties = {};
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
  const nthCall = spy.getCall(n);
  const splitProperties = splitByXmlProperties_(expectedProperties);
  const nonXmlProperties = splitProperties[0];
  const xmlProperties = splitProperties[1];

  assertEventFired(nthCall, instanceType, nonXmlProperties, expectedWorkspaceId,
      expectedBlockId);
  const eventArg = nthCall.firstArg;
  assertXmlProperties_(eventArg, xmlProperties);
}
exports.assertNthCallEventArgEquals = assertNthCallEventArgEquals;
