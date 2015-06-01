// Copyright 2012 The Closure Library Authors. All Rights Reserved.
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

goog.provide('goog.ui.PaletteRendererTest');
goog.setTestOnly('goog.ui.PaletteRendererTest');

goog.require('goog.a11y.aria');
goog.require('goog.a11y.aria.Role');
goog.require('goog.a11y.aria.State');
goog.require('goog.array');
goog.require('goog.dom');
goog.require('goog.dom.TagName');
goog.require('goog.testing.jsunit');
goog.require('goog.ui.Palette');
goog.require('goog.ui.PaletteRenderer');

var sandbox;
var items = [
  '<div aria-label="label-0"></div>',
  '<div title="title-1"></div>',
  '<div aria-label="label-2" title="title-2"></div>',
  '<div><span title="child-title-3"></span></div>'
];
var itemEls;
var renderer;
var palette;

function setUp() {
  sandbox = goog.dom.getElement('sandbox');
  itemEls = goog.array.map(items, function(item, index, a) {
    return goog.dom.htmlToDocumentFragment(item);
  });
  renderer = new goog.ui.PaletteRenderer();
  palette = new goog.ui.Palette(itemEls, renderer);
  palette.setSize(4, 1);
}

function tearDown() {
  palette.dispose();
}

function testGridA11yRoles() {
  var grid = renderer.createDom(palette);
  assertEquals(goog.a11y.aria.Role.GRID, goog.a11y.aria.getRole(grid));
  var table = grid.getElementsByTagName(goog.dom.TagName.TABLE)[0];
  var row = table.getElementsByTagName(goog.dom.TagName.TR)[0];
  assertEquals(goog.a11y.aria.Role.ROW, goog.a11y.aria.getRole(row));
  var cell = row.getElementsByTagName(goog.dom.TagName.TD)[0];
  assertEquals(goog.a11y.aria.Role.GRIDCELL, goog.a11y.aria.getRole(cell));
}

function testCellA11yLabels() {
  var grid = renderer.createDom(palette);
  var cells = grid.getElementsByTagName(goog.dom.TagName.TD);

  assertEquals('An aria-label is used as a label',
      'label-0', goog.a11y.aria.getLabel(cells[0]));
  assertEquals('A title is used as a label',
      'title-1', goog.a11y.aria.getLabel(cells[1]));
  assertEquals('An aria-label takes precedence over a title',
      'label-2', goog.a11y.aria.getLabel(cells[2]));
  assertEquals('Children are traversed to find labels',
      'child-title-3', goog.a11y.aria.getLabel(cells[3]));
}

function testA11yActiveDescendant() {
  palette.render();
  var cells = palette.getElementStrict().getElementsByTagName(
      goog.dom.TagName.TD);

  renderer.highlightCell(palette, cells[1].firstChild, true);
  assertEquals(cells[1].id, goog.a11y.aria.getState(
      palette.getElementStrict(), goog.a11y.aria.State.ACTIVEDESCENDANT));

  renderer.highlightCell(palette, cells[0].firstChild, false);
  assertEquals(cells[1].id, goog.a11y.aria.getState(
      palette.getElementStrict(), goog.a11y.aria.State.ACTIVEDESCENDANT));

  renderer.highlightCell(palette, cells[1].firstChild, false);
  assertNotEquals(cells[1].id, goog.a11y.aria.getState(
      palette.getElementStrict(), goog.a11y.aria.State.ACTIVEDESCENDANT));
}
