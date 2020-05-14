/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

suite('Connections', function() {
  suite('Can Connect With Reason', function() {
    test('Target Null', function() {
      var connection = new Blockly.Connection({}, Blockly.INPUT_VALUE);
      chai.assert.equal(connection.canConnectWithReason(null),
          Blockly.Connection.REASON_TARGET_NULL);
    });
    test('Target Self', function() {
      var block = {workspace: 1};
      var connection1 = new Blockly.Connection(block, Blockly.INPUT_VALUE);
      var connection2 = new Blockly.Connection(block, Blockly.OUTPUT_VALUE);

      chai.assert.equal(connection1.canConnectWithReason(connection2),
          Blockly.Connection.REASON_SELF_CONNECTION);
    });
    test('Different Workspaces', function() {
      var connection1 = new Blockly.Connection(
          {workspace: 1}, Blockly.INPUT_VALUE);
      var connection2 = new Blockly.Connection(
          {workspace: 2}, Blockly.OUTPUT_VALUE);

      chai.assert.equal(connection1.canConnectWithReason(connection2),
          Blockly.Connection.REASON_DIFFERENT_WORKSPACES);
    });
    suite('Types', function() {
      setup(function() {
        // We have to declare each separately so that the connections belong
        // on different blocks.
        var prevBlock = { isShadow: function() {}};
        var nextBlock = { isShadow: function() {}};
        var outBlock = { isShadow: function() {}};
        var inBlock = { isShadow: function() {}};
        this.previous = new Blockly.Connection(
            prevBlock, Blockly.PREVIOUS_STATEMENT);
        this.next = new Blockly.Connection(
            nextBlock, Blockly.NEXT_STATEMENT);
        this.output = new Blockly.Connection(
            outBlock, Blockly.OUTPUT_VALUE);
        this.input = new Blockly.Connection(
            inBlock, Blockly.INPUT_VALUE);
      });
      test('Previous, Next', function() {
        chai.assert.equal(this.previous.canConnectWithReason(this.next),
            Blockly.Connection.CAN_CONNECT);
      });
      test('Previous, Output', function() {
        chai.assert.equal(this.previous.canConnectWithReason(this.output),
            Blockly.Connection.REASON_WRONG_TYPE);
      });
      test('Previous, Input', function() {
        chai.assert.equal(this.previous.canConnectWithReason(this.input),
            Blockly.Connection.REASON_WRONG_TYPE);
      });
      test('Next, Previous', function() {
        chai.assert.equal(this.next.canConnectWithReason(this.previous),
            Blockly.Connection.CAN_CONNECT);
      });
      test('Next, Output', function() {
        chai.assert.equal(this.next.canConnectWithReason(this.output),
            Blockly.Connection.REASON_WRONG_TYPE);
      });
      test('Next, Input', function() {
        chai.assert.equal(this.next.canConnectWithReason(this.input),
            Blockly.Connection.REASON_WRONG_TYPE);
      });
      test('Output, Previous', function() {
        chai.assert.equal(this.output.canConnectWithReason(this.previous),
            Blockly.Connection.REASON_WRONG_TYPE);
      });
      test('Output, Next', function() {
        chai.assert.equal(this.output.canConnectWithReason(this.next),
            Blockly.Connection.REASON_WRONG_TYPE);
      });
      test('Output, Input', function() {
        chai.assert.equal(this.output.canConnectWithReason(this.input),
            Blockly.Connection.CAN_CONNECT);
      });
      test('Input, Previous', function() {
        chai.assert.equal(this.input.canConnectWithReason(this.previous),
            Blockly.Connection.REASON_WRONG_TYPE);
      });
      test('Input, Next', function() {
        chai.assert.equal(this.input.canConnectWithReason(this.next),
            Blockly.Connection.REASON_WRONG_TYPE);
      });
      test('Input, Output', function() {
        chai.assert.equal(this.input.canConnectWithReason(this.output),
            Blockly.Connection.CAN_CONNECT);
      });
    });
    suite('Shadows', function() {
      test('Previous Shadow', function() {
        var prevBlock = { isShadow: function() { return true; }};
        var nextBlock = { isShadow: function() { return false; }};
        var prev = new Blockly.Connection(prevBlock, Blockly.PREVIOUS_STATEMENT);
        var next = new Blockly.Connection(nextBlock, Blockly.NEXT_STATEMENT);

        chai.assert.equal(prev.canConnectWithReason(next),
            Blockly.Connection.CAN_CONNECT);
      });
      test('Next Shadow', function() {
        var prevBlock = { isShadow: function() { return false; }};
        var nextBlock = { isShadow: function() { return true; }};
        var prev = new Blockly.Connection(prevBlock, Blockly.PREVIOUS_STATEMENT);
        var next = new Blockly.Connection(nextBlock, Blockly.NEXT_STATEMENT);

        chai.assert.equal(prev.canConnectWithReason(next),
            Blockly.Connection.REASON_SHADOW_PARENT);
      });
      test('Prev and Next Shadow', function() {
        var prevBlock = { isShadow: function() { return true; }};
        var nextBlock = { isShadow: function() { return true; }};
        var prev = new Blockly.Connection(prevBlock, Blockly.PREVIOUS_STATEMENT);
        var next = new Blockly.Connection(nextBlock, Blockly.NEXT_STATEMENT);

        chai.assert.equal(prev.canConnectWithReason(next),
            Blockly.Connection.CAN_CONNECT);
      });
      test('Output Shadow', function() {
        var outBlock = { isShadow: function() { return true; }};
        var inBlock = { isShadow: function() { return false; }};
        var outCon = new Blockly.Connection(outBlock, Blockly.OUTPUT_VALUE);
        var inCon = new Blockly.Connection(inBlock, Blockly.INPUT_VALUE);

        chai.assert.equal(outCon.canConnectWithReason(inCon),
            Blockly.Connection.CAN_CONNECT);
      });
      test('Input Shadow', function() {
        var outBlock = { isShadow: function() { return false; }};
        var inBlock = { isShadow: function() { return true; }};
        var outCon = new Blockly.Connection(outBlock, Blockly.OUTPUT_VALUE);
        var inCon = new Blockly.Connection(inBlock, Blockly.INPUT_VALUE);

        chai.assert.equal(outCon.canConnectWithReason(inCon),
            Blockly.Connection.REASON_SHADOW_PARENT);
      });
      test('Output and Input Shadow', function() {
        var outBlock = { isShadow: function() { return true; }};
        var inBlock = { isShadow: function() { return true; }};
        var outCon = new Blockly.Connection(outBlock, Blockly.OUTPUT_VALUE);
        var inCon = new Blockly.Connection(inBlock, Blockly.INPUT_VALUE);

        chai.assert.equal(outCon.canConnectWithReason(inCon),
            Blockly.Connection.CAN_CONNECT);
      });
    });
  });
  suite('Check Types', function() {
    setup(function() {
      this.con1 = new Blockly.Connection({}, Blockly.PREVIOUS_STATEMENT);
      this.con2 = new Blockly.Connection({}, Blockly.NEXT_STATEMENT);
    });
    test('No Types', function() {
      chai.assert.isTrue(this.con1.checkType((this.con2)));
    });
    test('Same Type', function() {
      this.con1.setCheck('type1');
      this.con2.setCheck('type1');
      chai.assert.isTrue(this.con1.checkType((this.con2)));
    });
    test('Same Types', function() {
      this.con1.setCheck(['type1', 'type2']);
      this.con2.setCheck(['type1', 'type2']);
      chai.assert.isTrue(this.con1.checkType((this.con2)));
    });
    test('Single Same Type', function() {
      this.con1.setCheck(['type1', 'type2']);
      this.con2.setCheck(['type1', 'type3']);
      chai.assert.isTrue(this.con1.checkType((this.con2)));
    });
    test('One Typed, One Promiscuous', function() {
      this.con1.setCheck('type1');
      chai.assert.isTrue(this.con1.checkType((this.con2)));
    });
    test('No Compatible Types', function() {
      this.con1.setCheck('type1');
      this.con2.setCheck('type2');
      chai.assert.isFalse(this.con1.checkType((this.con2)));
    });
  });
  suite('Set Shadow Dom', function() {
    setup(function() {
      Blockly.defineBlocksWithJsonArray([
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

      this.runHeadlessAndRendered = function(func, context) {
        var workspace = new Blockly.Workspace();
        func.call(context, workspace);
        workspace.clear();
        workspace.dispose();

        var workspace = Blockly.inject('blocklyDiv');
        func.call(context, workspace);
        workspace.clear();
        workspace.dispose();
      };
    });
    teardown(function() {
      delete this.runHeadlessAndRendered;
      delete Blockly.Blocks['stack_block'];
      delete Blockly.Blocks['row_block'];
      delete Blockly.Blocks['statement_block'];
    });
    suite('Add - No Block Connected', function() {
      setup(function() {
        // These are defined separately in each suite.
        this.createRowBlock = function(workspace) {
          var block = Blockly.Xml.domToBlock(Blockly.Xml.textToDom(
              '<block type="row_block"/>'
          ), workspace);
          return block;
        };

        this.createStatementBlock = function(workspace) {
          var block = Blockly.Xml.domToBlock(Blockly.Xml.textToDom(
              '<block type="statement_block"/>'
          ), workspace);
          return block;
        };

        this.createStackBlock = function(workspace) {
          var block = Blockly.Xml.domToBlock(Blockly.Xml.textToDom(
              '<block type="stack_block"/>'
          ), workspace);
          return block;
        };
      });
      teardown(function() {
        delete this.createRowBlock;
        delete this.createStatementBlock;
        delete this.createStackBlock;
      });
      test('Value', function() {
        var func = function(workspace) {
          var parent = this.createRowBlock(workspace);
          var xml = Blockly.Xml.textToDom(
              '<shadow type="row_block"/>'
          );
          parent.getInput('INPUT').connection.setShadowDom(xml);

          var target = parent.getInputTargetBlock('INPUT');
          chai.assert.isNotNull(target);
          chai.assert.isTrue(target.isShadow());
        };
        this.runHeadlessAndRendered(func, this);
      });
      test('Multiple Value', function() {
        var func = function(workspace) {
          var parent = this.createRowBlock(workspace);
          var xml = Blockly.Xml.textToDom(
              '<shadow type="row_block">' +
              '  <value name="INPUT">' +
              '    <shadow type="row_block"/>' +
              '  </value>' +
              '</shadow>'
          );
          parent.getInput('INPUT').connection.setShadowDom(xml);

          var target = parent.getInputTargetBlock('INPUT');
          chai.assert.isNotNull(target);
          chai.assert.isTrue(target.isShadow());
          var target2 = target.getInputTargetBlock('INPUT');
          chai.assert.isNotNull(target2);
          chai.assert.isTrue(target2.isShadow());
        };
        this.runHeadlessAndRendered(func, this);
      });
      test('Statement', function() {
        var func = function(workspace) {
          var parent = this.createStatementBlock(workspace);
          var xml = Blockly.Xml.textToDom(
              '<shadow type="statement_block"/>'
          );
          parent.getInput('STATEMENT').connection.setShadowDom(xml);

          var target = parent.getInputTargetBlock('STATEMENT');
          chai.assert.isNotNull(target);
          chai.assert.isTrue(target.isShadow());
        };
        this.runHeadlessAndRendered(func, this);
      });
      test('Multiple Statement', function() {
        var func = function(workspace) {
          var parent = this.createStatementBlock(workspace);
          var xml = Blockly.Xml.textToDom(
              '<shadow type="statement_block">' +
              '  <statement name="STATEMENT">' +
              '    <shadow type="statement_block"/>' +
              '  </statement>' +
              '</shadow>'
          );
          parent.getInput('STATEMENT').connection.setShadowDom(xml);

          var target = parent.getInputTargetBlock('STATEMENT');
          chai.assert.isNotNull(target);
          chai.assert.isTrue(target.isShadow());
          var target2 = target.getInputTargetBlock('STATEMENT');
          chai.assert.isNotNull(target2);
          chai.assert.isTrue(target2.isShadow());
        };
        this.runHeadlessAndRendered(func, this);
      });
      test('Next', function() {
        var func = function(workspace) {
          var parent = this.createStackBlock(workspace);
          var xml = Blockly.Xml.textToDom(
              '<shadow type="stack_block"/>'
          );
          parent.nextConnection.setShadowDom(xml);

          var target = parent.getNextBlock();
          chai.assert.isNotNull(target);
          chai.assert.isTrue(target.isShadow());
        };
        this.runHeadlessAndRendered(func, this);
      });
      test('Multiple Next', function() {
        var func = function(workspace) {
          var parent = this.createStackBlock(workspace);
          var xml = Blockly.Xml.textToDom(
              '<shadow type="stack_block">' +
              '  <next>' +
              '    <shadow type="stack_block"/>' +
              '  </next>' +
              '</shadow>'
          );
          parent.nextConnection.setShadowDom(xml);

          var target = parent.getNextBlock();
          chai.assert.isNotNull(target);
          chai.assert.isTrue(target.isShadow());
          var target2 = target.getNextBlock();
          chai.assert.isNotNull(target2);
          chai.assert.isTrue(target2.isShadow());
        };
        this.runHeadlessAndRendered(func, this);
      });
    });
    suite('Add - With Block Connected', function() {
      setup(function() {
        // These are defined separately in each suite.
        this.createRowBlocks = function(workspace) {
          var block = Blockly.Xml.domToBlock(Blockly.Xml.textToDom(
              '<block type="row_block">' +
              '  <value name="INPUT">' +
              '    <block type="row_block"/>' +
              '  </value>' +
              '</block>'
          ), workspace);
          return block;
        };

        this.createStatementBlocks = function(workspace) {
          var block = Blockly.Xml.domToBlock(Blockly.Xml.textToDom(
              '<block type="statement_block">' +
              '  <statement name="STATEMENT">' +
              '    <block type="statement_block"/>' +
              '  </statement>' +
              '</block>'
          ), workspace);
          return block;
        };

        this.createStackBlocks = function(workspace) {
          var block = Blockly.Xml.domToBlock(Blockly.Xml.textToDom(
              '<block type="stack_block">' +
              '  <next>' +
              '    <block type="stack_block"/>' +
              '  </next>' +
              '</block>'
          ), workspace);
          return block;
        };
      });
      teardown(function() {
        delete this.createRowBlocks;
        delete this.createStatementBlock;
        delete this.createStackBlock;
      });
      test('Value', function() {
        var func = function(workspace) {
          var parent = this.createRowBlocks(workspace);
          var xml = Blockly.Xml.textToDom(
              '<shadow type="row_block"/>'
          );
          parent.getInput('INPUT').connection.setShadowDom(xml);

          var target = parent.getInputTargetBlock('INPUT');
          chai.assert.isNotNull(target);
          chai.assert.isFalse(target.isShadow());

          parent.getInput('INPUT').connection.disconnect();

          var target = parent.getInputTargetBlock('INPUT');
          chai.assert.isNotNull(target);
          chai.assert.isTrue(target.isShadow());
        };
        this.runHeadlessAndRendered(func, this);
      });
      test('Multiple Value', function() {
        var func = function(workspace) {
          var parent = this.createRowBlocks(workspace);
          var xml = Blockly.Xml.textToDom(
              '<shadow type="row_block">' +
              '  <value name="INPUT">' +
              '    <shadow type="row_block"/>' +
              '  </value>' +
              '</shadow>'
          );
          parent.getInput('INPUT').connection.setShadowDom(xml);

          var target = parent.getInputTargetBlock('INPUT');
          chai.assert.isNotNull(target);
          chai.assert.isFalse(target.isShadow());
          var target2 = target.getInputTargetBlock('INPUT');
          chai.assert.isNull(target2);

          parent.getInput('INPUT').connection.disconnect();

          var target = parent.getInputTargetBlock('INPUT');
          chai.assert.isNotNull(target);
          chai.assert.isTrue(target.isShadow());
          var target2 = target.getInputTargetBlock('INPUT');
          chai.assert.isNotNull(target2);
          chai.assert.isTrue(target2.isShadow());
        };
        this.runHeadlessAndRendered(func, this);
      });
      test('Statement', function() {
        var func = function(workspace) {
          var parent = this.createStatementBlocks(workspace);
          var xml = Blockly.Xml.textToDom(
              '<shadow type="statement_block"/>'
          );
          parent.getInput('STATEMENT').connection.setShadowDom(xml);

          var target = parent.getInputTargetBlock('STATEMENT');
          chai.assert.isNotNull(target);
          chai.assert.isFalse(target.isShadow());

          parent.getInput('STATEMENT').connection.disconnect();

          var target = parent.getInputTargetBlock('STATEMENT');
          chai.assert.isNotNull(target);
          chai.assert.isTrue(target.isShadow());
        };
        this.runHeadlessAndRendered(func, this);
      });
      test('Multiple Statement', function() {
        var func = function(workspace) {
          var parent = this.createStatementBlocks(workspace);
          var xml = Blockly.Xml.textToDom(
              '<shadow type="statement_block">' +
              '  <statement name="STATEMENT">' +
              '    <shadow type="statement_block"/>' +
              '  </statement>' +
              '</shadow>'
          );
          parent.getInput('STATEMENT').connection.setShadowDom(xml);

          var target = parent.getInputTargetBlock('STATEMENT');
          chai.assert.isNotNull(target);
          chai.assert.isFalse(target.isShadow());
          var target2 = target.getInputTargetBlock('STATEMENT');
          chai.assert.isNull(target2);

          parent.getInput('STATEMENT').connection.disconnect();

          var target = parent.getInputTargetBlock('STATEMENT');
          chai.assert.isNotNull(target);
          chai.assert.isTrue(target.isShadow());
          var target2 = target.getInputTargetBlock('STATEMENT');
          chai.assert.isNotNull(target2);
          chai.assert.isTrue(target2.isShadow());
        };
        this.runHeadlessAndRendered(func, this);
      });
      test('Next', function() {
        var func = function(workspace) {
          var parent = this.createStackBlocks(workspace);
          var xml = Blockly.Xml.textToDom(
              '<shadow type="stack_block"/>'
          );
          parent.nextConnection.setShadowDom(xml);

          var target = parent.getNextBlock();
          chai.assert.isNotNull(target);
          chai.assert.isFalse(target.isShadow());

          parent.nextConnection.disconnect();

          var target = parent.getNextBlock();
          chai.assert.isNotNull(target);
          chai.assert.isTrue(target.isShadow());
        };
        this.runHeadlessAndRendered(func, this);
      });
      test('Multiple Next', function() {
        var func = function(workspace) {
          var parent = this.createStackBlocks(workspace);
          var xml = Blockly.Xml.textToDom(
              '<shadow type="stack_block">' +
              '  <next>' +
              '    <shadow type="stack_block"/>' +
              '  </next>' +
              '</shadow>'
          );
          parent.nextConnection.setShadowDom(xml);

          var target = parent.getNextBlock();
          chai.assert.isNotNull(target);
          chai.assert.isFalse(target.isShadow());
          var target2 = target.getNextBlock();
          chai.assert.isNull(target2);

          parent.nextConnection.disconnect();

          var target = parent.getNextBlock();
          chai.assert.isNotNull(target);
          chai.assert.isTrue(target.isShadow());
          var target2 = target.getNextBlock();
          chai.assert.isNotNull(target2);
          chai.assert.isTrue(target2.isShadow());
        };
        this.runHeadlessAndRendered(func, this);
      });
    });
    suite('Add - With Shadow Connected', function() {
      setup(function() {
        // These are defined separately in each suite.
        this.createRowBlock = function(workspace) {
          var block = Blockly.Xml.domToBlock(Blockly.Xml.textToDom(
              '<block type="row_block"/>'
          ), workspace);
          return block;
        };

        this.createStatementBlock = function(workspace) {
          var block = Blockly.Xml.domToBlock(Blockly.Xml.textToDom(
              '<block type="statement_block"/>'
          ), workspace);
          return block;
        };

        this.createStackBlock = function(workspace) {
          var block = Blockly.Xml.domToBlock(Blockly.Xml.textToDom(
              '<block type="stack_block"/>'
          ), workspace);
          return block;
        };
      });
      teardown(function() {
        delete this.createRowBlock;
        delete this.createStatementBlock;
        delete this.createStackBlock;
      });
      test('Value', function() {
        var func = function(workspace) {
          var parent = this.createRowBlock(workspace);
          var xml = Blockly.Xml.textToDom(
              '<shadow type="row_block" id="1"/>'
          );
          parent.getInput('INPUT').connection.setShadowDom(xml);

          var target = parent.getInputTargetBlock('INPUT');
          chai.assert.isNotNull(target);
          chai.assert.isTrue(target.isShadow());
          chai.assert.equal(target.id, '1');

          var xml = Blockly.Xml.textToDom(
              '<shadow type="row_block" id="2"/>'
          );
          parent.getInput('INPUT').connection.setShadowDom(xml);

          var target2 = parent.getInputTargetBlock('INPUT');
          chai.assert.isNotNull(target2);
          chai.assert.isTrue(target2.isShadow());
          chai.assert.equal(target2.id, '2');
        };
        this.runHeadlessAndRendered(func, this);
      });
      test('Multiple Value', function() {
        var func = function(workspace) {
          var parent = this.createRowBlock(workspace);
          var xml = Blockly.Xml.textToDom(
              '<shadow type="row_block" id="1">' +
              '  <value name="INPUT">' +
              '    <shadow type="row_block" id="a"/>' +
              '  </value>' +
              '</shadow>'
          );
          parent.getInput('INPUT').connection.setShadowDom(xml);

          var target = parent.getInputTargetBlock('INPUT');
          chai.assert.isNotNull(target);
          chai.assert.isTrue(target.isShadow());
          chai.assert.equal(target.id, '1');
          var target2 = target.getInputTargetBlock('INPUT');
          chai.assert.isNotNull(target2);
          chai.assert.isTrue(target2.isShadow());
          chai.assert.equal(target2.id, 'a');

          var xml = Blockly.Xml.textToDom(
              '<shadow type="row_block" id="2">' +
              '  <value name="INPUT">' +
              '    <shadow type="row_block" id="b"/>' +
              '  </value>' +
              '</shadow>'
          );
          parent.getInput('INPUT').connection.setShadowDom(xml);

          var target = parent.getInputTargetBlock('INPUT');
          chai.assert.isNotNull(target);
          chai.assert.isTrue(target.isShadow());
          chai.assert.equal(target.id, '2');
          var target2 = target.getInputTargetBlock('INPUT');
          chai.assert.isNotNull(target2);
          chai.assert.isTrue(target2.isShadow());
          chai.assert.equal(target2.id, 'b');
        };
        this.runHeadlessAndRendered(func, this);
      });
      test('Statement', function() {
        var func = function(workspace) {
          var parent = this.createStatementBlock(workspace);
          var xml = Blockly.Xml.textToDom(
              '<shadow type="statement_block" id="1"/>'
          );
          parent.getInput('STATEMENT').connection.setShadowDom(xml);

          var target = parent.getInputTargetBlock('STATEMENT');
          chai.assert.isNotNull(target);
          chai.assert.isTrue(target.isShadow());
          chai.assert.equal(target.id, '1');

          var xml = Blockly.Xml.textToDom(
              '<shadow type="statement_block" id="2"/>'
          );
          parent.getInput('STATEMENT').connection.setShadowDom(xml);

          var target = parent.getInputTargetBlock('STATEMENT');
          chai.assert.isNotNull(target);
          chai.assert.isTrue(target.isShadow());
          chai.assert.equal(target.id, '2');
        };
        this.runHeadlessAndRendered(func, this);
      });
      test('Multiple Statement', function() {
        var func = function(workspace) {
          var parent = this.createStatementBlock(workspace);
          var xml = Blockly.Xml.textToDom(
              '<shadow type="statement_block" id="1">' +
              '  <statement name="STATEMENT">' +
              '    <shadow type="statement_block" id="a"/>' +
              '  </statement>' +
              '</shadow>'
          );
          parent.getInput('STATEMENT').connection.setShadowDom(xml);

          var target = parent.getInputTargetBlock('STATEMENT');
          chai.assert.isNotNull(target);
          chai.assert.isTrue(target.isShadow());
          chai.assert.equal(target.id, '1');
          var target2 = target.getInputTargetBlock('STATEMENT');
          chai.assert.isNotNull(target2);
          chai.assert.isTrue(target2.isShadow());
          chai.assert.equal(target2.id, 'a');

          var xml = Blockly.Xml.textToDom(
              '<shadow type="statement_block" id="2">' +
              '  <statement name="STATEMENT">' +
              '    <shadow type="statement_block" id="b"/>' +
              '  </statement>' +
              '</shadow>'
          );
          parent.getInput('STATEMENT').connection.setShadowDom(xml);

          var target = parent.getInputTargetBlock('STATEMENT');
          chai.assert.isNotNull(target);
          chai.assert.isTrue(target.isShadow());
          chai.assert.equal(target.id, '2');
          var target2 = target.getInputTargetBlock('STATEMENT');
          chai.assert.isNotNull(target2);
          chai.assert.isTrue(target2.isShadow());
          chai.assert.equal(target2.id, 'b');
        };
        this.runHeadlessAndRendered(func, this);
      });
      test('Next', function() {
        var func = function(workspace) {
          var parent = this.createStackBlock(workspace);
          var xml = Blockly.Xml.textToDom(
              '<shadow type="stack_block" id="1"/>'
          );
          parent.nextConnection.setShadowDom(xml);

          var target = parent.getNextBlock();
          chai.assert.isNotNull(target);
          chai.assert.isTrue(target.isShadow());
          chai.assert.equal(target.id, '1');

          var xml = Blockly.Xml.textToDom(
              '<shadow type="stack_block" id="2"/>'
          );
          parent.nextConnection.setShadowDom(xml);

          var target = parent.getNextBlock();
          chai.assert.isNotNull(target);
          chai.assert.isTrue(target.isShadow());
          chai.assert.equal(target.id, '2');
        };
        this.runHeadlessAndRendered(func, this);
      });
      test('Multiple Next', function() {
        var func = function(workspace) {
          var parent = this.createStackBlock(workspace);
          var xml = Blockly.Xml.textToDom(
              '<shadow type="stack_block" id="1">' +
              '  <next>' +
              '    <shadow type="stack_block" id="a"/>' +
              '  </next>' +
              '</shadow>'
          );
          parent.nextConnection.setShadowDom(xml);

          var target = parent.getNextBlock();
          chai.assert.isNotNull(target);
          chai.assert.isTrue(target.isShadow());
          chai.assert.equal(target.id, '1');
          var target2 = target.getNextBlock();
          chai.assert.isNotNull(target2);
          chai.assert.isTrue(target2.isShadow());
          chai.assert.equal(target2.id, 'a');

          var xml = Blockly.Xml.textToDom(
              '<shadow type="stack_block" id="2">' +
              '  <next>' +
              '    <shadow type="stack_block" id="b"/>' +
              '  </next>' +
              '</shadow>'
          );
          parent.nextConnection.setShadowDom(xml);

          var target = parent.getNextBlock();
          chai.assert.isNotNull(target);
          chai.assert.isTrue(target.isShadow());
          chai.assert.equal(target.id, '2');
          var target2 = target.getNextBlock();
          chai.assert.isNotNull(target2);
          chai.assert.isTrue(target2.isShadow());
          chai.assert.equal(target2.id, 'b');
        };
        this.runHeadlessAndRendered(func, this);
      });
    });
    suite('Remove - No Block Connected', function() {
      setup(function() {
        // These are defined separately in each suite.
        this.createRowBlock = function(workspace) {
          var block = Blockly.Xml.domToBlock(Blockly.Xml.textToDom(
              '<block type="row_block">' +
              '  <value name="INPUT">' +
              '    <shadow type="row_block"/>' +
              '  </value>' +
              '</block>'
          ), workspace);
          return block;
        };

        this.createStatementBlock = function(workspace) {
          var block = Blockly.Xml.domToBlock(Blockly.Xml.textToDom(
              '<block type="statement_block">' +
              '  <statement name="STATEMENT">' +
              '    <shadow type="statement_block"/>' +
              '  </statement>' +
              '</block>'
          ), workspace);
          return block;
        };

        this.createStackBlock = function(workspace) {
          var block = Blockly.Xml.domToBlock(Blockly.Xml.textToDom(
              '<block type="stack_block">' +
              '  <next>' +
              '    <shadow type="stack_block"/>' +
              '  </next>' +
              '</block>'
          ), workspace);
          return block;
        };
      });
      teardown(function() {
        delete this.createRowBlock;
        delete this.createStatementBlock;
        delete this.createStackBlock;
      });
      test('Value', function() {
        var func = function(workspace) {
          var parent = this.createRowBlock(workspace);
          parent.getInput('INPUT').connection.setShadowDom(null);

          var target = parent.getInputTargetBlock('INPUT');
          chai.assert.isNull(target);
        };
        this.runHeadlessAndRendered(func, this);
      });
      test('Statement', function() {
        var func = function(workspace) {
          var parent = this.createStatementBlock(workspace);
          parent.getInput('STATEMENT').connection.setShadowDom(null);

          var target = parent.getInputTargetBlock('STATEMENT');
          chai.assert.isNull(target);
        };
        this.runHeadlessAndRendered(func, this);
      });
      test('Next', function() {
        var func = function(workspace) {
          var parent = this.createStackBlock(workspace);
          parent.nextConnection.setShadowDom(null);

          var target = parent.getNextBlock();
          chai.assert.isNull(target);
        };
        this.runHeadlessAndRendered(func, this);
      });
    });
    suite('Remove - Block Connected', function() {
      setup(function() {
        // These are defined separately in each suite.
        this.createRowBlock = function(workspace) {
          var block = Blockly.Xml.domToBlock(Blockly.Xml.textToDom(
              '<block type="row_block">' +
              '  <value name="INPUT">' +
              '    <shadow type="row_block"/>' +
              '    <block type="row_block"/>' +
              '  </value>' +
              '</block>'
          ), workspace);
          return block;
        };

        this.createStatementBlock = function(workspace) {
          var block = Blockly.Xml.domToBlock(Blockly.Xml.textToDom(
              '<block type="statement_block">' +
              '  <statement name="STATEMENT">' +
              '    <shadow type="statement_block"/>' +
              '    <block type="statement_block"/>' +
              '  </statement>' +
              '</block>'
          ), workspace);
          return block;
        };

        this.createStackBlock = function(workspace) {
          var block = Blockly.Xml.domToBlock(Blockly.Xml.textToDom(
              '<block type="stack_block">' +
              '  <next>' +
              '    <shadow type="stack_block"/>' +
              '    <block type="stack_block"/>' +
              '  </next>' +
              '</block>'
          ), workspace);
          return block;
        };
      });
      teardown(function() {
        delete this.createRowBlock;
        delete this.createStatementBlock;
        delete this.createStackBlock;
      });
      test('Value', function() {
        var func = function(workspace) {
          var parent = this.createRowBlock(workspace);
          parent.getInput('INPUT').connection.setShadowDom(null);

          var target = parent.getInputTargetBlock('INPUT');
          chai.assert.isNotNull(target);
          chai.assert.isFalse(target.isShadow());

          parent.getInput('INPUT').connection.disconnect();

          var target = parent.getInputTargetBlock('INPUT');
          chai.assert.isNull(target);
        };
        this.runHeadlessAndRendered(func, this);
      });
      test('Statement', function() {
        var func = function(workspace) {
          var parent = this.createStatementBlock(workspace);
          parent.getInput('STATEMENT').connection.setShadowDom(null);

          var target = parent.getInputTargetBlock('STATEMENT');
          chai.assert.isNotNull(target);
          chai.assert.isFalse(target.isShadow());

          parent.getInput('STATEMENT').connection.disconnect();

          var target = parent.getInputTargetBlock('STATEMENT');
          chai.assert.isNull(target);
        };
        this.runHeadlessAndRendered(func, this);
      });
      test('Next', function() {
        var func = function(workspace) {
          var parent = this.createStackBlock(workspace);
          parent.nextConnection.setShadowDom(null);

          var target = parent.getNextBlock();
          chai.assert.isNotNull(target);
          chai.assert.isFalse(target.isShadow());

          parent.nextConnection.disconnect();

          var target = parent.getNextBlock();
          chai.assert.isNull(target);
        };
        this.runHeadlessAndRendered(func, this);
      });
    });
    suite('Add - Connect & Disconnect - Remove', function() {
      setup(function() {
        // These are defined separately in each suite.
        this.createRowBlock = function(workspace) {
          var block = Blockly.Xml.domToBlock(Blockly.Xml.textToDom(
              '<block type="row_block"/>'
          ), workspace);
          return block;
        };

        this.createStatementBlock = function(workspace) {
          var block = Blockly.Xml.domToBlock(Blockly.Xml.textToDom(
              '<block type="statement_block"/>'
          ), workspace);
          return block;
        };

        this.createStackBlock = function(workspace) {
          var block = Blockly.Xml.domToBlock(Blockly.Xml.textToDom(
              '<block type="stack_block"/>'
          ), workspace);
          return block;
        };
      });
      teardown(function() {
        delete this.createRowBlock;
        delete this.createStatementBlock;
        delete this.createStackBlock;
      });
      test('Value', function() {
        var func = function(workspace) {
          var parent = this.createRowBlock(workspace);
          var xml = Blockly.Xml.textToDom(
              '<shadow type="row_block"/>'
          );
          parent.getInput('INPUT').connection.setShadowDom(xml);

          var target = parent.getInputTargetBlock('INPUT');
          chai.assert.isNotNull(target);
          chai.assert.isTrue(target.isShadow());

          var child = this.createRowBlock(workspace);
          parent.getInput('INPUT').connection.connect(child.outputConnection);

          var target = parent.getInputTargetBlock('INPUT');
          chai.assert.isNotNull(target);
          chai.assert.isFalse(target.isShadow());

          parent.getInput('INPUT').connection.disconnect();

          var target = parent.getInputTargetBlock('INPUT');
          chai.assert.isNotNull(target);
          chai.assert.isTrue(target.isShadow());

          parent.getInput('INPUT').connection.setShadowDom(null);

          var target = parent.getInputTargetBlock('INPUT');
          chai.assert.isNull(target);
        };
        this.runHeadlessAndRendered(func, this);
      });
      test('Multiple Value', function() {
        var func = function(workspace) {
          var parent = this.createRowBlock(workspace);
          var xml = Blockly.Xml.textToDom(
              '<shadow type="row_block">' +
              '  <value name="INPUT">' +
              '    <shadow type="row_block"/>' +
              '  </value>' +
              '</shadow>'
          );
          parent.getInput('INPUT').connection.setShadowDom(xml);

          var target = parent.getInputTargetBlock('INPUT');
          chai.assert.isNotNull(target);
          chai.assert.isTrue(target.isShadow());
          var target2 = target.getInputTargetBlock('INPUT');
          chai.assert.isNotNull(target2);
          chai.assert.isTrue(target2.isShadow());

          var child = this.createRowBlock(workspace);
          parent.getInput('INPUT').connection.connect(child.outputConnection);

          var target = parent.getInputTargetBlock('INPUT');
          chai.assert.isNotNull(target);
          chai.assert.isFalse(target.isShadow());

          parent.getInput('INPUT').connection.disconnect();

          var target = parent.getInputTargetBlock('INPUT');
          chai.assert.isNotNull(target);
          chai.assert.isTrue(target.isShadow());
          var target2 = target.getInputTargetBlock('INPUT');
          chai.assert.isNotNull(target2);
          chai.assert.isTrue(target2.isShadow());

          parent.getInput('INPUT').connection.setShadowDom(null);

          var target = parent.getInputTargetBlock('INPUT');
          chai.assert.isNull(target);
        };
        this.runHeadlessAndRendered(func, this);
      });
      test('Statement', function() {
        var func = function(workspace) {
          var parent = this.createStatementBlock(workspace);
          var xml = Blockly.Xml.textToDom(
              '<shadow type="statement_block"/>'
          );
          parent.getInput('STATEMENT').connection.setShadowDom(xml);

          var target = parent.getInputTargetBlock('STATEMENT');
          chai.assert.isNotNull(target);
          chai.assert.isTrue(target.isShadow());

          var child = this.createStatementBlock(workspace);
          parent.getInput('STATEMENT').connection
              .connect(child.previousConnection);

          var target = parent.getInputTargetBlock('STATEMENT');
          chai.assert.isNotNull(target);
          chai.assert.isFalse(target.isShadow());

          parent.getInput('STATEMENT').connection.disconnect();

          var target = parent.getInputTargetBlock('STATEMENT');
          chai.assert.isNotNull(target);
          chai.assert.isTrue(target.isShadow());

          parent.getInput('STATEMENT').connection.setShadowDom(null);

          var target = parent.getInputTargetBlock('STATEMENT');
          chai.assert.isNull(target);
        };
        this.runHeadlessAndRendered(func, this);
      });
      test('Multiple Statement', function() {
        var func = function(workspace) {
          var parent = this.createStatementBlock(workspace);
          var xml = Blockly.Xml.textToDom(
              '<shadow type="statement_block">' +
              '  <statement name="STATEMENT">' +
              '    <shadow type="statement_block"/>' +
              '  </statement>' +
              '</shadow>'
          );
          parent.getInput('STATEMENT').connection.setShadowDom(xml);

          var target = parent.getInputTargetBlock('STATEMENT');
          chai.assert.isNotNull(target);
          chai.assert.isTrue(target.isShadow());
          var target2 = target.getInputTargetBlock('STATEMENT');
          chai.assert.isNotNull(target2);
          chai.assert.isTrue(target2.isShadow());

          var child = this.createStatementBlock(workspace);
          parent.getInput('STATEMENT').connection
              .connect(child.previousConnection);

          var target = parent.getInputTargetBlock('STATEMENT');
          chai.assert.isNotNull(target);
          chai.assert.isFalse(target.isShadow());

          parent.getInput('STATEMENT').connection.disconnect();

          var target = parent.getInputTargetBlock('STATEMENT');
          chai.assert.isNotNull(target);
          chai.assert.isTrue(target.isShadow());
          var target2 = target.getInputTargetBlock('STATEMENT');
          chai.assert.isNotNull(target2);
          chai.assert.isTrue(target2.isShadow());

          parent.getInput('STATEMENT').connection.setShadowDom(null);

          var target = parent.getInputTargetBlock('STATEMENT');
          chai.assert.isNull(target);
        };
        this.runHeadlessAndRendered(func, this);
      });
      test('Next', function() {
        var func = function(workspace) {
          var parent = this.createStackBlock(workspace);
          var xml = Blockly.Xml.textToDom(
              '<shadow type="stack_block"/>'
          );
          parent.nextConnection.setShadowDom(xml);

          var target = parent.getNextBlock();
          chai.assert.isNotNull(target);
          chai.assert.isTrue(target.isShadow());

          var child = this.createStatementBlock(workspace);
          parent.nextConnection.connect(child.previousConnection);

          var target = parent.getNextBlock();
          chai.assert.isNotNull(target);
          chai.assert.isFalse(target.isShadow());

          parent.nextConnection.disconnect();

          var target = parent.getNextBlock();
          chai.assert.isNotNull(target);
          chai.assert.isTrue(target.isShadow());

          parent.nextConnection.setShadowDom(null);

          var target = parent.getNextBlock();
          chai.assert.isNull(target);
        };
        this.runHeadlessAndRendered(func, this);
      });
      test('Multiple Next', function() {
        var func = function(workspace) {
          var parent = this.createStackBlock(workspace);
          var xml = Blockly.Xml.textToDom(
              '<shadow type="stack_block">' +
              '  <next>' +
              '    <shadow type="stack_block"/>' +
              '  </next>' +
              '</shadow>'
          );
          parent.nextConnection.setShadowDom(xml);

          var target = parent.getNextBlock();
          chai.assert.isNotNull(target);
          chai.assert.isTrue(target.isShadow());
          var target2 = target.getNextBlock();
          chai.assert.isNotNull(target2);
          chai.assert.isTrue(target2.isShadow());

          var child = this.createStatementBlock(workspace);
          parent.nextConnection.connect(child.previousConnection);

          var target = parent.getNextBlock();
          chai.assert.isNotNull(target);
          chai.assert.isFalse(target.isShadow());

          parent.nextConnection.disconnect();

          var target = parent.getNextBlock();
          chai.assert.isNotNull(target);
          chai.assert.isTrue(target.isShadow());
          var target2 = target.getNextBlock();
          chai.assert.isNotNull(target2);
          chai.assert.isTrue(target2.isShadow());

          parent.nextConnection.setShadowDom(null);

          var target = parent.getNextBlock();
          chai.assert.isNull(target);
        };
        this.runHeadlessAndRendered(func, this);
      });
    });
  });
});
