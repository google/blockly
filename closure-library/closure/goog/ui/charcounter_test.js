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

goog.provide('goog.ui.CharCounterTest');
goog.setTestOnly('goog.ui.CharCounterTest');

goog.require('goog.dom');
goog.require('goog.testing.asserts');
goog.require('goog.testing.jsunit');
goog.require('goog.ui.CharCounter');
goog.require('goog.userAgent');

var countElement, charCounter, inputElement;
var incremental = goog.ui.CharCounter.Display.INCREMENTAL;
var remaining = goog.ui.CharCounter.Display.REMAINING;
var maxLength = 25;

function setUp() {
  inputElement = goog.dom.getElement('test-textarea-id');
  inputElement.value = '';
  countElement = goog.dom.getElementByClass('char-count');
  goog.dom.setTextContent(countElement, '');
  charCounter = new goog.ui.CharCounter(inputElement, countElement, maxLength);
}

function tearDown() {
  charCounter.dispose();
}

function setupCheckLength(content, mode) {
  inputElement.value = content;
  charCounter.setDisplayMode(mode);
  charCounter.checkLength();
}

function testConstructor() {
  assertNotNull('Character counter can not be null', charCounter);
  assertEquals(maxLength.toString(), goog.dom.getTextContent(countElement));
}

function testSetMaxLength() {
  charCounter.setMaxLength(10);
  assertEquals('10', goog.dom.getTextContent(countElement));

  var tooLongContent = 'This is too long text content';
  inputElement.value = tooLongContent;
  charCounter.setMaxLength(10);
  assertEquals('0', goog.dom.getTextContent(countElement));
  assertEquals('This is to', inputElement.value);
}

function testGetMaxLength() {
  assertEquals(maxLength, charCounter.getMaxLength());
}

function testSetDisplayMode() {
  // Test counter to be in incremental mode
  charCounter.setDisplayMode(incremental);
  assertEquals('0', goog.dom.getTextContent(countElement));

  // Test counter to be in remaining mode
  charCounter.setDisplayMode(remaining);
  assertEquals(maxLength.toString(), goog.dom.getTextContent(countElement));
}

function testGetDisplayMode() {
  assertEquals(remaining, charCounter.getDisplayMode());

  var incrementalCharCounter = new goog.ui.CharCounter(
      inputElement, countElement, maxLength, incremental);
  assertEquals(incremental, incrementalCharCounter.getDisplayMode());
}

function testCheckLength() {
  // Test the characters remaining in DOM
  setupCheckLength('', remaining);
  assertEquals(maxLength.toString(), goog.dom.getTextContent(countElement));

  // Test the characters incremental in DOM
  setupCheckLength('', incremental);
  assertEquals('0', goog.dom.getTextContent(countElement));
}

function testCheckLength_limitedContent() {
  var limitedContent = 'Limited text content';
  var limitedContentLength = limitedContent.length;
  var remainingLimitedContentLength = maxLength - limitedContentLength;

  // Set some content and test the characters remaining in DOM
  setupCheckLength(limitedContent, remaining);

  assertEquals(limitedContent, inputElement.value);
  assertEquals(
      remainingLimitedContentLength.toString(),
      goog.dom.getTextContent(countElement));

  // Test the characters incremented in DOM with limited content
  charCounter.setDisplayMode(incremental);
  charCounter.checkLength();

  assertEquals(limitedContent, inputElement.value);
  assertEquals(
      limitedContentLength.toString(), goog.dom.getTextContent(countElement));
}

function testCheckLength_overflowContent() {
  var tooLongContent = 'This is too long text content';
  var truncatedContent = 'This is too long text con';

  // Set content longer than the maxLength and test the characters remaining
  // in DOM with overflowing content
  setupCheckLength(tooLongContent, remaining);

  assertEquals(truncatedContent, inputElement.value);
  assertEquals('0', goog.dom.getTextContent(countElement));

  // Set content longer than the maxLength and test the characters
  // incremented in DOM with overflowing content
  setupCheckLength(tooLongContent, incremental);

  assertEquals(truncatedContent, inputElement.value);
  assertEquals(maxLength.toString(), goog.dom.getTextContent(countElement));
}

function testCheckLength_newLineContent() {
  var newLineContent = 'New\nline';
  var newLineContentLength = newLineContent.length;
  var remainingNewLineContentLength = maxLength - newLineContentLength;

  var carriageReturnContent = 'New\r\nline';
  var carriageReturnContentLength = carriageReturnContent.length;
  var remainingCarriageReturnContentLength =
      maxLength - carriageReturnContentLength;

  // Set some content with new line characters and test the characters
  // remaining in DOM
  setupCheckLength(newLineContent, remaining);

  // Test for IE 7,8 which appends \r to \n
  if (goog.userAgent.IE && !goog.userAgent.isVersionOrHigher('9.0')) {
    assertEquals(carriageReturnContent, inputElement.value);
    assertEquals(
        remainingCarriageReturnContentLength.toString(),
        goog.dom.getTextContent(countElement));
  } else {
    assertEquals(newLineContent, inputElement.value);
    assertEquals(
        remainingNewLineContentLength.toString(),
        goog.dom.getTextContent(countElement));
  }

  // Set some content with new line characters and test the characters
  // incremental in DOM
  setupCheckLength(newLineContent, incremental);

  // Test for IE 7,8 which appends \r to \n
  if (goog.userAgent.IE && !goog.userAgent.isVersionOrHigher('9.0')) {
    assertEquals(carriageReturnContent, inputElement.value);
    assertEquals(
        carriageReturnContentLength.toString(),
        goog.dom.getTextContent(countElement));
  } else {
    assertEquals(newLineContent, inputElement.value);
    assertEquals(
        newLineContentLength.toString(), goog.dom.getTextContent(countElement));
  }
}

function testCheckLength_carriageReturnContent() {
  var newLineContent = 'New\nline';
  var newLineContentLength = newLineContent.length;
  var remainingNewLineContentLength = maxLength - newLineContentLength;

  var carriageReturnContent = 'New\r\nline';
  var carriageReturnContentLength = carriageReturnContent.length;
  var remainingCarriageReturnContentLength =
      maxLength - carriageReturnContentLength;

  // Set some content with carriage return characters and test the
  // characters remaining in DOM
  setupCheckLength(carriageReturnContent, remaining);

  // Test for IE 7,8
  if (goog.userAgent.IE && !goog.userAgent.isVersionOrHigher('9.0')) {
    assertEquals(carriageReturnContent, inputElement.value);
    assertEquals(
        remainingCarriageReturnContentLength.toString(),
        goog.dom.getTextContent(countElement));
  } else {
    // Others replace \r\n with \n
    assertEquals(newLineContent, inputElement.value);
    assertEquals(
        remainingNewLineContentLength.toString(),
        goog.dom.getTextContent(countElement));
  }

  // Set some content with carriage return characters and test the
  // characters incremental in DOM
  setupCheckLength(carriageReturnContent, incremental);

  // Test for IE 7,8
  if (goog.userAgent.IE && !goog.userAgent.isVersionOrHigher('9.0')) {
    assertEquals(carriageReturnContent, inputElement.value);
    assertEquals(
        carriageReturnContentLength.toString(),
        goog.dom.getTextContent(countElement));
  } else {
    // Others replace \r\n with \n
    assertEquals(newLineContent, inputElement.value);
    assertEquals(
        newLineContentLength.toString(), goog.dom.getTextContent(countElement));
  }
}
