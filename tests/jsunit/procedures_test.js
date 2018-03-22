/**
 * @license
 * Blockly Tests
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
 * @fileoverview Tests for procedures.
 * @author marisaleung@google.com (Marisa Leung)
 */
'use strict';

goog.require('goog.testing');

var workspace;

function proceduresTest_setUpWithMockBlocks() {
  workspace = new Blockly.Workspace();
  Blockly.defineBlocksWithJsonArray([{
    getProcedureDef: function() {
    },
    'type': 'procedure_mock_block',
    'message0': '%1',
    'args0': [
      {
        'type': 'field_variable',
        'name': 'NAME',
        'variable': 'item'
      }
    ]
  }]);
  Blockly.Blocks['procedure_mock_block'].getProcedureDef = function() {
    return [this.getField('NAME').getText(), [], false];
  };
}

function proceduresTest_tearDownWithMockBlocks() {
  workspace.dispose();
  delete Blockly.Blocks.procedures_mock_block;
}


function test_isNameUsed_NoBlocks() {
  workspace = new Blockly.Workspace();
  var result = Blockly.Procedures.isNameUsed('name1', workspace);
  assertFalse(result);
  workspace.dispose();
}

function test_isNameUsed_False() {
  proceduresTest_setUpWithMockBlocks();
  workspace.createVariable('name2', '', 'id2');
  var block = new Blockly.Block(workspace, 'procedure_mock_block');
  block.setFieldValue('id2', 'NAME');

  var result = Blockly.Procedures.isNameUsed('name1', workspace);
  assertFalse(result);
  proceduresTest_tearDownWithMockBlocks();
}

function test_isNameUsed_True() {
  proceduresTest_setUpWithMockBlocks();
  workspace.createVariable('name1', '', 'id1');
  var block = new Blockly.Block(workspace, 'procedure_mock_block');
  block.setFieldValue('id1', 'NAME');

  var result = Blockly.Procedures.isNameUsed('name1', workspace);
  assertTrue(result);
  proceduresTest_tearDownWithMockBlocks();
}
