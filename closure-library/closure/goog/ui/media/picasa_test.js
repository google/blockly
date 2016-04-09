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

goog.provide('goog.ui.media.PicasaTest');
goog.setTestOnly('goog.ui.media.PicasaTest');

goog.require('goog.dom');
goog.require('goog.dom.TagName');
goog.require('goog.testing.jsunit');
goog.require('goog.ui.media.FlashObject');
goog.require('goog.ui.media.Media');
goog.require('goog.ui.media.PicasaAlbum');
goog.require('goog.ui.media.PicasaAlbumModel');
var picasa;
var control;
var PICASA_USERNAME = 'username';
var PICASA_ALBUM = 'albumname';
var PICASA_URL =
    'http://picasaweb.google.com/' + PICASA_USERNAME + '/' + PICASA_ALBUM;
var parent = goog.dom.createElement(goog.dom.TagName.DIV);

function setUp() {
  picasa = new goog.ui.media.PicasaAlbum();
  var model = new goog.ui.media.PicasaAlbumModel(
      PICASA_USERNAME, PICASA_ALBUM, null, 'album title');
  control = new goog.ui.media.Media(model, picasa);
  control.setSelected(true);
}

function tearDown() {
  control.dispose();
}

function testBasicRendering() {
  control.render(parent);
  var el = goog.dom.getElementsByTagNameAndClass(
      goog.dom.TagName.DIV, goog.ui.media.PicasaAlbum.CSS_CLASS, parent);
  assertEquals(1, el.length);
  assertEquals(PICASA_URL, control.getDataModel().getUrl());
}

function testParsingUrl() {
  assertExtractsCorrectly(PICASA_USERNAME, PICASA_ALBUM, null, PICASA_URL);
  assertExtractsCorrectly(
      'foo', 'bar', null, 'https://picasaweb.google.com/foo/bar');
  assertExtractsCorrectly(
      'foo', 'bar', null, 'https://www.picasaweb.google.com/foo/bar');
  assertExtractsCorrectly(
      'foo', 'bar', null, 'https://www.picasaweb.com/foo/bar');
  assertExtractsCorrectly(
      'foo', 'bar', '8Hzg1CUUAZM',
      'https://www.picasaweb.com/foo/bar?authkey=8Hzg1CUUAZM#');
  assertExtractsCorrectly(
      'foo', 'bar', '8Hzg1CUUAZM',
      'https://www.picasaweb.com/foo/bar?foo=bar&authkey=8Hzg1CUUAZM#');
  assertExtractsCorrectly(
      'foo', 'bar', '8Hzg1CUUAZM',
      'https://www.picasaweb.com/foo/bar?foo=bar&authkey=8Hzg1CUUAZM&' +
          'hello=world#');

  var invalidUrl = 'http://invalidUrl/watch?v=dMH0bHeiRNg';
  var e = assertThrows('parser expects a well formed URL', function() {
    goog.ui.media.PicasaAlbumModel.newInstance(invalidUrl);
  });
  assertEquals(
      'failed to parse user and album from picasa url: ' + invalidUrl,
      e.message);
}

function testBuildingUrl() {
  assertEquals(
      PICASA_URL,
      goog.ui.media.PicasaAlbumModel.buildUrl(PICASA_USERNAME, PICASA_ALBUM));
}

function testCreatingModel() {
  var model = new goog.ui.media.PicasaAlbumModel(PICASA_USERNAME, PICASA_ALBUM);
  assertEquals(PICASA_USERNAME, model.getUserId());
  assertEquals(PICASA_ALBUM, model.getAlbumId());
  assertEquals(PICASA_URL, model.getUrl());
  assertUndefined(model.getCaption());
}

function testCreatingDomOnInitialState() {
  control.render(parent);
  var caption = goog.dom.getElementsByTagNameAndClass(
      goog.dom.TagName.DIV, goog.ui.media.PicasaAlbum.CSS_CLASS + '-caption',
      parent);
  assertEquals(1, caption.length);

  var flash = goog.dom.getElementsByTagNameAndClass(
      goog.dom.TagName.DIV, goog.ui.media.FlashObject.CSS_CLASS, parent);
  assertEquals(1, flash.length);
}

function assertExtractsCorrectly(
    expectedUserId, expectedAlbumId, expectedAuthKey, url) {
  var model = goog.ui.media.PicasaAlbumModel.newInstance(url);
  assertEquals('User for ' + url, expectedUserId, model.getUserId());
  assertEquals('Album for ' + url, expectedAlbumId, model.getAlbumId());
  assertEquals('AuthKey for ' + url, expectedAuthKey, model.getAuthKey());
}
