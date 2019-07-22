

suite('Connections', function() {

  suite.skip('Rendered', function() {
    function assertAllConnectionsHiddenState(block, hidden) {
      var connections = block.getConnections_(true);
      for (var i = 0; i < connections.length; i++) {
        var connection = connections[i];
        if (connection.type == Blockly.PREVIOUS_STATEMENT
          || connection.type == Blockly.OUTPUT_VALUE) {
          // Only superior connections on inputs get hidden
          continue;
        }
        if (block.nextConnection && connection === block.nextConnection) {
          // The next connection is not hidden when collapsed
          continue;
        }
        assertEquals('Connection ' + i + ' failed', hidden, connections[i].hidden_);
      }
    }
    function assertAllConnectionsHidden(block) {
      assertAllConnectionsHiddenState(block, true);
    }
    function assertAllConnectionsVisible(block) {
      assertAllConnectionsHiddenState(block, false);
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
      },
      {
        "type": "inputs_block",
        "message0": "%1 %2",
        "args0": [
          {
            "type": "input_value",
            "name": "INPUT"
          },
          {
            "type": "input_statement",
            "name": "STATEMENT"
          }
        ],
        "previousStatement": null,
        "nextStatement": null
      },]);

      var toolbox = document.getElementById('toolbox-connections');
      this.workspace = Blockly.inject('blocklyDiv', {toolbox: toolbox});
    });

    teardown(function() {
      delete Blockly.Blocks['stack_block'];
      delete Blockly.Blocks['row_block'];
      delete Blockly.Blocks['inputs_block'];

      this.workspace.dispose();
    });

    suite('Row collapsing', function() {
      setup(function() {
        var blockA = this.workspace.newBlock('row_block');
        var blockB = this.workspace.newBlock('row_block');
        var blockC = this.workspace.newBlock('row_block');

        blockA.inputList[0].connection.connect(blockB.outputConnection);
        blockA.setCollapsed(true);

        assertEquals(blockA, blockB.getParent());
        assertNull(blockC.getParent());
        assertTrue(blockA.isCollapsed());
        assertAllConnectionsHidden(blockA);
        assertAllConnectionsHidden(blockB);
        assertAllConnectionsVisible(blockC);

        this.blocks = {
          A: blockA,
          B: blockB,
          C: blockC
        };
      });

      test('Add to end', function() {
        var blocks = this.blocks;
        blocks.B.inputList[0].connection.connect(blocks.C.outputConnection);
        assertAllConnectionsHidden(blocks.C);
      });

      test('Add to end w/inferior', function() {
        var blocks = this.blocks;
        blocks.C.outputConnection.connect(blocks.B.inputList[0].connection);
        assertAllConnectionsHidden(blocks.C);
      });

      test('Add to middle', function() {
        var blocks = this.blocks;
        blocks.A.inputList[0].connection.connect(blocks.C.outputConnection);
        assertAllConnectionsHidden(blocks.C);
      });

      test('Add to middle w/inferior', function() {
        var blocks = this.blocks;
        blocks.C.outputConnection.connect(blocks.A.inputList[0].connection);
        assertAllConnectionsHidden(blocks.C);
      });

      test('Remove simple', function() {
        var blocks = this.blocks;
        blocks.B.unplug();
        assertAllConnectionsVisible(blocks.B);
      });

      test('Remove middle', function() {
        var blocks = this.blocks;
        blocks.B.inputList[0].connection.connect(blocks.C.outputConnection);
        blocks.B.unplug(false);
        assertAllConnectionsVisible(blocks.B);
        assertAllConnectionsVisible(blocks.C);
      });

      test('Remove middle healing', function() {
        var blocks = this.blocks;
        blocks.B.inputList[0].connection.connect(blocks.C.outputConnection);
        blocks.B.unplug(true);
        assertAllConnectionsVisible(blocks.B);
        assertAllConnectionsHidden(blocks.C);
      });

      test('Add before', function() {
        var blocks = this.blocks;
        blocks.C.inputList[0].connection.connect(blocks.A.outputConnection);
        // Connecting a collapsed block to another block doesn't change any hidden state
        assertAllConnectionsHidden(blocks.A);
        assertAllConnectionsVisible(blocks.C);
      });

      test('Remove front', function() {
        var blocks = this.blocks;
        blocks.B.inputList[0].connection.connect(blocks.C.outputConnection);
        blocks.A.inputList[0].connection.disconnect();
        assertTrue(blocks.A.isCollapsed());
        assertAllConnectionsHidden(blocks.A);
        assertAllConnectionsVisible(blocks.B);
        assertAllConnectionsVisible(blocks.C);
      });

      test('Uncollapse', function() {
        var blocks = this.blocks;
        blocks.B.inputList[0].connection.connect(blocks.C.outputConnection);
        blocks.A.setCollapsed(false);
        assertFalse(blocks.A.isCollapsed());
        assertAllConnectionsVisible(blocks.A);
        assertAllConnectionsVisible(blocks.B);
        assertAllConnectionsVisible(blocks.C);
      });
    });
    suite('Statement collapsing', function() {
      setup(function() {
        var blockA = this.workspace.newBlock('inputs_block');
        var blockB = this.workspace.newBlock('inputs_block');
        var blockC = this.workspace.newBlock('inputs_block');

        blockA.getInput('STATEMENT').connection.connect(blockB.previousConnection);
        blockA.setCollapsed(true);

        assertEquals(blockA, blockB.getParent());
        assertNull(blockC.getParent());
        assertTrue(blockA.isCollapsed());
        assertAllConnectionsHidden(blockA);
        assertAllConnectionsHidden(blockB);
        assertAllConnectionsVisible(blockC);

        this.blocks = {
          A: blockA,
          B: blockB,
          C: blockC
        };
      });

      test('Add to statement', function() {
        var blocks = this.blocks;
        blocks.B.getInput('STATEMENT').connection.connect(blocks.C.previousConnection);
        assertAllConnectionsHidden(blocks.C);
      });

      test('Insert in statement', function() {
        var blocks = this.blocks;
        blocks.A.getInput('STATEMENT').connection.connect(blocks.C.previousConnection);
        assertAllConnectionsHidden(blocks.C);
      });

      test('Add to hidden next', function() {
        var blocks = this.blocks;
        blocks.B.nextConnection.connect(blocks.C.previousConnection);
        assertAllConnectionsHidden(blocks.C);
      });

      test('Remove simple', function() {
        var blocks = this.blocks;
        blocks.B.unplug();
        assertAllConnectionsVisible(blocks.B);
      });

      test('Remove middle', function() {
        var blocks = this.blocks;
        blocks.B.nextConnection.connect(blocks.C.previousConnection);
        blocks.B.unplug(false);
        assertAllConnectionsVisible(blocks.B);
        assertAllConnectionsVisible(blocks.C);
      });

      test('Remove middle healing', function() {
        var blocks = this.blocks;
        blocks.B.nextConnection.connect(blocks.C.previousConnection);
        blocks.B.unplug(true);
        assertAllConnectionsVisible(blocks.B);
        assertAllConnectionsHidden(blocks.C);
      });

      test('Add before', function() {
        var blocks = this.blocks;
        blocks.C.getInput('STATEMENT').connection.connect(blocks.A.previousConnection);
        assertAllConnectionsHidden(blocks.A);
        assertAllConnectionsHidden(blocks.B);
        assertAllConnectionsVisible(blocks.C);
      });

      test('Remove front', function() {
        var blocks = this.blocks;
        blocks.B.nextConnection.connect(blocks.C.previousConnection);
        blocks.A.getInput('STATEMENT').connection.disconnect();
        assertTrue(blocks.A.isCollapsed());
        assertAllConnectionsHidden(blocks.A);
        assertAllConnectionsVisible(blocks.B);
        assertAllConnectionsVisible(blocks.C);
      });

      test('Uncollapse', function() {
        var blocks = this.blocks;
        blocks.B.nextConnection.connect(blocks.C.previousConnection);
        blocks.A.setCollapsed(false);
        assertFalse(blocks.A.isCollapsed());
        assertAllConnectionsVisible(blocks.A);
        assertAllConnectionsVisible(blocks.B);
        assertAllConnectionsVisible(blocks.C);
      });
    });

    suite('Collapsing with shadows', function() {
      setup(function() {
        var blockA = this.workspace.newBlock('inputs_block');
        var blockB = this.workspace.newBlock('inputs_block');
        var blockC = this.workspace.newBlock('inputs_block');
        var blockD = this.workspace.newBlock('row_block');

        blockB.setShadow(true);
        var shadowStatement = Blockly.Xml.blockToDom(blockB, true /*noid*/);
        blockB.setShadow(false);

        blockD.setShadow(true);
        var shadowValue = Blockly.Xml.blockToDom(blockD, true /*noid*/);
        blockD.setShadow(false);

        var connection = blockA.getInput('STATEMENT').connection;
        connection.setShadowDom(shadowStatement);
        connection.connect(blockB.previousConnection);
        connection = blockA.getInput('INPUT').connection;
        connection.setShadowDom(shadowValue);
        connection.connect(blockD.outputConnection);
        blockA.setCollapsed(true);

        assertEquals(blockA, blockB.getParent());
        assertNull(blockC.getParent());
        assertTrue(blockA.isCollapsed());
        assertAllConnectionsHidden(blockA);
        assertAllConnectionsHidden(blockB);
        assertAllConnectionsVisible(blockC);

        this.blocks = {
          A: blockA,
          B: blockB,
          C: blockC,
          D: blockD
        };
      });

      test('Reveal shadow statement', function() {
        var blocks = this.blocks;
        var connection = blocks.A.getInput('STATEMENT').connection;
        connection.disconnect();
        var shadowBlock = connection.targetBlock();
        assertTrue(shadowBlock.isShadow());
        assertAllConnectionsHidden(shadowBlock);
      });

      test('Reveal shadow value', function() {
        var blocks = this.blocks;
        var connection = blocks.A.getInput('INPUT').connection;
        connection.disconnect();
        var shadowBlock = connection.targetBlock();
        assertTrue(shadowBlock.isShadow());
        assertAllConnectionsHidden(shadowBlock);
      });
    });
  });
});
