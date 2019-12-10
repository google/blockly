/**
 * @license
 * Copyright 2017 Google LLC
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

function helper_setUpMockBlocks() {
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

function helper_tearDownMockBlocks() {
  delete Blockly.Blocks['field_variable_test_block'];
  delete Blockly.Blocks['simple_test_block'];
  delete Blockly.Blocks['test_val_in'];
}

function helper_createWorkspaceWithToolbox() {
  var toolbox = document.getElementById('toolbox-categories');
  return Blockly.inject('blocklyDiv', {toolbox: toolbox});
}

function helper_createNewBlock(workspace, type) {
  var block = workspace.newBlock(type);
  block.initSvg();
  return block;
}

function test_createWorkspace() {
  var workspace = helper_createWorkspaceWithToolbox();
  workspace.dispose();
}

function test_emptyWorkspace() {
  var workspace = helper_createWorkspaceWithToolbox();
  try {
    assertEquals('Empty workspace (1).', 0, workspace.getTopBlocks(true).length);
    assertEquals('Empty workspace (2).', 0, workspace.getTopBlocks(false).length);
    assertEquals('Empty workspace (3).', 0, workspace.getAllBlocks().length);
    workspace.clear();
    assertEquals('Empty workspace (4).', 0, workspace.getTopBlocks(true).length);
    assertEquals('Empty workspace (5).', 0, workspace.getTopBlocks(false).length);
    assertEquals('Empty workspace (6).', 0, workspace.getAllBlocks().length);
  } finally {
    workspace.dispose();
  }
}

function test_flatWorkspace() {
  var workspace = helper_createWorkspaceWithToolbox();
  var blockA, blockB;
  try {
    blockA = helper_createNewBlock(workspace, '');
    assertEquals('One block workspace (1).', 1, workspace.getTopBlocks(true).length);
    assertEquals('One block workspace (2).', 1, workspace.getTopBlocks(false).length);
    assertEquals('One block workspace (3).', 1, workspace.getAllBlocks().length);
    blockB = helper_createNewBlock(workspace, '');
    assertEquals('Two block workspace (1).', 2, workspace.getTopBlocks(true).length);
    assertEquals('Two block workspace (2).', 2, workspace.getTopBlocks(false).length);
    assertEquals('Two block workspace (3).', 2, workspace.getAllBlocks().length);
    try {
      blockA.dispose();
    } catch (e) {
      fail('Failed to delete blockA ' + e);
    }

    assertEquals('One block workspace (4).', 1, workspace.getTopBlocks(true).length);
    assertEquals('One block workspace (5).', 1, workspace.getTopBlocks(false).length);
    assertEquals('One block workspace (6).', 1, workspace.getAllBlocks().length);
    workspace.clear();
    assertEquals('Cleared workspace (1).', 0, workspace.getTopBlocks(true).length);
    assertEquals('Cleared workspace (2).', 0, workspace.getTopBlocks(false).length);
    assertEquals('Cleared workspace (3).', 0, workspace.getAllBlocks().length);
  } finally {
    blockB && blockB.dispose();
    blockA && blockA.dispose();
    workspace.dispose();
  }
}

/** Tests the alignment of appendDomToWorkspace with WorkspaceSvg. */
function test_appendDomToWorkspace() {
  var workspace = helper_createWorkspaceWithToolbox();
  try {
    var dom = Blockly.Xml.textToDom(
      '<xml xmlns="https://developers.google.com/blockly/xml">' +
      '  <block type="math_random_float" inline="true" x="21" y="23">' +
      '  </block>' +
      '</xml>');
    Blockly.Xml.appendDomToWorkspace(dom, workspace);
    assertEquals('Block count', 1, workspace.getAllBlocks().length);
    Blockly.Xml.appendDomToWorkspace(dom, workspace);
    assertEquals('Block count', 2, workspace.getAllBlocks().length);
    var blocks =  workspace.getAllBlocks();
    assertEquals('Block 1 position x',21,blocks[0].getRelativeToSurfaceXY().x);
    assertEquals('Block 1 position y',23,blocks[0].getRelativeToSurfaceXY().y);
    assertEquals('Block 2 position x',21,blocks[1].getRelativeToSurfaceXY().x);
    assertEquals('Block 2 position y',23 + blocks[0].getHeightWidth().height + Blockly.BlockSvg.SEP_SPACE_Y,blocks[1].getRelativeToSurfaceXY().y);
  } finally {
    workspace.dispose();
  }
}

function test_svgDisposeWithShadow() {
  helper_setUpMockBlocks();
  var workspace = helper_createWorkspaceWithToolbox();
  var blockNew;
  try {
    var dom = Blockly.Xml.textToDom(
      '<xml xmlns="https://developers.google.com/blockly/xml">' +
        '<block type="test_val_in">' +
          '<value name="NAME">' +
            '<shadow type="simple_test_block"></shadow>' +
          '</value>' +
        '</block>' +
      '</xml>');

    Blockly.Xml.appendDomToWorkspace(dom, workspace);
    assertEquals('Block count', 2, workspace.getAllBlocks().length);
    var inputConnection = workspace.getTopBlocks()[0].getInput('NAME').connection;

    blockNew = helper_createNewBlock(workspace, 'simple_test_block');
    inputConnection.connect(blockNew.outputConnection);

  } finally {
    workspace.dispose();
    blockNew && blockNew.dispose();
    helper_tearDownMockBlocks();
  }
}
