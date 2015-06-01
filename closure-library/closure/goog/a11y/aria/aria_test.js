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
// limitations under the License.goog.provide('goog.a11y.ariaTest');

goog.provide('goog.a11y.ariaTest');
goog.setTestOnly('goog.a11y.ariaTest');

goog.require('goog.a11y.aria');
goog.require('goog.a11y.aria.Role');
goog.require('goog.a11y.aria.State');
goog.require('goog.dom');
goog.require('goog.dom.TagName');
goog.require('goog.testing.jsunit');

var aria = goog.a11y.aria;
var Role = goog.a11y.aria.Role;
var State = goog.a11y.aria.State;
var sandbox;
var someDiv;
var someSpan;
var htmlButton;

function setUp() {
  sandbox = goog.dom.getElement('sandbox');
  someDiv = goog.dom.createDom(
      goog.dom.TagName.DIV, {id: 'someDiv'}, 'DIV');
  someSpan = goog.dom.createDom(
      goog.dom.TagName.SPAN, {id: 'someSpan'}, 'SPAN');
  htmlButton = goog.dom.createDom(
      goog.dom.TagName.BUTTON, {id: 'someButton'}, 'BUTTON');
  goog.dom.appendChild(sandbox, someDiv);
  goog.dom.appendChild(someDiv, someSpan);
}

function tearDown() {
  goog.dom.removeChildren(sandbox);
  someDiv = null;
  someSpan = null;
  htmlButton = null;
}

function testGetSetRole() {
  assertNull('someDiv\'s role should be null', aria.getRole(someDiv));
  assertNull('someSpan\'s role should be null', aria.getRole(someSpan));

  aria.setRole(someDiv, Role.MENU);
  aria.setRole(someSpan, Role.MENU_ITEM);

  assertEquals('someDiv\'s role should be MENU',
      Role.MENU, aria.getRole(someDiv));
  assertEquals('someSpan\'s role should be MENU_ITEM',
      Role.MENU_ITEM, aria.getRole(someSpan));

  var div = goog.dom.createElement(goog.dom.TagName.DIV);
  goog.dom.appendChild(sandbox, div);
  goog.dom.appendChild(div, goog.dom.createDom(goog.dom.TagName.SPAN,
      {id: 'anotherSpan', role: Role.CHECKBOX}));
  assertEquals('anotherSpan\'s role should be CHECKBOX',
      Role.CHECKBOX, aria.getRole(goog.dom.getElement('anotherSpan')));
}

function testGetSetToggleState() {
  assertThrows('Should throw because no state is specified.',
      function() {
        aria.getState(someDiv);
      });
  assertThrows('Should throw because no state is specified.',
      function() {
        aria.getState(someDiv);
      });
  aria.setState(someDiv, State.LABELLEDBY, 'someSpan');

  assertEquals('someDiv\'s labelledby state should be "someSpan"',
      'someSpan', aria.getState(someDiv, State.LABELLEDBY));

  // Test setting for aria-activedescendant with empty value.
  assertFalse(someDiv.hasAttribute ?
      someDiv.hasAttribute('aria-activedescendant') :
      !!someDiv.getAttribute('aria-activedescendant'));
  aria.setState(someDiv, State.ACTIVEDESCENDANT, 'someSpan');
  assertEquals('someSpan', aria.getState(someDiv, State.ACTIVEDESCENDANT));
  aria.setState(someDiv, State.ACTIVEDESCENDANT, '');
  assertFalse(someDiv.hasAttribute ?
      someDiv.hasAttribute('aria-activedescendant') :
      !!someDiv.getAttribute('aria-activedescendant'));

  // Test setting state that has a default value to empty value.
  assertFalse(someDiv.hasAttribute ?
      someDiv.hasAttribute('aria-relevant') :
      !!someDiv.getAttribute('aria-relevant'));
  aria.setState(someDiv, State.RELEVANT, aria.RelevantValues.TEXT);
  assertEquals(
      aria.RelevantValues.TEXT, aria.getState(someDiv, State.RELEVANT));
  aria.setState(someDiv, State.RELEVANT, '');
  assertEquals(
      aria.RelevantValues.ADDITIONS + ' ' + aria.RelevantValues.TEXT,
      aria.getState(someDiv, State.RELEVANT));

  // Test toggling an attribute that has a true/false value.
  aria.setState(someDiv, State.EXPANDED, false);
  assertEquals('false', aria.getState(someDiv, State.EXPANDED));
  aria.toggleState(someDiv, State.EXPANDED);
  assertEquals('true', aria.getState(someDiv, State.EXPANDED));
  aria.setState(someDiv, State.EXPANDED, true);
  assertEquals('true', aria.getState(someDiv, State.EXPANDED));
  aria.toggleState(someDiv, State.EXPANDED);
  assertEquals('false', aria.getState(someDiv, State.EXPANDED));

  // Test toggling an attribute that does not have a true/false value.
  aria.setState(someDiv, State.RELEVANT, aria.RelevantValues.TEXT);
  assertEquals(
      aria.RelevantValues.TEXT, aria.getState(someDiv, State.RELEVANT));
  aria.toggleState(someDiv, State.RELEVANT);
  assertEquals('', aria.getState(someDiv, State.RELEVANT));
  aria.removeState(someDiv, State.RELEVANT);
  assertEquals('', aria.getState(someDiv, State.RELEVANT));
  // This is not a valid value, but this is what happens if toggle is misused.
  aria.toggleState(someDiv, State.RELEVANT);
  assertEquals('true', aria.getState(someDiv, State.RELEVANT));
}

function testGetStateString() {
  aria.setState(someDiv, State.LABEL, 'test_label');
  aria.setState(
      someSpan, State.LABEL, aria.getStateString(someDiv, State.LABEL));
  assertEquals(aria.getState(someDiv, State.LABEL),
      aria.getState(someSpan, State.LABEL));
  assertEquals('The someDiv\'s enum value should be "test_label".',
      'test_label', aria.getState(someDiv, State.LABEL));
  assertEquals('The someSpan\'s enum value should be "copy move".',
      'test_label', aria.getStateString(someSpan, State.LABEL));
  aria.setState(someDiv, State.MULTILINE, true);
  var thrown = false;
  try {
    aria.getStateString(someDiv, State.MULTILINE);
  } catch (e) {
    thrown = true;
  }
  assertTrue('invalid use of getStateString on boolean.', thrown);
  aria.setState(someDiv, State.LIVE, aria.LivePriority.ASSERTIVE);
  thrown = false;
  aria.setState(someDiv, State.LEVEL, 1);
  try {
    aria.getStateString(someDiv, State.LEVEL);
  } catch (e) {
    thrown = true;
  }
  assertTrue('invalid use of getStateString on numbers.', thrown);
}


function testGetStateStringArray() {
  aria.setState(someDiv, State.LABELLEDBY, ['1', '2']);
  aria.setState(someSpan, State.LABELLEDBY,
      aria.getStringArrayStateInternalUtil(someDiv, State.LABELLEDBY));
  assertEquals(aria.getState(someDiv, State.LABELLEDBY),
      aria.getState(someSpan, State.LABELLEDBY));

  assertEquals('The someDiv\'s enum value should be "1 2".', '1 2',
      aria.getState(someDiv, State.LABELLEDBY));
  assertEquals('The someSpan\'s enum value should be "1 2".', '1 2',
      aria.getState(someSpan, State.LABELLEDBY));

  assertSameElements('The someDiv\'s enum value should be "1 2".',
      ['1', '2'],
      aria.getStringArrayStateInternalUtil(someDiv, State.LABELLEDBY));
  assertSameElements('The someSpan\'s enum value should be "1 2".',
      ['1', '2'],
      aria.getStringArrayStateInternalUtil(someSpan, State.LABELLEDBY));
}


function testGetStateNumber() {
  aria.setState(someDiv, State.LEVEL, 1);
  aria.setState(
      someSpan, State.LEVEL, aria.getStateNumber(someDiv, State.LEVEL));
  assertEquals(aria.getState(someDiv, State.LEVEL),
      aria.getState(someSpan, State.LEVEL));
  assertEquals('The someDiv\'s enum value should be "1".', '1',
      aria.getState(someDiv, State.LEVEL));
  assertEquals('The someSpan\'s enum value should be "1".', '1',
      aria.getState(someSpan, State.LEVEL));
  assertEquals('The someDiv\'s enum value should be "1".', 1,
      aria.getStateNumber(someDiv, State.LEVEL));
  assertEquals('The someSpan\'s enum value should be "1".', 1,
      aria.getStateNumber(someSpan, State.LEVEL));
  aria.setState(someDiv, State.MULTILINE, true);
  var thrown = false;
  try {
    aria.getStateNumber(someDiv, State.MULTILINE);
  } catch (e) {
    thrown = true;
  }
  assertTrue('invalid use of getStateNumber on boolean.', thrown);
  aria.setState(someDiv, State.LIVE, aria.LivePriority.ASSERTIVE);
  thrown = false;
  try {
    aria.getStateBoolean(someDiv, State.LIVE);
  } catch (e) {
    thrown = true;
  }
  assertTrue('invalid use of getStateNumber on strings.', thrown);
}

function testGetStateBoolean() {
  assertNull(aria.getStateBoolean(someDiv, State.MULTILINE));

  aria.setState(someDiv, State.MULTILINE, false);
  assertFalse(aria.getStateBoolean(someDiv, State.MULTILINE));

  aria.setState(someDiv, State.MULTILINE, true);
  aria.setState(someSpan, State.MULTILINE,
      aria.getStateBoolean(someDiv, State.MULTILINE));
  assertEquals(aria.getState(someDiv, State.MULTILINE),
      aria.getState(someSpan, State.MULTILINE));
  assertEquals('The someDiv\'s enum value should be "true".', 'true',
      aria.getState(someDiv, State.MULTILINE));
  assertEquals('The someSpan\'s enum value should be "true".', 'true',
      aria.getState(someSpan, State.MULTILINE));
  assertEquals('The someDiv\'s enum value should be "true".', true,
      aria.getStateBoolean(someDiv, State.MULTILINE));
  assertEquals('The someSpan\'s enum value should be "true".', true,
      aria.getStateBoolean(someSpan, State.MULTILINE));
  aria.setState(someDiv, State.LEVEL, 1);
  var thrown = false;
  try {
    aria.getStateBoolean(someDiv, State.LEVEL);
  } catch (e) {
    thrown = true;
  }
  assertTrue('invalid use of getStateBoolean on numbers.', thrown);
  aria.setState(someDiv, State.LIVE, aria.LivePriority.ASSERTIVE);
  thrown = false;
  try {
    aria.getStateBoolean(someDiv, State.LIVE);
  } catch (e) {
    thrown = true;
  }
  assertTrue('invalid use of getStateBoolean on strings.', thrown);
}

function testGetSetActiveDescendant() {
  aria.setActiveDescendant(someDiv, null);
  assertNull('someDiv\'s activedescendant should be null',
      aria.getActiveDescendant(someDiv));

  aria.setActiveDescendant(someDiv, someSpan);

  assertEquals('someDiv\'s active descendant should be "someSpan"',
      someSpan, aria.getActiveDescendant(someDiv));
}

function testGetSetLabel() {
  assertEquals('someDiv\'s label should be ""', '', aria.getLabel(someDiv));

  aria.setLabel(someDiv, 'somelabel');
  assertEquals('someDiv\'s label should be "somelabel"', 'somelabel',
      aria.getLabel(someDiv));
}
