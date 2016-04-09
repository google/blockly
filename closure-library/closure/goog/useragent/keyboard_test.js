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

goog.provide('goog.userAgent.keyboardTest');
goog.setTestOnly('goog.userAgent.keyboardTest');

goog.require('goog.labs.userAgent.testAgents');
goog.require('goog.labs.userAgent.util');
goog.require('goog.testing.MockUserAgent');
goog.require('goog.testing.jsunit');
goog.require('goog.userAgent.keyboard');
goog.require('goog.userAgentTestUtil');


var mockAgent;

function setUp() {
  mockAgent = new goog.testing.MockUserAgent();
  mockAgent.install();
}

function tearDown() {
  mockAgent.dispose();
  goog.labs.userAgent.util.setUserAgent(null);
  goog.userAgentTestUtil.reinitializeUserAgent();
}

function testAndroid() {
  mockAgent.setNavigator({platform: 'Linux'});

  setUserAgent(goog.labs.userAgent.testAgents.ANDROID_BROWSER_235);
  assertFalse(goog.userAgent.keyboard.MAC_KEYBOARD);

  setUserAgent(goog.labs.userAgent.testAgents.ANDROID_BROWSER_221);
  assertFalse(goog.userAgent.keyboard.MAC_KEYBOARD);

  setUserAgent(goog.labs.userAgent.testAgents.ANDROID_BROWSER_233);
  assertFalse(goog.userAgent.keyboard.MAC_KEYBOARD);

  setUserAgent(goog.labs.userAgent.testAgents.ANDROID_BROWSER_403);
  assertFalse(goog.userAgent.keyboard.MAC_KEYBOARD);

  setUserAgent(goog.labs.userAgent.testAgents.ANDROID_BROWSER_403_ALT);
  assertFalse(goog.userAgent.keyboard.MAC_KEYBOARD);
}

function testIe() {
  mockAgent.setNavigator({platform: 'Windows'});

  setUserAgent(goog.labs.userAgent.testAgents.IE_6);
  assertFalse(goog.userAgent.keyboard.MAC_KEYBOARD);

  setUserAgent(goog.labs.userAgent.testAgents.IE_7);
  assertFalse(goog.userAgent.keyboard.MAC_KEYBOARD);

  setUserAgent(goog.labs.userAgent.testAgents.IE_8);
  assertFalse(goog.userAgent.keyboard.MAC_KEYBOARD);

  setUserAgent(goog.labs.userAgent.testAgents.IE_8_COMPATIBILITY);
  assertFalse(goog.userAgent.keyboard.MAC_KEYBOARD);

  setUserAgent(goog.labs.userAgent.testAgents.IE_9);
  assertFalse(goog.userAgent.keyboard.MAC_KEYBOARD);

  setUserAgent(goog.labs.userAgent.testAgents.IE_10);
  assertFalse(goog.userAgent.keyboard.MAC_KEYBOARD);

  setUserAgent(goog.labs.userAgent.testAgents.IE_10_COMPATIBILITY);
  assertFalse(goog.userAgent.keyboard.MAC_KEYBOARD);

  setUserAgent(goog.labs.userAgent.testAgents.IE_11);
  assertFalse(goog.userAgent.keyboard.MAC_KEYBOARD);

  setUserAgent(goog.labs.userAgent.testAgents.IE_11_COMPATIBILITY_MSIE_7);
  assertFalse(goog.userAgent.keyboard.MAC_KEYBOARD);

  setUserAgent(goog.labs.userAgent.testAgents.IE_11_COMPATIBILITY_MSIE_9);
  assertFalse(goog.userAgent.keyboard.MAC_KEYBOARD);
}

function testFirefoxMac() {
  mockAgent.setNavigator({platform: 'Macintosh'});
  setUserAgent(goog.labs.userAgent.testAgents.FIREFOX_MAC);
  assertTrue(goog.userAgent.keyboard.MAC_KEYBOARD);
}

function testFirefoxNotMac() {
  mockAgent.setNavigator({platform: 'X11'});
  setUserAgent(goog.labs.userAgent.testAgents.FIREFOX_LINUX);
  assertFalse(goog.userAgent.keyboard.MAC_KEYBOARD);

  mockAgent.setNavigator({platform: 'Windows'});
  setUserAgent(goog.labs.userAgent.testAgents.FIREFOX_WINDOWS);
  assertFalse(goog.userAgent.keyboard.MAC_KEYBOARD);
}

function testSafari() {
  mockAgent.setNavigator({platform: 'Macintosh'});
  setUserAgent(goog.labs.userAgent.testAgents.SAFARI_6);
  assertTrue(goog.userAgent.keyboard.MAC_KEYBOARD);

  setUserAgent(goog.labs.userAgent.testAgents.SAFARI_MAC);
  assertTrue(goog.userAgent.keyboard.MAC_KEYBOARD);

  mockAgent.setNavigator({platform: 'iPhone'});
  setUserAgent(goog.labs.userAgent.testAgents.SAFARI_IPHONE_32);
  assertTrue(goog.userAgent.keyboard.MAC_KEYBOARD);

  setUserAgent(goog.labs.userAgent.testAgents.SAFARI_IPHONE_421);
  assertTrue(goog.userAgent.keyboard.MAC_KEYBOARD);

  setUserAgent(goog.labs.userAgent.testAgents.SAFARI_IPHONE_431);
  assertTrue(goog.userAgent.keyboard.MAC_KEYBOARD);

  setUserAgent(goog.labs.userAgent.testAgents.SAFARI_IPHONE_6);
  assertTrue(goog.userAgent.keyboard.MAC_KEYBOARD);

  mockAgent.setNavigator({platform: 'iPod'});
  setUserAgent(goog.labs.userAgent.testAgents.SAFARI_IPOD);
  assertTrue(goog.userAgent.keyboard.MAC_KEYBOARD);
}

function testSafariWndows() {
  mockAgent.setNavigator({platform: 'Macintosh'});
  setUserAgent(goog.labs.userAgent.testAgents.SAFARI_WINDOWS);
  assertFalse(goog.userAgent.keyboard.MAC_KEYBOARD);
}

function testOperaMac() {
  mockAgent.setNavigator({platform: 'Macintosh'});
  setUserAgent(goog.labs.userAgent.testAgents.OPERA_MAC);
  assertTrue(goog.userAgent.keyboard.MAC_KEYBOARD);
}

function testOperaNonMac() {
  mockAgent.setNavigator({platform: 'X11'});
  setUserAgent(goog.labs.userAgent.testAgents.OPERA_LINUX);
  assertFalse(goog.userAgent.keyboard.MAC_KEYBOARD);

  mockAgent.setNavigator({platform: 'Windows'});
  setUserAgent(goog.labs.userAgent.testAgents.OPERA_15);
  assertFalse(goog.userAgent.keyboard.MAC_KEYBOARD);
}

function testIPad() {
  mockAgent.setNavigator({platform: 'iPad'});
  setUserAgent(goog.labs.userAgent.testAgents.IPAD_4);
  assertTrue(goog.userAgent.keyboard.MAC_KEYBOARD);

  setUserAgent(goog.labs.userAgent.testAgents.IPAD_5);
  assertTrue(goog.userAgent.keyboard.MAC_KEYBOARD);

  setUserAgent(goog.labs.userAgent.testAgents.IPAD_6);
  assertTrue(goog.userAgent.keyboard.MAC_KEYBOARD);
}

function testChromeMac() {
  mockAgent.setNavigator({platform: 'Macintosh'});
  setUserAgent(goog.labs.userAgent.testAgents.CHROME_MAC);
  assertTrue(goog.userAgent.keyboard.MAC_KEYBOARD);

  mockAgent.setNavigator({platform: 'iPhone'});
  setUserAgent(goog.labs.userAgent.testAgents.CHROME_IPHONE);
  assertTrue(goog.userAgent.keyboard.MAC_KEYBOARD);
}

function testChromeNonMac() {
  mockAgent.setNavigator({platform: 'Linux'});
  setUserAgent(goog.labs.userAgent.testAgents.CHROME_ANDROID);
  assertFalse(goog.userAgent.keyboard.MAC_KEYBOARD);

  mockAgent.setNavigator({platform: 'X11'});
  setUserAgent(goog.labs.userAgent.testAgents.CHROME_OS);
  assertFalse(goog.userAgent.keyboard.MAC_KEYBOARD);

  mockAgent.setNavigator({platform: 'X11'});
  setUserAgent(goog.labs.userAgent.testAgents.CHROME_LINUX);
  assertFalse(goog.userAgent.keyboard.MAC_KEYBOARD);

  mockAgent.setNavigator({platform: 'Windows'});
  setUserAgent(goog.labs.userAgent.testAgents.CHROME_25);

  assertFalse(goog.userAgent.keyboard.MAC_KEYBOARD);
}

function setUserAgent(ua) {
  mockAgent.setUserAgentString(ua);
  goog.labs.userAgent.util.setUserAgent(ua);
  goog.userAgentTestUtil.reinitializeUserAgent();
}
