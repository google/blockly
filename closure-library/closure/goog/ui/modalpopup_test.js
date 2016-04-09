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

goog.provide('goog.ui.ModalPopupTest');
goog.setTestOnly('goog.ui.ModalPopupTest');

goog.require('goog.a11y.aria');
goog.require('goog.a11y.aria.State');
goog.require('goog.dispose');
goog.require('goog.dom');
goog.require('goog.dom.TagName');
goog.require('goog.events');
goog.require('goog.events.EventTarget');
goog.require('goog.fx.Transition');
goog.require('goog.fx.css3');
goog.require('goog.string');
goog.require('goog.style');
goog.require('goog.testing.MockClock');
goog.require('goog.testing.jsunit');
goog.require('goog.ui.ModalPopup');
goog.require('goog.ui.PopupBase');

var popup;
var main;
var mockClock;


function setUp() {
  main = /** @type {!Element}*/ (goog.dom.getElement('main'));
  mockClock = new goog.testing.MockClock(true);
}


function tearDown() {
  goog.dispose(popup);
  mockClock.dispose();
  goog.a11y.aria.removeState(main, goog.a11y.aria.State.HIDDEN);
}


function testDispose() {
  popup = new goog.ui.ModalPopup();
  popup.render();

  goog.dispose(popup);
  assertNull(goog.dom.getElementByClass('goog-modalpopup-bg'));
  assertNull(goog.dom.getElementByClass('goog-modalpopup'));
  assertEquals(
      0, goog.dom.getElementsByTagNameAndClass(goog.dom.TagName.SPAN).length);
}


function testRenderWithoutIframeMask() {
  popup = new goog.ui.ModalPopup();
  popup.render();

  assertEquals(
      0, goog.dom
             .getElementsByTagNameAndClass(
                 goog.dom.TagName.IFRAME, 'goog-modalpopup-bg')
             .length);

  var bg = goog.dom.getElementsByTagNameAndClass(
      goog.dom.TagName.DIV, 'goog-modalpopup-bg');
  assertEquals(1, bg.length);
  var content = goog.dom.getElementByClass('goog-modalpopup');
  assertNotNull(content);
  var tabCatcher = goog.dom.getElementsByTagNameAndClass(goog.dom.TagName.SPAN);
  assertEquals(1, tabCatcher.length);

  assertTrue(goog.dom.compareNodeOrder(bg[0], content) < 0);
  assertTrue(goog.dom.compareNodeOrder(content, tabCatcher[0]) < 0);
  assertTrue(
      goog.string.isEmptyOrWhitespace(
          goog.string.makeSafe(
              goog.a11y.aria.getState(main, goog.a11y.aria.State.HIDDEN))));
  popup.setVisible(true);
  assertTrue(
      goog.string.isEmptyOrWhitespace(
          goog.string.makeSafe(
              goog.a11y.aria.getState(
                  popup.getElementStrict(), goog.a11y.aria.State.HIDDEN))));
  assertEquals(
      'true', goog.a11y.aria.getState(main, goog.a11y.aria.State.HIDDEN));
  popup.setVisible(false);
  assertTrue(
      goog.string.isEmptyOrWhitespace(
          goog.string.makeSafe(
              goog.a11y.aria.getState(main, goog.a11y.aria.State.HIDDEN))));
}


function testRenderWithIframeMask() {
  popup = new goog.ui.ModalPopup(true);
  popup.render();

  var iframe = goog.dom.getElementsByTagNameAndClass(
      goog.dom.TagName.IFRAME, 'goog-modalpopup-bg');
  assertEquals(1, iframe.length);
  var bg = goog.dom.getElementsByTagNameAndClass(
      goog.dom.TagName.DIV, 'goog-modalpopup-bg');
  assertEquals(1, bg.length);
  var content = goog.dom.getElementByClass('goog-modalpopup');
  assertNotNull(content);
  var tabCatcher = goog.dom.getElementsByTagNameAndClass(goog.dom.TagName.SPAN);
  assertEquals(1, tabCatcher.length);

  assertTrue(goog.dom.compareNodeOrder(iframe[0], bg[0]) < 0);
  assertTrue(goog.dom.compareNodeOrder(bg[0], content) < 0);
  assertTrue(goog.dom.compareNodeOrder(content, tabCatcher[0]) < 0);
  assertTrue(
      goog.string.isEmptyOrWhitespace(
          goog.string.makeSafe(
              goog.a11y.aria.getState(main, goog.a11y.aria.State.HIDDEN))));
  popup.setVisible(true);
  assertTrue(
      goog.string.isEmptyOrWhitespace(
          goog.string.makeSafe(
              goog.a11y.aria.getState(
                  popup.getElementStrict(), goog.a11y.aria.State.HIDDEN))));
  assertEquals(
      'true', goog.a11y.aria.getState(main, goog.a11y.aria.State.HIDDEN));
  popup.setVisible(false);
  assertTrue(
      goog.string.isEmptyOrWhitespace(
          goog.string.makeSafe(
              goog.a11y.aria.getState(main, goog.a11y.aria.State.HIDDEN))));
}


function testRenderWithAriaState() {
  popup = new goog.ui.ModalPopup();
  popup.render();

  goog.a11y.aria.setState(main, goog.a11y.aria.State.HIDDEN, true);
  popup.setVisible(true);
  assertEquals(
      'true', goog.a11y.aria.getState(main, goog.a11y.aria.State.HIDDEN));
  popup.setVisible(false);
  assertEquals(
      'true', goog.a11y.aria.getState(main, goog.a11y.aria.State.HIDDEN));

  goog.a11y.aria.setState(main, goog.a11y.aria.State.HIDDEN, false);
  popup.setVisible(true);
  assertEquals(
      'false', goog.a11y.aria.getState(main, goog.a11y.aria.State.HIDDEN));
  popup.setVisible(false);
  assertEquals(
      'false', goog.a11y.aria.getState(main, goog.a11y.aria.State.HIDDEN));
}


function testRenderDoesNotShowAnyElement() {
  popup = new goog.ui.ModalPopup(true);
  popup.render();

  var iframe = goog.dom.getElementsByTagNameAndClass(
      goog.dom.TagName.IFRAME, 'goog-modalpopup-bg');
  assertFalse(goog.style.isElementShown(iframe[0]));
  var bg = goog.dom.getElementsByTagNameAndClass(
      goog.dom.TagName.DIV, 'goog-modalpopup-bg');
  assertFalse(goog.style.isElementShown(bg[0]));
  assertFalse(
      goog.style.isElementShown(goog.dom.getElementByClass('goog-modalpopup')));
  var tabCatcher = goog.dom.getElementsByTagNameAndClass(goog.dom.TagName.SPAN);
  assertFalse(goog.style.isElementShown(tabCatcher[0]));
}


function testIframeOpacityIsSetToZero() {
  popup = new goog.ui.ModalPopup(true);
  popup.render();

  var iframe = goog.dom.getElementsByTagNameAndClass(
      goog.dom.TagName.IFRAME, 'goog-modalpopup-bg')[0];
  assertEquals(0, goog.style.getOpacity(iframe));
}


function testEventFiredOnShow() {
  popup = new goog.ui.ModalPopup(true);
  popup.render();

  var beforeShowCallCount = 0;
  var beforeShowHandler = function() { beforeShowCallCount++; };
  var showCallCount = false;
  var showHandler = function() {
    assertEquals(
        'BEFORE_SHOW is not dispatched before SHOW', 1, beforeShowCallCount);
    showCallCount++;
  };

  goog.events.listen(
      popup, goog.ui.PopupBase.EventType.BEFORE_SHOW, beforeShowHandler);
  goog.events.listen(popup, goog.ui.PopupBase.EventType.SHOW, showHandler);

  popup.setVisible(true);

  assertEquals(1, beforeShowCallCount);
  assertEquals(1, showCallCount);
}


function testEventFiredOnHide() {
  popup = new goog.ui.ModalPopup(true);
  popup.render();
  popup.setVisible(true);

  var beforeHideCallCount = 0;
  var beforeHideHandler = function() { beforeHideCallCount++; };
  var hideCallCount = false;
  var hideHandler = function() {
    assertEquals(
        'BEFORE_HIDE is not dispatched before HIDE', 1, beforeHideCallCount);
    hideCallCount++;
  };

  goog.events.listen(
      popup, goog.ui.PopupBase.EventType.BEFORE_HIDE, beforeHideHandler);
  goog.events.listen(popup, goog.ui.PopupBase.EventType.HIDE, hideHandler);

  popup.setVisible(false);

  assertEquals(1, beforeHideCallCount);
  assertEquals(1, hideCallCount);
}


function testShowEventFiredWithNoTransition() {
  popup = new goog.ui.ModalPopup();
  popup.render();

  var showHandlerCalled = false;
  goog.events.listen(popup, goog.ui.PopupBase.EventType.SHOW, function() {
    showHandlerCalled = true;
  });

  popup.setVisible(true);
  assertTrue(showHandlerCalled);
}

function testHideEventFiredWithNoTransition() {
  popup = new goog.ui.ModalPopup();
  popup.render();

  var hideHandlerCalled = false;
  goog.events.listen(popup, goog.ui.PopupBase.EventType.HIDE, function() {
    hideHandlerCalled = true;
  });

  popup.setVisible(true);
  popup.setVisible(false);
  assertTrue(hideHandlerCalled);
}

function testTransitionsPlayedOnShow() {
  popup = new goog.ui.ModalPopup();
  popup.render();

  var mockPopupShowTransition = new MockTransition();
  var mockPopupHideTransition = new MockTransition();
  var mockBgShowTransition = new MockTransition();
  var mockBgHideTransition = new MockTransition();

  var showHandlerCalled = false;
  goog.events.listen(popup, goog.ui.PopupBase.EventType.SHOW, function() {
    showHandlerCalled = true;
  });

  popup.setTransition(
      mockPopupShowTransition, mockPopupHideTransition, mockBgShowTransition,
      mockBgHideTransition);
  assertFalse(mockPopupShowTransition.wasPlayed);
  assertFalse(mockBgShowTransition.wasPlayed);

  popup.setVisible(true);
  assertTrue(mockPopupShowTransition.wasPlayed);
  assertTrue(mockBgShowTransition.wasPlayed);

  assertFalse(showHandlerCalled);
  mockPopupShowTransition.dispatchEvent(goog.fx.Transition.EventType.END);
  assertTrue(showHandlerCalled);
}


function testTransitionsPlayedOnHide() {
  popup = new goog.ui.ModalPopup();
  popup.render();

  var mockPopupShowTransition = new MockTransition();
  var mockPopupHideTransition = new MockTransition();
  var mockBgShowTransition = new MockTransition();
  var mockBgHideTransition = new MockTransition();

  var hideHandlerCalled = false;
  goog.events.listen(popup, goog.ui.PopupBase.EventType.HIDE, function() {
    hideHandlerCalled = true;
  });

  popup.setTransition(
      mockPopupShowTransition, mockPopupHideTransition, mockBgShowTransition,
      mockBgHideTransition);
  popup.setVisible(true);
  assertFalse(mockPopupHideTransition.wasPlayed);
  assertFalse(mockBgHideTransition.wasPlayed);

  popup.setVisible(false);
  assertTrue(mockPopupHideTransition.wasPlayed);
  assertTrue(mockBgHideTransition.wasPlayed);

  assertFalse(hideHandlerCalled);
  mockPopupHideTransition.dispatchEvent(goog.fx.Transition.EventType.END);
  assertTrue(hideHandlerCalled);
}


function testTransitionsAndDisposingOnHideWorks() {
  popup = new goog.ui.ModalPopup();
  popup.render();

  goog.events.listen(
      popup, goog.ui.PopupBase.EventType.HIDE, function() { popup.dispose(); });

  var popupShowTransition =
      goog.fx.css3.fadeIn(popup.getElement(), 0.1 /* duration */);
  var popupHideTransition =
      goog.fx.css3.fadeOut(popup.getElement(), 0.1 /* duration */);
  var bgShowTransition =
      goog.fx.css3.fadeIn(popup.getElement(), 0.1 /* duration */);
  var bgHideTransition =
      goog.fx.css3.fadeOut(popup.getElement(), 0.1 /* duration */);

  popup.setTransition(
      popupShowTransition, popupHideTransition, bgShowTransition,
      bgHideTransition);
  popup.setVisible(true);
  popup.setVisible(false);
  // Nothing to assert. We only want to ensure that there is no error.
}


function testSetVisibleWorksCorrectlyWithTransitions() {
  popup = new goog.ui.ModalPopup();
  popup.render();
  popup.setTransition(
      goog.fx.css3.fadeIn(popup.getElement(), 1),
      goog.fx.css3.fadeIn(popup.getBackgroundElement(), 1),
      goog.fx.css3.fadeOut(popup.getElement(), 1),
      goog.fx.css3.fadeOut(popup.getBackgroundElement(), 1));

  // Consecutive calls to setVisible works without needing to wait for
  // transition to finish.
  popup.setVisible(true);
  assertTrue(popup.isVisible());
  popup.setVisible(false);
  assertFalse(popup.isVisible());
  mockClock.tick(1100);

  // Calling setVisible(true) immediately changed the state to visible.
  popup.setVisible(true);
  assertTrue(popup.isVisible());
  mockClock.tick(1100);

  // Consecutive calls to setVisible, in opposite order.
  popup.setVisible(false);
  popup.setVisible(true);
  assertTrue(popup.isVisible());
  mockClock.tick(1100);

  // Calling setVisible(false) immediately changed the state to not visible.
  popup.setVisible(false);
  assertFalse(popup.isVisible());
  mockClock.tick(1100);
}


function testTransitionsDisposed() {
  popup = new goog.ui.ModalPopup();
  popup.render();

  var transition = goog.fx.css3.fadeIn(popup.getElement(), 0.1 /* duration */);

  var hideHandlerCalled = false;
  goog.events.listen(popup, goog.ui.PopupBase.EventType.HIDE, function() {
    hideHandlerCalled = true;
  });

  popup.setTransition(transition, transition, transition, transition);
  popup.dispose();

  transition.dispatchEvent(goog.fx.Transition.EventType.END);
  assertFalse(hideHandlerCalled);
}


function testBackgroundHeight() {
  // Insert an absolutely-positioned element larger than the viewport.
  var viewportSize = goog.dom.getViewportSize();
  var w = viewportSize.width * 2;
  var h = viewportSize.height * 2;
  var dummy = goog.dom.createElement(goog.dom.TagName.DIV);
  dummy.style.position = 'absolute';
  goog.style.setSize(dummy, w, h);
  document.body.appendChild(dummy);

  try {
    popup = new goog.ui.ModalPopup();
    popup.render();
    popup.setVisible(true);

    var size = goog.style.getSize(popup.getBackgroundElement());
    assertTrue(
        'Background element must cover the size of the content',
        size.width >= w && size.height >= h);
  } finally {
    goog.dom.removeNode(dummy);
  }
}


function testSetupBackwardTabWrapResetsFlagAfterTimeout() {
  popup.setupBackwardTabWrap();
  assertTrue(
      'Backward tab wrap should be in progress',
      popup.backwardTabWrapInProgress_);
  mockClock.tick(1);
  assertFalse(
      'Backward tab wrap flag should be reset after delay',
      popup.backwardTabWrapInProgress_);
}


function testPopupGetsFocus() {
  popup = new goog.ui.ModalPopup();
  popup.render();
  popup.setVisible(true);
  assertTrue(
      'Dialog must receive initial focus',
      goog.dom.getActiveElement(document) == popup.getElement());
}


function testDecoratedPopupGetsFocus() {
  var dialogElem = goog.dom.createElement(goog.dom.TagName.DIV);
  document.body.appendChild(dialogElem);
  popup = new goog.ui.ModalPopup();
  popup.decorate(dialogElem);
  popup.setVisible(true);
  assertTrue(
      'Dialog must receive initial focus',
      goog.dom.getActiveElement(document) == popup.getElement());
  goog.dom.removeNode(dialogElem);
}



/**
 * @implements {goog.fx.Transition}
 * @extends {goog.events.EventTarget}
 * @constructor
 */
var MockTransition = function() {
  MockTransition.base(this, 'constructor');
  this.wasPlayed = false;
};
goog.inherits(MockTransition, goog.events.EventTarget);


MockTransition.prototype.play = function() {
  this.wasPlayed = true;
};


MockTransition.prototype.stop = goog.nullFunction;
