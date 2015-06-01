// Copyright 2007 The Closure Library Authors. All Rights Reserved.
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

goog.provide('goog.ui.DialogTest');
goog.setTestOnly('goog.ui.DialogTest');

goog.require('goog.a11y.aria');
goog.require('goog.a11y.aria.Role');
goog.require('goog.a11y.aria.State');
goog.require('goog.dom');
goog.require('goog.dom.TagName');
goog.require('goog.dom.classlist');
goog.require('goog.events');
goog.require('goog.events.EventType');
goog.require('goog.events.KeyCodes');
goog.require('goog.fx.css3');
goog.require('goog.html.SafeHtml');
goog.require('goog.html.testing');
goog.require('goog.style');
goog.require('goog.testing.MockClock');
goog.require('goog.testing.PropertyReplacer');
goog.require('goog.testing.events');
goog.require('goog.testing.jsunit');
goog.require('goog.testing.recordFunction');
goog.require('goog.ui.Dialog');
goog.require('goog.userAgent');
var bodyChildElement;
var decorateTarget;
var dialog;
var mockClock;
var stubs = new goog.testing.PropertyReplacer();

function setUp() {
  mockClock = new goog.testing.MockClock(true);
  bodyChildElement = document.createElement(goog.dom.TagName.DIV);
  document.body.appendChild(bodyChildElement);
  dialog = new goog.ui.Dialog();
  var buttons = new goog.ui.Dialog.ButtonSet();
  buttons.set(goog.ui.Dialog.DefaultButtonKeys.CANCEL,
      'Foo!',
      false,
      true);
  buttons.set(goog.ui.Dialog.DefaultButtonKeys.OK,
      'OK',
      true);
  dialog.setButtonSet(buttons);
  dialog.setVisible(true);

  decorateTarget = goog.dom.createDom(goog.dom.TagName.DIV);
  document.body.appendChild(decorateTarget);

  // Reset global flags to their defaults.
  /** @suppress {missingRequire} */
  stubs.set(goog.html.legacyconversions, 'ALLOW_LEGACY_CONVERSIONS', true);
}

function tearDown() {
  dialog.dispose();
  goog.dom.removeNode(bodyChildElement);
  goog.dom.removeNode(decorateTarget);
  mockClock.dispose();
}

function testCrossFrameFocus() {
  // Firefox (3.6, maybe future versions) fails this test when there are too
  // many other test files being run concurrently.
  if (goog.userAgent.IE || goog.userAgent.GECKO) {
    return;
  }
  dialog.setVisible(false);
  var iframeWindow = goog.dom.getElement('f').contentWindow;
  var iframeInput = iframeWindow.document.getElementsByTagName(
      goog.dom.TagName.INPUT)[0];
  dialog.setButtonSet(goog.ui.Dialog.ButtonSet.OK);
  var dialogElement = dialog.getElement();
  var focusCounter = 0;
  goog.events.listen(dialogElement, 'focus', function() {
    focusCounter++;
  });
  iframeInput.focus();
  dialog.setVisible(true);
  dialog.setVisible(false);
  iframeInput.focus();
  dialog.setVisible(true);
  assertEquals(2, focusCounter);
}

function testNoDisabledButtonFocus() {
  dialog.setVisible(false);
  var buttonEl =
      dialog.getButtonSet().getButton(goog.ui.Dialog.DefaultButtonKeys.OK);
  buttonEl.disabled = true;
  var focused = false;
  buttonEl.focus = function() {
    focused = true;
  };
  dialog.setVisible(true);
  assertFalse('Should not have called focus on disabled button', focused);
}

function testNoTitleClose() {
  assertTrue(goog.style.isElementShown(dialog.getTitleCloseElement()));
  dialog.setHasTitleCloseButton(false);
  assertFalse(goog.style.isElementShown(dialog.getTitleCloseElement()));
}


/**
 * Helper that clicks the first button in the dialog and checks if that
 * results in a goog.ui.Dialog.EventType.SELECT being dispatched.
 * @param {boolean} disableButton Whether to disable the button being
 *     tested.
 * @return {boolean} Whether a goog.ui.Dialog.EventType.SELECT was dispatched.
 */
function checkSelectDispatchedOnButtonClick(disableButton) {
  var aButton = dialog.getButtonElement().getElementsByTagName(
      goog.dom.TagName.BUTTON)[0];
  assertNotEquals(aButton, null);
  aButton.disabled = disableButton;
  var wasCalled = false;
  var callRecorder = function() { wasCalled = true; };
  goog.events.listen(dialog, goog.ui.Dialog.EventType.SELECT, callRecorder);
  goog.testing.events.fireClickSequence(aButton);
  return wasCalled;
}

function testButtonClicksDispatchSelectEvents() {
  assertTrue('Select event should be dispatched' +
             ' when clicking on an enabled button',
      checkSelectDispatchedOnButtonClick(false));
}

function testDisabledButtonClicksDontDispatchSelectEvents() {
  assertFalse('Select event should not be dispatched' +
              ' when clicking on a disabled button',
      checkSelectDispatchedOnButtonClick(true));
}

function testEnterKeyDispatchesDefaultSelectEvents() {
  var okButton = dialog.getButtonElement().getElementsByTagName(
      goog.dom.TagName.BUTTON)[1];
  assertNotEquals(okButton, null);
  var wasCalled = false;
  var callRecorder = function() { wasCalled = true; };
  goog.events.listen(dialog, goog.ui.Dialog.EventType.SELECT, callRecorder);
  // Test that event is not dispatched when default button is disabled.
  okButton.disabled = true;
  goog.testing.events.fireKeySequence(dialog.getElement(),
                                      goog.events.KeyCodes.ENTER);
  assertFalse(wasCalled);
  // Test that event is dispatched when default button is enabled.
  okButton.disabled = false;
  goog.testing.events.fireKeySequence(dialog.getElement(),
                                      goog.events.KeyCodes.ENTER);
  assertTrue(wasCalled);
}

function testEnterKeyOnDisabledDefaultButtonDoesNotDispatchSelectEvents() {
  var okButton = dialog.getButtonElement().getElementsByTagName(
      goog.dom.TagName.BUTTON)[1];
  okButton.focus();

  var callRecorder = goog.testing.recordFunction();
  goog.events.listen(dialog, goog.ui.Dialog.EventType.SELECT, callRecorder);

  okButton.disabled = true;
  goog.testing.events.fireKeySequence(okButton, goog.events.KeyCodes.ENTER);
  assertEquals(0, callRecorder.getCallCount());

  okButton.disabled = false;
  goog.testing.events.fireKeySequence(okButton, goog.events.KeyCodes.ENTER);
  assertEquals(1, callRecorder.getCallCount());
}

function testEnterKeyDoesNothingOnSpecialFormElements() {
  checkEnterKeyDoesNothingOnSpecialFormElement(
      '<textarea>Hello dialog</textarea>',
      'TEXTAREA');

  checkEnterKeyDoesNothingOnSpecialFormElement(
      '<select>Selection</select>',
      'SELECT');

  checkEnterKeyDoesNothingOnSpecialFormElement(
      '<a href="http://google.com">Hello dialog</a>',
      'A');
}

function checkEnterKeyDoesNothingOnSpecialFormElement(content, tagName) {
  // TODO(user): Switch to setSafeHtmlContent here and elsewhere.
  dialog.setContent(content);
  var formElement = dialog.getContentElement().
      getElementsByTagName(tagName)[0];
  var wasCalled = false;
  var callRecorder = function() {
    wasCalled = true;
  };
  goog.events.listen(dialog, goog.ui.Dialog.EventType.SELECT, callRecorder);

  // Enter does not fire on the enabled form element.
  goog.testing.events.fireKeySequence(formElement,
      goog.events.KeyCodes.ENTER);
  assertFalse(wasCalled);

  // Enter fires on the disabled form element.
  formElement.disabled = true;
  goog.testing.events.fireKeySequence(formElement,
      goog.events.KeyCodes.ENTER);
  assertTrue(wasCalled);
}

function testEscapeKeyDoesNothingOnSpecialFormElements() {
  dialog.setContent('<select><option>Hello</option>' +
      '<option>dialog</option></select>');
  var select = dialog.getContentElement().
      getElementsByTagName('SELECT')[0];
  var wasCalled = false;
  var callRecorder = function() {
    wasCalled = true;
  };
  goog.events.listen(dialog, goog.ui.Dialog.EventType.SELECT, callRecorder);

  // Escape does not fire on the enabled select box.
  goog.testing.events.fireKeySequence(select,
      goog.events.KeyCodes.ESC);
  assertFalse(wasCalled);

  // Escape fires on the disabled select.
  select.disabled = true;
  goog.testing.events.fireKeySequence(select,
      goog.events.KeyCodes.ESC);
  assertTrue(wasCalled);
}

function testEscapeCloses() {
  // If escapeCloses is set to false, the dialog should ignore the escape key
  assertTrue(dialog.isEscapeToCancel());
  dialog.setEscapeToCancel(false);
  assertFalse(dialog.isEscapeToCancel());

  var buttons = new goog.ui.Dialog.ButtonSet();
  buttons.set(goog.ui.Dialog.DefaultButtonKeys.OK, 'OK', true);
  dialog.setButtonSet(buttons);
  goog.testing.events.fireKeySequence(dialog.getContentElement(),
      goog.events.KeyCodes.ESC);
  assertTrue(dialog.isVisible());

  // Having a cancel button should make no difference, escape should still not
  // work.
  buttons.set(goog.ui.Dialog.DefaultButtonKeys.CANCEL, 'Foo!', false, true);
  dialog.setButtonSet(buttons);
  goog.testing.events.fireKeySequence(dialog.getContentElement(),
      goog.events.KeyCodes.ESC);
  assertTrue(dialog.isVisible());
}

function testKeydownClosesWithoutButtonSet() {
  // Clear button set
  dialog.setButtonSet(null);

  // Create a custom button.
  dialog.setContent('<button id="button" name="ok">OK</button>');
  var wasCalled = false;
  function called() {
    wasCalled = true;
  }
  var element = goog.dom.getElement('button');
  goog.events.listen(element, goog.events.EventType.KEYPRESS, called);
  // Listen for 'Enter' on the button.
  // This tests using a dialog with no ButtonSet that has been set. Uses
  // a custom button.  The callback should be called with no exception thrown.
  goog.testing.events.fireKeySequence(element, goog.events.KeyCodes.ENTER);
  assertTrue('Should have gotten event on the button.', wasCalled);
}

function testEnterKeyWithoutDefaultDoesNotPreventPropagation() {
  var buttons = new goog.ui.Dialog.ButtonSet();
  buttons.set(goog.ui.Dialog.DefaultButtonKeys.CANCEL,
      'Foo!',
      false);
  // Set a button set without a default selected button
  dialog.setButtonSet(buttons);
  dialog.setContent('<span id="linkel" tabindex="0">Link Span</span>');

  var call = false;
  function called() {
    call = true;
  }
  var element = document.getElementById('linkel');
  goog.events.listen(element, goog.events.EventType.KEYDOWN, called);
  goog.testing.events.fireKeySequence(element, goog.events.KeyCodes.ENTER);

  assertTrue('Should have gotten event on the link', call);
}

function testPreventDefaultedSelectCausesStopPropagation() {
  dialog.setButtonSet(goog.ui.Dialog.ButtonSet.OK_CANCEL);

  var callCount = 0;
  var keypressCount = 0;
  var keydownCount = 0;

  var preventDefaulter = function(e) {
    e.preventDefault();
  };

  goog.events.listen(
      dialog, goog.ui.Dialog.EventType.SELECT, preventDefaulter);
  goog.events.listen(
      document.body, goog.events.EventType.KEYPRESS, function() {
        keypressCount++;
      });
  goog.events.listen(
      document.body, goog.events.EventType.KEYDOWN, function() {
        keydownCount++;
      });

  // Ensure that if the SELECT event is prevented, all key events
  // are still stopped from propagating.
  goog.testing.events.fireKeySequence(
      dialog.getElement(), goog.events.KeyCodes.ENTER);
  assertEquals('The KEYPRESS should be stopped', 0, keypressCount);
  assertEquals('The KEYDOWN should not be stopped', 1, keydownCount);

  keypressCount = 0;
  keydownCount = 0;
  goog.testing.events.fireKeySequence(
      dialog.getElement(), goog.events.KeyCodes.ESC);
  assertEquals('The KEYDOWN should be stopped', 0, keydownCount);
  // Note: Some browsers don't yield keypresses on escape, so don't check.

  goog.events.unlisten(
      dialog, goog.ui.Dialog.EventType.SELECT, preventDefaulter);

  keypressCount = 0;
  keydownCount = 0;
  goog.testing.events.fireKeySequence(
      dialog.getElement(), goog.events.KeyCodes.ENTER);
  assertEquals('The KEYPRESS should be stopped', 0, keypressCount);
  assertEquals('The KEYDOWN should not be stopped', 1, keydownCount);
}

function testEnterKeyHandledInKeypress() {
  var inKeyPress = false;
  goog.events.listen(
      document.body, goog.events.EventType.KEYPRESS,
      function() {
        inKeyPress = true;
      }, true /* capture */);
  goog.events.listen(
      document.body, goog.events.EventType.KEYPRESS,
      function() {
        inKeyPress = false;
      }, false /* !capture */);
  var selectCalled = false;
  goog.events.listen(
      dialog, goog.ui.Dialog.EventType.SELECT, function() {
        selectCalled = true;
        assertTrue(
            'Select must be dispatched during keypress to allow popups',
            inKeyPress);
      });

  goog.testing.events.fireKeySequence(
      dialog.getElement(), goog.events.KeyCodes.ENTER);
  assertTrue(selectCalled);
}

function testShiftTabAtTopSetsUpWrapAndDoesNotPreventPropagation() {
  dialog.setupBackwardTabWrap = goog.testing.recordFunction();
  shiftTabRecorder = goog.testing.recordFunction();

  goog.events.listen(
      dialog.getElement(), goog.events.EventType.KEYDOWN, shiftTabRecorder);
  var shiftProperties = { shiftKey: true };
  goog.testing.events.fireKeySequence(
      dialog.getElement(), goog.events.KeyCodes.TAB, shiftProperties);

  assertNotNull('Should have gotten event on Shift+TAB',
      shiftTabRecorder.getLastCall());
  assertNotNull('Backward tab wrap should have been set up',
      dialog.setupBackwardTabWrap.getLastCall());
}

function testButtonsWithContentsDispatchSelectEvents() {
  var aButton = dialog.getButtonElement().getElementsByTagName(
      goog.dom.TagName.BUTTON)[0];
  var aSpan = document.createElement(goog.dom.TagName.SPAN);
  aButton.appendChild(aSpan);
  var wasCalled = false;
  var callRecorder = function() { wasCalled = true; };
  goog.events.listen(dialog, goog.ui.Dialog.EventType.SELECT, callRecorder);
  goog.testing.events.fireClickSequence(aSpan);
  assertTrue(wasCalled);
}

function testAfterHideEvent() {
  var wasCalled = false;
  var callRecorder = function() { wasCalled = true; };
  goog.events.listen(dialog, goog.ui.Dialog.EventType.AFTER_HIDE,
      callRecorder);
  dialog.setVisible(false);
  assertTrue(wasCalled);
}

function testAfterShowEvent() {
  dialog.setVisible(false);
  var wasCalled = false;
  var callRecorder = function() { wasCalled = true; };
  goog.events.listen(dialog, goog.ui.Dialog.EventType.AFTER_SHOW,
      callRecorder);
  dialog.setVisible(true);
  assertTrue(wasCalled);
}

function testCannedButtonSets() {
  dialog.setButtonSet(goog.ui.Dialog.ButtonSet.OK);
  assertButtons([goog.ui.Dialog.DefaultButtonKeys.OK]);

  dialog.setButtonSet(goog.ui.Dialog.ButtonSet.OK_CANCEL);
  assertButtons([goog.ui.Dialog.DefaultButtonKeys.OK,
                 goog.ui.Dialog.DefaultButtonKeys.CANCEL]);

  dialog.setButtonSet(goog.ui.Dialog.ButtonSet.YES_NO);
  assertButtons([goog.ui.Dialog.DefaultButtonKeys.YES,
                 goog.ui.Dialog.DefaultButtonKeys.NO]);

  dialog.setButtonSet(goog.ui.Dialog.ButtonSet.YES_NO_CANCEL);
  assertButtons([goog.ui.Dialog.DefaultButtonKeys.YES,
                 goog.ui.Dialog.DefaultButtonKeys.NO,
                 goog.ui.Dialog.DefaultButtonKeys.CANCEL]);

  dialog.setButtonSet(goog.ui.Dialog.ButtonSet.CONTINUE_SAVE_CANCEL);
  assertButtons([goog.ui.Dialog.DefaultButtonKeys.CONTINUE,
                 goog.ui.Dialog.DefaultButtonKeys.SAVE,
                 goog.ui.Dialog.DefaultButtonKeys.CANCEL]);
}

function testFactoryButtonSets() {
  dialog.setButtonSet(goog.ui.Dialog.ButtonSet.createOk());
  assertButtons([goog.ui.Dialog.DefaultButtonKeys.OK]);

  dialog.setButtonSet(goog.ui.Dialog.ButtonSet.createOkCancel());
  assertButtons([goog.ui.Dialog.DefaultButtonKeys.OK,
                 goog.ui.Dialog.DefaultButtonKeys.CANCEL]);

  dialog.setButtonSet(goog.ui.Dialog.ButtonSet.createYesNo());
  assertButtons([goog.ui.Dialog.DefaultButtonKeys.YES,
                 goog.ui.Dialog.DefaultButtonKeys.NO]);

  dialog.setButtonSet(goog.ui.Dialog.ButtonSet.createYesNoCancel());
  assertButtons([goog.ui.Dialog.DefaultButtonKeys.YES,
                 goog.ui.Dialog.DefaultButtonKeys.NO,
                 goog.ui.Dialog.DefaultButtonKeys.CANCEL]);

  dialog.setButtonSet(goog.ui.Dialog.ButtonSet.createContinueSaveCancel());
  assertButtons([goog.ui.Dialog.DefaultButtonKeys.CONTINUE,
                 goog.ui.Dialog.DefaultButtonKeys.SAVE,
                 goog.ui.Dialog.DefaultButtonKeys.CANCEL]);
}

function testDefaultButtonClassName() {
  var key = 'someKey';
  var msg = 'someMessage';
  var isDefault = false;
  var buttonSetOne = new goog.ui.Dialog.ButtonSet().set(key, msg, isDefault);
  dialog.setButtonSet(buttonSetOne);
  var defaultClassName = goog.getCssName(buttonSetOne.class_, 'default');
  var buttonOne = buttonSetOne.getButton(key);
  assertNotEquals(defaultClassName, buttonOne.className);
  var isDefault = true;
  var buttonSetTwo = new goog.ui.Dialog.ButtonSet().set(key, msg, isDefault);
  dialog.setButtonSet(buttonSetTwo);
  var buttonTwo = buttonSetTwo.getButton(key);
  assertEquals(defaultClassName, buttonTwo.className);
}

function testGetButton() {
  dialog.setButtonSet(goog.ui.Dialog.ButtonSet.OK);
  var buttons = document.getElementsByName(
      goog.ui.Dialog.DefaultButtonKeys.OK);
  assertEquals(buttons[0], dialog.getButtonSet().getButton(
      goog.ui.Dialog.DefaultButtonKeys.OK));
}

function testGetAllButtons() {
  dialog.setButtonSet(goog.ui.Dialog.ButtonSet.YES_NO_CANCEL);
  var buttons = dialog.getElement().getElementsByTagName(
      goog.dom.TagName.BUTTON);
  for (var i = 0; i < buttons.length; i++) {
    assertEquals(buttons[i], dialog.getButtonSet().getAllButtons()[i]);
  }
}

function testSetButtonEnabled() {
  var buttonSet = goog.ui.Dialog.ButtonSet.createYesNoCancel();
  dialog.setButtonSet(buttonSet);
  assertFalse(
      buttonSet.getButton(goog.ui.Dialog.DefaultButtonKeys.NO).disabled);
  buttonSet.setButtonEnabled(goog.ui.Dialog.DefaultButtonKeys.NO, false);
  assertTrue(
      buttonSet.getButton(goog.ui.Dialog.DefaultButtonKeys.NO).disabled);
  buttonSet.setButtonEnabled(goog.ui.Dialog.DefaultButtonKeys.NO, true);
  assertFalse(
      buttonSet.getButton(goog.ui.Dialog.DefaultButtonKeys.NO).disabled);
}

function testSetAllButtonsEnabled() {
  var buttonSet = goog.ui.Dialog.ButtonSet.createContinueSaveCancel();
  dialog.setButtonSet(buttonSet);
  var buttons = buttonSet.getAllButtons();
  for (var i = 0; i < buttons.length; i++) {
    assertFalse(buttons[i].disabled);
  }

  buttonSet.setAllButtonsEnabled(false);
  for (var i = 0; i < buttons.length; i++) {
    assertTrue(buttons[i].disabled);
  }

  buttonSet.setAllButtonsEnabled(true);
  for (var i = 0; i < buttons.length; i++) {
    assertFalse(buttons[i].disabled);
  }
}

function testIframeMask() {
  var prevNumFrames =
      goog.dom.getElementsByTagNameAndClass(goog.dom.TagName.IFRAME).length;
  // generate a new dialog
  dialog.dispose();
  dialog = new goog.ui.Dialog(null, true /* iframe mask */);
  dialog.setVisible(true);

  // Test that the dialog added one iframe to the document.
  // The absolute number of iframes should not be tested because,
  // in certain cases, the test runner itself can can add an iframe
  // to the document as part of a strategy not to block the UI for too long.
  // See goog.async.nextTick.getSetImmediateEmulator_.
  var curNumFrames =
      goog.dom.getElementsByTagNameAndClass(goog.dom.TagName.IFRAME).length;
  assertEquals(
      'No iframe mask created', prevNumFrames + 1, curNumFrames);
}

function testNonModalDialog() {
  var prevNumFrames =
      goog.dom.getElementsByTagNameAndClass(goog.dom.TagName.IFRAME).length;
  // generate a new dialog
  dialog.dispose();
  dialog = new goog.ui.Dialog(null, true /* iframe mask */);
  dialog.setModal(false);
  assertAriaHidden(false);
  dialog.setVisible(true);
  assertAriaHidden(true);

  // Test that the dialog did not change the number of iframes in the document.
  // The absolute number of iframes should not be tested because,
  // in certain cases, the test runner itself can can add an iframe
  // to the document as part of a strategy not to block the UI for too long.
  // See goog.async.nextTick.getSetImmediateEmulator_.
  var curNumFrames =
      goog.dom.getElementsByTagNameAndClass(goog.dom.TagName.IFRAME).length;
  assertEquals(
      'Iframe mask created for modal dialog', prevNumFrames, curNumFrames);
}

function testSwapModalForOpenDialog() {
  dialog.dispose();
  dialog = new goog.ui.Dialog(null, true /* iframe mask */);
  assertAriaHidden(false);
  dialog.setVisible(true);
  assertAriaHidden(true);
  dialog.setModal(false);
  assertAriaHidden(false);
  assertFalse('IFrame bg element should not be in dom',
      goog.dom.contains(document.body, dialog.getBackgroundIframe()));
  assertFalse('bg element should not be in dom',
      goog.dom.contains(document.body, dialog.getBackgroundElement()));

  dialog.setModal(true);
  assertAriaHidden(true);
  assertTrue('IFrame bg element should be in dom',
      goog.dom.contains(document.body, dialog.getBackgroundIframe()));
  assertTrue('bg element should be in dom',
      goog.dom.contains(document.body, dialog.getBackgroundElement()));

  assertEquals('IFrame bg element is a child of body',
      document.body, dialog.getBackgroundIframe().parentNode);
  assertEquals('bg element is a child of body',
      document.body, dialog.getBackgroundElement().parentNode);

  assertTrue('IFrame bg element should visible',
      goog.style.isElementShown(dialog.getBackgroundIframe()));
  assertTrue('bg element should be visible',
      goog.style.isElementShown(dialog.getBackgroundElement()));
}


/**
 * Assert that the dialog has buttons with the given keys in the correct
 * order.
 * @param {Array<string>} keys An array of button keys.
 */
function assertButtons(keys) {
  var buttons = dialog.getElement().getElementsByTagName(
      goog.dom.TagName.BUTTON);
  var actualKeys = [];
  for (var i = 0; i < buttons.length; i++) {
    actualKeys[i] = buttons[i].name;
  }
  assertArrayEquals(keys, actualKeys);
}

function testButtonSetOkFiresDialogEventOnEscape() {
  dialog.setButtonSet(goog.ui.Dialog.ButtonSet.OK);
  var wasCalled = false;
  var callRecorder = function() { wasCalled = true; };
  goog.events.listen(dialog, goog.ui.Dialog.EventType.SELECT,
      callRecorder);
  goog.testing.events.fireKeySequence(
      dialog.getElement(), goog.events.KeyCodes.ESC);
  assertTrue(wasCalled);
}

function testHideButtons_afterRender() {
  dialog.setButtonSet(goog.ui.Dialog.ButtonSet.OK);
  assertTrue(goog.style.isElementShown(dialog.buttonEl_));
  dialog.setButtonSet(null);
  assertFalse(goog.style.isElementShown(dialog.buttonEl_));
  dialog.setButtonSet(goog.ui.Dialog.ButtonSet.OK);
  assertTrue(goog.style.isElementShown(dialog.buttonEl_));
}

function testHideButtons_beforeRender() {
  dialog.dispose();

  dialog = new goog.ui.Dialog();
  dialog.setButtonSet(null);
  dialog.setVisible(true);
  assertFalse(goog.style.isElementShown(dialog.buttonEl_));
  dialog.setButtonSet(goog.ui.Dialog.ButtonSet.OK);
  assertTrue(goog.style.isElementShown(dialog.buttonEl_));
}

function testHideButtons_beforeDecorate() {
  dialog.dispose();

  dialog = new goog.ui.Dialog();
  dialog.setButtonSet(null);
  dialog.decorate(decorateTarget);
  dialog.setVisible(true);
  assertFalse(goog.style.isElementShown(dialog.buttonEl_));
  dialog.setButtonSet(goog.ui.Dialog.ButtonSet.OK);
  assertTrue(goog.style.isElementShown(dialog.buttonEl_));
}

function testAriaLabelledBy_render() {
  dialog.dispose();

  dialog = new goog.ui.Dialog();
  dialog.render();
  assertTrue(!!dialog.getTitleTextElement().id);
  assertNotNull(dialog.getElement());
  assertEquals(dialog.getTitleTextElement().id,
      goog.a11y.aria.getState(dialog.getElement(),
          'labelledby'));
}

function testAriaLabelledBy_decorate() {
  dialog.dispose();

  dialog = new goog.ui.Dialog();
  dialog.decorate(decorateTarget);
  dialog.setVisible(true);
  assertTrue(!!dialog.getTitleTextElement().id);
  assertNotNull(dialog.getElement());
  assertEquals(dialog.getTitleTextElement().id,
      goog.a11y.aria.getState(dialog.getElement(),
          'labelledby'));
}


function testPreferredAriaRole_renderDefault() {
  dialog.dispose();

  dialog = new goog.ui.Dialog();
  dialog.render();
  assertNotNull(dialog.getElement());
  assertEquals(dialog.getPreferredAriaRole(),
      goog.a11y.aria.getRole(dialog.getElement()));
}

function testPreferredAriaRole_decorateDefault() {
  dialog.dispose();

  dialog = new goog.ui.Dialog();
  dialog.decorate(decorateTarget);
  assertNotNull(dialog.getElement());
  assertEquals(dialog.getPreferredAriaRole(),
      goog.a11y.aria.getRole(dialog.getElement()));
}

function testPreferredAriaRole_renderOverride() {
  dialog.dispose();

  dialog = new goog.ui.Dialog();
  dialog.setPreferredAriaRole(goog.a11y.aria.Role.ALERTDIALOG);
  dialog.render();
  assertNotNull(dialog.getElement());
  assertEquals(goog.a11y.aria.Role.ALERTDIALOG,
      goog.a11y.aria.getRole(dialog.getElement()));
}

function testPreferredAriaRole_decorateOverride() {
  dialog.dispose();

  dialog = new goog.ui.Dialog();
  dialog.setPreferredAriaRole(goog.a11y.aria.Role.ALERTDIALOG);
  dialog.decorate(decorateTarget);
  assertNotNull(dialog.getElement());
  assertEquals(goog.a11y.aria.Role.ALERTDIALOG,
      goog.a11y.aria.getRole(dialog.getElement()));
}

function testDefaultOpacityIsAppliedOnRender() {
  dialog.dispose();

  dialog = new goog.ui.Dialog();
  dialog.render();
  assertEquals(0.5, goog.style.getOpacity(dialog.getBackgroundElement()));
}

function testDefaultOpacityIsAppliedOnDecorate() {
  dialog.dispose();

  dialog = new goog.ui.Dialog();
  dialog.decorate(decorateTarget);
  assertEquals(0.5, goog.style.getOpacity(dialog.getBackgroundElement()));
}

function testDraggableStyle() {
  assertTrue('draggable CSS class is set', goog.dom.classlist.contains(
      dialog.titleEl_, 'modal-dialog-title-draggable'));
  dialog.setDraggable(false);
  assertFalse('draggable CSS class is removed', goog.dom.classlist.contains(
      dialog.titleEl_, 'modal-dialog-title-draggable'));
}

function testDraggingLifecycle() {
  dialog.dispose();

  dialog = new goog.ui.Dialog();
  dialog.setDraggerLimits_ = goog.testing.recordFunction();
  dialog.createDom();
  assertNull('dragger is not created in createDom', dialog.dragger_);

  dialog.setVisible(true);
  assertNotNull('dragger is created when the dialog is rendered',
      dialog.dragger_);

  assertNull('dragging limits are not set just before dragging',
      dialog.setDraggerLimits_.getLastCall());
  goog.testing.events.fireMouseDownEvent(dialog.titleEl_);
  assertNotNull('dragging limits are set',
      dialog.setDraggerLimits_.getLastCall());

  dialog.exitDocument();
  assertNull('dragger is cleaned up in exitDocument', dialog.dragger_);
}

function testDisposingVisibleDialogWithTransitionsDoesNotThrowException() {
  var transition = goog.fx.css3.fadeIn(dialog.getElement(),
      0.1 /* duration */);

  dialog.setTransition(transition, transition, transition, transition);
  dialog.setVisible(true);
  dialog.dispose();
  // Nothing to assert. We only want to ensure that there is no error.
}

function testEventsDuringAnimation() {
  dialog.dispose();
  dialog = new goog.ui.Dialog();
  dialog.render();
  dialog.setTransition(
      goog.fx.css3.fadeIn(dialog.getElement(), 1),
      goog.fx.css3.fadeIn(dialog.getBackgroundElement(), 1),
      goog.fx.css3.fadeOut(dialog.getElement(), 1),
      goog.fx.css3.fadeOut(dialog.getBackgroundElement(), 1));
  dialog.setVisible(true);
  assertTrue(dialog.isVisible());

  var buttonSet = dialog.getButtonSet();
  var button = buttonSet.getButton(buttonSet.getDefault());

  // The button event fires while the animation is still going.
  goog.testing.events.fireClickSequence(button);
  mockClock.tick(2000);
  assertFalse(dialog.isVisible());
}

function testHtmlContent() {
  dialog.setSafeHtmlContent(goog.html.testing.newSafeHtmlForTest(
      '<span class="theSpan">Hello</span>'));
  var spanEl =
      goog.dom.getElementByClass('theSpan', dialog.getContentElement());
  assertEquals('Hello', goog.dom.getTextContent(spanEl));
  assertEquals('<span class="theSpan">Hello</span>', dialog.getContent());
  assertEquals('<span class="theSpan">Hello</span>',
               goog.html.SafeHtml.unwrap(dialog.getSafeHtmlContent()));
}

function testSetContent_guardedByGlobalFlag() {
  /** @suppress {missingRequire} */
  stubs.set(goog.html.legacyconversions, 'ALLOW_LEGACY_CONVERSIONS', false);
  assertEquals(
      'Error: Legacy conversion from string to goog.html types is disabled',
      assertThrows(function() {
        dialog.setContent('<img src="blag" onerror="evil();">');
      }).message);
}

function testFocus() {
  // Focus should go to the dialog element.
  document.body.focus();
  dialog.focus();
  assertEquals(dialog.getElement(), document.activeElement);
}

// Asserts that a test element which is a child of the document body has the
// aria property 'hidden' set on it, or not.
function assertAriaHidden(expectedHidden) {
  var expectedString = expectedHidden ? 'true' : '';
  assertEquals(expectedString,
      goog.a11y.aria.getState(bodyChildElement,
          goog.a11y.aria.State.HIDDEN));
}
