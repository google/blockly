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

goog.provide('goog.ui.media.PhotoTest');
goog.setTestOnly('goog.ui.media.PhotoTest');

goog.require('goog.dom');
goog.require('goog.dom.TagName');
goog.require('goog.testing.jsunit');
goog.require('goog.ui.media.MediaModel');
goog.require('goog.ui.media.Photo');
var control;
var PHOTO_URL = 'http://foo/bar.jpg';

function setUp() {
  var photo = new goog.ui.media.MediaModel(PHOTO_URL, 'title', 'description');
  photo.setPlayer(new goog.ui.media.MediaModel.Player(PHOTO_URL));
  control = goog.ui.media.Photo.newControl(photo);
}

function tearDown() {
  control.dispose();
}

function testBasicRendering() {
  control.render();
  var el = goog.dom.getElementsByTagNameAndClass(
      goog.dom.TagName.DIV, goog.ui.media.Photo.CSS_CLASS);
  assertEquals(1, el.length);
  var img = goog.dom.getElementsByTagNameAndClass(
      goog.dom.TagName.IMG, goog.ui.media.Photo.CSS_CLASS + '-image');
  assertEquals(1, img.length);
  var caption = goog.dom.getElementsByTagNameAndClass(
      goog.dom.TagName.DIV, goog.ui.media.Photo.CSS_CLASS + '-caption');
  assertEquals(1, caption.length);
  var content = goog.dom.getElementsByTagNameAndClass(
      goog.dom.TagName.DIV, goog.ui.media.Photo.CSS_CLASS + '-description');
  assertEquals(1, content.length);
}
