// Copyright 2009 The Closure Library Authors. All Rights Reserved.
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

goog.provide('goog.uri.utilsTest');
goog.setTestOnly('goog.uri.utilsTest');

goog.require('goog.functions');
goog.require('goog.string');
goog.require('goog.testing.jsunit');
goog.require('goog.uri.utils');


var utils = goog.uri.utils;


function setUpPage() {
  goog.string.getRandomString = goog.functions.constant('RANDOM');
}


function tearDown() {}


function testSplit() {
  var uri = 'http://www.google.com:80/path%20path+path?q=query&hl=en#fragment';
  assertEquals('http', utils.getScheme(uri));
  assertNull(utils.getUserInfoEncoded(uri));
  assertNull(utils.getUserInfo(uri));
  assertEquals('www.google.com', utils.getDomainEncoded(uri));
  assertEquals('www.google.com', utils.getDomain(uri));
  assertEquals(80, utils.getPort(uri));
  assertEquals('/path%20path+path', utils.getPathEncoded(uri));
  assertEquals('/path path+path', utils.getPath(uri));
  assertEquals('q=query&hl=en', utils.getQueryData(uri));
  assertEquals('fragment', utils.getFragmentEncoded(uri));
  assertEquals('fragment', utils.getFragment(uri));

  assertEquals(
      utils.getDomain('http://[2607:f8b0:4006:802::1006]'),
      '[2607:f8b0:4006:802::1006]');
  assertEquals(
      utils.getDomain('http://[2607:f8b0:4006:802::1006]:80'),
      '[2607:f8b0:4006:802::1006]');
  assertEquals(utils.getPort('http://[2607:f8b0:4006:802::1006]:80'), 80);
  assertEquals(utils.getDomain('http://[2607]:80/?q=]'), '[2607]');
  assertEquals(utils.getDomain('http://!!!'), '!!!');
  assertNull(utils.getPath('http://!!!'));
  assertNull(utils.getScheme('www.x.com:80'));
  assertEquals(
      'Query data with no fragment identifier', 'foo=bar&baz=bin',
      utils.getQueryData('http://google.com?foo=bar&baz=bin'));
}


function testMailtoUri() {
  var uri = 'mailto:joe+random@hominid.com';
  assertNull(utils.getDomain(uri));
  assertEquals('mailto', utils.getScheme(uri));
  assertEquals('joe+random@hominid.com', utils.getPath(uri));
}


function testSplitRelativeUri() {
  var uri = '/path%20path+path?q=query&hl=en#fragment';
  assertNull(utils.getScheme(uri));
  assertNull(utils.getDomain(uri));
  assertNull(utils.getDomainEncoded(uri));
  assertNull(utils.getPort(uri));
  assertEquals('/path%20path+path', utils.getPathEncoded(uri));
  assertEquals('/path path+path', utils.getPath(uri));
  assertEquals('q=query&hl=en', utils.getQueryData(uri));
  assertEquals('fragment', utils.getFragmentEncoded(uri));
  assertEquals('fragment', utils.getFragment(uri));
}


function testSplitBadAuthority() {
  // This URL has a syntax error per the RFC (port number must be digits, and
  // host cannot contain a colon except in [...]). This test is solely to
  // 'document' the current behavior, which may affect application handling
  // of erroneous URLs.
  assertEquals(utils.getDomain('http://host:port/'), 'host:port');
  assertNull(utils.getPort('http://host:port/'));
}


function testSplitIntoHostAndPath() {
  // Splitting into host and path takes care of one of the major use cases
  // of resolve, without implementing a generic algorithm that undoubtedly
  // requires a huge footprint.
  var uri = 'http://www.google.com:80/path%20path+path?q=query&hl=en#fragment';
  assertEquals('http://www.google.com:80', goog.uri.utils.getHost(uri));
  assertEquals(
      '/path%20path+path?q=query&hl=en#fragment',
      goog.uri.utils.getPathAndAfter(uri));

  var uri2 = 'http://www.google.com/calendar';
  assertEquals(
      'should handle missing fields', 'http://www.google.com',
      goog.uri.utils.getHost(uri2));
  assertEquals(
      'should handle missing fields', '/calendar',
      goog.uri.utils.getPathAndAfter(uri2));
}


function testRelativeUrisHaveNoPath() {
  assertNull(utils.getPathEncoded('?hello'));
}


function testReservedCharacters() {
  var o = '%6F';
  var uri = 'http://www.g' + o + 'ogle.com%40/xxx%2feee/ccc';
  assertEquals(
      'Should not decode reserved characters in path', '/xxx%2feee/ccc',
      goog.uri.utils.getPath(uri));
  assertEquals(
      'Should not decode reserved characters in domain', 'www.google.com%40',
      goog.uri.utils.getDomain(uri));
}

function testSetFragmentEncoded() {
  var expected = 'http://www.google.com/path#bar';
  assertEquals(
      expected,
      utils.setFragmentEncoded('http://www.google.com/path#foo', 'bar'));

  assertEquals(
      expected, utils.setFragmentEncoded('http://www.google.com/path', 'bar'));

  assertEquals(
      'http://www.google.com/path',
      utils.setFragmentEncoded('http://www.google.com/path', ''));

  assertEquals(
      'http://www.google.com/path',
      utils.setFragmentEncoded('http://www.google.com/path', null));
}


function testGetParamValue() {
  assertEquals(
      'v1',
      utils.getParamValue('/path?key=v1&c=d&keywithsuffix=v3&key=v2', 'key'));

  assertEquals(
      'v1',
      utils.getParamValue('/path?kEY=v1&c=d&keywithsuffix=v3&key=v2', 'kEY'));
}


function testGetParamValues() {
  assertArrayEquals(
      'should ignore confusing suffixes', ['v1', 'v2'],
      utils.getParamValues(
          '/path?a=b&key=v1&c=d&key=v2&keywithsuffix=v3', 'key'));
  assertArrayEquals(
      'should be case sensitive', ['v2'],
      utils.getParamValues(
          '/path?a=b&keY=v1&c=d&KEy=v2&keywithsuffix=v3', 'KEy'));
  assertArrayEquals(
      'should work for the first parameter', ['v1', 'v2'],
      utils.getParamValues('/path?key=v1&c=d&key=v2&keywithsuffix=v3', 'key'));
  assertArrayEquals(
      'should work for the last parameter', ['v1', 'v2'],
      utils.getParamValues('/path?key=v1&c=d&keywithsuffix=v3&key=v2', 'key'));
  assertArrayEquals(
      ['1'], utils.getParamValues('http://foo.com?q=1#?q=2&q=3', 'q'));
}


function testGetParamValueAllowsEqualInValues() {
  assertEquals(
      'equals signs can appear unencoded', 'v1=v2',
      utils.getParamValue('/path?key=v1=v2', 'key'));
  assertArrayEquals(
      ['v1=v2=v3'], utils.getParamValues('/path?key=v1=v2=v3', 'key'));
}


function testGetParamValueNoSuchKey() {
  var uri = '/path?key=v1&c=d&keywithsuffix=v3&key=v2';
  assertNull(utils.getParamValue(uri, 'nosuchkey'));
  assertArrayEquals([], utils.getParamValues(uri, 'nosuchkey'));
  assertFalse(utils.hasParam(uri, 'nosuchkey'));
  assertNull(utils.getParamValue('q=1', 'q'));
  assertEquals('1', utils.getParamValue('?q=1', 'q'));
}


function testGetParamValueEmptyAndMissingValueStrings() {
  assertEquals('', utils.getParamValue('/path?key&bar', 'key'));
  assertEquals('', utils.getParamValue('/path?foo=bar&key', 'key'));
  assertEquals('', utils.getParamValue('/path?key', 'key'));
  assertEquals('', utils.getParamValue('/path?key=', 'key'));
  assertArrayEquals([''], utils.getParamValues('/path?key', 'key'));
  assertArrayEquals([''], utils.getParamValues('/path?key&bar', 'key'));
  assertArrayEquals([''], utils.getParamValues('/path?foo=bar&key', 'key'));
  assertArrayEquals([''], utils.getParamValues('/path?foo=bar&key=', 'key'));
  assertArrayEquals(
      ['', '', '', 'j', ''],
      utils.getParamValues('/path?key&key&key=&key=j&key', 'key'));
  assertArrayEquals(
      ['', '', '', '', ''],
      utils.getParamValues('/pathqqq?q&qq&q&q=&q&q', 'q'));
  assertTrue(utils.hasParam('/path?key=', 'key'));
}


function testGetParamValueDecoding() {
  assertEquals(
      'plus should be supported as alias of space', 'foo bar baz',
      utils.getParamValue('/path?key=foo+bar%20baz', 'key'));
  assertArrayEquals(
      ['foo bar baz'],
      utils.getParamValues('/path?key=foo%20bar%20baz', 'key'));
}


function testGetParamIgnoresParamsInFragmentIdentifiers() {
  assertFalse(utils.hasParam('/path?bah#a&key=foo', 'key'));
  assertEquals(null, utils.getParamValue('/path?bah#a&key=bar', 'key'));
  assertArrayEquals([], utils.getParamValues('/path?bah#a&key=bar', 'key'));
}


function testGetParamIgnoresExcludesFragmentFromParameterValue() {
  // Make sure the '#' doesn't get included anywhere, for parameter values
  // of different lengths.
  assertEquals(
      'foo', utils.getParamValue('/path?key=foo#key=bar&key=baz', 'key'));
  assertArrayEquals(
      ['foo'], utils.getParamValues('/path?key=foo#key=bar&key=baz', 'key'));
  assertEquals('', utils.getParamValue('/path?key#key=bar&key=baz', 'key'));
  assertArrayEquals(
      [''], utils.getParamValues('/path?key#key=bar&key=baz', 'key'));
  assertEquals('x', utils.getParamValue('/path?key=x#key=bar&key=baz', 'key'));
  assertArrayEquals(
      ['x'], utils.getParamValues('/path?key=x#key=bar&key=baz', 'key'));

  // Simply make sure hasParam doesn't die in this case.
  assertTrue(utils.hasParam('/path?key=foo#key=bar&key=baz', 'key'));
  assertTrue(utils.hasParam('/path?key=foo#key&key=baz', 'key'));
}


function testSameDomainPathsDiffer() {
  var uri1 = 'http://www.google.com/a';
  var uri2 = 'http://www.google.com/b';
  assertTrue(goog.uri.utils.haveSameDomain(uri1, uri2));
  assertTrue(goog.uri.utils.haveSameDomain(uri2, uri1));
}


function testSameDomainSchemesDiffer() {
  var uri1 = 'http://www.google.com';
  var uri2 = 'https://www.google.com';
  assertFalse(goog.uri.utils.haveSameDomain(uri1, uri2));
  assertFalse(goog.uri.utils.haveSameDomain(uri2, uri1));
}


function testSameDomainPortsDiffer() {
  var uri1 = 'http://www.google.com:1234/a';
  var uri2 = 'http://www.google.com/b';
  var uri3 = 'http://www.google.com:2345/b';
  assertFalse(goog.uri.utils.haveSameDomain(uri1, uri2));
  assertFalse(goog.uri.utils.haveSameDomain(uri2, uri1));
  assertFalse(goog.uri.utils.haveSameDomain(uri1, uri3));
}


function testSameDomainDomainsDiffer() {
  var uri1 = '/a';
  var uri2 = 'http://www.google.com/b';
  assertFalse(goog.uri.utils.haveSameDomain(uri1, uri2));
  assertFalse(goog.uri.utils.haveSameDomain(uri2, uri1));
}


function testSameDomainSubDomainDiffers() {
  var uri1 = 'http://www.google.com/a';
  var uri2 = 'http://mail.google.com/b';
  assertFalse(goog.uri.utils.haveSameDomain(uri1, uri2));
  assertFalse(goog.uri.utils.haveSameDomain(uri2, uri1));
}


function testSameDomainNoDomain() {
  var uri1 = '/a';
  var uri2 = '/b';
  assertTrue(goog.uri.utils.haveSameDomain(uri1, uri2));
  assertTrue(goog.uri.utils.haveSameDomain(uri2, uri1));
}



/**
 * Simple class with a constant toString.
 * @param {string} stringValue The result of toString.
 * @constructor
 */
function HasString(stringValue) {
  this.value_ = stringValue;
}


/** @override */
HasString.prototype.toString = function() {
  return this.value_;
};


function testBuildFromEncodedParts() {
  assertEquals(
      'should handle full URL',
      'http://foo@www.google.com:80/path?q=query#fragment',
      utils.buildFromEncodedParts(
          'http', 'foo', 'www.google.com', 80, '/path', 'q=query', 'fragment'));
  assertEquals(
      'should handle unspecified parameters', '/search',
      utils.buildFromEncodedParts(null, null, undefined, null, '/search'));
  assertEquals(
      'should handle params of non-primitive types',
      'http://foo@www.google.com:80/path?q=query#fragment',
      utils.buildFromEncodedParts(
          new HasString('http'), new HasString('foo'),
          new HasString('www.google.com'), new HasString('80'),
          new HasString('/path'), new HasString('q=query'),
          new HasString('fragment')));
}


function testAppendParam() {
  assertEquals(
      'http://foo.com?q=1', utils.appendParam('http://foo.com', 'q', 1));
  assertEquals(
      'http://foo.com?q=1#preserve',
      utils.appendParam('http://foo.com#preserve', 'q', 1));
  assertEquals(
      'should tolerate a lone question mark', 'http://foo.com?q=1',
      utils.appendParam('http://foo.com?', 'q', 1));
  assertEquals(
      'http://foo.com?q=1&r=2',
      utils.appendParam('http://foo.com?q=1', 'r', 2));
  assertEquals(
      'http://foo.com?q=1&r=2&s=3#preserve',
      utils.appendParam('http://foo.com?q=1&r=2#preserve', 's', 3));
  assertEquals(
      'q=1&r=2&s=3&s=4', utils.buildQueryData(['q', 1, 'r', 2, 's', [3, 4]]));
  assertEquals('', utils.buildQueryData([]));
  assertEquals('?q=1#preserve', utils.appendParam('#preserve', 'q', 1));
}

function testAppendParams() {
  assertEquals('http://foo.com', utils.appendParams('http://foo.com'));
  assertEquals(
      'http://foo.com?q=1&r=2&s=3&s=4#preserve',
      utils.appendParams(
          'http://foo.com#preserve', 'q', 1, 'r', 2, 's', [3, 4]));
  assertEquals(
      'http://foo.com?a=1&q=1&r=2&s=3&s=4#preserve',
      utils.appendParams(
          'http://foo.com?a=1#preserve', 'q', 1, 'r', 2, 's', [3, 4]));
  assertEquals(
      'http://foo.com?q=1&r=2&s=3&s=4#preserve',
      utils.appendParams(
          'http://foo.com?#preserve', 'q', 1, 'r', 2, 's', [3, 4]));
  assertEquals(
      '?q=1&r=2&s=3&s=4#preserve',
      utils.appendParams('#preserve', 'q', 1, 'r', 2, 's', [3, 4]));
  assertEquals(
      'A question mark must not be appended if there are no ' +
          'parameters, otherwise repeated appends will be broken.',
      'http://foo.com#test', utils.appendParams('http://foo.com#test'));
  assertEquals(
      'should handle objects with to-string', 'http://foo.com?q=a&r=b',
      utils.appendParams(
          'http://foo.com', 'q', new HasString('a'), 'r',
          [new HasString('b')]));

  assertThrows(
      'appendParams should fail with an odd number of arguments.',
      function() { utils.appendParams('http://foo.com', 'a', 1, 'b'); });
}


function testValuelessParam() {
  assertEquals('http://foo.com?q', utils.appendParam('http://foo.com', 'q'));
  assertEquals(
      'http://foo.com?q',
      utils.appendParam('http://foo.com', 'q', null /* opt_value */));
  assertEquals(
      'http://foo.com?q#preserve',
      utils.appendParam('http://foo.com#preserve', 'q'));
  assertEquals(
      'should tolerate a lone question mark', 'http://foo.com?q',
      utils.appendParam('http://foo.com?', 'q'));
  assertEquals(
      'http://foo.com?q=1&r', utils.appendParam('http://foo.com?q=1', 'r'));
  assertEquals(
      'http://foo.com?q=1&r=2&s#preserve',
      utils.appendParam('http://foo.com?q=1&r=2#preserve', 's'));
  assertTrue(utils.hasParam('http://foo.com?q=1&r=2&s#preserve', 's'));
}


function testAppendParamsAsArray() {
  assertEquals(
      'http://foo.com?q=1&r=2&s=3&s=4#preserve',
      utils.appendParams(
          'http://foo.com#preserve', ['q', 1, 'r', 2, 's', [3, 4]]));
  assertEquals(
      'http://foo.com?q=1&s=3&s=4#preserve',
      utils.appendParams(
          'http://foo.com#preserve', ['q', 1, 'r', null, 's', [3, 4]]));
  assertEquals(
      'http://foo.com?q=1&s=3&s=4#preserve',
      utils.appendParams(
          'http://foo.com#preserve', ['q', 1, 'r', undefined, 's', [3, 4]]));
  assertEquals(
      'http://foo.com?q=1&r=2&s=3&s=4&s=null&s=undefined#preserve',
      utils.appendParams(
          'http://foo.com#preserve',
          ['q', 1, 'r', 2, 's', [3, new HasString('4'), null, undefined]]));
}


function testAppendParamEscapes() {
  assertEquals(
      'http://foo.com?h=a%20b',
      utils.appendParams('http://foo.com', 'h', 'a b'));
  assertEquals('h=a%20b', utils.buildQueryData(['h', 'a b']));
  assertEquals('h=a%20b', utils.buildQueryDataFromMap({'h': 'a b'}));
}


function testAppendParamsFromMap() {
  var uri = utils.appendParamsFromMap(
      'http://www.foo.com',
      {'a': 1, 'b': 'bob', 'c': [1, 2, new HasString('3')]});
  assertArrayEquals(['1'], utils.getParamValues(uri, 'a'));
  assertArrayEquals(['bob'], utils.getParamValues(uri, 'b'));
  assertArrayEquals(['1', '2', '3'], utils.getParamValues(uri, 'c'));
}

function testBuildQueryDataFromMap() {
  assertEquals('a=1', utils.buildQueryDataFromMap({'a': 1}));
  var uri = 'foo.com?' +
      utils.buildQueryDataFromMap(
          {'a': 1, 'b': 'bob', 'c': [1, 2, new HasString('3')]});
  assertArrayEquals(['1'], utils.getParamValues(uri, 'a'));
  assertArrayEquals(['bob'], utils.getParamValues(uri, 'b'));
  assertArrayEquals(['1', '2', '3'], utils.getParamValues(uri, 'c'));
}


function testMultiParamSkipsNullParams() {
  // For the multi-param functions, null and undefined keys should be
  // skipped, but null within a parameter array should still be appended.
  assertEquals(
      'buildQueryDataFromMap', 'a=null',
      utils.buildQueryDataFromMap({'a': [null], 'b': null, 'c': undefined}));
  assertEquals(
      'buildQueryData', 'a=null',
      utils.buildQueryData(['a', [null], 'b', null, 'c', undefined]));
  assertEquals(
      'appendParams', 'foo.com?a=null',
      utils.appendParams('foo.com', 'a', [null], 'b', null, 'c', undefined));
  assertEquals(
      'empty strings should NOT be skipped', 'foo.com?a&b',
      utils.appendParams('foo.com', 'a', [''], 'b', ''));
}


function testRemoveParam() {
  assertEquals(
      'remove middle', 'http://foo.com?q=1&s=3',
      utils.removeParam('http://foo.com?q=1&r=2&s=3', 'r'));
  assertEquals(
      'remove first', 'http://foo.com?r=2&s=3',
      utils.removeParam('http://foo.com?q=1&r=2&s=3', 'q'));
  assertEquals(
      'remove last', 'http://foo.com?q=1&r=2',
      utils.removeParam('http://foo.com?q=1&r=2&s=3', 's'));
  assertEquals(
      'remove only param', 'http://foo.com',
      utils.removeParam('http://foo.com?q=1', 'q'));
}


function testRemoveParamWithFragment() {
  assertEquals(
      'remove middle', 'http://foo.com?q=1&s=3#?r=1&r=1',
      utils.removeParam('http://foo.com?q=1&r=2&s=3#?r=1&r=1', 'r'));
  assertEquals(
      'remove first', 'http://foo.com?r=2&s=3#?q=1&q=1',
      utils.removeParam('http://foo.com?q=1&r=2&s=3#?q=1&q=1', 'q'));
  assertEquals(
      'remove only param', 'http://foo.com#?q=1&q=1',
      utils.removeParam('http://foo.com?q=1#?q=1&q=1', 'q'));
  assertEquals(
      'remove last', 'http://foo.com?q=1&r=2#?s=1&s=1',
      utils.removeParam('http://foo.com?q=1&r=2&s=3#?s=1&s=1', 's'));
}


function testRemoveNonExistent() {
  assertEquals(
      'remove key not present', 'http://foo.com?q=1',
      utils.removeParam('http://foo.com?q=1', 'nosuchkey'));
  assertEquals(
      'remove key not present', 'http://foo.com#q=1',
      utils.removeParam('http://foo.com#q=1', 'q'));
  assertEquals(
      'remove key from empty string', '', utils.removeParam('', 'nosuchkey'));
}


function testRemoveMultiple() {
  assertEquals(
      'remove four of the same', 'http://foo.com',
      utils.removeParam('http://foo.com?q=1&q=2&q=3&q=4', 'q'));
  assertEquals(
      'remove four of the same with another one in the middle',
      'http://foo.com?a=99',
      utils.removeParam('http://foo.com?q=1&q=2&a=99&q=3&q=4', 'q'));
}


function testSetParam() {
  assertEquals(
      'middle, no fragment', 'http://foo.com?q=1&s=3&r=999',
      utils.setParam('http://foo.com?q=1&r=2&s=3', 'r', 999));
  assertEquals(
      'middle', 'http://foo.com?q=1&s=3&r=999#?r=1&r=1',
      utils.setParam('http://foo.com?q=1&r=2&s=3#?r=1&r=1', 'r', 999));
  assertEquals(
      'first', 'http://foo.com?r=2&s=3&q=999#?q=1&q=1',
      utils.setParam('http://foo.com?q=1&r=2&s=3#?q=1&q=1', 'q', 999));
  assertEquals(
      'only param', 'http://foo.com?q=999#?q=1&q=1',
      utils.setParam('http://foo.com?q=1#?q=1&q=1', 'q', 999));
  assertEquals(
      'last', 'http://foo.com?q=1&r=2&s=999#?s=1&s=1',
      utils.setParam('http://foo.com?q=1&r=2&s=3#?s=1&s=1', 's', 999));
  assertEquals(
      'multiple', 'http://foo.com?s=999#?s=1&s=1',
      utils.setParam('http://foo.com?s=1&s=2&s=3#?s=1&s=1', 's', 999));
  assertEquals(
      'none', 'http://foo.com?r=1&s=999#?s=1&s=1',
      utils.setParam('http://foo.com?r=1#?s=1&s=1', 's', 999));
}


function testModifyQueryParams() {
  var uri = 'http://foo.com?a=A&a=A2&b=B&b=B2&c=C';

  uri = utils.appendParam(uri, 'd', 'D');
  assertEquals('http://foo.com?a=A&a=A2&b=B&b=B2&c=C&d=D', uri);

  uri = utils.removeParam(uri, 'd');
  uri = utils.appendParam(uri, 'd', 'D2');
  assertEquals('http://foo.com?a=A&a=A2&b=B&b=B2&c=C&d=D2', uri);

  uri = utils.removeParam(uri, 'a');
  uri = utils.appendParam(uri, 'a', 'A3');
  assertEquals('http://foo.com?b=B&b=B2&c=C&d=D2&a=A3', uri);

  uri = utils.removeParam(uri, 'a');
  uri = utils.appendParam(uri, 'a', 'A4');
  assertEquals('A4', utils.getParamValue(uri, 'a'));
}


function testBrowserEncoding() {
  // Sanity check borrowed from old code to ensure that encodeURIComponent
  // is good enough.  Entire test should be safe to delete.
  var allowedInFragment = /[A-Za-z0-9\-\._~!$&'()*+,;=:@/?]/g;

  var sb = [];
  for (var i = 33; i < 500; i++) {  // arbitrarily use first 500 chars.
    sb.push(String.fromCharCode(i));
  }
  var testString = sb.join('');

  var encodedStr = encodeURIComponent(testString);

  // Strip all percent encoded characters, as they're ok.
  encodedStr = encodedStr.replace(/%[0-9A-F][0-9A-F]/g, '');

  // Remove allowed characters.
  encodedStr = encodedStr.replace(allowedInFragment, '');

  // Only illegal characters should remain, which is a fail.
  assertEquals('String should be empty', 0, encodedStr.length);
}


function testAppendPath() {
  var uri = 'http://www.foo.com';
  var expected = uri + '/dummy';
  assertEquals(
      'Path has no trailing "/", adding with leading "/" failed', expected,
      goog.uri.utils.appendPath(uri, '/dummy'));
  assertEquals(
      'Path has no trailing "/", adding with no leading "/" failed', expected,
      goog.uri.utils.appendPath(uri, 'dummy'));
  uri = uri + '/';
  assertEquals(
      'Path has trailing "/", adding with leading "/" failed', expected,
      goog.uri.utils.appendPath(uri, '/dummy'));

  assertEquals(
      'Path has trailing "/", adding with no leading "/" failed', expected,
      goog.uri.utils.appendPath(uri, 'dummy'));
}


function testMakeUnique() {
  assertEquals(
      'http://www.google.com?zx=RANDOM#blob',
      goog.uri.utils.makeUnique('http://www.google.com#blob'));
  assertEquals(
      'http://www.google.com?a=1&b=2&zx=RANDOM#blob',
      goog.uri.utils.makeUnique('http://www.google.com?zx=9&a=1&b=2#blob'));
}


function testParseQuery() {
  var result = [];
  goog.uri.utils.parseQueryData(
      'foo=bar&no&empty=&tricky%3D%26=%3D%26&=nothing&=&',
      function(name, value) { result.push(name, value); });
  assertArrayEquals(
      [
        'foo', 'bar', 'no', '', 'empty', '', 'tricky%3D%26', '=&', '',
        'nothing', '', '', '', ''
      ],
      result);

  // Go thought buildQueryData and parseQueryData and see if we get the same
  // result.
  var result2 = [];
  goog.uri.utils.parseQueryData(
      goog.uri.utils.buildQueryData(result),
      function(name, value) { result2.push(name, value); });
  assertArrayEquals(result, result2);

  goog.uri.utils.parseQueryData(
      '', goog.partial(fail, 'Empty string should not run callback'));
}


function testSetPath() {
  assertEquals(
      'http://www.google.com/bar',
      goog.uri.utils.setPath('http://www.google.com', 'bar'));
  assertEquals(
      'http://www.google.com/bar',
      goog.uri.utils.setPath('http://www.google.com', '/bar'));
  assertEquals(
      'http://www.google.com/bar/',
      goog.uri.utils.setPath('http://www.google.com', 'bar/'));
  assertEquals(
      'http://www.google.com/bar/',
      goog.uri.utils.setPath('http://www.google.com', '/bar/'));
  assertEquals(
      'http://www.google.com/bar?q=t',
      goog.uri.utils.setPath('http://www.google.com/?q=t', '/bar'));
  assertEquals(
      'http://www.google.com/bar?q=t',
      goog.uri.utils.setPath('http://www.google.com/?q=t', 'bar'));
  assertEquals(
      'http://www.google.com/bar/?q=t',
      goog.uri.utils.setPath('http://www.google.com/?q=t', 'bar/'));
  assertEquals(
      'http://www.google.com/bar/?q=t',
      goog.uri.utils.setPath('http://www.google.com/?q=t', '/bar/'));
  assertEquals(
      'http://www.google.com/bar?q=t',
      goog.uri.utils.setPath('http://www.google.com/foo?q=t', 'bar'));
  assertEquals(
      'http://www.google.com/bar?q=t',
      goog.uri.utils.setPath('http://www.google.com/foo?q=t', '/bar'));
  assertEquals(
      'https://www.google.com/bar?q=t&q1=y',
      goog.uri.utils.setPath('https://www.google.com/foo?q=t&q1=y', 'bar'));
  assertEquals(
      'https://www.google.com:8113/bar?q=t&q1=y',
      goog.uri.utils.setPath('https://www.google.com:8113?q=t&q1=y', 'bar'));
  assertEquals(
      'https://www.google.com:8113/foo/bar?q=t&q1=y',
      goog.uri.utils.setPath(
          'https://www.google.com:8113/foobar?q=t&q1=y', 'foo/bar'));
  assertEquals(
      'https://www.google.com:8113/foo/bar?q=t&q1=y',
      goog.uri.utils.setPath(
          'https://www.google.com:8113/foobar?q=t&q1=y', '/foo/bar'));
  assertEquals(
      'https://www.google.com:8113/foo/bar/?q=t&q1=y',
      goog.uri.utils.setPath(
          'https://www.google.com:8113/foobar?q=t&q1=y', 'foo/bar/'));
  assertEquals(
      'https://www.google.com:8113/foo/bar/?q=t&q1=y',
      goog.uri.utils.setPath(
          'https://www.google.com:8113/foobar?q=t&q1=y', '/foo/bar/'));
  assertEquals(
      'https://www.google.com:8113/?q=t&q1=y',
      goog.uri.utils.setPath(
          'https://www.google.com:8113/foobar?q=t&q1=y', ''));
}
