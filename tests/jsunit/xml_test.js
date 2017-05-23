/**
 * @license
 * Blockly Tests
 *
 * Copyright 2014 Google Inc.
 * https://developers.google.com/blockly/
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
'use strict';

goog.require('goog.testing');
goog.require('goog.testing.MockControl');

var mockControl_;
var saved_msg = Blockly.Msg.DELETE_VARIABLE;
var workspace;
var XML_TEXT = ['<xml xmlns="http://www.w3.org/1999/xhtml">',
  '  <block type="controls_repeat_ext" inline="true" x="21" y="23">',
  '    <value name="TIMES">',
  '      <block type="math_number">',
  '        <field name="NUM">10</field>',
  '      </block>',
  '    </value>',
  '    <statement name="DO">',
  '      <block type="variables_set" inline="true">',
  '        <field name="VAR">item</field>',
  '        <value name="VALUE">',
  '          <block type="lists_create_empty"></block>',
  '        </value>',
  '        <next>',
  '          <block type="text_print" inline="false">',
  '            <value name="TEXT">',
  '              <block type="text">',
  '                <field name="TEXT">Hello</field>',
  '              </block>',
  '            </value>',
  '          </block>',
  '        </next>',
  '      </block>',
  '    </statement>',
  '  </block>',
  '</xml>'].join('\n');


function xmlTest_setUpWithMockBlocks() {
  workspace = new Blockly.Workspace();
  mockControl_ = new goog.testing.MockControl();
  // Need to define this because field_variable's dropdownCreate() calls replace
  // on undefined value, Blockly.Msg.DELETE_VARIABLE. To fix this, define
  // Blockly.Msg.DELETE_VARIABLE as %1 so the replace function finds the %1 it
  // expects.
  Blockly.Msg.DELETE_VARIABLE = '%1';
}

function xmlTest_tearDownWithMockBlocks() {
  mockControl_.$tearDown();
  workspace.dispose();
  delete Blockly.Blocks.field_variable_test_block;
  Blockly.Msg.DELETE_VARIABLE = saved_msg;
}

/**
 * Check the values of the non variable field dom.
 * @param {!Element} fieldDom The xml dom of the non variable field.
 * @param {!string} name The expected name of the variable.
 * @param {!string} text The expected text of the variable.
 */
function xmlTest_checkNonVariableField(fieldDom, name, text) {
  assertEquals(text, fieldDom.textContent);
  assertEquals(name, fieldDom.getAttribute('name'));
  assertNull(fieldDom.getAttribute('id'));
  assertNull(fieldDom.getAttribute('variableType'));
}

/**
 * Check the values of the variable field DOM.
 * @param {!Element} fieldDom The xml dom of the variable field.
 * @param {!string} name The expected name of the variable.
 * @param {!string} type The expected type of the variable.
 * @param {!string} id The expected id of the variable.
 * @param {!string} text The expected text of the variable.
 */
function xmlTest_checkVariableDomValues(fieldDom, name, type, id, text) {
  assertEquals(name, fieldDom.getAttribute('name'));
  assertEquals(type, fieldDom.getAttribute('variableType'));
  assertEquals(id, fieldDom.getAttribute('id'));
  assertEquals(text, fieldDom.textContent);
}

function test_textToDom() {
  var dom = Blockly.Xml.textToDom(XML_TEXT);
  assertEquals('XML tag', 'xml', dom.nodeName);
  assertEquals('Block tags', 6, dom.getElementsByTagName('block').length);
}

function test_domToText() {
  var dom = Blockly.Xml.textToDom(XML_TEXT);
  var text = Blockly.Xml.domToText(dom);
  assertEquals('Round trip', XML_TEXT.replace(/\s+/g, ''),
      text.replace(/\s+/g, ''));
}

function test_domToWorkspace() {
  Blockly.Blocks.test_block = {
    init: function() {
      this.jsonInit({
        message0: 'test',
      });
    }
  };

  workspace = new Blockly.Workspace();
  try {
    var dom = Blockly.Xml.textToDom(
        '<xml xmlns="http://www.w3.org/1999/xhtml">' +
        '  <block type="test_block" inline="true" x="21" y="23">' +
        '  </block>' +
        '</xml>');
    Blockly.Xml.domToWorkspace(dom, workspace);
    assertEquals('Block count', 1, workspace.getAllBlocks().length);
  } finally {
    delete Blockly.Blocks.test_block;

    workspace.dispose();
  }
}

function test_domToPrettyText() {
  var dom = Blockly.Xml.textToDom(XML_TEXT);
  var text = Blockly.Xml.domToPrettyText(dom);
  assertEquals('Round trip', XML_TEXT.replace(/\s+/g, ''),
      text.replace(/\s+/g, ''));
}

/**
 * Tests the that appendDomToWorkspace works in a headless mode.
 * Also see test_appendDomToWorkspace() in workspace_svg_test.js.
 */
function test_appendDomToWorkspace() {
  Blockly.Blocks.test_block = {
    init: function() {
      this.jsonInit({
        message0: 'test',
      });
    }
  };

  try {
    var dom = Blockly.Xml.textToDom(
        '<xml xmlns="http://www.w3.org/1999/xhtml">' +
        '  <block type="test_block" inline="true" x="21" y="23">' +
        '  </block>' +
        '</xml>');
    workspace = new Blockly.Workspace();
    Blockly.Xml.appendDomToWorkspace(dom, workspace);
    assertEquals('Block count', 1, workspace.getAllBlocks().length);
    var newBlockIds = Blockly.Xml.appendDomToWorkspace(dom, workspace);
    assertEquals('Block count', 2, workspace.getAllBlocks().length);
    assertEquals('Number of new block ids',1,newBlockIds.length);
  } finally {
    delete Blockly.Blocks.test_block;
    workspace.dispose();
  }
}

function test_blockToDom_fieldToDom_trivial() {
  Blockly.defineBlocksWithJsonArray([{
    'type': 'field_variable_test_block',
    'message0': '%1',
    'args0': [
      {
        'type': 'field_variable',
        'name': 'VAR',
        'variable': 'item'
      }
    ],
  }]);
  xmlTest_setUpWithMockBlocks();
  workspace.createVariable('name1', 'type1', 'id1');
  var block = new Blockly.Block(workspace, 'field_variable_test_block');
  block.inputList[0].fieldRow[0].setValue('name1');
  var resultFieldDom = Blockly.Xml.blockToDom(block).childNodes[0];
  xmlTest_checkVariableDomValues(resultFieldDom, 'VAR', 'type1', 'id1', 'name1');
  xmlTest_tearDownWithMockBlocks();
}

function test_blockToDom_fieldToDom_defaultCase() {
  Blockly.defineBlocksWithJsonArray([{
    'type': 'field_variable_test_block',
    'message0': '%1',
    'args0': [
      {
        'type': 'field_variable',
        'name': 'VAR',
        'variable': 'item'
      }
    ],
  }]);
  xmlTest_setUpWithMockBlocks();
  var mockGenUid = mockControl_.createMethodMock(Blockly.utils, 'genUid');
  mockGenUid().$returns('1');
  mockGenUid().$replay();
  workspace.createVariable('name1');
  var block = new Blockly.Block(workspace, 'field_variable_test_block');
  block.inputList[0].fieldRow[0].setValue('name1');
  var resultFieldDom = Blockly.Xml.blockToDom(block).childNodes[0];
  // Expect type is '' and id is '1' since we don't specify type and id.
  xmlTest_checkVariableDomValues(resultFieldDom, 'VAR', '', '1', 'name1');
  xmlTest_tearDownWithMockBlocks();
}

function test_blockToDom_fieldToDom_notAFieldVariable() {
  Blockly.defineBlocksWithJsonArray([{
    "type": "field_angle_test_block",
    "message0": "%1",
    "args0": [
      {
        "type": "field_angle",
        "name": "VAR",
        "angle": 90
      }
    ],
  }]);
  xmlTest_setUpWithMockBlocks();
  var block = new Blockly.Block(workspace, 'field_angle_test_block');
  var resultFieldDom = Blockly.Xml.blockToDom(block).childNodes[0];
  xmlTest_checkNonVariableField(resultFieldDom, 'VAR', '90');
  delete Blockly.Blocks.field_angle_block;
  xmlTest_tearDownWithMockBlocks();
}
