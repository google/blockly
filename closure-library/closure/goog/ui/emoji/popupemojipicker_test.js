// Copyright 2007 The Closure Library Authors. All Rights Reserved.
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

goog.provide('goog.ui.emoji.PopupEmojiPickerTest');
goog.setTestOnly('goog.ui.emoji.PopupEmojiPickerTest');

goog.require('goog.dom');
goog.require('goog.testing.jsunit');
goog.require('goog.ui.emoji.PopupEmojiPicker');
var emojiGroup1 = [
  'Emoji 1',
  [
   ['../../demos/emoji/200.gif', 'std.200'],
   ['../../demos/emoji/201.gif', 'std.201']
  ]];

var emojiGroup2 = [
  'Emoji 2',
  [
   ['../../demos/emoji/2D0.gif', 'std.2D0'],
   ['../../demos/emoji/2D1.gif', 'std.2D1']
  ]];

var emojiGroup3 = [
  'Emoji 3',
  [
   ['../../demos/emoji/2E4.gif', 'std.2E4'],
   ['../../demos/emoji/2E5.gif', 'std.2E5']
  ]];

function testConstructAndRenderPopupEmojiPicker() {
  var picker = new goog.ui.emoji.PopupEmojiPicker(
      '../../demos/emoji/none.gif');
  picker.addEmojiGroup(emojiGroup1[0], emojiGroup1[1]);
  picker.addEmojiGroup(emojiGroup2[0], emojiGroup2[1]);
  picker.addEmojiGroup(emojiGroup3[0], emojiGroup3[1]);
  picker.render();
  picker.attach(document.getElementById('button1'));
  picker.dispose();
}

// Unittest to ensure that the popup gets created in createDom().
function testPopupCreation() {
  var picker = new goog.ui.emoji.PopupEmojiPicker();
  picker.addEmojiGroup(emojiGroup1[0], emojiGroup1[1]);
  picker.createDom();
  assertNotNull(picker.getPopup());
}


function testAutoHideIsSetProperly() {
  var picker = new goog.ui.emoji.PopupEmojiPicker();
  picker.addEmojiGroup(emojiGroup1[0], emojiGroup1[1]);
  picker.createDom();
  picker.setAutoHide(true);
  var containingDiv = goog.dom.getElement('containingDiv');
  picker.setAutoHideRegion(containingDiv);
  assertTrue(picker.getAutoHide());
  assertEquals(containingDiv, picker.getAutoHideRegion());
}
