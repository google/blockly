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

goog.provide('goog.ui.media.VimeoTest');
goog.setTestOnly('goog.ui.media.VimeoTest');

goog.require('goog.dom');
goog.require('goog.dom.TagName');
goog.require('goog.testing.jsunit');
goog.require('goog.ui.media.FlashObject');
goog.require('goog.ui.media.Media');
goog.require('goog.ui.media.Vimeo');
goog.require('goog.ui.media.VimeoModel');
var vimeo;
var control;
var VIMEO_ID = '3001295';
var VIMEO_URL = 'http://vimeo.com/' + VIMEO_ID;
var VIMEO_URL_HD = 'http://vimeo.com/hd#' + VIMEO_ID;
var VIMEO_URL_SECURE = 'https://vimeo.com/' + VIMEO_ID;
var parent = goog.dom.createElement(goog.dom.TagName.DIV);

function setUp() {
  vimeo = new goog.ui.media.Vimeo();
  var model = new goog.ui.media.VimeoModel(VIMEO_ID, 'vimeo caption');
  control = new goog.ui.media.Media(model, vimeo);
  control.setSelected(true);
}

function tearDown() {
  control.dispose();
}

function testBasicRendering() {
  control.render(parent);
  var el = goog.dom.getElementsByTagNameAndClass(
      goog.dom.TagName.DIV, goog.ui.media.Vimeo.CSS_CLASS, parent);
  assertEquals(1, el.length);
  assertEquals(VIMEO_URL, control.getDataModel().getUrl());
}

function testParsingUrl() {
  assertExtractsCorrectly(VIMEO_ID, VIMEO_URL);
  assertExtractsCorrectly(VIMEO_ID, VIMEO_URL_HD);
  assertExtractsCorrectly(VIMEO_ID, VIMEO_URL_SECURE);

  var invalidUrl = 'http://invalidUrl/filename.doc';
  var e = assertThrows('parser expects a well formed URL', function() {
    goog.ui.media.VimeoModel.newInstance(invalidUrl);
  });
  assertEquals('failed to parse vimeo url: ' + invalidUrl, e.message);
}

function testBuildingUrl() {
  assertEquals(
      VIMEO_URL, goog.ui.media.VimeoModel.buildUrl(VIMEO_ID));
}

function testCreatingModel() {
  var model = new goog.ui.media.VimeoModel(VIMEO_ID);
  assertEquals(VIMEO_ID, model.getVideoId());
  assertEquals(VIMEO_URL, model.getUrl());
  assertUndefined(model.getCaption());
}

function testCreatingDomOnInitialState() {
  control.render(parent);
  var caption = goog.dom.getElementsByTagNameAndClass(
      goog.dom.TagName.DIV,
      goog.ui.media.Vimeo.CSS_CLASS + '-caption',
      parent);
  assertEquals(1, caption.length);

  var flash = goog.dom.getElementsByTagNameAndClass(
      goog.dom.TagName.DIV, goog.ui.media.FlashObject.CSS_CLASS, parent);
  assertEquals(1, flash.length);
}

function assertExtractsCorrectly(expectedVideoId, url) {
  var model = goog.ui.media.VimeoModel.newInstance(url);
  assertEquals('Video id for ' + url, expectedVideoId, model.getVideoId());
}
