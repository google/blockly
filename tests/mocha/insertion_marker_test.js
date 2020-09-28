/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

suite('InsertionMarkers', function() {
  setup(function() {
    sharedTestSetup.call(this);
    this.workspace = Blockly.inject('blocklyDiv', {});
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
    sharedTestTeardown.call(this);
  });
  suite('Code Generation', function() {
    setup(function() {
      Blockly.JavaScript['stack_block'] = function(block) {
        return 'stack[' + block.id + '];\n';
      };
      Blockly.JavaScript['row_block'] = function(block) {
        var value = Blockly.JavaScript
            .valueToCode(block, 'INPUT', Blockly.JavaScript.ORDER_NONE);
        var code = 'row[' + block.id + '](' + value + ')';
        return [code, Blockly.JavaScript.ORDER_NONE];
      };
      Blockly.JavaScript['statement_block'] = function(block) {
        return 'statement[' + block.id + ']{\n' + Blockly.JavaScript
            .statementToCode(block, 'STATEMENT') + '};\n';
      };

      this.assertGen = function(xml, expectedCode) {
        Blockly.Xml.domToWorkspace(xml, this.workspace);
        var block = this.workspace.getBlockById('insertion');
        block.isInsertionMarker_ = true;
        var code = Blockly.JavaScript.workspaceToCode(this.workspace);
        chai.assert.equal(code, expectedCode);
      };
    });
    teardown(function() {
      delete Blockly.JavaScript['stack_block'];
      delete Blockly.JavaScript['row_block'];
      delete Blockly.JavaScript['statement_block'];
    });
    test('Marker Surrounds', function() {
      var xml = Blockly.Xml.textToDom(
          '<xml xmlns="https://developers.google.com/blockly/xml">' +
          '  <block type="statement_block" id="insertion">' +
          '    <statement name="STATEMENT">' +
          '      <block type="statement_block" id="a"/>' +
          '    </statement>' +
          '  </block>' +
          '</xml>');
      this.assertGen(xml, 'statement[a]{\n};\n');
    });
    test('Marker Enclosed', function() {
      var xml = Blockly.Xml.textToDom(
          '<xml xmlns="https://developers.google.com/blockly/xml">' +
          '  <block type="statement_block" id="a">' +
          '    <statement name="STATEMENT">' +
          '      <block type="statement_block" id="insertion"/>' +
          '    </statement>' +
          '  </block>' +
          '</xml>');
      this.assertGen(xml, 'statement[a]{\n};\n');
    });
    test('Marker Enclosed and Surrounds', function() {
      var xml = Blockly.Xml.textToDom(
          '<xml xmlns="https://developers.google.com/blockly/xml">' +
          '  <block type="statement_block" id="a">' +
          '    <statement name="STATEMENT">' +
          '      <block type="statement_block" id="insertion">' +
          '        <statement name="STATEMENT">' +
          '          <block type="statement_block" id="b"/>' +
          '        </statement>' +
          '      </block>' +
          '    </statement>' +
          '  </block>' +
          '</xml>');
      this.assertGen(xml,
          'statement[a]{\n' +
          '  statement[b]{\n' +
          '  };\n' +
          '};\n');
    });
    test('Marker Prev', function() {
      var xml = Blockly.Xml.textToDom(
          '<xml xmlns="https://developers.google.com/blockly/xml">' +
          '  <block type="stack_block" id="insertion">' +
          '    <next>' +
          '      <block type="stack_block" id="a"/>' +
          '    </next>' +
          '  </block>' +
          '</xml>');
      this.assertGen(xml, 'stack[a];\n');
    });
    test('Marker Next', function() {
      var xml = Blockly.Xml.textToDom(
          '<xml xmlns="https://developers.google.com/blockly/xml">' +
          '  <block type="stack_block" id="a">' +
          '    <next>' +
          '      <block type="stack_block" id="insertion"/>' +
          '    </next>' +
          '  </block>' +
          '</xml>');
      this.assertGen(xml, 'stack[a];\n');
    });
    test('Marker Middle of Stack', function() {
      var xml = Blockly.Xml.textToDom(
          '<xml xmlns="https://developers.google.com/blockly/xml">' +
          '  <block type="stack_block" id="a">' +
          '    <next>' +
          '      <block type="stack_block" id="insertion">' +
          '        <next>' +
          '          <block type="stack_block" id="b"/>' +
          '        </next>' +
          '      </block>' +
          '    </next>' +
          '  </block>' +
          '</xml>');
      this.assertGen(xml,
          'stack[a];\n' +
          'stack[b];\n');
    });
    test('Marker On Output', function() {
      var xml = Blockly.Xml.textToDom(
          '<xml xmlns="https://developers.google.com/blockly/xml">' +
          '  <block type="row_block" id="insertion">' +
          '    <value name="INPUT">' +
          '      <block type="row_block" id="a"/>' +
          '    </value>' +
          '  </block>' +
          '</xml>');
      this.assertGen(xml, 'row[a]();\n');
    });
    test('Marker On Input', function() {
      var xml = Blockly.Xml.textToDom(
          '<xml xmlns="https://developers.google.com/blockly/xml">' +
          '  <block type="row_block" id="a">' +
          '    <value name="INPUT">' +
          '      <block type="row_block" id="insertion"/>' +
          '    </value>' +
          '  </block>' +
          '</xml>');
      this.assertGen(xml, 'row[a]();\n');
    });
    test('Marker Middle of Row', function() {
      var xml = Blockly.Xml.textToDom(
          '<xml xmlns="https://developers.google.com/blockly/xml">' +
          '  <block type="row_block" id="a">' +
          '    <value name="INPUT">' +
          '      <block type="row_block" id="insertion">' +
          '        <value name="INPUT">' +
          '          <block type="row_block" id="b"/>' +
          '        </value>' +
          '      </block>' +
          '    </value>' +
          '  </block>' +
          '</xml>');
      this.assertGen(xml, 'row[a](row[b]());\n');
    });
    test('Marker Detatched', function() {
      var xml = Blockly.Xml.textToDom(
          '<xml xmlns="https://developers.google.com/blockly/xml">' +
          '  <block type="stack_block" id="insertion"/>' +
          '  <block type="stack_block" id="a"/>' +
          '</xml>');
      this.assertGen(xml, 'stack[a];\n');
    });
  });
  suite.skip('Serialization', function() {
    // TODO(#4116): Re-enable after addressing bug
    setup(function() {
      this.assertXml = function(xml, expectXml) {
        Blockly.Xml.domToWorkspace(xml, this.workspace);
        var block = this.workspace.getBlockById('insertion');
        block.setInsertionMarker(true);
        var xml = Blockly.Xml.workspaceToDom(this.workspace);
        Blockly.Xml.domToWorkspace(xml, this.workspace);
        xml = Blockly.Xml.domToText(xml);
        chai.assert.equal(xml, expectXml);
      };
    });
    test('Marker Surrounds', function() {
      var xml = Blockly.Xml.textToDom(
          '<xml xmlns="https://developers.google.com/blockly/xml">' +
          '  <block type="statement_block" id="insertion" x="20" y="20">' +
          '    <statement name="STATEMENT">' +
          '      <block type="statement_block" id="a"/>' +
          '    </statement>' +
          '  </block>' +
          '</xml>');
      // Note how the x and y are not 20, they are slightly lower and end-er
      // because these are the coords of the wrapped block.
      this.assertXml(xml,
          '<xml xmlns="https://developers.google.com/blockly/xml">' +
          '<block type="statement_block" id="a" x="41" y="31"></block>' +
          '</xml>');
    });
    test('Marker Enclosed', function() {
      var xml = Blockly.Xml.textToDom(
          '<xml xmlns="https://developers.google.com/blockly/xml">' +
          '  <block type="statement_block" id="a" x="20" y="20">' +
          '    <statement name="STATEMENT">' +
          '      <block type="statement_block" id="insertion"/>' +
          '    </statement>' +
          '  </block>' +
          '</xml>');
      this.assertXml(xml,
          '<xml xmlns="https://developers.google.com/blockly/xml">' +
          '<block type="statement_block" id="a" x="20" y="20"></block>' +
          '</xml>');
    });
    test('Marker Enclosed and Surrounds', function() {
      var xml = Blockly.Xml.textToDom(
          '<xml xmlns="https://developers.google.com/blockly/xml">' +
          '  <block type="statement_block" id="a" x="20" y="20">' +
          '    <statement name="STATEMENT">' +
          '      <block type="statement_block" id="insertion">' +
          '        <statement name="STATEMENT">' +
          '          <block type="statement_block" id="b"/>' +
          '        </statement>' +
          '      </block>' +
          '    </statement>' +
          '  </block>' +
          '</xml>');
      this.assertXml(xml,
          '<xml xmlns="https://developers.google.com/blockly/xml">' +
          '<block type="statement_block" id="a" x="20" y="20">' +
          '<statement name="STATEMENT">' +
          '<block type="statement_block" id="b"></block>' +
          '</statement>' +
          '</block>' +
          '</xml>');
    });
    test('Marker Prev', function() {
      var xml = Blockly.Xml.textToDom(
          '<xml xmlns="https://developers.google.com/blockly/xml">' +
          '  <block type="stack_block" id="insertion" x="20" y="20">' +
          '    <next>' +
          '      <block type="stack_block" id="a"/>' +
          '    </next>' +
          '  </block>' +
          '</xml>');
      // Note how the y coord is not at 20, it is lower. This is because these
      // are the coords of the next block.
      this.assertXml(xml,
          '<xml xmlns="https://developers.google.com/blockly/xml">' +
          '<block type="stack_block" id="a" x="20" y="46"></block>' +
          '</xml>');
    });
    test('Marker Next', function() {
      var xml = Blockly.Xml.textToDom(
          '<xml xmlns="https://developers.google.com/blockly/xml">' +
          '  <block type="stack_block" id="a" x="20" y="20">' +
          '    <next>' +
          '      <block type="stack_block" id="insertion"/>' +
          '    </next>' +
          '  </block>' +
          '</xml>');
      this.assertXml(xml,
          '<xml xmlns="https://developers.google.com/blockly/xml">' +
          '<block type="stack_block" id="a" x="20" y="20"></block>' +
          '</xml>');
    });
    test('Marker Middle of Stack', function() {
      var xml = Blockly.Xml.textToDom(
          '<xml xmlns="https://developers.google.com/blockly/xml">' +
          '  <block type="stack_block" id="a" x="20" y="20">' +
          '    <next>' +
          '      <block type="stack_block" id="insertion">' +
          '        <next>' +
          '          <block type="stack_block" id="b"/>' +
          '        </next>' +
          '      </block>' +
          '    </next>' +
          '  </block>' +
          '</xml>');
      this.assertXml(xml,
          '<xml xmlns="https://developers.google.com/blockly/xml">' +
          '<block type="stack_block" id="a" x="20" y="20">' +
          '<next>' +
          '<block type="stack_block" id="b"></block>' +
          '</next>' +
          '</block>' +
          '</xml>');
    });
    test('Marker On Output', function() {
      var xml = Blockly.Xml.textToDom(
          '<xml xmlns="https://developers.google.com/blockly/xml">' +
          '  <block type="row_block" id="insertion" x="20" y="20">' +
          '    <value name="INPUT">' +
          '      <block type="row_block" id="a"/>' +
          '    </value>' +
          '  </block>' +
          '</xml>');
      // Note how the x value is not at 20. This is because these are the coords
      // of the wrapped block.
      this.assertXml(xml,
          '<xml xmlns="https://developers.google.com/blockly/xml">' +
          '<block type="row_block" id="a" x="41" y="20"></block>' +
          '</xml>');
    });
    test('Marker On Input', function() {
      var xml = Blockly.Xml.textToDom(
          '<xml xmlns="https://developers.google.com/blockly/xml">' +
          '  <block type="row_block" id="a" x="20" y="20">' +
          '    <value name="INPUT">' +
          '      <block type="row_block" id="insertion"/>' +
          '    </value>' +
          '  </block>' +
          '</xml>');
      this.assertXml(xml,
          '<xml xmlns="https://developers.google.com/blockly/xml">' +
          '<block type="row_block" id="a" x="20" y="20"></block>' +
          '</xml>');
    });
    test('Marker Middle of Row', function() {
      var xml = Blockly.Xml.textToDom(
          '<xml xmlns="https://developers.google.com/blockly/xml">' +
          '  <block type="row_block" id="a" x="20" y="20">' +
          '    <value name="INPUT">' +
          '      <block type="row_block" id="insertion">' +
          '        <value name="INPUT">' +
          '          <block type="row_block" id="b"/>' +
          '        </value>' +
          '      </block>' +
          '    </value>' +
          '  </block>' +
          '</xml>');
      this.assertXml(xml,
          '<xml xmlns="https://developers.google.com/blockly/xml">' +
          '<block type="row_block" id="a" x="20" y="20">' +
          '<value name="INPUT">' +
          '<block type="row_block" id="b"></block>' +
          '</value>' +
          '</block>' +
          '</xml>');
    });
    test('Marker Detatched', function() {
      var xml = Blockly.Xml.textToDom(
          '<xml xmlns="https://developers.google.com/blockly/xml">' +
          '  <block type="stack_block" id="insertion"/>' +
          '  <block type="stack_block" id="a" x="20" y="20"/>' +
          '</xml>');
      this.assertXml(xml,
          '<xml xmlns="https://developers.google.com/blockly/xml">' +
          '<block type="stack_block" id="a" x="20" y="20"></block>' +
          '</xml>');
    });
  });
});
