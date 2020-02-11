/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

suite('Blocks', function() {
  setup(function() {
    this.workspace = new Blockly.Workspace();
    Blockly.defineBlocksWithJsonArray([
      {
        "type": "empty_block",
        "message0": ""
      },
      {
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
      },
      {
        "type": "statement_block",
        "message0": "%1",
        "args0": [
          {
            "type": "input_statement",
            "name": "STATEMENT"
          }
        ],
        "previousStatement": null,
        "nextStatement": null
      }]);
  });
  teardown(function() {
    this.workspace.dispose();
    delete Blockly.Blocks['stack_block'];
    delete Blockly.Blocks['row_block'];
    delete Blockly.Blocks['statement_block'];
  });

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
    function assertUnpluggedHealFailed(blocks) {
      // A has nothing connected to it.
      assertEquals(0, blocks.A.getChildren().length);
      // B has nothing connected to it.
      assertEquals(0, blocks.B.getChildren().length);
      // B is the top of its stack.
      assertNull(blocks.B.getParent());
      // C is the top of its stack.
      assertNull(blocks.C.getParent());
    }

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
        assertUnpluggedHealFailed(blocks);
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

        assertUnpluggedHealFailed(blocks);
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
  suite('Dispose', function() {
    function assertDisposedNoheal(blocks) {
      chai.assert.isFalse(blocks.A.disposed);
      // A has nothing connected to it.
      chai.assert.equal(0, blocks.A.getChildren().length);
      // B is disposed.
      chai.assert.isTrue(blocks.B.disposed);
      // And C is disposed.
      chai.assert.isTrue(blocks.C.disposed);
    }
    function assertDisposedHealed(blocks) {
      chai.assert.isFalse(blocks.A.disposed);
      chai.assert.isFalse(blocks.C.disposed);
      // A and C are connected.
      assertEquals(1, blocks.A.getChildren().length);
      assertEquals(blocks.A, blocks.C.getParent());
      // B is disposed.
      chai.assert.isTrue(blocks.B.disposed);
    }
    function assertDisposedHealFailed(blocks) {
      chai.assert.isFalse(blocks.A.disposed);
      chai.assert.isFalse(blocks.C.disposed);
      // A has nothing connected to it.
      chai.assert.equal(0, blocks.A.getChildren().length);
      // B is disposed.
      chai.assert.isTrue(blocks.B.disposed);
      // C is the top of its stack.
      assertNull(blocks.C.getParent());
    }

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
        this.blocks.B.dispose(false);
        assertDisposedNoheal(this.blocks);
      });
      test('Heal', function() {
        this.blocks.B.dispose(true);
        // Each block has only one input, and the types work.
        assertDisposedHealed(this.blocks);
      });
      test('Heal with bad checks', function() {
        var blocks = this.blocks;

        // A and C can't connect, but both can connect to B.
        blocks.A.inputList[0].connection.setCheck('type1');
        blocks.C.outputConnection.setCheck('type2');

        // Each block has only one input, but the types don't work.
        blocks.B.dispose(true);
        assertDisposedHealFailed(blocks);
      });
      test('A has multiple inputs', function() {
        var blocks = this.blocks;
        // Add extra input to parent
        blocks.A.appendValueInput("INPUT").setCheck(null);
        blocks.B.dispose(true);
        assertDisposedHealed(blocks);
      });
      test('B has multiple inputs', function() {
        var blocks = this.blocks;
        // Add extra input to middle block
        blocks.B.appendValueInput("INPUT").setCheck(null);
        blocks.B.dispose(true);
        assertDisposedHealed(blocks);
      });
      test('C has multiple inputs', function() {
        var blocks = this.blocks;
        // Add extra input to child block
        blocks.C.appendValueInput("INPUT").setCheck(null);
        // Child block input count doesn't matter.
        blocks.B.dispose(true);
        assertDisposedHealed(blocks);
      });
      test('C is Shadow', function() {
        var blocks = this.blocks;
        blocks.C.setShadow(true);
        blocks.B.dispose(true);
        // Even though we're asking to heal, it will appear as if it has not
        // healed because shadows always get destroyed.
        assertDisposedNoheal(blocks);
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
        this.blocks.B.dispose();
        assertDisposedNoheal(this.blocks);
      });
      test('Heal', function() {
        this.blocks.B.dispose(true);
        assertDisposedHealed(this.blocks);
      });
      test('Heal with bad checks', function() {
        var blocks = this.blocks;
        // A and C can't connect, but both can connect to B.
        blocks.A.nextConnection.setCheck('type1');
        blocks.C.previousConnection.setCheck('type2');

        // The types don't work.
        blocks.B.dispose(true);

        assertDisposedHealFailed(blocks);
      });
      test('C is Shadow', function() {
        var blocks = this.blocks;
        blocks.C.setShadow(true);
        blocks.B.dispose(true);
        // Even though we're asking to heal, it will appear as if it has not
        // healed because shadows always get destroyed.
        assertDisposedNoheal(blocks);
      });
    });
  });
  suite('Remove Input', function() {
    setup(function() {
      Blockly.defineBlocksWithJsonArray([
        {
          "type": "value_block",
          "message0": "%1",
          "args0": [
            {
              "type": "input_value",
              "name": "VALUE"
            }
          ]
        },
        {
          "type": "statement_block",
          "message0": "%1",
          "args0": [
            {
              "type": "input_statement",
              "name": "STATEMENT"
            }
          ]
        },
      ]);
    });
    teardown(function() {
      delete Blockly.Blocks['value_block'];
      delete Blockly.Blocks['statement_block'];
    });

    suite('Value', function() {
      setup(function() {
        this.blockA = this.workspace.newBlock('value_block');
      });

      test('No Connected', function() {
        this.blockA.removeInput('VALUE');
        chai.assert.isNull(this.blockA.getInput('VALUE'));
      });
      test('Block Connected', function() {
        var blockB = this.workspace.newBlock('row_block');
        this.blockA.getInput('VALUE').connection
            .connect(blockB.outputConnection);

        this.blockA.removeInput('VALUE');
        chai.assert.isFalse(blockB.disposed);
        chai.assert.equal(this.blockA.getChildren().length, 0);
      });
      test('Shadow Connected', function() {
        var blockB = this.workspace.newBlock('row_block');
        blockB.setShadow(true);
        this.blockA.getInput('VALUE').connection
            .connect(blockB.outputConnection);

        this.blockA.removeInput('VALUE');
        chai.assert.isTrue(blockB.disposed);
        chai.assert.equal(this.blockA.getChildren().length, 0);
      });
    });
    suite('Statement', function() {
      setup(function() {
        this.blockA = this.workspace.newBlock('statement_block');
      });

      test('No Connected', function() {
        this.blockA.removeInput('STATEMENT');
        chai.assert.isNull(this.blockA.getInput('STATEMENT'));
      });
      test('Block Connected', function() {
        var blockB = this.workspace.newBlock('stack_block');
        this.blockA.getInput('STATEMENT').connection
            .connect(blockB.previousConnection);

        this.blockA.removeInput('STATEMENT');
        chai.assert.isFalse(blockB.disposed);
        chai.assert.equal(this.blockA.getChildren().length, 0);
      });
      test('Shadow Connected', function() {
        var blockB = this.workspace.newBlock('stack_block');
        blockB.setShadow(true);
        this.blockA.getInput('STATEMENT').connection
            .connect(blockB.previousConnection);

        this.blockA.removeInput('STATEMENT');
        chai.assert.isTrue(blockB.disposed);
        chai.assert.equal(this.blockA.getChildren().length, 0);
      });
    });
  });
  suite('Connection Tracking', function() {
    setup(function() {
      this.workspace.dispose();
      // The new rendered workspace will get disposed by the parent teardown.
      this.workspace = Blockly.inject('blocklyDiv');

      this.getInputs = function() {
        return this.workspace
            .connectionDBList[Blockly.INPUT_VALUE].connections_;
      };
      this.getOutputs = function() {
        return this.workspace
            .connectionDBList[Blockly.OUTPUT_VALUE].connections_;
      };
      this.getNext = function() {
        return this.workspace
            .connectionDBList[Blockly.NEXT_STATEMENT].connections_;
      };
      this.getPrevious = function() {
        return this.workspace
            .connectionDBList[Blockly.PREVIOUS_STATEMENT].connections_;
      };

      this.assertConnectionsEmpty = function() {
        chai.assert.isEmpty(this.getInputs());
        chai.assert.isEmpty(this.getOutputs());
        chai.assert.isEmpty(this.getNext());
        chai.assert.isEmpty(this.getPrevious());
      };

      this.clock = sinon.useFakeTimers();
    });
    teardown(function() {
      this.clock.restore();
    });
    suite('Deserialization', function() {
      test('Stack', function() {
        Blockly.Xml.appendDomToWorkspace(Blockly.Xml.textToDom(
            '<xml>' +
            '  <block type="stack_block"/>' +
            '</xml>'
        ), this.workspace);
        this.assertConnectionsEmpty();
        this.clock.tick(1);
        chai.assert.equal(this.getPrevious().length, 1);
        chai.assert.equal(this.getNext().length, 1);
      });
      test('Multi-Stack', function() {
        Blockly.Xml.appendDomToWorkspace(Blockly.Xml.textToDom(
            '<xml>' +
            '  <block type="stack_block">' +
            '    <next>' +
            '      <block type="stack_block">' +
            '        <next>' +
            '          <block type="stack_block"/>' +
            '        </next>' +
            '      </block>' +
            '    </next>' +
            '  </block>' +
            '</xml>'
        ), this.workspace);
        this.assertConnectionsEmpty();
        this.clock.tick(1);
        chai.assert.equal(this.getPrevious().length, 3);
        chai.assert.equal(this.getNext().length, 3);
      });
      test('Collapsed Stack', function() {
        Blockly.Xml.appendDomToWorkspace(Blockly.Xml.textToDom(
            '<xml>' +
            '  <block type="stack_block" collapsed="true"/>' +
            '</xml>'
        ), this.workspace);
        this.assertConnectionsEmpty();
        this.clock.tick(1);
        chai.assert.equal(this.getPrevious().length, 1);
        chai.assert.equal(this.getNext().length, 1);
      });
      test('Collapsed Multi-Stack', function() {
        Blockly.Xml.appendDomToWorkspace(Blockly.Xml.textToDom(
            '<xml>' +
            '  <block type="stack_block" collapsed="true">' +
            '    <next>' +
            '      <block type="stack_block" collapsed="true">' +
            '        <next>' +
            '          <block type="stack_block" collapsed="true"/>' +
            '        </next>' +
            '      </block>' +
            '    </next>' +
            '  </block>' +
            '</xml>'
        ), this.workspace);
        this.assertConnectionsEmpty();
        this.clock.tick(1);
        chai.assert.equal(this.getPrevious().length, 3);
        chai.assert.equal(this.getNext().length, 3);
      });
      test('Row', function() {
        Blockly.Xml.appendDomToWorkspace(Blockly.Xml.textToDom(
            '<xml>' +
            '  <block type="row_block"/>' +
            '</xml>'
        ), this.workspace);
        this.assertConnectionsEmpty();
        this.clock.tick(1);
        chai.assert.equal(this.getOutputs().length, 1);
        chai.assert.equal(this.getInputs().length, 1);
      });
      test('Multi-Row', function() {
        Blockly.Xml.appendDomToWorkspace(Blockly.Xml.textToDom(
            '<xml>' +
            '  <block type="row_block">' +
            '    <value name="INPUT">' +
            '      <block type="row_block">' +
            '        <value name="INPUT">' +
            '          <block type="row_block"/>' +
            '        </value>' +
            '      </block>' +
            '    </value>' +
            '  </block>' +
            '</xml>'
        ), this.workspace);
        this.assertConnectionsEmpty();
        this.clock.tick(1);
        chai.assert.equal(this.getOutputs().length, 3);
        chai.assert.equal(this.getInputs().length, 3);
      });
      test('Collapsed Row', function() {
        Blockly.Xml.appendDomToWorkspace(Blockly.Xml.textToDom(
            '<xml>' +
            '  <block type="row_block" collapsed="true"/>' +
            '</xml>'
        ), this.workspace);
        this.assertConnectionsEmpty();
        this.clock.tick(1);
        chai.assert.equal(this.getOutputs().length, 1);
        chai.assert.equal(this.getInputs().length, 0);
      });
      test('Collapsed Multi-Row', function() {
        Blockly.Xml.appendDomToWorkspace(Blockly.Xml.textToDom(
            '<xml>' +
            '  <block type="row_block" collapsed="true">' +
            '    <value name="INPUT">' +
            '      <block type="row_block">' +
            '        <value name="INPUT">' +
            '          <block type="row_block"/>' +
            '        </value>' +
            '      </block>' +
            '    </value>' +
            '  </block>' +
            '</xml>'
        ), this.workspace);
        this.assertConnectionsEmpty();
        this.clock.tick(1);
        chai.assert.equal(this.getOutputs().length, 1);
        chai.assert.equal(this.getInputs().length, 0);
      });
      test('Collapsed Multi-Row Middle', function() {
        Blockly.Xml.appendDomToWorkspace(Blockly.Xml.textToDom(
            '<xml>' +
            '  <block type="row_block">' +
            '    <value name="INPUT">' +
            '      <block type="row_block" collapsed="true">' +
            '        <value name="INPUT">' +
            '          <block type="row_block"/>' +
            '        </value>' +
            '      </block>' +
            '    </value>' +
            '  </block>' +
            '</xml>'
        ), this.workspace);
        this.assertConnectionsEmpty();
        this.clock.tick(1);
        chai.assert.equal(this.getOutputs().length, 2);
        chai.assert.equal(this.getInputs().length, 1);
      });
      test('Statement', function() {
        Blockly.Xml.appendDomToWorkspace(Blockly.Xml.textToDom(
            '<xml>' +
            '  <block type="statement_block"/>' +
            '</xml>'
        ), this.workspace);
        this.assertConnectionsEmpty();
        this.clock.tick(1);
        chai.assert.equal(this.getPrevious().length, 1);
        chai.assert.equal(this.getNext().length, 2);
      });
      test('Multi-Statement', function() {
        Blockly.Xml.appendDomToWorkspace(Blockly.Xml.textToDom(
            '<xml>' +
            '  <block type="statement_block">' +
            '    <statement name="STATEMENT">' +
            '      <block type="statement_block">' +
            '        <statement name="STATEMENT">' +
            '          <block type="statement_block"/>' +
            '        </statement>' +
            '      </block>' +
            '    </statement>' +
            '  </block>' +
            '</xml>'
        ), this.workspace);
        this.assertConnectionsEmpty();
        this.clock.tick(1);
        chai.assert.equal(this.getPrevious().length, 3);
        chai.assert.equal(this.getNext().length, 6);
      });
      test('Collapsed Statement', function() {
        Blockly.Xml.appendDomToWorkspace(Blockly.Xml.textToDom(
            '<xml>' +
            '  <block type="statement_block" collapsed="true"/>' +
            '</xml>'
        ), this.workspace);
        this.assertConnectionsEmpty();
        this.clock.tick(1);
        chai.assert.equal(this.getPrevious().length, 1);
        chai.assert.equal(this.getNext().length, 1);
      });
      test('Collapsed Multi-Statement', function() {
        Blockly.Xml.appendDomToWorkspace(Blockly.Xml.textToDom(
            '<xml>' +
            '  <block type="statement_block" collapsed="true">' +
            '    <statement name="STATEMENT">' +
            '      <block type="statement_block">' +
            '        <statement name="STATEMENT">' +
            '          <block type="statement_block"/>' +
            '        </statement>' +
            '      </block>' +
            '    </statement>' +
            '  </block>' +
            '</xml>'
        ), this.workspace);
        this.assertConnectionsEmpty();
        this.clock.tick(1);
        chai.assert.equal(this.getPrevious().length, 1);
        chai.assert.equal(this.getNext().length, 1);
      });
      test('Collapsed Multi-Statement Middle', function() {
        Blockly.Xml.appendDomToWorkspace(Blockly.Xml.textToDom(
            '<xml>' +
            '  <block type="statement_block">' +
            '    <statement name="STATEMENT">' +
            '      <block type="statement_block" collapsed="true">' +
            '        <statement name="STATEMENT">' +
            '          <block type="statement_block"/>' +
            '        </statement>' +
            '      </block>' +
            '    </statement>' +
            '  </block>' +
            '</xml>'
        ), this.workspace);
        this.assertConnectionsEmpty();
        this.clock.tick(1);
        chai.assert.equal(this.getPrevious().length, 2);
        chai.assert.equal(this.getNext().length, 3);
      });
    });
    suite('Programmatic Block Creation', function() {
      test('Stack', function() {
        var block = this.workspace.newBlock('stack_block');
        this.assertConnectionsEmpty();
        block.initSvg();
        block.render();

        chai.assert.equal(this.getPrevious().length, 1);
        chai.assert.equal(this.getNext().length, 1);
      });
      test('Row', function() {
        var block = this.workspace.newBlock('row_block');
        this.assertConnectionsEmpty();
        block.initSvg();
        block.render();

        chai.assert.equal(this.getOutputs().length, 1);
        chai.assert.equal(this.getInputs().length, 1);
      });
      test('Statement', function() {
        var block = this.workspace.newBlock('statement_block');
        this.assertConnectionsEmpty();
        block.initSvg();
        block.render();

        chai.assert.equal(this.getPrevious().length, 1);
        chai.assert.equal(this.getNext().length, 2);
      });
    });
    suite('setCollapsed', function() {
      test('Stack', function() {
        var block = Blockly.Xml.domToBlock(Blockly.Xml.textToDom(
            '<block type="stack_block"/>'
        ), this.workspace);
        this.clock.tick(1);
        chai.assert.equal(this.getPrevious().length, 1);
        chai.assert.equal(this.getNext().length, 1);

        block.setCollapsed(true);
        chai.assert.equal(this.getPrevious().length, 1);
        chai.assert.equal(this.getNext().length, 1);

        block.setCollapsed(false);
        chai.assert.equal(this.getPrevious().length, 1);
        chai.assert.equal(this.getNext().length, 1);
      });
      test('Multi-Stack', function() {
        var block = Blockly.Xml.domToBlock(Blockly.Xml.textToDom(
            '<block type="stack_block">' +
            '  <next>' +
            '    <block type="stack_block">' +
            '      <next>' +
            '        <block type="stack_block"/>' +
            '      </next>' +
            '    </block>' +
            '  </next>' +
            '</block>'
        ), this.workspace);
        this.assertConnectionsEmpty();
        this.clock.tick(1);
        chai.assert.equal(this.getPrevious().length, 3);
        chai.assert.equal(this.getNext().length, 3);

        block.setCollapsed(true);
        chai.assert.equal(this.getPrevious().length, 3);
        chai.assert.equal(this.getNext().length, 3);

        block.setCollapsed(false);
        chai.assert.equal(this.getPrevious().length, 3);
        chai.assert.equal(this.getNext().length, 3);
      });
      test('Row', function() {
        var block = Blockly.Xml.domToBlock(Blockly.Xml.textToDom(
            '<block type="row_block"/>'
        ), this.workspace);
        this.clock.tick(1);
        chai.assert.equal(this.getOutputs().length, 1);
        chai.assert.equal(this.getInputs().length, 1);

        block.setCollapsed(true);
        chai.assert.equal(this.getOutputs().length, 1);
        chai.assert.equal(this.getInputs().length, 0);

        block.setCollapsed(false);
        chai.assert.equal(this.getOutputs().length, 1);
        chai.assert.equal(this.getInputs().length, 1);
      });
      test('Multi-Row', function() {
        var block = Blockly.Xml.domToBlock(Blockly.Xml.textToDom(
            '<block type="row_block">' +
            '  <value name="INPUT">' +
            '    <block type="row_block">' +
            '      <value name="INPUT">' +
            '        <block type="row_block"/>' +
            '      </value>' +
            '    </block>' +
            '  </value>' +
            '</block>'
        ), this.workspace);
        this.clock.tick(1);
        chai.assert.equal(this.getOutputs().length, 3);
        chai.assert.equal(this.getInputs().length, 3);

        block.setCollapsed(true);
        chai.assert.equal(this.getOutputs().length, 1);
        chai.assert.equal(this.getInputs().length, 0);

        block.setCollapsed(false);
        chai.assert.equal(this.getOutputs().length, 3);
        chai.assert.equal(this.getInputs().length, 3);
      });
      test('Multi-Row Middle', function() {
        var block = Blockly.Xml.domToBlock(Blockly.Xml.textToDom(
            '<block type="row_block">' +
            '  <value name="INPUT">' +
            '    <block type="row_block">' +
            '      <value name="INPUT">' +
            '        <block type="row_block"/>' +
            '      </value>' +
            '    </block>' +
            '  </value>' +
            '</block>'
        ), this.workspace);
        this.clock.tick(1);
        chai.assert.equal(this.getOutputs().length, 3);
        chai.assert.equal(this.getInputs().length, 3);

        block = block.getInputTargetBlock('INPUT');
        block.setCollapsed(true);
        chai.assert.equal(this.getOutputs().length, 2);
        chai.assert.equal(this.getInputs().length, 1);

        block.setCollapsed(false);
        chai.assert.equal(this.getOutputs().length, 3);
        chai.assert.equal(this.getInputs().length, 3);
      });
      test('Multi-Row Double Collapse', function() {
        // Collapse middle -> Collapse top ->
        // Uncollapse top -> Uncollapse middle
        var block = Blockly.Xml.domToBlock(Blockly.Xml.textToDom(
            '<block type="row_block">' +
            '  <value name="INPUT">' +
            '    <block type="row_block">' +
            '      <value name="INPUT">' +
            '        <block type="row_block"/>' +
            '      </value>' +
            '    </block>' +
            '  </value>' +
            '</block>'
        ), this.workspace);
        this.clock.tick(1);
        chai.assert.equal(this.getOutputs().length, 3);
        chai.assert.equal(this.getInputs().length, 3);

        var middleBlock = block.getInputTargetBlock('INPUT');
        middleBlock.setCollapsed(true);
        chai.assert.equal(this.getOutputs().length, 2);
        chai.assert.equal(this.getInputs().length, 1);

        block.setCollapsed(true);
        chai.assert.equal(this.getOutputs().length, 1);
        chai.assert.equal(this.getInputs().length, 0);

        block.setCollapsed(false);
        chai.assert.equal(this.getOutputs().length, 2);
        chai.assert.equal(this.getInputs().length, 1);

        middleBlock.setCollapsed(false);
        chai.assert.equal(this.getOutputs().length, 3);
        chai.assert.equal(this.getInputs().length, 3);
      });
      test('Statement', function() {
        var block = Blockly.Xml.domToBlock(Blockly.Xml.textToDom(
            '<block type="statement_block"/>'
        ), this.workspace);
        this.clock.tick(1);
        chai.assert.equal(this.getPrevious().length, 1);
        chai.assert.equal(this.getNext().length, 2);

        block.setCollapsed(true);
        chai.assert.equal(this.getPrevious().length, 1);
        chai.assert.equal(this.getNext().length, 1);

        block.setCollapsed(false);
        chai.assert.equal(this.getPrevious().length, 1);
        chai.assert.equal(this.getNext().length, 2);
      });
      test('Multi-Statement', function() {
        var block = Blockly.Xml.domToBlock(Blockly.Xml.textToDom(
            '<block type="statement_block">' +
            '  <statement name="STATEMENT">' +
            '    <block type="statement_block">' +
            '      <statement name="STATEMENT">' +
            '        <block type="statement_block"/>' +
            '      </statement>' +
            '    </block>' +
            '  </statement>' +
            '</block>'
        ), this.workspace);
        this.assertConnectionsEmpty();
        this.clock.tick(1);
        chai.assert.equal(this.getPrevious().length, 3);
        chai.assert.equal(this.getNext().length, 6);

        block.setCollapsed(true);
        chai.assert.equal(this.getPrevious().length, 1);
        chai.assert.equal(this.getNext().length, 1);

        block.setCollapsed(false);
        chai.assert.equal(this.getPrevious().length, 3);
        chai.assert.equal(this.getNext().length, 6);
      });
      test('Multi-Statement Middle', function() {
        var block = Blockly.Xml.domToBlock(Blockly.Xml.textToDom(
            '<block type="statement_block">' +
            '  <statement name="STATEMENT">' +
            '    <block type="statement_block">' +
            '      <statement name="STATEMENT">' +
            '        <block type="statement_block"/>' +
            '      </statement>' +
            '    </block>' +
            '  </statement>' +
            '</block>'
        ), this.workspace);
        this.assertConnectionsEmpty();
        this.clock.tick(1);
        chai.assert.equal(this.getPrevious().length, 3);
        chai.assert.equal(this.getNext().length, 6);

        block = block.getInputTargetBlock('STATEMENT');
        block.setCollapsed(true);
        chai.assert.equal(this.getPrevious().length, 2);
        chai.assert.equal(this.getNext().length, 3);

        block.setCollapsed(false);
        chai.assert.equal(this.getPrevious().length, 3);
        chai.assert.equal(this.getNext().length, 6);
      });
      test('Multi-Statement Double Collapse', function() {
        var block = Blockly.Xml.domToBlock(Blockly.Xml.textToDom(
            '<block type="statement_block">' +
            '  <statement name="STATEMENT">' +
            '    <block type="statement_block">' +
            '      <statement name="STATEMENT">' +
            '        <block type="statement_block"/>' +
            '      </statement>' +
            '    </block>' +
            '  </statement>' +
            '</block>'
        ), this.workspace);
        this.assertConnectionsEmpty();
        this.clock.tick(1);
        chai.assert.equal(this.getPrevious().length, 3);
        chai.assert.equal(this.getNext().length, 6);

        var middleBlock = block.getInputTargetBlock('STATEMENT');
        middleBlock.setCollapsed(true);
        chai.assert.equal(this.getPrevious().length, 2);
        chai.assert.equal(this.getNext().length, 3);

        block.setCollapsed(true);
        chai.assert.equal(this.getPrevious().length, 1);
        chai.assert.equal(this.getNext().length, 1);

        block.setCollapsed(false);
        chai.assert.equal(this.getPrevious().length, 2);
        chai.assert.equal(this.getNext().length, 3);

        middleBlock.setCollapsed(false);
        chai.assert.equal(this.getPrevious().length, 3);
        chai.assert.equal(this.getNext().length, 6);
      });
    });
    suite('Remove Connections Programmatically', function() {
      test('Output', function() {
        var block = this.workspace.newBlock('row_block');
        block.initSvg();
        block.render();

        block.setOutput(false);

        chai.assert.equal(this.getOutputs().length, 0);
        chai.assert.equal(this.getInputs().length, 1);
      });
      test('Value', function() {
        var block = this.workspace.newBlock('row_block');
        block.initSvg();
        block.render();

        block.removeInput('INPUT');

        chai.assert.equal(this.getOutputs().length, 1);
        chai.assert.equal(this.getInputs().length, 0);
      });
      test('Previous', function() {
        var block = this.workspace.newBlock('stack_block');
        block.initSvg();
        block.render();

        block.setPreviousStatement(false);

        chai.assert.equal(this.getPrevious().length, 0);
        chai.assert.equal(this.getNext().length, 1);
      });
      test('Next', function() {
        var block = this.workspace.newBlock('stack_block');
        block.initSvg();
        block.render();

        block.setNextStatement(false);

        chai.assert.equal(this.getPrevious().length, 1);
        chai.assert.equal(this.getNext().length, 0);
      });
      test('Statement', function() {
        var block = this.workspace.newBlock('statement_block');
        block.initSvg();
        block.render();

        block.removeInput('STATEMENT');

        chai.assert.equal(this.getPrevious().length, 1);
        chai.assert.equal(this.getNext().length, 1);
      });
    });
    suite('Add Connections Programmatically', function() {
      test('Output', function() {
        var block = this.workspace.newBlock('empty_block');
        block.initSvg();
        block.render();

        block.setOutput(true);

        chai.assert.equal(this.getOutputs().length, 1);
      });
      test('Value', function() {
        var block = this.workspace.newBlock('empty_block');
        block.initSvg();
        block.render();

        block.appendValueInput('INPUT');

        chai.assert.equal(this.getInputs().length, 1);
      });
      test('Previous', function() {
        var block = this.workspace.newBlock('empty_block');
        block.initSvg();
        block.render();

        block.setPreviousStatement(true);

        chai.assert.equal(this.getPrevious().length, 1);
      });
      test('Next', function() {
        var block = this.workspace.newBlock('empty_block');
        block.initSvg();
        block.render();

        block.setNextStatement(true);

        chai.assert.equal(this.getNext().length, 1);
      });
      test('Statement', function() {
        var block = this.workspace.newBlock('empty_block');
        block.initSvg();
        block.render();

        block.appendStatementInput('STATEMENT');

        chai.assert.equal(this.getNext().length, 1);
      });
    });
  });
  suite('Comments', function() {
    setup(function() {
      Blockly.defineBlocksWithJsonArray([
        {
          "type": "empty_block",
          "message0": "",
          "args0": []
        },
      ]);
      this.eventSpy = sinon.spy(Blockly.Events, 'fire');
    });
    teardown(function() {
      delete Blockly.Blocks['empty_block'];
      this.eventSpy.restore();
    });
    suite('Set/Get Text', function() {
      function assertCommentEvent(eventSpy, oldValue, newValue) {
        var calls = eventSpy.getCalls();
        var event = calls[calls.length - 1].args[0];
        chai.assert.equal(event.type, Blockly.Events.BLOCK_CHANGE);
        chai.assert.equal(event.element, 'comment');
        chai.assert.equal(event.oldValue, oldValue);
        chai.assert.equal(event.newValue, newValue);
      }
      function assertNoCommentEvent(eventSpy) {
        var calls = eventSpy.getCalls();
        var event = calls[calls.length - 1].args[0];
        chai.assert.notEqual(event.type, Blockly.Events.BLOCK_CHANGE);
      }
      suite('Headless', function() {
        setup(function() {
          this.block = Blockly.Xml.domToBlock(Blockly.Xml.textToDom(
              '<block type="empty_block"/>'
          ), this.workspace);
        });
        test('Text', function() {
          this.block.setCommentText('test text');
          chai.assert.equal(this.block.getCommentText(), 'test text');
          assertCommentEvent(this.eventSpy, null, 'test text');
        });
        test('Text Empty', function() {
          this.block.setCommentText('');
          chai.assert.equal(this.block.getCommentText(), '');
          assertCommentEvent(this.eventSpy, null, '');
        });
        test('Text Null', function() {
          this.block.setCommentText(null);
          chai.assert.equal(this.block.getCommentText(), null);
          assertNoCommentEvent(this.eventSpy);
        });
        test('Text -> Null', function() {
          this.block.setCommentText('first text');

          this.block.setCommentText(null);
          chai.assert.equal(this.block.getCommentText(), null);
          assertCommentEvent(this.eventSpy, 'first text', null);
        });
      });
      suite('Rendered', function() {
        setup(function() {
          this.workspace = Blockly.inject('blocklyDiv', {
            comments: true,
            scrollbars: true
          });
          this.block = Blockly.Xml.domToBlock(Blockly.Xml.textToDom(
              '<block type="empty_block"/>'
          ), this.workspace);
        });
        teardown(function() {
          this.workspace.dispose();
        });
        test('Text', function() {
          this.block.setCommentText('test text');
          chai.assert.equal(this.block.getCommentText(), 'test text');
          assertCommentEvent(this.eventSpy, null, 'test text');
        });
        test('Text Empty', function() {
          this.block.setCommentText('');
          chai.assert.equal(this.block.getCommentText(), '');
          assertCommentEvent(this.eventSpy, null, '');
        });
        test('Text Null', function() {
          this.block.setCommentText(null);
          chai.assert.equal(this.block.getCommentText(), null);
          assertNoCommentEvent(this.eventSpy);
        });
        test('Text -> Null', function() {
          this.block.setCommentText('first text');

          this.block.setCommentText(null);
          chai.assert.equal(this.block.getCommentText(), null);
          assertCommentEvent(this.eventSpy, 'first text', null);
        });
        test('Set While Visible - Editable', function() {
          this.block.setCommentText('test1');
          var icon = this.block.getCommentIcon();
          icon.setVisible(true);

          this.block.setCommentText('test2');
          chai.assert.equal(this.block.getCommentText(), 'test2');
          assertCommentEvent(this.eventSpy, 'test1', 'test2');
          chai.assert.equal(icon.textarea_.value, 'test2');
        });
        test('Set While Visible - NonEditable', function() {
          this.block.setCommentText('test1');
          var editableStub = sinon.stub(this.block, 'isEditable').returns(false);
          var icon = this.block.getCommentIcon();
          icon.setVisible(true);

          this.block.setCommentText('test2');
          chai.assert.equal(this.block.getCommentText(), 'test2');
          assertCommentEvent(this.eventSpy, 'test1', 'test2');
          chai.assert.equal(icon.paragraphElement_.firstChild.textContent,
              'test2');

          editableStub.restore();
        });
        test('Get Text While Editing', function() {
          this.block.setCommentText('test1');
          var icon = this.block.getCommentIcon();
          icon.setVisible(true);
          icon.textarea_.value = 'test2';
          icon.textarea_.dispatchEvent(new Event('input'));

          chai.assert.equal(this.block.getCommentText(), 'test2');
        });
      });
    });
  });
  suite('Icon Management', function() {
    suite('Bubbles and Collapsing', function() {
      setup(function() {
        this.workspace.dispose();
        this.workspace = Blockly.inject('blocklyDiv');
      });
      teardown(function() {
        this.workspace.dispose();
      });

      test('Has Icon', function() {
        var block = Blockly.Xml.domToBlock(Blockly.Xml.textToDom(
            '<block type="statement_block"/>'
        ), this.workspace);
        block.setCommentText('test text');
        block.comment.setVisible(true);
        chai.assert.isTrue(block.comment.isVisible());
        block.setCollapsed(true);
        chai.assert.isFalse(block.comment.isVisible());
      });
      test('Child Has Icon', function() {
        var block = Blockly.Xml.domToBlock(Blockly.Xml.textToDom(
            '<block type="statement_block">' +
            '  <statement name="STATEMENT">' +
            '    <block type="statement_block"/>' +
            '  </statement>' +
            '</block>'
        ), this.workspace);
        var childBlock = block.getInputTargetBlock('STATEMENT');
        childBlock.setCommentText('test text');
        childBlock.comment.setVisible(true);
        chai.assert.isTrue(childBlock.comment.isVisible());
        block.setCollapsed(true);
        chai.assert.isFalse(childBlock.comment.isVisible());
      });
      test('Next Block Has Icon', function() {
        var block = Blockly.Xml.domToBlock(Blockly.Xml.textToDom(
            '<block type="statement_block">' +
            '  <next>' +
            '    <block type="statement_block"/>' +
            '  </next>' +
            '</block>'
        ), this.workspace);
        var nextBlock = block.getNextBlock();
        nextBlock.setCommentText('test text');
        nextBlock.comment.setVisible(true);
        chai.assert.isTrue(nextBlock.comment.isVisible());
        block.setCollapsed(true);
        chai.assert.isTrue(nextBlock.comment.isVisible());
      });
    });
  });

  suite('Style', function() {
    suite('Headless', function() {
      setup(function() {
        this.block = Blockly.Xml.domToBlock(Blockly.Xml.textToDom(
            '<block type="empty_block"/>'
        ), this.workspace);
      });
      test('Set colour', function() {
        this.block.setColour('20');
        assertEquals(this.block.getColour(), '#a5745b');
        assertEquals(this.block.colour_, this.block.getColour());
        assertEquals(this.block.hue_, '20');
      });
      test('Set style', function() {
        this.block.setStyle('styleOne');
        assertEquals(this.block.getStyleName(), 'styleOne');
        assertEquals(this.block.hue_, null);
        // Calling setStyle does not update the colour on a headless block.
        assertEquals(this.block.getColour(), '#000000');
      });
    });
    suite('Rendered', function() {
      setup(function() {
        this.workspace = Blockly.inject('blocklyDiv', {});
        this.block = Blockly.Xml.domToBlock(Blockly.Xml.textToDom(
            '<block type="empty_block"/>'
        ), this.workspace);
        this.workspace.setTheme(new Blockly.Theme('test', {
          "styleOne" : {
            "colourPrimary": "#000000",
            "colourSecondary": "#999999",
            "colourTertiary": "#4d4d4d",
            "hat": ''
          }
        }), {});
      });
      teardown(function() {
        this.workspace.dispose();
      });
      test('Set colour hue', function() {
        this.block.setColour('20');
        assertEquals(this.block.getStyleName(), 'auto_#a5745b');
        assertEquals(this.block.getColour(), '#a5745b');
        assertEquals(this.block.colour_, this.block.getColour());
        assertEquals(this.block.hue_, '20');
      });
      test('Set colour hex', function() {
        this.block.setColour('#000000');
        assertEquals(this.block.getStyleName(), 'auto_#000000');
        assertEquals(this.block.getColour(), '#000000');
        assertEquals(this.block.colour_, this.block.getColour());
        assertEquals(this.block.hue_, null);
      });
      test('Set style', function() {
        this.block.setStyle('styleOne');
        assertEquals(this.block.getStyleName(), 'styleOne');
        assertEquals(this.block.getColour(), '#000000');
        assertEquals(this.block.colour_, this.block.getColour());
      });
    });
  });
});
