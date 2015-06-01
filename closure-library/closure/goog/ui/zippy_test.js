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

goog.provide('goog.ui.ZippyTest');
goog.setTestOnly('goog.ui.ZippyTest');

goog.require('goog.a11y.aria');
goog.require('goog.dom');
goog.require('goog.dom.TagName');
goog.require('goog.dom.classlist');
goog.require('goog.events');
goog.require('goog.object');
goog.require('goog.testing.events');
goog.require('goog.testing.jsunit');
goog.require('goog.ui.Zippy');

var zippy, fakeZippy1, fakeZippy2, contentlessZippy, headerlessZippy;
var lazyZippy;
var lazyZippyCallCount;
var lazyZippyContentEl;
var dualHeaderZippy;
var dualHeaderZippyCollapsedHeaderEl;
var dualHeaderZippyExpandedHeaderEl;

function setUp() {
  zippy = new goog.ui.Zippy(goog.dom.getElement('t1'),
      goog.dom.getElement('c1'));

  var fakeControlEl = document.createElement(goog.dom.TagName.BUTTON);
  var fakeContentEl = document.createElement(goog.dom.TagName.DIV);

  fakeZippy1 = new goog.ui.Zippy(fakeControlEl.cloneNode(true),
      fakeContentEl.cloneNode(true), true);
  fakeZippy2 = new goog.ui.Zippy(fakeControlEl.cloneNode(true),
      fakeContentEl.cloneNode(true), false);
  contentlessZippy = new goog.ui.Zippy(fakeControlEl.cloneNode(true),
      undefined, true);
  headerlessZippy = new goog.ui.Zippy(null, fakeContentEl.cloneNode(true),
      true);

  lazyZippyCallCount = 0;
  lazyZippyContentEl = fakeContentEl.cloneNode(true);
  lazyZippy = new goog.ui.Zippy(goog.dom.getElement('t1'), function() {
    lazyZippyCallCount++;
    return lazyZippyContentEl;
  });
  dualHeaderZippyCollapsedHeaderEl = fakeControlEl.cloneNode(true);
  dualHeaderZippyExpandedHeaderEl = fakeControlEl.cloneNode(true);
  dualHeaderZippy = new goog.ui.Zippy(dualHeaderZippyCollapsedHeaderEl,
      fakeContentEl.cloneNode(true), false, dualHeaderZippyExpandedHeaderEl);
}

function testConstructor() {
  assertNotNull('must not be null', zippy);
}

function testIsExpanded() {
  assertEquals('Default expanded must be false', false, zippy.isExpanded());
  assertEquals('Expanded must be true', true, fakeZippy1.isExpanded());
  assertEquals('Expanded must be false', false, fakeZippy2.isExpanded());
  assertEquals('Expanded must be true', true, headerlessZippy.isExpanded());
  assertEquals('Expanded must be false', false, lazyZippy.isExpanded());
  assertEquals('Expanded must be false', false, dualHeaderZippy.isExpanded());
}

function tearDown() {
  zippy.dispose();
  fakeZippy1.dispose();
  fakeZippy2.dispose();
  contentlessZippy.dispose();
  headerlessZippy.dispose();
  lazyZippy.dispose();
  dualHeaderZippy.dispose();
}

function testExpandCollapse() {
  zippy.expand();
  headerlessZippy.expand();
  assertEquals('expanded must be true', true, zippy.isExpanded());
  assertEquals('expanded must be true', true, headerlessZippy.isExpanded());

  zippy.collapse();
  headerlessZippy.collapse();
  assertEquals('expanded must be false', false, zippy.isExpanded());
  assertEquals('expanded must be false', false, headerlessZippy.isExpanded());
}

function testExpandCollapse_lazyZippy() {
  assertEquals('callback should not be called #1.', 0, lazyZippyCallCount);
  lazyZippy.collapse();
  assertEquals('callback should not be called #2.', 0, lazyZippyCallCount);

  lazyZippy.expand();
  assertEquals('callback should be called once #1.', 1, lazyZippyCallCount);
  assertEquals('expanded must be true', true, lazyZippy.isExpanded());
  assertEquals('contentEl should be visible', '',
      lazyZippyContentEl.style.display);

  lazyZippy.collapse();
  assertEquals('callback should be called once #2.', 1, lazyZippyCallCount);
  assertEquals('expanded must be false', false, lazyZippy.isExpanded());
  assertEquals('contentEl should not be visible', 'none',
      lazyZippyContentEl.style.display);

  lazyZippy.expand();
  assertEquals('callback should be called once #3.', 1, lazyZippyCallCount);
  assertEquals('expanded must be true #2', true, lazyZippy.isExpanded());
  assertEquals('contentEl should be visible #2', '',
      lazyZippyContentEl.style.display);
}

function testExpandCollapse_dualHeaderZippy() {
  dualHeaderZippy.expand();
  assertEquals('expanded must be true', true, dualHeaderZippy.isExpanded());
  assertFalse('collapsed header should not have state class name #1',
      hasCollapseOrExpandClasses(dualHeaderZippyCollapsedHeaderEl));
  assertFalse('expanded header should not have state class name #1',
      hasCollapseOrExpandClasses(dualHeaderZippyExpandedHeaderEl));

  dualHeaderZippy.collapse();
  assertEquals('expanded must be false', false, dualHeaderZippy.isExpanded());
  assertFalse('collapsed header should not have state class name #2',
      hasCollapseOrExpandClasses(dualHeaderZippyCollapsedHeaderEl));
  assertFalse('expanded header should not have state class name #2',
      hasCollapseOrExpandClasses(dualHeaderZippyExpandedHeaderEl));
}

function testSetExpand() {
  var expanded = !zippy.isExpanded();
  zippy.setExpanded(expanded);
  assertEquals('expanded must be ' + expanded, expanded, zippy.isExpanded());
}

function testCssClassesAndAria() {
  assertTrue('goog-zippy-header is enabled',
      goog.dom.classlist.contains(zippy.elHeader_, 'goog-zippy-header'));
  assertNotNull(zippy.elHeader_);
  assertEquals('header aria-expanded is false', 'false',
      goog.a11y.aria.getState(zippy.elHeader_, 'expanded'));
  zippy.setExpanded(true);
  assertTrue('goog-zippy-content is enabled',
      goog.dom.classlist.contains(zippy.getContentElement(),
      'goog-zippy-content'));
  assertEquals('header aria role is TAB', 'tab',
      goog.a11y.aria.getRole(zippy.elHeader_));
  assertEquals('header aria-expanded is true', 'true',
      goog.a11y.aria.getState(zippy.elHeader_, 'expanded'));
}

function testHeaderTabIndex() {
  assertEquals('Header tabIndex is 0', 0, zippy.elHeader_.tabIndex);
}

function testGetVisibleHeaderElement() {
  dualHeaderZippy.setExpanded(false);
  assertEquals(dualHeaderZippyCollapsedHeaderEl,
      dualHeaderZippy.getVisibleHeaderElement());
  dualHeaderZippy.setExpanded(true);
  assertEquals(dualHeaderZippyExpandedHeaderEl,
      dualHeaderZippy.getVisibleHeaderElement());
}

function testToggle() {
  var expanded = !zippy.isExpanded();
  zippy.toggle();
  assertEquals('expanded must be ' + expanded, expanded, zippy.isExpanded());
}

function testCustomEventTOGGLE() {
  var dispatchedActionCount;
  var handleAction = function() {
    dispatchedActionCount++;
  };

  var doTest = function(zippyObj) {
    dispatchedActionCount = 0;
    goog.events.listen(zippyObj, goog.ui.Zippy.Events.TOGGLE, handleAction);
    zippy.toggle();
    assertEquals('Custom Event must be called ', 1, dispatchedActionCount);
  };

  doTest(zippy);
  doTest(fakeZippy1);
  doTest(contentlessZippy);
  doTest(headerlessZippy);
}

function testActionEvent() {
  var actionEventCount = 0;
  var toggleEventCount = 0;
  var handleEvent = function(e) {
    if (e.type == goog.ui.Zippy.Events.TOGGLE) {
      toggleEventCount++;
    } else if (e.type == goog.ui.Zippy.Events.ACTION) {
      actionEventCount++;
      assertTrue('toggle must have been called first',
          toggleEventCount >= actionEventCount);
    }
  };
  goog.events.listen(zippy, goog.object.getValues(goog.ui.Zippy.Events),
      handleEvent);
  goog.testing.events.fireClickSequence(zippy.elHeader_);
  assertEquals('Zippy ACTION event fired', 1, actionEventCount);
  assertEquals('Zippy TOGGLE event fired', 1, toggleEventCount);

  zippy.toggle();
  assertEquals('Zippy ACTION event NOT fired', 1, actionEventCount);
  assertEquals('Zippy TOGGLE event fired', 2, toggleEventCount);
}

function testBasicZippyBehavior() {
  var dispatchedActionCount = 0;
  var handleAction = function() {
    dispatchedActionCount++;
  };

  goog.events.listen(zippy, goog.ui.Zippy.Events.TOGGLE, handleAction);
  goog.testing.events.fireClickSequence(zippy.elHeader_);
  assertEquals('Zippy  must have dispatched TOGGLE on click', 1,
      dispatchedActionCount);

}

function hasCollapseOrExpandClasses(el) {
  var isCollapsed = goog.dom.classlist.contains(el, 'goog-zippy-collapsed');
  var isExpanded = goog.dom.classlist.contains(el, 'goog-zippy-expanded');
  return isCollapsed || isExpanded;
}

function testIsHandleKeyEvent() {
  zippy.setHandleKeyboardEvents(false);
  assertFalse('Zippy is not handling key events', zippy.isHandleKeyEvents());
  assertTrue('Zippy setHandleKeyEvents does not affect handling mouse events',
      zippy.isHandleMouseEvents());
  assertEquals(0, zippy.keyboardEventHandler_.getListenerCount());

  zippy.setHandleKeyboardEvents(true);
  assertTrue('Zippy is handling key events', zippy.isHandleKeyEvents());
  assertTrue('Zippy setHandleKeyEvents does not affect handling mouse events',
      zippy.isHandleMouseEvents());
  assertNotEquals(0, zippy.keyboardEventHandler_.getListenerCount());
}

function testIsHandleMouseEvent() {
  zippy.setHandleMouseEvents(false);
  assertFalse('Zippy is not handling mouse events',
      zippy.isHandleMouseEvents());
  assertTrue('Zippy setHandleMouseEvents does not affect handling key events',
      zippy.isHandleKeyEvents());
  assertEquals(0, zippy.mouseEventHandler_.getListenerCount());

  zippy.setHandleMouseEvents(true);
  assertTrue('Zippy is handling mouse events', zippy.isHandleMouseEvents());
  assertTrue('Zippy setHandleMouseEvents does not affect handling key events',
      zippy.isHandleKeyEvents());
  assertNotEquals(0, zippy.mouseEventHandler_.getListenerCount());
}
