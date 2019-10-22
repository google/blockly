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

/**
 * @fileoverview Mocha tests that test Blockly in Node.
 */

var assert = require('chai').assert;
var Blockly = require('../../dist/');

var xmlText = '<xml xmlns="https://developers.google.com/blockly/xml">\n' +
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
    var xml = Blockly.Xml.textToDom(xmlText);

    // Create workspace and import the XML
    var workspace = new Blockly.Workspace();
    Blockly.Xml.domToWorkspace(xml, workspace);
  });
  test('Roundtrip XML', function() {
    var xml = Blockly.Xml.textToDom(xmlText);

    var workspace = new Blockly.Workspace();
    Blockly.Xml.domToWorkspace(xml, workspace);

    var headlessXml = Blockly.Xml.workspaceToDom(workspace, true);
    var headlessText = Blockly.Xml.domToPrettyText(headlessXml);

    assert.equal(headlessText, xmlText, 'equal');
  });
  test('Generate Code', function() {
    var xml = Blockly.Xml.textToDom(xmlText);

    // Create workspace and import the XML
    var workspace = new Blockly.Workspace();
    Blockly.Xml.domToWorkspace(xml, workspace);

    // Convert code
    var code = Blockly.JavaScript.workspaceToCode(workspace);
    
    // Check output
    assert.equal('window.alert(\'Hello from Blockly!\');', code.trim(), 'equal');
  });
});

