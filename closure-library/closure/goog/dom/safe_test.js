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

goog.provide('goog.dom.safeTest');
goog.setTestOnly('goog.dom.safeTest');

goog.require('goog.dom.safe');
goog.require('goog.dom.safe.InsertAdjacentHtmlPosition');
goog.require('goog.html.SafeHtml');
goog.require('goog.html.SafeUrl');
goog.require('goog.html.TrustedResourceUrl');
goog.require('goog.html.testing');
goog.require('goog.string.Const');
goog.require('goog.testing');
goog.require('goog.testing.jsunit');


var mockWindowOpen;


function tearDown() {
  if (mockWindowOpen) {
    mockWindowOpen.$tearDown();
  }
}


function testInsertAdjacentHtml() {
  var writtenHtml;
  var writtenPosition;
  var mockNode =  /** @type {!Node} */ ({
    'insertAdjacentHTML': function(position, html) {
      writtenPosition = position;
      writtenHtml = html;
    }
  });

  goog.dom.safe.insertAdjacentHtml(
      mockNode,
      goog.dom.safe.InsertAdjacentHtmlPosition.BEFOREBEGIN,
      goog.html.SafeHtml.create('div', {}, 'foobar'));
  assertEquals('<div>foobar</div>', writtenHtml);
  assertEquals('beforebegin', writtenPosition);
}


function testSetInnerHtml() {
  var mockElement =  /** @type {!Element} */ ({
    'innerHTML': 'blarg'
  });
  var html = '<script>somethingTrusted();<' + '/script>';
  var safeHtml = goog.html.testing.newSafeHtmlForTest(html);
  goog.dom.safe.setInnerHtml(mockElement, safeHtml);
  assertEquals(html, mockElement.innerHTML);
}


function testDocumentWrite() {
  var mockDoc = /** @type {!Document} */ ({
    'html': null,
    /** @suppress {globalThis} */
    'write': function(html) {
      this['html'] = html;
    }
  });
  var html = '<script>somethingTrusted();<' + '/script>';
  var safeHtml = goog.html.testing.newSafeHtmlForTest(html);
  goog.dom.safe.documentWrite(mockDoc, safeHtml);
  assertEquals(html, mockDoc.html);
}


function testsetLinkHrefAndRel_trustedResourceUrl() {
  var mockLink = /** @type {HTMLLinkElement} */ ({
    'href': null,
    'rel': null
  });

  var url = goog.html.TrustedResourceUrl.fromConstant(
      goog.string.Const.from('javascript:trusted();'));
  // Test case-insensitive too.
  goog.dom.safe.setLinkHrefAndRel(mockLink, url, 'foo, Stylesheet, bar');
  assertEquals('javascript:trusted();', mockLink.href);

  goog.dom.safe.setLinkHrefAndRel(mockLink, url, 'foo, bar');
  assertEquals('javascript:trusted();', mockLink.href);
}


function testsetLinkHrefAndRel_safeUrl() {
  var mockLink = /** @type {HTMLLinkElement} */ ({
    'href': null,
    'rel': null
  });

  var url = goog.html.SafeUrl.fromConstant(
      goog.string.Const.from('javascript:trusted();'));
  assertThrows(function() {
    goog.dom.safe.setLinkHrefAndRel(mockLink, url, 'foo, stylesheet, bar');
  });

  goog.dom.safe.setLinkHrefAndRel(mockLink, url, 'foo, bar');
  assertEquals('javascript:trusted();', mockLink.href);
}


function testsetLinkHrefAndRel_string() {
  var mockLink = /** @type {HTMLLinkElement} */ ({
    'href': null,
    'rel': null
  });

  assertThrows(function() {
    goog.dom.safe.setLinkHrefAndRel(
        mockLink, 'javascript:evil();', 'foo, stylesheet, bar');
  });

  goog.dom.safe.setLinkHrefAndRel(mockLink, 'javascript:evil();', 'foo, bar');
  assertEquals('about:invalid#zClosurez', mockLink.href);
}


function testSetLocationHref() {
  var mockLoc = /** @type {!Location} */ ({
    'href': 'blarg'
  });
  goog.dom.safe.setLocationHref(mockLoc, 'javascript:evil();');
  assertEquals('about:invalid#zClosurez', mockLoc.href);

  mockLoc = /** @type {!Location} */ ({
    'href': 'blarg'
  });
  var safeUrl = goog.html.SafeUrl.fromConstant(
      goog.string.Const.from('javascript:trusted();'));
  goog.dom.safe.setLocationHref(mockLoc, safeUrl);
  assertEquals('javascript:trusted();', mockLoc.href);
}


function testSetAnchorHref() {
  var mockAnchor = /** @type {!HTMLAnchorElement} */ ({
    'href': 'blarg'
  });
  goog.dom.safe.setAnchorHref(mockAnchor, 'javascript:evil();');
  assertEquals('about:invalid#zClosurez', mockAnchor.href);

  mockAnchor = /** @type {!HTMLAnchorElement} */ ({
    'href': 'blarg'
  });
  var safeUrl = goog.html.SafeUrl.fromConstant(
      goog.string.Const.from('javascript:trusted();'));
  goog.dom.safe.setAnchorHref(mockAnchor, safeUrl);
  assertEquals('javascript:trusted();', mockAnchor.href);
}


function testOpenInWindow() {
  mockWindowOpen = goog.testing.createMethodMock(window, 'open');
  var fakeWindow = {};

  mockWindowOpen('about:invalid#zClosurez', 'name', 'specs', true).
      $returns(fakeWindow);
  mockWindowOpen.$replay();
  var retVal = goog.dom.safe.openInWindow('javascript:evil();', window,
      goog.string.Const.from('name'), 'specs', true);
  mockWindowOpen.$verify();
  assertEquals('openInWindow should return the created window',
      fakeWindow, retVal);

  mockWindowOpen.$reset();
  retVal = null;

  var safeUrl = goog.html.SafeUrl.fromConstant(
      goog.string.Const.from('javascript:trusted();'));
  mockWindowOpen('javascript:trusted();', 'name', 'specs', true).
      $returns(fakeWindow);
  mockWindowOpen.$replay();
  retVal = goog.dom.safe.openInWindow(safeUrl, window,
      goog.string.Const.from('name'), 'specs', true);
  mockWindowOpen.$verify();
  assertEquals('openInWindow should return the created window',
      fakeWindow, retVal);
}
