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

goog.provide('goog.history.Html5HistoryTest');
goog.setTestOnly('goog.history.Html5HistoryTest');

goog.require('goog.history.Html5History');
goog.require('goog.testing.MockControl');
goog.require('goog.testing.jsunit');
goog.require('goog.testing.mockmatchers');

var mockControl;
var mockWindow;

var html5History;

function setUp() {
  mockControl = new goog.testing.MockControl();

  mockWindow = {
    location: {}
  };
  mockWindow.attachEvent = mockControl.createFunctionMock();
  mockWindow.attachEvent(
      goog.testing.mockmatchers.ignoreArgument,
      goog.testing.mockmatchers.ignoreArgument).$anyTimes();
  var mockHistoryIsSupportedMethod = mockControl.createMethodMock(
      goog.history.Html5History, 'isSupported');
  mockHistoryIsSupportedMethod(mockWindow).$returns(true).$anyTimes();
}

function tearDown() {
  if (html5History) {
    html5History.dispose();
    html5History = null;
  }
  mockControl.$tearDown();
}

function testGetTokenWithoutUsingFragment() {
  mockWindow.location.pathname = '/test/something';

  mockControl.$replayAll();
  html5History = new goog.history.Html5History(mockWindow);
  html5History.setUseFragment(false);

  assertEquals('test/something', html5History.getToken());
  mockControl.$verifyAll();
}

function testGetTokenWithoutUsingFragmentWithCustomPathPrefix() {
  mockWindow.location.pathname = '/test/something';

  mockControl.$replayAll();
  html5History = new goog.history.Html5History(mockWindow);
  html5History.setUseFragment(false);
  html5History.setPathPrefix('/test/');

  assertEquals('something', html5History.getToken());
  mockControl.$verifyAll();
}

function testGetTokenWithoutUsingFragmentWithCustomTransformer() {
  mockWindow.location.pathname = '/test/something';
  var mockTransformer = mockControl.createLooseMock(
      goog.history.Html5History.TokenTransformer);
  mockTransformer.retrieveToken('/', mockWindow.location).$returns('abc/1');

  mockControl.$replayAll();
  html5History = new goog.history.Html5History(mockWindow, mockTransformer);
  html5History.setUseFragment(false);

  assertEquals('abc/1', html5History.getToken());
  mockControl.$verifyAll();
}

function testGetTokenWithoutUsingFragmentWithCustomTransformerAndPrefix() {
  mockWindow.location.pathname = '/test/something';
  var mockTransformer = mockControl.createLooseMock(
      goog.history.Html5History.TokenTransformer);
  mockTransformer.retrieveToken('/test/', mockWindow.location).
      $returns('abc/1');

  mockControl.$replayAll();
  html5History = new goog.history.Html5History(mockWindow, mockTransformer);
  html5History.setUseFragment(false);
  html5History.setPathPrefix('/test/');

  assertEquals('abc/1', html5History.getToken());
  mockControl.$verifyAll();
}

function testGetUrlWithoutUsingFragment() {
  mockWindow.location.search = '?q=something';

  mockControl.$replayAll();
  html5History = new goog.history.Html5History(mockWindow);
  html5History.setUseFragment(false);

  assertEquals('/some/token?q=something', html5History.getUrl_('some/token'));
  mockControl.$verifyAll();
}

function testGetUrlWithoutUsingFragmentWithCustomPathPrefix() {
  mockWindow.location.search = '?q=something';

  mockControl.$replayAll();
  html5History = new goog.history.Html5History(mockWindow);
  html5History.setUseFragment(false);
  html5History.setPathPrefix('/test/');

  assertEquals('/test/some/token?q=something',
               html5History.getUrl_('some/token'));
  mockControl.$verifyAll();
}

function testGetUrlWithoutUsingFragmentWithCustomTransformer() {
  mockWindow.location.search = '?q=something';
  var mockTransformer = mockControl.createLooseMock(
      goog.history.Html5History.TokenTransformer);
  mockTransformer.createUrl('some/token', '/', mockWindow.location).
      $returns('/something/else/?different');

  mockControl.$replayAll();
  html5History = new goog.history.Html5History(mockWindow, mockTransformer);
  html5History.setUseFragment(false);

  assertEquals('/something/else/?different',
               html5History.getUrl_('some/token'));
  mockControl.$verifyAll();
}

function testGetUrlWithoutUsingFragmentWithCustomTransformerAndPrefix() {
  mockWindow.location.search = '?q=something';
  var mockTransformer = mockControl.createLooseMock(
      goog.history.Html5History.TokenTransformer);
  mockTransformer.createUrl('some/token', '/test/', mockWindow.location).
      $returns('/something/else/?different');

  mockControl.$replayAll();
  html5History = new goog.history.Html5History(mockWindow, mockTransformer);
  html5History.setUseFragment(false);
  html5History.setPathPrefix('/test/');

  assertEquals('/something/else/?different',
               html5History.getUrl_('some/token'));
  mockControl.$verifyAll();
}
