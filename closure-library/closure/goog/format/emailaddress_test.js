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

goog.provide('goog.format.EmailAddressTest');
goog.setTestOnly('goog.format.EmailAddressTest');

goog.require('goog.array');
goog.require('goog.format.EmailAddress');
goog.require('goog.testing.jsunit');

function testparseList() {
  assertParsedList('', [], 'Failed to parse empty stringy');
  assertParsedList(',,', [], 'Failed to parse string with commas only');

  assertParsedList('<foo@gmail.com>', ['foo@gmail.com']);

  assertParsedList(
      '<foo@gmail.com>,', ['foo@gmail.com'],
      'Failed to parse 1 address with trailing comma');

  assertParsedList(
      '<foo@gmail.com>, ', ['foo@gmail.com'],
      'Failed to parse 1 address with trailing whitespace and comma');

  assertParsedList(
      ',<foo@gmail.com>', ['foo@gmail.com'],
      'Failed to parse 1 address with leading comma');

  assertParsedList(
      ' ,<foo@gmail.com>', ['foo@gmail.com'],
      'Failed to parse 1 address with leading whitespace and comma');

  assertParsedList(
      '<foo@gmail.com>, <bar@gmail.com>', ['foo@gmail.com', 'bar@gmail.com'],
      'Failed to parse 2 email addresses');

  assertParsedList(
      '<foo@gmail.com>, <bar@gmail.com>,', ['foo@gmail.com', 'bar@gmail.com'],
      'Failed to parse 2 email addresses and trailing comma');

  assertParsedList(
      '<foo@gmail.com>, <bar@gmail.com>, ', ['foo@gmail.com', 'bar@gmail.com'],
      'Failed to parse 2 email addresses, trailing comma and whitespace');

  assertParsedList(
      'John Doe <john@gmail.com>; Jane Doe <jane@gmail.com>, ' +
          '<jerry@gmail.com>',
      ['john@gmail.com', 'jane@gmail.com', 'jerry@gmail.com'],
      'Failed to parse addresses with semicolon separator');
}

function testparseListOpenersAndClosers() {
  assertParsedList(
      'aaa@gmail.com, "bbb@gmail.com", <ccc@gmail.com>, ' +
          '(ddd@gmail.com), [eee@gmail.com]',
      [
        'aaa@gmail.com', '"bbb@gmail.com"', 'ccc@gmail.com', '(ddd@gmail.com)',
        '[eee@gmail.com]'
      ],
      'Failed to handle all 5 opener/closer characters');
}

function testparseListIdn() {
  var idnaddr = 'mailtest@\u4F8B\u3048.\u30C6\u30B9\u30C8';
  assertParsedList(idnaddr, [idnaddr]);
}

function testparseListWithQuotedSpecialChars() {
  var res = assertParsedList(
      'a\\"b\\"c <d@e.f>,"g\\"h\\"i\\\\" <j@k.l>', ['d@e.f', 'j@k.l']);
  assertEquals('Wrong name 0', 'a"b"c', res[0].getName());
  assertEquals('Wrong name 1', 'g"h"i\\', res[1].getName());
}

function testparseListWithCommaInLocalPart() {
  var res = assertParsedList(
      '"Doe, John" <doe.john@gmail.com>, <someone@gmail.com>',
      ['doe.john@gmail.com', 'someone@gmail.com']);

  assertEquals('Doe, John', res[0].getName());
  assertEquals('', res[1].getName());
}

function testparseListWithWhitespaceSeparatedEmails() {
  var res = assertParsedList(
      'a@b.com <c@d.com> e@f.com "G H" <g@h.com> i@j.com',
      ['a@b.com', 'c@d.com', 'e@f.com', 'g@h.com', 'i@j.com']);
  assertEquals('G H', res[3].getName());
}

function testparseListSystemNewlines() {
  // These Windows newlines can be inserted in IE8, or copied-and-pasted from
  // bad data on a Mac, as seen in bug 11081852.
  assertParsedList(
      'a@b.com\r\nc@d.com', ['a@b.com', 'c@d.com'],
      'Failed to parse Windows newlines');
  assertParsedList(
      'a@b.com\nc@d.com', ['a@b.com', 'c@d.com'],
      'Failed to parse *nix newlines');
  assertParsedList(
      'a@b.com\n\rc@d.com', ['a@b.com', 'c@d.com'],
      'Failed to parse obsolete newlines');
  assertParsedList(
      'a@b.com\rc@d.com', ['a@b.com', 'c@d.com'],
      'Failed to parse pre-OS X Mac newlines');
}

function testToString() {
  var f = function(str) {
    return goog.format.EmailAddress.parse(str).toString();
  };

  // No modification.
  assertEquals('JOHN Doe <john@gmail.com>', f('JOHN Doe <john@gmail.com>'));

  // Extra spaces.
  assertEquals('JOHN Doe <john@gmail.com>', f(' JOHN  Doe  <john@gmail.com> '));

  // No name.
  assertEquals('john@gmail.com', f('<john@gmail.com>'));
  assertEquals('john@gmail.com', f('john@gmail.com'));

  // No address.
  assertEquals('JOHN Doe', f('JOHN Doe <>'));

  // Special chars in the name.
  assertEquals('"JOHN, Doe" <john@gmail.com>', f('JOHN, Doe <john@gmail.com>'));
  assertEquals(
      '"JOHN(Johnny) Doe" <john@gmail.com>',
      f('JOHN(Johnny) Doe <john@gmail.com>'));
  assertEquals(
      '"JOHN[Johnny] Doe" <john@gmail.com>',
      f('JOHN[Johnny] Doe <john@gmail.com>'));
  assertEquals(
      '"JOHN@work Doe" <john@gmail.com>', f('JOHN@work Doe <john@gmail.com>'));
  assertEquals(
      '"JOHN:theking Doe" <john@gmail.com>',
      f('JOHN:theking Doe <john@gmail.com>'));
  assertEquals(
      '"JOHN\\\\ Doe" <john@gmail.com>', f('JOHN\\ Doe <john@gmail.com>'));
  assertEquals(
      '"JOHN.com Doe" <john@gmail.com>', f('JOHN.com Doe <john@gmail.com>'));

  // Already quoted.
  assertEquals(
      '"JOHN, Doe" <john@gmail.com>', f('"JOHN, Doe" <john@gmail.com>'));

  // Needless quotes.
  assertEquals('JOHN Doe <john@gmail.com>', f('"JOHN Doe" <john@gmail.com>'));
  // Not quoted-string, but has double quotes.
  assertEquals(
      '"JOHN, Doe" <john@gmail.com>', f('JOHN, "Doe" <john@gmail.com>'));

  // No special characters other than quotes.
  assertEquals('JOHN Doe <john@gmail.com>', f('JOHN "Doe" <john@gmail.com>'));

  // Escaped quotes are also removed.
  assertEquals(
      '"JOHN, Doe" <john@gmail.com>', f('JOHN, \\"Doe\\" <john@gmail.com>'));
}

function doIsValidTest(testFunc, valid, invalid) {
  goog.array.forEach(valid, function(str) {
    assertTrue('"' + str + '" should be valid.', testFunc(str));
  });
  goog.array.forEach(invalid, function(str) {
    assertFalse('"' + str + '" should be invalid.', testFunc(str));
  });
}

function testIsValid() {
  var valid = [
    'e@b.eu', '<a.b+foo@c.com>', 'eric <e@b.com>', '"e" <e@b.com>',
    'a@FOO.MUSEUM', 'bla@b.co.ac.uk', 'bla@a.b.com', 'o\'hara@gm.com',
    'plus+is+allowed@gmail.com', '!/#$%&\'*+-=~|`{}?^_@expample.com',
    'confirm-bhk=modulo.org@yahoogroups.com'
  ];
  var invalid = [
    'e', '', 'e @c.com', 'a@b', 'foo.com', 'foo@c..com', 'test@gma=il.com',
    'aaa@gmail', 'has some spaces@gmail.com', 'has@three@at@signs.com',
    '@no-local-part.com', 'み.ん-あ@みんあ.みんあ', 'みんあ@test.com',
    'test@test.みんあ', 'test@みんあ.com', 'fullwidthfullstop@sld' +
        '\uff0e' +
        'tld',
    'ideographicfullstop@sld' +
        '\u3002' +
        'tld',
    'halfwidthideographicfullstop@sld' +
        '\uff61' +
        'tld'
  ];
  doIsValidTest(goog.format.EmailAddress.isValidAddress, valid, invalid);
}

function testIsValidLocalPart() {
  var valid = [
    'e', 'a.b+foo', 'o\'hara', 'user+someone', '!/#$%&\'*+-=~|`{}?^_',
    'confirm-bhk=modulo.org'
  ];
  var invalid = [
    'A@b@c', 'a"b(c)d,e:f;g<h>i[j\\k]l', 'just"not"right',
    'this is"not\\allowed', 'this\\ still\"not\\\\allowed', 'has some spaces'
  ];
  doIsValidTest(goog.format.EmailAddress.isValidLocalPartSpec, valid, invalid);
}

function testIsValidDomainPart() {
  var valid =
      ['example.com', 'dept.example.org', 'long.domain.with.lots.of.dots'];
  var invalid = [
    '', '@has.an.at.sign', '..has.leading.dots', 'gma=il.com',
    'DoesNotHaveADot', 'sld' +
        '\uff0e' +
        'tld',
    'sld' +
        '\u3002' +
        'tld',
    'sld' +
        '\uff61' +
        'tld'
  ];
  doIsValidTest(goog.format.EmailAddress.isValidDomainPartSpec, valid, invalid);
}


/**
 * Asserts that parsing the inputString produces a list of email addresses
 * containing the specified address strings, irrespective of their order.
 * @param {string} inputString A raw address list.
 * @param {Array<string>} expectedList The expected results.
 * @param {string=} opt_message An assertion message.
 * @return {string} the resulting email address objects.
 */
function assertParsedList(inputString, expectedList, opt_message) {
  var message = opt_message || 'Should parse address correctly';
  var result = goog.format.EmailAddress.parseList(inputString);
  assertEquals(
      'Should have correct # of addresses', expectedList.length, result.length);
  for (var i = 0; i < expectedList.length; ++i) {
    assertEquals(message, expectedList[i], result[i].getAddress());
  }
  return result;
}
