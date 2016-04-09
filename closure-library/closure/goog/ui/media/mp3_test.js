// Copyright 2009 The Closure Library Authors. All Rights Reserved.
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

goog.provide('goog.ui.media.Mp3Test');
goog.setTestOnly('goog.ui.media.Mp3Test');

goog.require('goog.dom');
goog.require('goog.dom.TagName');
goog.require('goog.testing.jsunit');
goog.require('goog.ui.media.FlashObject');
goog.require('goog.ui.media.Media');
goog.require('goog.ui.media.MediaModel');
goog.require('goog.ui.media.Mp3');
var mp3;
var control;
var MP3_URL = 'http://www.shellworld.net/~davidsky/surf-oxy.mp3';
var parent = goog.dom.createElement(goog.dom.TagName.DIV);

function setUp() {
  mp3 = goog.ui.media.Mp3.getInstance();
  var flashUrl = goog.ui.media.Mp3.buildFlashUrl(MP3_URL);
  var model = new goog.ui.media.MediaModel(MP3_URL, 'mp3 caption', '');
  model.setPlayer(new goog.ui.media.MediaModel.Player(flashUrl));
  control = new goog.ui.media.Media(model, mp3);
  control.setSelected(true);
}

function tearDown() {
  control.dispose();
}

function testBasicRendering() {
  control.render(parent);
  var el = goog.dom.getElementsByTagNameAndClass(
      goog.dom.TagName.DIV, goog.ui.media.Mp3.CSS_CLASS, parent);
  assertEquals(1, el.length);
}

function testParsingUrl() {
  assertTrue(goog.ui.media.Mp3.MATCHER.test(MP3_URL));
  assertFalse(goog.ui.media.Mp3.MATCHER.test('http://invalidUrl/filename.doc'));
}

function testCreatingDomOnInitialState() {
  control.render(parent);
  var caption = goog.dom.getElementsByTagNameAndClass(
      goog.dom.TagName.DIV, goog.ui.media.Mp3.CSS_CLASS + '-caption', parent);
  assertEquals(1, caption.length);

  var flash = goog.dom.getElementsByTagNameAndClass(
      undefined, goog.ui.media.FlashObject.CSS_CLASS, parent);
  assertEquals(1, flash.length);
}
