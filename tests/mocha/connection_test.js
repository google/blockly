/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

suite('Connection', function() {
  suiteSetup(function() {
    this.workspace = = {
        connectionChecker: new Blockly.ConnectionChecker()
      };
    this.createConnection = function(type) {
      var connection = new Blockly.Connection({workspace: this.workspace}, type);
      return connection;
    };
  });
  test('canConnectWithReason passes', function() {
    var conn1 = this.createConnection(Blockly.PREVIOUS_STATEMENT);
    var conn2 = this.createConnection(Blockly.NEXT_STATEMENT);
    chai.assert.equal(conn1.canConnectWithReason(conn2),
        Blockly.Connection.CAN_CONNECT);
  });
  test('canConnectWithReason fails', function() {
    var conn1 = this.createConnection(Blockly.PREVIOUS_STATEMENT);
    var conn2 = this.createConnection(Blockly.OUTPUT_VALUE);
    chai.assert.equal(conn1.canConnectWithReason(conn2),
        Blockly.Connection.REASON_WRONG_TYPE);
  });
  test('checkConnection passes', function() {
    var conn1 = this.createConnection(Blockly.PREVIOUS_STATEMENT);
    var conn2 = this.createConnection(Blockly.NEXT_STATEMENT);
    chai.assert.doesNotThrow(conn1.checkConnection(conn2));
  });
  test('checkConnection fails', function() {
    var conn1 = this.createConnection(Blockly.PREVIOUS_STATEMENT);
    var conn2 = this.createConnection(Blockly.OUTPUT_VALUE);
    chai.assert.throws(conn1.checkConnection(conn2));
  });
});
