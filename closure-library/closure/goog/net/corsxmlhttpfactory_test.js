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

goog.provide('goog.net.CorsXmlHttpFactoryTest');
goog.setTestOnly('goog.net.CorsXmlHttpFactoryTest');

goog.require('goog.net.CorsXmlHttpFactory');
goog.require('goog.net.IeCorsXhrAdapter');
goog.require('goog.testing.jsunit');
goog.require('goog.userAgent');

function testBrowserSupport() {
  var requestFactory = new goog.net.CorsXmlHttpFactory();
  if (goog.userAgent.IE) {
    if (goog.userAgent.isVersionOrHigher('10')) {
      // Continue: IE10 supports CORS requests using native XMLHttpRequest.
    } else if (goog.userAgent.isVersionOrHigher('8')) {
      assertTrue(
          requestFactory.createInstance() instanceof goog.net.IeCorsXhrAdapter);
      return;
    } else {
      try {
        requestFactory.createInstance();
        fail('Error expected.');
      } catch (e) {
        assertEquals('Unsupported browser', e.message);
        return;
      }
    }
  }
  // All other browsers support CORS requests using native XMLHttpRequest.
  assertTrue(requestFactory.createInstance() instanceof XMLHttpRequest);
}
