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

    function assertBlockMatches(block, isShadow, opt_id) {
      chai.assert.equal(block.isShadow(), isShadow,
          `expected block ${block.id} to ${isShadow ? '' : 'not'} be a shadow`);
      if (opt_id) {
        chai.assert.equal(block.id, opt_id);
      }
    }

    function assertInputHasBlock(parent, inputName, isShadow, opt_name) {
      var block = parent.getInputTargetBlock(inputName);
      chai.assert.exists(block,
          `expected block ${opt_name || ''} to be attached to ${inputName}`);
      assertBlockMatches(block, isShadow, opt_name);
    }

    function assertNextHasBlock(parent, isShadow, opt_name) {
      var block = parent.getNextBlock();
      chai.assert.exists(block,
          `expected block ${opt_name || ''} to be attached to next connection`);
      assertBlockMatches(block, isShadow, opt_name);
    }

    function assertInputNotHasBlock(parent, inputName) {
      var block = parent.getInputTargetBlock(inputName);
      chai.assert.notExists(block,
          `expected block ${block && block.id} to not be attached to ${inputName}`);
    }

    function assertNextNotHasBlock(parent) {
      var block = parent.getNextBlock();
      chai.assert.notExists(block,
          `expected block ${block && block.id} to not be attached to next connection`);
    }

    var testSuites = [
      {
        title: 'Rendered',
        createWorkspace: () => {
          return Blockly.inject('blocklyDiv');
        },
      },
      {
        title: 'Headless',
        createWorkspace: () => {
          return new Blockly.Workspace();
        },
      }
    ];

    testSuites.forEach((testSuite) => {
      // Create a suite for each suite.
      suite(testSuite.title, function() {
        setup(function() {
          this.workspace = testSuite.createWorkspace();

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
        });

        teardown(function() {
          workspaceTeardown.call(this, this.workspace);
        });

        suite('Add - No Block Connected', function() {
          // These are defined separately in each suite.
          function createRowBlock(workspace) {
            var block = Blockly.Xml.domToBlock(Blockly.Xml.textToDom(
                '<block type="row_block"/>'
            ), workspace);
            return block;
          }

          function createStatementBlock(workspace) {
            var block = Blockly.Xml.domToBlock(Blockly.Xml.textToDom(
                '<block type="statement_block"/>'
            ), workspace);
            return block;
          }

          function createStackBlock(workspace) {
            var block = Blockly.Xml.domToBlock(Blockly.Xml.textToDom(
                '<block type="stack_block"/>'
            ), workspace);
            return block;
          }

          test('Value', function() {
            var parent = createRowBlock(this.workspace);
            var xml = Blockly.Xml.textToDom(
                '<shadow type="row_block"/>'
            );
            parent.getInput('INPUT').connection.setShadowDom(xml);
            assertInputHasBlock(parent, 'INPUT', true);
          });

          test('Multiple Value', function() {
            var parent = createRowBlock(this.workspace);
            var xml = Blockly.Xml.textToDom(
                '<shadow type="row_block">' +
                '  <value name="INPUT">' +
                '    <shadow type="row_block"/>' +
                '  </value>' +
                '</shadow>'
            );
            parent.getInput('INPUT').connection.setShadowDom(xml);
            assertInputHasBlock(parent, 'INPUT', true);
            assertInputHasBlock(
                parent.getInputTargetBlock('INPUT'), 'INPUT', true);
          });

          test('Statement', function() {
            var parent = createStatementBlock(this.workspace);
            var xml = Blockly.Xml.textToDom(
                '<shadow type="statement_block"/>'
            );
            parent.getInput('STATEMENT').connection.setShadowDom(xml);
            assertInputHasBlock(parent, 'STATEMENT', true);
          });

          test('Multiple Statement', function() {
            var parent = createStatementBlock(this.workspace);
            var xml = Blockly.Xml.textToDom(
                '<shadow type="statement_block">' +
                '  <statement name="STATEMENT">' +
                '    <shadow type="statement_block"/>' +
                '  </statement>' +
                '</shadow>'
            );
            parent.getInput('STATEMENT').connection.setShadowDom(xml);
            assertInputHasBlock(parent, 'STATEMENT', true);
            assertInputHasBlock(
                parent.getInputTargetBlock('STATEMENT'), 'STATEMENT', true);
          });

          test('Next', function() {
            var parent = createStackBlock(this.workspace);
            var xml = Blockly.Xml.textToDom(
                '<shadow type="stack_block"/>'
            );
            parent.nextConnection.setShadowDom(xml);
            assertNextHasBlock(parent, true);
          });

          test('Multiple Next', function() {
            var parent = createStackBlock(this.workspace);
            var xml = Blockly.Xml.textToDom(
                '<shadow type="stack_block">' +
                '  <next>' +
                '    <shadow type="stack_block"/>' +
                '  </next>' +
                '</shadow>'
            );
            parent.nextConnection.setShadowDom(xml);
            assertNextHasBlock(parent, true);
            assertNextHasBlock(parent.getNextBlock(), true);
          });
        });

        suite('Add - With Block Connected', function() {
          // These are defined separately in each suite.
          function createRowBlocks(workspace) {
            var block = Blockly.Xml.domToBlock(Blockly.Xml.textToDom(
                '<block type="row_block">' +
                '  <value name="INPUT">' +
                '    <block type="row_block"/>' +
                '  </value>' +
                '</block>'
            ), workspace);
            return block;
          }

          function createStatementBlocks(workspace) {
            var block = Blockly.Xml.domToBlock(Blockly.Xml.textToDom(
                '<block type="statement_block">' +
                '  <statement name="STATEMENT">' +
                '    <block type="statement_block"/>' +
                '  </statement>' +
                '</block>'
            ), workspace);
            return block;
          }

          function createStackBlocks(workspace) {
            var block = Blockly.Xml.domToBlock(Blockly.Xml.textToDom(
                '<block type="stack_block">' +
                '  <next>' +
                '    <block type="stack_block"/>' +
                '  </next>' +
                '</block>'
            ), workspace);
            return block;
          }

          test('Value', function() {
            var parent = createRowBlocks(this.workspace);
            var xml = Blockly.Xml.textToDom(
                '<shadow type="row_block"/>'
            );
            parent.getInput('INPUT').connection.setShadowDom(xml);
            assertInputHasBlock(parent, 'INPUT', false);
            parent.getInput('INPUT').connection.disconnect();
            assertInputHasBlock(parent, 'INPUT', true);
          });

          test('Multiple Value', function() {
            var parent = createRowBlocks(this.workspace);
            var xml = Blockly.Xml.textToDom(
                '<shadow type="row_block">' +
                '  <value name="INPUT">' +
                '    <shadow type="row_block"/>' +
                '  </value>' +
                '</shadow>'
            );
            parent.getInput('INPUT').connection.setShadowDom(xml);
            assertInputHasBlock(parent, 'INPUT', false);
            assertInputNotHasBlock(parent.getInputTargetBlock('INPUT'), 'INPUT');
            parent.getInput('INPUT').connection.disconnect();
            assertInputHasBlock(parent, 'INPUT', true);
            assertInputHasBlock(
                parent.getInputTargetBlock('INPUT'), 'INPUT', true);
          });

          test('Statement', function() {
            var parent = createStatementBlocks(this.workspace);
            var xml = Blockly.Xml.textToDom(
                '<shadow type="statement_block"/>'
            );
            parent.getInput('STATEMENT').connection.setShadowDom(xml);
            assertInputHasBlock(parent, 'STATEMENT', false);
            parent.getInput('STATEMENT').connection.disconnect();
            assertInputHasBlock(parent, 'STATEMENT', true);
          });

          test('Multiple Statement', function() {
            var parent = createStatementBlocks(this.workspace);
            var xml = Blockly.Xml.textToDom(
                '<shadow type="statement_block">' +
                '  <statement name="STATEMENT">' +
                '    <shadow type="statement_block"/>' +
                '  </statement>' +
                '</shadow>'
            );
            parent.getInput('STATEMENT').connection.setShadowDom(xml);
            assertInputHasBlock(parent, 'STATEMENT', false);
            assertInputNotHasBlock(
                parent.getInputTargetBlock('STATEMENT'), 'STATEMENT');
            parent.getInput('STATEMENT').connection.disconnect();
            assertInputHasBlock(parent, 'STATEMENT', true);
            assertInputHasBlock(
                parent.getInputTargetBlock('STATEMENT'), 'STATEMENT', true);
          });

          test('Next', function() {
            var parent = createStackBlocks(this.workspace);
            var xml = Blockly.Xml.textToDom(
                '<shadow type="stack_block"/>'
            );
            parent.nextConnection.setShadowDom(xml);
            assertNextHasBlock(parent, false);
            parent.nextConnection.disconnect();
            assertNextHasBlock(parent, true);
          });

          test('Multiple Next', function() {
            var parent = createStackBlocks(this.workspace);
            var xml = Blockly.Xml.textToDom(
                '<shadow type="stack_block">' +
                '  <next>' +
                '    <shadow type="stack_block"/>' +
                '  </next>' +
                '</shadow>'
            );
            parent.nextConnection.setShadowDom(xml);
            assertNextHasBlock(parent, false);
            assertNextNotHasBlock(parent.getNextBlock());
            parent.nextConnection.disconnect();
            assertNextHasBlock(parent, true);
            assertNextHasBlock(parent.getNextBlock(), true);
          });
        });

        suite('Add - With Shadow Connected', function() {
          // These are defined separately in each suite.
          function createRowBlock(workspace) {
            var block = Blockly.Xml.domToBlock(Blockly.Xml.textToDom(
                '<block type="row_block"/>'
            ), workspace);
            return block;
          }

          function createStatementBlock(workspace) {
            var block = Blockly.Xml.domToBlock(Blockly.Xml.textToDom(
                '<block type="statement_block"/>'
            ), workspace);
            return block;
          }

          function createStackBlock(workspace) {
            var block = Blockly.Xml.domToBlock(Blockly.Xml.textToDom(
                '<block type="stack_block"/>'
            ), workspace);
            return block;
          }

          test('Value', function() {
            var parent = createRowBlock(this.workspace);
            var xml = Blockly.Xml.textToDom(
                '<shadow type="row_block" id="1"/>'
            );
            parent.getInput('INPUT').connection.setShadowDom(xml);
            assertInputHasBlock(parent, 'INPUT', true, '1');
            var xml = Blockly.Xml.textToDom(
                '<shadow type="row_block" id="2"/>'
            );
            parent.getInput('INPUT').connection.setShadowDom(xml);
            assertInputHasBlock(parent, 'INPUT', true, '2');
          });

          test('Multiple Value', function() {
            var parent = createRowBlock(this.workspace);
            var xml = Blockly.Xml.textToDom(
                '<shadow type="row_block" id="1">' +
                '  <value name="INPUT">' +
                '    <shadow type="row_block" id="a"/>' +
                '  </value>' +
                '</shadow>'
            );
            parent.getInput('INPUT').connection.setShadowDom(xml);
            assertInputHasBlock(parent, 'INPUT', true, '1');
            assertInputHasBlock(
                parent.getInputTargetBlock('INPUT'), 'INPUT', true, 'a');
            var xml = Blockly.Xml.textToDom(
                '<shadow type="row_block" id="2">' +
                '  <value name="INPUT">' +
                '    <shadow type="row_block" id="b"/>' +
                '  </value>' +
                '</shadow>'
            );
            parent.getInput('INPUT').connection.setShadowDom(xml);
            assertInputHasBlock(parent, 'INPUT', true, '2');
            assertInputHasBlock(
                parent.getInputTargetBlock('INPUT'), 'INPUT', true, 'b');
          });

          test('Statement', function() {
            var parent = createStatementBlock(this.workspace);
            var xml = Blockly.Xml.textToDom(
                '<shadow type="statement_block" id="1"/>'
            );
            parent.getInput('STATEMENT').connection.setShadowDom(xml);
            assertInputHasBlock(parent, 'STATEMENT', true, '1');
            var xml = Blockly.Xml.textToDom(
                '<shadow type="statement_block" id="2"/>'
            );
            parent.getInput('STATEMENT').connection.setShadowDom(xml);
            assertInputHasBlock(parent, 'STATEMENT', true, '2');
          });

          test('Multiple Statement', function() {
            var parent = createStatementBlock(this.workspace);
            var xml = Blockly.Xml.textToDom(
                '<shadow type="statement_block" id="1">' +
                '  <statement name="STATEMENT">' +
                '    <shadow type="statement_block" id="a"/>' +
                '  </statement>' +
                '</shadow>'
            );
            parent.getInput('STATEMENT').connection.setShadowDom(xml);
            assertInputHasBlock(parent, 'STATEMENT', true, '1');
            assertInputHasBlock(
                parent.getInputTargetBlock('STATEMENT'), 'STATEMENT', true, 'a');
            var xml = Blockly.Xml.textToDom(
                '<shadow type="statement_block" id="2">' +
                '  <statement name="STATEMENT">' +
                '    <shadow type="statement_block" id="b"/>' +
                '  </statement>' +
                '</shadow>'
            );
            parent.getInput('STATEMENT').connection.setShadowDom(xml);
            assertInputHasBlock(parent, 'STATEMENT', true, '2');
            assertInputHasBlock(
                parent.getInputTargetBlock('STATEMENT'), 'STATEMENT', true, 'b');
          });

          test('Next', function() {
            var parent = createStackBlock(this.workspace);
            var xml = Blockly.Xml.textToDom(
                '<shadow type="stack_block" id="1"/>'
            );
            parent.nextConnection.setShadowDom(xml);
            assertNextHasBlock(parent, true, '1');
            var xml = Blockly.Xml.textToDom(
                '<shadow type="stack_block" id="2"/>'
            );
            parent.nextConnection.setShadowDom(xml);
            assertNextHasBlock(parent, true, '2');
          });

          test('Multiple Next', function() {
            var parent = createStackBlock(this.workspace);
            var xml = Blockly.Xml.textToDom(
                '<shadow type="stack_block" id="1">' +
                '  <next>' +
                '    <shadow type="stack_block" id="a"/>' +
                '  </next>' +
                '</shadow>'
            );
            parent.nextConnection.setShadowDom(xml);
            assertNextHasBlock(parent, true, '1');
            assertNextHasBlock(parent.getNextBlock(), true, 'a');
            var xml = Blockly.Xml.textToDom(
                '<shadow type="stack_block" id="2">' +
                '  <next>' +
                '    <shadow type="stack_block" id="b"/>' +
                '  </next>' +
                '</shadow>'
            );
            parent.nextConnection.setShadowDom(xml);
            assertNextHasBlock(parent, true, '2');
            assertNextHasBlock(parent.getNextBlock(), true, 'b');
          });
        });

        suite('Remove - No Block Connected', function() {
          // These are defined separately in each suite.
          function createRowBlock(workspace) {
            var block = Blockly.Xml.domToBlock(Blockly.Xml.textToDom(
                '<block type="row_block">' +
                '  <value name="INPUT">' +
                '    <shadow type="row_block"/>' +
                '  </value>' +
                '</block>'
            ), workspace);
            return block;
          }

          function createStatementBlock(workspace) {
            var block = Blockly.Xml.domToBlock(Blockly.Xml.textToDom(
                '<block type="statement_block">' +
                '  <statement name="STATEMENT">' +
                '    <shadow type="statement_block"/>' +
                '  </statement>' +
                '</block>'
            ), workspace);
            return block;
          }

          function createStackBlock(workspace) {
            var block = Blockly.Xml.domToBlock(Blockly.Xml.textToDom(
                '<block type="stack_block">' +
                '  <next>' +
                '    <shadow type="stack_block"/>' +
                '  </next>' +
                '</block>'
            ), workspace);
            return block;
          }

          test('Value', function() {
            var parent = createRowBlock(this.workspace);
            parent.getInput('INPUT').connection.setShadowDom(null);
            assertInputNotHasBlock(parent, 'INPUT');
          });

          test('Statement', function() {
            var parent = createStatementBlock(this.workspace);
            parent.getInput('STATEMENT').connection.setShadowDom(null);
            assertInputNotHasBlock(parent, 'STATMENT');
          });

          test('Next', function() {
            var parent = createStackBlock(this.workspace);
            parent.nextConnection.setShadowDom(null);
            assertNextNotHasBlock(parent);
          });
        });

        suite('Remove - Block Connected', function() {
          // These are defined separately in each suite.
          function createRowBlock(workspace) {
            var block = Blockly.Xml.domToBlock(Blockly.Xml.textToDom(
                '<block type="row_block">' +
                '  <value name="INPUT">' +
                '    <shadow type="row_block"/>' +
                '    <block type="row_block"/>' +
                '  </value>' +
                '</block>'
            ), workspace);
            return block;
          }

          function createStatementBlock(workspace) {
            var block = Blockly.Xml.domToBlock(Blockly.Xml.textToDom(
                '<block type="statement_block">' +
                '  <statement name="STATEMENT">' +
                '    <shadow type="statement_block"/>' +
                '    <block type="statement_block"/>' +
                '  </statement>' +
                '</block>'
            ), workspace);
            return block;
          }

          function createStackBlock(workspace) {
            var block = Blockly.Xml.domToBlock(Blockly.Xml.textToDom(
                '<block type="stack_block">' +
                '  <next>' +
                '    <shadow type="stack_block"/>' +
                '    <block type="stack_block"/>' +
                '  </next>' +
                '</block>'
            ), workspace);
            return block;
          }

          test('Value', function() {
            var parent = createRowBlock(this.workspace);
            parent.getInput('INPUT').connection.setShadowDom(null);
            assertInputHasBlock(parent, 'INPUT', false);
            parent.getInput('INPUT').connection.disconnect();
            assertInputNotHasBlock(parent, 'INPUT');
          });

          test('Statement', function() {
            var parent = createStatementBlock(this.workspace);
            parent.getInput('STATEMENT').connection.setShadowDom(null);
            assertInputHasBlock(parent, 'STATEMENT', false);
            parent.getInput('STATEMENT').connection.disconnect();
            assertInputNotHasBlock(parent, 'STATEMENT');
          });

          test('Next', function() {
            var parent = createStackBlock(this.workspace);
            parent.nextConnection.setShadowDom(null);
            assertNextHasBlock(parent, false);
            parent.nextConnection.disconnect();
            assertNextNotHasBlock(parent);
          });
        });

        suite('Add - Connect & Disconnect - Remove', function() {
          // These are defined separately in each suite.
          function createRowBlock(workspace) {
            var block = Blockly.Xml.domToBlock(Blockly.Xml.textToDom(
                '<block type="row_block"/>'
            ), workspace);
            return block;
          }

          function createStatementBlock(workspace) {
            var block = Blockly.Xml.domToBlock(Blockly.Xml.textToDom(
                '<block type="statement_block"/>'
            ), workspace);
            return block;
          }

          function createStackBlock(workspace) {
            var block = Blockly.Xml.domToBlock(Blockly.Xml.textToDom(
                '<block type="stack_block"/>'
            ), workspace);
            return block;
          }

          test('Value', function() {
            var parent = createRowBlock(this.workspace);
            var xml = Blockly.Xml.textToDom(
                '<shadow type="row_block"/>'
            );
            parent.getInput('INPUT').connection.setShadowDom(xml);
            assertInputHasBlock(parent, 'INPUT', true);
            var child = createRowBlock(this.workspace);
            parent.getInput('INPUT').connection.connect(child.outputConnection);
            assertInputHasBlock(parent, 'INPUT', false);
            parent.getInput('INPUT').connection.disconnect();
            assertInputHasBlock(parent, 'INPUT', true);
            parent.getInput('INPUT').connection.setShadowDom(null);
            assertInputNotHasBlock(parent, 'INPUT');
          });

          test('Multiple Value', function() {
            var parent = createRowBlock(this.workspace);
            var xml = Blockly.Xml.textToDom(
                '<shadow type="row_block">' +
                '  <value name="INPUT">' +
                '    <shadow type="row_block"/>' +
                '  </value>' +
                '</shadow>'
            );
            parent.getInput('INPUT').connection.setShadowDom(xml);
            assertInputHasBlock(parent, 'INPUT', true);
            assertInputHasBlock(
                parent.getInputTargetBlock('INPUT'), 'INPUT', true);
            var child = createRowBlock(this.workspace);
            parent.getInput('INPUT').connection.connect(child.outputConnection);
            assertInputHasBlock(parent, 'INPUT', false);
            parent.getInput('INPUT').connection.disconnect();
            assertInputHasBlock(parent, 'INPUT', true);
            assertInputHasBlock(
                parent.getInputTargetBlock('INPUT'), 'INPUT', true);
            parent.getInput('INPUT').connection.setShadowDom(null);
            assertInputNotHasBlock(parent, 'INPUT');
          });

          test('Statement', function() {
            var parent = createStatementBlock(this.workspace);
            var xml = Blockly.Xml.textToDom(
                '<shadow type="statement_block"/>'
            );
            parent.getInput('STATEMENT').connection.setShadowDom(xml);
            assertInputHasBlock(parent, 'STATEMENT', true);
            var child = createStatementBlock(this.workspace);
            parent.getInput('STATEMENT').connection
                .connect(child.previousConnection);
            assertInputHasBlock(parent, 'STATEMENT', false);
            parent.getInput('STATEMENT').connection.disconnect();
            assertInputHasBlock(parent, 'STATEMENT', true);
            parent.getInput('STATEMENT').connection.setShadowDom(null);
            assertInputNotHasBlock(parent, 'STATEMENT');
          });

          test('Multiple Statement', function() {
            var parent = createStatementBlock(this.workspace);
            var xml = Blockly.Xml.textToDom(
                '<shadow type="statement_block">' +
                '  <statement name="STATEMENT">' +
                '    <shadow type="statement_block"/>' +
                '  </statement>' +
                '</shadow>'
            );
            parent.getInput('STATEMENT').connection.setShadowDom(xml);
            assertInputHasBlock(parent, 'STATEMENT', true);
            assertInputHasBlock(
                parent.getInputTargetBlock('STATEMENT'), 'STATEMENT', true);
            var child = createStatementBlock(this.workspace);
            parent.getInput('STATEMENT').connection
                .connect(child.previousConnection);
            assertInputHasBlock(parent, 'STATEMENT', false);
            parent.getInput('STATEMENT').connection.disconnect();
            assertInputHasBlock(parent, 'STATEMENT', true);
            assertInputHasBlock(
                parent.getInputTargetBlock('STATEMENT'), 'STATEMENT', true);
            parent.getInput('STATEMENT').connection.setShadowDom(null);
            assertInputNotHasBlock(parent, 'STATEMENT');
          });

          test('Next', function() {
            var parent = createStackBlock(this.workspace);
            var xml = Blockly.Xml.textToDom(
                '<shadow type="stack_block"/>'
            );
            parent.nextConnection.setShadowDom(xml);
            assertNextHasBlock(parent, true);
            var child = createStatementBlock(this.workspace);
            parent.nextConnection.connect(child.previousConnection);
            assertNextHasBlock(parent, false);
            parent.nextConnection.disconnect();
            assertNextHasBlock(parent, true);
            parent.nextConnection.setShadowDom(null);
            assertNextNotHasBlock(parent);
          });

          test('Multiple Next', function() {
            var parent = createStackBlock(this.workspace);
            var xml = Blockly.Xml.textToDom(
                '<shadow type="stack_block">' +
                '  <next>' +
                '    <shadow type="stack_block"/>' +
                '  </next>' +
                '</shadow>'
            );
            parent.nextConnection.setShadowDom(xml);
            assertNextHasBlock(parent, true);
            assertNextHasBlock(parent.getNextBlock(), true);
            var child = createStatementBlock(this.workspace);
            parent.nextConnection.connect(child.previousConnection);
            assertNextHasBlock(parent, false);
            parent.nextConnection.disconnect();
            assertNextHasBlock(parent, true);
            assertNextHasBlock(parent.getNextBlock(), true);
            parent.nextConnection.setShadowDom(null);
            assertNextNotHasBlock(parent);
          });
        });
      });
    });
  });

  suite('getConnectionForOrphanedOutput', function() {
    setup(function() {
      this.workspace = new Blockly.Workspace();

      Blockly.defineBlocksWithJsonArray([
        {
          'type': 'input',
          'message0': '%1',
          'args0': [
            {
              'type': 'input_value',
              'name': 'INPUT',
              'check': 'check'
            }
          ],
        },
        {
          'type': 'output',
          'message0': '',
          'output': 'check',
        },
      ]);
    });

    teardown(function() {
      workspaceTeardown.call(this, this.workspace);
    });

    suite('No available spots', function() {
      setup(function() {
        Blockly.defineBlocksWithJsonArray([
          {
            'type': 'output_and_statements',
            'message0': '%1 %2',
            'args0': [
              {
                'type': 'input_statement',
                'name': 'INPUT',
                'check': 'check'
              },
              {
                'type': 'input_statement',
                'name': 'INPUT2',
                'check': 'check'
              }
            ],
            'output': 'check',
          },
          {
            'type': 'output_and_inputs',
            'message0': '%1 %2',
            'args0': [
              {
                'type': 'input_value',
                'name': 'INPUT',
                'check': 'check2'
              },
              {
                'type': 'input_value',
                'name': 'INPUT2',
                'check': 'check2'
              }
            ],
            'output': 'check',
          },
          {
            'type': 'check_to_check2',
            'message0': '%1',
            'args0': [
              {
                'type': 'input_value',
                'name': 'INPUT',
                'check': 'check2'
              },
            ],
            'output': 'check',
          },
          {
            'type': 'check2_to_check',
            'message0': '%1',
            'args0': [
              {
                'type': 'input_value',
                'name': 'CHECK2TOCHECKINPUT',
                'check': 'check'
              },
            ],
            'output': 'check2',
          },
        ]);
      });

      test('No connection', function() {
        const parent = this.workspace.newBlock('input');
        const oldChild = this.workspace.newBlock('output');
        const newChild = this.workspace.newBlock('output');

        parent.getInput('INPUT').connection.connect(oldChild.outputConnection);
        chai.assert.notExists(
            Blockly.Connection.getConnectionForOrphanedOutput(oldChild, newChild));
      });

      test('All statements', function() {
        const parent = this.workspace.newBlock('input');
        const oldChild = this.workspace.newBlock('output_and_statements');
        const newChild = this.workspace.newBlock('output');

        parent.getInput('INPUT').connection.connect(oldChild.outputConnection);
        chai.assert.notExists(
            Blockly.Connection.getConnectionForOrphanedOutput(oldChild, newChild));
      });

      test('Bad checks', function() {
        const parent = this.workspace.newBlock('input');
        const oldChild = this.workspace.newBlock('output_and_inputs');
        const newChild = this.workspace.newBlock('output');

        parent.getInput('INPUT').connection.connect(oldChild.outputConnection);
        chai.assert.notExists(
            Blockly.Connection.getConnectionForOrphanedOutput(oldChild, newChild));
      });

      test('Through different types', function() {
        const parent = this.workspace.newBlock('input');
        const oldChild = this.workspace.newBlock('check_to_check2');
        const otherChild = this.workspace.newBlock('check2_to_check');
        const newChild = this.workspace.newBlock('output');

        parent.getInput('INPUT').connection
            .connect(oldChild.outputConnection);
        oldChild.getInput('INPUT').connection
            .connect(otherChild.outputConnection);

        chai.assert.notExists(
            Blockly.Connection.getConnectionForOrphanedOutput(oldChild, newChild));
      });
    });

    suite('Multiple available spots', function() {
      setup(function() {
        Blockly.defineBlocksWithJsonArray([
          {
            'type': 'multiple_inputs',
            'message0': '%1 %2',
            'args0': [
              {
                'type': 'input_value',
                'name': 'INPUT',
                'check': 'check'
              },
              {
                'type': 'input_value',
                'name': 'INPUT2',
                'check': 'check'
              },
            ],
            'output': 'check',
          },
          {
            'type': 'single_input',
            'message0': '%1',
            'args0': [
              {
                'type': 'input_value',
                'name': 'INPUT',
                'check': 'check'
              },
            ],
            'output': 'check',
          },
        ]);
      });

      suite('No shadows', function() {
        test('Top block', function() {
          const parent = this.workspace.newBlock('input');
          const oldChild = this.workspace.newBlock('multiple_inputs');
          const newChild = this.workspace.newBlock('output');

          parent.getInput('INPUT').connection.connect(oldChild.outputConnection);
          chai.assert.notExists(
              Blockly.Connection.getConnectionForOrphanedOutput(oldChild, newChild));
        });

        test('Child blocks', function() {
          const parent = this.workspace.newBlock('input');
          const oldChild = this.workspace.newBlock('multiple_inputs');
          const childX = this.workspace.newBlock('single_input');
          const childY = this.workspace.newBlock('single_input');
          const newChild = this.workspace.newBlock('output');

          parent.getInput('INPUT').connection.connect(oldChild.outputConnection);
          oldChild.getInput('INPUT').connection.connect(childX.outputConnection);
          oldChild.getInput('INPUT2').connection.connect(childY.outputConnection);

          chai.assert.notExists(
              Blockly.Connection.getConnectionForOrphanedOutput(oldChild, newChild));
        });

        test('Spots filled', function() {
          const parent = this.workspace.newBlock('input');
          const oldChild = this.workspace.newBlock('multiple_inputs');
          const otherChild = this.workspace.newBlock('output');
          const newChild = this.workspace.newBlock('output');

          parent.getInput('INPUT').connection
              .connect(oldChild.outputConnection);
          oldChild.getInput('INPUT').connection
              .connect(otherChild.outputConnection);

          chai.assert.notExists(
              Blockly.Connection.getConnectionForOrphanedOutput(oldChild, newChild));
        });
      });

      suite('Shadows', function() {
        test('Top block', function() {
          const parent = this.workspace.newBlock('input');
          const oldChild = this.workspace.newBlock('multiple_inputs');
          const newChild = this.workspace.newBlock('output');

          parent.getInput('INPUT').connection.connect(oldChild.outputConnection);
          oldChild.getInput('INPUT').connection.setShadowDom(
              Blockly.Xml.textToDom('<xml><shadow type="output"/></xml>')
                  .firstChild);
          oldChild.getInput('INPUT2').connection.setShadowDom(
              Blockly.Xml.textToDom('<xml><shadow type="output"/></xml>')
                  .firstChild);

          chai.assert.notExists(
              Blockly.Connection.getConnectionForOrphanedOutput(oldChild, newChild));
        });

        test('Child blocks', function() {
          const parent = this.workspace.newBlock('input');
          const oldChild = this.workspace.newBlock('multiple_inputs');
          const childX = this.workspace.newBlock('single_input');
          const childY = this.workspace.newBlock('single_input');
          const newChild = this.workspace.newBlock('output');

          parent.getInput('INPUT').connection.connect(oldChild.outputConnection);
          oldChild.getInput('INPUT').connection.connect(childX.outputConnection);
          oldChild.getInput('INPUT2').connection.connect(childY.outputConnection);
          childX.getInput('INPUT').connection.setShadowDom(
              Blockly.Xml.textToDom('<xml><shadow type="output"/></xml>')
                  .firstChild);
          childY.getInput('INPUT').connection.setShadowDom(
              Blockly.Xml.textToDom('<xml><shadow type="output"/></xml>')
                  .firstChild);

          chai.assert.notExists(
              Blockly.Connection.getConnectionForOrphanedOutput(oldChild, newChild));
        });

        test('Spots filled', function() {
          const parent = this.workspace.newBlock('input');
          const oldChild = this.workspace.newBlock('multiple_inputs');
          const otherChild = this.workspace.newBlock('output');
          const newChild = this.workspace.newBlock('output');

          parent.getInput('INPUT').connection
              .connect(oldChild.outputConnection);
          oldChild.getInput('INPUT').connection
              .connect(otherChild.outputConnection);
          oldChild.getInput('INPUT2').connection.setShadowDom(
              Blockly.Xml.textToDom('<xml><shadow type="output"/></xml>')
                  .firstChild);

          chai.assert.notExists(
              Blockly.Connection.getConnectionForOrphanedOutput(oldChild, newChild));
        });
      });
    });

    suite('Single available spot', function() {
      setup(function() {
        Blockly.defineBlocksWithJsonArray([
          {
            'type': 'single_input',
            'message0': '%1',
            'args0': [
              {
                'type': 'input_value',
                'name': 'INPUT',
                'check': 'check'
              },
            ],
            'output': 'check',
          },
        ]);
      });

      test('No shadows', function() {
        const parent = this.workspace.newBlock('input');
        const oldChild = this.workspace.newBlock('single_input');
        const newChild = this.workspace.newBlock('output');

        parent.getInput('INPUT').connection.connect(oldChild.outputConnection);

        const result = Blockly.Connection
            .getConnectionForOrphanedOutput(oldChild, newChild);
        chai.assert.exists(result);
        chai.assert.equal(result.getParentInput().name, 'INPUT');
      });

      test('Shadows', function() {
        const parent = this.workspace.newBlock('input');
        const oldChild = this.workspace.newBlock('single_input');
        const newChild = this.workspace.newBlock('output');

        parent.getInput('INPUT').connection.connect(oldChild.outputConnection);
        oldChild.getInput('INPUT').connection.setShadowDom(
            Blockly.Xml.textToDom('<xml><shadow type="output"/></xml>')
                .firstChild);

        const result = Blockly.Connection
            .getConnectionForOrphanedOutput(oldChild, newChild);
        chai.assert.exists(result);
        chai.assert.equal(result.getParentInput().name, 'INPUT');
      });
    });
  });
});
