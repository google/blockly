// Copyright 2010 The Closure Library Authors. All Rights Reserved.
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

goog.provide('goog.ui.PromptTest');
goog.setTestOnly('goog.ui.PromptTest');

goog.require('goog.dom.selection');
goog.require('goog.events.InputHandler');
goog.require('goog.events.KeyCodes');
goog.require('goog.functions');
goog.require('goog.string');
goog.require('goog.testing.events');
goog.require('goog.testing.jsunit');
goog.require('goog.ui.BidiInput');
goog.require('goog.ui.Dialog');
goog.require('goog.ui.Prompt');
goog.require('goog.userAgent');
goog.require('goog.userAgent.product');

var prompt;

function setUp() {
  document.body.focus();
}

function tearDown() {
  goog.dispose(prompt);
}

function testFocusOnInputElement() {
  // FF does not perform focus if the window is not active in the first place.
  if (goog.userAgent.GECKO && document.hasFocus && !document.hasFocus()) {
    return;
  }

  var promptResult = undefined;
  prompt = new goog.ui.Prompt('title', 'Prompt:', function(result) {
    promptResult = result;
  }, 'defaultValue');
  prompt.setVisible(true);

  if (goog.userAgent.product.CHROME) {
    // For some reason, this test fails non-deterministically on Chrome,
    // but only on the test farm.
    return;
  }
  assertEquals('defaultValue', goog.dom.selection.getText(prompt.userInputEl_));
}


function testValidationFunction() {
  var promptResult = undefined;
  prompt = new goog.ui.Prompt(
      'title', 'Prompt:', function(result) { promptResult = result; }, '');
  prompt.setValidationFunction(
      goog.functions.not(goog.string.isEmptyOrWhitespace));
  prompt.setVisible(true);

  var buttonSet = prompt.getButtonSet();
  var okButton = buttonSet.getButton(goog.ui.Dialog.DefaultButtonKeys.OK);
  assertTrue(okButton.disabled);

  prompt.userInputEl_.value = '';
  goog.testing.events.fireKeySequence(
      prompt.userInputEl_, goog.events.KeyCodes.SPACE);
  assertTrue(okButton.disabled);
  prompt.userInputEl_.value = 'foo';
  goog.testing.events.fireKeySequence(
      prompt.userInputEl_, goog.events.KeyCodes.X);
  assertFalse(okButton.disabled);
}

function testBidiInput() {
  var shalomInHebrew = '\u05e9\u05dc\u05d5\u05dd';
  var promptResult = undefined;
  prompt = new goog.ui.Prompt('title', 'Prompt:', goog.functions.NULL, '');
  var bidiInput = new goog.ui.BidiInput();
  prompt.setInputDecoratorFn(goog.bind(bidiInput.decorate, bidiInput));
  prompt.setVisible(true);

  prompt.userInputEl_.value = shalomInHebrew;
  goog.testing.events.fireKeySequence(
      prompt.userInputEl_, goog.events.KeyCodes.SPACE);
  goog.testing.events.fireBrowserEvent(
      {'target': prompt.userInputEl_, 'type': 'input'});
  bidiInput.inputHandler_.dispatchEvent(
      goog.events.InputHandler.EventType.INPUT);
  assertEquals('rtl', prompt.userInputEl_.dir);

  prompt.userInputEl_.value = 'shalomInEnglish';
  goog.testing.events.fireKeySequence(
      prompt.userInputEl_, goog.events.KeyCodes.SPACE);
  goog.testing.events.fireBrowserEvent(
      {'target': prompt.userInputEl_, 'type': 'input'});
  bidiInput.inputHandler_.dispatchEvent(
      goog.events.InputHandler.EventType.INPUT);
  assertEquals('ltr', prompt.userInputEl_.dir);
  goog.dispose(bidiInput);
}

function testBidiInput_off() {
  var shalomInHebrew = '\u05e9\u05dc\u05d5\u05dd';
  var promptResult = undefined;
  prompt = new goog.ui.Prompt('title', 'Prompt:', goog.functions.NULL, '');
  prompt.setVisible(true);

  prompt.userInputEl_.value = shalomInHebrew;
  goog.testing.events.fireKeySequence(
      prompt.userInputEl_, goog.events.KeyCodes.SPACE);
  goog.testing.events.fireBrowserEvent(
      {'target': prompt.userInputEl_, 'type': 'input'});
  assertEquals('', prompt.userInputEl_.dir);

  prompt.userInputEl_.value = 'shalomInEnglish';
  goog.testing.events.fireKeySequence(
      prompt.userInputEl_, goog.events.KeyCodes.SPACE);
  assertEquals('', prompt.userInputEl_.dir);
}

// An interactive test so we can manually see what it looks like.
function newPrompt() {
  prompt = new goog.ui.Prompt('title', 'Prompt:', function(result) {
    alert('Result: ' + result);
    goog.dispose(prompt);
  }, 'defaultValue');
  prompt.setVisible(true);
}
