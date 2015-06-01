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

/**
 * @fileoverview Unit tests for goog.html.flash.
 */

goog.provide('goog.html.flashTest');

goog.require('goog.html.SafeHtml');
goog.require('goog.html.TrustedResourceUrl');
goog.require('goog.html.flash');
goog.require('goog.string.Const');
goog.require('goog.testing.jsunit');

goog.setTestOnly('goog.html.flashTest');


function testCreateEmbed() {
  var trustedResourceUrl = goog.html.TrustedResourceUrl.fromConstant(
      goog.string.Const.from('https://google.com/trusted&'));
  assertSameHtml(
      '<embed ' +
          'src="https://google.com/trusted&amp;" ' +
          'type="application/x-shockwave-flash" ' +
          'pluginspage="https://www.macromedia.com/go/getflashplayer" ' +
          'allownetworking="none" ' +
          'allowScriptAccess="always&lt;" ' +
          'class="test&lt;">',
      goog.html.flash.createEmbed(
          trustedResourceUrl,
          {'allowScriptAccess': 'always<', 'class': 'test<'}));

  // Cannot override attributes, case insensitive.
  assertThrows(function() {
    goog.html.flash.createEmbed(
        trustedResourceUrl, {'Type': 'cannotdothis'});
  });
}


function testCreateObject() {
  var trustedResourceUrl = goog.html.TrustedResourceUrl.fromConstant(
      goog.string.Const.from('https://google.com/trusted&'));
  assertSameHtml(
      '<object data="https://google.com/trusted&amp;" ' +
          'type="application/x-shockwave-flash" typemustmatch="" ' +
          'class="test&lt;">' +
          '<param name="allownetworking" value="none">' +
          '<param name="allowScriptAccess" value="always&lt;">' +
          '</object>',
      goog.html.flash.createObject(
          trustedResourceUrl,
          {'allowScriptAccess': 'always<'}, {'class': 'test<'}));

  // Cannot override params, case insensitive.
  assertThrows(function() {
    goog.html.flash.createObject(
        trustedResourceUrl, {'datA': 'cantdothis'});
  });

  // Cannot override attributes, case insensitive.
  assertThrows(function() {
    goog.html.flash.createObject(
        trustedResourceUrl, {}, {'datA': 'cantdothis'});
  });
}


function testCreateObjectForOldIe() {
  var trustedResourceUrl = goog.html.TrustedResourceUrl.fromConstant(
      goog.string.Const.from('https://google.com/trusted&'));
  assertSameHtml(
      '<object classid="clsid:d27cdb6e-ae6d-11cf-96b8-444553540000" ' +
          'class="test&lt;">' +
          '<param name="allownetworking" value="none">' +
          '<param name="movie" value="https://google.com/trusted&amp;">' +
          '<param name="allowScriptAccess" value="always&lt;">' +
          '</object>',
      goog.html.flash.createObjectForOldIe(
          trustedResourceUrl,
          {'allowScriptAccess': 'always<'}, {'class': 'test<'}));

  // Cannot override params, case insensitive.
  assertThrows(function() {
    goog.html.flash.createObjectForOldIe(
        trustedResourceUrl, {'datA': 'cantdothis'});
  });

  // Cannot override attributes, case insensitive.
  assertThrows(function() {
    goog.html.flash.createObjectForOldIe(
        trustedResourceUrl, {}, {'datA': 'cantdothis'});
  });
}


function assertSameHtml(expected, html) {
  assertEquals(expected, goog.html.SafeHtml.unwrap(html));
}
