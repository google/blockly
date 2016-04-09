// Copyright 2012 The Closure Library Authors. All Rights Reserved.
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

goog.provide('goog.editor.plugins.FirstStrongTest');
goog.setTestOnly('goog.editor.plugins.FirstStrongTest');

goog.require('goog.dom.Range');
goog.require('goog.editor.Command');
goog.require('goog.editor.Field');
goog.require('goog.editor.plugins.FirstStrong');
goog.require('goog.editor.range');
goog.require('goog.events.KeyCodes');
goog.require('goog.testing.MockClock');
goog.require('goog.testing.editor.TestHelper');
goog.require('goog.testing.events');
goog.require('goog.testing.jsunit');
goog.require('goog.userAgent');

// The key code for the Hebrew א, a strongly RTL letter.
var ALEPH_KEYCODE = 1488;
var field;
var fieldElement;
var dom;
var helper;
var triggeredCommand = null;
var clock;

function setUp() {
  field = new goog.editor.Field('field');
  field.registerPlugin(new goog.editor.plugins.FirstStrong());
  field.makeEditable();

  fieldElement = field.getElement();

  helper = new goog.testing.editor.TestHelper(fieldElement);

  dom = field.getEditableDomHelper();

  // Mock out execCommand to see if a direction change has been triggered.
  field.execCommand = function(command) {
    if (command == goog.editor.Command.DIR_LTR ||
        command == goog.editor.Command.DIR_RTL)
      triggeredCommand = command;
  };
}

function tearDown() {
  goog.dispose(field);
  goog.dispose(helper);
  triggeredCommand = null;
  goog.dispose(clock);  // Make sure clock is disposed.
}

function testFirstCharacter_RTL() {
  field.setHtml(false, '<div id="text">&nbsp;</div>');
  field.focusAndPlaceCursorAtStart();
  goog.testing.events.fireNonAsciiKeySequence(
      fieldElement, goog.events.KeyCodes.T, ALEPH_KEYCODE);
  assertRTL();
}

function testFirstCharacter_LTR() {
  field.setHtml(false, '<div dir="rtl" id="text">&nbsp;</div>');
  field.focusAndPlaceCursorAtStart();
  goog.testing.events.fireKeySequence(fieldElement, goog.events.KeyCodes.A);
  assertLTR();
}

function testFirstStrongCharacter_RTL() {
  field.setHtml(false, '<div id="text">123.7 3121, <b><++{}></b> - $45</div>');
  field.focusAndPlaceCursorAtStart();
  goog.testing.events.fireNonAsciiKeySequence(
      fieldElement, goog.events.KeyCodes.T, ALEPH_KEYCODE);
  assertRTL();
}

function testFirstStrongCharacter_LTR() {
  field.setHtml(
      false, '<div dir="rtl" id="text">123.7 3121, <b><++{}></b> - $45</div>');
  field.focusAndPlaceCursorAtStart();
  goog.testing.events.fireKeySequence(fieldElement, goog.events.KeyCodes.A);
  assertLTR();
}

function testNotStrongCharacter_RTL() {
  field.setHtml(false, '<div id="text">123.7 3121, - $45</div>');
  field.focusAndPlaceCursorAtStart();
  goog.testing.events.fireKeySequence(fieldElement, goog.events.KeyCodes.NINE);
  assertNoCommand();
}

function testNotStrongCharacter_LTR() {
  field.setHtml(false, '<div dir="rtl" id="text">123.7 3121 $45</div>');
  field.focusAndPlaceCursorAtStart();
  goog.testing.events.fireKeySequence(fieldElement, goog.events.KeyCodes.NINE);
  assertNoCommand();
}

function testNotFirstStrongCharacter_RTL() {
  field.setHtml(false, '<div id="text">123.7 3121, <b>English</b> - $45</div>');
  field.focusAndPlaceCursorAtStart();
  goog.testing.events.fireNonAsciiKeySequence(
      fieldElement, goog.events.KeyCodes.T, ALEPH_KEYCODE);
  assertNoCommand();
}

function testNotFirstStrongCharacter_LTR() {
  field.setHtml(
      false, '<div dir="rtl" id="text">123.7 3121, <b>עברית</b> - $45</div>');
  field.focusAndPlaceCursorAtStart();
  goog.testing.events.fireKeySequence(fieldElement, goog.events.KeyCodes.A);
  assertNoCommand();
}

function testFirstStrongCharacterWithInnerDiv_RTL() {
  field.setHtml(
      false, '<div id="text">123.7 3121, <b id="b"><++{}></b>' +
          '<div id="inner">English</div>' +
          '</div>');
  field.focusAndPlaceCursorAtStart();
  goog.testing.events.fireNonAsciiKeySequence(
      fieldElement, goog.events.KeyCodes.T, ALEPH_KEYCODE);
  assertRTL();
}

function testFirstStrongCharacterWithInnerDiv_LTR() {
  field.setHtml(
      false, '<div dir="rtl" id="text">123.7 3121, <b id="b"><++{}></b>' +
          '<div id="inner">English</div>' +
          '</div>');
  field.focusAndPlaceCursorAtStart();
  goog.testing.events.fireKeySequence(fieldElement, goog.events.KeyCodes.A);
  assertLTR();
}


/**
 * Regression test for {@link http://b/7549696}
 */
function testFirstStrongCharacterInNewLine_RTL() {
  field.setHtml(false, '<div><b id="cur">English<br>1</b></div>');
  goog.dom.Range.createCaret(dom.$('cur'), 2).select();

  goog.testing.events.fireNonAsciiKeySequence(
      fieldElement, goog.events.KeyCodes.T, ALEPH_KEYCODE);
  // Only GECKO treats <br> as a new paragraph.
  if (goog.userAgent.GECKO) {
    assertRTL();
  } else {
    assertNoCommand();
  }
}

function testFirstStrongCharacterInParagraph_RTL() {
  field.setHtml(
      false, '<div id="text1">1&gt; English</div>' +
          '<div id="text2">2&gt;</div>' +
          '<div id="text3">3&gt;</div>');
  goog.dom.Range.createCaret(dom.$('text2'), 0).select();

  goog.testing.events.fireNonAsciiKeySequence(
      fieldElement, goog.events.KeyCodes.T, ALEPH_KEYCODE);
  assertRTL();
}

function testFirstStrongCharacterInParagraph_LTR() {
  field.setHtml(
      false, '<div dir="rtl" id="text1">1&gt; עברית</div>' +
          '<div dir="rtl" id="text2">2&gt;</div>' +
          '<div dir="rtl" id="text3">3&gt;</div>');
  goog.dom.Range.createCaret(dom.$('text2'), 0).select();

  goog.testing.events.fireKeySequence(fieldElement, goog.events.KeyCodes.A);
  assertLTR();
}

function testFirstStrongCharacterInList_RTL() {
  field.setHtml(
      false, '<div id="text1">1&gt; English</div>' +
          '<ul id="list">' +
          '<li>10&gt;</li>' +
          '<li id="li2"></li>' +
          '<li>30</li>' +
          '</ul>' +
          '<div id="text3">3&gt;</div>');
  goog.editor.range.placeCursorNextTo(dom.$('li2'), true);

  goog.testing.events.fireNonAsciiKeySequence(
      fieldElement, goog.events.KeyCodes.T, ALEPH_KEYCODE);
  assertRTL();
}

function testFirstStrongCharacterInList_LTR() {
  field.setHtml(
      false, '<div dir="rtl" id="text1">1&gt; English</div>' +
          '<ul dir="rtl" id="list">' +
          '<li>10&gt;</li>' +
          '<li id="li2"></li>' +
          '<li>30</li>' +
          '</ul>' +
          '<div dir="rtl" id="text3">3&gt;</div>');
  goog.editor.range.placeCursorNextTo(dom.$('li2'), true);

  goog.testing.events.fireKeySequence(fieldElement, goog.events.KeyCodes.A);
  assertLTR();
}

function testNotFirstStrongCharacterInList_RTL() {
  field.setHtml(
      false, '<div id="text1">1</div>' +
          '<ul id="list">' +
          '<li>10&gt;</li>' +
          '<li id="li2"></li>' +
          '<li>30<b>3<i>Hidden English</i>32</b></li>' +
          '</ul>' +
          '<div id="text3">3&gt;</div>');
  goog.editor.range.placeCursorNextTo(dom.$('li2'), true);

  goog.testing.events.fireNonAsciiKeySequence(
      fieldElement, goog.events.KeyCodes.T, ALEPH_KEYCODE);
  assertNoCommand();
}

function testNotFirstStrongCharacterInList_LTR() {
  field.setHtml(
      false, '<div dir="rtl" id="text1">1&gt; English</div>' +
          '<ul dir="rtl" id="list">' +
          '<li>10&gt;</li>' +
          '<li id="li2"></li>' +
          '<li>30<b>3<i>עברית סמויה</i>32</b></li>' +
          '</ul>' +
          '<div dir="rtl" id="text3">3&gt;</div>');
  goog.editor.range.placeCursorNextTo(dom.$('li2'), true);

  goog.testing.events.fireKeySequence(fieldElement, goog.events.KeyCodes.A);
  assertNoCommand();
}

function testFirstStrongCharacterWithBR_RTL() {
  field.setHtml(
      false, '<div id="container">' +
          '<div id="text1">ABC</div>' +
          '<div id="text2">' +
          '1<br>' +
          '2<b id="inner">3</b><i>4<u>5<br>' +
          '6</u>7</i>8</b>9<br>' +
          '10' +
          '</div>' +
          '<div id="text3">11</div>' +
          '</div>');

  goog.editor.range.placeCursorNextTo(dom.$('inner'), true);
  goog.testing.events.fireNonAsciiKeySequence(
      fieldElement, goog.events.KeyCodes.T, ALEPH_KEYCODE);
  assertRTL();
}

function testFirstStrongCharacterWithBR_LTR() {
  field.setHtml(
      false, '<div dir="rtl" id="container">' +
          '<div dir="rtl" id="text1">אבג</div>' +
          '<div dir="rtl" id="text2">' +
          '1<br>' +
          '2<b id="inner">3</b><i>4<u>5<br>' +
          '6</u>7</i>8</b>9<br>' +
          '10' +
          '</div>' +
          '<div dir="rtl" id="text3">11</div>' +
          '</div>');

  goog.editor.range.placeCursorNextTo(dom.$('inner'), true);
  goog.testing.events.fireKeySequence(fieldElement, goog.events.KeyCodes.A);
  assertLTR();
}

function testNotFirstStrongCharacterInBR_RTL() {
  field.setHtml(
      false, '<div id="container">' +
          '<div id="text1">ABC</div>' +
          '<div id="text2">' +
          '1<br>' +
          '2<b id="inner">3</b><i><em>4G</em><u>5<br>' +
          '6</u>7</i>8</b>9<br>' +
          '10' +
          '</div>' +
          '<div id="text3">11</div>' +
          '</div>');

  goog.editor.range.placeCursorNextTo(dom.$('inner'), true);
  goog.testing.events.fireNonAsciiKeySequence(
      fieldElement, goog.events.KeyCodes.T, ALEPH_KEYCODE);
  assertNoCommand();
}

function testNotFirstStrongCharacterInBR_LTR() {
  field.setHtml(
      false, '<div dir="rtl" id="container">' +
          '<div dir="rtl" id="text1">ABC</div>' +
          '<div dir="rtl" id="text2">' +
          '1<br>' +
          '2<b id="inner">3</b><i><em>4G</em><u>5<br>' +
          '6</u>7</i>8</b>9<br>' +
          '10' +
          '</div>' +
          '<div dir="rtl" id="text3">11</div>' +
          '</div>');

  goog.editor.range.placeCursorNextTo(dom.$('inner'), true);
  goog.testing.events.fireKeySequence(fieldElement, goog.events.KeyCodes.A);
  assertNoCommand();
}


/**
 * Regression test for {@link http://b/7530985}
 */
function testFirstStrongCharacterWithPreviousBlockSibling_RTL() {
  field.setHtml(false, '<div>Te<div>xt</div>1<b id="cur">2</b>3</div>');
  goog.editor.range.placeCursorNextTo(dom.$('cur'), true);
  goog.testing.events.fireNonAsciiKeySequence(
      fieldElement, goog.events.KeyCodes.T, ALEPH_KEYCODE);
  assertRTL();
}

function testFirstStrongCharacterWithPreviousBlockSibling_LTR() {
  field.setHtml(
      false, '<div dir="rtl">טק<div>סט</div>1<b id="cur">2</b>3</div>');
  goog.editor.range.placeCursorNextTo(dom.$('cur'), true);
  goog.testing.events.fireKeySequence(fieldElement, goog.events.KeyCodes.A);
  assertLTR();
}

function testFirstStrongCharacterWithFollowingBlockSibling_RTL() {
  field.setHtml(false, '<div>1<b id="cur">2</b>3<div>Te</div>xt</div>');
  goog.editor.range.placeCursorNextTo(dom.$('cur'), true);
  goog.testing.events.fireNonAsciiKeySequence(
      fieldElement, goog.events.KeyCodes.T, ALEPH_KEYCODE);
  assertRTL();
}

function testFirstStrongCharacterWithFollowingBlockSibling_RTL() {
  field.setHtml(false, '<div dir="rtl">1<b id="cur">2</b>3<div>א</div>ב</div>');
  goog.editor.range.placeCursorNextTo(dom.$('cur'), true);
  goog.testing.events.fireKeySequence(fieldElement, goog.events.KeyCodes.A);
  assertLTR();
}

function testFirstStrongCharacterFromIME_RTL() {
  field.setHtml(false, '<div id="text">123.7 3121, </div>');
  field.focusAndPlaceCursorAtStart();
  var attributes = {};
  attributes[goog.editor.plugins.FirstStrong.INPUT_ATTRIBUTE] = 'אבג';
  goog.testing.events.fireNonAsciiKeySequence(fieldElement, 0, 0, attributes);
  if (goog.userAgent.IE) {
    // goog.testing.events.fireNonAsciiKeySequence doesn't send KEYPRESS event
    // so no command is expected.
    assertNoCommand();
  } else {
    assertRTL();
  }
}

function testFirstCharacterFromIME_LTR() {
  field.setHtml(false, '<div dir="rtl" id="text"> 1234 </div>');
  field.focusAndPlaceCursorAtStart();
  var attributes = {};
  attributes[goog.editor.plugins.FirstStrong.INPUT_ATTRIBUTE] = 'ABC';
  goog.testing.events.fireNonAsciiKeySequence(fieldElement, 0, 0, attributes);
  if (goog.userAgent.IE) {
    // goog.testing.events.fireNonAsciiKeySequence doesn't send KEYPRESS event
    // so no command is expected.
    assertNoCommand();
  } else {
    assertLTR();
  }
}


/**
 * Regression test for {@link http://b/19297723}
 */
function testLTRShortlyAfterRTLAndEnter() {
  clock = new goog.testing.MockClock();
  field.focusAndPlaceCursorAtStart();
  goog.testing.events.fireNonAsciiKeySequence(
      fieldElement, goog.events.KeyCodes.T, ALEPH_KEYCODE);
  assertRTL();
  clock.tick(1000);  // Make sure no pending selection change event.
  goog.testing.events.fireKeySequence(fieldElement, goog.events.KeyCodes.ENTER);
  assertRTL();
  goog.testing.events.fireKeySequence(fieldElement, goog.events.KeyCodes.A);
  assertLTR();
  // Verify no RTL for first keypress on already-striong paragraph after
  // delayed selection change event.
  clock.tick(1000);  // Let delayed selection change event fire.
  goog.testing.events.fireNonAsciiKeySequence(
      fieldElement, goog.events.KeyCodes.T, ALEPH_KEYCODE);
  assertLTR();
}

function testRTLShortlyAfterLTRAndEnter() {
  clock = new goog.testing.MockClock();
  field.focusAndPlaceCursorAtStart();
  goog.testing.events.fireKeySequence(fieldElement, goog.events.KeyCodes.A);
  assertLTR();
  clock.tick(1000);  // Make sure no pending selection change event.
  goog.testing.events.fireKeySequence(fieldElement, goog.events.KeyCodes.ENTER);
  assertLTR();
  goog.testing.events.fireNonAsciiKeySequence(
      fieldElement, goog.events.KeyCodes.T, ALEPH_KEYCODE);
  assertRTL();
  // Verify no LTR for first keypress on already-strong paragraph after
  // delayed selection change event.
  clock.tick(1000);  // Let delayed selection change event fire.
  goog.testing.events.fireKeySequence(fieldElement, goog.events.KeyCodes.A);
  assertRTL();
}

function assertRTL() {
  assertEquals(goog.editor.Command.DIR_RTL, triggeredCommand);
}

function assertLTR() {
  assertEquals(goog.editor.Command.DIR_LTR, triggeredCommand);
}

function assertNoCommand() {
  assertNull(triggeredCommand);
}
