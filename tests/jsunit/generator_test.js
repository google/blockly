/**
 * @license
 * Copyright 2012 Google LLC
 * SPDX-License-Identifier: Apache-2.0
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
  },
  {
    "type": "controls_repeat_ext",
    "message0": "Repeat Loop",
    "message1": "%1",
    "args1": [{
      "type": "input_statement",
      "name": "DO"
    }],
    "previousStatement": null,
    "nextStatement": null
  }]);
}

function undefineGeneratorTestBlocks() {
  delete Blockly.Blocks['stack_block'];
  delete Blockly.Blocks['row_block'];
}

function generatorTest_setUp() {
  defineGeneratorTestBlocks();
  workspace = new Blockly.Workspace();
}

function generatorTest_tearDown() {
  undefineGeneratorTestBlocks();
  workspace.dispose();
}

function blockToCodeTestSetup(generator) {
  var row_block = workspace.newBlock('row_block');
  var stack_block = workspace.newBlock('stack_block');

  generator.row_block = function(block){return 'row_block'};
  generator.stack_block = function(block){return 'stack_block'};
  row_block.nextConnection.connect(stack_block.previousConnection);
  return row_block;
}

function blockToCodeTest(generator, opt_thisOnly) {
  var row_block = blockToCodeTestSetup(generator);
  return generator.blockToCode(row_block, opt_thisOnly);
}

function disabledBlockTest(generator, opt_thisOnly) {
  var row_block = blockToCodeTestSetup(generator);
  row_block.disabled=true;
  return generator.blockToCode(row_block, opt_thisOnly);
}

function nestedLoopTest(generator, opt_thisOnly) {
  Blockly.Msg['CONTROLS_REPEAT_TITLE'] = 'repeat %1 times';
  var blockA = workspace.newBlock('controls_repeat_ext');
  var blockB = workspace.newBlock('controls_repeat_ext');
  var blockC = workspace.newBlock('controls_repeat_ext');
  generator.controls_repeat_ext = getControlRepeatFunc(generator);

  blockA.getInput('DO').connection.connect(blockB.previousConnection);
  blockA.nextConnection.connect(blockC.previousConnection);
  return generator.blockToCode(blockA, opt_thisOnly);
}

function getControlRepeatFunc(generator) {
  return function(block){
    return '{' +  generator.statementToCode(block, 'DO') + '}';
  };
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

function test_disabledBlockToCode() {
  generatorTest_setUp();

  assertEquals(disabledBlockTest(Blockly.Dart, true), '');
  assertEquals(disabledBlockTest(Blockly.Dart, false), 'stack_block');

  assertEquals(disabledBlockTest(Blockly.JavaScript, true), '');
  assertEquals(disabledBlockTest(Blockly.JavaScript, false), 'stack_block');

  assertEquals(disabledBlockTest(Blockly.Lua, true), '');
  assertEquals(disabledBlockTest(Blockly.Lua, false), 'stack_block');

  assertEquals(disabledBlockTest(Blockly.PHP, true), '');
  assertEquals(disabledBlockTest(Blockly.PHP, false), 'stack_block');

  assertEquals(disabledBlockTest(Blockly.Python, true), '');
  assertEquals(disabledBlockTest(Blockly.Python, false), 'stack_block');

  generatorTest_tearDown();
}

// {  {}} represents a nested block 
//{  {}}{} represents a nested block with a block after it
function test_nestedLoopBlockToCode() {
  generatorTest_setUp();

  assertEquals(nestedLoopTest(Blockly.Dart, true), '{  {}}');
  assertEquals(nestedLoopTest(Blockly.Dart, false), '{  {}}{}');

  assertEquals(nestedLoopTest(Blockly.JavaScript, true), '{  {}}');
  assertEquals(nestedLoopTest(Blockly.JavaScript, false), '{  {}}{}');

  assertEquals(nestedLoopTest(Blockly.Lua, true), '{  {}}');
  assertEquals(nestedLoopTest(Blockly.Lua, false), '{  {}}{}');

  assertEquals(nestedLoopTest(Blockly.PHP, true), '{  {}}');
  assertEquals(nestedLoopTest(Blockly.PHP, false), '{  {}}{}');

  assertEquals(nestedLoopTest(Blockly.Python, true), '{  {}}');
  assertEquals(nestedLoopTest(Blockly.Python, false), '{  {}}{}');

  generatorTest_tearDown();
}

function test_prefix() {
  var generator = new Blockly.Generator('INTERCAL');
  assertEquals('Prefix nothing.', '', generator.prefixLines('', ''));
  assertEquals('Prefix a word.', '@Hello', generator.prefixLines('Hello', '@'));
  assertEquals('Prefix one line.', '12Hello\n', generator.prefixLines('Hello\n', '12'));
  assertEquals('Prefix two lines.', '***Hello\n***World\n', generator.prefixLines('Hello\nWorld\n', '***'));
}