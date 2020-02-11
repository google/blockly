/**
 * @license
 * Copyright 2018 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
'use strict';


function eventSvg_setUpMockBlocks() {
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
    'message0': 'simple test block',
    'output': null
  },
  {
    'type': 'test_val_in',
    'message0': 'test in %1',
    'args0': [
      {
        'type': 'input_value',
        'name': 'NAME'
      }
    ]
  }]);
}

function eventSvg_tearDownMockBlocks() {
  delete Blockly.Blocks['field_variable_test_block'];
  delete Blockly.Blocks['simple_test_block'];
  delete Blockly.Blocks['test_val_in'];
}

function eventSvg_createWorkspaceWithToolbox() {
  var toolbox = document.getElementById('toolbox-categories');
  return Blockly.inject('blocklyDiv', {toolbox: toolbox});
}

function eventSvg_createNewBlock(workspace, type) {
  var block = workspace.newBlock(type);
  block.initSvg();
  return block;
}

function test_blockDelete_svgDispose() {
  eventSvg_setUpMockBlocks();
  var workspace = eventSvg_createWorkspaceWithToolbox();
  Blockly.Events.fire = temporary_fireEvent;
  temporary_fireEvent.firedEvents_ = [];
  try {
    var block = eventSvg_createNewBlock(workspace);
    block.setCommentText('test comment');
    var event = new Blockly.Events.BlockDelete(block);
    workspace.clearUndo();
    block.dispose();
    var firedEvents = workspace.undoStack_;
    assertEquals('Delete event created by dispose matches constructed delete event',
      Blockly.Xml.domToText(event.oldXml), Blockly.Xml.domToText(firedEvents[0].oldXml));
  } finally {
    eventSvg_tearDownMockBlocks();
    workspace.dispose();
  }
}