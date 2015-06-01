// Copyright 2012 The Closure Library Authors. All Rights Reserved.
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

goog.provide('goog.dom.vendorTest');
goog.setTestOnly('goog.dom.vendorTest');

goog.require('goog.array');
goog.require('goog.dom.vendor');
goog.require('goog.labs.userAgent.util');
goog.require('goog.testing.MockUserAgent');
goog.require('goog.testing.PropertyReplacer');
goog.require('goog.testing.jsunit');
goog.require('goog.userAgent');
goog.require('goog.userAgentTestUtil');

var documentMode;
var mockUserAgent;
var propertyReplacer = new goog.testing.PropertyReplacer();

function setUp() {
  mockUserAgent = new goog.testing.MockUserAgent();
  mockUserAgent.install();
}

function tearDown() {
  goog.dispose(mockUserAgent);
  documentMode = undefined;
  propertyReplacer.reset();
}

goog.userAgent.getDocumentMode_ = function() {
  return documentMode;
};


var UserAgents = {
  GECKO: 'GECKO',
  IE: 'IE',
  OPERA: 'OPERA',
  WEBKIT: 'WEBKIT'
};


/**
 * Return whether a given user agent has been detected.
 * @param {number} agent Value in UserAgents.
 * @return {boolean} Whether the user agent has been detected.
 */
function getUserAgentDetected_(agent) {
  switch (agent) {
    case UserAgents.GECKO:
      return goog.userAgent.GECKO;
    case UserAgents.IE:
      return goog.userAgent.IE;
    case UserAgents.OPERA:
      return goog.userAgent.OPERA;
    case UserAgents.WEBKIT:
      return goog.userAgent.WEBKIT;
  }
  return null;
}


/**
 * Test browser detection for a user agent configuration.
 * @param {Array<number>} expectedAgents Array of expected userAgents.
 * @param {string} uaString User agent string.
 * @param {string=} opt_product Navigator product string.
 * @param {string=} opt_vendor Navigator vendor string.
 */
function assertUserAgent(expectedAgents, uaString, opt_product, opt_vendor) {
  var mockNavigator = {
    'userAgent': uaString,
    'product': opt_product,
    'vendor': opt_vendor
  };

  mockUserAgent.setNavigator(mockNavigator);
  mockUserAgent.setUserAgentString(uaString);

  // Force reread of navigator.userAgent;
  goog.labs.userAgent.util.setUserAgent(null);
  goog.userAgentTestUtil.reinitializeUserAgent();
  for (var ua in UserAgents) {
    var isExpected = goog.array.contains(expectedAgents, UserAgents[ua]);
    assertEquals(isExpected, getUserAgentDetected_(UserAgents[ua]));
  }
}


/**
 * Tests for the vendor prefix for Webkit.
 */
function testVendorPrefixWebkit() {
  assertUserAgent([UserAgents.WEBKIT], 'WebKit');
  assertEquals('-webkit', goog.dom.vendor.getVendorPrefix());
}


/**
 * Tests for the vendor prefix for Mozilla/Gecko.
 */
function testVendorPrefixGecko() {
  assertUserAgent([UserAgents.GECKO], 'Gecko', 'Gecko');
  assertEquals('-moz', goog.dom.vendor.getVendorPrefix());
}


/**
 * Tests for the vendor prefix for Opera.
 */
function testVendorPrefixOpera() {
  assertUserAgent([UserAgents.OPERA], 'Opera');
  assertEquals('-o', goog.dom.vendor.getVendorPrefix());
}


/**
 * Tests for the vendor prefix for IE.
 */
function testVendorPrefixIE() {
  assertUserAgent([UserAgents.IE], 'MSIE');
  assertEquals('-ms', goog.dom.vendor.getVendorPrefix());
}


/**
 * Tests for the vendor Js prefix for Webkit.
 */
function testVendorJsPrefixWebkit() {
  assertUserAgent([UserAgents.WEBKIT], 'WebKit');
  assertEquals('Webkit', goog.dom.vendor.getVendorJsPrefix());
}


/**
 * Tests for the vendor Js prefix for Mozilla/Gecko.
 */
function testVendorJsPrefixGecko() {
  assertUserAgent([UserAgents.GECKO], 'Gecko', 'Gecko');
  assertEquals('Moz', goog.dom.vendor.getVendorJsPrefix());
}


/**
 * Tests for the vendor Js prefix for Opera.
 */
function testVendorJsPrefixOpera() {
  assertUserAgent([UserAgents.OPERA], 'Opera');
  assertEquals('O', goog.dom.vendor.getVendorJsPrefix());
}


/**
 * Tests for the vendor Js prefix for IE.
 */
function testVendorJsPrefixIE() {
  assertUserAgent([UserAgents.IE], 'MSIE');
  assertEquals('ms', goog.dom.vendor.getVendorJsPrefix());
}


/**
 * Tests for the vendor Js prefix if no UA detected.
 */
function testVendorJsPrefixNone() {
  assertUserAgent([], '');
  assertNull(goog.dom.vendor.getVendorJsPrefix());
}


/**
 * Tests for the prefixed property name on Webkit.
 */
function testPrefixedPropertyNameWebkit() {
  assertUserAgent([UserAgents.WEBKIT], 'WebKit');
  assertEquals('webkitFoobar',
      goog.dom.vendor.getPrefixedPropertyName('foobar'));
}


/**
 * Tests for the prefixed property name on Webkit in an object.
 */
function testPrefixedPropertyNameWebkitAndObject() {
  var mockDocument = {
    // setting a value of 0 on purpose, to ensure we only look for property
    // names, not their values.
    'webkitFoobar': 0
  };
  assertUserAgent([UserAgents.WEBKIT], 'WebKit');
  assertEquals('webkitFoobar',
      goog.dom.vendor.getPrefixedPropertyName('foobar', mockDocument));
}


/**
 * Tests for the prefixed property name.
 */
function testPrefixedPropertyName() {
  assertUserAgent([], '');
  assertNull(goog.dom.vendor.getPrefixedPropertyName('foobar'));
}


/**
 * Tests for the prefixed property name in an object.
 */
function testPrefixedPropertyNameAndObject() {
  var mockDocument = {
    'foobar': 0
  };
  assertUserAgent([], '');
  assertEquals('foobar',
      goog.dom.vendor.getPrefixedPropertyName('foobar', mockDocument));
}


/**
 * Tests for the prefixed property name when it doesn't exist.
 */
function testPrefixedPropertyNameAndObjectIsEmpty() {
  var mockDocument = {};
  assertUserAgent([], '');
  assertNull(goog.dom.vendor.getPrefixedPropertyName('foobar', mockDocument));
}


/**
 * Test for prefixed event type.
 */
function testPrefixedEventType() {
  assertUserAgent([], '');
  assertEquals('foobar', goog.dom.vendor.getPrefixedEventType('foobar'));
}


/**
 * Test for browser-specific prefixed event type.
 */
function testPrefixedEventTypeForBrowser() {
  assertUserAgent([UserAgents.WEBKIT], 'WebKit');
  assertEquals('webkitfoobar', goog.dom.vendor.getPrefixedEventType('foobar'));
}


function assertIe(uaString, expectedVersion) {
  assertUserAgent([UserAgents.IE], uaString);
  assertEquals('User agent ' + uaString + ' should have had version ' +
      expectedVersion + ' but had ' + goog.userAgent.VERSION,
      expectedVersion,
      goog.userAgent.VERSION);
}


function assertGecko(uaString, expectedVersion) {
  assertUserAgent([UserAgents.GECKO], uaString, 'Gecko');
  assertEquals('User agent ' + uaString + ' should have had version ' +
      expectedVersion + ' but had ' + goog.userAgent.VERSION,
      expectedVersion,
      goog.userAgent.VERSION);
}
