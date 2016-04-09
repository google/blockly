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

goog.provide('goog.jsonTest');
goog.setTestOnly('goog.jsonTest');

goog.require('goog.functions');
goog.require('goog.json');
goog.require('goog.testing.jsunit');
goog.require('goog.userAgent');

function allChars(start, end) {
  var sb = [];
  for (var i = start; i < end; i++) {
    sb.push(String.fromCharCode(i));
  }
  return sb.join('');
}

// serialization

function testStringSerialize() {
  assertSerialize('""', '');

  assertSerialize('"true"', 'true');
  assertSerialize('"false"', 'false');
  assertSerialize('"null"', 'null');
  assertSerialize('"0"', '0');

  // Unicode and control characters
  assertSerialize('"\\n"', '\n');
  assertSerialize('"\\u001f"', '\x1f');
  assertSerialize('"\\u20ac"', '\u20AC');
  assertSerialize('"\\ud83d\\ud83d"', '\ud83d\ud83d');

  var str = allChars(0, 10000);
  assertEquals(str, eval(goog.json.serialize(str)));
}

function testNullSerialize() {
  assertSerialize('null', null);
  assertSerialize('null', undefined);
  assertSerialize('null', NaN);

  assertSerialize('0', 0);
  assertSerialize('""', '');
  assertSerialize('false', false);
}

function testNullPropertySerialize() {
  assertSerialize('{"a":null}', {'a': null});
  assertSerialize('{"a":null}', {'a': undefined});
}

function testNumberSerialize() {
  assertSerialize('0', 0);
  assertSerialize('12345', 12345);
  assertSerialize('-12345', -12345);

  assertSerialize('0.1', 0.1);
  // the leading zero may not be omitted
  assertSerialize('0.1', .1);

  // no leading +
  assertSerialize('1', +1);

  // either format is OK
  var s = goog.json.serialize(1e50);
  assertTrue(
      '1e50', s == '1e50' || s == '1E50' || s == '1e+50' || s == '1E+50');

  // either format is OK
  s = goog.json.serialize(1e-50);
  assertTrue('1e50', s == '1e-50' || s == '1E-50');

  // These numbers cannot be represented in JSON
  assertSerialize('null', NaN);
  assertSerialize('null', Infinity);
  assertSerialize('null', -Infinity);
}

function testBooleanSerialize() {
  assertSerialize('true', true);
  assertSerialize('"true"', 'true');

  assertSerialize('false', false);
  assertSerialize('"false"', 'false');
}

function testArraySerialize() {
  assertSerialize('[]', []);
  assertSerialize('[1]', [1]);
  assertSerialize('[1,2]', [1, 2]);
  assertSerialize('[1,2,3]', [1, 2, 3]);
  assertSerialize('[[]]', [[]]);
  assertSerialize('[null,null]', [function() {}, function() {}]);

  assertNotEquals('{length:0}', goog.json.serialize({length: 0}), '[]');
}

function testFunctionSerialize() {
  assertSerialize('null', function() {});
}

function testObjectSerialize_emptyObject() {
  assertSerialize('{}', {});
}

function testObjectSerialize_oneItem() {
  assertSerialize('{"a":"b"}', {a: 'b'});
}

function testObjectSerialize_twoItems() {
  assertEquals(
      '{"a":"b","c":"d"}', goog.json.serialize({a: 'b', c: 'd'}),
      '{"a":"b","c":"d"}');
}

function testObjectSerialize_whitespace() {
  assertSerialize('{" ":" "}', {' ': ' '});
}

function testSerializeSkipFunction() {
  var object =
      {s: 'string value', b: true, i: 100, f: function() { var x = 'x'; }};
  assertSerialize('null', object.f);
  assertSerialize('{"s":"string value","b":true,"i":100}', object);
}

function testObjectSerialize_array() {
  assertNotEquals('[0,1]', goog.json.serialize([0, 1]), '{"0":"0","1":"1"}');
}

function testObjectSerialize_recursion() {
  if (goog.userAgent.WEBKIT) {
    return;  // this makes safari 4 crash.
  }

  var anObject = {};
  anObject.thisObject = anObject;
  assertThrows('expected recursion exception', function() {
    goog.json.serialize(anObject);
  });
}

function testObjectSerializeWithHasOwnProperty() {
  var object = {'hasOwnProperty': null};
  if (goog.userAgent.IE && !goog.userAgent.isVersionOrHigher('9')) {
    assertEquals('{}', goog.json.serialize(object));
  } else {
    assertEquals('{"hasOwnProperty":null}', goog.json.serialize(object));
  }
}

function testWrappedObjects() {
  assertSerialize('"foo"', new String('foo'));
  assertSerialize('42', new Number(42));
  assertSerialize('null', new Number('a NaN'));
  assertSerialize('true', new Boolean(true));
}

// parsing

function testStringParse() {
  assertEquals('Empty string', goog.json.parse('""'), '');
  assertEquals('whitespace string', goog.json.parse('" "'), ' ');

  // unicode without the control characters 0x00 - 0x1f, 0x7f - 0x9f
  var str = allChars(32, 1000);
  var jsonString = goog.json.serialize(str);
  var a = eval(jsonString);
  assertEquals('unicode string', goog.json.parse(jsonString), a);

  assertEquals('true as a string', goog.json.parse('"true"'), 'true');
  assertEquals('false as a string', goog.json.parse('"false"'), 'false');
  assertEquals('null as a string', goog.json.parse('"null"'), 'null');
  assertEquals('number as a string', goog.json.parse('"0"'), '0');
}

function testStringUnsafeParse() {
  assertEquals('Empty string', goog.json.unsafeParse('""'), '');
  assertEquals('whitespace string', goog.json.unsafeParse('" "'), ' ');

  // unicode
  var str = allChars(32, 1000);
  var jsonString = goog.json.serialize(str);
  var a = eval(jsonString);
  assertEquals('unicode string', goog.json.unsafeParse(jsonString), a);

  assertEquals('true as a string', goog.json.unsafeParse('"true"'), 'true');
  assertEquals('false as a string', goog.json.unsafeParse('"false"'), 'false');
  assertEquals('null as a string', goog.json.unsafeParse('"null"'), 'null');
  assertEquals('number as a string', goog.json.unsafeParse('"0"'), '0');
}

function testNullParse() {
  assertEquals('null', goog.json.parse(null), null);
  assertEquals('null', goog.json.parse('null'), null);

  assertNotEquals('0', goog.json.parse('0'), null);
  assertNotEquals('""', goog.json.parse('""'), null);
  assertNotEquals('false', goog.json.parse('false'), null);
}

function testNullUnsafeParse() {
  assertEquals('null', goog.json.unsafeParse(null), null);
  assertEquals('null', goog.json.unsafeParse('null'), null);

  assertNotEquals('0', goog.json.unsafeParse('0'), null);
  assertNotEquals('""', goog.json.unsafeParse('""'), null);
  assertNotEquals('false', goog.json.unsafeParse('false'), null);
}

function testNumberParse() {
  assertEquals('0', goog.json.parse('0'), 0);
  assertEquals('12345', goog.json.parse('12345'), 12345);
  assertEquals('-12345', goog.json.parse('-12345'), -12345);

  assertEquals('0.1', goog.json.parse('0.1'), 0.1);

  // either format is OK
  assertEquals(1e50, goog.json.parse('1e50'));
  assertEquals(1e50, goog.json.parse('1E50'));
  assertEquals(1e50, goog.json.parse('1e+50'));
  assertEquals(1e50, goog.json.parse('1E+50'));

  // either format is OK
  assertEquals(1e-50, goog.json.parse('1e-50'));
  assertEquals(1e-50, goog.json.parse('1E-50'));
}

function testNumberUnsafeParse() {
  assertEquals('0', goog.json.unsafeParse('0'), 0);
  assertEquals('12345', goog.json.unsafeParse('12345'), 12345);
  assertEquals('-12345', goog.json.unsafeParse('-12345'), -12345);

  assertEquals('0.1', goog.json.unsafeParse('0.1'), 0.1);

  // either format is OK
  assertEquals(1e50, goog.json.unsafeParse('1e50'));
  assertEquals(1e50, goog.json.unsafeParse('1E50'));
  assertEquals(1e50, goog.json.unsafeParse('1e+50'));
  assertEquals(1e50, goog.json.unsafeParse('1E+50'));

  // either format is OK
  assertEquals(1e-50, goog.json.unsafeParse('1e-50'));
  assertEquals(1e-50, goog.json.unsafeParse('1E-50'));
}

function testBooleanParse() {
  assertEquals('true', goog.json.parse('true'), true);
  assertEquals('false', goog.json.parse('false'), false);

  assertNotEquals('0', goog.json.parse('0'), false);
  assertNotEquals('"false"', goog.json.parse('"false"'), false);
  assertNotEquals('null', goog.json.parse('null'), false);

  assertNotEquals('1', goog.json.parse('1'), true);
  assertNotEquals('"true"', goog.json.parse('"true"'), true);
  assertNotEquals('{}', goog.json.parse('{}'), true);
  assertNotEquals('[]', goog.json.parse('[]'), true);
}

function testBooleanUnsafeParse() {
  assertEquals('true', goog.json.unsafeParse('true'), true);
  assertEquals('false', goog.json.unsafeParse('false'), false);

  assertNotEquals('0', goog.json.unsafeParse('0'), false);
  assertNotEquals('"false"', goog.json.unsafeParse('"false"'), false);
  assertNotEquals('null', goog.json.unsafeParse('null'), false);

  assertNotEquals('1', goog.json.unsafeParse('1'), true);
  assertNotEquals('"true"', goog.json.unsafeParse('"true"'), true);
  assertNotEquals('{}', goog.json.unsafeParse('{}'), true);
  assertNotEquals('[]', goog.json.unsafeParse('[]'), true);
}

function testArrayParse() {
  assertArrayEquals([], goog.json.parse('[]'));
  assertArrayEquals([1], goog.json.parse('[1]'));
  assertArrayEquals([1, 2], goog.json.parse('[1,2]'));
  assertArrayEquals([1, 2, 3], goog.json.parse('[1,2,3]'));
  assertArrayEquals([[]], goog.json.parse('[[]]'));

  // Note that array-holes are not valid json. However, goog.json.parse
  // supports them so that clients can reap the security benefits of
  // goog.json.parse even if they are using this non-standard format.
  assertArrayEquals([1, /* hole */, 3], goog.json.parse('[1,,3]'));

  // make sure we do not get an array for something that looks like an array
  assertFalse('{length:0}', 'push' in goog.json.parse('{"length":0}'));
}

function testArrayUnsafeParse() {
  function arrayEquals(a1, a2) {
    if (a1.length != a2.length) {
      return false;
    }
    for (var i = 0; i < a1.length; i++) {
      if (a1[i] != a2[i]) {
        return false;
      }
    }
    return true;
  }

  assertTrue('[]', arrayEquals(goog.json.unsafeParse('[]'), []));
  assertTrue('[1]', arrayEquals(goog.json.unsafeParse('[1]'), [1]));
  assertTrue('[1,2]', arrayEquals(goog.json.unsafeParse('[1,2]'), [1, 2]));
  assertTrue(
      '[1,2,3]', arrayEquals(goog.json.unsafeParse('[1,2,3]'), [1, 2, 3]));
  assertTrue('[[]]', arrayEquals(goog.json.unsafeParse('[[]]')[0], []));

  // make sure we do not get an array for something that looks like an array
  assertFalse('{length:0}', 'push' in goog.json.unsafeParse('{"length":0}'));
}

function testObjectParse() {
  function objectEquals(a1, a2) {
    for (var key in a1) {
      if (a1[key] != a2[key]) {
        return false;
      }
    }
    return true;
  }

  assertTrue('{}', objectEquals(goog.json.parse('{}'), {}));
  assertTrue('{"a":"b"}', objectEquals(goog.json.parse('{"a":"b"}'), {a: 'b'}));
  assertTrue(
      '{"a":"b","c":"d"}',
      objectEquals(goog.json.parse('{"a":"b","c":"d"}'), {a: 'b', c: 'd'}));
  assertTrue(
      '{" ":" "}', objectEquals(goog.json.parse('{" ":" "}'), {' ': ' '}));

  // make sure we do not get an Object when it is really an array
  assertTrue('[0,1]', 'length' in goog.json.parse('[0,1]'));
}

function testObjectUnsafeParse() {
  function objectEquals(a1, a2) {
    for (var key in a1) {
      if (a1[key] != a2[key]) {
        return false;
      }
    }
    return true;
  }

  assertTrue('{}', objectEquals(goog.json.unsafeParse('{}'), {}));
  assertTrue(
      '{"a":"b"}', objectEquals(goog.json.unsafeParse('{"a":"b"}'), {a: 'b'}));
  assertTrue(
      '{"a":"b","c":"d"}',
      objectEquals(
          goog.json.unsafeParse('{"a":"b","c":"d"}'), {a: 'b', c: 'd'}));
  assertTrue(
      '{" ":" "}',
      objectEquals(goog.json.unsafeParse('{" ":" "}'), {' ': ' '}));

  // make sure we do not get an Object when it is really an array
  assertTrue('[0,1]', 'length' in goog.json.unsafeParse('[0,1]'));
}


function testForValidJson() {
  function error_(msg, s) {
    assertThrows(
        msg + ', Should have raised an exception: ' + s,
        goog.partial(goog.json.parse, s));
  }

  error_('Non closed string', '"dasdas');
  error_('undefined is not valid json', 'undefined');

  // These numbers cannot be represented in JSON
  error_('NaN cannot be presented in JSON', 'NaN');
  error_('Infinity cannot be presented in JSON', 'Infinity');
  error_('-Infinity cannot be presented in JSON', '-Infinity');
}

function testIsNotValid() {
  assertFalse(goog.json.isValid('t'));
  assertFalse(goog.json.isValid('r'));
  assertFalse(goog.json.isValid('u'));
  assertFalse(goog.json.isValid('e'));
  assertFalse(goog.json.isValid('f'));
  assertFalse(goog.json.isValid('a'));
  assertFalse(goog.json.isValid('l'));
  assertFalse(goog.json.isValid('s'));
  assertFalse(goog.json.isValid('n'));
  assertFalse(goog.json.isValid('E'));

  assertFalse(goog.json.isValid('+'));
  assertFalse(goog.json.isValid('-'));

  assertFalse(goog.json.isValid('t++'));
  assertFalse(goog.json.isValid('++t'));
  assertFalse(goog.json.isValid('t--'));
  assertFalse(goog.json.isValid('--t'));
  assertFalse(goog.json.isValid('-t'));
  assertFalse(goog.json.isValid('+t'));

  assertFalse(goog.json.isValid('"\\"'));  // "\"
  assertFalse(goog.json.isValid('"\\'));   // "\

  // multiline string using \ at the end is not valid
  assertFalse(goog.json.isValid('"a\\\nb"'));


  assertFalse(goog.json.isValid('"\n"'));
  assertFalse(goog.json.isValid('"\r"'));
  assertFalse(goog.json.isValid('"\r\n"'));
  // Disallow the unicode newlines
  assertFalse(goog.json.isValid('"\u2028"'));
  assertFalse(goog.json.isValid('"\u2029"'));

  assertFalse(goog.json.isValid(' '));
  assertFalse(goog.json.isValid('\n'));
  assertFalse(goog.json.isValid('\r'));
  assertFalse(goog.json.isValid('\r\n'));

  assertFalse(goog.json.isValid('t.r'));

  assertFalse(goog.json.isValid('1e'));
  assertFalse(goog.json.isValid('1e-'));
  assertFalse(goog.json.isValid('1e+'));

  assertFalse(goog.json.isValid('1e-'));

  assertFalse(goog.json.isValid('"\\\u200D\\"'));
  assertFalse(goog.json.isValid('"\\\0\\"'));
  assertFalse(goog.json.isValid('"\\\0"'));
  assertFalse(goog.json.isValid('"\\0"'));
  assertFalse(goog.json.isValid('"\x0c"'));

  assertFalse(goog.json.isValid('"\\\u200D\\", alert(\'foo\') //"\n'));

  // Disallow referencing variables with names built up from primitives
  assertFalse(goog.json.isValid('truefalse'));
  assertFalse(goog.json.isValid('null0'));
  assertFalse(goog.json.isValid('null0.null0'));
  assertFalse(goog.json.isValid('[truefalse]'));
  assertFalse(goog.json.isValid('{"a": null0}'));
  assertFalse(goog.json.isValid('{"a": null0, "b": 1}'));
}

function testIsValid() {
  assertTrue(goog.json.isValid('\n""\n'));
  assertTrue(goog.json.isValid('[1\n,2\r,3\u2028\n,4\u2029]'));
  assertTrue(goog.json.isValid('"\x7f"'));
  assertTrue(goog.json.isValid('"\x09"'));
  // Test tab characters in json.
  assertTrue(goog.json.isValid('{"\t":"\t"}'));
}

function testDoNotSerializeProto() {
  function F(){};
  F.prototype = {c: 3};

  var obj = new F;
  obj.a = 1;
  obj.b = 2;

  assertEquals(
      'Should not follow the prototype chain', '{"a":1,"b":2}',
      goog.json.serialize(obj));
}

function testEscape() {
  var unescaped = '1a*/]';
  assertEquals(
      'Should not escape', '"' + unescaped + '"',
      goog.json.serialize(unescaped));

  var escaped = '\n\x7f\u1049';
  assertEquals(
      'Should escape', '',
      findCommonChar(escaped, goog.json.serialize(escaped)));
  assertEquals(
      'Should eval to the same string after escaping', escaped,
      goog.json.parse(goog.json.serialize(escaped)));
}

function testReplacer() {
  assertSerialize('[null,null,0]', [, , 0]);

  assertSerialize('[0,0,{"x":0}]', [, , {x: 0}], function(k, v) {
    if (v === undefined && goog.isArray(this)) {
      return 0;
    }
    return v;
  });

  assertSerialize('[0,1,2,3]', [0, 0, 0, 0], function(k, v) {
    var kNum = Number(k);
    if (k && !isNaN(kNum)) {
      return kNum;
    }
    return v;
  });

  var f = function(k, v) { return typeof v == 'number' ? v + 1 : v; };
  assertSerialize('{"a":1,"b":{"c":2}}', {'a': 0, 'b': {'c': 1}}, f);
}

function testDateSerialize() {
  assertSerialize('{}', new Date(0));
}

function testToJSONSerialize() {
  assertSerialize('{}', {toJSON: goog.functions.constant('serialized')});
  assertSerialize('{"toJSON":"normal"}', {toJSON: 'normal'});
}


/**
 * Asserts that the given object serializes to the given value.
 * If the current browser has an implementation of JSON.serialize,
 * we make sure our version matches that one.
 */
function assertSerialize(expected, obj, opt_replacer) {
  assertEquals(expected, goog.json.serialize(obj, opt_replacer));

  // goog.json.serialize escapes non-ASCI characters while JSON.stringify
  // doesn’t.  This is expected so do not compare the results.
  if (typeof obj == 'string' && obj.charCodeAt(0) > 0x7f) return;

  // I'm pretty sure that the goog.json.serialize behavior is correct by the ES5
  // spec, but JSON.stringify(undefined) is undefined on all browsers.
  if (obj === undefined) return;

  // Browsers don't serialize undefined properties, but goog.json.serialize does
  if (goog.isObject(obj) && ('a' in obj) && obj['a'] === undefined) return;

  // Replacers are broken on IE and older versions of firefox.
  if (opt_replacer && !goog.userAgent.WEBKIT) return;

  // goog.json.serialize does not stringify dates the same way.
  if (obj instanceof Date) return;

  // goog.json.serialize does not stringify functions the same way.
  if (obj instanceof Function) return;

  // goog.json.serialize doesn't use the toJSON method.
  if (goog.isObject(obj) && goog.isFunction(obj.toJSON)) return;

  if (typeof JSON != 'undefined') {
    assertEquals(
        'goog.json.serialize does not match JSON.stringify', expected,
        JSON.stringify(obj, opt_replacer));
  }
}


/**
 * @param {string} a
 * @param {string} b
 * @return {string} any common character between two strings a and b.
 */
function findCommonChar(a, b) {
  for (var i = 0; i < b.length; i++) {
    if (a.indexOf(b.charAt(i)) >= 0) {
      return b.charAt(i);
    }
  }
  return '';
}
