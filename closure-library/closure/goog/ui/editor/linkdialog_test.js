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

goog.provide('goog.ui.editor.LinkDialogTest');
goog.setTestOnly('goog.ui.editor.LinkDialogTest');

goog.require('goog.dom');
goog.require('goog.dom.DomHelper');
goog.require('goog.dom.TagName');
goog.require('goog.editor.BrowserFeature');
goog.require('goog.editor.Link');
goog.require('goog.events');
goog.require('goog.events.EventHandler');
goog.require('goog.events.EventType');
goog.require('goog.events.KeyCodes');
goog.require('goog.style');
goog.require('goog.testing.MockControl');
goog.require('goog.testing.PropertyReplacer');
goog.require('goog.testing.dom');
goog.require('goog.testing.events');
goog.require('goog.testing.events.Event');
goog.require('goog.testing.jsunit');
goog.require('goog.testing.mockmatchers');
goog.require('goog.testing.mockmatchers.ArgumentMatcher');
goog.require('goog.ui.editor.AbstractDialog');
goog.require('goog.ui.editor.LinkDialog');
goog.require('goog.ui.editor.messages');
goog.require('goog.userAgent');

var dialog;
var mockCtrl;
var mockLink;
var mockOkHandler;
var mockGetViewportSize;
var mockWindowOpen;
var isNew;
var anchorElem;
var stubs = new goog.testing.PropertyReplacer();

var ANCHOR_TEXT = 'anchor text';
var ANCHOR_URL = 'http://www.google.com/';
var ANCHOR_EMAIL = 'm@r.cos';
var ANCHOR_MAILTO = 'mailto:' + ANCHOR_EMAIL;

function setUp() {
  anchorElem = goog.dom.createElement(goog.dom.TagName.A);
  goog.dom.appendChild(goog.dom.getDocument().body, anchorElem);

  mockCtrl = new goog.testing.MockControl();
  mockLink = mockCtrl.createLooseMock(goog.editor.Link);
  mockOkHandler = mockCtrl.createLooseMock(goog.events.EventHandler);

  isNew = false;
  mockLink.isNew();
  mockLink.$anyTimes();
  mockLink.$does(function() { return isNew; });
  mockLink.getCurrentText();
  mockLink.$anyTimes();
  mockLink.$does(function() { return anchorElem.innerHTML; });
  mockLink.setTextAndUrl(
      goog.testing.mockmatchers.isString, goog.testing.mockmatchers.isString);
  mockLink.$anyTimes();
  mockLink.$does(function(text, url) {
    anchorElem.innerHTML = text;
    anchorElem.href = url;
  });
  mockLink.$registerArgumentListVerifier(
      'placeCursorRightOf', function() { return true; });
  mockLink.placeCursorRightOf(goog.testing.mockmatchers.iBoolean);
  mockLink.$anyTimes();
  mockLink.getAnchor();
  mockLink.$anyTimes();
  mockLink.$returns(anchorElem);

  mockWindowOpen = mockCtrl.createFunctionMock('open');
  stubs.set(window, 'open', mockWindowOpen);
}

function tearDown() {
  dialog.dispose();
  goog.dom.removeNode(anchorElem);
  stubs.reset();
}

function setUpAnchor(href, text, opt_isNew, opt_target, opt_rel) {
  anchorElem.href = href;
  anchorElem.innerHTML = text;
  isNew = !!opt_isNew;
  if (opt_target) {
    anchorElem.target = opt_target;
  }
  if (opt_rel) {
    anchorElem.rel = opt_rel;
  }
}


/**
 * Creates and shows the dialog to be tested.
 * @param {Document=} opt_document Document to render the dialog into.
 *     Defaults to the main window's document.
 * @param {boolean=} opt_openInNewWindow Whether the open in new window
 *     checkbox should be shown.
 * @param {boolean=} opt_noFollow Whether rel=nofollow checkbox should be
 *     shown.
 */
function createAndShow(opt_document, opt_openInNewWindow, opt_noFollow) {
  dialog = new goog.ui.editor.LinkDialog(
      new goog.dom.DomHelper(opt_document), mockLink);
  if (opt_openInNewWindow) {
    dialog.showOpenLinkInNewWindow(false);
  }
  if (opt_noFollow) {
    dialog.showRelNoFollow();
  }
  dialog.addEventListener(
      goog.ui.editor.AbstractDialog.EventType.OK, mockOkHandler);
  dialog.show();
}


/**
 * Sets up the mock event handler to expect an OK event with the given text
 * and url.
 */
function expectOk(linkText, linkUrl, opt_openInNewWindow, opt_noFollow) {
  mockOkHandler.handleEvent(
      new goog.testing.mockmatchers.ArgumentMatcher(
          function(arg) {
            return arg.type == goog.ui.editor.AbstractDialog.EventType.OK &&
                arg.linkText == linkText && arg.linkUrl == linkUrl &&
                arg.openInNewWindow == !!opt_openInNewWindow &&
                arg.noFollow == !!opt_noFollow;
          },
          '{linkText: ' + linkText + ', linkUrl: ' + linkUrl +
              ', openInNewWindow: ' + opt_openInNewWindow + ', noFollow: ' +
              opt_noFollow + '}'));
}


/**
 * Return true if we should use active element in our tests.
 * @return {boolean} .
 */
function useActiveElement() {
  return goog.editor.BrowserFeature.HAS_ACTIVE_ELEMENT ||
      goog.userAgent.WEBKIT && goog.userAgent.isVersionOrHigher(9);
}


/**
 * Tests that when you show the dialog for a new link, you can switch
 * to the URL view.
 * @param {Document=} opt_document Document to render the dialog into.
 *     Defaults to the main window's document.
 */
function testShowNewLinkSwitchToUrl(opt_document) {
  mockCtrl.$replayAll();
  setUpAnchor('', '', true);  // Must be done before creating the dialog.
  createAndShow(opt_document);

  var webRadio = dialog.dom.getElement(goog.ui.editor.LinkDialog.Id_.ON_WEB_TAB)
                     .firstChild;
  var emailRadio =
      dialog.dom.getElement(goog.ui.editor.LinkDialog.Id_.EMAIL_ADDRESS_TAB)
          .firstChild;
  assertTrue('Web Radio Button selected', webRadio.checked);
  assertFalse('Email Radio Button selected', emailRadio.checked);
  if (useActiveElement()) {
    assertEquals(
        'Focus should be on url input', getUrlInput(),
        dialog.dom.getActiveElement());
  }

  emailRadio.click();
  assertFalse('Web Radio Button selected', webRadio.checked);
  assertTrue('Email Radio Button selected', emailRadio.checked);
  if (useActiveElement()) {
    assertEquals(
        'Focus should be on url input', getEmailInput(),
        dialog.dom.getActiveElement());
  }

  mockCtrl.$verifyAll();
}


/**
 * Tests that when you show the dialog for a new link, the input fields are
 * empty, the web tab is selected and focus is in the url input field.
 * @param {Document=} opt_document Document to render the dialog into.
 *     Defaults to the main window's document.
 */
function testShowForNewLink(opt_document) {
  mockCtrl.$replayAll();
  setUpAnchor('', '', true);  // Must be done before creating the dialog.
  createAndShow(opt_document);

  assertEquals(
      'Display text input field should be empty', '', getDisplayInputText());
  assertEquals('Url input field should be empty', '', getUrlInputText());
  assertEquals(
      'On the web tab should be selected', goog.ui.editor.LinkDialog.Id_.ON_WEB,
      dialog.curTabId_);
  if (useActiveElement()) {
    assertEquals(
        'Focus should be on url input', getUrlInput(),
        dialog.dom.getActiveElement());
  }

  mockCtrl.$verifyAll();
}


/**
 * Fakes that the mock field is using an iframe and does the same test as
 * testShowForNewLink().
 */
function testShowForNewLinkWithDiffAppWindow() {
  testShowForNewLink(goog.dom.getElement('appWindowIframe').contentDocument);
}


/**
 * Tests that when you show the dialog for a url link, the input fields are
 * filled in, the web tab is selected and focus is in the url input field.
 */
function testShowForUrlLink() {
  mockCtrl.$replayAll();
  setUpAnchor(ANCHOR_URL, ANCHOR_TEXT);
  createAndShow();

  assertEquals(
      'Display text input field should be filled in', ANCHOR_TEXT,
      getDisplayInputText());
  assertEquals(
      'Url input field should be filled in', ANCHOR_URL, getUrlInputText());
  assertEquals(
      'On the web tab should be selected', goog.ui.editor.LinkDialog.Id_.ON_WEB,
      dialog.curTabId_);
  if (useActiveElement()) {
    assertEquals(
        'Focus should be on url input', getUrlInput(),
        dialog.dom.getActiveElement());
  }

  mockCtrl.$verifyAll();
}


/**
 * Tests that when you show the dialog for a mailto link, the input fields are
 * filled in, the email tab is selected and focus is in the email input field.
 */
function testShowForMailtoLink() {
  mockCtrl.$replayAll();
  setUpAnchor(ANCHOR_MAILTO, ANCHOR_TEXT);
  createAndShow();

  assertEquals(
      'Display text input field should be filled in', ANCHOR_TEXT,
      getDisplayInputText());
  assertEquals(
      'Email input field should be filled in',
      ANCHOR_EMAIL,  // The 'mailto:' is not in the input!
      getEmailInputText());
  assertEquals(
      'Email tab should be selected',
      goog.ui.editor.LinkDialog.Id_.EMAIL_ADDRESS, dialog.curTabId_);
  if (useActiveElement()) {
    assertEquals(
        'Focus should be on email input', getEmailInput(),
        dialog.dom.getActiveElement());
  }

  mockCtrl.$verifyAll();
}


/**
 * Tests that the display text is autogenerated from the url input in the
 * right situations (and not generated when appropriate too).
 */
function testAutogeneration() {
  mockCtrl.$replayAll();
  setUpAnchor('', '', true);
  createAndShow();

  // Simulate typing a url when everything is empty, should autogen.
  setUrlInputText(ANCHOR_URL);
  assertEquals(
      'Display text should have been autogenerated', ANCHOR_URL,
      getDisplayInputText());

  // Simulate typing text when url is set, afterwards should not autogen.
  setDisplayInputText(ANCHOR_TEXT);
  setUrlInputText(ANCHOR_MAILTO);
  assertNotEquals(
      'Display text should not have been autogenerated', ANCHOR_MAILTO,
      getDisplayInputText());
  assertEquals(
      'Display text should have remained the same', ANCHOR_TEXT,
      getDisplayInputText());

  // Simulate typing text equal to existing url, afterwards should autogen.
  setDisplayInputText(ANCHOR_MAILTO);
  setUrlInputText(ANCHOR_URL);
  assertEquals(
      'Display text should have been autogenerated', ANCHOR_URL,
      getDisplayInputText());

  mockCtrl.$verifyAll();
}


/**
 * Tests that the display text is not autogenerated from the url input in all
 * situations when the autogeneration feature is turned off.
 */
function testAutogenerationOff() {
  mockCtrl.$replayAll();

  setUpAnchor('', '', true);
  createAndShow();

  // Disable the autogen feature
  dialog.setAutogenFeatureEnabled(false);

  // Simulate typing a url when everything is empty, should not autogen.
  setUrlInputText(ANCHOR_URL);
  assertEquals(
      'Display text should not have been autogenerated', '',
      getDisplayInputText());

  // Simulate typing text when url is set, afterwards should not autogen.
  setDisplayInputText(ANCHOR_TEXT);
  setUrlInputText(ANCHOR_MAILTO);
  assertNotEquals(
      'Display text should not have been autogenerated', ANCHOR_MAILTO,
      getDisplayInputText());
  assertEquals(
      'Display text should have remained the same', ANCHOR_TEXT,
      getDisplayInputText());

  // Simulate typing text equal to existing url, afterwards should not
  // autogen.
  setDisplayInputText(ANCHOR_MAILTO);
  setUrlInputText(ANCHOR_URL);
  assertEquals(
      'Display text should not have been autogenerated', ANCHOR_MAILTO,
      getDisplayInputText());

  mockCtrl.$verifyAll();
}


/**
 * Tests that clicking OK with the url tab selected dispatches an event with
 * the proper link data.
 */
function testOkForUrl() {
  expectOk(ANCHOR_TEXT, ANCHOR_URL);
  mockCtrl.$replayAll();
  setUpAnchor('', '', true);
  createAndShow();

  dialog.tabPane_.setSelectedTabId(goog.ui.editor.LinkDialog.Id_.ON_WEB_TAB);
  setDisplayInputText(ANCHOR_TEXT);
  setUrlInputText(ANCHOR_URL);
  goog.testing.events.fireClickSequence(dialog.getOkButtonElement());

  mockCtrl.$verifyAll();
}


/**
 * Tests that clicking OK with the url tab selected but with an email address
 * in the url field dispatches an event with the proper link data.
 */
function testOkForUrlWithEmail() {
  expectOk(ANCHOR_TEXT, ANCHOR_MAILTO);
  mockCtrl.$replayAll();
  setUpAnchor('', '', true);
  createAndShow();

  dialog.tabPane_.setSelectedTabId(goog.ui.editor.LinkDialog.Id_.ON_WEB_TAB);
  setDisplayInputText(ANCHOR_TEXT);
  setUrlInputText(ANCHOR_EMAIL);
  goog.testing.events.fireClickSequence(dialog.getOkButtonElement());

  mockCtrl.$verifyAll();
}


/**
 * Tests that clicking OK with the email tab selected dispatches an event with
 * the proper link data.
 */
function testOkForEmail() {
  expectOk(ANCHOR_TEXT, ANCHOR_MAILTO);
  mockCtrl.$replayAll();
  setUpAnchor('', '', true);
  createAndShow();

  dialog.tabPane_.setSelectedTabId(
      goog.ui.editor.LinkDialog.Id_.EMAIL_ADDRESS_TAB);

  setDisplayInputText(ANCHOR_TEXT);
  setEmailInputText(ANCHOR_EMAIL);
  goog.testing.events.fireClickSequence(dialog.getOkButtonElement());

  mockCtrl.$verifyAll();
}

function testOpenLinkInNewWindowNewLink() {
  expectOk(ANCHOR_TEXT, ANCHOR_URL, true);
  expectOk(ANCHOR_TEXT, ANCHOR_URL, false);
  mockCtrl.$replayAll();

  setUpAnchor('', '', true);
  createAndShow(undefined, true);
  dialog.tabPane_.setSelectedTabId(goog.ui.editor.LinkDialog.Id_.ON_WEB_TAB);
  setDisplayInputText(ANCHOR_TEXT);
  setUrlInputText(ANCHOR_URL);

  assertFalse(
      '"Open in new window" should start unchecked',
      getOpenInNewWindowCheckboxChecked());
  setOpenInNewWindowCheckboxChecked(true);
  assertTrue(
      '"Open in new window" should have gotten checked',
      getOpenInNewWindowCheckboxChecked());
  goog.testing.events.fireClickSequence(dialog.getOkButtonElement());

  // Reopen same dialog
  dialog.show();
  dialog.tabPane_.setSelectedTabId(goog.ui.editor.LinkDialog.Id_.ON_WEB_TAB);
  setDisplayInputText(ANCHOR_TEXT);
  setUrlInputText(ANCHOR_URL);

  assertTrue(
      '"Open in new window" should remember it was checked',
      getOpenInNewWindowCheckboxChecked());
  setOpenInNewWindowCheckboxChecked(false);
  assertFalse(
      '"Open in new window" should have gotten unchecked',
      getOpenInNewWindowCheckboxChecked());
  goog.testing.events.fireClickSequence(dialog.getOkButtonElement());
}

function testOpenLinkInNewWindowExistingLink() {
  mockCtrl.$replayAll();

  // Edit an existing link that already opens in a new window.
  setUpAnchor('', '', false, '_blank');
  createAndShow(undefined, true);
  dialog.tabPane_.setSelectedTabId(goog.ui.editor.LinkDialog.Id_.ON_WEB_TAB);
  setDisplayInputText(ANCHOR_TEXT);
  setUrlInputText(ANCHOR_URL);

  assertTrue(
      '"Open in new window" should start checked for existing link',
      getOpenInNewWindowCheckboxChecked());

  mockCtrl.$verifyAll();
}

function testRelNoFollowNewLink() {
  expectOk(ANCHOR_TEXT, ANCHOR_URL, null, true);
  expectOk(ANCHOR_TEXT, ANCHOR_URL, null, false);
  mockCtrl.$replayAll();

  setUpAnchor('', '', true, true);
  createAndShow(null, null, true);
  dialog.tabPane_.setSelectedTabId(goog.ui.editor.LinkDialog.Id_.ON_WEB_TAB);
  setDisplayInputText(ANCHOR_TEXT);
  setUrlInputText(ANCHOR_URL);
  assertFalse(
      'rel=nofollow should start unchecked',
      dialog.relNoFollowCheckbox_.checked);

  // Check rel=nofollow and close the dialog.
  dialog.relNoFollowCheckbox_.checked = true;
  goog.testing.events.fireClickSequence(dialog.getOkButtonElement());

  // Reopen the same dialog.
  anchorElem.rel = 'foo nofollow bar';
  dialog.show();
  dialog.tabPane_.setSelectedTabId(goog.ui.editor.LinkDialog.Id_.ON_WEB_TAB);
  setDisplayInputText(ANCHOR_TEXT);
  setUrlInputText(ANCHOR_URL);
  assertTrue(
      'rel=nofollow should start checked when reopening the dialog',
      dialog.relNoFollowCheckbox_.checked);
}

function testRelNoFollowExistingLink() {
  mockCtrl.$replayAll();

  setUpAnchor('', '', null, null, 'foo nofollow bar');
  createAndShow(null, null, true);
  assertTrue(
      'rel=nofollow should start checked for existing link',
      dialog.relNoFollowCheckbox_.checked);

  mockCtrl.$verifyAll();
}


/**
 * Test that clicking on the test button opens a new window with the correct
 * options.
 */
function testWebTestButton() {
  if (goog.userAgent.GECKO) {
    // TODO(robbyw): Figure out why this is flaky and fix it.
    return;
  }

  var width, height;
  mockWindowOpen(
      ANCHOR_URL, '_blank',
      new goog.testing.mockmatchers.ArgumentMatcher(function(str) {
        return str ==
            'width=' + width + ',height=' + height +
            ',toolbar=1,scrollbars=1,location=1,statusbar=0,' +
            'menubar=1,resizable=1';
      }, '3rd arg: (string) window.open() options'));

  mockCtrl.$replayAll();
  setUpAnchor(ANCHOR_URL, ANCHOR_TEXT);
  createAndShow();

  // Measure viewport after opening dialog because that might cause scrollbars
  // to appear and reduce the viewport size.
  var size = goog.dom.getViewportSize(window);
  width = Math.max(size.width - 50, 50);
  height = Math.max(size.height - 50, 50);

  var testLink = goog.testing.dom.findTextNode(
      goog.ui.editor.messages.MSG_TEST_THIS_LINK,
      dialog.dialogInternal_.getElement());
  goog.testing.events.fireClickSequence(testLink.parentNode);

  mockCtrl.$verifyAll();
}


/**
 * Test that clicking on the test button does not open a new window when
 * the event is canceled.
 */
function testWebTestButtonPreventDefault() {
  mockCtrl.$replayAll();
  setUpAnchor(ANCHOR_URL, ANCHOR_TEXT);
  createAndShow();

  goog.events.listen(
      dialog, goog.ui.editor.LinkDialog.EventType.BEFORE_TEST_LINK,
      function(e) {
        assertEquals(e.url, ANCHOR_URL);
        e.preventDefault();
      });
  var testLink = goog.testing.dom.findTextNode(
      goog.ui.editor.messages.MSG_TEST_THIS_LINK,
      dialog.dialogInternal_.getElement());
  goog.testing.events.fireClickSequence(testLink.parentNode);

  mockCtrl.$verifyAll();
}


/**
 * Test that the setTextToDisplayVisible() correctly works.
 * options.
 */
function testSetTextToDisplayVisible() {
  mockCtrl.$replayAll();
  setUpAnchor('', '', true);
  createAndShow();

  assertNotEquals(
      'none', goog.style.getStyle(dialog.textToDisplayDiv_, 'display'));
  dialog.setTextToDisplayVisible(false);
  assertEquals(
      'none', goog.style.getStyle(dialog.textToDisplayDiv_, 'display'));
  dialog.setTextToDisplayVisible(true);
  assertNotEquals(
      'none', goog.style.getStyle(dialog.textToDisplayDiv_, 'display'));

  mockCtrl.$verifyAll();
}

function getDisplayInput() {
  return dialog.dom.getElement(goog.ui.editor.LinkDialog.Id_.TEXT_TO_DISPLAY);
}

function getDisplayInputText() {
  return getDisplayInput().value;
}

function setDisplayInputText(text) {
  var textInput = getDisplayInput();
  textInput.value = text;
  // Fire event so that dialog behaves like when user types.
  fireInputEvent(textInput, goog.events.KeyCodes.M);
}

function getUrlInput() {
  var elt = dialog.dom.getElement(goog.ui.editor.LinkDialog.Id_.ON_WEB_INPUT);
  assertNotNullNorUndefined('UrlInput must be found', elt);
  return elt;
}

function getUrlInputText() {
  return getUrlInput().value;
}

function setUrlInputText(text) {
  var urlInput = getUrlInput();
  urlInput.value = text;
  // Fire event so that dialog behaves like when user types.
  fireInputEvent(dialog.urlInputHandler_, goog.events.KeyCodes.M);
}

function getEmailInput() {
  var elt =
      dialog.dom.getElement(goog.ui.editor.LinkDialog.Id_.EMAIL_ADDRESS_INPUT);
  assertNotNullNorUndefined('EmailInput must be found', elt);
  return elt;
}

function getEmailInputText() {
  return getEmailInput().value;
}

function setEmailInputText(text) {
  var emailInput = getEmailInput();
  emailInput.value = text;
  // Fire event so that dialog behaves like when user types.
  fireInputEvent(dialog.emailInputHandler_, goog.events.KeyCodes.M);
}

function getOpenInNewWindowCheckboxChecked() {
  return dialog.openInNewWindowCheckbox_.checked;
}

function setOpenInNewWindowCheckboxChecked(checked) {
  dialog.openInNewWindowCheckbox_.checked = checked;
}

function fireInputEvent(input, keyCode) {
  var inputEvent =
      new goog.testing.events.Event(goog.events.EventType.INPUT, input);
  inputEvent.keyCode = keyCode;
  inputEvent.charCode = keyCode;
  goog.testing.events.fireBrowserEvent(inputEvent);
}
