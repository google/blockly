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

goog.provide('goog.ui.TableSorterTest');
goog.setTestOnly('goog.ui.TableSorterTest');

goog.require('goog.array');
goog.require('goog.dom');
goog.require('goog.dom.TagName');
goog.require('goog.dom.classlist');
goog.require('goog.testing.events');
goog.require('goog.testing.jsunit');
goog.require('goog.ui.TableSorter');

var oldHtml;
var alphaHeader, numberHeader, notSortableHeader, table, tableSorter;

function setUpPage() {
  oldHtml = goog.dom.getElement('content').innerHTML;
}

function setUp() {
  goog.dom.getElement('content').innerHTML = oldHtml;
  table = goog.dom.getElement('sortable');
  alphaHeader = table.getElementsByTagName(goog.dom.TagName.TH)[0];
  numberHeader = table.getElementsByTagName(goog.dom.TagName.TH)[1];
  notSortableHeader = table.getElementsByTagName(goog.dom.TagName.TH)[2];

  tableSorter = new goog.ui.TableSorter();
  tableSorter.setSortFunction(0, goog.ui.TableSorter.alphaSort);
  tableSorter.setSortFunction(2, goog.ui.TableSorter.noSort);
  tableSorter.decorate(table);
}

function tearDown() {
  tableSorter.dispose();
  table = null;
}

function testConstructor() {
  assertNotNull('Should have successful construction', tableSorter);
  assertNotNull('Should be in document', tableSorter);
}

function testForwardAlpha() {
  goog.testing.events.fireClickEvent(alphaHeader);
  assertOrder(['A', '10', 'B', '0', 'C', '10', 'C', '17', 'C', '3']);
  assertTrue(goog.dom.classlist.contains(alphaHeader,
      'goog-tablesorter-sorted'));
  assertEquals(0, tableSorter.getSortColumn());
  assertFalse(tableSorter.isSortReversed());
}

function testBackwardAlpha() {
  goog.testing.events.fireClickEvent(alphaHeader);
  goog.testing.events.fireClickEvent(alphaHeader);
  assertOrder(['C', '10', 'C', '17', 'C', '3', 'B', '0', 'A', '10']);
  assertFalse(goog.dom.classlist.contains(alphaHeader,
      'goog-tablesorter-sorted'));
  assertTrue(goog.dom.classlist.contains(alphaHeader,
      'goog-tablesorter-sorted-reverse'));
  assertEquals(0, tableSorter.getSortColumn());
  assertTrue(tableSorter.isSortReversed());
}

function testForwardNumeric() {
  goog.testing.events.fireClickEvent(numberHeader);
  assertOrder(['B', '0', 'C', '3', 'C', '10', 'A', '10', 'C', '17']);
  assertTrue(goog.dom.classlist.contains(numberHeader,
      'goog-tablesorter-sorted'));
  assertEquals(1, tableSorter.getSortColumn());
  assertFalse(tableSorter.isSortReversed());
}

function testBackwardNumeric() {
  goog.testing.events.fireClickEvent(numberHeader);
  goog.testing.events.fireClickEvent(numberHeader);
  assertOrder(['C', '17', 'C', '10', 'A', '10', 'C', '3', 'B', '0']);
  assertTrue(goog.dom.classlist.contains(numberHeader,
      'goog-tablesorter-sorted-reverse'));
  assertEquals(1, tableSorter.getSortColumn());
  assertTrue(tableSorter.isSortReversed());
}

function testAlphaThenNumeric() {
  testForwardAlpha();
  goog.testing.events.fireClickEvent(numberHeader);
  assertOrder(['B', '0', 'C', '3', 'A', '10', 'C', '10', 'C', '17']);
  assertFalse(goog.dom.classlist.contains(alphaHeader,
      'goog-tablesorter-sorted'));
  assertEquals(1, tableSorter.getSortColumn());
  assertFalse(tableSorter.isSortReversed());
}

function testNotSortableUnchanged() {
  goog.testing.events.fireClickEvent(notSortableHeader);
  assertEquals(0, goog.dom.classlist.get(notSortableHeader).length);
  assertEquals(-1, tableSorter.getSortColumn());
}

function testSortWithNonDefaultSortableHeaderRowIndex() {
  // Check that clicking on non-sortable header doesn't trigger any sorting.
  assertOrder(['C', '10', 'A', '10', 'C', '17', 'B', '0', 'C', '3']);
  goog.testing.events.fireClickEvent(goog.dom.getElement('not-sortable'));
  assertOrder(['C', '10', 'A', '10', 'C', '17', 'B', '0', 'C', '3']);
}

function testsetSortableHeaderRowIndexAfterDecorateThrows() {
  var func = function() { tableSorter.setSortableHeaderRowIndex(0); };
  var msg = assertThrows('failFunc should throw.', func)['message'];
  assertEquals('Component already rendered', msg);
}

function testSortOnSecondHeaderRow() {
  // Test a table with multiple table headers.
  // Using setSortableHeaderRowIndex one can specify table header columns to use
  // in sorting.
  var tableSorter2 = new goog.ui.TableSorter();
  tableSorter2.setSortableHeaderRowIndex(1);
  tableSorter2.decorate(goog.dom.getElement('sortable-2'));

  // Initial order.
  assertOrder(['4', '5', '6', '1', '2', '3', '3', '1', '9'],
              goog.dom.getElement('sortable-2'));

  // Sort on first column.
  goog.testing.events.fireClickEvent(
      goog.dom.getElement('sorttable-2-col-1'));
  assertOrder(['1', '2', '3', '3', '1', '9', '4', '5', '6'],
              goog.dom.getElement('sortable-2'));

  // Sort on second column.
  goog.testing.events.fireClickEvent(
      goog.dom.getElement('sorttable-2-col-2'));
  assertOrder(['3', '1', '9', '1', '2', '3', '4', '5', '6'],
              goog.dom.getElement('sortable-2'));

  // Sort on third column.
  goog.testing.events.fireClickEvent(
      goog.dom.getElement('sorttable-2-col-3'));
  assertOrder(['1', '2', '3', '4', '5', '6', '3', '1', '9'],
              goog.dom.getElement('sortable-2'));

  // Reverse sort on third column.
  goog.testing.events.fireClickEvent(
      goog.dom.getElement('sorttable-2-col-3'));
  assertOrder(['3', '1', '9', '4', '5', '6', '1', '2', '3'],
              goog.dom.getElement('sortable-2'));

  tableSorter2.dispose();
}

function testSortAfterSwapping() {
  // First click
  goog.testing.events.fireClickEvent(alphaHeader);
  assertOrder(['A', '10', 'B', '0', 'C', '10', 'C', '17', 'C', '3']);
  assertEquals(0, tableSorter.getSortColumn());

  // Move first column to the end
  for (var i = 0, r; (r = table.rows[i]); i++) {
    var cell = r.cells[0];
    cell.parentNode.appendChild(cell);
  }
  // Make sure the above worked as expected
  assertOrder(['10', 'A', '0', 'B', '10', 'C', '17', 'C', '3', 'C']);

  // Our column is now the second one
  assertEquals(2, tableSorter.getSortColumn());

  // Second click, should reverse
  tableSorter.setSortFunction(2, goog.ui.TableSorter.alphaSort);
  goog.testing.events.fireClickEvent(alphaHeader);
  assertOrder(['10', 'C', '17', 'C', '3', 'C', '0', 'B', '10', 'A']);
}

function testTwoBodies() {
  var table3 = goog.dom.getElement('sortable-3');
  var header = goog.dom.getElement('sortable-3-col');
  var sorter3 = new goog.ui.TableSorter();
  sorter3.setSortFunction(0, goog.ui.TableSorter.alphaSort);
  try {
    sorter3.decorate(table3);
    goog.testing.events.fireClickEvent(header);
    assertOrder(['A', 'B', 'C', 'A', 'B', 'C'], table3);
    goog.testing.events.fireClickEvent(header);
    assertOrder(['C', 'B', 'A', 'C', 'B', 'A'], table3);
  } finally {
    sorter3.dispose();
  }
}

function testNaNs() {
  var table = goog.dom.getElement('sortable-4');
  var header = goog.dom.getElement('sortable-4-col');
  var sorter = new goog.ui.TableSorter();
  try {
    // All non-numbers compare equal, i.e. Bar == Foo, so order of those
    // elements should not change (since we are using stable sort).
    sorter.decorate(table);
    goog.testing.events.fireClickEvent(header);
    assertOrder(['2', '3', '11', 'Bar', 'Foo'], table);
    goog.testing.events.fireClickEvent(header);
    assertOrder(['Bar', 'Foo', '11', '3', '2'], table);
  } finally {
    sorter.dispose();
  }
}

function assertOrder(arr, opt_table) {
  var tbl = opt_table || table;
  var actual = [];
  goog.array.forEach(tbl.getElementsByTagName(goog.dom.TagName.TD),
                     function(td, idx) {
                       var txt = goog.dom.getTextContent(td);
                       if (txt) {
                         actual.push(txt);
                       }
                     });
  assertArrayEquals(arr, actual);
}
