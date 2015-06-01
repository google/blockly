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

goog.provide('goog.ui.ac.RemoteArrayMatcherTest');
goog.setTestOnly('goog.ui.ac.RemoteArrayMatcherTest');

goog.require('goog.json');
goog.require('goog.net.XhrIo');
goog.require('goog.testing.MockControl');
goog.require('goog.testing.jsunit');
goog.require('goog.testing.net.XhrIo');
goog.require('goog.ui.ac.RemoteArrayMatcher');
var url = 'http://www.google.com';
var token = 'goog';
var maxMatches = 5;
var fullToken = 'google';

var responseJsonText = "['eric', 'larry', 'sergey', 'marissa', 'pupius']";
var responseJson = goog.json.unsafeParse(responseJsonText);

var mockControl;
var mockMatchHandler;


function setUp() {
  goog.net.XhrIo = goog.testing.net.XhrIo;
  mockControl = new goog.testing.MockControl();
  mockMatchHandler = mockControl.createFunctionMock();
}

function testRequestMatchingRows_noSimilarTrue() {
  var matcher = new goog.ui.ac.RemoteArrayMatcher(url);
  mockMatchHandler(token, responseJson);
  mockControl.$replayAll();
  matcher.requestMatchingRows(token, maxMatches, mockMatchHandler, fullToken);
  matcher.xhr_.simulateResponse(200, responseJsonText);
  mockControl.$verifyAll();
  mockControl.$resetAll();
}

function testRequestMatchingRows_twoCalls() {
  var matcher = new goog.ui.ac.RemoteArrayMatcher(url);

  var dummyMatchHandler = mockControl.createFunctionMock();

  mockMatchHandler(token, responseJson);
  mockControl.$replayAll();

  matcher.requestMatchingRows(token, maxMatches, dummyMatchHandler,
      fullToken);

  matcher.requestMatchingRows(token, maxMatches, mockMatchHandler, fullToken);
  matcher.xhr_.simulateResponse(200, responseJsonText);
  mockControl.$verifyAll();
  mockControl.$resetAll();
}
