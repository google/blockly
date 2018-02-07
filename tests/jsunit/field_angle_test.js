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
 * @fileoverview Tests for Blockly.FieldAngle
 * @author Anm@anm.me (Andrew n marshall)
 */
'use strict';

function test_fieldangle_constructor() {
  assertEquals(new Blockly.FieldAngle().getValue(), '0');
  assertEquals(new Blockly.FieldAngle(null).getValue(), '0');
  assertEquals(new Blockly.FieldAngle(undefined).getValue(), '0');
  assertEquals(new Blockly.FieldAngle(1).getValue(), '1');
  assertEquals(new Blockly.FieldAngle(1.5).getValue(), '1.5');
  assertEquals(new Blockly.FieldAngle('2').getValue(), '2');
  assertEquals(new Blockly.FieldAngle('2.5').getValue(), '2.5');

  // Bad values
  assertEquals(new Blockly.FieldAngle('bad').getValue(), '0');
  assertEquals(new Blockly.FieldAngle(NaN).getValue(), '0');
}

function test_fieldangle_fromJson() {
  assertEquals(Blockly.FieldAngle.fromJson({}).getValue(), '0');
  assertEquals(Blockly.FieldAngle.fromJson({ angle: 1 }).getValue(), '1');
}
