// Copyright 2014 The Closure Library Authors. All Rights Reserved.
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

goog.provide('goog.events.WheelHandlerTest');
goog.setTestOnly('goog.events.WheelHandlerTest');

goog.require('goog.dom');
goog.require('goog.events');
goog.require('goog.events.BrowserEvent');
goog.require('goog.events.WheelEvent');
goog.require('goog.events.WheelHandler');
goog.require('goog.string');
goog.require('goog.testing.PropertyReplacer');
goog.require('goog.testing.events');
goog.require('goog.testing.jsunit');
goog.require('goog.userAgent');
goog.require('goog.userAgent.product');

var log;
var stubs = new goog.testing.PropertyReplacer();

var PREFERRED_TYPE = 'wheel';
var LEGACY_TYPE = 'mousewheel';
var GECKO_TYPE = 'DOMMouseScroll';

var HORIZONTAL = 'h';
var VERTICAL = 'v';

var DeltaMode = goog.events.WheelEvent.DeltaMode;

var mouseWheelEvent;
var mouseWheelEventRtl;
var mouseWheelHandler;
var mouseWheelHandlerRtl;

function setUpPage() {
  log = goog.dom.getElement('log');
}

function setUp() {
  stubs.remove(goog, 'userAgent');
  goog.userAgent = {
    product: {
      CHROME: false,
      version: 0,
      isVersion: function(version) {
        return goog.string.compareVersions(this.version, version) >= 0;
      }
    },
    GECKO: false,
    IE: false,
    version: 0,
    isVersionOrHigher: function(version) {
      return goog.string.compareVersions(this.version, version) >= 0;
    }
  };
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
  mouseWheelHandler = new goog.events.WheelHandler(document.body);

  goog.events.listen(
      mouseWheelHandler, goog.events.WheelEvent.EventType.WHEEL, function(e) {
        log.innerHTML += goog.string.subs(
            '<br />(deltaX, deltaY): (%s, %s)', e.deltaX, e.deltaY);
      });
}

function testGetDomEventType() {
  // Defaults to legacy non-gecko event.
  assertEquals(LEGACY_TYPE, goog.events.WheelHandler.getDomEventType());

  // Gecko start to support wheel with version 17.
  goog.userAgent.GECKO = true;
  goog.userAgent.version = 16;
  assertEquals(GECKO_TYPE, goog.events.WheelHandler.getDomEventType());
  goog.userAgent.version = 17;
  assertEquals(PREFERRED_TYPE, goog.events.WheelHandler.getDomEventType());
  goog.userAgent.GECKO = false;

  // IE started with version 9.
  goog.userAgent.IE = true;
  goog.userAgent.version = 8;
  assertEquals(LEGACY_TYPE, goog.events.WheelHandler.getDomEventType());
  goog.userAgent.version = 9;
  assertEquals(PREFERRED_TYPE, goog.events.WheelHandler.getDomEventType());
  goog.userAgent.IE = false;

  // Chrome started with version 31.
  goog.userAgent.product.CHROME = true;
  goog.userAgent.product.version = 30;
  assertEquals(LEGACY_TYPE, goog.events.WheelHandler.getDomEventType());
  goog.userAgent.product.version = 31;
  assertEquals(PREFERRED_TYPE, goog.events.WheelHandler.getDomEventType());
  goog.userAgent.product.CHROME = false;
}

function testPreferredStyleWheel() {
  // Enable 'wheel'
  goog.userAgent.IE = true;
  goog.userAgent.version = 9;
  createHandlerAndListen();

  handleEvent(createFakePreferredEvent(DeltaMode.PIXEL, 10, 20, 30));
  assertWheelEvent(DeltaMode.PIXEL, 10, 20, 30);
  assertPixelDeltas(1);

  handleEvent(createFakePreferredEvent(DeltaMode.LINE, 10, 20, 30));
  assertWheelEvent(DeltaMode.LINE, 10, 20, 30);
  assertPixelDeltas(15);

  handleEvent(createFakePreferredEvent(DeltaMode.PAGE, 10, 20, 30));
  assertWheelEvent(DeltaMode.PAGE, 10, 20, 30);
  assertPixelDeltas(30 * 15);
}

function testLegacyStyleWheel() {
  // 'mousewheel' enabled by default
  createHandlerAndListen();

  // Test one dimensional.
  handleEvent(createFakeLegacyEvent(10));
  assertWheelEvent(DeltaMode.PIXEL, 0, -10, 0);
  assertPixelDeltas(1);

  // Test two dimensional.
  handleEvent(createFakeLegacyEvent(/* ignored */ 10, 20, 30));
  assertWheelEvent(DeltaMode.PIXEL, -20, -30, 0);
  assertPixelDeltas(1);
}

function testLegacyGeckoStyleWheel() {
  goog.userAgent.GECKO = true;
  createHandlerAndListen();

  // Test no axis.
  handleEvent(createFakeGeckoEvent(10));
  assertWheelEvent(DeltaMode.LINE, 0, 10, 0);
  assertPixelDeltas(15);

  // Vertical axis.
  handleEvent(createFakeGeckoEvent(10, VERTICAL));
  assertWheelEvent(DeltaMode.LINE, 0, 10, 0);
  assertPixelDeltas(15);

  // Horizontal axis.
  handleEvent(createFakeGeckoEvent(10, HORIZONTAL));
  assertWheelEvent(DeltaMode.LINE, 10, 0, 0);
  assertPixelDeltas(15);
}

function testLegacyIeStyleWheel() {
  goog.userAgent.IE = true;

  createHandlerAndListen();

  // Non-gecko, non-webkit events get wheelDelta divided by -40 to get detail.
  handleEvent(createFakeLegacyEvent(120));
  assertWheelEvent(DeltaMode.PIXEL, 0, -120, 0);

  handleEvent(createFakeLegacyEvent(-120));
  assertWheelEvent(DeltaMode.PIXEL, 0, 120, 0);

  handleEvent(createFakeLegacyEvent(1200));
  assertWheelEvent(DeltaMode.PIXEL, 0, -1200, 0);
}

function testNullBody() {
  goog.userAgent.IE = true;
  var documentObjectWithNoBody = {};
  goog.testing.events.mixinListenable(documentObjectWithNoBody);
  mouseWheelHandler = new goog.events.WheelHandler(documentObjectWithNoBody);
}

// Be sure to call this after setting up goog.userAgent mock and not before.
function createHandlerAndListen() {
  mouseWheelHandler = new goog.events.WheelHandler(goog.dom.getElement('foo'));

  goog.events.listen(
      mouseWheelHandler, goog.events.WheelEvent.EventType.WHEEL,
      function(e) { mouseWheelEvent = e; });

  mouseWheelHandlerRtl =
      new goog.events.WheelHandler(goog.dom.getElement('fooRtl'));

  goog.events.listen(
      mouseWheelHandlerRtl, goog.events.WheelEvent.EventType.WHEEL,
      function(e) { mouseWheelEventRtl = e; });
}

function handleEvent(event) {
  mouseWheelHandler.handleEvent(event);
  mouseWheelHandlerRtl.handleEvent(event);
}

function assertWheelEvent(deltaMode, deltaX, deltaY, deltaZ) {
  assertTrue('event should be non-null', !!mouseWheelEvent);
  assertTrue(
      'event should have correct JS type',
      mouseWheelEvent instanceof goog.events.WheelEvent);
  assertEquals(
      'event should have correct deltaMode property', deltaMode,
      mouseWheelEvent.deltaMode);
  assertEquals(
      'event should have correct deltaX property', deltaX,
      mouseWheelEvent.deltaX);
  assertEquals(
      'event should have correct deltaY property', deltaY,
      mouseWheelEvent.deltaY);
  assertEquals(
      'event should have correct deltaZ property', deltaZ,
      mouseWheelEvent.deltaZ);

  // RTL
  assertTrue('event should be non-null', !!mouseWheelEventRtl);
  assertTrue(
      'event should have correct JS type',
      mouseWheelEventRtl instanceof goog.events.WheelEvent);
  assertEquals(
      'event should have correct deltaMode property', deltaMode,
      mouseWheelEventRtl.deltaMode);
  assertEquals(
      'event should have correct deltaX property', -deltaX,
      mouseWheelEventRtl.deltaX);
  assertEquals(
      'event should have correct deltaY property', deltaY,
      mouseWheelEventRtl.deltaY);
  assertEquals(
      'event should have correct deltaZ property', deltaZ,
      mouseWheelEventRtl.deltaZ);
}

function assertPixelDeltas(scale) {
  assertEquals(mouseWheelEvent.deltaX * scale, mouseWheelEvent.pixelDeltaX);
  assertEquals(mouseWheelEvent.deltaY * scale, mouseWheelEvent.pixelDeltaY);
  assertEquals(mouseWheelEvent.deltaZ * scale, mouseWheelEvent.pixelDeltaZ);

  // RTL
  assertEquals(
      mouseWheelEventRtl.deltaX * scale, mouseWheelEventRtl.pixelDeltaX);
  assertEquals(
      mouseWheelEventRtl.deltaY * scale, mouseWheelEventRtl.pixelDeltaY);
  assertEquals(
      mouseWheelEventRtl.deltaZ * scale, mouseWheelEventRtl.pixelDeltaZ);
}

function createFakePreferredEvent(
    opt_deltaMode, opt_deltaX, opt_deltaY, opt_deltaZ) {
  var event = {
    type: PREFERRED_TYPE,
    deltaMode: opt_deltaMode,
    deltaX: opt_deltaX,
    deltaY: opt_deltaY,
    deltaZ: opt_deltaZ
  };
  return new goog.events.BrowserEvent(event);
}


function createFakeLegacyEvent(
    opt_wheelDelta, opt_wheelDeltaX, opt_wheelDeltaY) {
  var event = {
    type: LEGACY_TYPE,
    wheelDelta: opt_wheelDelta,
    wheelDeltaX: opt_wheelDeltaX,
    wheelDeltaY: opt_wheelDeltaY
  };
  return new goog.events.BrowserEvent(event);
}

function createFakeGeckoEvent(opt_detail, opt_axis) {
  var event = {
    type: GECKO_TYPE,
    detail: opt_detail,
    axis: opt_axis,
    HORIZONTAL_AXIS: HORIZONTAL,
    VERTICAL_AXIS: VERTICAL
  };
  return new goog.events.BrowserEvent(event);
}
