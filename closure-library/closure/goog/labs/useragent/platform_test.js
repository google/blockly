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
 * @fileoverview Unit tests for goog.labs.userAgent.platform.
 */

goog.provide('goog.labs.userAgent.platformTest');

goog.require('goog.labs.userAgent.platform');
goog.require('goog.labs.userAgent.testAgents');
goog.require('goog.labs.userAgent.util');
goog.require('goog.testing.jsunit');

goog.setTestOnly('goog.labs.userAgent.platformTest');

function setUp() {
  goog.labs.userAgent.util.setUserAgent(null);
}

function testAndroid() {
  var uaString = goog.labs.userAgent.testAgents.ANDROID_BROWSER_233;

  goog.labs.userAgent.util.setUserAgent(uaString);
  assertTrue(goog.labs.userAgent.platform.isAndroid());
  assertVersion('2.3.3');
  assertVersionBetween('2.3.0', '2.3.5');
  assertVersionBetween('2.3', '2.4');
  assertVersionBetween('2', '3');

  uaString = goog.labs.userAgent.testAgents.ANDROID_BROWSER_221;

  goog.labs.userAgent.util.setUserAgent(uaString);
  assertTrue(goog.labs.userAgent.platform.isAndroid());
  assertVersion('2.2.1');
  assertVersionBetween('2.2.0', '2.2.5');
  assertVersionBetween('2.2', '2.3');
  assertVersionBetween('2', '3');

  uaString = goog.labs.userAgent.testAgents.CHROME_ANDROID;

  goog.labs.userAgent.util.setUserAgent(uaString);
  assertTrue(goog.labs.userAgent.platform.isAndroid());
  assertVersion('4.0.2');
  assertVersionBetween('4.0.0', '4.1.0');
  assertVersionBetween('4.0', '4.1');
  assertVersionBetween('4', '5');
}

function testKindleFire() {
  uaString = goog.labs.userAgent.testAgents.KINDLE_FIRE;
  goog.labs.userAgent.util.setUserAgent(uaString);
  assertTrue(goog.labs.userAgent.platform.isAndroid());
  assertVersion('4.0.3');
}

function testIpod() {
  var uaString = goog.labs.userAgent.testAgents.SAFARI_IPOD;

  goog.labs.userAgent.util.setUserAgent(uaString);
  assertTrue(goog.labs.userAgent.platform.isIpod());
  assertTrue(goog.labs.userAgent.platform.isIos());
  assertVersion('');
}

function testIphone() {
  var uaString = goog.labs.userAgent.testAgents.SAFARI_IPHONE_421;
  goog.labs.userAgent.util.setUserAgent(uaString);
  assertTrue(goog.labs.userAgent.platform.isIphone());
  assertTrue(goog.labs.userAgent.platform.isIos());
  assertVersion('4.2.1');
  assertVersionBetween('4', '5');
  assertVersionBetween('4.2', '4.3');

  uaString = goog.labs.userAgent.testAgents.SAFARI_IPHONE_6;
  goog.labs.userAgent.util.setUserAgent(uaString);
  assertTrue(goog.labs.userAgent.platform.isIphone());
  assertTrue(goog.labs.userAgent.platform.isIos());
  assertVersion('6.0');
  assertVersionBetween('5', '7');

  uaString = goog.labs.userAgent.testAgents.SAFARI_IPHONE_32;
  goog.labs.userAgent.util.setUserAgent(uaString);
  assertTrue(goog.labs.userAgent.platform.isIphone());
  assertTrue(goog.labs.userAgent.platform.isIos());
  assertVersion('3.2');
  assertVersionBetween('3', '4');

  uaString = goog.labs.userAgent.testAgents.WEBVIEW_IPAD;
  goog.labs.userAgent.util.setUserAgent(uaString);
  assertFalse(goog.labs.userAgent.platform.isIphone());
  assertTrue(goog.labs.userAgent.platform.isIpad());
  assertTrue(goog.labs.userAgent.platform.isIos());
  assertVersion('6.0');
  assertVersionBetween('5', '7');
}

function testIpad() {
  var uaString = goog.labs.userAgent.testAgents.IPAD_4;

  goog.labs.userAgent.util.setUserAgent(uaString);
  assertTrue(goog.labs.userAgent.platform.isIpad());
  assertTrue(goog.labs.userAgent.platform.isIos());
  assertVersion('3.2');
  assertVersionBetween('3', '4');
  assertVersionBetween('3.1', '4');

  uaString = goog.labs.userAgent.testAgents.IPAD_5;

  goog.labs.userAgent.util.setUserAgent(uaString);
  assertTrue(goog.labs.userAgent.platform.isIpad());
  assertTrue(goog.labs.userAgent.platform.isIos());
  assertVersion('5.1');
  assertVersionBetween('5', '6');

  uaString = goog.labs.userAgent.testAgents.IPAD_6;

  goog.labs.userAgent.util.setUserAgent(uaString);
  assertTrue(goog.labs.userAgent.platform.isIpad());
  assertTrue(goog.labs.userAgent.platform.isIos());
  assertVersion('6.0');
  assertVersionBetween('5', '7');
}

function testMac() {
  var uaString = goog.labs.userAgent.testAgents.CHROME_MAC;
  var platform = 'IntelMac';
  goog.labs.userAgent.util.setUserAgent(uaString, platform);
  assertTrue(goog.labs.userAgent.platform.isMacintosh());
  assertVersion('10.8.2');
  assertVersionBetween('10', '11');
  assertVersionBetween('10.8', '10.9');
  assertVersionBetween('10.8.1', '10.8.3');

  uaString = goog.labs.userAgent.testAgents.OPERA_MAC;
  goog.labs.userAgent.util.setUserAgent(uaString, platform);
  assertTrue(goog.labs.userAgent.platform.isMacintosh());
  assertVersion('10.6.8');
  assertVersionBetween('10', '11');
  assertVersionBetween('10.6', '10.7');
  assertVersionBetween('10.6.5', '10.7.0');

  uaString = goog.labs.userAgent.testAgents.SAFARI_MAC;
  goog.labs.userAgent.util.setUserAgent(uaString, platform);
  assertTrue(goog.labs.userAgent.platform.isMacintosh());
  assertVersionBetween('10', '11');
  assertVersionBetween('10.6', '10.7');
  assertVersionBetween('10.6.5', '10.7.0');

  uaString = goog.labs.userAgent.testAgents.FIREFOX_MAC;
  goog.labs.userAgent.util.setUserAgent(uaString, platform);
  assertTrue(goog.labs.userAgent.platform.isMacintosh());
  assertVersion('11.7.9');
  assertVersionBetween('11', '12');
  assertVersionBetween('11.7', '11.8');
  assertVersionBetween('11.7.9', '11.8.0');
}

function testLinux() {
  var uaString = goog.labs.userAgent.testAgents.FIREFOX_LINUX;
  goog.labs.userAgent.util.setUserAgent(uaString);
  assertTrue(goog.labs.userAgent.platform.isLinux());
  assertVersion('');

  uaString = goog.labs.userAgent.testAgents.CHROME_LINUX;
  goog.labs.userAgent.util.setUserAgent(uaString);
  assertTrue(goog.labs.userAgent.platform.isLinux());
  assertVersion('');

  uaString = goog.labs.userAgent.testAgents.OPERA_LINUX;
  goog.labs.userAgent.util.setUserAgent(uaString);
  assertTrue(goog.labs.userAgent.platform.isLinux());
  assertVersion('');
}

function testWindows() {
  var uaString = goog.labs.userAgent.testAgents.SAFARI_WINDOWS;
  goog.labs.userAgent.util.setUserAgent(uaString);
  assertTrue(goog.labs.userAgent.platform.isWindows());
  assertVersion('6.1');
  assertVersionBetween('6', '7');

  uaString = goog.labs.userAgent.testAgents.IE_10;
  goog.labs.userAgent.util.setUserAgent(uaString);
  assertTrue(goog.labs.userAgent.platform.isWindows());
  assertVersion('6.2');
  assertVersionBetween('6', '6.5');

  uaString = goog.labs.userAgent.testAgents.CHROME_25;
  goog.labs.userAgent.util.setUserAgent(uaString);
  assertTrue(goog.labs.userAgent.platform.isWindows());
  assertVersion('5.1');
  assertVersionBetween('5', '6');

  uaString = goog.labs.userAgent.testAgents.FIREFOX_WINDOWS;
  goog.labs.userAgent.util.setUserAgent(uaString);
  assertTrue(goog.labs.userAgent.platform.isWindows());
  assertVersion('6.1');
  assertVersionBetween('6', '7');

  uaString = goog.labs.userAgent.testAgents.IE_11;
  goog.labs.userAgent.util.setUserAgent(uaString);
  assertTrue(goog.labs.userAgent.platform.isWindows());
  assertVersion('6.3');
  assertVersionBetween('6', '6.5');

  uaString = goog.labs.userAgent.testAgents.IE_10_MOBILE;
  goog.labs.userAgent.util.setUserAgent(uaString);
  assertTrue(goog.labs.userAgent.platform.isWindows());
  assertVersion('8.0');
}

function testChromeOS() {
  var uaString = goog.labs.userAgent.testAgents.CHROME_OS_910;

  goog.labs.userAgent.util.setUserAgent(uaString);
  assertTrue(goog.labs.userAgent.platform.isChromeOS());
  assertVersion('9.10.0');
  assertVersionBetween('9', '10');

  uaString = goog.labs.userAgent.testAgents.CHROME_OS;

  goog.labs.userAgent.util.setUserAgent(uaString);
  assertTrue(goog.labs.userAgent.platform.isChromeOS());
  assertVersion('3701.62.0');
  assertVersionBetween('3701', '3702');
}

function assertVersion(version) {
  assertEquals(version, goog.labs.userAgent.platform.getVersion());
}

function assertVersionBetween(lowVersion, highVersion) {
  assertTrue(goog.labs.userAgent.platform.isVersionOrHigher(lowVersion));
  assertFalse(goog.labs.userAgent.platform.isVersionOrHigher(highVersion));
}
