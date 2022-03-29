/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

goog.module('Blockly.test.helpers.userInput');

const {KeyCodes} = goog.require('Blockly.utils.KeyCodes');


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
exports.dispatchPointerEvent = dispatchPointerEvent;

/**
 * Creates a key down event used for testing.
 * @param {number} keyCode The keycode for the event. Use Blockly.utils.KeyCodes enum.
 * @param {!Array<number>=} modifiers A list of modifiers. Use Blockly.utils.KeyCodes enum.
 * @return {!KeyboardEvent} The mocked keydown event.
 */
function createKeyDownEvent(keyCode, modifiers) {
  const event = {
    keyCode: keyCode,
  };
  if (modifiers && modifiers.length > 0) {
    event.altKey = modifiers.indexOf(KeyCodes.ALT) > -1;
    event.ctrlKey = modifiers.indexOf(KeyCodes.CTRL) > -1;
    event.metaKey = modifiers.indexOf(KeyCodes.META) > -1;
    event.shiftKey = modifiers.indexOf(KeyCodes.SHIFT) > -1;
  }
  return new KeyboardEvent('keydown', event);
}
exports.createKeyDownEvent = createKeyDownEvent;

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
exports.simulateClick = simulateClick;
