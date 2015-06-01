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

function test_emptyWorkspace() {
  var workspace = new Blockly.Workspace();
  assertEquals('Empty workspace (1).', 0, workspace.getTopBlocks(true).length);
  assertEquals('Empty workspace (2).', 0, workspace.getTopBlocks(false).length);
  assertEquals('Empty workspace (3).', 0, workspace.getAllBlocks().length);
  workspace.clear();
  assertEquals('Empty workspace (4).', 0, workspace.getTopBlocks(true).length);
  assertEquals('Empty workspace (5).', 0, workspace.getTopBlocks(false).length);
  assertEquals('Empty workspace (6).', 0, workspace.getAllBlocks().length);
}

function test_flatWorkspace() {
  var workspace = new Blockly.Workspace();
  var blockA = Blockly.Block.obtain(workspace, '');
  assertEquals('One block workspace (1).', 1, workspace.getTopBlocks(true).length);
  assertEquals('One block workspace (2).', 1, workspace.getTopBlocks(false).length);
  assertEquals('One block workspace (3).', 1, workspace.getAllBlocks().length);
  var blockB = Blockly.Block.obtain(workspace, '');
  assertEquals('Two block workspace (1).', 2, workspace.getTopBlocks(true).length);
  assertEquals('Two block workspace (2).', 2, workspace.getTopBlocks(false).length);
  assertEquals('Two block workspace (3).', 2, workspace.getAllBlocks().length);
  blockA.dispose();
  assertEquals('One block workspace (4).', 1, workspace.getTopBlocks(true).length);
  assertEquals('One block workspace (5).', 1, workspace.getTopBlocks(false).length);
  assertEquals('One block workspace (6).', 1, workspace.getAllBlocks().length);
  workspace.clear();
  assertEquals('Cleared workspace (1).', 0, workspace.getTopBlocks(true).length);
  assertEquals('Cleared workspace (2).', 0, workspace.getTopBlocks(false).length);
  assertEquals('Cleared workspace (3).', 0, workspace.getAllBlocks().length);
}

function test_maxBlocksWorkspace() {
  var workspace = new Blockly.Workspace();
  var blockA = Blockly.Block.obtain(workspace, '');
  var blockB = Blockly.Block.obtain(workspace, '');
  assertEquals('Infinite capacity.', Infinity, workspace.remainingCapacity());
  workspace.maxBlocks = 3;
  assertEquals('Three capacity.', 1, workspace.remainingCapacity());
  workspace.maxBlocks = 2;
  assertEquals('Two capacity.', 0, workspace.remainingCapacity());
  workspace.maxBlocks = 1;
  assertEquals('One capacity.', -1, workspace.remainingCapacity());
  workspace.maxBlocks = 0;
  assertEquals('Zero capacity.', -2, workspace.remainingCapacity());
  workspace.clear();
  assertEquals('Cleared capacity.', 0, workspace.remainingCapacity());
}

function test_getByIdWorkspace() {
  var workspace = new Blockly.Workspace();
  var blockA = Blockly.Block.obtain(workspace, '');
  var blockB = Blockly.Block.obtain(workspace, '');
  assertEquals('Find blockA.', blockA, workspace.getBlockById(blockA.id));
  assertEquals('Find blockB.', blockB, workspace.getBlockById(blockB.id));
  assertEquals('No block found.', null, workspace.getBlockById('I do not exist.'));
  blockA.dispose();
  assertEquals('Can\'t find blockA.', null, workspace.getBlockById(blockA.id));
  assertEquals('BlockB exists.', blockB, workspace.getBlockById(blockB.id));
  workspace.clear();
  assertEquals('Can\'t find blockB.', null, workspace.getBlockById(blockB.id));
}
