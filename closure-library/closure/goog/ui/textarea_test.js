// Copyright 2010 The Closure Library Authors. All Rights Reserved.
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

goog.provide('goog.ui.TextareaTest');
goog.setTestOnly('goog.ui.TextareaTest');

goog.require('goog.dom');
goog.require('goog.dom.classlist');
goog.require('goog.events');
goog.require('goog.style');
goog.require('goog.testing.ExpectedFailures');
goog.require('goog.testing.events.EventObserver');
goog.require('goog.testing.jsunit');
goog.require('goog.ui.Textarea');
goog.require('goog.ui.TextareaRenderer');
goog.require('goog.userAgent');
goog.require('goog.userAgent.product');

var sandbox;
var textarea;
var demoTextareaElement;
var expectedFailures;

function setUp() {
  sandbox = goog.dom.getElement('sandbox');
  textarea = new goog.ui.Textarea();
  demoTextareaElement = goog.dom.getElement('demo-textarea');
  expectedFailures = new goog.testing.ExpectedFailures();
}

function tearDown() {
  expectedFailures.handleTearDown();
  textarea.dispose();
  goog.dom.removeChildren(sandbox);
}


/**
 * @return {boolean} Whether we're on Mac Safari 3.x.
 */
function isMacSafari3() {
  return goog.userAgent.WEBKIT && goog.userAgent.MAC &&
      !goog.userAgent.isVersionOrHigher('527');
}


/**
 * @return {boolean} Whether we're on Linux Firefox 3.6.3.
 */
function isLinuxFirefox() {
  return goog.userAgent.product.FIREFOX && goog.userAgent.LINUX;
}


/**
 * @return {boolean} Whether we're on Firefox 3.0.
 */
function isFirefox3() {
  return goog.userAgent.GECKO &&
      !goog.userAgent.isVersionOrHigher('1.9.1');
}

function testConstructor() {
  assertNotNull('Textarea must not be null', textarea);
  assertEquals('Renderer must default to expected value',
      goog.ui.TextareaRenderer.getInstance(), textarea.getRenderer());

  var fakeDomHelper = {
    'getDocument': function() { return true; }
  };
  var testTextarea = new goog.ui.Textarea('Hello',
      goog.ui.TextareaRenderer.getInstance(), fakeDomHelper);
  assertEquals('Content must have expected content', 'Hello',
      testTextarea.getContent());
  assertEquals('Renderer must have expected value',
      goog.ui.TextareaRenderer.getInstance(), testTextarea.getRenderer());
  assertEquals('DOM helper must have expected value', fakeDomHelper,
      testTextarea.getDomHelper());
  testTextarea.dispose();
}

function testConstructorWithDecorator() {
  var decoratedTextarea = new goog.ui.Textarea();
  decoratedTextarea.decorate(demoTextareaElement);
  assertEquals('Textarea should have current content after decoration',
      'Foo', decoratedTextarea.getContent());
  var initialHeight = decoratedTextarea.getHeight_();
  var initialOffsetHeight = decoratedTextarea.getElement().offsetHeight;
  // focus() will trigger the grow/shrink flow.
  decoratedTextarea.getElement().focus();
  assertEquals('Height should not have changed without content change',
      initialHeight, decoratedTextarea.getHeight_());
  assertEquals('offsetHeight should not have changed without content ' +
      'change', initialOffsetHeight,
      decoratedTextarea.getElement().offsetHeight);
  decoratedTextarea.dispose();
}

function testGetSetContent() {
  textarea.render(sandbox);
  assertEquals('Textarea\'s content must default to an empty string',
      '', textarea.getContent());
  textarea.setContent(17);
  assertEquals('Textarea element must have expected content', '17',
      textarea.getElement().value);
  textarea.setContent('foo');
  assertEquals('Textarea element must have updated content', 'foo',
      textarea.getElement().value);
}

function testGetSetValue() {
  textarea.render(sandbox);
  assertEquals('Textarea\'s content must default to an empty string',
      '', textarea.getValue());
  textarea.setValue(17);
  assertEquals('Textarea element must have expected content', '17',
      textarea.getValue());
  textarea.setValue('17');
  assertEquals('Textarea element must have expected content', '17',
      textarea.getValue());
}

function testBasicTextareaBehavior() {
  var observer = new goog.testing.events.EventObserver();
  goog.events.listen(textarea, goog.ui.Textarea.EventType.RESIZE, observer);
  textarea.render(sandbox);
  var el = textarea.getElement();
  var heightBefore = textarea.getHeight_();
  assertTrue('One resize event should be fired during render',
      observer.getEvents().length == 1);
  textarea.setContent('Lorem ipsum dolor sit amet, consectetuer ' +
      'elit. Aenean sollicitudin ultrices urna. Proin vehicula mauris ac ' +
      'est. Ut scelerisque, risus ut facilisis dictum, est massa lacinia ' +
      'lorem, in fermentum purus ligula quis nunc.');
  var heightAfter = textarea.getHeight_();
  assertTrue('With this much content, height should have grown.',
      heightAfter > heightBefore);
  assertTrue('With a height change, a resize event should have fired.',
      observer.getEvents().length == 2);
  textarea.setContent('');
  heightAfter = textarea.getHeight_();
  assertTrue('Textarea should shrink with no content.',
      heightAfter <= heightBefore);
  assertTrue('With a height change, a resize event should have fired.',
      observer.getEvents().length == 3);
  goog.events.unlisten(textarea, goog.ui.Textarea.EventType.RESIZE,
      observer);
}

function testMinHeight() {
  textarea.render(sandbox);
  textarea.setMinHeight(50);
  assertEquals('offsetHeight should be 50 initially', 50,
      textarea.getElement().offsetHeight);
  textarea.setContent('Lorem ipsum dolor sit amet, consectetuer  ' +
      'elit. Aenean sollicitudin ultrices urna. Proin vehicula mauris ac ' +
      'est. Ut scelerisque, risus ut facilisis dictum, est massa lacinia ' +
      'lorem, in fermentum purus ligula quis nunc.');
  assertTrue('getHeight_() should be > 50',
      textarea.getHeight_() > 50);

  textarea.setContent('');
  assertEquals('With no content, offsetHeight should go back to 50, ' +
      'the minHeight.', 50, textarea.getElement().offsetHeight);

  expectedFailures.expectFailureFor(isMacSafari3());
  try {
    textarea.setMinHeight(0);
    assertTrue('After setting minHeight to 0, offsetHeight should ' +
        'now be < 50, but it is ' + textarea.getElement().offsetHeight,
        textarea.getElement().offsetHeight < 50);
  } catch (e) {
    expectedFailures.handleException(e);
  }
}

function testMouseUpListener() {
  textarea.render(sandbox);
  textarea.setMinHeight(100);
  textarea.setMaxHeight(200);
  textarea.mouseUpListener_({});
  assertEquals('After a mouseup which is not a resize, minHeight should ' +
      'still be 100', 100, textarea.minHeight_);

  // We need to test how CSS drop shadows effect this too.
  goog.dom.classlist.add(textarea.getElement(), 'drop-shadowed');
  textarea.mouseUpListener_({});
  assertEquals('After a mouseup which is not a resize, minHeight should ' +
      'still be 100 even with a shadow', 100, textarea.minHeight_);

}

function testMaxHeight() {
  textarea.render(sandbox);
  textarea.setMaxHeight(50);
  assertTrue('Initial offsetHeight should be less than 50',
      textarea.getElement().offsetHeight < 50);
  var newContent = 'Lorem ipsum dolor sit amet, consectetuer adipiscing ' +
      'elit. Aenean sollicitudin ultrices urna. Proin vehicula mauris ac ' +
      'est. Ut scelerisque, risus ut facilisis dictum, est massa lacinia ' +
      'lorem, in fermentum purus ligula quis nunc.';
  textarea.setContent(newContent);

  assertTrue('With lots of content, getHeight_() should be > 50',
      textarea.getHeight_() > 50);
  assertEquals('Even with lots of content, offsetHeight should be 50 ' +
      'with maxHeight set', 50, textarea.getElement().offsetHeight);
  textarea.setMaxHeight(0);
  assertTrue('After setting maxHeight to 0, offsetHeight should now ' +
      'be > 50', textarea.getElement().offsetHeight > 50);
}

function testMaxHeight_canShrink() {
  textarea.render(sandbox);
  textarea.setMaxHeight(50);
  assertTrue('Initial offsetHeight should be less than 50',
      textarea.getElement().offsetHeight < 50);
  var newContent = 'Lorem ipsum dolor sit amet, consectetuer adipiscing ' +
      'elit. Aenean sollicitudin ultrices urna. Proin vehicula mauris ac ' +
      'est. Ut scelerisque, risus ut facilisis dictum, est massa lacinia ' +
      'lorem, in fermentum purus ligula quis nunc.';
  textarea.setContent(newContent);

  assertEquals('Even with lots of content, offsetHeight should be 50 ' +
      'with maxHeight set', 50, textarea.getElement().offsetHeight);
  textarea.setContent('');
  assertTrue('With no content, offsetHeight should be back to < 50',
      textarea.getElement().offsetHeight < 50);
}

function testSetPlaceholder() {
  textarea.setPlaceholder('Some default text here.');
  textarea.setPlaceholder('new default text...');
  textarea.render(sandbox);
  if (textarea.supportsNativePlaceholder_()) {
    assertEquals('new default text...', textarea.getElement().placeholder);
  }
  assertEquals('', textarea.getValue());
  textarea.setValue('some value');
  assertEquals('some value', textarea.getValue());
  // ensure setting a new placeholder doesn't replace the value.
  textarea.setPlaceholder('some new placeholder');
  assertEquals('some value', textarea.getValue());
}

function testSetPlaceholderForInitialContent() {
  var testTextarea = new goog.ui.Textarea('initial content');
  testTextarea.render(sandbox);
  assertEquals('initial content', testTextarea.getValue());
  testTextarea.setPlaceholder('new default text...');
  assertEquals('initial content', testTextarea.getValue());
  testTextarea.setValue('new content');
  assertEquals('new content', testTextarea.getValue());
  testTextarea.setValue('');
  assertEquals('', testTextarea.getValue());
  if (!testTextarea.supportsNativePlaceholder_()) {
    // Pretend we leave the textarea. When that happens, the
    // placeholder text should appear.
    assertEquals('', testTextarea.getElement().value);
    testTextarea.blur_();
    assertEquals('new default text...', testTextarea.getElement().value);
  }
}

function testMinAndMaxHeight() {
  textarea.render(sandbox);
  textarea.setMinHeight(50);
  textarea.setMaxHeight(150);
  assertEquals('offsetHeight should be 50 initially', 50,
      textarea.getElement().offsetHeight);

  textarea.setContent('Lorem ipsum dolor sit amet, consectetuer  ' +
      'elit. Aenean sollicitudin ultrices urna. Proin vehicula mauris ac ' +
      'est. Ut scelerisque, risus ut facilisis dictum, est massa lacinia ' +
      'lorem, in fermentum purus ligula quis nunc.');

  var height = textarea.getHeight_();
  // For some reason Mac Safari 3 has 136 and Linux FF has 146 here.
  expectedFailures.expectFailureFor(isMacSafari3() || isLinuxFirefox());
  try {
    assertTrue('With lots of content, getHeight_() should be > 150 ' +
        '(it is ' + height + ')', height > 150);
    assertEquals('Even with lots of content, offsetHeight should be 150 ' +
        'with maxHeight set', 150,
        textarea.getElement().offsetHeight);

    textarea.setMaxHeight(0);
    assertTrue('After setting maxHeight to 0, offsetHeight should now ' +
        'be > 150 (it is ' + textarea.getElement().offsetHeight + ')',
        textarea.getElement().offsetHeight > 150);

    textarea.setContent('');
    textarea.setMinHeight(0);
    assertTrue('After setting minHeight to 0, with no contents, ' +
        'offsetHeight should now be < 50',
        textarea.getElement().offsetHeight < 50);
  } catch (e) {
    expectedFailures.handleException(e);
  }
}

function testSetValueWhenInvisible() {
  textarea.render(sandbox);
  var content = 'Lorem ipsum dolor sit amet, consectetuer  ' +
      'elit. Aenean sollicitudin ultrices urna. Proin vehicula mauris ac ' +
      'est. Ut scelerisque, risus ut facilisis dictum, est massa lacinia ' +
      'lorem, in fermentum purus ligula quis nunc.';
  textarea.setValue(content);
  var height = textarea.getHeight_();
  var elementHeight = goog.style.getStyle(textarea.getElement(), 'height');
  assertEquals(height + 'px', elementHeight);

  // Hide the element, height_ should be invalidate when setValue().
  goog.style.setElementShown(textarea.getElement(), false);
  textarea.setValue(content);

  // Show the element again.
  goog.style.setElementShown(textarea.getElement(), true);
  textarea.setValue(content);
  height = textarea.getHeight_();
  elementHeight = goog.style.getStyle(textarea.getElement(), 'height');
  assertEquals(height + 'px', elementHeight);
}

function testSetAriaLabel() {
  assertNull('Textarea must not have aria label by default',
      textarea.getAriaLabel());
  textarea.setAriaLabel('My textarea');
  textarea.render(sandbox);
  var element = textarea.getElementStrict();
  assertNotNull('Element must not be null', element);
  assertEquals('Item element must have expected aria-label', 'My textarea',
      element.getAttribute('aria-label'));
  textarea.setAriaLabel('My new textarea');
  assertEquals('Item element must have updated aria-label', 'My new textarea',
      element.getAttribute('aria-label'));
}
