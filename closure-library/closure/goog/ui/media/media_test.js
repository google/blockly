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

goog.provide('goog.ui.media.MediaTest');
goog.setTestOnly('goog.ui.media.MediaTest');

goog.require('goog.dom');
goog.require('goog.dom.TagName');
goog.require('goog.math.Size');
goog.require('goog.testing.jsunit');
goog.require('goog.ui.ControlRenderer');
goog.require('goog.ui.media.Media');
goog.require('goog.ui.media.MediaModel');
goog.require('goog.ui.media.MediaRenderer');
var control;  // The name 'media' collides with a built-in var in Chrome.
var renderer;
var model;

function setUp() {
  renderer = new goog.ui.media.MediaRenderer();
  model = new goog.ui.media.MediaModel(
      'http://url.com', 'a caption', 'a description');
  control = new goog.ui.media.Media(model, renderer);
}

function tearDown() {
  control.dispose();
}

function testBasicElements() {
  var model = new goog.ui.media.MediaModel(
      'http://url.com', 'a caption', 'a description');
  var thumb1 = new goog.ui.media.MediaModel.Thumbnail(
      'http://thumb.com/small.jpg', new goog.math.Size(320, 288));
  var thumb2 = new goog.ui.media.MediaModel.Thumbnail(
      'http://thumb.com/big.jpg', new goog.math.Size(800, 600));
  model.setThumbnails([thumb1, thumb2]);
  model.setPlayer(
      new goog.ui.media.MediaModel.Player('http://media/player.swf'));
  var control = new goog.ui.media.Media(model, renderer);
  control.render();

  var caption = goog.dom.getElementsByTagNameAndClass(
      undefined, goog.ui.ControlRenderer.CSS_CLASS + '-caption');
  var description = goog.dom.getElementsByTagNameAndClass(
      undefined, goog.ui.ControlRenderer.CSS_CLASS + '-description');
  var thumbnail0 = goog.dom.getElementsByTagNameAndClass(
      goog.dom.TagName.IMG, goog.ui.ControlRenderer.CSS_CLASS + '-thumbnail0');
  var thumbnail1 = goog.dom.getElementsByTagNameAndClass(
      goog.dom.TagName.IMG, goog.ui.ControlRenderer.CSS_CLASS + '-thumbnail1');
  var player = goog.dom.getElementsByTagNameAndClass(
      goog.dom.TagName.IFRAME, goog.ui.ControlRenderer.CSS_CLASS + '-player');

  assertNotNull(caption);
  assertEquals(1, caption.length);
  assertNotNull(description);
  assertEquals(1, description.length);
  assertNotNull(thumbnail0);
  assertEquals(1, thumbnail0.length);
  assertEquals('320px', thumbnail0[0].style.width);
  assertEquals('288px', thumbnail0[0].style.height);
  assertEquals('http://thumb.com/small.jpg', thumbnail0[0].src);
  assertNotNull(thumbnail1);
  assertEquals(1, thumbnail1.length);
  assertEquals('800px', thumbnail1[0].style.width);
  assertEquals('600px', thumbnail1[0].style.height);
  assertEquals('http://thumb.com/big.jpg', thumbnail1[0].src);
  // players are only shown when media is selected
  assertNotNull(player);
  assertEquals(0, player.length);

  control.dispose();
}

function testDoesntCreatesCaptionIfUnavailable() {
  var incompleteModel = new goog.ui.media.MediaModel(
      'http://url.com', undefined, 'a description');
  incompleteMedia = new goog.ui.media.Media('', renderer);
  incompleteMedia.setDataModel(incompleteModel);
  incompleteMedia.render();
  var caption = goog.dom.getElementsByTagNameAndClass(
      undefined, goog.ui.ControlRenderer.CSS_CLASS + '-caption');
  var description = goog.dom.getElementsByTagNameAndClass(
      undefined, goog.ui.ControlRenderer.CSS_CLASS + '-description');
  assertEquals(0, caption.length);
  assertNotNull(description);
  incompleteMedia.dispose();
}

function testSetAriaLabel() {
  var model = new goog.ui.media.MediaModel(
      'http://url.com', 'a caption', 'a description');
  var thumb1 = new goog.ui.media.MediaModel.Thumbnail(
      'http://thumb.com/small.jpg', new goog.math.Size(320, 288));
  var thumb2 = new goog.ui.media.MediaModel.Thumbnail(
      'http://thumb.com/big.jpg', new goog.math.Size(800, 600));
  model.setThumbnails([thumb1, thumb2]);
  model.setPlayer(
      new goog.ui.media.MediaModel.Player('http://media/player.swf'));
  var control = new goog.ui.media.Media(model, renderer);
  assertNull(
      'Media must not have aria label by default', control.getAriaLabel());
  control.setAriaLabel('My media');
  control.render();
  var element = control.getElementStrict();
  assertNotNull('Element must not be null', element);
  assertEquals(
      'Media element must have expected aria-label', 'My media',
      element.getAttribute('aria-label'));
  assertTrue(goog.dom.isFocusableTabIndex(element));
  control.setAriaLabel('My new media');
  assertEquals(
      'Media element must have updated aria-label', 'My new media',
      element.getAttribute('aria-label'));
}
