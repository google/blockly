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

goog.provide('goog.ui.HsvPaletteTest');
goog.setTestOnly('goog.ui.HsvPaletteTest');

goog.require('goog.color');
goog.require('goog.dom.TagName');
goog.require('goog.dom.classlist');
goog.require('goog.events');
goog.require('goog.events.Event');
goog.require('goog.math.Coordinate');
goog.require('goog.style');
goog.require('goog.testing.PropertyReplacer');
goog.require('goog.testing.jsunit');
goog.require('goog.ui.Component');
goog.require('goog.ui.HsvPalette');
goog.require('goog.userAgent');

var samplePalette;
var eventWasFired = false;
var stubs = new goog.testing.PropertyReplacer();

function setUp() {
  samplePalette = new goog.ui.HsvPalette();
}

function tearDown() {
  samplePalette.dispose();
  stubs.reset();
}

function testRtl() {
  samplePalette.render(document.getElementById('sandboxRtl'));
  var color = '#ffffff';
  samplePalette.inputElement.value = color;
  samplePalette.handleInput(null);
  var expectedRight = samplePalette.hsImageEl_.offsetWidth -
      Math.ceil(samplePalette.hsHandleEl_.offsetWidth / 2);
  assertEquals(expectedRight + 'px', samplePalette.hsHandleEl_.style['right']);
  assertEquals('', samplePalette.hsHandleEl_.style['left']);
}

function testOptionalInitialColor() {
  var initialColor = '#0000ff';
  var customInitialPalette = new goog.ui.HsvPalette(null, initialColor);
  assertEquals(
      initialColor, goog.color.parse(customInitialPalette.getColor()).hex);
}

function testCustomClassName() {
  var customClassName = 'custom-plouf';
  var customClassPalette = new goog.ui.HsvPalette(null, null, customClassName);
  customClassPalette.createDom();
  assertTrue(
      goog.dom.classlist.contains(
          customClassPalette.getElement(), customClassName));
}

function testCannotDecorate() {
  assertFalse(samplePalette.canDecorate());
}

function testSetColor() {
  var color = '#abcdef';
  samplePalette.setColor(color);
  assertEquals(color, goog.color.parse(samplePalette.getColor()).hex);
  color = 'abcdef';
  samplePalette.setColor(color);
  assertEquals('#' + color, goog.color.parse(samplePalette.getColor()).hex);
}

function testChangeEvent() {
  // TODO(user): Add functionality to goog.testing.events to assert
  // an event was fired.
  goog.events.listen(
      samplePalette, goog.ui.Component.EventType.ACTION,
      function() { eventWasFired = true; });
  samplePalette.setColor('#123456');
  assertTrue(eventWasFired);
}

function testSetHsv() {
  // Start from red.
  samplePalette.setColor('#ff0000');

  // Setting hue to 0.5 should yield cyan.
  samplePalette.setHsv(0.5, null, null);
  assertEquals('#00ffff', goog.color.parse(samplePalette.getColor()).hex);

  // Setting saturation to 0 should yield white.
  samplePalette.setHsv(null, 0, null);
  assertEquals('#ffffff', goog.color.parse(samplePalette.getColor()).hex);

  // Setting value/brightness to 0 should yield black.
  samplePalette.setHsv(null, null, 0);
  assertEquals('#000000', goog.color.parse(samplePalette.getColor()).hex);
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
        ['goog-hsv-palette', 'goog-hsv-palette-noalpha'],
        goog.dom.classlist.get(elem));
  } else {
    assertEquals(
        'The noalpha class must not be present', 'goog-hsv-palette',
        elem.className);
  }
}

function testSwatchTextIsReadable() {
  samplePalette.render(document.getElementById('sandbox'));

  var swatchElement = samplePalette.swatchElement;

  // Text should be black when background is light.
  samplePalette.setColor('#ccffff');
  assertEquals(
      '#000000',
      goog.color.parse(goog.style.getStyle(swatchElement, 'color')).hex);

  // Text should be white when background is dark.
  samplePalette.setColor('#410800');
  assertEquals(
      '#ffffff',
      goog.color.parse(goog.style.getStyle(swatchElement, 'color')).hex);
}

function testInputColor() {
  samplePalette.render(document.getElementById('sandbox'));
  var color = '#001122';
  samplePalette.inputElement.value = color;
  samplePalette.handleInput(null);
  assertEquals(color, goog.color.parse(samplePalette.getColor()).hex);
}

function testHandleMouseMoveValue() {
  samplePalette.render(document.getElementById('sandbox'));
  stubs.set(goog.dom, 'getPageScroll', function() {
    return new goog.math.Coordinate(0, 0);
  });

  // Raising the value/brightness of a dark red should yield a lighter red.
  samplePalette.setColor('#630c00');
  goog.style.setPageOffset(samplePalette.valueBackgroundImageElement, 0, 0);
  goog.style.setSize(samplePalette.valueBackgroundImageElement, 10, 100);
  var boundaries =
      goog.style.getBounds(samplePalette.valueBackgroundImageElement, 0, 0);

  var event = new goog.events.Event();
  event.clientY = -50;
  // TODO(user): Use
  // goog.testing.events.fireMouseDownEvent(
  //     samplePalette.valueBackgroundImageElement);
  // when google.testing.events support specifying properties of the event
  // or find out how tod o it if it already supports it.
  samplePalette.handleMouseMoveV_(boundaries, event);
  assertEquals('#ff1e00', goog.color.parse(samplePalette.getColor()).hex);
}

function testHandleMouseMoveHueSaturation() {
  samplePalette.render(document.getElementById('sandbox'));
  stubs.set(goog.dom, 'getPageScroll', function() {
    return new goog.math.Coordinate(0, 0);
  });

  // The following hue/saturation selection should yield a light yellow.
  goog.style.setPageOffset(samplePalette.hsImageEl_, 0, 0);
  goog.style.setSize(samplePalette.hsImageEl_, 100, 100);
  var boundaries = goog.style.getBounds(samplePalette.hsImageEl_);

  var event = new goog.events.Event();
  event.clientX = 20;
  event.clientY = 85;
  // TODO(user): Use goog.testing.events when appropriate (see above).
  samplePalette.handleMouseMoveHs_(boundaries, event);
  assertEquals('#ffeec4', goog.color.parse(samplePalette.getColor()).hex);
}
