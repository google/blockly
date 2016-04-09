// Copyright 2008 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

goog.provide('goog.editor.plugins.LoremIpsumTest');
goog.setTestOnly('goog.editor.plugins.LoremIpsumTest');

goog.require('goog.dom');
goog.require('goog.editor.Command');
goog.require('goog.editor.Field');
goog.require('goog.editor.plugins.LoremIpsum');
goog.require('goog.string.Unicode');
goog.require('goog.testing.jsunit');
goog.require('goog.userAgent');

var FIELD;
var PLUGIN;
var HTML;
var UPPERCASE_CONTENTS = '<P>THE OWLS ARE NOT WHAT THEY SEEM.</P>';

function setUp() {
  HTML = goog.dom.getElement('root').innerHTML;

  FIELD = new goog.editor.Field('field');

  PLUGIN =
      new goog.editor.plugins.LoremIpsum('The owls are not what they seem.');
  FIELD.registerPlugin(PLUGIN);
}

function tearDown() {
  FIELD.dispose();
  goog.dom.getElement('root').innerHTML = HTML;
}

function testQueryUsingLorem() {
  FIELD.makeEditable();

  assertTrue(FIELD.queryCommandValue(goog.editor.Command.USING_LOREM));
  FIELD.setHtml(true, 'fresh content', false, true);
  assertFalse(FIELD.queryCommandValue(goog.editor.Command.USING_LOREM));
}

function testUpdateLoremIpsum() {
  goog.dom.setTextContent(goog.dom.getElement('field'), 'stuff');

  var loremPlugin = FIELD.getPluginByClassId('LoremIpsum');
  FIELD.makeEditable();
  var content = '<div>foo</div>';

  FIELD.setHtml(false, '', false, /* Don't update lorem */ false);
  assertFalse(
      'Field started with content, lorem must not be enabled.',
      FIELD.queryCommandValue(goog.editor.Command.USING_LOREM));
  FIELD.execCommand(goog.editor.Command.UPDATE_LOREM);
  assertTrue(
      'Field was set to empty, update must turn on lorem ipsum',
      FIELD.queryCommandValue(goog.editor.Command.USING_LOREM));

  FIELD.unregisterPlugin(loremPlugin);
  FIELD.setHtml(
      false, content, false,
      /* Update (turn off) lorem */ true);
  FIELD.setHtml(false, '', false, /* Don't update lorem */ false);
  FIELD.execCommand(goog.editor.Command.UPDATE_LOREM);
  assertFalse(
      'Field with no lorem message must not use lorem ipsum',
      FIELD.queryCommandValue(goog.editor.Command.USING_LOREM));
  FIELD.registerPlugin(loremPlugin);

  FIELD.setHtml(false, content, false, true);
  FIELD.setHtml(false, '', false, false);
  goog.editor.Field.setActiveFieldId(FIELD.id);
  FIELD.execCommand(goog.editor.Command.UPDATE_LOREM);
  assertFalse(
      'Active field must not use lorem ipsum',
      FIELD.queryCommandValue(goog.editor.Command.USING_LOREM));
  goog.editor.Field.setActiveFieldId(null);

  FIELD.setHtml(false, content, false, true);
  FIELD.setHtml(false, '', false, false);
  FIELD.setModalMode(true);
  FIELD.execCommand(goog.editor.Command.UPDATE_LOREM);
  assertFalse(
      'Must not turn on lorem ipsum while a dialog is open.',
      FIELD.queryCommandValue(goog.editor.Command.USING_LOREM));
  FIELD.setModalMode(true);

  FIELD.dispose();
}

function testLoremIpsumAndGetCleanContents() {
  goog.dom.setTextContent(goog.dom.getElement('field'), 'This is a field');
  FIELD.makeEditable();

  // test direct getCleanContents
  assertEquals(
      'field reported wrong contents', 'This is a field',
      FIELD.getCleanContents());

  // test indirect getCleanContents
  var contents = FIELD.getCleanContents();
  assertEquals('field reported wrong contents', 'This is a field', contents);

  // set field html, but explicitly forbid converting to lorem ipsum text
  FIELD.setHtml(false, '&nbsp;', true, false /* no lorem */);
  assertEquals(
      'field contains unexpected contents', getNbsp(),
      FIELD.getElement().innerHTML);
  assertEquals(
      'field reported wrong contents', getNbsp(), FIELD.getCleanContents());

  // now set field html allowing lorem
  FIELD.setHtml(false, '&nbsp;', true, true /* lorem */);
  assertEquals(
      'field reported wrong contents', goog.string.Unicode.NBSP,
      FIELD.getCleanContents());
  assertEquals(
      'field contains unexpected contents', UPPERCASE_CONTENTS,
      FIELD.getElement().innerHTML.toUpperCase());
}

function testLoremIpsumAndGetCleanContents2() {
  // make a field blank before we make it editable, and then check
  // that making it editable activates lorem.
  assert('field is editable', FIELD.isUneditable());
  goog.dom.setTextContent(goog.dom.getElement('field'), '   ');

  FIELD.makeEditable();
  assertEquals(
      'field contains unexpected contents', UPPERCASE_CONTENTS,
      FIELD.getElement().innerHTML.toUpperCase());

  FIELD.makeUneditable();
  assertEquals(
      'field contains unexpected contents', UPPERCASE_CONTENTS,
      goog.dom.getElement('field').innerHTML.toUpperCase());
}

function testLoremIpsumInClickToEditMode() {
  // in click-to-edit mode, trogedit manages the editable state of the editor,
  // so we must manage lorem ipsum in uneditable mode too.
  FIELD.makeEditable();

  assertEquals(
      'field contains unexpected contents', UPPERCASE_CONTENTS,
      FIELD.getElement().innerHTML.toUpperCase());

  FIELD.makeUneditable();
  assertEquals(
      'field contains unexpected contents', UPPERCASE_CONTENTS,
      goog.dom.getElement('field').innerHTML.toUpperCase());
}

function getNbsp() {
  // On WebKit (pre-528) and Opera, &nbsp; shows up as its unicode character in
  // innerHTML under some circumstances.
  return (goog.userAgent.WEBKIT && !goog.userAgent.isVersionOrHigher('528')) ||
          goog.userAgent.OPERA ?
      '\u00a0' :
      '&nbsp;';
}
