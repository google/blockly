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
 * @fileoverview Tests for Blockly.Input
 */
'use strict';

function test_appendField_simple() {
  var ws = new Blockly.Workspace();
  var block = new Blockly.Block(ws);
  var input = new Blockly.Input(Blockly.DUMMY_INPUT, 'INPUT', block);
  var field1 = new Blockly.FieldLabel('#1');
  var field2 = new Blockly.FieldLabel('#2');

  // Preconditions
  assertEquals(0, input.fieldRow.length);

  // Actual Tests
  input.appendField(field1, 'first');
  assertEquals(1, input.fieldRow.length);
  assertEquals(field1, input.fieldRow[0]);
  assertEquals('first', input.fieldRow[0].name);
  assertEquals(block, field1.sourceBlock_);

  input.appendField(field2, 'second');
  assertEquals(2, input.fieldRow.length);
  assertEquals(field2, input.fieldRow[1]);
  assertEquals('second', input.fieldRow[1].name);
  assertEquals(block, field2.sourceBlock_);
}

function test_appendField_string() {
  var ws = new Blockly.Workspace();
  var block = new Blockly.Block(ws);
  var input = new Blockly.Input(Blockly.DUMMY_INPUT, 'INPUT', block);
  var labelText = 'label';

  // Preconditions
  assertEquals(0, input.fieldRow.length);

  // Actual Tests
  input.appendField(labelText, 'name');
  assertEquals(1, input.fieldRow.length);
  assertEquals(Blockly.FieldLabel, input.fieldRow[0].constructor);
  assertEquals(labelText, input.fieldRow[0].getValue());
  assertEquals('name', input.fieldRow[0].name);
}

function test_appendField_prefix() {
  var ws = new Blockly.Workspace();
  var block = new Blockly.Block(ws);
  var input = new Blockly.Input(Blockly.DUMMY_INPUT, 'INPUT', block);
  var prefix = new Blockly.FieldLabel('prefix');
  var field = new Blockly.FieldLabel('field');
  field.prefixField = prefix;

  // Preconditions
  assertEquals(0, input.fieldRow.length);

  // Actual Tests
  input.appendField(field);
  assertEquals(2, input.fieldRow.length);
  assertEquals(prefix, input.fieldRow[0]);
  assertEquals(field, input.fieldRow[1]);
}

function test_appendField_suffix() {
  var ws = new Blockly.Workspace();
  var block = new Blockly.Block(ws);
  var input = new Blockly.Input(Blockly.DUMMY_INPUT, 'INPUT', block);
  var suffix = new Blockly.FieldLabel('suffix');
  var field = new Blockly.FieldLabel('field');
  field.suffixField = suffix;

  // Preconditions
  assertEquals(0, input.fieldRow.length);

  // Actual Tests
  input.appendField(field);
  assertEquals(2, input.fieldRow.length);
  assertEquals(field, input.fieldRow[0]);
  assertEquals(suffix, input.fieldRow[1]);
}

function test_insertFieldAt_simple() {
  var ws = new Blockly.Workspace();
  var block = new Blockly.Block(ws);
  var input = new Blockly.Input(Blockly.DUMMY_INPUT, 'INPUT', block);
  var before = new Blockly.FieldLabel('before');
  var after = new Blockly.FieldLabel('after');
  var between = new Blockly.FieldLabel('between');
  input.appendField(before);
  input.appendField(after);

  // Preconditions
  assertEquals(2, input.fieldRow.length);
  assertEquals(before, input.fieldRow[0]);
  assertEquals(after, input.fieldRow[1]);

  // Actual Tests
  input.insertFieldAt(1, between, 'name');
  assertEquals(3, input.fieldRow.length);
  assertEquals(before, input.fieldRow[0]);
  assertEquals(between, input.fieldRow[1]);
  assertEquals('name', input.fieldRow[1].name);
  assertEquals(after, input.fieldRow[2]);
}

function test_insertFieldAt_string() {
  var ws = new Blockly.Workspace();
  var block = new Blockly.Block(ws);
  var input = new Blockly.Input(Blockly.DUMMY_INPUT, 'INPUT', block);
  var before = new Blockly.FieldLabel('before');
  var after = new Blockly.FieldLabel('after');
  var labelText = 'label';
  input.appendField(before);
  input.appendField(after);

  // Preconditions
  assertEquals(2, input.fieldRow.length);
  assertEquals(before, input.fieldRow[0]);
  assertEquals(after, input.fieldRow[1]);

  // Actual Tests
  input.insertFieldAt(1, labelText, 'name');
  assertEquals(3, input.fieldRow.length);
  assertEquals(before, input.fieldRow[0]);
  assertEquals(Blockly.FieldLabel, input.fieldRow[1].constructor);
  assertEquals(labelText, input.fieldRow[1].getValue());
  assertEquals('name', input.fieldRow[1].name);
  assertEquals(after, input.fieldRow[2]);
}

function test_insertFieldAt_prefix() {
  var ws = new Blockly.Workspace();
  var block = new Blockly.Block(ws);
  var input = new Blockly.Input(Blockly.DUMMY_INPUT, 'INPUT', block);
  var before = new Blockly.FieldLabel('before');
  var after = new Blockly.FieldLabel('after');
  var prefix = new Blockly.FieldLabel('prefix');
  var between = new Blockly.FieldLabel('between');
  between.prefixField = prefix
  input.appendField(before);
  input.appendField(after);

  // Preconditions
  assertEquals(2, input.fieldRow.length);
  assertEquals(before, input.fieldRow[0]);
  assertEquals(after, input.fieldRow[1]);

  // Actual Tests
  input.insertFieldAt(1, between);
  assertEquals(4, input.fieldRow.length);
  assertEquals(before, input.fieldRow[0]);
  assertEquals(prefix, input.fieldRow[1]);
  assertEquals(between, input.fieldRow[2]);
  assertEquals(after, input.fieldRow[3]);
}

function test_insertFieldAt_prefix() {
  var ws = new Blockly.Workspace();
  var block = new Blockly.Block(ws);
  var input = new Blockly.Input(Blockly.DUMMY_INPUT, 'INPUT', block);
  var before = new Blockly.FieldLabel('before');
  var after = new Blockly.FieldLabel('after');
  var suffix = new Blockly.FieldLabel('suffix');
  var between = new Blockly.FieldLabel('between');
  between.suffixField = suffix
  input.appendField(before);
  input.appendField(after);

  // Preconditions
  assertEquals(2, input.fieldRow.length);
  assertEquals(before, input.fieldRow[0]);
  assertEquals(after, input.fieldRow[1]);

  // Actual Tests
  input.insertFieldAt(1, between);
  assertEquals(4, input.fieldRow.length);
  assertEquals(before, input.fieldRow[0]);
  assertEquals(between, input.fieldRow[1]);
  assertEquals(suffix, input.fieldRow[2]);
  assertEquals(after, input.fieldRow[3]);
}