/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

goog.module('Blockly.test.helpers.warnings');


/**
 * Captures the strings sent to console.warn() when calling a function.
 * Copies from core.
 * @param {Function} innerFunc The function where warnings may called.
 * @return {Array<string>} The warning messages (only the first arguments).
 */
function captureWarnings(innerFunc) {
  const msgs = [];
  const nativeConsoleWarn = console.warn;
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
exports.captureWarnings = captureWarnings;

/**
 * Asserts that the given function logs the provided warning messages.
 * @param {function()} innerFunc The function to call.
 * @param {Array<!RegExp>|!RegExp} messages A list of regex for the expected
 *    messages (in the expected order).
 */
function assertWarnings(innerFunc, messages) {
  if (!Array.isArray(messages)) {
    messages = [messages];
  }
  const warnings = captureWarnings(innerFunc);
  chai.assert.lengthOf(warnings, messages.length);
  messages.forEach((message, i) => {
    chai.assert.match(warnings[i], message);
  });
}
exports.assertWarnings = assertWarnings;

/**
 * Asserts that the given function logs no warning messages.
 * @param {function()} innerFunc The function to call.
 */
function assertNoWarnings(innerFunc) {
  assertWarnings(innerFunc, []);
}
exports.assertNoWarnings = assertNoWarnings;

/**
 * Stubs Blockly.utils.deprecation.warn call.
 * @return {!SinonStub} The created stub.
 */
function createDeprecationWarningStub() {
  return sinon.stub(Blockly.utils.deprecation, 'warn');
}
exports.createDeprecationWarningStub = createDeprecationWarningStub;

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
exports.assertDeprecationWarningCall = assertDeprecationWarningCall;

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
exports.assertSingleDeprecationWarningCall = assertSingleDeprecationWarningCall;
