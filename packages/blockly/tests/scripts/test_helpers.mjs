/**
 * @license
 * Copyright 2022 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Node test scripts.
 */
import asyncDone from 'async-done';
import {spawnSync} from 'child_process';

export const BOLD_GREEN = '\x1b[1;32m';
export const BOLD_RED = '\x1b[1;31m';
export const ANSI_RESET = '\x1b[0m';

/**
 * Run an arbitrary function as a test.
 * @param {id} id The test id/name.
 * @param {function(): Promise} testFunction Any function to be run as a test.
 * @return {Promise} Asynchronous result.
 */
export function runTestFunction(id, testFunction) {
  return new Promise((resolve) => {
    console.log('=======================================');
    console.log(`== ${id}`);

    // Turn the testFunction into a Promise
    const asyncFunction = new Promise((resolve, reject) => {
      asyncDone(testFunction, (error, result) => {
        if (error) reject(error);
        resolve(result);
      });
    });

    if (process.env.CI) console.log('::group::');
    asyncFunction
      .then((result) => {
        if (process.env.CI) console.log('::endgroup::');
        console.log(`${BOLD_GREEN}SUCCESS:${ANSI_RESET} ${id}`);
        resolve(result);
      })
      .catch((err) => {
        console.error(err.message);
        if (process.env.CI) console.log('::endgroup::');
        console.log(`${BOLD_RED}FAILED:${ANSI_RESET} ${id}`);
        // Always continue.
        resolve(err);
      });
  });
}

/**
 * Helper method for running test command.
 * @param {id} id The test command id/name.
 * @param {string} command Command line to run.
 * @return {Promise} Asynchronous result.
 */
export async function runTestCommand(id, command) {
  return runTestFunction(id, async () => {
    const result = spawnSync(command, {
      shell: true,
      stdio: 'inherit',
      env: process.env,
    });
    if (result.error) {
      throw result.error;
    }
    if (result.status !== 0) {
      throw new Error(
        `Command failed with exit code ${result.status}: ${command}`,
      );
    }
  });
}
