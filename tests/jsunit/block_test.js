/**
 * @license
 * Blockly Tests
 *
 * Copyright 2015 Google Inc.
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

function test_getBlockById() {
  var workspace = new Blockly.Workspace();
  var blockA = workspace.newBlock('');
  var blockB = workspace.newBlock('');
  assertEquals('Find blockA.', blockA, Blockly.Block.getById(blockA.id));
  assertEquals('Find blockB.', blockB, Blockly.Block.getById(blockB.id));
  assertEquals('No block found.', null,
      Blockly.Block.getById('I do not exist.'));
  blockA.dispose();
  assertEquals('Can\'t find blockA.', null, Blockly.Block.getById(blockA.id));
  assertEquals('BlockB exists.', blockB, Blockly.Block.getById(blockB.id));
  workspace.clear();
  assertEquals('Can\'t find blockB.', null, Blockly.Block.getById(blockB.id));
}
