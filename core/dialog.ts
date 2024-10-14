/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

// Former goog.module ID: Blockly.dialog

let alertImplementation = function (
  message: string,
  opt_callback?: () => void,
) {
  window.alert(message);
  if (opt_callback) {
    opt_callback();
  }
};

let confirmImplementation = function (
  message: string,
  callback: (result: boolean) => void,
) {
  callback(window.confirm(message));
};

let promptImplementation = function (
  message: string,
  defaultValue: string,
  callback: (result: string | null) => void,
) {
  callback(window.prompt(message, defaultValue));
};

/**
 * Wrapper to window.alert() that app developers may override via setAlert to
 * provide alternatives to the modal browser window.
 *
 * @param message The message to display to the user.
 * @param opt_callback The callback when the alert is dismissed.
 */
export function alert(message: string, opt_callback?: () => void) {
  alertImplementation(message, opt_callback);
}

/**
 * Sets the function to be run when Blockly.dialog.alert() is called.
 *
 * @param alertFunction The function to be run.
 * @see Blockly.dialog.alert
 */
export function setAlert(alertFunction: (p1: string, p2?: () => void) => void) {
  alertImplementation = alertFunction;
}

/**
 * Wrapper to window.confirm() that app developers may override via setConfirm
 * to provide alternatives to the modal browser window.
 *
 * @param message The message to display to the user.
 * @param callback The callback for handling user response.
 */
export function confirm(message: string, callback: (p1: boolean) => void) {
  TEST_ONLY.confirmInternal(message, callback);
}

/**
 * Private version of confirm for stubbing in tests.
 */
function confirmInternal(message: string, callback: (p1: boolean) => void) {
  confirmImplementation(message, callback);
}

/**
 * Sets the function to be run when Blockly.dialog.confirm() is called.
 *
 * @param confirmFunction The function to be run.
 * @see Blockly.dialog.confirm
 */
export function setConfirm(
  confirmFunction: (p1: string, p2: (p1: boolean) => void) => void,
) {
  confirmImplementation = confirmFunction;
}

/**
 * Wrapper to window.prompt() that app developers may override via setPrompt to
 * provide alternatives to the modal browser window. Built-in browser prompts
 * are often used for better text input experience on mobile device. We strongly
 * recommend testing mobile when overriding this.
 *
 * @param message The message to display to the user.
 * @param defaultValue The value to initialize the prompt with.
 * @param callback The callback for handling user response.
 */
export function prompt(
  message: string,
  defaultValue: string,
  callback: (p1: string | null) => void,
) {
  promptImplementation(message, defaultValue, callback);
}

/**
 * Sets the function to be run when Blockly.dialog.prompt() is called.
 *
 * @param promptFunction The function to be run.
 * @see Blockly.dialog.prompt
 */
export function setPrompt(
  promptFunction: (
    p1: string,
    p2: string,
    p3: (p1: string | null) => void,
  ) => void,
) {
  promptImplementation = promptFunction;
}

export const TEST_ONLY = {
  confirmInternal,
};
