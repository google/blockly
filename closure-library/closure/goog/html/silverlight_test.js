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
 * @fileoverview Unit tests for goog.html.silverlight.
 */

goog.provide('goog.html.silverlightTest');

goog.require('goog.html.SafeHtml');
goog.require('goog.html.TrustedResourceUrl');
goog.require('goog.html.silverlight');
goog.require('goog.string.Const');
goog.require('goog.testing.jsunit');

goog.setTestOnly('goog.html.silverlightTest');


function testCreateObjectForSilverlight() {
  var trustedResourceUrl = goog.html.TrustedResourceUrl.fromConstant(
      goog.string.Const.from('https://google.com/trusted&'));
  assertSameHtml(
      '<object data="data:application/x-silverlight-2," ' +
          'type="application/x-silverlight-2" typemustmatch="" ' +
          'class="test&lt;">' +
          '<param name="source" value="https://google.com/trusted&amp;">' +
          '<param name="onload" value="onload&lt;">' +
          '</object>',
      goog.html.silverlight.createObject(
          trustedResourceUrl,
          {'onload': 'onload<'}, {'class': 'test<'}));

  // Cannot override params, case insensitive.
  assertThrows(function() {
    goog.html.silverlight.createObject(
        trustedResourceUrl, {'datA': 'cantdothis'});
  });

  // Cannot override attributes, case insensitive.
  assertThrows(function() {
    goog.html.silverlight.createObject(
        trustedResourceUrl, {}, {'datA': 'cantdothis'});
  });
}


function assertSameHtml(expected, html) {
  assertEquals(expected, goog.html.SafeHtml.unwrap(html));
}
