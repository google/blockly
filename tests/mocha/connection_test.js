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

  suite('Connect', function() {
    setup(function() {
      this.workspace = new Blockly.Workspace();
      Blockly.defineBlocksWithJsonArray([
        {
          "type": "stack_block",
          "message0": "%1",
          "args0": [
            {
              "type": "field_input",
              "name": "FIELD",
              "text": "default"
            }
          ],
          "previousStatement": 'check1',
          "nextStatement": 'check1'
        },
        {
          "type": "stack_block_1to2",
          "message0": "",
          "previousStatement": 'check1',
          "nextStatement": 'check2'
        },
        {
          "type": "stack_block_2to1",
          "message0": "",
          "previousStatement": 'check2',
          "nextStatement": 'check1'
        },
        {
          "type": "stack_block_noend",
          "message0": "",
          "previousStatement": 'check1',
        },
        {
          "type": "row_block",
          "message0": "%1 %2",
          "args0": [
            {
              "type": "field_input",
              "name": "FIELD",
              "text": "default"
            },
            {
              "type": "input_value",
              "name": "INPUT",
              "check": 'check1'
            }
          ],
          "output": 'check1'
        },
        {
          "type": "row_block_1to2",
          "message0": "%1",
          "args0": [
            {
              "type": "input_value",
              "name": "INPUT",
              "check": 'check1'
            }
          ],
          "output": 'check2'
        },
        {
          "type": "row_block_2to1",
          "message0": "%1",
          "args0": [
            {
              "type": "input_value",
              "name": "INPUT",
              "check": 'check2'
            }
          ],
          "output": 'check1'
        },
        {
          "type": "row_block_noend",
          "message0": "",
          "output": 'check1'
        },
        {
          "type": "row_block_multiple_inputs",
          "message0": "%1 %2",
          "args0": [
            {
              "type": "input_value",
              "name": "INPUT",
              "check": 'check1'
            },
            {
              "type": "input_value",
              "name": "INPUT2",
              "check": 'check1'
            }
          ],
          "output": 'check1'
        },
        {
          'type': 'output_to_statements',
          'message0': '%1 %2',
          'args0': [
            {
              'type': 'input_statement',
              'name': 'INPUT',
              'check': 'check1'
            },
            {
              'type': 'input_statement',
              'name': 'INPUT2',
              'check': 'check1'
            }
          ],
          'output': 'check1',
        },
        {
          "type": "statement_block",
          "message0": "%1 %2",
          "args0": [
            {
              "type": "field_input",
              "name": "FIELD",
              "text": "default"
            },
            {
              "type": "input_statement",
              "name": "STATEMENT",
              "check": 'check1'
            }
          ],
          "previousStatement": 'check1',
          "nextStatement": 'check1'
        },
        {
          "type": "statement_block_1to2",
          "message0": "%1",
          "args0": [
            {
              "type": "input_statement",
              "name": "STATEMENT",
              "check": 'check1'
            }
          ],
          "previousStatement": 'check1',
          "nextStatement": 'check2'
        },
        {
          "type": "statement_block_2to1",
          "message0": "%1",
          "args0": [
            {
              "type": "input_statement",
              "name": "STATEMENT",
              "check": 'check2'
            }
          ],
          "previousStatement": 'check2',
          "nextStatement": 'check1'
        },
        {
          "type": "statement_block_noend",
          "message0": "%1",
          "args0": [
            {
              "type": "input_statement",
              "name": "STATEMENT",
              "check": 'check1'
            }
          ],
          "previousStatement": 'check1',
        },
      ]);

      // Used to make sure we don't get stray shadow blocks or anything.
      this.assertBlockCount = function(count) {
        chai.assert.equal(this.workspace.getAllBlocks().length, count);
      };
    });

    suite('Disconnect from old parent', function() {
      test('Value', function() {
        var oldParent = this.workspace.newBlock('row_block');
        var newParent = this.workspace.newBlock('row_block');
        var child = this.workspace.newBlock('row_block');

        oldParent.getInput('INPUT').connection.connect(child.outputConnection);
        newParent.getInput('INPUT').connection.connect(child.outputConnection);

        chai.assert.isFalse(
            oldParent.getInput('INPUT').connection.isConnected());
        this.assertBlockCount(3);
      });

      test('Statement', function() {
        var oldParent = this.workspace.newBlock('statement_block');
        var newParent = this.workspace.newBlock('statement_block');
        var child = this.workspace.newBlock('stack_block');

        oldParent.getInput('STATEMENT').connection
            .connect(child.previousConnection);
        newParent.getInput('STATEMENT').connection
            .connect(child.previousConnection);

        chai.assert.isFalse(
            oldParent.getInput('STATEMENT').connection.isConnected());
        this.assertBlockCount(3);
      });

      test('Next', function() {
        var oldParent = this.workspace.newBlock('stack_block');
        var newParent = this.workspace.newBlock('stack_block');
        var child = this.workspace.newBlock('stack_block');

        oldParent.nextConnection.connect(child.previousConnection);
        newParent.nextConnection.connect(child.previousConnection);

        chai.assert.isFalse(oldParent.nextConnection.isConnected());
        this.assertBlockCount(3);
      });
    });

    suite('Shadow dissolves', function() {
      test('Value', function() {
        var newParent = this.workspace.newBlock('row_block');
        var child = this.workspace.newBlock('row_block');
        var xml = Blockly.Xml.textToDom(
            '<shadow type="row_block"/>'
        );
        newParent.getInput('INPUT').connection.setShadowDom(xml);
        chai.assert.isTrue(newParent.getInputTargetBlock('INPUT').isShadow());

        newParent.getInput('INPUT').connection.connect(child.outputConnection);

        chai.assert.isFalse(newParent.getInputTargetBlock('INPUT').isShadow());
        this.assertBlockCount(2);
      });

      test('Statement', function() {
        var newParent = this.workspace.newBlock('statement_block');
        var child = this.workspace.newBlock('stack_block');
        var xml = Blockly.Xml.textToDom(
            '<shadow type="stack_block"/>'
        );
        newParent.getInput('STATEMENT').connection.setShadowDom(xml);
        chai.assert.isTrue(
            newParent.getInputTargetBlock('STATEMENT').isShadow());

        newParent.getInput('STATEMENT').connection
            .connect(child.previousConnection);

        chai.assert.isFalse(
            newParent.getInputTargetBlock('STATEMENT').isShadow());
        this.assertBlockCount(2);
      });

      test('Next', function() {
        var newParent = this.workspace.newBlock('stack_block');
        var child = this.workspace.newBlock('stack_block');
        var xml = Blockly.Xml.textToDom(
            '<shadow type="stack_block"/>'
        );
        newParent.nextConnection.setShadowDom(xml);
        chai.assert.isTrue(newParent.getNextBlock().isShadow());

        newParent.nextConnection.connect(child.previousConnection);

        chai.assert.isFalse(newParent.getNextBlock().isShadow());
        this.assertBlockCount(2);
      });
    });

    suite('Saving shadow values', function() {
      test('Value', function() {
        var newParent = this.workspace.newBlock('row_block');
        var child = this.workspace.newBlock('row_block');
        var xml = Blockly.Xml.textToDom(
            '<shadow type="row_block"/>'
        );
        newParent.getInput('INPUT').connection.setShadowDom(xml);
        newParent.getInputTargetBlock('INPUT').setFieldValue('new', 'FIELD');

        newParent.getInput('INPUT').connection.connect(child.outputConnection);
        newParent.getInput('INPUT').connection.disconnect();

        const target = newParent.getInputTargetBlock('INPUT');
        chai.assert.isTrue(target.isShadow());
        chai.assert.equal(target.getFieldValue('FIELD'), 'new');
        this.assertBlockCount(3);
      });

      test('Statement', function() {
        var newParent = this.workspace.newBlock('statement_block');
        var child = this.workspace.newBlock('stack_block');
        var xml = Blockly.Xml.textToDom(
            '<shadow type="stack_block"/>'
        );
        newParent.getInput('STATEMENT').connection.setShadowDom(xml);
        newParent.getInputTargetBlock('STATEMENT')
            .setFieldValue('new', 'FIELD');

        newParent.getInput('STATEMENT').connection
            .connect(child.previousConnection);
        newParent.getInput('STATEMENT').connection.disconnect();

        const target = newParent.getInputTargetBlock('STATEMENT');
        chai.assert.isTrue(target.isShadow());
        chai.assert.equal(target.getFieldValue('FIELD'), 'new');
        this.assertBlockCount(3);
      });

      test('Next', function() {
        var newParent = this.workspace.newBlock('stack_block');
        var child = this.workspace.newBlock('stack_block');
        var xml = Blockly.Xml.textToDom(
            '<shadow type="stack_block"/>'
        );
        newParent.nextConnection.setShadowDom(xml);
        newParent.getNextBlock().setFieldValue('new', 'FIELD');

        newParent.nextConnection.connect(child.previousConnection);
        newParent.nextConnection.disconnect();

        const target = newParent.getNextBlock();
        chai.assert.isTrue(target.isShadow());
        chai.assert.equal(target.getFieldValue('FIELD'), 'new');
        this.assertBlockCount(3);
      });
    });

    suite('Reattach or bump orphan', function() {
      suite('Value', function() {
        suite('No available spots', function() {
          test('No connection', function() {
            var parent = this.workspace.newBlock('row_block');
            var oldChild = this.workspace.newBlock('row_block');
            var newChild = this.workspace.newBlock('row_block_noend');
            parent.getInput('INPUT').connection
                .connect(oldChild.outputConnection);

            parent.getInput('INPUT').connection
                .connect(newChild.outputConnection);

            chai.assert.isTrue(
                parent.getInput('INPUT').connection.isConnected());
            chai.assert.equal(
                parent.getInputTargetBlock('INPUT'), newChild);
            chai.assert.isFalse(
                oldChild.outputConnection.isConnected());
          });

          test('All statements', function() {
            var parent = this.workspace.newBlock('row_block');
            var oldChild = this.workspace.newBlock('row_block');
            var newChild = this.workspace.newBlock('output_to_statements');
            parent.getInput('INPUT').connection
                .connect(oldChild.outputConnection);

            parent.getInput('INPUT').connection
                .connect(newChild.outputConnection);

            chai.assert.isTrue(
                parent.getInput('INPUT').connection.isConnected());
            chai.assert.equal(
                parent.getInputTargetBlock('INPUT'), newChild);
            chai.assert.isFalse(
                oldChild.outputConnection.isConnected());
          });

          test('Bad checks', function() {
            var parent = this.workspace.newBlock('row_block');
            var oldChild = this.workspace.newBlock('row_block');
            var newChild = this.workspace.newBlock('row_block_2to1');
            parent.getInput('INPUT').connection
                .connect(oldChild.outputConnection);

            parent.getInput('INPUT').connection
                .connect(newChild.outputConnection);

            chai.assert.isTrue(
                parent.getInput('INPUT').connection.isConnected());
            chai.assert.equal(
                parent.getInputTargetBlock('INPUT'), newChild);
            chai.assert.isFalse(
                oldChild.outputConnection.isConnected());
          });

          test('Through different types', function() {
            const parent = this.workspace.newBlock('row_block');
            const oldChild = this.workspace.newBlock('row_block');
            const newChild = this.workspace.newBlock('row_block_2to1');
            const otherChild = this.workspace.newBlock('row_block_1to2');

            parent.getInput('INPUT').connection
                .connect(oldChild.outputConnection);
            newChild.getInput('INPUT').connection
                .connect(otherChild.outputConnection);

            parent.getInput('INPUT').connection
                .connect(newChild.outputConnection);

            chai.assert.isTrue(
                parent.getInput('INPUT').connection.isConnected());
            chai.assert.equal(
                parent.getInputTargetBlock('INPUT'), newChild);
            chai.assert.isFalse(
                oldChild.outputConnection.isConnected());
          });
        });

        suite('Multiple available spots', function() {
          suite('No shadows', function() {
            test('Top block', function() {
              const parent = this.workspace.newBlock('row_block');
              const oldChild = this.workspace.newBlock('row_block');
              const newChild = this.workspace.newBlock(
                  'row_block_multiple_inputs');

              parent.getInput('INPUT').connection
                  .connect(oldChild.outputConnection);

              parent.getInput('INPUT').connection
                  .connect(newChild.outputConnection);

              chai.assert.isTrue(
                  parent.getInput('INPUT').connection.isConnected());
              chai.assert.equal(
                  parent.getInputTargetBlock('INPUT'), newChild);
              chai.assert.isFalse(
                  oldChild.outputConnection.isConnected());
            });

            test('Child blocks', function() {
              const parent = this.workspace.newBlock('row_block');
              const oldChild = this.workspace.newBlock('row_block');
              const newChild = this.workspace.newBlock(
                  'row_block_multiple_inputs');
              const childX = this.workspace.newBlock('row_block');
              const childY = this.workspace.newBlock('row_block');

              parent.getInput('INPUT').connection
                  .connect(oldChild.outputConnection);
              newChild.getInput('INPUT').connection
                  .connect(childX.outputConnection);
              newChild.getInput('INPUT2').connection
                  .connect(childY.outputConnection);

              parent.getInput('INPUT').connection
                  .connect(newChild.outputConnection);

              chai.assert.isTrue(
                  parent.getInput('INPUT').connection.isConnected());
              chai.assert.equal(
                  parent.getInputTargetBlock('INPUT'), newChild);
              chai.assert.isFalse(
                  oldChild.outputConnection.isConnected());
            });

            test('Spots filled', function() {
              const parent = this.workspace.newBlock('row_block');
              const oldChild = this.workspace.newBlock('row_block');
              const newChild = this.workspace.newBlock(
                  'row_block_multiple_inputs');
              const otherChild = this.workspace.newBlock('row_block_noend');

              parent.getInput('INPUT').connection
                  .connect(oldChild.outputConnection);
              newChild.getInput('INPUT').connection
                  .connect(otherChild.outputConnection);

              parent.getInput('INPUT').connection
                  .connect(newChild.outputConnection);

              chai.assert.isTrue(
                  parent.getInput('INPUT').connection.isConnected());
              chai.assert.equal(
                  parent.getInputTargetBlock('INPUT'), newChild);
              chai.assert.isFalse(
                  oldChild.outputConnection.isConnected());
            });
          });

          suite('Shadows', function() {
            test('Top block', function() {
              const parent = this.workspace.newBlock('row_block');
              const oldChild = this.workspace.newBlock('row_block');
              const newChild = this.workspace.newBlock(
                  'row_block_multiple_inputs');

              parent.getInput('INPUT').connection
                  .connect(oldChild.outputConnection);
              newChild.getInput('INPUT').connection.setShadowDom(
                  Blockly.Xml.textToDom('<xml><shadow type="row_block"/></xml>')
                      .firstChild);
              newChild.getInput('INPUT2').connection.setShadowDom(
                  Blockly.Xml.textToDom('<xml><shadow type="row_block"/></xml>')
                      .firstChild);

              parent.getInput('INPUT').connection
                  .connect(newChild.outputConnection);

              chai.assert.isTrue(
                  parent.getInput('INPUT').connection.isConnected());
              chai.assert.equal(
                  parent.getInputTargetBlock('INPUT'), newChild);
              chai.assert.isFalse(
                  oldChild.outputConnection.isConnected());
            });

            test('Child blocks', function() {
              const parent = this.workspace.newBlock('row_block');
              const oldChild = this.workspace.newBlock('row_block');
              const newChild = this.workspace.newBlock(
                  'row_block_multiple_inputs');
              const childX = this.workspace.newBlock('row_block');
              const childY = this.workspace.newBlock('row_block');

              parent.getInput('INPUT').connection
                  .connect(oldChild.outputConnection);
              newChild.getInput('INPUT').connection
                  .connect(childX.outputConnection);
              newChild.getInput('INPUT2').connection
                  .connect(childY.outputConnection);
              childX.getInput('INPUT').connection.setShadowDom(
                  Blockly.Xml.textToDom('<xml><shadow type="row_block"/></xml>')
                      .firstChild);
              childY.getInput('INPUT').connection.setShadowDom(
                  Blockly.Xml.textToDom('<xml><shadow type="row_block"/></xml>')
                      .firstChild);

              parent.getInput('INPUT').connection
                  .connect(newChild.outputConnection);

              chai.assert.isTrue(
                  parent.getInput('INPUT').connection.isConnected());
              chai.assert.equal(
                  parent.getInputTargetBlock('INPUT'), newChild);
              chai.assert.isFalse(
                  oldChild.outputConnection.isConnected());
            });

            test('Spots filled', function() {
              const parent = this.workspace.newBlock('row_block');
              const oldChild = this.workspace.newBlock('row_block');
              const newChild = this.workspace.newBlock(
                  'row_block_multiple_inputs');
              const otherChild = this.workspace.newBlock('row_block_noend');

              parent.getInput('INPUT').connection
                  .connect(oldChild.outputConnection);
              newChild.getInput('INPUT').connection
                  .connect(otherChild.outputConnection);
              newChild.getInput('INPUT2').connection.setShadowDom(
                  Blockly.Xml.textToDom('<xml><shadow type="row_block"/></xml>')
                      .firstChild);

              parent.getInput('INPUT').connection
                  .connect(newChild.outputConnection);

              chai.assert.isTrue(
                  parent.getInput('INPUT').connection.isConnected());
              chai.assert.equal(
                  parent.getInputTargetBlock('INPUT'), newChild);
              chai.assert.isFalse(
                  oldChild.outputConnection.isConnected());
            });
          });
        });

        suite('Single available spot', function() {
          test('No shadows', function() {
            const parent = this.workspace.newBlock('row_block');
            const oldChild = this.workspace.newBlock('row_block');
            const newChild = this.workspace.newBlock('row_block');

            parent.getInput('INPUT').connection
                .connect(oldChild.outputConnection);

            parent.getInput('INPUT').connection
                .connect(newChild.outputConnection);

            chai.assert.isTrue(
                parent.getInput('INPUT').connection.isConnected());
            chai.assert.equal(
                parent.getInputTargetBlock('INPUT'), newChild);
            chai.assert.isTrue(
                newChild.getInput('INPUT').connection.isConnected());
            chai.assert.equal(
                newChild.getInputTargetBlock('INPUT'), oldChild);
          });

          test('Shadows', function() {
            const parent = this.workspace.newBlock('row_block');
            const oldChild = this.workspace.newBlock('row_block');
            const newChild = this.workspace.newBlock('row_block');

            parent.getInput('INPUT').connection
                .connect(oldChild.outputConnection);
            newChild.getInput('INPUT').connection.setShadowDom(
                Blockly.Xml.textToDom('<xml><shadow type="row_block"/></xml>')
                    .firstChild);

            parent.getInput('INPUT').connection
                .connect(newChild.outputConnection);

            chai.assert.isTrue(
                parent.getInput('INPUT').connection.isConnected());
            chai.assert.equal(
                parent.getInputTargetBlock('INPUT'), newChild);
            chai.assert.isTrue(
                newChild.getInput('INPUT').connection.isConnected());
            chai.assert.equal(
                newChild.getInputTargetBlock('INPUT'), oldChild);
          });
        });
      });

      suite('Statement', function() {
        suite('No shadows', function() {
          test('Simple', function() {
            var parent = this.workspace.newBlock('statement_block');
            var oldChild = this.workspace.newBlock('stack_block');
            var newChild = this.workspace.newBlock('stack_block');
            parent.getInput('STATEMENT').connection
                .connect(oldChild.previousConnection);

            parent.getInput('STATEMENT').connection
                .connect(newChild.previousConnection);

            chai.assert.isTrue(
                parent.getInput('STATEMENT').connection.isConnected());
            chai.assert.equal(
                parent.getInputTargetBlock('STATEMENT'), newChild);
            chai.assert.isTrue(newChild.nextConnection.isConnected());
            chai.assert.equal(newChild.getNextBlock(), oldChild);
            this.assertBlockCount(3);
          });

          test('Bad check in between', function() {
            var parent = this.workspace.newBlock('statement_block');
            var oldChild = this.workspace.newBlock('stack_block');
            var newChild1 = this.workspace.newBlock('stack_block_1to2');
            var newChild2 = this.workspace.newBlock('stack_block_2to1');
            parent.getInput('STATEMENT').connection
                .connect(oldChild.previousConnection);
            newChild1.nextConnection.connect(newChild2.previousConnection);

            parent.getInput('STATEMENT').connection
                .connect(newChild1.previousConnection);

            chai.assert.isTrue(
                parent.getInput('STATEMENT').connection.isConnected());
            chai.assert.equal(
                parent.getInputTargetBlock('STATEMENT'), newChild1);
            chai.assert.isTrue(newChild2.nextConnection.isConnected());
            chai.assert.equal(newChild2.getNextBlock(), oldChild);
            this.assertBlockCount(4);
          });

          test('Bad check at end', function() {
            var parent = this.workspace.newBlock('statement_block');
            var oldChild = this.workspace.newBlock('stack_block');
            var newChild = this.workspace.newBlock('stack_block_1to2');
            parent.getInput('STATEMENT').connection
                .connect(oldChild.previousConnection);
            var spy = sinon.spy(oldChild.previousConnection, 'onFailedConnect');

            parent.getInput('STATEMENT').connection
                .connect(newChild.previousConnection);

            chai.assert.isTrue(
                parent.getInput('STATEMENT').connection.isConnected());
            chai.assert.equal(
                parent.getInputTargetBlock('STATEMENT'), newChild);
            chai.assert.isFalse(newChild.nextConnection.isConnected());
            chai.assert.isTrue(spy.calledOnce);
            this.assertBlockCount(3);
          });

          test('No end connection', function() {
            var parent = this.workspace.newBlock('statement_block');
            var oldChild = this.workspace.newBlock('stack_block');
            var newChild = this.workspace.newBlock('stack_block_noend');
            parent.getInput('STATEMENT').connection
                .connect(oldChild.previousConnection);
            var spy = sinon.spy(oldChild.previousConnection, 'onFailedConnect');

            parent.getInput('STATEMENT').connection
                .connect(newChild.previousConnection);

            chai.assert.isTrue(
                parent.getInput('STATEMENT').connection.isConnected());
            chai.assert.equal(
                parent.getInputTargetBlock('STATEMENT'), newChild);
            chai.assert.isTrue(spy.calledOnce);
            this.assertBlockCount(3);
          });
        });

        suite('Shadows', function() {
          test('Simple', function() {
            var parent = this.workspace.newBlock('statement_block');
            var oldChild = this.workspace.newBlock('stack_block');
            var newChild = this.workspace.newBlock('stack_block');
            parent.getInput('STATEMENT').connection
                .connect(oldChild.previousConnection);
            var xml = Blockly.Xml.textToDom(
                '<shadow type="stack_block"/>'
            );
            newChild.nextConnection.setShadowDom(xml);

            parent.getInput('STATEMENT').connection
                .connect(newChild.previousConnection);

            chai.assert.isTrue(
                parent.getInput('STATEMENT').connection.isConnected());
            chai.assert.equal(
                parent.getInputTargetBlock('STATEMENT'), newChild);
            chai.assert.isTrue(newChild.nextConnection.isConnected());
            chai.assert.equal(newChild.getNextBlock(), oldChild);
            this.assertBlockCount(3);
          });

          test('Bad check in between', function() {
            var parent = this.workspace.newBlock('statement_block');
            var oldChild = this.workspace.newBlock('stack_block');
            var newChild1 = this.workspace.newBlock('stack_block_1to2');
            var newChild2 = this.workspace.newBlock('stack_block_2to1');
            parent.getInput('STATEMENT').connection
                .connect(oldChild.previousConnection);
            newChild1.nextConnection.connect(newChild2.previousConnection);
            var xml = Blockly.Xml.textToDom(
                '<shadow type="stack_block"/>'
            );
            newChild2.nextConnection.setShadowDom(xml);

            parent.getInput('STATEMENT').connection
                .connect(newChild1.previousConnection);

            chai.assert.isTrue(
                parent.getInput('STATEMENT').connection.isConnected());
            chai.assert.equal(
                parent.getInputTargetBlock('STATEMENT'), newChild1);
            chai.assert.isTrue(newChild2.nextConnection.isConnected());
            chai.assert.equal(newChild2.getNextBlock(), oldChild);
            this.assertBlockCount(4);
          });

          test('Bad check at end', function() {
            var parent = this.workspace.newBlock('statement_block');
            var oldChild = this.workspace.newBlock('stack_block');
            var newChild = this.workspace.newBlock('stack_block_1to2');
            parent.getInput('STATEMENT').connection
                .connect(oldChild.previousConnection);
            var xml = Blockly.Xml.textToDom(
                '<shadow type="stack_block_2to1"/>'
            );
            newChild.nextConnection.setShadowDom(xml);
            var spy = sinon.spy(oldChild.previousConnection, 'onFailedConnect');

            parent.getInput('STATEMENT').connection
                .connect(newChild.previousConnection);

            chai.assert.isTrue(
                parent.getInput('STATEMENT').connection.isConnected());
            chai.assert.equal(
                parent.getInputTargetBlock('STATEMENT'), newChild);
            chai.assert.isTrue(newChild.nextConnection.isConnected());
            chai.assert.isTrue(newChild.getNextBlock().isShadow());
            chai.assert.isTrue(spy.calledOnce);
            this.assertBlockCount(4);
          });
        });
      });

      suite('Next', function() {
        suite('No shadows', function() {
          test('Simple', function() {
            var parent = this.workspace.newBlock('stack_block');
            var oldChild = this.workspace.newBlock('stack_block');
            var newChild = this.workspace.newBlock('stack_block');
            parent.nextConnection.connect(oldChild.previousConnection);

            parent.nextConnection.connect(newChild.previousConnection);

            chai.assert.isTrue(parent.nextConnection.isConnected());
            chai.assert.equal(parent.getNextBlock(), newChild);
            chai.assert.isTrue(newChild.nextConnection.isConnected());
            chai.assert.equal(newChild.getNextBlock(), oldChild);
            this.assertBlockCount(3);
          });

          test('Bad check in between', function() {
            var parent = this.workspace.newBlock('stack_block');
            var oldChild = this.workspace.newBlock('stack_block');
            var newChild1 = this.workspace.newBlock('stack_block_1to2');
            var newChild2 = this.workspace.newBlock('stack_block_2to1');
            parent.nextConnection.connect(oldChild.previousConnection);
            newChild1.nextConnection.connect(newChild2.previousConnection);

            parent.nextConnection.connect(newChild1.previousConnection);

            chai.assert.isTrue(parent.nextConnection.isConnected());
            chai.assert.equal(parent.getNextBlock(), newChild1);
            chai.assert.isTrue(newChild2.nextConnection.isConnected());
            chai.assert.equal(newChild2.getNextBlock(), oldChild);
            this.assertBlockCount(4);
          });

          test('Bad check at end', function() {
            var parent = this.workspace.newBlock('stack_block');
            var oldChild = this.workspace.newBlock('stack_block');
            var newChild = this.workspace.newBlock('stack_block_1to2');
            parent.nextConnection.connect(oldChild.previousConnection);
            var spy = sinon.spy(oldChild.previousConnection, 'onFailedConnect');

            parent.nextConnection.connect(newChild.previousConnection);

            chai.assert.isTrue(parent.nextConnection.isConnected());
            chai.assert.equal(parent.getNextBlock(), newChild);
            chai.assert.isFalse(newChild.nextConnection.isConnected());
            chai.assert.isTrue(spy.calledOnce);
            this.assertBlockCount(3);
          });

          test('No end connection', function() {
            var parent = this.workspace.newBlock('stack_block');
            var oldChild = this.workspace.newBlock('stack_block');
            var newChild = this.workspace.newBlock('stack_block_noend');
            parent.nextConnection.connect(oldChild.previousConnection);
            var spy = sinon.spy(oldChild.previousConnection, 'onFailedConnect');

            parent.nextConnection.connect(newChild.previousConnection);

            chai.assert.isTrue(parent.nextConnection.isConnected());
            chai.assert.equal(parent.getNextBlock(), newChild);
            chai.assert.isTrue(spy.calledOnce);
            this.assertBlockCount(3);
          });
        });

        suite('Shadows', function() {
          test('Simple', function() {
            var parent = this.workspace.newBlock('stack_block');
            var oldChild = this.workspace.newBlock('stack_block');
            var newChild = this.workspace.newBlock('stack_block');
            parent.nextConnection.connect(oldChild.previousConnection);
            var xml = Blockly.Xml.textToDom(
                '<shadow type="stack_block"/>'
            );
            newChild.nextConnection.setShadowDom(xml);

            parent.nextConnection.connect(newChild.previousConnection);

            chai.assert.isTrue(parent.nextConnection.isConnected());
            chai.assert.equal(parent.getNextBlock(), newChild);
            chai.assert.isTrue(newChild.nextConnection.isConnected());
            chai.assert.equal(newChild.getNextBlock(), oldChild);
            this.assertBlockCount(3);
          });

          test('Bad check in between', function() {
            var parent = this.workspace.newBlock('stack_block');
            var oldChild = this.workspace.newBlock('stack_block');
            var newChild1 = this.workspace.newBlock('stack_block_1to2');
            var newChild2 = this.workspace.newBlock('stack_block_2to1');
            parent.nextConnection.connect(oldChild.previousConnection);
            newChild1.nextConnection.connect(newChild2.previousConnection);
            var xml = Blockly.Xml.textToDom(
                '<shadow type="stack_block"/>'
            );
            newChild2.nextConnection.setShadowDom(xml);

            parent.nextConnection.connect(newChild1.previousConnection);

            chai.assert.isTrue(parent.nextConnection.isConnected());
            chai.assert.equal(parent.getNextBlock(), newChild1);
            chai.assert.isTrue(newChild2.nextConnection.isConnected());
            chai.assert.equal(newChild2.getNextBlock(), oldChild);
            this.assertBlockCount(4);
          });

          test('Bad check at end', function() {
            var parent = this.workspace.newBlock('stack_block');
            var oldChild = this.workspace.newBlock('stack_block');
            var newChild = this.workspace.newBlock('stack_block_1to2');
            parent.nextConnection.connect(oldChild.previousConnection);
            var xml = Blockly.Xml.textToDom(
                '<shadow type="stack_block_2to1"/>'
            );
            newChild.nextConnection.setShadowDom(xml);
            var spy = sinon.spy(oldChild.previousConnection, 'onFailedConnect');

            parent.nextConnection.connect(newChild.previousConnection);

            chai.assert.isTrue(parent.nextConnection.isConnected());
            chai.assert.equal(parent.getNextBlock(), newChild);
            chai.assert.isTrue(newChild.nextConnection.isConnected());
            chai.assert.isTrue(newChild.getNextBlock().isShadow());
            chai.assert.isTrue(spy.calledOnce);
            this.assertBlockCount(4);
          });
        });
      });
    });
  });
});
