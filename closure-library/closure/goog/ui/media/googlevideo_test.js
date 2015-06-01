// Copyright 2011 The Closure Library Authors. All Rights Reserved.
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

goog.provide('goog.ui.media.GoogleVideoTest');
goog.setTestOnly('goog.ui.media.GoogleVideoTest');

goog.require('goog.dom');
goog.require('goog.dom.TagName');
goog.require('goog.testing.jsunit');
goog.require('goog.ui.media.FlashObject');
goog.require('goog.ui.media.GoogleVideo');
goog.require('goog.ui.media.GoogleVideoModel');
goog.require('goog.ui.media.Media');
var video;
var control;
var VIDEO_URL_PREFIX = 'http://video.google.com/videoplay?docid=';
var VIDEO_ID = '7582902000166025817';
var VIDEO_URL = VIDEO_URL_PREFIX + VIDEO_ID;
var parent = goog.dom.createElement(goog.dom.TagName.DIV);

function setUp() {
  video = new goog.ui.media.GoogleVideo();
  var model = new goog.ui.media.GoogleVideoModel(VIDEO_ID, 'video caption');
  control = new goog.ui.media.Media(model, video);
  control.setSelected(true);
}

function tearDown() {
  control.dispose();
}

function testBasicRendering() {
  control.render(parent);
  var el = goog.dom.getElementsByTagNameAndClass(
      goog.dom.TagName.DIV, goog.ui.media.GoogleVideo.CSS_CLASS, parent);
  assertEquals(1, el.length);
  assertEquals(VIDEO_URL, control.getDataModel().getUrl());
}

function testParsingUrl() {
  assertExtractsCorrectly(VIDEO_ID, VIDEO_URL);
  // Test a url with # at the end.
  assertExtractsCorrectly(VIDEO_ID, VIDEO_URL + '#');
  // Test a url with a negative docid.
  assertExtractsCorrectly('-123', VIDEO_URL_PREFIX + '-123');
  // Test a url with two docids. The valid one is the second.
  assertExtractsCorrectly('123', VIDEO_URL + '#docid=123');

  var invalidUrl = 'http://invalidUrl/filename.doc';
  var e = assertThrows('parser expects a well formed URL', function() {
    goog.ui.media.GoogleVideoModel.newInstance(invalidUrl);
  });
  assertEquals('failed to parse video id from GoogleVideo url: ' + invalidUrl,
      e.message);
}

function testBuildingUrl() {
  assertEquals(VIDEO_URL, goog.ui.media.GoogleVideoModel.buildUrl(VIDEO_ID));
}

function testCreatingModel() {
  var model = new goog.ui.media.GoogleVideoModel(VIDEO_ID);
  assertEquals(VIDEO_ID, model.getVideoId());
  assertEquals(VIDEO_URL, model.getUrl());
  assertUndefined(model.getCaption());
}

function testCreatingDomOnInitialState() {
  control.render(parent);
  var caption = goog.dom.getElementsByTagNameAndClass(
      goog.dom.TagName.DIV,
      goog.ui.media.GoogleVideo.CSS_CLASS + '-caption',
      parent);
  assertEquals(1, caption.length);

  var flash = goog.dom.getElementsByTagNameAndClass(
      goog.dom.TagName.DIV, goog.ui.media.FlashObject.CSS_CLASS, parent);
  assertEquals(1, flash.length);
}

function assertExtractsCorrectly(expectedVideoId, url) {
  var model = goog.ui.media.GoogleVideoModel.newInstance(url);
  assertEquals('Video id for ' + url, expectedVideoId, model.getVideoId());
}
