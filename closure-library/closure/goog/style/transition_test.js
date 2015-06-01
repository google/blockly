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

goog.provide('goog.style.transitionTest');
goog.setTestOnly('goog.style.transitionTest');

goog.require('goog.style');
goog.require('goog.style.transition');
goog.require('goog.testing.jsunit');
goog.require('goog.userAgent');


/** Fake element. */
var element;


function setUp() {
  element = {'style': {}};
}

function getTransitionStyle(element) {
  return element.style['transition'] ||
      goog.style.getStyle(element, 'transition');
}


function testSetWithNoProperty() {
  try {
    goog.style.transition.set(element, []);
  } catch (e) {
    return;
  }
  fail('Should fail when no property is given.');
}


function testSetWithString() {
  goog.style.transition.set(element, 'opacity 1s ease-in 0.125s');
  assertEquals('opacity 1s ease-in 0.125s', getTransitionStyle(element));
}


function testSetWithSingleProperty() {
  goog.style.transition.set(element,
      {property: 'opacity', duration: 1, timing: 'ease-in', delay: 0.125});
  assertEquals('opacity 1s ease-in 0.125s', getTransitionStyle(element));
}


function testSetWithMultipleStrings() {
  goog.style.transition.set(element, [
    'width 1s ease-in',
    'height 0.5s linear 1s'
  ]);
  assertEquals('width 1s ease-in,height 0.5s linear 1s',
               getTransitionStyle(element));
}


function testSetWithMultipleProperty() {
  goog.style.transition.set(element, [
    {property: 'width', duration: 1, timing: 'ease-in', delay: 0},
    {property: 'height', duration: 0.5, timing: 'linear', delay: 1}
  ]);
  assertEquals('width 1s ease-in 0s,height 0.5s linear 1s',
      getTransitionStyle(element));
}


function testRemoveAll() {
  goog.style.setStyle(element, 'transition', 'opacity 1s ease-in');
  goog.style.transition.removeAll(element);
  assertEquals('', getTransitionStyle(element));
}


function testAddAndRemoveOnRealElement() {
  if (!goog.style.transition.isSupported()) {
    return;
  }

  var div = document.getElementById('test');
  goog.style.transition.set(div, 'opacity 1s ease-in 125ms');
  assertEquals('opacity 1s ease-in 125ms', getTransitionStyle(div));
  goog.style.transition.removeAll(div);
  assertEquals('', getTransitionStyle(div));
}


function testSanityDetectionOfCss3Transition() {
  var support = goog.style.transition.isSupported();

  // IE support starts at IE10.
  if (goog.userAgent.IE) {
    assertEquals(goog.userAgent.isVersionOrHigher('10.0'), support);
  }

  // FF support start at FF4 (Gecko 2.0)
  if (goog.userAgent.GECKO) {
    assertEquals(goog.userAgent.isVersionOrHigher('2.0'), support);
  }

  // Webkit support has existed for a long time, we assume support on
  // most webkit version in used today.
  if (goog.userAgent.WEBKIT) {
    assertTrue(support);
  }
}
