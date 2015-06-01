// Copyright 2009 The Closure Library Authors. All Rights Reserved.
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

goog.provide('goog.events.MouseWheelHandlerTest');
goog.setTestOnly('goog.events.MouseWheelHandlerTest');

goog.require('goog.dom');
goog.require('goog.events');
goog.require('goog.events.BrowserEvent');
goog.require('goog.events.MouseWheelEvent');
goog.require('goog.events.MouseWheelHandler');
goog.require('goog.functions');
goog.require('goog.string');
goog.require('goog.testing.PropertyReplacer');
goog.require('goog.testing.events');
goog.require('goog.testing.jsunit');
goog.require('goog.userAgent');

var log;
var stubs = new goog.testing.PropertyReplacer();

var DEFAULT_TYPE = 'mousewheel';
var GECKO_TYPE = 'DOMMouseScroll';

var HORIZONTAL = 'h';
var VERTICAL = 'v';

var mouseWheelEvent;
var mouseWheelEventRtl;
var mouseWheelHandler;
var mouseWheelHandlerRtl;

function setUpPage() {
  log = goog.dom.getElement('log');
}

function setUp() {
  stubs.remove(goog, 'userAgent');
}

function tearDown() {
  stubs.reset();
  goog.dispose(mouseWheelHandler);
  goog.dispose(mouseWheelHandlerRtl);
  mouseWheelHandlerRtl = null;
  mouseWheelHandler = null;
  mouseWheelEvent = null;
  mouseWheelEventRtl = null;
}

function tearDownPage() {
  // Create interactive demo.
  mouseWheelHandler = new goog.events.MouseWheelHandler(document.body);

  goog.events.listen(mouseWheelHandler,
      goog.events.MouseWheelHandler.EventType.MOUSEWHEEL,
      function(e) {
        log.innerHTML += goog.string.subs('<br />(deltaX, deltaY): (%s, %s)',
            e.deltaX, e.deltaY);
      });
}

function testIeStyleMouseWheel() {
  goog.userAgent = {
    OPERA: false,
    IE: true,
    GECKO: false,
    WEBKIT: false
  };

  createHandlerAndListen();

  // Non-gecko, non-webkit events get wheelDelta divided by -40 to get detail.
  handleEvent(createFakeMouseWheelEvent(DEFAULT_TYPE, 120));
  assertMouseWheelEvent(-3, 0, -3);

  handleEvent(createFakeMouseWheelEvent(DEFAULT_TYPE, -120));
  assertMouseWheelEvent(3, 0, 3);

  handleEvent(createFakeMouseWheelEvent(DEFAULT_TYPE, 1200));
  assertMouseWheelEvent(-30, 0, -30);
}

function testNullBody() {
  goog.userAgent = {
    OPERA: false,
    IE: true,
    GECKO: false,
    WEBKIT: false
  };
  var documentObjectWithNoBody = { };
  goog.testing.events.mixinListenable(documentObjectWithNoBody);
  mouseWheelHandler =
      new goog.events.MouseWheelHandler(documentObjectWithNoBody);
}

function testGeckoStyleMouseWheel() {
  goog.userAgent = {
    OPERA: false,
    IE: false,
    GECKO: true,
    WEBKIT: false
  };

  createHandlerAndListen();

  handleEvent(createFakeMouseWheelEvent(GECKO_TYPE, null, 3));
  assertMouseWheelEvent(3, 0, 3);

  handleEvent(createFakeMouseWheelEvent(GECKO_TYPE, null, -12));
  assertMouseWheelEvent(-12, 0, -12);

  // Really big values should get truncated to +-3.
  handleEvent(createFakeMouseWheelEvent(GECKO_TYPE, null, 1200));
  assertMouseWheelEvent(3, 0, 3);

  handleEvent(createFakeMouseWheelEvent(GECKO_TYPE, null, -1200));
  assertMouseWheelEvent(-3, 0, -3);

  // Test scrolling with the additional axis property.
  handleEvent(createFakeMouseWheelEvent(GECKO_TYPE, null, 3, VERTICAL));
  assertMouseWheelEvent(3, 0, 3);

  handleEvent(createFakeMouseWheelEvent(GECKO_TYPE, null, 3, HORIZONTAL));
  assertMouseWheelEvent(3, 3, 0);

  handleEvent(createFakeMouseWheelEvent(GECKO_TYPE, null, -3, HORIZONTAL));
  assertMouseWheelEvent(-3, -3, 0);
}

function testWebkitStyleMouseWheel_ieStyle() {
  goog.userAgent = {
    OPERA: false,
    IE: false,
    GECKO: false,
    WEBKIT: true,
    WINDOWS: true
  };

  createHandlerAndListen();

  // IE-style Webkit events get wheelDelta divided by -40 to get detail.
  handleEvent(createFakeWebkitMouseWheelEvent(-40, 0));
  assertMouseWheelEvent(1, 1, 0);

  handleEvent(createFakeWebkitMouseWheelEvent(120, 0));
  assertMouseWheelEvent(-3, -3, 0);

  handleEvent(createFakeWebkitMouseWheelEvent(0, 120));
  assertMouseWheelEvent(-3, 0, -3);

  handleEvent(createFakeWebkitMouseWheelEvent(0, -40));
  assertMouseWheelEvent(1, 0, 1);

  handleEvent(createFakeWebkitMouseWheelEvent(80, -40));
  assertMouseWheelEvent(-2, -2, 1);
}

function testWebkitStyleMouseWheel_ieStyleOnLinux() {
  goog.userAgent = {
    OPERA: false,
    IE: false,
    GECKO: false,
    WEBKIT: true,
    WINDOWS: false,
    LINUX: true
  };
  runWebKitContinousAndDiscreteEventsTest();
}

function testWebkitStyleMouseWheel_ieStyleOnMac() {
  goog.userAgent = {
    OPERA: false,
    IE: false,
    GECKO: false,
    WEBKIT: true,
    WINDOWS: false,
    MAC: true
  };
  runWebKitContinousAndDiscreteEventsTest();
}

function runWebKitContinousAndDiscreteEventsTest() {
  goog.userAgent.isVersionOrHigher = goog.functions.TRUE;

  createHandlerAndListen();

  // IE-style wheel events.
  handleEvent(createFakeWebkitMouseWheelEvent(0, -40));
  assertMouseWheelEvent(1, 0, 1);

  handleEvent(createFakeWebkitMouseWheelEvent(80, -40));
  assertMouseWheelEvent(-2, -2, 1);

  // Even in Webkit versions that usually behave in IE style, sometimes wheel
  // events don't behave; this has been observed for instance with Macbook
  // and Chrome OS touchpads in Webkit 534.10+.
  handleEvent(createFakeWebkitMouseWheelEvent(-3, 5));
  assertMouseWheelEvent(-5, 3, -5);

  handleEvent(createFakeWebkitMouseWheelEvent(4, -7));
  assertMouseWheelEvent(7, -4, 7);
}

function testWebkitStyleMouseWheel_nonIeStyle() {
  goog.userAgent = {
    OPERA: false,
    IE: false,
    GECKO: false,
    WEBKIT: true,
    WINDOWS: false
  };

  goog.userAgent.isVersionOrHigher = goog.functions.FALSE;

  createHandlerAndListen();

  // non-IE-style Webkit events do not get wheelDelta scaled
  handleEvent(createFakeWebkitMouseWheelEvent(-1, 0));
  assertMouseWheelEvent(1, 1, 0);

  handleEvent(createFakeWebkitMouseWheelEvent(3, 0));
  assertMouseWheelEvent(-3, -3, 0);

  handleEvent(createFakeWebkitMouseWheelEvent(0, 3));
  assertMouseWheelEvent(-3, 0, -3);

  handleEvent(createFakeWebkitMouseWheelEvent(0, -1));
  assertMouseWheelEvent(1, 0, 1);

  handleEvent(createFakeWebkitMouseWheelEvent(2, -1));
  assertMouseWheelEvent(-2, -2, 1);
}

function testMaxDeltaX() {
  goog.userAgent = {
    OPERA: false,
    IE: false,
    GECKO: false,
    WEBKIT: true,
    WINDOWS: true
  };

  createHandlerAndListen();

  // IE-style Webkit events get wheelDelta divided by -40 to get detail.
  handleEvent(createFakeWebkitMouseWheelEvent(-120, 0));
  assertMouseWheelEvent(3, 3, 0);

  mouseWheelHandler.setMaxDeltaX(3);
  mouseWheelHandlerRtl.setMaxDeltaX(3);
  handleEvent(createFakeWebkitMouseWheelEvent(-120, 0));
  assertMouseWheelEvent(3, 3, 0);

  mouseWheelHandler.setMaxDeltaX(2);
  mouseWheelHandlerRtl.setMaxDeltaX(2);
  handleEvent(createFakeWebkitMouseWheelEvent(-120, 0));
  assertMouseWheelEvent(3, 2, 0);

  handleEvent(createFakeWebkitMouseWheelEvent(0, -120));
  assertMouseWheelEvent(3, 0, 3);
}

function testMaxDeltaY() {
  goog.userAgent = {
    OPERA: false,
    IE: false,
    GECKO: false,
    WEBKIT: true,
    WINDOWS: true
  };

  createHandlerAndListen();

  // IE-style Webkit events get wheelDelta divided by -40 to get detail.
  handleEvent(createFakeWebkitMouseWheelEvent(0, -120));
  assertMouseWheelEvent(3, 0, 3);

  mouseWheelHandler.setMaxDeltaY(3);
  mouseWheelHandlerRtl.setMaxDeltaY(3);
  handleEvent(createFakeWebkitMouseWheelEvent(0, -120));
  assertMouseWheelEvent(3, 0, 3);

  mouseWheelHandler.setMaxDeltaY(2);
  mouseWheelHandlerRtl.setMaxDeltaY(2);
  handleEvent(createFakeWebkitMouseWheelEvent(0, -120));
  assertMouseWheelEvent(3, 0, 2);

  handleEvent(createFakeWebkitMouseWheelEvent(-120, 0));
  assertMouseWheelEvent(3, 3, 0);
}

// Be sure to call this after setting up goog.userAgent mock and not before.
function createHandlerAndListen() {
  mouseWheelHandler = new goog.events.MouseWheelHandler(
      goog.dom.getElement('foo'));

  goog.events.listen(mouseWheelHandler,
      goog.events.MouseWheelHandler.EventType.MOUSEWHEEL,
      function(e) { mouseWheelEvent = e; });

  mouseWheelHandlerRtl = new goog.events.MouseWheelHandler(
      goog.dom.getElement('fooRtl'));

  goog.events.listen(mouseWheelHandlerRtl,
      goog.events.MouseWheelHandler.EventType.MOUSEWHEEL,
      function(e) { mouseWheelEventRtl = e; });
}

function handleEvent(event) {
  mouseWheelHandler.handleEvent(event);
  mouseWheelHandlerRtl.handleEvent(event);
}

function assertMouseWheelEvent(expectedDetail, expectedDeltaX,
    expectedDeltaY) {
  assertTrue('event should be non-null', !!mouseWheelEvent);
  assertTrue('event should have correct JS type',
      mouseWheelEvent instanceof goog.events.MouseWheelEvent);
  assertEquals('event should have correct detail property',
      expectedDetail, mouseWheelEvent.detail);
  assertEquals('event should have correct deltaX property',
      expectedDeltaX, mouseWheelEvent.deltaX);
  assertEquals('event should have correct deltaY property',
      expectedDeltaY, mouseWheelEvent.deltaY);

  // RTL
  assertTrue('event should be non-null', !!mouseWheelEventRtl);
  assertTrue('event should have correct JS type',
      mouseWheelEventRtl instanceof goog.events.MouseWheelEvent);
  assertEquals('event should have correct detail property',
      expectedDetail, mouseWheelEventRtl.detail);
  assertEquals('event should have correct deltaX property',
      -expectedDeltaX, mouseWheelEventRtl.deltaX);
  assertEquals('event should have correct deltaY property',
      expectedDeltaY, mouseWheelEventRtl.deltaY);

}

function createFakeMouseWheelEvent(type, opt_wheelDelta, opt_detail,
    opt_axis, opt_wheelDeltaX, opt_wheelDeltaY) {
  var event = {
    type: type,
    wheelDelta: goog.isDef(opt_wheelDelta) ? opt_wheelDelta : undefined,
    detail: goog.isDef(opt_detail) ? opt_detail : undefined,
    axis: opt_axis || undefined,
    wheelDeltaX: goog.isDef(opt_wheelDeltaX) ? opt_wheelDeltaX : undefined,
    wheelDeltaY: goog.isDef(opt_wheelDeltaY) ? opt_wheelDeltaY : undefined,

    // These two are constants defined on the event in FF3.1 and later.
    // It doesn't matter exactly what they are, and it doesn't affect
    // our simulations of other browsers.
    HORIZONTAL_AXIS: HORIZONTAL,
    VERTICAL_AXIS: VERTICAL
  };
  return new goog.events.BrowserEvent(event);
}

function createFakeWebkitMouseWheelEvent(wheelDeltaX, wheelDeltaY) {
  return createFakeMouseWheelEvent(DEFAULT_TYPE,
      Math.abs(wheelDeltaX) > Math.abs(wheelDeltaY) ?
          wheelDeltaX : wheelDeltaY,
      undefined, undefined, wheelDeltaX, wheelDeltaY);
}
