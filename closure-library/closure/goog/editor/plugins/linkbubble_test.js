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

goog.provide('goog.editor.plugins.LinkBubbleTest');
goog.setTestOnly('goog.editor.plugins.LinkBubbleTest');

goog.require('goog.dom');
goog.require('goog.dom.Range');
goog.require('goog.dom.TagName');
goog.require('goog.editor.Command');
goog.require('goog.editor.Link');
goog.require('goog.editor.plugins.LinkBubble');
goog.require('goog.events.BrowserEvent');
goog.require('goog.events.Event');
goog.require('goog.events.EventType');
goog.require('goog.string');
goog.require('goog.style');
goog.require('goog.testing.FunctionMock');
goog.require('goog.testing.PropertyReplacer');
goog.require('goog.testing.editor.FieldMock');
goog.require('goog.testing.editor.TestHelper');
goog.require('goog.testing.events');
goog.require('goog.testing.jsunit');
goog.require('goog.userAgent');

var fieldDiv;
var FIELDMOCK;
var linkBubble;
var link;
var mockWindowOpen;
var stubs;
var testHelper;

function setUpPage() {
  fieldDiv = goog.dom.$('field');
  stubs = new goog.testing.PropertyReplacer();
  testHelper = new goog.testing.editor.TestHelper(goog.dom.getElement('field'));
}

function setUp() {
  testHelper.setUpEditableElement();
  FIELDMOCK = new goog.testing.editor.FieldMock();

  linkBubble = new goog.editor.plugins.LinkBubble();
  linkBubble.fieldObject = FIELDMOCK;

  link = fieldDiv.firstChild;

  mockWindowOpen = new goog.testing.FunctionMock('open');
  stubs.set(window, 'open', mockWindowOpen);
}

function tearDown() {
  linkBubble.closeBubble();
  testHelper.tearDownEditableElement();
  stubs.reset();
}

function testLinkSelected() {
  FIELDMOCK.$replay();
  linkBubble.enable(FIELDMOCK);
  goog.dom.Range.createFromNodeContents(link).select();
  linkBubble.handleSelectionChange();
  assertBubble();
  FIELDMOCK.$verify();
}

function testLinkClicked() {
  FIELDMOCK.$replay();
  linkBubble.enable(FIELDMOCK);
  linkBubble.handleSelectionChange(createMouseEvent(link));
  assertBubble();
  FIELDMOCK.$verify();
}

function testImageLink() {
  FIELDMOCK.$replay();
  linkBubble.enable(FIELDMOCK);
  link.setAttribute('imageanchor', 1);
  linkBubble.handleSelectionChange(createMouseEvent(link));
  assertBubble();
  FIELDMOCK.$verify();
}

function closeBox() {
  var closeBox = goog.dom.getElementsByTagNameAndClass(goog.dom.TagName.DIV,
      'tr_bubble_closebox');
  assertEquals('Should find only one close box', 1, closeBox.length);
  assertNotNull('Found close box', closeBox[0]);
  goog.testing.events.fireClickSequence(closeBox[0]);
}

function testCloseBox() {
  testLinkClicked();
  closeBox();
  assertNoBubble();
  FIELDMOCK.$verify();
}

function testChangeClicked() {
  FIELDMOCK.execCommand(goog.editor.Command.MODAL_LINK_EDITOR,
      new goog.editor.Link(link, false));
  FIELDMOCK.$registerArgumentListVerifier('execCommand', function(arr1, arr2) {
    return arr1.length == arr2.length &&
           arr1.length == 2 &&
           arr1[0] == goog.editor.Command.MODAL_LINK_EDITOR &&
           arr2[0] == goog.editor.Command.MODAL_LINK_EDITOR &&
           arr1[1] instanceof goog.editor.Link &&
           arr2[1] instanceof goog.editor.Link;
  });
  FIELDMOCK.$times(1);
  FIELDMOCK.$returns(true);
  FIELDMOCK.$replay();
  linkBubble.enable(FIELDMOCK);

  linkBubble.handleSelectionChange(createMouseEvent(link));
  assertBubble();

  goog.testing.events.fireClickSequence(
      goog.dom.$(goog.editor.plugins.LinkBubble.CHANGE_LINK_ID_));
  assertNoBubble();
  FIELDMOCK.$verify();
}

function testDeleteClicked() {
  FIELDMOCK.dispatchBeforeChange();
  FIELDMOCK.$times(1);
  FIELDMOCK.dispatchChange();
  FIELDMOCK.$times(1);
  FIELDMOCK.focus();
  FIELDMOCK.$times(1);
  FIELDMOCK.$replay();

  linkBubble.enable(FIELDMOCK);

  linkBubble.handleSelectionChange(createMouseEvent(link));
  assertBubble();

  goog.testing.events.fireClickSequence(
      goog.dom.$(goog.editor.plugins.LinkBubble.DELETE_LINK_ID_));
  var element = goog.userAgent.GECKO ? document.body : fieldDiv;
  assertNotEquals('Link removed', element.firstChild.nodeName,
      goog.dom.TagName.A);
  assertNoBubble();
  FIELDMOCK.$verify();
}

function testActionClicked() {
  var SPAN = 'actionSpanId';
  var LINK = 'actionLinkId';
  var toShowCount = 0;
  var actionCount = 0;

  var linkAction = new goog.editor.plugins.LinkBubble.Action(
      SPAN, LINK, 'message',
      function() {
        toShowCount++;
        return toShowCount == 1; // Show it the first time.
      },
      function() {
        actionCount++;
      });

  linkBubble = new goog.editor.plugins.LinkBubble(linkAction);
  linkBubble.fieldObject = FIELDMOCK;
  FIELDMOCK.$replay();
  linkBubble.enable(FIELDMOCK);

  // The first time the bubble is shown, show our custom action.
  linkBubble.handleSelectionChange(createMouseEvent(link));
  assertBubble();
  assertEquals('Should check showing the action', 1, toShowCount);
  assertEquals('Action should not have fired yet', 0, actionCount);

  assertTrue('Action should be visible 1st time', goog.style.isElementShown(
      goog.dom.$(SPAN)));
  goog.testing.events.fireClickSequence(goog.dom.$(LINK));

  assertEquals('Should not check showing again yet', 1, toShowCount);
  assertEquals('Action should be fired', 1, actionCount);

  closeBox();
  assertNoBubble();

  // The action won't be shown the second time around.
  linkBubble.handleSelectionChange(createMouseEvent(link));
  assertBubble();
  assertEquals('Should check showing again', 2, toShowCount);
  assertEquals('Action should not fire again', 1, actionCount);
  assertFalse('Action should not be shown 2nd time', goog.style.isElementShown(
      goog.dom.$(SPAN)));

  FIELDMOCK.$verify();
}

function testLinkTextClicked() {
  mockWindowOpen('http://www.google.com/', '_blank', '');
  mockWindowOpen.$replay();
  FIELDMOCK.$replay();
  linkBubble.enable(FIELDMOCK);

  linkBubble.handleSelectionChange(createMouseEvent(link));
  assertBubble();

  goog.testing.events.fireClickSequence(
      goog.dom.$(goog.editor.plugins.LinkBubble.TEST_LINK_ID_));

  assertBubble();
  mockWindowOpen.$verify();
  FIELDMOCK.$verify();
}

function testLinkTextClickedCustomUrlFn() {
  mockWindowOpen('http://images.google.com/', '_blank', '');
  mockWindowOpen.$replay();
  FIELDMOCK.$replay();
  linkBubble.enable(FIELDMOCK);

  linkBubble.setTestLinkUrlFn(function(url) {
    return url.replace('www', 'images');
  });

  linkBubble.handleSelectionChange(createMouseEvent(link));
  assertBubble();

  goog.testing.events.fireClickSequence(
      goog.dom.$(goog.editor.plugins.LinkBubble.TEST_LINK_ID_));

  assertBubble();
  mockWindowOpen.$verify();
  FIELDMOCK.$verify();
}


/**
 * Urls with invalid schemes shouldn't be linkified.
 * @bug 2585360
 */
function testDontLinkifyInvalidScheme() {
  mockWindowOpen.$replay();
  FIELDMOCK.$replay();
  linkBubble.enable(FIELDMOCK);

  var badLink = document.createElement(goog.dom.TagName.A);
  badLink.href = 'javascript:alert(1)';
  badLink.innerHTML = 'bad link';

  linkBubble.handleSelectionChange(createMouseEvent(badLink));
  assertBubble();

  // The link shouldn't exist at all
  assertNull(goog.dom.$(goog.editor.plugins.LinkBubble.TEST_LINK_ID_));

  assertBubble();
  mockWindowOpen.$verify();
  FIELDMOCK.$verify();
}

function testIsSafeSchemeToOpen() {
  // Urls with no scheme at all are ok too since 'http://' will be prepended.
  var good = [
    'http://google.com', 'http://google.com/', 'https://google.com',
    'null@google.com', 'http://www.google.com', 'http://site.com',
    'google.com', 'google', 'http://google', 'HTTP://GOOGLE.COM',
    'HtTp://www.google.com'
  ];

  var bad = [
    'javascript:google.com', 'httpp://google.com', 'data:foo',
    'javascript:alert(\'hi\');', 'abc:def'
  ];

  for (var i = 0; i < good.length; i++) {
    assertTrue(good[i] + ' should have a safe scheme',
        linkBubble.isSafeSchemeToOpen_(good[i]));
  }

  for (i = 0; i < bad.length; i++) {
    assertFalse(bad[i] + ' should have an unsafe scheme',
        linkBubble.isSafeSchemeToOpen_(bad[i]));
  }
}

function testShouldOpenWithWhitelist() {
  linkBubble.setSafeToOpenSchemes(['abc']);

  assertTrue('Scheme should be safe',
      linkBubble.shouldOpenUrl('abc://google.com'));
  assertFalse('Scheme should be unsafe',
              linkBubble.shouldOpenUrl('http://google.com'));

  linkBubble.setBlockOpeningUnsafeSchemes(false);
  assertTrue('Non-whitelisted should now be safe after disabling blocking',
      linkBubble.shouldOpenUrl('http://google.com'));
}


/**
 * @bug 763211
 * @bug 2182147
 */
function testLongUrlTestLinkAnchorTextCorrect() {
  FIELDMOCK.$replay();
  linkBubble.enable(FIELDMOCK);

  var longUrl = 'http://www.reallylonglinkthatshouldbetruncated' +
      'becauseitistoolong.com';
  var truncatedLongUrl = goog.string.truncateMiddle(longUrl, 48);

  var longLink = document.createElement(goog.dom.TagName.A);
  longLink.href = longUrl;
  longLink.innerHTML = 'Google';
  fieldDiv.appendChild(longLink);

  linkBubble.handleSelectionChange(createMouseEvent(longLink));
  assertBubble();

  var testLinkEl = goog.dom.$(goog.editor.plugins.LinkBubble.TEST_LINK_ID_);
  assertEquals(
      'The test link\'s anchor text should be the truncated URL.',
      truncatedLongUrl,
      testLinkEl.innerHTML);

  fieldDiv.removeChild(longLink);
  FIELDMOCK.$verify();
}


/**
 * @bug 2416024
 */
function testOverridingCreateBubbleContentsDoesntNpeGetTargetUrl() {
  FIELDMOCK.$replay();
  linkBubble.enable(FIELDMOCK);

  stubs.set(linkBubble, 'createBubbleContents',
      function(elem) {
        // getTargetUrl would cause an NPE if urlUtil_ wasn't defined yet.
        linkBubble.getTargetUrl();
      });
  assertNotThrows('Accessing this.urlUtil_ should not NPE',
                  goog.bind(linkBubble.handleSelectionChange,
                            linkBubble, createMouseEvent(link)));

  FIELDMOCK.$verify();
}


/**
 * @bug 15379294
 */
function testUpdateLinkCommandDoesNotTriggerAnException() {
  FIELDMOCK.$replay();
  linkBubble.enable(FIELDMOCK);

  // At this point, the bubble was not created yet using its createBubble
  // public method.
  assertNotThrows(
      'Executing goog.editor.Command.UPDATE_LINK_BUBBLE should not trigger ' +
      'an exception even if the bubble was not created yet using its ' +
      'createBubble method.',
      goog.bind(linkBubble.execCommandInternal, linkBubble,
                goog.editor.Command.UPDATE_LINK_BUBBLE));

  FIELDMOCK.$verify();
}

function assertBubble() {
  assertTrue('Link bubble visible', linkBubble.isVisible());
  assertNotNull('Link bubble created',
      goog.dom.$(goog.editor.plugins.LinkBubble.LINK_DIV_ID_));
}

function assertNoBubble() {
  assertFalse('Link bubble not visible', linkBubble.isVisible());
  assertNull('Link bubble not created',
      goog.dom.$(goog.editor.plugins.LinkBubble.LINK_DIV_ID_));
}

function createMouseEvent(target) {
  var eventObj = new goog.events.Event(goog.events.EventType.MOUSEUP, target);
  eventObj.button = goog.events.BrowserEvent.MouseButton.LEFT;

  return new goog.events.BrowserEvent(eventObj, target);
}
