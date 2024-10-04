/**
 * @license
 * Copyright 2024 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import * as Blockly from 'blockly-test/core';
import {JavascriptGenerator} from 'blockly-test/javascript';
import {PhpGenerator, phpGenerator, Order} from 'blockly-test/php';
import {LuaGenerator} from 'blockly-test/lua';
import {PythonGenerator} from 'blockly-test/python';
import {DartGenerator} from 'blockly-test/dart';

JavascriptGenerator;
PhpGenerator;
LuaGenerator;
PythonGenerator;
DartGenerator;

class TestGenerator extends PhpGenerator {}

const testGenerator = new TestGenerator();

testGenerator.forBlock['test_block'] = function (
  _block: Blockly.Block,
  _generator: TestGenerator,
) {
  return ['a fake code string', Order.ADDITION];
};

phpGenerator.quote_('a string');
