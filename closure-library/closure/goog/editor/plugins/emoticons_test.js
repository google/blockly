// Copyright 2010 The Closure Library Authors. All Rights Reserved.
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

goog.provide('goog.editor.plugins.EmoticonsTest');
goog.setTestOnly('goog.editor.plugins.EmoticonsTest');

goog.require('goog.Uri');
goog.require('goog.array');
goog.require('goog.dom');
goog.require('goog.dom.TagName');
goog.require('goog.editor.Field');
goog.require('goog.editor.plugins.Emoticons');
goog.require('goog.testing.jsunit');
goog.require('goog.ui.emoji.Emoji');
goog.require('goog.userAgent');

var HTML;

function setUp() {
  HTML = goog.dom.getElement('parent').innerHTML;
}

function tearDown() {
  goog.dom.getElement('parent').innerHTML = HTML;
}

function testEmojiWithEmoticonsPlugin() {
  runEmojiTestWithPlugin(new goog.editor.plugins.Emoticons());
}

function runEmojiTestWithPlugin(plugin) {
  var field = new goog.editor.Field('testField');
  field.registerPlugin(plugin);
  field.makeEditable();
  field.focusAndPlaceCursorAtStart();

  var src = 'testdata/emoji/4F4.gif';
  var id = '4F4';
  var emoji = new goog.ui.emoji.Emoji(src, id);
  field.execCommand(goog.editor.plugins.Emoticons.COMMAND, emoji);

  // The url may be relative or absolute.
  var imgs = field.getEditableDomHelper().getElementsByTagNameAndClass(
      goog.dom.TagName.IMG);
  assertEquals(1, imgs.length);

  var img = imgs[0];
  assertUriEquals(src, img.getAttribute('src'));
  assertEquals(id, img.getAttribute(goog.ui.emoji.Emoji.ATTRIBUTE));
  assertEquals(id, img.getAttribute(goog.ui.emoji.Emoji.DATA_ATTRIBUTE));

  var range = field.getRange();
  assertNotNull('must have a selection', range);
  assertTrue('range must be a cursor', range.isCollapsed());
  if (goog.userAgent.WEBKIT) {
    assertEquals('range starts after image', 2, range.getStartOffset());
  } else if (goog.userAgent.GECKO) {
    assertEquals(
        'range starts after image', 2,
        goog.array.indexOf(
            range.getContainerElement().childNodes, range.getStartNode()));
  }
  // Firefox 3.6 is still tested, and would fail here - treitel December 2012
  if (!(goog.userAgent.GECKO && !goog.userAgent.isVersionOrHigher(2))) {
    assertEquals(
        'range must be around image', img.parentElement,
        range.getContainerElement());
  }
}

function assertUriEquals(expected, actual) {
  var winUri = new goog.Uri(window.location);
  assertEquals(
      winUri.resolve(new goog.Uri(expected)).toString(),
      winUri.resolve(new goog.Uri(actual)).toString());
}
