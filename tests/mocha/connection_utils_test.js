/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

suite('Connection Utilities', function() {
  setup(function() {
    this.workspace = new Blockly.Workspace();
    Blockly.defineBlocksWithJsonArray([
      {
        "type": "empty_block",
        "message0": ""
      }]);
  });
  teardown(function() {
    this.workspace.dispose();
    delete Blockly.Blocks['empty_block'];
  });
  suite('Single Compatible Row Connection', function() {
    test('Single Compatible Row Connection', function() {
      var blockA = this.workspace.newBlock('empty_block');
      var blockB = this.workspace.newBlock('empty_block');

      blockA.appendValueInput('INPUT').setCheck('check1');
      blockB.setOutput(true, 'check1');

      var expectedConnection = blockA.getInput('INPUT').connection;
      var actualConnnection = Blockly.connUtils
          .getSingleCompatibleRowConnection(blockA, blockB);

      chai.assert.equal(actualConnnection, expectedConnection);
    });
    test('Multiple Compatible Row Connections', function() {
      var blockA = this.workspace.newBlock('empty_block');
      var blockB = this.workspace.newBlock('empty_block');

      blockA.appendValueInput('INPUT').setCheck('check1');
      blockA.appendValueInput('INPUT2').setCheck('check1');
      blockB.setOutput(true, 'check1');

      var actualConnnection = Blockly.connUtils
          .getSingleCompatibleRowConnection(blockA, blockB);

      chai.assert.equal(actualConnnection, null);
    });
    test('Single Compatible Statement Connection', function() {
      var blockA = this.workspace.newBlock('empty_block');
      var blockB = this.workspace.newBlock('empty_block');

      blockA.appendStatementInput('INPUT').setCheck('check1');
      blockB.setOutput(true, 'check1');

      var actualConnnection = Blockly.connUtils
          .getSingleCompatibleRowConnection(blockA, blockB);

      chai.assert.equal(actualConnnection, null);
    });
    test('Multiple Compatible Input Connections', function() {
      var blockA = this.workspace.newBlock('empty_block');
      var blockB = this.workspace.newBlock('empty_block');

      blockA.appendValueInput('INPUT').setCheck('check1');
      blockA.appendStatementInput('INPUT2').setCheck('check1');
      blockB.setOutput(true, 'check1');

      var expectedConnection = blockA.getInput('INPUT').connection;
      var actualConnnection = Blockly.connUtils
          .getSingleCompatibleRowConnection(blockA, blockB);

      chai.assert.equal(actualConnnection, expectedConnection);
    });
    test('No Compatible Connections', function() {
      var blockA = this.workspace.newBlock('empty_block');
      var blockB = this.workspace.newBlock('empty_block');

      blockA.appendValueInput('INPUT').setCheck('check1');
      blockB.setOutput(true, 'check2');

      var actualConnnection = Blockly.connUtils
          .getSingleCompatibleRowConnection(blockA, blockB);

      chai.assert.equal(actualConnnection, null);
    });
    test('No Connections', function() {
      var blockA = this.workspace.newBlock('empty_block');
      var blockB = this.workspace.newBlock('empty_block');

      blockB.setOutput(true, 'check1');

      var actualConnnection = Blockly.connUtils
          .getSingleCompatibleRowConnection(blockA, blockB);

      chai.assert.equal(actualConnnection, null);
    });
  });
  suite('Last Compatible Row Connection', function() {
    test('All are Compatible', function() {
      var blockA = this.workspace.newBlock('empty_block');
      var blockB = this.workspace.newBlock('empty_block');
      var blockC = this.workspace.newBlock('empty_block');

      blockA.appendValueInput('INPUT').setCheck('check1');
      blockB.setOutput(true, 'check1');
      blockB.appendValueInput('INPUT').setCheck('check1');
      blockC.setOutput(true, 'check1');

      blockA.getInput('INPUT').connection.connect(blockB.outputConnection);

      var expectedConnection = blockB.getInput('INPUT').connection;
      var actualConnnection = Blockly.connUtils
          .getLastCompatibleRowConnection(blockA, blockB);

      chai.assert.equal(actualConnnection, expectedConnection);
    });
    test('Middle is Not Compatible', function() {
      var blockA = this.workspace.newBlock('empty_block');
      var blockB = this.workspace.newBlock('empty_block');
      var blockC = this.workspace.newBlock('empty_block');

      blockA.appendValueInput('INPUT').setCheck('check1');
      blockB.setOutput(true, 'check1');
      blockB.appendValueInput('INPUT').setCheck('check2');
      blockC.setOutput(true, 'check2');

      blockA.getInput('INPUT').connection.connect(blockB.outputConnection);

      var actualConnnection = Blockly.connUtils
          .getLastCompatibleRowConnection(blockA, blockB);

      chai.assert.equal(actualConnnection, null);
    });
    test('End is Not Compatible', function() {
      var blockA = this.workspace.newBlock('empty_block');
      var blockB = this.workspace.newBlock('empty_block');
      var blockC = this.workspace.newBlock('empty_block');

      blockA.appendValueInput('INPUT').setCheck('check1');
      blockB.setOutput(true, 'check1');
      blockB.appendValueInput('INPUT').setCheck('check2');
      blockC.setOutput(true, 'check1');

      blockA.getInput('INPUT').connection.connect(blockB.outputConnection);

      var actualConnnection = Blockly.connUtils
          .getLastCompatibleRowConnection(blockA, blockB);

      chai.assert.equal(actualConnnection, null);
    });
  });
  suite('Last Stack Connection', function() {
    test('Has Last Connection', function() {
      var blockA = this.workspace.newBlock('empty_block');
      var blockB = this.workspace.newBlock('empty_block');

      blockA.setNextStatement(true);
      blockB.setPreviousStatement(true);
      blockB.setNextStatement(true);

      blockA.nextConnection.connect(blockB.previousConnection);

      var expectedConnection = blockB.nextConnection;
      var actualConnection = Blockly.connUtils.getLastStackConnection(blockA);

      chai.assert.equal(actualConnection, expectedConnection);
    });
    test('Has No Last Connection', function() {
      var blockA = this.workspace.newBlock('empty_block');
      var blockB = this.workspace.newBlock('empty_block');

      blockA.setNextStatement(true);
      blockB.setPreviousStatement(true);

      blockA.nextConnection.connect(blockB.previousConnection);

      var actualConnection = Blockly.connUtils.getLastStackConnection(blockA);

      chai.assert.equal(actualConnection, null);
    });
  });
});
