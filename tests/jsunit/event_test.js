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
 * @fileoverview Tests for Blockly.Events
 * @author marisaleung@google.com (Marisa Leung)
 */
'use strict';

goog.require('goog.testing');
goog.require('goog.testing.MockControl');

var mockControl_;
var saved_msg = Blockly.Msg.DELETE_VARIABLE;
var workspace;

function eventTest_setUp() {
  workspace = new Blockly.Workspace();
  mockControl_ = new goog.testing.MockControl();
}

function eventTest_setUpWithMockBlocks() {
  eventTest_setUp();
  Blockly.defineBlocksWithJsonArray([{
    'type': 'field_variable_test_block',
    'message0': '%1',
    'args0': [
      {
        'type': 'field_variable',
        'name': 'VAR',
        'variable': 'item'
      }
    ],
  }]);
  // Need to define this because field_variable's dropdownCreate() calls replace
  // on undefined value, Blockly.Msg.DELETE_VARIABLE. To fix this, define
  // Blockly.Msg.DELETE_VARIABLE as %1 so the replace function finds the %1 it
  // expects.
  Blockly.Msg.DELETE_VARIABLE = '%1';
}

function eventTest_tearDown() {
  mockControl_.$tearDown();
  workspace.dispose();
}

function eventTest_tearDownWithMockBlocks() {
  eventTest_tearDown();
  delete Blockly.Blocks.field_variable_test_block;
  Blockly.Msg.DELETE_VARIABLE = saved_msg;
}

function test_abstract_constructor_block() {
  eventTest_setUpWithMockBlocks();
  setUpMockMethod(mockControl_, Blockly.utils, 'genUid', null, '1');
  var block = new Blockly.Block(workspace, 'field_variable_test_block');
  var event = new Blockly.Events.Abstract(block);
  assertEquals('1', event.blockId);
  assertEquals(workspace.id, event.workspaceId);
  assertEquals('', event.group);
  assertEquals(true, event.recordUndo);
  eventTest_tearDownWithMockBlocks();
}

function test_abstract_constructor_null() {
  eventTest_setUpWithMockBlocks();
  var event = new Blockly.Events.Abstract(null);
  assertUndefined(event.blockId);
  assertUndefined(event.workspaceId);
  assertEquals('', event.group);
  assertEquals(true, event.recordUndo);
  eventTest_tearDownWithMockBlocks();
}

function checkCreateEventValues(event, block, ids, type) {
  var expected_xml = Blockly.Xml.domToText(Blockly.Xml.blockToDom(block));
  var result_xml = Blockly.Xml.domToText(event.xml);
  assertEquals(expected_xml, result_xml);
  isEqualArrays(ids, event.ids);
  assertEquals(type, event.type);
}

function checkDeleteEventValues(event, block, ids, type) {
  var expected_xml = Blockly.Xml.domToText(Blockly.Xml.blockToDom(block));
  var result_xml = Blockly.Xml.domToText(event.oldXml);
  assertEquals(expected_xml, result_xml);
  isEqualArrays(ids, event.ids);
  assertEquals(type, event.type);
}

function checkChangeAndMoveEventValues(event, values) {
  var keys = Object.keys(values);
  for (var i = 0, field; field = keys[i]; i++) {
    assertEquals(values[field], event[field]);
  }
}

function test_create_constructor() {
  eventTest_setUpWithMockBlocks();
  setUpMockMethod(mockControl_, Blockly.utils, 'genUid', null, ['1']);
  var block = new Blockly.Block(workspace, 'field_variable_test_block');
  var event = new Blockly.Events.Create(block);
  checkCreateEventValues(event, block, ['1'], 'create');
  eventTest_tearDownWithMockBlocks();
}

function test_blockCreate_constructor() {
  // expect that blockCreate behaves the same as create.
  eventTest_setUpWithMockBlocks();
  setUpMockMethod(mockControl_, Blockly.utils, 'genUid', null, ['1']);
  var block = new Blockly.Block(workspace, 'field_variable_test_block');
  var event = new Blockly.Events.BlockCreate(block);
  checkCreateEventValues(event, block, ['1'], 'create');
  eventTest_tearDownWithMockBlocks();
}

function test_delete_constructor() {
  eventTest_setUpWithMockBlocks();
  setUpMockMethod(mockControl_, Blockly.utils, 'genUid', null, ['1']);
  var block = new Blockly.Block(workspace, 'field_variable_test_block');
  var event = new Blockly.Events.Delete(block);
  checkDeleteEventValues(event, block, ['1'], 'delete');
  eventTest_tearDownWithMockBlocks();
}

function test_blockDelete_constructor() {
  eventTest_setUpWithMockBlocks();
  setUpMockMethod(mockControl_, Blockly.utils, 'genUid', null, ['1']);
  var block = new Blockly.Block(workspace, 'field_variable_test_block');
  var event = new Blockly.Events.BlockDelete(block);
  checkDeleteEventValues(event, block, ['1'], 'delete');
  eventTest_tearDownWithMockBlocks();
}

function test_change_constructor() {
  eventTest_setUpWithMockBlocks();
  setUpMockMethod(mockControl_, Blockly.utils, 'genUid', null, ['1']);
  var block = new Blockly.Block(workspace, 'field_variable_test_block');
  var event = new Blockly.Events.Change(block, 'field', 'VAR', 'item', 'item2');
  checkChangeAndMoveEventValues(event, {'element': 'field', 'name': 'VAR',
    'oldValue': 'item', 'newValue': 'item2', 'type': 'change'});
  eventTest_tearDownWithMockBlocks();
}

function test_blockChange_constructor() {
  eventTest_setUpWithMockBlocks();
  setUpMockMethod(mockControl_, Blockly.utils, 'genUid', null, ['1']);
  var block = new Blockly.Block(workspace, 'field_variable_test_block');
  var event = new Blockly.Events.BlockChange(block, 'field', 'VAR', 'item',
    'item2');
  checkChangeAndMoveEventValues(event, {'element': 'field', 'name': 'VAR',
    'oldValue': 'item', 'newValue': 'item2', 'type': 'change'});
  eventTest_tearDownWithMockBlocks();
}

function test_move_constructorCoordinate() {
  // Expect the oldCoordinate to be set.
  eventTest_setUpWithMockBlocks();
  setUpMockMethod(mockControl_, Blockly.utils, 'genUid', null, ['1', '2']);
  var block1 = new Blockly.Block(workspace, 'field_variable_test_block');
  var coordinate = new goog.math.Coordinate(3,4);
  block1.xy_ = coordinate;

  var event = new Blockly.Events.Move(block1);
  checkChangeAndMoveEventValues(event, {'oldCoordinate': coordinate,
    'type': 'move'});
  eventTest_tearDownWithMockBlocks();
}

function test_move_constructoroldParentId() {
  // Expect the oldParentId to be set but not the oldCoordinate to be set.
  eventTest_setUpWithMockBlocks();
  setUpMockMethod(mockControl_, Blockly.utils, 'genUid', null, ['1', '2']);
  var block1 = new Blockly.Block(workspace, 'field_variable_test_block');
  var block2 = new Blockly.Block(workspace, 'field_variable_test_block');
  block1.parentBlock_ = block2;
  block1.xy_ = new goog.math.Coordinate(3,4);

  var event = new Blockly.Events.Move(block1);
  checkChangeAndMoveEventValues(event, {'oldCoordinate': undefined,
    'oldParentId': '2', 'type': 'move'});
  block1.parentBlock_ = null;
  eventTest_tearDownWithMockBlocks();
}

function test_blockMove_constructorCoordinate() {
  // Expect the oldCoordinate to be set.
  eventTest_setUpWithMockBlocks();
  setUpMockMethod(mockControl_, Blockly.utils, 'genUid', null, ['1', '2']);
  var block1 = new Blockly.Block(workspace, 'field_variable_test_block');
  var coordinate = new goog.math.Coordinate(3,4);
  block1.xy_ = coordinate;

  var event = new Blockly.Events.BlockMove(block1);
  checkChangeAndMoveEventValues(event, {'oldCoordinate': coordinate,
    'type': 'move'});
  eventTest_tearDownWithMockBlocks();
}

function test_blockMove_constructoroldParentId() {
  // Expect the oldParentId to be set but not the oldCoordinate to be set.
  eventTest_setUpWithMockBlocks();
  setUpMockMethod(mockControl_, Blockly.utils, 'genUid', null, ['1', '2']);
  var block1 = new Blockly.Block(workspace, 'field_variable_test_block');
  var block2 = new Blockly.Block(workspace, 'field_variable_test_block');
  block1.parentBlock_ = block2;
  block1.xy_ = new goog.math.Coordinate(3,4);

  var event = new Blockly.Events.BlockMove(block1);
  checkChangeAndMoveEventValues(event, {'oldCoordinate': undefined,
    'oldParentId': '2', 'type': 'move'});
  block1.parentBlock_ = null;
  eventTest_tearDownWithMockBlocks();
}
