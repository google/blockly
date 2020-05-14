/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

suite('Connection', function() {
  setup(function() {
    sharedTestSetup.call(this);
    this.workspace = sinon.createStubInstance(Blockly.Workspace);
    this.workspace.connectionChecker = new Blockly.ConnectionChecker();
    this.createConnection = function(type) {
      var block = {
        workspace: this.workspace,
        isShadow: function() { return false; }
      };
      var connection = new Blockly.Connection(block, type);
      return connection;
    };
  });
  teardown(function() {
    sharedTestTeardown.call(this);
  });
  test('Deprecated - canConnectWithReason passes', function() {
    var deprecateWarnSpy = createDeprecationWarningStub();
    var conn1 = this.createConnection(Blockly.PREVIOUS_STATEMENT);
    var conn2 = this.createConnection(Blockly.NEXT_STATEMENT);
    chai.assert.equal(conn1.canConnectWithReason(conn2),
        Blockly.Connection.CAN_CONNECT);
    assertSingleDeprecationWarningCall(deprecateWarnSpy,
        'Connection.prototype.canConnectWithReason');
  });
  test('Deprecated - canConnectWithReason fails', function() {
    var deprecateWarnSpy = createDeprecationWarningStub();
    var conn1 = this.createConnection(Blockly.PREVIOUS_STATEMENT);
    var conn2 = this.createConnection(Blockly.OUTPUT_VALUE);
    chai.assert.equal(conn1.canConnectWithReason(conn2),
        Blockly.Connection.REASON_WRONG_TYPE);
    assertSingleDeprecationWarningCall(deprecateWarnSpy,
        'Connection.prototype.canConnectWithReason');
  });
  test('Deprecated - checkConnection passes', function() {
    var deprecateWarnSpy = createDeprecationWarningStub();
    var conn1 = this.createConnection(Blockly.PREVIOUS_STATEMENT);
    var conn2 = this.createConnection(Blockly.NEXT_STATEMENT);
    chai.assert.doesNotThrow(function() {
      conn1.checkConnection(conn2);
    });
    assertSingleDeprecationWarningCall(deprecateWarnSpy,
        'Connection.prototype.checkConnection');
  });
  test('Deprecated - checkConnection fails', function() {
    var deprecateWarnSpy = createDeprecationWarningStub();
    var conn1 = this.createConnection(Blockly.PREVIOUS_STATEMENT);
    var conn2 = this.createConnection(Blockly.OUTPUT_VALUE);
    chai.assert.throws(function() {
      conn1.checkConnection(conn2);
    });
    assertSingleDeprecationWarningCall(deprecateWarnSpy,
        'Connection.prototype.checkConnection');
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
