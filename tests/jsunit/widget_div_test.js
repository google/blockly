/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
'use strict';


function widgetdiv_testHelper_makeBBox(left, top, width, height) {
  return {
    left: left,
    right: left + width,
    top: top,
    bottom: top + height
  };
}

function widgetdiv_testHelper_makeSize(width, height) {
  return {
    width: width,
    height: height
  };
}

var widgetDiv_test_viewport = widgetdiv_testHelper_makeBBox(0, 0, 1000, 1000);
var widgetDiv_test_widgetSize = widgetdiv_testHelper_makeSize(100, 100);

// Anchor is always 90 px wide and 90 px tall for this test.
var widgetDiv_test_anchorSize = 90;

function widgetdiv_testHelper_makeAnchor(left, top) {
  return {
    left: left,
    right: left + widgetDiv_test_anchorSize,
    top: top,
    bottom: top + widgetDiv_test_anchorSize
  };
}

function test_widgetDiv_topConflict() {
  var anchorTop = 50;
  // Anchor placed close to the top.
  var anchorBBox = widgetdiv_testHelper_makeAnchor(500, anchorTop);

  // The widget div should be placed just below the anchor.
  var calculated = Blockly.WidgetDiv.calculateY_(widgetDiv_test_viewport,
      anchorBBox, widgetDiv_test_widgetSize);
  assertEquals(anchorTop + widgetDiv_test_anchorSize, calculated);
}

function test_widgetDiv_bottomConflict() {
  var anchorTop = 900;
  // Anchor placed close to the bottom.
  var anchorBBox = widgetdiv_testHelper_makeAnchor(500, anchorTop);

  // The widget div should be placed just above the anchor.
  var calculated = Blockly.WidgetDiv.calculateY_(widgetDiv_test_viewport,
      anchorBBox, widgetDiv_test_widgetSize);
  assertEquals(anchorTop - widgetDiv_test_widgetSize.height, calculated);
}

function test_widgetDiv_noYConflict() {
  var anchorTop = 500;
  // Anchor placed in the middle.
  var anchorBBox = widgetdiv_testHelper_makeAnchor(500, anchorTop);

  // The widget div should be placed just below the anchor.
  var calculated = Blockly.WidgetDiv.calculateY_(widgetDiv_test_viewport,
      anchorBBox, widgetDiv_test_widgetSize);
  assertEquals(anchorTop + widgetDiv_test_anchorSize, calculated);
}


function test_widgetDiv_leftConflict_LTR() {
  var anchorLeft = 50;
  // Anchor placed close to the left side.
  var anchorBBox = widgetdiv_testHelper_makeAnchor(anchorLeft, 500);

  // The widget div should be placed at the anchor.
  var calculated = Blockly.WidgetDiv.calculateX_(widgetDiv_test_viewport,
      anchorBBox, widgetDiv_test_widgetSize, false /* rtl */);
  assertEquals(anchorLeft, calculated);
}

function test_widgetDiv_rightConflict_LTR() {
  var anchorLeft = 950;
  // Anchor placed close to the right side.
  var anchorBBox = widgetdiv_testHelper_makeAnchor(anchorLeft, 500);

  // The widget div should be placed as far right as possible--at the edge of
  // the screen.
  var calculated = Blockly.WidgetDiv.calculateX_(widgetDiv_test_viewport,
      anchorBBox, widgetDiv_test_widgetSize, false /* rtl */);
  assertEquals(1000 - widgetDiv_test_widgetSize.width, calculated);
}

function test_widgetDiv_noXConflict_LTR() {
  var anchorLeft = 500;
  // Anchor in the middle
  var anchorBBox = widgetdiv_testHelper_makeAnchor(anchorLeft, 500);
  // The widget div should be placed just at the left side of the anchor.
  var calculated = Blockly.WidgetDiv.calculateX_(widgetDiv_test_viewport,
      anchorBBox, widgetDiv_test_widgetSize, false /* rtl */);
  assertEquals(anchorLeft, calculated);
}

function test_widgetDiv_leftConflict_RTL() {
  var anchorLeft = 10;
  // Anchor placed close to the left side.
  var anchorBBox = widgetdiv_testHelper_makeAnchor(anchorLeft, 500);
  // The widget div should be placed as far left as possible--at the edge of
  // the screen.
  var calculated = Blockly.WidgetDiv.calculateX_(widgetDiv_test_viewport,
      anchorBBox, widgetDiv_test_widgetSize, true /* rtl */);
  assertEquals(0, calculated);
}

function test_widgetDiv_rightConflict_RTL() {
  var anchorLeft = 950;
  // Anchor placed close to the right side.
  var anchorBBox = widgetdiv_testHelper_makeAnchor(anchorLeft, 500);

  // The widget div should be placed as far right as possible--at the edge of
  // the screen.
  var calculated = Blockly.WidgetDiv.calculateX_(widgetDiv_test_viewport,
      anchorBBox, widgetDiv_test_widgetSize, true /* rtl */);
  assertEquals(1000 - widgetDiv_test_widgetSize.width, calculated);
}

function test_widgetDiv_noXConflict_RTL() {
  var anchorLeft = 500;
  // anchor placed in the middle
  var anchorBBox = widgetdiv_testHelper_makeAnchor(anchorLeft, 500);
  // The widget div should be placed at the right side of the anchor.
  var calculated = Blockly.WidgetDiv.calculateX_(widgetDiv_test_viewport,
      anchorBBox, widgetDiv_test_widgetSize, true /* rtl */);
  assertEquals(anchorBBox.right - widgetDiv_test_widgetSize.width, calculated);
}
