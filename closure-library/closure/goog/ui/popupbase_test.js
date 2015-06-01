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

goog.provide('goog.ui.PopupBaseTest');
goog.setTestOnly('goog.ui.PopupBaseTest');

goog.require('goog.dom');
goog.require('goog.dom.TagName');
goog.require('goog.events');
goog.require('goog.events.EventTarget');
goog.require('goog.events.EventType');
goog.require('goog.events.KeyCodes');
goog.require('goog.fx.Transition');
goog.require('goog.fx.css3');
goog.require('goog.testing.MockClock');
goog.require('goog.testing.events');
goog.require('goog.testing.events.Event');
goog.require('goog.testing.jsunit');
goog.require('goog.ui.PopupBase');

var targetDiv;
var popupDiv;
var partnerDiv;
var clock;
var popup;

function setUpPage() {
  targetDiv = goog.dom.getElement('targetDiv');
  popupDiv = goog.dom.getElement('popupDiv');
  partnerDiv = goog.dom.getElement('partnerDiv');
}

function setUp() {
  popup = new goog.ui.PopupBase(popupDiv);
  clock = new goog.testing.MockClock(true);
}

function tearDown() {
  popup.dispose();
  clock.uninstall();
  document.body.setAttribute('dir', 'ltr');
}

function testSetVisible() {
  popup.setVisible(true);
  assertEquals('visible', popupDiv.style.visibility);
  assertEquals('', popupDiv.style.display);
  popup.setVisible(false);
  assertEquals('hidden', popupDiv.style.visibility);
  assertEquals('none', popupDiv.style.display);
}

function testEscapeDismissal() {
  popup.setHideOnEscape(true);
  assertTrue('Sanity check that getHideOnEscape is true when set to true.',
      popup.getHideOnEscape());
  popup.setVisible(true);
  assertFalse('Escape key should be cancelled',
      goog.testing.events.fireKeySequence(
          targetDiv, goog.events.KeyCodes.ESC));
  assertFalse(popup.isVisible());
}

function testEscapeDismissalCanBeDisabled() {
  popup.setHideOnEscape(false);
  popup.setVisible(true);
  assertTrue('Escape key should be cancelled',
      goog.testing.events.fireKeySequence(
          targetDiv, goog.events.KeyCodes.ESC));
  assertTrue(popup.isVisible());
}

function testEscapeDismissalIsDisabledByDefault() {
  assertFalse(popup.getHideOnEscape());
}

function testEscapeDismissalDoesNotRecognizeOtherKeys() {
  popup.setHideOnEscape(true);
  popup.setVisible(true);
  var eventsPropagated = 0;
  goog.events.listenOnce(goog.dom.getElement('commonAncestor'),
      [goog.events.EventType.KEYDOWN,
       goog.events.EventType.KEYUP,
       goog.events.EventType.KEYPRESS],
      function() {
        ++eventsPropagated;
      });
  assertTrue('Popup should remain visible', popup.isVisible());
  assertTrue('The key event default action should not be prevented',
      goog.testing.events.fireKeySequence(
          targetDiv, goog.events.KeyCodes.A));
  assertEquals('Keydown, keyup, and keypress should have all propagated',
      3, eventsPropagated);
}

function testEscapeDismissalCanBeCancelledByBeforeHideEvent() {
  popup.setHideOnEscape(true);
  popup.setVisible(true);
  var eventsPropagated = 0;
  goog.events.listenOnce(goog.dom.getElement('commonAncestor'),
      goog.events.EventType.KEYDOWN,
      function() {
        ++eventsPropagated;
      });
  // Make a listener so that we stop hiding with an event handler.
  goog.events.listenOnce(popup, goog.ui.PopupBase.EventType.BEFORE_HIDE,
      function(e) {
        e.preventDefault();
      });
  assertEquals('The hide should have been cancelled',
      true, popup.isVisible());
  assertTrue('The key event default action should not be prevented',
      goog.testing.events.fireKeySequence(
          targetDiv, goog.events.KeyCodes.ESC));
  assertEquals('Keydown should have all propagated',
      1, eventsPropagated);
}

function testEscapeDismissalProvidesKeyTargetAsTargetForHideEvents() {
  popup.setHideOnEscape(true);
  popup.setVisible(true);
  var calls = 0;
  goog.events.listenOnce(popup,
      [goog.ui.PopupBase.EventType.BEFORE_HIDE,
       goog.ui.PopupBase.EventType.HIDE],
      function(e) {
        calls++;
        assertEquals('The key target should be the hide event target',
            'targetDiv', e.target.id);
      });
  goog.testing.events.fireKeySequence(
      targetDiv, goog.events.KeyCodes.ESC);
}

function testAutoHide() {
  popup.setAutoHide(true);
  popup.setVisible(true);
  clock.tick(1000); // avoid bouncing
  goog.testing.events.fireClickSequence(targetDiv);
  assertFalse(popup.isVisible());
}

function testAutoHideCanBeDisabled() {
  popup.setAutoHide(false);
  popup.setVisible(true);
  clock.tick(1000); // avoid bouncing
  goog.testing.events.fireClickSequence(targetDiv);
  assertTrue(
      'Should not be hidden if auto hide is disabled', popup.isVisible());
}

function testAutoHideEnabledByDefault() {
  assertTrue(popup.getAutoHide());
}

function testAutoHideWithPartners() {
  popup.setAutoHide(true);
  popup.setVisible(true);
  popup.addAutoHidePartner(targetDiv);
  popup.addAutoHidePartner(partnerDiv);
  clock.tick(1000); // avoid bouncing

  goog.testing.events.fireClickSequence(targetDiv);
  assertTrue(popup.isVisible());
  goog.testing.events.fireClickSequence(partnerDiv);
  assertTrue(popup.isVisible());

  popup.removeAutoHidePartner(partnerDiv);
  goog.testing.events.fireClickSequence(partnerDiv);
  assertFalse(popup.isVisible());
}

function testCanAddElementDuringBeforeShow() {
  popup.setElement(null);
  goog.events.listenOnce(popup, goog.ui.PopupBase.EventType.BEFORE_SHOW,
      function() {
        popup.setElement(popupDiv);
      });
  popup.setVisible(true);
  assertTrue('Popup should be shown', popup.isVisible());
}

function testShowWithNoElementThrowsException() {
  popup.setElement(null);
  var e = assertThrows(function() {
    popup.setVisible(true);
  });
  assertEquals('Caller must call setElement before trying to show the popup',
      e.message);
}

function testShowEventFiredWithNoTransition() {
  var showHandlerCalled = false;
  goog.events.listen(popup, goog.ui.PopupBase.EventType.SHOW, function() {
    showHandlerCalled = true;
  });

  popup.setVisible(true);
  assertTrue(showHandlerCalled);
}

function testHideEventFiredWithNoTransition() {
  var hideHandlerCalled = false;
  goog.events.listen(popup, goog.ui.PopupBase.EventType.HIDE, function() {
    hideHandlerCalled = true;
  });

  popup.setVisible(true);
  popup.setVisible(false);
  assertTrue(hideHandlerCalled);
}

function testOnShowTransition() {
  var mockTransition = new MockTransition();

  var showHandlerCalled = false;
  goog.events.listen(popup, goog.ui.PopupBase.EventType.SHOW, function() {
    showHandlerCalled = true;
  });

  popup.setTransition(mockTransition);
  popup.setVisible(true);
  assertTrue(mockTransition.wasPlayed);

  assertFalse(showHandlerCalled);
  mockTransition.dispatchEvent(goog.fx.Transition.EventType.END);
  assertTrue(showHandlerCalled);
}

function testOnHideTransition() {
  var mockTransition = new MockTransition();

  var hideHandlerCalled = false;
  goog.events.listen(popup, goog.ui.PopupBase.EventType.HIDE, function() {
    hideHandlerCalled = true;
  });

  popup.setTransition(undefined, mockTransition);
  popup.setVisible(true);
  assertFalse(mockTransition.wasPlayed);

  popup.setVisible(false);
  assertTrue(mockTransition.wasPlayed);

  assertFalse(hideHandlerCalled);
  mockTransition.dispatchEvent(goog.fx.Transition.EventType.END);
  assertTrue(hideHandlerCalled);
}

function testSetVisibleWorksCorrectlyWithTransitions() {
  popup.setTransition(
      goog.fx.css3.fadeIn(popup.getElement(), 1),
      goog.fx.css3.fadeOut(popup.getElement(), 1));

  // Consecutive calls to setVisible works without needing to wait for
  // transition to finish.
  popup.setVisible(true);
  assertTrue(popup.isVisible());
  popup.setVisible(false);
  assertFalse(popup.isVisible());
  clock.tick(1100);

  // Calling setVisible(true) immediately changed the state to visible.
  popup.setVisible(true);
  assertTrue(popup.isVisible());
  clock.tick(1100);

  // Consecutive calls to setVisible, in opposite order.
  popup.setVisible(false);
  popup.setVisible(true);
  assertTrue(popup.isVisible());
  clock.tick(1100);

  // Calling setVisible(false) immediately changed the state to not visible.
  popup.setVisible(false);
  assertFalse(popup.isVisible());
  clock.tick(1100);
}

function testWasRecentlyVisibleWorksCorrectlyWithTransitions() {
  popup.setTransition(
      goog.fx.css3.fadeIn(popup.getElement(), 1),
      goog.fx.css3.fadeOut(popup.getElement(), 1));

  popup.setVisible(true);
  clock.tick(1100);
  popup.setVisible(false);
  assertTrue(popup.isOrWasRecentlyVisible());
  clock.tick(goog.ui.PopupBase.DEBOUNCE_DELAY_MS);
  assertFalse(popup.isOrWasRecentlyVisible());
}

function testMoveOffscreenRTL() {
  document.body.setAttribute('dir', 'rtl');
  popup.reposition = function() {
    this.element_.style.left = '100px';
    this.element_.style.top = '100px';
  };
  popup.setType(goog.ui.PopupBase.Type.MOVE_OFFSCREEN);
  popup.setElement(goog.dom.getElement('moveOffscreenPopupDiv'));
  originalScrollWidth = goog.dom.getDocumentScrollElement().scrollWidth;
  popup.setVisible(true);
  popup.setVisible(false);
  assertFalse('Moving a popup offscreen should not cause scrollbars',
      goog.dom.getDocumentScrollElement().scrollWidth != originalScrollWidth);
}

function testOnDocumentBlurDisabledCrossIframeDismissalWithoutDelay() {
  popup.setEnableCrossIframeDismissal(false);
  popup.setVisible(true);
  var e = new goog.testing.events.Event(
      goog.events.EventType.BLUR, document);
  goog.testing.events.fireBrowserEvent(e);
  assertTrue('Popup should remain visible', popup.isVisible());
}

function testOnDocumentBlurDisabledCrossIframeDismissalWithDelay() {
  popup.setEnableCrossIframeDismissal(false);
  popup.setVisible(true);
  var e = new goog.testing.events.Event(
      goog.events.EventType.BLUR, document);
  clock.tick(goog.ui.PopupBase.DEBOUNCE_DELAY_MS);
  goog.testing.events.fireBrowserEvent(e);
  assertTrue('Popup should remain visible', popup.isVisible());
}

function testOnDocumentBlurActiveElementInsidePopupWithoutDelay() {
  popup.setVisible(true);
  var elementInsidePopup = goog.dom.createDom(goog.dom.TagName.DIV);
  goog.dom.append(popupDiv, elementInsidePopup);
  elementInsidePopup.setAttribute('tabIndex', 0);
  elementInsidePopup.focus();
  var e = new goog.testing.events.Event(
      goog.events.EventType.BLUR, document);
  goog.testing.events.fireBrowserEvent(e);
  assertTrue('Popup should remain visible', popup.isVisible());
}

function testOnDocumentBlurActiveElementInsidePopupWithDelay() {
  popup.setVisible(true);
  var elementInsidePopup = goog.dom.createDom(goog.dom.TagName.DIV);
  goog.dom.append(popupDiv, elementInsidePopup);
  elementInsidePopup.setAttribute('tabIndex', 0);
  elementInsidePopup.focus();
  var e = new goog.testing.events.Event(
      goog.events.EventType.BLUR, document);
  clock.tick(goog.ui.PopupBase.DEBOUNCE_DELAY_MS);
  goog.testing.events.fireBrowserEvent(e);
  assertTrue('Popup should remain visible', popup.isVisible());
}

function testOnDocumentBlurActiveElementIsBodyWithoutDelay() {
  popup.setVisible(true);
  var bodyElement = goog.dom.getDomHelper().
      getElementsByTagNameAndClass('body')[0];
  bodyElement.setAttribute('tabIndex', 0);
  bodyElement.focus();
  var e = new goog.testing.events.Event(
      goog.events.EventType.BLUR, document);
  goog.testing.events.fireBrowserEvent(e);
  assertTrue('Popup should remain visible', popup.isVisible());
}

function testOnDocumentBlurActiveElementIsBodyWithDelay() {
  popup.setVisible(true);
  var bodyElement = goog.dom.getDomHelper().
      getElementsByTagNameAndClass('body')[0];
  bodyElement.setAttribute('tabIndex', 0);
  bodyElement.focus();
  var e = new goog.testing.events.Event(
      goog.events.EventType.BLUR, document);
  clock.tick(goog.ui.PopupBase.DEBOUNCE_DELAY_MS);
  goog.testing.events.fireBrowserEvent(e);
  assertTrue('Popup should remain visible', popup.isVisible());
}

function testOnDocumentBlurEventTargetNotDocumentWithoutDelay() {
  popup.setVisible(true);
  var e = new goog.testing.events.Event(
      goog.events.EventType.BLUR, targetDiv);
  goog.testing.events.fireBrowserEvent(e);
  assertTrue('Popup should remain visible', popup.isVisible());
}

function testOnDocumentBlurEventTargetNotDocumentWithDelay() {
  popup.setVisible(true);
  var e = new goog.testing.events.Event(
      goog.events.EventType.BLUR, targetDiv);
  clock.tick(goog.ui.PopupBase.DEBOUNCE_DELAY_MS);
  goog.testing.events.fireBrowserEvent(e);
  assertTrue('Popup should remain visible', popup.isVisible());
}

function testOnDocumentBlurShouldDebounceWithoutDelay() {
  popup.setVisible(true);
  var commonAncestor = goog.dom.getElement('commonAncestor');
  var focusDiv = goog.dom.createDom(goog.dom.TagName.DIV, 'tabIndex');
  focusDiv.setAttribute('tabIndex', 0);
  goog.dom.appendChild(commonAncestor, focusDiv);
  focusDiv.focus();
  var e = new goog.testing.events.Event(
      goog.events.EventType.BLUR, document);
  goog.testing.events.fireBrowserEvent(e);
  assertTrue('Popup should be visible', popup.isVisible());
  goog.dom.removeNode(focusDiv);
}

function testOnDocumentBlurShouldNotDebounceWithDelay() {
  popup.setVisible(true);
  clock.tick(goog.ui.PopupBase.DEBOUNCE_DELAY_MS);
  var commonAncestor = goog.dom.getElement('commonAncestor');
  var focusDiv = goog.dom.createDom(goog.dom.TagName.DIV, 'tabIndex');
  focusDiv.setAttribute('tabIndex', 0);
  goog.dom.appendChild(commonAncestor, focusDiv);
  focusDiv.focus();
  var e = new goog.testing.events.Event(
      goog.events.EventType.BLUR, document);
  goog.testing.events.fireBrowserEvent(e);
  assertFalse('Popup should be invisible', popup.isVisible());
  goog.dom.removeNode(focusDiv);
}


function testOnDocumentBlurShouldNotHideBubbleWithoutDelay() {
  popup.setVisible(true);
  var commonAncestor = goog.dom.getElement('commonAncestor');
  var focusDiv = goog.dom.createDom(goog.dom.TagName.DIV, 'tabIndex');
  focusDiv.setAttribute('tabIndex', 0);
  goog.dom.appendChild(commonAncestor, focusDiv);
  focusDiv.focus();
  var e = new goog.testing.events.Event(
      goog.events.EventType.BLUR, document);
  goog.testing.events.fireBrowserEvent(e);
  assertTrue('Popup should be visible', popup.isVisible());
  goog.dom.removeNode(focusDiv);
}

function testOnDocumentBlurShouldHideBubbleWithDelay() {
  popup.setVisible(true);
  clock.tick(goog.ui.PopupBase.DEBOUNCE_DELAY_MS);
  var commonAncestor = goog.dom.getElement('commonAncestor');
  var focusDiv = goog.dom.createDom(goog.dom.TagName.DIV, 'tabIndex');
  focusDiv.setAttribute('tabIndex', 0);
  goog.dom.appendChild(commonAncestor, focusDiv);
  focusDiv.focus();
  var e = new goog.testing.events.Event(
      goog.events.EventType.BLUR, document);
  goog.testing.events.fireBrowserEvent(e);
  assertFalse('Popup should be invisible', popup.isVisible());
  goog.dom.removeNode(focusDiv);
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


// TODO(gboyer): Write better unit tests for click and cross-iframe dismissal.
