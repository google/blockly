/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Helper for populating the workspace with nested if-statement
 * blocks, for testing.
 * @author samelh@google.com (Sam El-Husseini)
 */
import * as Blockly from 'blockly/core';

const spaghettiXml = [
  '  <block type="controls_if">',
  '    <value name="IF0">',
  '      <block type="logic_compare">',
  '        <field name="OP">EQ</field>',
  '        <value name="A">',
  '          <block type="math_arithmetic">',
  '            <field name="OP">MULTIPLY</field>',
  '            <value name="A">',
  '              <block type="math_number">',
  '                <field name="NUM">6</field>',
  '              </block>',
  '            </value>',
  '            <value name="B">',
  '              <block type="math_number">',
  '                <field name="NUM">7</field>',
  '              </block>',
  '            </value>',
  '          </block>',
  '        </value>',
  '        <value name="B">',
  '          <block type="math_number">',
  '            <field name="NUM">42</field>',
  '          </block>',
  '        </value>',
  '      </block>',
  '    </value>',
  '    <statement name="DO0"></statement>',
  '    <next></next>',
  '  </block>',
].join('\n');

/**
 * Populate the workspace with nested if-statement blocks, for testing.
 * @param {Blockly.Workspace} workspace The workspace to populate.
 * @param {number} depth How many layers of nesting to create.
 */
export function spaghetti(workspace, depth) {
  let xml = spaghettiXml;
  for (let i = 0; i < depth; i++) {
    xml = xml.replace(
      /(<(statement|next)( name="DO0")?>)<\//g,
      '$1' + spaghettiXml + '</',
    );
  }
  xml =
    '<xml xmlns="https://developers.google.com/blockly/xml">' + xml + '</xml>';
  const dom = Blockly.utils.xml.textToDom(xml);
  console.time('Spaghetti domToWorkspace');
  Blockly.Xml.domToWorkspace(dom, workspace);
  console.timeEnd('Spaghetti domToWorkspace');
}
