/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2017 Google Inc.
 * https://developers.google.com/blockly/
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

 /**
 * @fileoverview Tests for Blockly.FieldNumber
 * @author Anm@anm.me (Andrew n marshall)
 */
'use strict';

function test_fieldnumber_constructor() {
  // No arguments
  var field = new Blockly.FieldNumber();
  assertEquals(field.getValue(), '0');
  assertEquals(field.min_, -Infinity);
  assertEquals(field.max_, Infinity);
  assertEquals(field.precision_, 0);

  // Numeric values
  field = new Blockly.FieldNumber(1);
  assertEquals(field.getValue(), '1');
  field = new Blockly.FieldNumber(1.5);
  assertEquals(field.getValue(), '1.5');

  // String value
  field = new Blockly.FieldNumber('2');
  assertEquals(field.getValue(), '2');
  field = new Blockly.FieldNumber('2.5');
  assertEquals(field.getValue(), '2.5');

  // All values
  field = new Blockly.FieldNumber(
    /* value */ 0,
    /* min */ -128,
    /* max */ 127,
    /* precision */ 1);
  assertEquals(field.getValue(), '0');
  assertEquals(field.min_, -128);
  assertEquals(field.max_, 127);
  assertEquals(field.precision_, 1);

  // Bad value defaults to '0'
  field = new Blockly.FieldNumber('bad');
  assertEquals(field.getValue(), '0');
  field = new Blockly.FieldNumber(NaN);
  assertEquals(field.getValue(), '0');
}
