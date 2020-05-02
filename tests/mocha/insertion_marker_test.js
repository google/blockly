/**
 * @license
 * Copyright 2019 Google LLC
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
      Blockly.JavaScript['stack_block'] = function(_) {
        return 'stack;\n';
      };
      Blockly.JavaScript['row_block'] = function(block) {
        var value = Blockly.JavaScript
            .valueToCode(block, 'INPUT', Blockly.JavaScript.ORDER_NONE);
        var code = 'row(' + value + ')';
        return [code, Blockly.JavaScript.ORDER_NONE];
      };
      Blockly.JavaScript['statement_block'] = function(block) {
        return 'statement{\n' + Blockly.JavaScript
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
          '      <block type="statement_block"/>' +
          '    </statement>' +
          '  </block>' +
          '</xml>');
      this.assertGen(xml, 'statement{\n};\n');
    });
    test('Marker Enclosed', function() {
      var xml = Blockly.Xml.textToDom(
          '<xml xmlns="https://developers.google.com/blockly/xml">' +
          '  <block type="statement_block">' +
          '    <statement name="STATEMENT">' +
          '      <block type="statement_block" id="insertion"/>' +
          '    </statement>' +
          '  </block>' +
          '</xml>');
      this.assertGen(xml, 'statement{\n};\n');
    });
    test('Marker Enclosed and Surrounds', function() {
      var xml = Blockly.Xml.textToDom(
          '<xml xmlns="https://developers.google.com/blockly/xml">' +
          '  <block type="statement_block">' +
          '    <statement name="STATEMENT">' +
          '      <block type="statement_block" id="insertion">' +
          '        <statement name="STATEMENT">' +
          '          <block type="statement_block"/>' +
          '        </statement>' +
          '      </block>' +
          '    </statement>' +
          '  </block>' +
          '</xml>');
      this.assertGen(xml,
          'statement{\n' +
          '  statement{\n' +
          '  };\n' +
          '};\n');
    });
    test('Marker Prev', function() {
      var xml = Blockly.Xml.textToDom(
          '<xml xmlns="https://developers.google.com/blockly/xml">' +
          '  <block type="stack_block" id="insertion">' +
          '    <next>' +
          '      <block type="stack_block"/>' +
          '    </next>' +
          '  </block>' +
          '</xml>');
      this.assertGen(xml, 'stack;\n');
    });
    test('Marker Next', function() {
      var xml = Blockly.Xml.textToDom(
          '<xml xmlns="https://developers.google.com/blockly/xml">' +
          '  <block type="stack_block">' +
          '    <next>' +
          '      <block type="stack_block" id="insertion"/>' +
          '    </next>' +
          '  </block>' +
          '</xml>');
      this.assertGen(xml, 'stack;\n');
    });
    test('Marker Middle of Stack', function() {
      var xml = Blockly.Xml.textToDom(
          '<xml xmlns="https://developers.google.com/blockly/xml">' +
          '  <block type="stack_block">' +
          '    <next>' +
          '      <block type="stack_block" id="insertion">' +
          '        <next>' +
          '          <block type="stack_block"/>' +
          '        </next>' +
          '      </block>' +
          '    </next>' +
          '  </block>' +
          '</xml>');
      this.assertGen(xml,
          'stack;\n' +
          'stack;\n');
    });
    test('Marker On Output', function() {
      var xml = Blockly.Xml.textToDom(
          '<xml xmlns="https://developers.google.com/blockly/xml">' +
          '  <block type="row_block" id="insertion">' +
          '    <value name="INPUT">' +
          '      <block type="row_block"/>' +
          '    </value>' +
          '  </block>' +
          '</xml>');
      this.assertGen(xml, 'row();\n');
    });
    test('Marker On Input', function() {
      var xml = Blockly.Xml.textToDom(
          '<xml xmlns="https://developers.google.com/blockly/xml">' +
          '  <block type="row_block">' +
          '    <value name="INPUT">' +
          '      <block type="row_block" id="insertion"/>' +
          '    </value>' +
          '  </block>' +
          '</xml>');
      this.assertGen(xml, 'row();\n');
    });
    test('Marker Middle of Row', function() {
      var xml = Blockly.Xml.textToDom(
          '<xml xmlns="https://developers.google.com/blockly/xml">' +
          '  <block type="row_block">' +
          '    <value name="INPUT">' +
          '      <block type="row_block" id="insertion">' +
          '        <value name="INPUT">' +
          '          <block type="row_block"/>' +
          '        </value>' +
          '      </block>' +
          '    </value>' +
          '  </block>' +
          '</xml>');
      this.assertGen(xml, 'row(row());\n');
    });
    test('Marker Detatched', function() {
      var xml = Blockly.Xml.textToDom(
          '<xml xmlns="https://developers.google.com/blockly/xml">' +
          '  <block type="stack_block" id="insertion"/>' +
          '  <block type="stack_block"/>' +
          '</xml>');
      this.assertGen(xml, 'stack;\n');
    });
  });
});
