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
 * @fileoverview Unit tests for goog.labs.userAgent.browser.
 */

goog.provide('goog.labs.userAgent.browserTest');

goog.require('goog.labs.userAgent.browser');
goog.require('goog.labs.userAgent.testAgents');
goog.require('goog.labs.userAgent.util');
goog.require('goog.object');
goog.require('goog.testing.jsunit');

goog.setTestOnly('goog.labs.userAgent.browserTest');

/*
 * Map of browser name to checking method.
 * Used by assertBrowser() to verify that only one is true at a time.
 */
var Browser = {
  ANDROID_BROWSER: goog.labs.userAgent.browser.isAndroidBrowser,
  CHROME: goog.labs.userAgent.browser.isChrome,
  COAST: goog.labs.userAgent.browser.isCoast,
  FIREFOX: goog.labs.userAgent.browser.isFirefox,
  OPERA: goog.labs.userAgent.browser.isOpera,
  IE: goog.labs.userAgent.browser.isIE,
  IOS_WEBVIEW: goog.labs.userAgent.browser.isIosWebview,
  SAFARI: goog.labs.userAgent.browser.isSafari,
  SILK: goog.labs.userAgent.browser.isSilk,
  EDGE: goog.labs.userAgent.browser.isEdge
};


/*
 * Assert that the given browser is true and the others are false.
 */
function assertBrowser(browser) {
  assertTrue(
      'Supplied argument "browser" not in Browser object',
      goog.object.containsValue(Browser, browser));

  // Verify that the method is true for the given browser
  // and false for all others.
  goog.object.forEach(Browser, function(f, name) {
    if (f == browser) {
      assertTrue('Value for browser ' + name, f());
    } else {
      assertFalse('Value for browser ' + name, f());
    }
  });
}

function setUp() {
  goog.labs.userAgent.util.setUserAgent(null);
}

function testOpera10() {
  goog.labs.userAgent.util.setUserAgent(
      goog.labs.userAgent.testAgents.OPERA_10);
  assertBrowser(Browser.OPERA);
  assertVersion('10.00');
  assertVersionBetween('10.00', '10.10');
}

function testOperaMac() {
  goog.labs.userAgent.util.setUserAgent(
      goog.labs.userAgent.testAgents.OPERA_MAC);
  assertBrowser(Browser.OPERA);
  assertVersion('11.52');
  assertVersionBetween('11.50', '12.00');
}

function testOperaLinux() {
  goog.labs.userAgent.util.setUserAgent(
      goog.labs.userAgent.testAgents.OPERA_LINUX);
  assertBrowser(Browser.OPERA);
  assertVersion('11.50');
  assertVersionBetween('11.00', '12.00');
}

function testOpera15() {
  goog.labs.userAgent.util.setUserAgent(
      goog.labs.userAgent.testAgents.OPERA_15);
  assertBrowser(Browser.OPERA);
  assertVersion('15.0.1147.100');
  assertVersionBetween('15.00', '16.00');
}

function testIE6() {
  goog.labs.userAgent.util.setUserAgent(goog.labs.userAgent.testAgents.IE_6);
  assertBrowser(Browser.IE);
  assertVersion('6.0');
  assertVersionBetween('5.0', '7.0');
}

function testIE7() {
  goog.labs.userAgent.util.setUserAgent(goog.labs.userAgent.testAgents.IE_7);
  assertBrowser(Browser.IE);
  assertVersion('7.0');
}

function testIE8() {
  goog.labs.userAgent.util.setUserAgent(goog.labs.userAgent.testAgents.IE_8);
  assertBrowser(Browser.IE);
  assertVersion('8.0');
  assertVersionBetween('7.0', '9.0');
}

function testIE8Compatibility() {
  goog.labs.userAgent.util.setUserAgent(
      goog.labs.userAgent.testAgents.IE_8_COMPATIBILITY);
  assertBrowser(Browser.IE);
  assertVersion('8.0');
}

function testIE9() {
  goog.labs.userAgent.util.setUserAgent(goog.labs.userAgent.testAgents.IE_9);
  assertBrowser(Browser.IE);
  assertVersion('9.0');
  assertVersionBetween('8.0', '10.0');
}

function testIE9Compatibility() {
  goog.labs.userAgent.util.setUserAgent(
      goog.labs.userAgent.testAgents.IE_9_COMPATIBILITY);
  assertBrowser(Browser.IE);
  assertVersion('9.0');
}

function testIE10() {
  goog.labs.userAgent.util.setUserAgent(goog.labs.userAgent.testAgents.IE_10);
  assertBrowser(Browser.IE);
  assertVersion('10.0');
  assertVersionBetween('10.0', '11.0');
}

function testIE10Compatibility() {
  goog.labs.userAgent.util.setUserAgent(
      goog.labs.userAgent.testAgents.IE_10_COMPATIBILITY);
  assertBrowser(Browser.IE);
  assertVersion('10.0');
}

function testIE10Mobile() {
  goog.labs.userAgent.util.setUserAgent(
      goog.labs.userAgent.testAgents.IE_10_MOBILE);
  assertBrowser(Browser.IE);
  assertVersion('10.0');
}

function testIE11() {
  goog.labs.userAgent.util.setUserAgent(goog.labs.userAgent.testAgents.IE_11);
  assertBrowser(Browser.IE);
  assertVersion('11.0');
  assertVersionBetween('10.0', '12.0');
}

function testIE11CompatibilityMSIE7() {
  goog.labs.userAgent.util.setUserAgent(
      goog.labs.userAgent.testAgents.IE_11_COMPATIBILITY_MSIE_7);
  assertBrowser(Browser.IE);
  assertVersion('11.0');
}

function testIE11CompatibilityMSIE9() {
  goog.labs.userAgent.util.setUserAgent(
      goog.labs.userAgent.testAgents.IE_11_COMPATIBILITY_MSIE_9);
  assertBrowser(Browser.IE);
  assertVersion('11.0');
}

function testEdge120() {
  goog.labs.userAgent.util.setUserAgent(
      goog.labs.userAgent.testAgents.EDGE_12_0);
  assertBrowser(Browser.EDGE);
  assertVersion('12.0');
  assertVersionBetween('11.0', '13.0');
}

function testEdge() {
  goog.labs.userAgent.util.setUserAgent(
      goog.labs.userAgent.testAgents.EDGE_12_9600);
  assertBrowser(Browser.EDGE);
  assertVersion('12.9600');
  assertVersionBetween('11.0', '13.0');
}

function testFirefox19() {
  goog.labs.userAgent.util.setUserAgent(
      goog.labs.userAgent.testAgents.FIREFOX_19);
  assertBrowser(Browser.FIREFOX);
  assertVersion('19.0');
  assertVersionBetween('18.0', '20.0');
}

function testFirefoxWindows() {
  goog.labs.userAgent.util.setUserAgent(
      goog.labs.userAgent.testAgents.FIREFOX_WINDOWS);
  assertBrowser(Browser.FIREFOX);
  assertVersion('14.0.1');
  assertVersionBetween('14.0', '15.0');
}

function testFirefoxLinux() {
  goog.labs.userAgent.util.setUserAgent(
      goog.labs.userAgent.testAgents.FIREFOX_LINUX);
  assertBrowser(Browser.FIREFOX);
  assertTrue(goog.labs.userAgent.browser.isFirefox());
  assertVersion('15.0.1');
}

function testChromeAndroid() {
  goog.labs.userAgent.util.setUserAgent(
      goog.labs.userAgent.testAgents.CHROME_ANDROID);
  assertBrowser(Browser.CHROME);
  assertTrue(goog.labs.userAgent.browser.isChrome());
  assertVersion('18.0.1025.133');
  assertVersionBetween('18.0', '19.0');
  assertVersionBetween('17.0', '18.1');
}

function testChromeIphone() {
  goog.labs.userAgent.util.setUserAgent(
      goog.labs.userAgent.testAgents.CHROME_IPHONE);
  assertBrowser(Browser.CHROME);
  assertTrue(goog.labs.userAgent.browser.isChrome());
  assertVersion('22.0.1194.0');
  assertVersionBetween('22.0', '23.0');
  assertVersionBetween('22.0', '22.10');
}

function testChromeIpad() {
  goog.labs.userAgent.util.setUserAgent(
      goog.labs.userAgent.testAgents.CHROME_IPAD);
  assertBrowser(Browser.CHROME);
  assertTrue(goog.labs.userAgent.browser.isChrome());
  assertVersion('32.0.1700.20');
  assertVersionBetween('32.0', '33.0');
  assertVersionBetween('32.0', '32.10');
}

function testChromeMac() {
  goog.labs.userAgent.util.setUserAgent(
      goog.labs.userAgent.testAgents.CHROME_MAC);
  assertBrowser(Browser.CHROME);
  assertTrue(goog.labs.userAgent.browser.isChrome());
  assertVersion('24.0.1309.0');
  assertVersionBetween('24.0', '25.0');
  assertVersionBetween('24.0', '24.10');
}

function testSafariIpad() {
  goog.labs.userAgent.util.setUserAgent(goog.labs.userAgent.testAgents.IPAD_6);
  assertBrowser(Browser.SAFARI);
  assertTrue(goog.labs.userAgent.browser.isSafari());
  assertVersion('6.0');
  assertVersionBetween('5.1', '7.0');
}

function testSafari6() {
  goog.labs.userAgent.util.setUserAgent(
      goog.labs.userAgent.testAgents.SAFARI_6);
  assertBrowser(Browser.SAFARI);
  assertTrue(goog.labs.userAgent.browser.isSafari());
  assertVersion('6.0');
  assertVersionBetween('6.0', '7.0');
}

function testSafariIphone() {
  goog.labs.userAgent.util.setUserAgent(
      goog.labs.userAgent.testAgents.SAFARI_IPHONE_6);
  assertBrowser(Browser.SAFARI);
  assertTrue(goog.labs.userAgent.browser.isSafari());
  assertVersion('6.0');
  assertVersionBetween('5.0', '7.0');
}

function testCoast() {
  goog.labs.userAgent.util.setUserAgent(goog.labs.userAgent.testAgents.COAST);
  assertBrowser(Browser.COAST);
}

function testWebviewIOS() {
  goog.labs.userAgent.util.setUserAgent(
      goog.labs.userAgent.testAgents.WEBVIEW_IPHONE);
  assertBrowser(Browser.IOS_WEBVIEW);
  goog.labs.userAgent.util.setUserAgent(
      goog.labs.userAgent.testAgents.WEBVIEW_IPAD);
  assertBrowser(Browser.IOS_WEBVIEW);
}

function testAndroidBrowser235() {
  goog.labs.userAgent.util.setUserAgent(
      goog.labs.userAgent.testAgents.ANDROID_BROWSER_235);
  assertBrowser(Browser.ANDROID_BROWSER);
  assertVersion('4.0');
  assertVersionBetween('3.0', '5.0');
}

function testAndroidBrowser403() {
  goog.labs.userAgent.util.setUserAgent(
      goog.labs.userAgent.testAgents.ANDROID_BROWSER_403);
  assertBrowser(Browser.ANDROID_BROWSER);
  assertVersion('4.0');
  assertVersionBetween('3.0', '5.0');
}

function testAndroidBrowser233() {
  goog.labs.userAgent.util.setUserAgent(
      goog.labs.userAgent.testAgents.ANDROID_BROWSER_233);
  assertBrowser(Browser.ANDROID_BROWSER);
  assertVersion('4.0');
  assertVersionBetween('3.0', '5.0');
}

function testAndroidWebView411() {
  goog.labs.userAgent.util.setUserAgent(
      goog.labs.userAgent.testAgents.ANDROID_WEB_VIEW_4_1_1);
  assertBrowser(Browser.ANDROID_BROWSER);
  assertVersion('4.0');
  assertVersionBetween('3.0', '5.0');
}

function testAndroidWebView44() {
  goog.labs.userAgent.util.setUserAgent(
      goog.labs.userAgent.testAgents.ANDROID_WEB_VIEW_4_4);
  assertBrowser(Browser.CHROME);
  assertVersion('30.0.0.0');
  assertVersionBetween('29.0', '31.0');
}

function testSilk() {
  goog.labs.userAgent.util.setUserAgent(
      goog.labs.userAgent.testAgents.KINDLE_FIRE);
  assertBrowser(Browser.SILK);
  assertVersion('2.1');
}

function testFirefoxOnAndroidTablet() {
  goog.labs.userAgent.util.setUserAgent(
      goog.labs.userAgent.testAgents.FIREFOX_ANDROID_TABLET);
  assertBrowser(Browser.FIREFOX);
  assertVersion('28.0');
  assertVersionBetween('27.0', '29.0');
}

function assertVersion(version) {
  assertEquals(version, goog.labs.userAgent.browser.getVersion());
}

function assertVersionBetween(lowVersion, highVersion) {
  assertTrue(goog.labs.userAgent.browser.isVersionOrHigher(lowVersion));
  assertFalse(goog.labs.userAgent.browser.isVersionOrHigher(highVersion));
}
