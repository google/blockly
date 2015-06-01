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
var body;
var html;

function setUp() {
  body = document.body;
  setUpElement(body);
  html = document.documentElement;
  setUpElement(html);
}


function setUpElement(element) {
  element.scrollTop = 100;
  element.scrollLeft = 100;
}


function tearDown() {
  tearDownElement(body);
  tearDownElement(html);
}


function tearDownElement(element) {
  element.style.border = '';
  element.style.padding = '';
  element.style.margin = '';
  element.scrollTop = 0;
  element.scrollLeft = 0;
}



function testDocumentScrollWithZeroedBodyProperties() {
  assertRoughlyEquals(200,
      goog.style.getContainerOffsetToScrollInto(
          goog.dom.getElement('testEl1'), body).y,
      EPSILON);
  assertRoughlyEquals(300,
      goog.style.getContainerOffsetToScrollInto(
          goog.dom.getElement('testEl2'), body).x,
      EPSILON);
}


function testHtmlScrollWithZeroedBodyProperties() {
  assertRoughlyEquals(200,
      goog.style.getContainerOffsetToScrollInto(
          goog.dom.getElement('testEl1'), html).y,
      EPSILON);
  assertRoughlyEquals(300,
      goog.style.getContainerOffsetToScrollInto(
          goog.dom.getElement('testEl2'), html).x,
      EPSILON);
}


function testDocumentScrollWithMargin() {
  body.style.margin = '20px 0 0 30px';
  assertRoughlyEquals(220,
      goog.style.getContainerOffsetToScrollInto(
          goog.dom.getElement('testEl1'), body).y,
      EPSILON);
  assertRoughlyEquals(330,
      goog.style.getContainerOffsetToScrollInto(
          goog.dom.getElement('testEl2'), body).x,
      EPSILON);
}


function testHtmlScrollWithMargin() {
  html.style.margin = '20px 0 0 30px';
  assertRoughlyEquals(220,
      goog.style.getContainerOffsetToScrollInto(
          goog.dom.getElement('testEl1'), html).y,
      EPSILON);
  assertRoughlyEquals(330,
      goog.style.getContainerOffsetToScrollInto(
          goog.dom.getElement('testEl2'), html).x,
      EPSILON);
}



function testDocumentScrollWithPadding() {
  body.style.padding = '20px 0 0 30px';
  assertRoughlyEquals(220,
      goog.style.getContainerOffsetToScrollInto(
          goog.dom.getElement('testEl1'), body).y,
      EPSILON);
  assertRoughlyEquals(330,
      goog.style.getContainerOffsetToScrollInto(
          goog.dom.getElement('testEl2'), body).x,
      EPSILON);
}


function testHtmlScrollWithPadding() {
  html.style.padding = '20px 0 0 30px';
  assertRoughlyEquals(220,
      goog.style.getContainerOffsetToScrollInto(
          goog.dom.getElement('testEl1'), html).y,
      EPSILON);
  assertRoughlyEquals(330,
      goog.style.getContainerOffsetToScrollInto(
          goog.dom.getElement('testEl2'), html).x,
      EPSILON);
}


function testDocumentScrollWithBorder() {
  body.style.border = '20px solid green';
  assertRoughlyEquals(220,
      goog.style.getContainerOffsetToScrollInto(
          goog.dom.getElement('testEl1'), body).y,
      EPSILON);
  assertRoughlyEquals(320,
      goog.style.getContainerOffsetToScrollInto(
          goog.dom.getElement('testEl2'), body).x,
      EPSILON);
}


function testHtmlScrollWithBorder() {
  html.style.border = '20px solid green';
  assertRoughlyEquals(220,
      goog.style.getContainerOffsetToScrollInto(
          goog.dom.getElement('testEl1'), html).y,
      EPSILON);
  assertRoughlyEquals(320,
      goog.style.getContainerOffsetToScrollInto(
          goog.dom.getElement('testEl2'), html).x,
      EPSILON);
}


function testDocumentScrollWithAllProperties() {
  body.style.margin = '20px 0 0 30px';
  body.style.padding = '40px 0 0 50px';
  body.style.border = '10px solid green';
  assertRoughlyEquals(270,
      goog.style.getContainerOffsetToScrollInto(
          goog.dom.getElement('testEl1'), body).y,
      EPSILON);
  assertRoughlyEquals(390,
      goog.style.getContainerOffsetToScrollInto(
          goog.dom.getElement('testEl2'), body).x,
      EPSILON);
}


function testHtmlScrollWithAllProperties() {
  html.style.margin = '20px 0 0 30px';
  html.style.padding = '40px 0 0 50px';
  html.style.border = '10px solid green';
  assertRoughlyEquals(270,
      goog.style.getContainerOffsetToScrollInto(
          goog.dom.getElement('testEl1'), html).y,
      EPSILON);
  assertRoughlyEquals(390,
      goog.style.getContainerOffsetToScrollInto(
          goog.dom.getElement('testEl2'), html).x,
      EPSILON);
}

