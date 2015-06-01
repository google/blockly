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

goog.provide('goog.ui.SliderBaseTest');
goog.setTestOnly('goog.ui.SliderBaseTest');

goog.require('goog.a11y.aria');
goog.require('goog.a11y.aria.State');
goog.require('goog.dom');
goog.require('goog.dom.TagName');
goog.require('goog.dom.classlist');
goog.require('goog.events');
goog.require('goog.events.EventType');
goog.require('goog.events.KeyCodes');
goog.require('goog.fx.Animation');
goog.require('goog.math.Coordinate');
goog.require('goog.style');
goog.require('goog.style.bidi');
goog.require('goog.testing.MockClock');
goog.require('goog.testing.MockControl');
goog.require('goog.testing.events');
goog.require('goog.testing.jsunit');
goog.require('goog.testing.mockmatchers');
goog.require('goog.testing.recordFunction');
goog.require('goog.ui.Component');
goog.require('goog.ui.SliderBase');
goog.require('goog.userAgent');

var oneThumbSlider;
var oneThumbSliderRtl;
var oneChangeEventCount;

var twoThumbSlider;
var twoThumbSliderRtl;
var twoChangeEventCount;

var mockClock;
var mockAnimation;



/**
 * A basic class to implement the abstract goog.ui.SliderBase for testing.
 * @constructor
 * @extends {goog.ui.SliderBase}
 */
function OneThumbSlider() {
  goog.ui.SliderBase.call(this, undefined /* domHelper */, function(value) {
    return value > 5 ? 'A big value.' : 'A small value.';
  });
}
goog.inherits(OneThumbSlider, goog.ui.SliderBase);


/** @override */
OneThumbSlider.prototype.createThumbs = function() {
  this.valueThumb = this.extentThumb = goog.dom.getElement('thumb');
};


/** @override */
OneThumbSlider.prototype.getCssClass = function(orientation) {
  return goog.getCssName('test-slider', orientation);
};



/**
 * A basic class to implement the abstract goog.ui.SliderBase for testing.
 * @constructor
 * @extends {goog.ui.SliderBase}
 */
function TwoThumbSlider() {
  goog.ui.SliderBase.call(this);
}
goog.inherits(TwoThumbSlider, goog.ui.SliderBase);


/** @override */
TwoThumbSlider.prototype.createThumbs = function() {
  this.valueThumb = goog.dom.getElement('valueThumb');
  this.extentThumb = goog.dom.getElement('extentThumb');
  this.rangeHighlight = goog.dom.getElement('rangeHighlight');
};


/** @override */
TwoThumbSlider.prototype.getCssClass = function(orientation) {
  return goog.getCssName('test-slider', orientation);
};



/**
 * Basic class that implements the AnimationFactory interface for testing.
 * @param {!goog.fx.Animation|!Array<!goog.fx.Animation>} testAnimations The
 *     test animations to use.
 * @constructor
 * @implements {goog.ui.SliderBase.AnimationFactory}
 */
function AnimationFactory(testAnimations) {
  this.testAnimations = testAnimations;
}


/** @override */
AnimationFactory.prototype.createAnimations = function() {
  return this.testAnimations;
};


function setUp() {
  var sandBox = goog.dom.getElement('sandbox');
  mockClock = new goog.testing.MockClock(true);

  var oneThumbElem = goog.dom.createDom(
      goog.dom.TagName.DIV, {'id': 'oneThumbSlider'},
      goog.dom.createDom(goog.dom.TagName.SPAN, {'id': 'thumb'}));
  sandBox.appendChild(oneThumbElem);
  oneThumbSlider = new OneThumbSlider();
  oneThumbSlider.decorate(oneThumbElem);
  oneChangeEventCount = 0;
  goog.events.listen(oneThumbSlider, goog.ui.Component.EventType.CHANGE,
      function() {
        oneChangeEventCount++;
      });

  var twoThumbElem = goog.dom.createDom(
      goog.dom.TagName.DIV, {'id': 'twoThumbSlider'},
      goog.dom.createDom(goog.dom.TagName.DIV, {'id': 'rangeHighlight'}),
      goog.dom.createDom(goog.dom.TagName.SPAN, {'id': 'valueThumb'}),
      goog.dom.createDom(goog.dom.TagName.SPAN, {'id': 'extentThumb'}));
  sandBox.appendChild(twoThumbElem);
  twoThumbSlider = new TwoThumbSlider();
  twoThumbSlider.decorate(twoThumbElem);
  twoChangeEventCount = 0;
  goog.events.listen(twoThumbSlider, goog.ui.Component.EventType.CHANGE,
      function() {
        twoChangeEventCount++;
      });

  var sandBoxRtl = goog.dom.createDom(goog.dom.TagName.DIV,
      {'dir': 'rtl', 'style': 'position:absolute;'});
  sandBox.appendChild(sandBoxRtl);

  var oneThumbElemRtl = goog.dom.createDom(
      goog.dom.TagName.DIV, {'id': 'oneThumbSliderRtl'},
      goog.dom.createDom(goog.dom.TagName.SPAN, {'id': 'thumbRtl'}));
  sandBoxRtl.appendChild(oneThumbElemRtl);
  oneThumbSliderRtl = new OneThumbSlider();
  oneThumbSliderRtl.enableFlipForRtl(true);
  oneThumbSliderRtl.decorate(oneThumbElemRtl);
  goog.events.listen(oneThumbSliderRtl, goog.ui.Component.EventType.CHANGE,
      function() {
        oneChangeEventCount++;
      });

  var twoThumbElemRtl = goog.dom.createDom(
      goog.dom.TagName.DIV, {'id': 'twoThumbSliderRtl'},
      goog.dom.createDom(goog.dom.TagName.DIV, {'id': 'rangeHighlightRtl'}),
      goog.dom.createDom(goog.dom.TagName.SPAN, {'id': 'valueThumbRtl'}),
      goog.dom.createDom(goog.dom.TagName.SPAN, {'id': 'extentThumbRtl'}));
  sandBoxRtl.appendChild(twoThumbElemRtl);
  twoThumbSliderRtl = new TwoThumbSlider();
  twoThumbSliderRtl.enableFlipForRtl(true);
  twoThumbSliderRtl.decorate(twoThumbElemRtl);
  twoChangeEventCount = 0;
  goog.events.listen(twoThumbSliderRtl, goog.ui.Component.EventType.CHANGE,
      function() {
        twoChangeEventCount++;
      });
}

function tearDown() {
  oneThumbSlider.dispose();
  twoThumbSlider.dispose();
  oneThumbSliderRtl.dispose();
  twoThumbSliderRtl.dispose();
  mockClock.dispose();
  goog.dom.getElement('sandbox').innerHTML = '';
}

function testGetAndSetValue() {
  oneThumbSlider.setValue(30);
  assertEquals(30, oneThumbSlider.getValue());
  assertEquals('Setting valid value must dispatch only a single change event.',
      1, oneChangeEventCount);

  oneThumbSlider.setValue(30);
  assertEquals(30, oneThumbSlider.getValue());
  assertEquals('Setting to same value must not dispatch change event.',
      1, oneChangeEventCount);

  oneThumbSlider.setValue(-30);
  assertEquals('Setting invalid value must not change value.',
      30, oneThumbSlider.getValue());
  assertEquals('Setting invalid value must not dispatch change event.',
      1, oneChangeEventCount);


  // Value thumb can't go past extent thumb, so we must move that first to
  // allow setting value.
  twoThumbSlider.setExtent(70);
  twoChangeEventCount = 0;
  twoThumbSlider.setValue(60);
  assertEquals(60, twoThumbSlider.getValue());
  assertEquals('Setting valid value must dispatch only a single change event.',
      1, twoChangeEventCount);

  twoThumbSlider.setValue(60);
  assertEquals(60, twoThumbSlider.getValue());
  assertEquals('Setting to same value must not dispatch change event.',
      1, twoChangeEventCount);

  twoThumbSlider.setValue(-60);
  assertEquals('Setting invalid value must not change value.',
      60, twoThumbSlider.getValue());
  assertEquals('Setting invalid value must not dispatch change event.',
      1, twoChangeEventCount);
}

function testGetAndSetValueRtl() {
  var thumbElement = goog.dom.getElement('thumbRtl');
  assertEquals(0, goog.style.bidi.getOffsetStart(thumbElement));
  assertEquals('', thumbElement.style.left);
  assertTrue(thumbElement.style.right >= 0);

  oneThumbSliderRtl.setValue(30);
  assertEquals(30, oneThumbSliderRtl.getValue());
  assertEquals('Setting valid value must dispatch only a single change event.',
      1, oneChangeEventCount);

  assertEquals('', thumbElement.style.left);
  assertTrue(thumbElement.style.right >= 0);

  oneThumbSliderRtl.setValue(30);
  assertEquals(30, oneThumbSliderRtl.getValue());
  assertEquals('Setting to same value must not dispatch change event.',
      1, oneChangeEventCount);

  oneThumbSliderRtl.setValue(-30);
  assertEquals('Setting invalid value must not change value.',
      30, oneThumbSliderRtl.getValue());
  assertEquals('Setting invalid value must not dispatch change event.',
      1, oneChangeEventCount);


  // Value thumb can't go past extent thumb, so we must move that first to
  // allow setting value.
  var valueThumbElement = goog.dom.getElement('valueThumbRtl');
  var extentThumbElement = goog.dom.getElement('extentThumbRtl');
  assertEquals(0, goog.style.bidi.getOffsetStart(valueThumbElement));
  assertEquals(0, goog.style.bidi.getOffsetStart(extentThumbElement));
  assertEquals('', valueThumbElement.style.left);
  assertTrue(valueThumbElement.style.right >= 0);
  assertEquals('', extentThumbElement.style.left);
  assertTrue(extentThumbElement.style.right >= 0);

  twoThumbSliderRtl.setExtent(70);
  twoChangeEventCount = 0;
  twoThumbSliderRtl.setValue(60);
  assertEquals(60, twoThumbSliderRtl.getValue());
  assertEquals('Setting valid value must dispatch only a single change event.',
      1, twoChangeEventCount);

  twoThumbSliderRtl.setValue(60);
  assertEquals(60, twoThumbSliderRtl.getValue());
  assertEquals('Setting to same value must not dispatch change event.',
      1, twoChangeEventCount);

  assertEquals('', valueThumbElement.style.left);
  assertTrue(valueThumbElement.style.right >= 0);
  assertEquals('', extentThumbElement.style.left);
  assertTrue(extentThumbElement.style.right >= 0);

  twoThumbSliderRtl.setValue(-60);
  assertEquals('Setting invalid value must not change value.',
      60, twoThumbSliderRtl.getValue());
  assertEquals('Setting invalid value must not dispatch change event.',
      1, twoChangeEventCount);
}

function testGetAndSetExtent() {
  // Note(user): With a one thumb slider the API only really makes sense if you
  // always use setValue since there is no extent.

  twoThumbSlider.setExtent(7);
  assertEquals(7, twoThumbSlider.getExtent());
  assertEquals('Setting valid value must dispatch only a single change event.',
      1, twoChangeEventCount);

  twoThumbSlider.setExtent(7);
  assertEquals(7, twoThumbSlider.getExtent());
  assertEquals('Setting to same value must not dispatch change event.',
      1, twoChangeEventCount);

  twoThumbSlider.setExtent(-7);
  assertEquals('Setting invalid value must not change value.',
      7, twoThumbSlider.getExtent());
  assertEquals('Setting invalid value must not dispatch change event.',
      1, twoChangeEventCount);
}

function testUpdateValueExtent() {
  twoThumbSlider.setValueAndExtent(30, 50);

  assertNotNull(twoThumbSlider.getElement());
  assertEquals('Setting value results in updating aria-valuenow',
      '30',
      goog.a11y.aria.getState(twoThumbSlider.getElement(),
          goog.a11y.aria.State.VALUENOW));
  assertEquals(30, twoThumbSlider.getValue());
  assertEquals(50, twoThumbSlider.getExtent());
}

function testValueText() {
  oneThumbSlider.setValue(10);
  assertEquals('Setting value results in correct aria-valuetext',
      'A big value.', goog.a11y.aria.getState(oneThumbSlider.getElement(),
          goog.a11y.aria.State.VALUETEXT));
  oneThumbSlider.setValue(2);
  assertEquals('Updating value results in updated aria-valuetext',
      'A small value.', goog.a11y.aria.getState(oneThumbSlider.getElement(),
          goog.a11y.aria.State.VALUETEXT));
}

function testGetValueText() {
  oneThumbSlider.setValue(10);
  assertEquals('Getting the text value gets the correct description',
      'A big value.', oneThumbSlider.getTextValue());
  oneThumbSlider.setValue(2);
  assertEquals(
      'Getting the updated text value gets the correct updated description',
      'A small value.', oneThumbSlider.getTextValue());
}

function testRangeListener() {
  var slider = new goog.ui.SliderBase;
  slider.updateUi_ = slider.updateAriaStates = function() {};
  slider.rangeModel.setValue(0);

  var f = goog.testing.recordFunction();
  goog.events.listen(slider, goog.ui.Component.EventType.CHANGE, f);

  slider.rangeModel.setValue(50);
  assertEquals(1, f.getCallCount());

  slider.exitDocument();
  slider.rangeModel.setValue(0);
  assertEquals('The range model listener should not have been removed so we ' +
               'should have gotten a second event dispatch',
               2, f.getCallCount());
}


/**
 * Verifies that rangeHighlight position and size are correct for the given
 * startValue and endValue. Assumes slider has default min/max values [0, 100],
 * width of 1020px, and thumb widths of 20px, with rangeHighlight drawn from
 * the centers of the thumbs.
 * @param {number} rangeHighlight The range highlight.
 * @param {number} startValue The start value.
 * @param {number} endValue The end value.
 */
function assertHighlightedRange(rangeHighlight, startValue, endValue) {
  var rangeStr = '[' + startValue + ', ' + endValue + ']';
  var rangeStart = 10 + 10 * startValue;
  assertEquals('Range highlight for ' + rangeStr + ' should start at ' +
      rangeStart + 'px.', rangeStart, rangeHighlight.offsetLeft);
  var rangeSize = 10 * (endValue - startValue);
  assertEquals('Range highlight for ' + rangeStr + ' should have size ' +
      rangeSize + 'px.', rangeSize, rangeHighlight.offsetWidth);
}

function testKeyHandlingTests() {
  twoThumbSlider.setValue(0);
  twoThumbSlider.setExtent(100);
  assertEquals(0, twoThumbSlider.getValue());
  assertEquals(100, twoThumbSlider.getExtent());

  goog.testing.events.fireKeySequence(
      twoThumbSlider.getElement(), goog.events.KeyCodes.RIGHT);
  assertEquals(1, twoThumbSlider.getValue());
  assertEquals(99, twoThumbSlider.getExtent());

  goog.testing.events.fireKeySequence(
      twoThumbSlider.getElement(), goog.events.KeyCodes.RIGHT);
  assertEquals(2, twoThumbSlider.getValue());
  assertEquals(98, twoThumbSlider.getExtent());

  goog.testing.events.fireKeySequence(
      twoThumbSlider.getElement(), goog.events.KeyCodes.LEFT);
  assertEquals(1, twoThumbSlider.getValue());
  assertEquals(98, twoThumbSlider.getExtent());

  goog.testing.events.fireKeySequence(
      twoThumbSlider.getElement(), goog.events.KeyCodes.LEFT);
  assertEquals(0, twoThumbSlider.getValue());
  assertEquals(98, twoThumbSlider.getExtent());

  goog.testing.events.fireKeySequence(
      twoThumbSlider.getElement(), goog.events.KeyCodes.RIGHT,
      { shiftKey: true });
  assertEquals(10, twoThumbSlider.getValue());
  assertEquals(90, twoThumbSlider.getExtent());

  goog.testing.events.fireKeySequence(
      twoThumbSlider.getElement(), goog.events.KeyCodes.RIGHT,
      { shiftKey: true });
  assertEquals(20, twoThumbSlider.getValue());
  assertEquals(80, twoThumbSlider.getExtent());

  goog.testing.events.fireKeySequence(
      twoThumbSlider.getElement(), goog.events.KeyCodes.LEFT,
      { shiftKey: true });
  assertEquals(10, twoThumbSlider.getValue());
  assertEquals(80, twoThumbSlider.getExtent());

  goog.testing.events.fireKeySequence(
      twoThumbSlider.getElement(), goog.events.KeyCodes.LEFT,
      { shiftKey: true });
  assertEquals(0, twoThumbSlider.getValue());
  assertEquals(80, twoThumbSlider.getExtent());
}

function testKeyHandlingLargeStepSize() {
  twoThumbSlider.setValue(0);
  twoThumbSlider.setExtent(100);
  twoThumbSlider.setStep(5);
  assertEquals(0, twoThumbSlider.getValue());
  assertEquals(100, twoThumbSlider.getExtent());

  goog.testing.events.fireKeySequence(
      twoThumbSlider.getElement(), goog.events.KeyCodes.RIGHT);
  assertEquals(5, twoThumbSlider.getValue());
  assertEquals(95, twoThumbSlider.getExtent());

  goog.testing.events.fireKeySequence(
      twoThumbSlider.getElement(), goog.events.KeyCodes.RIGHT);
  assertEquals(10, twoThumbSlider.getValue());
  assertEquals(90, twoThumbSlider.getExtent());

  goog.testing.events.fireKeySequence(
      twoThumbSlider.getElement(), goog.events.KeyCodes.LEFT);
  assertEquals(5, twoThumbSlider.getValue());
  assertEquals(90, twoThumbSlider.getExtent());

  goog.testing.events.fireKeySequence(
      twoThumbSlider.getElement(), goog.events.KeyCodes.LEFT);
  assertEquals(0, twoThumbSlider.getValue());
  assertEquals(90, twoThumbSlider.getExtent());
}

function testKeyHandlingRtl() {
  twoThumbSliderRtl.setValue(0);
  twoThumbSliderRtl.setExtent(100);
  assertEquals(0, twoThumbSliderRtl.getValue());
  assertEquals(100, twoThumbSliderRtl.getExtent());

  goog.testing.events.fireKeySequence(
      twoThumbSliderRtl.getElement(), goog.events.KeyCodes.RIGHT);
  assertEquals(0, twoThumbSliderRtl.getValue());
  assertEquals(99, twoThumbSliderRtl.getExtent());

  goog.testing.events.fireKeySequence(
      twoThumbSliderRtl.getElement(), goog.events.KeyCodes.RIGHT);
  assertEquals(0, twoThumbSliderRtl.getValue());
  assertEquals(98, twoThumbSliderRtl.getExtent());

  goog.testing.events.fireKeySequence(
      twoThumbSliderRtl.getElement(), goog.events.KeyCodes.LEFT);
  assertEquals(1, twoThumbSliderRtl.getValue());
  assertEquals(98, twoThumbSliderRtl.getExtent());

  goog.testing.events.fireKeySequence(
      twoThumbSliderRtl.getElement(), goog.events.KeyCodes.LEFT);
  assertEquals(2, twoThumbSliderRtl.getValue());
  assertEquals(98, twoThumbSliderRtl.getExtent());

  goog.testing.events.fireKeySequence(
      twoThumbSliderRtl.getElement(), goog.events.KeyCodes.RIGHT,
      { shiftKey: true });
  assertEquals(0, twoThumbSliderRtl.getValue());
  assertEquals(90, twoThumbSliderRtl.getExtent());

  goog.testing.events.fireKeySequence(
      twoThumbSliderRtl.getElement(), goog.events.KeyCodes.RIGHT,
      { shiftKey: true });
  assertEquals(0, twoThumbSliderRtl.getValue());
  assertEquals(80, twoThumbSliderRtl.getExtent());

  goog.testing.events.fireKeySequence(
      twoThumbSliderRtl.getElement(), goog.events.KeyCodes.LEFT,
      { shiftKey: true });
  assertEquals(10, twoThumbSliderRtl.getValue());
  assertEquals(80, twoThumbSliderRtl.getExtent());

  goog.testing.events.fireKeySequence(
      twoThumbSliderRtl.getElement(), goog.events.KeyCodes.LEFT,
      { shiftKey: true });
  assertEquals(20, twoThumbSliderRtl.getValue());
  assertEquals(80, twoThumbSliderRtl.getExtent());
}

function testRangeHighlight() {
  var rangeHighlight = goog.dom.getElement('rangeHighlight');

  // Test [0, 100]
  twoThumbSlider.setValue(0);
  twoThumbSlider.setExtent(100);
  assertHighlightedRange(rangeHighlight, 0, 100);

  // Test [25, 75]
  twoThumbSlider.setValue(25);
  twoThumbSlider.setExtent(50);
  assertHighlightedRange(rangeHighlight, 25, 75);

  // Test [50, 50]
  twoThumbSlider.setValue(50);
  twoThumbSlider.setExtent(0);
  assertHighlightedRange(rangeHighlight, 50, 50);
}

function testRangeHighlightAnimation() {
  var animationDelay = 160; // Delay in ms, is a bit higher than actual delay.
  if (goog.userAgent.IE) {
    // For some reason, (probably due to how timing works), IE7 and IE8 will not
    // stop if we don't wait for it.
    animationDelay = 250;
  }

  var rangeHighlight = goog.dom.getElement('rangeHighlight');
  twoThumbSlider.setValue(0);
  twoThumbSlider.setExtent(100);

  // Animate right thumb, final range is [0, 75]
  twoThumbSlider.animatedSetValue(75);
  assertHighlightedRange(rangeHighlight, 0, 100);
  mockClock.tick(animationDelay);
  assertHighlightedRange(rangeHighlight, 0, 75);

  // Animate left thumb, final range is [25, 75]
  twoThumbSlider.animatedSetValue(25);
  assertHighlightedRange(rangeHighlight, 0, 75);
  mockClock.tick(animationDelay);
  assertHighlightedRange(rangeHighlight, 25, 75);
}


/**
 * Verifies that no error occurs and that the range highlight is sized correctly
 * for a zero-size slider (i.e. doesn't attempt to set a negative size). The
 * test tries to resize the slider from its original size to 0, then checks
 * that the range highlight's size is correctly set to 0.
 *
 * The size verification is needed because Webkit/Gecko outright ignore calls
 * to set negative sizes on an element, leaving it at its former size. IE
 * throws an error in the same situation.
 */
function testRangeHighlightForZeroSizeSlider() {
  // Make sure range highlight spans whole slider before zeroing width.
  twoThumbSlider.setExtent(100);
  twoThumbSlider.getElement().style.width = 0;

  // The setVisible call is used to force a UI update.
  twoThumbSlider.setVisible(true);
  assertEquals('Range highlight size should be 0 when slider size is 0',
      0, goog.dom.getElement('rangeHighlight').offsetWidth);
}

function testAnimatedSetValueAnimatesFactoryCreatedAnimations() {
  // Create and set the factory.
  var ignore = goog.testing.mockmatchers.ignoreArgument;
  var mockControl = new goog.testing.MockControl();
  var mockAnimation1 = mockControl.createLooseMock(goog.fx.Animation);
  var mockAnimation2 = mockControl.createLooseMock(goog.fx.Animation);
  var testAnimations = [mockAnimation1, mockAnimation2];
  oneThumbSlider.setAdditionalAnimations(new AnimationFactory(testAnimations));

  // Expect the animations to be played.
  mockAnimation1.play(false);
  mockAnimation2.play(false);
  mockAnimation1.addEventListener(ignore, ignore, ignore);
  mockAnimation2.addEventListener(ignore, ignore, ignore);

  // Animate and verify.
  mockControl.$replayAll();
  oneThumbSlider.animatedSetValue(50);
  mockControl.$verifyAll();
  mockControl.$resetAll();
  mockControl.$tearDown();
}

function testMouseWheelEventHandlerEnable() {
  // Mouse wheel handling should be enabled by default.
  assertTrue(oneThumbSlider.isHandleMouseWheel());

  // Test disabling the mouse wheel handler
  oneThumbSlider.setHandleMouseWheel(false);
  assertFalse(oneThumbSlider.isHandleMouseWheel());

  // Test that enabling again works fine.
  oneThumbSlider.setHandleMouseWheel(true);
  assertTrue(oneThumbSlider.isHandleMouseWheel());

  // Test that mouse wheel handling can be disabled before rendering a slider.
  var wheelDisabledElem = goog.dom.createDom(
      goog.dom.TagName.DIV, {}, goog.dom.createDom(goog.dom.TagName.SPAN));
  var wheelDisabledSlider = new OneThumbSlider();
  wheelDisabledSlider.setHandleMouseWheel(false);
  wheelDisabledSlider.decorate(wheelDisabledElem);
  assertFalse(wheelDisabledSlider.isHandleMouseWheel());
}

function testDisabledAndEnabledSlider() {
  // Check that a slider is enabled by default
  assertTrue(oneThumbSlider.isEnabled());

  var listenerCount = oneThumbSlider.getHandler().getListenerCount();
  // Disable the slider and check its state
  oneThumbSlider.setEnabled(false);
  assertFalse(oneThumbSlider.isEnabled());
  assertTrue(goog.dom.classlist.contains(
      oneThumbSlider.getElement(), 'goog-slider-disabled'));
  assertEquals(0, oneThumbSlider.getHandler().getListenerCount());

  // setValue should work unaffected even when the slider is disabled.
  oneThumbSlider.setValue(30);
  assertEquals(30, oneThumbSlider.getValue());
  assertEquals('Setting valid value must dispatch a change event ' +
      'even when slider is disabled.', 1, oneChangeEventCount);

  // Test the transition from disabled to enabled
  oneThumbSlider.setEnabled(true);
  assertTrue(oneThumbSlider.isEnabled());
  assertFalse(goog.dom.classlist.contains(
      oneThumbSlider.getElement(), 'goog-slider-disabled'));
  assertTrue(listenerCount == oneThumbSlider.getHandler().getListenerCount());
}

function testBlockIncrementingWithEnableAndDisabled() {
  var doc = goog.dom.getOwnerDocument(oneThumbSlider.getElement());
  // Case when slider is not disabled between the mouse down and up events.
  goog.testing.events.fireMouseDownEvent(oneThumbSlider.getElement());
  assertEquals(1, goog.events.getListeners(
      oneThumbSlider.getElement(),
      goog.events.EventType.MOUSEMOVE, false).length);
  assertEquals(1, goog.events.getListeners(
      doc, goog.events.EventType.MOUSEUP, true).length);

  goog.testing.events.fireMouseUpEvent(oneThumbSlider.getElement());

  assertEquals(0, goog.events.getListeners(
      oneThumbSlider.getElement(),
      goog.events.EventType.MOUSEMOVE, false).length);
  assertEquals(0, goog.events.getListeners(
      doc, goog.events.EventType.MOUSEUP, true).length);

  // Case when the slider is disabled between the mouse down and up events.
  goog.testing.events.fireMouseDownEvent(oneThumbSlider.getElement());
  assertEquals(1, goog.events.getListeners(
      oneThumbSlider.getElement(),
      goog.events.EventType.MOUSEMOVE, false).length);
  assertEquals(1,
      goog.events.getListeners(doc,
      goog.events.EventType.MOUSEUP, true).length);

  oneThumbSlider.setEnabled(false);

  assertEquals(0, goog.events.getListeners(
      oneThumbSlider.getElement(),
      goog.events.EventType.MOUSEMOVE, false).length);
  assertEquals(0, goog.events.getListeners(
      doc, goog.events.EventType.MOUSEUP, true).length);
  assertEquals(1, oneThumbSlider.getHandler().getListenerCount());

  goog.testing.events.fireMouseUpEvent(oneThumbSlider.getElement());
  assertEquals(0, goog.events.getListeners(
      oneThumbSlider.getElement(),
      goog.events.EventType.MOUSEMOVE, false).length);
  assertEquals(0, goog.events.getListeners(
      doc, goog.events.EventType.MOUSEUP, true).length);
}

function testMouseClickWithMoveToPointEnabled() {
  var stepSize = 20;
  oneThumbSlider.setStep(stepSize);
  oneThumbSlider.setMoveToPointEnabled(true);
  var initialValue = oneThumbSlider.getValue();

  // Figure out the number of pixels per step.
  var numSteps = Math.round(
      (oneThumbSlider.getMaximum() - oneThumbSlider.getMinimum()) / stepSize);
  var size = goog.style.getSize(oneThumbSlider.getElement());
  var pixelsPerStep = Math.round(size.width / numSteps);

  var coords = goog.style.getClientPosition(oneThumbSlider.getElement());
  coords.x += pixelsPerStep / 2;

  // Case when value is increased
  goog.testing.events.fireClickSequence(oneThumbSlider.getElement(),
      /* opt_button */ undefined, coords);
  assertEquals(oneThumbSlider.getValue(), initialValue + stepSize);

  // Case when value is decreased
  goog.testing.events.fireClickSequence(oneThumbSlider.getElement(),
      /* opt_button */ undefined, coords);
  assertEquals(oneThumbSlider.getValue(), initialValue);

  // Case when thumb is clicked
  goog.testing.events.fireClickSequence(oneThumbSlider.getElement());
  assertEquals(oneThumbSlider.getValue(), initialValue);
}

function testNonIntegerStepSize() {
  var stepSize = 0.02;
  oneThumbSlider.setStep(stepSize);
  oneThumbSlider.setMinimum(-1);
  oneThumbSlider.setMaximum(1);
  oneThumbSlider.setValue(0.7);
  assertRoughlyEquals(0.7, oneThumbSlider.getValue(), 0.000001);
  oneThumbSlider.setValue(0.3);
  assertRoughlyEquals(0.3, oneThumbSlider.getValue(), 0.000001);
}

function testSingleThumbSliderHasZeroExtent() {
  var stepSize = 0.02;
  oneThumbSlider.setStep(stepSize);
  oneThumbSlider.setMinimum(-1);
  oneThumbSlider.setMaximum(1);
  oneThumbSlider.setValue(0.7);
  assertEquals(0, oneThumbSlider.getExtent());
  oneThumbSlider.setValue(0.3);
  assertEquals(0, oneThumbSlider.getExtent());
}


/**
 * Tests getThumbCoordinateForValue method.
 */
function testThumbCoordinateForValueWithHorizontalSlider() {
  // Make sure the y-coordinate stays the same for the horizontal slider.
  var originalY = goog.style.getPosition(oneThumbSlider.valueThumb).y;
  var width = oneThumbSlider.getElement().clientWidth -
      oneThumbSlider.valueThumb.offsetWidth;
  var range = oneThumbSlider.getMaximum() - oneThumbSlider.getMinimum();

  // Verify coordinate for a particular value.
  var value = 20;
  var expectedX = Math.round(value / range * width);
  var expectedCoord = new goog.math.Coordinate(expectedX, originalY);
  var coord = oneThumbSlider.getThumbCoordinateForValue(value);
  assertObjectEquals(expectedCoord, coord);

  // Verify this works regardless of current position.
  oneThumbSlider.setValue(value / 2);
  coord = oneThumbSlider.getThumbCoordinateForValue(value);
  assertObjectEquals(expectedCoord, coord);
}

function testThumbCoordinateForValueWithVerticalSlider() {
  // Make sure the x-coordinate stays the same for the vertical slider.
  oneThumbSlider.setOrientation(goog.ui.SliderBase.Orientation.VERTICAL);
  var originalX = goog.style.getPosition(oneThumbSlider.valueThumb).x;
  var height = oneThumbSlider.getElement().clientHeight -
      oneThumbSlider.valueThumb.offsetHeight;
  var range = oneThumbSlider.getMaximum() - oneThumbSlider.getMinimum();

  // Verify coordinate for a particular value.
  var value = 20;
  var expectedY = height - Math.round(value / range * height);
  var expectedCoord = new goog.math.Coordinate(originalX, expectedY);
  var coord = oneThumbSlider.getThumbCoordinateForValue(value);
  assertObjectEquals(expectedCoord, coord);

  // Verify this works regardless of current position.
  oneThumbSlider.setValue(value / 2);
  coord = oneThumbSlider.getThumbCoordinateForValue(value);
  assertObjectEquals(expectedCoord, coord);
}


/**
 * Tests getValueFromMousePosition method.
 */
function testValueFromMousePosition() {
  var value = 30;
  oneThumbSlider.setValue(value);
  var offset = goog.style.getPageOffset(oneThumbSlider.valueThumb);
  var size = goog.style.getSize(oneThumbSlider.valueThumb);
  offset.x += size.width / 2;
  offset.y += size.height / 2;
  var e = null;
  goog.events.listen(oneThumbSlider, goog.events.EventType.MOUSEMOVE,
      function(evt) {
        e = evt;
      });
  goog.testing.events.fireMouseMoveEvent(oneThumbSlider, offset);
  assertNotEquals(e, null);
  assertEquals(
      value, Math.round(oneThumbSlider.getValueFromMousePosition(e)));
  // Verify this works regardless of current position.
  oneThumbSlider.setValue(value / 2);
  assertEquals(
      value, Math.round(oneThumbSlider.getValueFromMousePosition(e)));
}


/**
 * Tests ignoring click event after mousedown event.
 */
function testClickAfterMousedown() {
  // Get the center of the thumb at value zero.
  oneThumbSlider.setValue(0);
  var offset = goog.style.getPageOffset(oneThumbSlider.valueThumb);
  var size = goog.style.getSize(oneThumbSlider.valueThumb);
  offset.x += size.width / 2;
  offset.y += size.height / 2;

  var sliderElement = oneThumbSlider.getElement();
  var width = sliderElement.clientWidth - size.width;
  var range = oneThumbSlider.getMaximum() - oneThumbSlider.getMinimum();
  var offsetXAtZero = offset.x;

  // Temporarily control time.
  var theTime = goog.now();
  var saveGoogNow = goog.now;
  goog.now = function() { return theTime; };

  // set coordinate for a particular value.
  var valueOne = 10;
  offset.x = offsetXAtZero + Math.round(valueOne / range * width);
  goog.testing.events.fireMouseDownEvent(sliderElement, null, offset);
  assertEquals(valueOne, oneThumbSlider.getValue());

  // Verify a click event with another value that follows quickly is ignored.
  theTime += oneThumbSlider.MOUSE_DOWN_DELAY_ / 2;
  var valueTwo = 20;
  offset.x = offsetXAtZero + Math.round(valueTwo / range * width);
  goog.testing.events.fireClickEvent(sliderElement, null, offset);
  assertEquals(valueOne, oneThumbSlider.getValue());

  // Verify a click later in time does move the thumb.
  theTime += oneThumbSlider.MOUSE_DOWN_DELAY_;
  goog.testing.events.fireClickEvent(sliderElement, null, offset);
  assertEquals(valueTwo, oneThumbSlider.getValue());

  goog.now = saveGoogNow;
}


/**
 * Tests dragging events.
 */
function testDragEvents() {
  var offset = goog.style.getPageOffset(oneThumbSlider.valueThumb);
  var size = goog.style.getSize(oneThumbSlider.valueThumb);
  offset.x += size.width / 2;
  offset.y += size.height / 2;
  var event_types = [];
  var handler = function(evt) {
    event_types.push(evt.type);
  };

  goog.events.listen(oneThumbSlider,
      [goog.ui.SliderBase.EventType.DRAG_START,
       goog.ui.SliderBase.EventType.DRAG_END,
       goog.ui.SliderBase.EventType.DRAG_VALUE_START,
       goog.ui.SliderBase.EventType.DRAG_VALUE_END,
       goog.ui.SliderBase.EventType.DRAG_EXTENT_START,
       goog.ui.SliderBase.EventType.DRAG_EXTENT_END,
       goog.ui.Component.EventType.CHANGE],
      handler);

  // Since the order of the events between value and extent is not guaranteed
  // accross browsers, we need to allow for both here and once we have
  // them all, make sure that they were different.
  function isValueOrExtentDragStart(type) {
    return type == goog.ui.SliderBase.EventType.DRAG_VALUE_START ||
        type == goog.ui.SliderBase.EventType.DRAG_EXTENT_START;
  };
  function isValueOrExtentDragEnd(type) {
    return type == goog.ui.SliderBase.EventType.DRAG_VALUE_END ||
        type == goog.ui.SliderBase.EventType.DRAG_EXTENT_END;
  };

  // Test that dragging the thumb calls all the correct events.
  goog.testing.events.fireMouseDownEvent(oneThumbSlider.valueThumb);
  offset.x += 100;
  goog.testing.events.fireMouseMoveEvent(oneThumbSlider.valueThumb, offset);
  goog.testing.events.fireMouseUpEvent(oneThumbSlider.valueThumb);

  assertEquals(9, event_types.length);

  assertEquals(goog.ui.SliderBase.EventType.DRAG_START, event_types[0]);
  assertTrue(isValueOrExtentDragStart(event_types[1]));

  assertEquals(goog.ui.SliderBase.EventType.DRAG_START, event_types[2]);
  assertTrue(isValueOrExtentDragStart(event_types[3]));

  assertEquals(goog.ui.Component.EventType.CHANGE, event_types[4]);

  assertEquals(goog.ui.SliderBase.EventType.DRAG_END, event_types[5]);
  assertTrue(isValueOrExtentDragEnd(event_types[6]));

  assertEquals(goog.ui.SliderBase.EventType.DRAG_END, event_types[7]);
  assertTrue(isValueOrExtentDragEnd(event_types[8]));

  assertFalse(event_types[1] == event_types[3]);
  assertFalse(event_types[6] == event_types[8]);

  // Test that clicking the thumb without moving the mouse does not cause a
  // CHANGE event between DRAG_START/DRAG_END.
  event_types = [];
  goog.testing.events.fireMouseDownEvent(oneThumbSlider.valueThumb);
  goog.testing.events.fireMouseUpEvent(oneThumbSlider.valueThumb);

  assertEquals(8, event_types.length);

  assertEquals(goog.ui.SliderBase.EventType.DRAG_START, event_types[0]);
  assertTrue(isValueOrExtentDragStart(event_types[1]));

  assertEquals(goog.ui.SliderBase.EventType.DRAG_START, event_types[2]);
  assertTrue(isValueOrExtentDragStart(event_types[3]));

  assertEquals(goog.ui.SliderBase.EventType.DRAG_END, event_types[4]);
  assertTrue(isValueOrExtentDragEnd(event_types[5]));

  assertEquals(goog.ui.SliderBase.EventType.DRAG_END, event_types[6]);
  assertTrue(isValueOrExtentDragEnd(event_types[7]));

  assertFalse(event_types[1] == event_types[3]);
  assertFalse(event_types[5] == event_types[7]);

  // Early listener removal, do not wait for tearDown, to avoid building up
  // arrays of events unnecessarilly in further tests.
  goog.events.removeAll(oneThumbSlider);
}
