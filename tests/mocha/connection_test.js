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

suite('Connections', function() {
  suite('Can Connect With Reason', function() {
    test('Target Null', function() {
      var connection = new Blockly.Connection({}, Blockly.INPUT_VALUE);
      chai.assert.equal(connection.canConnectWithReason_(null),
          Blockly.Connection.REASON_TARGET_NULL);
    });
    test('Target Self', function() {
      var block = {workspace: 1};
      var connection1 = new Blockly.Connection(block, Blockly.INPUT_VALUE);
      var connection2 = new Blockly.Connection(block, Blockly.OUTPUT_VALUE);

      chai.assert.equal(connection1.canConnectWithReason_(connection2),
          Blockly.Connection.REASON_SELF_CONNECTION);
    });
    test('Different Workspaces', function() {
      var connection1 = new Blockly.Connection(
          {workspace: 1}, Blockly.INPUT_VALUE);
      var connection2 = new Blockly.Connection(
          {workspace: 2}, Blockly.OUTPUT_VALUE);

      chai.assert.equal(connection1.canConnectWithReason_(connection2),
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
        chai.assert.equal(this.previous.canConnectWithReason_(this.next),
            Blockly.Connection.CAN_CONNECT);
      });
      test('Previous, Output', function() {
        chai.assert.equal(this.previous.canConnectWithReason_(this.output),
            Blockly.Connection.REASON_WRONG_TYPE);
      });
      test('Previous, Input', function() {
        chai.assert.equal(this.previous.canConnectWithReason_(this.input),
            Blockly.Connection.REASON_WRONG_TYPE);
      });
      test('Next, Previous', function() {
        chai.assert.equal(this.next.canConnectWithReason_(this.previous),
            Blockly.Connection.CAN_CONNECT);
      });
      test('Next, Output', function() {
        chai.assert.equal(this.next.canConnectWithReason_(this.output),
            Blockly.Connection.REASON_WRONG_TYPE);
      });
      test('Next, Input', function() {
        chai.assert.equal(this.next.canConnectWithReason_(this.input),
            Blockly.Connection.REASON_WRONG_TYPE);
      });
      test('Output, Previous', function() {
        chai.assert.equal(this.output.canConnectWithReason_(this.previous),
            Blockly.Connection.REASON_WRONG_TYPE);
      });
      test('Output, Next', function() {
        chai.assert.equal(this.output.canConnectWithReason_(this.next),
            Blockly.Connection.REASON_WRONG_TYPE);
      });
      test('Output, Input', function() {
        chai.assert.equal(this.output.canConnectWithReason_(this.input),
            Blockly.Connection.CAN_CONNECT);
      });
      test('Input, Previous', function() {
        chai.assert.equal(this.input.canConnectWithReason_(this.previous),
            Blockly.Connection.REASON_WRONG_TYPE);
      });
      test('Input, Next', function() {
        chai.assert.equal(this.input.canConnectWithReason_(this.next),
            Blockly.Connection.REASON_WRONG_TYPE);
      });
      test('Input, Output', function() {
        chai.assert.equal(this.input.canConnectWithReason_(this.output),
            Blockly.Connection.CAN_CONNECT);
      });
    });
    suite('Shadows', function() {
      test('Previous Shadow', function() {
        var prevBlock = { isShadow: function() { return true; }};
        var nextBlock = { isShadow: function() { return false; }};
        var prev = new Blockly.Connection(prevBlock, Blockly.PREVIOUS_STATEMENT);
        var next = new Blockly.Connection(nextBlock, Blockly.NEXT_STATEMENT);

        chai.assert.equal(prev.canConnectWithReason_(next),
            Blockly.Connection.CAN_CONNECT);
      });
      test('Next Shadow', function() {
        var prevBlock = { isShadow: function() { return false; }};
        var nextBlock = { isShadow: function() { return true; }};
        var prev = new Blockly.Connection(prevBlock, Blockly.PREVIOUS_STATEMENT);
        var next = new Blockly.Connection(nextBlock, Blockly.NEXT_STATEMENT);

        chai.assert.equal(prev.canConnectWithReason_(next),
            Blockly.Connection.REASON_SHADOW_PARENT);
      });
      test('Prev and Next Shadow', function() {
        var prevBlock = { isShadow: function() { return true; }};
        var nextBlock = { isShadow: function() { return true; }};
        var prev = new Blockly.Connection(prevBlock, Blockly.PREVIOUS_STATEMENT);
        var next = new Blockly.Connection(nextBlock, Blockly.NEXT_STATEMENT);

        chai.assert.equal(prev.canConnectWithReason_(next),
            Blockly.Connection.CAN_CONNECT);
      });
      test('Output Shadow', function() {
        var outBlock = { isShadow: function() { return true; }};
        var inBlock = { isShadow: function() { return false; }};
        var outCon = new Blockly.Connection(outBlock, Blockly.OUTPUT_VALUE);
        var inCon = new Blockly.Connection(inBlock, Blockly.INPUT_VALUE);

        chai.assert.equal(outCon.canConnectWithReason_(inCon),
            Blockly.Connection.CAN_CONNECT);
      });
      test('Input Shadow', function() {
        var outBlock = { isShadow: function() { return false; }};
        var inBlock = { isShadow: function() { return true; }};
        var outCon = new Blockly.Connection(outBlock, Blockly.OUTPUT_VALUE);
        var inCon = new Blockly.Connection(inBlock, Blockly.INPUT_VALUE);

        chai.assert.equal(outCon.canConnectWithReason_(inCon),
            Blockly.Connection.REASON_SHADOW_PARENT);
      });
      test('Output and Input Shadow', function() {
        var outBlock = { isShadow: function() { return true; }};
        var inBlock = { isShadow: function() { return true; }};
        var outCon = new Blockly.Connection(outBlock, Blockly.OUTPUT_VALUE);
        var inCon = new Blockly.Connection(inBlock, Blockly.INPUT_VALUE);

        chai.assert.equal(outCon.canConnectWithReason_(inCon),
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
      chai.assert.isTrue(this.con1.checkType_(this.con2));
    });
    test('Same Type', function() {
      this.con1.setCheck('type1');
      this.con2.setCheck('type1');
      chai.assert.isTrue(this.con1.checkType_(this.con2));
    });
    test('Same Types', function() {
      this.con1.setCheck(['type1', 'type2']);
      this.con2.setCheck(['type1', 'type2']);
      chai.assert.isTrue(this.con1.checkType_(this.con2));
    });
    test('Single Same Type', function() {
      this.con1.setCheck(['type1', 'type2']);
      this.con2.setCheck(['type1', 'type3']);
      chai.assert.isTrue(this.con1.checkType_(this.con2));
    });
    test('One Typed, One Promiscuous', function() {
      this.con1.setCheck('type1');
      chai.assert.isTrue(this.con1.checkType_(this.con2));
    });
    test('No Compatible Types', function() {
      this.con1.setCheck('type1');
      this.con2.setCheck('type2');
      chai.assert.isFalse(this.con1.checkType_(this.con2));
    });
  });
});
