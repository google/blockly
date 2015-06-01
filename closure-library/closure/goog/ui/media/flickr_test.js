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

goog.provide('goog.ui.media.FlickrSetTest');
goog.setTestOnly('goog.ui.media.FlickrSetTest');

goog.require('goog.dom');
goog.require('goog.dom.TagName');
goog.require('goog.html.testing');
goog.require('goog.testing.jsunit');
goog.require('goog.ui.media.FlashObject');
goog.require('goog.ui.media.FlickrSet');
goog.require('goog.ui.media.FlickrSetModel');
goog.require('goog.ui.media.Media');
var flickr;
var control;
var FLICKR_USER = 'ingawalker';
var FLICKR_SET = '72057594102831547';
var FLICKRSET_URL =
    'http://flickr.com/photos/' + FLICKR_USER + '/sets/' + FLICKR_SET;
var parent = goog.dom.createElement(goog.dom.TagName.DIV);

function setUp() {
  flickr = new goog.ui.media.FlickrSet();
  var set = new goog.ui.media.FlickrSetModel(FLICKR_USER, FLICKR_SET,
      'caption');
  control = new goog.ui.media.Media(set, flickr);
}

function tearDown() {
  control.dispose();
}

function testBasicRendering() {
  control.render(parent);
  var el = goog.dom.getElementsByTagNameAndClass(
      goog.dom.TagName.DIV, goog.ui.media.FlickrSet.CSS_CLASS, parent);
  assertEquals(1, el.length);
  assertEquals(FLICKRSET_URL, control.getDataModel().getUrl());
}

function testParsingUrl() {
  assertExtractsCorrectly(FLICKR_USER, FLICKR_SET, FLICKRSET_URL);
  // user id with @ sign
  assertExtractsCorrectly('30441750@N06', '7215760789302468',
      'http://flickr.com/photos/30441750@N06/sets/7215760789302468/');
  // user id with - sign
  assertExtractsCorrectly('30441750-N06', '7215760789302468',
      'http://flickr.com/photos/30441750-N06/sets/7215760789302468/');

  var invalidUrl = 'http://invalidUrl/filename.doc';
  var e = assertThrows('', function() {
    goog.ui.media.FlickrSetModel.newInstance(invalidUrl);
  });
  assertEquals('failed to parse flickr url: ' + invalidUrl, e.message);
}

function testBuildingUrl() {
  assertEquals(FLICKRSET_URL,
      goog.ui.media.FlickrSetModel.buildUrl(
          FLICKR_USER, FLICKR_SET, FLICKRSET_URL));
}

function testCreatingModel() {
  var model = new goog.ui.media.FlickrSetModel(FLICKR_USER, FLICKR_SET);
  assertEquals(FLICKR_USER, model.getUserId());
  assertEquals(FLICKR_SET, model.getSetId());
  assertEquals(FLICKRSET_URL, model.getUrl());
  assertUndefined(model.getCaption());
}

function testSettingWhichFlashUrlToUse() {
  goog.ui.media.FlickrSet.setFlashUrl(
      goog.html.testing.newTrustedResourceUrlForTest('http://foo'));
  assertEquals('http://foo',
      goog.ui.media.FlickrSet.flashUrl_.getTypedStringValue());
}

function testCreatingDomOnInitialState() {
  control.render(parent);
  var caption = goog.dom.getElementsByTagNameAndClass(
      goog.dom.TagName.DIV,
      goog.ui.media.FlickrSet.CSS_CLASS + '-caption',
      parent);
  assertEquals(1, caption.length);

  var flash = goog.dom.getElementsByTagNameAndClass(
      goog.dom.TagName.DIV, goog.ui.media.FlashObject.CSS_CLASS, parent);
  assertEquals(1, flash.length);
}

function assertExtractsCorrectly(expectedUserId, expectedSetId, url) {
  var flickr = goog.ui.media.FlickrSetModel.newInstance(url);
  assertEquals('userId for ' + url, expectedUserId, flickr.getUserId());
  assertEquals('setId for ' + url, expectedSetId, flickr.getSetId());
}
