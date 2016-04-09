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
 * @fileoverview Unit tests for goog.html.SafeHtml and its builders.
 */

goog.provide('goog.html.safeHtmlTest');

goog.require('goog.html.SafeHtml');
goog.require('goog.html.SafeStyle');
goog.require('goog.html.SafeStyleSheet');
goog.require('goog.html.SafeUrl');
goog.require('goog.html.TrustedResourceUrl');
goog.require('goog.html.testing');
goog.require('goog.i18n.bidi.Dir');
goog.require('goog.object');
goog.require('goog.string.Const');
goog.require('goog.testing.jsunit');

goog.setTestOnly('goog.html.safeHtmlTest');


function testSafeHtml() {
  // TODO(xtof): Consider using SafeHtmlBuilder instead of newSafeHtmlForTest,
  // when available.
  var safeHtml = goog.html.testing.newSafeHtmlForTest('Hello <em>World</em>');
  assertSameHtml('Hello <em>World</em>', safeHtml);
  assertEquals('Hello <em>World</em>', goog.html.SafeHtml.unwrap(safeHtml));
  assertEquals('SafeHtml{Hello <em>World</em>}', String(safeHtml));
  assertNull(safeHtml.getDirection());

  safeHtml = goog.html.testing.newSafeHtmlForTest(
      'World <em>Hello</em>', goog.i18n.bidi.Dir.RTL);
  assertSameHtml('World <em>Hello</em>', safeHtml);
  assertEquals('World <em>Hello</em>', goog.html.SafeHtml.unwrap(safeHtml));
  assertEquals('SafeHtml{World <em>Hello</em>}', String(safeHtml));
  assertEquals(goog.i18n.bidi.Dir.RTL, safeHtml.getDirection());

  // Interface markers are present.
  assertTrue(safeHtml.implementsGoogStringTypedString);
  assertTrue(safeHtml.implementsGoogI18nBidiDirectionalString);

  // Pre-defined constant.
  assertSameHtml('', goog.html.SafeHtml.EMPTY);
  assertSameHtml('<br>', goog.html.SafeHtml.BR);
}


/** @suppress {checkTypes} */
function testUnwrap() {
  var privateFieldName = 'privateDoNotAccessOrElseSafeHtmlWrappedValue_';
  var markerFieldName = 'SAFE_HTML_TYPE_MARKER_GOOG_HTML_SECURITY_PRIVATE_';
  var propNames = goog.object.getKeys(goog.html.SafeHtml.htmlEscape(''));
  assertContains(privateFieldName, propNames);
  assertContains(markerFieldName, propNames);
  var evil = {};
  evil[privateFieldName] = '<script>evil()</script';
  evil[markerFieldName] = {};

  var exception = assertThrows(function() { goog.html.SafeHtml.unwrap(evil); });
  assertContains('expected object of type SafeHtml', exception.message);
}


function testHtmlEscape() {
  // goog.html.SafeHtml passes through unchanged.
  var safeHtmlIn = goog.html.SafeHtml.htmlEscape('<b>in</b>');
  assertTrue(safeHtmlIn === goog.html.SafeHtml.htmlEscape(safeHtmlIn));

  // Plain strings are escaped.
  var safeHtml = goog.html.SafeHtml.htmlEscape('Hello <em>"\'&World</em>');
  assertSameHtml('Hello &lt;em&gt;&quot;&#39;&amp;World&lt;/em&gt;', safeHtml);
  assertEquals(
      'SafeHtml{Hello &lt;em&gt;&quot;&#39;&amp;World&lt;/em&gt;}',
      String(safeHtml));

  // Creating from a SafeUrl escapes and retains the known direction (which is
  // fixed to RTL for URLs).
  var safeUrl = goog.html.SafeUrl.fromConstant(
      goog.string.Const.from('http://example.com/?foo&bar'));
  var escapedUrl = goog.html.SafeHtml.htmlEscape(safeUrl);
  assertSameHtml('http://example.com/?foo&amp;bar', escapedUrl);
  assertEquals(goog.i18n.bidi.Dir.LTR, escapedUrl.getDirection());

  // Creating SafeHtml from a goog.string.Const escapes as well (i.e., the
  // value is treated like any other string). To create HTML markup from
  // program literals, SafeHtmlBuilder should be used.
  assertSameHtml(
      'this &amp; that',
      goog.html.SafeHtml.htmlEscape(goog.string.Const.from('this & that')));
}


function testSafeHtmlCreate() {
  var br = goog.html.SafeHtml.create('br');

  assertSameHtml('<br>', br);

  assertSameHtml(
      '<span title="&quot;"></span>',
      goog.html.SafeHtml.create('span', {'title': '"'}));

  assertSameHtml(
      '<span>&lt;</span>', goog.html.SafeHtml.create('span', {}, '<'));

  assertSameHtml(
      '<span><br></span>', goog.html.SafeHtml.create('span', {}, br));

  assertSameHtml('<span></span>', goog.html.SafeHtml.create('span', {}, []));

  assertSameHtml(
      '<span></span>',
      goog.html.SafeHtml.create('span', {'title': null, 'class': undefined}));

  assertSameHtml(
      '<span>x<br>y</span>',
      goog.html.SafeHtml.create('span', {}, ['x', br, 'y']));

  assertSameHtml(
      '<table border="0"></table>',
      goog.html.SafeHtml.create('table', {'border': 0}));

  var onclick = goog.string.Const.from('alert(/"/)');
  assertSameHtml(
      '<span onclick="alert(/&quot;/)"></span>',
      goog.html.SafeHtml.create('span', {'onclick': onclick}));

  var href = goog.html.testing.newSafeUrlForTest('?a&b');
  assertSameHtml(
      '<a href="?a&amp;b"></a>',
      goog.html.SafeHtml.create('a', {'href': href}));

  var style = goog.html.testing.newSafeStyleForTest('border: /* " */ 0;');
  assertSameHtml(
      '<hr style="border: /* &quot; */ 0;">',
      goog.html.SafeHtml.create('hr', {'style': style}));

  assertEquals(
      goog.i18n.bidi.Dir.NEUTRAL,
      goog.html.SafeHtml.create('span').getDirection());
  assertNull(goog.html.SafeHtml.create('span', {'dir': 'x'}).getDirection());
  assertEquals(
      goog.i18n.bidi.Dir.NEUTRAL,
      goog.html.SafeHtml.create('span', {'dir': 'ltr'}, 'a').getDirection());

  assertThrows(function() { goog.html.SafeHtml.create('script'); });

  assertThrows(function() { goog.html.SafeHtml.create('br', {}, 'x'); });

  assertThrows(function() {
    goog.html.SafeHtml.create('img', {'onerror': ''});
  });

  assertThrows(function() {
    goog.html.SafeHtml.create('img', {'OnError': ''});
  });

  assertThrows(function() { goog.html.SafeHtml.create('a href=""'); });

  assertThrows(function() {
    goog.html.SafeHtml.create('a', {'title="" href': ''});
  });

  assertThrows(function() { goog.html.SafeHtml.create('applet'); });

  assertThrows(function() {
    goog.html.SafeHtml.create('applet', {'code': 'kittens.class'});
  });

  assertThrows(function() { goog.html.SafeHtml.create('base'); });

  assertThrows(function() {
    goog.html.SafeHtml.create('base', {'href': 'http://example.org'});
  });

  assertThrows(function() { goog.html.SafeHtml.create('math'); });

  assertThrows(function() { goog.html.SafeHtml.create('meta'); });

  assertThrows(function() { goog.html.SafeHtml.create('svg'); });
}


function testSafeHtmlCreate_styleAttribute() {
  var style = 'color:red;';
  var expected = '<hr style="' + style + '">';
  assertThrows(function() {
    goog.html.SafeHtml.create('hr', {'style': style});
  });
  assertSameHtml(expected, goog.html.SafeHtml.create('hr', {
    'style': goog.html.SafeStyle.fromConstant(goog.string.Const.from(style))
  }));
  assertSameHtml(
      expected, goog.html.SafeHtml.create('hr', {'style': {'color': 'red'}}));
}


function testSafeHtmlCreate_urlAttributes() {
  // TrustedResourceUrl is allowed.
  var trustedResourceUrl = goog.html.TrustedResourceUrl.fromConstant(
      goog.string.Const.from('https://google.com/trusted'));
  assertSameHtml(
      '<img src="https://google.com/trusted">',
      goog.html.SafeHtml.create('img', {'src': trustedResourceUrl}));
  // SafeUrl is allowed.
  var safeUrl = goog.html.SafeUrl.sanitize('https://google.com/safe');
  assertSameHtml(
      '<imG src="https://google.com/safe">',
      goog.html.SafeHtml.create('imG', {'src': safeUrl}));
  // Const is allowed.
  var constUrl = goog.string.Const.from('https://google.com/const');
  assertSameHtml(
      '<a href="https://google.com/const"></a>',
      goog.html.SafeHtml.create('a', {'href': constUrl}));

  // string is allowed but escaped.
  assertSameHtml(
      '<a href="http://google.com/safe&quot;"></a>',
      goog.html.SafeHtml.create('a', {'href': 'http://google.com/safe"'}));

  // string is allowed but sanitized.
  var badUrl = 'javascript:evil();';
  var sanitizedUrl =
      goog.html.SafeUrl.unwrap(goog.html.SafeUrl.sanitize(badUrl));

  assertTrue(typeof sanitizedUrl == 'string');
  assertNotEquals(badUrl, sanitizedUrl);

  assertSameHtml(
      '<a href="' + sanitizedUrl + '"></a>',
      goog.html.SafeHtml.create('a', {'href': badUrl}));

  // attribute case is ignored for url attributes purposes
  assertSameHtml(
      '<a hReF="' + sanitizedUrl + '"></a>',
      goog.html.SafeHtml.create('a', {'hReF': badUrl}));
}


function testSafeHtmlCreateIframe() {
  // Setting src and srcdoc.
  var url = goog.html.TrustedResourceUrl.fromConstant(
      goog.string.Const.from('https://google.com/trusted<'));
  assertSameHtml(
      '<iframe src="https://google.com/trusted&lt;"></iframe>',
      goog.html.SafeHtml.createIframe(url, null, {'sandbox': null}));
  var srcdoc = goog.html.SafeHtml.BR;
  assertSameHtml(
      '<iframe srcdoc="&lt;br&gt;"></iframe>',
      goog.html.SafeHtml.createIframe(null, srcdoc, {'sandbox': null}));

  // sandbox default and overriding it.
  assertSameHtml(
      '<iframe sandbox=""></iframe>', goog.html.SafeHtml.createIframe());
  assertSameHtml(
      '<iframe Sandbox="allow-same-origin allow-top-navigation"></iframe>',
      goog.html.SafeHtml.createIframe(
          null, null, {'Sandbox': 'allow-same-origin allow-top-navigation'}));

  // Cannot override src and srddoc.
  assertThrows(function() {
    goog.html.SafeHtml.createIframe(null, null, {'Src': url});
  });
  assertThrows(function() {
    goog.html.SafeHtml.createIframe(null, null, {'Srcdoc': url});
  });

  // Can set content.
  assertSameHtml(
      '<iframe>&lt;</iframe>',
      goog.html.SafeHtml.createIframe(null, null, {'sandbox': null}, '<'));
}

function testSafeHtmlCreateMeta() {
  var url = goog.html.SafeUrl.fromConstant(
      goog.string.Const.from('https://google.com/trusted<'));

  // SafeUrl with no timeout gets properly escaped.
  assertSameHtml(
      '<meta http-equiv="refresh" ' +
          'content="0; url=https://google.com/trusted&lt;">',
      goog.html.SafeHtml.createMetaRefresh(url));

  // SafeUrl with 0 timeout also gets properly escaped.
  assertSameHtml(
      '<meta http-equiv="refresh" ' +
          'content="0; url=https://google.com/trusted&lt;">',
      goog.html.SafeHtml.createMetaRefresh(url, 0));

  // Positive timeouts are supported.
  assertSameHtml(
      '<meta http-equiv="refresh" ' +
          'content="1337; url=https://google.com/trusted&lt;">',
      goog.html.SafeHtml.createMetaRefresh(url, 1337));

  // Negative timeouts are also kept, though they're not correct HTML.
  assertSameHtml(
      '<meta http-equiv="refresh" ' +
          'content="-1337; url=https://google.com/trusted&lt;">',
      goog.html.SafeHtml.createMetaRefresh(url, -1337));

  // String-based URLs work out of the box.
  assertSameHtml(
      '<meta http-equiv="refresh" ' +
          'content="0; url=https://google.com/trusted&lt;">',
      goog.html.SafeHtml.createMetaRefresh('https://google.com/trusted<'));

  // Sanitization happens.
  assertSameHtml(
      '<meta http-equiv="refresh" ' +
          'content="0; url=about:invalid#zClosurez">',
      goog.html.SafeHtml.createMetaRefresh('javascript:alert(1)'));
}

function testSafeHtmlCreateStyle() {
  var styleSheet = goog.html.SafeStyleSheet.fromConstant(
      goog.string.Const.from('P.special { color:"red" ; }'));
  var styleHtml = goog.html.SafeHtml.createStyle(styleSheet);
  assertSameHtml(
      '<style type="text/css">P.special { color:"red" ; }</style>', styleHtml);

  // Two stylesheets.
  var otherStyleSheet = goog.html.SafeStyleSheet.fromConstant(
      goog.string.Const.from('P.regular { color:blue ; }'));
  styleHtml = goog.html.SafeHtml.createStyle([styleSheet, otherStyleSheet]);
  assertSameHtml(
      '<style type="text/css">P.special { color:"red" ; }' +
          'P.regular { color:blue ; }</style>',
      styleHtml);

  // Set attribute.
  styleHtml = goog.html.SafeHtml.createStyle(styleSheet, {'id': 'test'});
  var styleHtmlString = goog.html.SafeHtml.unwrap(styleHtml);
  assertTrue(styleHtmlString, styleHtmlString.indexOf('id="test"') != -1);
  assertTrue(styleHtmlString, styleHtmlString.indexOf('type="text/css"') != -1);

  // Set attribute to null.
  styleHtml = goog.html.SafeHtml.createStyle(
      goog.html.SafeStyleSheet.EMPTY, {'id': null});
  assertSameHtml('<style type="text/css"></style>', styleHtml);

  // Set attribute to invalid value.
  assertThrows(function() {
    styleHtml = goog.html.SafeHtml.createStyle(
        goog.html.SafeStyleSheet.EMPTY, {'invalid.': 'cantdothis'});
  });

  // Cannot override type attribute.
  assertThrows(function() {
    styleHtml = goog.html.SafeHtml.createStyle(
        goog.html.SafeStyleSheet.EMPTY, {'Type': 'cantdothis'});
  });

  // Directionality.
  assertEquals(goog.i18n.bidi.Dir.NEUTRAL, styleHtml.getDirection());
}


function testSafeHtmlCreateWithDir() {
  var ltr = goog.i18n.bidi.Dir.LTR;

  assertEquals(ltr, goog.html.SafeHtml.createWithDir(ltr, 'br').getDirection());
}


function testSafeHtmlConcat() {
  var br = goog.html.testing.newSafeHtmlForTest('<br>');

  var html = goog.html.SafeHtml.htmlEscape('Hello');
  assertSameHtml('Hello<br>', goog.html.SafeHtml.concat(html, br));

  assertSameHtml('', goog.html.SafeHtml.concat());
  assertSameHtml('', goog.html.SafeHtml.concat([]));

  assertSameHtml('a<br>c', goog.html.SafeHtml.concat('a', br, 'c'));
  assertSameHtml('a<br>c', goog.html.SafeHtml.concat(['a', br, 'c']));
  assertSameHtml('a<br>c', goog.html.SafeHtml.concat('a', [br, 'c']));
  assertSameHtml('a<br>c', goog.html.SafeHtml.concat(['a'], br, ['c']));

  var ltr = goog.html.testing.newSafeHtmlForTest('', goog.i18n.bidi.Dir.LTR);
  var rtl = goog.html.testing.newSafeHtmlForTest('', goog.i18n.bidi.Dir.RTL);
  var neutral =
      goog.html.testing.newSafeHtmlForTest('', goog.i18n.bidi.Dir.NEUTRAL);
  var unknown = goog.html.testing.newSafeHtmlForTest('');
  assertEquals(
      goog.i18n.bidi.Dir.NEUTRAL, goog.html.SafeHtml.concat().getDirection());
  assertEquals(
      goog.i18n.bidi.Dir.LTR,
      goog.html.SafeHtml.concat(ltr, ltr).getDirection());
  assertEquals(
      goog.i18n.bidi.Dir.LTR,
      goog.html.SafeHtml.concat(ltr, neutral, ltr).getDirection());
  assertNull(goog.html.SafeHtml.concat(ltr, unknown).getDirection());
  assertNull(goog.html.SafeHtml.concat(ltr, rtl).getDirection());
  assertNull(goog.html.SafeHtml.concat(ltr, [rtl]).getDirection());
}


function testHtmlEscapePreservingNewlines() {
  // goog.html.SafeHtml passes through unchanged.
  var safeHtmlIn = goog.html.SafeHtml.htmlEscapePreservingNewlines('<b>in</b>');
  assertTrue(
      safeHtmlIn ===
      goog.html.SafeHtml.htmlEscapePreservingNewlines(safeHtmlIn));

  assertSameHtml(
      'a<br>c', goog.html.SafeHtml.htmlEscapePreservingNewlines('a\nc'));
  assertSameHtml(
      '&lt;<br>', goog.html.SafeHtml.htmlEscapePreservingNewlines('<\n'));
  assertSameHtml(
      '<br>', goog.html.SafeHtml.htmlEscapePreservingNewlines('\r\n'));
  assertSameHtml('<br>', goog.html.SafeHtml.htmlEscapePreservingNewlines('\r'));
  assertSameHtml('', goog.html.SafeHtml.htmlEscapePreservingNewlines(''));
}


function testHtmlEscapePreservingNewlinesAndSpaces() {
  // goog.html.SafeHtml passes through unchanged.
  var safeHtmlIn =
      goog.html.SafeHtml.htmlEscapePreservingNewlinesAndSpaces('<b>in</b>');
  assertTrue(
      safeHtmlIn ===
      goog.html.SafeHtml.htmlEscapePreservingNewlinesAndSpaces(safeHtmlIn));

  assertSameHtml(
      'a<br>c',
      goog.html.SafeHtml.htmlEscapePreservingNewlinesAndSpaces('a\nc'));
  assertSameHtml(
      '&lt;<br>',
      goog.html.SafeHtml.htmlEscapePreservingNewlinesAndSpaces('<\n'));
  assertSameHtml(
      '<br>', goog.html.SafeHtml.htmlEscapePreservingNewlinesAndSpaces('\r\n'));
  assertSameHtml(
      '<br>', goog.html.SafeHtml.htmlEscapePreservingNewlinesAndSpaces('\r'));
  assertSameHtml(
      '', goog.html.SafeHtml.htmlEscapePreservingNewlinesAndSpaces(''));

  assertSameHtml(
      'a &#160;b',
      goog.html.SafeHtml.htmlEscapePreservingNewlinesAndSpaces('a  b'));
}


function testSafeHtmlConcatWithDir() {
  var ltr = goog.i18n.bidi.Dir.LTR;
  var rtl = goog.i18n.bidi.Dir.RTL;
  var br = goog.html.testing.newSafeHtmlForTest('<br>');

  assertEquals(ltr, goog.html.SafeHtml.concatWithDir(ltr).getDirection());
  assertEquals(
      ltr,
      goog.html.SafeHtml
          .concatWithDir(ltr, goog.html.testing.newSafeHtmlForTest('', rtl))
          .getDirection());

  assertSameHtml('a<br>c', goog.html.SafeHtml.concatWithDir(ltr, 'a', br, 'c'));
}


function assertSameHtml(expected, html) {
  assertEquals(expected, goog.html.SafeHtml.unwrap(html));
}
