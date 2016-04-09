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

goog.provide('goog.fx.DraggerTest');
goog.setTestOnly('goog.fx.DraggerTest');

goog.require('goog.dom');
goog.require('goog.dom.TagName');
goog.require('goog.events');
goog.require('goog.events.BrowserEvent');
goog.require('goog.events.Event');
goog.require('goog.events.EventType');
goog.require('goog.fx.Dragger');
goog.require('goog.math.Rect');
goog.require('goog.style.bidi');
goog.require('goog.testing.StrictMock');
goog.require('goog.testing.events');
goog.require('goog.testing.jsunit');
goog.require('goog.userAgent');

var HAS_SET_CAPTURE = goog.fx.Dragger.HAS_SET_CAPTURE_;

var target;
var targetRtl;

function setUp() {
  var sandbox = goog.dom.getElement('sandbox');
  target = goog.dom.createDom(goog.dom.TagName.DIV, {
    'id': 'target',
    'style': 'display:none;position:absolute;top:15px;left:10px'
  });
  sandbox.appendChild(target);
  sandbox.appendChild(goog.dom.createDom(goog.dom.TagName.DIV, {id: 'handle'}));

  var sandboxRtl = goog.dom.getElement('sandbox_rtl');
  targetRtl = goog.dom.createDom(goog.dom.TagName.DIV, {
    'id': 'target_rtl',
    'style': 'position:absolute; top:15px; right:10px; width:10px; ' +
        'height: 10px; background: green;'
  });
  sandboxRtl.appendChild(targetRtl);
  sandboxRtl.appendChild(goog.dom.createDom(goog.dom.TagName.DIV, {
    'id': 'background_rtl',
    'style': 'width: 10000px;height:50px;position:absolute;color:blue;'
  }));
  sandboxRtl.appendChild(
      goog.dom.createDom(goog.dom.TagName.DIV, {id: 'handle_rtl'}));
}

function tearDown() {
  goog.dom.removeChildren(goog.dom.getElement('sandbox'));
  goog.dom.removeChildren(goog.dom.getElement('sandbox_rtl'));
  goog.events.removeAll(document);
}

function testStartDrag() {
  runStartDragTest('handle', target);
}

function testStartDrag_rtl() {
  runStartDragTest('handle_rtl', targetRtl);
}

function runStartDragTest(handleId, targetElement) {
  var dragger =
      new goog.fx.Dragger(targetElement, goog.dom.getElement(handleId));
  if (handleId == 'handle_rtl') {
    dragger.enableRightPositioningForRtl(true);
  }
  var e = new goog.testing.StrictMock(goog.events.BrowserEvent);
  e.type = goog.events.EventType.MOUSEDOWN;
  e.clientX = 1;
  e.clientY = 2;
  e.isMouseActionButton().$returns(true);
  e.preventDefault();
  e.isMouseActionButton().$returns(true);
  e.preventDefault();
  e.$replay();

  goog.events.listen(dragger, goog.fx.Dragger.EventType.START, function() {
    targetElement.style.display = 'block';
  });

  dragger.startDrag(e);

  assertTrue(
      'Start drag with no hysteresis must actually start the drag.',
      dragger.isDragging());
  if (handleId == 'handle_rtl') {
    assertEquals(10, goog.style.bidi.getOffsetStart(targetElement));
  }
  assertEquals(
      'Dragger startX must match event\'s clientX.', 1, dragger.startX);
  assertEquals(
      'Dragger clientX must match event\'s clientX', 1, dragger.clientX);
  assertEquals(
      'Dragger startY must match event\'s clientY.', 2, dragger.startY);
  assertEquals(
      'Dragger clientY must match event\'s clientY', 2, dragger.clientY);
  assertEquals(
      'Dragger deltaX must match target\'s offsetLeft', 10, dragger.deltaX);
  assertEquals(
      'Dragger deltaY must match target\'s offsetTop', 15, dragger.deltaY);

  dragger = new goog.fx.Dragger(targetElement, goog.dom.getElement(handleId));
  dragger.setHysteresis(1);
  dragger.startDrag(e);
  assertFalse(
      'Start drag with a valid non-zero hysteresis should not start ' +
          'the drag.',
      dragger.isDragging());
  e.$verify();
}


/**
 * @bug 1381317 Cancelling start drag didn't end the attempt to drag.
 */
function testStartDrag_Cancel() {
  var dragger = new goog.fx.Dragger(target);

  var e = new goog.testing.StrictMock(goog.events.BrowserEvent);
  e.type = goog.events.EventType.MOUSEDOWN;
  e.clientX = 1;
  e.clientY = 2;
  e.isMouseActionButton().$returns(true);
  e.$replay();

  goog.events.listen(dragger, goog.fx.Dragger.EventType.START, function(e) {
    // Cancel drag.
    e.preventDefault();
  });

  dragger.startDrag(e);

  assertFalse('Start drag must have been cancelled.', dragger.isDragging());
  assertFalse(
      'Dragger must not have registered mousemove handlers.',
      goog.events.hasListener(
          dragger.document_, goog.events.EventType.MOUSEMOVE,
          !HAS_SET_CAPTURE));
  assertFalse(
      'Dragger must not have registered mouseup handlers.',
      goog.events.hasListener(
          dragger.document_, goog.events.EventType.MOUSEUP, !HAS_SET_CAPTURE));
  e.$verify();
}


/**
 * Tests that start drag happens on left mousedown.
 */
function testStartDrag_LeftMouseDownOnly() {
  var dragger = new goog.fx.Dragger(target);

  var e = new goog.testing.StrictMock(goog.events.BrowserEvent);
  e.type = goog.events.EventType.MOUSEDOWN;
  e.clientX = 1;
  e.clientY = 2;
  e.isMouseActionButton().$returns(false);
  e.$replay();

  goog.events.listen(dragger, goog.fx.Dragger.EventType.START, function(e) {
    fail('No drag START event should have been dispatched');
  });

  dragger.startDrag(e);

  assertFalse('Start drag must have been cancelled.', dragger.isDragging());
  assertFalse(
      'Dragger must not have registered mousemove handlers.',
      goog.events.hasListener(
          dragger.document_, goog.events.EventType.MOUSEMOVE, true));
  assertFalse(
      'Dragger must not have registered mouseup handlers.',
      goog.events.hasListener(
          dragger.document_, goog.events.EventType.MOUSEUP, true));
  e.$verify();
}


/**
 * Tests that start drag happens on other event type than MOUSEDOWN.
 */
function testStartDrag_MouseMove() {
  var dragger = new goog.fx.Dragger(target);

  var e = new goog.testing.StrictMock(goog.events.BrowserEvent);
  e.type = goog.events.EventType.MOUSEMOVE;
  e.clientX = 1;
  e.clientY = 2;
  e.preventDefault();
  e.$replay();

  var startDragFired = false;
  goog.events.listen(dragger, goog.fx.Dragger.EventType.START, function(e) {
    startDragFired = true;
  });

  dragger.startDrag(e);

  assertTrue('Dragging should be in progress.', dragger.isDragging());
  assertTrue('Start drag event should have fired.', startDragFired);
  assertTrue(
      'Dragger must have registered mousemove handlers.',
      goog.events.hasListener(
          dragger.document_, goog.events.EventType.MOUSEMOVE,
          !HAS_SET_CAPTURE));
  assertTrue(
      'Dragger must have registered mouseup handlers.',
      goog.events.hasListener(
          dragger.document_, goog.events.EventType.MOUSEUP, !HAS_SET_CAPTURE));
  e.$verify();
}


/**
 * @bug 1381317 Cancelling start drag didn't end the attempt to drag.
 */
function testHandleMove_Cancel() {
  var dragger = new goog.fx.Dragger(target);
  dragger.setHysteresis(5);

  goog.events.listen(dragger, goog.fx.Dragger.EventType.START, function(e) {
    // Cancel drag.
    e.preventDefault();
  });

  var e = new goog.testing.StrictMock(goog.events.BrowserEvent);
  e.clientX = 1;
  e.clientY = 2;
  e.isMouseActionButton().$returns(true).$anyTimes();
  e.preventDefault();
  e.$replay();
  dragger.startDrag(e);
  assertFalse(
      'Start drag must not start drag because of hysterisis.',
      dragger.isDragging());
  assertTrue(
      'Dragger must have registered mousemove handlers.',
      goog.events.hasListener(
          dragger.document_, goog.events.EventType.MOUSEMOVE,
          !HAS_SET_CAPTURE));
  assertTrue(
      'Dragger must have registered mouseup handlers.',
      goog.events.hasListener(
          dragger.document_, goog.events.EventType.MOUSEUP, !HAS_SET_CAPTURE));

  e.clientX = 10;
  e.clientY = 10;
  dragger.handleMove_(e);
  assertFalse('Drag must be cancelled.', dragger.isDragging());
  assertFalse(
      'Dragger must unregistered mousemove handlers.',
      goog.events.hasListener(
          dragger.document_, goog.events.EventType.MOUSEMOVE, true));
  assertFalse(
      'Dragger must unregistered mouseup handlers.',
      goog.events.hasListener(
          dragger.document_, goog.events.EventType.MOUSEUP, true));
  e.$verify();
}


/**
 * @bug 1714667 IE<9 built in drag and drop handling stops dragging.
 */
function testIeDragStartCancelling() {
  // Testing only IE<9.
  if (!goog.userAgent.IE || goog.userAgent.isVersionOrHigher(9)) {
    return;
  }

  // Built in 'dragstart' cancelling not enabled.
  var dragger = new goog.fx.Dragger(target);

  var e = new goog.events.Event(goog.events.EventType.MOUSEDOWN);
  e.clientX = 1;
  e.clientY = 2;
  e.button = 1;  // IE only constant for left button.
  var be = new goog.events.BrowserEvent(e);
  dragger.startDrag(be);
  assertTrue('The drag should have started.', dragger.isDragging());

  e = new goog.events.Event(goog.events.EventType.DRAGSTART);
  e.target = dragger.document_.documentElement;
  assertTrue(
      'The event should not be canceled.',
      goog.testing.events.fireBrowserEvent(e));

  dragger.dispose();

  // Built in 'dragstart' cancelling enabled.
  dragger = new goog.fx.Dragger(target);
  dragger.setCancelIeDragStart(true);

  e = new goog.events.Event(goog.events.EventType.MOUSEDOWN);
  e.clientX = 1;
  e.clientY = 2;
  e.button = 1;  // IE only constant for left button.
  be = new goog.events.BrowserEvent(e);
  dragger.startDrag(be);
  assertTrue('The drag should have started.', dragger.isDragging());

  e = new goog.events.Event(goog.events.EventType.DRAGSTART);
  e.target = dragger.document_.documentElement;
  assertFalse(
      'The event should be canceled.', goog.testing.events.fireBrowserEvent(e));

  dragger.dispose();
}


function testPreventMouseDown() {
  var dragger = new goog.fx.Dragger(target);
  dragger.setPreventMouseDown(false);

  var e = new goog.testing.StrictMock(goog.events.BrowserEvent);
  e.type = goog.events.EventType.MOUSEDOWN;
  e.clientX = 1;
  e.clientY = 2;
  e.isMouseActionButton().$returns(true);
  // preventDefault is not called.
  e.$replay();

  dragger.startDrag(e);

  assertTrue('Dragging should be in progess.', dragger.isDragging());
  e.$verify();
}

function testLimits() {
  var dragger = new goog.fx.Dragger(target);

  assertEquals(100, dragger.limitX(100));
  assertEquals(100, dragger.limitY(100));

  dragger.setLimits(new goog.math.Rect(10, 20, 30, 40));

  assertEquals(10, dragger.limitX(0));
  assertEquals(40, dragger.limitX(100));
  assertEquals(20, dragger.limitY(0));
  assertEquals(60, dragger.limitY(100));
}

function testWindowBlur() {
  if (!goog.fx.Dragger.HAS_SET_CAPTURE_) {
    var dragger = new goog.fx.Dragger(target);

    var dragEnded = false;
    goog.events.listen(dragger, goog.fx.Dragger.EventType.END, function(e) {
      dragEnded = true;
    });

    var e = new goog.testing.StrictMock(goog.events.BrowserEvent);
    e.type = goog.events.EventType.MOUSEDOWN;
    e.clientX = 1;
    e.clientY = 2;
    e.isMouseActionButton().$returns(true);
    e.preventDefault();
    e.$replay();
    dragger.startDrag(e);
    e.$verify();

    assertTrue(dragger.isDragging());

    e = new goog.events.BrowserEvent();
    e.type = goog.events.EventType.BLUR;
    e.target = window;
    e.currentTarget = window;
    goog.testing.events.fireBrowserEvent(e);

    assertTrue(dragEnded);
  }
}

function testBlur() {
  if (!goog.fx.Dragger.HAS_SET_CAPTURE_) {
    var dragger = new goog.fx.Dragger(target);

    var dragEnded = false;
    goog.events.listen(dragger, goog.fx.Dragger.EventType.END, function(e) {
      dragEnded = true;
    });

    var e = new goog.testing.StrictMock(goog.events.BrowserEvent);
    e.type = goog.events.EventType.MOUSEDOWN;
    e.clientX = 1;
    e.clientY = 2;
    e.isMouseActionButton().$returns(true);
    e.preventDefault();
    e.$replay();
    dragger.startDrag(e);
    e.$verify();

    assertTrue(dragger.isDragging());

    e = new goog.events.BrowserEvent();
    e.type = goog.events.EventType.BLUR;
    e.target = document.body;
    e.currentTarget = document.body;
    // Blur events do not bubble but the test event system does not emulate that
    // part so we add a capturing listener on the target and stops the
    // propagation at the target, preventing any event from bubbling.
    goog.events.listen(document.body, goog.events.EventType.BLUR, function(e) {
      e.propagationStopped_ = true;
    }, true);
    goog.testing.events.fireBrowserEvent(e);

    assertFalse(dragEnded);
  }
}

function testCloneNode() {
  var element = goog.dom.createDom(goog.dom.TagName.DIV);
  element.innerHTML = '<input type="hidden" value="v0">' +
      '<textarea>v1</textarea>' +
      '<textarea>v2</textarea>';
  element.childNodes[0].value = '\'new\'\n"value"';
  element.childNodes[1].value = '<' +
      '/textarea>&lt;3';
  element.childNodes[2].value = '<script>\n\talert("oops!");<' +
      '/script>';
  var clone = goog.fx.Dragger.cloneNode(element);
  assertEquals(element.childNodes[0].value, clone.childNodes[0].value);
  assertEquals(element.childNodes[1].value, clone.childNodes[1].value);
  assertEquals(element.childNodes[2].value, clone.childNodes[2].value);
  clone = goog.fx.Dragger.cloneNode(element.childNodes[2]);
  assertEquals(element.childNodes[2].value, clone.value);
}
