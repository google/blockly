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
    delete Blockly.Blocks['empty_block'];
    delete Blockly.Blocks['stack_block'];
    delete Blockly.Blocks['row_block'];
    delete Blockly.Blocks['statement_block'];
  });

  function createTestBlocks(workspace, isRow) {
    var blockType = isRow ? 'row_block' : 'stack_block';
    var blockA = workspace.newBlock(blockType);
    var blockB = workspace.newBlock(blockType);
    var blockC = workspace.newBlock(blockType);

    if (isRow) {
      blockA.inputList[0].connection.connect(blockB.outputConnection);
      blockB.inputList[0].connection.connect(blockC.outputConnection);
    } else {
      blockA.nextConnection.connect(blockB.previousConnection);
      blockB.nextConnection.connect(blockC.previousConnection);
    }

    chai.assert.equal(blockC.getParent(), blockB);

    return {
      A: blockA,  /* Parent */
      B: blockB,  /* Middle */
      C: blockC  /* Child */
    };
  }

  suite('Unplug', function() {
    function assertUnpluggedNoheal(blocks) {
      // A has nothing connected to it.
      chai.assert.equal(blocks.A.getChildren().length, 0);
      // B and C are still connected.
      chai.assert.equal(blocks.C.getParent(), blocks.B);
      // B is the top of its stack.
      chai.assert.isNull(blocks.B.getParent());
    }
    function assertUnpluggedHealed(blocks) {
      // A and C are connected.
      chai.assert.equal(blocks.A.getChildren().length, 1);
      chai.assert.equal(blocks.C.getParent(), blocks.A);
      // B has nothing connected to it.
      chai.assert.equal(blocks.B.getChildren().length, 0);
      // B is the top of its stack.
      chai.assert.isNull(blocks.B.getParent());
    }
    function assertUnpluggedHealFailed(blocks) {
      // A has nothing connected to it.
      chai.assert.equal(blocks.A.getChildren().length, 0);
      // B has nothing connected to it.
      chai.assert.equal(blocks.B.getChildren().length, 0);
      // B is the top of its stack.
      chai.assert.isNull(blocks.B.getParent());
      // C is the top of its stack.
      chai.assert.isNull(blocks.C.getParent());
    }

    suite('Row', function() {
      setup(function() {
        this.blocks = createTestBlocks(this.workspace, true);
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
      test('Parent has multiple inputs', function() {
        var blocks = this.blocks;
        // Add extra input to parent
        blocks.A.appendValueInput("INPUT").setCheck(null);
        blocks.B.unplug(true);
        assertUnpluggedHealed(blocks);
      });
      test('Middle has multiple inputs', function() {
        var blocks = this.blocks;
        // Add extra input to middle block
        blocks.B.appendValueInput("INPUT").setCheck(null);
        blocks.B.unplug(true);
        assertUnpluggedHealed(blocks);
      });
      test('Child has multiple inputs', function() {
        var blocks = this.blocks;
        // Add extra input to child block
        blocks.C.appendValueInput("INPUT").setCheck(null);
        // Child block input count doesn't matter.
        blocks.B.unplug(true);
        assertUnpluggedHealed(blocks);
      });
      test('Child is shadow', function() {
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
        this.blocks = createTestBlocks(this.workspace, false);
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
      test('Child is shadow', function() {
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
      chai.assert.equal(blocks.A.getChildren().length, 0);
      // B is disposed.
      chai.assert.isTrue(blocks.B.disposed);
      // And C is disposed.
      chai.assert.isTrue(blocks.C.disposed);
    }
    function assertDisposedHealed(blocks) {
      chai.assert.isFalse(blocks.A.disposed);
      chai.assert.isFalse(blocks.C.disposed);
      // A and C are connected.
      chai.assert.equal(blocks.A.getChildren().length, 1);
      chai.assert.equal(blocks.C.getParent(), blocks.A);
      // B is disposed.
      chai.assert.isTrue(blocks.B.disposed);
    }
    function assertDisposedHealFailed(blocks) {
      chai.assert.isFalse(blocks.A.disposed);
      chai.assert.isFalse(blocks.C.disposed);
      // A has nothing connected to it.
      chai.assert.equal(blocks.A.getChildren().length, 0);
      // B is disposed.
      chai.assert.isTrue(blocks.B.disposed);
      // C is the top of its stack.
      chai.assert.isNull(blocks.C.getParent());
    }

    suite('Row', function() {
      setup(function() {
        this.blocks = createTestBlocks(this.workspace, true);
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
      test('Parent has multiple inputs', function() {
        var blocks = this.blocks;
        // Add extra input to parent
        blocks.A.appendValueInput("INPUT").setCheck(null);
        blocks.B.dispose(true);
        assertDisposedHealed(blocks);
      });
      test('Middle has multiple inputs', function() {
        var blocks = this.blocks;
        // Add extra input to middle block
        blocks.B.appendValueInput("INPUT").setCheck(null);
        blocks.B.dispose(true);
        assertDisposedHealed(blocks);
      });
      test('Child has multiple inputs', function() {
        var blocks = this.blocks;
        // Add extra input to child block
        blocks.C.appendValueInput("INPUT").setCheck(null);
        // Child block input count doesn't matter.
        blocks.B.dispose(true);
        assertDisposedHealed(blocks);
      });
      test('Child is shadow', function() {
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
        this.blocks = createTestBlocks(this.workspace, false);
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
      test('Child is shadow', function() {
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
      ]);
    });
    teardown(function() {
      delete Blockly.Blocks['value_block'];
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
      this.eventSpy = sinon.spy(Blockly.Events, 'fire');
    });
    teardown(function() {
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
          chai.assert.isNull(this.block.getCommentText());
          assertNoCommentEvent(this.eventSpy);
        });
        test('Text -> Null', function() {
          this.block.setCommentText('first text');

          this.block.setCommentText(null);
          chai.assert.isNull(this.block.getCommentText());
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
          chai.assert.isNull(this.block.getCommentText());
          assertNoCommentEvent(this.eventSpy);
        });
        test('Text -> Null', function() {
          this.block.setCommentText('first text');

          this.block.setCommentText(null);
          chai.assert.isNull(this.block.getCommentText());
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
  suite('Collapsing and Expanding', function() {
    function assertCollapsed(block, opt_string) {
      chai.assert.isTrue(block.isCollapsed());
      for (var i = 0, input; (input = block.inputList[i]); i++) {
        if (input.name == Blockly.Block.COLLAPSED_INPUT_NAME) {
          continue;
        }
        chai.assert.isFalse(input.isVisible());
        for (var j = 0, field; (field = input.fieldRow[j]); j++) {
          chai.assert.isFalse(field.isVisible());
        }
      }
      var icons = block.getIcons();
      for (var i = 0, icon; (icon = icons[i]); i++) {
        chai.assert.isFalse(icon.isVisible());
      }

      var input = block.getInput(Blockly.Block.COLLAPSED_INPUT_NAME);
      chai.assert.isNotNull(input);
      chai.assert.isTrue(input.isVisible());
      var field = block.getField(Blockly.Block.COLLAPSED_FIELD_NAME);
      chai.assert.isNotNull(field);
      chai.assert.isTrue(field.isVisible());

      if (opt_string) {
        chai.assert.equal(field.getText(), opt_string);
      }
    }
    function assertNotCollapsed(block) {
      chai.assert.isFalse(block.isCollapsed());
      for (var i = 0, input; (input = block.inputList[i]); i++) {
        chai.assert.isTrue(input.isVisible());
        for (var j = 0, field; (field = input.fieldRow[j]); j++) {
          chai.assert.isTrue(field.isVisible());
        }
      }

      var input = block.getInput(Blockly.Block.COLLAPSED_INPUT_NAME);
      chai.assert.isNull(input);
      var field = block.getField(Blockly.Block.COLLAPSED_FIELD_NAME);
      chai.assert.isNull(field);
    }
    function isBlockHidden(block) {
      var node = block.getSvgRoot();
      do {
        var visible = node.style.display != 'none';
        if (!visible) {
          return true;
        }
        node = node.parentNode;
      } while (node != document);
      return false;
    }

    setup(function() {
      Blockly.Events.disable();
      // We need a visible workspace.
      this.workspace = Blockly.inject('blocklyDiv', {});
      Blockly.defineBlocksWithJsonArray([
        {
          "type": "variable_block",
          "message0": "%1",
          "args0": [
            {
              "type": "field_variable",
              "name": "NAME",
              "variable": "x"
            }
          ],
        }
      ]);
      this.createBlock = function(type) {
        var block = this.workspace.newBlock(type);
        block.initSvg();
        block.render();
        return block;
      };
    });
    teardown(function() {
      Blockly.Events.enable();
      delete Blockly.Blocks['variable_block'];
    });
    suite('Connecting and Disconnecting', function() {
      test('Connect Block to Next', function() {
        var blockA = this.createBlock('stack_block');
        var blockB = this.createBlock('stack_block');

        blockA.setCollapsed(true);
        assertCollapsed(blockA);
        blockA.nextConnection.connect(blockB.previousConnection);
        assertNotCollapsed(blockB);
      });
      test('Connect Block to Value Input', function() {
        var blockA = this.createBlock('row_block');
        var blockB = this.createBlock('row_block');

        blockA.setCollapsed(true);
        assertCollapsed(blockA);
        blockA.getInput('INPUT').connection.connect(blockB.outputConnection);
        chai.assert.isTrue(isBlockHidden(blockB));
        blockA.setCollapsed(false);
        assertNotCollapsed(blockA);
        chai.assert.isFalse(isBlockHidden(blockB));
      });
      test('Connect Block to Statement Input', function() {
        var blockA = this.createBlock('statement_block');
        var blockB = this.createBlock('stack_block');

        blockA.setCollapsed(true);
        assertCollapsed(blockA);
        blockA.getInput('STATEMENT').connection
            .connect(blockB.previousConnection);
        chai.assert.isTrue(isBlockHidden(blockB));
        blockA.setCollapsed(false);
        assertNotCollapsed(blockA);
        chai.assert.isFalse(isBlockHidden(blockB));
      });
      test('Connect Block to Child of Collapsed - Input', function() {
        var blockA = this.createBlock('row_block');
        var blockB = this.createBlock('row_block');
        var blockC = this.createBlock('row_block');

        blockA.getInput('INPUT').connection.connect(blockB.outputConnection);
        blockA.setCollapsed(true);
        assertCollapsed(blockA);
        chai.assert.isTrue(isBlockHidden(blockB));
        blockB.getInput('INPUT').connection.connect(blockC.outputConnection);
        chai.assert.isTrue(isBlockHidden(blockC));

        blockA.setCollapsed(false);
        assertNotCollapsed(blockA);
        chai.assert.isFalse(isBlockHidden(blockB));
        chai.assert.isFalse(isBlockHidden(blockC));
      });
      test('Connect Block to Child of Collapsed - Next', function() {
        var blockA = this.createBlock('statement_block');
        var blockB = this.createBlock('stack_block');
        var blockC = this.createBlock('stack_block');

        blockA.getInput('STATEMENT').connection
            .connect(blockB.previousConnection);
        blockA.setCollapsed(true);
        assertCollapsed(blockA);
        chai.assert.isTrue(isBlockHidden(blockB));
        blockB.nextConnection.connect(blockC.previousConnection);
        chai.assert.isTrue(isBlockHidden(blockC));

        blockA.setCollapsed(false);
        assertNotCollapsed(blockA);
        chai.assert.isFalse(isBlockHidden(blockB));
        chai.assert.isFalse(isBlockHidden(blockC));
      });
      test('Connect Block to Value Input Already Taken', function() {
        var blockA = this.createBlock('row_block');
        var blockB = this.createBlock('row_block');
        var blockC = this.createBlock('row_block');

        blockA.getInput('INPUT').connection.connect(blockB.outputConnection);
        blockA.setCollapsed(true);
        assertCollapsed(blockA);
        chai.assert.isTrue(isBlockHidden(blockB));
        blockA.getInput('INPUT').connection.connect(blockC.outputConnection);
        chai.assert.isTrue(isBlockHidden(blockC));
        // Still hidden after C is inserted between.
        chai.assert.isTrue(isBlockHidden(blockB));

        blockA.setCollapsed(false);
        assertNotCollapsed(blockA);
        chai.assert.isFalse(isBlockHidden(blockB));
        chai.assert.isFalse(isBlockHidden(blockC));
      });
      test('Connect Block to Statement Input Already Taken', function() {
        var blockA = this.createBlock('statement_block');
        var blockB = this.createBlock('stack_block');
        var blockC = this.createBlock('stack_block');

        blockA.getInput('STATEMENT').connection
            .connect(blockB.previousConnection);
        blockA.setCollapsed(true);
        assertCollapsed(blockA);
        chai.assert.isTrue(isBlockHidden(blockB));
        blockA.getInput('STATEMENT').connection
            .connect(blockC.previousConnection);
        chai.assert.isTrue(isBlockHidden(blockC));
        // Still hidden after C is inserted between.
        chai.assert.isTrue(isBlockHidden(blockB));

        blockA.setCollapsed(false);
        assertNotCollapsed(blockA);
        chai.assert.isFalse(isBlockHidden(blockB));
        chai.assert.isFalse(isBlockHidden(blockC));
      });
      test('Connect Block with Child - Input', function() {
        var blockA = this.createBlock('row_block');
        var blockB = this.createBlock('row_block');
        var blockC = this.createBlock('row_block');

        blockB.getInput('INPUT').connection.connect(blockC.outputConnection);
        blockA.setCollapsed(true);
        assertCollapsed(blockA);
        blockA.getInput('INPUT').connection.connect(blockB.outputConnection);
        chai.assert.isTrue(isBlockHidden(blockC));
        chai.assert.isTrue(isBlockHidden(blockB));

        blockA.setCollapsed(false);
        assertNotCollapsed(blockA);
        chai.assert.isFalse(isBlockHidden(blockB));
        chai.assert.isFalse(isBlockHidden(blockC));
      });
      test('Connect Block with Child - Statement', function() {
        var blockA = this.createBlock('statement_block');
        var blockB = this.createBlock('stack_block');
        var blockC = this.createBlock('stack_block');

        blockB.nextConnection.connect(blockC.previousConnection);
        blockA.setCollapsed(true);
        assertCollapsed(blockA);
        blockA.getInput('STATEMENT').connection
            .connect(blockB.previousConnection);
        chai.assert.isTrue(isBlockHidden(blockC));
        chai.assert.isTrue(isBlockHidden(blockB));

        blockA.setCollapsed(false);
        assertNotCollapsed(blockA);
        chai.assert.isFalse(isBlockHidden(blockB));
        chai.assert.isFalse(isBlockHidden(blockC));
      });
      test('Disconnect Block from Value Input', function() {
        var blockA = this.createBlock('row_block');
        var blockB = this.createBlock('row_block');

        blockA.getInput('INPUT').connection.connect(blockB.outputConnection);
        blockA.setCollapsed(true);
        assertCollapsed(blockA);
        chai.assert.isTrue(isBlockHidden(blockB));
        blockB.outputConnection.disconnect();
        chai.assert.isFalse(isBlockHidden(blockB));
      });
      test('Disconnect Block from Statement Input', function() {
        var blockA = this.createBlock('statement_block');
        var blockB = this.createBlock('stack_block');

        blockA.getInput('STATEMENT').connection
            .connect(blockB.previousConnection);
        blockA.setCollapsed(true);
        assertCollapsed(blockA);
        chai.assert.isTrue(isBlockHidden(blockB));
        blockB.previousConnection.disconnect();
        chai.assert.isFalse(isBlockHidden(blockB));
      });
      test('Disconnect Block from Child of Collapsed - Input', function() {
        var blockA = this.createBlock('row_block');
        var blockB = this.createBlock('row_block');
        var blockC = this.createBlock('row_block');

        blockA.getInput('INPUT').connection.connect(blockB.outputConnection);
        blockB.getInput('INPUT').connection.connect(blockC.outputConnection);
        blockA.setCollapsed(true);
        assertCollapsed(blockA);
        chai.assert.isTrue(isBlockHidden(blockB));
        chai.assert.isTrue(isBlockHidden(blockC));

        blockC.outputConnection.disconnect();
        chai.assert.isFalse(isBlockHidden(blockC));
      });
      test('Disconnect Block from Child of Collapsed - Next', function() {
        var blockA = this.createBlock('statement_block');
        var blockB = this.createBlock('stack_block');
        var blockC = this.createBlock('stack_block');

        blockA.getInput('STATEMENT').connection
            .connect(blockB.previousConnection);
        blockB.nextConnection.connect(blockC.previousConnection);
        blockA.setCollapsed(true);
        assertCollapsed(blockA);
        chai.assert.isTrue(isBlockHidden(blockB));
        chai.assert.isTrue(isBlockHidden(blockC));

        blockC.previousConnection.disconnect();
        chai.assert.isFalse(isBlockHidden(blockC));
      });
      test('Disconnect Block with Child - Input', function() {
        var blockA = this.createBlock('row_block');
        var blockB = this.createBlock('row_block');
        var blockC = this.createBlock('row_block');

        blockB.getInput('INPUT').connection.connect(blockC.outputConnection);
        blockA.getInput('INPUT').connection.connect(blockB.outputConnection);
        blockA.setCollapsed(true);
        assertCollapsed(blockA);
        chai.assert.isTrue(isBlockHidden(blockB));
        chai.assert.isTrue(isBlockHidden(blockC));

        blockB.outputConnection.disconnect();
        chai.assert.isFalse(isBlockHidden(blockB));
        chai.assert.isFalse(isBlockHidden(blockC));
      });
      test('Disconnect Block with Child - Statement', function() {
        var blockA = this.createBlock('statement_block');
        var blockB = this.createBlock('stack_block');
        var blockC = this.createBlock('stack_block');

        blockB.nextConnection.connect(blockC.previousConnection);
        blockA.getInput('STATEMENT').connection
            .connect(blockB.previousConnection);
        blockA.setCollapsed(true);
        assertCollapsed(blockA);
        chai.assert.isTrue(isBlockHidden(blockC));
        chai.assert.isTrue(isBlockHidden(blockB));

        blockB.previousConnection.disconnect();
        chai.assert.isFalse(isBlockHidden(blockB));
        chai.assert.isFalse(isBlockHidden(blockC));
      });
    });
    suite('Adding and Removing Block Parts', function() {
      test('Add Previous Connection', function() {
        var blockA = this.createBlock('empty_block');
        blockA.setCollapsed(true);
        assertCollapsed(blockA);
        blockA.setPreviousStatement(true);
        assertCollapsed(blockA);
        chai.assert.isNotNull(blockA.previousConnection);
      });
      test('Add Next Connection', function() {
        var blockA = this.createBlock('empty_block');
        blockA.setCollapsed(true);
        assertCollapsed(blockA);
        blockA.setNextStatement(true);
        assertCollapsed(blockA);
        chai.assert.isNotNull(blockA.nextConnection);
      });
      test('Add Input', function() {
        var blockA = this.createBlock('empty_block');
        blockA.setCollapsed(true);
        assertCollapsed(blockA);
        blockA.appendDummyInput('NAME');
        assertCollapsed(blockA);
        chai.assert.isNotNull(blockA.getInput('NAME'));
      });
      test('Add Field', function() {
        var blockA = this.createBlock('empty_block');
        var input = blockA.appendDummyInput('NAME');
        blockA.setCollapsed(true);
        assertCollapsed(blockA);
        input.appendField(new Blockly.FieldLabel('test'), 'FIELD');
        assertCollapsed(blockA);
        var field = blockA.getField('FIELD');
        chai.assert.isNotNull(field);
        chai.assert.equal(field.getText(), 'test');
      });
      test('Add Icon', function() {
        var blockA = this.createBlock('empty_block');
        blockA.setCollapsed(true);
        assertCollapsed(blockA);
        blockA.setCommentText('test');
        assertCollapsed(blockA);
      });
      test('Remove Previous Connection', function() {
        var blockA = this.createBlock('empty_block');
        blockA.setPreviousStatement(true);
        blockA.setCollapsed(true);
        assertCollapsed(blockA);
        blockA.setPreviousStatement(false);
        assertCollapsed(blockA);
        chai.assert.isNull(blockA.previousConnection);
      });
      test('Remove Next Connection', function() {
        var blockA = this.createBlock('empty_block');
        blockA.setNextStatement(true);
        blockA.setCollapsed(true);
        assertCollapsed(blockA);
        blockA.setNextStatement(false);
        assertCollapsed(blockA);
        chai.assert.isNull(blockA.nextConnection);
      });
      test('Remove Input', function() {
        var blockA = this.createBlock('empty_block');
        blockA.appendDummyInput('NAME');
        blockA.setCollapsed(true);
        assertCollapsed(blockA);
        blockA.removeInput('NAME');
        assertCollapsed(blockA);
        chai.assert.isNull(blockA.getInput('NAME'));
      });
      test('Remove Field', function() {
        var blockA = this.createBlock('empty_block');
        var input = blockA.appendDummyInput('NAME');
        input.appendField(new Blockly.FieldLabel('test'), 'FIELD');
        blockA.setCollapsed(true);
        assertCollapsed(blockA);
        input.removeField('FIELD');
        assertCollapsed(blockA);
        var field = blockA.getField('FIELD');
        chai.assert.isNull(field);
      });
      test('Remove Icon', function() {
        var blockA = this.createBlock('empty_block');
        blockA.setCommentText('test');
        blockA.setCollapsed(true);
        assertCollapsed(blockA);
        blockA.setCommentText(null);
        assertCollapsed(blockA);
      });
    });
    suite('Renaming Vars', function() {
      test('Simple Rename', function() {
        var blockA = this.createBlock('variable_block');

        blockA.setCollapsed(true);
        assertCollapsed(blockA, 'x');

        var variable = this.workspace.getVariable('x', '');
        this.workspace.renameVariableById(variable.getId(), 'y');
        assertCollapsed(blockA, 'y');
      });
      test('Coalesce, Different Case', function() {
        var blockA = this.createBlock('variable_block');

        blockA.setCollapsed(true);
        assertCollapsed(blockA, 'x');

        var variable = this.workspace.createVariable('y');
        this.workspace.renameVariableById(variable.getId(), 'X');
        assertCollapsed(blockA, 'X');
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
        chai.assert.equal(this.block.getColour(), '#a5745b');
        chai.assert.equal(this.block.colour_, this.block.getColour());
        chai.assert.equal(this.block.hue_, '20');
      });
      test('Set style', function() {
        this.block.setStyle('styleOne');
        chai.assert.equal(this.block.getStyleName(), 'styleOne');
        chai.assert.isNull(this.block.hue_);
        // Calling setStyle does not update the colour on a headless block.
        chai.assert.equal(this.block.getColour(), '#000000');
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
        // Clear all registered themes.
        Blockly.registry.typeMap_['theme'] = {};
      });
      test('Set colour hue', function() {
        this.block.setColour('20');
        chai.assert.equal(this.block.getStyleName(), 'auto_#a5745b');
        chai.assert.equal(this.block.getColour(), '#a5745b');
        chai.assert.equal(this.block.colour_, this.block.getColour());
        chai.assert.equal(this.block.hue_, '20');
      });
      test('Set colour hex', function() {
        this.block.setColour('#000000');
        chai.assert.equal(this.block.getStyleName(), 'auto_#000000');
        chai.assert.equal(this.block.getColour(), '#000000');
        chai.assert.equal(this.block.colour_, this.block.getColour());
        chai.assert.isNull(this.block.hue_);
      });
      test('Set style', function() {
        this.block.setStyle('styleOne');
        chai.assert.equal(this.block.getStyleName(), 'styleOne');
        chai.assert.equal(this.block.getColour(), '#000000');
        chai.assert.equal(this.block.colour_, this.block.getColour());
      });
    });
  });
  suite('toString', function() {
    var toStringTests = [
      {
        name: 'statement block',
        xml: '<block type="controls_repeat_ext">' +
          '<value name="TIMES">' +
            '<shadow type="math_number">' +
              '<field name="NUM">10</field>' +
          '</shadow>' +
          '</value>' +
        '</block>',
        toString: 'repeat 10 times do ?',
      },
      {
        name: 'nested statement blocks',
        xml: '<block type="controls_repeat_ext">' +
          '<value name="TIMES">' +
            '<shadow type="math_number">' +
              '<field name="NUM">10</field>' +
            '</shadow>' +
          '</value>' +
          '<statement name="DO">' +
            '<block type="controls_if"></block>' +
          '</statement>' +
        '</block>',
        toString: 'repeat 10 times do if ? do ?',
      },
      {
        name: 'nested Boolean output blocks',
        xml: '<block type="controls_if">' +
          '<value name="IF0">' +
            '<block type="logic_compare">' +
              '<field name="OP">EQ</field>' +
              '<value name="A">' +
                '<block type="logic_operation">' +
                  '<field name="OP">AND</field>' +
                '</block>' +
              '</value>' +
            '</block>' +
          '</value>' +
        '</block>',
        toString: 'if ((? and ?) = ?) do ?',
      },
      {
        name: 'output block',
        xml: '<block type="math_single">' +
          '<field name="OP">ROOT</field>' +
          '<value name="NUM">' +
            '<shadow type="math_number">' +
              '<field name="NUM">9</field>' +
            '</shadow>' +
          '</value>' +
        '</block>',
        toString: 'square root 9',
      },
      {
        name: 'nested Number output blocks',
        xml: '<block type="math_arithmetic">' +
          '<field name="OP">ADD</field>' +
          '<value name="A">' +
            '<shadow type="math_number">' +
              '<field name="NUM">1</field>' +
            '</shadow>' +
            '<block type="math_arithmetic">' +
              '<field name="OP">MULTIPLY</field>' +
              '<value name="A">' +
                '<shadow type="math_number">' +
                  '<field name="NUM">10</field>' +
                '</shadow>' +
              '</value>' +
              '<value name="B">' +
                '<shadow type="math_number">' +
                  '<field name="NUM">5</field>' +
                '</shadow>' +
              '</value>' +
            '</block>' +
          '</value>' +
          '<value name="B">' +
            '<shadow type="math_number">' +
              '<field name="NUM">3</field>' +
            '</shadow>' +
          '</value>' +
        '</block>',
        toString: '(10 × 5) + 3',
      },
      {
        name: 'nested String output blocks',
        xml: '<block type="text_join">' +
          '<mutation items="2"></mutation>' +
          '<value name="ADD0">' +
            '<block type="text">' +
              '<field name="TEXT">Hello</field>' +
            '</block>' +
          '</value>' +
          '<value name="ADD1">' +
            '<block type="text">' +
              '<field name="TEXT">World</field>' +
            '</block>' +
          '</value>' +
        '</block>',
        toString: 'create text with “ Hello ” “ World ”',
      },
    ];
    // Create mocha test cases for each toString test.
    toStringTests.forEach(function(t) {
      test(t.name, function() {
        var block = Blockly.Xml.domToBlock(Blockly.Xml.textToDom(t.xml),
            this.workspace);
        chai.assert.equal(block.toString(), t.toString);
      });
    });
  });
});
