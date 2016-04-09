// Copyright 2008 The Closure Library Authors. All Rights Reserved.
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

goog.provide('goog.userAgent.productTest');
goog.setTestOnly('goog.userAgent.productTest');

goog.require('goog.array');
goog.require('goog.labs.userAgent.testAgents');
goog.require('goog.labs.userAgent.util');
goog.require('goog.testing.MockUserAgent');
goog.require('goog.testing.PropertyReplacer');
goog.require('goog.testing.jsunit');
goog.require('goog.userAgent');
goog.require('goog.userAgent.product');
goog.require('goog.userAgent.product.isVersion');
goog.require('goog.userAgentTestUtil');

var mockAgent;
var replacer;

function setUp() {
  mockAgent = new goog.testing.MockUserAgent();
  mockAgent.install();
  replacer = new goog.testing.PropertyReplacer();
}

function tearDown() {
  replacer.reset();
  mockAgent.dispose();
  updateUserAgentUtils();
}

function updateUserAgentUtils() {
  goog.labs.userAgent.util.setUserAgent(null);
  goog.userAgentTestUtil.reinitializeUserAgent();
}

// The set of products whose corresponding goog.userAgent.product value is set
// in goog.userAgent.product.init_().
var DETECTED_BROWSER_KEYS =
    ['FIREFOX', 'IPHONE', 'IPAD', 'ANDROID', 'CHROME', 'SAFARI'];


// browserKey should be the constant name, as a string
// 'FIREFOX', 'CHROME', 'ANDROID', etc.
function assertIsBrowser(currentBrowser) {
  assertTrue(
      'Current browser key into goog.userAgent.product ' +
          'should be true',
      goog.userAgent.product[currentBrowser]);

  // Make sure we don't have any false positives for other browsers.
  goog.array.forEach(DETECTED_BROWSER_KEYS, function(browserKey) {
    // Ignore the iPad/Safari case, as the new code correctly
    // identifies the test useragent as both iPad and Safari.
    if (currentBrowser == 'IPAD' && browserKey == 'SAFARI') {
      return;
    }

    if (currentBrowser == 'IPHONE' && browserKey == 'SAFARI') {
      return;
    }

    if (currentBrowser != browserKey) {
      assertFalse(
          'Current browser key is ' + currentBrowser +
              ' but different key into goog.userAgent.product is true: ' +
              browserKey,
          goog.userAgent.product[browserKey]);
    }
  });
}

function assertBrowserAndVersion(userAgent, browser, version) {
  mockAgent.setUserAgentString(userAgent);
  updateUserAgentUtils();
  assertIsBrowser(browser);
  assertEquals(
      'User agent should have this version', version, goog.userAgent.VERSION);
}


/**
 * @param {Array<{
 *           ua: string,
 *           versions: Array<{
 *             num: (string|number), truth: boolean}>}>} userAgents
 * @param {string} browser
 */
function checkEachUserAgentDetected(userAgents, browser) {
  goog.array.forEach(userAgents, function(ua) {
    mockAgent.setUserAgentString(ua.ua);
    updateUserAgentUtils();

    assertIsBrowser(browser);

    // Check versions
    goog.array.forEach(ua.versions, function(v) {
      mockAgent.setUserAgentString(ua.ua);
      updateUserAgentUtils();
      assertEquals(
          'Expected version ' + v.num + ' from ' + ua.ua + ' but got ' +
              goog.userAgent.product.VERSION,
          v.truth, goog.userAgent.product.isVersion(v.num));
    });
  });
}

function testInternetExplorer() {
  var userAgents = [
    {
      ua: 'Mozilla/4.0 (compatible; MSIE 7.0; Windows NT 5.1; GTB6; ' +
          'chromeframe; .NET CLR 1.1.4322; InfoPath.1; ' +
          '.NET CLR 3.0.04506.30; .NET CLR 3.0.04506.648; ' +
          '.NET CLR 3.0.4506.2152; .NET CLR 3.5.30729; .NET CLR 2.0.50727)',
      versions: [
        {num: 6, truth: true}, {num: '7.0', truth: true},
        {num: 7.1, truth: false}, {num: 8, truth: false}
      ]
    },
    {
      ua: 'Mozilla/5.0 (Windows NT 6.3; Trident/7.0; rv:11.0) like Gecko',
      versions: [
        {num: 10, truth: true}, {num: 11, truth: true},
        {num: '11.0', truth: true}, {num: '12', truth: false}
      ]
    }
  ];
  // hide any navigator.product value by putting in a navigator with no
  // properties.
  mockAgent.setNavigator({});
  checkEachUserAgentDetected(userAgents, 'IE');
}

function testEdge() {
  var userAgents = [{
    ua: goog.labs.userAgent.testAgents.EDGE_12_9600,
    versions: [
      {num: 11, truth: true}, {num: 12, truth: true},
      {num: '12.96', truth: true}, {num: '12.9600', truth: true},
      {num: '12.9601', truth: false}, {num: '12.10240', truth: false},
      {num: 13, truth: false}
    ]
  }];
  checkEachUserAgentDetected(userAgents, 'EDGE');
}

function testOpera() {
  var opera = {};
  var userAgents = [{
    ua: 'Opera/9.80 (Windows NT 5.1; U; en) Presto/2.2.15 Version/10.01',
    versions: [
      {num: 9, truth: true}, {num: '10.1', truth: true},
      {num: 11, truth: false}
    ]
  }];
  replacer.set(goog.global, 'opera', opera);
  opera.version = '10.01';
  checkEachUserAgentDetected(userAgents, 'OPERA');
  userAgents = [{
    ua: 'Opera/9.63 (Windows NT 5.1; U; en) Presto/2.1.1',
    versions: [
      {num: 9, truth: true}, {num: '10.1', truth: false},
      {num: '9.80', truth: false}, {num: '9.60', truth: true}
    ]
  }];
  opera.version = '9.63';
  checkEachUserAgentDetected(userAgents, 'OPERA');
}

function testFirefox() {
  var userAgents = [
    {
      ua: 'Mozilla/6.0 (Macintosh; U; PPC Mac OS X Mach-O; en-US; ' +
          'rv:2.0.0.0) Gecko/20061028 Firefox/3.0',
      versions: [
        {num: 2, truth: true}, {num: '3.0', truth: true},
        {num: '3.5.3', truth: false}
      ]
    },
    {
      ua: 'Mozilla/5.0 (Macintosh; U; PPC Mac OS X Mach-O; en-US; ' +
          'rv:1.8.1.4) Gecko/20070515 Firefox/2.0.4',
      versions: [
        {num: 2, truth: true}, {num: '2.0.4', truth: true},
        {num: 3, truth: false}, {num: '3.5.3', truth: false}
      ]
    },
    {
      ua: 'Mozilla/5.0 (X11; Linux i686; rv:6.0) Gecko/6.0 Firefox/6.0',
      versions: [
        {num: 6, truth: true}, {num: '6.0', truth: true},
        {num: 7, truth: false}, {num: '7.0', truth: false}
      ]
    }
  ];

  checkEachUserAgentDetected(userAgents, 'FIREFOX');

  // Mozilla reported to us that they plan this UA format starting
  // in Firefox 13.
  // See bug at https://bugzilla.mozilla.org/show_bug.cgi?id=588909
  // and thread at http://goto.google.com/pfltz
  mockAgent.setNavigator({product: 'Gecko'});
  assertBrowserAndVersion(
      'Mozilla/5.0 (X11; Linux i686; rv:6.0) Gecko/6.0 Firefox/6.0', 'FIREFOX',
      '6.0');
}

function testChrome() {
  var userAgents = [
    {
      ua: 'Mozilla/5.0 (Windows; U; Windows NT 6.0; en-US) ' +
          'AppleWebKit/525.19 (KHTML, like Gecko) Chrome/0.2.153.0 ' +
          'Safari/525.19',
      versions: [{num: '0.2.153', truth: true}, {num: 1, truth: false}]
    },
    {
      ua: 'Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US) ' +
          'AppleWebKit/532.3 (KHTML, like Gecko) Chrome/4.0.223.11 ' +
          'Safari/532.3',
      versions: [
        {num: 4, truth: true}, {num: '0.2.153', truth: true},
        {num: '4.1.223.13', truth: false}, {num: '4.0.223.10', truth: true}
      ]
    },
    {
      ua: 'Mozilla/5.0 (Linux; Android 4.0.4; Galaxy Nexus Build/IMM76B)' +
          'AppleWebKit/535.19 (KHTML, like Gecko) ' +
          'Chrome/18.0.1025.133 Mobile' +
          'Safari/535.19',
      versions: [
        {num: 18, truth: true}, {num: '0.2.153', truth: true},
        {num: 29, truth: false}, {num: '18.0.1025.133', truth: true}
      ]
    }
  ];
  checkEachUserAgentDetected(userAgents, 'CHROME');
}

function testSafari() {
  var userAgents = [
    {
      ua: 'Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10_6_7; de-de) ' +
          'AppleWebKit/534.16+ (KHTML, like Gecko) Version/5.0.3 ' +
          'Safari/533.19.4',
      versions: [
        {num: 5, truth: true}, {num: '5.0.3', truth: true},
        {num: '5.0.4', truth: false}, {num: '533', truth: false}
      ]
    },
    {
      ua: 'Mozilla/5.0 (Windows; U; Windows NT 6.0; pl-PL) ' +
          'AppleWebKit/525.19 (KHTML, like Gecko) Version/3.1.2 Safari/525.21',
      versions: [
        {num: 3, truth: true}, {num: '3.0', truth: true},
        {num: '3.1.2', truth: true}
      ]
    },
    {
      ua: 'Mozilla/5.0 (Macintosh; U; PPC Mac OS X 10_5_3; en-us) ' +
          'AppleWebKit/525.18 (KHTML, like Gecko) Version/3.1.1 Safari/525.20',
      versions: [
        {num: 3, truth: true}, {num: '3.1.1', truth: true},
        {num: '3.1.2', truth: false}, {num: '525.21', truth: false}
      ]
    },

    // Safari 1 and 2 do not report product version numbers in their
    // user-agent strings. VERSION for these browsers will be set to ''.
    {
      ua: 'Mozilla/5.0 (Macintosh; U; PPC Mac OS X; ja-jp) ' +
          'AppleWebKit/418.9.1 (KHTML, like Gecko) Safari/419.3',
      versions: [
        {num: 3, truth: false}, {num: 2, truth: false}, {num: 1, truth: false},
        {num: 0, truth: true}, {num: '0', truth: true},
        {num: '', truth: true}
      ]
    }
  ];
  checkEachUserAgentDetected(userAgents, 'SAFARI');
}

function testIphone() {
  var userAgents = [
    {
      ua: 'Mozilla/5.0 (iPhone; U; CPU like Mac OS X; en) AppleWebKit/420+ ' +
          '(KHTML, like Gecko) Version/3.0 Mobile/1A543a Safari/419.3',
      versions: [
        {num: '3.0.1A543a', truth: true}, {num: '3.0', truth: true},
        {num: '3.0.1B543a', truth: false}, {num: '3.1.1A543a', truth: false},
        {num: '3.0.1A320c', truth: true}, {num: '3.0.3A100a', truth: false}
      ]
    },
    {
      ua: 'Mozilla/5.0 (iPod; U; CPU like Mac OS X; en) AppleWebKit/420.1 ' +
          '(KHTML, like Gecko) Version/3.0 Mobile/3A100a Safari/419.3',
      versions: [
        {num: '3.0.1A543a', truth: true}, {num: '3.0.3A100a', truth: true}
      ]
    }
  ];
  checkEachUserAgentDetected(userAgents, 'IPHONE');
}

function testIpad() {
  var userAgents = [
    {
      ua: 'Mozilla/5.0 (iPad; U; CPU OS 3_2 like Mac OS X; en-us) ' +
          'AppleWebKit/531.21.10 (KHTML, like Gecko) Version/4.0.4 ' +
          'Mobile/7B334b Safari/531.21.10',
      versions: [
        {num: '4.0.4.7B334b', truth: true}, {num: '4.0', truth: true},
        {num: '4.0.4.7C334b', truth: false}, {num: '4.1.7B334b', truth: false},
        {num: '4.0.4.7B320c', truth: true},
        {num: '4.0.4.8B334b', truth: false}
      ]
    },
    // Webview in the Facebook iOS app
    {
      ua: 'Mozilla/5.0 (iPad; CPU OS 8_1 like Mac OS X) AppleWebKit/600.1.4' +
          '(KHTML, like Gecko) Mobile/12B410 [FBAN/FBIOS;FBAV/16.0.0.13.22;' +
          'FBBV/4697910;FBDV/iPad3,4;FBMD/iPad;FBSN/iPhone OS;FBSV/8.1;' +
          'FBSS/2; FBCR/;FBID/tablet;FBLC/ja_JP;FBOP/1]',
      versions: [{num: '', truth: true}]
    }
  ];
  checkEachUserAgentDetected(userAgents, 'IPAD');
}

function testAndroid() {
  var userAgents = [
    {
      ua: 'Mozilla/5.0 (Linux; U; Android 0.5; en-us) AppleWebKit/522+ ' +
          '(KHTML, like Gecko) Safari/419.3',
      versions: [{num: 0.5, truth: true}, {num: '1.0', truth: false}]
    },
    {
      ua: 'Mozilla/5.0 (Linux; U; Android 1.0; en-us; dream) ' +
          'AppleWebKit/525.10+ (KHTML, like Gecko) Version/3.0.4 Mobile ' +
          'Safari/523.12.2',
      versions: [
        {num: 0.5, truth: true}, {num: 1, truth: true},
        {num: '1.0', truth: true}, {num: '3.0.12', truth: false}
      ]
    }
  ];
  checkEachUserAgentDetected(userAgents, 'ANDROID');
}

function testAndroidLegacyBehavior() {
  mockAgent.setUserAgentString(
      goog.labs.userAgent.testAgents.FIREFOX_ANDROID_TABLET);
  updateUserAgentUtils();
  // Historically, goog.userAgent.product.ANDROID has referred to the
  // Android browser, not the platform. Firefox on Android should
  // be false.
  assertFalse(goog.userAgent.product.ANDROID);
}

function testSafariIosLegacyBehavior() {
  mockAgent.setUserAgentString(goog.labs.userAgent.testAgents.SAFARI_IPHONE_6);
  updateUserAgentUtils();
  // Historically, goog.userAgent.product.SAFARI has referred to the
  // Safari desktop browser, not the mobile browser.
  assertFalse(goog.userAgent.product.SAFARI);
}
