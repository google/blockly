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

goog.provide('goog.string.linkifyTest');
goog.setTestOnly('goog.string.linkifyTest');

goog.require('goog.dom.TagName');
goog.require('goog.string');
goog.require('goog.string.linkify');
goog.require('goog.testing.dom');
goog.require('goog.testing.jsunit');

var div = document.createElement(goog.dom.TagName.DIV);

function assertLinkify(comment, input, expected) {
  assertEquals(
      comment, expected,
      goog.string.linkify.linkifyPlainText(input, {rel: '', target: ''}));
}

function testContainsNoLink() {
  assertLinkify(
      'Text does not contain any links',
      'Text with no links in it.',
      'Text with no links in it.');
}

function testContainsALink() {
  assertLinkify(
      'Text only contains a link',
      'http://www.google.com/',
      '<a href="http://www.google.com/">http://www.google.com/<\/a>');
}

function testStartsWithALink() {
  assertLinkify(
      'Text starts with a link',
      'http://www.google.com/ is a well known search engine',
      '<a href="http://www.google.com/">http://www.google.com/<\/a>' +
          ' is a well known search engine');
}

function testEndsWithALink() {
  assertLinkify(
      'Text ends with a link',
      'Look at this search engine: http://www.google.com/',
      'Look at this search engine: ' +
          '<a href="http://www.google.com/">http://www.google.com/<\/a>');
}

function testContainsOnlyEmail() {
  assertLinkify(
      'Text only contains an email address',
      'bolinfest@google.com',
      '<a href="mailto:bolinfest@google.com">bolinfest@google.com<\/a>');
}

function testStartsWithAnEmail() {
  assertLinkify(
      'Text starts with an email address',
      'bolinfest@google.com wrote this test.',
      '<a href="mailto:bolinfest@google.com">bolinfest@google.com<\/a>' +
          ' wrote this test.');
}

function testEndsWithAnEmail() {
  assertLinkify(
      'Text ends with an email address',
      'This test was written by bolinfest@google.com.',
      'This test was written by ' +
          '<a href="mailto:bolinfest@google.com">bolinfest@google.com<\/a>.');
}

function testUrlWithPortNumber() {
  assertLinkify(
      'URL with a port number',
      'http://www.google.com:80/',
      '<a href="http://www.google.com:80/">http://www.google.com:80/<\/a>');
}

function testUrlWithUserPasswordAndPortNumber() {
  assertLinkify(
      'URL with a user, a password and a port number',
      'http://lascap:p4ssw0rd@google.com:80/s?q=a&hl=en',
      '<a href="http://lascap:p4ssw0rd@google.com:80/s?q=a&amp;hl=en">' +
          'http://lascap:p4ssw0rd@google.com:80/s?q=a&amp;hl=en<\/a>');
}

function testUrlWithUnderscore() {
  assertLinkify(
      'URL with an underscore',
      'http://www_foo.google.com/',
      '<a href="http://www_foo.google.com/">http://www_foo.google.com/<\/a>');
}

function testInternalUrlWithoutDomain() {
  assertLinkify(
      'Internal URL without a proper domain',
      'http://tracker/1068594',
      '<a href="http://tracker/1068594">http://tracker/1068594<\/a>');
}

function testInternalUrlOneChar() {
  assertLinkify(
      'Internal URL with a one char domain',
      'http://b',
      '<a href="http://b">http://b<\/a>');
}

function testSecureInternalUrlWithoutDomain() {
  assertLinkify(
      'Secure Internal URL without a proper domain',
      'https://review/6594805',
      '<a href="https://review/6594805">https://review/6594805<\/a>');
}

function testTwoUrls() {
  assertLinkify(
      'Text with two URLs in it',
      'I use both http://www.google.com and http://yahoo.com, don\'t you?',
      'I use both <a href="http://www.google.com">http://www.google.com<\/a> ' +
          'and <a href="http://yahoo.com">http://yahoo.com<\/a>, ' +
          goog.string.htmlEscape('don\'t you?'));
}

function testGetParams() {
  assertLinkify(
      'URL with GET params',
      'http://google.com/?a=b&c=d&e=f',
      '<a href="http://google.com/?a=b&amp;c=d&amp;e=f">' +
          'http://google.com/?a=b&amp;c=d&amp;e=f<\/a>');
}

function testGoogleCache() {
  assertLinkify(
      'Google search result from cache',
      'http://66.102.7.104/search?q=cache:I4LoMT6euUUJ:' +
          'www.google.com/intl/en/help/features.html+google+cache&hl=en',
      '<a href="http://66.102.7.104/search?q=cache:I4LoMT6euUUJ:' +
          'www.google.com/intl/en/help/features.html+google+cache&amp;hl=en">' +
          'http://66.102.7.104/search?q=cache:I4LoMT6euUUJ:' +
          'www.google.com/intl/en/help/features.html+google+cache&amp;hl=en' +
          '<\/a>');
}

function testUrlWithoutHttp() {
  assertLinkify(
      'URL without http protocol',
      'It\'s faster to type www.google.com without the http:// in front.',
      goog.string.htmlEscape('It\'s faster to type ') +
          '<a href="http://www.google.com">www.google.com' +
          '<\/a> without the http:// in front.');
}

function testUrlWithCapitalsWithoutHttp() {
  assertLinkify(
      'URL with capital letters without http protocol',
      'It\'s faster to type Www.google.com without the http:// in front.',
      goog.string.htmlEscape('It\'s faster to type ') +
          '<a href="http://Www.google.com">Www.google.com' +
          '<\/a> without the http:// in front.');
}

function testUrlHashBang() {
  assertLinkify(
      'URL with #!',
      'Another test URL: ' +
      'https://www.google.com/testurls/#!/page',
      'Another test URL: ' +
      '<a href="https://www.google.com/testurls/#!/page">' +
      'https://www.google.com/testurls/#!/page<\/a>');
}

function testTextLooksLikeUrlWithoutHttp() {
  assertLinkify(
      'Text looks like an url but is not',
      'This showww.is just great: www.is',
      'This showww.is just great: <a href="http://www.is">www.is<\/a>');
}

function testEmailWithSubdomain() {
  assertLinkify(
      'Email with a subdomain',
      'Send mail to bolinfest@groups.google.com.',
      'Send mail to <a href="mailto:bolinfest@groups.google.com">' +
          'bolinfest@groups.google.com<\/a>.');
}

function testEmailWithHyphen() {
  assertLinkify(
      'Email with a hyphen in the domain name',
      'Send mail to bolinfest@google-groups.com.',
      'Send mail to <a href="mailto:bolinfest@google-groups.com">' +
          'bolinfest@google-groups.com<\/a>.');
}

function testEmailUsernameWithSpecialChars() {
  assertLinkify(
      'Email with a hyphen, period, and + in the user name',
      'Send mail to bolin-fest+for.um@google.com',
      'Send mail to <a href="mailto:bolin-fest+for.um@google.com">' +
          'bolin-fest+for.um@google.com<\/a>');
}

function testEmailWithUnderscoreInvalid() {
  assertLinkify(
      'Email with an underscore in the domain name, which is invalid',
      'Do not email bolinfest@google_groups.com.',
      'Do not email bolinfest@google_groups.com.');
}

function testUrlNotHttp() {
  assertLinkify(
      'Url using unusual scheme',
      'Looking for some goodies: ftp://ftp.google.com/goodstuff/',
      'Looking for some goodies: ' +
      '<a href="ftp://ftp.google.com/goodstuff/">' +
          'ftp://ftp.google.com/goodstuff/<\/a>');
}

function testJsInjection() {
  assertLinkify(
      'Text includes some javascript',
      'Welcome in hell <script>alert(\'this is hell\')<\/script>',
      goog.string.htmlEscape(
          'Welcome in hell <script>alert(\'this is hell\')<\/script>'));
}

function testJsInjectionDotIsBlind() {
  assertLinkify(
      'Javascript injection using regex . blindness to newline chars',
      '<script>malicious_code()<\/script>\nVery nice url: www.google.com',
      '&lt;script&gt;malicious_code()&lt;/script&gt;\nVery nice url: ' +
          '<a href="http://www.google.com">www.google.com<\/a>');
}

function testJsInjectionWithUnicodeLineReturn() {
  assertLinkify(
      'Javascript injection using regex . blindness to newline chars with a ' +
          'unicode newline character.',
      '<script>malicious_code()<\/script>\u2029Vanilla text',
      '&lt;script&gt;malicious_code()&lt;/script&gt;\u2029Vanilla text');
}

function testJsInjectionWithIgnorableNonTagChar() {
  assertLinkify(
      'Angle brackets are normalized even when followed by an ignorable ' +
          'non-tag character.',
      '<\u0000img onerror=alert(1337) src=\n>',
      '&lt;&#0;img onerror=alert(1337) src=\n&gt;');
}

function testJsInjectionWithTextarea() {
  assertLinkify(
      'Putting the result in a textarea can\'t cause other textarea text to ' +
          'be treated as tag content.',
      '</textarea',
      '&lt;/textarea');
}

function testJsInjectionWithNewlineConversion() {
  assertLinkify(
      'Any newline conversion and whitespace normalization won\'t cause tag ' +
          'parts to be recombined.',
      '<<br>script<br>>alert(1337)<<br>/<br>script<br>>',
      '&lt;&lt;br&gt;script&lt;br&gt;&gt;alert(1337)&lt;&lt;br&gt;/&lt;' +
          'br&gt;script&lt;br&gt;&gt;');
}

function testNoProtocolBlacklisting() {
  assertLinkify(
      'No protocol blacklisting.',
      'Click: jscript:alert%281337%29\nClick: JSscript:alert%281337%29\n' +
          'Click: VBscript:alert%281337%29\nClick: Script:alert%281337%29\n' +
          'Click: flavascript:alert%281337%29',
      'Click: jscript:alert%281337%29\nClick: JSscript:alert%281337%29\n' +
          'Click: VBscript:alert%281337%29\nClick: Script:alert%281337%29\n' +
          'Click: flavascript:alert%281337%29');
}

function testProtocolWhitelistingEffective() {
  assertLinkify(
      'Protocol whitelisting is effective.',
      'Click httpscript:alert%281337%29\nClick mailtoscript:alert%281337%29\n' +
          'Click j\u00A0avascript:alert%281337%29\n' +
          'Click \u00A0javascript:alert%281337%29',
      'Click httpscript:alert%281337%29\nClick mailtoscript:alert%281337%29\n' +
          'Click j\u00A0avascript:alert%281337%29\n' +
          'Click \u00A0javascript:alert%281337%29');
}

function testLinkifyNoOptions() {
  div.innerHTML = goog.string.linkify.linkifyPlainText('http://www.google.com');
  goog.testing.dom.assertHtmlContentsMatch(
      '<a href="http://www.google.com" target="_blank" rel="nofollow">' +
      'http://www.google.com<\/a>',
      div, true /* opt_strictAttributes */);
}

function testLinkifyOptionsNoAttributes() {
  div.innerHTML = goog.string.linkify.linkifyPlainText(
      'The link for www.google.com is located somewhere in ' +
      'https://www.google.fr/?hl=en, you should find it easily.',
      {rel: '', target: ''});
  goog.testing.dom.assertHtmlContentsMatch(
      'The link for <a href="http://www.google.com">www.google.com<\/a> is ' +
      'located somewhere in ' +
      '<a href="https://www.google.fr/?hl=en">https://www.google.fr/?hl=en' +
      '<\/a>, you should find it easily.',
      div, true /* opt_strictAttributes */);
}

function testLinkifyOptionsClassName() {
  div.innerHTML = goog.string.linkify.linkifyPlainText(
      'Attribute with <class> name www.w3c.org.',
      {'class': 'link-added'});
  goog.testing.dom.assertHtmlContentsMatch(
      'Attribute with &lt;class&gt; name <a href="http://www.w3c.org" ' +
      'target="_blank" rel="nofollow" class="link-added">www.w3c.org<\/a>.',
      div, true /* opt_strictAttributes */);
}

function testFindFirstUrlNoScheme() {
  assertEquals('www.google.com', goog.string.linkify.findFirstUrl(
      'www.google.com'));
}

function testFindFirstUrlNoSchemeWithText() {
  assertEquals('www.google.com', goog.string.linkify.findFirstUrl(
      'prefix www.google.com something'));
}

function testFindFirstUrlScheme() {
  assertEquals('http://www.google.com', goog.string.linkify.findFirstUrl(
      'http://www.google.com'));
}

function testFindFirstUrlSchemeWithText() {
  assertEquals('http://www.google.com', goog.string.linkify.findFirstUrl(
      'prefix http://www.google.com something'));
}

function testFindFirstUrlNoUrl() {
  assertEquals('', goog.string.linkify.findFirstUrl(
      'ygvtfr676 5v68fk uygbt85F^&%^&I%FVvc .'));
}

function testFindFirstEmailNoScheme() {
  assertEquals('fake@google.com', goog.string.linkify.findFirstEmail(
      'fake@google.com'));
}

function testFindFirstEmailNoSchemeWithText() {
  assertEquals('fake@google.com', goog.string.linkify.findFirstEmail(
      'prefix fake@google.com something'));
}

function testFindFirstEmailScheme() {
  assertEquals('mailto:fake@google.com', goog.string.linkify.findFirstEmail(
      'mailto:fake@google.com'));
}

function testFindFirstEmailSchemeWithText() {
  assertEquals('mailto:fake@google.com', goog.string.linkify.findFirstEmail(
      'prefix mailto:fake@google.com something'));
}

function testFindFirstEmailNoUrl() {
  assertEquals('', goog.string.linkify.findFirstEmail(
      'ygvtfr676 5v68fk uygbt85F^&%^&I%FVvc .'));
}

function testContainsPunctuation_parens() {
  assertLinkify(
      'Link contains parens, but does not end with them',
      'www.google.com/abc(v1).html',
      '<a href="http://www.google.com/abc(v1).html">' +
          'www.google.com/abc(v1).html<\/a>');
}

function testEndsWithPunctuation() {
  assertLinkify(
      'Link ends with punctuation',
      'Have you seen www.google.com? It\'s awesome.',
      'Have you seen <a href="http://www.google.com">www.google.com<\/a>?' +
      goog.string.htmlEscape(' It\'s awesome.'));
}

function testEndsWithPunctuation_closeParen() {
  assertLinkify(
      'Link inside parentheses',
      '(For more info see www.googl.com)',
      '(For more info see <a href="http://www.googl.com">www.googl.com<\/a>)');
  assertLinkify(
      'Parentheses inside link',
      'http://en.wikipedia.org/wiki/Titanic_(1997_film)',
      '<a href="http://en.wikipedia.org/wiki/Titanic_(1997_film)">' +
          'http://en.wikipedia.org/wiki/Titanic_(1997_film)<\/a>');
}

function testEndsWithPunctuation_openParen() {
  assertLinkify(
      'Link followed by open parenthesis',
      'www.google.com(',
      '<a href="http://www.google.com(">www.google.com(<\/a>');
}

function testEndsWithPunctuation_angles() {
  assertLinkify(
      'Link inside angled brackets',
      'Here is a bibliography entry <http://www.google.com/>',
      'Here is a bibliography entry &lt;<a href="http://www.google.com/">' +
          'http://www.google.com/<\/a>&gt;');
}

function testEndsWithPunctuation_closingPairThenSingle() {
  assertLinkify(
      'Link followed by closing punctuation pair then singular punctuation',
      'Here is a bibliography entry <http://www.google.com/>, PTAL.',
      'Here is a bibliography entry &lt;<a href="http://www.google.com/">' +
          'http://www.google.com/<\/a>&gt;, PTAL.');
}

function testEndsWithPunctuation_ellipses() {
  assertLinkify(
      'Link followed by three dots',
      'just look it up on www.google.com...',
      'just look it up on <a href="http://www.google.com">www.google.com' +
          '<\/a>...');
}

function testBracketsInUrl() {
  assertLinkify(
      'Link containing brackets',
      'before http://google.com/details?answer[0]=42 after',
      'before <a href="http://google.com/details?answer[0]=42">' +
          'http://google.com/details?answer[0]=42<\/a> after');
}

function testUrlWithExclamation() {
  assertLinkify(
      'URL with exclamation points',
      'This is awesome www.google.com!',
      'This is awesome <a href="http://www.google.com">www.google.com<\/a>!');
}

function testIpv6Url() {
  assertLinkify(
      'IPv6 URL',
      'http://[::FFFF:129.144.52.38]:80/index.html',
      '<a href="http://[::FFFF:129.144.52.38]:80/index.html">' +
      'http://[::FFFF:129.144.52.38]:80/index.html<\/a>');
}
