/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/** @fileoverview Mocha tests that test Blockly in Node. */

console.log(process.cwd());

// N.B. the file ./node_modules/blockly-test should be a symlink to
// RELEASE_DIR (i.e. dist/) so that require will load the packaged
// version of blockly as if it were an external dependency.
//
// Moreover, (as with the typescript tests) this link has to be
// called something other than "blockly", because the node module
// resolution will favour loading the nearest enclosing package
// of the same name, which means that require('blockly') will load
// based on the exports section of the package.json in the repository
// root, but this fails because (at the time of writing) those paths
// are relative to RELEASE_DIR (dist/, into which package.json is
// copied when packaged), resulting in require() looking for the
// compressed bundles in the wrong place.

import * as Blockly from 'blockly-test';
import {javascriptGenerator} from 'blockly-test/javascript';
import {assert} from 'chai';

const xmlText =
  '<xml xmlns="https://developers.google.com/blockly/xml">\n' +
  '  <block type="text_print" x="37" y="63">\n' +
  '    <value name="TEXT">\n' +
  '      <shadow type="text">\n' +
  '        <field name="TEXT">Hello from Blockly!</field>\n' +
  '      </shadow>\n' +
  '    </value>\n' +
  '  </block>\n' +
  '</xml>';

suite('Test Node.js', function () {
  test('Import XML', function () {
    const xml = Blockly.utils.xml.textToDom(xmlText);

    // Create workspace and import the XML
    const workspace = new Blockly.Workspace();
    Blockly.Xml.domToWorkspace(xml, workspace);
  });
  test('Roundtrip XML', function () {
    const xml = Blockly.utils.xml.textToDom(xmlText);

    const workspace = new Blockly.Workspace();
    Blockly.Xml.domToWorkspace(xml, workspace);

    const headlessXml = Blockly.Xml.workspaceToDom(workspace, true);
    const headlessText = Blockly.Xml.domToPrettyText(headlessXml);

    assert.equal(headlessText, xmlText, 'equal');
  });
  test('Generate Code', function () {
    const xml = Blockly.utils.xml.textToDom(xmlText);

    // Create workspace and import the XML
    const workspace = new Blockly.Workspace();
    Blockly.Xml.domToWorkspace(xml, workspace);

    // Convert code
    const code = javascriptGenerator.workspaceToCode(workspace);

    // Check output
    assert.equal("window.alert('Hello from Blockly!');", code.trim(), 'equal');
  });
});
