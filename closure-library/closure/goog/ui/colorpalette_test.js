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

goog.provide('goog.ui.ColorPaletteTest');
goog.setTestOnly('goog.ui.ColorPaletteTest');

goog.require('goog.color');
goog.require('goog.dom.TagName');
goog.require('goog.testing.jsunit');
goog.require('goog.ui.ColorPalette');

var emptyPalette, samplePalette;

function setUp() {
  emptyPalette = new goog.ui.ColorPalette();
  samplePalette =
      new goog.ui.ColorPalette(['red', '#00FF00', 'rgb(0, 0, 255)']);
  samplePalette.setSelectedColor('blue');
}

function tearDown() {
  emptyPalette.dispose();
  samplePalette.dispose();
  document.getElementById('sandbox').innerHTML = '';
}

function testEmptyColorPalette() {
  var colors = emptyPalette.getColors();
  assertNotNull(colors);
  assertEquals(0, colors.length);

  var nodes = emptyPalette.getContent();
  assertNotNull(nodes);
  assertEquals(0, nodes.length);
}

function testSampleColorPalette() {
  var colors = samplePalette.getColors();
  assertNotNull(colors);
  assertEquals(3, colors.length);
  assertEquals('red', colors[0]);
  assertEquals('#00FF00', colors[1]);
  assertEquals('rgb(0, 0, 255)', colors[2]);

  var nodes = samplePalette.getContent();
  assertNotNull(nodes);
  assertEquals(3, nodes.length);
  assertEquals('goog-palette-colorswatch', nodes[0].className);
  assertEquals('goog-palette-colorswatch', nodes[1].className);
  assertEquals('goog-palette-colorswatch', nodes[2].className);
  assertEquals('#ff0000', goog.color.parse(nodes[0].style.backgroundColor).hex);
  assertEquals('#00ff00', goog.color.parse(nodes[1].style.backgroundColor).hex);
  assertEquals('#0000ff', goog.color.parse(nodes[2].style.backgroundColor).hex);
}

function testGetColors() {
  var emptyColors = emptyPalette.getColors();
  assertNotNull(emptyColors);
  assertEquals(0, emptyColors.length);

  var sampleColors = samplePalette.getColors();
  assertNotNull(sampleColors);
  assertEquals(3, sampleColors.length);
  assertEquals('red', sampleColors[0]);
  assertEquals('#00FF00', sampleColors[1]);
  assertEquals('rgb(0, 0, 255)', sampleColors[2]);
}

function testSetColors() {
  emptyPalette.setColors(['black', '#FFFFFF']);

  var colors = emptyPalette.getColors();
  assertNotNull(colors);
  assertEquals(2, colors.length);
  assertEquals('black', colors[0]);
  assertEquals('#FFFFFF', colors[1]);

  var nodes = emptyPalette.getContent();
  assertNotNull(nodes);
  assertEquals(2, nodes.length);
  assertEquals('goog-palette-colorswatch', nodes[0].className);
  assertEquals('goog-palette-colorswatch', nodes[1].className);
  assertEquals('#000000', goog.color.parse(nodes[0].style.backgroundColor).hex);
  assertEquals('#ffffff', goog.color.parse(nodes[1].style.backgroundColor).hex);
  assertEquals('black', nodes[0].title);
  assertEquals('RGB (255, 255, 255)', nodes[1].title);

  samplePalette.setColors(['#336699', 'cyan']);

  var newColors = samplePalette.getColors();
  assertNotNull(newColors);
  assertEquals(2, newColors.length);
  assertEquals('#336699', newColors[0]);
  assertEquals('cyan', newColors[1]);

  var newNodes = samplePalette.getContent();
  assertNotNull(newNodes);
  assertEquals(2, newNodes.length);
  assertEquals('goog-palette-colorswatch', newNodes[0].className);
  assertEquals('goog-palette-colorswatch', newNodes[1].className);
  assertEquals(
      '#336699', goog.color.parse(newNodes[0].style.backgroundColor).hex);
  assertEquals(
      '#00ffff', goog.color.parse(newNodes[1].style.backgroundColor).hex);
}

function testSetColorsWithLabels() {
  emptyPalette.setColors(['#00f', '#FFFFFF', 'black'], ['blue', 'white']);
  var nodes = emptyPalette.getContent();
  assertEquals('blue', nodes[0].title);
  assertEquals('white', nodes[1].title);
  assertEquals('black', nodes[2].title);
}

function testRender() {
  samplePalette.render(document.getElementById('sandbox'));

  assertTrue(samplePalette.isInDocument());

  var elem = samplePalette.getElement();
  assertNotNull(elem);
  assertEquals(goog.dom.TagName.DIV, elem.tagName);
  assertEquals('goog-palette', elem.className);

  var table = elem.firstChild;
  assertEquals('TABLE', table.tagName);
  assertEquals('goog-palette-table', table.className);
}

function testGetSelectedColor() {
  assertNull(emptyPalette.getSelectedColor());
  assertEquals('#0000ff', samplePalette.getSelectedColor());
}

function testSetSelectedColor() {
  emptyPalette.setSelectedColor('red');
  assertNull(emptyPalette.getSelectedColor());

  samplePalette.setSelectedColor('red');
  assertEquals('#ff0000', samplePalette.getSelectedColor());
  samplePalette.setSelectedColor(17);  // Invalid color spec.
  assertNull(samplePalette.getSelectedColor());

  samplePalette.setSelectedColor('rgb(0, 255, 0)');
  assertEquals('#00ff00', samplePalette.getSelectedColor());
  samplePalette.setSelectedColor(false);  // Invalid color spec.
  assertNull(samplePalette.getSelectedColor());

  samplePalette.setSelectedColor('#0000FF');
  assertEquals('#0000ff', samplePalette.getSelectedColor());
  samplePalette.setSelectedColor(null);  // Invalid color spec.
  assertNull(samplePalette.getSelectedColor());
}
