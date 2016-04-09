// Copyright 2014 The Closure Library Authors. All Rights Reserved.
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

goog.provide('goog.style.style_document_scroll_test');
goog.setTestOnly('goog.style.style_document_scroll_test');

goog.require('goog.dom');
goog.require('goog.style');
goog.require('goog.testing.jsunit');


var EPSILON = 2;
var documentScroll;

function setUp() {
  documentScroll = goog.dom.getDocumentScrollElement();
  documentScroll.scrollTop = 100;
  documentScroll.scrollLeft = 100;
}


function tearDown() {
  documentScroll.style.border = '';
  documentScroll.style.padding = '';
  documentScroll.style.margin = '';
  documentScroll.scrollTop = 0;
  documentScroll.scrollLeft = 0;
}


function testDocumentScrollWithZeroedBodyProperties() {
  assertRoughlyEquals(
      200,
      goog.style.getContainerOffsetToScrollInto(goog.dom.getElement('testEl1'))
          .y,
      EPSILON);
  assertRoughlyEquals(
      300,
      goog.style.getContainerOffsetToScrollInto(goog.dom.getElement('testEl2'))
          .x,
      EPSILON);
}


function testDocumentScrollWithMargin() {
  documentScroll.style.margin = '20px 0 0 30px';
  assertRoughlyEquals(
      220,
      goog.style.getContainerOffsetToScrollInto(goog.dom.getElement('testEl1'))
          .y,
      EPSILON);
  assertRoughlyEquals(
      330,
      goog.style.getContainerOffsetToScrollInto(goog.dom.getElement('testEl2'))
          .x,
      EPSILON);
}


function testDocumentScrollWithPadding() {
  documentScroll.style.padding = '20px 0 0 30px';
  assertRoughlyEquals(
      220,
      goog.style.getContainerOffsetToScrollInto(goog.dom.getElement('testEl1'))
          .y,
      EPSILON);
  assertRoughlyEquals(
      330,
      goog.style.getContainerOffsetToScrollInto(goog.dom.getElement('testEl2'))
          .x,
      EPSILON);
}


function testDocumentScrollWithBorder() {
  documentScroll.style.border = '20px solid green';
  assertRoughlyEquals(
      220,
      goog.style.getContainerOffsetToScrollInto(goog.dom.getElement('testEl1'))
          .y,
      EPSILON);
  assertRoughlyEquals(
      320,
      goog.style.getContainerOffsetToScrollInto(goog.dom.getElement('testEl2'))
          .x,
      EPSILON);
}


function testDocumentScrollWithAllProperties() {
  documentScroll.style.margin = '20px 0 0 30px';
  documentScroll.style.padding = '40px 0 0 50px';
  documentScroll.style.border = '10px solid green';
  assertRoughlyEquals(
      270,
      goog.style.getContainerOffsetToScrollInto(goog.dom.getElement('testEl1'))
          .y,
      EPSILON);
  assertRoughlyEquals(
      390,
      goog.style.getContainerOffsetToScrollInto(goog.dom.getElement('testEl2'))
          .x,
      EPSILON);
}


function testDocumentScrollNoOpIfElementAlreadyInView() {
  // Scroll once to make testEl3 visible.
  documentScroll.scrollTop =
      goog.style.getContainerOffsetToScrollInto(goog.dom.getElement('testEl3'))
          .y;

  // Scroll a bit more so that now the element is approximately at the middle.
  var viewportHeight = documentScroll.clientHeight;
  documentScroll.scrollTop += viewportHeight / 2;

  // Since the element is fully within viewport, additional calls to
  // getContainerOffsetToScrollInto should be a no-op.
  assertEquals(
      documentScroll.scrollTop,
      goog.style.getContainerOffsetToScrollInto(goog.dom.getElement('testEl3'))
          .y);
}


function testScrollIntoContainerView() {
  goog.style.scrollIntoContainerView(goog.dom.getElement('testEl1'));
  assertRoughlyEquals(200, documentScroll.scrollTop, EPSILON);
  goog.style.scrollIntoContainerView(goog.dom.getElement('testEl2'));
  assertRoughlyEquals(300, documentScroll.scrollLeft, EPSILON);
}
