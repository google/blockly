// Copyright 2007 The Closure Library Authors. All Rights Reserved.
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

goog.provide('goog.net.CrossDomainRpcTest');
goog.setTestOnly('goog.net.CrossDomainRpcTest');

goog.require('goog.Promise');
goog.require('goog.log');
goog.require('goog.net.CrossDomainRpc');
goog.require('goog.testing.TestCase');
goog.require('goog.testing.jsunit');
goog.require('goog.userAgent');
goog.require('goog.userAgent.product');

function setUpPage() {
  goog.testing.TestCase.getActiveTestCase().promiseTimeout = 20000;  // 20s
}

function print(o) {
  if (Object.prototype.toSource) {
    return o.toSource();
  } else {
    var fragments = [];
    fragments.push('{');
    var first = true;
    for (var p in o) {
      if (!first) fragments.push(',');
      fragments.push(p);
      fragments.push(':"');
      fragments.push(o[p]);
      fragments.push('"');
      first = false;
    }
    return fragments.join('');
  }
}


function testNormalRequest() {
  var start = goog.now();
  return new goog
      .Promise(function(resolve, reject) {
        goog.net.CrossDomainRpc.send(
            'crossdomainrpc_test_response.html', resolve, 'POST',
            {xyz: '01234567891123456789'});
      })
      .then(function(e) {
        if (e.target.status < 300) {
          var elapsed = goog.now() - start;
          var responseData = eval(e.target.responseText);
          goog.log.fine(
              goog.net.CrossDomainRpc.logger_, elapsed + 'ms: [' +
                  responseData.result.length + '] ' + print(responseData));
          assertEquals(16 * 1024, responseData.result.length);
          assertEquals(123, e.target.status);
          assertEquals(1, e.target.responseHeaders.a);
          assertEquals('2', e.target.responseHeaders.b);
        } else {
          goog.log.fine(goog.net.CrossDomainRpc.logger_, print(e));
          fail();
        }
      });
}


function testErrorRequest() {
  // Firefox and Safari do not give a valid error event.
  if (goog.userAgent.GECKO || goog.userAgent.product.SAFARI) {
    return;
  }

  return new goog
      .Promise(function(resolve, reject) {
        goog.net.CrossDomainRpc.send(
            'http://hoodjimcwaadji.google.com/index.html', resolve, 'POST',
            {xyz: '01234567891123456789'});
        setTimeout(function() {
          reject('CrossDomainRpc.send did not complete within 4000ms');
        }, 4000);
      })
      .then(function(e) {
        if (e.target.status < 300) {
          fail('should have failed requesting a non-existent URI');
        } else {
          goog.log.fine(
              goog.net.CrossDomainRpc.logger_,
              'expected error seen; event=' + print(e));
        }
      });
}


function testGetDummyResourceUri() {
  var url = goog.net.CrossDomainRpc.getDummyResourceUri_();
  assertTrue('dummy resource URL should not contain "?"', url.indexOf('?') < 0);
  assertTrue('dummy resource URL should not contain "#"', url.indexOf('#') < 0);
}


function testRemoveHash() {
  assertEquals('abc', goog.net.CrossDomainRpc.removeHash_('abc#123'));
  assertEquals('abc', goog.net.CrossDomainRpc.removeHash_('abc#12#3'));
}
