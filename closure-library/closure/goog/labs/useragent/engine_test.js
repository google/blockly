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
 * @fileoverview Unit tests for goog.labs.userAgent.engine.
 */

goog.provide('goog.labs.userAgent.engineTest');

goog.require('goog.labs.userAgent.engine');
goog.require('goog.labs.userAgent.testAgents');
goog.require('goog.labs.userAgent.util');
goog.require('goog.testing.jsunit');

goog.setTestOnly('goog.labs.userAgent.engineTest');

var testAgents = goog.labs.userAgent.testAgents;

function setUp() {
  goog.labs.userAgent.util.setUserAgent(null);
}

function assertVersion(version) {
  assertEquals(version, goog.labs.userAgent.engine.getVersion());
}

function assertLowAndHighVersions(lowVersion, highVersion) {
  assertTrue(goog.labs.userAgent.engine.isVersionOrHigher(lowVersion));
  assertFalse(goog.labs.userAgent.engine.isVersionOrHigher(highVersion));
}

function testPresto() {
  goog.labs.userAgent.util.setUserAgent(testAgents.OPERA_LINUX);
  assertTrue(goog.labs.userAgent.engine.isPresto());
  assertFalse(goog.labs.userAgent.engine.isGecko());
  assertVersion('2.9.168');
  assertLowAndHighVersions('2.9', '2.10');

  goog.labs.userAgent.util.setUserAgent(testAgents.OPERA_MAC);
  assertTrue(goog.labs.userAgent.engine.isPresto());
  assertFalse(goog.labs.userAgent.engine.isGecko());
  assertVersion('2.9.168');
  assertLowAndHighVersions('2.9', '2.10');
}

function testTrident() {
  goog.labs.userAgent.util.setUserAgent(testAgents.IE_6);
  assertTrue(goog.labs.userAgent.engine.isTrident());
  assertFalse(goog.labs.userAgent.engine.isGecko());
  assertFalse(goog.labs.userAgent.engine.isEdge());
  assertVersion('');

  goog.labs.userAgent.util.setUserAgent(testAgents.IE_10);
  assertTrue(goog.labs.userAgent.engine.isTrident());
  assertFalse(goog.labs.userAgent.engine.isGecko());
  assertFalse(goog.labs.userAgent.engine.isEdge());
  assertVersion('6.0');
  assertLowAndHighVersions('6.0', '7.0');

  goog.labs.userAgent.util.setUserAgent(testAgents.IE_8);
  assertTrue(goog.labs.userAgent.engine.isTrident());
  assertFalse(goog.labs.userAgent.engine.isGecko());
  assertFalse(goog.labs.userAgent.engine.isEdge());
  assertVersion('4.0');
  assertLowAndHighVersions('4.0', '5.0');

  goog.labs.userAgent.util.setUserAgent(testAgents.IE_9_COMPATIBILITY);
  assertTrue(goog.labs.userAgent.engine.isTrident());
  assertFalse(goog.labs.userAgent.engine.isGecko());
  assertFalse(goog.labs.userAgent.engine.isEdge());
  assertVersion('5.0');
  assertLowAndHighVersions('5.0', '6.0');

  goog.labs.userAgent.util.setUserAgent(goog.labs.userAgent.testAgents.IE_11);
  assertTrue(goog.labs.userAgent.engine.isTrident());
  assertFalse(goog.labs.userAgent.engine.isGecko());
  assertFalse(goog.labs.userAgent.engine.isEdge());
  assertVersion('7.0');
  assertLowAndHighVersions('6.0', '8.0');

  goog.labs.userAgent.util.setUserAgent(
      goog.labs.userAgent.testAgents.IE_10_MOBILE);
  assertTrue(goog.labs.userAgent.engine.isTrident());
  assertFalse(goog.labs.userAgent.engine.isEdge());
  assertVersion('6.0');
}

function testEdge() {
  goog.labs.userAgent.util.setUserAgent(testAgents.EDGE_12_0);
  assertTrue(goog.labs.userAgent.engine.isEdge());
  assertFalse(goog.labs.userAgent.engine.isTrident());
  assertFalse(goog.labs.userAgent.engine.isGecko());
  assertVersion('12.0');
  assertLowAndHighVersions('11.0', '13.0');
}

function testWebKit() {
  goog.labs.userAgent.util.setUserAgent(testAgents.ANDROID_BROWSER_235);
  assertTrue(goog.labs.userAgent.engine.isWebKit());
  assertFalse(goog.labs.userAgent.engine.isGecko());
  assertFalse(goog.labs.userAgent.engine.isEdge());
  assertVersion('533.1');
  assertLowAndHighVersions('533.0', '534.0');

  goog.labs.userAgent.util.setUserAgent(testAgents.ANDROID_BROWSER_403_ALT);
  assertTrue(goog.labs.userAgent.engine.isWebKit());
  assertFalse(goog.labs.userAgent.engine.isGecko());
  assertFalse(goog.labs.userAgent.engine.isEdge());
  assertVersion('534.30');
  assertLowAndHighVersions('533.0', '535.0');

  goog.labs.userAgent.util.setUserAgent(testAgents.CHROME_25);
  assertTrue(goog.labs.userAgent.engine.isWebKit());
  assertFalse(goog.labs.userAgent.engine.isGecko());
  assertFalse(goog.labs.userAgent.engine.isEdge());
  assertVersion('535.8');
  assertLowAndHighVersions('535.0', '536.0');

  goog.labs.userAgent.util.setUserAgent(testAgents.SAFARI_6);
  assertTrue(goog.labs.userAgent.engine.isWebKit());
  assertFalse(goog.labs.userAgent.engine.isGecko());
  assertFalse(goog.labs.userAgent.engine.isEdge());
  assertVersion('536.25');
  assertLowAndHighVersions('536.0', '537.0');

  goog.labs.userAgent.util.setUserAgent(testAgents.SAFARI_IPHONE_6);
  assertTrue(goog.labs.userAgent.engine.isWebKit());
  assertFalse(goog.labs.userAgent.engine.isGecko());
  assertFalse(goog.labs.userAgent.engine.isEdge());
  assertVersion('536.26');
  assertLowAndHighVersions('536.0', '537.0');
}

function testOpera15() {
  goog.labs.userAgent.util.setUserAgent(testAgents.OPERA_15);
  assertTrue(goog.labs.userAgent.engine.isWebKit());
  assertFalse(goog.labs.userAgent.engine.isPresto());
  assertVersion('537.36');
}

function testGecko() {
  goog.labs.userAgent.util.setUserAgent(testAgents.FIREFOX_LINUX);
  assertTrue(goog.labs.userAgent.engine.isGecko());
  assertFalse(goog.labs.userAgent.engine.isEdge());
  assertVersion('15.0.1');
  assertLowAndHighVersions('14.0', '16.0');

  goog.labs.userAgent.util.setUserAgent(testAgents.FIREFOX_19);
  assertTrue(goog.labs.userAgent.engine.isGecko());
  assertFalse(goog.labs.userAgent.engine.isEdge());
  assertVersion('19.0');
  assertLowAndHighVersions('18.0', '20.0');

  goog.labs.userAgent.util.setUserAgent(testAgents.FIREFOX_WINDOWS);
  assertTrue(goog.labs.userAgent.engine.isGecko());
  assertFalse(goog.labs.userAgent.engine.isEdge());
  assertVersion('14.0.1');
  assertLowAndHighVersions('14.0', '15.0');
}
