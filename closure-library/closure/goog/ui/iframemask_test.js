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

goog.provide('goog.ui.IframeMaskTest');
goog.setTestOnly('goog.ui.IframeMaskTest');

goog.require('goog.dom');
goog.require('goog.dom.TagName');
goog.require('goog.dom.iframe');
goog.require('goog.structs.Pool');
goog.require('goog.style');
goog.require('goog.testing.MockClock');
goog.require('goog.testing.StrictMock');
goog.require('goog.testing.jsunit');
goog.require('goog.ui.IframeMask');
goog.require('goog.ui.Popup');
goog.require('goog.ui.PopupBase');
goog.require('goog.userAgent');

var iframeMask;
var mockClock;

function setUp() {
  goog.dom.getElement('sandbox').innerHTML = '<div id="popup"></div>';
  mockClock = new goog.testing.MockClock(true);

  iframeMask = new goog.ui.IframeMask();
}

function tearDown() {
  iframeMask.dispose();
  mockClock.dispose();

  assertNoIframes();
}

function findOneAndOnlyIframe() {
  var iframes = document.getElementsByTagName(goog.dom.TagName.IFRAME);
  assertEquals('There should be exactly 1 iframe in the document',
      1, iframes.length);
  return iframes[0];
}

function assertNoIframes() {
  assertEquals('Expected no iframes in the document', 0,
      goog.dom.getElementsByTagNameAndClass(goog.dom.TagName.IFRAME).length);
}

function testApplyFullScreenMask() {
  iframeMask.applyMask();

  var iframe = findOneAndOnlyIframe();
  assertEquals('block', iframe.style.display);
  assertEquals('absolute', iframe.style.position);

  // coerce zindex to a string
  assertEquals('1', iframe.style.zIndex + '');

  iframeMask.hideMask();
  assertEquals('none', iframe.style.display);
}

function testApplyOpacity() {
  iframeMask.setOpacity(0.3);
  iframeMask.applyMask();

  if (goog.userAgent.IE && !goog.userAgent.isDocumentModeOrHigher(9)) {
    assertContains('Expected opactity to be set in the CSS style',
        '30', findOneAndOnlyIframe().style.cssText);
  } else {
    assertContains('Expected opactity to be set in the CSS style',
        '0.3', findOneAndOnlyIframe().style.cssText);
  }
}

function testApplyZIndex() {
  iframeMask.setZIndex(5);
  iframeMask.applyMask();

  // coerce zindex to a string
  assertEquals('5', findOneAndOnlyIframe().style.zIndex + '');
}

function testSnapElement() {
  iframeMask.setSnapElement(goog.dom.getElement('popup'));
  iframeMask.applyMask();

  var iframe = findOneAndOnlyIframe();
  var bounds = goog.style.getBounds(iframe);
  assertEquals(100, bounds.left);
  assertEquals(900, bounds.top);
  assertEquals(300, bounds.width);
  assertEquals(400, bounds.height);

  iframeMask.setSnapElement(document.documentElement);

  // Make sure that snapping to a different element changes the bounds.
  assertNotEquals('Snap element not updated',
      400, goog.style.getBounds(iframe).height);
}

function testAttachToPopup() {
  var popup = new goog.ui.Popup(goog.dom.getElement('popup'));
  iframeMask.listenOnTarget(popup, goog.ui.PopupBase.EventType.SHOW,
      goog.ui.PopupBase.EventType.HIDE, goog.dom.getElement('popup'));

  assertNoIframes();
  popup.setVisible(true);
  assertNoIframes();

  // Tick because the showing of the iframe mask happens asynchronously.
  // (Otherwise the handling of the mousedown can take so long that a bounce
  // occurs).
  mockClock.tick(1);

  var iframe = findOneAndOnlyIframe();
  var bounds = goog.style.getBounds(iframe);
  assertEquals(300, bounds.width);
  assertEquals(400, bounds.height);
  assertEquals('block', iframe.style.display);

  popup.setVisible(false);
  assertEquals('none', iframe.style.display);
}

function testQuickHidingPopup() {
  var popup = new goog.ui.Popup(goog.dom.getElement('popup'));
  iframeMask.listenOnTarget(popup, goog.ui.PopupBase.EventType.SHOW,
      goog.ui.PopupBase.EventType.HIDE);

  assertNoIframes();
  popup.setVisible(true);
  assertNoIframes();
  popup.setVisible(false);
  assertNoIframes();

  // Tick because the showing of the iframe mask happens asynchronously.
  // (Otherwise the handling of the mousedown can take so long that a bounce
  // occurs).
  mockClock.tick(1);
  assertNoIframes();
}

function testRemoveHandlers() {
  var popup = new goog.ui.Popup(goog.dom.getElement('popup'));
  iframeMask.listenOnTarget(popup, goog.ui.PopupBase.EventType.SHOW,
      goog.ui.PopupBase.EventType.HIDE);
  iframeMask.removeHandlers();
  popup.setVisible(true);

  // Tick because the showing of the iframe mask happens asynchronously.
  // (Otherwise the handling of the mousedown can take so long that a bounce
  // occurs).
  mockClock.tick(1);
  assertNoIframes();
}

function testIframePool() {
  var iframe = goog.dom.iframe.createBlank(goog.dom.getDomHelper());
  var mockPool = new goog.testing.StrictMock(goog.structs.Pool);
  mockPool.getObject();
  mockPool.$returns(iframe);

  mockPool.$replay();

  iframeMask.dispose();

  // Create a new iframe mask with a pool, and verify that it checks
  // its iframe out of the pool instead of creating one.
  iframeMask = new goog.ui.IframeMask(null, mockPool);
  iframeMask.applyMask();
  mockPool.$verify();
  findOneAndOnlyIframe();

  mockPool.$reset();

  mockPool.releaseObject(iframe);
  mockPool.$replay();

  // When the iframe mask has a pool, the pool is responsible for
  // removing the iframe from the DOM.
  iframeMask.hideMask();
  mockPool.$verify();
  findOneAndOnlyIframe();

  // And showing the iframe again should check it out of the pool again.
  mockPool.$reset();
  mockPool.getObject();
  mockPool.$returns(iframe);
  mockPool.$replay();

  iframeMask.applyMask();
  mockPool.$verify();

  // When the test is over, the iframe mask should be disposed. Make sure
  // that the pool removes the iframe from the page.
  mockPool.$reset();
  mockPool.releaseObject(iframe);
  mockPool.$does(function() {
    goog.dom.removeNode(iframe);
  });
  mockPool.$replay();
}
