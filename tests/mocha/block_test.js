/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2019 Google Inc.
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

suite('Blocks', function() {
  suite('Unplug', function() {
    function assertUnpluggedNoheal(blocks) {
      // A has nothing connected to it.
      assertEquals(0, blocks.A.getChildren().length);
      // B and C are still connected.
      assertEquals(blocks.B, blocks.C.getParent());
      // B is the top of its stack.
      assertNull(blocks.B.getParent());
    }
    function assertUnpluggedHealed(blocks) {
      // A and C are connected.
      assertEquals(1, blocks.A.getChildren().length);
      assertEquals(blocks.A, blocks.C.getParent());
      // B has nothing connected to it.
      assertEquals(0, blocks.B.getChildren().length);
      // B is the top of its stack.
      assertNull(blocks.B.getParent());
    }

    setup(function() {
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
        "output": null
      }]);

      this.workspace = new Blockly.Workspace();
    });
    teardown(function() {
      delete Blockly.Blocks['stack_block'];
      delete Blockly.Blocks['row_block'];

      this.workspace.dispose();
    });

    suite('Row', function() {
      setup(function() {
        var blockA = this.workspace.newBlock('row_block');
        var blockB = this.workspace.newBlock('row_block');
        var blockC = this.workspace.newBlock('row_block');

        blockA.inputList[0].connection.connect(blockB.outputConnection);
        blockB.inputList[0].connection.connect(blockC.outputConnection);

        assertEquals(blockB, blockC.getParent());

        this.blocks = {
          A: blockA,
          B: blockB,
          C: blockC
        };
      });

      test('Don\'t heal', function() {
        this.blocks.B.unplug(false);
        assertUnpluggedNoheal(this.blocks);
      });
      test('Heal', function() {
        this.blocks.B.unplug(true);
        // Each block has only one input, and the types work.
        assertUnpluggedHealed(this.blocks);
      });
      test('Heal with bad checks', function() {
        var blocks = this.blocks;

        // A and C can't connect, but both can connect to B.
        blocks.A.inputList[0].connection.setCheck('type1');
        blocks.C.outputConnection.setCheck('type2');

        // Each block has only one input, but the types don't work.
        blocks.B.unplug(true);
        assertUnpluggedNoheal(blocks);
      });
      test('A has multiple inputs', function() {
        var blocks = this.blocks;
        // Add extra input to parent
        blocks.A.appendValueInput("INPUT").setCheck(null);
        blocks.B.unplug(true);
        assertUnpluggedHealed(blocks);
      });
      test('B has multiple inputs', function() {
        var blocks = this.blocks;
        // Add extra input to middle block
        blocks.B.appendValueInput("INPUT").setCheck(null);
        blocks.B.unplug(true);
        assertUnpluggedHealed(blocks);
      });
      test('C has multiple inputs', function() {
        var blocks = this.blocks;
        // Add extra input to child block
        blocks.C.appendValueInput("INPUT").setCheck(null);
        // Child block input count doesn't matter.
        blocks.B.unplug(true);
        assertUnpluggedHealed(blocks);
      });
      test('C is Shadow', function() {
        var blocks = this.blocks;
        blocks.C.setShadow(true);
        blocks.B.unplug(true);
        // Even though we're asking to heal, it will appear as if it has not
        // healed because shadows always stay with the parent.
        assertUnpluggedNoheal(blocks);
      });
    });
    suite('Stack', function() {
      setup(function() {
        var blockA = this.workspace.newBlock('stack_block');
        var blockB = this.workspace.newBlock('stack_block');
        var blockC = this.workspace.newBlock('stack_block');

        blockA.nextConnection.connect(blockB.previousConnection);
        blockB.nextConnection.connect(blockC.previousConnection);

        assertEquals(blockB, blockC.getParent());

        this.blocks = {
          A: blockA,
          B: blockB,
          C: blockC
        };
      });

      test('Don\'t heal', function() {
        this.blocks.B.unplug();
        assertUnpluggedNoheal(this.blocks);
      });
      test('Heal', function() {
        this.blocks.B.unplug(true);
        assertUnpluggedHealed(this.blocks);
      });
      test('Heal with bad checks', function() {
        var blocks = this.blocks;
        // A and C can't connect, but both can connect to B.
        blocks.A.nextConnection.setCheck('type1');
        blocks.C.previousConnection.setCheck('type2');

        // The types don't work.
        blocks.B.unplug(true);

        // Stack blocks unplug before checking whether the types match.
        // TODO (#1994): Check types before unplugging.
        // A has nothing connected to it.
        assertEquals(0, blocks.A.getChildren().length);
        // B has nothing connected to it.
        assertEquals(0, blocks.B.getChildren().length);
        // C has nothing connected to it.
        assertEquals(0, blocks.C.getChildren().length);
        // A is the top of its stack.
        assertNull(blocks.A.getParent());
        // B is the top of its stack.
        assertNull(blocks.B.getParent());
        // C is the top of its stack.
        assertNull(blocks.C.getParent());
      });
      test('C is Shadow', function() {
        var blocks = this.blocks;
        blocks.C.setShadow(true);
        blocks.B.unplug(true);
        // Even though we're asking to heal, it will appear as if it has not
        // healed because shadows always stay with the parent.
        assertUnpluggedNoheal(blocks);
      });
    });
  });
});
