// Copyright 2013 The Closure Library Authors. All Rights Reserved.
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

/**
 * @fileoverview Unit tests for goog.labs.userAgent.device.
 */

goog.provide('goog.labs.userAgent.deviceTest');

goog.require('goog.labs.userAgent.device');
goog.require('goog.labs.userAgent.testAgents');
goog.require('goog.labs.userAgent.util');
goog.require('goog.testing.jsunit');

goog.setTestOnly('goog.labs.userAgent.deviceTest');

function setUp() {
  goog.labs.userAgent.util.setUserAgent(null);
}

function testMobile() {
  assertIsMobile(goog.labs.userAgent.testAgents.ANDROID_BROWSER_235);
  assertIsMobile(goog.labs.userAgent.testAgents.CHROME_ANDROID);
  assertIsMobile(goog.labs.userAgent.testAgents.SAFARI_IPHONE_6);
  assertIsMobile(goog.labs.userAgent.testAgents.IE_10_MOBILE);
}

function testTablet() {
  assertIsTablet(goog.labs.userAgent.testAgents.CHROME_ANDROID_TABLET);
  assertIsTablet(goog.labs.userAgent.testAgents.KINDLE_FIRE);
  assertIsTablet(goog.labs.userAgent.testAgents.IPAD_6);
}

function testDesktop() {
  assertIsDesktop(goog.labs.userAgent.testAgents.CHROME_25);
  assertIsDesktop(goog.labs.userAgent.testAgents.OPERA_10);
  assertIsDesktop(goog.labs.userAgent.testAgents.FIREFOX_19);
  assertIsDesktop(goog.labs.userAgent.testAgents.IE_9);
  assertIsDesktop(goog.labs.userAgent.testAgents.IE_10);
  assertIsDesktop(goog.labs.userAgent.testAgents.IE_11);
}

function assertIsMobile(uaString) {
  goog.labs.userAgent.util.setUserAgent(uaString);
  assertTrue(goog.labs.userAgent.device.isMobile());
  assertFalse(goog.labs.userAgent.device.isTablet());
  assertFalse(goog.labs.userAgent.device.isDesktop());
}

function assertIsTablet(uaString) {
  goog.labs.userAgent.util.setUserAgent(uaString);
  assertTrue(goog.labs.userAgent.device.isTablet());
  assertFalse(goog.labs.userAgent.device.isMobile());
  assertFalse(goog.labs.userAgent.device.isDesktop());
}

function assertIsDesktop(uaString) {
  goog.labs.userAgent.util.setUserAgent(uaString);
  assertTrue(goog.labs.userAgent.device.isDesktop());
  assertFalse(goog.labs.userAgent.device.isMobile());
  assertFalse(goog.labs.userAgent.device.isTablet());
}
