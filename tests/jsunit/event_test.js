/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

 /**
 * @fileoverview Tests for Blockly.Events
 * @author marisaleung@google.com (Marisa Leung)
 */
'use strict';

var mockControl_;
var workspace;

function eventTest_setUp() {
  workspace = new Blockly.Workspace();
}

function eventTest_setUpWithMockBlocks() {
  eventTest_setUp();
  // TODO: Replace with defineGetVarBlock();
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
  },
  {
    'type': 'simple_test_block',
    'message0': 'simple test block'
  }]);
}

function eventTest_tearDown() {
  delete Blockly.Blocks['field_variable_test_block'];
  delete Blockly.Blocks['simple_test_block'];
  if (mockControl_) {
    mockControl_.restore();
  }
  workspace.dispose();
}

function eventTest_tearDownWithMockBlocks() {
  eventTest_tearDown();
  delete Blockly.Blocks.field_variable_test_block;
}

function test_block_base_constructor() {
  eventTest_setUpWithMockBlocks();
  mockControl_ = setUpMockMethod(Blockly.utils, 'genUid', null, '1');
  try {
    var block = createSimpleTestBlock(workspace);

    // Here's the event we care about.
    var event = new Blockly.Events.BlockBase(block);
    assertUndefined(event.varId);
    checkExactEventValues(event, {'blockId': '1', 'workspaceId': workspace.id,
      'group': '', 'recordUndo': true});
  } finally {
    eventTest_tearDownWithMockBlocks();
  }
}

function test_var_base_constructor() {
  eventTest_setUpWithMockBlocks();
  mockControl_ = setUpMockMethod(Blockly.utils, 'genUid', null, '1');
  try {
    var variable = workspace.createVariable('name1', 'type1', 'id1');

    var event = new Blockly.Events.VarBase(variable);
    assertUndefined(event.blockId);
    checkExactEventValues(event, {'varId': 'id1',
      'workspaceId': workspace.id, 'group': '', 'recordUndo': true});
  } finally {
    eventTest_tearDownWithMockBlocks();
  }
}

function test_abstract_constructor() {
  eventTest_setUpWithMockBlocks();
  try {
    var event = new Blockly.Events.Abstract();
    assertUndefined(event.blockId);
    assertUndefined(event.workspaceId);
    assertUndefined(event.varId);
    checkExactEventValues(event, {'group': '', 'recordUndo': true});
  } finally {
    eventTest_tearDownWithMockBlocks();
  }
}

// Test util
function checkCreateEventValues(event, block, ids, type) {
  var expected_xml = Blockly.Xml.domToText(Blockly.Xml.blockToDom(block));
  var result_xml = Blockly.Xml.domToText(event.xml);
  assertEquals(expected_xml, result_xml);
  isEqualArrays(ids, event.ids);
  assertEquals(type, event.type);
}

// Test util
function checkDeleteEventValues(event, block, ids, type) {
  var expected_xml = Blockly.Xml.domToText(Blockly.Xml.blockToDom(block));
  var result_xml = Blockly.Xml.domToText(event.oldXml);
  assertEquals(expected_xml, result_xml);
  isEqualArrays(ids, event.ids);
  assertEquals(type, event.type);
}

// Test util
function checkExactEventValues(event, values) {
  var keys = Object.keys(values);
  for (var i = 0, field; field = keys[i]; i++) {
    assertEquals(values[field], event[field]);
  }
}

// Test util
function createSimpleTestBlock(workspace) {
  // Disable events while constructing the block: this is a test of the
  // Blockly.Event constructors, not the block constructor.
  Blockly.Events.disable();
  var block = new Blockly.Block(workspace, 'simple_test_block');
  Blockly.Events.enable();
  return block;
}

function test_create_constructor() {
  eventTest_setUpWithMockBlocks();
  mockControl_ = setUpMockMethod(Blockly.utils, 'genUid', null, ['1']);
  try {
    var block = createSimpleTestBlock(workspace);

    var event = new Blockly.Events.Create(block);
    checkCreateEventValues(event, block, ['1'], 'create');
  } finally {
    eventTest_tearDownWithMockBlocks();
  }
}

function test_blockCreate_constructor() {
  // expect that blockCreate behaves the same as create.
  eventTest_setUpWithMockBlocks();
  mockControl_ = setUpMockMethod(Blockly.utils, 'genUid', null, ['1']);
  try {
    var block = createSimpleTestBlock(workspace);

    var event = new Blockly.Events.BlockCreate(block);
    checkCreateEventValues(event, block, ['1'], 'create');
  } finally {
    eventTest_tearDownWithMockBlocks();
  }
}

function test_delete_constructor() {
  eventTest_setUpWithMockBlocks();
  mockControl_ = setUpMockMethod(Blockly.utils, 'genUid', null, ['1']);
  try {
    var block = createSimpleTestBlock(workspace);
    var event = new Blockly.Events.Delete(block);
    checkDeleteEventValues(event, block, ['1'], 'delete');
  } finally {
    eventTest_tearDownWithMockBlocks();
  }
}

function test_blockDelete_constructor() {
  eventTest_setUpWithMockBlocks();
  mockControl_ = setUpMockMethod(Blockly.utils, 'genUid', null, ['1']);
  try {
    var block = createSimpleTestBlock(workspace);
    block.setCommentText('test comment');
    var event = new Blockly.Events.BlockDelete(block);
    checkDeleteEventValues(event, block, ['1'], 'delete');
  } finally {
    eventTest_tearDownWithMockBlocks();
  }
}

function test_change_constructor() {
  eventTest_setUpWithMockBlocks();
  mockControl_ = setUpMockMethod(Blockly.utils, 'genUid', null, ['1']);
  try {
    Blockly.Events.disable();
    var block = new Blockly.Block(workspace, 'field_variable_test_block');
    Blockly.Events.enable();

    var event = new Blockly.Events.Change(block, 'field', 'VAR', 'id1', 'id2');
    checkExactEventValues(event, {'element': 'field', 'name': 'VAR',
      'oldValue': 'id1', 'newValue': 'id2', 'type': 'change'});
  } finally {
    eventTest_tearDownWithMockBlocks();
  }
}

function test_blockChange_constructor() {
  eventTest_setUpWithMockBlocks();
  mockControl_ = setUpMockMethod(Blockly.utils, 'genUid', null, ['1']);
  try {
    Blockly.Events.disable();
    var block = new Blockly.Block(workspace, 'field_variable_test_block');
    Blockly.Events.enable();

    var event = new Blockly.Events.BlockChange(block, 'field', 'VAR', 'id1',
        'id2');
    checkExactEventValues(event, {'element': 'field', 'name': 'VAR',
      'oldValue': 'id1', 'newValue': 'id2', 'type': 'change'});
  } finally {
    eventTest_tearDownWithMockBlocks();
  }
}

function test_move_constructorCoordinate() {
  // Expect the oldCoordinate to be set.
  eventTest_setUpWithMockBlocks();
  mockControl_ = setUpMockMethod(Blockly.utils, 'genUid', null, ['1', '2']);
  try {
    var block1 = createSimpleTestBlock(workspace);
    var coordinate = new Blockly.utils.Coordinate(3, 4);
    block1.xy_ = coordinate;

    var event = new Blockly.Events.Move(block1);
    checkExactEventValues(event, {'oldCoordinate': coordinate,
      'type': 'move'});
  } finally {
    eventTest_tearDownWithMockBlocks();
  }
}

function test_move_constructoroldParentId() {
  // Expect the oldParentId to be set but not the oldCoordinate to be set.
  eventTest_setUpWithMockBlocks();
  mockControl_ = setUpMockMethod(Blockly.utils, 'genUid', null, ['1', '2']);
  try {
    var block1 = createSimpleTestBlock(workspace);
    var block2 = createSimpleTestBlock(workspace);
    block1.parentBlock_ = block2;
    block1.xy_ = new Blockly.utils.Coordinate(3, 4);

    var event = new Blockly.Events.Move(block1);
    checkExactEventValues(event, {'oldCoordinate': undefined,
      'oldParentId': '2', 'type': 'move'});
    block1.parentBlock_ = null;
  } finally {
    eventTest_tearDownWithMockBlocks();
  }
}

function test_blockMove_constructorCoordinate() {
  // Expect the oldCoordinate to be set.
  eventTest_setUpWithMockBlocks();
  mockControl_ = setUpMockMethod(Blockly.utils, 'genUid', null, ['1', '2']);
  try {
    var block1 = createSimpleTestBlock(workspace);
    var coordinate = new Blockly.utils.Coordinate(3, 4);
    block1.xy_ = coordinate;

    var event = new Blockly.Events.BlockMove(block1);
    checkExactEventValues(event, {'oldCoordinate': coordinate,
      'type': 'move'});
  } finally {
    eventTest_tearDownWithMockBlocks();
  }
}

function test_blockMove_constructoroldParentId() {
  // Expect the oldParentId to be set but not the oldCoordinate to be set.
  eventTest_setUpWithMockBlocks();
  mockControl_ = setUpMockMethod(Blockly.utils, 'genUid', null, ['1', '2']);
  try {
    var block1 = createSimpleTestBlock(workspace);
    var block2 = createSimpleTestBlock(workspace);
    block1.parentBlock_ = block2;
    block1.xy_ = new Blockly.utils.Coordinate(3, 4);

    var event = new Blockly.Events.BlockMove(block1);
    checkExactEventValues(event, {'oldCoordinate': undefined,
      'oldParentId': '2', 'type': 'move'});
    block1.parentBlock_ = null;
  } finally {
    eventTest_tearDownWithMockBlocks();
  }
}

function test_uiEvent_constructor_null() {
  try {
    Blockly.Events.setGroup('testGroup');
    var event = new Blockly.Events.Ui(null, 'foo', 'bar', 'baz');
    checkExactEventValues(event,
        {
          'blockId': null,
          'workspaceId': null,
          'type': 'ui',
          'oldValue': 'bar',
          'newValue': 'baz',
          'element': 'foo',
          'recordUndo': false,
          'group': 'testGroup'
        }
    );
  } finally {
    Blockly.Events.setGroup(false);
  }
}

function test_uiEvent_constructor_block() {
  eventTest_setUpWithMockBlocks();
  mockControl_ = setUpMockMethod(Blockly.utils, 'genUid', null, ['1']);
  try {
    var block1 = createSimpleTestBlock(workspace);
    Blockly.Events.setGroup('testGroup');
    var event = new Blockly.Events.Ui(block1, 'foo', 'bar', 'baz');
    checkExactEventValues(event,
        {
          'blockId': '1',
          'workspaceId': workspace.id,
          'type': 'ui',
          'oldValue': 'bar',
          'newValue': 'baz',
          'element': 'foo',
          'recordUndo': false,
          'group': 'testGroup'
        }
    );
  } finally {
    Blockly.Events.setGroup(false);
    eventTest_tearDownWithMockBlocks();
  }
}

function test_varCreate_constructor() {
  eventTest_setUp();
  try {
    var variable = workspace.createVariable('name1', 'type1', 'id1');
    var event = new Blockly.Events.VarCreate(variable);
    checkExactEventValues(event, {'varName': 'name1', 'varType': 'type1',
      'type': 'var_create'});
  } finally {
    eventTest_tearDown();
  }
}

function test_varCreate_toJson() {
  eventTest_setUp();
  try {
    var variable = workspace.createVariable('name1', 'type1', 'id1');
    var event = new Blockly.Events.VarCreate(variable);
    var json = event.toJson();
    var expectedJson = ({type: "var_create", varId: "id1", varType: "type1",
      varName: "name1"});

    assertEquals(JSON.stringify(expectedJson), JSON.stringify(json));
  } finally {
    eventTest_tearDown();
  }
}

function test_varCreate_fromJson() {
  eventTest_setUp();
  try {
    var variable = workspace.createVariable('name1', 'type1', 'id1');
    var event = new Blockly.Events.VarCreate(variable);
    var event2 = new Blockly.Events.VarCreate(null);
    var json = event.toJson();
    event2.fromJson(json);

    assertEquals(JSON.stringify(json), JSON.stringify(event2.toJson()));
  } finally {
    eventTest_tearDown();
  }
}

function test_varCreate_runForward() {
  eventTest_setUp();
  var json = {type: "var_create", varId: "id1", varType: "type1",
    varName: "name1"};
  var event = Blockly.Events.fromJson(json, workspace);
  assertNull(workspace.getVariableById('id1'));
  event.run(true);
  checkVariableValues(workspace, 'name1', 'type1', 'id1');
  eventTest_tearDown();
}

function test_varCreate_runBackwards() {
  eventTest_setUp();
  var variable = workspace.createVariable('name1', 'type1', 'id1');
  var event = new Blockly.Events.VarCreate(variable);
  assertNotNull(workspace.getVariableById('id1'));
  event.run(false);
  assertNull(workspace.getVariableById('id1'));
  eventTest_tearDown();
}

function test_varDelete_constructor() {
  eventTest_setUp();
  var variable = workspace.createVariable('name1', 'type1', 'id1');
  var event = new Blockly.Events.VarDelete(variable);
  checkExactEventValues(event, {'varName': 'name1', 'varType': 'type1',
    'varId':'id1', 'type': 'var_delete'});
  eventTest_tearDown();
}

function test_varDelete_toJson() {
  eventTest_setUp();
  var variable = workspace.createVariable('name1', 'type1', 'id1');
  var event = new Blockly.Events.VarDelete(variable);
  var json = event.toJson();
  var expectedJson = ({type: "var_delete", varId: "id1", varType: "type1",
    varName: "name1"});

  assertEquals(JSON.stringify(expectedJson), JSON.stringify(json));
  eventTest_tearDown();
}

function test_varDelete_fromJson() {
  eventTest_setUp();
  var variable = workspace.createVariable('name1', 'type1', 'id1');
  var event = new Blockly.Events.VarDelete(variable);
  var event2 = new Blockly.Events.VarDelete(null);
  var json = event.toJson();
  event2.fromJson(json);

  assertEquals(JSON.stringify(json), JSON.stringify(event2.toJson()));
  eventTest_tearDown();
}

function test_varDelete_runForwards() {
  eventTest_setUp();
  var variable = workspace.createVariable('name1', 'type1', 'id1');
  var event = new Blockly.Events.VarDelete(variable);
  assertNotNull(workspace.getVariableById('id1'));
  event.run(true);
  assertNull(workspace.getVariableById('id1'));
  eventTest_tearDown();
}

function test_varDelete_runBackwards() {
  eventTest_setUp();
  var json = {type: "var_delete", varId: "id1", varType: "type1",
    varName: "name1"};
  var event = Blockly.Events.fromJson(json, workspace);
  assertNull(workspace.getVariableById('id1'));
  event.run(false);
  checkVariableValues(workspace, 'name1', 'type1', 'id1');
  eventTest_tearDown();
}

function test_varRename_constructor() {
  eventTest_setUp();
  var variable = workspace.createVariable('name1', 'type1', 'id1');
  var event = new Blockly.Events.VarRename(variable, 'name2');
  checkExactEventValues(event, {'varId': 'id1', 'oldName': 'name1',
    'newName': 'name2', 'type': 'var_rename'});
  eventTest_tearDown();
}

function test_varRename_toJson() {
  eventTest_setUp();
  var variable = workspace.createVariable('name1', 'type1', 'id1');
  var event = new Blockly.Events.VarRename(variable, 'name2');
  var json = event.toJson();
  var expectedJson = ({type: "var_rename", varId: "id1", oldName: "name1",
    newName: "name2"});

  assertEquals(JSON.stringify(expectedJson), JSON.stringify(json));
  eventTest_tearDown();
}

function test_varRename_fromJson() {
  eventTest_setUp();
  var variable = workspace.createVariable('name1', 'type1', 'id1');
  var event = new Blockly.Events.VarRename(variable, '');
  var event2 = new Blockly.Events.VarRename(null);
  var json = event.toJson();
  event2.fromJson(json);

  assertEquals(JSON.stringify(json), JSON.stringify(event2.toJson()));
  eventTest_tearDown();
}

function test_varRename_runForward() {
  eventTest_setUp();
  var variable = workspace.createVariable('name1', 'type1', 'id1');
  var event = new Blockly.Events.VarRename(variable, 'name2');
  event.run(true);
  assertNull(workspace.getVariable('name1'));
  checkVariableValues(workspace, 'name2', 'type1', 'id1');
  eventTest_tearDown();
}

function test_varBackard_runForward() {
  eventTest_setUp();
  var variable = workspace.createVariable('name1', 'type1', 'id1');
  var event = new Blockly.Events.VarRename(variable, 'name2');
  event.run(false);
  assertNull(workspace.getVariable('name2'));
  checkVariableValues(workspace, 'name1', 'type1', 'id1');
  eventTest_tearDown();
}

function test_events_filter() {
  eventTest_setUpWithMockBlocks();
  try {
    var block1 = workspace.newBlock('field_variable_test_block', '1');
    var events = [
      new Blockly.Events.BlockCreate(block1),
      new Blockly.Events.BlockMove(block1),
      new Blockly.Events.BlockChange(block1, 'field', 'VAR', 'id1', 'id2'),
      new Blockly.Events.Ui(block1, 'click')
    ];
    var filteredEvents = Blockly.Events.filter(events, true);
    assertEquals(4, filteredEvents.length);  // no event should have been removed.
    // test that the order hasn't changed
    assertTrue(filteredEvents[0] instanceof Blockly.Events.BlockCreate);
    assertTrue(filteredEvents[1] instanceof Blockly.Events.BlockMove);
    assertTrue(filteredEvents[2] instanceof Blockly.Events.BlockChange);
    assertTrue(filteredEvents[3] instanceof Blockly.Events.Ui);
  } finally {
    eventTest_tearDownWithMockBlocks();
  }
}

function test_events_filterForward() {
  eventTest_setUpWithMockBlocks();
  try {
    var block1 = workspace.newBlock('field_variable_test_block', '1');
    var events = [
      new Blockly.Events.BlockCreate(block1),
    ];
    helper_addMoveEvent(events, block1, 1, 1);
    helper_addMoveEvent(events, block1, 2, 2);
    helper_addMoveEvent(events, block1, 3, 3);
    var filteredEvents = Blockly.Events.filter(events, true);
    assertEquals(2, filteredEvents.length);  // duplicate moves should have been removed.
    // test that the order hasn't changed
    assertTrue(filteredEvents[0] instanceof Blockly.Events.BlockCreate);
    assertTrue(filteredEvents[1] instanceof Blockly.Events.BlockMove);
    assertEquals(3, filteredEvents[1].newCoordinate.x);
    assertEquals(3, filteredEvents[1].newCoordinate.y);
  } finally {
    eventTest_tearDownWithMockBlocks();
  }
}

function test_events_filterBackward() {
  eventTest_setUpWithMockBlocks();
  try {
    var block1 = workspace.newBlock('field_variable_test_block', '1');
    var events = [
      new Blockly.Events.BlockCreate(block1),
    ];
    helper_addMoveEvent(events, block1, 1, 1);
    helper_addMoveEvent(events, block1, 2, 2);
    helper_addMoveEvent(events, block1, 3, 3);
    var filteredEvents = Blockly.Events.filter(events, false);
    assertEquals(2, filteredEvents.length);  // duplicate event should have been removed.
    // test that the order hasn't changed
    assertTrue(filteredEvents[0] instanceof Blockly.Events.BlockCreate);
    assertTrue(filteredEvents[1] instanceof Blockly.Events.BlockMove);
    assertEquals(1, filteredEvents[1].newCoordinate.x);
    assertEquals(1, filteredEvents[1].newCoordinate.y);
  } finally {
    eventTest_tearDownWithMockBlocks();
  }
}

function test_events_filterDifferentBlocks() {
  eventTest_setUpWithMockBlocks();
  var block1 = workspace.newBlock('field_variable_test_block', '1');
  var block2 = workspace.newBlock('field_variable_test_block', '2');
  var events = [
    new Blockly.Events.BlockCreate(block1),
    new Blockly.Events.BlockMove(block1),
    new Blockly.Events.BlockCreate(block2),
    new Blockly.Events.BlockMove(block2)
  ];
  var filteredEvents = Blockly.Events.filter(events, true);
  assertEquals(4, filteredEvents.length);  // no event should have been removed.
  eventTest_tearDownWithMockBlocks();
}

function test_events_mergeMove() {
  eventTest_setUpWithMockBlocks();
  var block1 = workspace.newBlock('field_variable_test_block', '1');
  var events = [];
  helper_addMoveEvent(events, block1, 0, 0);
  helper_addMoveEvent(events, block1, 1, 1);
  var filteredEvents = Blockly.Events.filter(events, true);
  assertEquals(1, filteredEvents.length);  // second move event merged into first
  assertEquals(1, filteredEvents[0].newCoordinate.x);
  assertEquals(1, filteredEvents[0].newCoordinate.y);
  eventTest_tearDownWithMockBlocks();
}

function test_events_mergeChange() {
  eventTest_setUpWithMockBlocks();
  var block1 = workspace.newBlock('field_variable_test_block', '1');
  var events = [
    new Blockly.Events.Change(block1, 'field', 'VAR', 'item', 'item1'),
    new Blockly.Events.Change(block1, 'field', 'VAR', 'item1', 'item2')
  ];
  var filteredEvents = Blockly.Events.filter(events, true);
  assertEquals(1, filteredEvents.length);  // second change event merged into first
  assertEquals('item', filteredEvents[0].oldValue);
  assertEquals('item2', filteredEvents[0].newValue);
  eventTest_tearDownWithMockBlocks();
}

function test_events_mergeUi() {
  eventTest_setUpWithMockBlocks();
  var block1 = workspace.newBlock('field_variable_test_block', '1');
  var block2 = workspace.newBlock('field_variable_test_block', '2');
  var block3 = workspace.newBlock('field_variable_test_block', '3');
  var events = [
    new Blockly.Events.Ui(block1, 'commentOpen', 'false', 'true'),
    new Blockly.Events.Ui(block1, 'click', 'false', 'true'),
    new Blockly.Events.Ui(block2, 'mutatorOpen', 'false', 'true'),
    new Blockly.Events.Ui(block2, 'click', 'false', 'true'),
    new Blockly.Events.Ui(block3, 'warningOpen', 'false', 'true'),
    new Blockly.Events.Ui(block3, 'click', 'false', 'true')
  ];
  var filteredEvents = Blockly.Events.filter(events, true);
  assertEquals(3, filteredEvents.length);  // click event merged into corresponding *Open event
  assertEquals('commentOpen', filteredEvents[0].element);
  assertEquals('mutatorOpen', filteredEvents[1].element);
  assertEquals('warningOpen', filteredEvents[2].element);
  eventTest_tearDownWithMockBlocks();
}

/**
 * Tests that events that collide on a (event, block, workspace) tuple
 * but cannot be merged do not get dropped during filtering.
 */
function test_events_stackclick() {
  eventTest_setUpWithMockBlocks();
  var block = workspace.newBlock('field_variable_test_block', '1');
  var events = [
    new Blockly.Events.Ui(block, 'click', undefined, undefined),
    new Blockly.Events.Ui(block, 'stackclick', undefined, undefined)
  ];
  var filteredEvents = Blockly.Events.filter(events, true);
  // click and stackclick should both exist
  assertEquals(2, filteredEvents.length);
  assertEquals('click', filteredEvents[0].element);
  assertEquals('stackclick', filteredEvents[1].element);
  eventTest_tearDownWithMockBlocks();
}

/**
 * Mutator composition could result in move events for blocks
 * connected to the mutated block that were null operations. This
 * leads to events in the undo/redo queue that do nothing, requiring
 * an extra undo/redo to proceed to the next event. This test ensures
 * that two move events that do get merged (disconnecting and
 * reconnecting a block in response to a mutator change) are filtered
 * from the queue.
 */
function test_events_filteraftermerge() {
  eventTest_setUpWithMockBlocks();
  var block = workspace.newBlock('field_variable_test_block', '1');
  block.setParent(null);
  var events = [];
  helper_addMoveEventParent(events, block, null);
  helper_addMoveEventParent(events, block, null);
  var filteredEvents = Blockly.Events.filter(events, true);
  // The two events should be merged, but because nothing has changed
  // they will be filtered out.
  assertEquals(0, filteredEvents.length);
  eventTest_tearDownWithMockBlocks();
}

/**
 * Helper function to simulate block move events.
 *
 * @param {!Array.<Blockly.Events.Abstract>} events a queue of events.
 * @param {!Blockly.Block} block the block to be moved
 * @param {number} newX new X coordinate of the block
 * @param {number} newY new Y coordinate of the block
 */
function helper_addMoveEvent(events, block, newX, newY) {
  events.push(new Blockly.Events.BlockMove(block));
  block.xy_ = new Blockly.utils.Coordinate(newX, newY);
  events[events.length-1].recordNew();
}

function helper_addMoveEventParent(events, block, parent) {
  events.push(new Blockly.Events.BlockMove(block));
  block.setParent(parent);
  events[events.length-1].recordNew();
}

function test_events_newblock_newvar() {
  eventTest_setUpWithMockBlocks();

  Blockly.Events.fire = temporary_fireEvent;
  temporary_fireEvent.firedEvents_ = [];
  // Expect three calls to genUid: one to set the block's ID, one for the event
  // group's id, and one for the variable's ID.
  mockControl_ = setUpMockMethod(Blockly.utils, 'genUid', null, ['1', '2', '3']);
  try {
    var block = workspace.newBlock('field_variable_test_block');

    var firedEvents = workspace.undoStack_;
    // Expect two events: varCreate and block create.
    assertEquals(2, firedEvents.length);

    var event0 = firedEvents[0];
    var event1 = firedEvents[1];
    assertEquals('var_create', event0.type);
    assertEquals('create', event1.type);

    // Expect the events to have the same group ID.
    assertEquals(event0.group, event1.group);

    // Expect the group ID to be the result of the second call to genUid.
    assertEquals('2', event0.group);

    // Expect the workspace to have a variable with ID '3'.
    assertNotNull(workspace.getVariableById('3'));
    assertEquals('3', event0.varId);
  } finally {
    eventTest_tearDownWithMockBlocks();
    Blockly.Events.fire = savedFireFunc;
  }
}

// The sequence of events should be the same whether the block was created from
// XML or directly.
function test_events_newblock_newvar_xml() {
  eventTest_setUpWithMockBlocks();

  Blockly.Events.fire = temporary_fireEvent;
  temporary_fireEvent.firedEvents_ = [];
  try {
        var dom = Blockly.Xml.textToDom(
        '<xml xmlns="https://developers.google.com/blockly/xml">' +
        '  <block type="field_variable_test_block" id="block1">' +
        '    <field name="VAR" id="id1">name1</field>' +
        '  </block>' +
        '</xml>');
    Blockly.Xml.domToWorkspace(dom, workspace);

    var firedEvents = workspace.undoStack_;
    // Expect two events: varCreate and block create.
    assertEquals(2, firedEvents.length);

    var event0 = firedEvents[0];
    var event1 = firedEvents[1];
    assertEquals('var_create', event0.type);
    assertEquals('create', event1.type);

    // Expect the events to have the same group ID.
    assertEquals(event0.group, event1.group);

    // Expect the workspace to have a variable with ID 'id1'.
    assertNotNull(workspace.getVariableById('id1'));
    assertEquals('id1', event0.varId);
  } finally {
    eventTest_tearDownWithMockBlocks();
    Blockly.Events.fire = savedFireFunc;
  }
}

function test_events_filter_nomerge_move() {
  // Move events should only merge if they refer to the same block and are
  // consecutive.
  // See github.com/google/blockly/pull/1892 for a worked example showing
  // how merging non-consecutive events can fail when replacing a shadow
  // block.
  eventTest_setUpWithMockBlocks();
  try {
    var block1 = createSimpleTestBlock(workspace);
    var block2 = createSimpleTestBlock(workspace);

    var events = [];
    helper_addMoveEvent(events, block1, 1, 1);
    helper_addMoveEvent(events, block2, 1, 1);
    events.push(new Blockly.Events.BlockDelete(block2));
    helper_addMoveEvent(events, block1, 2, 2);

    var filteredEvents = Blockly.Events.filter(events, true);
    // Nothing should have merged.
    assertEquals(4, filteredEvents.length);
    // test that the order hasn't changed
    assertTrue(filteredEvents[0] instanceof Blockly.Events.BlockMove);
    assertTrue(filteredEvents[1] instanceof Blockly.Events.BlockMove);
    assertTrue(filteredEvents[2] instanceof Blockly.Events.BlockDelete);
    assertTrue(filteredEvents[3] instanceof Blockly.Events.BlockMove);
  } finally {
    eventTest_tearDownWithMockBlocks();
  }
}
