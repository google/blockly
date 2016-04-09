// Copyright 2006 The Closure Library Authors. All Rights Reserved.
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

goog.provide('goog.userAgentTest');
goog.setTestOnly('goog.userAgentTest');

goog.require('goog.array');
goog.require('goog.labs.userAgent.platform');
goog.require('goog.labs.userAgent.testAgents');
goog.require('goog.labs.userAgent.util');
goog.require('goog.testing.PropertyReplacer');
goog.require('goog.testing.jsunit');
goog.require('goog.userAgent');
goog.require('goog.userAgentTestUtil');


var documentMode;
goog.userAgent.getDocumentMode_ = function() {
  return documentMode;
};


var propertyReplacer = new goog.testing.PropertyReplacer();

var UserAgents =
    {GECKO: 'GECKO', IE: 'IE', OPERA: 'OPERA', WEBKIT: 'WEBKIT', EDGE: 'EDGE'};


function tearDown() {
  goog.labs.userAgent.util.setUserAgent(null);
  documentMode = undefined;
  propertyReplacer.reset();
}


/**
 * Test browser detection for a user agent configuration.
 * @param {Array<number>} expectedAgents Array of expected userAgents.
 * @param {string} uaString User agent string.
 * @param {string=} opt_product Navigator product string.
 * @param {string=} opt_vendor Navigator vendor string.
 */
function assertUserAgent(expectedAgents, uaString, opt_product, opt_vendor) {
  var mockGlobal = {
    'navigator':
        {'userAgent': uaString, 'product': opt_product, 'vendor': opt_vendor}
  };
  propertyReplacer.set(goog, 'global', mockGlobal);

  goog.labs.userAgent.util.setUserAgent(null);

  goog.userAgentTestUtil.reinitializeUserAgent();
  for (var ua in UserAgents) {
    var isExpected = goog.array.contains(expectedAgents, UserAgents[ua]);
    assertEquals(
        isExpected,
        goog.userAgentTestUtil.getUserAgentDetected(UserAgents[ua]));
  }
}

function testOperaInit() {
  var mockOpera = {'version': function() { return '9.20'; }};

  var mockGlobal = {
    'navigator': {'userAgent': 'Opera/9.20 (Windows NT 5.1; U; de),gzip(gfe)'},
    'opera': mockOpera
  };
  propertyReplacer.set(goog, 'global', mockGlobal);

  propertyReplacer.set(goog.userAgent, 'getUserAgentString', function() {
    return 'Opera/9.20 (Windows NT 5.1; U; de),gzip(gfe)';
  });

  goog.labs.userAgent.util.setUserAgent(null);
  goog.userAgentTestUtil.reinitializeUserAgent();
  assertTrue(goog.userAgent.OPERA);
  assertEquals('9.20', goog.userAgent.VERSION);

  // What if 'opera' global has been overwritten?
  // We must degrade gracefully (rather than throwing JS errors).
  propertyReplacer.set(goog.global, 'opera', 'bobloblaw');

  // NOTE(nnaze): window.opera is now ignored with the migration to
  // goog.labs.userAgent.*. Version is expected to should stay the same.
  goog.labs.userAgent.util.setUserAgent(null);
  goog.userAgentTestUtil.reinitializeUserAgent();
  assertUndefined(goog.userAgent.VERSION);
}

function testCompare() {
  assertTrue(
      'exact equality broken', goog.userAgent.compare('1.0', '1.0') == 0);
  assertTrue(
      'mutlidot equality broken',
      goog.userAgent.compare('1.0.0.0', '1.0') == 0);
  assertTrue('less than broken', goog.userAgent.compare('1.0.2.1', '1.1') < 0);
  assertTrue(
      'greater than broken', goog.userAgent.compare('1.1', '1.0.2.1') > 0);

  assertTrue('b broken', goog.userAgent.compare('1.1', '1.1b') > 0);
  assertTrue('b broken', goog.userAgent.compare('1.1b', '1.1') < 0);
  assertTrue('b broken', goog.userAgent.compare('1.1b', '1.1b') == 0);

  assertTrue('b>a broken', goog.userAgent.compare('1.1b', '1.1a') > 0);
  assertTrue('a<b broken', goog.userAgent.compare('1.1a', '1.1b') < 0);
}

function testGecko() {
  assertGecko(
      'Mozilla/5.0 (Windows; U; Windows NT 5.1; nl-NL; rv:1.7.5)' +
          'Gecko/20041202 Gecko/1.0',
      '1.7.5');
  assertGecko(
      'Mozilla/5.0 (X11; U; Linux x86_64; en-US; rv:1.7.6)' +
          'Gecko/20050512 Gecko',
      '1.7.6');
  assertGecko(
      'Mozilla/5.0 (X11; U; FreeBSD i386; en-US; rv:1.7.8)' +
          'Gecko/20050609 Gecko/1.0.4',
      '1.7.8');
  assertGecko(
      'Mozilla/5.0 (X11; U; Linux i686; en-US; rv:1.7.9)' +
          'Gecko/20050711 Gecko/1.0.5',
      '1.7.9');
  assertGecko(
      'Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US; rv:1.7.10)' +
          'Gecko/20050716 Gecko/1.0.6',
      '1.7.10');
  assertGecko(
      'Mozilla/5.0 (Macintosh; U; PPC Mac OS X Mach-O; en-GB;' +
          'rv:1.7.10) Gecko/20050717 Gecko/1.0.6',
      '1.7.10');
  assertGecko(
      'Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US; rv:1.7.12)' +
          'Gecko/20050915 Gecko/1.0.7',
      '1.7.12');
  assertGecko(
      'Mozilla/5.0 (Macintosh; U; PPC Mac OS X Mach-O; en-US;' +
          'rv:1.7.12) Gecko/20050915 Gecko/1.0.7',
      '1.7.12');
  assertGecko(
      'Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US; rv:1.8b4)' +
          'Gecko/20050908 Gecko/1.4',
      '1.8b4');
  assertGecko(
      'Mozilla/5.0 (Windows; U; Windows NT 5.1; nl; rv:1.8)' +
          'Gecko/20051107 Gecko/1.5',
      '1.8');
  assertGecko(
      'Mozilla/5.0 (Windows; U; Windows NT 5.1; en-GB; rv:1.8.0.1)' +
          'Gecko/20060111 Gecko/1.5.0.1',
      '1.8.0.1');
  assertGecko(
      'Mozilla/5.0 (Windows; U; Windows NT 6.0; en-US; rv:1.8.0.1)' +
          'Gecko/20060111 Gecko/1.5.0.1',
      '1.8.0.1');
  assertGecko(
      'Mozilla/5.0 (X11; U; Linux i686; en-US; rv:1.8.0.2)' +
          'Gecko/20060308 Gecko/1.5.0.2',
      '1.8.0.2');
  assertGecko(
      'Mozilla/5.0 (Macintosh; U; PPC Mac OS X Mach-O; en-US;' +
          'rv:1.8.0.3) Gecko/20060426 Gecko/1.5.0.3',
      '1.8.0.3');
  assertGecko(
      'Mozilla/5.0 (X11; U; Linux i686; en-US; rv:1.8.0.3)' +
          'Gecko/20060426 Gecko/1.5.0.3',
      '1.8.0.3');
  assertGecko(
      'Mozilla/5.0 (X11; U; Linux i686; en-US; rv:1.8.0.4)' +
          'Gecko/20060508 Gecko/1.5.0.4',
      '1.8.0.4');
  assertGecko(
      'Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US; rv:1.8.0.4)' +
          'Gecko/20060508 Gecko/1.5.0.4',
      '1.8.0.4');
  assertGecko(
      'Mozilla/5.0 (Windows; U; Windows NT 6.0; en-US; rv:1.8.0.4)' +
          'Gecko/20060508 Gecko/1.5.0.4',
      '1.8.0.4');
  assertGecko(
      'Mozilla/5.0 (Windows; U; Windows NT 5.1; es-ES; rv:1.8.0.6)' +
          'Gecko/20060728 Gecko/1.5.0.6',
      '1.8.0.6');
  assertGecko(
      'Mozilla/5.0 (X11; U; Linux i686; en-US; rv:1.8.0.6)' +
          'Gecko/20060808 Fedora/1.5.0.6-2.fc5 Gecko/1.5.0.6 pango-text',
      '1.8.0.6');
  assertGecko(
      'Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US; rv:1.8)' +
          'Gecko/20060321 Gecko/2.0a1',
      '1.8');
  assertGecko(
      'Mozilla/5.0 (X11; Linux i686; rv:6.0) Gecko/6.0 Firefox/6.0', '6.0');
}

function testIe() {
  assertIe('Mozilla/4.0 (compatible; MSIE 5.01; Windows NT 5.0)', '5.01');
  assertIe('Mozilla/4.0 (compatible; MSIE 5.17; Mac_PowerPC)', '5.17');
  assertIe('Mozilla/4.0 (compatible; MSIE 5.23; Mac_PowerPC)', '5.23');
  assertIe('Mozilla/4.0 (compatible; MSIE 5.5; Windows NT 5.0)', '5.5');
  assertIe('Mozilla/4.0 (compatible; MSIE 6.0; MSN 2.5; Windows 98)', '6.0');
  assertIe('Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1; SV1)', '6.0');
  assertIe(
      'Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1; SV1; ' +
          '.NET CLR 1.1.4322)',
      '6.0');
  assertIe(
      'Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1; SV1; ' +
          '.NET CLR 2.0.50727)',
      '6.0');
  assertIe('Mozilla/4.0 (compatible; MSIE 7.0b; Windows NT 5.1)', '7.0b');
  assertIe('Mozilla/4.0 (compatible; MSIE 7.0b; Win32)', '7.0b');
  assertIe('Mozilla/4.0 (compatible; MSIE 7.0b; Windows NT 6.0)', '7.0b');
  assertIe(
      'Mozilla/4.0 (compatible; MSIE 7.0; Windows NT 5.1; SV1;' +
          'Arcor 5.005; .NET CLR 1.0.3705; .NET CLR 1.1.4322)',
      '7.0');
  assertIe(
      'Mozilla/5.0 (Windows NT 6.3; Trident/7.0; rv:11.0) like Gecko', '11.0');
}

function testIeDocumentModeOverride() {
  documentMode = 9;
  assertIe(
      'Mozilla/4.0 (compatible; MSIE 7.0; Windows NT 6.1; Trident/5.0', '9');
  assertIe(
      'Mozilla/4.0 (compatible; MSIE 8.0; Windows NT 6.1; Trident/5.0', '9');

  documentMode = 8;
  assertIe(
      'Mozilla/4.0 (compatible; MSIE 8.0; Windows NT 6.1; Trident/5.0', '8.0');
}

function testDocumentModeInStandardsMode() {
  goog.userAgentTestUtil.reinitializeUserAgent();
  var expectedMode =
      goog.userAgent.IE ? parseInt(goog.userAgent.VERSION) : undefined;
  assertEquals(expectedMode, goog.userAgent.DOCUMENT_MODE);
}

function testEdge() {
  var testAgents = goog.labs.userAgent.testAgents;
  assertEdge(testAgents.EDGE_12_0, '12.0');
  assertEdge(testAgents.EDGE_12_9600, '12.9600');
}

function testOpera() {
  var assertOpera = function(uaString) {
    assertUserAgent([UserAgents.OPERA], uaString);
  };
  assertOpera('Opera/7.23 (Windows 98; U) [en]');
  assertOpera('Opera/8.00 (Windows NT 5.1; U; en)');
  assertOpera('Opera/8.0 (X11; Linux i686; U; cs)');
  assertOpera('Opera/8.02 (Windows NT 5.1; U; en)');
  assertOpera('Opera/8.50 (Windows NT 5.1; U; en)');
  assertOpera('Opera/8.5 (X11; Linux i686; U; cs)');
  assertOpera('Opera/8.51 (Windows NT 5.1; U; en)');
  assertOpera('Opera/9.0 (Windows NT 5.0; U; en)');
  assertOpera('Opera/9.00 (Macintosh; PPC Mac OS X; U; en)');
  assertOpera('Opera/9.00 (Windows NT 5.1; U; en)');
  assertOpera('Opera/9.00 (Windows NT 5.2; U; en)');
  assertOpera('Opera/9.00 (Windows NT 6.0; U; en)');
}

function testWebkit() {
  var testAgents = goog.labs.userAgent.testAgents;
  assertWebkit(testAgents.ANDROID_BROWSER_403);
  assertWebkit(testAgents.ANDROID_BROWSER_403_ALT);
}

function testUnknownBrowser() {
  assertUserAgent([], 'MyWebBrowser');
  assertUserAgent([], undefined);
}

function testNoNavigator() {
  // global object has no "navigator" property.
  var mockGlobal = {};
  propertyReplacer.set(goog, 'global', mockGlobal);
  goog.labs.userAgent.util.setUserAgent(null);
  goog.userAgentTestUtil.reinitializeUserAgent();

  assertEquals(
      'Platform should be the empty string', '', goog.userAgent.PLATFORM);
  assertEquals(
      'Version should be the empty string', '', goog.userAgent.VERSION);
}

function testLegacyChromeOsAndLinux() {
  // As a legacy behavior, goog.userAgent.LINUX considers
  // ChromeOS to be Linux.
  // goog.labs.userAgent.platform.isLinux() does not.
  goog.labs.userAgent.util.setUserAgent(
      goog.labs.userAgent.testAgents.CHROME_OS);
  goog.userAgentTestUtil.reinitializeUserAgent();
  assertTrue(goog.userAgent.LINUX);
  assertFalse(goog.labs.userAgent.platform.isLinux());
}

function assertIe(uaString, expectedVersion) {
  assertUserAgent([UserAgents.IE], uaString);
  assertEquals(
      'User agent ' + uaString + ' should have had version ' + expectedVersion +
          ' but had ' + goog.userAgent.VERSION,
      expectedVersion, goog.userAgent.VERSION);
}

function assertEdge(uaString, expectedVersion) {
  assertUserAgent([UserAgents.EDGE], uaString);
  assertEquals(
      'User agent ' + uaString + ' should have had version ' + expectedVersion +
          ' but had ' + goog.userAgent.VERSION,
      expectedVersion, goog.userAgent.VERSION);
}

function assertGecko(uaString, expectedVersion) {
  assertUserAgent([UserAgents.GECKO], uaString, 'Gecko');
  assertEquals(
      'User agent ' + uaString + ' should have had version ' + expectedVersion +
          ' but had ' + goog.userAgent.VERSION,
      expectedVersion, goog.userAgent.VERSION);
}

function assertWebkit(uaString) {
  assertUserAgent([UserAgents.WEBKIT], uaString, 'WebKit');
}
