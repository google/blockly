/**
 * @license
 * Blockly Tests
 *
 * Copyright 2018 Google Inc.
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

var savedFireFunc = Blockly.Events.fire;
var workspace;

function procedureSvgTest_setup() {
  Blockly.Events.fire = temporary_fireEvent;
  temporary_fireEvent.firedEvents_ = [];
  workspace = procedureSvgTest_createWorkspaceWithToolbox();
}

function procedureSvgTest_teardown() {
  Blockly.Events.fire = savedFireFunc;
  workspace.dispose();
}

function procedureSvgTest_createWorkspaceWithToolbox() {
  var toolbox = document.getElementById('toolbox-categories');
  return Blockly.inject('blocklyDiv', {toolbox: toolbox});
}

function test_procedureReturnSetDisabledUpdatesCallers() {
  procedureSvgTest_setup();
  try {
    var dom = Blockly.Xml.textToDom(
      '<xml xmlns="http://www.w3.org/1999/xhtml">' +
        '<block type="procedures_defreturn" id="bar-def">' +
          '<field name="NAME">bar</field>' +
          '<value name="RETURN">' +
            '<block type="procedures_callreturn" id="bar-c1">' +
              '<mutation name="bar"></mutation>' +
            '</block>' +
          '</value>' +
        '</block>' +
        '<block type="procedures_callreturn" id="bar-c2">' +
          '<mutation name="bar"></mutation>' +
        '</block>' +
      '</xml>');


    Blockly.Xml.appendDomToWorkspace(dom, workspace);
    var barDef = workspace.getBlockById('bar-def');
    var barCalls = [workspace.getBlockById('bar-c1'), workspace.getBlockById('bar-c2')];

    workspace.clearUndo();
    Blockly.Events.setGroup('g1');
    barDef.setDisabled(true);
    Blockly.Events.setGroup(false);

    assertTrue('Callers are disabled when their definition is disabled.',
        barCalls[0].disabled && barCalls[1].disabled);

    var firedEvents = workspace.undoStack_;
    assertEquals('An event was fired for the definition and each caller.',
        3, firedEvents.length);
    assertTrue('Disable events are in the same group.',
        'g1' == firedEvents[0].group
            && 'g1' == firedEvents[1].group
            && 'g1' == firedEvents[2].group);

    workspace.clearUndo();
    Blockly.Events.setGroup('g2');
    barDef.setDisabled(false);
    Blockly.Events.setGroup(false);

    assertTrue('Callers are enabled when their definition is enabled.',
        !barCalls[0].disabled && !barCalls[1].disabled);

    assertEquals('An event was fired for the definition and each caller.',
        3, firedEvents.length);
    assertTrue('Enable events are in the same group.',
        'g2' == firedEvents[0].group
            && 'g2' == firedEvents[1].group
            && 'g2' == firedEvents[2].group);


  } finally {
    procedureSvgTest_teardown();
  }
}


function test_procedureReturnEnablingRemembersOldCallerState() {
  procedureSvgTest_setup();
  try {
    var dom = Blockly.Xml.textToDom(
      '<xml xmlns="http://www.w3.org/1999/xhtml">' +
        '<block type="procedures_defreturn" id="bar-def">' +
          '<field name="NAME">bar</field>' +
          '<value name="RETURN">' +
            '<block type="procedures_callreturn" id="bar-c1">' +
              '<mutation name="bar"></mutation>' +
            '</block>' +
          '</value>' +
        '</block>' +
        '<block type="procedures_callreturn" id="bar-c2">' +
          '<mutation name="bar"></mutation>' +
        '</block>' +
      '</xml>');


    Blockly.Xml.appendDomToWorkspace(dom, workspace);
    var barDef = workspace.getBlockById('bar-def');
    var barCalls = [workspace.getBlockById('bar-c1'), workspace.getBlockById('bar-c2')];

    barCalls[0].setDisabled(true);
    workspace.clearUndo();
    Blockly.Events.setGroup('g1');
    barDef.setDisabled(true);
    Blockly.Events.setGroup(false);

    assertTrue('Callers are disabled when their definition is disabled.',
        barCalls[0].disabled && barCalls[1].disabled);

    var firedEvents = workspace.undoStack_;
    assertEquals('An event was fired for the definition and the enabled caller.',
        2, firedEvents.length);
    assertTrue('Disable events are in the same group.',
        'g1' == firedEvents[0].group
            && 'g1' == firedEvents[1].group);

    workspace.clearUndo();
    Blockly.Events.setGroup('g2');
    barDef.setDisabled(false);
    Blockly.Events.setGroup(false);


    assertTrue('Callers return to their previous state when the definition is enabled.',
        barCalls[0].disabled && !barCalls[1].disabled);

    assertEquals('An event was fired for the definition and the enabled caller.',
        2, firedEvents.length);
    assertTrue('Disable events are in the same group.',
        'g2' == firedEvents[0].group
            && 'g2' == firedEvents[1].group);

  } finally {
    procedureSvgTest_teardown();
  }
}

function test_procedureNoReturnSetDisabledUpdatesCallers() {
  procedureSvgTest_setup();
  try {
    var dom = Blockly.Xml.textToDom(
      '<xml xmlns="http://www.w3.org/1999/xhtml">' +
        '<block type="procedures_defnoreturn" id="bar-def">' +
          '<field name="NAME">bar</field>' +
        '</block>' +
        '<block type="procedures_callnoreturn" id="bar-c1">' +
          '<mutation name="bar"></mutation>' +
        '</block>' +
        '<block type="procedures_callnoreturn" id="bar-c2">' +
          '<mutation name="bar"></mutation>' +
        '</block>' +
      '</xml>');


    Blockly.Xml.appendDomToWorkspace(dom, workspace);
    var barDef = workspace.getBlockById('bar-def');
    var barCalls = [workspace.getBlockById('bar-c1'), workspace.getBlockById('bar-c2')];

    workspace.clearUndo();
    Blockly.Events.setGroup('g1');
    barDef.setDisabled(true);
    Blockly.Events.setGroup(false);

    assertTrue('Callers are disabled when their definition is disabled.',
        barCalls[0].disabled && barCalls[1].disabled);

    var firedEvents = workspace.undoStack_;
    assertEquals('An event was fired for the definition and each caller.',
        3, firedEvents.length);
    assertTrue('Disable events are in the same group.',
        'g1' == firedEvents[0].group
            && 'g1' == firedEvents[1].group
            && 'g1' == firedEvents[2].group);

    workspace.clearUndo();
    Blockly.Events.setGroup('g2');
    barDef.setDisabled(false);
    Blockly.Events.setGroup(false);

    assertTrue('Callers are enabled when their definition is enabled.',
        !barCalls[0].disabled && !barCalls[1].disabled);

    assertEquals('An event was fired for the definition and each caller.',
        3, firedEvents.length);
    assertTrue('Enable events are in the same group.',
        'g2' == firedEvents[0].group
            && 'g2' == firedEvents[1].group
            && 'g2' == firedEvents[2].group);


  } finally {
    procedureSvgTest_teardown();
  }
}


function test_procedureNoReturnEnablingRemembersOldCallerState() {
  procedureSvgTest_setup();
  try {
    var dom = Blockly.Xml.textToDom(
      '<xml xmlns="http://www.w3.org/1999/xhtml">' +
        '<block type="procedures_defnoreturn" id="bar-def">' +
          '<field name="NAME">bar</field>' +
        '</block>' +
        '<block type="procedures_callnoreturn" id="bar-c1">' +
          '<mutation name="bar"></mutation>' +
        '</block>' +
        '<block type="procedures_callnoreturn" id="bar-c2">' +
          '<mutation name="bar"></mutation>' +
        '</block>' +
      '</xml>');


    Blockly.Xml.appendDomToWorkspace(dom, workspace);
    var barDef = workspace.getBlockById('bar-def');
    var barCalls = [workspace.getBlockById('bar-c1'), workspace.getBlockById('bar-c2')];

    barCalls[0].setDisabled(true);
    workspace.clearUndo();
    Blockly.Events.setGroup('g1');
    barDef.setDisabled(true);
    Blockly.Events.setGroup(false);

    assertTrue('Callers are disabled when their definition is disabled.',
        barCalls[0].disabled && barCalls[1].disabled);

    var firedEvents = workspace.undoStack_;
    assertEquals('An event was fired for the definition and the enabled caller.',
        2, firedEvents.length);
    assertTrue('Disable events are in the same group.',
        'g1' == firedEvents[0].group
            && 'g1' == firedEvents[1].group);

    workspace.clearUndo();
    Blockly.Events.setGroup('g2');
    barDef.setDisabled(false);
    Blockly.Events.setGroup(false);


    assertTrue('Callers return to their previous state when the definition is enabled.',
        barCalls[0].disabled && !barCalls[1].disabled);

    assertEquals('An event was fired for the definition and the enabled caller.',
        2, firedEvents.length);
    assertTrue('Disable events are in the same group.',
        'g2' == firedEvents[0].group
            && 'g2' == firedEvents[1].group);

  } finally {
    procedureSvgTest_teardown();
  }
}

/**
* This is a somewhat large test as it's checking interactions between
* three procedure definitions.
*/
function test_procedureEnableDisableInteractions() {
  procedureSvgTest_setup();
  try {
    var dom = Blockly.Xml.textToDom(
      '<xml xmlns="http://www.w3.org/1999/xhtml">' +
        '<block type="procedures_defreturn" id="bar-def">' +
          '<field name="NAME">bar</field>' +
          '<statement name="STACK">' +
            '<block type="procedures_callnoreturn" id="foo-c1">' +
              '<mutation name="foo"></mutation>' +
            '</block>' +
          '</statement>' +
          '<value name="RETURN">' +
            '<block type="procedures_callreturn" id="bar-c1">' +
              '<mutation name="bar"></mutation>' +
            '</block>' +
          '</value>' +
        '</block>' +
        '<block type="procedures_defnoreturn" id="foo-def">' +
          '<field name="NAME">foo</field>' +
        '</block>' +
        '<block type="procedures_defreturn" id="baz-def">' +
          '<field name="NAME">baz</field>' +
          '<value name="RETURN">' +
            '<block type="procedures_callreturn" id="bar-c2">' +
              '<mutation name="bar"></mutation>' +
            '</block>' +
          '</value>' +
        '</block>' +
        '<block type="procedures_callnoreturn" id="foo-c2">' +
          '<mutation name="foo"></mutation>' +
        '</block>'  +
        '<block type="procedures_callreturn" id="baz-c1">' +
          '<mutation name="baz"></mutation>' +
        '</block>' +
      '</xml>');
    Blockly.Events.disable();
    Blockly.Xml.appendDomToWorkspace(dom, workspace);
    Blockly.Events.enable();

    var barDef = workspace.getBlockById('bar-def');
    var fooDef = workspace.getBlockById('foo-def');
    var bazDef = workspace.getBlockById('baz-def');

    var barCalls = [workspace.getBlockById('bar-c1'), workspace.getBlockById('bar-c2')];
    var fooCalls = [workspace.getBlockById('foo-c1'), workspace.getBlockById('foo-c2')];
    var bazCall = workspace.getBlockById('baz-c1');

    barDef.setDisabled(true);

    assertTrue('Callers are disabled when their definition is disabled.',
        barCalls[0].disabled && barCalls[1].disabled);
    assertTrue('Callers in definitions are disabled by inheritence.',
        !fooCalls[0].disabled && fooCalls[0].getInheritedDisabled());

    fooDef.setDisabled(true);

    assertTrue('Callers are disabled when their definition is disabled',
        fooCalls[0].disabled && fooCalls[1].disabled);

    barDef.setDisabled(false);

    assertTrue('Callers are reenabled with their definition',
        !barCalls[0].disabled && !barCalls[0].disabled);

    assertTrue('Nested disabled callers remain disabled, not by inheritence.',
        fooCalls[0].disabled && !fooCalls[0].getInheritedDisabled());

    bazDef.setDisabled(true);

    assertTrue('Caller is disabled with its definition',
        bazCall.disabled);

    assertTrue('Caller in the return is disabled by inheritence.',
        !barCalls[1].disabled && barCalls[1].getInheritedDisabled());

    barDef.setDisabled(true);
    assertTrue('Callers are disabled when their definition is disabled.',
        barCalls[0].disabled && barCalls[1].disabled);

    bazDef.setDisabled(false);

    assertTrue('Caller in the return remains disabled, not by inheritence.',
        barCalls[1].disabled && !barCalls[1].getInheritedDisabled());

  } finally {
    procedureSvgTest_teardown();
  }
  
}