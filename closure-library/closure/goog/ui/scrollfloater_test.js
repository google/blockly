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

goog.provide('goog.ui.ScrollFloaterTest');
goog.setTestOnly('goog.ui.ScrollFloaterTest');

goog.require('goog.dom');
goog.require('goog.events');
goog.require('goog.style');
goog.require('goog.testing.PropertyReplacer');
goog.require('goog.testing.jsunit');
goog.require('goog.ui.ScrollFloater');

function testScrollFloater() {
  var scrollFloater = new goog.ui.ScrollFloater();
  var floater = goog.dom.getElement('floater');
  scrollFloater.decorate(floater);

  assertTrue('Default state is enabled', scrollFloater.isScrollingEnabled());
  assertFalse(
      'On unscrolled page should not be floating', scrollFloater.isFloating());

  scrollFloater.setScrollingEnabled(false);

  assertFalse('We can disable the floater', scrollFloater.isScrollingEnabled());
  scrollFloater.dispose();
}

function testScrollFloaterEvents() {
  var scrollFloater = new goog.ui.ScrollFloater();
  var floater = goog.dom.getElement('floater');
  scrollFloater.setContainerElement(goog.dom.getElement('container'));
  scrollFloater.decorate(floater);

  var floatWasCalled = false;
  var callRecorder = function() { floatWasCalled = true; };
  goog.events.listen(
      scrollFloater, goog.ui.ScrollFloater.EventType.FLOAT, callRecorder);
  scrollFloater.float_(goog.ui.ScrollFloater.FloatMode_.TOP);
  assertTrue('FLOAT event was called', floatWasCalled);
  assertTrue('Should be floating', scrollFloater.isFloating());
  assertFalse('Should not be pinned', scrollFloater.isPinned());

  var dockWasCalled = false;
  callRecorder = function() { dockWasCalled = true; };
  goog.events.listen(
      scrollFloater, goog.ui.ScrollFloater.EventType.DOCK, callRecorder);
  scrollFloater.dock_();
  assertTrue('DOCK event was called', dockWasCalled);
  assertFalse('Should not be floating', scrollFloater.isFloating());
  assertFalse('Should not be pinned', scrollFloater.isPinned());

  var pinWasCalled = false;
  callRecorder = function() { pinWasCalled = true; };
  goog.events.listen(
      scrollFloater, goog.ui.ScrollFloater.EventType.PIN, callRecorder);
  scrollFloater.pin_();
  assertTrue('PIN event was called', pinWasCalled);
  assertFalse('Should not be floating', scrollFloater.isFloating());
  assertTrue('Should be pinned', scrollFloater.isPinned());

  scrollFloater.dispose();
}

function testScrollFloaterEventCancellation() {
  var scrollFloater = new goog.ui.ScrollFloater();
  var floater = goog.dom.getElement('floater');
  scrollFloater.decorate(floater);

  // Event handler that returns false to cancel the event.
  var eventCanceller = function() { return false; };

  // Have eventCanceller handle the FLOAT event and verify cancellation.
  goog.events.listen(
      scrollFloater, goog.ui.ScrollFloater.EventType.FLOAT, eventCanceller);
  scrollFloater.float_(goog.ui.ScrollFloater.FloatMode_.TOP);
  assertFalse('Should not be floating', scrollFloater.isFloating());

  // Have eventCanceller handle the PIN event and verify cancellation.
  goog.events.listen(
      scrollFloater, goog.ui.ScrollFloater.EventType.PIN, eventCanceller);
  scrollFloater.dock_();
  assertFalse('Should not be pinned', scrollFloater.isPinned());

  // Detach eventCanceller and enable floating.
  goog.events.unlisten(
      scrollFloater, goog.ui.ScrollFloater.EventType.FLOAT, eventCanceller);
  scrollFloater.float_(goog.ui.ScrollFloater.FloatMode_.TOP);

  // Have eventCanceller handle the DOCK event and verify cancellation.
  goog.events.listen(
      scrollFloater, goog.ui.ScrollFloater.EventType.DOCK, eventCanceller);
  scrollFloater.dock_();
  assertTrue('Should still be floating', scrollFloater.isFloating());

  scrollFloater.dispose();
}

function testScrollFloaterUpdateStyleOnFloatEvent() {
  var scrollFloater = new goog.ui.ScrollFloater();
  var floater = goog.dom.getElement('floater');
  scrollFloater.decorate(floater);

  // Event handler that sets the font size of the scrollfloater to 20px.
  var updateStyle = function(e) {
    goog.style.setStyle(e.target.getElement(), 'font-size', '20px');
  };

  // Set the current font size to 10px.
  goog.style.setStyle(scrollFloater.getElement(), 'font-size', '10px');
  goog.events.listen(
      scrollFloater, goog.ui.ScrollFloater.EventType.FLOAT, updateStyle);
  scrollFloater.float_(goog.ui.ScrollFloater.FloatMode_.BOTTOM);

  // Ensure event handler got called and updated the font size.
  assertEquals(
      'Font size should be 20px', '20px',
      goog.style.getStyle(scrollFloater.getElement(), 'font-size'));

  assertEquals(
      'Top should be auto', 'auto',
      goog.style.getStyle(scrollFloater.getElement(), 'top'));
  assertEquals(
      'Bottom should be 0px', 0,
      parseInt(goog.style.getStyle(scrollFloater.getElement(), 'bottom')));

  scrollFloater.dispose();
}

function testScrollFloaterHandlesHorizontalScrolling() {
  var scrollFloater = new goog.ui.ScrollFloater();
  var floater = goog.dom.getElement('floater');
  scrollFloater.decorate(floater);

  scrollFloater.float_(goog.ui.ScrollFloater.FloatMode_.TOP);

  // For some reason the default position of the tested SF is 16px left.
  assertEquals(
      'Element should be left aligned', '16px',
      goog.style.getStyle(scrollFloater.getElement(), 'left'));

  var propReplacer = new goog.testing.PropertyReplacer();
  propReplacer.set(
      goog.dom, 'getDocumentScroll', function() { return {'x': 20}; });

  scrollFloater.float_(goog.ui.ScrollFloater.FloatMode_.TOP);

  assertEquals(
      'Element should be scrolled to the left', '-4px',
      goog.style.getStyle(scrollFloater.getElement(), 'left'));

  propReplacer.reset();
  scrollFloater.dispose();
}
