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

goog.provide('goog.userAgent.platformTest');
goog.setTestOnly('goog.userAgent.platformTest');

goog.require('goog.testing.MockUserAgent');
goog.require('goog.testing.jsunit');
goog.require('goog.userAgent');
goog.require('goog.userAgent.platform');
goog.require('goog.userAgentTestUtil');

var mockAgent;

function setUp() {
  mockAgent = new goog.testing.MockUserAgent();
  mockAgent.install();
}

function tearDown() {
  mockAgent.dispose();
  updateUserAgentUtils();
}

function updateUserAgentUtils() {
  goog.userAgentTestUtil.reinitializeUserAgent();
}

function testWindows() {
  mockAgent.setNavigator({platform: 'Win32'});

  var win98 = 'Mozilla/4.0 (compatible; MSIE 6.0b; Windows 98; Win 9x 4.90)';
  var win2k = 'Mozilla/5.0 (Windows; U; MSIE 7.0; Windows NT 5.0; en-US)';
  var xp = 'Mozilla/5.0 (Windows; U; MSIE 7.0; Windows NT 5.1; en-US)';
  var vista = 'Mozilla/5.0 (Windows; U; MSIE 7.0; Windows NT 6.0; en-US)';
  var win7 = 'Mozilla/5.0 (Windows; U; MSIE 7.0; Windows NT 6.1; en-US)';
  var win81 = 'Mozilla/5.0 (Windows NT 6.3; Trident/7.0; rv:11.0) like Gecko';

  mockAgent.setUserAgentString(win98);
  updateUserAgentUtils();
  assertEquals('0', goog.userAgent.platform.VERSION);

  mockAgent.setUserAgentString(win2k);
  updateUserAgentUtils();
  assertEquals('5.0', goog.userAgent.platform.VERSION);

  mockAgent.setUserAgentString(xp);
  updateUserAgentUtils();
  assertEquals('5.1', goog.userAgent.platform.VERSION);

  mockAgent.setUserAgentString(vista);
  updateUserAgentUtils();
  assertEquals('6.0', goog.userAgent.platform.VERSION);

  mockAgent.setUserAgentString(win7);
  updateUserAgentUtils();
  assertEquals('6.1', goog.userAgent.platform.VERSION);

  mockAgent.setUserAgentString(win81);
  updateUserAgentUtils();
  assertEquals('6.3', goog.userAgent.platform.VERSION);
}

function testMac() {
  // For some reason Chrome substitutes _ for . in the OS version.
  var chrome = 'Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10_5_8; en-US)' +
      'AppleWebKit/532.5 (KHTML, like Gecko) Chrome/4.0.249.49 Safari/532.5';

  var ff = 'Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10.5; en-US;' +
      'rv:1.9.1.7) Gecko/20091221 Firefox/3.5.7 GTB6';

  mockAgent.setNavigator({platform: 'IntelMac'});

  mockAgent.setUserAgentString(chrome);
  updateUserAgentUtils();
  assertEquals('10.5.8', goog.userAgent.platform.VERSION);

  mockAgent.setUserAgentString(ff);
  updateUserAgentUtils();
  assertEquals('10.5', goog.userAgent.platform.VERSION);
}

function testChromeOnAndroid() {
  // Borrowing search's test user agent string for android.
  var uaString = 'Mozilla/5.0 (Linux; U; Android 4.0.2; en-us; Galaxy Nexus' +
      ' Build/ICL53F) AppleWebKit/535.7 (KHTML, like Gecko) ' +
      'Chrome/18.0.1025.133 Mobile Safari/535.7';

  // Need to set this lest the testing platform be used for detection.
  mockAgent.setNavigator({platform: 'Android'});

  mockAgent.setUserAgentString(uaString);
  updateUserAgentUtils();
  assertTrue(goog.userAgent.ANDROID);
  assertEquals('4.0.2', goog.userAgent.platform.VERSION);
}

function testAndroidBrowser() {
  var uaString = 'Mozilla/5.0 (Linux; U; Android 2.3.4; fr-fr;' +
      'HTC Desire Build/GRJ22) AppleWebKit/533.1 (KHTML, like Gecko)' +
      'Version/4.0 Mobile Safari/533.1';

  // Need to set this lest the testing platform be used for detection.
  mockAgent.setNavigator({platform: 'Android'});

  mockAgent.setUserAgentString(uaString);
  updateUserAgentUtils();
  assertTrue(goog.userAgent.ANDROID);
  assertEquals('2.3.4', goog.userAgent.platform.VERSION);
}

function testIPhone() {
  // Borrowing search's test user agent string for the iPhone.
  var uaString = 'Mozilla/5.0 (iPhone; U; CPU iPhone OS 4_0 like Mac OS X; ' +
      'en-us) AppleWebKit/532.9 (KHTML, like Gecko) Version/4.0.5 ' +
      'Mobile/8A293 Safari/6531.22.7';

  // Need to set this lest the testing platform be used for detection.
  mockAgent.setNavigator({platform: 'iPhone'});

  mockAgent.setUserAgentString(uaString);
  updateUserAgentUtils();
  assertTrue(goog.userAgent.IPHONE);
  assertEquals('4.0', goog.userAgent.platform.VERSION);
}

function testIPad() {
  // Borrowing search's test user agent string for the iPad.
  var uaString = 'Mozilla/5.0 (iPad; U; CPU OS 4_2_1 like Mac OS X; ja-jp) ' +
      'AppleWebKit/533.17.9 (KHTML, like Gecko) Version/5.0.2 Mobile/8C148 ' +
      'Safari/6533.18.5';

  // Need to set this lest the testing platform be used for detection.
  mockAgent.setNavigator({platform: 'iPad'});

  mockAgent.setUserAgentString(uaString);
  updateUserAgentUtils();
  assertTrue(goog.userAgent.IPAD);
  assertEquals('4.2.1', goog.userAgent.platform.VERSION);
}
