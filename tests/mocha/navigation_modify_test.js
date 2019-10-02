/**
 * @license
 * Copyright 2019 Google LLC
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

suite('Insert/Modify', function() {
  setup(function() {
    var xmlText = '<xml xmlns="https://developers.google.com/blockly/xml">' +
      '<block type="stack_block" id="stack_block_1" x="12" y="38"></block>' +
      '<block type="stack_block" id="stack_block_2" x="12" y="113"></block>' +
      '<block type="row_block" id="row_block_1" x="13" y="213"></block>' +
      '<block type="row_block" id="row_block_2" x="12" y="288"></block>' +
      '<block type="statement_block" id="statement_block_1" x="12" y="288"></block>' +
      '<block type="statement_block" id="statement_block_2" x="12" y="288"></block>' +
    '</xml>';
    defineStackBlock();
    defineRowBlock();
    defineStatementBlock();

    var toolbox = document.getElementById('toolbox-connections');
    this.workspace = Blockly.inject('blocklyDiv', {toolbox: toolbox});
    Blockly.Xml.domToWorkspace(Blockly.Xml.textToDom(xmlText), this.workspace);

    this.stack_block_1 = this.workspace.getBlockById('stack_block_1');
    this.stack_block_2 = this.workspace.getBlockById('stack_block_2');
    this.row_block_1 = this.workspace.getBlockById('row_block_1');
    this.row_block_2 = this.workspace.getBlockById('row_block_2');
    this.statement_block_1 = this.workspace.getBlockById('statement_block_1');
    this.statement_block_2 = this.workspace.getBlockById('statement_block_2');

    Blockly.navigation.enableKeyboardAccessibility();
  });

  teardown(function() {
    delete Blockly.Blocks['stack_block'];
    delete Blockly.Blocks['row_block'];
    delete Blockly.Blocks['statement_block'];
    this.workspace.dispose();
  });

  suite('Marked Connection', function() {
    // TODO: Marked connection or cursor connection is already connected.
    suite('Marker on next', function() {
      setup(function() {
        this.workspace.getMarker().setCurNode(
            Blockly.ASTNode.createConnectionNode(
                this.stack_block_1.nextConnection));
      });
      test('Cursor on workspace', function() {
        this.workspace.getCursor().setCurNode(
            Blockly.ASTNode.createWorkspaceNode(this.workspace,
                new Blockly.utils.Coordinate(0, 0)));
        chai.assert.isFalse(Blockly.navigation.modify_());
      });
      test('Cursor on compatible connection', function() {
        this.workspace.getCursor().setCurNode(
            Blockly.ASTNode.createConnectionNode(
                this.stack_block_2.previousConnection));
        chai.assert.isTrue(Blockly.navigation.modify_());
        chai.assert.equal(this.stack_block_1.getNextBlock().id, 'stack_block_2');
      });
      test('Cursor on incompatible connection', function() {
        this.workspace.getCursor().setCurNode(
            Blockly.ASTNode.createConnectionNode(
                this.stack_block_2.nextConnection));
        // Connect method will try to find a way to connect blocks with
        // incompatible types.
        chai.assert.isTrue(Blockly.navigation.modify_());
        chai.assert.equal(this.stack_block_1.getNextBlock(), this.stack_block_2);
      });
      test('Cursor on really incompatible connection', function() {
        this.workspace.getCursor().setCurNode(
            Blockly.ASTNode.createConnectionNode(
                this.row_block_1.outputConnection));
        chai.assert.isFalse(Blockly.navigation.modify_());
        chai.assert.isNull(this.stack_block_1.getNextBlock());
      });
      test('Cursor on block', function() {
        this.workspace.getCursor().setCurNode(
            Blockly.ASTNode.createBlockNode(
                this.stack_block_2));
        chai.assert.isTrue(Blockly.navigation.modify_());
        chai.assert.equal(this.stack_block_1.getNextBlock().id, 'stack_block_2');
      });
    });

    suite('Marker on previous', function() {
      setup(function() {
        this.workspace.getMarker().setCurNode(
            Blockly.ASTNode.createConnectionNode(
                this.stack_block_1.previousConnection));
      });
      test('Cursor on compatible connection', function() {
        this.workspace.getCursor().setCurNode(
            Blockly.ASTNode.createConnectionNode(
                this.stack_block_2.nextConnection));
        chai.assert.isTrue(Blockly.navigation.modify_());
        chai.assert.equal(this.stack_block_1.getPreviousBlock().id, 'stack_block_2');
      });
      test('Cursor on incompatible connection', function() {
        this.workspace.getCursor().setCurNode(
            Blockly.ASTNode.createConnectionNode(
                this.stack_block_2.previousConnection));
        chai.assert.isFalse(Blockly.navigation.modify_());
        chai.assert.isNull(this.stack_block_1.getPreviousBlock());
      });
      test('Cursor on really incompatible connection', function() {
        this.workspace.getCursor().setCurNode(
            Blockly.ASTNode.createConnectionNode(
                this.row_block_1.outputConnection));
        chai.assert.isFalse(Blockly.navigation.modify_());
        chai.assert.isNull(this.stack_block_1.getNextBlock());
      });
      test('Cursor on block', function() {
        this.workspace.getCursor().setCurNode(
            Blockly.ASTNode.createBlockNode(
                this.stack_block_2));
        chai.assert.isTrue(Blockly.navigation.modify_());
        chai.assert.equal(this.stack_block_1.getPreviousBlock().id, 'stack_block_2');
      });
      test('Cursor on incompatible block', function() {
        this.workspace.getCursor().setCurNode(
            Blockly.ASTNode.createBlockNode(
                this.row_block_1));
        chai.assert.isFalse(Blockly.navigation.modify_());
        chai.assert.isNull(this.stack_block_1.getPreviousBlock());
      });
    });

    suite('Marker on value input', function() {
      setup(function() {
        this.workspace.getMarker().setCurNode(
            Blockly.ASTNode.createConnectionNode(
                this.row_block_1.inputList[0].connection));
      });
      test('Cursor on compatible connection', function() {
        this.workspace.getCursor().setCurNode(
            Blockly.ASTNode.createConnectionNode(
                this.row_block_2.outputConnection));
        chai.assert.isTrue(Blockly.navigation.modify_());
        chai.assert.equal(this.row_block_2.getParent().id, 'row_block_1');
      });
      test('Cursor on incompatible connection', function() {
        this.workspace.getCursor().setCurNode(
            Blockly.ASTNode.createConnectionNode(
                this.row_block_2.inputList[0].connection));
        // Connect method will try to find a way to connect blocks with
        // incompatible types.
        chai.assert.isTrue(Blockly.navigation.modify_());
        chai.assert.equal(this.row_block_1.inputList[0].connection.targetBlock(),
            this.row_block_2);
      });
      test('Cursor on really incompatible connection', function() {
        this.workspace.getCursor().setCurNode(
            Blockly.ASTNode.createConnectionNode(
                this.stack_block_1.previousConnection));
        chai.assert.isFalse(Blockly.navigation.modify_());
      });
      test('Cursor on block', function() {
        this.workspace.getCursor().setCurNode(
            Blockly.ASTNode.createBlockNode(
                this.row_block_2));
        chai.assert.isTrue(Blockly.navigation.modify_());
        chai.assert.equal(this.row_block_2.getParent().id, 'row_block_1');
      });
    });

    suite('Marked Statement input', function() {
      setup(function() {
        this.statement_block_1.inputList[0].connection.connect(
            this.stack_block_1.previousConnection);
        this.stack_block_1.nextConnection.connect(this.stack_block_2.previousConnection);
        this.workspace.getMarker().setCurNode(
            Blockly.ASTNode.createInputNode(
                this.statement_block_1.inputList[0]));
      });
      test('Cursor on block inside statement', function() {
        this.workspace.getCursor().setCurNode(
            Blockly.ASTNode.createConnectionNode(
                this.stack_block_2.previousConnection));
        chai.assert.isTrue(Blockly.navigation.modify_());
        chai.assert.equal(this.stack_block_2.previousConnection.targetBlock(),
            this.statement_block_1);
      });
      test('Cursor on stack', function() {
        this.workspace.getCursor().setCurNode(
            Blockly.ASTNode.createStackNode(
                this.statement_block_2));
        chai.assert.isTrue(Blockly.navigation.modify_());
        chai.assert.equal(this.statement_block_2.getParent().id, 'statement_block_1');
      });
      test('Cursor on incompatible type', function() {
        this.workspace.getCursor().setCurNode(
            Blockly.ASTNode.createConnectionNode(
                this.row_block_1.outputConnection));
        chai.assert.isFalse(Blockly.navigation.modify_());
        chai.assert.equal(this.row_block_1.getParent(), null);
      });

    });

    suite('Marker on output', function() {
      setup(function() {
        this.workspace.getMarker().setCurNode(
            Blockly.ASTNode.createConnectionNode(
                this.row_block_1.outputConnection));
      });
      test('Cursor on compatible connection', function() {
        this.workspace.getCursor().setCurNode(
            Blockly.ASTNode.createConnectionNode(
                this.row_block_2.inputList[0].connection));
        chai.assert.isTrue(Blockly.navigation.modify_());
        chai.assert.equal(this.row_block_1.getParent().id, 'row_block_2');
      });
      test('Cursor on incompatible connection', function() {
        this.workspace.getCursor().setCurNode(
            Blockly.ASTNode.createConnectionNode(
                this.row_block_2.outputConnection));
        chai.assert.isFalse(Blockly.navigation.modify_());
      });
      test('Cursor on really incompatible connection', function() {
        this.workspace.getCursor().setCurNode(
            Blockly.ASTNode.createConnectionNode(
                this.stack_block_1.previousConnection));
        chai.assert.isFalse(Blockly.navigation.modify_());
      });
      test('Cursor on block', function() {
        this.workspace.getCursor().setCurNode(
            Blockly.ASTNode.createBlockNode(
                this.row_block_2));
        chai.assert.isTrue(Blockly.navigation.modify_());
        chai.assert.equal(this.row_block_1.getParent().id, 'row_block_2');
      });
    });
  });


  suite('Marked Workspace', function() {
    setup(function() {
      this.workspace.getMarker().setCurNode(
          Blockly.ASTNode.createWorkspaceNode(
              this.workspace, new Blockly.utils.Coordinate(100, 200)));
    });
    test('Cursor on row block', function() {
      this.workspace.getCursor().setCurNode(
          Blockly.ASTNode.createBlockNode(
              this.row_block_1));
      chai.assert.isTrue(Blockly.navigation.modify_());
      var pos = this.row_block_1.getRelativeToSurfaceXY();
      chai.assert.equal(100, pos.x);
      chai.assert.equal(200, pos.y);
    });

    test('Cursor on output connection', function() {
      this.workspace.getCursor().setCurNode(
          Blockly.ASTNode.createConnectionNode(
              this.row_block_1.outputConnection));
      chai.assert.isTrue(Blockly.navigation.modify_());
      var pos = this.row_block_1.getRelativeToSurfaceXY();
      chai.assert.equal(100, pos.x);
      chai.assert.equal(200, pos.y);
    });

    test('Cursor on previous connection', function() {
      this.workspace.getCursor().setCurNode(
          Blockly.ASTNode.createConnectionNode(
              this.stack_block_1.previousConnection));
      chai.assert.isTrue(Blockly.navigation.modify_());
      var pos = this.stack_block_1.getRelativeToSurfaceXY();
      chai.assert.equal(100, pos.x);
      chai.assert.equal(200, pos.y);
    });

    test('Cursor on input connection', function() {
      this.workspace.getCursor().setCurNode(
          Blockly.ASTNode.createConnectionNode(
              this.row_block_1.inputList[0].connection));
      // Move the source block to the marked location on the workspace.
      chai.assert.isTrue(Blockly.navigation.modify_());
    });

    test('Cursor on next connection', function() {
      this.workspace.getCursor().setCurNode(
          Blockly.ASTNode.createConnectionNode(
              this.stack_block_1.nextConnection));
      // Move the source block to the marked location on the workspace.
      chai.assert.isTrue(Blockly.navigation.modify_());
    });

    test('Cursor on child block (row)', function() {
      this.row_block_1.inputList[0].connection.connect(
          this.row_block_2.outputConnection);

      this.workspace.getCursor().setCurNode(
          Blockly.ASTNode.createBlockNode(
              this.row_block_2));

      chai.assert.isTrue(Blockly.navigation.modify_());
      chai.assert.isNull(this.row_block_2.getParent());
      var pos = this.row_block_2.getRelativeToSurfaceXY();
      chai.assert.equal(100, pos.x);
      chai.assert.equal(200, pos.y);
    });

    test('Cursor on child block (stack)', function() {
      this.stack_block_1.nextConnection.connect(
          this.stack_block_2.previousConnection);

      this.workspace.getCursor().setCurNode(
          Blockly.ASTNode.createBlockNode(
              this.stack_block_2));

      chai.assert.isTrue(Blockly.navigation.modify_());
      chai.assert.isNull(this.stack_block_2.getParent());
      var pos = this.stack_block_2.getRelativeToSurfaceXY();
      chai.assert.equal(100, pos.x);
      chai.assert.equal(200, pos.y);
    });

    test('Cursor on workspace', function() {
      this.workspace.getCursor().setCurNode(
          Blockly.ASTNode.createWorkspaceNode(
              this.workspace, new Blockly.utils.Coordinate(100, 100)));
      chai.assert.isFalse(Blockly.navigation.modify_());
    });
  });

  suite('Marked Block', function() {
    // TODO: Decide whether it ever makes sense to mark a block, and what to do
    // if so.  For now all of these attempted modifications will fail.
    suite('Marked any block', function() {
      // These tests are using a stack block, but do not depend on the type of
      // the block.
      setup(function() {
        this.workspace.getMarker().setCurNode(
            Blockly.ASTNode.createBlockNode(
                this.stack_block_1));
      });
      test('Cursor on workspace', function() {
        this.workspace.getCursor().setCurNode(
            Blockly.ASTNode.createWorkspaceNode(
                this.workspace, new Blockly.utils.Coordinate(100, 100)));
        chai.assert.isFalse(Blockly.navigation.modify_());

      });
    });
    suite('Marked stack block', function() {
      setup(function() {
        this.workspace.getMarker().setCurNode(
            Blockly.ASTNode.createBlockNode(
                this.stack_block_1));
      });
      test('Cursor on row block', function() {
        this.workspace.getCursor().setCurNode(
            Blockly.ASTNode.createBlockNode(
                this.row_block_1));
        chai.assert.isFalse(Blockly.navigation.modify_());
      });
      test('Cursor on stack block', function() {
        this.workspace.getCursor().setCurNode(
            Blockly.ASTNode.createBlockNode(
                this.stack_block_1));
        chai.assert.isFalse(Blockly.navigation.modify_());
      });
      test('Cursor on next connection', function() {
        this.workspace.getCursor().setCurNode(
            Blockly.ASTNode.createConnectionNode(
                this.stack_block_2.nextConnection));
        chai.assert.isFalse(Blockly.navigation.modify_());
      });
      test('Cursor on previous connection', function() {
        this.workspace.getCursor().setCurNode(
            Blockly.ASTNode.createConnectionNode(
                this.stack_block_2.previousConnection));
        chai.assert.isFalse(Blockly.navigation.modify_());
      });
    });
    suite('Marked row block', function() {
      setup(function() {
        this.workspace.getMarker().setCurNode(
            Blockly.ASTNode.createBlockNode(
                this.row_block_1));
      });
      test('Cursor on stack block', function() {
        this.workspace.getCursor().setCurNode(
            Blockly.ASTNode.createBlockNode(
                this.stack_block_1));
        chai.assert.isFalse(Blockly.navigation.modify_());
      });
      test('Cursor on row block', function() {
        this.workspace.getCursor().setCurNode(
            Blockly.ASTNode.createBlockNode(
                this.row_block_1));
        chai.assert.isFalse(Blockly.navigation.modify_());
      });
      test('Cursor on value input connection', function() {
        this.workspace.getCursor().setCurNode(
            Blockly.ASTNode.createConnectionNode(
                this.row_block_2.inputList[0].connection));
        chai.assert.isFalse(Blockly.navigation.modify_());
      });
      test('Cursor on output connection', function() {
        this.workspace.getCursor().setCurNode(
            Blockly.ASTNode.createConnectionNode(
                this.row_block_2.outputConnection));
        chai.assert.isFalse(Blockly.navigation.modify_());
      });
    });
  });
});
