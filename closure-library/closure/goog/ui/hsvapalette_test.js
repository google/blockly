// Copyright 2008 The Closure Library Authors. All Rights Reserved.
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

goog.provide('goog.ui.HsvaPaletteTest');
goog.setTestOnly('goog.ui.HsvaPaletteTest');

goog.require('goog.color.alpha');
goog.require('goog.dom.TagName');
goog.require('goog.dom.classlist');
goog.require('goog.events.Event');
goog.require('goog.math.Coordinate');
goog.require('goog.style');
goog.require('goog.testing.PropertyReplacer');
goog.require('goog.testing.jsunit');
goog.require('goog.ui.HsvaPalette');
goog.require('goog.userAgent');

var samplePalette;
var eventWasFired = false;
var stubs = new goog.testing.PropertyReplacer();

function setUp() {
  samplePalette = new goog.ui.HsvaPalette();
}

function tearDown() {
  samplePalette.dispose();
  stubs.reset();
}

function testZeroAlpha() {
  var palette = new goog.ui.HsvaPalette(null, undefined, 0);
  assertEquals(0, palette.getAlpha());
}

function testOptionalInitialColor() {
  var alpha = 0.5;
  var color = '#0000ff';
  var palette = new goog.ui.HsvaPalette(null, color, alpha);
  assertEquals(color, palette.getColor());
  assertEquals(alpha, palette.getAlpha());
}

function testCustomClassName() {
  var customClassName = 'custom-plouf';
  var customClassPalette =
      new goog.ui.HsvaPalette(null, null, null, customClassName);
  customClassPalette.createDom();
  assertTrue(
      goog.dom.classlist.contains(
          customClassPalette.getElement(), customClassName));
}

function testSetColor() {
  var color = '#abcdef01';
  samplePalette.setColorRgbaHex(color);
  assertEquals(
      color, goog.color.alpha.parse(samplePalette.getColorRgbaHex()).hex);
  color = 'abcdef01';
  samplePalette.setColorRgbaHex(color);
  assertEquals(
      '#' + color, goog.color.alpha.parse(samplePalette.getColorRgbaHex()).hex);
}

function testRender() {
  samplePalette.render(document.getElementById('sandbox'));

  assertTrue(samplePalette.isInDocument());

  var elem = samplePalette.getElement();
  assertNotNull(elem);
  assertEquals(goog.dom.TagName.DIV, elem.tagName);

  if (goog.userAgent.IE && !goog.userAgent.isVersionOrHigher('7')) {
    assertSameElements(
        'On IE6, the noalpha class must be present',
        ['goog-hsva-palette', 'goog-hsva-palette-noalpha'],
        goog.dom.classlist.get(elem));
  } else {
    assertEquals(
        'The noalpha class must not be present', 'goog-hsva-palette',
        elem.className);
  }
}

function testInputColor() {
  samplePalette.render(document.getElementById('sandbox'));
  var color = '#00112233';
  samplePalette.inputElement.value = color;
  samplePalette.handleInput(null);
  assertEquals(
      color, goog.color.alpha.parse(samplePalette.getColorRgbaHex()).hex);
}

function testHandleMouseMoveAlpha() {
  samplePalette.render(document.getElementById('sandbox'));
  stubs.set(goog.dom, 'getPageScroll', function() {
    return new goog.math.Coordinate(0, 0);
  });

  // Lowering the opacity of a dark, opaque red should yield a
  // more transparent red.
  samplePalette.setColorRgbaHex('#630c0000');
  goog.style.setPageOffset(samplePalette.aImageEl_, 0, 0);
  goog.style.setSize(samplePalette.aImageEl_, 10, 100);
  var boundaries = goog.style.getBounds(samplePalette.aImageEl_);

  var event = new goog.events.Event();
  event.clientY = boundaries.top;
  samplePalette.handleMouseMoveA_(boundaries, event);

  assertEquals('#630c00ff', samplePalette.getColorRgbaHex());
}

function testSwatchOpacity() {
  samplePalette.render(document.getElementById('sandbox'));

  samplePalette.setAlpha(1);
  assertEquals(1, goog.style.getOpacity(samplePalette.swatchElement));

  samplePalette.setAlpha(0x99 / 0xff);
  assertEquals(0.6, goog.style.getOpacity(samplePalette.swatchElement));

  samplePalette.setAlpha(0);
  assertEquals(0, goog.style.getOpacity(samplePalette.swatchElement));
}

function testNoTransparencyBehavior() {
  samplePalette.render(document.getElementById('sandbox'));

  samplePalette.inputElement.value = '#abcdef22';
  samplePalette.handleInput(null);
  samplePalette.inputElement.value = '#abcdef';
  samplePalette.handleInput(null);
  assertEquals(1, goog.style.getOpacity(samplePalette.swatchElement));
}
