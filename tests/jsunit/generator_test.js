/**
 * @license
 * Blockly Tests
 *
 * Copyright 2012 Google Inc.
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
'use strict';

goog.require('Blockly.Dart');
goog.require('Blockly.JavaScript');
goog.require('Blockly.Lua');
goog.require('Blockly.PHP');
goog.require('Blockly.Python');

var workspace;

function defineGeneratorTestBlocks() {
  Blockly.defineBlocksWithJsonArray([{
    "type": "stack_block",
    "message0": "",
    "previousStatement": null,
    "nextStatement": null
  },
  {
    "type": "row_block",
    "message0": "%1",
    "args0": [
      {
        "type": "input_value",
        "name": "INPUT"
      }
    ],
    "output": null,
    "nextStatement": null
  }]);
}

function undefineTestBlocks() {
  delete Blockly.Blocks['stack_block'];
  delete Blockly.Blocks['row_block'];
}

function generatorTest_setUp() {
  defineGeneratorTestBlocks();
  workspace = new Blockly.Workspace();
}

function generatorTest_tearDown() {
  undefineTestBlocks();
  workspace.dispose();
}

function blockToCodeTest(generator, opt_thisOnly) {
  var row_block = workspace.newBlock("row_block");
  var stack_block = workspace.newBlock("stack_block");

  generator.row_block = (block) => {return "row_block"};
  generator.stack_block = (block) => {return "stack_block"};
  row_block.nextConnection.connect(stack_block.previousConnection);
  return generator.blockToCode(row_block, opt_thisOnly);
}

function test_blockToCodeOnAllGeneartors() {
  generatorTest_setUp();

  assertEquals(blockToCodeTest(Blockly.Dart, true), 'row_block');
  assertEquals(blockToCodeTest(Blockly.Dart, false), 'row_blockstack_block');

  assertEquals(blockToCodeTest(Blockly.JavaScript, true), 'row_block');
  assertEquals(blockToCodeTest(Blockly.JavaScript, false), 'row_blockstack_block');

  assertEquals(blockToCodeTest(Blockly.Lua, true), 'row_block');
  assertEquals(blockToCodeTest(Blockly.Lua, false), 'row_blockstack_block');

  assertEquals(blockToCodeTest(Blockly.PHP, true), 'row_block');
  assertEquals(blockToCodeTest(Blockly.PHP, false), 'row_blockstack_block');

  assertEquals(blockToCodeTest(Blockly.Python, true), 'row_block');
  assertEquals(blockToCodeTest(Blockly.Python, false), 'row_blockstack_block');

  generatorTest_tearDown();
}

function test_prefix() {
  var generator = new Blockly.Generator('INTERCAL');
  assertEquals('Prefix nothing.', '', generator.prefixLines('', ''));
  assertEquals('Prefix a word.', '@Hello', generator.prefixLines('Hello', '@'));
  assertEquals('Prefix one line.', '12Hello\n', generator.prefixLines('Hello\n', '12'));
  assertEquals('Prefix two lines.', '***Hello\n***World\n', generator.prefixLines('Hello\nWorld\n', '***'));
}