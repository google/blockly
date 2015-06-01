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

goog.provide('goog.ui.CustomColorPaletteTest');
goog.setTestOnly('goog.ui.CustomColorPaletteTest');

goog.require('goog.dom.TagName');
goog.require('goog.dom.classlist');
goog.require('goog.testing.jsunit');
goog.require('goog.ui.CustomColorPalette');

var samplePalette;

function setUp() {
  samplePalette = new goog.ui.CustomColorPalette();
}

function tearDown() {
  samplePalette.dispose();
  document.getElementById('sandbox').innerHTML = '';
}

function testRender() {
  samplePalette.render(document.getElementById('sandbox'));

  assertTrue('Palette must have been rendered',
             samplePalette.isInDocument());

  var elem = samplePalette.getElement();
  assertNotNull('The palette element should not be null', elem);
  assertEquals('The palette element should have the right tag name',
               goog.dom.TagName.DIV, elem.tagName);

  assertTrue('The custom color palette should have the right class name',
             goog.dom.classlist.contains(elem, 'goog-palette'));
}

function testSetColors() {
  var colorSet = ['#e06666', '#f6b26b', '#ffd966', '#93c47d', '#76a5af',
    '#6fa8dc', '#8e7cc3'];
  samplePalette.setColors(colorSet);
  assertSameElements('The palette should have the correct set of colors',
                     colorSet, samplePalette.getColors());
}
