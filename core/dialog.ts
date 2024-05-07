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
export let confirm = (
  message: string,
  callback: (confirmed: boolean) => void,
) => {
  callback(window.confirm(message));
};

/**
 * Sets the function to be run when Blockly.dialog.confirm() is called.
 *
 * @param confirmFunction The function to be run.
 * @see Blockly.dialog.confirm
 */
export function setConfirm(
  confirmFunction: (
    message: string,
    callback: (confirmed: boolean) => void,
  ) => void,
) {
  confirm = confirmFunction;
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
export let prompt = (
  message: string,
  defaultValue: string,
  callback: (userInput: string | null) => void,
) => {
  callback(window.prompt(message, defaultValue));
};

/**
 * Sets the function to be run when Blockly.dialog.prompt() is called.
 *
 * @param promptFunction The function to be run.
 * @see Blockly.dialog.prompt
 */
export function setPrompt(
  promptFunction: (
    message: string,
    defaultValue: string,
    callback: (userInput: string | null) => void,
  ) => void,
) {
  prompt = promptFunction;
}
