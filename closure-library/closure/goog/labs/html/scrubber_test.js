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


goog.provide('goog.html.ScrubberTest');

goog.require('goog.labs.html.scrubber');
goog.require('goog.object');
goog.require('goog.string');
goog.require('goog.testing.jsunit');

goog.setTestOnly('goog.html.ScrubberTest');



var tagWhitelist = goog.object.createSet(
    'a', 'b', 'i', 'p', 'font', 'hr', 'br', 'span',
    'ol', 'ul', 'li',
    'table', 'tr', 'td', 'th', 'tbody',
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'img',
    'html', 'head', 'body', 'title');

var attrWhitelist = {
  // On any element,
  '*': {
    // allow unfiltered title attributes, and
    'title': function(title) { return title; },
    // specific dir values.
    'dir': function(dir) {
      return dir === 'ltr' || dir === 'rtl' ? dir : null;
    }
  },
  // Specifically on <a> elements,
  'a': {
    // allow an href but verify and rewrite, and
    'href': function(href) {
      return /^https?:\/\/google\.[a-z]{2,3}\/search\?/.test(href) ?
          href.replace(/[^A-Za-z0-9_\-.~:\/?#\[\]@!\$&()*+,;=%]+/,
                       encodeURIComponent) :
          null;
    },
    // mask the generic title handler for no good reason.
    'title': function(title) { return '<' + title + '>'; }
  }
};


function run(input, golden, desc) {
  var actual = goog.labs.html.scrubber.scrub(
      tagWhitelist, attrWhitelist, input);
  assertEquals(desc, golden, actual);
}


function testEmptyString() {
  run('', '', 'Empty string');
}

function testHelloWorld() {
  run('Hello, <b>World</b>!', 'Hello, <b>World</b>!',
      'Hello World');
}

function testNoEndTag() {
  run('<i>Hello, <b>World!',
      '<i>Hello, <b>World!</b></i>',
      'Hello World no end tag');
}

function testUnclosedTags() {
  run('<html><head><title>Hello, <<World>>!</TITLE>' +
      '</head><body><p>Hello,<Br><<World>>!',
      '<html><head><title>Hello, <<World>>!</title>' +
      '</head><body><p>Hello,<br>&lt;&gt;!</p></body></html>',
      'RCDATA content, different case, unclosed tags');
}

function testListInList() {
  run('<ul><li>foo</li><ul><li>bar</li></ul></ul>',
      '<ul><li>foo</li><li><ul><li>bar</li></ul></li></ul>',
      'list in list directly');
}

function testHeaders() {
  run('<h1>header</h1>body' +
      '<H2>sub-header</h3>sub-body' +
      '<h3>sub-sub-</hr>header<hr></hr>sub-sub-body</H4></h2>',
      '<h1>header</h1>body' +
      '<h2>sub-header</h2>sub-body' +
      '<h3>sub-sub-header</h3><hr>sub-sub-body',
      'headers');
}

function testListNesting() {
  run('<ul><li><ul><li>foo</li></li><ul><li>bar',
      '<ul><li><ul><li>foo</li><li><ul><li>bar</li></ul></li></ul></li></ul>',
      'list nesting');
}

function testTableNesting() {
  run('<table><tbody><tr><td>foo</td><table><tbody><tr><th>bar</table></table>',
      '<table><tbody><tr><td>foo</td><td>' +
      '<table><tbody><tr><th>bar</th></tr></tbody></table>' +
      '</td></tr></tbody></table>',
      'table nesting');
}

function testNestingLimit() {
  run(goog.string.repeat('<span>', 264) + goog.string.repeat('</span>', 264),
      goog.string.repeat('<span>', 256) + goog.string.repeat('</span>', 256),
      '264 open spans');
}

function testTableScopes() {
  run('<html><head></head><body><p>Hi</p><p>How are you</p>\n' +
      '<p><table><tbody><tr>' +
      '<td><b><font><font><p>Cell</b></font></font></p>\n</td>' +
      '<td><b><font><font><p>Cell</b></font></font></p>\n</td>' +
      '</tr></tbody></table></p>\n' +
      '<p>x</p></body></html>',

      '<html><head></head><body><p>Hi</p><p>How are you</p>\n' +
      '<p><table><tbody><tr>' +
      '<td><b><font><font></font></font></b><p>Cell</p>\n</td>' +
      // The close </p> tag does not close the whole table. +
      '<td><b><font><font></font></font></b><p>Cell</p>\n</td>' +
      '</tr></tbody></table></p>\n' +
      '<p>x</p></body></html>',

      'Table Scopes');
}

function testConcatSafe() {
  run('<<applet>script<applet>>alert(1337)<<!-- -->/script<?...?>>',
      '&lt;script&gt;alert(1337)&lt;/script&gt;',
      'Concat safe');
}

function testPrototypeMembersDoNotInfectTables() {
  // Constructor is all lower-case so will survive tag name
  // normalization.
  run('<constructor>Foo</constructor>', 'Foo',
      'Object.prototype members');
}

function testGenericAttributesAllowed() {
  run('<span title=howdy></span>', '<span title="howdy"></span>',
      'generic attrs allowed');
}

function testValueWhitelisting() {
  run('<span dir=\'ltr\'>LTR</span><span dir=\'evil\'>Evil</span>',
      '<span dir="ltr">LTR</span><span>Evil</span>',
      'value whitelisted');
}

function testAttributeNormalization() {
  run('<a href="http://google.com/search?q=tests suxor&hl=en">Click</a>',
      '<a href="http://google.com/search?q=tests%20suxor&amp;hl=en">Click</a>',
      'URL normalized');
}

function testTagSpecificityOfAttributeFiltering() {
  run('<img href="http://google.com/search?q=tests+suxor">',
      '<img>',
      'href blocked on img');
}

function testTagSpecificAttributeFiltering() {
  run('<a href="http://google.evil.com/search?q=tests suxor">Unclicky</a>',
      '<a>Unclicky</a>',
      'bad href value blocked');
}

function testNonWhitelistFunctionsNotCalled() {
  var called = false;
  Object.prototype.dontcallme = function() {
    called = true;
    return 'dontcallme was called despite being on the prototype';
  };
  try {
    run('<span dontcallme="I\'ll call you">Lorem Ipsum',
        '<span>Lorem Ipsum</span>',
        'non white-list fn not called');
  } finally {
    delete Object.prototype.dontcallme;
  }
  assertFalse('Object.prototype.dontcallme should not have been called',
              called);
}

function testQuotesInAttributeValue() {
  run('<span tItlE =\n\'Quoth the raven, "Nevermore"\'>Lorem Ipsum',
      '<span title="Quoth the raven, &quot;Nevermore&quot;">Lorem Ipsum</span>',
      'quotes in attr value');
}

function testAttributesNeverMentionedAreDropped() {
  run('<b onclick="evil=true">evil</b>', '<b>evil</b>', 'attrs white-listed');
}

function testAttributesNotOverEscaped() {
  run('<I TITLE="Foo &AMP; Bar & Baz">/</I>',
      '<i title="Foo &amp; Bar &amp; Baz">/</i>',
      'attr value not over-escaped');
}

function testTagSpecificRulesTakePrecedence() {
  run('<a title=zogberts>Link</a>',
      '<a title="&lt;zogberts&gt;">Link</a>',
      'tag specific rules take precedence');
}

function testAttributeRejectionLocalized() {
  run('<a id=foo href =//evil.org/ title=>Link</a>',
      '<a title="&lt;&gt;">Link</a>',
      'failure of one attribute does not torpedo others');
}

function testWeirdHtmlRulesFollowedForAttrValues() {
  run('<span title= id=>Lorem Ipsum</span>',
      '<span title=\"id=\">Lorem Ipsum</span>',
      'same as browser on weird values');
}

function testAttributesDisallowedOnCloseTags() {
  run('<h1 title="open">Header</h1 title="closed">',
      '<h1 title="open">Header</h1>',
      'attributes on close tags');
}

function testRoundTrippingOfHtmlSafeAgainstIEBacktickProblems() {
  // Introducing a space at the end of an attribute forces IE to quote it when
  // turning a DOM into innerHTML which protects against a bunch of problems
  // with backticks since IE treats them as attribute value delimiters, allowing
  //   foo.innerHTML += ...
  // to continue to "work" without introducing an XSS vector.
  // Adding a space at the end is innocuous since HTML attributes whose values
  // are structured content ignore spaces at the beginning or end.
  run('<span title="`backtick">*</span>', '<span title="`backtick ">*</span>',
      'not round-trippable on IE');
}
