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

goog.provide('goog.ui.AnimatedZippyTest');
goog.setTestOnly('goog.ui.AnimatedZippyTest');

goog.require('goog.a11y.aria');
goog.require('goog.a11y.aria.State');
goog.require('goog.asserts');
goog.require('goog.dom');
goog.require('goog.events');
goog.require('goog.functions');
goog.require('goog.fx.Animation');
goog.require('goog.fx.Transition');
goog.require('goog.testing.PropertyReplacer');
goog.require('goog.testing.asserts');
goog.require('goog.testing.jsunit');
goog.require('goog.ui.AnimatedZippy');
goog.require('goog.ui.Zippy');

var animatedZippy;
var animatedZippyHeaderEl;
var propertyReplacer;

function setUp() {
  animatedZippyHeaderEl = goog.dom.getElement('t1');
  goog.asserts.assert(animatedZippyHeaderEl);
  animatedZippy = new goog.ui.AnimatedZippy(animatedZippyHeaderEl,
      goog.dom.getElement('c1'));

  propertyReplacer = new goog.testing.PropertyReplacer();
}

function tearDown() {
  propertyReplacer.reset();
  animatedZippy.dispose();
}

function testConstructor() {
  assertNotNull('must not be null', animatedZippy);
}

function testExpandCollapse() {
  var animationsPlayed = 0;
  var toggleEventsFired = 0;

  propertyReplacer.replace(goog.fx.Animation.prototype, 'play', function() {
    animationsPlayed++;
    this.dispatchAnimationEvent(goog.fx.Transition.EventType.END);
  });
  propertyReplacer.replace(goog.ui.AnimatedZippy.prototype, 'onAnimate_',
      goog.functions.NULL);

  goog.events.listenOnce(animatedZippy, goog.ui.Zippy.Events.TOGGLE,
      function(e) {
        toggleEventsFired++;
        assertTrue('TOGGLE event must be for expansion', e.expanded);
        assertEquals('expanded must be true', true,
            animatedZippy.isExpanded());
        assertEquals('aria-expanded must be true', 'true',
            goog.a11y.aria.getState(animatedZippyHeaderEl,
                goog.a11y.aria.State.EXPANDED));
      });

  animatedZippy.expand();

  goog.events.listenOnce(animatedZippy, goog.ui.Zippy.Events.TOGGLE,
      function(e) {
        toggleEventsFired++;
        assertFalse('TOGGLE event must be for collapse', e.expanded);
        assertEquals('expanded must be false', false,
            animatedZippy.isExpanded());
        assertEquals('aria-expanded must be false', 'false',
            goog.a11y.aria.getState(animatedZippyHeaderEl,
            goog.a11y.aria.State.EXPANDED));
      });

  animatedZippy.collapse();

  assertEquals('animations must play', 2, animationsPlayed);
  assertEquals('TOGGLE events must fire', 2, toggleEventsFired);
}
