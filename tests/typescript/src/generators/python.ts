/**
 * @license
 * Copyright 2024 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import * as Blockly from 'blockly-test/core';

/**
 * Test: should be able to import a generator instance, class, and
 * Order enum.
 */
import {pythonGenerator, PythonGenerator, Order} from 'blockly-test/python';

/**
 * Test: should be able to create a simple block generator function,
 * correctly typed, and insert it into the .forBlock dictionary.
 */
pythonGenerator.forBlock['the_answer'] = function (
  _block: Blockly.Block,
  _generator: PythonGenerator,
): [string, Order] {
  return ['42', Order.ATOMIC];
};
