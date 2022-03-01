/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Mocha tests that test Blockly in Node.
 */

const assert = require('chai').assert;
const Blockly = require('../../dist/');

const xmlText = '<xml xmlns="https://developers.google.com/blockly/xml">\n' +
'  <block type="text_print" x="37" y="63">\n' +
'    <value name="TEXT">\n' +
'      <shadow type="text">\n' +
'        <field name="TEXT">Hello from Blockly!</field>\n' +
'      </shadow>\n' +
'    </value>\n' +
'  </block>\n' +
'</xml>';

suite('Test Node.js', function() {
  test('Import XML', function() {
    const xml = Blockly.Xml.textToDom(xmlText);

    // Create workspace and import the XML
    const workspace = new Blockly.Workspace();
    Blockly.Xml.domToWorkspace(xml, workspace);
  });
  test('Roundtrip XML', function() {
    const xml = Blockly.Xml.textToDom(xmlText);

    const workspace = new Blockly.Workspace();
    Blockly.Xml.domToWorkspace(xml, workspace);

    const headlessXml = Blockly.Xml.workspaceToDom(workspace, true);
    const headlessText = Blockly.Xml.domToPrettyText(headlessXml);

    assert.equal(headlessText, xmlText, 'equal');
  });
  test('Generate Code', function() {
    const xml = Blockly.Xml.textToDom(xmlText);

    // Create workspace and import the XML
    const workspace = new Blockly.Workspace();
    Blockly.Xml.domToWorkspace(xml, workspace);

    // Convert code
    const code = Blockly.JavaScript.workspaceToCode(workspace);

    // Check output
    assert.equal('window.alert(\'Hello from Blockly!\');', code.trim(), 'equal');
  });
});

