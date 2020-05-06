/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

suite('InsertionMarkers', function() {
  setup(function() {
    this.workspace = new Blockly.Workspace();
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
    this.workspace.dispose();
    delete Blockly.Blocks['stack_block'];
    delete Blockly.Blocks['row_block'];
    delete Blockly.Blocks['statement_block'];
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
      delete this.assertGen;
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
  suite('Serialization', function() {
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
    teardown(function() {
      delete this.assertXml;
    });
    test('Marker Surrounds', function() {
      var xml = Blockly.Xml.textToDom(
          '<xml xmlns="https://developers.google.com/blockly/xml">' +
          '  <block type="statement_block" id="insertion" x="10" y="10">' +
          '    <statement name="STATEMENT">' +
          '      <block type="statement_block" id="a"/>' +
          '    </statement>' +
          '  </block>' +
          '</xml>');
      // The block wouldn't technically be at 10, it would be slightly lower
      // and end-er but I think that's a fair compromise when we're comparing
      // it against extra blocks.
      this.assertXml(xml,
          '<xml xmlns="https://developers.google.com/blockly/xml">' +
          '<block type="statement_block" id="a" x="10" y="10"></block>' +
          '</xml>');
    });
    test('Marker Enclosed', function() {
      var xml = Blockly.Xml.textToDom(
          '<xml xmlns="https://developers.google.com/blockly/xml">' +
          '  <block type="statement_block" id="a" x="10" y="10">' +
          '    <statement name="STATEMENT">' +
          '      <block type="statement_block" id="insertion"/>' +
          '    </statement>' +
          '  </block>' +
          '</xml>');
      this.assertXml(xml,
          '<xml xmlns="https://developers.google.com/blockly/xml">' +
          '<block type="statement_block" id="a" x="10" y="10"></block>' +
          '</xml>');
    });
    test('Marker Enclosed and Surrounds', function() {
      var xml = Blockly.Xml.textToDom(
          '<xml xmlns="https://developers.google.com/blockly/xml">' +
          '  <block type="statement_block" id="a" x="10" y="10">' +
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
          '<block type="statement_block" id="a" x="10" y="10">' +
          '<statement name="STATEMENT">' +
          '<block type="statement_block" id="b"></block>' +
          '</statement>' +
          '</block>' +
          '</xml>');
    });
    test('Marker Prev', function() {
      var xml = Blockly.Xml.textToDom(
          '<xml xmlns="https://developers.google.com/blockly/xml">' +
          '  <block type="stack_block" id="insertion" x="10" y="10">' +
          '    <next>' +
          '      <block type="stack_block" id="a"/>' +
          '    </next>' +
          '  </block>' +
          '</xml>');
      // The block wouldn't technically be at 10, it would be slightly lower
      // but I think that's a fair compromise when we're comparing
      // it against extra blocks.
      this.assertXml(xml,
          '<xml xmlns="https://developers.google.com/blockly/xml">' +
          '<block type="stack_block" id="a" x="10" y="10"></block>' +
          '</xml>');
    });
    test('Marker Next', function() {
      var xml = Blockly.Xml.textToDom(
          '<xml xmlns="https://developers.google.com/blockly/xml">' +
          '  <block type="stack_block" id="a" x="10" y="10">' +
          '    <next>' +
          '      <block type="stack_block" id="insertion"/>' +
          '    </next>' +
          '  </block>' +
          '</xml>');
      this.assertXml(xml,
          '<xml xmlns="https://developers.google.com/blockly/xml">' +
          '<block type="stack_block" id="a" x="10" y="10"></block>' +
          '</xml>');
    });
    test('Marker Middle of Stack', function() {
      var xml = Blockly.Xml.textToDom(
          '<xml xmlns="https://developers.google.com/blockly/xml">' +
          '  <block type="stack_block" id="a" x="10" y="10">' +
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
          '<block type="stack_block" id="a" x="10" y="10">' +
          '<next>' +
          '<block type="stack_block" id="b"></block>' +
          '</next>' +
          '</block>' +
          '</xml>');
    });
    test('Marker On Output', function() {
      var xml = Blockly.Xml.textToDom(
          '<xml xmlns="https://developers.google.com/blockly/xml">' +
          '  <block type="row_block" id="insertion" x="10" y="10">' +
          '    <value name="INPUT">' +
          '      <block type="row_block" id="a"/>' +
          '    </value>' +
          '  </block>' +
          '</xml>');
      // The block wouldn't technically be at 10, it would be slightly end-er
      // but I think that's a fair compromise when we're comparing
      // it against extra blocks.
      this.assertXml(xml,
          '<xml xmlns="https://developers.google.com/blockly/xml">' +
          '<block type="row_block" id="a" x="10" y="10"></block>' +
          '</xml>');
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
      this.assertXml(xml,
          '<xml xmlns="https://developers.google.com/blockly/xml">' +
          '<block type="row_block" id="a" x="10" y="10"></block>' +
          '</xml>');
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
      this.assertXml(xml,
          '<xml xmlns="https://developers.google.com/blockly/xml">' +
          '<block type="row_block" id="a" x="10" y="10">' +
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
          '  <block type="stack_block" id="a" x="10" y="10"/>' +
          '</xml>');
      this.assertXml(xml,
          '<xml xmlns="https://developers.google.com/blockly/xml">' +
          '<block type="stack_block" id="a" x="10" y="10"></block>' +
          '</xml>');
    });
  });
});
