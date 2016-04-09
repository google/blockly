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

goog.provide('goog.dom.TextRangeTest');
goog.setTestOnly('goog.dom.TextRangeTest');

goog.require('goog.dom');
goog.require('goog.dom.ControlRange');
goog.require('goog.dom.Range');
goog.require('goog.dom.TextRange');
goog.require('goog.math.Coordinate');
goog.require('goog.style');
goog.require('goog.testing.ExpectedFailures');
goog.require('goog.testing.jsunit');
goog.require('goog.userAgent');
goog.require('goog.userAgent.product');

var logo;
var logo2;
var logo3;
var logo3Rtl;
var table;
var table2;
var table2div;
var test3;
var test3Rtl;
var expectedFailures;

function setUpPage() {
  logo = goog.dom.getElement('logo');
  logo2 = goog.dom.getElement('logo2');
  logo3 = goog.dom.getElement('logo3');
  logo3Rtl = goog.dom.getElement('logo3Rtl');
  table = goog.dom.getElement('table');
  table2 = goog.dom.getElement('table2');
  table2div = goog.dom.getElement('table2div');
  test3 = goog.dom.getElement('test3');
  test3Rtl = goog.dom.getElement('test3Rtl');
  expectedFailures = new goog.testing.ExpectedFailures();
}

function tearDown() {
  expectedFailures.handleTearDown();
}

function testCreateFromNodeContents() {
  assertNotNull(
      'Text range object can be created for element node',
      goog.dom.TextRange.createFromNodeContents(logo));
  assertNotNull(
      'Text range object can be created for text node',
      goog.dom.TextRange.createFromNodeContents(logo2.previousSibling));
}

function testMoveToNodes() {
  var range = goog.dom.TextRange.createFromNodeContents(table2);
  range.moveToNodes(table2div, 0, table2div, 1, false);
  assertEquals(
      'Range should start in table2div', table2div, range.getStartNode());
  assertEquals('Range should end in table2div', table2div, range.getEndNode());
  assertEquals('Range start offset should be 0', 0, range.getStartOffset());
  assertEquals('Range end offset should be 0', 1, range.getEndOffset());
  assertFalse('Range should not be reversed', range.isReversed());
  range.moveToNodes(table2div, 0, table2div, 1, true);
  assertTrue('Range should be reversed', range.isReversed());
  assertEquals('Range text should be "foo"', 'foo', range.getText());
}

function testContainsTextRange() {
  var range = goog.dom.TextRange.createFromNodeContents(table2);
  var range2 = goog.dom.TextRange.createFromNodeContents(table2div);
  assertTrue('TextRange contains other TextRange', range.containsRange(range2));
  assertFalse(
      'TextRange does not contain other TextRange',
      range2.containsRange(range));

  range = goog.dom.Range.createFromNodes(
      table2div.firstChild, 1, table2div.lastChild, 1);
  range2 = goog.dom.TextRange.createFromNodes(
      table2div.firstChild, 0, table2div.lastChild, 0);
  assertTrue(
      'TextRange partially contains other TextRange',
      range2.containsRange(range, true));
  assertFalse(
      'TextRange does not fully contain other TextRange',
      range2.containsRange(range, false));
}

function testContainsControlRange() {
  if (goog.userAgent.IE) {
    var range = goog.dom.ControlRange.createFromElements(table2);
    var range2 = goog.dom.TextRange.createFromNodeContents(table2div);
    assertFalse(
        'TextRange does not contain ControlRange', range2.containsRange(range));
    range = goog.dom.ControlRange.createFromElements(logo2);
    assertTrue('TextRange contains ControlRange', range2.containsRange(range));
    range = goog.dom.TextRange.createFromNodeContents(table2);
    range2 = goog.dom.ControlRange.createFromElements(logo, logo2);
    assertTrue(
        'TextRange partially contains ControlRange',
        range2.containsRange(range, true));
    assertFalse(
        'TextRange does not fully contain ControlRange',
        range2.containsRange(range, false));
  }
}

function getTest3ElementTopLeft() {
  var topLeft = goog.style.getPageOffset(test3.firstChild);

  if (goog.userAgent.EDGE_OR_IE) {
    // On IE the selection is as tall as its tallest element.
    var logoPosition = goog.style.getPageOffset(logo3);
    topLeft.y = logoPosition.y;

    if (!goog.userAgent.isVersionOrHigher('8')) {
      topLeft.x += 2;
      topLeft.y += 2;
    }
  }
  return topLeft;
}

function testGetStartPosition() {
  expectedFailures.expectFailureFor(
      goog.userAgent.GECKO && !goog.userAgent.isVersionOrHigher('2'));

  // The start node is in the top left.
  var range = goog.dom.TextRange.createFromNodeContents(test3);

  try {
    var result = assertNotThrows(goog.bind(range.getStartPosition, range));
    assertObjectRoughlyEquals(getTest3ElementTopLeft(), result, 1);
  } catch (e) {
    expectedFailures.handleException(e);
  }
}

function testGetStartPositionNotInDocument() {
  expectedFailures.expectFailureFor(
      goog.userAgent.GECKO && !goog.userAgent.isVersionOrHigher('2'));
  expectedFailures.expectFailureFor(
      goog.userAgent.IE && !goog.userAgent.isVersionOrHigher('8'));

  var range = goog.dom.TextRange.createFromNodeContents(test3);

  goog.dom.removeNode(test3);
  try {
    var result = assertNotThrows(goog.bind(range.getStartPosition, range));
    assertNull(result);
  } catch (e) {
    expectedFailures.handleException(e);
  } finally {
    goog.dom.appendChild(document.body, test3);
  }
}

function testGetStartPositionReversed() {
  expectedFailures.expectFailureFor(
      goog.userAgent.GECKO && !goog.userAgent.isVersionOrHigher('2'));

  // Simulate the user selecting backwards from right-to-left.
  // The start node is now in the bottom right.
  var firstNode = test3.firstChild.firstChild;
  var lastNode = test3.lastChild.lastChild;
  var range = goog.dom.TextRange.createFromNodes(
      lastNode, lastNode.nodeValue.length, firstNode, 0);

  try {
    var result = assertNotThrows(goog.bind(range.getStartPosition, range));
    assertObjectRoughlyEquals(getTest3ElementTopLeft(), result, 1);
  } catch (e) {
    expectedFailures.handleException(e);
  }
}

function testGetStartPositionRightToLeft() {
  if (goog.userAgent.product.SAFARI) {
    // TODO(b/20733468): Disabled so we can get the rest of the Closure test
    // suite running in a continuous build. Will investigate later.
    return;
  }

  expectedFailures.expectFailureFor(
      goog.userAgent.GECKO && !goog.userAgent.isVersionOrHigher('2'));

  // Even in RTL content the start node is still in the top left.
  var range = goog.dom.TextRange.createFromNodeContents(test3Rtl);
  var topLeft = goog.style.getPageOffset(test3Rtl.firstChild);

  if (goog.userAgent.EDGE_OR_IE) {
    // On IE the selection is as tall as its tallest element.
    var logoPosition = goog.style.getPageOffset(logo3Rtl);
    topLeft.y = logoPosition.y;

    if (!goog.userAgent.isVersionOrHigher('8')) {
      topLeft.x += 2;
      topLeft.y += 2;
    }
  }

  try {
    var result = assertNotThrows(goog.bind(range.getStartPosition, range));
    assertObjectRoughlyEquals(topLeft, result, 0.1);
  } catch (e) {
    expectedFailures.handleException(e);
  }
}

function getTest3ElementBottomRight() {
  var pageOffset = goog.style.getPageOffset(test3.lastChild);
  var bottomRight = new goog.math.Coordinate(
      pageOffset.x + test3.lastChild.offsetWidth,
      pageOffset.y + test3.lastChild.offsetHeight);

  if (goog.userAgent.IE && !goog.userAgent.isVersionOrHigher('8')) {
    bottomRight.x += 6;
    bottomRight.y += 2;
  }
  return bottomRight;
}

function testGetEndPosition() {
  expectedFailures.expectFailureFor(
      goog.userAgent.GECKO && !goog.userAgent.isVersionOrHigher('2'));

  // The end node is in the bottom right.
  var range = goog.dom.TextRange.createFromNodeContents(test3);
  var expected = getTest3ElementBottomRight();

  try {
    var result = assertNotThrows(goog.bind(range.getEndPosition, range));
    assertObjectRoughlyEquals(expected, result, 1);
  } catch (e) {
    expectedFailures.handleException(e);
  }
}

function testGetEndPositionNotInDocument() {
  expectedFailures.expectFailureFor(
      goog.userAgent.GECKO && !goog.userAgent.isVersionOrHigher('2'));
  expectedFailures.expectFailureFor(
      goog.userAgent.IE && !goog.userAgent.isVersionOrHigher('8'));

  var range = goog.dom.TextRange.createFromNodeContents(test3);

  goog.dom.removeNode(test3);
  try {
    var result = assertNotThrows(goog.bind(range.getEndPosition, range));
    assertNull(result);
  } catch (e) {
    expectedFailures.handleException(e);
  } finally {
    goog.dom.appendChild(document.body, test3);
  }
}

function testGetEndPositionReversed() {
  expectedFailures.expectFailureFor(
      goog.userAgent.GECKO && !goog.userAgent.isVersionOrHigher('2'));

  // Simulate the user selecting backwards from right-to-left.
  // The end node is still in the lower right.
  var range = goog.dom.TextRange.createFromNodeContents(test3, true);
  var expected = getTest3ElementBottomRight();

  try {
    var result = assertNotThrows(goog.bind(range.getEndPosition, range));

    // For some reason, ie7 is further off than other browsers.
    var estimate =
        (goog.userAgent.IE && !goog.userAgent.isVersionOrHigher('8')) ? 4 : 1;
    assertObjectRoughlyEquals(expected, result, estimate);
  } catch (e) {
    expectedFailures.handleException(e);
  }
}

function testGetEndPositionRightToLeft() {
  expectedFailures.expectFailureFor(
      goog.userAgent.GECKO && !goog.userAgent.isVersionOrHigher('2'));
  expectedFailures.expectFailureFor(
      goog.userAgent.IE && !goog.userAgent.isVersionOrHigher('8'));

  // Even in RTL content the end node is still in the bottom right.
  var range = goog.dom.TextRange.createFromNodeContents(test3Rtl);
  var pageOffset = goog.style.getPageOffset(test3Rtl.lastChild);
  var bottomRight = new goog.math.Coordinate(
      pageOffset.x + test3Rtl.lastChild.offsetWidth,
      pageOffset.y + test3Rtl.lastChild.offsetHeight);

  if (goog.userAgent.IE && !goog.userAgent.isVersionOrHigher('8')) {
    bottomRight.x += 2;
    bottomRight.y += 2;
  }

  try {
    var result = assertNotThrows(goog.bind(range.getEndPosition, range));
    assertObjectRoughlyEquals(bottomRight, result, 1);
  } catch (e) {
    expectedFailures.handleException(e);
  }
}

function testCloneRangeDeep() {
  var range = goog.dom.TextRange.createFromNodeContents(logo);
  assertFalse(range.isCollapsed());

  var cloned = range.clone();
  cloned.collapse();
  assertTrue(cloned.isCollapsed());
  assertFalse(range.isCollapsed());
}
