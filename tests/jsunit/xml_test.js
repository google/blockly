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

function xmlTest_setUp() {
  workspace = new Blockly.Workspace();
  mockControl_ = new goog.testing.MockControl();
}

function xmlTest_setUpWithMockBlocks() {
  xmlTest_setUp();
  Blockly.defineBlocksWithJsonArray([{
    'type': 'field_variable_test_block',
    'message0': '%1',
    'args0': [
      {
        'type': 'field_variable',
        'name': 'VAR',
        'variable': 'item'
      }
    ]
  }]);
}

function xmlTest_tearDown() {
  mockControl_.$tearDown();
  workspace.dispose();
}

function xmlTest_tearDownWithMockBlocks() {
  xmlTest_tearDown();
  delete Blockly.Blocks.field_variable_test_block;
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
  assertNull(fieldDom.getAttribute('variabletype'));
}

/**
 * Check the values of the variable field DOM.
 * @param {!Element} fieldDom The xml dom of the variable field.
 * @param {!string} name The expected name of the variable.
 * @param {!string} type The expected type of the variable.
 * @param {!string} id The expected id of the variable.
 * @param {!string} text The expected text of the variable.
 */
function xmlTest_checkVariableFieldDomValues(fieldDom, name, type, id, text) {
  assertEquals(name, fieldDom.getAttribute('name'));
  assertEquals(type, fieldDom.getAttribute('variabletype'));
  assertEquals(id, fieldDom.getAttribute('id'));
  assertEquals(text, fieldDom.textContent);
}

/**
 * Check the values of the variable DOM.
 * @param {!Element} variableDom The xml dom of the variable.
 * @param {!string} type The expected type of the variable.
 * @param {!string} id The expected id of the variable.
 * @param {!string} text The expected text of the variable.
 */
function xmlTest_checkVariableDomValues(variableDom, type, id, text) {
  assertEquals(type, variableDom.getAttribute('type'));
  assertEquals(id, variableDom.getAttribute('id'));
  assertEquals(text, variableDom.textContent);
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

function test_domToWorkspace_BackwardCompatibility() {
  // Expect that workspace still loads without serialized variables.
  xmlTest_setUpWithMockBlocks();
  setUpMockMethod(mockControl_, Blockly.utils, 'genUid', null, ['1', '1']);
  try {
    var dom = Blockly.Xml.textToDom(
        '<xml>' +
        '  <block type="field_variable_test_block" id="block_id">' +
        '    <field name="VAR">name1</field>' +
        '  </block>' +
        '</xml>');
    Blockly.Xml.domToWorkspace(dom, workspace);
    assertEquals('Block count', 1, workspace.getAllBlocks().length);
    checkVariableValues(workspace, 'name1', '', '1');
  } finally {
    xmlTest_tearDownWithMockBlocks();
  }
}

function test_domToWorkspace_VariablesAtTop() {
  // Expect that unused variables are preserved.
  xmlTest_setUpWithMockBlocks();
  try {
    var dom = Blockly.Xml.textToDom(
        '<xml>' +
        '  <variables>' +
        '    <variable type="type1" id="id1">name1</variable>' +
        '    <variable type="type2" id="id2">name2</variable>' +
        '    <variable type="" id="id3">name3</variable>' +
        '  </variables>' +
        '  <block type="field_variable_test_block">' +
        '    <field name="VAR" id="id3" variabletype="">name3</field>' +
        '  </block>' +
        '</xml>');
    Blockly.Xml.domToWorkspace(dom, workspace);
    assertEquals('Block count', 1, workspace.getAllBlocks().length);
    checkVariableValues(workspace, 'name1', 'type1', 'id1');
    checkVariableValues(workspace, 'name2', 'type2', 'id2');
    checkVariableValues(workspace, 'name3', '', 'id3');
  } finally {
    xmlTest_tearDownWithMockBlocks();
  }
}

function test_domToWorkspace_VariablesAtTop_DuplicateVariablesTag() {
  // Expect thrown Error because of duplicate 'variables' tag
  xmlTest_setUpWithMockBlocks();
  try {
    var dom = Blockly.Xml.textToDom(
        '<xml>' +
        '  <variables>' +
        '  </variables>' +
        '  <variables>' +
        '  </variables>' +
        '</xml>');
    Blockly.Xml.domToWorkspace(dom, workspace);
    fail();
  }
  catch (e) {
    // expected
  } finally {
    xmlTest_tearDownWithMockBlocks();
  }
}

function test_domToWorkspace_VariablesAtTop_MissingType() {
  // Expect thrown error when a variable tag is missing the type attribute.
  workspace = new Blockly.Workspace();
  try {
    var dom = Blockly.Xml.textToDom(
        '<xml>' +
        '  <variables>' +
        '    <variable id="id1">name1</variable>' +
        '  </variables>' +
        '  <block type="field_variable_test_block">' +
        '    <field name="VAR" id="id1" variabletype="">name3</field>' +
        '  </block>' +
        '</xml>');
    Blockly.Xml.domToWorkspace(dom, workspace);
    fail();
  } catch (e) {
    // expected
  } finally {
    workspace.dispose();
  }
}

function test_domToWorkspace_VariablesAtTop_MismatchBlockType() {
  // Expect thrown error when the serialized type of a variable does not match
  // the type of a variable field that references it.
  xmlTest_setUpWithMockBlocks();
  try {
    var dom = Blockly.Xml.textToDom(
        '<xml>' +
        '  <variables>' +
        '    <variable type="type1" id="id1">name1</variable>' +
        '  </variables>' +
        '  <block type="field_variable_test_block">' +
        '    <field name="VAR" id="id1" variabletype="">name1</field>' +
        '  </block>' +
        '</xml>');
    Blockly.Xml.domToWorkspace(dom, workspace);
    fail();
  } catch (e) {
    // expected
  } finally {
    xmlTest_tearDownWithMockBlocks();
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
  xmlTest_setUpWithMockBlocks();
  // TODO (#1199): make a similar test where the variable is given a non-empty
  // type.f
  workspace.createVariable('name1', '', 'id1');
  var block = new Blockly.Block(workspace, 'field_variable_test_block');
  block.inputList[0].fieldRow[0].setValue('id1');
  var resultFieldDom = Blockly.Xml.blockToDom(block).childNodes[0];
  xmlTest_checkVariableFieldDomValues(resultFieldDom, 'VAR', '', 'id1',
    'name1');
  xmlTest_tearDownWithMockBlocks();
}

function test_blockToDom_fieldToDom_defaultCase() {
  xmlTest_setUpWithMockBlocks();
  setUpMockMethod(mockControl_, Blockly.utils, 'genUid', null, ['1', '1']);
  try {
    workspace.createVariable('name1');

    Blockly.Events.disable();
    var block = new Blockly.Block(workspace, 'field_variable_test_block');
    block.inputList[0].fieldRow[0].setValue('1');
    Blockly.Events.enable();

    var resultFieldDom = Blockly.Xml.blockToDom(block).childNodes[0];
    // Expect type is '' and id is '1' since we don't specify type and id.
    xmlTest_checkVariableFieldDomValues(resultFieldDom, 'VAR', '', '1', 'name1');
  } finally {
    xmlTest_tearDownWithMockBlocks();
  }
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

function test_variablesToDom_oneVariable() {
  xmlTest_setUp();
  setUpMockMethod(mockControl_, Blockly.utils, 'genUid', null, ['1']);

  workspace.createVariable('name1');
  var resultDom = Blockly.Xml.variablesToDom(workspace.getAllVariables());
  assertEquals(1, resultDom.children.length);
  var resultVariableDom = resultDom.children[0];
  assertEquals('name1', resultVariableDom.textContent);
  assertEquals('', resultVariableDom.getAttribute('type'));
  assertEquals('1', resultVariableDom.getAttribute('id'));
  xmlTest_tearDown();
}

function test_variablesToDom_twoVariables_oneBlock() {
  xmlTest_setUpWithMockBlocks();

  workspace.createVariable('name1', '', 'id1');
  workspace.createVariable('name2', 'type2', 'id2');
  // If events are enabled during block construction, it will create a default
  // variable.
  Blockly.Events.disable();
  var block = new Blockly.Block(workspace, 'field_variable_test_block');
  block.inputList[0].fieldRow[0].setValue('id1');
  Blockly.Events.enable();

  var resultDom = Blockly.Xml.variablesToDom(workspace.getAllVariables());
  assertEquals(2, resultDom.children.length);
  xmlTest_checkVariableDomValues(resultDom.children[0], '', 'id1',
      'name1');
  xmlTest_checkVariableDomValues(resultDom.children[1], 'type2', 'id2',
      'name2');
  xmlTest_tearDownWithMockBlocks();
}

function test_variablesToDom_noVariables() {
  xmlTest_setUp();
  workspace.createVariable('name1');
  var resultDom = Blockly.Xml.variablesToDom(workspace.getAllVariables());
  assertEquals(1, resultDom.children.length);
  xmlTest_tearDown();
}

function test_variableFieldXml_caseSensitive() {
  var id = 'testId';
  var type = 'testType';
  var name = 'testName';

  var mockVariableModel = {
    type: type,
    name: name,
    getId: function() {
      return id;
    }
  };

  var generatedXml =
    Blockly.Variables.generateVariableFieldXml_(mockVariableModel);
  var goldenXml =
      '<field name="VAR"' +
      ' id="' + id + '"' +
      ' variabletype="' + type + '"' +
      '>' + name + '</field>';
  assertEquals(goldenXml, generatedXml);
}
