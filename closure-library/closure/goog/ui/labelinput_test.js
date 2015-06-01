// Copyright 2011 The Closure Library Authors. All Rights Reserved.
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

goog.provide('goog.ui.LabelInputTest');
goog.setTestOnly('goog.ui.LabelInputTest');

goog.require('goog.a11y.aria');
goog.require('goog.a11y.aria.State');
goog.require('goog.dom');
goog.require('goog.dom.classlist');
goog.require('goog.events.EventType');
goog.require('goog.testing.MockClock');
goog.require('goog.testing.events');
goog.require('goog.testing.events.Event');
goog.require('goog.testing.jsunit');
goog.require('goog.ui.LabelInput');
goog.require('goog.userAgent');

var labelInput;
var mockClock;

function setUp() {
  mockClock = new goog.testing.MockClock(true);
}

function tearDown() {
  mockClock.dispose();
  labelInput.dispose();
}

function testGetLabel() {
  labelInput = new goog.ui.LabelInput();
  assertEquals('no label', '', labelInput.getLabel());

  labelInput = new goog.ui.LabelInput('search');
  assertEquals('label is given in the ctor', 'search', labelInput.getLabel());
}

function testSetLabel() {
  labelInput = new goog.ui.LabelInput();
  labelInput.setLabel('search');
  assertEquals('label is set', 'search', labelInput.getLabel());

  labelInput.createDom();
  labelInput.enterDocument();
  mockClock.tick(10);
  assertNotNull(labelInput.getElement());
  assertLabelValue(labelInput, 'search');

  labelInput.setLabel('new label');
  assertLabelValue(labelInput, 'new label');
}

function assertLabelValue(labelInput, expectedLabel) {
  assertEquals(
      'label should have aria-label attribute \'' + expectedLabel + '\'',
      expectedLabel, goog.a11y.aria.getState(labelInput.getElement(),
          goog.a11y.aria.State.LABEL));
  // When browsers support the placeholder attribute, we use that instead of
  // the value property - and this test will fail.
  if (!isPlaceholderSupported()) {
    assertEquals(
        'label is updated', expectedLabel, labelInput.getElement().value);
  } else {
    assertEquals('value is empty', '', labelInput.getElement().value);
  }
}

function testPlaceholderAttribute() {
  labelInput = new goog.ui.LabelInput();
  labelInput.setLabel('search');

  // Some browsers don't support the placeholder attribute, in which case we
  // this test will fail.
  if (! isPlaceholderSupported()) {
    return;
  }

  labelInput.createDom();
  labelInput.enterDocument();
  mockClock.tick(10);
  assertEquals('label should have placeholder attribute \'search\'', 'search',
      labelInput.getElement().placeholder);

  labelInput.setLabel('new label');
  assertEquals('label should have aria-label attribute \'new label\'',
      'new label', labelInput.getElement().placeholder);
}

function testDecorateElementWithExistingPlaceholderAttribute() {
  labelInput = new goog.ui.LabelInput();
  labelInput.setLabel('search');

  labelInput.decorate(goog.dom.getElement('p'));
  labelInput.enterDocument();
  mockClock.tick(10);

  // The presence of an existing placeholder doesn't necessarily mean the
  // browser supports placeholders. Make sure labels are used for browsers
  // without placeholder support:
  if (isPlaceholderSupported()) {
    assertEquals('label should have placeholder attribute \'search\'', 'search',
        labelInput.getElement().placeholder);
  } else {
    assertNotNull(labelInput.getElement());
    assertEquals('label is rendered', 'search', labelInput.getElement().value);
    assertEquals('label should have aria-label attribute \'search\'', 'search',
        goog.a11y.aria.getState(labelInput.getElement(),
            goog.a11y.aria.State.LABEL));
  }
}

function testDecorateElementWithFocus() {
  labelInput = new goog.ui.LabelInput();
  labelInput.setLabel('search');

  var decoratedElement = goog.dom.getElement('i');

  decoratedElement.value = '';
  decoratedElement.focus();

  labelInput.decorate(decoratedElement);
  labelInput.enterDocument();
  mockClock.tick(10);

  assertEquals('label for pre-focused input should not have LABEL_CLASS_NAME',
      -1,
      labelInput.getElement().className.indexOf(labelInput.labelCssClassName));

  if (!isPlaceholderSupported()) {
    assertEquals('label rendered for pre-focused element',
        '', labelInput.getElement().value);
    // NOTE(user): element.blur() doesn't seem to trigger the BLUR event in
    // IE in the test environment. This could be related to the IE issues with
    // testClassName() below.
    goog.testing.events.fireBrowserEvent(
        new goog.testing.events.Event(
            goog.events.EventType.BLUR, decoratedElement));
    mockClock.tick(10);
    assertEquals('label not rendered for blurred element',
        'search', labelInput.getElement().value);
  }
}

function testDecorateElementWithFocusDelay() {
  if (isPlaceholderSupported()) {
    return; // Delay only affects the older browsers.
  }
  var placeholder = 'search';

  labelInput = new goog.ui.LabelInput();
  labelInput.setLabel(placeholder);
  var delay = 150;
  labelInput.labelRestoreDelayMs = delay;

  var decoratedElement = goog.dom.getElement('i');

  decoratedElement.value = '';
  decoratedElement.focus();

  labelInput.decorate(decoratedElement);
  labelInput.enterDocument();
  // wait for all initial setup to settle
  mockClock.tick(delay);

  // NOTE(user): element.blur() doesn't seem to trigger the BLUR event in
  // IE in the test environment. This could be related to the IE issues with
  // testClassName() below.
  goog.testing.events.fireBrowserEvent(
      new goog.testing.events.Event(
          goog.events.EventType.BLUR, decoratedElement));

  mockClock.tick(delay - 1);
  assertEquals('label should not be restored before labelRestoreDelay',
      '', labelInput.getElement().value);

  mockClock.tick(1);
  assertEquals('label not rendered for blurred element with labelRestoreDelay',
      placeholder, labelInput.getElement().value);
}

function testClassName() {
  labelInput = new goog.ui.LabelInput();

  // IE always fails this test, suspect it is a focus issue.
  if (goog.userAgent.IE) {
    return;
  }
  // FF does not perform focus if the window is not active in the first place.
  if (goog.userAgent.GECKO && document.hasFocus && !document.hasFocus()) {
    return;
  }

  labelInput.decorate(goog.dom.getElement('i'));
  labelInput.setLabel('search');

  var el = labelInput.getElement();
  assertTrue('label before focus should have LABEL_CLASS_NAME',
      goog.dom.classlist.contains(el, labelInput.labelCssClassName));

  labelInput.getElement().focus();

  assertFalse('label after focus should not have LABEL_CLASS_NAME',
      goog.dom.classlist.contains(el, labelInput.labelCssClassName));

  labelInput.getElement().blur();

  assertTrue('label after blur should have LABEL_CLASS_NAME',
      goog.dom.classlist.contains(el, labelInput.labelCssClassName));
}

function isPlaceholderSupported() {
  if (goog.dom.getElement('i').placeholder != null) {
    return true;
  }
}

function testEnable() {
  labelInput = new goog.ui.LabelInput();
  labelInput.createDom();
  labelInput.enterDocument();

  var labelElement = labelInput.getElement();
  var disabledClass = goog.getCssName(labelInput.labelCssClassName, 'disabled');

  assertTrue('label should be enabled', labelInput.isEnabled());
  assertFalse('label should not have the disabled class',
      goog.dom.classlist.contains(labelElement, disabledClass));

  labelInput.setEnabled(false);
  assertFalse('label should be disabled', labelInput.isEnabled());
  assertTrue('label should have the disabled class',
      goog.dom.classlist.contains(labelElement, disabledClass));

  labelInput.setEnabled(true);
  assertTrue('label should be enabled', labelInput.isEnabled());
  assertFalse('label should not have the disabled class',
      goog.dom.classlist.contains(labelElement, disabledClass));
}
